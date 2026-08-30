import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
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
  return {
  // Sayfa başlığı locale'e bağlı: TR sekmesinde/arama sonucunda İngilizce
  // başlık çıkıyordu. Görünür sayfa terminolojisiyle aynı sözlükten
  // (meta.title) okunuyor; alternates/canonical yapısı değişmedi.
    title: t("title.work"),
    description:
      locale === "en"
        ? "Selected films, campaigns and live productions by Hibrid 360."
        : "Hibrid 360'ın seçili film, kampanya ve canlı prodüksiyon işleri.",
    alternates: localizedAlternates(locale, "/work"),
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("work");
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
        <h1 className={styles.heroTitle}>{t("pageTitle")}</h1>
      </header>

      <WorkArchive
        works={works}
        locale={locale}
        confidentialLabel={t("confidentialClient")}
      />

      <div className={styles.outro}>
        <p className={styles.seoHeading}>{t("seoHeading")}</p>
        <p className={styles.closingLead}>{t("ctaLead")}</p>
      </div>
    </main>
  );
}
