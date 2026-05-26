import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { authenticate, type AuthRequest } from "../middleware/authenticate";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  specialty: z.string(),
  licenseNumber: z.string().min(1),
  phone: z.string().min(7),
  hospital: z.string().optional(),
  state: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.doctor.findUnique({ where: { email: body.email } });
    if (existing) {
      res.status(409).json({ success: false, error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const doctor = await prisma.doctor.create({
      data: {
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        specialty: body.specialty as never,
        licenseNumber: body.licenseNumber,
        phone: body.phone,
        hospital: body.hospital,
        state: body.state,
      },
      select: { id: true, email: true, firstName: true, lastName: true, specialty: true, role: true },
    });

    const payload = { sub: doctor.id, email: doctor.email, role: doctor.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        doctorId: doctor.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json({ success: true, data: { doctor, accessToken, refreshToken } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Validation failed", details: err.flatten().fieldErrors });
      return;
    }
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const doctor = await prisma.doctor.findUnique({ where: { email } });
    if (!doctor || !(await bcrypt.compare(password, doctor.passwordHash))) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }
    if (!doctor.isActive) {
      res.status(403).json({ success: false, error: "Account suspended" });
      return;
    }

    const payload = { sub: doctor.id, email: doctor.email, role: doctor.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        doctorId: doctor.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const { passwordHash: _, ...doctorSafe } = doctor;
    res.json({ success: true, data: { doctor: doctorSafe, accessToken, refreshToken } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Validation failed", details: err.flatten().fieldErrors });
      return;
    }
    next(err);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) {
      res.status(400).json({ success: false, error: "Refresh token required" });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({ success: false, error: "Refresh token invalid or expired" });
      return;
    }

    // Rotate token
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        doctorId: payload.sub,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
  } catch {
    next(new Error("Invalid refresh token"));
  }
});

authRouter.post("/logout", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.doctor!.sub },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        specialty: true, licenseNumber: true, phone: true,
        hospital: true, state: true, role: true, avatarUrl: true,
        isVerified: true, createdAt: true, updatedAt: true,
      },
    });
    if (!doctor) {
      res.status(404).json({ success: false, error: "Doctor not found" });
      return;
    }
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
});
