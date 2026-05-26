import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, type AuthRequest } from "../middleware/authenticate";

export const patientsRouter = Router();
patientsRouter.use(authenticate);

const createPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  bloodGroup: z.enum(["A_POSITIVE","A_NEGATIVE","B_POSITIVE","B_NEGATIVE","AB_POSITIVE","AB_NEGATIVE","O_POSITIVE","O_NEGATIVE","UNKNOWN"]).default("UNKNOWN"),
  genotype: z.enum(["AA","AS","SS","AC","SC"]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  nhisNumber: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
});

// GET /patients — search + paginate
patientsRouter.get("/", async (req: AuthRequest, res, next) => {
  try {
    const q = req.query.q as string | undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const where = q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName:  { contains: q, mode: "insensitive" as const } },
            { phone:     { contains: q } },
            { nhisNumber:{ contains: q } },
          ],
          isActive: true,
        }
      : { isActive: true };

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastName: "asc" },
        select: {
          id: true, firstName: true, lastName: true, dateOfBirth: true,
          gender: true, bloodGroup: true, genotype: true, phone: true,
          state: true, nhisNumber: true, allergies: true, chronicConditions: true,
          createdAt: true, updatedAt: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: patients,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /patients/:id
patientsRouter.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        records: {
          orderBy: { visitDate: "desc" },
          take: 5,
          select: {
            id: true, visitDate: true, diagnosis: true, status: true,
            doctor: { select: { firstName: true, lastName: true, specialty: true } },
          },
        },
        appointments: {
          where: { status: "SCHEDULED", scheduledAt: { gte: new Date() } },
          orderBy: { scheduledAt: "asc" },
          take: 3,
        },
      },
    });

    if (!patient) {
      res.status(404).json({ success: false, error: "Patient not found" });
      return;
    }
    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
});

// POST /patients
patientsRouter.post("/", async (req: AuthRequest, res, next) => {
  try {
    const body = createPatientSchema.parse(req.body);
    const patient = await prisma.patient.create({
      data: { ...body, dateOfBirth: new Date(body.dateOfBirth) },
    });
    res.status(201).json({ success: true, data: patient });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Validation failed", details: err.flatten().fieldErrors });
      return;
    }
    next(err);
  }
});

// PATCH /patients/:id
patientsRouter.patch("/:id", async (req: AuthRequest, res, next) => {
  try {
    const body = createPatientSchema.partial().parse(req.body);
    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: { ...body, ...(body.dateOfBirth && { dateOfBirth: new Date(body.dateOfBirth) }) },
    });
    res.json({ success: true, data: patient });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Validation failed", details: err.flatten().fieldErrors });
      return;
    }
    next(err);
  }
});

// DELETE /patients/:id (soft delete)
patientsRouter.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    await prisma.patient.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: "Patient archived" });
  } catch (err) {
    next(err);
  }
});
