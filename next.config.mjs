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
  // Photography bağımsız hizmet sayfası olmaktan çıktı; en yakın canonical
  // üst sayfa What We Do hub'ı.
  ["/what-we-do/photography", "/what-we-do"],
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 15, birden fazla lockfile görünce workspace kökünü kendisi tahmin
  // ediyor ve bu makinede ev dizinindeki alakasız bir package-lock.json'ı
  // seçiyordu. Kök yanlış olduğunda output file tracing yanlış dosya kümesini
  // toplar — Cloudflare/standalone çıktısı doğrudan bundan etkilenir.
  // Tahmine bırakmak yerine depo kökü sabitleniyor.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),

  async redirects() {
    return LOCALES.flatMap((locale) =>
      LEGACY_ROUTE_MAP.map(([from, to]) => ({
        source: `/${locale}${from}`,
        destination: `/${locale}${to}`,
        permanent: true,
      })),
    );
  },
};

export default withNextIntl(nextConfig);
