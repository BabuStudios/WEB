/**
 * Single registration point for every GSAP plugin used in this project.
 * Imported from app/layout.tsx so registration happens before any component
 * mounts. Plugins are never registered inside components.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(ScrollTrigger, CustomEase);

// Registering twice throws in dev under StrictMode double-invocation, so the
// eases are created defensively — CustomEase.get returns undefined when absent.
if (!CustomEase.get("fade")) {
  CustomEase.create("fade", "M0,0 C0.22,0 0.36,1 1,1"); // content reveals
}
if (!CustomEase.get("camera")) {
  CustomEase.create("camera", "M0,0 C0.16,0 0.3,1 1,1"); // camera weight
}

export const dur = {
  content: 1.4, // all content fades — never below this
  hover: 0.5, // hover states only — the one sub-1s exception
};

export { gsap, ScrollTrigger };
