import { HeroTypography } from "@/components/hero/HeroTypography";
import { RotatingSlogans } from "@/components/hero/RotatingSlogans";
import { SolarSystem } from "@/components/hero/SolarSystem";
import { Mona } from "@/components/mona/Mona";
import { homepageLines } from "@/data/mona";
import type { Locale } from "@/i18n/routing";

/**
 * Ana sayfa — brief-rev12.md Bölüm 4 ve 5.
 *
 * Landing katmanı ayrı bir URL değil, ana sayfanın hero bölümü (brief
 * Bölüm 4 KARAR kutusu: ayrı splash sayfa Google'a "içeriksiz sayfa"
 * sinyali verir).
 *
 * TODO: brief 4.3 — menü altındaki film gösterim alanı (AI Showreel
 * Film A) varlık teslim edilince eklenecek; ses varsayılan kapalı,
 * ses açma düğmesi görünür olacak.
 * TODO: brief 4.6 — scroll ortasındaki iletişim ikonları + tek soruluk
 * adımlarla ilerleyen pop-up. Form akışı Brief Builder ile aynı mantıkta
 * kurulacak (bkz. src/components/brief/BriefBuilder.tsx).
 * TODO: brief Bölüm 4 KARAR — "İlk ziyaretten sonra animasyonun kısa
 * sürümü gösterilir (çerezle hatırlanır)": çerez onay bandı Faz 6'da
 * kurulunca, rıza durumuna bağlı olarak eklenecek.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <div>
      <HeroTypography />
      <RotatingSlogans />
      <SolarSystem />
      {/* brief 11.5 — ana sayfadaki kısa MONA sürümü: iki replik, uzun
          konuşma yok, ziyaretçi AI sayfasına davet edilir. */}
      <Mona locale={locale} lines={homepageLines} variant="compact" />
    </div>
  );
}
