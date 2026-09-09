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
    "Feneryolu Mahallesi, Ebru Sokak, Manolya Apt. No: 3A-3B",
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
 * Gömülü harita — SAĞLAYICI KARARI (29 Ağustos 2026'da verildi, 9 Eylül
 * 2026'da güncellendi).
 *
 * | Seçenek | Anahtar | Neden seçilmedi / seçildi |
 * |---|---|---|
 * | Google Maps Embed API | **gerekir** (+ faturalandırma hesabı) | Anahtar ve fatura kurulumu müşteriye bağlı; beklemeye gerek yok |
 * | Mapbox GL (proprietary) | gerekir | Anahtar + faturalandırma gerektiriyor |
 * | OpenStreetMap / Leaflet | gerekmez | Enlem/boylam ister — 29 Ağustos'ta elimizde doğrulanmış koordinat yoktu |
 * | Google Maps sorgu gömmesi | gerekmez | 9 Eylül'e kadar SEÇİLİYDİ — bkz. aşağıdaki not |
 * | **MapLibre GL + CARTO açık vektör karo** | **gerekmez** | ← 9 Eylül'de SEÇİLDİ |
 *
 * **9 Eylül 2026 değişikliği:** Müşteri, siteye özel (siyah zemin +
 * sarı yol) bir harita stili istedi — referans:
 * 21st.dev/@mapcn/components/mapcn-marker-tooltip (MapLibre GL +
 * CARTO'nun ücretsiz "dark-matter" vektör stili). Google'ın anahtarsız
 * sorgu gömmesi (iframe, üçüncü taraf içerik) CSS filtreyle koyu temaya
 * çekilebiliyordu ama gerçek yol rengi CSS'ten kontrol edilemiyordu —
 * bkz. `ContactMap.tsx` git geçmişi (commit b9f008b, artık geçersiz).
 * Gerçek renk kontrolü ancak vektör-karo tabanlı bir render motoruyla
 * mümkün; bu da MapLibre GL JS + bir stil JSON'u gerektiriyor.
 *
 * CARTO'nun `dark-matter-gl-style` stili seçildi çünkü:
 * - Anahtar gerektirmiyor (CARTO'nun herkese açık, atıflı temel
 *   haritası — `tiles.basemaps.cartocdn.com`).
 * - MapLibre GL, Mapbox GL'in anahtar/lisans gerektirmeyen açık kaynak
 *   çatalı — proprietary Mapbox'a hiç bağımlılık yok.
 * - Stil JSON'unun `road_*_fill` katmanları çalışma zamanında marka
 *   sarısına (`#fffc00`) boyanıyor — bkz. `MapLibreContactMap.tsx`.
 *
 * Bunun **29 Ağustos'taki "ek JS ağırlığı performans bütçesini
 * zorlar" itirazını geçersiz kılmadığı** açıkça not düşülüyor: MapLibre
 * GL JS gerçek bir bağımlılık (~200KB+ gzip) ve bu artık ödenen bir
 * bedel. Ölçüm için bkz. DECISIONS.md madde 30.
 *
 * **Koordinat — nasıl bulundu, uydurulmadı:** 29 Ağustos'taki
 * "doğrulanmış koordinat yok" engeli, doğrulanmış ADRES METNİNİN
 * (`CONTACT.streetAddress`) kendisinden türetilerek aşıldı, keyfi bir
 * nokta seçilmedi:
 * 1. Photon (komoot'un OSM tabanlı, anahtarsız geocoder'ı) adresteki
 *    "Ebru Sokak" ifadesini OSM'de gerçek bir sokak (way) olarak
 *    buldu: "Ebru Sokağı", Feneryolu, Kadıköy — adresle birebir
 *    eşleşen tek sonuç.
 * 2. Koordinat, o sokağın OSM geometrisinin bounding-box merkezi
 *    (Photon'un kendi hesapladığı temsil noktası).
 * 3. Nominatim (bağımsız bir ikinci OSM tabanlı servis) ile TERS
 *    geocode edilerek doğrulandı: aynı koordinat "Ebru Sokağı,
 *    Feneryolu Mahallesi, Kadıköy, İstanbul, 34724" olarak geri
 *    döndü — posta kodu dahil adresle tam örtüşüyor.
 *
 * Bina numarası (Manolya Apt. 3A-3B) OSM'de ayrıca etiketli değil,
 * yani nokta sokağın ortasında duruyor, tam kapı numarasında değil —
 * ama bu, "doğrulanmamış/uydurma koordinat" değil, doğrulanmış
 * adresin kendi sokağından türetilmiş en yüksek hassasiyet. Yayın
 * öncesi müşteriden nokta üzerinde gözle onay istenmeli.
 *
 * KVKK notu: harita artık Google değil, CARTO/OpenStreetMap karo
 * sunucularından yükleniyor. Çerez Politikası'ndaki "Google Haritalar
 * İçeriği" bölümü bu değişikliği yansıtacak şekilde güncellenmeli.
 */
export const CONTACT_LOCATION = {
  lat: 40.9837576,
  lng: 29.0572837,
} as const;

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
