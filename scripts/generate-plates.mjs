/**
 * Generates the scene plates in public/images/scenes as real PNGs.
 *
 * These are procedural placeholders standing in for photography or renders.
 * They are deterministic (seeded), dependency-free (zlib only) and share one
 * palette, so the layer system composites the way the real assets will.
 * Replace the files and delete this script once real art exists.
 *
 *   npm run assets
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "public/images/scenes");

/* ---------- deterministic RNG ---------- */
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/* ---------- PNG encoder (RGBA, 8-bit) ---------- */
function crc32(buf) {
  let c;
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------- painting helpers ---------- */
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

function canvas(width, height) {
  const px = Buffer.alloc(width * height * 4);
  return {
    width,
    height,
    px,
    set(x, y, r, g, b, a) {
      const i = (y * width + x) * 4;
      px[i] = Math.round(clamp01(r) * 255);
      px[i + 1] = Math.round(clamp01(g) * 255);
      px[i + 2] = Math.round(clamp01(b) * 255);
      px[i + 3] = Math.round(clamp01(a) * 255);
    },
    add(x, y, r, g, b, a) {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const i = (y * width + x) * 4;
      px[i] = Math.min(255, px[i] + r * 255);
      px[i + 1] = Math.min(255, px[i + 1] + g * 255);
      px[i + 2] = Math.min(255, px[i + 2] + b * 255);
      px[i + 3] = Math.min(255, px[i + 3] + a * 255);
    },
    toPng() {
      return encodePng(width, height, px);
    },
  };
}

/** Cheap value-noise field, smoothed over a coarse lattice. */
function noiseField(w, h, cells, rng) {
  const gw = cells + 2;
  const grid = new Float32Array(gw * gw);
  for (let i = 0; i < grid.length; i++) grid[i] = rng();
  return (x, y) => {
    const fx = (x / w) * cells;
    const fy = (y / h) * cells;
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const at = (gx, gy) => grid[Math.min(gw - 1, gy) * gw + Math.min(gw - 1, gx)];
    const a = at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx;
    const b = at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx;
    return a * (1 - sy) + b * sy;
  };
}

function fbm(w, h, rng, octaves = 4) {
  const layers = [];
  for (let o = 0; o < octaves; o++) {
    layers.push({ f: noiseField(w, h, 3 * 2 ** o, rng), amp: 1 / 2 ** o });
  }
  const norm = layers.reduce((s, l) => s + l.amp, 0);
  return (x, y) => layers.reduce((s, l) => s + l.f(x, y) * l.amp, 0) / norm;
}

function stars(c, count, rng, { maxBright = 1, warm = 0 } = {}) {
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rng() * c.width);
    const y = Math.floor(rng() * c.height);
    const b = Math.pow(rng(), 3) * maxBright;
    const r = b * (1 + warm * 0.25);
    const g = b * (1 + warm * 0.1);
    const bl = b;
    c.add(x, y, r, g, bl, b);
    if (b > 0.55) {
      // faint bloom on the brighter ones
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        c.add(x + dx, y + dy, r * 0.3, g * 0.3, bl * 0.3, b * 0.3);
      }
    }
  }
}

/* ---------- palette (matches globals.css) ---------- */
const VOID_ = [0.039, 0.039, 0.043]; // #0A0A0B
const GOLD = [0.788, 0.635, 0.153]; // #C9A227
const HAZE = [0.18, 0.16, 0.22];

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/* ---------- plates ---------- */

/** Void with a nebula bloom off-centre. Used by hero and cta (shared palette). */
function voidPlate(seed, { bloomX, bloomY, bloomStrength, starCount }) {
  const W = 1920;
  const H = 1080;
  const rng = makeRng(seed);
  const c = canvas(W, H);
  const neb = fbm(W, H, rng, 5);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W;
      const ny = y / H;
      // radial falloff around the bloom centre
      const d = Math.hypot((nx - bloomX) * 1.6, ny - bloomY);
      const bloom = Math.pow(1 - smoothstep(0, 0.85, d), 2.2) * bloomStrength;
      const n = neb(x, y);
      const cloud = bloom * (0.35 + n * 0.9);

      let col = VOID_;
      col = mix(col, HAZE, cloud * 0.8);
      col = mix(col, GOLD, cloud * cloud * 0.55);

      // vignette so text stays legible at the centre
      const vig = 1 - smoothstep(0.35, 1.15, Math.hypot(nx - 0.5, ny - 0.5) * 1.6) * 0.55;
      c.set(x, y, col[0] * vig, col[1] * vig, col[2] * vig, 1);
    }
  }
  stars(c, starCount, rng, { maxBright: 0.9, warm: 0.4 });
  return c;
}

/** Deep field: flatter, colder, many more faint stars. */
function deepFieldPlate(seed) {
  const W = 1920;
  const H = 1080;
  const rng = makeRng(seed);
  const c = canvas(W, H);
  const dust = fbm(W, H, rng, 4);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const n = dust(x, y);
      const band = Math.pow(1 - Math.abs(y / H - 0.62), 6) * 0.5;
      let col = mix(VOID_, [0.07, 0.075, 0.1], n * 0.7 + band);
      const vig = 1 - smoothstep(0.4, 1.2, Math.hypot(x / W - 0.5, y / H - 0.5) * 1.7) * 0.5;
      c.set(x, y, col[0] * vig, col[1] * vig, col[2] * vig, 1);
    }
  }
  stars(c, 2600, rng, { maxBright: 0.75, warm: 0.15 });
  return c;
}

/** Near-black instrument bay: a slow horizontal light gradient, no stars. */
function bayPlate(seed) {
  const W = 1920;
  const H = 1080;
  const rng = makeRng(seed);
  const c = canvas(W, H);
  const grain = fbm(W, H, rng, 5);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W;
      const shaft = Math.pow(1 - smoothstep(0, 0.42, Math.abs(nx - 0.24)), 3) * 0.5;
      const g = grain(x, y);
      let col = mix(VOID_, [0.1, 0.098, 0.094], shaft + g * 0.12);
      col = mix(col, GOLD, shaft * 0.16);
      const vig = 1 - smoothstep(0.3, 1.1, Math.hypot(nx - 0.5, y / H - 0.5) * 1.7) * 0.6;
      c.set(x, y, col[0] * vig, col[1] * vig, col[2] * vig, 1);
    }
  }
  return c;
}

/** Transparent dust veil for foreground layers. */
function veilPlate(seed, { strength = 0.5, warm = 1 } = {}) {
  const W = 1920;
  const H = 1080;
  const rng = makeRng(seed);
  const c = canvas(W, H);
  const veil = fbm(W, H, rng, 5);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W;
      const ny = y / H;
      // heaviest at the frame edges, clear through the middle where content sits
      const edge = Math.max(
        smoothstep(0.2, 0, nx),
        smoothstep(0.8, 1, nx),
        smoothstep(0.16, 0, ny),
        smoothstep(0.86, 1, ny),
      );
      const n = veil(x, y);
      const a = clamp01(Math.pow(edge, 1.6) * (0.2 + n * 0.7) * strength);
      const col = mix([0.55, 0.55, 0.6], GOLD, warm * 0.5);
      c.set(x, y, col[0], col[1], col[2], a);
    }
  }
  return c;
}

/** Soft nebula bloom with alpha — a midground plate. */
function bloomPlate(seed, { tint = GOLD, strength = 0.7 } = {}) {
  const W = 1400;
  const H = 1400;
  const rng = makeRng(seed);
  const c = canvas(W, H);
  const neb = fbm(W, H, rng, 5);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(x / W - 0.5, y / H - 0.5) * 2;
      const falloff = Math.pow(1 - smoothstep(0.1, 1, d), 2);
      const n = neb(x, y);
      const a = clamp01(falloff * (0.25 + n * 0.9) * strength);
      const col = mix(tint, [0.9, 0.88, 0.85], n * 0.35);
      c.set(x, y, col[0], col[1], col[2], a);
    }
  }
  return c;
}

/**
 * The hero subject: a cut-out instrument with alpha. An apsis ring — a gold
 * torus around a dark core, lit from the upper left. Stands in for the
 * product photograph.
 */
function subjectPlate(seed) {
  const S = 1200;
  const rng = makeRng(seed);
  const c = canvas(S, S);
  const grain = fbm(S, S, rng, 5);

  const R = 0.36; // ring radius, normalised
  const T = 0.055; // ring thickness

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const nx = x / S - 0.5;
      const ny = y / S - 0.5;
      // ellipse — the ring is seen at an angle
      const d = Math.hypot(nx, ny / 0.62);
      // outer ring, plus a thinner concentric one inside it
      const band = Math.min(
        Math.abs(d - R) / T,
        Math.abs(d - R * 0.66) / (T * 0.38),
      );

      let a = 1 - smoothstep(0.7, 1, band);
      if (a <= 0.001) {
        // inner core disc, barely there — 1 at the centre, 0 past the ring
        const core = 1 - smoothstep(R * 0.2, R * 0.6, d);
        if (core > 0.001) {
          const g = grain(x, y);
          const col = mix([0.05, 0.05, 0.06], [0.1, 0.095, 0.1], g);
          c.set(x, y, col[0], col[1], col[2], core * 0.55);
        }
        continue;
      }

      // directional light from the upper left
      const lambert = clamp01(0.25 + (-nx * 0.9 - ny * 0.8) * 0.9);
      const g = grain(x, y);
      let col = mix([0.14, 0.12, 0.09], GOLD, lambert);
      col = mix(col, [1, 0.96, 0.86], Math.pow(lambert, 4) * 0.7);
      col = col.map((v) => v * (0.88 + g * 0.24));

      a *= 0.92 + g * 0.08;
      c.set(x, y, col[0], col[1], col[2], a);
    }
  }
  return c;
}

/* ---------- write ---------- */
const plates = [
  ["hero/bg.png", () => voidPlate(1337, { bloomX: 0.72, bloomY: 0.34, bloomStrength: 0.95, starCount: 1400 })],
  ["hero/fg.png", () => veilPlate(2024, { strength: 0.32, warm: 0.7 })],
  ["hero/subject.png", () => subjectPlate(90210)],
  ["story/bg.png", () => deepFieldPlate(4242)],
  ["story/mid.png", () => bloomPlate(555, { tint: [0.35, 0.42, 0.6], strength: 0.5 })],
  ["detail/bg.png", () => bayPlate(7777)],
  ["detail/mid.png", () => subjectPlate(31415)],
  ["detail/fg.png", () => veilPlate(8080, { strength: 0.26, warm: 1 })],
  // cta shares the hero palette by design — same generator, mirrored bloom
  ["cta/bg.png", () => voidPlate(1337, { bloomX: 0.24, bloomY: 0.66, bloomStrength: 0.9, starCount: 1400 })],
  ["cta/mid.png", () => bloomPlate(606, { tint: GOLD, strength: 0.45 })],
];

for (const [name, make] of plates) {
  const file = resolve(OUT, name);
  mkdirSync(dirname(file), { recursive: true });
  const png = make().toPng();
  writeFileSync(file, png);
  console.log(`${name.padEnd(22)} ${(png.length / 1024).toFixed(0)} KB`);
}
console.log("\nplates written to public/images/scenes");
