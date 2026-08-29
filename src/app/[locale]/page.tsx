import type { Metadata } from "next";
import { HeroTypography } from "@/components/hero/HeroTypography";
import { RotatingSlogans } from "@/components/hero/RotatingSlogans";
import { SolarSystem } from "@/components/hero/SolarSystem";
import { LessTalk } from "@/components/home/LessTalk";
import { ServiceLinksRow } from "@/components/home/ServiceLinksRow";
import { MakeBrandBand } from "@/components/home/MakeBrandBand";
import { Tagline } from "@/components/home/Tagline";
import { ReachOut } from "@/components/home/ReachOut";
import { ClosingBand } from "@/components/home/ClosingBand";
import { ClosingBody } from "@/components/home/ClosingBody";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates, SITE_NAME, SITE_TAGLINE, SITE_TAGLINE_TR } from "@/lib/site";

/**
 * Ana sayfa — HOME-01..13 (nihai copy deck, Ağustos 2026).
 *
 * Landing katmanı ayrı bir URL değil, ana sayfanın hero bölümü (brief
 * Bölüm 4 KARAR kutusu: ayrı splash sayfa Google'a "içeriksiz sayfa"
 * sinyali verir).
 *
 * Ekran sırası deck'teki HOME-01..13 numaralamasıyla birebir:
 *   01-03 HeroTypography (dev tipografi + hero sloganı + showreel sahnesi)
 *   04    RotatingSlogans
 *   05    LessTalk
 *   06    ServiceLinksRow
 *   07    MakeBrandBand
 *   08    SolarSystem
 *   09    Tagline
 *   10    ReachOut
 *   11    ClosingBand
 *   12    ClosingBody
 *
 * TODO: brief Bölüm 4 KARAR — "İlk ziyaretten sonra animasyonun kısa
 * sürümü gösterilir (çerezle hatırlanır)": çerez onay bandı kuruldu, rıza
 * durumuna bağlı kısa sürüm mantığı henüz eklenmedi.
 */

// META tablosu (Bölüm 10, nihai copy deck) — TR sürümü henüz yazılmadı
// ("TR sürümü yazılacak" notu), bu yüzden description yalnızca EN'de
// ayarlanıyor; TR kök layout'taki SITE_TAGLINE varsayılanını kullanmaya
// devam ediyor.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: { absolute: "Hibrid 360 | AI-Native Creative Production Studio" },
    description:
      locale === "en"
        ? "Films, campaigns, live broadcast and AI production for global brands. Istanbul-based, 20+ years, one crew end to end."
        : undefined,
    alternates: localizedAlternates(locale),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <div>
      {/* Görsel hero "MAKE IT MATTER / HIBRID" WebGL tipografisi h1 değil
          (SEO/GEO ve ekran okuyucu için gerekli semantik h1'i taşımıyor —
          bkz. HeroTypography). Tasarımı bozmadan sayfanın gerçek h1'i burada,
          .srOnly ile ekranda görünmez ama başlık hiyerarşisinde birinci.
          Locale'e göre çevrilir — TR sayfada çevrilmemiş İngilizce başlık
          kalmasın (CLAUDE.md "Karışık dil yasak"). */}
      <h1 className="srOnly">
        {SITE_NAME} — {locale === "en" ? SITE_TAGLINE : SITE_TAGLINE_TR}
      </h1>
      <HeroTypography />
      <RotatingSlogans />
      <LessTalk />
      <ServiceLinksRow />
      <MakeBrandBand />
      <SolarSystem />
      <Tagline />
      <ReachOut />
      <ClosingBand />
      <ClosingBody />
    </div>
  );
}
