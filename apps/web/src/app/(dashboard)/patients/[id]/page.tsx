import type { Metadata } from "next";
import { PatientDetail } from "@/components/patients/PatientDetail";

export const metadata: Metadata = { title: "Patient Record" };

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  return <PatientDetail id={params.id} />;
}
