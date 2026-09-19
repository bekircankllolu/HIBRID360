"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Pause, Play } from "lucide-react";
import type { ServiceFilm } from "@/data/service-films";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { orderedSources, playbackState, type PlaybackIntent } from "./chapter-video";
import styles from "./ChapterVideo.module.css";

/**
 * Service Chapter filmi — sessiz, döngülü, dekoratif bir Seedance filmi.
 *
 * - `preload="none"` + tembel poster: film ancak görünür alana girince,
 *   poster yarım ekran önce çekilir (CLAUDE.md performans bütçesi).
 *   `autoPlay` bilerek yok; oynatma
 *   görünürlük + hareket tercihi + kullanıcı niyetinden türetilir
 *   (`playbackState`).
 * - Görünür bir duraklat/oynat butonu her zaman var (WCAG 2.2.2: 5 sn'den
 *   uzun otomatik hareket durdurulabilmeli). Buton sahnenin SAĞ ÜSTÜNDE:
 *   ilk ziyarette çerez bandı altı kaplıyor.
 * - Ses yok: kaynak dosyalar sessiz encode edilir, `muted` yine de yazılır.
 * - Poster modunda (`kind: "poster"`) yalnızca görsel; kontrol yok.
 *
 * Altyazı ve AI etiketi bu bileşenin değil, onu saran bölümün işi —
 * etiket filmin ÜSTÜNE değil ALTINA konur.
 */
function startMuted(video: HTMLVideoElement) {
  video.muted = true;
  const played = video.play();
  // Güç tasarrufu / veri kısıtı oynatmayı reddedebilir: hata yutulur,
  // poster yerinde kalır; buton her tıklamada yeniden dener.
  if (played && typeof played.catch === "function") played.catch(() => undefined);
}

export function ChapterVideo({
  film,
  className,
  eagerPoster = false,
}: {
  film: ServiceFilm;
  className?: string;
  /**
   * Poster SSR'da basılsın (ekranın hemen altındaki film için). Varsayılan
   * tembel: sayfanın dibindeki bir poster açılışta indirilmesin.
   */
  eagerPoster?: boolean;
}) {
  const t = useTranslations("video");
  const locale = useLocale() as "tr" | "en";
  const reduced = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [near, setNear] = useState(eagerPoster);
  // Niyet ref'te: buton onu doğrudan uygular, effect yalnız görünürlük /
  // hareket tercihi değişince okur — aynı tıklama iki kez oynatmaz.
  const intentRef = useRef<PlaybackIntent>("auto");
  const [playing, setPlaying] = useState(false);
  const videoId = useId();
  const alt = film.alt[locale];

  // `<video poster>` tembel yüklenmez: sayfanın dibindeki bir poster bile
  // açılışta indiriliyordu (Lighthouse: +67 KB ilk yükleme). Poster ancak
  // film görünür alana yarım ekran kala atanır.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || eagerPoster) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: "50% 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [eagerPoster]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.intersectionRatio >= 0.25),
      { threshold: [0, 0.25] },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Görünürlük ve hareket tercihi değiştikçe sayfa kuralını uygula.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const state = playbackState({ reduced, visible, intent: intentRef.current });
    if (state === "play") startMuted(video);
    else video.pause();
  }, [reduced, visible]);

  // Buton doğrudan uygular: başarısız bir oynatmadan sonra yeniden "oynat"
  // da gerçekten yeniden dener — niyet state'te olsaydı React aynı değeri
  // atlar, buton ölü kalırdı.
  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      intentRef.current = "pause";
      video.pause();
      return;
    }
    intentRef.current = "play";
    startMuted(video);
  };

  if (film.kind === "poster") {
    return (
      // Poster modu: next/image `fill`, sahnenin clip-path animasyonuyla
      // çakışıyor (MeetTheCrewReveal ile aynı karar).
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={`${styles.media} ${className ?? ""}`}
        src={film.poster.src}
        width={film.poster.width}
        height={film.poster.height}
        alt={alt}
        loading="lazy"
        decoding="async"
      />
    );
  }

  const label = playing ? t("pause") : t("play");

  return (
    <>
      <video
        ref={videoRef}
        id={videoId}
        className={`${styles.media} ${className ?? ""}`}
        poster={near ? film.poster.src : undefined}
        width={film.poster.width}
        height={film.poster.height}
        aria-label={alt}
        data-playback={playing ? "playing" : "paused"}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {orderedSources(film.sources).map((source) => (
          <source key={source.src} src={source.src} type={source.type} media={source.media} />
        ))}
      </video>
      <button
        type="button"
        className={styles.toggle}
        aria-controls={videoId}
        aria-label={label}
        title={label}
        onClick={toggle}
      >
        {playing ? (
          <Pause aria-hidden="true" size={16} strokeWidth={1.75} />
        ) : (
          <Play aria-hidden="true" size={16} strokeWidth={1.75} />
        )}
      </button>
    </>
  );
}
