"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  ParticleAtmosphere,
  type ParticleConfig,
} from "./alive/ParticleAtmosphere";
import { SubjectLayer, type HeroMode, type SubjectConfig } from "./alive/SubjectLayer";
import { CursorLight } from "./alive/CursorLight";
import { useSceneContext } from "@/lib/use-scene-reveal";

/**
 * True while the camera is close enough to the hero for the canvas to be
 * worth rendering. Once the hero has faded out its render loop is pure waste —
 * a full-viewport WebGL surface redrawing 566 sprites every frame, competing
 * with the scroll for the same frame budget.
 */
function useHeroOnScreen() {
  const { track, centre, halfWidth } = useSceneContext();
  const [visible, setVisible] = useState(true);

  useGSAP(
    () => {
      if (!track) return;

      const st = ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          // A little past the fade-out point, so the loop is already running
          // by the time any of it is on screen.
          setVisible(self.progress < centre + halfWidth * 1.2);
        },
      });

      return () => st.kill();
    },
    { dependencies: [track, centre, halfWidth] },
  );

  return visible;
}

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
  const onScreen = useHeroOnScreen();

  return (
    <Canvas
      className="absolute inset-0"
      style={{ zIndex: 10 }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      // Capped at 1.5: the scene is soft sprites and an unlit plane, so a 2x
      // buffer quadruples fragment work for no visible gain. Antialiasing is
      // off for the same reason — there is no hard geometry edge to alias.
      dpr={[1, 1.5]}
      frameloop={onScreen ? "always" : "never"}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
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
