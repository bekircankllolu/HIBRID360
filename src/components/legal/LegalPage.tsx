import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import type { Locale } from "@/i18n/routing";
import type { LegalSection } from "@/data/legal";
import styles from "./LegalPage.module.css";

/**
 * Yasal sayfalar için ortak iskelet. Bölüm başlıkları gerçek (brief Bölüm
 * 14 kapsamı), gövde metni hukuk danışmanından gelene kadar dürüst bir
 * boş durum gösterir — uydurma yasal metin yazılmaz.
 */
export async function LegalPage({
  locale,
  title,
  path,
  sections,
}: {
  locale: Locale;
  title: string;
  path: string;
  sections: LegalSection[];
}) {
  const t = await getTranslations("legal");

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: title, path },
        ])}
      />
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.notice}>{t("pendingCounsel")}</p>

      {sections.map((section) => (
        <section key={section.heading.en} className={styles.section}>
          <h2 className={styles.heading}>{section.heading[locale]}</h2>
          {section.body ? (
            <p className={styles.body}>{section.body[locale]}</p>
          ) : (
            <EmptyState message={t("sectionPending")} />
          )}
        </section>
      ))}
    </div>
  );
}
