import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProjectForm } from "../ProjectForm";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, media] = await Promise.all([
    db.project.findUnique({
      where: { id },
      include: { gallery: { orderBy: { position: "asc" } } },
    }),
    db.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, kind: true, url: true, alt: true, publicId: true },
    }),
  ]);
  if (!project) notFound();

  return (
    <ProjectForm
      media={media}
      project={{
        id: project.id,
        title: project.title,
        slug: project.slug,
        summary: project.summary ?? "",
        meta: project.meta ?? "",
        href: project.href ?? "",
        category: project.category,
        status: project.status,
        gridSize: project.gridSize,
        artVariant: project.artVariant,
        artText: project.artText ?? "",
        thumbnailId: project.thumbnailId ?? "",
        galleryIds: project.gallery.map((g) => g.mediaId),
      }}
    />
  );
}
