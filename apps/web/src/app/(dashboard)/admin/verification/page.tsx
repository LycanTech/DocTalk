import type { Metadata } from "next";
import { VerificationQueue } from "@/components/admin/VerificationQueue";

export const metadata: Metadata = { title: "Doctor Verification" };

export default function VerificationPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="section-label mb-2">Admin // Doctor Verification</p>
        <h1 className="font-serif text-[32px] md:text-[40px] font-bold text-[var(--text-primary)] leading-tight">
          MDCN <span className="text-[var(--accent)] italic">Verification.</span>
        </h1>
        <p className="font-mono text-[11px] text-[var(--text-muted)] mt-1 uppercase tracking-wider">
          Review and approve pending doctor registrations
        </p>
      </div>
      <VerificationQueue />
    </div>
  );
}
