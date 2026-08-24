import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { Link } from "@/i18n/navigation";
import { siteImages } from "@/data/site-images";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

/**
 * WWD-01/02 (nihai copy deck, Ağustos 2026) — What We Do hub sayfası.
 * Eski "Solutions" sayfasının yerini alıyor; dokuz hizmet WWD-02'deki
 * sıraya ve başlık+tek satır tanım biçimine birebir uyuyor.
 *
 * Sunum: düz metin listesi yerine görsel kart ızgarası. Kullanılan
 * fotoğraflar hizmetlerin kendi alt sayfalarındaki görsellerin aynısı
 * (src/data/site-images.ts) — yeni varlık üretilmedi, hub'da atıl duran
 * mevcut varlıklar değerlendirildi. AI Creative Production'ın kendi
 * fotoğrafı yok; o kart görselsiz "featured" varyantla çıkıyor
 * (TODO: brief 11.9 — AI görseli teslim edilince buraya da bağlanacak).
 */

const SERVICES: Record<string, { href: string; image?: { src: string; alt: string } }> = {
  Creative: { href: "/what-we-do/creative", image: siteImages.services.creative },
  Production: { href: "/what-we-do/production", image: siteImages.services.production },
  "Post Production": {
    href: "/what-we-do/post-production",
    image: siteImages.services.postProduction,
  },
  Digital: { href: "/what-we-do/digital", image: siteImages.services.digital },
  "Live Broadcast": {
    href: "/what-we-do/live-broadcast",
    image: siteImages.services.liveBroadcast,
  },
  "Cloud TV": { href: "/what-we-do/cloud-tv", image: siteImages.services.cloudTv },
  "Event Management": {
    href: "/what-we-do/event-management",
    image: siteImages.services.eventManagement,
  },
  Photography: { href: "/what-we-do/photography", image: siteImages.services.photography },
  "AI Creative Production": { href: "/what-we-do/ai-creative-production" },
};

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
        ? "Creative, production, post production, digital, live broadcast, Cloud TV, events, photography and AI production."
        : undefined,
    alternates: { canonical: `/${locale}/what-we-do` },
  };
}

export default async function WhatWeDoPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("whatWeDo");
  const list = t.raw("list") as Array<{ title: string; body: string }>;

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
        {list.map((item, index) => {
          const service = SERVICES[item.title] ?? { href: "/what-we-do" };
          return (
            <li
              key={item.title}
              className={`${styles.card} ${service.image ? "" : styles.cardFeatured}`}
            >
              <Link href={service.href} className={styles.cardLink}>
                <span className={styles.media} aria-hidden="true">
                  {service.image ? (
                    <Image
                      className={styles.mediaImage}
                      src={service.image.src}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      priority={index < 3}
                    />
                  ) : null}
                </span>
                <span className={styles.cardBody}>
                  <span className={styles.cardTitle}>{item.title}</span>
                  <span className={styles.cardText}>{item.body}</span>
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
