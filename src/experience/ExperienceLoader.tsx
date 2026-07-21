"use client";

import dynamic from "next/dynamic";

/**
 * The 3D engine ships only to browsers — never rendered on the
 * server — and code-splits ~all of three.js out of the first byte.
 */
const Experience = dynamic(
  () => import("./Experience").then((m) => m.Experience),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-svh items-center justify-center">
        <p className="sys-tag animate-pulse">Initializing perimeter …</p>
      </div>
    ),
  }
);

import type { PublicProject } from "@/lib/projects";

export function ExperienceLoader({ projects }: { projects: PublicProject[] }) {
  return <Experience projects={projects} />;
}
