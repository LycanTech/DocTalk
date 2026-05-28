"use client";

const SERVICES = [
  { name: "api-gateway",    port: 4000, desc: "JWT • PII mask • audit",      color: "var(--accent)"  },
  { name: "auth-service",   port: 4011, desc: "Login • tokens • refresh",    color: "var(--gold)"    },
  { name: "patients",       port: 4012, desc: "CRUD · raw data",             color: "#60A5FA"        },
  { name: "records",        port: 4013, desc: "Medical records · vitals",    color: "#34D399"        },
  { name: "appointments",   port: 4014, desc: "Scheduling · status",         color: "#A78BFA"        },
  { name: "notifications",  port: 4015, desc: "WebPush · VAPID",            color: "#F472B6"        },
];

export function ArchOverview() {
  return (
    <div>
      <p className="section-label mb-4">Microservices // Architecture</p>

      <div className="card p-4">
        {/* Client → Gateway */}
        <div className="flex items-center gap-2 mb-4">
          <div className="font-mono text-[11px] px-3 py-1.5 rounded border border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-base)]">
            Web (3002)
          </div>
          <div className="flex-1 border-t border-dashed border-[var(--border)]" />
          <div
            className="font-mono text-[11px] px-3 py-1.5 rounded font-bold"
            style={{ background: "var(--accent)20", border: "1px solid var(--accent)", color: "var(--accent)" }}
          >
            api-gateway :4000
          </div>
        </div>

        {/* Gateway → Services */}
        <div className="relative pl-4 ml-[90px]">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--border)]" />
          <div className="space-y-2">
            {SERVICES.slice(1).map(({ name, port, desc, color }) => (
              <div key={name} className="flex items-center gap-3">
                <div className="absolute left-0 w-3 h-px" style={{ background: color }} />
                <div
                  className="font-mono text-[10px] px-2.5 py-1 rounded whitespace-nowrap"
                  style={{ border: `1px solid ${color}40`, color, background: `${color}12` }}
                >
                  {name} :{port}
                </div>
                <span className="font-mono text-[10px] text-[var(--text-muted)]">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DB */}
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-3">
          <div className="font-mono text-[10px] px-2.5 py-1 rounded border border-[var(--border)] text-[var(--text-muted)]">
            PostgreSQL :5432
          </div>
          <div className="font-mono text-[10px] px-2.5 py-1 rounded border border-[var(--border)] text-[var(--text-muted)]">
            CouchDB :5984
          </div>
          <span className="font-mono text-[10px] text-[var(--text-muted)]">— shared data layer</span>
        </div>
      </div>
    </div>
  );
}
