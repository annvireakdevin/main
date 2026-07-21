import { db } from "@/lib/db";
import { ProjectForm } from "../ProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const media = await db.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, kind: true, url: true, alt: true, publicId: true },
  });
  return <ProjectForm media={media} />;
}
