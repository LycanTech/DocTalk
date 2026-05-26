"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiFetch } from "@/lib/api";

interface VerificationStatus {
  emailVerified: boolean;
  mdcnVerified: boolean;
  fullyVerified: boolean;
}

export function VerificationBanner() {
  const { doctor, accessToken } = useAuth();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!doctor || !accessToken) return;
    apiFetch("/api/v1/verification/status")
      .then((r) => r.json())
      .then((d) => setStatus(d.data))
      .catch(() => {});
  }, [doctor, accessToken]);

  if (!status || status.fullyVerified) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await apiFetch("/api/v1/verification/request-email", { method: "POST" });
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  if (!status.emailVerified) {
    return (
      <div className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">✉️</span>
          <div>
            <p className="text-[14px] font-semibold text-orange-800 dark:text-orange-300">
              Verify your email address
            </p>
            <p className="text-[13px] text-orange-700 dark:text-orange-400">
              Check your inbox at {doctor?.email} for a verification link.
            </p>
          </div>
        </div>
        <button
          onClick={handleResend}
          disabled={sending || sent}
          className="flex-shrink-0 text-[13px] font-semibold text-orange-800 dark:text-orange-300 underline disabled:opacity-50"
        >
          {sent ? "Sent!" : sending ? "Sending…" : "Resend email"}
        </button>
      </div>
    );
  }

  if (!status.mdcnVerified) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3 flex items-center gap-3">
        <span className="text-xl">🏥</span>
        <div>
          <p className="text-[14px] font-semibold text-blue-800 dark:text-blue-300">
            MDCN verification pending
          </p>
          <p className="text-[13px] text-blue-700 dark:text-blue-400">
            Our team is reviewing your license number. You can use DocTalk while we verify your
            credentials — this usually takes 1–2 business days.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
