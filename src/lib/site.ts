// Site geneli sabitler — brief-rev12.md'den birebir alınan gerçek veriler.
// Kaynak: Bölüm 13 (Contact — adres kutucuğu), Bölüm 2.2 (marka imzası),
// Bölüm 5 (rakam filmi altı tanım cümlesi — meta description'da da aynısı
// kullanılır).

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hibrid360.com";

export const SITE_NAME = "Hibrid 360";

// brief-rev12.md Bölüm 5: "aynı cümle meta description ve LinkedIn bio'da
// kullanılır" — bu yüzden schema.org description ve <meta name="description">
// için de bu cümle tekil kaynak olarak kullanılıyor.
export const SITE_TAGLINE = "Türkiye's AI-native Creative Production Studio";

// brief-rev12.md Bölüm 2.2 — marka imzası, her sayfanın footer'ında, değişmez.
export const BRAND_SIGNATURE = "The future of creativity isn't artificial. It's hybrid.";

// brief-rev12.md Bölüm 13 — Contact "Adres kutucuğu" SİYEGE GİRECEK METİN.
export const CONTACT = {
  addressLines: [
    "Feneryolu Mahallesi, Ebru Sk.",
    "Manolya Apt. No: 3A / 3B",
    "Kadıköy — İstanbul, Türkiye",
  ],
  streetAddress: "Feneryolu Mahallesi, Ebru Sk. Manolya Apt. No: 3A / 3B",
  addressLocality: "Kadıköy, İstanbul",
  addressCountry: "TR",
  phone: "+90 216 606 88 98",
  // DECISIONS.md #5: e-posta adresi resmi olarak AÇIK, ancak brief'in
  // "SİTEYE GİRECEK METİN" kutusunda zaten bu adresle geçiyor.
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
