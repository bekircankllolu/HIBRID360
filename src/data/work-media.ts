/**
 * Works sayfasının iki büyük medya varlığı — tek veri kaynağı.
 *
 * 20 Eylül 2026 kullanıcı isteği: *"'The Art of Teamwork' yerin arkasındaki
 * nöron görseline... bunu değiştirelim, buraya bir video hazırlayıp
 * koyabilirsin, takım çalışmasını anlatan özgün bir video... Yine alttaki
 * partiküllerden oluşan hibrit yazısını da kaldırabiliriz, buraya güzel bir
 * görsel koyalım. Takım çalışmasını anlatan siyah beyaz, doğal ve samimi bir
 * lifestyle görsel."*
 *
 * Kullanıcı hero için üç yön arasından GERÇEK SET yönünü seçti.
 *
 * ## İkisi de AI ile üretildi ve sayfada AÇIKÇA öyle etiketleniyor
 * Bunlar gerçek Hibrid 360 ekibini ya da gerçek bir çekimi göstermiyor.
 * Gerçek çekim/fotoğraf teslim edildiğinde yalnızca buradaki yollar
 * değişir; kadraj ve davranış aynı kalır, `disclosure` o zaman kaldırılır.
 *
 * ## Hero videosu ana sayfadaki showreel'den bilinçli olarak FARKLI
 * Showreel ekibin ARKASINDAN, geniş; kamera sete doğru ilerliyor. Bu ise
 * ekibin İÇİNDEN, yakın: odakçının eli lensin üstünde, operatör kamerada,
 * ışıkçı arkada. İki video aynı şeyi anlatmasın diye.
 */

export interface WorkMediaVideo {
  mp4: string;
  webm?: string;
  poster: string;
  title: Record<"tr" | "en", string>;
  disclosure?: "ai-generated";
}

export interface WorkMediaImage {
  src: string;
  width: number;
  height: number;
  alt: Record<"tr" | "en", string>;
  disclosure?: "ai-generated";
}

export const WORK_HERO_FILM: WorkMediaVideo = {
  mp4: "/videos/work-hero-crew.mp4",
  webm: "/videos/work-hero-crew.webm",
  poster: "/images/site/work/hero-crew-poster.webp",
  title: {
    tr: "Sinema kamerasının başında çalışan ekibi içeriden gösteren temsili AI videosu",
    en: "Representative AI video seen from inside a crew working at a cinema camera",
  },
  disclosure: "ai-generated",
};

export const WORK_TEAM_BAND: WorkMediaImage = {
  src: "/images/site/work/team-band.webp",
  width: 2400,
  height: 1050,
  alt: {
    tr: "Bir tasarım stüdyosunda birlikte çalışan ekip; siyah beyaz, doğal ışık",
    en: "A team working together in a design studio, black and white, natural light",
  },
  disclosure: "ai-generated",
};
