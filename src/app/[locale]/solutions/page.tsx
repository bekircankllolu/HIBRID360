import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import styles from "./page.module.css";

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
 * SUNUM: tam genişlik kapak + tipografik ızgara (bkz. page.module.css).
 * Maddeler bağlantı DEĞİL — her yeteneğin kendi sayfası yok ve olmayan
 * bir hedefe link uydurulmadı. Hover göstergesi bu yüzden yalnızca
 * dekoratif: çizgi ve ok, metin rengi sabit.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
  // Sayfa başlığı locale'e bağlı: TR sekmesinde/arama sonucunda İngilizce
  // başlık çıkıyordu. Görünür sayfa terminolojisiyle aynı sözlükten
  // (meta.title) okunuyor; alternates/canonical yapısı değişmedi.
    title: t("title.solutions"),
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
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Solutions", path: "/solutions" },
        ])}
      />

      <header className={styles.hero}>
        {/* Eski sayfanın kendi üst başlığı; marka dili, iki dilde de aynı. */}
        <p className={styles.kicker}>{t("heroKicker")}</p>
        <h1 className={styles.title}>{t("heroTitle")}</h1>
      </header>

      <section className={styles.list}>
        <h2 className={styles.listTitle}>{t("listTitle")}</h2>
        <ul className={styles.grid}>
          {items.map((item, index) => (
            <li key={item} className={styles.item}>
              <span className={styles.index}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.label}>{item}</span>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
