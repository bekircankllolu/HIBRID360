"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { CultureFilm } from "@/data/who-we-are";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  captionTracks,
  isCtaRevealed,
  isPlayableFilm,
  passiveCtaLabel,
  revealProgress,
  type FilmLocale,
} from "./meet-the-crew-reveal";
import styles from "./MeetTheCrewReveal.module.css";

/**
 * CUL-06 — "Meet the crew" ekip filmi.
 *
 * monks.com'daki dairesel scroll-reveal mekaniğinin sadeleştirilmiş
 * karşılığı: kaydırma ilerledikçe (1) arka plandaki "Hibrid 360" wordmark'ı
 * outline'dan dolu hale geçer, (2) önündeki dairesel maske merkezdeki küçük
 * bir daireden **tüm sahneyi kaplayana** kadar büyür. Orijinaldeki iki kopya
 * video/logo ve özel SVG ilerleme halkası burada yok — `BeliefFounderVideo`
 * ile aynı `--progress` tekniği yeterli (YAGNI).
 *
 * ## Mekanik
 *
 * Medya baştan sahnenin tamamını kaplar (`inset: 0`); büyüyen tek şey
 * `clip-path` yarıçapı. Yani kaydırma boyunca **reflow yok**, yalnızca GPU
 * dostu bir maske animasyonu var ve final karede video viewport'un
 * köşelerine kadar uzanır. `--progress` (0→1) rAF içinde yazılır; ölçülerin
 * tamamı CSS'te bu tek değişkenden türetilir — JS'in tek işi bir sayı
 * yazmak.
 *
 * ## Erişilebilirlik (CLAUDE.md, istisnasız)
 *
 * - `prefers-reduced-motion`: sticky sahne ve büyüme tamamen devre dışı;
 *   medya baştan tam açık, `clip-path: none`. Sahnenin yüksekliği
 *   çökmesin diye statik varyantta `min-height` var — medya `absolute`
 *   konumlandığı için parent'ın kendi yüksekliği yok.
 * - Otomatik ses YASAK: CTA'ya basıldığında video **sessiz** başlar; sesi
 *   kullanıcı native kontrollerden açar. `autoPlay` bilerek yok.
 * - CTA gerçek bir `<button>`; reveal tamamlanana kadar `visibility:
 *   hidden` olduğu için tab sırasına da girmez (görünmeyen odak yok).
 * - Native `controls` yalnızca oynatma başladıktan sonra basılır: aksi
 *   halde küçük daire evresinde kontrol çubuğu maskenin dışında kalır ve
 *   "kırpılmış ama odaklanılabilir" bir arayüz doğar.
 * - `preload="none"` + poster (CLAUDE.md performans bütçesi).
 */
export function MeetTheCrewReveal({
  film,
  label,
}: {
  film: CultureFilm;
  label: string;
}) {
  const locale = useLocale() as FilmLocale;
  const prefersReduced = usePrefersReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [ctaRevealed, setCtaRevealed] = useState(false);
  const [started, setStarted] = useState(false);
  const videoId = useId();

  // Görünür değilken kaydırma dinlemiyoruz — ekran dışındaki bölüm
  // kaydırma performansına yük olmasın (BeliefFounderVideo ile aynı desen).
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage) return;

    if (prefersReduced) {
      // Hareket azaltmada ilerleme hiç ölçülmez: sahne baştan tam açık,
      // CTA da baştan görünür ve odaklanılabilir.
      stage.style.setProperty("--progress", "1");
      setCtaRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "10% 0px" },
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [prefersReduced]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage || prefersReduced || !inView) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = wrapper.getBoundingClientRect();
      const progress = revealProgress(rect.top, rect.height, window.innerHeight);
      stage.style.setProperty("--progress", progress.toFixed(4));
      // CTA'nın odaklanılabilir olması ayrık bir karar; aynı boole tekrar
      // yazıldığında React render'dan vazgeçtiği için bu, kare başına bir
      // yeniden render'a değil, eşik geçişinde tek render'a karşılık gelir.
      setCtaRevealed(isCtaRevealed(progress));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [inView, prefersReduced]);

  const playable = isPlayableFilm(film);
  const alt = film.alt[locale];

  const startPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Otomatik ses YASAK (CLAUDE.md) — sesi kullanıcı native kontrollerden
    // açar. `muted` burada da yazılıyor: sözleşme JSX'teki attribute'a
    // değil bu satıra bağlı olsun.
    video.muted = true;
    setStarted(true);

    const played = video.play();
    if (played && typeof played.catch === "function") {
      // Tarayıcı oynatmayı reddederse (güç tasarrufu, veri kısıtı) hata
      // yutulmaz ama akış da kırılmaz: `started` sayesinde native
      // kontroller basılmış olur, kullanıcı elle başlatabilir.
      played.catch(() => undefined);
    }
  }, []);

  // Buton oynatma başlayınca saklanıyor; odağı native kontrollere
  // devrediyoruz, yoksa klavye kullanıcısının odağı `body`'ye düşer.
  // `controls` ancak bu render'dan sonra basılı olduğu için odak transferi
  // tıklama handler'ında değil burada yapılmalı — odaklanılamayan bir
  // öğeye `focus()` sessizce hiçbir şey yapmaz.
  useEffect(() => {
    if (!started) return;
    videoRef.current?.focus();
  }, [started]);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${prefersReduced ? styles.wrapperStatic : ""}`}
      // Hangi kipte olduğumuz testlerden ve Playwright'tan görünür olsun —
      // CSS modül sınıf adları derlemede karışıyor, onlara dayanılamaz.
      data-reveal={prefersReduced ? "static" : "scroll"}
      data-film={playable ? "video" : "poster"}
    >
      <div ref={stageRef} className={styles.stage}>
        {/* Marka yazımı kaynakta "Hibrid 360" (tek 'i', boşluklu);
            büyük harf görünümü CSS `text-transform` ile. */}
        <p className={styles.wordmark} data-text="Hibrid 360" aria-hidden="true" lang="en">
          Hibrid 360
        </p>

        <figure className={styles.circleFigure}>
          <div className={styles.circle}>
            {playable ? (
              <video
                ref={videoRef}
                id={videoId}
                className={styles.media}
                poster={film.poster.src}
                width={film.poster.width}
                height={film.poster.height}
                controls={started}
                aria-label={alt}
                muted
                playsInline
                preload="none"
              >
                {film.sources.map((source) => (
                  <source key={source.src} src={source.src} type={source.type} />
                ))}
                {captionTracks(film, locale).map((caption) => (
                  <track
                    key={caption.src}
                    kind="captions"
                    src={caption.src}
                    srcLang={caption.srcLang}
                    label={caption.label}
                    default={caption.isDefault}
                  />
                ))}
              </video>
            ) : (
              // Kontrollü poster modu: film henüz yok ama görsel hazır.
              // next/image kullanılmıyor — bkz. CLAUDE.md medya notu.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={styles.media}
                src={film.poster.src}
                width={film.poster.width}
                height={film.poster.height}
                alt={alt}
                loading="lazy"
                decoding="async"
              />
            )}
          </div>

          {playable ? (
            <button
              type="button"
              className={`${styles.cta} ${ctaRevealed ? styles.ctaRevealed : ""} ${
                started ? styles.ctaStarted : ""
              }`}
              onClick={startPlayback}
              aria-controls={videoId}
            >
              {label}
            </button>
          ) : (
            // Poster modunda tıklanacak bir şey yok: ok işareti düşer,
            // metin pasif bir açıklamaya dönüşür.
            <figcaption
              className={`${styles.cta} ${styles.ctaPassive} ${
                ctaRevealed ? styles.ctaRevealed : ""
              }`}
            >
              {passiveCtaLabel(label)}
            </figcaption>
          )}
        </figure>
      </div>
    </div>
  );
}
