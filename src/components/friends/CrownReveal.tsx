"use client";

import { useEffect, useRef } from "react";
import styles from "./CrownReveal.module.css";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (start: number, end: number, value: number) => {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
};

const revealWindow = (
  progress: number,
  enterStart: number,
  enterEnd: number,
  exitStart: number,
  exitEnd: number,
) => {
  const entering = smoothstep(enterStart, enterEnd, progress);
  const exiting = 1 - smoothstep(exitStart, exitEnd, progress);
  return entering * exiting;
};

export function CrownReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const firstLineRef = useRef<HTMLSpanElement>(null);
  const accentLineRef = useRef<HTMLSpanElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const firstLine = firstLineRef.current;
    const accentLine = accentLineRef.current;
    const body = bodyRef.current;

    if (!section || !video || !firstLine || !accentLine || !body) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let frameId = 0;

    const setCopy = (
      element: HTMLElement,
      opacity: number,
      distance: number,
    ) => {
      element.style.opacity = opacity.toFixed(3);
      element.style.transform = `translate3d(0, ${(distance * (1 - opacity)).toFixed(2)}px, 0)`;
    };

    const render = () => {
      frameId = 0;

      if (reducedMotion.matches) {
        const finalFrame = Math.max(0, video.duration - 0.05);
        if (Number.isFinite(finalFrame) && video.readyState >= 1) {
          video.currentTime = finalFrame;
        }
        setCopy(firstLine, 1, 0);
        setCopy(accentLine, 1, 0);
        setCopy(body, 1, 0);
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollDistance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / scrollDistance);

      if (video.readyState >= 1 && Number.isFinite(video.duration)) {
        const targetTime = progress * Math.max(0, video.duration - 0.05);
        if (Math.abs(video.currentTime - targetTime) > 0.015) {
          video.currentTime = targetTime;
        }
      }

      setCopy(firstLine, revealWindow(progress, 0.03, 0.14, 0.48, 0.6), 42);
      setCopy(accentLine, revealWindow(progress, 0.14, 0.26, 0.48, 0.6), 56);
      setCopy(body, revealWindow(progress, 0.56, 0.7, 0.94, 1), 34);
    };

    const requestRender = () => {
      if (frameId === 0) frameId = window.requestAnimationFrame(render);
    };

    section.dataset.enhanced = "true";
    video.pause();
    video.addEventListener("loadedmetadata", requestRender);
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    reducedMotion.addEventListener("change", requestRender);
    requestRender();

    return () => {
      if (frameId !== 0) window.cancelAnimationFrame(frameId);
      video.removeEventListener("loadedmetadata", requestRender);
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      reducedMotion.removeEventListener("change", requestRender);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.reveal}
      aria-label="YOUR BRAND. CROWNED."
    >
      <div className={styles.stage}>
        <video
          ref={videoRef}
          className={styles.video}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/videos/friends-crown-reveal.mp4" type="video/mp4" />
        </video>

        <p className={styles.title} aria-label="YOUR BRAND. CROWNED.">
          <span ref={firstLineRef} className={styles.firstLine}>
            YOUR BRAND.
          </span>
          <span ref={accentLineRef} className={styles.accentLine}>
            CROWNED.
          </span>
        </p>

        <p ref={bodyRef} className={styles.copy}>
          Every brand we partner with is already royalty. We give its story the
          presence, impact and attention it deserves.
        </p>
      </div>
    </section>
  );
}
