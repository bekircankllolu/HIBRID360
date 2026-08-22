import { PageStub } from "@/components/PageStub";
import type { Locale } from "@/i18n/routing";

// TODO: brief-rev12.md Bölüm 8 — Friends (eski adı: Clients), müşteri sözleri
export const metadata = { title: "Friends" };

export default async function FriendsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <PageStub title="FRIENDS" locale={locale} path="/friends" />;
}
