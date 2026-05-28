"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";

interface Stats { totalPatients: number; todayAppointments: number; pendingRecords: number; syncPending: number; }

const STAT_CARDS = [
  { key: "totalPatients"     as const, label: "Total Patients",       sub: "Registered",      cls: "stat-label-gold"   },
  { key: "todayAppointments" as const, label: "Today's Appointments", sub: "Scheduled",       cls: "stat-label-accent" },
  { key: "pendingRecords"    as const, label: "Pending Records",      sub: "Awaiting review", cls: "stat-label-gold"   },
  { key: "syncPending"       as const, label: "Offline Changes",      sub: "To sync",         cls: "stat-label-accent" },
];

export function DashboardStats() {
  const { data } = useSWR<{ success: boolean; data: Stats }>("/api/v1/stats", fetcher);
  const stats = data?.data;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {STAT_CARDS.map(({ key, label, sub, cls }) => (
        <div key={key} className="stat-card">
          <p className={`font-mono text-[10px] uppercase tracking-[0.15em] mb-3 ${cls}`}>
            {sub}
          </p>
          <p className="font-serif text-[36px] font-bold text-[var(--text-primary)] leading-none">
            {stats ? stats[key] : "—"}
          </p>
          <p className="font-mono text-[11px] text-[var(--text-muted)] mt-2 uppercase tracking-wider">{label}</p>
        </div>
      ))}
    </div>
  );
}
