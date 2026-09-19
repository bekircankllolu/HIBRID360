/**
 * "20 YEARS & COUNTING" marka işaretini animasyona hazırlar.
 *
 *   node scripts/extract-anniversary-mark.mjs
 *
 * Kaynak `public/images/site/friends-anniversary.png` (1254x1254, siyah zemin
 * üzerinde altın çizim, alfa yok). Bu script işareti üç parçaya ayırır:
 *
 *   1. HALKA  — "20"nin O'su: mükemmel bir daire. Merkez/yarıçap/kalınlık
 *      ölçülüp SVG `<circle>` olarak yeniden çizilir (stroke-dasharray ile
 *      gerçekten "çizilebilir" olsun diye).
 *   2. IŞINLAR — çevredeki kısa çizgiler. Bağlantılı bileşen analizi + PCA:
 *      ince, uzun ve ana ekseni halkanın merkezine bakan bileşenler ışındır.
 *      Her biri bir doğru parçası (x1,y1,x2,y2,kalınlık) olarak dışa yazılır.
 *   3. GERİ KALAN — "2" rakamı ve "CELEBRATING 20 YEARS & COUNTING" metni.
 *      Alfa kanallı webp olarak kaydedilir (parlaklık → alfa, renk
 *      "unpremultiply" ile doygunluğunu korur).
 *
 * Çıktılar:
 *   public/images/site/friends/anniversary-type.webp   (2'yi ve metni içerir)
 *   src/data/friends-anniversary.ts                    (halka + ışın geometrisi)
 *
 * NEDEN: kullanıcı (18 Eylül 2026) "içinde 20 yazan görseli şık bir animasyon
 * haline getir" dedi. Rasteri komple maskeleyip açmak ucuz bir çözüm olurdu;
 * ışınların tek tek dışa doğru çizilmesi ancak vektör geometriyle mümkün.
 */

import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRC = path.join(ROOT, "public/images/site/friends-anniversary.png");
const OUT_IMAGE = path.join(ROOT, "public/images/site/friends/anniversary-type.webp");
const OUT_DATA = path.join(ROOT, "src/data/friends-anniversary.ts");

const THRESHOLD = 48; // altın çizim ile siyah zemin arasındaki eşik (0-255)

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const lum = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) {
  const o = i * C;
  lum[i] = Math.max(data[o], data[o + 1], data[o + 2]);
}

/* ---------- 1. Bağlantılı bileşenler (8 komşuluk, yığın tabanlı) ---------- */

const labels = new Int32Array(W * H).fill(-1);
const components = [];
const stack = new Int32Array(W * H);
for (let start = 0; start < W * H; start++) {
  if (lum[start] < THRESHOLD || labels[start] !== -1) continue;
  const id = components.length;
  let top = 0;
  stack[top++] = start;
  labels[start] = id;
  const pixels = [];
  while (top > 0) {
    const p = stack[--top];
    pixels.push(p);
    const x = p % W;
    const y = (p / W) | 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const n = ny * W + nx;
        if (labels[n] !== -1 || lum[n] < THRESHOLD) continue;
        labels[n] = id;
        stack[top++] = n;
      }
    }
  }
  components.push({ id, pixels });
}

/* ---------- 2. Bileşen ölçüleri: ağırlık merkezi + ana eksen (PCA) ---------- */

function measure(component) {
  const { pixels } = component;
  let sx = 0;
  let sy = 0;
  let minX = W;
  let maxX = 0;
  let minY = H;
  let maxY = 0;
  for (const p of pixels) {
    const x = p % W;
    const y = (p / W) | 0;
    sx += x;
    sy += y;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const n = pixels.length;
  const cx = sx / n;
  const cy = sy / n;
  let xx = 0;
  let yy = 0;
  let xy = 0;
  for (const p of pixels) {
    const dx = (p % W) - cx;
    const dy = ((p / W) | 0) - cy;
    xx += dx * dx;
    yy += dy * dy;
    xy += dx * dy;
  }
  xx /= n;
  yy /= n;
  xy /= n;
  // 2x2 kovaryansın özdeğerleri: ana eksen uzunluğu / kalınlık oranı bundan.
  const tr = xx + yy;
  const det = xx * yy - xy * xy;
  const disc = Math.max(0, (tr * tr) / 4 - det);
  const l1 = tr / 2 + Math.sqrt(disc);
  const l2 = tr / 2 - Math.sqrt(disc);
  const angle = 0.5 * Math.atan2(2 * xy, xx - yy);
  return {
    ...component,
    n,
    cx,
    cy,
    bbox: { minX, maxX, minY, maxY },
    major: 2 * Math.sqrt(Math.max(l1, 0.01)),
    minor: 2 * Math.sqrt(Math.max(l2, 0.01)),
    angle,
  };
}

const measured = components.map(measure).filter((c) => c.n >= 12);
measured.sort((a, b) => b.n - a.n);

/* ---------- 3. Halka: içi boş, kare kutulu, en büyük bileşen ---------- */

function holeRatio(c) {
  // Kutunun merkezindeki küçük pencerede dolu piksel oranı — halkanın içi boş.
  const cxi = Math.round(c.cx);
  const cyi = Math.round(c.cy);
  const r = Math.round(Math.min(c.bbox.maxX - c.bbox.minX, c.bbox.maxY - c.bbox.minY) * 0.12);
  let filled = 0;
  let total = 0;
  for (let y = cyi - r; y <= cyi + r; y++) {
    for (let x = cxi - r; x <= cxi + r; x++) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      total++;
      if (lum[y * W + x] >= THRESHOLD) filled++;
    }
  }
  return total ? filled / total : 1;
}

const ringCandidate = measured.find((c) => {
  const w = c.bbox.maxX - c.bbox.minX;
  const h = c.bbox.maxY - c.bbox.minY;
  const square = Math.min(w, h) / Math.max(w, h);
  return square > 0.9 && holeRatio(c) < 0.05 && w > W * 0.1;
});
if (!ringCandidate) throw new Error("Halka bulunamadı — eşik/ölçüt gözden geçirilmeli");

// Halkanın yarıçapı ve kalınlığı: piksellerin merkeze uzaklık dağılımından.
const radii = ringCandidate.pixels.map((p) => Math.hypot((p % W) - ringCandidate.cx, ((p / W) | 0) - ringCandidate.cy));
radii.sort((a, b) => a - b);
const rInner = radii[Math.floor(radii.length * 0.02)];
const rOuter = radii[Math.floor(radii.length * 0.98)];
const ring = {
  cx: ringCandidate.cx,
  cy: ringCandidate.cy,
  r: (rInner + rOuter) / 2,
  stroke: rOuter - rInner,
};

/* ---------- 4. Işınlar: ince, uzun, ana ekseni halkaya bakan bileşenler ---- */

const rays = [];
const typeComponents = [];
for (const c of measured) {
  if (c === ringCandidate) continue;
  const elong = c.major / Math.max(c.minor, 0.6);
  const dirToCenter = Math.atan2(c.cy - ring.cy, c.cx - ring.cx);
  // Ana eksen ile merkeze bakan doğrultu arasındaki fark (0-90°).
  let delta = Math.abs(((c.angle - dirToCenter + Math.PI / 2) % Math.PI) - Math.PI / 2);
  delta = Math.min(delta, Math.PI - delta);
  const dist = Math.hypot(c.cx - ring.cx, c.cy - ring.cy);
  const isRay = elong > 2.6 && delta < 0.30 && dist > ring.r * 1.05 && c.major < W * 0.12;
  if (isRay) {
    const half = c.major / 2;
    rays.push({
      x1: c.cx - Math.cos(c.angle) * half,
      y1: c.cy - Math.sin(c.angle) * half,
      x2: c.cx + Math.cos(c.angle) * half,
      y2: c.cy + Math.sin(c.angle) * half,
      w: Math.max(1.4, c.minor),
      d: dist,
      a: Math.atan2(c.cy - ring.cy, c.cx - ring.cx),
    });
  } else {
    typeComponents.push(c);
  }
}

/* Metin bloğunun kutusu: "CELEBRATING / 20 YEARS & / COUNTING" harfleri küçük
   bileşenler. "I" gibi ince, dik harfler ışın ölçütüne takılabiliyor (ilk
   çalıştırmada üç harf ışın sanıldı); bu kutunun içine düşen her "ışın" geri
   metne verilir. Gerçek ışın demeti metnin sağında, kutunun dışında kalıyor. */
const letters = typeComponents.filter((c) => c.n < W * H * 0.0004);
if (letters.length > 4) {
  const box = letters.reduce(
    (acc, c) => ({
      minX: Math.min(acc.minX, c.bbox.minX),
      maxX: Math.max(acc.maxX, c.bbox.maxX),
      minY: Math.min(acc.minY, c.bbox.minY),
      maxY: Math.max(acc.maxY, c.bbox.maxY),
    }),
    { minX: W, maxX: 0, minY: H, maxY: 0 },
  );
  const pad = 4;
  for (let i = rays.length - 1; i >= 0; i--) {
    const r = rays[i];
    const cx = (r.x1 + r.x2) / 2;
    const cy = (r.y1 + r.y2) / 2;
    if (cx > box.minX - pad && cx < box.maxX + pad && cy > box.minY - pad && cy < box.maxY + pad) {
      rays.splice(i, 1);
      const back = measured.find(
        (c) => Math.abs(c.cx - cx) < 1.5 && Math.abs(c.cy - cy) < 1.5 && c !== ringCandidate,
      );
      if (back) typeComponents.push(back);
    }
  }
}

// Işınlar merkezden dışa doğru yönlendirilir (x1 içeride, x2 dışarıda) ki
// `stroke-dashoffset` ile çizildiklerinde dışa doğru fırlasınlar.
for (const ray of rays) {
  const d1 = Math.hypot(ray.x1 - ring.cx, ray.y1 - ring.cy);
  const d2 = Math.hypot(ray.x2 - ring.cx, ray.y2 - ring.cy);
  if (d1 > d2) {
    [ray.x1, ray.x2] = [ray.x2, ray.x1];
    [ray.y1, ray.y2] = [ray.y2, ray.y1];
  }
}
// Saat yönünde sırala: animasyonda ışınlar sırayla açılsın.
rays.sort((a, b) => a.a - b.a);

/* ---------- 5. Geri kalan ("2" + metin) alfa kanallı webp ---------- */

const rgba = Buffer.alloc(W * H * 4);
const keep = new Uint8Array(W * H);
for (const c of typeComponents) for (const p of c.pixels) keep[p] = 1;

for (let i = 0; i < W * H; i++) {
  const o = i * C;
  const a = keep[i] ? lum[i] : 0;
  rgba[i * 4 + 3] = a;
  if (a > 0) {
    // Unpremultiply: siyah zemine "eklenmiş" rengi kendi doygunluğuna döndür.
    const k = 255 / a;
    rgba[i * 4] = Math.min(255, Math.round(data[o] * k));
    rgba[i * 4 + 1] = Math.min(255, Math.round(data[o + 1] * k));
    rgba[i * 4 + 2] = Math.min(255, Math.round(data[o + 2] * k));
  }
}
const typeInfo = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
  .webp({ quality: 88, alphaQuality: 92 })
  .toFile(OUT_IMAGE);

/* ---------- 6. Altın gradyanı: halkanın kendi renginden örneklenir ------- */

/*
 * Gradyan sol-üstten sağ-alta akıyor. Tek bir noktadan örneklemek yanıltıyor
 * (ilk deneme halkanın parlak iç kenarına denk geldi, renk soluk çıktı):
 * çizimin GÜÇLÜ pikselleri köşegene izdüşürülüp uçlardaki %12'lik dilimlerin
 * ortalaması alınır.
 */
function goldEnds() {
  const samples = [];
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      const i = y * W + x;
      if (lum[i] < 150) continue;
      samples.push({ t: (x + y) / (W + H), o: i * C });
    }
  }
  // Konuma göre sıralamak gradyanı düzleştiriyordu (her iki uçta da hem
  // parlak hem koyu parçalar var). Asıl fark parlaklıkta: en açık ve en koyu
  // altın dilimlerin ortalaması, işaretin gerçek gradyan uçlarını veriyor.
  samples.sort((a, b) => lum[b.o / C] - lum[a.o / C]);
  const slice = Math.max(1, Math.floor(samples.length * 0.1));
  const mean = (list) => {
    let r = 0;
    let g = 0;
    let b = 0;
    for (const s of list) {
      r += data[s.o];
      g += data[s.o + 1];
      b += data[s.o + 2];
    }
    const hex = (v) => Math.round(v / list.length).toString(16).padStart(2, "0");
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  };
  return [mean(samples.slice(0, slice)), mean(samples.slice(-slice))];
}
const [goldFrom, goldTo] = goldEnds();

/* ---------- 7. Geometri verisi ---------- */

const f = (v) => Number(v.toFixed(2));
const file = `/**
 * "20 YEARS & COUNTING" işaretinin vektör geometrisi — ÜRETİLMİŞ DOSYA.
 * Kaynak: public/images/site/friends-anniversary.png
 * Üretim:  node scripts/extract-anniversary-mark.mjs
 * Elle düzenlenmez; işaret değişirse script yeniden çalıştırılır.
 *
 * Koordinatlar ${W}x${H}'lik viewBox'a göre. "2" rakamı ve alt metin
 * ${path.basename(OUT_IMAGE)} içinde (alfa kanallı), aynı viewBox'a oturur.
 */
export const ANNIVERSARY_VIEWBOX = ${W};

export const ANNIVERSARY_RING = { cx: ${f(ring.cx)}, cy: ${f(ring.cy)}, r: ${f(ring.r)}, stroke: ${f(ring.stroke)} } as const;

/** İşaretin kendi altın gradyanı (sol-üst → sağ-alt), rasterden örneklendi. */
export const ANNIVERSARY_GOLD = { from: "${goldFrom}", to: "${goldTo}" } as const;

/** Merkezden dışa doğru sıralı ışınlar (saat yönünde). */
export const ANNIVERSARY_RAYS = [
${rays.map((r) => `  { x1: ${f(r.x1)}, y1: ${f(r.y1)}, x2: ${f(r.x2)}, y2: ${f(r.y2)}, w: ${f(r.w)} },`).join("\n")}
] as const;
`;
writeFileSync(OUT_DATA, file);

console.log(`bileşen: ${measured.length}  ışın: ${rays.length}  tip parçası: ${typeComponents.length}`);
console.log(`halka: merkez ${f(ring.cx)},${f(ring.cy)} yarıçap ${f(ring.r)} kalınlık ${f(ring.stroke)}`);
console.log(`${path.basename(OUT_IMAGE)}: ${(typeInfo.size / 1024).toFixed(0)} KB`);
