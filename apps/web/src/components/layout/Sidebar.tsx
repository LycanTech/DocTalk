"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard",    label: "Dashboard",    icon: "⬜" },
  { href: "/patients",     label: "Patients",     icon: "👥" },
  { href: "/records",      label: "Records",      icon: "📋" },
  { href: "/appointments", label: "Appointments", icon: "📅" },
  { href: "/doctors",      label: "Doctors",      icon: "🏥" },
  { href: "/settings",     label: "Settings",     icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { doctor, logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[var(--bg-primary)] border-r border-[var(--separator)] h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--separator)]">
        <div className="w-9 h-9 rounded-apple-md bg-[var(--blue)] flex items-center justify-center shadow-apple-sm">
          <span className="text-sm font-bold text-white">DT</span>
        </div>
        <span className="text-[17px] font-bold text-[var(--label-primary)]">DocTalk</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-apple-md transition-all duration-100 text-[15px] font-medium",
              pathname.startsWith(href)
                ? "bg-[var(--blue)] text-white shadow-apple-sm"
                : "text-[var(--label-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--label-primary)]"
            )}
          >
            <span className="text-[18px]">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[var(--separator)] space-y-2">
        <ThemeToggle />
        {doctor && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[var(--blue)] flex items-center justify-center text-white text-[13px] font-semibold">
              {doctor.firstName[0]}{doctor.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[var(--label-primary)] truncate">
                Dr. {doctor.lastName}
              </p>
              <p className="text-[11px] text-[var(--label-secondary)] truncate">{doctor.specialty}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-[var(--label-secondary)] hover:text-[var(--red)] transition-colors text-[13px]"
              title="Sign out"
            >
              ↩
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
