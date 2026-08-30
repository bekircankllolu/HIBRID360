import type { Metadata } from "next";
import { PolicyPage } from "@/components/legal/PolicyPage";
import { kvkkNoticeTr, kvkkNoticeEn } from "@/data/policies/kvkk";
import type { Locale } from "@/i18n/routing";

// brief-rev12.md Bölüm 14 — KVKK Aydınlatma Metni. Bkz.
// src/data/policies/kvkk.ts — Gizlilik Politikası'ndan derlenmiş, KVKK
// madde 10'un istediği üç unsura karşılık gelen bölümler.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = locale === "tr" ? kvkkNoticeTr : kvkkNoticeEn;
  return {
    title: doc.title,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function KvkkPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const doc = locale === "tr" ? kvkkNoticeTr : kvkkNoticeEn;

  return (
    <PolicyPage
      doc={doc}
      locale={locale}
      breadcrumb={[
        { name: "Home", path: "" },
        { name: doc.title, path: "/kvkk" },
      ]}
    />
  );
}
