/**
 * Service Chapter filmleri (DECISIONS #35, docs/design/SERVICE_CHAPTER_SYSTEM.md §7).
 *
 * Filmler Higgsfield üzerinden Seedance 2.5 ile üretilir; sessizdir ve
 * konuşma içermez (altyazı istisnası DECISIONS #35'te kayıtlı). Her film
 * `video.aiGenerated` etiketiyle yayınlanır.
 *
 * Kurallar (CLAUDE.md): AV1/WebM + MP4 · poster kare + `preload="none"` ·
 * görünür alana girince oynatma · otomatik ses YASAK. `poster.width` ve
 * `poster.height` zorunlu — CLS'i sıfırda tutar.
 *
 * Yaşam döngüsü: `null` (üretilmedi, bölüm render edilmez) → `kind:
 * "poster"` (key frame onaylandı, oynatma yok) → `kind: "video"`.
 */

export interface ServiceFilmSource {
  src: string;
  /** Tarayıcı codec seçimi için tam MIME, ör. `video/webm; codecs="av01.0.08M.10"`. */
  type: string;
  /** Yalnız belirli ekranlarda seçilecek kaynak, ör. mobil 720p. */
  media?: string;
}

export interface ServiceFilmPoster {
  src: string;
  width: number;
  height: number;
}

interface ServiceFilmBase {
  poster: ServiceFilmPoster;
  alt: Record<"tr" | "en", string>;
  /**
   * Kadrajın odağı, 0 (üst) → 1 (alt). Film penceresi (S2) küçükken bu
   * yüksekliğe yerleşir — kafası disko topu olan figürde odak üstte, merkez
   * kırpma kafayı kesiyordu. Verilmezse 0.5.
   */
  focusY?: number;
}

export interface PosterServiceFilm extends ServiceFilmBase {
  kind: "poster";
}

export interface VideoServiceFilm extends ServiceFilmBase {
  kind: "video";
  sources: readonly [ServiceFilmSource, ...ServiceFilmSource[]];
  /** schema.org VideoObject için (ISO tarih). */
  uploadDate: string;
}

export type ServiceFilm = PosterServiceFilm | VideoServiceFilm;

export const CREATIVE_FILMS: {
  /** Kaldırıldı (13 Eylül 2026, kullanıcı geri bildirimi) — bkz. DECISIONS #36.
   *  Sayfa başına tek video kuralı: Creative artık yalnız Sequin Tide'ı
   *  kullanıyor. Üretilmiş dosyalar diskte kalır (public/videos/services/
   *  creative/mirror-ball-mind-*), ileride başka bir sayfada (ör. AI
   *  Creative Production) yeniden değerlendirilebilir. */
  mirrorBall: ServiceFilm | null;
  /** S2 — sayfanın tek filmi: pul yüzeyde dalga, S2'nin (film penceresi/zirve) 16:9 maskesine `object-fit: cover` ile giriyor. */
  sequinTide: ServiceFilm | null;
} = {
  mirrorBall: null,
  // Key frame onaylandı (13 Eylül 2026, varyant C). Seedance 2.5 720p TASLAK.
  sequinTide: {
    kind: "video",
    sources: [
      { src: "/videos/services/creative/sequin-tide-720.webm", type: 'video/webm; codecs="av01.0.05M.10"' },
      { src: "/videos/services/creative/sequin-tide-720.mp4", type: "video/mp4" },
    ],
    uploadDate: "2026-09-13",
    poster: { src: "/videos/services/creative/sequin-tide-poster.webp", width: 1920, height: 815 },
    alt: {
      tr: "Siyah pulların makro görüntüsü; çapraz bir bantta fuşya ve sarı parıltılar",
      en: "Macro view of black sequins with a diagonal band of magenta and yellow glints",
    },
  },
};
