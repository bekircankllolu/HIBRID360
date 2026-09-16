import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { siteImages } from "@/data/site-images";
import { SERVICE_CATALOG } from "@/data/services";
import type { Locale } from "@/i18n/routing";
import { chapterOf, formatDegree } from "@/lib/service-chapter";
import { localizedAlternates } from "@/lib/site";
import { ServiceDirectory, type ServiceDirectoryItem } from "./ServiceDirectory";
import styles from "./page.module.css";

/**
 * WWD-01/02 (nihai copy deck, Ağustos 2026) — What We Do hub sayfası.
 *
 * 29 Ağustos 2026 revizyonu: hizmet sırası ve kapsamı artık burada değil,
 * `src/data/services.ts` içinde tutuluyor (tek veri kaynağı; ana sayfa
 * hizmet satırı ve navigasyon mega menüsü de oradan besleniyor).
 * Photography katalogdan çıktı — dokuz kart sekize indi, /what-we-do/
 * photography kalıcı olarak bu hub'a yönlendiriliyor.
 *
 * Başlıklar (hizmet adları) katalogdan gelir, iki dilde de İngilizcedir;
 * tek satırlık tanımlar çevrilir ve `whatWeDo.list` altındadır. İki kaynak
 * hizmet adı üzerinden eşleşir; eşleşmenin bozulmadığını
 * src/data/services.test.ts doğruluyor.
 *
 * Sunum: editoryal hizmet dizini ve aktif hizmete ait sabit görsel alanı.
 * Yeni sinematik fotoğraflar src/data/site-images.ts üzerinden paylaşılır.
 * AI Creative Production görselsiz tipografik kapak kullanır.
 */

// META tablosu (Bölüm 10) — TR description henüz yazılmadı, EN'de ayarlı.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
  // Sayfa başlığı locale'e bağlı: TR sekmesinde/arama sonucunda İngilizce
  // başlık çıkıyordu. Görünür sayfa terminolojisiyle aynı sözlükten
  // (meta.title) okunuyor; alternates/canonical yapısı değişmedi.
    title: t("title.whatWeDo"),
    description:
      locale === "en"
        ? "Creative, production, post-production, digital, live broadcast, Cloud TV, events and AI creative production."
        : "Creative, prodüksiyon, post prodüksiyon, dijital, canlı yayın, Cloud TV, etkinlik ve AI kreatif prodüksiyon hizmetleri.",
    alternates: localizedAlternates(locale, "/what-we-do"),
  };
}

export default async function WhatWeDoPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("whatWeDo");
  const heroTitle = t("heroTitle");
  const [heroLead, ...heroAccent] = heroTitle.split(" ");
  const descriptions = t.raw("list") as Array<{ title: string; body: string }>;
  const items: ServiceDirectoryItem[] = SERVICE_CATALOG.map((service) => {
    const image = service.imageKey ? siteImages.services[service.imageKey] : undefined;
    return {
      id: service.id,
      name: service.name,
      href: service.href,
      description: descriptions.find((item) => item.title === service.name)?.body ?? "",
      degree: formatDegree(chapterOf(service.id).degree),
      image: image
        ? {
            src: image.src,
            alt: image.alt[locale],
            focus: image.focus,
          }
        : undefined,
    };
  });

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
        ])}
      />
      <header className={styles.hero}>
        <p className={styles.kicker} lang="en">Hibrid 360 / What We Do</p>
        <h1 className={styles.title}>
          <span className={styles.titleLead}>{heroLead}</span>{" "}
          <span className={styles.titleAccent}>{heroAccent.join(" ")}</span>
        </h1>
        <div className={styles.heroFooter}>
          <p className={styles.heroBody}>{t("heroBody")}</p>
          <p
            className={styles.heroCount}
            aria-label={locale === "tr" ? "Sekiz hizmet alanı" : "Eight service disciplines"}
          >
            <strong>08</strong>
            <span>{locale === "tr" ? "ALAN · 360°" : "DISCIPLINES · 360°"}</span>
          </p>
        </div>
      </header>

      <ServiceDirectory
        items={items}
        label={locale === "tr" ? "Hizmet alanları" : "Service disciplines"}
      />
    </div>
  );
}
