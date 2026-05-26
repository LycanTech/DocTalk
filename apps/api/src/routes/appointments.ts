import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, type AuthRequest } from "../middleware/authenticate";

export const appointmentsRouter = Router();
appointmentsRouter.use(authenticate);

const createSchema = z.object({
  patientId: z.string(),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(5).max(240).default(30),
  reason: z.string().min(1),
  notes: z.string().optional(),
});

appointmentsRouter.get("/", async (req: AuthRequest, res, next) => {
  try {
    const { patientId, status, from, to } = req.query as Record<string, string | undefined>;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);

    const where: Record<string, unknown> = { doctorId: req.doctor!.sub };
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
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

    res.json({ success: true, data: appointments, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

appointmentsRouter.post("/", async (req: AuthRequest, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const appt = await prisma.appointment.create({
      data: { ...body, doctorId: req.doctor!.sub, scheduledAt: new Date(body.scheduledAt) },
      include: { patient: { select: { firstName: true, lastName: true } } },
    });
    res.status(201).json({ success: true, data: appt });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Validation failed", details: err.flatten().fieldErrors });
      return;
    }
    next(err);
  }
});

appointmentsRouter.patch("/:id", async (req: AuthRequest, res, next) => {
  try {
    const body = createSchema.partial().extend({ status: z.enum(["SCHEDULED","COMPLETED","CANCELLED","NO_SHOW"]).optional() }).parse(req.body);
    const appt = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { ...body, ...(body.scheduledAt && { scheduledAt: new Date(body.scheduledAt) }) },
    });
    res.json({ success: true, data: appt });
  } catch (err) {
    next(err);
  }
});
