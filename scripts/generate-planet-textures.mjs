/**
 * Hibrid ekosistemi — gezegen yüzey dokularını üretir.
 *
 *   node scripts/generate-planet-textures.mjs
 *
 * NEDEN ÜRETİYORUZ: 18 Eylül 2026, kullanıcı: *"bu hibrit taşı bir yıldız ve
 * etrafını dönenler de diğer gezegenler gibi düşünebiliriz... gerçek bir uzay
 * yaratalım... çok gerçekçi olması lazım."* Higgsfield ve Blender bu oturumda
 * bağlı değil; dokular bu yüzden burada, deterministik olarak üretiliyor.
 *
 * NASIL: gürültü KÜRE ÜZERİNDE 3B örnekleniyor (ekvatoral haritanın u,v'si
 * önce enlem/boylama, oradan xyz'ye çevriliyor). İki sonucu var: doku x
 * ekseninde dikişsiz sarılıyor ve kutuplarda sıkışma/çekme olmuyor — 2B
 * gürültüyle üretilen gezegen haritalarının klasik iki kusuru.
 *
 * ÇIKTI (her gezegen için iki dosya, public/images/site/solar/):
 *   <ad>-albedo.webp  1024x512  yüzey rengi
 *   <ad>-height.webp   512x256  yükseklik (shader normali buradan türetiyor)
 *
 * MARKA KURALI: paletler CLAUDE.md'nin dört rengiyle sınırlı — siyah zemin,
 * altın/sarı (#FFFC00 ve onun koyu tonları), beyaz, fuşya vurgu. "Gerçekçi"
 * burada foto-gerçekçi renk değil, gerçek YÜZEY FİZİĞİ demek: kıta/kanyon
 * dokusu, bant akışı, krater, kutup örtüsü — hepsi marka paletinde.
 */

import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, "public/images/site/solar");
mkdirSync(OUT, { recursive: true });

const W = 1024;
const H = 512;
const HW = 512;
const HH = 256;

/* ---------------------------------------------------------------- gürültü */

/** Deterministik 3B hash — aynı girdi her makinede aynı dokuyu verir. */
function hash3(x, y, z, seed) {
  let h = x * 374761393 + y * 668265263 + z * 2147483647 + seed * 1442695040;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a, b, t) => a + (b - a) * t;

/** Değer gürültüsü (3B, trilinear + smoothstep). */
function noise3(x, y, z, seed) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = fade(x - xi);
  const yf = fade(y - yi);
  const zf = fade(z - zi);
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz, seed);
  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), xf);
  const x10 = lerp(c(0, 1, 0), c(1, 1, 0), xf);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), xf);
  const x11 = lerp(c(0, 1, 1), c(1, 1, 1), xf);
  return lerp(lerp(x00, x10, yf), lerp(x01, x11, yf), zf);
}

/** Fraktal toplam — doğal yüzeylerin çok ölçekli dokusu. */
function fbm(x, y, z, seed, octaves = 6, lacunarity = 2.07, gain = 0.5) {
  let sum = 0;
  let amp = 1;
  let norm = 0;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise3(x * freq, y * freq, z * freq, seed + i * 37);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm;
}

/** Sırt gürültüsü — kanyon ve dağ silsilesi görüntüsü verir. */
function ridged(x, y, z, seed, octaves = 5) {
  let sum = 0;
  let amp = 1;
  let norm = 0;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    const n = 1 - Math.abs(noise3(x * freq, y * freq, z * freq, seed + i * 71) * 2 - 1);
    sum += amp * n * n;
    norm += amp;
    amp *= 0.52;
    freq *= 2.13;
  }
  return sum / norm;
}

/* ---------------------------------------------------------------- paletler */

/** Renk rampası: [durak, [r,g,b]] — yükseklik/örtü değerine göre örneklenir. */
function ramp(stops, t) {
  const v = Math.min(1, Math.max(0, t));
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i][0]) {
      const [t0, c0] = stops[i - 1];
      const [t1, c1] = stops[i];
      const k = (v - t0) / Math.max(1e-6, t1 - t0);
      return [lerp(c0[0], c1[0], k), lerp(c0[1], c1[1], k), lerp(c0[2], c1[2], k)];
    }
  }
  return stops[stops.length - 1][1];
}

const BLACK = [8, 8, 8];
const ASH = [38, 36, 32];
const BRONZE = [92, 70, 24];
const GOLD = [196, 152, 44];
const BRIGHT = [255, 214, 92];
const YELLOW = [255, 252, 0];
const MAGENTA = [255, 0, 255];
const ROSE = [140, 24, 120];
const BONE = [226, 222, 210];

/**
 * Sekiz dünya. `kind` yüzey davranışını, `palette` rengini belirler.
 * Her biri bir hizmetle eşleşiyor (bkz. src/data/solar-system.ts).
 */
const PLANETS = [
  {
    id: "production",
    kind: "rock", // kıtalar + kanyonlar: "uçtan uca çekim" dünyası
    seed: 11,
    scale: 2.4,
    palette: [[0, BLACK], [0.42, ASH], [0.58, BRONZE], [0.78, GOLD], [1, BRIGHT]],
    relief: 1,
  },
  {
    id: "digital",
    kind: "lights", // gece yüzü ışıl ışıl: ağ/şehir dünyası
    seed: 23,
    scale: 3.1,
    palette: [[0, BLACK], [0.5, [24, 22, 26]], [0.72, ROSE], [1, MAGENTA]],
    relief: 0.45,
  },
  {
    id: "creative",
    kind: "swirl", // domain-warp: fırça darbesi gibi akan bulutlar
    seed: 37,
    scale: 1.9,
    palette: [[0, [18, 14, 6]], [0.4, BRONZE], [0.68, GOLD], [0.88, BRIGHT], [1, YELLOW]],
    relief: 0.5,
  },
  {
    id: "ai-creative-production",
    kind: "swirl",
    seed: 53,
    scale: 2.2,
    palette: [[0, [12, 8, 14]], [0.45, [70, 18, 62]], [0.7, ROSE], [0.9, MAGENTA], [1, BRIGHT]],
    relief: 0.4,
    ring: true, // ince halka — sayfadaki "AI" vurgusu
  },
  {
    id: "live-broadcast",
    kind: "ice", // kutup örtüsü + çatlaklar: sinyal dünyası
    seed: 67,
    scale: 2.6,
    palette: [[0, [10, 12, 14]], [0.45, [46, 48, 52]], [0.7, [150, 150, 148]], [1, BONE]],
    relief: 0.8,
  },
  {
    id: "cloud-tv",
    kind: "bands", // gaz devi: enleme paralel bant akışı
    seed: 83,
    scale: 1.6,
    palette: [[0, [16, 12, 4]], [0.35, BRONZE], [0.6, GOLD], [0.82, BRIGHT], [1, [255, 240, 200]]],
    relief: 0.25,
    ring: true,
  },
  {
    id: "event-management",
    kind: "crater", // krater alanları: sahne/etkinlik dünyası
    seed: 97,
    scale: 2.8,
    palette: [[0, BLACK], [0.4, [30, 28, 26]], [0.62, [86, 74, 48]], [0.85, GOLD], [1, BRIGHT]],
    relief: 1.15,
  },
  {
    id: "post-production",
    kind: "strata", // ince katmanlar: zaman çizelgesi dünyası
    seed: 113,
    scale: 2.1,
    palette: [[0, [10, 10, 12]], [0.45, [40, 34, 30]], [0.7, BRONZE], [0.9, GOLD], [1, BONE]],
    relief: 0.7,
  },
];

/* ------------------------------------------------------------- yüzey alanı */

/** Ekvatoral piksel → küre üzerindeki birim vektör. */
function sphereAt(u, v) {
  const lon = (u - 0.5) * Math.PI * 2;
  const lat = (0.5 - v) * Math.PI;
  const cl = Math.cos(lat);
  return [cl * Math.cos(lon), Math.sin(lat), cl * Math.sin(lon)];
}

/** Yüzey yüksekliği (0-1) — gezegen türüne göre. */
function surface(kind, p, seed, scale, lat) {
  const [x, y, z] = [p[0] * scale, p[1] * scale, p[2] * scale];
  switch (kind) {
    case "rock": {
      const base = fbm(x, y, z, seed, 6);
      const canyons = ridged(x * 1.8, y * 1.8, z * 1.8, seed + 5, 5);
      return Math.min(1, base * 0.75 + canyons * 0.45 - 0.12);
    }
    case "bands": {
      // Enlem bandı + türbülans: gaz devinin akış çizgileri.
      const turbulence = fbm(x * 0.6, y * 2.4, z * 0.6, seed, 5) - 0.5;
      const band = Math.sin(lat * 9 + turbulence * 5.5) * 0.5 + 0.5;
      return Math.min(1, band * 0.72 + fbm(x, y, z, seed + 9, 4) * 0.34);
    }
    case "swirl": {
      // Domain warping — akan, fırça darbesi gibi bir yüzey.
      const wx = fbm(x + 5.2, y + 1.3, z, seed + 3, 4);
      const wy = fbm(x - 1.7, y + 9.2, z, seed + 4, 4);
      return fbm(x + wx * 2.6, y + wy * 2.6, z, seed, 6);
    }
    case "ice": {
      const cracks = 1 - ridged(x * 2.2, y * 2.2, z * 2.2, seed + 2, 4);
      const cap = Math.min(1, Math.max(0, (Math.abs(lat) - 0.72) * 3.4)); // kutup örtüsü
      return Math.min(1, fbm(x, y, z, seed, 5) * 0.5 + cracks * 0.3 + cap * 0.8);
    }
    case "crater": {
      // Krater alanı: ridged'in tersi çukur tabanları veriyor.
      const craters = 1 - ridged(x * 1.4, y * 1.4, z * 1.4, seed + 6, 4);
      return Math.min(1, fbm(x, y, z, seed, 5) * 0.55 + craters * 0.6 - 0.1);
    }
    case "strata": {
      const layers = Math.sin(fbm(x, y, z, seed, 5) * 26) * 0.5 + 0.5;
      return Math.min(1, fbm(x * 0.7, y * 0.7, z * 0.7, seed + 8, 4) * 0.62 + layers * 0.38);
    }
    case "lights":
    default: {
      // Kıta maskesi: yükseklik değil, ışık yoğunluğu haritası.
      const land = fbm(x, y, z, seed, 6);
      const grid = fbm(x * 6, y * 6, z * 6, seed + 11, 3);
      return Math.min(1, land > 0.52 ? land * 0.6 + grid * 0.55 : land * 0.35);
    }
  }
}

/* ------------------------------------------------------------------ üretim */

for (const planet of PLANETS) {
  const albedo = Buffer.alloc(W * H * 3);
  const height = Buffer.alloc(HW * HH);

  for (let py = 0; py < H; py++) {
    const v = (py + 0.5) / H;
    for (let px = 0; px < W; px++) {
      const u = (px + 0.5) / W;
      const p = sphereAt(u, v);
      const lat = Math.asin(p[1]) / (Math.PI / 2); // -1 (güney) → 1 (kuzey)
      const h = surface(planet.kind, p, planet.seed, planet.scale, lat);
      const [r, g, b] = ramp(planet.palette, h);
      const o = (py * W + px) * 3;
      albedo[o] = Math.round(r);
      albedo[o + 1] = Math.round(g);
      albedo[o + 2] = Math.round(b);
      // Yükseklik haritası daha düşük çözünürlükte: normaller için yeterli.
      if (py % (H / HH) === 0 && px % (W / HW) === 0) {
        const hy = py / (H / HH);
        const hx = px / (W / HW);
        height[hy * HW + hx] = Math.round(255 * Math.min(1, h * planet.relief));
      }
    }
  }

  const albedoInfo = await sharp(albedo, { raw: { width: W, height: H, channels: 3 } })
    .webp({ quality: 82 })
    .toFile(path.join(OUT, `${planet.id}-albedo.webp`));
  const heightInfo = await sharp(height, { raw: { width: HW, height: HH, channels: 1 } })
    .webp({ quality: 80 })
    .toFile(path.join(OUT, `${planet.id}-height.webp`));

  console.log(
    `${planet.id.padEnd(24)} albedo ${String(Math.round(albedoInfo.size / 1024)).padStart(3)} KB  ` +
      `height ${String(Math.round(heightInfo.size / 1024)).padStart(3)} KB  ${planet.kind}${planet.ring ? " + halka" : ""}`,
  );
}
