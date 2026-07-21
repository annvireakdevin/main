import { db } from "@/lib/db";
import { MediaLibrary } from "./MediaLibrary";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const assets = await db.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <MediaLibrary
      assets={assets.map((a) => ({
        id: a.id,
        kind: a.kind,
        url: a.url,
        publicId: a.publicId,
        format: a.format,
        bytes: a.bytes,
        alt: a.alt,
      }))}
    />
  );
}
