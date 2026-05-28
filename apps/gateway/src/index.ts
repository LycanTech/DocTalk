/**
 * DocTalk API Gateway — port 4000
 *
 * Responsibilities:
 *   1. JWT validation on every protected route
 *   2. Proxy to domain microservices (auth/patients/records/appointments/notifications)
 *   3. PII masking on patient data for NURSE role (ADMIN/DOCTOR get full data)
 *   4. Audit logging: every data-access event written to audit_logs table
 *
 * Service map (env-configurable, defaults to localhost ports for local dev):
 *   AUTH_SERVICE_URL          http://localhost:4011
 *   PATIENTS_SERVICE_URL      http://localhost:4012
 *   RECORDS_SERVICE_URL       http://localhost:4013
 *   APPOINTMENTS_SERVICE_URL  http://localhost:4014
 *   NOTIFICATIONS_SERVICE_URL http://localhost:4015
 */

import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import axios, { type AxiosRequestConfig } from "axios";
import { PrismaClient } from "@prisma/client";
import { maskPatient, maskPatientList, AUDIT_ACTIONS } from "@doctalk/shared";
import type { UserRole } from "@doctalk/shared";

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.GATEWAY_PORT ?? 4000);

// ─── Service URLs ─────────────────────────────────────────────────────────────

const SVC = {
  auth:          process.env.AUTH_SERVICE_URL          ?? "http://localhost:4011",
  patients:      process.env.PATIENTS_SERVICE_URL      ?? "http://localhost:4012",
  records:       process.env.RECORDS_SERVICE_URL       ?? "http://localhost:4013",
  appointments:  process.env.APPOINTMENTS_SERVICE_URL  ?? "http://localhost:4014",
  notifications: process.env.NOTIFICATIONS_SERVICE_URL ?? "http://localhost:4015",
};

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet());
app.use(cors({
  origin: (process.env.CORS_ORIGINS ?? "http://localhost:3002").split(","),
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("combined"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false }));

// ─── Types ────────────────────────────────────────────────────────────────────

interface JwtPayload { sub: string; email: string; role: string; }
interface AuthRequest extends Request { doctor?: JwtPayload; }

// ─── JWT Guard ────────────────────────────────────────────────────────────────

function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Missing or invalid Authorization header" });
    return;
  }
  try {
    req.doctor = jwt.verify(header.slice(7), process.env.JWT_SECRET ?? "dev-jwt-secret") as JwtPayload;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Token expired or invalid" });
  }
}

// ─── Audit Logger ─────────────────────────────────────────────────────────────

async function audit(
  actor: JwtPayload,
  action: string,
  resource: string,
  resourceId: string | null,
  req: Request,
  meta?: Record<string, unknown>,
) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId:    actor.sub,
        actorEmail: actor.email,
        actorRole:  actor.role,
        action,
        resource,
        resourceId: resourceId ?? undefined,
        ipAddress:  req.ip,
        userAgent:  req.headers["user-agent"],
        metadata:   meta ?? null,
      },
    });
  } catch {
    // audit failure must never break the response
  }
}

// ─── Proxy Helper ─────────────────────────────────────────────────────────────

async function forward(
  serviceBase: string,
  path: string,
  req: AuthRequest,
  res: Response,
  extra?: AxiosRequestConfig,
) {
  try {
    const url = `${serviceBase}${path}`;
    const response = await axios({
      method: req.method as AxiosRequestConfig["method"],
      url,
      params: req.query,
      data:   ["POST", "PUT", "PATCH"].includes(req.method) ? req.body : undefined,
      headers: {
        "content-type":  "application/json",
        "x-doctor-id":   req.doctor?.sub   ?? "",
        "x-doctor-role": req.doctor?.role  ?? "",
        "x-doctor-email":req.doctor?.email ?? "",
      },
      ...extra,
    });
    res.status(response.status).json(response.data);
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(502).json({ success: false, error: "Service unavailable" });
    }
  }
}

// ─── Health ───────────────────────────────────────────────────────────────────

app.get("/health", async (_req, res) => {
  const checks = await Promise.allSettled(
    Object.entries(SVC).map(async ([name, url]) => {
      const r = await axios.get(`${url}/health`, { timeout: 2000 });
      return { name, status: r.data.status };
    }),
  );
  res.json({
    service: "api-gateway",
    port: PORT,
    status: "ok",
    services: checks.map((c, i) => ({
      name: Object.keys(SVC)[i],
      status: c.status === "fulfilled" ? "up" : "down",
    })),
  });
});

// ─── Auth Routes (unauthenticated) ────────────────────────────────────────────

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

app.post("/api/v1/auth/login", authLimiter, async (req: AuthRequest, res) => {
  try {
    const response = await axios.post(`${SVC.auth}/auth/login`, req.body);
    if (response.data?.data?.doctor) {
      const d = response.data.data.doctor;
      await audit(
        { sub: d.id, email: d.email, role: d.role },
        AUDIT_ACTIONS.LOGIN,
        "auth",
        d.id,
        req,
      );
    }
    res.json(response.data);
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(502).json({ success: false, error: "Auth service unavailable" });
    }
  }
});

app.post("/api/v1/auth/refresh", authLimiter, async (req, res) => {
  await forward(SVC.auth, "/auth/refresh", req as AuthRequest, res);
});

app.post("/api/v1/auth/logout", authenticate, async (req: AuthRequest, res) => {
  await audit(req.doctor!, AUDIT_ACTIONS.LOGOUT, "auth", req.doctor!.sub, req);
  await forward(SVC.auth, "/auth/logout", req, res);
});

// ─── Patients Routes ──────────────────────────────────────────────────────────
// Gateway applies PII masking here before returning to the client.

app.get("/api/v1/patients", authenticate, async (req: AuthRequest, res) => {
  try {
    const role = req.doctor!.role as UserRole;
    const response = await axios.get(`${SVC.patients}/patients`, {
      params:  req.query,
      headers: { "x-doctor-id": req.doctor!.sub, "x-doctor-role": role },
    });

    const raw     = response.data as { success: boolean; data: Record<string, unknown>[]; pagination: unknown };
    const masked  = maskPatientList(raw.data, { role });

    await audit(req.doctor!, AUDIT_ACTIONS.LIST_PATIENTS, "patient", null, req, {
      role,
      piiMasked: role === "NURSE",
      count: raw.data.length,
    });

    res.json({ ...raw, data: masked });
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) res.status(err.response.status).json(err.response.data);
    else res.status(502).json({ success: false, error: "Patients service unavailable" });
  }
});

app.get("/api/v1/patients/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const role     = req.doctor!.role as UserRole;
    const response = await axios.get(`${SVC.patients}/patients/${req.params.id}`, {
      headers: { "x-doctor-id": req.doctor!.sub },
    });
    const raw    = response.data as { success: boolean; data: Record<string, unknown> };
    const masked = maskPatient(raw.data, { role });

    await audit(req.doctor!, AUDIT_ACTIONS.READ_PATIENT, "patient", req.params.id, req, {
      role,
      piiMasked: role === "NURSE",
    });

    res.json({ ...raw, data: masked });
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) res.status(err.response.status).json(err.response.data);
    else res.status(502).json({ success: false, error: "Patients service unavailable" });
  }
});

app.post("/api/v1/patients", authenticate, async (req: AuthRequest, res) => {
  try {
    const response = await axios.post(`${SVC.patients}/patients`, req.body, {
      headers: { "x-doctor-id": req.doctor!.sub },
    });
    await audit(req.doctor!, AUDIT_ACTIONS.CREATE_PATIENT, "patient", response.data?.data?.id ?? null, req);
    res.status(201).json(response.data);
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) res.status(err.response.status).json(err.response.data);
    else res.status(502).json({ success: false, error: "Patients service unavailable" });
  }
});

app.patch("/api/v1/patients/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const response = await axios.patch(`${SVC.patients}/patients/${req.params.id}`, req.body, {
      headers: { "x-doctor-id": req.doctor!.sub },
    });
    await audit(req.doctor!, AUDIT_ACTIONS.UPDATE_PATIENT, "patient", req.params.id, req);
    res.json(response.data);
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response) res.status(err.response.status).json(err.response.data);
    else res.status(502).json({ success: false, error: "Patients service unavailable" });
  }
});

// ─── Records Routes ───────────────────────────────────────────────────────────

app.get("/api/v1/records", authenticate, async (req: AuthRequest, res) => {
  await audit(req.doctor!, AUDIT_ACTIONS.LIST_RECORDS, "record", null, req);
  await forward(SVC.records, "/records", req, res);
});

app.get("/api/v1/records/:id", authenticate, async (req: AuthRequest, res) => {
  await audit(req.doctor!, AUDIT_ACTIONS.READ_RECORD, "record", req.params.id, req);
  await forward(SVC.records, `/records/${req.params.id}`, req, res);
});

app.post("/api/v1/records", authenticate, async (req: AuthRequest, res) => {
  const response = await axios.post(`${SVC.records}/records`, req.body, {
    headers: { "x-doctor-id": req.doctor!.sub },
  }).catch((e) => { if (axios.isAxiosError(e)) return e.response; throw e; });
  if (!response) { res.status(502).json({ success: false, error: "Records service unavailable" }); return; }
  if (response.data?.data?.id) {
    await audit(req.doctor!, AUDIT_ACTIONS.CREATE_RECORD, "record", response.data.data.id, req);
  }
  res.status(response.status).json(response.data);
});

app.patch("/api/v1/records/:id", authenticate, async (req: AuthRequest, res) => {
  await audit(req.doctor!, AUDIT_ACTIONS.UPDATE_RECORD, "record", req.params.id, req);
  await forward(SVC.records, `/records/${req.params.id}`, req, res);
});

// ─── Appointments Routes ──────────────────────────────────────────────────────

app.get("/api/v1/appointments", authenticate, async (req: AuthRequest, res) => {
  await audit(req.doctor!, AUDIT_ACTIONS.LIST_APPOINTMENTS, "appointment", null, req);
  await forward(SVC.appointments, "/appointments", req, res);
});

app.get("/api/v1/appointments/:id", authenticate, async (req: AuthRequest, res) => {
  await audit(req.doctor!, AUDIT_ACTIONS.READ_APPOINTMENT, "appointment", req.params.id, req);
  await forward(SVC.appointments, `/appointments/${req.params.id}`, req, res);
});

app.post("/api/v1/appointments", authenticate, async (req: AuthRequest, res) => {
  await forward(SVC.appointments, "/appointments", req, res);
});

app.patch("/api/v1/appointments/:id", authenticate, async (req: AuthRequest, res) => {
  await forward(SVC.appointments, `/appointments/${req.params.id}`, req, res);
});

// ─── Stats (aggregated by gateway) ───────────────────────────────────────────

app.get("/api/v1/stats", authenticate, async (req: AuthRequest, res) => {
  try {
    const doctorId   = req.doctor!.sub;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [totalPatients, todayAppointments, pendingRecords] = await Promise.all([
      prisma.patient.count({ where: { isActive: true } }),
      prisma.appointment.count({ where: { doctorId, scheduledAt: { gte: todayStart, lte: todayEnd } } }),
      prisma.medicalRecord.count({ where: { doctorId, status: "ACTIVE" } }),
    ]);

    res.json({ success: true, data: { totalPatients, todayAppointments, pendingRecords, syncPending: 0 } });
  } catch {
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// ─── Notifications Routes ─────────────────────────────────────────────────────

app.get("/api/v1/notifications/vapid-public-key", async (req: AuthRequest, res) => {
  await forward(SVC.notifications, "/notifications/vapid-public-key", req, res);
});

app.post("/api/v1/notifications/subscribe", authenticate, async (req: AuthRequest, res) => {
  await forward(SVC.notifications, "/notifications/subscribe", req, res);
});

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Internal gateway error" });
});

app.listen(PORT, () => {
  console.log(`[api-gateway] listening on :${PORT}`);
  console.log(`  → auth:          ${SVC.auth}`);
  console.log(`  → patients:      ${SVC.patients}`);
  console.log(`  → records:       ${SVC.records}`);
  console.log(`  → appointments:  ${SVC.appointments}`);
  console.log(`  → notifications: ${SVC.notifications}`);
});
