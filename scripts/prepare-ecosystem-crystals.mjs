/**
 * Ekosistem kristal küre dokuları (25 Eylül 2026).
 *
 * Kaynak: müşterinin verdiği üç görsel (scripts/assets/ecosystem-crystals/*-source.webp,
 * 1122×1402, siyah zemin). Üçü de aynı çerçevede: küre merkezi (551, 637) px,
 * kenar yarıçapı ≈ 424 px (kenar parlaklığına en küçük kareler çember uydurması;
 * üç görselde ±2 px).
 *
 * Çıktı: public/images/site/ecosystem/crystal-<renk>-20260925.webp — kare,
 * ÖNCEDEN ÇARPILMIŞ (premultiplied) RGBA:
 *   - Küre diski (r ≤ R) tamamen opak: kristalin koyu içi arkasındaki yörünge
 *     çizgilerini göstermez (eski opak küre gibi).
 *   - Disk dışı: alfa = en parlak kanal (siyah zemin şeffaf, parlama yumuşak),
 *     çerçeve kenarına doğru sönümlenir (kare kenar görünmesin).
 *   - Siyah taban gürültüsü (webp sıkıştırma) disk dışında atılır.
 * Kare kenarı = 2 · R · FRAME; sahne düzlemi aynı oranla ölçeklenir
 * (src/data/solar-system.ts → ECO_CRYSTAL_SPHERES.frame).
 *
 * Çalıştır: node scripts/prepare-ecosystem-crystals.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(ROOT, "scripts/assets/ecosystem-crystals");
const OUT_DIR = path.join(ROOT, "public/images/site/ecosystem");
const VERSION = "20260925";

const CENTER = { x: 551, y: 637 };
const RADIUS = 424;
/** Kare yarı kenarı / disk yarıçapı: parlama halkası ve ışınların bir kısmı sığar. */
const FRAME = 1.3;
/** Disk dışında atılan siyah taban (0-1). */
const FLOOR = 0.03;

const CRYSTALS = [
  { name: "fuchsia", size: 512 },
  { name: "yellow", size: 512 },
  { name: "white", size: 256 },
];

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

async function prepare({ name, size }) {
  const half = RADIUS * FRAME;
  const left = Math.round(CENTER.x - half);
  const top = Math.round(CENTER.y - half);
  const side = Math.round(half * 2);
  const { data, info } = await sharp(path.join(SOURCE_DIR, `${name}-source.webp`))
    .extract({ left, top, width: side, height: side })
    .resize(size, size, { kernel: "lanczos3" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(size * size * 4);
  const scale = size / side;
  const cx = (CENTER.x - left) * scale;
  const cy = (CENTER.y - top) * scale;
  const r = RADIUS * scale;
  const edge = size / 2;
  let glowSum = [0, 0, 0];
  let glowWeight = 0;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * info.channels;
      const o = (y * size + x) * 4;
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      let rgb = [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255];
      // Disk içi opak; kenarda 1,5 px'lik yumuşak geçiş (kenar parlaması taşır).
      const inside = 1 - smoothstep(r - 1.5, r + 1.5, d);
      // Disk dışı: taban gürültüsünü at, çerçeve kenarına doğru sönümle.
      const fade = 1 - smoothstep(edge * 0.78, edge * 0.98, d);
      const glow = rgb.map((c) => Math.max(0, c - FLOOR) / (1 - FLOOR));
      const glowPeak = Math.max(...glow) * fade;
      const outside = glow.map((c) => c * fade);
      const alpha = inside + (1 - inside) * glowPeak;
      rgb = rgb.map((c, k) => inside * c + (1 - inside) * outside[k]);
      out[o] = Math.round(Math.min(alpha, rgb[0]) * 255);
      out[o + 1] = Math.round(Math.min(alpha, rgb[1]) * 255);
      out[o + 2] = Math.round(Math.min(alpha, rgb[2]) * 255);
      out[o + 3] = Math.round(alpha * 255);
      // Hale rengi: disk kenarının hemen dışındaki parlama ortalaması.
      if (d > r * 1.01 && d < r * 1.08) {
        const w = glowPeak;
        glowSum = glowSum.map((s, k) => s + glow[k] * w);
        glowWeight += w;
      }
    }
  }

  const file = path.join(OUT_DIR, `crystal-${name}-${VERSION}.webp`);
  const result = await sharp(out, { raw: { width: size, height: size, channels: 4 } })
    .webp({ quality: 90, alphaQuality: 100, exact: true, effort: 6 })
    .toFile(file);
  const tint = glowSum.map((s) => s / glowWeight);
  const peak = Math.max(...tint);
  const hex = tint
    .map((c) => Math.round((c / peak) * 255).toString(16).padStart(2, "0"))
    .join("");
  console.log(`${name}: ${path.relative(ROOT, file)} ${size}px ${(result.size / 1024).toFixed(1)} KB · hale rengi #${hex}`);
}

for (const crystal of CRYSTALS) await prepare(crystal);
