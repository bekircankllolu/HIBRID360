import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "@/styles/culture-page.module.css";

/**
 * PAR-01..03 (nihai copy deck, Ağustos 2026) — Partners.
 *
 * 29 Ağustos 2026 revizyonu: sayfa /culture/partners'tan üst menüdeki
 * canonical /partners rotasına taşındı; eski yol kalıcı olarak buraya
 * yönlendiriliyor (next.config.mjs). İçerik değişmedi.
 * PAR-02 [DOĞRULA]: alıntı mevcut sitede MOTIVE'ye atfedilmiş; deck
 * reklamcılıkta David Ogilvy'ye ait olduğunu belirtiyor ama kesin
 * doğrulama istiyor — attribütü olduğu gibi bırakıp deck'in kendi
 * belirsizliğini burada da not düşüyoruz (TODO).
 * PAR-03: MOTIVE partner listesinden çıktı; Studio Food Room artık tek
 * partner, ortak galeri/anlatım yok (deck'in kendi notu).
 */

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
    title: t("title.partners"),
    alternates: localizedAlternates(locale, "/partners"),
  };
}

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("culture.partners");

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Partners", path: "/partners" },
        ])}
      />

      <h1 className={styles.heroTitle}>PARTNERS</h1>
      <p className={styles.heroLead}>Love Is On The Air</p>

      <section className={styles.section}>
        {/* TODO: PAR-02 [DOĞRULA] — David Ogilvy atfı teyit edilmeden
            yayına girmeden önce doğrulanmalı. */}
        <p className={styles.quote}>{t("quote")}</p>
        <p className={styles.quoteAuthor}>{t("quoteAuthor")}</p>
      </section>

      <div className={styles.partnerItem}>
        <p className={styles.partnerName}>{t("partnerName")}</p>
        <p className={styles.partnerBody}>{t("partnerBody")}</p>
        <a
          href={`https://${t("partnerUrl")}`}
          target="_blank"
          rel="noreferrer"
          className={styles.partnerLink}
        >
          {t("partnerUrl")}
        </a>
      </div>
    </div>
  );
}
