"use client";

import useSWR, { mutate } from "swr";
import { useState } from "react";
import { fetcher, getAuthHeader } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface Inquiry {
  id:          string;
  patientName: string;
  phone?:      string;
  email?:      string;
  message:     string;
  isRead:      boolean;
  reply?:      string;
  repliedAt?:  string;
  createdAt:   string;
}

export function InboxList() {
  const { data } = useSWR<{ success: boolean; data: Inquiry[] }>(
    "/api/v1/inquiries",
    fetcher,
  );
  const inquiries    = data?.data ?? [];
  const [replyId, setReplyId]   = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending]   = useState(false);

  const markRead = async (id: string) => {
    await fetch(`${API}/api/v1/inquiries/${id}/read`, {
      method: "PATCH",
      headers: getAuthHeader(),
    });
    mutate("/api/v1/inquiries");
  };

  const submitReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    await fetch(`${API}/api/v1/inquiries/${id}/reply`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ reply: replyText }),
    });
    setReplyId(null);
    setReplyText("");
    setSending(false);
    mutate("/api/v1/inquiries");
  };

  if (inquiries.length === 0) {
    return (
      <div className="card text-center py-16">
        <p className="font-serif text-[28px] font-bold text-[var(--text-primary)] mb-1">All clear.</p>
        <p className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
          No patient messages yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {inquiries.map((inq) => (
        <div
          key={inq.id}
          className={`card-accent transition-all ${!inq.isRead ? "border-l-[var(--accent)]" : ""}`}
          onClick={() => !inq.isRead && markRead(inq.id)}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[var(--accent)] flex items-center justify-center font-mono text-[11px] font-bold text-white">
                  {inq.patientName.charAt(0)}
                </div>
                <div>
                  <p className="font-sans text-[14px] font-semibold text-[var(--text-primary)]">
                    {inq.patientName}
                    {!inq.isRead && (
                      <span className="ml-2 inline-block w-2 h-2 rounded-full bg-[var(--accent)] align-middle" />
                    )}
                  </p>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                    {inq.phone ?? inq.email ?? "No contact"} · {new Date(inq.createdAt).toLocaleString("en-NG")}
                  </p>
                </div>
              </div>
              {!inq.reply && (
                <button
                  onClick={(e) => { e.stopPropagation(); setReplyId(replyId === inq.id ? null : inq.id); setReplyText(""); }}
                  className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent)] border border-[var(--accent)] px-3 py-1 rounded hover:bg-[var(--accent)] hover:text-white transition-colors flex-shrink-0"
                >
                  Reply
                </button>
              )}
            </div>

            <p className="font-sans text-[13px] text-[var(--text-primary)] leading-relaxed mb-3">
              {inq.message}
            </p>

            {inq.reply && (
              <div className="bg-[var(--bg-base)] rounded p-3 border-l-2 border-[var(--gold)]">
                <p className="font-mono text-[10px] text-[var(--gold)] uppercase tracking-wider mb-1">
                  Your reply · {inq.repliedAt && new Date(inq.repliedAt).toLocaleString("en-NG")}
                </p>
                <p className="font-sans text-[13px] text-[var(--text-primary)]">{inq.reply}</p>
              </div>
            )}

            {replyId === inq.id && (
              <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="input flex-1 resize-none"
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => submitReply(inq.id)}
                    disabled={sending || !replyText.trim()}
                    className="btn-primary text-[11px] px-4 py-2 disabled:opacity-40"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => setReplyId(null)}
                    className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
