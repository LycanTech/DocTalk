import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, type AuthRequest } from "../middleware/authenticate";

export const doctorsRouter = Router();
doctorsRouter.use(authenticate);

doctorsRouter.get("/", async (_req: AuthRequest, res, next) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      select: {
        id: true, firstName: true, lastName: true, specialty: true,
        hospital: true, state: true, phone: true, avatarUrl: true,
      },
      orderBy: { lastName: "asc" },
    });
    res.json({ success: true, data: doctors });
  } catch (err) {
    next(err);
  }
});

doctorsRouter.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, firstName: true, lastName: true, specialty: true,
        hospital: true, state: true, phone: true, avatarUrl: true,
        isVerified: true, createdAt: true,
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
