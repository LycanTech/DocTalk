import type { Metadata } from "next";
import { ChatInterface } from "@/components/chat/ChatInterface";

export const metadata: Metadata = { title: "DocTalk AI" };

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col animate-fade-in">
      <div className="mb-4 flex-shrink-0">
        <p className="section-label mb-2">AI Assistant // DocTalk</p>
        <h1 className="font-serif text-[32px] md:text-[40px] font-bold text-[var(--text-primary)] leading-tight">
          Clinical <span className="text-[var(--accent)] italic">Intelligence.</span>
        </h1>
        <p className="font-mono text-[11px] text-[var(--text-muted)] mt-1 uppercase tracking-wider">
          Powered by Claude · patient-context aware · Nigerian formulary
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}
