"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/guard";
import { cloudinary } from "@/lib/cloudinary";
import {
  projectInputSchema,
  mediaInputSchema,
  type ProjectInput,
  type MediaInput,
} from "@/lib/validations";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function fail(e: unknown): { ok: false; error: string } {
  if (e instanceof Error) {
    if (e.message === "UNAUTHORIZED") return { ok: false, error: "Not signed in." };
    if (e.message.includes("Unique constraint"))
      return { ok: false, error: "That slug is already taken." };
    return { ok: false, error: e.message };
  }
  return { ok: false, error: "Something went wrong." };
}

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin");
}

const nul = (v?: string) => (v && v.length > 0 ? v : null);

// ---------- Projects ----------

export async function createProject(
  input: ProjectInput
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSession();
    const data = projectInputSchema.parse(input);
    const count = await db.project.count();
    const project = await db.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        summary: nul(data.summary),
        meta: nul(data.meta),
        href: nul(data.href),
        category: data.category,
        status: data.status,
        gridSize: data.gridSize,
        artVariant: data.artVariant,
        artText: nul(data.artText),
        thumbnailId: nul(data.thumbnailId),
        position: count,
        gallery: {
          create: data.galleryIds.map((mediaId, i) => ({
            mediaId,
            position: i,
          })),
        },
      },
    });
    revalidate();
    return { ok: true, data: { id: project.id } };
  } catch (e) {
    return fail(e);
  }
}

export async function updateProject(
  id: string,
  input: ProjectInput
): Promise<ActionResult> {
  try {
    await requireSession();
    const data = projectInputSchema.parse(input);
    await db.$transaction([
      db.projectMedia.deleteMany({ where: { projectId: id } }),
      db.project.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          summary: nul(data.summary),
          meta: nul(data.meta),
          href: nul(data.href),
          category: data.category,
          status: data.status,
          gridSize: data.gridSize,
          artVariant: data.artVariant,
          artText: nul(data.artText),
          thumbnailId: nul(data.thumbnailId),
          gallery: {
            create: data.galleryIds.map((mediaId, i) => ({
              mediaId,
              position: i,
            })),
          },
        },
      }),
    ]);
    revalidate();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    await db.project.delete({ where: { id } });
    revalidate();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function setProjectStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED"
): Promise<ActionResult> {
  try {
    await requireSession();
    await db.project.update({ where: { id }, data: { status } });
    revalidate();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Persist a drag-and-drop ordering: ids in their new order. */
export async function reorderProjects(ids: string[]): Promise<ActionResult> {
  try {
    await requireSession();
    if (!Array.isArray(ids) || ids.some((i) => typeof i !== "string"))
      return { ok: false, error: "Bad payload." };
    await db.$transaction(
      ids.map((id, position) =>
        db.project.update({ where: { id }, data: { position } })
      )
    );
    revalidate();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ---------- Media ----------

export async function saveMediaAsset(
  input: MediaInput
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSession();
    const data = mediaInputSchema.parse(input);
    const asset = await db.mediaAsset.upsert({
      where: { publicId: data.publicId },
      update: { alt: nul(data.alt ?? "") },
      create: {
        kind: data.kind,
        publicId: data.publicId,
        url: data.url,
        resourceType: data.resourceType,
        format: nul(data.format),
        bytes: data.bytes,
        width: data.width ?? null,
        height: data.height ?? null,
        alt: nul(data.alt ?? ""),
      },
    });
    revalidatePath("/admin/media");
    return { ok: true, data: { id: asset.id } };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteMediaAsset(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    const asset = await db.mediaAsset.findUnique({ where: { id } });
    if (!asset) return { ok: false, error: "Not found." };
    if (process.env.CLOUDINARY_API_SECRET) {
      await cloudinary.uploader
        .destroy(asset.publicId, { resource_type: asset.resourceType })
        .catch(() => {}); // DB row is the source of truth; tolerate CDN lag
    }
    await db.mediaAsset.delete({ where: { id } });
    revalidate();
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
