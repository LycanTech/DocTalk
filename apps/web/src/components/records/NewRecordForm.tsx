"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { apiFetch, fetcher } from "@/lib/api";
import useSWR from "swr";
import type { Patient } from "@doctalk/shared";

interface FormData {
  patientId: string;
  visitDate: string;
  chiefComplaint: string;
  history: string;
  examination: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  followUpDate: string;
  status: "ACTIVE" | "RESOLVED" | "REFERRED" | "DECEASED";
  vitals: {
    temperature: string;
    bloodPressureSystolic: string;
    bloodPressureDiastolic: string;
    heartRate: string;
    oxygenSaturation: string;
    weight: string;
  };
  prescription: Array<{ medication: string; dosage: string; frequency: string; duration: string; instructions: string }>;
}

export function NewRecordForm({ patientId }: { patientId?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { data: patients } = useSWR<{ success: boolean; data: Patient[] }>(
    "/api/v1/patients?limit=100",
    fetcher
  );

  const { register, handleSubmit, control, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      patientId: patientId ?? "",
      visitDate: new Date().toISOString().slice(0, 16),
      status: "ACTIVE",
      prescription: [{ medication: "", dosage: "", frequency: "", duration: "", instructions: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "prescription" });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const vitalSigns = {
      ...(data.vitals.temperature && { temperature: Number(data.vitals.temperature) }),
      ...(data.vitals.bloodPressureSystolic && { bloodPressureSystolic: Number(data.vitals.bloodPressureSystolic) }),
      ...(data.vitals.bloodPressureDiastolic && { bloodPressureDiastolic: Number(data.vitals.bloodPressureDiastolic) }),
      ...(data.vitals.heartRate && { heartRate: Number(data.vitals.heartRate) }),
      ...(data.vitals.oxygenSaturation && { oxygenSaturation: Number(data.vitals.oxygenSaturation) }),
      ...(data.vitals.weight && { weight: Number(data.vitals.weight) }),
    };

    const payload = {
      ...data,
      visitDate: new Date(data.visitDate).toISOString(),
      ...(data.followUpDate && { followUpDate: new Date(data.followUpDate).toISOString() }),
      vitalSigns: Object.keys(vitalSigns).length ? vitalSigns : undefined,
      prescription: data.prescription.filter((p) => p.medication),
    };

    const res = await apiFetch("/api/v1/records", { method: "POST", body: JSON.stringify(payload) });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Failed to create record");
      return;
    }
    const { data: record } = await res.json();
    router.push(`/records/${record.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Patient + Date */}
      <div className="card space-y-4">
        <h2 className="text-[17px] font-semibold text-[var(--label-primary)]">Visit Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Patient</label>
            <select className="input" {...register("patientId", { required: true })}>
              <option value="">Select patient…</option>
              {(patients?.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Visit Date & Time</label>
            <input type="datetime-local" className="input" {...register("visitDate", { required: true })} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Status</label>
            <select className="input" {...register("status")}>
              <option value="ACTIVE">Active</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REFERRED">Referred</option>
              <option value="DECEASED">Deceased</option>
            </select>
          </div>
          <div>
            <label className="label">Follow-up Date (optional)</label>
            <input type="datetime-local" className="input" {...register("followUpDate")} />
          </div>
        </div>
      </div>

      {/* Vital Signs */}
      <div className="card space-y-4">
        <h2 className="text-[17px] font-semibold text-[var(--label-primary)]">Vital Signs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><label className="label">Temp (°C)</label><input type="number" step="0.1" className="input" placeholder="37.0" {...register("vitals.temperature")} /></div>
          <div><label className="label">BP Systolic</label><input type="number" className="input" placeholder="120" {...register("vitals.bloodPressureSystolic")} /></div>
          <div><label className="label">BP Diastolic</label><input type="number" className="input" placeholder="80" {...register("vitals.bloodPressureDiastolic")} /></div>
          <div><label className="label">Heart Rate (bpm)</label><input type="number" className="input" placeholder="72" {...register("vitals.heartRate")} /></div>
          <div><label className="label">SpO₂ (%)</label><input type="number" className="input" placeholder="98" {...register("vitals.oxygenSaturation")} /></div>
          <div><label className="label">Weight (kg)</label><input type="number" step="0.1" className="input" placeholder="70" {...register("vitals.weight")} /></div>
        </div>
      </div>

      {/* Clinical Notes */}
      <div className="card space-y-4">
        <h2 className="text-[17px] font-semibold text-[var(--label-primary)]">Clinical Notes</h2>
        {[
          { name: "chiefComplaint" as const, label: "Chief Complaint", required: true },
          { name: "history" as const, label: "History of Presenting Illness", required: true },
          { name: "examination" as const, label: "Examination Findings", required: true },
          { name: "diagnosis" as const, label: "Diagnosis", required: true },
          { name: "treatment" as const, label: "Treatment Plan", required: true },
          { name: "notes" as const, label: "Additional Notes", required: false },
        ].map(({ name, label, required }) => (
          <div key={name}>
            <label className="label">{label}{required && " *"}</label>
            <textarea rows={3} className="input resize-none" {...register(name, { required })} />
          </div>
        ))}
      </div>

      {/* Prescriptions */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-[var(--label-primary)]">Prescriptions</h2>
          <button
            type="button"
            onClick={() => append({ medication: "", dosage: "", frequency: "", duration: "", instructions: "" })}
            className="text-[var(--blue)] text-[13px] font-semibold"
          >
            + Add
          </button>
        </div>
        {fields.map((field, i) => (
          <div key={field.id} className="border border-[var(--separator)] rounded-apple-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[var(--label-secondary)]">Prescription {i + 1}</p>
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(i)} className="text-[var(--red)] text-[12px]">Remove</button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Medication</label><input className="input" placeholder="Amoxicillin" {...register(`prescription.${i}.medication`)} /></div>
              <div><label className="label">Dosage</label><input className="input" placeholder="500mg" {...register(`prescription.${i}.dosage`)} /></div>
              <div><label className="label">Frequency</label><input className="input" placeholder="3× daily" {...register(`prescription.${i}.frequency`)} /></div>
              <div><label className="label">Duration</label><input className="input" placeholder="7 days" {...register(`prescription.${i}.duration`)} /></div>
            </div>
            <div><label className="label">Instructions (optional)</label><input className="input" placeholder="Take with food" {...register(`prescription.${i}.instructions`)} /></div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-apple-md px-4 py-3">
          <p className="text-[14px] text-[var(--red)]">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          {isSubmitting ? "Saving…" : "Save Record"}
        </button>
        <a href="/records" className="btn-secondary px-6 text-center">Cancel</a>
      </div>
    </form>
  );
}
