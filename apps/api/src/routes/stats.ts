import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, type AuthRequest } from "../middleware/authenticate";

export const statsRouter = Router();
statsRouter.use(authenticate);

statsRouter.get("/", async (req: AuthRequest, res, next) => {
  try {
    const doctorId = req.doctor!.sub;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [totalPatients, todayAppointments, pendingRecords] = await Promise.all([
      prisma.patient.count({ where: { isActive: true } }),
      prisma.appointment.count({
        where: { doctorId, scheduledAt: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.medicalRecord.count({
        where: { doctorId, status: "ACTIVE" },
      }),
    ]);

    res.json({
      success: true,
      data: { totalPatients, todayAppointments, pendingRecords, syncPending: 0 },
    });
  } catch (err) {
    next(err);
  }
});
