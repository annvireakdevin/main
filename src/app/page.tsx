import { ExperienceLoader } from "@/experience/ExperienceLoader";
import { getPublishedProjects } from "@/lib/projects";

/** Revalidate every 60s — static-fast, CMS-fresh. */
export const revalidate = 60;

export default async function Home() {
  const projects = await getPublishedProjects();
  return <ExperienceLoader projects={projects ?? []} />;
}
