/**
 * Yıldız alanı modeli — Hibrid ekosistem sahnesinin arka planı.
 *
 * Neden ayrı bir modül: eski sahnede yıldızlar tekrarlayan bir CSS
 * `background-size` desenindeydi; tekrar aralığı gözle seçiliyordu ve
 * alan "duvar kâğıdı" gibi okunuyordu (bkz. docs/visual-audit/
 * NEXT_UI_ART_DIRECTION_TASKS.md §1.6). Gerçek bir yıldız alanı
 * düzensizdir — bu yüzden konumlar tohumlanmış bir RNG ile bir kez
 * üretilip canvas'a çiziliyor.
 *
 * Buradaki her şey saf fonksiyon: canvas/DOM bilmez, birim testi
 * edilebilir (src/lib/starfield.test.ts).
 */

/**
 * mulberry32 — 32 bit tohumlu, hızlı, bağımlılıksız PRNG.
 * Tohumlu olması önemli: aynı tohum aynı yıldız alanını üretir, yani
 * sahne her mount'ta yeniden dizilmez ve testler deterministiktir.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Service points and their trails retain the brand palette. */
export type StarTint = "white" | "yellow" | "fuchsia";

export const STAR_RGB: Record<StarTint, string> = {
  white: "255, 255, 255",
  yellow: "255, 252, 0",
  fuchsia: "255, 0, 255",
};

export const STARLIGHT_RGB = {
  white: "248, 249, 255",
  cool: "202, 218, 255",
  warm: "255, 232, 207",
} as const;

export interface Star {
  /** Normalize konum (0..1) — sahne yeniden boyutlanınca oran korunur. */
  x: number;
  y: number;
  /**
   * Yarıçap, CSS pikseli cinsinden (çizerken dpr ile çarpılır).
   *
   * Sanal sahne birimi DEĞİL: sahne mobilde 358px, masaüstünde 1100px
   * geniş olduğu için sanal birim kullanılırsa yıldızlar mobilde piksel
   * altına düşüp kayboluyordu. Noktalar da rem ile boyutlandığı için
   * ölçünün mutlak olması iki katmanı tutarlı tutuyor.
   */
  radius: number;
  /** Sönümlenmemiş temel parlaklık (0..1). */
  alpha: number;
  /** Sönüp parlama fazı ve hızı — hepsi aynı anda parlamasın. */
  phase: number;
  speed: number;
  /**
   * Paralaks katmanı: 0 = en uzak (neredeyse sabit), 2 = en yakın.
   * İmleç hareketinde ve sürüklenmede katmanlar farklı hızda kayar;
   * derinlik hissi buradan geliyor.
   */
  layer: 0 | 1 | 2;
  tint: keyof typeof STARLIGHT_RGB;
}

/** Katman başına paralaks çarpanı. */
export const STAR_PARALLAX = [0.25, 0.6, 1] as const;

/** Bounded drift amplitude: distant stars never sweep across the scene. */
export const STAR_DRIFT = [0.0005, 0.0009, 0.0015] as const;

/**
 * Gerçek bir gökyüzünde çok sayıda sönük, az sayıda parlak yıldız vardır.
 * `rng()**3` bu dağılımı verir — düz `rng()` kullanılırsa alan homojen
 * ve yapay görünür.
 */
export function createStarfield(seed: number, count: number): Star[] {
  const rng = mulberry32(seed);
  const stars: Star[] = [];

  for (let i = 0; i < count; i++) {
    const brightness = rng() ** 3;
    const layerRoll = rng();
    const layer: 0 | 1 | 2 = layerRoll < 0.55 ? 0 : layerRoll < 0.85 ? 1 : 2;

    const tintRoll = rng();
    const tint: Star["tint"] =
      tintRoll < 0.78 ? "white" : tintRoll < 0.92 ? "cool" : "warm";

    stars.push({
      x: rng(),
      y: rng(),
      radius: 0.35 + brightness * 1.05,
      alpha: 0.22 + brightness * 0.7,
      phase: rng() * Math.PI * 2,
      // Sönük yıldızlar daha hızlı titrer — atmosferik sintilasyon böyle
      // okunur; parlak yıldızlar daha sakin durur.
      speed: 0.35 + (1 - brightness) * 1.5,
      layer,
      tint,
    });
  }

  return stars;
}

/** Smooth, unsynchronized scintillation, with a sub-pixel orbital drift. */
export function starAppearance(star: Star, seconds: number, reduced = false) {
  if (reduced) return { x: star.x, y: star.y, alpha: star.alpha * 0.78 };
  const phase = seconds * star.speed + star.phase;
  const shimmer =
    0.6 +
    Math.sin(phase * 0.67) * 0.24 +
    Math.sin(phase * 1.37 + star.phase * 0.7) * 0.12 +
    Math.sin(phase * 2.41) * 0.04;
  const drift = STAR_DRIFT[star.layer];
  return {
    x: Math.max(
      0,
      Math.min(1, star.x + Math.sin(seconds * 0.045 + star.phase) * drift),
    ),
    y: Math.max(
      0,
      Math.min(
        1,
        star.y + Math.cos(seconds * 0.033 + star.phase) * drift * 0.6,
      ),
    ),
    alpha: star.alpha * shimmer,
  };
}

export interface ShootingStar {
  /** Normalize başlangıç konumu. */
  x: number;
  y: number;
  /** Normalize hız (birim/saniye). */
  vx: number;
  vy: number;
  /** Geçen süre ve toplam ömür (saniye). */
  age: number;
  ttl: number;
  /** Kuyruk uzunluğu, normalize birim. */
  length: number;
  tint: StarTint;
}

/**
 * Kayan yıldız: sahnenin üst bandından girer, çapraz iner, kısa yaşar.
 * Ekranın ortasından geçmesi için başlangıç x'i geniş bir aralıktan
 * seçiliyor; yön her zaman aşağı-yana (gerçek meteorlar gibi).
 */
export function spawnShootingStar(rng: () => number): ShootingStar {
  const toLeft = rng() < 0.5;
  const speed = 0.55 + rng() * 0.5;
  // Yatayda baskın, dikeyde hafif — çok dik inen meteor yapay görünüyor.
  // Aralık 14.4°–39.6°: tamamı 45°'nin altında, yani |vx| her zaman
  // |vy|'den büyük. (Önceki 28.8°–64.8° aralığı dikey baskın meteorlar
  // da üretiyordu; birim testi yakaladı.)
  const angle = (0.08 + rng() * 0.14) * Math.PI;

  const tintRoll = rng();
  const tint: StarTint =
    tintRoll < 0.72 ? "white" : tintRoll < 0.88 ? "yellow" : "fuchsia";

  return {
    x: toLeft ? 0.72 + rng() * 0.42 : -0.14 + rng() * 0.42,
    y: -0.06 + rng() * 0.34,
    vx: (toLeft ? -1 : 1) * Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    age: 0,
    ttl: 0.75 + rng() * 0.55,
    length: 0.1 + rng() * 0.12,
    tint,
  };
}

/** İki kayan yıldız arası bekleme (saniye) — düzenli aralık yapay durur. */
export function nextShootingStarDelay(rng: () => number): number {
  return 3.4 + rng() * 6.5;
}

/**
 * Kayan yıldızın ömrü boyunca opaklık zarfı: hızlı açılır, yavaş söner.
 * Ani beliren/kaybolan çizgi "CSS animasyonu" gibi okunuyor; zarf bunu
 * bir ışık izine çeviriyor.
 */
export function shootingStarAlpha(star: ShootingStar): number {
  const t = star.age / star.ttl;
  if (t <= 0 || t >= 1) return 0;
  return Math.min(1, t / 0.18) * (1 - t) ** 1.5;
}

/** Ömrü dolan yıldızları eleyip kalanları ilerletir. */
export function advanceShootingStars(
  stars: ShootingStar[],
  dt: number,
): ShootingStar[] {
  const alive: ShootingStar[] = [];
  for (const star of stars) {
    star.age += dt;
    star.x += star.vx * dt;
    star.y += star.vy * dt;
    if (star.age < star.ttl) alive.push(star);
  }
  return alive;
}
