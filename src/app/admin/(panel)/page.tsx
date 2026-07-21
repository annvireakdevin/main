import { db } from "@/lib/db";
import { ProjectManager } from "./ProjectManager";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await db.project.findMany({
    orderBy: { position: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      status: true,
      gridSize: true,
    },
  });

  return <ProjectManager initial={projects} />;
}
