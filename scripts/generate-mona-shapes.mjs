/**
 * MONA şekil kütüphanesi — referans görsellerden yoğunluk haritası üretir.
 *
 *   node scripts/generate-mona-shapes.mjs
 *
 * `generate-mona-lotus.mjs`'in genelleştirilmiş hâli (DECISIONS #48'deki
 * nilüfer aynı yöntemle üretilmişti). Fark: tek şekil yerine bir manifest,
 * ve şekil başına eşik/gama ayarı — çünkü referanslar aynı karakterde değil:
 * yüz yoğun bir yarım-ton dokusu, küp ise seyrek bir tel kafes. Tek bir
 * FLOOR ikisini birden tutturamıyor.
 *
 * Kaynak görseller kullanıcının 13 Eylül 2026'da gönderdiği sarı-parçacık
 * referansları (Downloads/mona). Parlaklık doğrudan "bu hücreye kaç MONA
 * noktası düşsün" olarak kullanılıyor.
 *
 * Çıktı `src/lib/mona-shape-density.ts`: şekil başına SIZE×SIZE, üstten alta
 * satırlar, hücre başına bir bayt, base64. Örnekleme çalışma anında
 * `src/lib/mona-shapes.ts` içinde yapılır.
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SIZE = 128;

/**
 * Şekil başına ayar:
 *   floor — bunun altındaki parlaklık sıfırlanır (zemin ve ışıma temizliği)
 *   gamma — >1 parlak kenarları iç dolgudan ayırır, <1 sönük alanı da katar
 */
const SHAPES = [
  {
    name: "FACE",
    file: "mona-face-reference.webp",
    // Yarım-ton yüz: noktalar zaten ayrık, düşük eşik profili korur.
    // Gama düşük tutuldu ki yanaktaki seyrek nokta alanı da dolsun —
    // yalnız kenar çizgisi kalırsa şekil maske gibi görünüyor.
    floor: 26,
    gamma: 1.35,
  },
  {
    name: "CRYSTAL",
    file: "mona-crystal-reference.webp",
    // Kristal: parlak kenarlar + sönük iç doku. Gama yüksek, kenarlar
    // belirgin kalsın; taşın fasetaları silüetin okunmasını sağlıyor.
    floor: 34,
    gamma: 1.8,
  },
  {
    name: "CUBE",
    file: "mona-cube-reference.webp",
    // Tel kafes küp: yalnız ayrıtlar var, iç boş. Eşik yüksek —
    // ayrıtlar arası ışıma alınırsa küp bulanık bir kütleye dönüşüyor.
    floor: 48,
    gamma: 2.1,
  },
  {
    name: "IRIS",
    file: "mona-iris-reference.webp",
    // İris: ortası BOŞ (gözbebeği) olmalı, yoksa şekil halkaya değil
    // diske dönüşüyor. Yüksek eşik merkezdeki sönük ışımayı siliyor.
    floor: 44,
    gamma: 1.7,
  },
];

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const output = path.join(root, "src/lib/mona-shape-density.ts");

async function densityFor({ file, floor, gamma }) {
  const { data } = await sharp(path.join(root, "docs/design/references", file))
    .removeAlpha()
    .resize(SIZE, SIZE, { fit: "fill", kernel: "lanczos3" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const density = new Uint8Array(SIZE * SIZE);
  for (let i = 0; i < density.length; i++) {
    const lifted = Math.max(0, (data[i] - floor) / (255 - floor));
    density[i] = Math.round(Math.pow(lifted, gamma) * 255);
  }
  return density;
}

const blocks = [];
for (const shape of SHAPES) {
  const density = await densityFor(shape);
  const filled = density.reduce((count, value) => count + (value > 0 ? 1 : 0), 0);
  const lines = (Buffer.from(density).toString("base64").match(/.{1,100}/g) ?? []);
  blocks.push(
    `/** ${shape.name} yoğunluk haritası — kaynak ${shape.file} ` +
      `(eşik ${shape.floor}, gama ${shape.gamma}). */\n` +
      `export const ${shape.name}_DENSITY = {\n  size: ${SIZE},\n  data:\n` +
      lines.map((line, i) => `    "${line}"${i === lines.length - 1 ? "," : " +"}`).join("\n") +
      `\n} as const;`,
  );
  console.log(
    `  ${shape.name.padEnd(8)} dolu hücre ${String(filled).padStart(5)} ` +
      `(${((filled / density.length) * 100).toFixed(1)}%)`,
  );
}

await writeFile(
  output,
  `// Üretildi: node scripts/generate-mona-shapes.mjs — elle düzenlemeyin.\n` +
    `// Kaynaklar: docs/design/references/mona-*-reference.webp\n\n` +
    blocks.join("\n\n") +
    "\n",
  "utf8",
);
console.log(`\n${path.relative(root, output)} yazıldı.`);
