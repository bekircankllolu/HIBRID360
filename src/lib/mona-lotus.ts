/**
 * MONA'nın nilüfer şekli — saf fonksiyonlar, DOM/WebGL bağımlılığı yok
 * (docs/DECISIONS.md #48, altıncı geri bildirim turu: "bu sayfadaki mona
 * arada bir bu şekli alsın").
 *
 * Çiçek yeni bir çizim değil: MONA'nın kendi kabuk ve çekirdek noktaları
 * kullanıcının referans görselinden üretilmiş yoğunluk haritasına akar
 * (`mona-lotus-density.ts`, `scripts/generate-mona-lotus.mjs`). Göz/kalp/
 * halka hedefleri gibi hedefler önceden hesaplanır; shader kütleyle çiçek
 * arasında geçiş yapar (`mona-dots-scene.ts`, `u_shape.w`).
 *
 * Program: açılıştan kısa süre sonra ilk kez, sonra 30–45 sn'de bir çiçek
 * açar, bir süre açık kalır ve yeniden küreye kapanır. Rastgelelik dışarıdan
 * verilir, testler deterministik.
 */

import { LAYER, type ParticleCloud } from "./mona-dots-geometry";

/** Çiçeğin model uzayındaki boyu: görselin [-1, 1] karesi × bu değer (küre yarıçapı = 1). */
export const LOTUS_SCALE = 0.85;

/**
 * Çiçek anında bütün kütlenin (hale, toz, aura dahil) kayması, model
 * biriminde (küre yarıçapı = 1). `MonaShard`'da kürenin merkezi sayfanın
 * sağ kenarında; çiçek orada açılsa yarısı ekran dışında kalırdı. Sola ve
 * biraz yukarı kayınca tamamı görünür alanda açılıyor.
 */
export const LOTUS_OFFSET = { x: -0.95, y: 0.35 } as const;

/** Çiçek gövdesinin kalınlığı (model birimi): tamamen düz değil, ince bir hacim. */
const LOTUS_DEPTH = 0.12;
/**
 * Kabuk haritayı olduğu gibi izler → parlak yaprak kenarlarını çizer (küredeki
 * parlak kabuğun karşılığı). Çekirdek yumuşatılmış haritadan → yaprakların
 * içini sönük noktalarla doldurur, referans görseldeki gibi.
 */
const CORE_EXPONENT = 0.5;

export interface LotusDensity {
  /** Kare haritanın kenar uzunluğu (hücre). */
  size: number;
  /** Üstten alta satırlar, hücre başına bir bayt, base64. */
  data: string;
}

export function decodeDensity({ size, data }: LotusDensity): Uint8Array {
  const binary = atob(data);
  if (binary.length !== size * size) {
    throw new Error(`Lotus density: ${binary.length} cells, expected ${size * size}`);
  }
  const cells = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) cells[i] = binary.charCodeAt(i);
  return cells;
}

/**
 * Haritadan ağırlıklı örnek: parlak hücreye daha çok nokta düşer, nokta
 * hücrenin içinde rastgele bir yere oturur. Sonuç `count` adet (u, v) çifti;
 * u sağa, v yukarı artar, ikisi de [-1, 1]. `exponent` < 1 dağılımı
 * yumuşatır (sönük hücreler de pay alır), 1 haritayı olduğu gibi kullanır.
 */
export function sampleDensity(
  density: Uint8Array,
  size: number,
  count: number,
  random: () => number,
  exponent = 1,
): Float32Array {
  const cumulative = new Float64Array(density.length);
  let total = 0;
  for (let i = 0; i < density.length; i++) {
    total += density[i] > 0 ? Math.pow(density[i] / 255, exponent) : 0;
    cumulative[i] = total;
  }
  if (total <= 0) throw new Error("Lotus density is empty");

  const samples = new Float32Array(count * 2);
  for (let k = 0; k < count; k++) {
    const pick = random() * total;
    let low = 0;
    let high = cumulative.length - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (cumulative[mid] > pick) high = mid;
      else low = mid + 1;
    }
    const column = low % size;
    const row = Math.floor(low / size);
    samples[k * 2] = ((column + random()) / size) * 2 - 1;
    samples[k * 2 + 1] = 1 - ((row + random()) / size) * 2;
  }
  return samples;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Buluttaki her nokta için nilüfer hedefi (xyz). Kabuk ve çekirdek çiçeğe
 * gider; hale, toz ve aura kendi yerinde kalır — kalp/halka hedefleriyle
 * aynı sözleşme. Kendi tohumuyla çalışır: bulutun rastgele dizisine
 * dokunmaz, MONA sayfasındaki bulut değişmez.
 */
export function lotusTargets(
  cloud: Pick<ParticleCloud, "count" | "positions" | "meta">,
  density: LotusDensity,
  seed = 808,
): Float32Array {
  const random = mulberry32(seed);
  const targets = new Float32Array(cloud.count * 3);
  const layerOf = (index: number) => cloud.meta[index * 4 + 2];
  let shellCount = 0;
  let coreCount = 0;
  for (let index = 0; index < cloud.count; index++) {
    if (layerOf(index) === LAYER.shell) shellCount++;
    else if (layerOf(index) === LAYER.core) coreCount++;
  }
  const cells = decodeDensity(density);
  const pools = {
    [LAYER.shell]: { samples: sampleDensity(cells, density.size, shellCount, random), next: 0 },
    [LAYER.core]: { samples: sampleDensity(cells, density.size, coreCount, random, CORE_EXPONENT), next: 0 },
  };

  for (let index = 0; index < cloud.count; index++) {
    const layer = layerOf(index);
    if (layer !== LAYER.shell && layer !== LAYER.core) {
      targets.set(cloud.positions.subarray(index * 3, index * 3 + 3), index * 3);
      continue;
    }
    const pool = pools[layer];
    targets[index * 3] = pool.samples[pool.next * 2] * LOTUS_SCALE;
    targets[index * 3 + 1] = pool.samples[pool.next * 2 + 1] * LOTUS_SCALE;
    targets[index * 3 + 2] = (random() - 0.5) * LOTUS_DEPTH;
    pool.next++;
  }
  return targets;
}

/* ------------------------------------------------------------------ */
/* Program: ne zaman açar, ne kadar açık kalır                          */
/* ------------------------------------------------------------------ */

export const BLOOM_RISE = 2.6;
export const BLOOM_HOLD = 5.5;
export const BLOOM_FALL = 2.6;
export const BLOOM_TOTAL = BLOOM_RISE + BLOOM_HOLD + BLOOM_FALL;
/** İlk çiçek: sahne başladıktan bu kadar saniye sonra (aralık). */
export const FIRST_BLOOM_MIN = 12;
export const FIRST_BLOOM_MAX = 15;
/** Sonrakiler: bir çiçeğin başlangıcından diğerininkine (aralık). */
export const BLOOM_EVERY_MIN = 30;
export const BLOOM_EVERY_MAX = 45;

export interface LotusState {
  /** Sahnenin görünür kaldığı toplam süre (sn). */
  clock: number;
  /** Şu anki ya da sıradaki çiçeğin başlangıcı (sn). */
  start: number;
}

/** Yumuşak başlayıp yumuşak biten eğri: noktalar sarsılmadan hızlanıp yavaşlar. */
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export function bloomWeight(t: number): number {
  if (t <= 0 || t >= BLOOM_TOTAL) return 0;
  if (t < BLOOM_RISE) return smoother(t / BLOOM_RISE);
  if (t <= BLOOM_RISE + BLOOM_HOLD) return 1;
  return smoother((BLOOM_TOTAL - t) / BLOOM_FALL);
}

export function createLotus(random: () => number): LotusState {
  return { clock: 0, start: FIRST_BLOOM_MIN + random() * (FIRST_BLOOM_MAX - FIRST_BLOOM_MIN) };
}

export function stepLotus(state: LotusState, dt: number, random: () => number): LotusState {
  const clock = state.clock + dt;
  let start = state.start;
  while (clock >= start + BLOOM_TOTAL) {
    start += BLOOM_EVERY_MIN + random() * (BLOOM_EVERY_MAX - BLOOM_EVERY_MIN);
  }
  return { clock, start };
}

export function lotusWeight(state: LotusState): number {
  return bloomWeight(state.clock - state.start);
}
