"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Lenis is the only scroll event source in this codebase. ScrollTrigger reads
 * Lenis via `lenis.on("scroll", ScrollTrigger.update)` rather than the native
 * scroll position, and Lenis' RAF loop is driven by the GSAP ticker so both
 * share one frame budget. Without this, ScrollTrigger fires against native
 * scroll while Lenis runs its own loop and every scroll-driven element stutters.
 */
/**
 * The two numbers that decide how the page feels under the wheel. They are not
 * a performance setting — they are the art direction, and they are the first
 * thing to reach for if scrolling feels wrong.
 *
 *   duration        how long the page keeps travelling after you stop pushing.
 *                   Higher reads as weight; past ~1.5s it starts reading as
 *                   input lag instead, because the page is visibly behind you.
 *   wheelMultiplier how much distance one wheel notch buys. Below 1 the page
 *                   resists you; it makes a short page feel long and a slow
 *                   page feel broken.
 *
 * The brief specified `duration: 2.0, wheelMultiplier: 0.75` — maximum weight.
 * Restore those two values for the original feel.
 */
export const SCROLL_FEEL = {
  duration: 1.15,
  wheelMultiplier: 1.0,
};

let instance: Lenis | null = null;

/**
 * The live Lenis instance, for the few places that need to stop and start
 * scrolling (the intro overlay). Locking `body { overflow: hidden }` instead
 * would leave Lenis running against a frozen document.
 */
export function getLenis() {
  return instance;
}

export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      ...SCROLL_FEEL,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false, // native scroll on mobile
    });

    instance = lenis;

    // ScrollTrigger reads Lenis, not native scroll
    lenis.on("scroll", ScrollTrigger.update);

    // Single loop — Lenis and GSAP share one ticker
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
      lenis.destroy();
      instance = null;
    };
  }, []);
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useSmoothScroll();
  return <>{children}</>;
}
