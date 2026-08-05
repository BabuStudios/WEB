import type { LayerAsset } from "@/components/primitives/SceneWorld";
import type { ParticleConfig } from "@/components/hero/alive/ParticleAtmosphere";
import type { HeroMode, SubjectConfig } from "@/components/hero/alive/SubjectLayer";

/**
 * APSIS — every field in this file is invented placeholder content, written to
 * a brief of: space / cosmos, epic-cinematic, dark, gold accent.
 * Replace copy and swap the plates in public/images/scenes to rebrand; no
 * component reads a string or an image path from anywhere else.
 */

interface SceneLayers {
  bg: LayerAsset;
  mid?: LayerAsset[];
  fg?: LayerAsset[];
}

export const brand = {
  name: "APSIS",
  wordmark: "APSIS",
  tagline: "Instruments for the long distance",
  description:
    "Optical clocks built for missions that travel beyond the reach of a correction signal.",
} as const;

export const hero = {
  mode: "photo" as HeroMode,
  asset: "/images/scenes/hero/subject.png",
  eyebrow: "Deep-space timekeeping",
  headline: "Time at the edge.",
  subhead:
    "Optical clocks for missions that outlive the people who launch them.",
  cta: { label: "The instrument", href: "#detail" },
} as const;

export const heroAlive: {
  particles: ParticleConfig;
  subject: SubjectConfig;
} = {
  particles: {
    // 400 + 16 + 150 = 566 — under the 600 desktop ceiling.
    dust: { count: 400, color: "#E8DFC8", speed: 0.09, opacity: 0.35 },
    flares: { count: 16, color: "#C9A227", pulse: true },
    starfield: { count: 150, color: "#F0EDE7", opacity: 0.7 },
  },
  subject: {
    width: 3.6,
    height: 3.6,
    breathAmount: 0.05,
    breathSpeed: 0.35,
  },
};

export const story = {
  eyebrow: "01 — The problem",
  heading: "A signal takes twenty-two hours to answer.",
  body: [
    "Past the orbit of Neptune, a spacecraft is alone with its own arithmetic. Every correction we send arrives a day late, describing a position it has already left.",
    "So the craft must keep its own time — not approximately, not for a while, but exactly, for decades, with no one to check its work.",
  ],
  quote:
    "We do not build clocks to measure time. We build them so a machine can be certain of where it is when no one is listening.",
  attribution: "Dr. Iris Vahl · Founding director",
} as const;

export const detail = {
  eyebrow: "02 — The instrument",
  heading: "APSIS ONE",
  body: [
    "A strontium lattice held at four microkelvin, interrogated by a laser locked to a cavity of ultra-low-expansion glass. The whole assembly fits inside a 19-inch rack and draws less than a cabin light.",
  ],
  specs: [
    { label: "Fractional stability", value: "2.1 × 10⁻¹⁸" },
    { label: "Drift, 10 years", value: "< 40 ps" },
    { label: "Mass", value: "14.2 kg" },
    { label: "Continuous draw", value: "31 W" },
    { label: "Qualified to", value: "NASA GEVS Level 2" },
    { label: "Mean time to failure", value: "> 22 years" },
  ],
} as const;

export const cta = {
  eyebrow: "03 — Begin",
  heading: "Tell us where you are going.",
  body: "We build to a mission profile, not to a catalogue. Send us a trajectory and a duration and we will tell you what it takes to stay certain.",
  primary: { label: "Start a mission brief", href: "mailto:hello@apsis.example" },
  secondary: { label: "Download the datasheet", href: "#" },
} as const;

export const nav = {
  links: [
    { label: "Story", href: "#story", sceneIndex: 1 },
    { label: "Instrument", href: "#detail", sceneIndex: 2 },
    { label: "Contact", href: "#cta", sceneIndex: 3 },
  ],
} as const;

/**
 * Hero and CTA backgrounds share a palette by design — the page returns to
 * where it opened. Both are generated from the same void + gold gradient.
 */
export const scenes: Record<"hero" | "story" | "detail" | "cta", SceneLayers> = {
  hero: {
    bg: { src: "/images/scenes/hero/bg.png", alt: "Deep void with a distant nebula" },
    fg: [{ src: "/images/scenes/hero/fg.png", alt: "" }],
  },
  story: {
    bg: { src: "/images/scenes/story/bg.png", alt: "A deep field of faint stars" },
    mid: [{ src: "/images/scenes/story/mid.png", alt: "" }],
  },
  detail: {
    bg: { src: "/images/scenes/detail/bg.png", alt: "Near-black instrument bay" },
    mid: [{ src: "/images/scenes/detail/mid.png", alt: "" }],
    fg: [{ src: "/images/scenes/detail/fg.png", alt: "" }],
  },
  cta: {
    bg: { src: "/images/scenes/cta/bg.png", alt: "Void returning to gold at the horizon" },
    mid: [{ src: "/images/scenes/cta/mid.png", alt: "" }],
  },
};

export const sceneOrder = ["hero", "story", "detail", "cta"] as const;
export const sceneCount = sceneOrder.length;
