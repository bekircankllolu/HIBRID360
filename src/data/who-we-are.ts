/**
 * Who We Are — kurucu kaydı (CUL-03/04).
 *
 * Fotoğraf henüz teslim edilmedi. Daha önce sayfada 160x200'lük boş bir
 * kutu ve içinde "Photo pending" yazısı vardı; bu bir geliştirme notunun
 * production arayüzüne sızmasıydı. Artık kurucu bölümü fotoğraf olmadan
 * **tipografik** çalışıyor: boş çerçeve de, bekleme metni de yok.
 *
 * Fotoğraf geldiğinde tek değişiklik aşağıdaki `portrait` alanını
 * doldurmaktır — sayfa kodu değişmez, düzen kendiliğinden portreli
 * varyanta geçer:
 *
 *   portrait: {
 *     src: "/images/site/culture/founder.webp",
 *     alt: "Zühre Didem Gödek portresi",
 *     width: 640,
 *     height: 800,
 *   }
 *
 * Ölçüler CLS'i sıfırda tutmak için zorunlu (CLAUDE.md performans
 * bütçesi); dosya WebP/AVIF olmalı.
 */
export interface FounderPortrait {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Founder {
  name: string;
  /** Marka dili — iki dilde de aynı, çevrilmez. */
  title: string;
  /** Varlık teslim edilene kadar tanımsız. */
  portrait?: FounderPortrait;
}

export const FOUNDER: Founder = {
  name: "ZÜHRE DİDEM GÖDEK",
  title: "PRESIDENT & CCO",
};

/**
 * Ekip filmi (CUL-06) — kaydırmayla büyüyen dairesel video bölümü.
 *
 * GERÇEK FİLM TESLİM EDİLMEDİ. `CULTURE_FILM` bu yüzden `null`; sayfa bu
 * durumda mevcut `EmptyState` ("Ekip filmi hazırlanıyor.") ile dürüst
 * biçimde yayında kalır — sahte kişi, sahte video posteri veya sahte
 * replik eklenmedi (CLAUDE.md: placeholder/lorem yasak).
 *
 * Varlık gelince tek değişiklik bu sabiti doldurmak:
 *
 *   export const CULTURE_FILM: CultureFilm | null = {
 *     sources: [
 *       { src: "/videos/meet-the-crew.webm", type: "video/webm; codecs=av01" },
 *       { src: "/videos/meet-the-crew.mp4", type: "video/mp4" },
 *     ],
 *     poster: { src: "/images/site/culture/meet-the-crew-poster.webp",
 *               width: 1920, height: 1920 },
 *     alt: { tr: "…", en: "…" },
 *     captions: [
 *       { src: "/videos/meet-the-crew.tr.vtt", srcLang: "tr", label: "Türkçe" },
 *       { src: "/videos/meet-the-crew.en.vtt", srcLang: "en", label: "English" },
 *     ],
 *   };
 *
 * Kurallar (CLAUDE.md): altyazı zorunlu (VTT, TR+EN) · otomatik ses yasak
 * (sessiz başlar, native controls açık) · preload="none" + poster ·
 * AV1/WebM + MP4. `poster` verilip `sources` boş bırakılırsa bölüm
 * "kontrollü poster modunda" çalışır — daire ve wordmark animasyonu aynı,
 * oynatma yok (BELIEF_FOUNDER_VIDEO ile aynı desen).
 */
export interface CultureFilmSource {
  src: string;
  type: string;
}

export interface CultureFilmCaption {
  src: string;
  srcLang: string;
  label: string;
}

export interface CultureFilm {
  sources: CultureFilmSource[];
  poster: { src: string; width: number; height: number };
  alt: Record<"tr" | "en", string>;
  captions?: CultureFilmCaption[];
}

export const CULTURE_FILM: CultureFilm | null = null;
