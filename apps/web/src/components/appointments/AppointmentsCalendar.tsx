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

export function AppointmentsCalendar() {
  const { data, isLoading } = useSWR<{
    success: boolean;
    data: AppointmentWithPatient[];
  }>("/api/v1/appointments?status=SCHEDULED", fetcher);

  const appointments = data?.data ?? [];

  const grouped = appointments.reduce<Record<string, AppointmentWithPatient[]>>((acc, a) => {
    const date = new Date(a.scheduledAt).toLocaleDateString("en-NG", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    (acc[date] ??= []).push(a);
    return acc;
  }, {});

  if (isLoading) return <div className="card py-12 text-center text-[var(--label-secondary)]">Loading…</div>;

  return (
    <div className="space-y-6">
      {Object.keys(grouped).length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-[40px] mb-2">📅</p>
          <p className="text-[17px] font-semibold text-[var(--label-primary)]">No upcoming appointments</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, appts]) => (
          <div key={date}>
            <h3 className="text-[13px] font-semibold text-[var(--label-secondary)] uppercase tracking-wide mb-2 px-1">
              {date}
            </h3>
            <div className="list-group">
              {appts.map((a) => (
                <div key={a.id} className="list-group-item">
                  <div className="w-12 text-center mr-4 flex-shrink-0">
                    <p className="text-[13px] font-bold text-[var(--blue)]">
                      {new Date(a.scheduledAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-[11px] text-[var(--label-secondary)]">{a.duration}min</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[var(--label-primary)]">
                      {a.patient.firstName} {a.patient.lastName}
                    </p>
                    <p className="text-[13px] text-[var(--label-secondary)] truncate">{a.reason}</p>
                  </div>
                  <span className={clsx("badge flex-shrink-0 ml-3", STATUS_STYLE[a.status])}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
