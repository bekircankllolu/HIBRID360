import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { ServiceVisual } from "@/components/ServiceVisual";
import { siteImages } from "@/data/site-images";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "@/styles/service-page.module.css";

/**
 * POST-01..04 (nihai copy deck, Ağustos 2026) — Post Production alt
 * sayfası. Hizmet listesi (POST-03) EN + TR aynı (marka dili). POST-04
 * mikro başlığın altına deck'in önerdiği tek cümlelik açıklama eklendi
 * ("↳ ... eklenmesi önerilir").
 */

const SERVICES = [
  "EDITING",
  "COLOURING",
  "DUBBING",
  "AFTER EFFECTS",
  "JINGLE",
  "RE-TOUCH",
  "ILLUSTRATION",
  "STORYBOARD",
  "3D ANIMATION",
  "STYLING",
  "PHOTO SHOOTING",
  "MOTION GRAPHICS",
  "TRACK MOTION",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Post Production",
    description:
      locale === "en"
        ? "Editing, colour, sound, motion graphics, 3D and retouch — full-service post production in-house."
        : undefined,
    alternates: localizedAlternates(locale, "/what-we-do/post-production"),
  };
}

export default async function PostProductionPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("services.postProduction");
  const body = t.raw("body") as string[];

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
          { name: "Post Production", path: "/what-we-do/post-production" },
        ])}
      />

      <h1 className={styles.heroTitle}>POST PRODUCTION</h1>
      <p className={styles.heroSubtitle}>Off We Go!</p>
      <ServiceVisual
        src={siteImages.services.postProduction.src}
        alt={siteImages.services.postProduction.alt}
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

      <h2 className={styles.microHeading}>ABBY SINGER SHOT!</h2>
      <p className={styles.body}>{t("microHeadingNote")}</p>
    </div>
  );
}
