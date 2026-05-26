"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/components/providers/AuthProvider";

interface FormData { email: string; password: string; }

export function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Email</label>
        <input
          type="email"
          className="input"
          placeholder="doctor@hospital.ng"
          {...register("email", { required: true })}
        />
      </div>

      <div>
        <label className="label">Password</label>
        <input
          type="password"
          className="input"
          placeholder="••••••••"
          {...register("password", { required: true })}
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-apple-md px-3 py-2.5">
          <p className="text-[13px] text-[var(--red)]">{error}</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
