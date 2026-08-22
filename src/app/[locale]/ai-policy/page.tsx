import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { EmptyState } from "@/components/EmptyState";
import { aiPolicySections } from "@/data/legal";
import type { Locale } from "@/i18n/routing";
import styles from "@/components/legal/LegalPage.module.css";

/**
 * AI Usage & Rights — brief-rev12.md Bölüm 18.9.
 * URL brief'te /tr/ai-policy · /en/ai-policy olarak tanımlı.
 *
 * Başlıklar ve altlarındaki soru cümleleri SİTEYE GİRECEK METİN kutusundan
 * birebir (EN; brief: "TR sürümü aynı başlıklarla"). Cevaplar hukuk
 * danışmanıyla birlikte yazılacak.
 *
 * TODO: brief 18.9 — "Ajansın gerçekte ne yaptığından fazlasını yazmak en
 * büyük risktir. Yalnızca uygulanan kurallar yazılır." Bu yüzden hiçbir
 * cevap tahminle doldurulmadı.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer.legal" });
  return { title: t("aiUsage") };
}

export default async function AiPolicyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const tLegal = await getTranslations("footer.legal");
  const t = await getTranslations("legal");

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "AI Usage & Rights", path: "/ai-policy" },
        ])}
      />
      <h1 className={styles.title}>{tLegal("aiUsage")}</h1>
      <p className={styles.notice}>{t("pendingCounsel")}</p>

      {aiPolicySections.map((section) => (
        <section key={section.heading} className={styles.section}>
          <h2 className={styles.heading}>
            {section.heading} — {section.prompt}
          </h2>
          <EmptyState message={t("sectionPending")} />
        </section>
      ))}
    </div>
  );
}
