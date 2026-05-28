import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.AUTH_PORT ?? 4011);

const ACCESS_SECRET  = process.env.JWT_SECRET         ?? "dev-jwt-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret";
const ACCESS_TTL     = "15m";
const REFRESH_TTL    = "7d";

app.use(cors());
app.use(express.json());
app.use(morgan("short"));

app.get("/health", (_req, res) => {
  res.json({ service: "auth-service", port: PORT, status: "ok" });
});

// POST /auth/login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ success: false, error: "email and password required" });
      return;
    }

    const doctor = await prisma.doctor.findUnique({ where: { email } });
    if (!doctor || !(await bcrypt.compare(password, doctor.passwordHash))) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }
    if (!doctor.isActive) {
      res.status(403).json({ success: false, error: "Account deactivated" });
      return;
    }

    const payload = { sub: doctor.id, email: doctor.email, role: doctor.role };
    const accessToken  = jwt.sign(payload, ACCESS_SECRET,  { expiresIn: ACCESS_TTL });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TTL });

    await prisma.refreshToken.create({
      data: {
        token:    refreshToken,
        doctorId: doctor.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        doctor: {
          id: doctor.id, email: doctor.email, firstName: doctor.firstName,
          lastName: doctor.lastName, role: doctor.role, specialty: doctor.specialty,
          isVerified: doctor.isVerified, avatarUrl: doctor.avatarUrl,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// POST /auth/refresh
app.post("/auth/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      res.status(400).json({ success: false, error: "refreshToken required" });
      return;
    }

    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as jwt.JwtPayload;
    const stored  = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored) {
      res.status(401).json({ success: false, error: "Token revoked" });
      return;
    }

    // Rotate token
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const newPayload     = { sub: payload.sub, email: payload.email, role: payload.role };
    const accessToken    = jwt.sign(newPayload, ACCESS_SECRET,  { expiresIn: ACCESS_TTL });
    const newRefresh     = jwt.sign(newPayload, REFRESH_SECRET, { expiresIn: REFRESH_TTL });

    await prisma.refreshToken.create({
      data: { token: newRefresh, doctorId: payload.sub as string, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) },
    });

    res.json({ success: true, data: { accessToken, refreshToken: newRefresh } });
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired refresh token" });
  }
});

// POST /auth/logout
app.post("/auth/logout", async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => null);
  }
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`[auth-service] listening on :${PORT}`));
