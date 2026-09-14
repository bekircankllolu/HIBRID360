/**
 * MonaDrift — sayfa genelinde serbestçe gezinen ambient noktalar, saf
 * mantık (DOM/Canvas yok). 13 Eylül 2026, dördüncü geri bildirim turu
 * (DECISIONS #45): "tüm sayfada mona'nın noktacıklarına benzer noktalar
 * özgürce dolaşsın" — köşedeki `MonaShard`'dan (mıknatıs, tık tepkisi,
 * yay fiziği) bilerek AYRI ve daha sade: yalnız düz çizgisel sürüklenme +
 * kenarlardan sarma. Etkileşim yok — tamamen dekoratif doku.
 */

export interface DriftDot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  /** Parıldama fazı — render katmanında opacity'ye çevrilir. */
  phase: number;
}

export interface DriftBounds {
  width: number;
  height: number;
}

const SPEED_MIN = 4;
const SPEED_MAX = 14;
const SIZE_MIN = 0.8;
const SIZE_MAX = 2.6;
/** Kenardan tam sınırda sarmak yerine küçük bir pay — "pop" hissini yumuşatır. */
const WRAP_MARGIN = 24;

/**
 * Creative sayfasinda MONA dokusunun dikey ritmi. Hero boyunca yogunluk
 * korunur; manifesto ilerledikce noktalar ana metinden geri cekilir.
 */
export function driftDensity(scrollY: number, viewportHeight: number): number {
  if (!Number.isFinite(scrollY) || !Number.isFinite(viewportHeight) || viewportHeight <= 0) {
    return 1;
  }
  const start = viewportHeight * 0.55;
  const end = viewportHeight * 1.55;
  const t = Math.min(1, Math.max(0, (scrollY - start) / (end - start)));
  const eased = t * t * (3 - 2 * t);
  return 1 - eased * 0.6;
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

export function createDriftDots(bounds: DriftBounds, count: number, seed = 21): DriftDot[] {
  const random = mulberry32(seed);
  const dots: DriftDot[] = [];
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    const speed = SPEED_MIN + random() * (SPEED_MAX - SPEED_MIN);
    dots.push({
      x: random() * bounds.width,
      y: random() * bounds.height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: SIZE_MIN + random() * (SIZE_MAX - SIZE_MIN),
      phase: random() * Math.PI * 2,
    });
  }
  return dots;
}

/** Bir kare ilerletir; girdi değiştirilmez, yeni bir dizi döner. */
export function stepDrift(
  dots: readonly DriftDot[],
  bounds: DriftBounds,
  dt: number,
): DriftDot[] {
  return dots.map((dot) => {
    let x = dot.x + dot.vx * dt;
    let y = dot.y + dot.vy * dt;
    if (x < -WRAP_MARGIN) x = bounds.width + WRAP_MARGIN;
    else if (x > bounds.width + WRAP_MARGIN) x = -WRAP_MARGIN;
    if (y < -WRAP_MARGIN) y = bounds.height + WRAP_MARGIN;
    else if (y > bounds.height + WRAP_MARGIN) y = -WRAP_MARGIN;
    return { ...dot, x, y, phase: dot.phase + dt };
  });
}
