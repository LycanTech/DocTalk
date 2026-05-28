import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgo(n: number) { return new Date(Date.now() - n * 86_400_000); }
function daysFromNow(n: number) { return new Date(Date.now() + n * 86_400_000); }
function todayAt(h: number, m = 0) {
  const d = new Date(); d.setHours(h, m, 0, 0); return d;
}

async function main() {
  console.log("Seeding database…");

  const hash = (pw: string) => bcrypt.hash(pw, 12);

  // ── Doctors ──────────────────────────────────────────────────────────────────
  const [adeyemi, chikwex, okafor] = await Promise.all([
    prisma.doctor.upsert({
      where: { email: "dr.adeyemi@doctalk.ng" },
      update: {},
      create: {
        email: "dr.adeyemi@doctalk.ng", passwordHash: await hash("DocTalk@2024!"),
        firstName: "Oluwaseun", lastName: "Adeyemi", specialty: "GENERAL_PRACTICE",
        licenseNumber: "MDCN-12345", phone: "+2348012345678",
        hospital: "Lagos University Teaching Hospital", state: "Lagos",
        isVerified: true, emailVerifiedAt: new Date(), mdcnApprovedAt: new Date(),
      },
    }),
    prisma.doctor.upsert({
      where: { email: "chikwex@doctalk.ng" },
      update: {},
      create: {
        email: "chikwex@doctalk.ng", passwordHash: await hash("Chikwex@2024!"),
        firstName: "Chikwe", lastName: "Azinge", specialty: "INTERNAL_MEDICINE",
        licenseNumber: "MDCN-ADMIN-001", phone: "+2348099999999",
        hospital: "DocTalk HQ", state: "Lagos", role: "ADMIN",
        isVerified: true, emailVerifiedAt: new Date(), mdcnApprovedAt: new Date(),
      },
    }),
    prisma.doctor.upsert({
      where: { email: "dr.okafor@doctalk.ng" },
      update: {},
      create: {
        email: "dr.okafor@doctalk.ng", passwordHash: await hash("DocTalk@2024!"),
        firstName: "Emeka", lastName: "Okafor", specialty: "CARDIOLOGY",
        licenseNumber: "MDCN-67890", phone: "+2347065432100",
        hospital: "National Hospital Abuja", state: "FCT",
        isVerified: true, emailVerifiedAt: new Date(), mdcnApprovedAt: new Date(),
      },
    }),
  ]);

  // ── Patients ─────────────────────────────────────────────────────────────────
  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { nhisNumber: "NHIS-001-2024" },
      update: {},
      create: {
        firstName: "Adaeze", lastName: "Okonkwo", dateOfBirth: new Date("1978-06-12"),
        gender: "FEMALE", bloodGroup: "B_POSITIVE", genotype: "AS",
        phone: "+2348098765432", address: "14 Admiralty Way, Lekki Phase 1, Lagos",
        state: "Lagos", nhisNumber: "NHIS-001-2024",
        emergencyContactName: "Chidi Okonkwo", emergencyContactPhone: "+2348076543210",
        allergies: ["Penicillin", "Sulfonamides"], chronicConditions: ["Hypertension", "Type 2 Diabetes"],
      },
    }),
    prisma.patient.upsert({
      where: { nhisNumber: "NHIS-002-2024" },
      update: {},
      create: {
        firstName: "Ibrahim", lastName: "Musa", dateOfBirth: new Date("1965-03-22"),
        gender: "MALE", bloodGroup: "O_POSITIVE", genotype: "AA",
        phone: "+2348033456789", address: "7 Yakubu Gowon Way, Kaduna",
        state: "Kaduna", nhisNumber: "NHIS-002-2024",
        emergencyContactName: "Aisha Musa", emergencyContactPhone: "+2348011234567",
        allergies: [], chronicConditions: ["Type 2 Diabetes", "Diabetic Neuropathy"],
      },
    }),
    prisma.patient.upsert({
      where: { nhisNumber: "NHIS-003-2024" },
      update: {},
      create: {
        firstName: "Fatima", lastName: "Abdullahi", dateOfBirth: new Date("1992-11-05"),
        gender: "FEMALE", bloodGroup: "A_POSITIVE", genotype: "AA",
        phone: "+2348055678901", address: "23 Ibrahim Taiwo Road, Kano",
        state: "Kano", nhisNumber: "NHIS-003-2024",
        emergencyContactName: "Yusuf Abdullahi", emergencyContactPhone: "+2348044567890",
        allergies: ["Aspirin"], chronicConditions: ["Iron Deficiency Anemia"],
      },
    }),
    prisma.patient.upsert({
      where: { nhisNumber: "NHIS-004-2024" },
      update: {},
      create: {
        firstName: "Bode", lastName: "Salami", dateOfBirth: new Date("1989-08-17"),
        gender: "MALE", bloodGroup: "AB_POSITIVE", genotype: "AS",
        phone: "+2348077890123", address: "5 Ring Road, Ibadan, Oyo",
        state: "Oyo", nhisNumber: "NHIS-004-2024",
        emergencyContactName: "Remi Salami", emergencyContactPhone: "+2348066789012",
        allergies: ["NSAIDs"], chronicConditions: ["Asthma"],
      },
    }),
    prisma.patient.upsert({
      where: { nhisNumber: "NHIS-005-2024" },
      update: {},
      create: {
        firstName: "Chidinma", lastName: "Eze", dateOfBirth: new Date("1975-02-28"),
        gender: "FEMALE", bloodGroup: "O_NEGATIVE", genotype: "AA",
        phone: "+2348022345678", address: "9 Ogui Road, Enugu",
        state: "Enugu", nhisNumber: "NHIS-005-2024",
        emergencyContactName: "Kelechi Eze", emergencyContactPhone: "+2348011345678",
        allergies: ["Codeine"], chronicConditions: ["Hypertension", "Obesity"],
      },
    }),
    prisma.patient.upsert({
      where: { nhisNumber: "NHIS-006-2024" },
      update: {},
      create: {
        firstName: "Ngozi", lastName: "Obi", dateOfBirth: new Date("2001-09-14"),
        gender: "FEMALE", bloodGroup: "A_NEGATIVE", genotype: "SS",
        phone: "+2348099234567", address: "3 Peter Odili Road, Port Harcourt",
        state: "Rivers", nhisNumber: "NHIS-006-2024",
        emergencyContactName: "Sunday Obi", emergencyContactPhone: "+2348088234567",
        allergies: [], chronicConditions: ["Sickle Cell Disease (HbSS)"],
      },
    }),
    prisma.patient.upsert({
      where: { nhisNumber: "NHIS-007-2024" },
      update: {},
      create: {
        firstName: "Seun", lastName: "Alade", dateOfBirth: new Date("1987-05-30"),
        gender: "MALE", bloodGroup: "B_NEGATIVE", genotype: "AA",
        phone: "+2348044678901", address: "18 Awolowo Road, Ikoyi, Lagos",
        state: "Lagos", nhisNumber: "NHIS-007-2024",
        emergencyContactName: "Tunde Alade", emergencyContactPhone: "+2348033678901",
        allergies: ["Nevirapine"], chronicConditions: ["HIV (on ART)", "Hypertension"],
      },
    }),
    prisma.patient.upsert({
      where: { nhisNumber: "NHIS-008-2024" },
      update: {},
      create: {
        firstName: "Tobechukwu", lastName: "Okafor", dateOfBirth: new Date("2005-01-08"),
        gender: "MALE", bloodGroup: "O_POSITIVE", genotype: "SS",
        phone: "+2348055789012", address: "11 Airport Road, Benin City",
        state: "Edo", nhisNumber: "NHIS-008-2024",
        emergencyContactName: "Patience Okafor", emergencyContactPhone: "+2348044789012",
        allergies: [], chronicConditions: ["Sickle Cell Disease (HbSS)"],
      },
    }),
    prisma.patient.upsert({
      where: { nhisNumber: "NHIS-009-2024" },
      update: {},
      create: {
        firstName: "Funmilayo", lastName: "Adeyemi", dateOfBirth: new Date("1995-12-03"),
        gender: "FEMALE", bloodGroup: "A_POSITIVE", genotype: "AA",
        phone: "+2348066890123", address: "6 Oke-Bola Rd, Abeokuta",
        state: "Ogun", nhisNumber: "NHIS-009-2024",
        emergencyContactName: "Rotimi Adeyemi", emergencyContactPhone: "+2348055890123",
        allergies: ["Latex"], chronicConditions: ["Gestational Hypertension"],
      },
    }),
    prisma.patient.upsert({
      where: { nhisNumber: "NHIS-010-2024" },
      update: {},
      create: {
        firstName: "Chukwuemeka", lastName: "Nwosu", dateOfBirth: new Date("1982-07-19"),
        gender: "MALE", bloodGroup: "O_POSITIVE", genotype: "AC",
        phone: "+2348011901234", address: "34 Zik Ave, Awka, Anambra",
        state: "Anambra", nhisNumber: "NHIS-010-2024",
        emergencyContactName: "Obiageli Nwosu", emergencyContactPhone: "+2348000901234",
        allergies: ["Metronidazole"], chronicConditions: ["Peptic Ulcer Disease"],
      },
    }),
  ]);

  const [ada, ibrahim, fatima, bode, chidinma, ngozi, seun, tobe, funmi, nwosu] = patients;
  const doctorId = adeyemi.id;
  const cardiologistId = okafor.id;

  // ── Medical Records ───────────────────────────────────────────────────────────
  const records = [
    // Adaeze — Hypertension + Diabetes follow-ups
    { patientId: ada.id, doctorId, visitDate: daysAgo(90),
      chiefComplaint: "Routine hypertension check", history: "Known hypertensive for 10 years. On Amlodipine + Metformin for T2DM. Compliance good.",
      examination: "BP: 148/92 mmHg. BMI 29. No pedal oedema. Heart sounds normal.",
      diagnosis: "Hypertension, uncontrolled. Type 2 Diabetes — HbA1c 7.8%.",
      treatment: "Increase Amlodipine to 10mg. Continue Metformin 500mg BD. Lifestyle counselling.",
      prescription: [{ medication: "Amlodipine", dosage: "10mg", frequency: "Once daily", duration: "90 days" }, { medication: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "90 days" }],
      vitalSigns: { bloodPressureSystolic: 148, bloodPressureDiastolic: 92, heartRate: 82, temperature: 36.7, oxygenSaturation: 97 }, status: "RESOLVED" },

    { patientId: ada.id, doctorId, visitDate: daysAgo(30),
      chiefComplaint: "Dizziness and blurred vision", history: "BP has been erratic. Not sleeping well. Stress at work.",
      examination: "BP: 168/104 mmHg. Fundi: grade 2 hypertensive retinopathy. Alert.",
      diagnosis: "Hypertensive urgency. Suspected early retinopathy.",
      treatment: "Oral Labetalol stat. Ophthalmology referral. Increase clinic follow-up to monthly.",
      prescription: [{ medication: "Labetalol", dosage: "200mg", frequency: "Twice daily", duration: "30 days" }, { medication: "Aspirin", dosage: "75mg", frequency: "Once daily", duration: "Long-term" }],
      vitalSigns: { bloodPressureSystolic: 168, bloodPressureDiastolic: 104, heartRate: 90, temperature: 36.9, oxygenSaturation: 96 }, status: "ACTIVE" },

    // Ibrahim — Diabetic management
    { patientId: ibrahim.id, doctorId, visitDate: daysAgo(60),
      chiefComplaint: "Tingling and numbness in both feet", history: "T2DM x 15 years. Poorly controlled. HbA1c 10.2% last visit.",
      examination: "Reduced vibration sense bilaterally. Monofilament test: loss of protective sensation. BP 138/88.",
      diagnosis: "Diabetic peripheral neuropathy. Poorly controlled T2DM.",
      treatment: "Intensify insulin regimen. Start Pregabalin 75mg BD. Podiatry referral. Foot care education.",
      prescription: [{ medication: "Insulin glargine", dosage: "20 units", frequency: "Nightly", duration: "90 days" }, { medication: "Pregabalin", dosage: "75mg", frequency: "Twice daily", duration: "90 days" }],
      vitalSigns: { bloodPressureSystolic: 138, bloodPressureDiastolic: 88, heartRate: 76, temperature: 36.5, oxygenSaturation: 98 }, status: "ACTIVE" },

    // Fatima — Malaria + Anaemia
    { patientId: fatima.id, doctorId, visitDate: daysAgo(14),
      chiefComplaint: "Fever, chills, and severe weakness for 4 days", history: "No recent travel outside Kano. No prior malaria this year.",
      examination: "Temp 38.8°C. Pallor +++. Splenomegaly (mild). RDT: Plasmodium falciparum positive.",
      diagnosis: "Severe malaria with anaemia (Hb 7.2 g/dL).",
      treatment: "Artemether-Lumefantrine (AL) 6-dose regimen. Ferrous sulphate supplementation. IV fluids.",
      prescription: [{ medication: "Artemether-Lumefantrine", dosage: "80/480mg", frequency: "Twice daily", duration: "3 days" }, { medication: "Ferrous Sulphate", dosage: "200mg", frequency: "Once daily", duration: "60 days" }],
      vitalSigns: { bloodPressureSystolic: 102, bloodPressureDiastolic: 68, heartRate: 104, temperature: 38.8, oxygenSaturation: 95 }, status: "RESOLVED" },

    // Bode — Asthma
    { patientId: bode.id, doctorId, visitDate: daysAgo(21),
      chiefComplaint: "Wheeze and shortness of breath — worse at night", history: "Known asthmatic since childhood. Triggered by dust and exercise. On Salbutamol PRN.",
      examination: "Bilateral expiratory wheeze. PEFR: 55% predicted. SpO2 93% on air.",
      diagnosis: "Moderate acute asthma exacerbation.",
      treatment: "Nebulised Salbutamol + Ipratropium. IV Hydrocortisone. Start Seretide 25/250 inhaler.",
      prescription: [{ medication: "Salbutamol", dosage: "2.5mg nebulised", frequency: "Every 4 hours", duration: "3 days" }, { medication: "Fluticasone/Salmeterol (Seretide)", dosage: "25/250mcg", frequency: "Twice daily", duration: "90 days" }],
      vitalSigns: { bloodPressureSystolic: 122, bloodPressureDiastolic: 78, heartRate: 98, temperature: 37.1, oxygenSaturation: 93 }, status: "RESOLVED" },

    // Chidinma — Hypertension follow-up
    { patientId: chidinma.id, doctorId, visitDate: daysAgo(45),
      chiefComplaint: "Headache and palpitations", history: "Known hypertensive. BMI 34. On Hydrochlorothiazide.",
      examination: "BP: 162/98 mmHg. Obese. No focal neurological signs.",
      diagnosis: "Stage 2 Hypertension, uncontrolled. Obesity.",
      treatment: "Add Perindopril 5mg. Dietician referral. Target weight loss 5kg/month.",
      prescription: [{ medication: "Perindopril", dosage: "5mg", frequency: "Once daily", duration: "90 days" }, { medication: "Hydrochlorothiazide", dosage: "25mg", frequency: "Once daily", duration: "90 days" }],
      vitalSigns: { bloodPressureSystolic: 162, bloodPressureDiastolic: 98, heartRate: 88, temperature: 36.8, oxygenSaturation: 97 }, status: "ACTIVE" },

    // Ngozi — Sickle cell crisis
    { patientId: ngozi.id, doctorId, visitDate: daysAgo(7),
      chiefComplaint: "Severe bone pain — arms, legs, and back", history: "HbSS. 3 crises in the past year. Last hydroxyurea dose 2 weeks ago.",
      examination: "Pallor +++. Icteric sclera. Tenderness over long bones. Spleen not palpable.",
      diagnosis: "Acute vaso-occlusive crisis. Sickle cell disease.",
      treatment: "IV morphine PCA. High-flow O2. IV fluids. Continue hydroxyurea.",
      prescription: [{ medication: "Morphine", dosage: "0.1mg/kg IV", frequency: "PRN (PCA)", duration: "Inpatient" }, { medication: "Hydroxyurea", dosage: "500mg", frequency: "Once daily", duration: "Long-term" }, { medication: "Folic acid", dosage: "5mg", frequency: "Once daily", duration: "Long-term" }],
      vitalSigns: { bloodPressureSystolic: 110, bloodPressureDiastolic: 72, heartRate: 112, temperature: 37.4, oxygenSaturation: 91 }, status: "ACTIVE" },

    // Seun — HIV ART management
    { patientId: seun.id, doctorId, visitDate: daysAgo(35),
      chiefComplaint: "Routine HIV follow-up and ART review", history: "HIV positive, on TDF/3TC/EFV since 2018. Viral load undetectable last year. Tolerating well.",
      examination: "BP 136/84. Weight 72kg (stable). No oral candidiasis. Lymph nodes not enlarged.",
      diagnosis: "HIV on ART — virologically suppressed. Hypertension (mild).",
      treatment: "Continue current ART regimen. Start Amlodipine 5mg for BP. CD4 count + viral load request.",
      prescription: [{ medication: "TDF/3TC/EFV", dosage: "300/300/600mg", frequency: "Once nightly", duration: "90 days" }, { medication: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "90 days" }],
      vitalSigns: { bloodPressureSystolic: 136, bloodPressureDiastolic: 84, heartRate: 72, temperature: 36.6, oxygenSaturation: 99 }, status: "ACTIVE" },

    // Tobe — Sickle cell paediatric
    { patientId: tobe.id, doctorId, visitDate: daysAgo(12),
      chiefComplaint: "Severe abdominal pain and fever", history: "19yo M, HbSS. History of acute chest syndrome last year. Currently on hydroxyurea.",
      examination: "Fever 38.4°C. Abdominal guarding (RUQ). Jaundice present. SpO2 94%.",
      diagnosis: "Acute chest syndrome vs hepatic sequestration. Sickle cell crisis.",
      treatment: "Admit for observation. IV antibiotics (Ceftriaxone). Exchange transfusion considered. O2 therapy.",
      prescription: [{ medication: "Ceftriaxone", dosage: "2g IV", frequency: "Once daily", duration: "7 days" }, { medication: "Hydroxyurea", dosage: "1000mg", frequency: "Once daily", duration: "Long-term" }],
      vitalSigns: { bloodPressureSystolic: 108, bloodPressureDiastolic: 70, heartRate: 118, temperature: 38.4, oxygenSaturation: 94 }, status: "ACTIVE" },

    // Funmi — Gestational hypertension
    { patientId: funmi.id, doctorId, visitDate: daysAgo(5),
      chiefComplaint: "High BP reading at home — 160/110 self-measured", history: "28 weeks pregnant. G2P1. Previous pregnancy uncomplicated. BP borderline for last 2 weeks.",
      examination: "BP: 158/106 mmHg (confirmed x2). Urine dip: 1+ protein. Oedema ++ bilaterally.",
      diagnosis: "Pre-eclampsia (mild to moderate). 28 weeks gestation.",
      treatment: "Hospital admission for monitoring. Start Methyldopa 250mg TDS. Magnesium sulphate prophylaxis. Obstetrics referral.",
      prescription: [{ medication: "Methyldopa", dosage: "250mg", frequency: "Three times daily", duration: "Until delivery" }, { medication: "Magnesium Sulphate", dosage: "4g IV loading", frequency: "Then 1g/hr infusion", duration: "Inpatient" }],
      vitalSigns: { bloodPressureSystolic: 158, bloodPressureDiastolic: 106, heartRate: 94, temperature: 37.0, oxygenSaturation: 98 }, status: "ACTIVE" },

    // Nwosu — Peptic ulcer
    { patientId: nwosu.id, doctorId, visitDate: daysAgo(20),
      chiefComplaint: "Epigastric pain worse on empty stomach, coffee-ground vomit x1", history: "H. pylori positive 6 months ago. Did not complete eradication therapy.",
      examination: "Epigastric tenderness on deep palpation. No rigidity. PR: melaena noted.",
      diagnosis: "Peptic ulcer disease with upper GI bleed (Hb 10.1g/dL).",
      treatment: "IV Omeprazole infusion. H. pylori triple therapy. Endoscopy referral.",
      prescription: [{ medication: "Omeprazole", dosage: "40mg IV", frequency: "Twice daily", duration: "3 days then 20mg oral" }, { medication: "Amoxicillin", dosage: "1g", frequency: "Twice daily", duration: "7 days" }, { medication: "Clarithromycin", dosage: "500mg", frequency: "Twice daily", duration: "7 days" }],
      vitalSigns: { bloodPressureSystolic: 118, bloodPressureDiastolic: 74, heartRate: 86, temperature: 36.9, oxygenSaturation: 98 }, status: "RESOLVED" },

    // Ada recent follow-up (today-ish)
    { patientId: ada.id, doctorId, visitDate: daysAgo(2),
      chiefComplaint: "Monthly BP and diabetes review", history: "BP improved on adjusted medications. Glucose diary shows fasting 5.8–7.2 mmol/L.",
      examination: "BP: 132/82 mmHg. Weight 74kg. Pedal pulses present. Fundoscopy: no progression.",
      diagnosis: "Hypertension — controlled. Type 2 Diabetes — improving.",
      treatment: "Continue current medications. Repeat HbA1c in 3 months. QRISK review.",
      prescription: [{ medication: "Amlodipine", dosage: "10mg", frequency: "Once daily", duration: "90 days" }, { medication: "Metformin", dosage: "1g", frequency: "Twice daily", duration: "90 days" }],
      vitalSigns: { bloodPressureSystolic: 132, bloodPressureDiastolic: 82, heartRate: 74, temperature: 36.6, oxygenSaturation: 99 }, status: "ACTIVE" },
  ];

  for (const r of records) {
    await prisma.medicalRecord.create({ data: { ...r, prescription: r.prescription, vitalSigns: r.vitalSigns, labResults: [] } as never });
  }

  // ── Appointments ──────────────────────────────────────────────────────────────
  const appointments = [
    // Today's schedule
    { patientId: ada.id,     doctorId, scheduledAt: todayAt(9, 0),  duration: 30, status: "COMPLETED", reason: "BP & diabetes monthly review" },
    { patientId: ibrahim.id, doctorId, scheduledAt: todayAt(9, 30), duration: 30, status: "COMPLETED", reason: "Diabetic neuropathy follow-up" },
    { patientId: fatima.id,  doctorId, scheduledAt: todayAt(10, 0), duration: 20, status: "SCHEDULED", reason: "Post-malaria anaemia check" },
    { patientId: bode.id,    doctorId, scheduledAt: todayAt(10, 30),duration: 30, status: "SCHEDULED", reason: "Asthma control assessment" },
    { patientId: seun.id,    doctorId, scheduledAt: todayAt(11, 0), duration: 30, status: "SCHEDULED", reason: "HIV ART review + CD4 results" },
    { patientId: funmi.id,   doctorId, scheduledAt: todayAt(11, 45),duration: 45, status: "SCHEDULED", reason: "Pre-eclampsia monitoring" },
    { patientId: ngozi.id,   doctorId, scheduledAt: todayAt(14, 0), duration: 30, status: "SCHEDULED", reason: "Post-crisis follow-up" },
    { patientId: chidinma.id,doctorId, scheduledAt: todayAt(14, 30),duration: 30, status: "SCHEDULED", reason: "Hypertension + weight review" },
    // Upcoming
    { patientId: tobe.id,    doctorId, scheduledAt: daysFromNow(1), duration: 30, status: "SCHEDULED", reason: "Sickle cell — discharge review" },
    { patientId: nwosu.id,   doctorId, scheduledAt: daysFromNow(2), duration: 30, status: "SCHEDULED", reason: "PUD — endoscopy results review" },
    { patientId: ada.id,     doctorId, scheduledAt: daysFromNow(7), duration: 30, status: "SCHEDULED", reason: "HbA1c results + QRISK discussion" },
    { patientId: ibrahim.id, doctorId, scheduledAt: daysFromNow(14),duration: 45, status: "SCHEDULED", reason: "Diabetic foot clinic" },
    // Cardiology (okafor)
    { patientId: chidinma.id, doctorId: cardiologistId, scheduledAt: daysFromNow(5),  duration: 45, status: "SCHEDULED", reason: "Echocardiogram review" },
    { patientId: ada.id,      doctorId: cardiologistId, scheduledAt: daysFromNow(10), duration: 45, status: "SCHEDULED", reason: "Cardiovascular risk assessment" },
    // Past cancelled / no-shows
    { patientId: bode.id,    doctorId, scheduledAt: daysAgo(10), duration: 30, status: "NO_SHOW",  reason: "Asthma review" },
    { patientId: nwosu.id,   doctorId, scheduledAt: daysAgo(30), duration: 30, status: "CANCELLED", reason: "Routine check — patient cancelled" },
  ];

  for (const a of appointments) {
    await prisma.appointment.create({ data: a as never });
  }

  console.log("Seed complete.");
  console.log(`  Doctors  : ${adeyemi.email} / DocTalk@2024!`);
  console.log(`             ${chikwex.email}  / Chikwex@2024!`);
  console.log(`             ${okafor.email}  / DocTalk@2024!`);
  console.log(`  Patients : 10 seeded with records and appointments`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
