"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/content/site";

/**
 * Arrival titles, choreographed by ScrollTrigger:
 * they hold while the camera is far out, then peel away as you
 * commit to the descent. The DOM speaks only on arrival.
 */
export function SignalOverlay() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-arrival]",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          stagger: 0.14,
          ease: "power3.out",
          delay: 0.4,
        }
      );

      gsap.to(root.current, {
        opacity: 0,
        y: -70,
        ease: "none",
        scrollTrigger: { start: 0, end: () => window.innerHeight * 1.1, scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-0 z-10 flex flex-col items-center justify-center text-center"
    >
      <p data-arrival className="sys-tag mb-6 !text-fog">
        {site.role} — {site.location}
      </p>
      {/* The lockup: "Annvireak" in flat type; "Devin" renders in 3D
          glass in the reserved band below (see GlassWord in the scene). */}
      <h1
        data-arrival
        className="max-w-4xl px-6 text-cover font-medium text-snow"
      >
        Annvireak
        <span className="sr-only"> Devin</span>
      </h1>
      <div aria-hidden className="h-[17vh]" />
      <p data-arrival className="max-w-md px-6 text-sm leading-relaxed text-fog">
        You are inside the perimeter. Scroll to descend.
      </p>
      <div data-arrival className="mt-12 flex items-center gap-4">
        <span className="cue-line" />
        <span className="sys-tag">Begin descent</span>
      </div>
    </div>
  );
}
