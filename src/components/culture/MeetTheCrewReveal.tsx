"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { CultureFilm } from "@/data/who-we-are";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  captionTracks,
  hasMovingImage,
  isCtaRevealed,
  isPlayableFilm,
  isSilentLoop,
  openness,
  passiveCtaLabel,
  revealProgress,
  shouldPlay,
  type FilmLocale,
} from "./meet-the-crew-reveal";
import styles from "./MeetTheCrewReveal.module.css";

/**
 * CUL-06 — kaydırmayla açılıp kapanan dairesel sahne.
 *
 * 18 Eylül 2026 revizyonu (kullanıcı, monks.com referansıyla): *"önce
 * daireyi görüyoruz; sayfayı aşağı indirdikçe daire büyüyor, içindeki kişi
 * konuşmaya başlıyor; inmeye devam edince daire tekrar küçülüp eski
 * formuna dönüyor, yukarı çıkınca yine büyüyor... içi tamamen boş olsun,
 * arkada hibrit yazmasına gerek yok."*
 *
 * Önceki sürümden üç fark:
 * 1. Arka plandaki "Hibrid 360" wordmark'ı KALDIRILDI — sahne boş siyah.
 * 2. Daire artık tam ekrana açılmıyor: bir yere kadar büyüyüp orada duruyor
 *    (`--open` çan eğrisi, bkz. meet-the-crew-reveal.ts `openness`).
 * 3. Büyüme `clip-path` yerine `transform: scale` — medya daireyle BİRLİKTE
 *    ölçekleniyor, yani küçükken de kadrajın tamamı görünüyor (maske
 *    büyüseydi küçük dairede yalnız karenin ortasındaki birkaç piksel
 *    görünürdü; monks'ta da kadraj korunuyor).
 *
 * ## Medya modları (`film.kind`)
 * - `poster`: yalnız görsel, oynatma yok.
 * - `loop`: SESSİZ karakter döngüsü (şu anki durum — MONA'nın performans
 *   çekimi). Daire açıkken oynar, kapanınca durur; ses kanalı yok.
 *   "AI ile üretilmiş temsili görseldir" etiketi zorunlu.
 * - `video`: sesli gerçek film. Sessiz başlar; sesi kullanıcı native
 *   kontrolden açar (CLAUDE.md: otomatik ses YASAK) ve TR+EN altyazı
 *   zorunlu (tip sözleşmesi).
 *
 * ## Erişilebilirlik
 * - `prefers-reduced-motion`: sticky sahne ve büyüme yok; daire baştan tam
 *   açık, video kendiliğinden oynamaz.
 * - WCAG 2.2.2: kendiliğinden oynayan döngü durdurulabilir — sahnede her
 *   zaman bir duraklat/oynat düğmesi var.
 * - Dekoratif değil: `alt`/`aria-label` medyayı betimliyor.
 */
export function MeetTheCrewReveal({
  film,
  label,
}: {
  film: CultureFilm;
  label: string;
}) {
  const locale = useLocale() as FilmLocale;
  const video = useTranslations("video");
  const prefersReduced = usePrefersReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [ctaRevealed, setCtaRevealed] = useState(false);
  const [started, setStarted] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const videoId = useId();

  const playable = isPlayableFilm(film);
  const loop = isSilentLoop(film);
  const moving = hasMovingImage(film);
  const alt = film.alt[locale];

  // Görünür değilken kaydırma dinlenmiyor — ekran dışındaki bölüm kaydırma
  // performansına yük olmasın (BeliefFounderVideo ile aynı desen).
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage) return;

    if (prefersReduced) {
      stage.style.setProperty("--open", "1");
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
      const open = openness(progress);
      stage.style.setProperty("--open", open.toFixed(4));
      // İki ayrık karar; aynı boole tekrar yazıldığında React render'dan
      // vazgeçtiği için bu kare başına değil, eşik geçişinde tek render.
      setCtaRevealed(isCtaRevealed(open));

      const element = videoRef.current;
      if (element && moving) {
        const wants = shouldPlay(open) && !userPaused;
        if (wants && element.paused) {
          const played = element.play();
          if (played && typeof played.catch === "function") played.catch(() => undefined);
        } else if (!wants && !element.paused) {
          element.pause();
        }
      }
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
  }, [inView, prefersReduced, moving, userPaused]);

  const startPlayback = useCallback(() => {
    const element = videoRef.current;
    if (!element) return;
    // Otomatik ses YASAK (CLAUDE.md) — sesi kullanıcı native kontrolden
    // açar. `muted` burada da yazılıyor: sözleşme JSX'teki attribute'a
    // değil bu satıra bağlı olsun.
    element.muted = true;
    setStarted(true);
    const played = element.play();
    if (played && typeof played.catch === "function") played.catch(() => undefined);
  }, []);

  // Buton oynatma başlayınca saklanıyor; odağı native kontrollere
  // devrediyoruz, yoksa klavye kullanıcısının odağı `body`'ye düşer.
  useEffect(() => {
    if (!started) return;
    videoRef.current?.focus();
  }, [started]);

  const togglePlayback = useCallback(() => {
    const element = videoRef.current;
    setUserPaused((paused) => {
      const next = !paused;
      if (element) {
        if (next) element.pause();
        else {
          const played = element.play();
          if (played && typeof played.catch === "function") played.catch(() => undefined);
        }
      }
      return next;
    });
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${prefersReduced ? styles.wrapperStatic : ""}`}
      // Hangi kipte olduğumuz testlerden ve Playwright'tan görünür olsun —
      // CSS modül sınıf adları derlemede karışıyor, onlara dayanılamaz.
      data-reveal={prefersReduced ? "static" : "scroll"}
      data-film={film.kind}
    >
      <div ref={stageRef} className={styles.stage}>
        <figure className={styles.circleFigure}>
          <div className={styles.circle}>
            {moving ? (
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
                loop={loop}
                playsInline
                preload="none"
              >
                {(film.kind === "loop" || film.kind === "video") &&
                  film.sources.map((source) => (
                    <source key={source.src} src={source.src} type={source.type} />
                  ))}
                {playable &&
                  captionTracks(film, locale).map((caption) => (
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
            // Poster ve sessiz döngü modunda tıklanacak bir şey yok: ok
            // işareti düşer, metin pasif bir açıklamaya dönüşür.
            <figcaption
              className={`${styles.cta} ${styles.ctaPassive} ${
                ctaRevealed ? styles.ctaRevealed : ""
              }`}
            >
              {passiveCtaLabel(label)}
              {/* Temsili görsel etiketi izleyicinin görmesi gereken bir
                  bilgi — sessiz döngü gerçek bir ekip kaydı değil. */}
              {loop ? <span className={styles.note}>{video("aiGenerated")}</span> : null}
            </figcaption>
          )}

          {/* WCAG 2.2.2 — kendiliğinden oynayan hareket durdurulabilmeli. */}
          {moving ? (
            <button
              type="button"
              className={`${styles.toggle} ${ctaRevealed ? styles.toggleRevealed : ""}`}
              onClick={togglePlayback}
              aria-controls={videoId}
              aria-pressed={userPaused}
            >
              {userPaused ? video("play") : video("pause")}
            </button>
          ) : null}
        </figure>
      </div>
    </div>
  );
}
