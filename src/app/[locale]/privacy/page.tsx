import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/legal/LegalPage";
import { privacySections } from "@/data/legal";
import type { Locale } from "@/i18n/routing";

// brief-rev12.md Bölüm 14 — yasal sayfa, iki dilli.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer.legal" });
  return { title: t("privacy") };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("footer.legal");
  return (
    <LegalPage
      locale={locale}
      title={t("privacy")}
      path="/privacy"
      sections={privacySections}
    />
  );
}
