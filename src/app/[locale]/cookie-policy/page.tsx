import type { Metadata } from "next";
import { PolicyPage } from "@/components/legal/PolicyPage";
import { cookiePolicyTr, cookiePolicyEn } from "@/data/policies/cookie";
import type { Locale } from "@/i18n/routing";

// brief-rev12.md Bölüm 14 — Cookie Policy. Metin
// HIBRID360_Corporate_Policies_Pack'ten birebir (bkz. src/data/policies/cookie.ts).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = locale === "tr" ? cookiePolicyTr : cookiePolicyEn;
  return { title: doc.title };
}

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const doc = locale === "tr" ? cookiePolicyTr : cookiePolicyEn;

  return (
    <PolicyPage
      doc={doc}
      locale={locale}
      breadcrumb={[
        { name: "Home", path: "" },
        { name: doc.title, path: "/cookie-policy" },
      ]}
    />
  );
}
