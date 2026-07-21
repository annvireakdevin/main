import { create } from "zustand";

/**
 * Single source of truth for the experience.
 * `progress` (0–1) is written by Lenis and read every frame by the
 * camera rig, shaders, and HUD — never through React re-renders.
 */
export type Theme = "light" | "dark";

type ExperienceState = {
  /** Visual theme; light is the default. */
  theme: Theme;
  setTheme: (t: Theme) => void;
  /** Camera progress along the 3D journey, 0–1 (completes at runway end). */
  progress: number;
  /** Scroll progress through the whole document, 0–1 (drives the HUD). */
  pageProgress: number;
  /** Sector readout shown in the HUD. */
  sector: string;
  /** Normalized mouse position, -1..1 on both axes. */
  mouse: { x: number; y: number };
  /** Quality tier set by the performance monitor: 0 low → 2 high. */
  quality: number;
  ready: boolean;
  setProgress: (p: number) => void;
  setPageProgress: (p: number) => void;
  setSector: (s: string) => void;
  setMouse: (x: number, y: number) => void;
  setQuality: (q: number) => void;
  setReady: (r: boolean) => void;
};

export const useExperience = create<ExperienceState>((set) => ({
  theme: "light",
  setTheme: (theme) => set({ theme }),
  progress: 0,
  pageProgress: 0,
  sector: "01 · Signal",
  mouse: { x: 0, y: 0 },
  quality: 2,
  ready: false,
  setProgress: (progress) => set({ progress }),
  setPageProgress: (pageProgress) => set({ pageProgress }),
  setSector: (sector) => set({ sector }),
  setMouse: (x, y) => set({ mouse: { x, y } }),
  setQuality: (quality) => set({ quality }),
  setReady: (ready) => set({ ready }),
}));
