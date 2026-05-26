"use client";

import { useState, useCallback } from "react";
import { clsx } from "clsx";

interface UploadedFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
}

interface FileUploadProps {
  recordId: string;
  onUploaded?: (files: UploadedFile[]) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({ recordId, onUploaded }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: FileList) => {
      setError(null);
      setUploading(true);
      try {
        const formData = new FormData();
        Array.from(files).forEach((f) => formData.append("files", f));

        const token = sessionStorage.getItem("doctalk-access-token");
        const res = await fetch(`${API}/api/v1/attachments/records/${recordId}`, {
          method: "POST",
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Upload failed");
        }

        const { data } = await res.json();
        setUploaded((prev) => [...prev, ...data]);
        onUploaded?.(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [recordId, onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const handleDelete = async (id: string) => {
    const token = sessionStorage.getItem("doctalk-access-token");
    await fetch(`${API}/api/v1/attachments/${id}`, {
      method: "DELETE",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    setUploaded((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <label
        className={clsx(
          "flex flex-col items-center justify-center border-2 border-dashed rounded-apple-lg px-6 py-8 cursor-pointer transition-all",
          dragging
            ? "border-[var(--blue)] bg-blue-50 dark:bg-blue-900/20"
            : "border-[var(--separator)] hover:border-[var(--blue)] hover:bg-[var(--bg-secondary)]"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="sr-only"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        <span className="text-3xl mb-2">📎</span>
        <p className="text-[15px] font-medium text-[var(--label-primary)]">
          {uploading ? "Uploading…" : "Drop files here or click to browse"}
        </p>
        <p className="text-[13px] text-[var(--label-secondary)] mt-1">
          Images, PDFs, Word documents · Max 20 MB per file
        </p>
      </label>

      {error && (
        <p className="text-[13px] text-[var(--red)] px-1">{error}</p>
      )}

      {/* Uploaded file list */}
      {uploaded.length > 0 && (
        <div className="list-group">
          {uploaded.map((f) => (
            <div key={f.id} className="list-group-item justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl flex-shrink-0">
                  {f.mimeType.startsWith("image/") ? "🖼️" : f.mimeType === "application/pdf" ? "📄" : "📝"}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-[var(--label-primary)] truncate">{f.name}</p>
                  <p className="text-[12px] text-[var(--label-secondary)]">{formatBytes(f.sizeBytes)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`${API}/api/v1/attachments/${f.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--blue)] text-[13px] font-medium"
                >
                  View
                </a>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="text-[var(--red)] text-[13px] font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
