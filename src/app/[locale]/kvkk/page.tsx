import { getTranslations } from "next-intl/server";
import { PageStub } from "@/components/PageStub";
import type { Locale } from "@/i18n/routing";

// TODO: brief-rev12.md Bölüm 14 — KVKK/GDPR aydınlatma metni
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer.legal" });
  return { title: t("kvkk") };
}

export default async function KvkkPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("footer.legal");
  return <PageStub title={t("kvkk")} locale={locale} path="/kvkk" />;
}
