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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[17px] font-semibold text-[var(--label-primary)]">Recent Patients</h2>
        <Link href="/patients" className="text-[13px] text-[var(--blue)] font-medium">See all</Link>
      </div>

      <div className="list-group">
        {patients.length === 0 && (
          <div className="px-4 py-8 text-center text-[var(--label-secondary)] text-[15px]">
            No patients yet
          </div>
        )}
        {patients.map((p) => (
          <Link key={p.id} href={`/patients/${p.id}`} className="list-group-item">
            <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[13px] font-semibold text-[var(--blue)] mr-3 flex-shrink-0">
              {p.firstName[0]}{p.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-medium text-[var(--label-primary)] truncate">
                {p.firstName} {p.lastName}
              </p>
              <p className="text-[13px] text-[var(--label-secondary)]">
                {calculateAge(p.dateOfBirth)} yrs · {p.bloodGroup}
              </p>
            </div>
            <span className="text-[var(--label-tertiary)] text-[12px] flex-shrink-0 ml-2">
              {formatDate(p.updatedAt)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
