"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CameraContext, SCENE_DEPTH, PERSPECTIVE } from "@/lib/use-camera-scenes";

/**
 * The page is a Z-axis track. Scenes sit at fixed depths along it and this
 * component scrubs a camera through them 1:1 with Lenis scroll progress.
 * Never rendered below 768px — see app/page.tsx.
 */
export function CameraRig({
  children,
  sceneCount,
}: {
  children: React.ReactNode;
  sceneCount: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const [track, setTrack] = useState<HTMLDivElement | null>(null);

  // Ref plus state: the ref scopes this component's own GSAP context, the
  // state is what children can safely read during their layout effects.
  const attachTrack = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el;
    setTrack(el);
  }, []);

  useGSAP(
    () => {
      if (!track) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: true, // 1:1 with Lenis scroll — no numeric delay
        },
      });

      // Camera advances into the track on positive z to meet the receding
      // scenes. ease: "none" always — Lenis provides the feel.
      tl.to(cameraRef.current, {
        z: (sceneCount - 1) * SCENE_DEPTH,
        ease: "none",
      });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: containerRef, dependencies: [sceneCount, track] },
  );

  const ctx = useMemo(() => ({ sceneCount, track }), [sceneCount, track]);

  return (
    <CameraContext.Provider value={ctx}>
      {/* Scroll track — height determines total scroll distance */}
      <div
        ref={attachTrack}
        data-scroll-track=""
        style={{ height: `${sceneCount * 100}vh` }}
        className="relative"
      >
        {/* Sticky viewport — the window the user looks through.
            perspective lives here and nowhere else. */}
        <div
          className="sticky top-0 h-screen overflow-hidden"
          style={{
            perspective: `${PERSPECTIVE}px`,
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* Camera — the only element with preserve-3d */}
          <div
            ref={cameraRef}
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            {children}
          </div>
        </div>
      </div>
    </CameraContext.Provider>
  );
}
