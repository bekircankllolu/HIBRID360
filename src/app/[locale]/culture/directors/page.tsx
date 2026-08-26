import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import { getPublishedDirectors } from "@/lib/content";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "./page.module.css";

/**
 * brief-rev12.md Bölüm 20.3 — Directors & Crew.
 * Hero metinleri "SİTEYE GİRECEK METİN" kutularından birebir; bu sayfada
 * brief hem EN hem TR sürümü veriyor, ikisi de messages dosyalarında.
 *
 * TODO: docs/DECISIONS.md #14 bekleniyor — sayfaya kaç kişi girecek ve
 * fotoğraf çekimi ne zaman yapılacak. Brief'in uyarısı: fotoğraflar tek
 * seansta, aynı ışıkta çekilmeli; farklı yıllardan derlenmiş vesikalık
 * koleksiyonu sayfayı çürütür. Bu yüzden kadro + çekim tarihi gelmeden
 * hiçbir profil yayınlanmıyor.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "directors" });
  return {
    title: "Directors & Crew",
    description: t("heroSubtitle"),
    alternates: localizedAlternates(locale, "/culture/directors"),
  };
}

export default async function DirectorsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("directors");
  const directors = await getPublishedDirectors();

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Culture", path: "/culture" },
          { name: "Directors & Crew", path: "/culture/directors" },
        ])}
      />

      <h1 className={styles.heroTitle}>{t("heroTitle")}</h1>
      <p className={styles.heroSubtitle}>{t("heroSubtitle")}</p>

      {directors.length === 0 ? (
        <EmptyState message={t("empty")} />
      ) : (
        <div className={styles.grid}>
          {directors.map((director) => (
            <Link
              key={director.id}
              href={`/culture/directors/${director.slug}`}
              className={styles.card}
            >
              {/* TODO: DECISIONS.md #14 — fotoğraf çekimi yapılana kadar
                  photo_url boş; boş çerçeve gösteriliyor. */}
              <span className={styles.photoPlaceholder} />
              <span className={styles.name}>{director.full_name}</span>
              <span className={styles.role}>{director.role}</span>
              {(locale === "tr" ? director.one_liner_tr : director.one_liner_en) && (
                <span className={styles.oneLiner}>
                  {locale === "tr" ? director.one_liner_tr : director.one_liner_en}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
