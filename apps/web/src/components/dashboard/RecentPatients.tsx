"use client";

import useSWR from "swr";
import Link from "next/link";
import { fetcher } from "@/lib/api";
import { formatDate, calculateAge } from "@doctalk/shared";
import type { Patient } from "@doctalk/shared";

export function RecentPatients() {
  const { data } = useSWR<{ success: boolean; data: Patient[] }>("/api/v1/patients?limit=5", fetcher);
  const patients = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="section-label">Recent Patients</p>
        <Link href="/patients" className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-wider hover:text-white transition-colors">
          See all →
        </Link>
      </div>

      <div className="card-accent space-y-0 divide-y divide-[var(--border)]">
        {patients.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="font-mono text-[12px] text-[var(--text-muted)] uppercase tracking-wider">No patients yet</p>
          </div>
        )}
        {patients.map((p) => (
          <Link key={p.id} href={`/patients/${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors duration-100">
            <div className="w-8 h-8 rounded-apple-sm bg-[var(--accent)] flex items-center justify-center font-mono text-[11px] font-bold text-white flex-shrink-0">
              {p.firstName[0]}{p.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[14px] font-medium text-[var(--text-primary)] truncate">
                {p.firstName} {p.lastName}
              </p>
              <p className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                {calculateAge(p.dateOfBirth)} yrs · {p.bloodGroup}
              </p>
            </div>
            <span className="font-mono text-[10px] text-[var(--text-muted)] flex-shrink-0 ml-2 uppercase tracking-wider">
              {formatDate(p.updatedAt)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
