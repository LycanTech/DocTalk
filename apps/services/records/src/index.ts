import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.RECORDS_PORT ?? 4013);

app.use(cors());
app.use(express.json());
app.use(morgan("short"));

app.get("/health", (_req, res) => {
  res.json({ service: "records-service", port: PORT, status: "ok" });
});

const schema = z.object({
  patientId:      z.string(),
  visitDate:      z.string(),
  chiefComplaint: z.string().min(1),
  history:        z.string().min(1),
  examination:    z.string().min(1),
  diagnosis:      z.string().min(1),
  treatment:      z.string().min(1),
  prescription:   z.array(z.unknown()).default([]),
  labResults:     z.array(z.unknown()).default([]),
  vitalSigns:     z.record(z.unknown()).optional(),
  status:         z.enum(["ACTIVE","RESOLVED","REFERRED","DECEASED"]).default("ACTIVE"),
  followUpDate:   z.string().optional(),
  notes:          z.string().optional(),
});

// GET /records — filtered by doctorId from gateway header
app.get("/records", async (req, res) => {
  try {
    const doctorId  = req.headers["x-doctor-id"] as string | undefined;
    const patientId = req.query.patientId as string | undefined;
    const page      = Math.max(1, Number(req.query.page) || 1);
    const limit     = Math.min(50, Number(req.query.limit) || 20);

    const where: Record<string, unknown> = {};
    if (doctorId)  where.doctorId  = doctorId;
    if (patientId) where.patientId = patientId;

    const [total, records] = await Promise.all([
      prisma.medicalRecord.count({ where }),
      prisma.medicalRecord.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { visitDate: "desc" },
        include: {
          patient: { select: { firstName: true, lastName: true } },
          doctor:  { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    res.json({ success: true, data: records, pagination: { page, limit, total } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// GET /records/:id
app.get("/records/:id", async (req, res) => {
  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: req.params.id },
      include: {
        patient: true,
        doctor:  { select: { firstName: true, lastName: true, specialty: true } },
        attachments: true,
      },
    });
    if (!record) { res.status(404).json({ success: false, error: "Not found" }); return; }
    res.json({ success: true, data: record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// POST /records
app.post("/records", async (req, res) => {
  try {
    const doctorId = req.headers["x-doctor-id"] as string;
    const body     = schema.parse(req.body);
    const record   = await prisma.medicalRecord.create({
      data: {
        ...body,
        doctorId,
        visitDate:    new Date(body.visitDate),
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
        prescription: body.prescription as Prisma.InputJsonValue,
        labResults:   body.labResults   as Prisma.InputJsonValue,
      },
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.flatten().fieldErrors });
      return;
    }
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// PATCH /records/:id
app.patch("/records/:id", async (req, res) => {
  try {
    const body   = schema.partial().parse(req.body);
    const record = await prisma.medicalRecord.update({
      where: { id: req.params.id },
      data:  {
        ...body as any,
        ...(body.visitDate    && { visitDate:    new Date(body.visitDate) }),
        ...(body.followUpDate && { followUpDate: new Date(body.followUpDate) }),
      },
    });
    res.json({ success: true, data: record });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.flatten().fieldErrors });
      return;
    }
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

app.listen(PORT, () => console.log(`[records-service] listening on :${PORT}`));
