// Site geneli sabitler.
// Kaynak: Hibrid360_Yeni_Site_Tum_Metinler.pdf (19 Ağustos 2026, Zühre
// Didem Gödek onaylı nihai copy deck — brief-rev12.md'den sonra gelen,
// "sitenin metin kaynağı" ilan edilmiş doküman; bloklar GEN-xx/HOME-xx vb.
// kodlarla anılır). Bu dosya brief-rev12.md'deki daha eski değerlerin
// yerini alır.

// SITE_URL — robots.txt, sitemap.xml, canonical/hreflang ve schema.org
// için TEK kaynak (bkz. src/app/robots.ts, src/app/sitemap.ts,
// src/app/[locale]/layout.tsx metadataBase, src/lib/schema.ts — hepsi
// bu sabiti kullanır, kendi domain mantığını türetmez).
//
// Öncelik sırası:
//   1) NEXT_PUBLIC_SITE_URL — açıkça ayarlanmışsa (üretim domaini).
//   2) Vercel'in kendi sağladığı önizleme/prod URL'i
//      (VERCEL_PROJECT_PRODUCTION_URL, yoksa VERCEL_URL) — şema eksikse
//      https:// eklenir. Bu olmadan preview/staging deploy'lar canlı
//      hibrid360.com domainini sitemap/robots'a yazıyordu.
//   3) https://hibrid360.com — yerel geliştirme ve env değişkeni hiç
//      tanımlanmamışsa son çare.
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) {
    const withScheme = /^https?:\/\//.test(vercelHost)
      ? vercelHost
      : `https://${vercelHost}`;
    return withScheme.replace(/\/$/, "");
  }

  return "https://hibrid360.com";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Hibrid 360";

// HOME-09: "aynı cümle ana sayfanın meta description'ında ve LinkedIn
// biyografisinde de kullanılır" — bu yüzden schema.org description ve
// <meta name="description"> için de bu cümle tekil kaynak.
export const SITE_TAGLINE = "Türkiye's AI-native Creative Production Studio";
export const SITE_TAGLINE_TR = "Türkiye'nin AI-native kreatif prodüksiyon stüdyosu";

// GEN-04 — marka imzası, her sayfanın footer'ında, değişmez, iki dilde de İngilizce.
export const BRAND_SIGNATURE = "The future of creativity isn't artificial. It's hybrid.";

// GEN-05 / CON-03 — footer ve Contact adres kutucuğu, birebir.
export const CONTACT = {
  addressLines: [
    "Feneryolu Mahallesi, Ebru Sk.",
    "Manolya Apt. No: 3A / 3B",
    "Kadıköy — İstanbul, Türkiye",
  ],
  streetAddress: "Feneryolu Mahallesi, Ebru Sk. Manolya Apt. No: 3A / 3B",
  addressLocality: "Kadıköy, İstanbul",
  addressCountry: "TR",
  // Nihai copy deck'te telefon numarası değişti (brief-rev12'deki sabit
  // hat +90 216 606 88 98 yerine bu cep numarası geldi) — GEN-05 ve
  // CON-03'te aynı numara iki kez teyit ediliyor.
  phone: "+90 532 613 50 45",
  email: "contact@hibrid360.com",
} as const;

// TODO: DECISIONS.md #1, #4 — şirket ünvanı (A.Ş./Ltd. Şti.) netleşmeden
// telif satırı ve schema.org "legalName" alanı eksik kalacak.

// Sosyal medya — brief-rev12.md Bölüm 17.2: hesaplar "var/açılacak" durumda,
// URL'ler henüz teyit edilmedi. TODO: brief 17.2 — hesaplar netleşince
// schema.org "sameAs" dizisine eklenecek.
export const SOCIAL_PLATFORMS = [
  "Instagram",
  "Vimeo",
  "YouTube",
  "LinkedIn",
  "Spotify",
] as const;

// TODO: brief 16 (video ve görsel varlık listesi) — marka favicon'u ve
// og:image görseli teslim edilince public/ altına eklenecek. create-next-app
// ile gelen 26KB'lık varsayılan favicon kaldırıldı (CLAUDE.md: placeholder
// varlık production'a gitmez).
