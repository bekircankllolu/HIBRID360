/**
 * Navigasyon — tek veri kaynağı (29 Ağustos 2026 müşteri revizyonu).
 *
 * Eylül 2026 müşteri revizyonu sonrası görünür üst menü:
 *   Culture · What We Do · Work · Clients · Partners · Contact
 *
 * Bu, Ağustos copy deck'indeki beş maddelik menüyü (WORK · WHAT WE DO ·
 * CULTURE · FRIENDS · CONTACT) geçersiz kılar — bkz. docs/DECISIONS.md
 * #18 ve #13 (Insights menü konumu).
 *
 * Eski Who We Are, What We Believe ve Solutions rotaları yayında kalır
 * fakat görünür üst menüde yer almaz. Insights ve Culture alt sayfaları
 * da footer/hub ve sayfa içi bağlantılar üzerinden erişilebilir.
 *
 * ## Locale davranışı
 *
 * `labelKey` → `messages/*.json` içindeki `nav.*` anahtarı. Müşterinin bu
 * revizyondaki açık talimatı: "Türkçe karşılıklarını TR locale'de kullan."
 * Bu, menü maddelerinin iki dilde de İngilizce kalacağını söyleyen eski
 * kararın (DECISIONS.md "Kasıtlı olarak İngilizce kalanlar") yerini alır.
 * Hizmet **adları** İngilizce kalmayı sürdürür (özel ad).
 *
 * `href` locale öneki taşımaz; `@/i18n/navigation` içindeki `Link` öneki
 * kendisi ekler (`/tr/who-we-are`, `/en/who-we-are`).
 *
 * ## Tek kaynak
 *
 * `Header.tsx` ve `Footer.tsx` menüyü artık burada tanımlı dizilerden
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
   * Mega menü alt öğeleri. Yalnızca What We Do'da var; kaynağı hizmet
   * kataloğu, ayrı bir liste tutulmuyor.
   */
  children?: NavChild[];
}

export const MAIN_NAV: NavItem[] = [
  { labelKey: "culture", href: "/culture", order: 1 },
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
  { labelKey: "partners", href: "/partners", order: 5 },
  { labelKey: "contact", href: "/contact", order: 6 },
];

/**
 * Menüde olmayan ama canonical rotası yaşayan sayfalar. Footer ve sayfa
 * içi bağlantılar buradan beslenir; sitemap'te de yer alırlar.
 */
export const SECONDARY_NAV: Array<{ labelKey: string; href: string }> = [
  { labelKey: "insights", href: "/insights" },
  { labelKey: "whoWeAre", href: "/who-we-are" },
  { labelKey: "whatWeBelieve", href: "/what-we-believe" },
  { labelKey: "solutions", href: "/solutions" },
];

/** Üst menüdeki canonical rotalar — sitemap ve smoke testleri için. */
export const MAIN_NAV_PATHS = MAIN_NAV.map((item) => item.href);

/**
 * Masaüstü mega menüsü — Header'daki sütun işaretlemesinin veri
 * karşılığı. Hizmetler, Culture ve keşif bağlantıları tek kaynaktan gelir.
 */
export interface MegaMenuLink {
  /** Locale öneki olmadan canonical rota. */
  href: string;
  /** `messages` → `nav.<labelKey>`. Hizmet adlarında kullanılmaz. */
  labelKey?: string;
  /** Çevrilmeyen sabit etiket — hizmet adları (marka dili, özel ad). */
  label?: string;
}

export interface MegaMenuColumn {
  /** `messages` → `nav.<headingKey>`. */
  headingKey: string;
  /** Başlık aynı zamanda bağlantıysa canonical rota. */
  headingHref?: string;
  /** `services` iki sütunlu ızgara, `links` tek sütun (bkz. Header CSS). */
  variant: "services" | "links";
  links: MegaMenuLink[];
}

export const MEGA_MENU: MegaMenuColumn[] = [
  {
    headingKey: "whatWeDo",
    headingHref: "/what-we-do",
    variant: "services",
    links: SERVICE_CATALOG.map((service) => ({
      href: service.href,
      label: service.name,
    })),
  },
  {
    headingKey: "culture",
    headingHref: "/culture",
    variant: "links",
    links: [
      { href: "/culture", labelKey: "culture" },
      { href: "/partners", labelKey: "partners" },
    ],
  },
  {
    headingKey: "explore",
    variant: "links",
    links: [
      { href: "/work", labelKey: "work" },
      { href: "/clients", labelKey: "clients" },
      { href: "/contact", labelKey: "contact" },
    ],
  },
];

/**
 * Footer "Keşfet" sütunu.
 *
 * Görünür üst menünün sırasını aynen izler; Insights yalnızca footer'a
 * eklenir. Menüden çıkarılan eski rotalar burada tekrar gösterilmez.
 */
export const FOOTER_NAV: Array<{ labelKey: string; href: string }> = [
  ...MAIN_NAV.map((item) => ({ labelKey: item.labelKey, href: item.href })),
  { labelKey: "insights", href: "/insights" },
];
