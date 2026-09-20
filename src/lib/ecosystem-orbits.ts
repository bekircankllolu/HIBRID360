/**
 * Hibrid ekosistemi — yörünge yerleşimi ve kamera sabitleri.
 *
 * 20 Eylül 2026 yeniden tasarımı (referans: 1.png / 2.png): kristalin
 * çevresinde eşmerkezli, hafif eğik yedi halka; halkalarda sekiz büyük
 * tıklanabilir sarı/fuşya küre ve çok sayıda beyaz süs küre döner.
 *
 * Bu dosya SAF matematiktir (WebGL yok): hem sahne hem DOM etiketleri aynı
 * `ecosystemPosition` fonksiyonundan okur, böylece buton her karede tam
 * kürenin üstünde durur. Halka yarıçapları 1672x941 referans karesinden
 * ölçüldü (yarı büyük eksen piksel oranları).
 */
import type { Vec3 } from "@/lib/solar-orbits";

/** Halka yarıçapları (dünya birimi). İç halkalar sık, dış halkalar kadraj dışına taşar. */
export const ECO_RING_RADII = [2.8, 4.4, 6.4, 8.8, 11.8, 15.4, 19.5] as const;

/** Halka düzleminin Z ekseni etrafındaki eğimi (radyan): referanstaki hafif yatık elipsler. */
export const ECO_TILT = 0.14;

/** Dikey görüş açısı — sahne, bileşen ve odak mesafesi aynı değeri kullanır. */
export const ECO_FOV = Math.PI / 4.4;

export const ECO_CAMERA = {
  distance: 20,
  /** Kameranın halka düzleminden yükseliş açısı: ~19° → elips oranı ~3:1. */
  pitch: 0.33,
  yaw: 0.08,
  /** Kamera yaw salınımı: sonsuz dönme değil, kompozisyon bozulmadan nefes alır. */
  swayAmplitude: 0.16,
  swayPeriod: 96,
  /** Kristal karenin üst üçte birinde dursun diye bakış noktası aşağıda. */
  target: [0, -1.9, 0] as Vec3,
} as const;

/** Kristal düzleminin kenar uzunluğu (dünya birimi). Kadraj sonra ayarlanacak. */
export const ECO_CRYSTAL_SIZE = 4.6;

/** Odaktaki kürenin ekran yüksekliğine oranı ≈ %19 (2.png ölçümü). */
export const ECO_FOCUS_HEIGHT_RATIO = 0.19;

/** Odaktaki küre kadrajda nerede dursun (NDC): sol-alt, kart sağda (2.png). */
export const ECO_FOCUS_NDC = { x: -0.5, y: -0.28 } as const;

export function ecosystemFocusDistance(radius: number): number {
  return radius / (ECO_FOCUS_HEIGHT_RATIO * Math.tan(ECO_FOV / 2));
}

/** Yörünge açısal hızı (rad/sn): iç halka ~1 dk, dış halka ~5 dk — sakin. */
export function ringSpeed(ring: number): number {
  return 0.28 / Math.pow(ECO_RING_RADII[ring], 0.9);
}

/** Halka düzlemindeki açıdan dünya konumuna (eğim dahil). */
export function ecosystemPosition(ring: number, angle: number): Vec3 {
  const radius = ECO_RING_RADII[ring];
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const cos = Math.cos(ECO_TILT);
  const sin = Math.sin(ECO_TILT);
  // R_z(tilt) · (x, 0, z)
  return [x * cos, x * sin, z];
}

/** Halkayı çizmek için dünya-uzayı noktaları (kapalı döngü, son nokta tekrarlanmaz). */
export function ecosystemRingPoints(ring: number, segments = 256): Float32Array {
  const out = new Float32Array(segments * 3);
  for (let i = 0; i < segments; i++) {
    const p = ecosystemPosition(ring, (i / segments) * Math.PI * 2);
    out[i * 3] = p[0];
    out[i * 3 + 1] = p[1];
    out[i * 3 + 2] = p[2];
  }
  return out;
}

export interface EcoBody {
  /** `SOLAR_BODIES` / `orbitStones` ile aynı sıra ve kimlik. */
  id: string;
  ring: number;
  /** Başlangıç açısı (radyan). */
  phase: number;
  /** Küre yarıçapı (dünya birimi). */
  radius: number;
  /** Odak HUD'ındaki süs kodu (`N-###`); pazarlama metni değil, dekor. */
  hud: number;
}

/**
 * Sekiz tıklanabilir küre — `orbitStones` sırasıyla aynı. Renk
 * (`yellow`/`fuchsia`) `orbitStones[i].color`'dan gelir, burada tekrar
 * edilmez. Halkalar 1–3'e yayıldı: varsayılan kadrajda HER ZAMAN görünen
 * halkalar. Dış halkalar (4–6) kadraj kenarında kesildiği için yalnız süs
 * küre taşır — ekran dışına taşan bir küreye fareyle tıklanamaz, sekiz
 * hizmetin hepsi her an erişilebilir olmalı (e2e ile kilitli).
 */
export const ECO_BODIES: readonly EcoBody[] = [
  { id: "production", ring: 2, phase: 5.3, radius: 0.44, hud: 208 },
  { id: "digital", ring: 1, phase: 0.2, radius: 0.36, hud: 417 },
  { id: "creative", ring: 2, phase: 2.4, radius: 0.44, hud: 316 },
  { id: "ai-creative-production", ring: 3, phase: 0.9, radius: 0.52, hud: 552 },
  { id: "live-broadcast", ring: 1, phase: 3.4, radius: 0.36, hud: 129 },
  { id: "cloud-tv", ring: 2, phase: 4.0, radius: 0.44, hud: 684 },
  { id: "post-production", ring: 3, phase: 3.0, radius: 0.52, hud: 371 },
  { id: "event-management", ring: 3, phase: 5.8, radius: 0.52, hud: 245 },
];

export interface EcoDecor {
  ring: number;
  phase: number;
  radius: number;
  /** 0 = saf beyaz, 1 = hafif sıcak beyaz. */
  warmth: number;
}

/** Halka başına süs küre sayısı (iç → dış). */
const DECOR_PER_RING = [3, 5, 6, 8, 9, 10, 11] as const;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Süs küreler (tıklanmaz, hep beyaz tonlu). Tohumlu: her yüklemede aynı
 * dizilim — ekran görüntüsü karşılaştırması ve testler kararlı kalır.
 * Boyut halkayla artar (dış halkada büyük yakın küreler, referanstaki gibi).
 */
export function buildDecor(includeMicro = true): EcoDecor[] {
  const random = mulberry32(0x0ec05);
  const decor: EcoDecor[] = [];
  DECOR_PER_RING.forEach((count, ring) => {
    for (let i = 0; i < count; i++) {
      const base = 0.06 + ring * 0.034;
      decor.push({
        ring,
        phase: ((i + random() * 0.8) / count) * Math.PI * 2 + ring * 0.9,
        radius: base * (0.65 + random() * 0.85),
        warmth: random() < 0.25 ? 1 : 0,
      });
    }
  });
  if (includeMicro) {
    // Yörüngelerdeki minik "toz" küreler: yoğunluk hissini verir.
    for (let i = 0; i < 44; i++) {
      decor.push({
        ring: Math.floor(random() * ECO_RING_RADII.length),
        phase: random() * Math.PI * 2,
        radius: 0.045 + random() * 0.03,
        warmth: random() < 0.4 ? 1 : 0,
      });
    }
  }
  return decor;
}

/** Sahne saati `t` (sn) için bir gövdenin dünya konumu. */
export function bodyPosition(body: { ring: number; phase: number }, t: number): Vec3 {
  return ecosystemPosition(body.ring, body.phase + ringSpeed(body.ring) * t);
}

/** Kamera yaw'ı: sonsuz sürüklenme yerine yavaş sinüs salınımı. */
export function swayYaw(timeSeconds: number): number {
  return (
    ECO_CAMERA.yaw +
    ECO_CAMERA.swayAmplitude * Math.sin((timeSeconds / ECO_CAMERA.swayPeriod) * Math.PI * 2)
  );
}

/** Bir ekran boyu kaydırmada yıldızların yörüngelere göre kayma açısı (≈%12 geri kalma). */
export const PARALLAX_RADIANS = 0.12;

/**
 * Yıldız küresinin kameranın SAĞ ekseni etrafındaki dönüş açısı. `parallax`,
 * sahne kutusunun ekran ortasına göre konumu (-1..1): sayfa aşağı kaydıkça artar.
 *
 * İşaret ÖNEMLİ ve three.js'te sezgiye ters: sağ eksen etrafında POZİTİF açı
 * yıldızları ekranda YUKARI, negatif açı AŞAĞI taşır. Aşağı kaydırırken içerik
 * yukarı akar; yıldızların sayfadan geri kalması (ekranda göreli olarak aşağı
 * kayması) için açı negatif olmalı. Bu işaret bir kez yanlış çevrildi; testle kilitli.
 */
export function parallaxAngle(parallax: number): number {
  const clamped = Math.max(-1, Math.min(1, parallax));
  return -PARALLAX_RADIANS * clamped;
}
