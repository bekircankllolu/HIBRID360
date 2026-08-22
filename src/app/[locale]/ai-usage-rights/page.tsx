import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/PageStub";
import type { Locale } from "@/i18n/routing";

// TODO: brief-rev12.md Bölüm 18.9 — AI Usage & Rights (hukuk danışmanı girdisi gerekiyor)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer.legal" });
  return { title: t("aiUsage") };
}

export default async function AiUsageRightsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("footer.legal");
  return <PageStub title={t("aiUsage")} locale={locale} path="/ai-usage-rights" />;
}
