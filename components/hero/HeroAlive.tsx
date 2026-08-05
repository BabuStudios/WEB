"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import {
  ParticleAtmosphere,
  type ParticleConfig,
} from "./alive/ParticleAtmosphere";
import { SubjectLayer, type HeroMode, type SubjectConfig } from "./alive/SubjectLayer";
import { CursorLight } from "./alive/CursorLight";

/**
 * The only WebGL surface on the page. It is the hero's midground layer:
 * transparent, composited between the background plate and the foreground PNG.
 *
 * drei's <Environment preset="studio" /> is deliberately absent — it streams an
 * HDRI from an external CDN at runtime, and studio lighting is the wrong read
 * for a void. The subject is unlit (meshBasicMaterial), so ambient plus the
 * cursor light is all this scene needs.
 */
export default function HeroAlive({
  mode,
  asset,
  particleConfig,
  subjectConfig,
}: {
  mode: HeroMode;
  asset?: string;
  particleConfig: ParticleConfig;
  subjectConfig?: SubjectConfig;
}) {
  return (
    <Canvas
      className="absolute inset-0"
      style={{ zIndex: 10 }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-label="Hero scene — drifting dust, light flares and a slowly turning instrument"
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <ParticleAtmosphere config={particleConfig} />
        <SubjectLayer mode={mode} asset={asset} config={subjectConfig} />
        <CursorLight />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
