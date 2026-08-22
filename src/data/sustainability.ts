/**
 * Sustainability — brief-rev12.md Bölüm 18.11 ve 1.9.
 *
 * UYARI (brief'in kendi uyarısı, birebir): "Bu üç bölüm doldurulmadan
 * karbon nötr rozeti ve metni yayınlanmamalı. Ölçüm ve sertifika olmadan
 * yapılan çevre iddiası, Avrupa'da yanıltıcı yeşil iddia (greenwashing)
 * düzenlemeleri kapsamına girer."
 *
 * Bu yüzden aşağıdaki alanların hiçbiri tahminle doldurulmadı ve
 * `isPublishable` false olduğu sürece:
 *   - footer'daki karbon nötr rozeti render edilmiyor,
 *   - Bölüm 1.9'daki karbon nötr metni hiçbir yerde yayınlanmıyor.
 *
 * TODO: brief 18.11 — üç bölüm de dolduğunda isPublishable true yapılacak.
 * Gereken: (1) ölçüm — sayfa başına gram CO₂, araç adı ve tarih;
 * (2) azaltma — yeşil hosting sağlayıcısı; (3) denkleştirme — program adı
 * ve sertifika numarası.
 */

export interface SustainabilityData {
  /** Sayfa başına gram CO₂. */
  gramsCo2PerView: number | null;
  /** Ölçüm aracının adı (ör. Website Carbon Calculator, Ecograder). */
  measurementTool: string | null;
  /** Ölçüm tarihi (ISO). */
  measuredOn: string | null;
  /** Yeşil enerjiyle çalışan hosting sağlayıcısı. */
  greenHostingProvider: string | null;
  /** Denkleştirme programının adı. */
  offsetProgram: string | null;
  /** Sertifika numarası. */
  offsetCertificateNumber: string | null;
}

export const sustainabilityData: SustainabilityData = {
  gramsCo2PerView: null,
  measurementTool: null,
  measuredOn: null,
  greenHostingProvider: null,
  offsetProgram: null,
  offsetCertificateNumber: null,
};

/**
 * Karbon nötr iddiası ancak ölçüm + azaltma + denkleştirme verisinin
 * tamamı girildiğinde yayınlanabilir.
 */
export function isSustainabilityPublishable(
  data: SustainabilityData = sustainabilityData,
): boolean {
  return Boolean(
    data.gramsCo2PerView !== null &&
      data.measurementTool &&
      data.measuredOn &&
      data.greenHostingProvider &&
      data.offsetProgram &&
      data.offsetCertificateNumber,
  );
}

/**
 * "Reduction" bölümünün teknik tarafı — bunlar iddia değil, sitede
 * gerçekten uygulanmış mühendislik kararları (bkz. CLAUDE.md performans
 * bütçesi). Hosting sağlayıcısı adı yukarıdaki veriden gelir.
 */
export const reductionMeasures: Array<{ tr: string; en: string }> = [
  {
    en: "AVIF/WebP images with responsive srcset and lazy loading.",
    tr: "AVIF/WebP görseller, responsive srcset ve lazy loading ile.",
  },
  {
    en: "Video on demand rather than autoplay: poster frame, preload=\"none\", loaded only when it enters the viewport.",
    tr: "Otomatik oynatma yerine talebe bağlı video: poster kare, preload=\"none\", yalnızca görünür alana girince yükleme.",
  },
  {
    en: "No unused fonts or scripts; one variable font file per family, and the hero wordmark ships as vector paths instead of a font download.",
    tr: "Kullanılmayan font ve script yok; aile başına tek değişken font dosyası, hero yazısı font indirmesi yerine vektör path olarak geliyor.",
  },
  {
    en: "At most one WebGL scene runs at a time, and it stops as soon as it leaves the viewport.",
    tr: "Aynı anda en fazla bir WebGL sahnesi çalışır ve ekrandan çıkar çıkmaz durur.",
  },
];
