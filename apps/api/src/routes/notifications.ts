import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { sendPushNotification, type PushPayload } from "../lib/webpush";
import { authenticate, type AuthRequest } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  userAgent: z.string().optional(),
});

// GET /notifications/vapid-key — return public VAPID key for client setup
notificationsRouter.get("/vapid-key", (_req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    res.status(503).json({ success: false, error: "Push notifications not configured" });
    return;
  }
  res.json({ success: true, data: { publicKey: key } });
});

// POST /notifications/subscribe
notificationsRouter.post("/subscribe", async (req: AuthRequest, res, next) => {
  try {
    const body = subscribeSchema.parse(req.body);
    const sub = await prisma.pushSubscription.upsert({
      where: { endpoint: body.endpoint },
      update: { p256dh: body.keys.p256dh, auth: body.keys.auth },
      create: {
        doctorId: req.doctor!.sub,
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        userAgent: body.userAgent,
      },
    });
    res.status(201).json({ success: true, data: { id: sub.id } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Invalid subscription object" });
      return;
    }
    next(err);
  }
});

// DELETE /notifications/unsubscribe
notificationsRouter.delete("/unsubscribe", async (req: AuthRequest, res, next) => {
  try {
    const { endpoint } = req.body as { endpoint?: string };
    if (!endpoint) {
      res.status(400).json({ success: false, error: "endpoint required" });
      return;
    }
    await prisma.pushSubscription.deleteMany({
      where: { endpoint, doctorId: req.doctor!.sub },
    });
    res.json({ success: true, message: "Unsubscribed" });
  } catch (err) {
    next(err);
  }
});

// POST /notifications/send — admin/internal: send to all subs for a doctor
notificationsRouter.post(
  "/send",
  requireRole("ADMIN"),
  async (req: AuthRequest, res, next) => {
    try {
      const { doctorId, payload } = req.body as { doctorId: string; payload: PushPayload };
      const subs = await prisma.pushSubscription.findMany({ where: { doctorId } });

      const staleIds: string[] = [];
      await Promise.all(
        subs.map(async (s) => {
          const ok = await sendPushNotification(s.endpoint, s.p256dh, s.auth, payload);
          if (!ok) staleIds.push(s.id);
        })
      );

      if (staleIds.length) {
        await prisma.pushSubscription.deleteMany({ where: { id: { in: staleIds } } });
      }

      res.json({ success: true, data: { sent: subs.length - staleIds.length, removed: staleIds.length } });
    } catch (err) {
      next(err);
    }
  }
);

// POST /notifications/broadcast — admin: send appointment reminders
notificationsRouter.post(
  "/broadcast/appointments",
  requireRole("ADMIN"),
  async (_req, res, next) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const appointments = await prisma.appointment.findMany({
        where: { scheduledAt: { gte: tomorrow, lt: dayAfter }, status: "SCHEDULED" },
        include: {
          doctor: { include: { pushSubscriptions: true } },
          patient: { select: { firstName: true, lastName: true } },
        },
      });

      let sent = 0;
      for (const appt of appointments) {
        const time = new Date(appt.scheduledAt).toLocaleTimeString("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const payload: PushPayload = {
          title: "Appointment Reminder",
          body: `Tomorrow at ${time}: ${appt.patient.firstName} ${appt.patient.lastName}`,
          url: `/appointments`,
          type: "APPOINTMENT_REMINDER",
        };
        for (const sub of appt.doctor.pushSubscriptions) {
          await sendPushNotification(sub.endpoint, sub.p256dh, sub.auth, payload);
          sent++;
        }
      }

      res.json({ success: true, data: { appointments: appointments.length, notificationsSent: sent } });
    } catch (err) {
      next(err);
    }
  }
);
