"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

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

  const midLayers = isHero ? [] : mid;

  const register =
    (store: React.MutableRefObject<Map<string, HTMLDivElement>>, key: string) =>
    (el: HTMLDivElement | null) => {
      if (el) store.current.set(key, el);
      else store.current.delete(key);
    };

  const multFor = (key: string, table: typeof SCROLL) =>
    key === "bg" ? table.bg : key.startsWith("mid") ? table.mid : table.fg;

  // SCROLL PARALLAX — scrubbed 1:1 via Lenis → ScrollTrigger.
  // Disabled below md, where the camera system is absent entirely.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const triggers = Array.from(scrollRefs.current.entries()).map(
          ([key, el]) =>
            ScrollTrigger.create({
              trigger: wrapRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              onUpdate: (self) => {
                gsap.set(el, {
                  y: self.progress * window.innerHeight * multFor(key, SCROLL) * -1,
                });
              },
            }),
        );

        return () => triggers.forEach((t) => t.kill());
      });

      return () => mm.revert();
    },
    { scope: wrapRef },
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

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      movers.forEach(({ x, y, mult }) => {
        x(dx * mult);
        y(dy * mult);
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden">
      {/* BACKGROUND — full-bleed environment plate.
          Oversized well past the viewport: a scene is still visible while the
          camera is up to 0.6 depth-steps away, where CSS perspective has scaled
          it to ~0.71, and an inset-0 plate would expose the void at the edges.
          Parallax offsets ride inside the same margin. */}
      <div
        ref={register(scrollRefs, "bg")}
        className="absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div ref={register(mouseRefs, "bg")} className="absolute -inset-[26%]">
          <Image
            src={bg.src}
            alt=""
            fill
            className="object-cover"
            priority={priority}
            quality={90}
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
            className="absolute inset-0"
            style={layer.style}
          >
            <Image
              src={layer.src}
              alt=""
              fill
              className="object-contain"
              quality={85}
              sizes="100vw"
            />
          </div>
        </div>
      ))}

      {/* MIDGROUND SLOT — the hero canvas, composited between bg and fg */}
      {midSlot ? (
        <div className="absolute inset-0 z-10">{midSlot}</div>
      ) : null}

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
            className="absolute -inset-[26%]"
            style={layer.style}
          >
            <Image
              src={layer.src}
              alt=""
              fill
              className="object-cover"
              quality={80}
              sizes="100vw"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
