import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/PageStub";
import type { Locale } from "@/i18n/routing";

// TODO: brief-rev12.md Bölüm 18.10 — Accessibility Statement (bilinen sınırlamalar dürüstçe listelenecek)
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
  const t = await getTranslations("footer.legal");
  return (
    <PageStub title={t("accessibility")} locale={locale} path="/accessibility" />
  );
}
