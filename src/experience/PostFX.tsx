"use client";

import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { useExperience } from "./store";

/**
 * The cinematic pass: bloom carries all lighting, grain and vignette
 * give it film body, a whisper of chromatic aberration bends the
 * edges. Cheapened automatically on low quality tiers.
 */
export function PostFX() {
  const quality = useExperience((s) => s.quality);
  const isLight = useExperience((s) => s.theme) === "light";

  // Daylight: bloom must not bloom the bright sky — high threshold,
  // gentle intensity, lighter vignette, finer grain.
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={isLight ? 0.35 : quality === 0 ? 0.6 : 0.95}
        luminanceThreshold={isLight ? 0.85 : 0.18}
        luminanceSmoothing={0.7}
        mipmapBlur
      />
      <Noise opacity={isLight ? 0.025 : 0.045} />
      <Vignette
        eskil={false}
        offset={0.18}
        darkness={isLight ? 0.28 : 0.82}
      />
      <ChromaticAberration offset={[0.0006, 0.0004]} />
    </EffectComposer>
  );
}
