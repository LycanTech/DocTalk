import type { Metadata } from "next";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <h1 className="text-[28px] font-bold text-[var(--label-primary)]">Settings</h1>
      <ProfileSettings />
      <NotificationSettings />
    </div>
  );
}
