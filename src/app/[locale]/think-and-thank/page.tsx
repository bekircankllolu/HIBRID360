import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { InsightsList } from "@/components/insights/InsightsList";
import { insightsPosts } from "@/data/insights";
import { getPublishedInsights } from "@/lib/content";
import { breadcrumbListJsonLd } from "@/lib/schema";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "../insights/page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "insights" });
  const fromDb = await getPublishedInsights();
  const hasPublishedPosts =
    fromDb.length > 0 || insightsPosts.some((post) => post.is_published);

  return {
    title: "Think & Thank",
    description: t("heroSubtitle"),
    robots: hasPublishedPosts ? undefined : { index: false, follow: true },
    alternates: localizedAlternates(locale, "/think-and-thank"),
  };
}

export default async function ThinkAndThankPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("insights");
  const fromDb = await getPublishedInsights();
  const publishedPosts =
    fromDb.length > 0 ? fromDb : insightsPosts.filter((post) => post.is_published);

  return (
    <div>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Think & Thank", path: "/think-and-thank" },
        ])}
      />
      <header className={styles.hero}>
        <p className={styles.heroEyebrow}>{t("heroEyebrow")}</p>
        <h1 className={styles.heroTitle}>{t("heroTitle")}</h1>
        <p className={styles.heroLead}>{t("heroLead")}</p>
        <p className={styles.heroSubtitle}>{t("heroSubtitle")}</p>
      </header>
      <section className={styles.featuredVideo} aria-labelledby="featured-thinking-film">
        <div className={styles.featuredVideoCopy}>
          <p>WATCH / THINK / THANK</p>
          <h2 id="featured-thinking-film">
            {locale === "tr" ? "Fikir hareket ettiğinde." : "When an idea moves."}
          </h2>
        </div>
        <div className={styles.videoFrame}>
          <iframe
            src="https://www.youtube-nocookie.com/embed/yj9rokSeack?rel=0"
            title={locale === "tr" ? "Hibrid 360 Think & Thank videosu" : "Hibrid 360 Think & Thank video"}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </section>
      <div className={styles.content}>
        <InsightsList posts={publishedPosts} locale={locale} />
      </div>
    </div>
  );
}
