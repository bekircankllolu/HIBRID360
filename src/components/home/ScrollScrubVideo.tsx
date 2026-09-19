"use client";

import { useEffect, useRef } from "react";

type ScrollScrubVideoProps = {
  className: string;
  poster: string;
  src: string;
};

const END_FRAME_OFFSET_SECONDS = 1 / 24;

/** Keeps a paused, decorative video frame in sync with its section's scroll. */
export function ScrollScrubVideo({
  className,
  poster,
  src,
}: ScrollScrubVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const section = video?.closest<HTMLElement>("[data-scroll-scrub]");
    if (!video || !section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;

    const loadVideo = () => {
      video.load();
      sectionObserver.disconnect();
    };

    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadVideo();
      },
      { rootMargin: "50% 0px" },
    );
    sectionObserver.observe(section);

    // Bir seek sürerken gelen scroll hedefini bekletir; `seeked` gelince
    // en GÜNCEL hedefe tek bir seek yapılır.
    let pendingSync = false;

    const syncFrame = () => {
      animationFrame = 0;
      if (reducedMotion.matches || !Number.isFinite(video.duration)) return;

      // Seek sürerken yeni `currentTime` ATAMA. Önceki seek iptal olur,
      // çözümleme baştan başlar ve video scroll durana kadar eski karede
      // donar. Ana sayfada ölçüldü (17 Eylül 2026): 13 seek'in 9-11'i
      // öncekini böyle iptal ediyordu, "takılma" buydu. ServiceSignatureVideo
      // aynı korumayı zaten kullanıyor.
      if (video.seeking) {
        pendingSync = true;
        return;
      }

      /*
       * İlerleme bölüm EKRANA GİRDİĞİ an başlıyor, ekranın tepesine
       * yapıştığı an değil (19 Eylül 2026 kullanıcı geri bildirimi:
       * "sayfadan aşağı inerken tam adamın bölümüne gelmemizi beklemeyelim;
       * kaydırırken adamın da aynı anda kaydığını görelim... deneyim
       * bölünüyormuş gibi hissediyorum").
       *
       * Eski formül `-rect.top / (H - vh)` idi: bölüm yaklaşırken 0'da
       * duruyor, ancak sabitlendikten sonra ilerliyordu. Yeni formül
       * yaklaşma yolunu da sayıyor — üst kenar ekranın altına girdiğinde 0,
       * bölüm yukarıdan çıkarken 1. Bölüm yüksekliği de 180svh'ten
       * 150svh'e indi: sabit kalınan (ve bu yüzden "takıldı" hissi veren)
       * pay yarıya yakın kısaldı.
       */
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight);
      const progress = Math.min(
        1,
        Math.max(0, (window.innerHeight - rect.top) / travel),
      );
      const lastFrame = Math.max(0, video.duration - END_FRAME_OFFSET_SECONDS);
      const targetTime = progress * lastFrame;

      if (Math.abs(video.currentTime - targetTime) > END_FRAME_OFFSET_SECONDS) {
        video.currentTime = targetTime;
      }
    };

    const requestSync = () => {
      if (animationFrame === 0) {
        animationFrame = window.requestAnimationFrame(syncFrame);
      }
    };

    const handleMotionPreference = () => {
      if (reducedMotion.matches) video.currentTime = 0;
      requestSync();
    };

    const handleSeeked = () => {
      if (!pendingSync) return;
      pendingSync = false;
      requestSync();
    };

    video.addEventListener("loadedmetadata", requestSync);
    video.addEventListener("seeked", handleSeeked);
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);
    reducedMotion.addEventListener("change", handleMotionPreference);
    requestSync();

    return () => {
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
      sectionObserver.disconnect();
      video.removeEventListener("loadedmetadata", requestSync);
      video.removeEventListener("seeked", handleSeeked);
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
      reducedMotion.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      preload="none"
      muted
      playsInline
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
