import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import {
  sustainabilityData,
  isSustainabilityPublishable,
  reductionMeasures,
} from "@/data/sustainability";
import type { Locale } from "@/i18n/routing";
import styles from "@/components/legal/LegalPage.module.css";

/**
 * Sustainability — brief-rev12.md Bölüm 18.11.
 *
 * Brief'in istediği üç zorunlu bölüm: Measurement · Reduction · Offset
 * (artı "On set"). Ölçüm ve sertifika verisi girilmeden karbon nötr
 * iddiası YAYINLANMIYOR — brief'in greenwashing uyarısı gereği.
 *
 * TODO: brief 18.11 — ölçüm (araç + tarih + gram CO₂), yeşil hosting
 * sağlayıcısı ve denkleştirme sertifika numarası girilince
 * src/data/sustainability.ts güncellenecek; sayfa ve footer rozeti
 * otomatik olarak yayına açılır.
 * TODO: brief 18.11 — "On set" bölümü (prodüksiyonda ulaşım, catering,
 * atık, ekipman) operasyon tarafından yazılacak.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sustainability" });
  return { title: t("title") };
}

export default async function SustainabilityPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("sustainability");
  const publishable = isSustainabilityPublishable();

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Culture", path: "/culture" },
          { name: "Sustainability", path: "/culture/sustainability" },
        ])}
      />
      <h1 className={styles.title}>{t("title")}</h1>

      {!publishable && <p className={styles.notice}>{t("pendingEvidence")}</p>}

      <section className={styles.section}>
        <h2 className={styles.heading}>Measurement</h2>
        {publishable ? (
          <p className={styles.body}>
            {t("measurement", {
              grams: sustainabilityData.gramsCo2PerView ?? 0,
              tool: sustainabilityData.measurementTool ?? "",
              date: sustainabilityData.measuredOn ?? "",
            })}
          </p>
        ) : (
          <EmptyState message={t("measurementPending")} />
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Reduction</h2>
        {/* Bu maddeler iddia değil, sitede uygulanmış mühendislik
            kararları — ölçüm verisi olmadan da doğrular. */}
        <ul>
          {reductionMeasures.map((measure) => (
            <li key={measure.en}>{measure[locale]}</li>
          ))}
        </ul>
        {!sustainabilityData.greenHostingProvider && (
          <EmptyState message={t("hostingPending")} />
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Offset</h2>
        {publishable ? (
          <p className={styles.body}>
            {t("offset", {
              program: sustainabilityData.offsetProgram ?? "",
              certificate: sustainabilityData.offsetCertificateNumber ?? "",
            })}
          </p>
        ) : (
          <EmptyState message={t("offsetPending")} />
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>On set</h2>
        <EmptyState message={t("onSetPending")} />
      </section>
    </div>
  );
}
