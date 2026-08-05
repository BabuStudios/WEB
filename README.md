# APSIS — Cinematic Editorial Web

Built to the Hybrid Architecture v2.1 brief: **Lenis → GSAP ScrollTrigger → CSS 3D camera**, HTML content, R3F in the hero only.

```
npm install
npm run dev        # http://localhost:3000
npm run build
npm run assets     # regenerate the placeholder scene plates
```

---

## Section 0B — filled briefing

The brand was delegated ("you decide"), so **every content field below is invented placeholder material**. Nothing here describes a real company.

```
PROJECT NAME:      Apsis — Cinematic Editorial Web
CLIENT / BRAND:    APSIS                                        [invented]
PRODUCT / SUBJECT: Optical clocks for deep-space missions       [invented]
TONE:              Cinematic / immersive
PRIMARY COLOR:     #C9A227  (old gold in candlelight)
COLOR_MODE:        dark
HERO_MODE:         photo (PNG with alpha)
SECTIONS:          hero, story, detail, cta      → sceneCount = 4
COPY LANGUAGE:     English
THEME:             Space / cosmos — epic, cinematic
ADJECTIVES:        vast · precise · reverent                    [invented]

SCENE_LAYERS
  hero:    bg void+nebula     mid R3F canvas    fg dust veil
  story:   bg deep field      mid nebula bloom
  detail:  bg instrument bay  mid instrument    fg lens veil
  cta:     bg void+nebula     mid horizon glow      (shares the hero palette)

PARTICLES
  dust       400   #E8DFC8   opacity 0.35
  flares      16   #C9A227   pulsing, additive
  starfield  150   #F0EDE7   distant drift layer
  total      566   — under the 600 desktop ceiling; none on mobile
```

All copy, imagery and particle configuration live in `content/project.ts`. No component reads a string or an image path from anywhere else — rebranding is one file plus the plates in `public/images/scenes`.

---

## Assets

There was no photography, so the plates are **generated procedurally** by `scripts/generate-plates.mjs` — a dependency-free, seeded PNG writer (zlib only). They are real rasters with real alpha, sharing one palette, so the layer compositor behaves exactly as it will with final art. Replace the files in `public/images/scenes` and delete the script when real assets exist.

The hero subject (`hero/subject.png`) is a cut-out gold ring standing in for a product photograph.

---

## Deviations from the brief

Each of these was a defect in the spec as written, found while building or while verifying in a real browser.

**1. Scene depth sign.** The spec places scenes at `translateZ(+index * 800)` while the camera travels to `-(n-1) * 800`. With `perspective: 1200px`, a child at `+800` sits between the viewer and the perspective plane: at rest every scene past the hero renders **3× magnified and on top of it**. Scenes now recede on negative Z and the camera advances on positive Z to meet them.

**2. Scene fade distance.** The spec divides by `sceneCount`, but the camera only travels `sceneCount - 1` depth steps. The final scene would finish fading out before the camera ever arrived. Scene centres are now at `index / (sceneCount - 1)`.

**3. Scene opacity mechanism.** The spec drives opacity from `onUpdate` on a `scrub: true` ScrollTrigger with no animation attached. Verified in-browser: that trigger stops firing after the initial refresh and every scene freezes at whatever the refresh sweep last computed. Opacity now runs on a real scrubbed timeline of length 1, so timeline time equals track progress.

**4. Track element passed as state, not a ref.** `Scene` cannot read `trackRef.current` from its parent — React attaches a parent's ref *after* its children's layout effects run, so the ref is always null there and every scene silently skipped its setup. `CameraRig` publishes the element through context state instead.

**5. Scroll and mouse parallax were fighting.** Both effects animate `y` on the same element, so whichever wrote last won and the other was erased every frame. Each layer is now two nested elements: outer carries scroll, inner carries mouse.

**6. The hero canvas cannot be a child.** Passed as a child it lands in the content band, where its `z-index: 10` paints over the headline. `SceneWorld` takes a `midSlot` prop that renders it in the midground band, between the background plate and the foreground veil — which is what "the canvas is the midground layer" actually requires.

**7. Content reveals inside the camera.** Inside a sticky viewport every scene is permanently on screen, so `start: "top 85%"` fires all reveals at once on load. Scenes publish the track progress at which they arrive and `RevealOnScroll` triggers against that. On the mobile stack, where there is no camera, it uses the ordinary viewport trigger.

**8. Plates are oversized, and the scene must not clip them.** A scene is visible while the camera is up to a full depth-step away, where perspective has scaled it to 0.6, so an `inset-0` background exposes the void at all four edges. Plates sit at `-inset-[36%]` (foreground `-inset-[46%]`, since it parallaxes furthest) — and `SceneWorld` drops its own `overflow: hidden` from `md` up, because a local clip cuts the plates straight back to the scene box and defeats the oversizing entirely. The sticky viewport already clips to the window; mobile keeps the local clip, where nothing else would.

**9. `<Environment preset="studio" />` removed.** It streams an HDRI from an external CDN at runtime — a hard third-party dependency — and studio lighting is the wrong read for a void. The subject is unlit (`meshBasicMaterial`), so ambient plus the cursor light is sufficient.

**10. Particles need a sprite.** `pointsMaterial` with no `map` draws hard squares, which read as rendering artefacts rather than dust. A soft radial sprite is generated once on a canvas and shared by all three layers.

**11. Scroll lock goes through Lenis.** The spec locks the intro with `body { overflow: hidden }`, which leaves Lenis running against a frozen document. `getLenis()?.stop()` / `.start()` instead.

**12. `style={{ translateZ }}` is not CSS.** `translateZ` is a GSAP property name, not a React style property; it is silently dropped. Written as `transform: translateZ(...)`.

**13. Specs folded into the detail scene.** The brief selected four scenes but the instrument has numbers worth showing, so the spec table lives with the instrument it describes rather than becoming a fifth station.

**14. Nav anchors.** On a Z-track all scenes share one document position, so `#hash` links cannot reach them. Nav links translate a scene index into a scroll offset and hand it to `lenis.scrollTo`. On the mobile stack the elements exist and the hash is left alone.

**15. The fade windows are a true crossfade.** At a half-window of 0.5 steps adjacent windows merely abut, so at the midpoint between two stations both scenes sit at opacity 0 and the page cuts to black for a frame. At 1.0 the windows overlap exactly, the two live scenes always sum to opacity 1, and never more than two are on screen. Guards on the fade tweens key off the scene index rather than the clamped window bounds — testing `inStart > 0` skips the fade-in of any scene whose window opens exactly at progress 0, which at this half-window is scene 1, leaving it hidden for the entire page.

---

## Scroll performance

The camera architecture has one dominant cost, and it is not the WebGL: every
scene holds full-bleed plates inside a single `preserve-3d` context, so without
culling the browser composites all of them on every frame whether or not they
are on screen. Measured over a scripted 50-notch scroll at 1440×900:

| | before | after |
|---|---|---|
| scenes painted (mean) | 4.0 | 1.7 |
| median frame | 33.3 ms | 16.7 ms |
| frames over 32 ms | 135 | 98 |

What changed:

- **Scenes cull themselves.** `autoAlpha` instead of `opacity`, so a scene at
  zero drops to `visibility: hidden` and leaves paint and compositing entirely.
  This is the single largest win.
- **The hero's render loop stops.** `frameloop` flips to `never` once the camera
  has left the hero. A full-viewport WebGL surface redrawing 566 sprites behind
  a scene you cannot see is pure waste.
- **Canvas capped at `dpr: 1.5`, antialiasing off.** The scene is soft sprites
  and one unlit plane; a 2× buffer quadrupled fragment work for no visible gain
  and there is no hard edge to alias.
- **The nav uses a gradient scrim, not `backdrop-filter`.** A blurred backdrop
  over the 3D camera forces the compositor to read back and re-blur the whole
  scene behind the bar on every scrolled frame. Over a dark world the scrim is
  visually equivalent and free.
- **One parallax ScrollTrigger per scene instead of one per layer** — and it
  now works. It was driven by the wrapper's position in the viewport, which
  inside a sticky viewport never changes, so the layer parallax silently did
  nothing while still costing work every frame. It reads camera distance now.
- **WebP only, no AVIF.** On-demand AVIF encoding of ten 1920×1080 plates costs
  minutes of CPU on a cold cache — enough to starve the page on first visit.
  `sharp` is a dependency for the same reason: without it Next falls back to a
  WASM encoder that is orders of magnitude slower.

Note that the numbers above come from a software-rendered container that pins
to 30 fps, so treat them as a ranking rather than as absolute figures. The
structural changes are what carry to real hardware.

### If it still feels heavy

That may not be frame rate. `SCROLL_FEEL` in `lib/smooth-scroll.tsx` holds the
two numbers that decide how the page responds to the wheel, and the brief asked
for the heaviest possible setting — `duration: 2.0, wheelMultiplier: 0.75`,
meaning the page keeps travelling for two seconds after you stop pushing and
each notch buys three-quarters of the usual distance. That reads as input lag
rather than as weight. They now default to `1.15` / `1.0`; the original values
are in the comment there.

## Verified in a real browser

Chromium, production build, at 1440×900 and 390×844:

- Camera scrubs correctly — at 34 % of the track the camera is at `z: 816` and scene 1 is at `opacity: 0.97`, scene 0 at `0`
- One `<h1>`; three `<h2>` ids matching their `aria-labelledby`
- No console errors, no page errors
- Mobile (390px): no canvas, no camera track, foreground layers `display: none`, four sections in the stack
- `prefers-reduced-motion: reduce`: intro dismissed, content at full opacity

## Checklist notes

- No `window.addEventListener("scroll", …)` anywhere — Lenis is the only scroll source
- `scrub: true` with `ease: "none"` on every scrubbed animation
- `perspective` on the sticky viewport only; `preserve-3d` on the camera wrapper only
- `depthWrite={false}` on every particle material; flares and starfield additive
- Reveals are opacity-only, 1.4 s minimum, `once`, max 3 staggered per scene
- No pure `#000000` / `#FFFFFF`; text over imagery uses `text-shadow`, never a background box
