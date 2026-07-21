"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useExperience } from "./store";

/**
 * Scroll moves the camera along a hand-authored spline; the mouse adds
 * a parallax offset so the room feels aware of the visitor.
 *
 * Sector 01 journey: arrive far out in the void → drift toward the
 * reactor → swing around it → pierce the particle torus → stop at
 * the sealed gate (where Sector 02 will begin).
 */
export function CameraRig() {
  const path = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0, 1.4, 15),
          new THREE.Vector3(0.4, 0.8, 9.5),
          new THREE.Vector3(2.4, 0.3, 5.4),
          new THREE.Vector3(-1.6, 0.5, 3.4),
          new THREE.Vector3(0, 0.15, 1.6),
        ],
        false,
        "catmullrom",
        0.4
      ),
    []
  );

  const smooth = useRef({ progress: 0, mx: 0, my: 0 });
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, delta) => {
    const { progress, mouse } = useExperience.getState();
    const s = smooth.current;

    // Critically-damped-ish smoothing, frame-rate independent.
    const k = 1 - Math.exp(-4.5 * delta);
    s.progress += (progress - s.progress) * k;
    s.mx += (mouse.x - s.mx) * k;
    s.my += (mouse.y - s.my) * k;

    path.getPointAt(THREE.MathUtils.clamp(s.progress, 0, 1), pos);

    // Mouse parallax — stronger sideways than vertical.
    pos.x += s.mx * 0.35;
    pos.y += s.my * -0.2;

    // Surfacing: at the end of the flight the camera rises and the
    // gaze drops toward the floor, so the gallery slides over a calm,
    // receding frame instead of a face-full of reactor.
    const surface = THREE.MathUtils.smoothstep(s.progress, 0.82, 1);
    pos.y += surface * 1.5;
    pos.z += surface * 0.8;

    camera.position.copy(pos);

    // Gaze: the reactor core, drifting slightly with the mouse.
    look.set(s.mx * 0.6, s.my * -0.35 - surface * 1.1, 0);
    camera.lookAt(look);
  });

  return null;
}
