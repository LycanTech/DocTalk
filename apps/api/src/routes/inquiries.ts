import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, type AuthRequest } from "../middleware/authenticate";

export const inquiriesRouter = Router();

const createSchema = z.object({
  doctorId:    z.string().min(1),
  patientName: z.string().min(1),
  phone:       z.string().optional(),
  email:       z.string().email().optional(),
  message:     z.string().min(10),
});

// POST /inquiries — public, no auth (patient sends a message to a doctor)
inquiriesRouter.post("/", async (req, res, next) => {
  try {
    const body    = createSchema.parse(req.body);
    const inquiry = await prisma.patientInquiry.create({ data: body });
    res.status(201).json({ success: true, data: { id: inquiry.id } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.flatten().fieldErrors });
      return;
    }
    next(err);
  }
});

// GET /inquiries — doctor sees their inbox (authenticated)
inquiriesRouter.get("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const unreadOnly = req.query.unread === "true";
    const inquiries  = await prisma.patientInquiry.findMany({
      where: {
        doctorId: req.doctor!.sub,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: inquiries });
  } catch (err) {
    next(err);
  }
});

// PATCH /inquiries/:id/read — mark as read
inquiriesRouter.patch("/:id/read", authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.patientInquiry.update({
      where: { id: req.params.id, doctorId: req.doctor!.sub },
      data:  { isRead: true },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// PATCH /inquiries/:id/reply — doctor replies
inquiriesRouter.patch("/:id/reply", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { reply } = req.body as { reply: string };
    if (!reply?.trim()) {
      res.status(400).json({ success: false, error: "reply text required" });
      return;
    }
    const updated = await prisma.patientInquiry.update({
      where: { id: req.params.id, doctorId: req.doctor!.sub },
      data:  { reply, repliedAt: new Date(), isRead: true },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});
