"use client";

import useSWR from "swr";
import Link from "next/link";
import { fetcher } from "@/lib/api";
import { formatDate } from "@doctalk/shared";
import type { MedicalRecord } from "@doctalk/shared";
import { clsx } from "clsx";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:   "badge-blue",
  RESOLVED: "badge-green",
  REFERRED: "badge-orange",
  DECEASED: "badge-red",
};

interface RecordWithNames extends MedicalRecord {
  patient: { firstName: string; lastName: string };
  doctor:  { firstName: string; lastName: string; specialty: string };
}

export function RecordsList() {
  const { data, isLoading } = useSWR<{
    success: boolean;
    data: RecordWithNames[];
    pagination: { total: number };
  }>("/api/v1/records?limit=30", fetcher);

  if (isLoading) return <div className="card py-12 text-center text-[var(--label-secondary)]">Loading records…</div>;

  return (
    <div className="list-group">
      {(data?.data ?? []).length === 0 && (
        <div className="px-4 py-12 text-center">
          <p className="text-[40px] mb-2">📋</p>
          <p className="text-[17px] font-semibold text-[var(--label-primary)]">No records yet</p>
          <p className="text-[15px] text-[var(--label-secondary)] mt-1">
            Records you create will appear here.
          </p>
        </div>
      )}
      {(data?.data ?? []).map((r) => (
        <Link key={r.id} href={`/records/${r.id}`} className="list-group-item">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[15px] font-semibold text-[var(--label-primary)] truncate">{r.diagnosis}</p>
              <span className={clsx("badge flex-shrink-0", STATUS_STYLE[r.status] ?? "badge")}>
                {r.status}
              </span>
            </div>
            <p className="text-[13px] text-[var(--label-secondary)]">
              {r.patient.firstName} {r.patient.lastName} · {formatDate(r.visitDate)}
            </p>
          </div>
          <span className="text-[var(--label-secondary)] text-[18px] ml-3">›</span>
        </Link>
      ))}
    </div>
  );
}
