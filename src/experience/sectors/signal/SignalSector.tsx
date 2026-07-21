"use client";

import { ReactorCore } from "./ReactorCore";
import { ParticleField } from "./ParticleField";
import { GridFloor } from "./GridFloor";
import { GlassWord } from "./GlassWord";

/** 01 · SIGNAL — arrival at the perimeter reactor. */
export function SignalSector() {
  return (
    <group>
      <GlassWord />
      <ReactorCore />
      <ParticleField />
      <GridFloor />
    </group>
  );
}
