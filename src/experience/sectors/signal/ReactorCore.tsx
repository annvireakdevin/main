"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience } from "../../store";

/**
 * The heart of the perimeter: a fresnel-lit sphere breathing inside a
 * slowly counter-rotating wireframe shell, ringed by two thin orbits.
 * All glow is emissive — bloom does the lighting work for free.
 */

const CORE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  uniform float uTime;

  void main() {
    // Subtle surface breathing.
    vec3 p = position * (1.0 + 0.02 * sin(uTime * 0.9 + position.y * 4.0));
    vec4 world = modelMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-(viewMatrix * world).xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const CORE_FRAG = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  uniform float uTime;
  uniform float uLight; // 0 = night watch, 1 = daylight ops

  void main() {
    float fresnel = pow(1.0 - abs(dot(vNormal, vView)), 2.2);
    float pulse = 0.85 + 0.15 * sin(uTime * 1.4);

    // Night: dark body, luminous rim.
    vec3 nightDeep = vec3(0.03, 0.05, 0.10);
    vec3 nightBlue = vec3(0.302, 0.486, 1.0);
    vec3 nightCyan = vec3(0.486, 0.906, 1.0);
    vec3 night = nightDeep + nightBlue * fresnel * 1.6 * pulse
               + nightCyan * pow(fresnel, 4.0);

    // Day: porcelain body, inked-blue rim.
    vec3 dayDeep = vec3(0.90, 0.92, 0.96);
    vec3 dayBlue = vec3(0.16, 0.30, 0.82);
    vec3 dayCyan = vec3(0.02, 0.48, 0.60);
    vec3 day = dayDeep * (1.0 - fresnel * 0.55)
             + dayBlue * fresnel * 1.15 * pulse
             + dayCyan * pow(fresnel, 4.0) * 0.7;

    gl_FragColor = vec4(mix(night, day, uLight), 1.0);
  }
`;

export function ReactorCore() {
  const isLight = useExperience((s) => s.theme) === "light";
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.LineSegments>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);

  const coreUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uLight: { value: 0 } }),
    []
  );
  const shellGeometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.55, 1)),
    []
  );

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    coreUniforms.uTime.value = t;

    const { mouse, theme } = useExperience.getState();
    coreUniforms.uLight.value = THREE.MathUtils.damp(
      coreUniforms.uLight.value,
      theme === "light" ? 1 : 0,
      4,
      delta
    );
    if (group.current) {
      // The whole reactor tilts toward the cursor, gently.
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x, mouse.y * 0.18, 2.5, delta);
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y, mouse.x * 0.28, 2.5, delta);
    }
    if (shell.current) {
      shell.current.rotation.y = t * 0.08;
      shell.current.rotation.z = t * 0.03;
    }
    if (ringA.current) ringA.current.rotation.z = t * 0.15;
    if (ringB.current) ringB.current.rotation.z = -t * 0.11;
  });

  return (
    <group ref={group}>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <shaderMaterial
          vertexShader={CORE_VERT}
          fragmentShader={CORE_FRAG}
          uniforms={coreUniforms}
        />
      </mesh>

      {/* Wireframe containment shell */}
      <lineSegments ref={shell} geometry={shellGeometry}>
        <lineBasicMaterial
          color={isLight ? "#2d4fc4" : "#4d7cff"}
          transparent
          opacity={0.35}
        />
      </lineSegments>

      {/* Orbital rings */}
      <mesh ref={ringA} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.05, 0.008, 8, 128]} />
        <meshBasicMaterial
          color={isLight ? "#2d4fc4" : "#4d7cff"}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 1.8, 0.4, 0]}>
        <torusGeometry args={[2.4, 0.005, 8, 128]} />
        <meshBasicMaterial
          color={isLight ? "#067a96" : "#7ce7ff"}
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
}
