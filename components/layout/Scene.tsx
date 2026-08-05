"use client";

import { useMemo, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCameraScenes, SCENE_DEPTH } from "@/lib/use-camera-scenes";
import { SceneContext } from "@/lib/use-scene-reveal";

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

/**
 * Half the visible window, in scene-index units. 1.0 makes the fades a true
 * linear crossfade: adjacent windows overlap exactly, the two live scenes'
 * opacities always sum to 1, and no more than two are ever on screen.
 *
 * Do not lower this to save paint. At 0.5 the windows merely abut, so at the
 * midpoint between two stations both scenes sit at opacity 0 and the page cuts
 * to black for a frame. Culling (autoAlpha, below) is what keeps the cost down,
 * not a narrow window.
 *
 * It does set how far past the viewport the plates must extend: at one full
 * depth-step away CSS perspective scales a scene to 1200/2000 = 0.6.
 */
const HALF_WINDOW = 1.0;

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

      // autoAlpha, not opacity: it drops visibility to hidden at zero, which
      // takes the scene's full-bleed plates out of paint and compositing
      // entirely. An opacity-0 scene still rasterises, and with every scene
      // holding oversized plates inside one preserve-3d context that is the
      // single largest cost on the page.
      gsap.set(el, { autoAlpha: index === 0 ? 1 : 0 });

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

      // Windows are clamped to the track, and the guards key off the scene's
      // position in the stack rather than off the clamped numbers. Testing
      // `inStart > 0` would skip the fade-in of any scene whose window opens
      // exactly at progress 0 — which, at a half-window of one full step, is
      // scene 1 — leaving it hidden for the whole page.
      const inFrom = Math.max(0, inStart);
      const inDuration = centre - inFrom;
      if (index > 0 && inDuration > 0) {
        tl.fromTo(
          el,
          { autoAlpha: 0 },
          { autoAlpha: 1, ease: "none", duration: inDuration },
          inFrom,
        );
      }

      const outDuration = Math.min(1, outEnd) - centre;
      if (index < sceneCount - 1 && outDuration > 0) {
        tl.to(el, { autoAlpha: 0, ease: "none", duration: outDuration }, centre);
      }
      tl.set({}, {}, 1); // pin the timeline length to exactly 1

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { dependencies: [index, sceneCount, track, centre, halfWidth] },
  );

  const value = useMemo(
    () => ({
      track,
      // Content reveals once the scene is roughly half faded in.
      enterAt: Math.max(0, centre - halfWidth * 0.5),
      centre,
      halfWidth,
    }),
    [track, centre, halfWidth],
  );

  return (
    <SceneContext.Provider value={value}>
      <section
        ref={ref}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translateZ(${-index * SCENE_DEPTH}px)`,
          opacity: index === 0 ? 1 : 0,
          visibility: index === 0 ? "visible" : "hidden",
        }}
        aria-labelledby={`scene-${index}-heading`}
      >
        {children}
      </section>
    </SceneContext.Provider>
  );
}
