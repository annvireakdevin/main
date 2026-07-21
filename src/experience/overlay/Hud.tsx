"use client";

import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { useExperience } from "../store";

/**
 * The only persistent DOM: a thin instrument frame around the glass.
 * Progress and sector readouts update imperatively — zero re-renders
 * while scrolling.
 */
/** Day / night switch — persists, and the 3D scene follows. */
function ThemeToggle() {
  const theme = useExperience((s) => s.theme);
  const setTheme = useExperience((s) => s.setTheme);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      className="sys-tag pointer-events-auto cursor-pointer transition-colors hover:!text-pulse"
    >
      Mode ·{" "}
      <span className="text-pulse">{theme === "light" ? "Day" : "Night"}</span>
    </button>
  );
}

export function Hud() {
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  const sector = useExperience((s) => s.sector);

  useEffect(() => {
    return useExperience.subscribe((state) => {
      if (barRef.current)
        barRef.current.style.transform = `scaleX(${state.pageProgress})`;
      if (pctRef.current)
        pctRef.current.textContent = String(
          Math.round(state.pageProgress * 100)
        ).padStart(3, "0");
    });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 select-none">
      {/* Top rail */}
      <div className="absolute inset-x-6 top-6 flex items-center justify-between md:inset-x-10">
        <p className="sys-tag !text-fog">{site.name}</p>
        <div className="flex items-center gap-8">
          <ThemeToggle />
          <p className="sys-tag">
            Sector <span className="text-pulse">{sector}</span>
          </p>
        </div>
      </div>

      {/* Bottom rail */}
      <div className="absolute inset-x-6 bottom-6 md:inset-x-10">
        <div className="mb-3 flex items-center justify-between">
          <a
            href={`mailto:${site.email}`}
            className="sys-tag pointer-events-auto transition-colors hover:!text-pulse"
          >
            {site.email}
          </a>
          <p className="sys-tag tabular-nums">
            <span ref={pctRef}>000</span> / 100
          </p>
        </div>
        <div className="h-px w-full bg-line">
          <div
            ref={barRef}
            className="h-px origin-left bg-pulse"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
}
