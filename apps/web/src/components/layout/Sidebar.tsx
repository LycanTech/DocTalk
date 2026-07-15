"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Dashboard",    num: "01" },
  { href: "/patients",           label: "Patients",     num: "02" },
  { href: "/records",            label: "Records",      num: "03" },
  { href: "/appointments",       label: "Appointments", num: "04" },
  { href: "/chat",               label: "AI Chat",      num: "05" },
  { href: "/inbox",              label: "Inbox",        num: "06" },
  { href: "/doctors",            label: "Doctors",      num: "07" },
  { href: "/admin/verification", label: "Verification", num: "08", adminOnly: true },
  { href: "/settings",           label: "Settings",     num: "09" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { doctor, logout } = useAuth();

  return (
    <aside className="sidebar hidden md:flex flex-col w-60 h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/[0.06]">
        <p className="section-label mb-2">Medical Records // Secure</p>
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-8 h-8 rounded-apple-sm bg-[var(--accent)] flex items-center justify-center flex-shrink-0"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <span className="font-mono text-[11px] font-bold text-white">DT</span>
          </motion.div>
          <span className="font-serif text-[20px] font-bold text-white tracking-tight">DocTalk</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.filter((item) => !item.adminOnly || doctor?.role === "ADMIN").map(({ href, label, num }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-apple-md transition-colors duration-100",
                active ? "text-white" : "text-[#666] hover:text-white"
              )}
            >
              {/* Spring-animated active pill */}
              {active && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-apple-md bg-[var(--accent)]"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              {!active && (
                <motion.div
                  className="absolute inset-0 rounded-apple-md bg-white/0"
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  transition={{ duration: 0.15 }}
                />
              )}
              <span className="relative z-10 font-mono text-[10px] font-medium w-5 flex-shrink-0 opacity-50">{num}</span>
              <span className="relative z-10 font-mono text-[12px] font-medium uppercase tracking-wider">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-3 border-t border-white/[0.06] pt-4">
        <ThemeToggle />
        {doctor && (
          <motion.div
            className="flex items-center gap-2.5 px-3 py-2 rounded-apple-md bg-white/[0.04] border border-white/[0.06]"
            whileHover={{ backgroundColor: "rgba(255,255,255,0.07)" }}
            transition={{ duration: 0.15 }}
          >
            <div className="w-7 h-7 rounded-apple-sm bg-[var(--accent)] flex items-center justify-center text-white font-mono text-[11px] font-bold flex-shrink-0">
              {doctor.firstName[0]}{doctor.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[11px] font-semibold text-white uppercase tracking-wider truncate">
                Dr. {doctor.lastName}
              </p>
              <p className="font-mono text-[10px] text-[#555] truncate uppercase tracking-wider">{doctor.specialty}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-[#444] hover:text-[var(--accent)] transition-colors text-[14px] flex-shrink-0"
              title="Sign out"
            >
              ↩
            </button>
          </motion.div>
        )}
      </div>
    </aside>
  );
}
