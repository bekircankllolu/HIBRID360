/**
 * MONA nilüfer şekli — referans görselden yoğunluk haritası üretir
 * (docs/DECISIONS.md #48).
 *
 *   node scripts/generate-mona-lotus.mjs [girdi-görseli]
 *
 * Girdi varsayılanı `docs/design/references/mona-lotus-reference.webp`
 * (kullanıcının 13 Eylül 2026'da gönderdiği nilüfer görselinin 768 px
 * kopyası). Görsel zaten sarı noktalardan oluşan bir nilüfer; parlaklığı
 * doğrudan "bu hücreye kaç MONA noktası düşsün" olarak kullanılıyor. Koyu
 * zemin ve çiçeğin etrafındaki ışıma `FLOOR` altında sıfırlanır, `GAMMA`
 * yaprak kenarlarını ve ercikleri iç dolgudan belirgin tutar.
 *
 * Çıktı `src/lib/mona-lotus-density.ts`: SIZE×SIZE, satır satır (üstten
 * alta), hücre başına bir bayt, base64. Örnekleme çalışma anında
 * `src/lib/mona-lotus.ts` içinde yapılır.
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SIZE = 128;
const FLOOR = 40;
const GAMMA = 1.9;

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const input = process.argv[2] ?? path.join(root, "docs/design/references/mona-lotus-reference.webp");
const output = path.join(root, "src/lib/mona-lotus-density.ts");

const { data } = await sharp(input)
  .removeAlpha()
  .resize(SIZE, SIZE, { fit: "fill", kernel: "lanczos3" })
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });

const density = new Uint8Array(SIZE * SIZE);
for (let i = 0; i < density.length; i++) {
  const lifted = Math.max(0, (data[i] - FLOOR) / (255 - FLOOR));
  density[i] = Math.round(Math.pow(lifted, GAMMA) * 255);
}

const base64 = Buffer.from(density).toString("base64");
const lines = base64.match(/.{1,100}/g) ?? [];
const source = `// Üretildi: node scripts/generate-mona-lotus.mjs — elle düzenlemeyin.
// Kaynak: docs/design/references/mona-lotus-reference.webp (DECISIONS #48).

/** Nilüfer yoğunluk haritası: SIZE×SIZE, üstten alta satırlar, hücre başına 0–255. */
export const LOTUS_DENSITY = {
  size: ${SIZE},
  data:
${lines.map((line, index) => `    "${line}"${index === lines.length - 1 ? "," : " +"}`).join("\n")}
} as const;
`;

await writeFile(output, source, "utf8");
const filled = density.reduce((count, value) => count + (value > 0 ? 1 : 0), 0);
console.log(`${path.relative(root, output)}: ${SIZE}×${SIZE}, dolu hücre ${filled} (${((filled / density.length) * 100).toFixed(1)}%)`);
