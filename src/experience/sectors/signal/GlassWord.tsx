"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { Sparkles } from "@react-three/drei";
import { site } from "@/content/site";
import { useExperience } from "../../store";

/**
 * Half the name, cast in glass: "Annvireak" stays crisp flat type in
 * the DOM overlay; "Devin" is extruded, beveled, and floats beneath it
 * between the visitor and the reactor — one lockup, two materials.
 * It dissolves as the camera flies through on descent.
 */

const VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-(viewMatrix * world).xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  uniform float uTime;
  uniform float uLight; // 0 = night watch, 1 = daylight ops
  uniform float uFade;  // dissolves on descent

  void main() {
    float fresnel = pow(1.0 - abs(dot(vNormal, vView)), 1.9);
    float shimmer = 0.9 + 0.1 * sin(uTime * 0.8 + vNormal.x * 3.0);

    // Night: smoked glass, luminous rim.
    vec3 nightBody = vec3(0.05, 0.08, 0.15);
    vec3 night = nightBody
               + vec3(0.302, 0.486, 1.0) * fresnel * 1.5 * shimmer
               + vec3(0.486, 0.906, 1.0) * pow(fresnel, 3.5) * 0.9;

    // Day: frosted glass, inked rim.
    vec3 dayBody = vec3(0.82, 0.87, 0.94);
    vec3 day = dayBody * (1.0 - fresnel * 0.35)
             + vec3(0.18, 0.32, 0.85) * fresnel * 1.1 * shimmer
             + vec3(0.02, 0.48, 0.60) * pow(fresnel, 3.5) * 0.6;

    vec3 color = mix(night, day, uLight);
    float alpha = (0.22 + 0.65 * fresnel) * uFade;
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

export function GlassWord() {
  const group = useRef<THREE.Group>(null);
  const [font, setFont] = useState<Font | null>(null);
  const isLight = useExperience((s) => s.theme) === "light";

  useEffect(() => {
    new FontLoader().load("/fonts/glassword.typeface.json", setFont);
  }, []);

  const geometry = useMemo(() => {
    if (!font) return null;
    const g = new TextGeometry(site.hero3DWord, {
      font,
      size: 1.55,
      depth: 0.55,
      curveSegments: 10,
      bevelEnabled: true,
      bevelThickness: 0.09,
      bevelSize: 0.06,
      bevelSegments: 4,
    });
    g.center();
    return g;
  }, [font]);

  useEffect(() => {
    return () => geometry?.dispose();
  }, [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLight: { value: 0 },
      uFade: { value: 1 },
    }),
    []
  );

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    const { theme, progress, mouse } = useExperience.getState();

    uniforms.uTime.value = t;
    uniforms.uLight.value = THREE.MathUtils.damp(
      uniforms.uLight.value,
      theme === "light" ? 1 : 0,
      4,
      delta
    );
    // Dissolve before the camera reaches the word (word sits at z≈5.5).
    uniforms.uFade.value = 1 - THREE.MathUtils.smoothstep(progress, 0.22, 0.42);

    if (group.current) {
      group.current.position.y = 0.05 + Math.sin(t * 0.6) * 0.09;
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        mouse.x * 0.16 + Math.sin(t * 0.25) * 0.05,
        2.5,
        delta
      );
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        mouse.y * -0.1,
        2.5,
        delta
      );
    }
  });

  if (!geometry) return null;

  return (
    <group ref={group} position={[0, 0.05, 5.5]}>
      <mesh geometry={geometry} renderOrder={2}>
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* The blink: drifting glints around the glass */}
      <Sparkles
        count={26}
        scale={[7.5, 2.6, 1.8]}
        size={4}
        speed={0.35}
        opacity={0.7}
        color={isLight ? "#067a96" : "#7ce7ff"}
      />
    </group>
  );
}
