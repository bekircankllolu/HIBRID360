import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/PageStub";
import type { Locale } from "@/i18n/routing";

// TODO: brief-rev12.md Bölüm 14 — Cookie Policy (+ onay bandı)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer.legal" });
  return { title: t("cookie") };
}

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("footer.legal");
  return <PageStub title={t("cookie")} locale={locale} path="/cookie-policy" />;
}
