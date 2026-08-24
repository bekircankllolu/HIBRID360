import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { BriefBuilder } from "@/components/brief/BriefBuilder";
import type { Locale } from "@/i18n/routing";

// brief-rev12.md Bölüm 18.8 — Brief Builder. URL: /tr/brief · /en/brief
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Brief Builder",
    description:
      "Six questions, about two minutes. You'll get the summary in your inbox — and so will we.",
    alternates: { canonical: `/${locale}/brief` },
  };
}

export default async function BriefPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("brief");

  return (
    <div>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Brief Builder", path: "/brief" },
        ])}
      />
      {/* Sayfanın görsel açılışı MONA'nın repliği (bkz. BriefBuilder) —
          o büyük fuşya satırın üstüne ikinci bir görünür başlık koymak
          tasarımı kalabalıklaştırır. h1 burada .srOnly: hem sayfanın
          adım/özet/gönderim durumlarının hepsinde sabit kalır (BriefBuilder
          kendi içinde birden çok koşullu döngü render ediyor), hem de
          erişilebilirlik/SEO için gerekli tekil başlığı sağlar. */}
      <h1 className="srOnly">{t("pageTitle")}</h1>
      <BriefBuilder locale={locale} />
    </div>
  );
}
