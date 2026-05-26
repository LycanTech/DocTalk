import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.EMAIL_FROM ?? "DocTalk <noreply@doctalk.ng>";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(
  email: string,
  firstName: string,
  token: string
): Promise<void> {
  const link = `${APP_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verify your DocTalk account",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <div style="background:#007AFF;width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:24px">
          <span style="color:#fff;font-weight:700;font-size:18px">DT</span>
        </div>
        <h1 style="font-size:22px;font-weight:700;margin:0 0 8px">Welcome to DocTalk, Dr. ${firstName}</h1>
        <p style="color:#6B6B80;font-size:15px;margin:0 0 24px">
          Please verify your email address to activate your account.
        </p>
        <a href="${link}" style="display:inline-block;background:#007AFF;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:15px">
          Verify Email Address
        </a>
        <p style="color:#ADADBD;font-size:13px;margin:24px 0 0">
          This link expires in 24 hours. If you did not create a DocTalk account, ignore this email.
        </p>
      </div>
    `,
  });
  logger.info({ email }, "Verification email sent");
}

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  token: string
): Promise<void> {
  const link = `${APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your DocTalk password",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h1 style="font-size:22px;font-weight:700;margin:0 0 8px">Password Reset</h1>
        <p style="color:#6B6B80;font-size:15px;margin:0 0 24px">
          Dr. ${firstName}, click the button below to reset your password. This link expires in 1 hour.
        </p>
        <a href="${link}" style="display:inline-block;background:#FF3B30;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:15px">
          Reset Password
        </a>
        <p style="color:#ADADBD;font-size:13px;margin:24px 0 0">
          If you did not request this, your account is safe — just ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendDoctorApprovedEmail(email: string, firstName: string): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Your DocTalk account has been verified",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h1 style="font-size:22px;font-weight:700;margin:0 0 8px">You're verified, Dr. ${firstName}!</h1>
        <p style="color:#6B6B80;font-size:15px;margin:0 0 24px">
          Your MDCN license has been verified by the DocTalk team. You now have full access to all platform features.
        </p>
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#34C759;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:15px">
          Go to Dashboard
        </a>
      </div>
    `,
  });
}
