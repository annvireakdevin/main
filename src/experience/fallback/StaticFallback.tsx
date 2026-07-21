import { site } from "@/content/site";
import type { PublicProject } from "@/lib/projects";
import { ArsenalGallery } from "../gallery/ArsenalGallery";

/**
 * Served when WebGL is unavailable or the visitor prefers reduced
 * motion. Quiet, typographic, complete — nobody gets a broken page.
 */
export function StaticFallback({ projects }: { projects?: PublicProject[] }) {
  return (
    <div>
      <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="sys-tag mb-6">
        {site.role} — {site.location}
      </p>
      <h1 className="text-cover font-medium text-snow">{site.name}</h1>
      <p className="mt-8 max-w-xl text-lede text-fog">{site.hero.lede}</p>
      <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
        {site.socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            className="text-sm text-fog underline decoration-line underline-offset-4 transition-colors hover:text-snow"
          >
            {s.label}
          </a>
        ))}
      </div>
      <p className="sys-tag mt-16">
        Full experience requires WebGL &amp; motion enabled
      </p>
      </div>
      <ArsenalGallery projects={projects} />
    </div>
  );
}
