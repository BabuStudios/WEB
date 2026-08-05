"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Mobile stands in for the R3F canvas — no WebGL, no particles below 768px.
 * A single GSAP float carries the "alive" read instead.
 */
export function MobileHeroSubject({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tween = gsap.to(ref.current, {
          y: -8,
          duration: 4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        return () => tween.kill();
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 flex items-center justify-center md:hidden"
      aria-hidden="true"
    >
      <div className="relative h-[60vw] w-[80vw]">
        <Image src={src} alt={alt} fill className="object-contain" priority />
      </div>
    </div>
  );
}
