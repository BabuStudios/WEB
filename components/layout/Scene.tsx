"use client";

import { useMemo, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCameraScenes, SCENE_DEPTH } from "@/lib/use-camera-scenes";
import { SceneRevealContext } from "@/lib/use-scene-reveal";

/**
 * A scene is a fixed station on the Z-track. It fades in as the camera
 * approaches and out as the camera passes.
 *
 * Depth: scenes recede on NEGATIVE z and the camera advances on positive z to
 * meet them. Positive scene depths would place them between the viewer and the
 * perspective plane, so every scene past the first would render magnified and
 * on top of the hero at rest.
 *
 * Distance: the camera travels (sceneCount - 1) depth steps across the full
 * scroll, so a scene's centre sits at progress index/(sceneCount - 1) — not
 * index/sceneCount, which would fade the final scene out before the camera
 * ever arrived at it.
 */
const HALF_WINDOW = 0.6; // in scene-index units, per the fade spec

export function Scene({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const { sceneCount, track } = useCameraScenes();
  const ref = useRef<HTMLElement>(null);

  const steps = Math.max(1, sceneCount - 1);
  const centre = index / steps;
  const halfWidth = HALF_WINDOW / steps;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !track) return;

      const inStart = centre - halfWidth;
      const outEnd = centre + halfWidth;

      gsap.set(el, { opacity: index === 0 ? 1 : 0 });

      // A scrubbed timeline of length 1, so timeline time === track progress.
      // Real tweens rather than a bare onUpdate: a scrub trigger with no
      // animation attached stops updating after the initial refresh.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      if (inStart > 0) {
        tl.fromTo(
          el,
          { opacity: 0 },
          { opacity: 1, ease: "none", duration: halfWidth },
          inStart,
        );
      }
      if (outEnd < 1) {
        tl.to(el, { opacity: 0, ease: "none", duration: halfWidth }, centre);
      }
      tl.set({}, {}, 1); // pin the timeline length to exactly 1

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { dependencies: [index, sceneCount, track, centre, halfWidth] },
  );

  // Content reveals once the scene is roughly half faded in.
  const reveal = useMemo(
    () => ({ track, enterAt: Math.max(0, centre - halfWidth * 0.5) }),
    [track, centre, halfWidth],
  );

  return (
    <SceneRevealContext.Provider value={reveal}>
      <section
        ref={ref}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translateZ(${-index * SCENE_DEPTH}px)`,
          opacity: index === 0 ? 1 : 0,
        }}
        aria-labelledby={`scene-${index}-heading`}
      >
        {children}
      </section>
    </SceneRevealContext.Provider>
  );
}
