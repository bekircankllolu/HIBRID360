import type {
  CultureFilm,
  CultureFilmCaption,
  VideoCultureFilm,
} from "@/data/who-we-are";

/**
 * CUL-06 "Meet the crew" reveal'ının tarayıcı gerektirmeyen mantığı.
 *
 * Bileşen (`MeetTheCrewReveal.tsx`) yalnızca DOM'u kurar; ilerleme
 * hesabı, altyazı listesi ve CTA metni burada — böylece bunlar
 * `jsdom`'a bile ihtiyaç duymadan test edilebilir
 * (bkz. `mona-video-look.ts` ile aynı ayrım).
 */

export type FilmLocale = "tr" | "en";

/** `<track>` sırası sabit: önce TR, sonra EN. `default` aktif dile göre. */
const CAPTION_ORDER: readonly FilmLocale[] = ["tr", "en"];

export interface CaptionTrack extends CultureFilmCaption {
  srcLang: FilmLocale;
  /** Tarayıcının kendiliğinden göstereceği altyazı. */
  isDefault: boolean;
}

/** Ayrık birleşim daraltıcısı — `film.sources.length` tahminine gerek yok. */
export function isPlayableFilm(film: CultureFilm): film is VideoCultureFilm {
  return film.kind === "video";
}

/**
 * TR + EN altyazı izleri. İkisi de tipte zorunlu olduğu için burada
 * "eksikse atla" dalı yok; tek karar hangisinin `default` olacağı.
 */
export function captionTracks(
  film: VideoCultureFilm,
  locale: FilmLocale,
): CaptionTrack[] {
  return CAPTION_ORDER.map((srcLang) => ({
    ...film.captions[srcLang],
    srcLang,
    isDefault: srcLang === locale,
  }));
}

/**
 * Sarmalayıcının kaydırma ilerlemesi, 0→1.
 *
 * `rectTop` sarmalayıcının viewport'a göre üst kenarı (negatife gider),
 * `rectHeight` yüksekliği, `viewportHeight` ekran yüksekliği. Kaydırma
 * payı = yükseklik eksi sticky sahnenin kapladığı bir ekran; pay yoksa
 * (hareket azaltma modunda sarmalayıcı `height: auto`) sonuç 1'dir, yani
 * sahne baştan tamamen açık görünür.
 *
 * Sonuç her koşulda `[0, 1]` aralığında ve `NaN`'dan arınmış olmalı —
 * doğrudan bir CSS custom property'sine yazılıyor; geçersiz bir değer
 * `clip-path`'i tamamen düşürür ve sahne siyah kalır.
 */
export function revealProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number,
): number {
  const travel = rectHeight - viewportHeight;
  if (!Number.isFinite(travel) || travel <= 0) return 1;

  const raw = -rectTop / travel;
  if (!Number.isFinite(raw)) return 1;

  return Math.min(Math.max(raw, 0), 1);
}

/**
 * Reveal'ın kapanması tamamlandığı ve CTA'nın belirdiği eşik. Daire
 * `75vmax` yarıçapla viewport'u ~0.63–0.74 arasında kapatıyor; CTA bu
 * eşikten önce görünmez ve **odaklanılamaz** olmalı — görünmeyen bir
 * butona tab ile gitmek WCAG "odak görünür" kuralını ihlal eder.
 */
export const CTA_REVEAL_THRESHOLD = 0.62;

export function isCtaRevealed(progress: number): boolean {
  return progress >= CTA_REVEAL_THRESHOLD;
}

/**
 * Poster modunda CTA tıklanabilir değil; okla biten onaylı metin
 * ("Ekiple tanışın →" / "Meet the crew →") pasif açıklamaya dönüşürken ok
 * işareti düşer — ok bir eylem sözü verir, poster modunda o eylem yok.
 * Metnin kendisi çevirilerden gelir, burada yeni metin üretilmez.
 *
 * `\s` JavaScript'te bölünmez boşluğu (U+00A0) da kapsar, yani çeviri
 * dosyasında okun önünde o kullanılsa da temizlenir.
 */
export function passiveCtaLabel(label: string): string {
  return label.replace(/\s*[→›»>]+$/u, "").trim();
}
