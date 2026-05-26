"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { MedicalSpecialty, NigerianState } from "@doctalk/shared";

type FormData = {
  email: string; password: string; confirmPassword: string;
  firstName: string; lastName: string;
  specialty: MedicalSpecialty; licenseNumber: string;
  phone: string; hospital: string; state: NigerianState;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setError(null);
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match"); return;
    }
    const { confirmPassword: _, ...payload } = data;
    const res = await fetch(`${API}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Registration failed"); return;
    }
    const { data: body } = await res.json();
    sessionStorage.setItem("doctalk-access-token", body.accessToken);
    sessionStorage.setItem("doctalk-refresh-token", body.refreshToken);
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">First Name</label>
          <input className="input" placeholder="Oluwaseun" {...register("firstName", { required: true })} />
        </div>
        <div>
          <label className="label">Last Name</label>
          <input className="input" placeholder="Adeyemi" {...register("lastName", { required: true })} />
        </div>
      </div>

      <div>
        <label className="label">Email</label>
        <input type="email" className="input" placeholder="doctor@hospital.ng" {...register("email", { required: true })} />
      </div>

      <div>
        <label className="label">Password</label>
        <input type="password" className="input" placeholder="Min. 8 characters" {...register("password", { required: true, minLength: 8 })} />
      </div>

      <div>
        <label className="label">Confirm Password</label>
        <input type="password" className="input" placeholder="Repeat password" {...register("confirmPassword", { required: true })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Specialty</label>
          <select className="input" {...register("specialty", { required: true })}>
            {Object.entries(MedicalSpecialty).map(([k, v]) => (
              <option key={k} value={k}>{v.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">MDCN License No.</label>
          <input className="input" placeholder="MDCN-XXXXX" {...register("licenseNumber", { required: true })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Phone</label>
          <input type="tel" className="input" placeholder="+234..." {...register("phone", { required: true })} />
        </div>
        <div>
          <label className="label">State</label>
          <select className="input" {...register("state", { required: true })}>
            {Object.values(NigerianState).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Hospital / Clinic (optional)</label>
        <input className="input" placeholder="Lagos University Teaching Hospital" {...register("hospital")} />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-apple-md px-3 py-2.5">
          <p className="text-[13px] text-[var(--red)]">{error}</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
