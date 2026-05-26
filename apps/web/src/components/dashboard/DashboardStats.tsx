"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";

interface Stats { totalPatients: number; todayAppointments: number; pendingRecords: number; syncPending: number; }

const STAT_CARDS = [
  { key: "totalPatients" as const,      label: "Total Patients",       color: "var(--blue)",    icon: "👥" },
  { key: "todayAppointments" as const,  label: "Today's Appointments", color: "var(--green)",   icon: "📅" },
  { key: "pendingRecords" as const,     label: "Pending Records",      color: "var(--orange)",  icon: "📋" },
  { key: "syncPending" as const,        label: "Offline Changes",      color: "var(--mint)",    icon: "🔄" },
];

export function DashboardStats() {
  const { data } = useSWR<{ success: boolean; data: Stats }>("/api/v1/stats", fetcher);
  const stats = data?.data;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {STAT_CARDS.map(({ key, label, color, icon }) => (
        <div key={key} className="card">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{icon}</span>
            <div
              className="w-2 h-2 rounded-full mt-1"
              style={{ backgroundColor: color }}
            />
          </div>
          <p className="text-[28px] font-bold text-[var(--label-primary)]">
            {stats ? stats[key] : "—"}
          </p>
          <p className="text-[13px] text-[var(--label-secondary)] mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}
