import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, type AuthRequest } from "../middleware/authenticate";

export const syncRouter = Router();
syncRouter.use(authenticate);

// Returns all records updated since a given ISO timestamp for offline sync
syncRouter.get("/delta", async (req: AuthRequest, res, next) => {
  try {
    const since = req.query.since ? new Date(req.query.since as string) : new Date(0);

    const [patients, records, appointments] = await Promise.all([
      prisma.patient.findMany({
        where: { updatedAt: { gte: since } },
      }),
      prisma.medicalRecord.findMany({
        where: { doctorId: req.doctor!.sub, updatedAt: { gte: since } },
      }),
      prisma.appointment.findMany({
        where: { doctorId: req.doctor!.sub, updatedAt: { gte: since } },
      }),
    ]);

    res.json({
      success: true,
      data: { patients, records, appointments },
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// Accepts a batch of locally-created/modified records from an offline device
syncRouter.post("/push", async (req: AuthRequest, res, next) => {
  try {
    const { patients = [], records = [] } = req.body as {
      patients: Array<{ id: string; [key: string]: unknown }>;
      records:  Array<{ id: string; [key: string]: unknown }>;
    };

    const results = { patients: 0, records: 0, conflicts: [] as string[] };

    for (const p of patients) {
      const { id, ...data } = p;
      await prisma.patient.upsert({
        where: { id },
        update: { ...data as never, updatedAt: new Date() },
        create: { id, ...data as never },
      });
      results.patients++;
    }

    for (const r of records) {
      const { id, ...data } = r;
      await prisma.medicalRecord.upsert({
        where: { id },
        update: { ...data as never, doctorId: req.doctor!.sub, updatedAt: new Date() },
        create: { id, ...data as never, doctorId: req.doctor!.sub },
      });
      results.records++;
    }

    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
});
