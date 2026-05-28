import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0C0C] px-4 py-12">
      <div className="bg-grid absolute inset-0 opacity-[0.03]" />

      <div className="relative w-full max-w-lg">
        <div className="mb-10">
          <p className="section-label mb-4">Create Account // DocTalk</p>
          <h1 className="font-serif text-[40px] font-bold text-white leading-tight">
            Join <span className="text-[var(--accent)] italic">DocTalk.</span>
          </h1>
          <p className="font-mono text-[12px] text-[#555] mt-3 uppercase tracking-wider">
            Verified Nigerian doctors only
          </p>
        </div>

        <div className="glass-card bg-[#111] border border-[#1E1E1E] rounded-apple-lg p-6">
          <RegisterForm />
        </div>

        <p className="font-mono text-[11px] text-[#444] mt-6 uppercase tracking-wider text-center">
          Already registered?{" "}
          <a href="/login" className="text-[var(--accent)] hover:text-white transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
