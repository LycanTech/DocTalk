import type { Metadata } from "next";
import { PatientsList } from "@/components/patients/PatientsList";

export const metadata: Metadata = { title: "Patients" };

export default function PatientsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[var(--label-primary)]">Patients</h1>
        <a href="/patients/new" className="btn-primary">
          + New Patient
        </a>
      </div>
      <PatientsList />
    </div>
  );
}
