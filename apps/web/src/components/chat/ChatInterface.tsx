"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { getAuthHeader } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const SUGGESTIONS = [
  "What are the first-line antihypertensives for a Nigerian patient with T2DM?",
  "Summarise drug interactions between Metformin and Lisinopril",
  "What are WHO criteria for severe malaria?",
  "Advise on HbSS sickle cell crisis management",
  "NHIS documentation requirements for inpatient admission",
];

export function ChatInterface() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [loading, setLoading]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset, watch } = useForm<{ message: string }>();
  const messageValue = watch("message", "");

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const send = async (data: { message: string }) => {
    if (!data.message.trim() || loading) return;
    const userMsg = data.message.trim();
    reset();

    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/v1/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ message: userMsg, sessionId }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.text) {
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.role === "assistant") {
                  next[next.length - 1] = { ...last, content: last.content + parsed.text };
                }
                return next;
              });
            }
            if (parsed.done && parsed.sessionId) {
              setSessionId(parsed.sessionId);
            }
          } catch { /* skip malformed */ }
        }
      }

      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.streaming) next[next.length - 1] = { ...last, streaming: false };
        return next;
      });
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: "Unable to reach DocTalk AI. Check that ANTHROPIC_API_KEY is set in the API .env and the API is running.",
        };
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const useSuggestion = (s: string) => {
    if (loading) return;
    send({ message: s });
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Message area */}
      <div className="flex-1 card overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-6 py-8">
            <div className="text-center">
              <p className="font-serif text-[22px] text-[var(--text-primary)] mb-1">Good morning, Doctor.</p>
              <p className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                Ask about a patient, drug interaction, or clinical guideline
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-xl">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => useSuggestion(s)}
                  className="text-left px-4 py-2.5 rounded border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded bg-[var(--accent)] flex items-center justify-center font-mono text-[9px] font-bold text-white flex-shrink-0 mt-0.5">
                AI
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded font-sans text-[14px] leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)]"
              }`}
            >
              {m.content}
              {m.streaming && (
                <span className="inline-block w-1.5 h-4 bg-[var(--accent)] ml-1 animate-pulse align-middle" />
              )}
            </div>
            {m.role === "user" && (
              <div className="w-7 h-7 rounded bg-[var(--gold)] flex items-center justify-center font-mono text-[9px] font-bold text-black flex-shrink-0 mt-0.5">
                DR
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit(send)} className="flex gap-2 flex-shrink-0">
        <input
          {...register("message")}
          placeholder="Ask about a patient, diagnosis, drug interaction..."
          className="input flex-1"
          autoComplete="off"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !messageValue.trim()}
          className="btn-primary px-5 disabled:opacity-40"
        >
          {loading ? "…" : "Send"}
        </button>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => { setMessages([]); setSessionId(undefined); }}
            className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors px-3"
          >
            Clear
          </button>
        )}
      </form>
    </div>
  );
}
