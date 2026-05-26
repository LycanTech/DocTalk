import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database…");

  const passwordHash = await bcrypt.hash("DocTalk@2024!", 12);

  const doctor = await prisma.doctor.upsert({
    where: { email: "dr.adeyemi@doctalk.ng" },
    update: {},
    create: {
      email: "dr.adeyemi@doctalk.ng",
      passwordHash,
      firstName: "Oluwaseun",
      lastName: "Adeyemi",
      specialty: "GENERAL_PRACTICE",
      licenseNumber: "MDCN-12345",
      phone: "+2348012345678",
      hospital: "Lagos University Teaching Hospital",
      state: "Lagos",
      isVerified: true,
    },
  });

  const patient = await prisma.patient.upsert({
    where: { nhisNumber: "NHIS-001-2024" },
    update: {},
    create: {
      firstName: "Chukwuemeka",
      lastName: "Okafor",
      dateOfBirth: new Date("1985-03-15"),
      gender: "MALE",
      bloodGroup: "O_POSITIVE",
      genotype: "AA",
      phone: "+2348098765432",
      address: "12 Eko Atlantic, Victoria Island",
      state: "Lagos",
      emergencyContactName: "Ngozi Okafor",
      emergencyContactPhone: "+2348011111111",
      nhisNumber: "NHIS-001-2024",
      allergies: ["Penicillin"],
      chronicConditions: ["Hypertension"],
    },
  });

  await prisma.medicalRecord.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      visitDate: new Date(),
      chiefComplaint: "Persistent headache and dizziness",
      history: "Patient reports headache for 3 days. History of hypertension.",
      examination: "BP: 160/100 mmHg. Alert and oriented. No focal neurological signs.",
      diagnosis: "Hypertensive urgency",
      treatment: "Adjusted antihypertensive medication. Advised rest and hydration.",
      prescription: [
        { medication: "Amlodipine", dosage: "10mg", frequency: "Once daily", duration: "30 days" },
        { medication: "Hydrochlorothiazide", dosage: "25mg", frequency: "Once daily", duration: "30 days" },
      ],
      vitalSigns: {
        bloodPressureSystolic: 160,
        bloodPressureDiastolic: 100,
        heartRate: 88,
        temperature: 37.1,
        oxygenSaturation: 98,
      },
      status: "ACTIVE",
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Seed complete. Doctor login: dr.adeyemi@doctalk.ng / DocTalk@2024!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
