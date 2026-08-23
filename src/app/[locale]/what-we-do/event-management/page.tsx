import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import type { Locale } from "@/i18n/routing";
import styles from "@/styles/service-page.module.css";

/**
 * EVT-01..04 (nihai copy deck, Ağustos 2026) — Event Management alt
 * sayfası. Hizmet listesi (EVT-03) ve kapanış bandı (EVT-04) EN + TR aynı
 * (marka dili).
 */

const SERVICES = [
  "EVENT ORGANIZATION",
  "CONVENTIONS – CONFERENCES",
  "CONCERTS",
  "GUERRILLA MARKETING",
  "RETAIL MARKETING",
  "TRAVEL MARKETING",
  "CATERING",
  "EXHIBITION STANDS",
  "OUTDOOR PRINTING & APPLICATIONS",
  "PROMOTION STAFF",
  "PRINT STAFF",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Event Management",
    alternates: { canonical: `/${locale}/what-we-do/event-management` },
  };
}

export default async function EventManagementPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("services.eventManagement");
  const body = t.raw("body") as string[];

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
          { name: "Event Management", path: "/what-we-do/event-management" },
        ])}
      />

      <h1 className={styles.heroTitle}>EVENT MANAGEMENT</h1>
      <p className={styles.heroSubtitle}>We Design Experience</p>

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

      <section className={styles.band}>
        <p className={styles.bandText}>
          REASON TO MEET US — CALL US · TRUST US · LOVE US
        </p>
      </section>
    </div>
  );
}
