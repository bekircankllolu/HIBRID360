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

    const syncFrame = () => {
      animationFrame = 0;
      if (reducedMotion.matches || !Number.isFinite(video.duration)) return;

      const rect = section.getBoundingClientRect();
      const scrollDistance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollDistance));
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

    video.addEventListener("loadedmetadata", requestSync);
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);
    reducedMotion.addEventListener("change", handleMotionPreference);
    requestSync();

    return () => {
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
      sectionObserver.disconnect();
      video.removeEventListener("loadedmetadata", requestSync);
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
