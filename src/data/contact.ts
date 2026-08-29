/**
 * İletişim içeriği — tek veri kaynağı (29 Ağustos 2026 müşteri revizyonu).
 *
 * Adres, telefon, e-posta ve harita/yol tarifi bağlantısı daha önce
 * `src/lib/site.ts` içinde ve kısmen Contact sayfasının içine gömülüydü.
 * Artık hepsi burada; `src/lib/site.ts` geriye dönük uyumluluk için
 * `CONTACT`'ı buradan yeniden dışa veriyor (Footer.tsx ve CtaBand.tsx
 * Codex'in sahipliğinde ve o import yolunu kullanıyor).
 *
 * ## Adres — doğrulama notu
 *
 * Eski hibrid360.com/contact sayfası (© 2020) **farklı** bir adres
 * gösteriyor:
 *   CEMİL TOPUZLU CADDESİ ÇİFTEHAVUZLAR
 *   18 MART SOKAK YAPI KREDİ EVLERİ B BLOK 9/20
 *   KADIKÖY / İSTANBUL
 *
 * Aşağıdaki adres, Ağustos 2026 tarihli onaylı copy deck'ten (GEN-05 /
 * CON-03) geliyor ve daha yeni olduğu için esas alındı. İki adres de
 * Kadıköy'de; büyük olasılıkla taşınma olmuş. Yayın öncesi müşteriden
 * tek cümlelik teyit alınmalı — bkz.
 * docs/content/CURRENT_CONTENT_GAPS.md. Eski adres koda **girmedi**;
 * burada yalnızca çelişkiyi kayda geçirmek için yorumda duruyor.
 *
 * Telefon ve e-posta iki kaynakta da aynı — teyitli sayılabilir.
 */

export const CONTACT = {
  addressLines: [
    "Feneryolu Mahallesi, Ebru Sk.",
    "Manolya Apt. No: 3A / 3B",
    "Kadıköy — İstanbul, Türkiye",
  ],
  streetAddress: "Feneryolu Mahallesi, Ebru Sk. Manolya Apt. No: 3A / 3B",
  addressLocality: "Kadıköy, İstanbul",
  addressCountry: "TR",
  // GEN-05 ve CON-03'te iki kez teyit edilen numara; eski sitenin
  // footer'ındaki numarayla da birebir aynı.
  phone: "+90 532 613 50 45",
  email: "contact@hibrid360.com",
} as const;

/**
 * Yol tarifi bağlantısı.
 *
 * ## Harita sağlayıcısı — AÇIK TEKNİK KARAR
 *
 * Gömülü harita için sağlayıcı **seçilmedi**; seçim müşteriye/ekibe ait
 * bir maliyet ve gizlilik kararı:
 *
 * | Seçenek | Maliyet | Not |
 * |---|---|---|
 * | Google Maps Embed API | API anahtarı + faturalandırma hesabı | En tanıdık; KVKK/çerez metnine üçüncü taraf satırı eklemek gerekir |
 * | Mapbox GL | Ücretsiz tier + anahtar | Marka renklerine boyanabilir; ek JS ağırlığı (performans bütçesi) |
 * | OpenStreetMap / Leaflet | Anahtarsız | Tile sunucusu politikası ve görünüm sınırları var |
 * | Harita yok, yalnızca yol tarifi bağlantısı | 0 | **Şu anki durum** — sıfır JS, sıfır üçüncü taraf çerezi |
 *
 * Karar verilene kadar gömülü harita yok. Aşağıdaki bağlantı Google
 * Maps'in resmî "directions" URL şemasını, **doğrulanmış adres
 * metninden** üretiyor — uydurma bir place-id veya kısa link değil,
 * anahtar da gerektirmiyor.
 */
export function directionsUrl(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    CONTACT.addressLines.join(", "),
  )}`;
}

/** WhatsApp derin bağlantısı — teyitli numaradan türetilir. */
export function whatsappUrl(): string {
  return `https://wa.me/${CONTACT.phone.replace(/[^0-9]/g, "")}`;
}

/** `tel:` bağlantısı. */
export function telUrl(): string {
  return `tel:${CONTACT.phone.replace(/\s/g, "")}`;
}

/**
 * Contact sayfasının eski sitedeki iki görseli. Dosyalar henüz depoya
 * **alınmadı**: kaynağı ve lisansı doğrulanmamış varlık `public/` altına
 * konmuyor (bkz. docs/visual-audit/BLOCKERS.md madde 3). Kaynak yollar
 * ve ölçüler docs/content/LEGACY_CONTENT_ROUTE_MAP.md'de kayıtlı.
 *
 * Telif teyidi gelince `src/data/site-images.ts` içine taşınıp
 * `public/images/site/contact/` altından servis edilecekler.
 */
export const CONTACT_LEGACY_IMAGES = {
  /** İstanbul panoraması — eski hero arka planı. */
  panorama: {
    legacySrc: "/assets/img/contact/contact-bg.jpg",
    status: "pending-rights" as const,
  },
  /** "Motion Office" bölüm görseli. */
  motionOffice: {
    legacySrc: "/assets/img/contact/contact-screen01.jpg",
    status: "pending-rights" as const,
  },
};
