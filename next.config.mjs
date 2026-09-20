import path from "node:path";
import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const LOCALES = ["tr", "en"];

/**
 * 29 Ağustos 2026 müşteri revizyonu — kalıcı yönlendirmeler.
 *
 * Eski rotalar yayında bağlantı ve arama motoru geçmişi taşıyor; canonical
 * rotalar değiştiği için 308 (permanent) veriliyor. Yönlendirme
 * next-intl'in locale önekinden **sonra** eşleşir, bu yüzden her kural iki
 * locale için ayrı üretiliyor — `/:locale` yakalayıcı kullanılmıyor, aksi
 * halde `/xx/friends` gibi geçersiz locale'ler de eşleşirdi.
 *
 * Yönlendirmeler yalnızca eski→yeni yol eşlemesi yapar; locale önekini
 * korur, sorgu dizesini Next kendisi taşır. Canonical/hreflang etiketleri
 * ve sitemap zaten yeni rotaları gösterir (bkz. src/app/sitemap.ts) —
 * yönlendirilen bir URL hiçbir yerde canonical olarak ilan edilmez.
 */
const LEGACY_ROUTE_MAP = [
  ["/friends", "/clients"],
  ["/culture/who-we-are", "/who-we-are"],
  ["/culture/what-we-believe", "/what-we-believe"],
  ["/culture/partners", "/partners"],
  ["/insights", "/think-and-thank"],
  // Photography bağımsız hizmet sayfası olmaktan çıktı; en yakın canonical
  // üst sayfa What We Do hub'ı.
  ["/what-we-do/photography", "/what-we-do"],
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep an isolated preview from rewriting another running server's build.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Next 15, birden fazla lockfile görünce workspace kökünü kendisi tahmin
  // ediyor ve bu makinede ev dizinindeki alakasız bir package-lock.json'ı
  // seçiyordu. Kök yanlış olduğunda output file tracing yanlış dosya kümesini
  // toplar — Cloudflare/standalone çıktısı doğrudan bundan etkilenir.
  // Tahmine bırakmak yerine depo kökü sabitleniyor.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),

  /**
   * Geçici barındırma adresleri (`*.vercel.app`) arama motorlarına KAPALI
   * (20 Eylül 2026): site müşteri incelemesi için Vercel'de herkese açık, ama
   * gerçek alan adı (hibrid360.com) bağlanmadan indekslenmemeli — aksi halde
   * vercel.app kopyası arama sonuçlarında gerçek sitenin önüne geçebilir.
   *
   * `X-Robots-Tag` başlığı HTML, görsel, video ve PDF dahil her yanıta uygulanır
   * (robots.txt'in `Disallow`'u yerine tercih edildi: engellenen bir URL'in
   * başlığı hiç okunamaz, başka sitelerin bağlantısıyla yine de listelenebilir).
   * Eşleşme `Host` başlığına göre: özel alan adında başlık HİÇ eklenmez, yani
   * canlıya geçişte ek bir değişiklik gerekmez.
   */
  async headers() {
    return [
      // Statik dosyalar (public/) için tarayıcı önbelleği. Vercel bunları
      // varsayılan olarak `max-age=0, must-revalidate` ile sunuyor: sayfa
      // değiştikçe her font/video/ses/görsel için yeniden doğrulama turu (304)
      // gerekiyor; yavaş bağlantıda bu istekler video/JS indirmeyle yarışıyor.
      //
      // Süreler kasıtlı olarak kısa: müşteri incelemesi sürerken aynı adla
      // değiştirilen bir dosya (MONA sesi, showreel vb.) günlerce eski görünmesin.
      // Font nadiren değişir (7 gün); medya 1 saat taze + 1 gün arka planda
      // yenileme. Bir varlığı DEĞİŞTİRİRKEN mümkünse yeni adla ekle
      // (`-20260920` gibi) — o zaman önbellek hiç sorun olmaz.
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=2592000",
          },
        ],
      },
      ...["/videos", "/audio", "/images"].map((prefix) => ({
        source: `${prefix}/:path*`,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      })),
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },

  async redirects() {
    return [
      ...LOCALES.flatMap((locale) =>
        LEGACY_ROUTE_MAP.map(([from, to]) => ({
          source: `/${locale}${from}`,
          destination: `/${locale}${to}`,
          permanent: true,
        })),
      ),
      ...LOCALES.map((locale) => ({
        source: `/${locale}/insights/:slug`,
        destination: `/${locale}/think-and-thank/:slug`,
        permanent: true,
      })),
    ];
  },
};

export default withNextIntl(nextConfig);
