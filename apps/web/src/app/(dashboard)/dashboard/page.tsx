import type { Metadata } from "next";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentPatients } from "@/components/dashboard/RecentPatients";
import { TodayAppointments } from "@/components/dashboard/TodayAppointments";
import { PiiShowcase } from "@/components/dashboard/PiiShowcase";
import { ArchOverview } from "@/components/dashboard/ArchOverview";
import { SyncStatus } from "@/components/offline/SyncStatus";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Editorial header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label mb-3">Overview // Today</p>
          <h1 className="font-serif text-[36px] md:text-[44px] font-bold text-[var(--text-primary)] leading-tight">
            Patient <span className="text-[var(--accent)] italic">Records.</span>
          </h1>
          <p className="font-mono text-[12px] text-[var(--text-muted)] mt-2 uppercase tracking-wider">
            Good morning, Doctor
          </p>
        </div>
        <div className="mt-2">
          <SyncStatus />
        </div>
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

      {/* Presentation: PII masking showcase */}
      <PiiShowcase />

      {/* Presentation: microservices architecture overview */}
      <ArchOverview />
    </div>
  );
}
