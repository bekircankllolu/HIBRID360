import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { ServiceVisual } from "@/components/ServiceVisual";
import { siteImages } from "@/data/site-images";
import type { Locale } from "@/i18n/routing";
import styles from "@/styles/service-page.module.css";

/**
 * PHO-01..03 (nihai copy deck, Ağustos 2026) — Photography alt sayfası
 * (yeni; mevcut sitede yoktu, hizmet yalnızca listede geçiyordu). PHO-01
 * sloganı deck'te [ÖNERİ] olarak işaretli.
 */

const SERVICES = [
  "PRODUCT PHOTOGRAPHY",
  "FOOD PHOTOGRAPHY",
  "PACKSHOT",
  "PORTRAIT",
  "CAMPAIGN & KEY VISUAL",
  "EVENT PHOTOGRAPHY",
  "RETOUCH & STYLING",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Product & Food Photography Istanbul",
    description:
      locale === "en"
        ? "Product, food, portrait and campaign photography shot in our own studios, styled and retouched in-house."
        : undefined,
    alternates: { canonical: `/${locale}/what-we-do/photography` },
  };
}

export default async function PhotographyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("services.photography");
  const body = t.raw("body") as string[];

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
          { name: "Photography", path: "/what-we-do/photography" },
        ])}
      />

      <h1 className={styles.heroTitle}>PHOTOGRAPHY</h1>
      <p className={styles.heroSubtitle}>EVERY FRAME EARNS ITS PLACE.</p>
      <ServiceVisual
        src={siteImages.services.photography.src}
        alt={siteImages.services.photography.alt}
        priority
      />

      <div className={styles.body}>
        {body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <ul className={styles.tagList}>
        {SERVICES.map((service) => (
          <li key={service} className={styles.tag}>
            {service}
          </li>
        ))}
      </ul>
    </div>
  );
}
