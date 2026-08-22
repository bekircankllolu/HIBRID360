import { PageStub } from "@/components/PageStub";
import type { Locale } from "@/i18n/routing";

// TODO: brief-rev12.md Bölüm 13 — Contact (form + WhatsApp + Brief Builder 18.8 + randevu)
export const metadata = { title: "Contact" };

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <PageStub title="CONTACT" locale={locale} path="/contact" />;
}
