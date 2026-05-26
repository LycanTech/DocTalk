"use client";

import { usePushNotifications } from "@/lib/notifications/usePushNotifications";
import { clsx } from "clsx";

export function NotificationSettings() {
  const { permission, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

  if (permission === "unsupported") return null;

  return (
    <div className="card space-y-4">
      <h2 className="text-[17px] font-semibold text-[var(--label-primary)]">Push Notifications</h2>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[15px] font-medium text-[var(--label-primary)]">Appointment Reminders</p>
          <p className="text-[13px] text-[var(--label-secondary)]">
            Get notified the day before scheduled appointments
          </p>
        </div>
        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isLoading || permission === "denied"}
          className={clsx(
            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50",
            isSubscribed ? "bg-[var(--green)]" : "bg-[var(--separator)]"
          )}
        >
          <span
            className={clsx(
              "inline-block h-5 w-5 transform rounded-full bg-white shadow-apple-sm transition-transform duration-200",
              isSubscribed ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>

      {permission === "denied" && (
        <p className="text-[13px] text-[var(--red)]">
          Notifications are blocked in your browser settings. Please enable them to use this feature.
        </p>
      )}

      {isSubscribed && (
        <p className="text-[13px] text-[var(--label-secondary)]">
          Push notifications are active on this device.
        </p>
      )}
    </div>
  );
}
