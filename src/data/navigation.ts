/**
 * Navigasyon — tek veri kaynağı (29 Ağustos 2026 müşteri revizyonu).
 *
 * Eylül 2026 müşteri revizyonu sonrası görünür üst menü:
 *   Our Culture · What We Do · Works · Friends · Partners ·
 *   Think & Thank · Contact
 *
 * Bu, Ağustos copy deck'indeki beş maddelik menüyü (WORK · WHAT WE DO ·
 * CULTURE · FRIENDS · CONTACT) geçersiz kılar — bkz. docs/DECISIONS.md
 * #18 ve #13 (Insights menü konumu).
 *
 * Eski Who We Are, What We Believe ve Solutions rotaları yayında kalır;
 * ilk ikisi Our Culture açılır menüsünden de erişilebilir. Eski Insights
 * yolu yeni Think & Thank rotasına kalıcı olarak yönlendirilir.
 *
 * ## Locale davranışı
 *
 * `labelKey` → `messages/*.json` içindeki `nav.*` anahtarı. Müşterinin bu
 * revizyondaki açık talimatı: marka menü adları iki locale'de de İngilizce
 * kalır. Hizmet adları da özel ad olarak İngilizce kullanılır.
 *
 * `href` locale öneki taşımaz; `@/i18n/navigation` içindeki `Link` öneki
 * kendisi ekler (`/tr/who-we-are`, `/en/who-we-are`).
 *
 * ## Tek kaynak
 *
 * `Header.tsx` ve `Footer.tsx` menüyü burada tanımlı dizilerden
 * üretiyor; o dosyalarda paralel `NAV_ITEMS` / `FOOTER_NAV` listeleri
 * yok. Yeni bir menü maddesi yalnızca buraya
 * eklenir, hizmet maddesi ise `src/data/services.ts` içine.
 */
import { SERVICE_CATALOG } from "@/data/services";

export interface NavChild {
  /** Locale öneki olmadan canonical rota. */
  href: string;
  /** Marka dili — çevrilmez (hizmet adları özel addır). */
  label: string;
}

export interface NavItem {
  /** `messages` → `nav.<labelKey>`; TR ve EN ayrı yazılır. */
  labelKey: string;
  /** Locale öneki olmadan canonical rota. */
  href: string;
  /** 1'den başlayan üst menü sırası. */
  order: number;
  /**
   * Mega menü alt öğeleri. Our Culture ve Partners müşteri tarafından
   * verilen sabit bağlantıları; What We Do ise hizmet kataloğunu kullanır.
   */
  children?: NavChild[];
}

export const MAIN_NAV: NavItem[] = [
  {
    labelKey: "culture",
    href: "/culture",
    order: 1,
    children: [
      { href: "/who-we-are", label: "WHO WE ARE" },
      { href: "/what-we-believe", label: "WHAT WE BELIEVE" },
      { href: "/think-and-thank", label: "THINK & THANK" },
    ],
  },
  {
    labelKey: "whatWeDo",
    href: "/what-we-do",
    order: 2,
    children: SERVICE_CATALOG.map((service) => ({
      href: service.href,
      label: service.name,
    })),
  },
  { labelKey: "work", href: "/work", order: 3 },
  { labelKey: "clients", href: "/clients", order: 4 },
  {
    labelKey: "partners",
    href: "/partners",
    order: 5,
    children: [
      { href: "/partners#studio-room", label: "STUDIO ROOM" },
      { href: "/partners#marry-me-kitchen", label: "MARRY ME KITCHEN" },
    ],
  },
  { labelKey: "insights", href: "/think-and-thank", order: 6 },
  { labelKey: "contact", href: "/contact", order: 7 },
];

/**
 * Menüde olmayan ama canonical rotası yaşayan sayfalar. Footer ve sayfa
 * içi bağlantılar buradan beslenir; sitemap'te de yer alırlar.
 */
export const SECONDARY_NAV: Array<{ labelKey: string; href: string }> = [
  { labelKey: "whoWeAre", href: "/who-we-are" },
  { labelKey: "whatWeBelieve", href: "/what-we-believe" },
  { labelKey: "solutions", href: "/solutions" },
];

/** Üst menüdeki canonical rotalar — sitemap ve smoke testleri için. */
export const MAIN_NAV_PATHS = MAIN_NAV.map((item) => item.href);

/**
 * Footer "Keşfet" sütunu.
 *
 * Görünür üst menünün sırasını aynen izler. Menüden çıkarılan eski rotalar
 * burada tekrar gösterilmez.
 */
export const FOOTER_NAV: Array<{ labelKey: string; href: string }> = [
  ...MAIN_NAV.map((item) => ({ labelKey: item.labelKey, href: item.href })),
];
