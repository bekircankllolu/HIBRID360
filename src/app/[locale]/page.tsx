import { PageStub } from "@/components/PageStub";
import { Mona } from "@/components/mona/Mona";
import { homepageLines } from "@/data/mona";
import type { Locale } from "@/i18n/routing";

// TODO: brief-rev12.md Bölüm 4-5 — hero katmanı (WebGL tipografi, güneş
// sistemi, dönüşümlü slogan bloğu) Faz 5'te eklenecek.
// Ana sayfa "Home" olduğu için BreadcrumbList üretilmiyor (locale/path
// verilmiyor) — bkz. src/components/PageStub.tsx.
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <div>
      <PageStub title="HIBRID 360" />
      {/* brief 11.5 — ana sayfadaki kısa MONA sürümü: iki replik, uzun
          konuşma yok, ziyaretçi AI sayfasına davet edilir. */}
      <Mona locale={locale} lines={homepageLines} variant="compact" />
    </div>
  );
}
