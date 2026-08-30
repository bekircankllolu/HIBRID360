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
 * 2026-08-27 kullanıcı revizyonu: merkezde mevcut gerçekçi taş videosu,
 * çevresinde düz sarı/fuşya servis noktaları ve parçacık izleri.
 * `color` alanı sekiz noktada iki rengi sırayla dağıtır.
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
    label: "AI CREATIVE PRODUCTION",
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
    label: "CLOUD TV",
    href: "/what-we-do/cloud-tv",
    ready: true,
    color: "fuchsia",
    wwdTitle: "Cloud TV",
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
    label: "EVENT MANAGEMENT",
    href: "/what-we-do/event-management",
    ready: true,
    color: "fuchsia",
    wwdTitle: "Event Management",
    ring: 3,
    phase: 5.6 + Math.PI,
  },
];

/**
 * Yörünge geometrisi — hem Canvas halkaları hem nokta konum matematiği bu
 * sabitlerden türetilir; iki katman ayrı kaynak kullanırsa nokta halkadan
 * kayar (bu hata bir kez yaşandı, bkz. eski WebGL sahnesindeki
 * daire/elips uyumsuzluğu).
 *
 * Koordinatlar 1000×640'lık sanal sahnede tanımlı; bileşen bunları yüzdeye
 * çevirip mutlak konumlandırıyor, Canvas ise aynı koordinatları
 * sahne boyutuna ölçekliyor — kutu oranı değişse de
 * (mobilde sahne kareye yaklaşır) iki katman birlikte esner.
 */
export const ORBIT_VIEW = { w: 1000, h: 640, cx: 500, cy: 324 } as const;

/** Elipsin dikey basıklığı — sistem hafif eğik bir düzlemden görünüyor. */
export const ORBIT_TILT = 0.36;

/** Halka yarıçapları (rx, sanal birim). */
export const ORBIT_RINGS = [176, 258, 340, 424] as const;

/** Halka başına açısal hız (rad/s) — içteki hızlı, dıştaki yavaş. */
export const RING_SPEED = [0.105, 0.074, 0.055, 0.041] as const;

export const COMPACT_RINGS = [230, 230, 420, 420] as const;
export const COMPACT_TILT = 0.56;
const COMPACT_SPEED = [0.048, 0.048, 0.03, 0.03] as const;

/**
 * Bir taşın t anındaki konumu ve derinliği. `depth` 0..1: 0 = en arkada
 * (kristalin arkasından geçerken), 1 = en önde. Bileşen bununla nokta
 * opaklığını ve parçacıkların ön/arka katmanını belirler; noktalar düzdür.
 */
export function stonePoint(
  stone: OrbitStone,
  tSeconds: number,
  compact = false,
): { x: number; y: number; depth: number } {
  const angle =
    stone.phase + tSeconds * (compact ? COMPACT_SPEED : RING_SPEED)[stone.ring];
  const rx = (compact ? COMPACT_RINGS : ORBIT_RINGS)[stone.ring];
  const sin = Math.sin(angle);
  return {
    x: ORBIT_VIEW.cx + Math.cos(angle) * rx,
    y: ORBIT_VIEW.cy + sin * rx * (compact ? COMPACT_TILT : ORBIT_TILT),
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

/**
 * ---------------------------------------------------------------------
 * Kuyruklu yıldız izi
 * ---------------------------------------------------------------------
 *
 * Her nokta yörüngesinde ilerlerken arkasında sönerek incelen bir iz
 * bırakır. İz "geçmişteki konumların" ta kendisi: aynı `stonePoint`
 * fonksiyonu geriye doğru zamanla çağrılıyor. Böylece iz her zaman
 * halkanın TAM üzerinde kalır — ayrı bir eğri hesabı olsaydı iz
 * halkadan kayardı (bu sınıf hata bu dosyada bir kez yaşandı).
 *
 * Uzunluk açı değil ZAMAN cinsinden tanımlı. Sebebi fiziksel: halkaların
 * çizgisel hızı birbirine çok yakın (iç halka 176 × 0.15 ≈ 26.4, dış
 * halka 424 × 0.058 ≈ 24.6 birim/s), dolayısıyla sabit süre sekiz nokta
 * için de yaklaşık aynı ekran uzunluğunu verir. Sabit açı verilseydi
 * dıştaki izler uzun, içtekiler kısa görünürdü.
 */
export const TRAIL_SECONDS = 4.6;

/** İzdeki örnek sayısı — baş dahil. */
export const TRAIL_SAMPLES = 44;

export interface TrailPoint {
  x: number;
  y: number;
  depth: number;
  /** 0 = baş (noktanın kendisi), 1 = kuyruğun ucu. */
  t: number;
}

/**
 * Bir taşın `tSeconds` anındaki izi, baştan kuyruğa sıralı.
 *
 * Her örnek kendi `depth` değerini taşır: iz kristalin arkasından
 * geçerken sönük ve arka katmana, önünden geçerken parlak ve ön katmana
 * çizilir. Kuyruğun bir ucu kristalin arkasında, diğer ucu önünde
 * olabilir — üç boyut hissini asıl veren bu.
 */
export function stoneTrail(
  stone: OrbitStone,
  tSeconds: number,
  samples: number = TRAIL_SAMPLES,
  trailSeconds: number = TRAIL_SECONDS,
): TrailPoint[] {
  const points: TrailPoint[] = [];
  const last = Math.max(1, samples - 1);

  for (let i = 0; i < samples; i++) {
    const t = i / last;
    const p = stonePoint(stone, tSeconds - t * trailSeconds);
    points.push({ x: p.x, y: p.y, depth: p.depth, t });
  }

  return points;
}

/**
 * ---------------------------------------------------------------------
 * Merkez kristal — dönen video
 * ---------------------------------------------------------------------
 *
 * 2026-08-27: müşterinin `hibtidtas.mp4` adlı yeni video teslimi.
 * 1440×1440 / 24 fps kaynağın 702 karesi (29.25 sn) kesme, çapraz geçiş
 * veya hız değişikliği olmadan korunur. Ses kanalı kaldırılır.
 * 512×512, full-range, all-intra H.264 türevi ~7.12 MB'tır; bağımsız
 * kareler kaydırırken geri/ileri erişimi korur. Poster aynı türevin ilk
 * karesidir. Dosya adları sürümlüdür; eski tarayıcı önbelleği kullanılmaz.
 * Yalnızca bölüme yaklaşırken yüklenir. Siyah mat aynı Canvas'taki sahneye
 * `screen` ile birleştirilir; bu gerçek alfa değildir.
 */
export const CRYSTAL_MEDIA = {
  /** All-intra H.264: each frame is independently seekable for scroll control. */
  interactive: "/videos/hibrid-stone-loop-20260827.mp4",
  fps: 24,
  scale: 0.85,
  playbackRate: 1,
  /** Önceki optimize kaynaklar; etkileşimli bileşen bunları yüklemez. */
  webm: "/videos/hibrid-stone.webm",
  mp4: "/videos/hibrid-stone.mp4",
  /** preload="none" olduğu için ilk kare bu görselden gelir. */
  poster: "/videos/hibrid-stone-loop-20260827.webp",
  width: 512,
  height: 512,
  /**
   * Ölçülen parlak siluet yaklaşık 315×285 pikseldir. Bu bilgi kadrajı
   * belgeler; sahnenin mevcut boyut ayarı `scale` ile korunur.
   */
  stoneRatio: 315 / 512,
  /**
   * Yeni siluet merkezi 260×251: yörünge merkezine hizalamak için
   * kaynak 4 piksel sola ve 5 piksel aşağı kaydırılır.
   */
  offsetX: -4 / 512,
  offsetY: 5 / 512,
} as const;

/**
 * ---------------------------------------------------------------------
 * Detay kartının açılma yönü
 * ---------------------------------------------------------------------
 *
 * Kart eskiden her zaman İÇERİ (merkeze doğru) açılıyordu: soldaki nokta
 * sağa, sağdaki sola. Sonuç, merkeze yakın halkalarda kartın doğrudan
 * Hibrid kristalinin üstüne binmesiydi — sahnenin ana nesnesi kapanıyordu
 * (görsel denetim §C-05).
 *
 * Yeni kural: içeri açmak kristale çarpacaksa DIŞARI açılır. Dış
 * halkalardaki noktalar kristalden zaten yeterince uzak olduğu için orada
 * içeri açılış korunuyor — böylece kartlar sahne dışına taşmıyor.
 */

/** Kristalin yatayda kapladığı yarı genişlik (ışıma payı dahil). */
export const CRYSTAL_HALF_WIDTH = 115;

export function cardSide(x: number, reach: number): "left" | "right" {
  const inward: "left" | "right" = x < ORBIT_VIEW.cx ? "right" : "left";
  const hitsCrystal =
    inward === "right"
      ? x + reach > ORBIT_VIEW.cx - CRYSTAL_HALF_WIDTH
      : x - reach < ORBIT_VIEW.cx + CRYSTAL_HALF_WIDTH;
  return hitsCrystal ? (inward === "right" ? "left" : "right") : inward;
}
