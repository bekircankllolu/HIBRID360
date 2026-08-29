import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { Link } from "@/i18n/navigation";
import { siteImages } from "@/data/site-images";
import { SERVICE_CATALOG } from "@/data/services";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
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
 * Sunum: görsel kart ızgarası. Kullanılan fotoğraflar hizmetlerin kendi
 * alt sayfalarındaki görsellerin aynısı (src/data/site-images.ts) — yeni
 * varlık üretilmedi. AI Creative Production'ın kendi fotoğrafı yok; o kart
 * görselsiz "featured" varyantla çıkıyor (TODO: brief 11.9).
 */

// META tablosu (Bölüm 10) — TR description henüz yazılmadı, EN'de ayarlı.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "What We Do",
    description:
      locale === "en"
        ? "Creative, production, post production, digital, live broadcast, Cloud TV, events and AI creative production."
        : undefined,
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
  const descriptions = t.raw("list") as Array<{ title: string; body: string }>;

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
        ])}
      />
      <h1 className={styles.title}>{t("heroTitle")}</h1>
      <p className={styles.heroBody}>{t("heroBody")}</p>

      <ul className={styles.grid}>
        {SERVICE_CATALOG.map((service, index) => {
          const image = service.imageKey
            ? siteImages.services[service.imageKey]
            : undefined;
          const body = descriptions.find((item) => item.title === service.name)?.body;
          return (
            <li
              key={service.id}
              className={`${styles.card} ${image ? "" : styles.cardFeatured}`}
            >
              <Link href={service.href} className={styles.cardLink}>
                <span className={styles.media} aria-hidden="true">
                  {image ? (
                    <Image
                      className={styles.mediaImage}
                      src={image.src}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      priority={index < 3}
                    />
                  ) : null}
                </span>
                <span className={styles.cardBody}>
                  <span className={styles.cardTitle}>{service.name}</span>
                  <span className={styles.cardText}>{body}</span>
                  <span className={styles.cardArrow} aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
