"use client";

import { useState, useEffect, useCallback } from "react";
import { getPendingRecords, markSynced } from "./db";
import { apiFetch } from "@/lib/api";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);

    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const refreshCount = useCallback(async () => {
    const pending = await getPendingRecords();
    setPendingCount(pending.length);
  }, []);

  useEffect(() => { refreshCount(); }, [refreshCount]);

  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);

    try {
      const pending = await getPendingRecords();
      if (pending.length === 0) return;

      const patients = pending.filter((r) => r.type === "patient").map((r) => ({ id: r._id, ...r.data }));
      const records  = pending.filter((r) => r.type === "medical_record").map((r) => ({ id: r._id, ...r.data }));

      const res = await apiFetch("/api/v1/sync/push", {
        method: "POST",
        body: JSON.stringify({ patients, records }),
      });

      if (res.ok) {
        await markSynced(pending.map((r) => r._id));
        setPendingCount(0);
        setLastSynced(new Date().toLocaleTimeString("en-NG"));
      }
    } catch (err) {
      console.error("Sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) sync();
  }, [isOnline, pendingCount, sync]);

  return { isOnline, pendingCount, isSyncing, lastSynced, sync };
}
