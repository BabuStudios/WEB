"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { getLenis } from "@/lib/smooth-scroll";
import { brand } from "@/content/project";

/**
 * First visit only. The world is already alive behind the overlay — particles
 * drifting, subject breathing — before the overlay clears.
 *
 *   Phase 1  100–600ms   background plate to 40%, world appears dimly
 *   Phase 2  600–1200ms  wordmark fades in
 *   Phase 3  1200–1800ms overlay clears
 *   Phase 4  1800–2000ms foreground fades in last, depth settles
 */
export function IntroOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const seen =
      typeof window !== "undefined" && sessionStorage.getItem("intro-seen");

    if (seen) {
      gsap.set(overlayRef.current, { display: "none" });
      gsap.set("#intro-fg", { opacity: 1 });
      return;
    }

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set("#intro-fg", { opacity: 1 });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          gsap.set(overlayRef.current, { display: "none" });
          sessionStorage.setItem("intro-seen", "1");
        },
      });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Lenis owns scrolling, so the lock goes through Lenis — not body overflow.
      getLenis()?.stop();

      const tl = gsap.timeline({
        onComplete: () => {
          getLenis()?.start();
          gsap.set(overlayRef.current, { display: "none" });
          sessionStorage.setItem("intro-seen", "1");
        },
      });

      gsap.set("#intro-fg", { opacity: 0 });

      tl.to("#intro-bg", { opacity: 0.4, duration: 0.5, ease: "fade" }, 0.1)
        .to("#intro-wordmark", { opacity: 1, duration: 0.6, ease: "fade" }, 0.6)
        .to(overlayRef.current, { opacity: 0, duration: 0.6, ease: "fade" }, 1.2)
        .to("#intro-fg", { opacity: 1, duration: 0.4, ease: "fade" }, 1.8);

      return () => {
        tl.kill();
        getLenis()?.start();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[--bg]"
      aria-hidden="true"
    >
      <div id="intro-bg" className="absolute inset-0 bg-[--bg]" />
      <p
        id="intro-wordmark"
        className="relative font-mono text-xs tracking-[0.5em] text-ink"
        style={{ opacity: 0 }}
      >
        {brand.wordmark}
      </p>
    </div>
  );
}
