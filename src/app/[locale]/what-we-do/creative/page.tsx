import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import serviceStyles from "@/styles/service-page.module.css";
import creativeStyles from "./page.module.css";

/**
 * CRE-01..04 (nihai copy deck, Ağustos 2026) — Creative alt sayfası.
 * Hizmet listesi (CRE-03) EN + TR aynı (marka dili).
 *
 * TODO: CRE-04 — "Bu bölümde kampanya görselleri, KV'ler, outdoor/
 * billboard işleri, logolar ve brand ID çalışmaları yer alacak." Galeri
 * varlıkları teslim edilmeden eklenemez.
 */

const SERVICES = [
  "BRAND CONSULTANCY",
  "CORPORATE IDENTITY",
  "MARKETING PLAN AND STRATEGY",
  "CONCEPT DEVELOPMENT",
  "CONTENT GENERATION",
  "COMMERCIALS",
  "PACKAGING",
  "TV",
  "PRESS",
  "RADIO CAMPAIGNS",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Creative",
    description:
      locale === "en"
        ? "Brand thinking, concept and campaign ideas — from strategy to key visual and packaging."
        : undefined,
    alternates: localizedAlternates(locale, "/what-we-do/creative"),
  };
}

export default async function CreativePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("services.creative");
  const body = t.raw("body") as string[];

  return (
    <div className={creativeStyles.surface}>
      <div className={`${serviceStyles.page} ${creativeStyles.page}`}>
        <JsonLd
          data={breadcrumbListJsonLd(locale, [
            { name: "Home", path: "" },
            { name: "What We Do", path: "/what-we-do" },
            { name: "Creative", path: "/what-we-do/creative" },
          ])}
        />

        <h1 className={`${serviceStyles.heroTitle} ${creativeStyles.heroTitle}`}>
          CREATIVITY WITHOUT LIMITS
        </h1>
        <p className={`${serviceStyles.heroSubtitle} ${creativeStyles.heroSubtitle}`}>
          {t("heroSubtitle")}
        </p>
        <div className={creativeStyles.visual} aria-hidden="true">
          <span className={creativeStyles.sparkle} />
        </div>

        <div className={`${serviceStyles.body} ${creativeStyles.body}`}>
          {body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <ul className={`${serviceStyles.tagList} ${creativeStyles.tagList}`}>
          {SERVICES.map((service) => (
            <li
              key={service}
              className={`${serviceStyles.tag} ${creativeStyles.tag}`}
            >
              {service}
            </li>
          ))}
        </ul>

        <section className={`${serviceStyles.band} ${creativeStyles.band}`}>
          <p className={`${serviceStyles.bandText} ${creativeStyles.bandText}`}>
            {t("band")}
          </p>
        </section>

        <section className={serviceStyles.section}>
          <EmptyState message={t("galleryEmpty")} />
        </section>
      </div>
    </div>
  );
}
