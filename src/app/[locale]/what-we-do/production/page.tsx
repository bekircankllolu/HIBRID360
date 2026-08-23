import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import { ServiceVisual } from "@/components/ServiceVisual";
import { hibridSolutions } from "@/data/hibrid-solutions";
import { siteImages } from "@/data/site-images";
import type { Locale } from "@/i18n/routing";
import styles from "@/styles/service-page.module.css";

/**
 * PRO-01..05 (nihai copy deck, Ağustos 2026) — Production alt sayfası.
 * Hizmet listesi (PRO-04) EN + TR aynı (marka dili).
 *
 * TODO: PRO-05 — "kanıt satırı" (rakam + iş adı) yayına girmeden
 * doğrulanmalı; sahte rakam yazılmadı.
 */

const SERVICES = [
  "LIVE BROADCAST / STAGE DIRECTION",
  "FILM – VIDEO",
  "SOCIAL MEDIA VIDEOS",
  "VIRAL VIDEOS",
  "TV COMMERCIALS",
  "SHOWREELS",
  "ON-SITE VIDEOS",
  "INDUSTRIAL FILMS",
  "INTRODUCTORY / LAUNCH VIDEOS",
  "DRONE CAMERA SERVICES",
  "PHOTO SHOOTING",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Video Production Istanbul",
    description:
      locale === "en"
        ? "Commercials, product films and how-to content, shot end to end with an in-house crew. 20+ years of production experience."
        : undefined,
    alternates: { canonical: `/${locale}/what-we-do/production` },
  };
}

export default async function ProductionPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("services.production");
  const tEvidence = await getTranslations("services");
  const body = t.raw("body") as string[];
  const isTr = locale === "tr";

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
          { name: "Production", path: "/what-we-do/production" },
        ])}
      />

      <h1 className={styles.heroTitle}>PRODUCTION</h1>
      <p className={styles.heroSubtitle}>PURE. SIMPLE. POWERFUL.</p>
      <ServiceVisual
        src={siteImages.services.production.src}
        alt={siteImages.services.production.alt}
        priority
      />

      <div className={styles.body}>
        {body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <ul className={styles.list}>
        {hibridSolutions.map((line, index) => (
          <li key={index} className={styles.listItem}>
            <span className={styles.listNumber}>{String(index + 1).padStart(2, "0")}</span>
            <p>{isTr ? line.tr : line.en}</p>
          </li>
        ))}
      </ul>

      <ul className={styles.tagList}>
        {SERVICES.map((service) => (
          <li key={service} className={styles.tag}>
            {service}
          </li>
        ))}
      </ul>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{tEvidence("evidenceTitle")}</h2>
        <EmptyState message={t("evidenceEmpty")} />
      </section>
    </div>
  );
}
