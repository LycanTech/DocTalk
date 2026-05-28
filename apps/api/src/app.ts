import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { authRouter } from "./routes/auth";
import { patientsRouter } from "./routes/patients";
import { recordsRouter } from "./routes/records";
import { appointmentsRouter } from "./routes/appointments";
import { doctorsRouter } from "./routes/doctors";
import { syncRouter } from "./routes/sync";
import { verificationRouter } from "./routes/verification";
import { attachmentsRouter } from "./routes/attachments";
import { notificationsRouter } from "./routes/notifications";
import { statsRouter } from "./routes/stats";
import { chatRouter } from "./routes/chat";
import { inquiriesRouter } from "./routes/inquiries";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

const app = express();

// ─── Security & Middleware ────────────────────────────────────────────────────

app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(","),
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

// ─── Rate Limiting ────────────────────────────────────────────────────────────

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "doctalk-api", timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/patients", patientsRouter);
app.use("/api/v1/records", recordsRouter);
app.use("/api/v1/appointments", appointmentsRouter);
app.use("/api/v1/doctors", doctorsRouter);
app.use("/api/v1/sync", syncRouter);
app.use("/api/v1/verification", verificationRouter);
app.use("/api/v1/attachments", attachmentsRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/stats", statsRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/inquiries", inquiriesRouter);

// ─── Error Handling ───────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

export default app;
