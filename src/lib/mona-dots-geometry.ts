/**
 * MONA parçacık bulutu — saf fonksiyonlar, DOM/WebGL bağımlılığı yok.
 *
 * Katmanlar:
 *   kabuk    — Fibonacci dizilimiyle birim küre; shader bunu dalgalı,
 *              parlayan kenarlı organik bir kütleye çevirir
 *   çekirdek — içeride, merkeze doğru yoğunlaşan noktalar
 *   hale     — kabuğun hemen dışında seyrek noktalar
 *   toz      — daha uzakta, çok sönük ve pırıldayan noktalar
 *   aura     — büyük, çok sönük sprite'lar; kütlenin etrafında ışıma bulutu.
 *              Dizinin sonunda durur ki dar ekranda çizimden çıkarılabilsin.
 *
 * Kabuk ve çekirdek noktaları için göz, kalp ve halka hedef konumları da
 * önceden hesaplanır; shader kütleyle bu şekiller arasında geçiş yapar.
 * Delikler burada oyulmaz: shader'da zamanla kayan bir alanla açılıp kapanır.
 * Aynı tohum her render'da aynı bulutu verir.
 */

export const LAYER = { shell: 0, core: 1, halo: 2, dust: 3, haze: 4 } as const;

export interface ParticleCloud {
  /** xyz üçlüleri (birim küre ölçeğinde). */
  positions: Float32Array;
  /** Nokta başına [faz 0..2π, boyut, katman, açılış gecikmesi 0..MAX_DELAY]. */
  meta: Float32Array;
  /** Açılışta noktanın ekran dışındaki başlangıcı (NDC, xy). */
  starts: Float32Array;
  /** Göz hedefi xyzw — w=1 olan noktalar (iris, gözbebeği) bakışı izler. */
  eye: Float32Array;
  heart: Float32Array;
  ring: Float32Array;
  count: number;
  /** Dizinin sonundaki aura noktası sayısı. */
  hazeCount: number;
}

export interface ParticleCloudOptions {
  seed?: number;
  shell?: number;
  core?: number;
  halo?: number;
  dust?: number;
  haze?: number;
}

export const MAX_DELAY = 0.3;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const STREAMS = 8;

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

type Vec3 = [number, number, number];

function eyeTarget(shell: boolean, random: () => number): [number, number, number, number] {
  const angle = random() * Math.PI * 2;
  if (shell && random() < 0.5) {
    // Badem biçimli kapaklar: köşelerde sivrilen üst ve alt eğri.
    const sin = Math.sin(angle);
    const lid = sin >= 0 ? 0.62 : 0.5;
    const jitter = 1 + (random() - 0.5) * 0.05;
    return [1.15 * Math.cos(angle) * jitter, lid * sin * (0.55 + 0.45 * Math.abs(sin)) * jitter,
      (random() - 0.5) * 0.12, 0];
  }
  const [inner, outer] = shell ? [0.34, 0.46] : random() < 0.7 ? [0, 0.2] : [0.2, 0.34];
  const radius = Math.sqrt(inner * inner + random() * (outer * outer - inner * inner));
  return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0.05 + random() * 0.07, 1];
}

function heartTarget(shell: boolean, random: () => number): Vec3 {
  const t = random() * Math.PI * 2;
  const x = (16 * Math.pow(Math.sin(t), 3)) / 17;
  const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17;
  const fill = shell ? 0.9 + random() * 0.1 : 0.9 * Math.sqrt(random());
  const depth = 0.32 * Math.sqrt(Math.max(0, 1 - fill * fill)) + 0.04;
  return [x * fill * 1.1, (y * fill + 0.15) * 1.1, (random() - 0.5) * 2 * depth];
}

export const RING_RADIUS = 0.95;
export const RING_TUBE = 0.13;

function ringTarget(shell: boolean, random: () => number): Vec3 {
  const u = random() * Math.PI * 2;
  const v = random() * Math.PI * 2;
  const tube = shell ? RING_TUBE : RING_TUBE * 0.9 * Math.sqrt(random());
  const r = RING_RADIUS + tube * Math.cos(v);
  return [r * Math.cos(u), r * Math.sin(u), tube * Math.sin(v)];
}

export function createParticleCloud({
  seed = 360,
  shell = 11000,
  core = 4000,
  halo = 2500,
  dust = 800,
  haze = 700,
}: ParticleCloudOptions = {}): ParticleCloud {
  const random = mulberry32(seed);
  const count = shell + core + halo + dust + haze;
  const positions = new Float32Array(count * 3);
  const meta = new Float32Array(count * 4);
  const starts = new Float32Array(count * 2);
  const eye = new Float32Array(count * 4);
  const heart = new Float32Array(count * 3);
  const ring = new Float32Array(count * 3);

  const randomDirection = (): Vec3 => {
    const y = random() * 2 - 1;
    const r = Math.sqrt(1 - y * y);
    const theta = random() * Math.PI * 2;
    return [Math.cos(theta) * r, y, Math.sin(theta) * r];
  };

  let index = 0;
  const push = (point: Vec3, layer: number, delay: number, size: number) => {
    positions.set(point, index * 3);
    meta.set([random() * Math.PI * 2, size, layer, delay], index * 4);

    // Açılış: ekranın kenarlarından 8 akıntı halinde; her nokta görünür
    // alanın hemen dışında (kare sınırın 1.08–1.5 katı) başlar.
    const stream = Math.floor(random() * STREAMS);
    const angle = (stream / STREAMS) * Math.PI * 2 + (random() - 0.5) * 0.35;
    const c = Math.cos(angle), s = Math.sin(angle);
    const reach = (1.08 + random() * 0.42) / Math.max(Math.abs(c), Math.abs(s));
    starts.set([c * reach, s * reach], index * 2);

    const body = layer === LAYER.shell || layer === LAYER.core;
    const isShell = layer === LAYER.shell;
    eye.set(body ? eyeTarget(isShell, random) : [...point, 0], index * 4);
    heart.set(body ? heartTarget(isShell, random) : point, index * 3);
    ring.set(body ? ringTarget(isShell, random) : point, index * 3);
    index++;
  };
  // Çoğu nokta küçük, azı belirgin biçimde büyük (uzun kuyruk).
  const dotSize = () => 0.6 + Math.pow(random(), 6) * 2.6;

  for (let i = 0; i < shell; i++) {
    const y = 1 - (2 * (i + 0.5)) / shell;
    const r = Math.sqrt(1 - y * y);
    const theta = i * GOLDEN_ANGLE;
    const radius = 1 + (random() - 0.5) * 0.04;
    push([Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius],
      LAYER.shell, random() * MAX_DELAY, dotSize());
  }
  for (let i = 0; i < core; i++) {
    const [x, y, z] = randomDirection();
    const radius = 0.78 * Math.pow(random(), 0.9);
    // Çekirdek en son dolar: kabuk oturduktan sonra içi parlar.
    push([x * radius, y * radius, z * radius], LAYER.core, 0.15 + random() * 0.15, dotSize());
  }
  for (let i = 0; i < halo; i++) {
    const [x, y, z] = randomDirection();
    const radius = 1.15 + random() * 0.75;
    push([x * radius, y * radius, z * radius], LAYER.halo, random() * MAX_DELAY, dotSize());
  }
  for (let i = 0; i < dust; i++) {
    const [x, y, z] = randomDirection();
    const radius = 1.9 + random() * 1.3;
    // Toz ilk gelir: sahneye önce atmosfer düşer.
    push([x * radius, y * radius, z * radius], LAYER.dust, random() * 0.15, dotSize());
  }
  for (let i = 0; i < haze; i++) {
    const [x, y, z] = randomDirection();
    const radius = 0.15 + random() * 0.8;
    push([x * radius, y * radius, z * radius], LAYER.haze, 0.25 + random() * 0.05, 8 + random() * 6);
  }

  return { positions, meta, starts, eye, heart, ring, count, hazeCount: haze };
}

export interface ProjectedDot {
  x: number;
  y: number;
  /** 0 arka yüz .. 1 izleyiciye en yakın. */
  depth: number;
}

/**
 * SVG yedeği için ortografik izdüşüm: yalnızca kabuk ve çekirdek noktaları,
 * sabit bir açıyla döndürülür ve izleyiciye bakan yarısı döndürülür.
 */
export function projectFrontDots(cloud: ParticleCloud, yaw = 0.6, pitch = 0.25): ProjectedDot[] {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const dots: ProjectedDot[] = [];
  for (let i = 0; i < cloud.count; i++) {
    if (cloud.meta[i * 4 + 2] > LAYER.core) continue;
    const x0 = cloud.positions[i * 3];
    const y0 = cloud.positions[i * 3 + 1];
    const z0 = cloud.positions[i * 3 + 2];
    const x1 = cy * x0 + sy * z0;
    const z1 = -sy * x0 + cy * z0;
    const y2 = cp * y0 - sp * z1;
    const z2 = sp * y0 + cp * z1;
    if (z2 <= 0) continue;
    dots.push({ x: x1, y: y2, depth: Math.min(1, z2) });
  }
  return dots;
}
