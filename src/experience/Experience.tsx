"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useExperience } from "./store";
import { CameraRig } from "./CameraRig";
import { QualityManager } from "./QualityManager";
import { PostFX } from "./PostFX";
import { SignalSector } from "./sectors/signal/SignalSector";
import { Hud } from "./overlay/Hud";
import { SignalOverlay } from "./overlay/SignalOverlay";
import { StaticFallback } from "./fallback/StaticFallback";
import { ArsenalGallery } from "./gallery/ArsenalGallery";

/** Journey length. Grows as sectors are added (Phase A: Sector 01 only). */
const JOURNEY_VH = 400;

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

import type { PublicProject } from "@/lib/projects";

export function Experience({ projects }: { projects: PublicProject[] }) {
  const [mode, setMode] = useState<"probing" | "full" | "fallback">("probing");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode(!reduced && supportsWebGL() ? "full" : "fallback");
    // Sync store with the theme the pre-paint script applied.
    useExperience
      .getState()
      .setTheme(
        document.documentElement.dataset.theme === "dark" ? "dark" : "light"
      );
  }, []);

  if (mode === "probing") return <BootScreen />;
  if (mode === "fallback") return <StaticFallback projects={projects} />;
  return <FullExperience projects={projects} />;
}

/** Mono boot line shown before we know what the device can do. */
function BootScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="sys-tag animate-pulse">Initializing perimeter …</p>
    </div>
  );
}

function FullExperience({ projects }: { projects: PublicProject[] }) {
  const spacer = useRef<HTMLDivElement>(null);

  /* Lenis owns scroll; ScrollTrigger and the store are fed from it. */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    const { setProgress, setPageProgress } = useExperience.getState();

    // Camera completes its flight over the runway plus a little more —
    // it keeps drifting while the gallery veil rises, so the handoff
    // never freezes mid-frame.
    const runway = () => (JOURNEY_VH / 100 - 0.4) * window.innerHeight;

    lenis.on("scroll", (e: { scroll: number; progress: number }) => {
      setProgress(Math.min(1, e.scroll / runway()));
      setPageProgress(e.progress);
      ScrollTrigger.update();
    });

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const onPointer = (ev: PointerEvent) => {
      useExperience
        .getState()
        .setMouse(
          (ev.clientX / window.innerWidth) * 2 - 1,
          (ev.clientY / window.innerHeight) * 2 - 1
        );
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointer);
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.destroy();
    };
  }, []);

  return (
    <>
      {/* The glass — one persistent canvas behind everything */}
      <div id="experience-canvas" className="fixed inset-0 z-0">
        <Canvas
          dpr={[1, 2]}
          gl={{
            antialias: false,
            powerPreference: "high-performance",
            alpha: false,
          }}
          camera={{ fov: 50, near: 0.1, far: 60, position: [0, 1.4, 15] }}
        >
          <ThemeAmbience />
          <QualityManager>
            <SignalSector />
            <CameraRig />
            <PostFX />
          </QualityManager>
        </Canvas>
      </div>

      {/* Instrument frame + arrival titles */}
      <Hud />
      <SignalOverlay />

      {/* Scroll runway for the 3D flight */}
      <div ref={spacer} style={{ height: `${JOURNEY_VH}vh` }} aria-hidden />

      {/* 02 · ARSENAL — the journey surfaces into the plate gallery */}
      <ArsenalGallery projects={projects} />

      {/* Semantic content for crawlers & screen readers */}
      <ScreenReaderContent />
    </>
  );
}

const BG_DARK = new THREE.Color("#04060a");
const BG_LIGHT = new THREE.Color("#e9edf2");

/**
 * Cross-fades scene background + fog between night watch and
 * daylight ops. One Color instance feeds both, mutated per frame.
 */
function ThemeAmbience() {
  const scene = useThree((s) => s.scene);
  const bg = useMemo(() => new THREE.Color("#e9edf2"), []);
  const blend = useRef(useExperience.getState().theme === "light" ? 1 : 0);

  useEffect(() => {
    scene.background = bg;
    scene.fog = new THREE.Fog(bg, 10, 34);
  }, [scene, bg]);

  useFrame((_, delta) => {
    const target = useExperience.getState().theme === "light" ? 1 : 0;
    blend.current = THREE.MathUtils.damp(blend.current, target, 4, delta);
    bg.lerpColors(BG_DARK, BG_LIGHT, blend.current);
  });

  return null;
}

function ScreenReaderContent() {
  return (
    <div className="sr-only">
      <h1>Annvireak Devin — Cybersecurity Engineer</h1>
      <p>
        Technology Security officer at Chip Mong Bank, Phnom Penh. SIEM, threat
        hunting, vulnerability management, and AI security platforms.
      </p>
      <a href="mailto:annvireakdevin@gmail.com">Contact</a>
    </div>
  );
}
