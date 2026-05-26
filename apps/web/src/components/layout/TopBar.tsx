"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/patients":     "Patients",
  "/records":      "Records",
  "/appointments": "Appointments",
  "/doctors":      "Doctors",
};

export function TopBar() {
  const pathname = usePathname();
  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? "DocTalk";

  return (
    <header className="flex items-center px-4 md:px-6 h-14 bg-[var(--bg-primary)] border-b border-[var(--separator)] md:hidden">
      <h1 className="text-[17px] font-semibold text-[var(--label-primary)]">{title}</h1>
    </header>
  );
}
