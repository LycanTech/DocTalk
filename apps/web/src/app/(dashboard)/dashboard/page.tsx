import type { Metadata } from "next";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentPatients } from "@/components/dashboard/RecentPatients";
import { TodayAppointments } from "@/components/dashboard/TodayAppointments";
import { SyncStatus } from "@/components/offline/SyncStatus";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--label-primary)]">Dashboard</h1>
          <p className="text-[15px] text-[var(--label-secondary)] mt-0.5">
            Good morning, Doctor
          </p>
        </div>
        <SyncStatus />
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <TodayAppointments />
        </div>
        <div className="lg:col-span-2">
          <RecentPatients />
        </div>
      </div>
    </div>
  );
}
