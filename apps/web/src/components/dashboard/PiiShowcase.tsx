"use client";

/**
 * Demonstrates role-based PII masking in action.
 * Shows what each role (ADMIN, DOCTOR, NURSE) sees for the same patient record.
 * For presentation purposes — the masking logic lives in @doctalk/shared/pii.ts
 * and is applied at the API gateway layer before data reaches the client.
 */

import { maskPhone, maskNhis, maskEmail, maskAddress, maskDateOfBirth } from "@doctalk/shared";

const PATIENT = {
  name:        "Adaeze Okonkwo",
  phone:       "+2348012345001",
  nhisNumber:  "NHIS-LG-2024-001",
  email:       "adaeze.okonkwo@gmail.com",
  address:     "14 Adeola Odeku St, Victoria Island, Lagos",
  dateOfBirth: "1985-03-15",
  bloodGroup:  "O_POSITIVE",
  diagnosis:   "Hypertensive urgency, T2DM",
};

const ROLES: { role: "ADMIN" | "DOCTOR" | "NURSE"; label: string; color: string }[] = [
  { role: "ADMIN",  label: "ADMIN",  color: "var(--gold)"   },
  { role: "DOCTOR", label: "DOCTOR", color: "var(--accent)"  },
  { role: "NURSE",  label: "NURSE",  color: "#6B7280" },
];

function maskValue(key: string, value: string, role: "ADMIN" | "DOCTOR" | "NURSE"): string {
  if (role !== "NURSE") return value;
  switch (key) {
    case "phone":       return maskPhone(value);
    case "nhisNumber":  return maskNhis(value);
    case "email":       return maskEmail(value);
    case "address":     return maskAddress(value);
    case "dateOfBirth": return maskDateOfBirth(value);
    default:            return value;
  }
}

const FIELDS: { key: keyof typeof PATIENT; label: string }[] = [
  { key: "name",        label: "Name"        },
  { key: "phone",       label: "Phone"       },
  { key: "nhisNumber",  label: "NHIS No."    },
  { key: "email",       label: "Email"       },
  { key: "address",     label: "Address"     },
  { key: "dateOfBirth", label: "Date of Birth"},
  { key: "bloodGroup",  label: "Blood Group" },
  { key: "diagnosis",   label: "Diagnosis"   },
];

export function PiiShowcase() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <p className="section-label">PII Protection // Role-based Access</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-card)]">
          <p className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
            Same patient · same request · different roles
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-2 font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest w-28">
                  Field
                </th>
                {ROLES.map(({ role, label, color }) => (
                  <th key={role} className="text-left px-4 py-2">
                    <span
                      className="font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded"
                      style={{ color, border: `1px solid ${color}`, background: `${color}18` }}
                    >
                      {label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {FIELDS.map(({ key, label }) => {
                const raw = PATIENT[key];
                return (
                  <tr key={key} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">
                      {label}
                    </td>
                    {ROLES.map(({ role }) => {
                      const val   = maskValue(key, raw, role);
                      const isRaw = val === raw;
                      return (
                        <td key={role} className="px-4 py-2.5 font-mono text-[12px]">
                          <span className={isRaw
                            ? "text-[var(--text-primary)]"
                            : "text-[var(--accent)] line-through decoration-[var(--accent)] decoration-1"
                          }>
                            {isRaw ? val : (
                              <span className="no-underline text-[var(--accent)]" style={{ textDecoration: "none" }}>
                                {val}
                              </span>
                            )}
                          </span>
                          {!isRaw && (
                            <span className="ml-1 text-[10px] text-[var(--text-muted)]">[masked]</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-card)]">
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            Masking applied at the API Gateway · audit log written on every access ·{" "}
            <span className="text-[var(--gold)]">packages/shared/src/pii.ts</span>
          </p>
        </div>
      </div>
    </div>
  );
}
