import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "@/styles/culture-page.module.css";

/**
 * WWB-01..06 (nihai copy deck, Ağustos 2026) — What We Believe.
 *
 * 29 Ağustos 2026 revizyonu: sayfa /culture/what-we-believe'den üst
 * menüdeki canonical /what-we-believe rotasına taşındı; eski yol kalıcı
 * olarak buraya yönlendiriliyor (next.config.mjs). İçerik değişmedi.
 *
 * Eski sitedeki üç görsel (ataturk.jpg · little_prince.png · kadin.jpg)
 * ve "Everything in the world created by women" alıntısı bu sayfaya
 * **bağlanmadı**: telif ve atıf teyidi bekliyor. Bkz.
 * docs/visual-audit/BLOCKERS.md ve docs/content/LEGACY_CONTENT_ROUTE_MAP.md.
 *
 * WWB-06 [KARAR]: deck'in kendi notu "Everything in the world created by
 * women" alıntısının kaynağının yazılması veya çıkarılması gerektiğini
 * söylüyor — ama bu alıntı WWB-06 kutusunun içinde verilmedi (yalnızca
 * Little Prince alıntısı var). Bu yüzden buraya eklenmedi; kaynaksız/
 * uydurma alıntı yazılmadı.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "What We Believe",
    alternates: localizedAlternates(locale, "/what-we-believe"),
  };
}

export default async function WhatWeBelievePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("culture.whatWeBelieve");

  const vision = {
    title: t("vision.title"),
    items: t.raw("vision.items") as string[],
  };
  const mission = {
    title: t("mission.title"),
    items: t.raw("mission.items") as string[],
  };
  const inspires = {
    title: t("inspires.title"),
    items: t.raw("inspires.items") as string[],
  };
  const edict = {
    title: t("edict.title"),
    items: t.raw("edict.items") as string[],
  };

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Believe", path: "/what-we-believe" },
        ])}
      />

      <h1 className={styles.heroTitle}>WHAT WE BELIEVE</h1>
      <p className={styles.heroLead}>
        Beyond Production: An AI-Native Creative Organization
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{vision.title}</h2>
        <ul className={styles.list}>
          {vision.items.map((item) => (
            <li key={item} className={styles.listTag}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{mission.title}</h2>
        <ul className={styles.list}>
          {mission.items.map((item) => (
            <li key={item} className={styles.listTag}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{inspires.title}</h2>
        <ul className={styles.list}>
          {inspires.items.map((item) => (
            <li key={item} className={styles.listSentence}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{edict.title}</h2>
        <ul className={styles.list}>
          {edict.items.map((item) => (
            <li key={item} className={styles.listSentence}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.band}>
        <p className={styles.bandLead}>{t("bandLead")}</p>
        <p className={styles.manifesto}>{t("manifesto")}</p>
        <p className={styles.quote}>{t("quote")}</p>
        <p className={styles.quoteAuthor}>{t("quoteAuthor")}</p>
      </section>
    </div>
  );
}
