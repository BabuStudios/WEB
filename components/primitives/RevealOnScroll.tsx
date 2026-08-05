"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { dur } from "@/lib/motion";
import { useSceneContext } from "@/lib/use-scene-reveal";

/**
 * Every piece of content in every scene reveals through this component.
 * Opacity only — never Y, X, scale or blur. 1.4s minimum. Fires once.
 *
 * Two trigger modes: against the camera track when inside a Scene (the sticky
 * viewport makes viewport-relative triggers meaningless there), against the
 * viewport on the mobile stack.
 */
export function RevealOnScroll({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { track, enterAt } = useSceneContext();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reducedMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const reducedMotion = Boolean(ctx.conditions?.reducedMotion);
          const vars = {
            opacity: 1,
            duration: reducedMotion ? 0.6 : dur.content,
            delay: reducedMotion ? 0 : delay,
            ease: "fade",
          };

          if (!track) {
            gsap.fromTo(el, { opacity: 0 }, {
              ...vars,
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            });
            return;
          }

          gsap.set(el, { opacity: 0 });
          let fired = false;
          // Declared before create(): ScrollTrigger fires onUpdate synchronously
          // during its own init, so play() can run before create() returns.
          let st: ScrollTrigger | undefined;

          const play = () => {
            if (fired) return;
            fired = true;
            gsap.to(el, vars);
            st?.kill();
          };

          st = ScrollTrigger.create({
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
              if (self.progress >= enterAt) play();
            },
          });

          // Scene 0 is on screen before any scrolling happens.
          if (enterAt <= 0) play();

          return () => st?.kill();
        },
      );

      return () => mm.revert();
    },
    { scope: ref, dependencies: [delay, track, enterAt] },
  );

  return (
    <div ref={ref} style={{ opacity: 0 }} className={className}>
      {children}
    </div>
  );
}
