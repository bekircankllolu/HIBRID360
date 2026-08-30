import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { ServiceVisual } from "@/components/ServiceVisual";
import { hibridSolutions } from "@/data/hibrid-solutions";
import { siteImages } from "@/data/site-images";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "@/styles/service-page.module.css";

/**
 * CTV-01..05 (nihai copy deck, Ağustos 2026) — Cloud TV alt sayfası.
 * CTV-05 notu: "PRO-03'teki altı maddelik liste burada tekrar
 * kullanılır... Öneri: Cloud TV sayfasında listenin kısaltılmış üç
 * maddelik hâli kullanılsın, tamamı Production sayfasında kalsın." —
 * bu öneri uygulandı (bkz. src/data/hibrid-solutions.ts).
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Cloud TV & Corporate Channel",
    description:
      locale === "en"
        ? "Your own corporate TV channel on a cloud portal: content, infrastructure, training and turnkey operation."
        : "Bulut portal üzerinde kendi kurumsal TV kanalınız: içerik, altyapı, eğitim ve anahtar teslim operasyon.",
    alternates: localizedAlternates(locale, "/what-we-do/cloud-tv"),
  };
}

export default async function CloudTvPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("services.cloudTv");
  const isTr = locale === "tr";
  const steps = t.raw("steps") as string[];
  const bandBody = t.raw("bandBody") as string[];

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
          { name: "Cloud TV", path: "/what-we-do/cloud-tv" },
        ])}
      />

      <h1 className={styles.heroTitle}>CLOUD TV</h1>
      <p className={styles.heroSubtitle}>There Is No Time Like Right Now</p>
      <ServiceVisual
        src={siteImages.services.cloudTv.src}
        alt={siteImages.services.cloudTv.alt[locale]}
        priority
      />

      <p className={styles.body}>{t("body")}</p>

      <ul className={styles.list}>
        {steps.map((step, index) => (
          <li key={index} className={styles.listItem}>
            <span className={styles.listNumber}>{index + 1}</span>
            <p>{step}</p>
          </li>
        ))}
      </ul>

      <section className={styles.band}>
        <div className={styles.bandBody}>
          {bandBody.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("solutionsTitle")}</h2>
        <ul className={styles.list}>
          {hibridSolutions.slice(0, 3).map((line, index) => (
            <li key={index} className={styles.listItem}>
              <span className={styles.listNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <p>{isTr ? line.tr : line.en}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
