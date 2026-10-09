/**
 * CONTENT CONFIG — scenes, world constants, motion language and links.
 * Copy lives in i18n/, facts in facts.ts. This file holds structure and
 * tuning only; it references copy by dictionary key, never by string.
 *
 * Confirmed in Phase 2, 2026-10-09.
 */

import type { Dictionary } from "./i18n";

/* ── Palette ─────────────────────────────────────────────────────────────
 * ⚑ ASSUMED: no brand colours were supplied. Amber and blue are the current
 * site's accents (#E18D1A, #066AAB) pushed to their warning-light versions. */
export const palette = {
  asphalt: "#0B0D10",
  graphite: "#1A1E23",
  amber: "#FFA41B",
  signalBlue: "#1E6BFF",
  offWhite: "#EEF1F3",
  mist: "#C9CED4",
  rim: "#9FB4C8",
} as const;

/* ── World ───────────────────────────────────────────────────────────────
 * FOG_FAR: at 60 units the fog hides everything past one scene, so the
 * camera never sees two scenes at once at 50° FOV.
 * SCENE_SPACING = FOG_FAR × 1.15: the previous scene is fully fogged out
 * before the next one begins to read. Never set it below FOG_FAR. */
export const FOG_NEAR = 8;
export const FOG_FAR = 60;
export const SCENE_SPACING = FOG_FAR * 1.15;
export const CAMERA_FOV = 50;

/* Scroll length per scene, in viewport heights, chosen for pacing.
 * The two list scenes hold five locked stops each (~60vh per stop). */
export const SCROLL_PER_SCENE_VH = {
  hero: 150,
  omOss: 120,
  produkter: 300,
  verksamhet: 300,
  kontakt: 80,
} as const;

export const camera = {
  lerp: 0.08,
  /** Max tilt toward the cursor, radians (±3°). Assigned and clamped each frame, never accumulated. */
  tiltMax: (3 * Math.PI) / 180,
  tiltLerp: 0.05,
  /** Distance the camera rests in front of a scene's origin. */
  standoff: 14,
  eyeHeight: 1.6,
  /** Lateral distance between stops in the locked scenes. */
  stopSpacing: 12,
} as const;

/* ── Scenes ──────────────────────────────────────────────────────────── */
export type SceneId = keyof typeof SCROLL_PER_SCENE_VH;
type SceneCopyKey = keyof Dictionary["scenes"];
type NavKey = keyof Dictionary["nav"];
type InSceneKey = keyof Dictionary["inScene"];

export type TierBehaviour = { full: string; lite: string; static: string };

export type SceneDef = {
  id: SceneId;
  copy: SceneCopyKey;
  nav: NavKey;
  /** DOM anchor / semantic-mirror id. */
  anchor: string;
  inSceneWord: InSceneKey | null;
  /** Number of locked stops; 0 = free travel through the scene. */
  stops: number;
  poster: string;
  tiers: TierBehaviour;
};

export const scenes = [
  {
    id: "hero",
    copy: "hero",
    nav: "home",
    anchor: "start",
    inSceneWord: null,
    stops: 0,
    poster: "/posters/poster-hero.avif",
    tiers: {
      full: "Light bar ignites in fog; cursor work light; full mist",
      lite: "Same; DoF off, mist ×0.35, bloom half-res",
      static: "Poster, H1, subhead, Bli kund",
    },
  },
  {
    id: "omOss",
    copy: "omOss",
    nav: "omOss",
    anchor: "om-oss",
    inSceneWord: "omOss",
    stops: 0,
    poster: "/posters/poster-om-oss.avif",
    tiers: {
      full: "Workshop silhouette at dusk; instrument cluster with gauge and ISO plates",
      lite: "Cluster kept, silhouette simplified",
      static: "Poster, three pillars, facts <dl>",
    },
  },
  {
    id: "produkter",
    copy: "produkter",
    nav: "produkter",
    anchor: "produkter",
    inSceneWord: "produkter",
    stops: 5,
    poster: "/posters/poster-produkter.avif",
    tiers: {
      full: "Five lit product objects, five locked stops, DoF pulls",
      lite: "Same stops, no DoF",
      static: "Poster, five family cards",
    },
  },
  {
    id: "verksamhet",
    copy: "verksamhet",
    nav: "verksamhet",
    anchor: "verksamhetsomraden",
    inSceneWord: "verksamhet",
    stops: 5,
    poster: "/posters/poster-verksamhet.avif",
    tiers: {
      full: "Five roadside stations; signature strobe on entry; rain at the 24V station",
      lite: "Strobe kept without chromatic aberration; no rain",
      static: "Poster, five area cards",
    },
  },
  {
    id: "kontakt",
    copy: "kontakt",
    nav: "kontakt",
    anchor: "kontakt",
    inSceneWord: null,
    stops: 0,
    poster: "/posters/poster-kontakt.avif",
    tiers: {
      full: "Dawn horizon; mist settles",
      lite: "Same, mist ×0.35",
      static: "Poster, address, hours, staff by department",
    },
  },
] as const satisfies readonly SceneDef[];

/* ── Products & areas (order = stop order) ───────────────────────────── */
export type ProductForm = "workLight" | "beacon" | "powerUnit" | "controlUnit" | "camera";

export const productFamilies = [
  { id: "belysning", form: "workLight", accent: palette.amber },
  { id: "blaljus", form: "beacon", accent: palette.signalBlue },
  { id: "stromforsorjning", form: "powerUnit", accent: palette.amber },
  { id: "elcentraler", form: "controlUnit", accent: palette.amber },
  { id: "kamerasystem", form: "camera", accent: palette.amber },
] as const satisfies readonly {
  id: keyof Dictionary["scenes"]["produkter"]["families"];
  form: ProductForm;
  accent: string;
}[];

export type StationForm = "emergency" | "apron" | "military" | "camper" | "truck";

export const areas = [
  { id: "utryckning", station: "emergency", beacon: palette.signalBlue, rain: false },
  { id: "flygplats", station: "apron", beacon: palette.amber, rain: false },
  { id: "mil", station: "military", beacon: palette.amber, rain: false },
  { id: "husvagn", station: "camper", beacon: palette.amber, rain: false },
  { id: "tunga", station: "truck", beacon: palette.amber, rain: true },
] as const satisfies readonly {
  id: keyof Dictionary["scenes"]["verksamhet"]["areas"];
  station: StationForm;
  beacon: string;
  rain: boolean;
}[];

/* ── Hero subject: procedural LED light bar ──────────────────────────── */
export const lightBar = {
  modules: 12,
  length: 6.4,
  /** Seconds between neighbouring modules igniting in the "power on" moment. */
  igniteStagger: 0.07,
  /** Swap for a GLB later: set to "/models/lightbar.glb" and the hero loads it instead. */
  glb: null as string | null,
} as const;

/* ── Alive system ────────────────────────────────────────────────────── */
export const alive = {
  mist: { count: 6000, color: palette.mist, sizeMin: 0.6, sizeMax: 1.4 },
  flares: { count: 40, color: palette.amber, blueColor: palette.signalBlue },
  rain: { count: 1500, color: palette.rim },
  /** Applied on the WebGL2 backend and on the LITE tier. */
  reducedScale: 0.35,
} as const;

/* ── Lighting ────────────────────────────────────────────────────────── */
export const lighting = {
  cursor: { color: "#FFE2B8", intensity: 60, angle: 0.42, penumbra: 0.6, distance: 40 },
  key: { color: palette.rim, intensity: 1.2 },
  ambient: { intensity: 0.08 },
  fog: { color: palette.asphalt },
} as const;

/* ── Post FX (TSL RenderPipeline; toggles are uniforms, never rebuilds) ─ */
export const post = {
  bloom: { strength: 0.9, radius: 0.5, threshold: 0.75 },
  dof: { focalLength: 6, bokehScale: 3 },
  grain: 0.035,
  vignette: 0.35,
  chromatic: { idle: 0, strobe: 0.004 },
  fpsFloor: 50,
} as const;

/* ── Motion language: the only eases used on the site ────────────────── */
export const eases = {
  "babu.glide": "M0,0 C0.16,1 0.3,1 1,1",
  "babu.snap": "M0,0 C0.7,0 0.2,1 1,1",
  "babu.ignite": "M0,0 C0.9,0 0.1,1 1,1",
} as const;
export type EaseName = keyof typeof eases;

/* ── Intro ───────────────────────────────────────────────────────────── */
export const intro = {
  /** Hard cap: fade into the scene at its current quality after this. */
  maxWaitMs: 4000,
  logo: "/brand/awimex-wordmark.svg",
} as const;

/* ── Audio ───────────────────────────────────────────────────────────── */
export const audio = {
  enabled: false,
  ambientSrc: null as string | null,
} as const;

/* ── Site, links, analytics ──────────────────────────────────────────── */
export const site = {
  /** ⚑ ASSUMED domain. Override with NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.awimex.se",
  /** ⚑ ASSUMED deploy target. */
  deploy: "vercel",
} as const;

export const externalLinks = {
  /** D1 = a: a branded bridge modal, then the existing form on awimex.se. */
  becomeCustomer: {
    href: "https://www.awimex.se/bli-kund-hos-oss/",
    bridge: true,
  },
} as const;

export const analytics = {
  /** No provider supplied: events are built and consent-gated, then dropped. */
  provider: null as "plausible" | "vercel" | null,
  consentTool: null as string | null,
} as const;
