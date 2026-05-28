"use client";

import useSWR, { mutate } from "swr";
import { useState } from "react";
import { fetcher, getAuthHeader } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface PendingDoctor {
  id:             string;
  email:          string;
  firstName:      string;
  lastName:       string;
  specialty:      string;
  licenseNumber:  string;
  hospital?:      string;
  state:          string;
  emailVerifiedAt: string;
  createdAt:      string;
}

const SPECIALTY_LABEL: Record<string, string> = {
  GENERAL_PRACTICE: "GP", INTERNAL_MEDICINE: "Int. Medicine", CARDIOLOGY: "Cardiology",
  PEDIATRICS: "Paediatrics", OBSTETRICS_GYNECOLOGY: "Obs/Gynae", SURGERY: "Surgery",
  EMERGENCY_MEDICINE: "Emergency", PSYCHIATRY: "Psychiatry",
};

export function VerificationQueue() {
  const { data } = useSWR<{ success: boolean; data: PendingDoctor[] }>(
    "/api/v1/verification/pending",
    fetcher,
  );
  const doctors  = data?.data ?? [];
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const approve = async (id: string) => {
    setLoading(id);
    await fetch(`${API}/api/v1/verification/approve/${id}`, {
      method: "POST",
      headers: getAuthHeader(),
    });
    setLoading(null);
    mutate("/api/v1/verification/pending");
  };

  const reject = async (id: string) => {
    setLoading(id);
    await fetch(`${API}/api/v1/verification/reject/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ reason: rejectReason }),
    });
    setLoading(null);
    setRejectId(null);
    setRejectReason("");
    mutate("/api/v1/verification/pending");
  };

  if (doctors.length === 0) {
    return (
      <div className="card text-center py-16">
        <p className="font-serif text-[28px] font-bold text-[var(--text-primary)] mb-1">Queue empty.</p>
        <p className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
          No doctors awaiting MDCN verification
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
          {doctors.length} pending
        </span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      {doctors.map((doc) => (
        <div key={doc.id} className="card overflow-hidden">
          <div className="p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded bg-[var(--accent)] flex items-center justify-center font-mono text-[12px] font-bold text-white">
                  {doc.firstName[0]}{doc.lastName[0]}
                </div>
                <div>
                  <p className="font-sans text-[16px] font-semibold text-[var(--text-primary)]">
                    Dr. {doc.firstName} {doc.lastName}
                  </p>
                  <p className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                    {SPECIALTY_LABEL[doc.specialty] ?? doc.specialty} · {doc.state}
                  </p>
                </div>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--gold)] border border-[var(--gold)] px-2 py-0.5 rounded">
                Email Verified
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
              {[
                { label: "License No.", value: doc.licenseNumber },
                { label: "Email",       value: doc.email },
                { label: "Hospital",    value: doc.hospital ?? "—" },
                { label: "Registered",  value: new Date(doc.createdAt).toLocaleDateString("en-NG") },
                { label: "Email Verified", value: new Date(doc.emailVerifiedAt).toLocaleDateString("en-NG") },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-0.5">{label}</p>
                  <p className="font-sans text-[13px] text-[var(--text-primary)]">{value}</p>
                </div>
              ))}
            </div>

            {rejectId === doc.id ? (
              <div className="flex gap-2 mt-2">
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (optional)"
                  className="input flex-1 text-[13px]"
                />
                <button
                  onClick={() => reject(doc.id)}
                  disabled={loading === doc.id}
                  className="font-mono text-[10px] uppercase tracking-wider px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded hover:bg-red-500/20 transition-colors disabled:opacity-40"
                >
                  Confirm Reject
                </button>
                <button onClick={() => setRejectId(null)} className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors px-3">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => approve(doc.id)}
                  disabled={loading === doc.id}
                  className="btn-primary text-[11px] px-5 py-2 disabled:opacity-40"
                >
                  {loading === doc.id ? "Approving…" : "Approve & Notify"}
                </button>
                <button
                  onClick={() => setRejectId(doc.id)}
                  className="font-mono text-[11px] uppercase tracking-wider px-5 py-2 border border-[var(--border)] text-[var(--text-muted)] rounded hover:border-red-500/50 hover:text-red-400 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
