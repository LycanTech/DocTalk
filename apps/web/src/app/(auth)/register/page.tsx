import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-apple-xl bg-[var(--blue)] mb-4 shadow-apple-lg">
            <span className="text-2xl font-bold text-white">DT</span>
          </div>
          <h1 className="text-[28px] font-bold text-[var(--label-primary)]">Join DocTalk</h1>
          <p className="text-[15px] text-[var(--label-secondary)] mt-1">
            Create your doctor account
          </p>
        </div>

        <div className="card">
          <RegisterForm />
        </div>

        <p className="text-center text-[13px] text-[var(--label-secondary)] mt-6">
          Already registered?{" "}
          <a href="/login" className="text-[var(--blue)] font-semibold">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
