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
 * ## Veri sözleşmesi neden ayrık birleşim (discriminated union)?
 *
 * Önceki sürümde `sources: []` + `captions?:` idi; yani "video var, altyazı
 * yok" hâli **tip olarak geçerliydi** ve derleyici uyarmadan altyazısız bir
 * video yayına girebilirdi. CLAUDE.md bunu yasaklıyor: "altyazı her
 * video/replikte zorunlu (VTT, TR+EN)". Artık kural tipin içinde:
 *
 *   - `kind: "poster"` → yalnızca poster; `<img>` render edilir, oynatma yok.
 *   - `kind: "video"`  → en az bir kaynak **ve** TR+EN VTT zorunlu.
 *
 * Altyazısı eksik bir film nesnesi yazılırsa `npm run typecheck` kırılır;
 * bu, gözden kaçabilecek bir erişilebilirlik ihlalini derleme zamanına
 * taşır.
 *
 * ## Varlık gelince
 *
 * Tek değişiklik bu sabiti doldurmak — sayfa ve bileşen kodu değişmez:
 *
 *   export const CULTURE_FILM: CultureFilm | null = {
 *     kind: "video",
 *     sources: [
 *       { src: "/videos/meet-the-crew.webm", type: "video/webm; codecs=av01" },
 *       { src: "/videos/meet-the-crew.mp4", type: "video/mp4" },
 *     ],
 *     poster: { src: "/images/site/culture/meet-the-crew-poster.webp",
 *               width: 1920, height: 1080 },
 *     alt: { tr: "…", en: "…" },
 *     captions: {
 *       tr: { src: "/videos/meet-the-crew.tr.vtt", label: "Türkçe" },
 *       en: { src: "/videos/meet-the-crew.en.vtt", label: "English" },
 *     },
 *   };
 *
 * Poster hazır olup film gecikirse ara adım (aynı reveal, oynatma yok):
 *
 *   export const CULTURE_FILM: CultureFilm | null = {
 *     kind: "poster",
 *     poster: { … },
 *     alt: { tr: "…", en: "…" },
 *   };
 *
 * Kurallar (CLAUDE.md): AV1/WebM + MP4 · poster kare + `preload="none"` ·
 * otomatik ses YASAK (sessiz başlar, sesi kullanıcı açar) · `poster.width`
 * ve `poster.height` zorunlu — CLS'i sıfırda tutar.
 */
export interface CultureFilmSource {
  src: string;
  type: string;
}

export interface CultureFilmCaption {
  /** VTT dosyası. */
  src: string;
  /** Altyazı menüsünde görünen ad ("Türkçe" / "English"). */
  label: string;
}

export interface CultureFilmPoster {
  src: string;
  width: number;
  height: number;
}

/** Poster teslim edildi, film değil — reveal aynı, oynatma yok. */
export interface PosterOnlyCultureFilm {
  kind: "poster";
  poster: CultureFilmPoster;
  alt: Record<"tr" | "en", string>;
}

/**
 * Oynatılabilir film. `sources` boş olamaz (en az bir öğeli demet) ve
 * `captions` iki dilde de zorunludur — altyazısız video yayına giremez.
 */
export interface VideoCultureFilm {
  kind: "video";
  sources: readonly [CultureFilmSource, ...CultureFilmSource[]];
  poster: CultureFilmPoster;
  alt: Record<"tr" | "en", string>;
  captions: Record<"tr" | "en", CultureFilmCaption>;
}

export type CultureFilm = PosterOnlyCultureFilm | VideoCultureFilm;

export const CULTURE_FILM: CultureFilm | null = null;
