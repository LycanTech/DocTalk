"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { formatDate } from "@doctalk/shared";
import { FileUpload } from "./FileUpload";
import type { MedicalRecord, VitalSigns, Prescription } from "@doctalk/shared";
import { clsx } from "clsx";

interface FullRecord extends Omit<MedicalRecord, "attachments"> {
  patient: { firstName: string; lastName: string; bloodGroup: string };
  doctor:  { firstName: string; lastName: string; specialty: string; hospital?: string };
  attachments: Array<{ id: string; name: string; mimeType: string; sizeBytes: number }>;
}

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "badge-blue", RESOLVED: "badge-green", REFERRED: "badge-orange", DECEASED: "badge-red",
};

export function RecordDetail({ id }: { id: string }) {
  const { data, isLoading, mutate } = useSWR<{ success: boolean; data: FullRecord }>(
    `/api/v1/records/${id}`,
    fetcher
  );

  if (isLoading) return <div className="card py-12 text-center text-[var(--label-secondary)]">Loading…</div>;
  if (!data?.data) return <div className="card py-12 text-center text-[var(--red)]">Record not found</div>;

  const r = data.data;
  const vitals = r.vitalSigns as VitalSigns | null;
  const prescriptions = r.prescription as Prescription[];

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-bold text-[var(--label-primary)]">{r.diagnosis}</h1>
            <p className="text-[15px] text-[var(--label-secondary)] mt-1">
              {r.patient.firstName} {r.patient.lastName} · {formatDate(r.visitDate)}
            </p>
          </div>
          <span className={clsx("badge text-sm", STATUS_STYLE[r.status] ?? "badge")}>{r.status}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--separator)] text-[13px] text-[var(--label-secondary)]">
          Dr. {r.doctor.firstName} {r.doctor.lastName} · {r.doctor.specialty}
          {r.doctor.hospital && ` · ${r.doctor.hospital}`}
        </div>
      </div>

      {/* Vital Signs */}
      {vitals && Object.values(vitals).some(Boolean) && (
        <div className="card">
          <h2 className="text-[15px] font-semibold text-[var(--label-primary)] mb-3">Vital Signs</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic && (
              <Vital label="Blood Pressure" value={`${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`} />
            )}
            {vitals.heartRate && <Vital label="Heart Rate" value={`${vitals.heartRate} bpm`} />}
            {vitals.temperature && <Vital label="Temperature" value={`${vitals.temperature}°C`} />}
            {vitals.oxygenSaturation && <Vital label="SpO₂" value={`${vitals.oxygenSaturation}%`} />}
            {vitals.respiratoryRate && <Vital label="Resp. Rate" value={`${vitals.respiratoryRate}/min`} />}
            {vitals.weight && <Vital label="Weight" value={`${vitals.weight} kg`} />}
          </div>
        </div>
      )}

      {/* Clinical Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Note title="Chief Complaint" content={r.chiefComplaint} />
        <Note title="History" content={r.history} />
        <Note title="Examination" content={r.examination} />
        <Note title="Treatment Plan" content={r.treatment} />
        {r.notes && <Note title="Additional Notes" content={r.notes} />}
      </div>

      {/* Prescriptions */}
      {prescriptions.length > 0 && (
        <div className="card">
          <h2 className="text-[15px] font-semibold text-[var(--label-primary)] mb-3">Prescriptions</h2>
          <div className="list-group">
            {prescriptions.map((p, i) => (
              <div key={i} className="list-group-item">
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[var(--label-primary)]">
                    {p.medication} — {p.dosage}
                  </p>
                  <p className="text-[13px] text-[var(--label-secondary)]">
                    {p.frequency} for {p.duration}
                    {p.instructions && ` · ${p.instructions}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      <div className="card">
        <h2 className="text-[15px] font-semibold text-[var(--label-primary)] mb-3">Attachments</h2>
        <FileUpload recordId={id} onUploaded={() => mutate()} />
      </div>
    </div>
  );
}

function Vital({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-apple-md px-3 py-2.5">
      <p className="text-[11px] font-semibold text-[var(--label-secondary)] uppercase tracking-wide">{label}</p>
      <p className="text-[15px] font-semibold text-[var(--label-primary)] mt-0.5">{value}</p>
    </div>
  );
}

function Note({ title, content }: { title: string; content: string }) {
  return (
    <div className="card">
      <h3 className="text-[13px] font-semibold text-[var(--label-secondary)] uppercase tracking-wide mb-2">{title}</h3>
      <p className="text-[15px] text-[var(--label-primary)] whitespace-pre-wrap">{content}</p>
    </div>
  );
}
