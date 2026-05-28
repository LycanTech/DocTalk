import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../lib/prisma";
import { authenticate, type AuthRequest } from "../middleware/authenticate";
import { v4 as uuidv4 } from "uuid";

export const chatRouter = Router();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are DocTalk AI, a clinical assistant embedded in DocTalk — Nigeria's medical records platform.
You assist licensed Nigerian doctors with:
- Reviewing patient histories and flagging risks
- Drug interactions, dosing, and prescribing guidance (Nigerian formulary)
- Differential diagnosis support based on vitals and symptoms
- NHIS claims and documentation guidance
- General medical knowledge (NICE, WHO, local guidelines)

When a doctor shares patient context, reference it precisely.
Be concise, clinically accurate, and flag urgent concerns clearly.
Never suggest treatments that contradict provided patient context.
Respond in clear English. Use bullet points for lists.
If you are uncertain, say so — never fabricate clinical data.`;

// POST /chat/message — send a message, get a streaming AI response
chatRouter.post("/message", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { message, sessionId, patientId } = req.body as {
      message: string;
      sessionId?: string;
      patientId?: string;
    };

    if (!message?.trim()) {
      res.status(400).json({ success: false, error: "message is required" });
      return;
    }

    const sid      = sessionId ?? uuidv4();
    const doctorId = req.doctor!.sub;

    // Load patient context if provided
    let patientContext = "";
    if (patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
          records: {
            orderBy: { visitDate: "desc" },
            take: 3,
            include: { doctor: { select: { firstName: true, lastName: true } } },
          },
        },
      });
      if (patient) {
        const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 86400000));
        patientContext = `
--- PATIENT CONTEXT ---
Name: ${patient.firstName} ${patient.lastName}
Age: ${age} | Gender: ${patient.gender} | Blood Group: ${patient.bloodGroup} | Genotype: ${patient.genotype ?? "Unknown"}
Allergies: ${patient.allergies.length ? patient.allergies.join(", ") : "None documented"}
Chronic Conditions: ${patient.chronicConditions.length ? patient.chronicConditions.join(", ") : "None documented"}
NHIS: ${patient.nhisNumber ?? "Not enrolled"}
Recent Records (last 3):
${patient.records.map((r) => `  [${new Date(r.visitDate).toLocaleDateString("en-NG")}] ${r.diagnosis} — ${r.treatment}`).join("\n") || "  No records"}
----------------------`;
      }
    }

    // Load session history (last 10 messages)
    const history = await prisma.chatMessage.findMany({
      where: { sessionId: sid, doctorId },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    // Build message list for Claude
    const messages: Anthropic.MessageParam[] = [
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: patientContext ? `${patientContext}\n\n${message}` : message },
    ];

    // Save user message
    await prisma.chatMessage.create({
      data: { sessionId: sid, doctorId, role: "user", content: message },
    });

    // Stream response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let fullResponse = "";

    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    stream.on("text", (text) => {
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    await stream.finalMessage();

    // Save assistant response
    await prisma.chatMessage.create({
      data: { sessionId: sid, doctorId, role: "assistant", content: fullResponse },
    });

    res.write(`data: ${JSON.stringify({ done: true, sessionId: sid })}\n\n`);
    res.end();
  } catch (err) {
    next(err);
  }
});

// GET /chat/sessions — list chat session IDs for the current doctor
chatRouter.get("/sessions", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const sessions = await prisma.chatMessage.groupBy({
      by: ["sessionId"],
      where: { doctorId: req.doctor!.sub, role: "user" },
      _max: { createdAt: true },
      _min: { content: true },
      orderBy: { _max: { createdAt: "desc" } },
      take: 20,
    });

    res.json({
      success: true,
      data: sessions.map((s) => ({
        sessionId: s.sessionId,
        lastActivity: s._max.createdAt,
        preview: (s._min.content ?? "").slice(0, 60),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /chat/session/:sessionId — load full session history
chatRouter.get("/session/:sessionId", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: req.params.sessionId, doctorId: req.doctor!.sub },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
});
