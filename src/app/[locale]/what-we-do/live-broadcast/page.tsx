import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import { ServiceVisual } from "@/components/ServiceVisual";
import { siteImages } from "@/data/site-images";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import styles from "@/styles/service-page.module.css";

/**
 * LIVE-01..05 (nihai copy deck, Ağustos 2026) — Live Broadcast alt
 * sayfası. LIVE-01 sloganı deck'te [ÖNERİ] (yeni önerilen, henüz
 * onaylanmamış) olarak işaretli — onaylanmazsa deck'in kendi yedek
 * başlığına ("LIVE BROADCAST — Webcast · Live Stream") dönülebilir.
 * LIVE-03 (medikal yayın) için ayrı bir başlık verilmedi, gövde akışına
 * eklendi (uydurma başlık yazılmadı).
 *
 * TODO: LIVE-05 — "kanıt satırı" (81 şehire eş zamanlı yayın örneği)
 * yayına girmeden doğrulanmalı; deck'teki örnek rakam kullanılmadı.
 */

const SERVICES = [
  "Online Live Broadcasting",
  "Live Broadcast with a Satellite Uplink",
  "Live Medical Broadcasting",
  "Live Remote Broadcasting",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Corporate Live Broadcast",
    description:
      locale === "en"
        ? "Multi-camera live streaming for events, conventions and medical broadcasts — with satellite uplink and remote production."
        : undefined,
    alternates: { canonical: `/${locale}/what-we-do/live-broadcast` },
  };
}

export default async function LiveBroadcastPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("services.liveBroadcast");
  const tEvidence = await getTranslations("services");
  const body = t.raw("body") as string[];

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
          { name: "Live Broadcast", path: "/what-we-do/live-broadcast" },
        ])}
      />

      <h1 className={styles.heroTitle}>LIVE BROADCAST</h1>
      <p className={styles.heroSubtitle}>
        LIVE IS THE HARDEST FORMAT. IT&rsquo;S OUR FAVOURITE.
      </p>
      <ServiceVisual
        src={siteImages.services.liveBroadcast.src}
        alt={siteImages.services.liveBroadcast.alt}
        priority
      />

      <div className={styles.body}>
        {body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        <p>
          {t("cloudBody")}{" "}
          <Link href="/what-we-do/cloud-tv" className={styles.inlineLink}>
            → {t("cloudLink")}
          </Link>
        </p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>LIVE BROADCAST SERVICES</h2>
        <ul className={styles.tagList}>
          {SERVICES.map((service) => (
            <li key={service} className={styles.tag}>
              {service}
            </li>
          ))}
        </ul>
        <h3 className={styles.sectionTitle}>{tEvidence("evidenceTitle")}</h3>
        <EmptyState message={t("evidenceEmpty")} />
      </section>
    </div>
  );
}
