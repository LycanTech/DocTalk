import { Router } from "express";
import path from "path";
import { prisma } from "../lib/prisma";
import { upload, getFilePath, deleteFile } from "../lib/storage";
import { authenticate, type AuthRequest } from "../middleware/authenticate";

export const attachmentsRouter = Router();
attachmentsRouter.use(authenticate);

// POST /attachments/records/:recordId — upload one or more files
attachmentsRouter.post(
  "/records/:recordId",
  upload.array("files", 10),
  async (req: AuthRequest, res, next) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files?.length) {
        res.status(400).json({ success: false, error: "No files provided" });
        return;
      }

      const record = await prisma.medicalRecord.findUnique({
        where: { id: req.params.recordId },
      });
      if (!record) {
        res.status(404).json({ success: false, error: "Record not found" });
        return;
      }

      const attachments = await prisma.$transaction(
        files.map((f) =>
          prisma.attachment.create({
            data: {
              recordId: req.params.recordId,
              name: f.originalname,
              mimeType: f.mimetype,
              sizeBytes: f.size,
              storageKey: f.filename,
              uploadedBy: req.doctor!.sub,
            },
          })
        )
      );

      res.status(201).json({ success: true, data: attachments });
    } catch (err) {
      next(err);
    }
  }
);

// GET /attachments/:id/download — stream file to client
attachmentsRouter.get("/:id/download", async (req: AuthRequest, res, next) => {
  try {
    const attachment = await prisma.attachment.findUnique({ where: { id: req.params.id } });
    if (!attachment) {
      res.status(404).json({ success: false, error: "Attachment not found" });
      return;
    }

    const filePath = getFilePath(attachment.storageKey);
    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(attachment.name)}"`
    );
    res.sendFile(path.resolve(filePath));
  } catch (err) {
    next(err);
  }
});

// DELETE /attachments/:id
attachmentsRouter.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const attachment = await prisma.attachment.findUnique({ where: { id: req.params.id } });
    if (!attachment) {
      res.status(404).json({ success: false, error: "Attachment not found" });
      return;
    }

    deleteFile(attachment.storageKey);
    await prisma.attachment.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Attachment deleted" });
  } catch (err) {
    next(err);
  }
});
