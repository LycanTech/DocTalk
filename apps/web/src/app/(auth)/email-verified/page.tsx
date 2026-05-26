import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Email Verified" };

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-[28px] font-bold text-[var(--label-primary)] mb-2">Email Verified!</h1>
        <p className="text-[15px] text-[var(--label-secondary)] mb-6">
          Your email has been confirmed. Our team will review your MDCN license shortly.
        </p>
        <Link href="/dashboard" className="btn-primary inline-block">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
