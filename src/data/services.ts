/**
 * Hizmet kataloğu — tek veri kaynağı (29 Ağustos 2026 müşteri revizyonu).
 *
 * Sıra ve kapsam müşterinin verdiği nihai listeden gelir:
 *   Creative · Production · Post Production · Digital · Live Broadcast ·
 *   Cloud TV · Event Management · AI Creative Production
 *
 * Eski hibrid360.com'un "What We Do" açılır menüsü ilk yedi maddeyi aynı
 * sırayla veriyordu; AI Creative Production yeni sitede eklenen sekizinci
 * maddedir. Photography bu revizyonla bağımsız hizmet olmaktan çıktı —
 * yetenek olarak Solutions sayfasında ("photo shooting", eski sitede de
 * orada listeleniyordu) ve Production/Post Production kapsamında duruyor.
 * Bkz. docs/DECISIONS.md #17, docs/content/LEGACY_CONTENT_ROUTE_MAP.md.
 *
 * Hizmet adları iki dilde de İngilizce kalır (marka dili, özel ad).
 * Tek satırlık tanımlar çevrilir; onlar `messages/*.json` →
 * `whatWeDo.items.<id>` altındadır.
 *
 * Bu dosyayı tüketen yüzeyler: What We Do hub'ı, ana sayfa hizmet linkleri
 * satırı (src/data/service-links.ts), navigasyon mega menüsü
 * (src/data/navigation.ts), sitemap.
 *
 * NOT: src/data/solar-system.ts bu katalogdan **bilerek** beslenmiyor.
 * O dosya Codex'in sahipliğinde; ekosistem sahnesindeki Photography
 * noktasının Cloud TV ile değiştirilmesi orada yapılacak.
 */

/** `siteImages.services` içindeki anahtar — görsel bağlama Codex'in işi. */
export type ServiceImageKey =
  | "creative"
  | "production"
  | "postProduction"
  | "digital"
  | "liveBroadcast"
  | "cloudTv"
  | "eventManagement";

export interface ServiceEntry {
  /** messages `whatWeDo.items.<id>` anahtarı ve dahili kimlik. */
  id: string;
  /** Marka dili — iki dilde de aynı, çevrilmez. */
  name: string;
  /** Locale öneki olmadan canonical rota (next-intl `Link` bunu bekler). */
  href: string;
  /** Ana sayfa hizmet satırındaki büyük harfli etiket. */
  linkLabel: string;
  /** src/data/site-images.ts anahtarı; yoksa görsel varlık henüz yok. */
  imageKey?: ServiceImageKey;
}

export const SERVICE_CATALOG: ServiceEntry[] = [
  {
    id: "creative",
    name: "Creative",
    href: "/what-we-do/creative",
    linkLabel: "CREATIVE",
    imageKey: "creative",
  },
  {
    id: "production",
    name: "Production",
    href: "/what-we-do/production",
    linkLabel: "PRODUCTION",
    imageKey: "production",
  },
  {
    id: "postProduction",
    name: "Post Production",
    href: "/what-we-do/post-production",
    linkLabel: "POST PRODUCTION",
    imageKey: "postProduction",
  },
  {
    id: "digital",
    name: "Digital",
    href: "/what-we-do/digital",
    linkLabel: "DIGITAL",
    imageKey: "digital",
  },
  {
    id: "liveBroadcast",
    name: "Live Broadcast",
    href: "/what-we-do/live-broadcast",
    linkLabel: "LIVE BROADCAST",
    imageKey: "liveBroadcast",
  },
  {
    id: "cloudTv",
    name: "Cloud TV",
    href: "/what-we-do/cloud-tv",
    linkLabel: "CLOUD TV",
    imageKey: "cloudTv",
  },
  {
    id: "eventManagement",
    name: "Event Management",
    href: "/what-we-do/event-management",
    linkLabel: "EVENT MANAGEMENT",
    imageKey: "eventManagement",
  },
  {
    // Kendi fotoğrafı yok; What We Do hub'ında görselsiz "featured" kart.
    // TODO: brief 11.9 — AI görseli teslim edilince imageKey eklenecek.
    id: "aiCreativeProduction",
    name: "AI Creative Production",
    href: "/what-we-do/ai-creative-production",
    linkLabel: "AI CREATIVE PRODUCTION",
  },
];

/**
 * Kataloğun dışında kalan, kendi sayfası olmayan ama What We Do altında
 * gerçek rotası bulunan sayfalar. Menüde hizmet gibi listelenmezler.
 */
export const WHAT_WE_DO_EXTRA_PATHS = [
  "/what-we-do/service-production",
  "/what-we-do/how-we-work",
] as const;

export const SERVICE_PATHS = SERVICE_CATALOG.map((service) => service.href);
