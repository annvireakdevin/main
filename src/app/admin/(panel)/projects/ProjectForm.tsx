"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createProject, deleteProject, updateProject } from "../../actions";
import {
  CATEGORIES,
  GRID_SIZES,
  ART_VARIANTS,
  type ProjectInput,
} from "@/lib/validations";

export type MediaOption = {
  id: string;
  kind: string;
  url: string;
  alt: string | null;
  publicId: string;
};

type Props = {
  project?: (ProjectInput & { id: string }) | null;
  media: MediaOption[];
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function ProjectForm({ project, media }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!project);

  const [form, setForm] = useState<ProjectInput>({
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    summary: project?.summary ?? "",
    meta: project?.meta ?? "",
    href: project?.href ?? "",
    category: project?.category ?? "PROJECT",
    status: project?.status ?? "DRAFT",
    gridSize: project?.gridSize ?? "SMALL",
    artVariant: project?.artVariant ?? "TYPE",
    artText: project?.artText ?? "",
    thumbnailId: project?.thumbnailId ?? "",
    galleryIds: project?.galleryIds ?? [],
  });

  const set = <K extends keyof ProjectInput>(k: K, v: ProjectInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const images = useMemo(() => media.filter((m) => m.kind === "IMAGE"), [media]);

  function save() {
    setError(null);
    startTransition(async () => {
      const res = project
        ? await updateProject(project.id, form)
        : await createProject(form);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  // Keyboard: ⌘S save, Esc back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      } else if (e.key === "Escape") {
        router.push("/admin");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, project]);

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-lg font-medium text-snow">
          {project ? "Edit project" : "New project"}
        </h1>
        <p className="sys-tag">⌘S save · Esc back</p>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className="sys-tag mb-2 block">Title</label>
          <input
            className="field"
            autoFocus
            value={form.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="sys-tag mb-2 block">Slug</label>
            <input
              className="field font-mono text-xs"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
            />
          </div>
          <div>
            <label className="sys-tag mb-2 block">Caption (meta)</label>
            <input
              className="field"
              placeholder="SIEM · daily driver"
              value={form.meta}
              onChange={(e) => set("meta", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="sys-tag mb-2 block">Summary</label>
          <textarea
            className="field min-h-24 resize-y"
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
          />
        </div>

        <div>
          <label className="sys-tag mb-2 block">Link (GitHub / demo)</label>
          <input
            className="field font-mono text-xs"
            placeholder="https://…"
            value={form.href}
            onChange={(e) => set("href", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="sys-tag mb-2 block">Category</label>
            <select
              className="field"
              value={form.category}
              onChange={(e) =>
                set("category", e.target.value as ProjectInput["category"])
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="sys-tag mb-2 block">Grid size</label>
            <select
              className="field"
              value={form.gridSize}
              onChange={(e) =>
                set("gridSize", e.target.value as ProjectInput["gridSize"])
              }
            >
              {GRID_SIZES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="sys-tag mb-2 block">Cover art</label>
            <select
              className="field"
              value={form.artVariant}
              onChange={(e) =>
                set("artVariant", e.target.value as ProjectInput["artVariant"])
              }
            >
              {ART_VARIANTS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="sys-tag mb-2 block">Art text</label>
            <input
              className="field font-mono text-xs"
              placeholder="qradar"
              value={form.artText}
              onChange={(e) => set("artText", e.target.value)}
            />
          </div>
        </div>

        {/* Thumbnail picker */}
        <div>
          <label className="sys-tag mb-2 block">
            Thumbnail (overrides cover art)
          </label>
          {images.length === 0 ? (
            <p className="text-xs text-dim">
              No images yet — upload some in the Media library.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              <button
                type="button"
                onClick={() => set("thumbnailId", "")}
                className={`flex aspect-square items-center justify-center rounded-md border text-xs ${
                  !form.thumbnailId
                    ? "border-pulse text-pulse"
                    : "border-line text-dim hover:border-line-strong"
                }`}
              >
                None
              </button>
              {images.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => set("thumbnailId", m.id)}
                  className={`relative aspect-square overflow-hidden rounded-md border ${
                    form.thumbnailId === m.id
                      ? "border-pulse ring-1 ring-pulse"
                      : "border-line hover:border-line-strong"
                  }`}
                  title={m.publicId}
                >
                  <Image
                    src={m.url}
                    alt={m.alt ?? ""}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gallery picker */}
        <div>
          <label className="sys-tag mb-2 block">
            Gallery (images · videos · PDFs)
          </label>
          {media.length === 0 ? (
            <p className="text-xs text-dim">Media library is empty.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {media.map((m) => {
                const selected = form.galleryIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      set(
                        "galleryIds",
                        selected
                          ? form.galleryIds.filter((id) => id !== m.id)
                          : [...form.galleryIds, m.id]
                      )
                    }
                    className={`relative aspect-square overflow-hidden rounded-md border ${
                      selected
                        ? "border-pulse ring-1 ring-pulse"
                        : "border-line hover:border-line-strong"
                    }`}
                    title={m.publicId}
                  >
                    {m.kind === "IMAGE" ? (
                      <Image
                        src={m.url}
                        alt={m.alt ?? ""}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center font-mono text-[10px] text-fog">
                        {m.kind}
                      </span>
                    )}
                    {selected && (
                      <span className="absolute top-1 right-1 rounded-full bg-pulse px-1.5 font-mono text-[10px] text-white">
                        {form.galleryIds.indexOf(m.id) + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Status + actions */}
        <div className="mt-4 flex items-center gap-3 border-t border-line pt-6">
          <select
            className="field !w-40"
            value={form.status}
            onChange={(e) =>
              set("status", e.target.value as ProjectInput["status"])
            }
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <button onClick={save} disabled={pending} className="btn btn-primary">
            {pending ? "Saving…" : "Save"}
          </button>
          <button onClick={() => router.push("/admin")} className="btn">
            Cancel
          </button>
          {project && (
            <button
              className="btn btn-danger ml-auto"
              onClick={() => {
                if (!confirm("Delete this project?")) return;
                startTransition(async () => {
                  await deleteProject(project.id);
                  router.push("/admin");
                  router.refresh();
                });
              }}
            >
              Delete
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-[#e5484d]" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
