// ─── PII Masking Utilities ────────────────────────────────────────────────────
// Applied at the API Gateway layer before responses reach clients.
// Role rules:
//   ADMIN  → full data (unrestricted)
//   DOCTOR → full data (clinical need)
//   NURSE  → masked PII (see patient but not identify)

import { UserRole } from "./types";

/** +2348012345678 → +234*****5678 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 8) return "***";
  const visible = 4;
  return phone.slice(0, visible) + "*".repeat(Math.max(0, phone.length - visible - 4)) + phone.slice(-4);
}

/** NHIS-001-2024 → NHIS-***-2024 */
export function maskNhis(nhis: string): string {
  return nhis.replace(/^(NHIS-)([^-]+)(-?.*)$/, "$1***$3");
}

/** dr.adeyemi@doctalk.ng → dr.***@doctalk.ng */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***.***";
  return local.slice(0, 2) + "***@" + domain;
}

/** 12 Eko Atlantic, Victoria Island → 12 Eko Atlantic*** */
export function maskAddress(address: string): string {
  return address.length > 16 ? address.slice(0, 16) + "***" : "***";
}

/** 1985-03-15 → 1985-**-** (keep year for age calculation, mask day/month) */
export function maskDateOfBirth(dob: string | Date): string {
  const d = new Date(dob);
  return `${d.getFullYear()}-**-**`;
}

export interface PiiContext {
  role: UserRole;
}

/** Apply role-based masking to a patient object */
export function maskPatient<T extends Record<string, unknown>>(patient: T, ctx: PiiContext): T {
  if (ctx.role === "ADMIN" || ctx.role === "DOCTOR") return patient;
  return {
    ...patient,
    phone:                 patient.phone                 ? maskPhone(patient.phone as string)         : null,
    nhisNumber:            patient.nhisNumber            ? maskNhis(patient.nhisNumber as string)      : null,
    address:               patient.address               ? maskAddress(patient.address as string)      : null,
    emergencyContactPhone: patient.emergencyContactPhone ? maskPhone(patient.emergencyContactPhone as string) : null,
    dateOfBirth:           patient.dateOfBirth           ? maskDateOfBirth(patient.dateOfBirth as string) : null,
  };
}

/** Apply masking to a list of patients */
export function maskPatientList<T extends Record<string, unknown>>(patients: T[], ctx: PiiContext): T[] {
  return patients.map((p) => maskPatient(p, ctx));
}

/** Audit action types */
export const AUDIT_ACTIONS = {
  LOGIN:            "AUTH:LOGIN",
  LOGOUT:           "AUTH:LOGOUT",
  READ_PATIENT:     "PII:READ_PATIENT",
  LIST_PATIENTS:    "PII:LIST_PATIENTS",
  UPDATE_PATIENT:   "PII:UPDATE_PATIENT",
  DELETE_PATIENT:   "PII:DELETE_PATIENT",
  CREATE_PATIENT:   "PII:CREATE_PATIENT",
  READ_RECORD:      "RECORD:READ",
  LIST_RECORDS:     "RECORD:LIST",
  CREATE_RECORD:    "RECORD:CREATE",
  UPDATE_RECORD:    "RECORD:UPDATE",
  READ_APPOINTMENT: "APPT:READ",
  LIST_APPOINTMENTS:"APPT:LIST",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
