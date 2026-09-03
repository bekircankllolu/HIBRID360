// Site geneli sabitler.
// Kaynak: Hibrid360_Yeni_Site_Tum_Metinler.pdf (19 Ağustos 2026, Zühre
// Didem Gödek onaylı nihai copy deck — brief-rev12.md'den sonra gelen,
// "sitenin metin kaynağı" ilan edilmiş doküman; bloklar GEN-xx/HOME-xx vb.
// kodlarla anılır). Bu dosya brief-rev12.md'deki daha eski değerlerin
// yerini alır.

function normalizeSiteUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  return withProtocol.replace(/\/+$/, "");
}

export const SITE_URL =
  normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
  normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  normalizeSiteUrl(process.env.VERCEL_URL) ??
  "https://hibrid360.com";

export function localizedAlternates(locale: "tr" | "en", path = "") {
  const suffix = path === "" ? "" : path.startsWith("/") ? path : `/${path}`;

  return {
    canonical: `/${locale}${suffix}`,
    languages: {
      tr: `/tr${suffix}`,
      en: `/en${suffix}`,
      "x-default": `/tr${suffix}`,
    },
  };
}

export const SITE_NAME = "Hibrid 360";

// HOME-09: "aynı cümle ana sayfanın meta description'ında ve LinkedIn
// biyografisinde de kullanılır" — bu yüzden schema.org description ve
// <meta name="description"> için de bu cümle tekil kaynak.
export const SITE_TAGLINE = "Türkiye's AI-native Creative Production Studio";
export const SITE_TAGLINE_TR = "Türkiye'nin AI-native kreatif prodüksiyon stüdyosu";

// GEN-04 — marka imzası, her sayfanın footer'ında, değişmez, iki dilde de İngilizce.
export const BRAND_SIGNATURE_LINES = [
  "The future of creativity isn't artificial.",
  "It's hybrid.",
] as const;
export const BRAND_SIGNATURE = BRAND_SIGNATURE_LINES.join(" ");

// GEN-05 / CON-03 — footer ve Contact adres kutucuğu.
//
// 29 Ağustos 2026 revizyonu: içerik `src/data/contact.ts`'e taşındı (tek
// veri kaynağı; adres doğrulama notu, harita sağlayıcısı kararı ve yol
// tarifi/WhatsApp bağlantı üreticileri de orada). Burada yalnızca geriye
// dönük uyumluluk için yeniden dışa veriliyor — Footer.tsx ve CtaBand.tsx
// Codex'in sahipliğinde ve `@/lib/site` yolundan import ediyor.
export { CONTACT } from "@/data/contact";

// TODO: DECISIONS.md #1, #4 — şirket ünvanı (A.Ş./Ltd. Şti.) netleşmeden
// telif satırı ve schema.org "legalName" alanı eksik kalacak.

// Sosyal medya — brief-rev12.md Bölüm 17.2: hesaplar "var/açılacak" durumda.
//
// 29 Ağustos 2026 denetimi: eski hibrid360.com'un footer'ında **üç** gerçek
// hesap bağlantısı bulundu ve üçü de yayında (2026-08-29 itibarıyla 200
// dönüyor):
//   https://www.instagram.com/hibrid360
//   https://www.linkedin.com/company/hibrid-production
//   https://vimeo.com/hibrid360
// YouTube ve Spotify hesaplarının URL'si hiçbir kaynakta yok.
//
// Eski siteden doğrulanan bu üç hesap footer ve schema.org "sameAs" için
// tek veri kaynağıdır. YouTube/Spotify, resmî URL'leri teslim edilmeden
// eklenmez: ölü veya devredilmiş bir hesabı ilan etmek marka adına yanlış
// beyandır.
export const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://www.instagram.com/hibrid360" },
  { name: "Vimeo", href: "https://vimeo.com/hibrid360" },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/hibrid-production",
  },
] as const;

// Geçici marka favicon'u src/app/icon.svg — gerçek marka varlığı (brief 16)
// teslim edilince değiştirilecek. create-next-app'in 26KB'lık varsayılan
// favicon'u kaldırılmıştı (CLAUDE.md: placeholder varlık production'a
// gitmez); bu SVG uydurma değil, marka renkleriyle kurulmuş minimal bir
// yer tutucu. TODO: brief 16 — og:image görseli hâlâ eksik.
