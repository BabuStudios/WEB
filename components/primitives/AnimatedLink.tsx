"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { dur } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Underline wipes in from the left on hover. Hover is the one place motion is
 * allowed under one second — 0.5s, power3.out.
 */
export function AnimatedLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const rule = ruleRef.current;
      if (!el || !rule) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const to = (scaleX: number, transformOrigin: string) =>
          gsap.to(rule, {
            scaleX,
            transformOrigin,
            duration: dur.hover,
            ease: "power3.out",
          });

        const enter = () => to(1, "left center");
        const leave = () => to(0, "right center");

        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        el.addEventListener("focus", enter);
        el.addEventListener("blur", leave);

        return () => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
          el.removeEventListener("focus", enter);
          el.removeEventListener("blur", leave);
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <a
      ref={ref}
      href={href}
      className={cn(
        "over-image relative inline-block font-mono text-xs uppercase tracking-[0.22em] text-ink",
        className,
      )}
    >
      {children}
      {/* Resting rule underneath, accent wipe on top. */}
      <span
        aria-hidden="true"
        className="absolute -bottom-2 left-0 block h-px w-full bg-[--rule]"
      />
      <span
        ref={ruleRef}
        aria-hidden="true"
        className="absolute -bottom-2 left-0 block h-px w-full bg-accent"
        style={{ transform: "scaleX(0)", transformOrigin: "right center" }}
      />
    </a>
  );
}
