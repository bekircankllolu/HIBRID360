import { PageStub } from "@/components/PageStub";
import type { Locale } from "@/i18n/routing";

// TODO: brief-rev12.md Bölüm 9-10 — Creative, Digital ve WHAT WE DO alt sayfaları
// (Creative, Production, Post Production, Digital, Live Broadcast, Cloud TV,
// Event Management, Photography, AI Creative Production, Service Production
// International, How We Work)
export const metadata = { title: "What We Do" };

export default async function WhatWeDoPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <PageStub title="WHAT WE DO" locale={locale} path="/what-we-do" />;
}
