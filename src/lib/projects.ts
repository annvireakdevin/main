import { db } from "./db";

/** Serializable shape the public gallery consumes. */
export type PublicProject = {
  id: string;
  title: string;
  meta: string;
  category: string;
  gridSize: "SMALL" | "MEDIUM" | "WIDE" | "TALL" | "HERO";
  artVariant: "TYPE" | "TICKS" | "RING" | "GRID" | "WAVE";
  artText: string;
  href: string;
  thumbnailUrl: string | null;
  thumbnailAlt: string;
};

/**
 * Published projects for the public site. Returns null when the
 * database is unreachable (e.g. at build time) so callers can fall
 * back to the static content in src/content/site.ts.
 */
export async function getPublishedProjects(): Promise<PublicProject[] | null> {
  try {
    const rows = await db.project.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { position: "asc" },
      include: { thumbnail: true },
    });
    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      meta: p.meta ?? "",
      category: p.category.toLowerCase(),
      gridSize: p.gridSize,
      artVariant: p.artVariant,
      artText: p.artText ?? "",
      href: p.href ?? "#",
      thumbnailUrl: p.thumbnail?.url ?? null,
      thumbnailAlt: p.thumbnail?.alt ?? p.title,
    }));
  } catch {
    return null;
  }
}
