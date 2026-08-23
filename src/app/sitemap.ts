import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import { insightsPosts } from "@/data/insights";
import {
  getPublishedDirectors,
  getPublishedInsights,
  getPublishedWorks,
} from "@/lib/content";

// brief-rev12.md Bölüm 1.7 — GEO/AI görünürlüğü: sitemap.xml zorunlu.
// Statik rotalar + Supabase'ten gelen yayınlanmış Works/Directors/Insights
// detay sayfaları listelenir.
const STATIC_PATHS = [
  "",
  "/work",
  "/what-we-do",
  "/what-we-do/service-production",
  "/what-we-do/how-we-work",
  "/what-we-do/ai-creative-production",
  "/culture",
  "/culture/directors",
  "/culture/sustainability",
  "/insights",
  "/friends",
  "/contact",
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

  const dynamicPaths = [
    ...works.map((work) => `/work/${work.slug}`),
    ...directors.map((director) => `/culture/directors/${director.slug}`),
    ...insights.map((post) => `/insights/${post.slug}`),
  ];

  return [...STATIC_PATHS, ...dynamicPaths].flatMap((path) =>
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
