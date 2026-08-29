import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import { BeliefFounderVideo } from "@/components/culture/BeliefFounderVideo";
import { BELIEF_IMAGES } from "@/data/what-we-believe";
import styles from "@/styles/culture-page.module.css";
import belief from "./page.module.css";

/**
 * WWB-01..06 (nihai copy deck, Ağustos 2026) — What We Believe.
 *
 * 29 Ağustos 2026 revizyonu: sayfa /culture/what-we-believe'den üst
 * menüdeki canonical /what-we-believe rotasına taşındı; eski yol kalıcı
 * olarak buraya yönlendiriliyor (next.config.mjs). İçerik değişmedi.
 *
 * 29 Ağustos 2026 revizyonu — görseller: müşteri Atatürk ve Küçük Prens
 * bölümlerinin korunmasını istedi. Eski sitenin anlatım yapısı geri
 * geldi: liste bloklarından sonra iki tam genişlik görsel bandı, metin
 * görselin üzerinde. Görseller marka sarısı duotone ile yeniden
 * türetildi (eski zeytin yeşili filtre yerine) ve WebP+AVIF, 1600w+2560w
 * olarak servis ediliyor — bkz. src/data/what-we-believe.ts.
 *
 * TELİF AÇIK BLOCKER: iki görselin de kullanım hakkı teyit edilmedi
 * (Küçük Prens en yüksek riskli madde). Bkz. docs/visual-audit/
 * BLOCKERS.md ve docs/content/LEGACY_CONTENT_ROUTE_MAP.md.
 *
 * `kadin.jpg` (eski hero kapağı) bilerek alınmadı: tanınabilir bir
 * kişinin portresi, model rıza kaydı yok ve bu revizyonda istenmedi.
 *
 * WWB-06 [KARAR]: "Everything in the world created by women" alıntısı
 * eski sitede Atatürk fotoğrafının üzerinde, **imzasız** duruyordu —
 * atıf ima ediliyor ama yazılmıyor. Birincil kaynağı gösterilemediği için
 * yeni siteye alınmadı ve yerine alıntı **uydurulmadı**. O bandın
 * üzerindeki metin şirketin kendi onaylı manifesto cümlesidir; tırnak
 * içinde değil, imzasız — alıntı gibi okunmasın diye.
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

      {/* Tam genişlik bant 1 — Atatürk. Üzerindeki metin şirketin kendi
          manifesto cümlesi; tırnak ve imza YOK (bkz. dosya başı notu). */}
      <figure className={belief.figure}>
        <picture>
          <source
            type="image/avif"
            srcSet={BELIEF_IMAGES.ataturk.avif}
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={BELIEF_IMAGES.ataturk.webp}
            sizes="100vw"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={belief.image}
            src={BELIEF_IMAGES.ataturk.fallback}
            width={BELIEF_IMAGES.ataturk.width}
            height={BELIEF_IMAGES.ataturk.height}
            alt={BELIEF_IMAGES.ataturk.alt[locale]}
            loading="lazy"
            decoding="async"
          />
        </picture>
        <figcaption className={belief.caption}>
          <p className={belief.captionLead}>{t("bandLead")}</p>
          <p className={belief.captionStatement}>{t("manifesto")}</p>
        </figcaption>
      </figure>

      {/* Tam genişlik bant 2 — Küçük Prens. Alıntı ve atıf gerçek ve
          doğrulanmış (yazım eski sitedeki hatalı hâliyle değil, doğru
          hâliyle: Antoine de Saint-Exupéry). */}
      <figure className={belief.figure}>
        <picture>
          <source
            type="image/avif"
            srcSet={BELIEF_IMAGES.littlePrince.avif}
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={BELIEF_IMAGES.littlePrince.webp}
            sizes="100vw"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`${belief.image} ${belief.imageTall}`}
            src={BELIEF_IMAGES.littlePrince.fallback}
            width={BELIEF_IMAGES.littlePrince.width}
            height={BELIEF_IMAGES.littlePrince.height}
            alt={BELIEF_IMAGES.littlePrince.alt[locale]}
            loading="lazy"
            decoding="async"
          />
        </picture>
        <figcaption className={belief.caption}>
          <blockquote className={belief.captionQuote}>{t("quote")}</blockquote>
          <p className={belief.captionAuthor}>{t("quoteAuthor")}</p>
        </figcaption>
      </figure>

      {/* Müşteri konuşma videosu. Varlık teslim edilene kadar bileşen
          hiçbir şey render etmez — "video hazırlanıyor" kutusu yok,
          sahte kişi/video üretilmedi (bkz. BELIEF_FOUNDER_VIDEO). */}
      <BeliefFounderVideo />
    </div>
  );
}
