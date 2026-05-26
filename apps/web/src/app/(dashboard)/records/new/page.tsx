import type { Metadata } from "next";
import { NewRecordForm } from "@/components/records/NewRecordForm";

export const metadata: Metadata = { title: "New Record" };

export default function NewRecordPage({
  searchParams,
}: {
  searchParams: { patientId?: string };
}) {
  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div className="flex items-center gap-3">
        <a href="/records" className="text-[var(--blue)] text-[15px]">← Records</a>
        <h1 className="text-[28px] font-bold text-[var(--label-primary)]">New Medical Record</h1>
      </div>
      <NewRecordForm patientId={searchParams.patientId} />
    </div>
  );
}
