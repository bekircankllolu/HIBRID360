import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { InsightsList } from "@/components/insights/InsightsList";
import { insightsPosts } from "@/data/insights";
import { getPublishedInsights } from "@/lib/content";
import { breadcrumbListJsonLd } from "@/lib/schema";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import { EditorialImage } from "@/components/insights/EditorialImage";
import { YouTubeLite } from "@/components/insights/YouTubeLite";
import { KineticStatement } from "@/components/insights/KineticStatement";
import { MorphingHeroTitle } from "@/components/insights/MorphingHeroTitle";
import { siteImages } from "@/data/site-images";
import styles from "./page.module.css";

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
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Think & Thank", path: "/think-and-thank" },
        ])}
      />
      <header className={styles.hero}>
        <div className={styles.contours} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow} lang="en">{t("heroEyebrow")} / 01</p>
          <MorphingHeroTitle className={styles.heroTitle} />
          <div className={styles.heroCopy}>
            <p className={styles.heroLead}>{t("heroLead")}</p>
            <p className={styles.heroSubtitle}>{t("heroSubtitle")}</p>
          </div>
        </div>
      </header>
      <KineticStatement />
      <section className={styles.featuredVideo} aria-labelledby="featured-thinking-film">
        <div className={styles.featuredVideoCopy}>
          <p>WATCH / THINK / THANK</p>
          <h2 id="featured-thinking-film">
            {locale === "tr" ? "Fikir hareket ettiğinde." : "When an idea moves."}
          </h2>
        </div>
        <div className={styles.videoFrame}>
          <YouTubeLite
            title={locale === "tr" ? "Hibrid 360 Think & Thank videosu" : "Hibrid 360 Think & Thank video"}
            playLabel={locale === "tr" ? "Think & Thank videosunu oynat" : "Play the Think & Thank video"}
          />
        </div>
      </section>
      <section className={styles.objectStudy} aria-labelledby="object-study-title">
        <div className={styles.objectCopy}>
          <p>OBJECT / STUDY 01</p>
          <h2 id="object-study-title">
            {locale === "tr" ? "Fikirler dolaşır. Form değiştirir." : "Ideas travel. Form changes."}
          </h2>
          <span>
            {locale === "tr"
              ? "Kültür, ses ve görüntü aynı yaratıcı sistemde buluşur."
              : "Culture, sound and image meet inside one creative system."}
          </span>
        </div>
        <div className={styles.objectVisual}>
          <EditorialImage
            src={siteImages.thinkAndThank.culture.src}
            alt={siteImages.thinkAndThank.culture.alt[locale]}
            sizes="(max-width: 760px) 80vw, 38vw"
            rotating
          />
        </div>
      </section>
      <div className={styles.content}>
        <InsightsList posts={publishedPosts} locale={locale} animateTitles />
      </div>
    </div>
  );
}
