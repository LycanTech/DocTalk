"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { calculateAge, formatDate } from "@doctalk/shared";
import type { Patient, MedicalRecord } from "@doctalk/shared";

interface PatientWithRecords extends Patient {
  records: Array<MedicalRecord & { doctor: { firstName: string; lastName: string; specialty: string } }>;
}

export function PatientDetail({ id }: { id: string }) {
  const { data, isLoading } = useSWR<{ success: boolean; data: PatientWithRecords }>(
    `/api/v1/patients/${id}`,
    fetcher
  );

  if (isLoading) return <div className="card py-12 text-center text-[var(--label-secondary)]">Loading…</div>;
  if (!data?.data) return <div className="card py-12 text-center text-[var(--red)]">Patient not found</div>;

  const p = data.data;

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      {/* Header card */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--blue)] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {p.firstName[0]}{p.lastName[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-[22px] font-bold text-[var(--label-primary)]">
              {p.firstName} {p.lastName}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="badge badge-blue">{p.bloodGroup.replace("_POSITIVE","+").replace("_NEGATIVE","-")}</span>
              {p.genotype && <span className="badge badge-green">Genotype: {p.genotype}</span>}
              <span className="badge badge-orange">{p.gender}</span>
              <span className="badge">Age {calculateAge(p.dateOfBirth)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-[15px] font-semibold text-[var(--label-primary)] mb-3">Personal Info</h2>
          <dl className="space-y-2 text-[13px]">
            <Row label="Date of Birth" value={formatDate(p.dateOfBirth)} />
            <Row label="Phone" value={p.phone ?? "—"} />
            <Row label="State" value={p.state ?? "—"} />
            <Row label="NHIS No." value={p.nhisNumber ?? "—"} />
          </dl>
        </div>

        <div className="card">
          <h2 className="text-[15px] font-semibold text-[var(--label-primary)] mb-3">Medical Summary</h2>
          <div className="space-y-2 text-[13px]">
            <div>
              <p className="label">Allergies</p>
              {p.allergies.length ? (
                <div className="flex flex-wrap gap-1">
                  {p.allergies.map((a) => <span key={a} className="badge badge-red">{a}</span>)}
                </div>
              ) : <p className="text-[var(--label-secondary)]">None recorded</p>}
            </div>
            <div className="mt-2">
              <p className="label">Chronic Conditions</p>
              {p.chronicConditions.length ? (
                <div className="flex flex-wrap gap-1">
                  {p.chronicConditions.map((c) => <span key={c} className="badge badge-orange">{c}</span>)}
                </div>
              ) : <p className="text-[var(--label-secondary)]">None recorded</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Recent records */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-semibold text-[var(--label-primary)]">Recent Records</h2>
          <a href={`/records/new?patientId=${p.id}`} className="btn-primary px-4 py-2 text-[13px]">
            + New Record
          </a>
        </div>
        <div className="list-group">
          {p.records.map((r) => (
            <a key={r.id} href={`/records/${r.id}`} className="list-group-item">
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-[var(--label-primary)] truncate">{r.diagnosis}</p>
                <p className="text-[13px] text-[var(--label-secondary)]">
                  Dr. {r.doctor.lastName} · {r.doctor.specialty} · {formatDate(r.visitDate)}
                </p>
              </div>
              <span className={r.status === "ACTIVE" ? "badge badge-blue" : "badge badge-green"}>
                {r.status}
              </span>
            </a>
          ))}
          {p.records.length === 0 && (
            <div className="px-4 py-8 text-center text-[var(--label-secondary)]">No records yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--label-secondary)]">{label}</span>
      <span className="text-[var(--label-primary)] font-medium">{value}</span>
    </div>
  );
}
