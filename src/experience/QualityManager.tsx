"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useExperience } from "./store";

/**
 * Watches real frame-rate and steps render resolution + particle
 * density down (or back up) so the experience stays at 60fps on
 * modest hardware instead of melting it.
 */
export function QualityManager({ children }: { children: React.ReactNode }) {
  const setDpr = useThree((s) => s.setDpr);
  const setQuality = useExperience((s) => s.setQuality);

  return (
    <PerformanceMonitor
      onIncline={() => {
        setDpr(Math.min(2, window.devicePixelRatio));
        setQuality(2);
      }}
      onDecline={() => {
        setDpr(1);
        setQuality(1);
      }}
      onFallback={() => {
        setDpr(0.8);
        setQuality(0);
      }}
    >
      {children}
    </PerformanceMonitor>
  );
}
