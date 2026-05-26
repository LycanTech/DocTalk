import type { Metadata } from "next";
import { RecordsList } from "@/components/records/RecordsList";

export const metadata: Metadata = { title: "Records" };

export default function RecordsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[var(--label-primary)]">Medical Records</h1>
        <a href="/records/new" className="btn-primary">+ New Record</a>
      </div>
      <RecordsList />
    </div>
  );
}
