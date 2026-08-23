import type { Metadata } from "next";
import { PolicyPage } from "@/components/legal/PolicyPage";
import { responsibleAiPolicyTr, responsibleAiPolicyEn } from "@/data/policies/responsible-ai";
import type { Locale } from "@/i18n/routing";

/**
 * AI Usage & Rights — brief-rev12.md Bölüm 18.9.
 * URL brief'te /tr/ai-policy · /en/ai-policy olarak tanımlı.
 *
 * brief 18.9'daki yedi başlıklık iskelet ("How we use AI", "Your data"...)
 * artık gerçek, hukuk danışmanı onaylı metinle DEĞİŞTİRİLDİ — müşterinin
 * teslim ettiği Sorumlu Yapay Zekâ Politikası / Responsible AI Policy
 * dokümanı (bkz. src/data/policies/responsible-ai.ts). Brief zaten bu
 * başlıkların "iskelet" olduğunu ve hukuk danışmanınca yazılacağını
 * söylüyordu — bu doküman tam olarak o adımı karşılıyor.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = locale === "tr" ? responsibleAiPolicyTr : responsibleAiPolicyEn;
  return { title: doc.title };
}

export default async function AiPolicyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const doc = locale === "tr" ? responsibleAiPolicyTr : responsibleAiPolicyEn;

  return (
    <PolicyPage
      doc={doc}
      locale={locale}
      breadcrumb={[
        { name: "Home", path: "" },
        { name: doc.title, path: "/ai-policy" },
      ]}
    />
  );
}
