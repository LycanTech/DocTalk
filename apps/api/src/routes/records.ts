import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, type AuthRequest } from "../middleware/authenticate";

export const recordsRouter = Router();
recordsRouter.use(authenticate);

const createRecordSchema = z.object({
  patientId: z.string(),
  visitDate: z.string().datetime(),
  chiefComplaint: z.string().min(1),
  history: z.string().min(1),
  examination: z.string().min(1),
  diagnosis: z.string().min(1),
  treatment: z.string().min(1),
  prescription: z.array(z.object({
    medication: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
    instructions: z.string().optional(),
  })).default([]),
  labResults: z.array(z.object({
    testName: z.string(),
    value: z.string(),
    unit: z.string().optional(),
    referenceRange: z.string().optional(),
    isAbnormal: z.boolean().default(false),
    date: z.string(),
  })).default([]),
  vitalSigns: z.object({
    temperature: z.number().optional(),
    bloodPressureSystolic: z.number().optional(),
    bloodPressureDiastolic: z.number().optional(),
    heartRate: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  status: z.enum(["ACTIVE","RESOLVED","REFERRED","DECEASED"]).default("ACTIVE"),
  followUpDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// GET /records?patientId=&page=
recordsRouter.get("/", async (req: AuthRequest, res, next) => {
  try {
    const { patientId } = req.query as { patientId?: string };
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);

    const where = patientId ? { patientId } : { doctorId: req.doctor!.sub };

    const [total, records] = await Promise.all([
      prisma.medicalRecord.count({ where }),
      prisma.medicalRecord.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { visitDate: "desc" },
        include: {
          patient: { select: { firstName: true, lastName: true } },
          doctor:  { select: { firstName: true, lastName: true, specialty: true } },
        },
      }),
    ]);

    res.json({ success: true, data: records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// GET /records/:id
recordsRouter.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: req.params.id },
      include: {
        patient: true,
        doctor: { select: { firstName: true, lastName: true, specialty: true, hospital: true } },
      },
    });
    if (!record) {
      res.status(404).json({ success: false, error: "Record not found" });
      return;
    }
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});

// POST /records
recordsRouter.post("/", async (req: AuthRequest, res, next) => {
  try {
    const body = createRecordSchema.parse(req.body);
    const record = await prisma.medicalRecord.create({
      data: {
        ...body,
        doctorId: req.doctor!.sub,
        visitDate: new Date(body.visitDate),
        ...(body.followUpDate && { followUpDate: new Date(body.followUpDate) }),
        prescription: body.prescription as never,
        labResults: body.labResults as never,
        vitalSigns: body.vitalSigns as never,
      },
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Validation failed", details: err.flatten().fieldErrors });
      return;
    }
    next(err);
  }
});

// PATCH /records/:id
recordsRouter.patch("/:id", async (req: AuthRequest, res, next) => {
  try {
    const body = createRecordSchema.partial().parse(req.body);
    const record = await prisma.medicalRecord.update({
      where: { id: req.params.id },
      data: {
        ...body,
        ...(body.visitDate && { visitDate: new Date(body.visitDate) }),
        ...(body.followUpDate && { followUpDate: new Date(body.followUpDate) }),
        ...(body.prescription && { prescription: body.prescription as never }),
        ...(body.labResults && { labResults: body.labResults as never }),
        ...(body.vitalSigns && { vitalSigns: body.vitalSigns as never }),
      },
    });
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
});
