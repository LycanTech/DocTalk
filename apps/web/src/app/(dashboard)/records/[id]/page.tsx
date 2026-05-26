import type { Metadata } from "next";
import { RecordDetail } from "@/components/records/RecordDetail";

export const metadata: Metadata = { title: "Medical Record" };

export default function RecordDetailPage({ params }: { params: { id: string } }) {
  return <RecordDetail id={params.id} />;
}
