/**
 * MONA'nın "yaşayan varlık" davranışı — saf durum makinesi, DOM/WebGL yok.
 *
 * Her karede `stepCreature(state, input, dt, random)` çağrılır; sahneye giden
 * değerleri `creatureFrame(state)` üretir. Rastgelelik dışarıdan verilir,
 * böylece testler deterministik çalışır.
 *
 *   uyku    — SLEEP_AFTER saniye etkileşim yoksa küçülür, sönükleşir, nefesi
 *             yavaşlar ve derinleşir; her etkileşim yay gibi uyandırır
 *   irkilme — her tık sönümlü bir yaya darbe verir: anında büzülüp açılır
 *   kaçış   — art arda SCATTER_TAPS tıkta noktalar tıktan uzağa saçılır,
 *             bekler ve yeniden toplanır
 *   biçim   — organik dalga alanının parametreleri rastgele hedeflere kayar
 *   şekiller — uyanıkken ara sıra göz, kalp ya da halkaya girip çıkar
 */

export type Mood = "awake" | "sleeping" | "scattered";
export type ShapeName = "blob" | "eye" | "heart" | "ring";
export const SHAPES: readonly Exclude<ShapeName, "blob">[] = ["eye", "heart", "ring"];

export const SLEEP_AFTER = 20;
const FALL_ASLEEP = 3;
const TAP_WINDOW = 1.5;
export const SCATTER_TAPS = 4;
const SCATTER_OUT = 0.6;
const SCATTER_HOLD = 1.2;
const SCATTER_BACK = 2;
const SHAPE_IN = 1.4;
const SHAPE_HOLD = 4;
const SHAPE_OUT = 1.4;
const BLINK_TIME = 0.18;
/** İrkilme yayı: sertlik ve sönüm (~2 Hz, iki salınımda durulur). */
const SPRING_K = 180;
const SPRING_C = 14;
/** ζ≈0.52 sönümle tepe büzülme ≈ |darbe| / ω × 0.54 → ~%18. */
const TAP_IMPULSE = -4.5;

type Vec4 = [number, number, number, number];

export interface CreatureInput {
  /** İmleç bu karede sahnede hareket etti mi. */
  pointerMoved: boolean;
  /** Bu karedeki tıklar, canvas'a oranla (0..1). */
  taps: readonly { x: number; y: number }[];
  keyed: boolean;
  /** Konuşma seviyesi 0..1 (ses ya da daktilo nabzı). */
  speaking: number;
}

export interface CreatureState {
  clock: number;
  idle: number;
  mood: Mood;
  sleep: number;
  wake: number;
  breathPhase: number;
  squash: number;
  squashVelocity: number;
  flash: number;
  tapTimes: number[];
  scatterStage: "none" | "out" | "hold" | "back";
  scatterTimer: number;
  scatter: number;
  scatterOrigin: [number, number];
  shape: ShapeName;
  shapeStage: "idle" | "in" | "hold" | "out";
  shapeTimer: number;
  shapeWeight: number;
  nextShapeIn: number;
  blinkIn: number;
  blinkTimer: number;
  morph: Vec4;
  morphTarget: Vec4;
  morphIn: number;
}

export interface CreatureFrame {
  mood: Mood;
  shape: ShapeName;
  /** Genel ölçek: uyku, nefes, irkilme, uyanma ve kalp atışı birlikte. */
  scale: number;
  /** Parlaklık çarpanı (uykuda düşer). */
  dim: number;
  flash: number;
  /** Sahne zamanının akış hızı (uykuda yavaşlar). */
  timeScale: number;
  scatter: number;
  scatterOrigin: [number, number];
  /** Göz, kalp, halka ağırlıkları (toplamı ≤ 1). */
  shapeWeights: [number, number, number];
  blink: number;
  morph: Vec4;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const randomMorph = (random: () => number): Vec4 =>
  [0, 0, 0, 0].map(() => (random() - 0.5) * 4) as Vec4;

export function createCreature(random: () => number): CreatureState {
  const morph = randomMorph(random);
  return {
    clock: 0,
    idle: 0,
    mood: "awake",
    sleep: 0,
    wake: 0,
    breathPhase: 0,
    squash: 0,
    squashVelocity: 0,
    flash: 0,
    tapTimes: [],
    scatterStage: "none",
    scatterTimer: 0,
    scatter: 0,
    scatterOrigin: [0.5, 0.5],
    shape: "blob",
    shapeStage: "idle",
    shapeTimer: 0,
    shapeWeight: 0,
    // İlk şekil ilk ziyarette görülsün diye daha erken gelir.
    nextShapeIn: 10 + random() * 6,
    blinkIn: 2.5 + random() * 2,
    blinkTimer: 0,
    morph,
    morphTarget: randomMorph(random),
    morphIn: 5 + random() * 3,
  };
}

/**
 * Bir kare ilerletir. `dt` gerçek geçen süredir: bekleme süresi onunla
 * sayılır, animasyonlar ise kararlılık için 50 ms ile sınırlanır.
 */
export function stepCreature(
  previous: CreatureState,
  input: CreatureInput,
  dt: number,
  random: () => number,
): CreatureState {
  const s: CreatureState = { ...previous, tapTimes: [...previous.tapTimes] };
  const step = Math.min(dt, 0.05);
  s.clock += dt;

  const interacted = input.pointerMoved || input.taps.length > 0 || input.keyed || input.speaking > 0.05;
  s.idle = interacted ? 0 : s.idle + dt;

  // Uyku / uyanma
  if (s.mood === "sleeping" && interacted) {
    s.mood = "awake";
    s.wake = 1;
  } else if (s.mood === "awake" && s.idle > SLEEP_AFTER) {
    s.mood = "sleeping";
  }
  const sleepTarget = s.mood === "sleeping" ? 1 : 0;
  s.sleep = sleepTarget > s.sleep
    ? Math.min(1, s.sleep + step / FALL_ASLEEP)
    : Math.max(0, s.sleep - step / 0.6);
  s.wake = Math.max(0, s.wake - step * 1.5);
  s.breathPhase += step * Math.PI * 2 * (0.3 - 0.18 * s.sleep);

  // Tıklar: irkilme ve kaçış sayımı
  for (const tap of input.taps) {
    const last = s.tapTimes[s.tapTimes.length - 1];
    if (last !== undefined && s.clock - last > TAP_WINDOW) s.tapTimes = [];
    s.tapTimes.push(s.clock);
    s.squashVelocity += TAP_IMPULSE;
    s.flash = 1;
    if (s.tapTimes.length >= SCATTER_TAPS && s.scatterStage === "none") {
      s.tapTimes = [];
      s.scatterStage = "out";
      s.scatterTimer = 0;
      s.scatterOrigin = [tap.x, tap.y];
      s.mood = "scattered";
    }
  }
  s.squashVelocity += (-SPRING_K * s.squash - SPRING_C * s.squashVelocity) * step;
  s.squash += s.squashVelocity * step;
  s.flash = Math.max(0, s.flash - step * 3);

  // Kaçış: yayıl → bekle → toplan
  if (s.scatterStage !== "none") {
    s.scatterTimer += step;
    if (s.scatterStage === "out") {
      s.scatter = 1 - Math.pow(1 - clamp01(s.scatterTimer / SCATTER_OUT), 3);
      if (s.scatterTimer >= SCATTER_OUT) { s.scatterStage = "hold"; s.scatterTimer = 0; }
    } else if (s.scatterStage === "hold") {
      s.scatter = 1;
      if (s.scatterTimer >= SCATTER_HOLD) { s.scatterStage = "back"; s.scatterTimer = 0; }
    } else {
      s.scatter = 1 - smooth(clamp01(s.scatterTimer / SCATTER_BACK));
      if (s.scatterTimer >= SCATTER_BACK) {
        s.scatterStage = "none";
        s.scatter = 0;
        s.mood = "awake";
        s.idle = 0;
      }
    }
  }

  // Sayaçlar (biçim, şekil, göz kırpma) gerçek süreyle sayar; animasyonlar
  // `step` ile sınırlıdır. Döngü sekme gizliyken durduğu için sayaç kaçmaz.
  // Sürekli rastgele biçim
  s.morphIn -= dt;
  if (s.morphIn <= 0) {
    s.morphTarget = randomMorph(random);
    s.morphIn = 5 + random() * 3;
  }
  const follow = 1 - Math.exp(-step * 0.35);
  s.morph = s.morph.map((value, i) => value + (s.morphTarget[i] - value) * follow) as Vec4;

  // Şekil programı
  const calm = s.mood === "awake" && input.speaking <= 0.05;
  if (s.shapeStage === "idle") {
    if (calm) s.nextShapeIn -= dt;
    if (s.nextShapeIn <= 0) {
      const options = SHAPES.filter(shape => shape !== s.shape);
      s.shape = options[Math.floor(random() * options.length)];
      s.shapeStage = "in";
      s.shapeTimer = 0;
    }
  } else {
    s.shapeTimer += step;
    if (!calm && s.shapeStage !== "out") { s.shapeStage = "out"; s.shapeTimer = 0; }
    if (s.shapeStage === "in") {
      s.shapeWeight = clamp01(s.shapeTimer / SHAPE_IN);
      if (s.shapeTimer >= SHAPE_IN) { s.shapeStage = "hold"; s.shapeTimer = 0; }
    } else if (s.shapeStage === "hold") {
      s.shapeWeight = 1;
      if (s.shapeTimer >= SHAPE_HOLD) { s.shapeStage = "out"; s.shapeTimer = 0; }
    } else {
      s.shapeWeight = Math.max(0, s.shapeWeight - step / SHAPE_OUT);
      if (s.shapeWeight <= 0) {
        s.shapeStage = "idle";
        s.nextShapeIn = 14 + random() * 10;
      }
    }
  }

  // Göz kırpma (yalnızca göz şeklindeyken görünür)
  if (s.blinkTimer > 0) s.blinkTimer = Math.max(0, s.blinkTimer - step);
  else {
    s.blinkIn -= dt;
    if (s.blinkIn <= 0) { s.blinkTimer = BLINK_TIME; s.blinkIn = 2.5 + random() * 2; }
  }

  return s;
}

/** Kalp atışı: ~1,1 Hz'de güçlü + zayıf çift vuruş. */
function heartbeat(clock: number): number {
  const p = (clock % 0.9) / 0.9;
  return Math.exp(-Math.pow((p - 0.05) / 0.05, 2)) + 0.6 * Math.exp(-Math.pow((p - 0.28) / 0.05, 2));
}

export function creatureFrame(s: CreatureState): CreatureFrame {
  const sleep = smooth(s.sleep);
  const weight = smooth(s.shapeWeight);
  const active = s.shapeStage === "idle" && weight === 0 ? "blob" : s.shape;
  const weights: [number, number, number] = [
    s.shape === "eye" ? weight : 0,
    s.shape === "heart" ? weight : 0,
    s.shape === "ring" ? weight : 0,
  ];
  const breath = Math.sin(s.breathPhase) * (0.015 + 0.03 * sleep);
  const scale = (1 - 0.28 * sleep) * (1 + s.squash) * (1 + 0.06 * s.wake)
    * (1 + breath) * (1 + 0.06 * heartbeat(s.clock) * weights[1]);
  return {
    mood: s.mood,
    shape: active,
    scale,
    dim: 1 - 0.5 * sleep,
    flash: s.flash,
    timeScale: 1 - 0.65 * sleep,
    scatter: s.scatter,
    scatterOrigin: s.scatterOrigin,
    shapeWeights: weights,
    blink: s.blinkTimer > 0 ? Math.sin(Math.PI * (1 - s.blinkTimer / BLINK_TIME)) : 0,
    morph: s.morph,
  };
}
