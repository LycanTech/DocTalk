import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PATIENTS_PORT ?? 4012);

app.use(cors());
app.use(express.json());
app.use(morgan("short"));

app.get("/health", (_req, res) => {
  res.json({ service: "patients-service", port: PORT, status: "ok" });
});

const schema = z.object({
  firstName:             z.string().min(1),
  lastName:              z.string().min(1),
  dateOfBirth:           z.string(),
  gender:                z.enum(["MALE", "FEMALE", "OTHER"]),
  bloodGroup:            z.enum(["A_POSITIVE","A_NEGATIVE","B_POSITIVE","B_NEGATIVE","AB_POSITIVE","AB_NEGATIVE","O_POSITIVE","O_NEGATIVE","UNKNOWN"]).default("UNKNOWN"),
  genotype:              z.enum(["AA","AS","SS","AC","SC"]).optional(),
  phone:                 z.string().optional(),
  address:               z.string().optional(),
  state:                 z.string().optional(),
  emergencyContactName:  z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  nhisNumber:            z.string().optional(),
  allergies:             z.array(z.string()).default([]),
  chronicConditions:     z.array(z.string()).default([]),
});

// GET /patients — raw, unmasked (gateway applies PII masking before returning to client)
app.get("/patients", async (req, res) => {
  try {
    const q     = req.query.q as string | undefined;
    const page  = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const where = q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName:  { contains: q, mode: "insensitive" as const } },
            { nhisNumber: { contains: q } },
          ],
        }
      : {};

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    res.json({ success: true, data: patients, pagination: { page, limit, total } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// GET /patients/:id
app.get("/patients/:id", async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
    if (!patient) { res.status(404).json({ success: false, error: "Not found" }); return; }
    res.json({ success: true, data: patient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// POST /patients
app.post("/patients", async (req, res) => {
  try {
    const body    = schema.parse(req.body);
    const patient = await prisma.patient.create({
      data: { ...body, dateOfBirth: new Date(body.dateOfBirth) },
    });
    res.status(201).json({ success: true, data: patient });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.flatten().fieldErrors });
      return;
    }
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// PATCH /patients/:id
app.patch("/patients/:id", async (req, res) => {
  try {
    const body    = schema.partial().parse(req.body);
    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data:  { ...body, ...(body.dateOfBirth && { dateOfBirth: new Date(body.dateOfBirth) }) },
    });
    res.json({ success: true, data: patient });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.flatten().fieldErrors });
      return;
    }
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

app.listen(PORT, () => console.log(`[patients-service] listening on :${PORT}`));
