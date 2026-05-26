"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetcher } from "@/lib/api";
import { calculateAge, debounce } from "@doctalk/shared";
import type { Patient } from "@doctalk/shared";
import { clsx } from "clsx";

const BLOOD_COLORS: Record<string, string> = {
  "A_POSITIVE": "badge-blue", "A_NEGATIVE": "badge-blue",
  "B_POSITIVE": "badge-green","B_NEGATIVE": "badge-green",
  "O_POSITIVE": "badge-red",  "O_NEGATIVE": "badge-red",
  "AB_POSITIVE":"badge-orange","AB_NEGATIVE":"badge-orange",
};

export function PatientsList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSWR<{
    success: boolean;
    data: Patient[];
    pagination: { page: number; total: number; totalPages: number };
  }>(
    `/api/v1/patients?page=${page}&limit=20${search ? `&q=${encodeURIComponent(search)}` : ""}`,
    fetcher
  );

  const handleSearch = useCallback(
    debounce((v: string) => { setSearch(v); setPage(1); }, 350),
    []
  );

  return (
    <div className="space-y-4">
      <input
        type="search"
        className="input max-w-sm"
        placeholder="Search by name, phone, or NHIS number…"
        onChange={(e) => handleSearch(e.target.value)}
      />

      {isLoading ? (
        <div className="card py-12 text-center text-[var(--label-secondary)]">Loading patients…</div>
      ) : (
        <>
          <div className="list-group">
            {(data?.data ?? []).map((p) => (
              <Link key={p.id} href={`/patients/${p.id}`} className="list-group-item">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[13px] font-bold text-[var(--blue)] mr-4 flex-shrink-0">
                  {p.firstName[0]}{p.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[var(--label-primary)]">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="text-[13px] text-[var(--label-secondary)]">
                    {p.gender} · {calculateAge(p.dateOfBirth)} yrs
                    {p.phone && ` · ${p.phone}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-3">
                  <span className={clsx(BLOOD_COLORS[p.bloodGroup] ?? "badge", "badge")}>
                    {p.bloodGroup.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")}
                  </span>
                  {p.allergies.length > 0 && (
                    <span className="badge badge-red">⚠ Allergies</span>
                  )}
                </div>
              </Link>
            ))}

            {(data?.data ?? []).length === 0 && (
              <div className="px-4 py-12 text-center">
                <p className="text-[40px] mb-2">🔍</p>
                <p className="text-[17px] font-semibold text-[var(--label-primary)]">No patients found</p>
                <p className="text-[15px] text-[var(--label-secondary)] mt-1">
                  Try a different search or add a new patient
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-[13px] text-[var(--label-secondary)]">
                {data.pagination.total} patients · page {data.pagination.page} of {data.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary px-3 py-1.5 text-[13px] disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page === data.pagination.totalPages}
                  className="btn-secondary px-3 py-1.5 text-[13px] disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
