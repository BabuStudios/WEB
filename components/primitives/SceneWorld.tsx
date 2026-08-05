"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useSceneContext } from "@/lib/use-scene-reveal";

export interface LayerAsset {
  src: string;
  alt: string;
  style?: React.CSSProperties;
}

interface SceneWorldProps {
  bg: LayerAsset;
  mid?: LayerAsset[];
  fg?: LayerAsset[];
  children: React.ReactNode;
  /**
   * Occupies the midground band (z-10) in place of the static plates — the
   * hero's R3F canvas. It must not be passed as a child: children render in
   * the content band above it and the canvas would paint over the copy.
   */
  midSlot?: React.ReactNode;
  isHero?: boolean;
  priority?: boolean;
  /** DOM id applied to the first foreground layer, for the intro sequence. */
  fgId?: string;
}

const SCROLL = { bg: 0.04, mid: 0.12, fg: 0.25 };
const MOUSE = { bg: 0.008, mid: 0.018, fg: 0.035 };

const multFor = (key: string, table: typeof SCROLL) =>
  key === "bg" ? table.bg : key.startsWith("mid") ? table.mid : table.fg;

/**
 * Each scene is a diorama of three depth layers. Scroll and mouse drive
 * differential parallax — the differential is what makes it read as a place
 * rather than a flat composition.
 *
 * Every layer is two nested elements: the outer div carries scroll parallax
 * (y), the inner div carries mouse parallax (x/y). They are kept separate
 * because both effects animate `y` and would otherwise overwrite each other
 * on every frame.
 */
export function SceneWorld({
  bg,
  mid = [],
  fg = [],
  children,
  midSlot,
  isHero = false,
  priority = false,
  fgId,
}: SceneWorldProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const mouseRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { track, centre, halfWidth } = useSceneContext();

  const midLayers = isHero ? [] : mid;

  const register =
    (store: React.MutableRefObject<Map<string, HTMLDivElement>>, key: string) =>
    (el: HTMLDivElement | null) => {
      if (el) store.current.set(key, el);
      else store.current.delete(key);
    };

  /**
   * SCROLL PARALLAX — one ScrollTrigger for the whole scene rather than one
   * per layer, driven by the camera's distance to this scene rather than by
   * the wrapper's position in the viewport. Inside the sticky viewport the
   * wrapper never moves, so a viewport-relative trigger holds a constant
   * progress and the parallax silently does nothing while still costing work.
   *
   * No track means the mobile stack, where scroll parallax is off by design.
   */
  useGSAP(
    () => {
      if (!track) return;

      const layers = Array.from(scrollRefs.current.entries());

      const st = ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          // -1 approaching, 0 at the station, +1 departing
          const local = gsap.utils.clamp(
            -1,
            1,
            (self.progress - centre) / halfWidth,
          );
          const travel = local * window.innerHeight * 0.5;
          for (const [key, el] of layers) {
            gsap.set(el, { y: travel * multFor(key, SCROLL) * -1 });
          }
        },
      });

      return () => st.kill();
    },
    { scope: wrapRef, dependencies: [track, centre, halfWidth] },
  );

  // MOUSE PARALLAX — gsap.quickTo: one setup, zero allocation per event.
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const movers = Array.from(mouseRefs.current.entries()).map(([key, el]) => {
      const mult = multFor(key, MOUSE);
      return {
        x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power2.out" }),
        y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power2.out" }),
        mult,
      };
    });
    if (!movers.length) return;

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      for (const { x, y, mult } of movers) {
        x(dx * mult);
        y(dy * mult);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={wrapRef}
      /*
       * overflow is hidden on mobile and visible from md up. In the camera the
       * plates must be free to extend past the scene box — a local clip would
       * cut them back to it, which is the whole problem the oversizing exists
       * to solve — and CameraRig's sticky viewport already clips to the
       * window. On the mobile stack nothing else clips, so without this the
       * oversized plates would give the body a horizontal scrollbar.
       */
      className="relative h-full w-full overflow-hidden md:overflow-visible"
    >
      {/* BACKGROUND — full-bleed environment plate.
          Oversized past the viewport because a scene stays visible while the
          camera is up to a full depth-step away, where CSS perspective has
          scaled it to 0.6. An inset-0 plate would expose the void at the
          edges. Foreground needs more margin still: it parallaxes furthest. */}
      <div
        ref={register(scrollRefs, "bg")}
        className="absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div ref={register(mouseRefs, "bg")} className="absolute -inset-[36%]">
          <Image
            src={bg.src}
            alt=""
            fill
            className="object-cover"
            priority={priority}
            quality={80}
            sizes="100vw"
          />
        </div>
      </div>

      {/* MIDGROUND — static plates, non-hero scenes only */}
      {midLayers.map((layer, i) => (
        <div
          key={layer.src}
          ref={register(scrollRefs, `mid-${i}`)}
          className="absolute inset-0 z-10"
          aria-hidden="true"
        >
          <div
            ref={register(mouseRefs, `mid-${i}`)}
            className="absolute -inset-[36%]"
            style={layer.style}
          >
            <Image
              src={layer.src}
              alt=""
              fill
              className="object-contain"
              quality={80}
              sizes="100vw"
            />
          </div>
        </div>
      ))}

      {/* MIDGROUND SLOT — the hero canvas, composited between bg and fg */}
      {midSlot ? <div className="absolute inset-0 z-10">{midSlot}</div> : null}

      {/* CONTENT — stable, never parallaxed.
          In flow on mobile so the section takes its height from the copy;
          absolute from md up, where the scene is exactly one viewport. */}
      <div className="pointer-events-none relative z-20 flex w-full items-center justify-center md:absolute md:inset-0">
        <div className="pointer-events-auto w-full">{children}</div>
      </div>

      {/* FOREGROUND — desktop only, in front of content */}
      {fg.map((layer, i) => (
        <div
          key={layer.src}
          id={i === 0 ? fgId : undefined}
          ref={register(scrollRefs, `fg-${i}`)}
          className="pointer-events-none absolute inset-0 z-30 hidden md:block"
          aria-hidden="true"
        >
          <div
            ref={register(mouseRefs, `fg-${i}`)}
            className="absolute -inset-[46%]"
            style={layer.style}
          >
            <Image
              src={layer.src}
              alt=""
              fill
              className="object-cover"
              quality={75}
              sizes="100vw"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
