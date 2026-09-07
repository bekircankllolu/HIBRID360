"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./Mona.module.css";
import { MONA_LOOK, monaLookTime, smoothMonaLook } from "./mona-video-look";

const VIDEO = "/videos/mona-performance-20260907.mp4";
const POSTER = "/images/mona/mona-video-poster.webp";

export function MonaVideo({ trackingRef, reducedMotion, pauseLabel, playLabel }: {
  trackingRef: RefObject<HTMLDivElement>;
  reducedMotion: boolean;
  pauseLabel: string;
  playLabel: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [manualPlaying, setManualPlaying] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState<"idle" | "tracking" | "paused">("paused");
  const requestedPlaying = manualPlaying ?? !reducedMotion;

  useEffect(() => {
    const video = videoRef.current;
    const host = trackingRef.current;
    const surface = surfaceRef.current;
    if (!video || !host || !surface || failed) return;
    if (video.error) { setFailed(true); return; }
    let disposed = false;
    const initialBounds = video.getBoundingClientRect();
    let visible = initialBounds.height > 0 && initialBounds.bottom > 0 && initialBounds.top < window.innerHeight;
    let request = 0;
    let tracking = false;
    let frame = 0;
    let lastTime = 0;
    let target = MONA_LOOK.center as number;
    let position = target;
    let touch: { id: number; x: number; y: number; dragged: boolean } | null = null;
    let suppressClickUntil = 0;
    video.muted = true;

    const canTrack = () => visible && !document.hidden && requestedPlaying && !reducedMotion
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const schedule = () => {
      if (!disposed && tracking && !frame && canTrack()) frame = requestAnimationFrame(seekFrame);
    };
    function seekFrame(time: number) {
      frame = 0;
      if (disposed || !tracking || !canTrack()) return;
      const dt = lastTime ? (time - lastTime) / 1000 : 1 / 60;
      lastTime = time;
      position = smoothMonaLook(position, target, dt);
      // Serialize seeks: a newer pointer event only changes the pending target.
      if (video!.readyState >= 1 && Number.isFinite(video!.duration) && !video!.seeking) {
        if (Math.abs(video!.currentTime - position) >= 1 / (MONA_LOOK.fps * 2)) video!.currentTime = position;
      }
      if (position !== target || video!.seeking || video!.readyState < 1) schedule();
    }
    const clearTracking = () => {
      tracking = false;
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    };
    const update = () => {
      const id = ++request;
      // Read the preference directly before initial playback to avoid a hydration flash.
      const allowed = manualPlaying ?? !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!visible || document.hidden || !allowed || !requestedPlaying) {
        clearTracking();
        setMode("paused");
        video.pause();
        return;
      }
      if (tracking) { video.pause(); schedule(); return; }
      setMode("idle");
      void video.play().catch(error => {
        if (disposed || id !== request || error?.name === "AbortError") return;
        if (video.error || error?.name === "NotSupportedError") { setFailed(true); return; }
        setManualPlaying(false);
      });
    };
    const look = (x: number) => {
      if (!canTrack()) return;
      const duration = Number.isFinite(video.duration) ? video.duration : 15;
      target = monaLookTime(x, duration);
      if (!tracking) {
        request++;
        tracking = true;
        // Do not scrub through unrelated later performances on pointer entry.
        position = video.currentTime >= MONA_LOOK.right && video.currentTime <= MONA_LOOK.left ? video.currentTime : target;
        lastTime = 0;
        video.pause();
        setMode("tracking");
        if (video.readyState === 0) { video.preload = "auto"; video.load(); }
      }
      surface.dataset.lookTime = target.toFixed(4);
      surface.dataset.lookX = x.toFixed(4);
      schedule();
    };
    const resume = () => { clearTracking(); update(); };
    const isControl = (target: EventTarget | null) => target instanceof Element
      && !!target.closest("button, a, input, textarea, select") && !target.closest("[data-mona-character]");
    const pointerMove = (event: PointerEvent) => {
      if (isControl(event.target)) { if (tracking) resume(); return; }
      if (event.pointerType === "touch") {
        if (!touch || event.pointerId !== touch.id) return;
        const dx = Math.abs(event.clientX - touch.x), dy = Math.abs(event.clientY - touch.y);
        if (!touch.dragged && (dx < 8 || dx < dy)) return;
        touch.dragged = true;
        if (event.target instanceof Element && !event.target.hasPointerCapture(event.pointerId)) event.target.setPointerCapture(event.pointerId);
      }
      const bounds = host.getBoundingClientRect();
      look((event.clientX - bounds.left) / bounds.width * 2 - 1);
    };
    const pointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" && event.target instanceof Element && event.target.closest("[data-mona-character]")) {
        touch = { id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false };
      }
    };
    const pointerEnd = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      if (touch?.dragged) suppressClickUntil = performance.now() + 400;
      touch = null;
      resume();
    };
    const click = (event: MouseEvent) => {
      if (performance.now() < suppressClickUntil && event.target instanceof Element && event.target.closest("[data-mona-character]")) {
        event.preventDefault(); event.stopPropagation();
        suppressClickUntil = 0;
      }
    };
    const keyDown = (event: KeyboardEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest("[data-mona-character]") || !canTrack()) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Home") {
        event.preventDefault();
        look(event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0);
      } else if (event.key === "Escape") resume();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.05 });
    observer.observe(video);
    document.addEventListener("visibilitychange", update);
    video.addEventListener("canplay", update);
    video.addEventListener("seeked", schedule);
    host.addEventListener("pointermove", pointerMove, { passive: true });
    host.addEventListener("pointerdown", pointerDown, { passive: true });
    host.addEventListener("pointerup", pointerEnd);
    host.addEventListener("pointercancel", pointerEnd);
    host.addEventListener("pointerleave", resume);
    host.addEventListener("keydown", keyDown);
    host.addEventListener("focusout", resume);
    host.addEventListener("click", click, true);
    return () => {
      disposed = true;
      request++;
      clearTracking();
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      video.removeEventListener("canplay", update);
      video.removeEventListener("seeked", schedule);
      host.removeEventListener("pointermove", pointerMove);
      host.removeEventListener("pointerdown", pointerDown);
      host.removeEventListener("pointerup", pointerEnd);
      host.removeEventListener("pointercancel", pointerEnd);
      host.removeEventListener("pointerleave", resume);
      host.removeEventListener("keydown", keyDown);
      host.removeEventListener("focusout", resume);
      host.removeEventListener("click", click, true);
      video.pause();
    };
  }, [trackingRef, requestedPlaying, manualPlaying, reducedMotion, failed]);

  return (
    <div ref={surfaceRef} className={styles.videoSurface} data-testid="mona-video-surface" data-playing={playing} data-failed={failed} data-mode={mode}>
      {failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.video} src={POSTER} alt="" aria-hidden="true" data-testid="mona-video-fallback" />
      ) : (
        <video ref={videoRef} className={styles.video} src={VIDEO} poster={POSTER}
          muted loop playsInline preload="none" disablePictureInPicture aria-hidden="true"
          data-testid="mona-video" onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onError={() => { setPlaying(false); setFailed(true); }} />
      )}
      {!failed && <button className={styles.motionControl} type="button"
        title={requestedPlaying ? pauseLabel : playLabel} aria-label={requestedPlaying ? pauseLabel : playLabel}
        onClick={() => setManualPlaying(!requestedPlaying)}>
        {requestedPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>}
    </div>
  );
}
