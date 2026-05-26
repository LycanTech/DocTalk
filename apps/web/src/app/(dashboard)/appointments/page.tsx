import type { Metadata } from "next";
import { AppointmentsCalendar } from "@/components/appointments/AppointmentsCalendar";

export const metadata: Metadata = { title: "Appointments" };

export default function AppointmentsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[var(--label-primary)]">Appointments</h1>
        <button className="btn-primary">+ Schedule</button>
      </div>
      <AppointmentsCalendar />
    </div>
  );
}
