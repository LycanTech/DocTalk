import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import webpush from "web-push";

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.NOTIFICATIONS_PORT ?? 4015);

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? "admin@doctalk.ng"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

app.use(cors());
app.use(express.json());
app.use(morgan("short"));

app.get("/health", (_req, res) => {
  res.json({ service: "notifications-service", port: PORT, status: "ok" });
});

// GET /notifications/vapid-public-key
app.get("/notifications/vapid-public-key", (_req, res) => {
  res.json({ success: true, data: { publicKey: process.env.VAPID_PUBLIC_KEY ?? "" } });
});

// POST /notifications/subscribe
app.post("/notifications/subscribe", async (req, res) => {
  try {
    const doctorId = req.headers["x-doctor-id"] as string;
    const { endpoint, keys, userAgent } = req.body as {
      endpoint: string; keys: { p256dh: string; auth: string }; userAgent?: string;
    };
    await prisma.pushSubscription.upsert({
      where:  { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth, userAgent },
      create: { doctorId, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent },
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// POST /notifications/send — internal endpoint for other services to trigger pushes
app.post("/notifications/send", async (req, res) => {
  try {
    const { doctorId, title, body, url } = req.body as {
      doctorId: string; title: string; body: string; url?: string;
    };
    const subs = await prisma.pushSubscription.findMany({ where: { doctorId } });
    const results = await Promise.allSettled(
      subs.map((s) =>
        webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title, body, icon: "/icons/icon-192.png", url }),
        ).then(() => true).catch((err) => {
          if ((err as { statusCode?: number }).statusCode === 410) {
            return prisma.pushSubscription.delete({ where: { endpoint: s.endpoint } }).then(() => false);
          }
          return false;
        }),
      ),
    );
    const sent = results.filter((r) => r.status === "fulfilled" && r.value).length;
    res.json({ success: true, data: { sent, total: subs.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

app.listen(PORT, () => console.log(`[notifications-service] listening on :${PORT}`));
