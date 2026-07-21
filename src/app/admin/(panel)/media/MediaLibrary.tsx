"use client";

import { useCallback, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FileText, Film, Link2, Trash2, UploadCloud } from "lucide-react";
import { deleteMediaAsset, saveMediaAsset } from "../../actions";

type Asset = {
  id: string;
  kind: string;
  url: string;
  publicId: string;
  format: string | null;
  bytes: number;
  alt: string | null;
};

const ACCEPT = "image/*,video/*,application/pdf";

function kindOf(file: File): "IMAGE" | "VIDEO" | "PDF" | null {
  if (file.type.startsWith("image/")) return "IMAGE";
  if (file.type.startsWith("video/")) return "VIDEO";
  if (file.type === "application/pdf") return "PDF";
  return null;
}

function prettyBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

export function MediaLibrary({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const upload = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      for (const file of Array.from(files)) {
        const kind = kindOf(file);
        if (!kind) {
          setError(`Unsupported type: ${file.name}`);
          continue;
        }
        setBusy(`Uploading ${file.name}…`);
        try {
          const signRes = await fetch("/api/media/sign", { method: "POST" });
          if (!signRes.ok) {
            const j = await signRes.json().catch(() => null);
            throw new Error(j?.error ?? "Could not sign upload.");
          }
          const sign = await signRes.json();

          const body = new FormData();
          body.append("file", file);
          body.append("api_key", sign.apiKey);
          body.append("timestamp", String(sign.timestamp));
          body.append("signature", sign.signature);
          body.append("folder", sign.folder);

          const up = await fetch(
            `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`,
            { method: "POST", body }
          );
          if (!up.ok) throw new Error(`Cloudinary rejected ${file.name}.`);
          const result = await up.json();

          const saved = await saveMediaAsset({
            kind,
            publicId: result.public_id,
            url: result.secure_url,
            resourceType: result.resource_type ?? "image",
            format: result.format ?? "",
            bytes: result.bytes ?? 0,
            width: result.width ?? null,
            height: result.height ?? null,
            alt: "",
          });
          if (!saved.ok) throw new Error(saved.error);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Upload failed.");
        }
      }
      setBusy(null);
      router.refresh();
    },
    [router]
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-lg font-medium text-snow">Media library</h1>
        <p className="mt-1 text-xs text-dim">
          Images, videos, and PDFs — stored on Cloudinary
        </p>
      </div>

      {/* Dropzone */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        className={`mb-8 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed py-12 transition-colors ${
          dragging
            ? "border-pulse bg-pulse-soft"
            : "border-line-strong hover:border-pulse"
        }`}
      >
        <UploadCloud className="mb-3 text-fog" size={22} />
        <p className="text-sm text-fog">
          {busy ?? "Drop files here, or click to browse"}
        </p>
        <input
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
      </label>

      {error && (
        <p className="mb-4 text-xs text-[#e5484d]" role="alert">
          {error}
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {assets.map((a) => (
          <div
            key={a.id}
            className="group overflow-hidden rounded-lg border border-line bg-raised"
          >
            <div className="relative aspect-square">
              {a.kind === "IMAGE" ? (
                <Image
                  src={a.url}
                  alt={a.alt ?? a.publicId}
                  fill
                  sizes="(max-width: 768px) 50vw, 220px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-fog">
                  {a.kind === "VIDEO" ? <Film size={22} /> : <FileText size={22} />}
                  <span className="sys-tag">{a.format ?? a.kind}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 border-t border-line px-2 py-1.5">
              <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-dim">
                {a.publicId.split("/").pop()} · {prettyBytes(a.bytes)}
              </span>
              <button
                title="Copy URL"
                className="p-1 text-dim hover:text-pulse"
                onClick={() => {
                  navigator.clipboard.writeText(a.url);
                  setCopied(a.id);
                  setTimeout(() => setCopied(null), 1200);
                }}
              >
                {copied === a.id ? (
                  <span className="font-mono text-[10px] text-pulse">✓</span>
                ) : (
                  <Link2 size={12} />
                )}
              </button>
              <button
                title="Delete"
                className="p-1 text-dim hover:text-[#e5484d]"
                onClick={() => {
                  if (!confirm("Delete this asset? Projects using it will lose it.")) return;
                  startTransition(async () => {
                    const res = await deleteMediaAsset(a.id);
                    if (!res.ok) setError(res.error);
                    router.refresh();
                  });
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {assets.length === 0 && !busy && (
        <p className="mt-12 text-center text-sm text-dim">
          Nothing here yet — drop your first file above.
        </p>
      )}
    </div>
  );
}
