"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience } from "../../store";

/**
 * Telemetry made physical: a torus of GPU particles orbiting the
 * reactor. Position, drift, twinkle, and mouse response all run in
 * the vertex shader — the CPU touches nothing per frame but uniforms.
 */

const VERT = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uPixelRatio;

  attribute float aSeed;
  attribute float aRadius;
  attribute float aAngle;
  attribute float aTube;
  attribute float aTubeAngle;

  varying float vGlint;
  varying float vFade;

  void main() {
    // Each particle orbits the core at its own speed; inner rings faster
    // (Keplerian feel), with a slow breathing of the tube radius.
    float angle = aAngle + uTime * (0.05 + 0.12 / aRadius) * (0.6 + aSeed * 0.8);
    float tube  = aTube * (1.0 + 0.14 * sin(uTime * 0.35 + aSeed * 6.2831));

    vec3 p;
    p.x = (aRadius + tube * cos(aTubeAngle + uTime * 0.2 * aSeed)) * cos(angle);
    p.z = (aRadius + tube * cos(aTubeAngle + uTime * 0.2 * aSeed)) * sin(angle);
    p.y = tube * sin(aTubeAngle + uTime * 0.2 * aSeed) * 0.55;

    // The swarm leans away from the cursor — the room notices you.
    p.x += uMouse.x * 0.35 * (1.0 - aSeed);
    p.y -= uMouse.y * 0.25 * (1.0 - aSeed);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float twinkle = 0.65 + 0.35 * sin(uTime * (1.5 + aSeed * 3.0) + aSeed * 40.0);
    gl_PointSize = (2.0 + aSeed * 3.0) * twinkle * uPixelRatio * (5.5 / -mv.z);

    vGlint = step(0.93, aSeed);            // rare cyan messengers
    vFade  = smoothstep(14.0, 3.0, -mv.z); // fade with distance
  }
`;

const FRAG = /* glsl */ `
  varying float vGlint;
  varying float vFade;
  uniform float uLight; // 0 = night watch, 1 = daylight ops

  void main() {
    // Soft round sprite, no texture needed.
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.1, d) * vFade;
    if (alpha < 0.01) discard;

    // Night: luminous blues (additive). Day: inked blues (normal).
    vec3 pulse = mix(vec3(0.302, 0.486, 1.0), vec3(0.13, 0.27, 0.78), uLight);
    vec3 glint = mix(vec3(0.486, 0.906, 1.0), vec3(0.02, 0.45, 0.56), uLight);
    vec3 color = mix(pulse, glint, vGlint);

    gl_FragColor = vec4(color, alpha * 0.85);
  }
`;

const COUNTS = [1800, 3500, 6000]; // by quality tier

export function ParticleField() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const quality = useExperience((s) => s.quality);
  const count = COUNTS[quality];

  const { positions, seeds, radii, angles, tubes, tubeAngles } = useMemo(() => {
    const positions = new Float32Array(count * 3); // required attr, unused
    const seeds = new Float32Array(count);
    const radii = new Float32Array(count);
    const angles = new Float32Array(count);
    const tubes = new Float32Array(count);
    const tubeAngles = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      seeds[i] = Math.random();
      radii[i] = 2.6 + Math.pow(Math.random(), 1.6) * 3.4;
      angles[i] = Math.random() * Math.PI * 2;
      tubes[i] = 0.15 + Math.random() * 1.1;
      tubeAngles[i] = Math.random() * Math.PI * 2;
    }
    return { positions, seeds, radii, angles, tubes, tubeAngles };
  }, [count]);

  const theme = useExperience((s) => s.theme);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uPixelRatio: { value: 1 },
      uLight: { value: 0 },
    }),
    []
  );

  useFrame(({ clock, gl }, delta) => {
    if (!material.current) return;
    const { mouse, theme } = useExperience.getState();
    const u = material.current.uniforms;
    u.uTime.value = clock.elapsedTime;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uLight.value = THREE.MathUtils.damp(
      u.uLight.value,
      theme === "light" ? 1 : 0,
      4,
      delta
    );
    u.uMouse.value.set(
      THREE.MathUtils.lerp(u.uMouse.value.x, mouse.x, 0.06),
      THREE.MathUtils.lerp(u.uMouse.value.y, mouse.y, 0.06)
    );
  });

  return (
    <points key={count} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        <bufferAttribute attach="attributes-aRadius" args={[radii, 1]} />
        <bufferAttribute attach="attributes-aAngle" args={[angles, 1]} />
        <bufferAttribute attach="attributes-aTube" args={[tubes, 1]} />
        <bufferAttribute attach="attributes-aTubeAngle" args={[tubeAngles, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={
          theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending
        }
      />
    </points>
  );
}
