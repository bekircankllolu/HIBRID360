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
    "Feneryolu Mahallesi, Ebru Sokak,",
    "Manolya Apt. No: 3A-3B,",
    "İstanbul | Türkiye",
  ],
  streetAddress: "Feneryolu Mahallesi, Ebru Sokak, Manolya Apt. No: 3A-3B",
  addressLocality: "İstanbul",
  addressCountry: "TR",
  // GEN-05 ve CON-03'te iki kez teyit edilen numara; eski sitenin
  // footer'ındaki numarayla da birebir aynı.
  phone: "+90 216 606 88 98",
  email: "contact@hibrid360.com",
} as const;

/**
 * Yol tarifi bağlantısı — Google Maps'in resmî "directions" URL şeması,
 * **doğrulanmış adres metninden** üretiliyor. Uydurma bir place-id veya
 * kısa link değil, anahtar da gerektirmiyor.
 */
export function directionsUrl(): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    CONTACT.addressLines.join(" "),
  )}`;
}

/**
 * Gömülü harita — SAĞLAYICI KARARI (29 Ağustos 2026'da verildi).
 *
 * | Seçenek | Anahtar | Neden seçilmedi / seçildi |
 * |---|---|---|
 * | Google Maps Embed API | **gerekir** (+ faturalandırma hesabı) | Anahtar ve fatura kurulumu müşteriye bağlı; beklemeye gerek yok |
 * | Mapbox GL | gerekir | Marka renklerine boyanabilirdi ama ek JS ağırlığı performans bütçesini zorlar |
 * | OpenStreetMap / Leaflet | gerekmez | **Enlem/boylam ister** — elimizde doğrulanmış koordinat yok, uydurulmayacak |
 * | **Google Maps sorgu gömmesi** | **gerekmez** | ← SEÇİLDİ |
 *
 * Sorgu gömmesi (`?q=<adres>&output=embed`) anahtar istemez ve
 * koordinat değil **adres metni** alır — yani doğrulanmış tek veriyi
 * kullanır, hiçbir şey uydurmaz. 30 Ağustos müşteri revizyonu uyarınca
 * iframe sayfayla birlikte ve `loading="eager"` olarak yüklenir.
 *
 * KVKK notu: iframe üçüncü taraf (Google) içeriğidir ve çerez yazabilir.
 * Bu aktarım TR/EN Çerez Politikası'nda açıklanır; hukuki nihai onay
 * yayın kapısında ayrıca alınmalıdır.
 */
export function mapEmbedUrl(): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(
    CONTACT.addressLines.join(" "),
  )}&output=embed`;
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
 * Contact sayfasının eski sitedeki İstanbul panoraması.
 *
 * Müşterinin 29 Ağustos 2026 talimatı bu görselin korunması yönünde.
 * Türevler `scripts/assets/prepare-legacy-images.py` ile üretildi
 * (WebP + AVIF, 1600w + 2560w); kaynak yolu, ölçüler ve sha256
 * `docs/content/LEGACY_CONTENT_ROUTE_MAP.md` içinde kayıtlı.
 *
 * Kaynak gri tonlama gece çekimi olduğu için duotone uygulanmadı —
 * siyah zemine olduğu gibi oturuyor.
 *
 * TELİF — AÇIK: fotoğrafın çekeni ve lisansı **doğrulanmadı**; stok
 * görsel olma ihtimali var (bkz. docs/visual-audit/BLOCKERS.md madde 3).
 * Yayın öncesi teyit edilmeli.
 *
 * Eski sitedeki ikinci görsel ("Motion Office" bölüm görseli,
 * `/assets/img/contact/contact-screen01.jpg`) bu revizyonda istenmedi ve
 * alınmadı; kaydı route map'te duruyor.
 */
export const CONTACT_IMAGES = {
  panorama: {
    legacySrc: "/assets/img/contact/contact-bg.jpg",
    avif:
      "/images/site/contact/istanbul-panorama-1600w.avif 1600w, " +
      "/images/site/contact/istanbul-panorama-2560w.avif 2560w",
    webp:
      "/images/site/contact/istanbul-panorama-1600w.webp 1600w, " +
      "/images/site/contact/istanbul-panorama-2560w.webp 2560w",
    fallback: "/images/site/contact/istanbul-panorama-1600w.webp",
    width: 2560,
    height: 750,
  },
} as const;
