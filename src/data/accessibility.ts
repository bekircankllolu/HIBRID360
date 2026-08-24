/**
 * Accessibility Statement içeriği — brief-rev12.md Bölüm 18.10.
 *
 * "Our commitment", "What we have done" ve "Feedback" metinleri SİTEYE
 * GİRECEK METİN kutusundan birebir.
 *
 * "Known limitations" brief'in özel notu gereği BOŞ BIRAKILMADI:
 * "Dürüst bir eksik listesi, mükemmellik iddiasından daha güvenilirdir ve
 * denetimde lehe sayılır." Aşağıdaki maddeler bu kod tabanının bugünkü
 * gerçek durumundan çıkarılmıştır — tahmin veya doldurma değildir.
 */

export const ACCESSIBILITY_COMMITMENT =
  "Our commitment — we aim to meet WCAG 2.1 level AA across hibrid360.com.";

export const ACCESSIBILITY_DONE =
  "What we have done — reduced-motion support, keyboard navigation, visible focus, captions on every video, contrast checks on all four brand colours.";

export const ACCESSIBILITY_FEEDBACK =
  "Feedback — if something on this site blocks you, write to contact@hibrid360.com; we respond within five working days.";

/**
 * Bilinen sınırlamalar — sitenin bugünkü gerçek durumu.
 * TODO: brief 18.10 — yayın öncesi erişilebilirlik denetiminden sonra bu
 * liste güncellenecek; kapanan maddeler çıkarılacak, denetimde bulunan
 * yeni maddeler eklenecek.
 */
export const knownLimitations: Array<{ tr: string; en: string }> = [
  {
    en: "MONA's voice-over and VTT caption files have not been produced yet. Every line is available as full on-screen text, and no audio plays anywhere on the site.",
    tr: "MONA'nın seslendirmesi ve VTT altyazı dosyaları henüz üretilmedi. Her replik ekranda tam metin olarak okunuyor ve sitede hiçbir yerde ses çalmıyor.",
  },
  {
    en: "In the homepage ecosystem scene the service links orbit a decorative crystal. Motion pauses on hover or keyboard focus, and with reduced motion enabled the scene is fully static; the rings, starfield and crystal are decorative and hidden from screen readers.",
    tr: "Ana sayfadaki ekosistem sahnesinde servis bağlantıları dekoratif kristalin etrafında döner. Hareket, imleç veya klavye odağıyla durur; hareket azaltma açıkken sahne tamamen sabittir. Halkalar, yıldız alanı ve kristal dekoratiftir ve ekran okuyuculardan gizlenmiştir.",
  },
  {
    en: "Video assets are not published yet. Each video will ship with TR and EN VTT captions before it goes live; until then this claim cannot be verified on the site.",
    tr: "Video varlıkları henüz yayında değil. Her video yayına girmeden önce TR ve EN VTT altyazılarıyla birlikte gelecek; o zamana kadar bu iddia sitede doğrulanamaz.",
  },
  {
    en: "The body text of the legal pages (Privacy, Cookie, KVKK) is still being drafted with legal counsel, so those pages currently carry headings only.",
    tr: "Yasal sayfaların (Gizlilik, Çerez, KVKK) gövde metinleri hukuk danışmanıyla birlikte hazırlanıyor; bu sayfalar şu an yalnızca başlıkları taşıyor.",
  },
  {
    en: "Largest Contentful Paint on the homepage measures slightly above our 2.5 second mobile target in testing; work on the font loading path is ongoing.",
    tr: "Ana sayfada Largest Contentful Paint testlerde 2,5 saniyelik mobil hedefimizin bir miktar üzerinde ölçülüyor; font yükleme yolu üzerindeki çalışma sürüyor.",
  },
];

/**
 * TODO: brief 18.10 — "Last reviewed" tarihi, yayın öncesi erişilebilirlik
 * denetimi yapıldığında girilecek. Denetim yapılmadan tarih yazmak
 * (brief'in kutusundaki örnek tarih dahil) gerçeğe aykırı olur.
 */
export const ACCESSIBILITY_LAST_REVIEWED: string | null = null;
