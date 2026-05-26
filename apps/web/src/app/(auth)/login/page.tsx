import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-apple-xl bg-[var(--blue)] mb-4 shadow-apple-lg">
            <span className="text-2xl font-bold text-white">DT</span>
          </div>
          <h1 className="text-[28px] font-bold text-[var(--label-primary)]">DocTalk</h1>
          <p className="text-[15px] text-[var(--label-secondary)] mt-1">
            Nigeria&apos;s Medical Records Platform
          </p>
        </div>

        <div className="card">
          <LoginForm />
        </div>

        <p className="text-center text-[13px] text-[var(--label-secondary)] mt-6">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-[var(--blue)] font-semibold">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
