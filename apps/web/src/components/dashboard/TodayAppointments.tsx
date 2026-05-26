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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[17px] font-semibold text-[var(--label-primary)]">
          Today&apos;s Appointments
          <span className="ml-2 badge badge-blue">{appointments.length}</span>
        </h2>
      </div>

      {appointments.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-[40px] mb-2">📅</p>
          <p className="text-[17px] font-semibold text-[var(--label-primary)]">No appointments today</p>
          <p className="text-[15px] text-[var(--label-secondary)] mt-1">Enjoy the free time, Doctor</p>
        </div>
      ) : (
        <div className="list-group">
          {appointments.map((a) => (
            <div key={a.id} className="list-group-item">
              <div className="w-10 text-center mr-3 flex-shrink-0">
                <p className="text-[12px] font-semibold text-[var(--blue)]">
                  {new Date(a.scheduledAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-[11px] text-[var(--label-secondary)]">{a.duration}m</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-[var(--label-primary)]">
                  {a.patient.firstName} {a.patient.lastName}
                </p>
                <p className="text-[13px] text-[var(--label-secondary)] truncate">{a.reason}</p>
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
