"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Doctor } from "@doctalk/shared";

interface AuthContextValue {
  doctor: Doctor | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PUBLIC_PATHS = ["/login", "/register"];
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchMe = useCallback(async (token: string) => {
    const res = await fetch(`${API}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Unauthorized");
    const { data } = await res.json();
    setDoctor(data);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("doctalk-access-token");
    if (token) {
      setAccessToken(token);
      fetchMe(token)
        .catch(() => {
          sessionStorage.removeItem("doctalk-access-token");
          sessionStorage.removeItem("doctalk-refresh-token");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchMe]);

  useEffect(() => {
    if (isLoading) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (!doctor && !isPublic) router.replace("/login");
    if (doctor && isPublic) router.replace("/dashboard");
  }, [doctor, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Login failed");
    }
    const { data } = await res.json();
    sessionStorage.setItem("doctalk-access-token", data.accessToken);
    sessionStorage.setItem("doctalk-refresh-token", data.refreshToken);
    setAccessToken(data.accessToken);
    setDoctor(data.doctor);
    router.push("/dashboard");
  };

  const logout = async () => {
    const token = sessionStorage.getItem("doctalk-access-token");
    const refreshToken = sessionStorage.getItem("doctalk-refresh-token");
    if (token) {
      await fetch(`${API}/api/v1/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    sessionStorage.removeItem("doctalk-access-token");
    sessionStorage.removeItem("doctalk-refresh-token");
    setDoctor(null);
    setAccessToken(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ doctor, accessToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
