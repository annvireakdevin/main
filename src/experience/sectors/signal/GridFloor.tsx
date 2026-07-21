"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience } from "../../store";

/**
 * The facility floor: a shader-drawn blueprint grid that fades out
 * radially, swept by an expanding scan ring — the v1 scanline motif,
 * translated into 3D.
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uLight; // 0 = night watch, 1 = daylight ops
  varying vec2 vUv;

  float gridLine(vec2 p, float scale) {
    vec2 g = abs(fract(p * scale - 0.5) - 0.5) / fwidth(p * scale);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }

  void main() {
    vec2 centered = vUv - 0.5;
    float dist = length(centered);

    float fine   = gridLine(vUv, 60.0) * 0.10;
    float coarse = gridLine(vUv, 12.0) * 0.22;

    // Expanding scan pulse, reborn every 6 seconds.
    float ring = fract(uTime / 6.0) * 0.75;
    float scan = smoothstep(0.035, 0.0, abs(dist - ring)) * 0.9;

    float mask = smoothstep(0.5, 0.12, dist);
    vec3 blue = mix(vec3(0.302, 0.486, 1.0), vec3(0.14, 0.27, 0.72), uLight);
    vec3 cyan = mix(vec3(0.486, 0.906, 1.0), vec3(0.02, 0.46, 0.58), uLight);

    vec3 color = blue * (fine + coarse) + cyan * scan;
    float alpha = (fine + coarse + scan) * mask;
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

export function GridFloor() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uLight: { value: 0 } }),
    []
  );

  useFrame(({ clock }, delta) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uLight.value = THREE.MathUtils.damp(
      uniforms.uLight.value,
      useExperience.getState().theme === "light" ? 1 : 0,
      4,
      delta
    );
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
      <planeGeometry args={[42, 42]} />
      <shaderMaterial
        ref={material}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
