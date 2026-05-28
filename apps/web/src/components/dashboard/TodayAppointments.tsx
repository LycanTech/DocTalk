"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { clsx } from "clsx";
import type { Appointment } from "@doctalk/shared";

interface AppointmentWithPatient extends Appointment {
  patient: { firstName: string; lastName: string; phone?: string };
}

const STATUS_STYLE: Record<string, string> = {
  SCHEDULED: "badge-blue",
  COMPLETED: "badge-green",
  CANCELLED: "badge-red",
  NO_SHOW:   "badge-orange",
};

export function TodayAppointments() {
  const today = new Date();
  const from = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const to   = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data } = useSWR<{ success: boolean; data: AppointmentWithPatient[] }>(
    `/api/v1/appointments?from=${from}&to=${to}`,
    fetcher
  );
  const appointments = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="section-label">
          Today&apos;s Appointments
          <span className="ml-2 font-mono text-[10px] text-[var(--text-muted)]">({appointments.length})</span>
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="card text-center py-10">
          <p className="font-serif text-[28px] font-bold text-[var(--text-primary)] mb-1">All clear.</p>
          <p className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider">No appointments scheduled today</p>
        </div>
      ) : (
        <div className="card-accent space-y-0 divide-y divide-[var(--border)]">
          {appointments.map((a) => (
            <div key={a.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors">
              <div className="text-right w-12 flex-shrink-0">
                <p className="font-mono text-[11px] font-semibold text-[var(--gold)]">
                  {new Date(a.scheduledAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="font-mono text-[10px] text-[var(--text-muted)]">{a.duration}m</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-[14px] font-medium text-[var(--text-primary)]">
                  {a.patient.firstName} {a.patient.lastName}
                </p>
                <p className="font-mono text-[11px] text-[var(--text-muted)] truncate uppercase tracking-wider">{a.reason}</p>
              </div>
              <span className={clsx("flex-shrink-0 ml-2", STATUS_STYLE[a.status] ?? "badge")}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
