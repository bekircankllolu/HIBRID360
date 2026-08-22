import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import {
  ACCESSIBILITY_COMMITMENT,
  ACCESSIBILITY_DONE,
  ACCESSIBILITY_FEEDBACK,
  ACCESSIBILITY_LAST_REVIEWED,
  knownLimitations,
} from "@/data/accessibility";
import type { Locale } from "@/i18n/routing";
import styles from "@/components/legal/LegalPage.module.css";

/**
 * Accessibility Statement — brief-rev12.md Bölüm 18.10.
 * Metinler SİTEYE GİRECEK METİN kutusundan birebir; "Known limitations"
 * bölümü brief'in özel notu gereği dürüstçe dolduruldu (bkz.
 * src/data/accessibility.ts).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer.legal" });
  return { title: t("accessibility") };
}

export default async function AccessibilityPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const tLegal = await getTranslations("footer.legal");
  const t = await getTranslations("accessibilityPage");

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Accessibility Statement", path: "/accessibility" },
        ])}
      />
      <h1 className={styles.title}>{tLegal("accessibility")}</h1>

      <section className={styles.section}>
        <p className={styles.body}>{ACCESSIBILITY_COMMITMENT}</p>
      </section>

      <section className={styles.section}>
        <p className={styles.body}>{ACCESSIBILITY_DONE}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>{t("knownLimitations")}</h2>
        <ul>
          {knownLimitations.map((limitation) => (
            <li key={limitation.en}>{limitation[locale]}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <p className={styles.body}>{ACCESSIBILITY_FEEDBACK}</p>
      </section>

      <section className={styles.section}>
        <p className={styles.body}>
          {ACCESSIBILITY_LAST_REVIEWED
            ? t("lastReviewed", { date: ACCESSIBILITY_LAST_REVIEWED })
            : t("reviewPending")}
        </p>
      </section>
    </div>
  );
}
