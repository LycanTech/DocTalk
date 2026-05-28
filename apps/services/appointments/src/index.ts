import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.APPOINTMENTS_PORT ?? 4014);

app.use(cors());
app.use(express.json());
app.use(morgan("short"));

app.get("/health", (_req, res) => {
  res.json({ service: "appointments-service", port: PORT, status: "ok" });
});

const schema = z.object({
  patientId:   z.string(),
  scheduledAt: z.string(),
  duration:    z.number().min(5).max(240).default(30),
  reason:      z.string().min(1),
  notes:       z.string().optional(),
});

// GET /appointments — filtered by doctorId header, optional ?from&to&patientId&status
app.get("/appointments", async (req, res) => {
  try {
    const doctorId  = req.headers["x-doctor-id"] as string | undefined;
    const { patientId, status, from, to } = req.query as Record<string, string | undefined>;
    const page  = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);

    const where: Record<string, unknown> = {};
    if (doctorId)  where.doctorId  = doctorId;
    if (patientId) where.patientId = patientId;
    if (status)    where.status    = status;
    if (from || to) {
      where.scheduledAt = {
        ...(from && { gte: new Date(from) }),
        ...(to   && { lte: new Date(to) }),
      };
    }

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { scheduledAt: "asc" },
        include: {
          patient: { select: { firstName: true, lastName: true, phone: true } },
        },
      }),
    ]);

    res.json({ success: true, data: appointments, pagination: { page, limit, total } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// GET /appointments/:id
app.get("/appointments/:id", async (req, res) => {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { patient: true, doctor: { select: { firstName: true, lastName: true } } },
    });
    if (!appt) { res.status(404).json({ success: false, error: "Not found" }); return; }
    res.json({ success: true, data: appt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// POST /appointments
app.post("/appointments", async (req, res) => {
  try {
    const doctorId = req.headers["x-doctor-id"] as string;
    const body     = schema.parse(req.body);
    const appt     = await prisma.appointment.create({
      data: { ...body, doctorId, scheduledAt: new Date(body.scheduledAt) },
      include: { patient: { select: { firstName: true, lastName: true } } },
    });
    res.status(201).json({ success: true, data: appt });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.flatten().fieldErrors });
      return;
    }
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// PATCH /appointments/:id
app.patch("/appointments/:id", async (req, res) => {
  try {
    const body = schema.partial()
      .extend({ status: z.enum(["SCHEDULED","COMPLETED","CANCELLED","NO_SHOW"]).optional() })
      .parse(req.body);
    const appt = await prisma.appointment.update({
      where: { id: req.params.id },
      data:  { ...body, ...(body.scheduledAt && { scheduledAt: new Date(body.scheduledAt) }) },
    });
    res.json({ success: true, data: appt });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.flatten().fieldErrors });
      return;
    }
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

app.listen(PORT, () => console.log(`[appointments-service] listening on :${PORT}`));
