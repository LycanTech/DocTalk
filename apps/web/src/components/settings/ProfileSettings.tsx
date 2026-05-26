"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MedicalSpecialty } from "@doctalk/shared";

export function ProfileSettings() {
  const { doctor, logout } = useAuth();
  if (!doctor) return null;

  return (
    <div className="card space-y-6">
      <h2 className="text-[17px] font-semibold text-[var(--label-primary)]">Profile</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[var(--blue)] flex items-center justify-center text-white text-xl font-bold">
          {doctor.firstName[0]}{doctor.lastName[0]}
        </div>
        <div>
          <p className="text-[17px] font-semibold text-[var(--label-primary)]">
            Dr. {doctor.firstName} {doctor.lastName}
          </p>
          <p className="text-[13px] text-[var(--label-secondary)]">{doctor.email}</p>
          <p className="text-[13px] text-[var(--label-secondary)]">
            {(doctor.specialty as string).replace(/_/g, " ")}
            {doctor.hospital && ` · ${doctor.hospital}`}
          </p>
        </div>
      </div>

      {/* Verification status */}
      <div className="list-group">
        <div className="list-group-item justify-between cursor-default">
          <span className="text-[15px] text-[var(--label-primary)]">Email Verified</span>
          <span className={doctor.isVerified ? "text-[var(--green)]" : "text-[var(--orange)]"}>
            {doctor.isVerified ? "✅" : "Pending"}
          </span>
        </div>
        <div className="list-group-item justify-between cursor-default">
          <span className="text-[15px] text-[var(--label-primary)]">MDCN License</span>
          <span className="text-[var(--label-secondary)] text-[13px]">{doctor.licenseNumber}</span>
        </div>
        <div className="list-group-item justify-between cursor-default">
          <span className="text-[15px] text-[var(--label-primary)]">State</span>
          <span className="text-[var(--label-secondary)] text-[13px]">{doctor.state}</span>
        </div>
      </div>

      {/* Theme */}
      <div>
        <p className="label mb-2">Appearance</p>
        <ThemeToggle />
      </div>

      {/* Sign out */}
      <button onClick={logout} className="btn-danger w-full">Sign Out</button>
    </div>
  );
}
