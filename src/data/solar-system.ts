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

/**
 * Dar ekranda daha yuvarlak elips. Sahnenin dikey doluluğunu belirleyen
 * asıl değer bu: 0.36'da sistem sahne yüksekliğinin ancak %45'ini
 * kaplıyor ve altta/üstte ölü alan kalıyordu. 0.55'te yörüngeler daha
 * yukarıdan bakılmış gibi açılıyor ve alan doluyor.
 */
export const MOBILE_TILT = 0.55;

/** Halka yarıçapları (rx, sanal birim). */
export const ORBIT_RINGS = [176, 258, 340, 424] as const;

/** Halka başına açısal hız (rad/s) — içteki hızlı, dıştaki yavaş. */
export const RING_SPEED = [0.15, 0.105, 0.078, 0.058] as const;

/**
 * Dar ekran dizilişi: dört halka yerine İKİ halka, halkada dört taş.
 * 390px'de dört halka birbirine giriyor ve taşlar merkez kristalin
 * üstüne biniyordu. Halka çiftleri (0-1 ve 2-3) aynı yarıçapı paylaşınca
 * faz dağılımı kendiliğinden dengeli çıkıyor (0.7 · 2.3 · 3.84 · 5.44 ve
 * 0.96 · 2.46 · 4.1 · 5.6 — aralar ~1.55 rad).
 *
 * Hız da çift başına eşitlenmeli: aynı halkayı paylaşan iki taş farklı
 * hızda dönerse zamanla üst üste biner.
 */
export const MOBILE_RINGS = [230, 230, 400, 400] as const;

/**
 * Dar ekranda hız belirgin biçimde düşük. Gerekçe: dokunmatikte hover
 * yok, yani masaüstündeki "imleç sahneye girince yavaşla" davranışı
 * devreye giremiyor; parmakla hareketli bir hedefe dokunmak imleçle
 * takip etmekten zor. Bu değerlerde tam tur ~100 saniye — sahne hâlâ
 * yaşıyor ama hedef rahatça yakalanıyor.
 */
export const MOBILE_SPEED = [0.062, 0.062, 0.04, 0.04] as const;

/**
 * Halka çizgisinin görsel ağırlığı. Perspektifte uzaktaki yörünge hem
 * incelir hem soluklaşır; dört halkanın da aynı 1px/%11 çizilmesi sahneyi
 * teknik çizime çeviriyordu.
 *
 * `vectorEffect="non-scaling-stroke"` KORUNUYOR: SVG
 * preserveAspectRatio="none" ile esnediği için (mobilde kutu kareye
 * yaklaşır) onsuz çizgi kalınlığı yatay/dikeyde farklı ezilir.
 * Perspektif farkı bu yüzden ölçekten değil, halka başına açıkça
 * verilen kalınlık/opaklıktan geliyor.
 */
export const RING_STYLE = [
  { width: 1.35, opacity: 0.17 },
  { width: 1.05, opacity: 0.135 },
  { width: 0.8, opacity: 0.1 },
  { width: 0.6, opacity: 0.075 },
] as const;

/**
 * Bir taşın t anındaki konumu ve derinliği. `depth` 0..1: 0 = en arkada
 * (kristalin arkasından geçerken), 1 = en önde. Bileşen bununla ölçek,
 * parlaklık ve z-index verip sahneye üç boyut hissi katıyor.
 */
export function stonePoint(
  stone: OrbitStone,
  tSeconds: number,
  compact = false,
): { x: number; y: number; depth: number } {
  const speeds = compact ? MOBILE_SPEED : RING_SPEED;
  const radii = compact ? MOBILE_RINGS : ORBIT_RINGS;
  const angle = stone.phase + tSeconds * speeds[stone.ring];
  const rx = radii[stone.ring];
  const sin = Math.sin(angle);
  return {
    x: ORBIT_VIEW.cx + Math.cos(angle) * rx,
    y: ORBIT_VIEW.cy + sin * rx * orbitTilt(compact),
    depth: (sin + 1) / 2,
  };
}

/** Halka SVG'si ile nokta matematiği aynı eğimi kullanmalı. */
export const orbitTilt = (compact: boolean) =>
  compact ? MOBILE_TILT : ORBIT_TILT;

/** Dar ekranda kaç ayrı halka çizileceği (MOBILE_RINGS iki değer taşır). */
export const visibleRings = (compact: boolean) =>
  compact ? [MOBILE_RINGS[0], MOBILE_RINGS[2]] : [...ORBIT_RINGS];

/**
 * Taş görsellerinin gerçek piksel boyutları. Görseller gem'in alfa
 * sınırına kırpıldığı için varyantların oranı birbirinden farklı;
 * <img> width/height'ı buradan veriliyor ki tarayıcı doğru kutuyu
 * ayırsın (CLS 0) ve görsel ezilmesin.
 *
 * Kaynaklar 2026-08-27'de marka rampasıyla yeniden üretildi: teslim
 * edilen taşların baskın faseti sarıda rgb(231,210,17) (zeytin), fuşyada
 * rgb(202,50,133) (gül pembesi) ölçülmüştü — ikisi de marka değeri
 * değil. Yeni dosyalar #FFFC00 / #FF00FF rampasına oturuyor ve parlaklık
 * aralığı 79'dan 200'e açıldı (spekülar/gölge ipucu eksikti).
 */
export const STONE_INTRINSIC = {
  /** Merkez kristal — next/image srcset'i tek kaynaktan üretir. */
  core: { width: 640, height: 590 },
  /** Yörünge taşları — ~34px görüntülenir, kaynak küçük tutuldu. */
  yellow: { width: 160, height: 147 },
  fuchsia: { width: 160, height: 152 },
} as const;

/** Yörünge taşı görselinin yolu. */
export const orbitStoneSrc = (color: OrbitStone["color"]) =>
  color === "yellow"
    ? "/images/stones/orbit-yellow.webp"
    : "/images/stones/orbit-fuchsia.webp";

/** brief Bölüm 4.5 — bölüm başlığı sloganı. */
export const SOLAR_SYSTEM_TITLE = "One Hybrid Production Ecosystem.";
