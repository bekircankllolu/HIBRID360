/**
 * Hibrid ekosistem sahnesi — brief-rev12.md Bölüm 4.5 "Hibrid taşları".
 *
 * Merkezde büyük sarı Hibrid taşı, etrafında sekiz tıklanabilir servis
 * noktası bulunur. Noktaya tıklanınca önce detay paneli açılır; ilgili
 * hizmet sayfasına paneldeki bağlantıdan gidilir.
 *
 * `href` alanı bu kod tabanındaki gerçek rota yapısına uyarlanmıştır
 * (brief tabloda /production, /digital gibi kök yollar veriyor; sitede
 * bu sayfalar WHAT WE DO altında toplanıyor — bkz. brief Bölüm 3.1 menü
 * kararı). Sekiz alt sayfanın tamamı task #18 ile açıldı; tüm noktalar
 * kendi gerçek sayfasına bağlanıyor.
 *
 * Taş görseli: müşteriden teslim edildi (hibrid360_hibridtaslar paketi) —
 * AI ile üretilmiş, düşük poligonlu Hibrid taşı; sarı ve fuşya varyantı
 * brief'in istediğiyle birebir eşleşiyor (bkz. public/images/stones/).
 * `color` alanı sekiz yörüngede iki rengi sırayla dağıtır.
 */
export interface OrbitStone {
  orbit: number;
  label: string;
  href: string;
  ready: boolean;
  color: "fuchsia" | "yellow";
  /**
   * Detay kartında gösterilecek alt başlığın kaynağı:
   * WWD-02'deki (What We Do hub listesi) hizmet başlığı. Alt başlık metni
   * uydurulmuyor, o listedeki onaylı tek satır tanım locale'e göre
   * okunuyor — bkz. messages `whatWeDo.list`.
   *
   * Not: teslim edilen taş görsellerinde alt başlık BASKILI geliyordu
   * ("KREATİF" / "MEDYA PLANLAMA & SATIN ALMA") ve renk varyantına bağlı
   * olduğu için 8 taşın 6'sında yanlış hizmeti gösteriyordu. Görseller
   * gem'in sınırına kırpıldı; etiket artık yalnızca buradan geliyor.
   */
  wwdTitle: string;
  /** Hangi yörünge halkasında döndüğü (ORBIT_RINGS indeksi). */
  ring: 0 | 1 | 2 | 3;
  /** Başlangıç açısı (radyan) — noktalar sahneye dağınık girsin diye. */
  phase: number;
}

export const orbitStones: OrbitStone[] = [
  {
    orbit: 1,
    label: "PRODUCTION",
    href: "/what-we-do/production",
    ready: true,
    color: "yellow",
    wwdTitle: "Production",
    ring: 0,
    phase: 0.7,
  },
  {
    orbit: 2,
    label: "DIGITAL",
    href: "/what-we-do/digital",
    ready: true,
    color: "fuchsia",
    wwdTitle: "Digital",
    ring: 0,
    phase: 0.7 + Math.PI,
  },
  {
    orbit: 3,
    label: "CREATIVE",
    href: "/what-we-do/creative",
    ready: true,
    color: "yellow",
    wwdTitle: "Creative",
    ring: 1,
    phase: 2.3,
  },
  {
    orbit: 4,
    label: "AI",
    href: "/what-we-do/ai-creative-production",
    ready: true,
    color: "fuchsia",
    wwdTitle: "AI Creative Production",
    ring: 1,
    phase: 2.3 + Math.PI,
  },
  {
    orbit: 5,
    label: "LIVE BROADCAST",
    href: "/what-we-do/live-broadcast",
    ready: true,
    color: "yellow",
    wwdTitle: "Live Broadcast",
    ring: 2,
    phase: 4.1,
  },
  {
    orbit: 6,
    label: "PHOTOGRAPHY",
    href: "/what-we-do/photography",
    ready: true,
    color: "fuchsia",
    wwdTitle: "Photography",
    ring: 2,
    phase: 4.1 + Math.PI,
  },
  {
    orbit: 7,
    label: "POST PRODUCTION",
    href: "/what-we-do/post-production",
    ready: true,
    color: "yellow",
    wwdTitle: "Post Production",
    ring: 3,
    phase: 5.6,
  },
  {
    orbit: 8,
    label: "EVENTS",
    href: "/what-we-do/event-management",
    ready: true,
    color: "fuchsia",
    wwdTitle: "Event Management",
    ring: 3,
    phase: 5.6 + Math.PI,
  },
];

/**
 * Yörünge geometrisi — hem SVG halkaları hem nokta konum matematiği bu
 * sabitlerden türetilir; iki katman ayrı kaynak kullanırsa nokta halkadan
 * kayar (bu hata bir kez yaşandı, bkz. eski WebGL sahnesindeki
 * daire/elips uyumsuzluğu).
 *
 * Koordinatlar 1000×640'lık sanal sahnede tanımlı; bileşen bunları yüzdeye
 * çevirip mutlak konumlandırıyor, SVG ise aynı viewBox'ı
 * preserveAspectRatio="none" ile kullanıyor — kutu oranı değişse de
 * (mobilde sahne kareye yaklaşır) iki katman birlikte esner.
 */
export const ORBIT_VIEW = { w: 1000, h: 640, cx: 500, cy: 324 } as const;

/** Elipsin dikey basıklığı — sistem hafif eğik bir düzlemden görünüyor. */
export const ORBIT_TILT = 0.36;

/** Halka yarıçapları (rx, sanal birim). */
export const ORBIT_RINGS = [176, 258, 340, 424] as const;

/** Halka başına açısal hız (rad/s) — içteki hızlı, dıştaki yavaş. */
export const RING_SPEED = [0.15, 0.105, 0.078, 0.058] as const;

/**
 * Bir taşın t anındaki konumu ve derinliği. `depth` 0..1: 0 = en arkada
 * (kristalin arkasından geçerken), 1 = en önde. Bileşen bununla ölçek,
 * parlaklık ve z-index verip sahneye üç boyut hissi katıyor.
 */
export function stonePoint(
  stone: OrbitStone,
  tSeconds: number,
): { x: number; y: number; depth: number } {
  const angle = stone.phase + tSeconds * RING_SPEED[stone.ring];
  const rx = ORBIT_RINGS[stone.ring];
  const sin = Math.sin(angle);
  return {
    x: ORBIT_VIEW.cx + Math.cos(angle) * rx,
    y: ORBIT_VIEW.cy + sin * rx * ORBIT_TILT,
    depth: (sin + 1) / 2,
  };
}

/**
 * Taş görsellerinin gerçek (kırpılmış) piksel boyutları. Görseller gem'in
 * alfa sınırına kırpıldığı için iki renk varyantının oranı birbirinden
 * farklı; <img> width/height'ı buradan veriliyor ki tarayıcı doğru kutuyu
 * ayırsın (CLS 0) ve görsel ezilmesin.
 */
export const STONE_INTRINSIC = {
  fuchsia: { width: 255, height: 243 },
  yellow: { width: 319, height: 294 },
} as const;

/** brief Bölüm 4.5 — bölüm başlığı sloganı. */
export const SOLAR_SYSTEM_TITLE = "One Hybrid Production Ecosystem.";
