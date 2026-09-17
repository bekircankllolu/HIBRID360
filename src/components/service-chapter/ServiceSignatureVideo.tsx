"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { useScrollScene } from "@/hooks/useScrollScene";
import { ChapterRule } from "./ChapterRule";
import styles from "./ServiceSignatureVideo.module.css";

const SCRUB_FRAME_SECONDS = 1 / 24;
const MIN_SEEK_INTERVAL_MS = 1000 / 24;
const END_FRAME_OFFSET_SECONDS = 1 / 24;
const DRAW_START = 0.04;
const DRAW_END = 0.76;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function drawingProgress(progress: number) {
  return clamp((progress - DRAW_START) / (DRAW_END - DRAW_START));
}

/**
 * A paused service-signature film whose timeline is controlled exclusively by
 * the section's sticky scroll progress. The generated films are monotonic, so
 * scrolling backwards cleanly removes the drawing again.
 */
export function ServiceSignatureVideo({
  src,
  title,
  caption,
}: {
  src: string;
  title: string;
  caption?: string;
}) {
  const titleId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetProgressRef = useRef(0);
  const requestSeekRef = useRef<() => void>(() => undefined);

  const onProgress = useCallback((progress: number) => {
    const draw = drawingProgress(progress);
    targetProgressRef.current = draw;
    if (videoRef.current) {
      videoRef.current.dataset.progress = draw.toFixed(4);
    }
    requestSeekRef.current();
  }, []);

  const { ref, motion } = useScrollScene<HTMLDivElement>({
    mode: "sticky",
    onProgress,
    rootMargin: "100% 0px",
  });

  useEffect(() => {
    const scene = ref.current;
    const video = videoRef.current;
    if (!scene || !video) return;

    let disposed = false;
    let seekTimer = 0;
    let lastSeekStartedAt = Number.NEGATIVE_INFINITY;

    const seekToTarget = () => {
      if (disposed) return;

      const wait = MIN_SEEK_INTERVAL_MS - (performance.now() - lastSeekStartedAt);
      if (wait > 0) {
        if (seekTimer === 0) {
          seekTimer = window.setTimeout(() => {
            seekTimer = 0;
            seekToTarget();
          }, wait);
        }
        return;
      }

      if (
        video.readyState < HTMLMediaElement.HAVE_METADATA ||
        !Number.isFinite(video.duration) ||
        video.seeking
      ) {
        return;
      }

      const lastFrame = Math.max(0, video.duration - END_FRAME_OFFSET_SECONDS);
      const rawTarget = targetProgressRef.current * lastFrame;
      const targetTime =
        targetProgressRef.current >= 1
          ? lastFrame
          : Math.min(
              lastFrame,
              Math.round(rawTarget / SCRUB_FRAME_SECONDS) * SCRUB_FRAME_SECONDS,
            );

      if (Math.abs(video.currentTime - targetTime) >= SCRUB_FRAME_SECONDS) {
        lastSeekStartedAt = performance.now();
        video.currentTime = targetTime;
      }
    };

    const loadVideo = () => {
      video.preload = "auto";
      video.load();
      loadObserver.disconnect();
    };

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadVideo();
      },
      { rootMargin: "100% 0px" },
    );

    requestSeekRef.current = seekToTarget;
    video.pause();
    video.addEventListener("loadedmetadata", seekToTarget);
    video.addEventListener("seeked", seekToTarget);
    loadObserver.observe(scene);
    seekToTarget();

    return () => {
      disposed = true;
      requestSeekRef.current = () => undefined;
      if (seekTimer !== 0) window.clearTimeout(seekTimer);
      loadObserver.disconnect();
      video.removeEventListener("loadedmetadata", seekToTarget);
      video.removeEventListener("seeked", seekToTarget);
    };
  }, [ref]);

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <div
        ref={ref}
        className={styles.wrapper}
        data-motion={motion}
        data-signature-video-scene=""
      >
        <div className={styles.stage}>
          <ChapterRule title={title} id={titleId} />

          <div className={styles.media}>
            <video
              ref={videoRef}
              className={styles.video}
              data-signature-video=""
              data-progress="0.0000"
              muted
              playsInline
              preload="none"
              disablePictureInPicture
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src={src} type="video/mp4" />
            </video>
          </div>

          {caption ? <p className={styles.caption}>{caption}</p> : null}
        </div>
      </div>
    </section>
  );
}
