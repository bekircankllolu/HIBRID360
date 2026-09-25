export interface HomeShowreelAsset {
  mp4?: string;
  webm?: string;
  /** `<source type>` için tam kodek dizgesi: desteklemeyen tarayıcı MP4'e düşer. */
  webmType?: string;
  poster: string;
  title: Record<"tr" | "en", string>;
  disclosure?: "ai-generated";
  /** Videoda müzik var: ses aç/kapat düğmesi gösterilir (varsayılan sessiz). */
  hasAudio?: boolean;
}

/**
 * Ana sayfa showreel'i — 25 Eylül 2026: müşterinin gerçek showreel'i
 * (`HIBRID360_Showreel_v02_Muzikli`, 61 sn, 1920×1080, 24 fps, müzikli).
 * Önceki 10 sn'lik temsili AI videosunun yerine geçti; "temsili" etiketi kalktı.
 *
 * Kalite korunur: müşterinin teslim ettiği web dosyası (H.264 High 1080p,
 * 5,4 Mbps, AAC 320k) YENİDEN SIKIŞTIRILMADAN olduğu gibi (moov başta, akışa
 * hazır). AV1/WebM denendi ve BİLEREK eklenmedi: 18 Mbps master'dan CRF 20-30
 * AV1, master'a göre SSIM 0,960 verdi (web MP4: 0,977) — film grenini
 * yumuşatıyor. Kaliteyi düşürecek ikinci bir kaynak yerine tek, özgün MP4.
 *
 * Ses: otomatik ses YASAK (CLAUDE.md) — video sessiz başlar, kadrajdaki
 * düğmeyle açılır. İndirme sayfa yüklendikten sonra başlar ve kadraj
 * görünmüyorken video durur (bkz. HeroTypography.tsx `deferredLoad`).
 *
 * Poster: açılış sahnesinin 0,9. saniyesi (video siyahtan açılıyor; ilk kare
 * siyah olduğu için poster olarak kullanılmadı).
 */
export const HOME_SHOWREEL: HomeShowreelAsset | null = {
  mp4: "/videos/home-showreel-20260925.mp4",
  poster: "/images/site/home/showreel-20260925-1600w.webp",
  title: {
    tr: "Hibrid 360 showreel",
    en: "Hibrid 360 showreel",
  },
  hasAudio: true,
};
