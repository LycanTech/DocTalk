"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useState } from "react";

export function AdminLoginButton() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      await login("chikwex@doctalk.ng", "Chikwex@2024!");
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAdminLogin}
      disabled={loading}
      className="w-full flex items-center justify-between px-4 py-3 rounded-apple-md border border-[#2A2A2A] hover:border-[var(--gold)] bg-transparent transition-all duration-150 group disabled:opacity-50"
    >
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-apple-sm bg-[var(--accent)] flex items-center justify-center font-mono text-[11px] font-bold text-white">
          CA
        </div>
        <div className="text-left">
          <p className="font-mono text-[12px] font-semibold text-white uppercase tracking-wider">
            {loading ? "Signing in…" : "Continue as Admin"}
          </p>
          <p className="font-mono text-[10px] text-[#555] uppercase tracking-wider">Chikwex · chikwex@doctalk.ng</p>
        </div>
      </div>
      <span className="font-mono text-[#444] group-hover:text-[var(--gold)] transition-colors text-[14px]">→</span>
    </button>
  );
}
