import { PageStub } from "@/components/PageStub";
import type { Locale } from "@/i18n/routing";

// TODO: brief-rev12.md Bölüm 6 — Culture (Who We Are, What We Believe,
// Directors & Crew (20.3), Partners, Sustainability (20.11))
export const metadata = { title: "Culture" };

export default async function CulturePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <PageStub title="CULTURE" locale={locale} path="/culture" />;
}
