"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/content/site";
import type { PublicProject } from "@/lib/projects";
import { useExperience } from "../store";
import { TileArt } from "./TileArt";

/** Tailwind can't build class names at runtime — sizes map statically. */
const SIZE_COL: Record<PublicProject["gridSize"], string> = {
  SMALL: "lg:col-span-4",
  MEDIUM: "lg:col-span-6",
  WIDE: "lg:col-span-8",
  TALL: "lg:col-span-4",
  HERO: "lg:col-span-12",
};

const SIZE_ASPECT: Record<PublicProject["gridSize"], string> = {
  SMALL: "aspect-[16/10]",
  MEDIUM: "aspect-[16/10]",
  WIDE: "aspect-[16/10]",
  TALL: "aspect-[3/4]",
  HERO: "aspect-[16/10] sm:aspect-[21/9]",
};

const LEGACY_SIZE: Record<number, PublicProject["gridSize"]> = {
  4: "SMALL",
  5: "MEDIUM",
  7: "WIDE",
  8: "WIDE",
  12: "HERO",
};

/** Static content from site.ts, shaped like DB rows — the fallback. */
function legacyTiles(): PublicProject[] {
  return site.arsenal.items.map((it) => ({
    id: it.name,
    title: it.name,
    meta: it.meta,
    category: it.kind.toLowerCase(),
    gridSize: LEGACY_SIZE[it.span] ?? "SMALL",
    artVariant: it.art.toUpperCase() as PublicProject["artVariant"],
    artText: it.artText,
    href: it.href,
    thumbnailUrl: null,
    thumbnailAlt: it.name,
  }));
}

/**
 * 02 · ARSENAL — the journey surfaces from the 3D void into an
 * editorial plate gallery. Content comes from the CMS (published
 * projects, in their saved order); falls back to static content
 * when the database is empty or unreachable.
 */
export function ArsenalGallery({ projects }: { projects?: PublicProject[] }) {
  const root = useRef<HTMLElement>(null);

  const tiles = useMemo(
    () => (projects && projects.length > 0 ? projects : legacyTiles()),
    [projects]
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // The 3D world dims as the gallery slides over it.
      const canvas = document.getElementById("experience-canvas");
      if (canvas) {
        gsap.to(canvas, {
          opacity: 0.08,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
            end: "top 5%",
            scrub: true,
          },
        });
      }

      // The whole plate glides up as it enters — continuous motion,
      // scrubbed to the scroll, never a hard landing.
      gsap.fromTo(
        "[data-arsenal-body]",
        { y: 90 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 95%",
            end: "top 15%",
            scrub: true,
          },
        }
      );

      gsap.from("[data-arsenal-head]", {
        opacity: 0,
        y: 40,
        duration: 1.1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 60%" },
      });

      gsap.from("[data-tile]", {
        opacity: 0,
        y: 56,
        duration: 1,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-tiles]", start: "top 80%" },
      });

      // HUD sector readout flips when the gallery owns the viewport.
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 55%",
        end: "bottom bottom",
        onToggle: (self) =>
          useExperience
            .getState()
            .setSector(self.isActive ? "02 · Arsenal" : "01 · Signal"),
      });
    }, root);

    return () => ctx.revert();
  }, [tiles.length]);

  return (
    <section ref={root} id="arsenal" className="relative z-10">
      {/* Surfacing veil — the void rises to meet you; no hard edge */}
      <div
        aria-hidden
        className="pointer-events-none h-[50vh] w-full bg-gradient-to-b from-transparent via-void/70 to-void"
      />

      <div data-arsenal-body className="bg-void px-6 pb-40 md:px-10">
        {/* Hairline entry rule — the scanline motif, at rest */}
        <div className="mx-auto mb-20 h-px max-w-7xl bg-gradient-to-r from-transparent via-line-strong to-transparent" />

        <div className="mx-auto max-w-7xl">
          <p data-arsenal-head className="sys-tag mb-6">
            Sector {site.arsenal.index} · {site.arsenal.title}
          </p>
          <h2
            data-arsenal-head
            className="mb-20 max-w-3xl text-[clamp(2.2rem,5.5vw,4.5rem)] leading-[1.02] font-medium tracking-[-0.03em]"
          >
            {site.arsenal.headline.map((line) => (
              <span
                key={line.text}
                className={
                  line.accent
                    ? "block font-serif italic text-pulse"
                    : "block text-snow"
                }
              >
                {line.text}
              </span>
            ))}
          </h2>

          <div
            data-tiles
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12"
          >
            {tiles.map((tile) => (
              <a
                key={tile.id}
                data-tile
                href={tile.href || "#"}
                target={tile.href?.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className={`group relative block overflow-hidden border border-line bg-raised transition-colors duration-500 hover:border-line-strong sm:col-span-1 ${SIZE_COL[tile.gridSize]}`}
              >
                {/* Hover scanline */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-pulse to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />

                {/* Category chip */}
                <span className="sys-tag absolute top-4 right-4 z-10 rounded-sm bg-pulse-soft px-2 py-1 !text-pulse capitalize">
                  {tile.category}
                </span>

                {/* Cover: uploaded thumbnail, or procedural art */}
                <div className={`relative w-full ${SIZE_ASPECT[tile.gridSize]}`}>
                  {tile.thumbnailUrl ? (
                    <Image
                      src={tile.thumbnailUrl}
                      alt={tile.thumbnailAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <TileArt
                      art={tile.artVariant.toLowerCase()}
                      text={tile.artText || tile.title}
                    />
                  )}
                </div>

                {/* Plate caption */}
                <div className="flex items-baseline justify-between border-t border-line px-5 py-4">
                  <span className="text-sm text-snow transition-colors group-hover:text-pulse">
                    {tile.title}
                  </span>
                  <span className="sys-tag">{tile.meta}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
