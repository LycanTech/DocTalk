import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma";
import { sendVerificationEmail, sendDoctorApprovedEmail } from "../lib/email";
import { authenticate, type AuthRequest } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";

export const verificationRouter = Router();

// POST /verification/request-email — resend / send first verification email
verificationRouter.post("/request-email", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { id: req.doctor!.sub } });
    if (!doctor) { res.status(404).json({ success: false, error: "Doctor not found" }); return; }
    if (doctor.emailVerifiedAt) { res.status(400).json({ success: false, error: "Email already verified" }); return; }

    const token = uuidv4();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.doctor.update({
      where: { id: doctor.id },
      data: { emailVerificationToken: token, emailVerificationExpiry: expiry },
    });

    await sendVerificationEmail(doctor.email, doctor.firstName, token);
    res.json({ success: true, message: "Verification email sent" });
  } catch (err) {
    next(err);
  }
});

// GET /verification/verify-email/:token — confirm email from link in email
verificationRouter.get("/verify-email/:token", async (req, res, next) => {
  try {
    const { token } = req.params;
    const doctor = await prisma.doctor.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!doctor || !doctor.emailVerificationExpiry || doctor.emailVerificationExpiry < new Date()) {
      res.status(400).json({ success: false, error: "Invalid or expired verification link" });
      return;
    }

    await prisma.doctor.update({
      where: { id: doctor.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    // Redirect to the web app with success flag
    const webUrl = process.env.APP_URL ?? "http://localhost:3000";
    res.redirect(`${webUrl}/email-verified`);
  } catch (err) {
    next(err);
  }
});

// GET /verification/status — current doctor's verification status
verificationRouter.get("/status", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.doctor!.sub },
      select: {
        isVerified: true,
        emailVerifiedAt: true,
        mdcnApprovedAt: true,
      },
    });
    if (!doctor) { res.status(404).json({ success: false, error: "Not found" }); return; }
    res.json({
      success: true,
      data: {
        emailVerified: !!doctor.emailVerifiedAt,
        mdcnVerified: !!doctor.mdcnApprovedAt,
        fullyVerified: doctor.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Admin-only routes ─────────────────────────────────────────────────────────

// GET /verification/pending — list doctors awaiting MDCN approval
verificationRouter.get(
  "/pending",
  authenticate,
  requireRole("ADMIN"),
  async (_req, res, next) => {
    try {
      const doctors = await prisma.doctor.findMany({
        where: { emailVerifiedAt: { not: null }, mdcnApprovedAt: null, isActive: true },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          specialty: true, licenseNumber: true, hospital: true, state: true,
          emailVerifiedAt: true, createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      });
      res.json({ success: true, data: doctors });
    } catch (err) {
      next(err);
    }
  }
);

// POST /verification/approve/:doctorId — admin approves MDCN license
verificationRouter.post(
  "/approve/:doctorId",
  authenticate,
  requireRole("ADMIN"),
  async (req: AuthRequest, res, next) => {
    try {
      const doctor = await prisma.doctor.update({
        where: { id: req.params.doctorId },
        data: {
          isVerified: true,
          mdcnApprovedAt: new Date(),
          mdcnApprovedBy: req.doctor!.sub,
        },
        select: { id: true, email: true, firstName: true, lastName: true, isVerified: true },
      });

      await sendDoctorApprovedEmail(doctor.email, doctor.firstName);
      res.json({ success: true, data: doctor, message: "Doctor approved and notified" });
    } catch (err) {
      next(err);
    }
  }
);

// POST /verification/reject/:doctorId — admin rejects with reason
verificationRouter.post(
  "/reject/:doctorId",
  authenticate,
  requireRole("ADMIN"),
  async (req: AuthRequest, res, next) => {
    try {
      const { reason } = req.body as { reason?: string };
      await prisma.doctor.update({
        where: { id: req.params.doctorId },
        data: { isActive: false },
      });
      // Could send rejection email here with reason
      res.json({ success: true, message: `Doctor rejected${reason ? `: ${reason}` : ""}` });
    } catch (err) {
      next(err);
    }
  }
);
