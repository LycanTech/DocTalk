import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { AdminLoginButton } from "@/components/auth/AdminLoginButton";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0C0C] px-4">
      {/* Subtle grid texture */}
      <div className="bg-grid absolute inset-0 opacity-[0.03]" />

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="mb-10">
          <p className="section-label mb-4">Secure Access // DocTalk</p>
          <h1 className="font-serif text-[40px] font-bold text-white leading-tight">
            Welcome<br />
            back, <span className="text-[var(--accent)] italic">Doctor.</span>
          </h1>
          <p className="font-mono text-[12px] text-[#555] mt-3 uppercase tracking-wider">
            Nigeria&apos;s Medical Records Platform
          </p>
        </div>

        {/* Form card */}
        <div className="glass-card bg-[#111] border border-[#1E1E1E] rounded-apple-lg p-6">
          <LoginForm />
        </div>

        {/* Admin quick-login */}
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-[#1E1E1E]" />
            <span className="font-mono text-[10px] text-[#444] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#1E1E1E]" />
          </div>
          <AdminLoginButton />
        </div>

        <p className="font-mono text-[11px] text-[#444] mt-6 uppercase tracking-wider text-center">
          No account?{" "}
          <a href="/register" className="text-[var(--accent)] hover:text-white transition-colors">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
