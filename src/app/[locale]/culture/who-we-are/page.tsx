import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import type { Locale } from "@/i18n/routing";
import styles from "@/styles/culture-page.module.css";

/**
 * CUL-01..06 (nihai copy deck, Ağustos 2026) — Who We Are.
 *
 * CUL-03/04: kurucu (Zühre Didem Gödek, President & CCO) fotoğrafı ve
 * video repliği. Fotoğraf/video varlığı henüz teslim edilmedi — yer
 * tutucu bir kutu ve TODO ile bırakıldı. Video repliğinin altında
 * "AI-generated animation / AI ile canlandırılmıştır" ibaresi zorunlu
 * (bkz. messages "video.aiGenerated" — aynı ibare GEN-12'de de kullanılan
 * tekil kaynak).
 *
 * CUL-06: kültür filmi (60–90 sn, "Meet the crew") henüz teslim
 * edilmedi; poster + preload="none" kuralıyla varlık gelince eklenecek.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Who We Are",
    alternates: { canonical: `/${locale}/culture/who-we-are` },
  };
}

export default async function WhoWeArePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("culture.whoWeAre");
  const tVideo = await getTranslations("video");
  const body = t.raw("body") as string[];
  const secondBody = t.raw("secondBody") as string[];

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Culture", path: "/culture" },
          { name: "Who We Are", path: "/culture/who-we-are" },
        ])}
      />

      <h1 className={styles.heroTitle}>{t("heroTitle")}</h1>
      <div className={styles.heroQuotes}>
        <p className={styles.heroQuote}>{t("quote1")}</p>
        <p className={styles.heroQuote}>{t("quote2")}</p>
      </div>
      <p className={styles.heroLead}>{t("heroLead")}</p>

      <div className={styles.body}>
        {body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* CUL-03/04 — kurucu görseli + video repliği */}
      <div className={styles.founder}>
        {/* TODO: brief CUL-03 — kurucu fotoğrafı teslim edilince buraya
            gerçek görsel bağlanacak. */}
        <div className={styles.founderPhoto} aria-hidden="true">
          Photo pending
        </div>
        <div className={styles.founderInfo}>
          <p className={styles.founderName}>ZÜHRE DİDEM GÖDEK</p>
          <p className={styles.founderTitle}>PRESIDENT &amp; CCO</p>
          <p className={styles.founderQuote}>{t("founderQuote")}</p>
          <p className={styles.founderDisclaimer}>{tVideo("aiGenerated")}</p>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.blockTitle}>{t("secondTitle")}</h2>
        <div className={`${styles.body} ${styles.bodyTight}`}>
          {secondBody.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* CUL-06 — kültür filmi */}
      <section className={styles.section}>
        <EmptyState message={t("filmNote")} />
      </section>
    </div>
  );
}
