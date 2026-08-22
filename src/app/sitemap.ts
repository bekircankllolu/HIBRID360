import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import { insightsPosts } from "@/data/insights";

// brief-rev12.md Bölüm 1.7 — GEO/AI görünürlüğü: sitemap.xml zorunlu.
// Faz 1'de mevcut olan tüm statik rotalar listelenir; Faz 2+'de Works/
// Insights gibi dinamik (Supabase tabanlı) rotalar buraya eklenecek.
const STATIC_PATHS = [
  "",
  "/work",
  "/what-we-do",
  "/culture",
  "/insights",
  "/friends",
  "/contact",
  "/privacy",
  "/cookie-policy",
  "/kvkk",
  "/ai-usage-rights",
  "/accessibility",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const publishedInsightsPaths = insightsPosts
    .filter((post) => post.is_published)
    .map((post) => `/insights/${post.slug}`);

  return [...STATIC_PATHS, ...publishedInsightsPaths].flatMap((path) =>
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
