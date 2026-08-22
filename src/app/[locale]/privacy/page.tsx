import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/PageStub";
import type { Locale } from "@/i18n/routing";

// TODO: brief-rev12.md Bölüm 14 — Privacy Policy (iki dilli, KVKK/GDPR uyumlu)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer.legal" });
  return { title: t("privacy") };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("footer.legal");
  return <PageStub title={t("privacy")} locale={locale} path="/privacy" />;
}
