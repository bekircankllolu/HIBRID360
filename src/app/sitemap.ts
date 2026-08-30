import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import { insightsPosts } from "@/data/insights";
import { MAIN_NAV_PATHS } from "@/data/navigation";
import { SERVICE_PATHS, WHAT_WE_DO_EXTRA_PATHS } from "@/data/services";
import { isSustainabilityPublishable } from "@/data/sustainability";
import {
  getPublishedDirectors,
  getPublishedInsights,
  getPublishedWorks,
} from "@/lib/content";

// brief-rev12.md Bölüm 1.7 — GEO/AI görünürlüğü: sitemap.xml zorunlu.
// Statik rotalar + Supabase'ten gelen yayınlanmış Works/Directors/Insights
// detay sayfaları listelenir.
//
// 29 Ağustos 2026 revizyonu: yalnızca canonical rotalar listelenir.
// Yönlendirilen eski yollar (/friends, /culture/who-we-are,
// /culture/what-we-believe, /culture/partners, /what-we-do/photography)
// sitemap'e **girmez** — 308 dönen bir URL'yi sitemap'te ilan etmek
// canonical sinyalini bulandırır. Menü sırası MAIN_NAV'dan, hizmet
// rotaları SERVICE_CATALOG'dan gelir; sitemap ile navigasyonun ayrışması
// böylece imkânsız.
const STATIC_PATHS = [
  "",
  ...MAIN_NAV_PATHS,
  ...SERVICE_PATHS,
  ...WHAT_WE_DO_EXTRA_PATHS,
  "/brief",
  "/privacy",
  "/cookie-policy",
  "/kvkk",
  "/terms",
  "/ai-policy",
  "/accessibility",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [works, directors, dbInsights] = await Promise.all([
    getPublishedWorks(),
    getPublishedDirectors(),
    getPublishedInsights(),
  ]);

  const insights =
    dbInsights.length > 0 ? dbInsights : insightsPosts.filter((p) => p.is_published);

  const hasCultureContent =
    directors.length > 0 || isSustainabilityPublishable();
  const conditionalPaths = [
    ...(works.length > 0 ? ["/work"] : []),
    ...(hasCultureContent ? ["/culture"] : []),
    ...(directors.length > 0 ? ["/culture/directors"] : []),
    ...(isSustainabilityPublishable() ? ["/culture/sustainability"] : []),
    ...(insights.length > 0 ? ["/insights"] : []),
  ];

  const dynamicPaths = [
    ...works.map((work) => `/work/${work.slug}`),
    ...directors.map((director) => `/culture/directors/${director.slug}`),
    ...insights.map((post) => `/insights/${post.slug}`),
  ];

  return [...STATIC_PATHS, ...conditionalPaths, ...dynamicPaths].flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
        ),
      },
    })),
  );
}
