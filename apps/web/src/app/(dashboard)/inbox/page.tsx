import type { Metadata } from "next";
import { InboxList } from "@/components/inbox/InboxList";

export const metadata: Metadata = { title: "Patient Inbox" };

export default function InboxPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="section-label mb-2">Inbox // Patient Messages</p>
        <h1 className="font-serif text-[32px] md:text-[40px] font-bold text-[var(--text-primary)] leading-tight">
          Patient <span className="text-[var(--accent)] italic">Messages.</span>
        </h1>
        <p className="font-mono text-[11px] text-[var(--text-muted)] mt-1 uppercase tracking-wider">
          Inquiries submitted via the patient portal
        </p>
      </div>
      <InboxList />
    </div>
  );
}
