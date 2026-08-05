"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { getLenis } from "@/lib/smooth-scroll";
import { brand, nav, sceneCount } from "@/content/project";

/**
 * On the Z-track the scenes are stacked at the same document position, so a
 * plain #hash cannot reach them. Translate the scene index into the scroll
 * offset at which the camera arrives there and hand it to Lenis.
 * On the mobile stack the element exists, so the hash is left alone.
 */
function scrollToScene(index: number) {
  const track = document.querySelector<HTMLElement>("[data-scroll-track]");
  const lenis = getLenis();
  if (!track || !lenis) return false;

  const steps = Math.max(1, sceneCount - 1);
  const travel = track.offsetHeight - window.innerHeight;
  const top = track.offsetTop + (index / steps) * travel;

  lenis.scrollTo(top, { duration: 2.4 });
  return true;
}

/** Fixed · transparent · frosted once scrolled · progress rule on the right edge. */
export function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const frost = ScrollTrigger.create({
      start: "10vh top",
      onEnter: () =>
        gsap.to(navRef.current, {
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(var(--bg-rgb), 0.3)",
          duration: 0.4,
          ease: "fade",
        }),
      onLeaveBack: () =>
        gsap.to(navRef.current, {
          backdropFilter: "blur(0px)",
          backgroundColor: "rgba(var(--bg-rgb), 0)",
          duration: 0.4,
          ease: "fade",
        }),
    });

    const progress = ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.set(progressRef.current, {
          scaleY: self.progress,
          transformOrigin: "top",
        });
        progressRef.current?.parentElement?.setAttribute(
          "aria-valuenow",
          String(Math.round(self.progress * 100)),
        );
      },
    });

    return () => {
      frost.kill();
      progress.kill();
    };
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 md:px-10"
        style={{ backgroundColor: "rgba(var(--bg-rgb), 0)" }}
      >
        <a
          href="#main"
          className="over-image font-mono text-xs tracking-[0.32em] text-ink"
        >
          {brand.wordmark}
        </a>
        <ul className="flex gap-6 md:gap-10">
          {nav.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => {
                  if (scrollToScene(link.sceneIndex)) e.preventDefault();
                }}
                className="over-image font-mono text-xs uppercase tracking-[0.22em] text-ink-soft transition-colors duration-500 hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="pointer-events-none fixed right-4 top-0 z-50 hidden h-screen w-px bg-[--rule] md:block"
        role="progressbar"
        aria-label="Page progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      >
        <div
          ref={progressRef}
          className="h-full w-full bg-[--ink-mute]"
          style={{ transform: "scaleY(0)", transformOrigin: "top" }}
        />
      </div>
    </>
  );
}
