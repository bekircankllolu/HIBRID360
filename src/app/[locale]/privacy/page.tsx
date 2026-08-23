import type { Metadata } from "next";
import { PolicyPage } from "@/components/legal/PolicyPage";
import { privacyPolicyTr, privacyPolicyEn } from "@/data/policies/privacy";
import type { Locale } from "@/i18n/routing";

// brief-rev12.md Bölüm 14 — Privacy Policy. Metin
// HIBRID360_Corporate_Policies_Pack'ten birebir (bkz. src/data/policies/privacy.ts).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = locale === "tr" ? privacyPolicyTr : privacyPolicyEn;
  return { title: doc.title };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const doc = locale === "tr" ? privacyPolicyTr : privacyPolicyEn;

  return (
    <PolicyPage
      doc={doc}
      locale={locale}
      breadcrumb={[
        { name: "Home", path: "" },
        { name: doc.title, path: "/privacy" },
      ]}
    />
  );
}
