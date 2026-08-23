import type { Metadata } from "next";
import { PolicyPage } from "@/components/legal/PolicyPage";
import { termsOfUseTr, termsOfUseEn } from "@/data/policies/terms";
import type { Locale } from "@/i18n/routing";

/**
 * Kullanım Koşulları / Terms of Use — YENİ sayfa, brief-rev12.md'nin
 * Bölüm 14 yasal sayfa listesinde yoktu. Müşteriden gerçek, onaylı bir
 * Kullanım Koşulları metni teslim edildi (bkz. src/data/policies/terms.ts);
 * gerçek içerik elde varken sayfayı açmamak yerine footer'a yeni bir
 * yasal link olarak eklendi.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = locale === "tr" ? termsOfUseTr : termsOfUseEn;
  return { title: doc.title };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const doc = locale === "tr" ? termsOfUseTr : termsOfUseEn;

  return (
    <PolicyPage
      doc={doc}
      locale={locale}
      breadcrumb={[
        { name: "Home", path: "" },
        { name: doc.title, path: "/terms" },
      ]}
    />
  );
}
