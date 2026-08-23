import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { digitalServices } from "@/data/digital-services";
import type { Locale } from "@/i18n/routing";
import styles from "@/styles/service-page.module.css";

/**
 * DIG-01..06 (nihai copy deck, Ağustos 2026) — Digital alt sayfası.
 * DIG-04 (dörtlü blok) ve DIG-05 (kısa hizmet listesi) deck'te yalnızca
 * İngilizce verildi, TR çevirisi istenmedi — marka dili kabul edilip
 * iki locale'de de aynı bırakıldı (bkz. src/data/digital-services.ts
 * DIG-03 için aynı mantığın TODO'lu hâli).
 */

const SHORT_SERVICES = [
  "WEB DESIGN",
  "WEB DEVELOPMENT",
  "SEM & SEO",
  "SEEDING",
  "MAILING",
  "BANNER",
  "SOCIAL MEDIA MANAGEMENT",
  "SOCIAL MEDIA ADVERTISING STRATEGY",
  "VIRAL VIDEOS",
  "E-NEWS",
  "GIF",
];

const QUAD = [
  {
    title: "INNOVATION",
    body: "In continuous search of simplicity for a better solution for your needs.",
  },
  {
    title: "CAPABILITY",
    body: "Combining extensive digital expertise with an understanding of your business.",
  },
  {
    title: "VISIONARY",
    body: "Dedication to your wants and needs, and also to your customers’ wants and needs.",
  },
  {
    title: "ENGAGING",
    body: "Passion for digital and technical innovation driven by a search for excellence.",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Digital Content Production",
    description:
      locale === "en"
        ? "Social-first content, short-form video, CGI and AI-powered production built to perform across platforms."
        : undefined,
    alternates: { canonical: `/${locale}/what-we-do/digital` },
  };
}

export default async function DigitalPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("services.digital");
  const isTr = locale === "tr";
  const body = t.raw("body") as string[];
  const bandBody = t.raw("bandBody") as string[];

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
          { name: "Digital", path: "/what-we-do/digital" },
        ])}
      />

      <h1 className={styles.heroTitle}>BUILT FOR THE FEED. MADE TO MOVE.</h1>
      <div className={styles.body}>
        {body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <section className={styles.band}>
        <div className={styles.bandBody}>
          {bandBody.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <ul className={styles.list}>
          {digitalServices.map((service) => (
            <li key={service.title} className={styles.listItem}>
              <div>
                <p className={styles.quadTitle}>{service.title}</p>
                <p className={styles.quadBody}>{isTr ? service.tr : service.en}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <div className={styles.quad}>
          {QUAD.map((item) => (
            <div key={item.title}>
              <p className={styles.quadTitle}>{item.title}</p>
              <p className={styles.quadBody}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <ul className={styles.tagList}>
        {SHORT_SERVICES.map((service) => (
          <li key={service} className={styles.tag}>
            {service}
          </li>
        ))}
      </ul>

      <section className={styles.cta}>
        <p className={styles.ctaLead}>{t("closingBody")}</p>
        <p className={styles.microHeading}>
          LET&rsquo;S BUILD YOUR OWN DIGITAL EXPERIENCE. MAKE IT FEEL ALIVE.
        </p>
      </section>
    </div>
  );
}
