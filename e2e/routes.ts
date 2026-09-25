import data from "./routes.json";

/**
 * Rota listeleri — tipli kapı. VERİ `routes.json`'da (tek kaynak); bu dosya
 * yalnız doğrular ve tipli olarak dışa aktarır. `scripts/design-audit.mjs`
 * aynı JSON'u doğrudan okur, yani testlerin ölçtüğü rotalarla denetim
 * aracının çektiği rotalar ayrışamaz.
 *
 * Yollar locale öneki OLMADAN yazılır (`/work`, ana sayfa `""`); test,
 * `/${locale}${route}` ile birleştirir.
 *
 * Listeler:
 *   CANONICAL_ROUTES  200 dönmesi ve tek h1 taşıması gereken üst sayfalar
 *                     (ana sayfa hariç; "Photo pending" nöbetçisi onu ayrıca ekler)
 *   OVERFLOW_ROUTES   yatay taşma (scrollWidth) nöbetçisinin kapsamı —
 *                     `ALL_ROUTES`'un tamamı + 404 sayfası
 *   CHAPTER_ROUTES    7 hizmet sayfası: Service Chapter dilinin referansı
 *   MIGRATED_ROUTES   Service Chapter diline GEÇMİŞ rotalar — tasarım dili
 *                     bekçisinin (design-language.spec.ts) kapsamı. RATCHET:
 *                     Faz 2'de her grup (B1…B9) kendi rotalarını ekler, hiçbir
 *                     rota çıkarılmaz. Bugün = CHAPTER_ROUTES.
 *   MONA_ALLOWLIST    MONA'nın (nokta yapısı: MonaShard/MonaDrift/MonaDots)
 *                     SERBEST olduğu rotalar: 7 hizmet sayfası + What We Do
 *                     hub'ı + AI Creative Production. Başka hiçbir yerde yok
 *                     (ana sayfa ve Brief dahil) — Faz 2 kesin kararı.
 *   ALL_ROUTES        denetim aracının "tüm rotalar"ı: ana sayfa, canonical,
 *                     hizmet alt sayfaları, Culture, Brief, 6 yasal sayfa ve
 *                     404 (`NOT_FOUND_ROUTE`, B5'te göç ediyor)
 *
 * Slug sayfaları (`/work/[slug]`, `/culture/directors/[slug]`,
 * `/think-and-thank/[slug]`) listede YOK: ilk ikisinin yerelde verisi yok
 * (Supabase), Think & Thank'in dünyası Faz 2'de aynen kalıyor.
 */

export type Locale = "tr" | "en";

/** Locale öneki olmadan yol: ana sayfa `""`, diğerleri `/…`. */
export type RoutePath = "" | `/${string}`;

/** Küçük harf, rakam, tire; sonda `/` yok; locale öneki yok. */
const ROUTE_SHAPE = /^(\/[a-z0-9]+(?:-[a-z0-9]+)*)+$/;
const KNOWN_LOCALES: readonly Locale[] = ["tr", "en"];

function toRoutePath(list: string, value: string): RoutePath {
  if (value !== "" && !ROUTE_SHAPE.test(value)) {
    throw new Error(
      `e2e/routes.json → "${list}": "${value}" geçerli bir yol değil ` +
        '(ana sayfa için "", diğerleri "/küçük-harf/yol" biçiminde, sonda "/" yok).',
    );
  }
  if (KNOWN_LOCALES.some((locale) => value === `/${locale}` || value.startsWith(`/${locale}/`))) {
    throw new Error(
      `e2e/routes.json → "${list}": "${value}" locale önekiyle yazılmış; önek test içinde ekleniyor.`,
    );
  }
  return value as RoutePath;
}

function routeList(list: string, values: readonly string[]): readonly RoutePath[] {
  const seen = new Set<string>();
  return Object.freeze(
    values.map((value) => {
      if (seen.has(value)) {
        throw new Error(`e2e/routes.json → "${list}": "${value}" iki kez yazılmış.`);
      }
      seen.add(value);
      return toRoutePath(list, value);
    }),
  );
}

function toLocale(value: string): Locale {
  const locale = KNOWN_LOCALES.find((known) => known === value);
  if (!locale) throw new Error(`e2e/routes.json → "locales": bilinmeyen dil "${value}".`);
  return locale;
}

export const LOCALES: readonly Locale[] = Object.freeze(data.locales.map(toLocale));
export const NOT_FOUND_ROUTE: RoutePath = toRoutePath("notFound", data.notFound);
export const CANONICAL_ROUTES = routeList("canonical", data.canonical);
export const OVERFLOW_ROUTES = routeList("overflow", data.overflow);
export const CHAPTER_ROUTES = routeList("chapters", data.chapters);
export const MIGRATED_ROUTES = routeList("migrated", data.migrated);
export const MONA_ALLOWLIST = routeList("monaAllowlist", data.monaAllowlist);
export const ALL_ROUTES = routeList("all", data.all);
