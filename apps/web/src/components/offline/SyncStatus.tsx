"use client";

import { useOfflineSync } from "@/lib/offline/useOfflineSync";
import { clsx } from "clsx";

export function SyncStatus() {
  const { isOnline, pendingCount, isSyncing, lastSynced, sync } = useOfflineSync();

  return (
    <button
      onClick={sync}
      disabled={isSyncing || !isOnline}
      className={clsx(
        "flex items-center gap-2 px-3 py-1.5 rounded-apple-md text-[13px] font-medium transition-all border",
        isOnline
          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
          : "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      )}
      title={lastSynced ? `Last synced ${lastSynced}` : "Never synced"}
    >
      <span className={clsx("w-2 h-2 rounded-full flex-shrink-0", isOnline ? "bg-green-500" : "bg-orange-500", isSyncing && "animate-pulse")} />
      {isSyncing ? "Syncing…" : isOnline ? (pendingCount > 0 ? `${pendingCount} pending` : "Synced") : "Offline"}
    </button>
  );
}
