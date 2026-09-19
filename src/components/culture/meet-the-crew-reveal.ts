import type {
  CultureFilm,
  CultureFilmCaption,
  SilentLoopCultureFilm,
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

/** Sessiz döngü: oynar ama konuşmaz — altyazı istemez, CTA'sı yoktur. */
export function isSilentLoop(film: CultureFilm): film is SilentLoopCultureFilm {
  return film.kind === "loop";
}

/** Ekranda bir video öğesi var mı (sessiz döngü ya da sesli film). */
export function hasMovingImage(film: CultureFilm): boolean {
  return film.kind !== "poster";
}

/*
 * Dairenin açıklığı — monks.com kalıbı (18 Eylül 2026 kullanıcı isteği:
 * "önce daireyi görüyoruz, sayfayı indirdikçe daire büyüyor, içindeki insan
 * konuşmaya başlıyor, inmeye devam edince daire tekrar küçülüp eski formuna
 * dönüyor; tekrar çıktığımızda tekrar büyüyor").
 *
 * Yani açıklık ilerlemenin MONOTON bir fonksiyonu değil, bir çan eğrisi:
 * [OPEN_IN → OPEN_FULL] büyür, [OPEN_FULL → CLOSE_START] tam açık bekler,
 * [CLOSE_START → CLOSE_END] küçülür. Kaydırma geri alındığında aynı eğri
 * ters yönde okunur — ekstra durum tutmaya gerek yok.
 */
export const OPEN_IN = 0.06;
export const OPEN_FULL = 0.34;
export const CLOSE_START = 0.66;
export const CLOSE_END = 0.94;

export function openness(progress: number): number {
  if (!Number.isFinite(progress)) return 1;
  const rise = (progress - OPEN_IN) / (OPEN_FULL - OPEN_IN);
  const fall = (CLOSE_END - progress) / (CLOSE_END - CLOSE_START);
  return Math.min(Math.max(Math.min(rise, fall), 0), 1);
}

/**
 * Video ancak daire gerçekten açılmışken oynar: kapalıyken (küçük nokta)
 * kare başına iş yapmanın anlamı yok ve WCAG 2.2.2 açısından da ekranda
 * sürekli oynayan bir hareket bırakmıyoruz.
 */
export const PLAYBACK_THRESHOLD = 0.18;

export function shouldPlay(open: number): boolean {
  return open >= PLAYBACK_THRESHOLD;
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
 * CTA/etiketin belirdiği eşik — artık ham ilerlemeye değil AÇIKLIĞA bakar
 * (daire tam ekran olmuyor, bir yere kadar büyüyüp duruyor). Eşikten önce
 * görünmez ve **odaklanılamaz** olmalı: görünmeyen bir butona tab ile
 * gitmek WCAG "odak görünür" kuralını ihlal eder.
 */
export const CTA_REVEAL_THRESHOLD = 0.9;

export function isCtaRevealed(open: number): boolean {
  return open >= CTA_REVEAL_THRESHOLD;
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
