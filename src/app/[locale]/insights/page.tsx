import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { InsightsList } from "@/components/insights/InsightsList";
import { insightsPosts } from "@/data/insights";
import { getPublishedInsights } from "@/lib/content";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "./page.module.css";

// brief-rev12.md Bölüm 20.6 — Insights hero metni. Marka dili kuralı
// gereği (bkz. CLAUDE.md i18n) her iki locale'de de İngilizce sabit kalır
// — src/messages/{tr,en}.json içindeki insights.heroTitle/heroSubtitle
// bilerek aynı İngilizce değeri taşıyor.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "insights" });
  return {
    title: "Insights",
    description: t("heroSubtitle"),
    alternates: localizedAlternates(locale, "/insights"),
  };
}

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("insights");
  // Supabase bağlıysa oradan; değilse brief'ten seed edilmiş yerel liste
  // (şu an hiçbiri yayında değil — gövde metinleri bekleniyor).
  const fromDb = await getPublishedInsights();
  const publishedPosts =
    fromDb.length > 0 ? fromDb : insightsPosts.filter((post) => post.is_published);

  return (
    <div>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Insights", path: "/insights" },
        ])}
      />
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>{t("heroTitle")}</h1>
        <p className={styles.heroSubtitle}>{t("heroSubtitle")}</p>
      </div>
      <div className={styles.content}>
        <InsightsList posts={publishedPosts} locale={locale} />
      </div>
    </div>
  );
}
