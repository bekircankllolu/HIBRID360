import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { TeamBand } from "@/components/work/TeamBand";
import { WorkHeroFilm } from "@/components/work/WorkHeroFilm";
import { WorkArchive } from "@/components/work/WorkArchive";
import type { Locale } from "@/i18n/routing";
import { getPublishedWorks } from "@/lib/content";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { localizedAlternates } from "@/lib/site";
import styles from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const works = await getPublishedWorks();
  return {
  // Sayfa başlığı locale'e bağlı: TR sekmesinde/arama sonucunda İngilizce
  // başlık çıkıyordu. Görünür sayfa terminolojisiyle aynı sözlükten
  // (meta.title) okunuyor; alternates/canonical yapısı değişmedi.
    title: t("title.work"),
    description:
      locale === "en"
        ? "Selected films, campaigns and live productions by Hibrid 360."
        : "Hibrid 360’ın seçili film, kampanya ve canlı prodüksiyon işleri.",
    robots: works.length > 0 ? undefined : { index: false, follow: true },
    alternates: localizedAlternates(locale, "/work"),
  };
}

export default async function WorkPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const { locale } = await params;
  const { service } = await searchParams;
  const t = await getTranslations("work");
  const tCommon = await getTranslations("common");
  const works = await getPublishedWorks();

  return (
    <main className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Work", path: "/work" },
        ])}
      />

      <header className={styles.hero}>
        {/* 20 Eylül 2026: etkileşimli nöron ağı kaldırıldı (kullanıcı:
            "buradaki nöron görselini değiştirelim, buraya takım
            çalışmasını anlatan özgün bir video koyabilirsin"). Sunulan üç
            yönden GERÇEK SET seçildi. */}
        <WorkHeroFilm locale={locale} disclosure={tCommon("aiRepresentative")} />
        <div className={styles.heroCopy}>
          <h1 className={styles.heroTitle}>THE ART OF TEAMWORK</h1>
          <p className={styles.heroLead}>{t("showreelBody")}</p>
        </div>
      </header>

      <h2 className={styles.archiveTitle}>{t("recentTitle")}</h2>
      <WorkArchive
        works={works}
        locale={locale}
        confidentialLabel={t("confidentialClient")}
        initialService={service}
      />

      {/* Arşiv ile kapanış çağrısı arasında bir nefes. Burası daha önce
          marka ident'i taşıyordu (önce dönen parçacık küresi videosu,
          sonra parçacıkların "HIBRID 360" yazdığı sahne); ikisi de
          markadan söz ediyordu. Kullanıcı isteğiyle bant artık sayfanın
          KONUSUNU gösteriyor: birlikte çalışan bir ekip. */}
      <TeamBand locale={locale} disclosure={tCommon("aiRepresentative")} />

      <div className={styles.outro}>
        <p className={styles.seoHeading}>{t("tagline")}</p>
        <p className={styles.closingLead}>{t("ctaLead")}</p>
      </div>
    </main>
  );
}
