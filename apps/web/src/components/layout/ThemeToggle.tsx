"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { clsx } from "clsx";

const OPTIONS = [
  { value: "light" as const, label: "Light", icon: "☀️" },
  { value: "dark"  as const, label: "Dark",  icon: "🌙" },
  { value: "system"as const, label: "Auto",  icon: "⚙️" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex rounded-apple-md bg-[var(--bg-secondary)] p-0.5 border border-[var(--separator)]">
      {OPTIONS.map(({ value, label, icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={clsx(
            "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-[8px] text-[12px] font-medium transition-all duration-150",
            theme === value
              ? "bg-[var(--bg-primary)] text-[var(--label-primary)] shadow-apple-sm"
              : "text-[var(--label-secondary)] hover:text-[var(--label-primary)]"
          )}
          title={label}
        >
          <span>{icon}</span>
        </button>
      ))}
    </div>
  );
}
