import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";

/**
 * Solutions — 29 Ağustos 2026 müşteri revizyonuyla üst menüye dönen sayfa.
 *
 * İçerik kaynağı: eski hibrid360.com/solutions. O sayfa bir kapak başlığı
 * ("Solutions" + "More And More") ve on beş yetenek kutucuğundan
 * oluşuyordu — gövde paragrafı yoktu. Buraya da yalnızca o on beş madde
 * alındı; eski sayfada olmayan bir giriş metni **uydurulmadı**. Müşteriden
 * bir tanım paragrafı gelirse eklenecek (bkz.
 * docs/content/CURRENT_CONTENT_GAPS.md).
 *
 * Maddelerin TR karşılıkları doğrudan çeviridir; yeni hizmet veya iddia
 * eklenmedi, sıra eski sayfadakiyle birebir aynıdır.
 *
 * "Photo Shooting" listede duruyor: Photography bağımsız hizmet sayfası
 * olmaktan çıktı ama bir yetenek olarak eski sitede de burada
 * listeleniyordu (bkz. docs/DECISIONS.md #17).
 *
 * SUNUM: burada bilinçli olarak yalnızca semantik iskelet var — sarmalayıcı
 * div, CSS modülü, animasyon veya satır içi stil yok. Görsel katman
 * (full-bleed düzen, kutucuk ızgarası, hover) Codex tarafından bağlanacak.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Solutions",
    description:
      locale === "en"
        ? "Brand consultancy, advertising, print, packaging, outdoor, web, digital, TVC, events, live broadcast, shooting, post production and Cloud TV."
        : "Marka danışmanlığı, reklam, basılı işler, ambalaj, açık hava, web, dijital, TVC, etkinlik, canlı yayın, çekim, post prodüksiyon ve Cloud TV.",
    alternates: localizedAlternates(locale, "/solutions"),
  };
}

export default async function SolutionsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("solutions");
  const items = t.raw("items") as string[];

  return (
    // <main> layout'ta zaten var (#main-content) — burada tekrarlanmaz.
    <div>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Solutions", path: "/solutions" },
        ])}
      />

      <h1>{t("heroTitle")}</h1>
      {/* Eski sayfanın kendi üst başlığı; marka dili, iki dilde de aynı. */}
      <p>{t("heroKicker")}</p>

      <section>
        <h2>{t("listTitle")}</h2>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
