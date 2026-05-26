import PouchDB from "pouchdb";
import PouchFind from "pouchdb-find";

PouchDB.plugin(PouchFind);

export const localDB = new PouchDB("doctalk_local");

export interface LocalRecord {
  _id: string;
  _rev?: string;
  type: "patient" | "medical_record" | "appointment";
  data: Record<string, unknown>;
  syncStatus: "synced" | "pending" | "error";
  localUpdatedAt: string;
}

export async function savePending(record: Omit<LocalRecord, "_rev">) {
  try {
    const existing = await localDB.get<LocalRecord>(record._id).catch(() => null);
    await localDB.put({
      ...record,
      ...(existing && { _rev: existing._rev }),
    });
  } catch (err) {
    console.error("Local DB save failed", err);
  }
}

export async function getPendingRecords(): Promise<LocalRecord[]> {
  const result = await localDB.find({
    selector: { syncStatus: "pending" },
  });
  return result.docs as LocalRecord[];
}

export async function markSynced(ids: string[]) {
  const docs = await Promise.all(ids.map((id) => localDB.get<LocalRecord>(id).catch(() => null)));
  const updates = docs.filter(Boolean).map((d) => ({ ...d!, syncStatus: "synced" as const }));
  await localDB.bulkDocs(updates);
}
