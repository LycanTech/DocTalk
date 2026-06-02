// ─── Enums ────────────────────────────────────────────────────────────────────

export enum MedicalSpecialty {
  GENERAL_PRACTICE = "GENERAL_PRACTICE",
  INTERNAL_MEDICINE = "INTERNAL_MEDICINE",
  CARDIOLOGY = "CARDIOLOGY",
  NEUROLOGY = "NEUROLOGY",
  ORTHOPEDICS = "ORTHOPEDICS",
  PEDIATRICS = "PEDIATRICS",
  OBSTETRICS_GYNECOLOGY = "OBSTETRICS_GYNECOLOGY",
  SURGERY = "SURGERY",
  OPHTHALMOLOGY = "OPHTHALMOLOGY",
  DERMATOLOGY = "DERMATOLOGY",
  PSYCHIATRY = "PSYCHIATRY",
  RADIOLOGY = "RADIOLOGY",
  PATHOLOGY = "PATHOLOGY",
  ONCOLOGY = "ONCOLOGY",
  EMERGENCY_MEDICINE = "EMERGENCY_MEDICINE",
  ANESTHESIOLOGY = "ANESTHESIOLOGY",
  NEPHROLOGY = "NEPHROLOGY",
  GASTROENTEROLOGY = "GASTROENTEROLOGY",
  PULMONOLOGY = "PULMONOLOGY",
  ENDOCRINOLOGY = "ENDOCRINOLOGY",
  HEMATOLOGY = "HEMATOLOGY",
  INFECTIOUS_DISEASE = "INFECTIOUS_DISEASE",
  RHEUMATOLOGY = "RHEUMATOLOGY",
  UROLOGY = "UROLOGY",
  ENT = "ENT",
}

export enum BloodGroup {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
  UNKNOWN = "UNKNOWN",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum GenotypeType {
  AA = "AA",
  AS = "AS",
  SS = "SS",
  AC = "AC",
  SC = "SC",
}

export enum RecordStatus {
  ACTIVE = "ACTIVE",
  RESOLVED = "RESOLVED",
  REFERRED = "REFERRED",
  DECEASED = "DECEASED",
}

export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export enum UserRole {
  DOCTOR = "DOCTOR",
  NURSE = "NURSE",
  ADMIN = "ADMIN",
}

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  specialty: MedicalSpecialty;
  licenseNumber: string;
  phone: string;
  hospital?: string;
  state: NigerianState;
  role: UserRole;
  avatarUrl?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup: BloodGroup;
  genotype?: GenotypeType;
  phone?: string;
  address?: string;
  state?: NigerianState;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies: string[];
  chronicConditions: string[];
  nhisNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  visitDate: string;
  chiefComplaint: string;
  history: string;
  examination: string;
  diagnosis: string;
  treatment: string;
  prescription: Prescription[];
  labResults?: LabResult[];
  vitalSigns?: VitalSigns;
  status: RecordStatus;
  followUpDate?: string;
  notes?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface LabResult {
  id: string;
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal: boolean;
  date: string;
}

export interface VitalSigns {
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  duration: number;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  specialty: MedicalSpecialty;
  licenseNumber: string;
  phone: string;
  hospital?: string;
  state: NigerianState;
}

// ─── Nigerian States ──────────────────────────────────────────────────────────

export enum NigerianState {
  ABIA = "Abia",
  ADAMAWA = "Adamawa",
  AKWA_IBOM = "Akwa Ibom",
  ANAMBRA = "Anambra",
  BAUCHI = "Bauchi",
  BAYELSA = "Bayelsa",
  BENUE = "Benue",
  BORNO = "Borno",
  CROSS_RIVER = "Cross River",
  DELTA = "Delta",
  EBONYI = "Ebonyi",
  EDO = "Edo",
  EKITI = "Ekiti",
  ENUGU = "Enugu",
  FCT = "Federal Capital Territory",
  GOMBE = "Gombe",
  IMO = "Imo",
  JIGAWA = "Jigawa",
  KADUNA = "Kaduna",
  KANO = "Kano",
  KATSINA = "Katsina",
  KEBBI = "Kebbi",
  KOGI = "Kogi",
  KWARA = "Kwara",
  LAGOS = "Lagos",
  NASARAWA = "Nasarawa",
  NIGER = "Niger",
  OGUN = "Ogun",
  ONDO = "Ondo",
  OSUN = "Osun",
  OYO = "Oyo",
  PLATEAU = "Plateau",
  RIVERS = "Rivers",
  SOKOTO = "Sokoto",
  TARABA = "Taraba",
  YOBE = "Yobe",
  ZAMFARA = "Zamfara",
}

// ─── Offline Sync Types ───────────────────────────────────────────────────────

export type SyncStatus = "synced" | "pending" | "conflict" | "error";

export interface SyncMeta {
  _id: string;
  _rev?: string;
  syncStatus: SyncStatus;
  lastSyncedAt?: string;
  localUpdatedAt: string;
}
