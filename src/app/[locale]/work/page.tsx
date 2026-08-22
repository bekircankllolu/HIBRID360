import { PageStub } from "@/components/PageStub";
import type { Locale } from "@/i18n/routing";

// TODO: brief-rev12.md Bölüm 7 — Works sayfası (Recent Works, yıl bazlı arşiv, vaka sayfaları)
// Blocker: DECISIONS.md #16 — Works içerik envanteri gelmeden grid tasarlanamaz (Faz 2)
export const metadata = { title: "Work" };

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <PageStub title="WORK" locale={locale} path="/work" />;
}
