"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  orbitStones,
  stonePoint,
  ORBIT_VIEW,
  ORBIT_RINGS,
  ORBIT_TILT,
  COMPACT_RINGS,
  COMPACT_TILT,
  CRYSTAL_MEDIA,
  SOLAR_SYSTEM_TITLE,
} from "@/data/solar-system";
import {
  createStarfield,
  starAppearance,
  STARLIGHT_RGB,
  STAR_RGB,
  STAR_PARALLAX,
} from "@/lib/starfield";
import { placeSolarPopover, type PopoverPlacement } from "@/lib/solar-popover";
import {
  createCrystalPlayback,
  createParticleTrail,
  returnWeight,
  DRAG_THRESHOLD,
  RETURN_SECONDS,
  TRAIL_CAPACITY,
  type Point,
} from "@/lib/solar-motion";
import styles from "./SolarSystem.module.css";

interface Body extends Point {
  time: number;
  returnAge: number;
  offsetX: number;
  offsetY: number;
}

interface Drag {
  index: number;
  pointerId: number;
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
  moved: boolean;
}

function crystalSize(width: number, compact: boolean, focus: number) {
  return (
    (compact ? Math.min(178, width * 0.5) : Math.min(350, width * 0.32)) *
    CRYSTAL_MEDIA.scale *
    (1 + focus * 0.045)
  );
}

export function SolarSystem() {
  const reducedMotion = usePrefersReducedMotion();
  const locale = useLocale();
  const t = useTranslations("common");
  const wwd = useTranslations("whatWeDo");
  const descriptions = wwd.raw("list") as Array<{
    title: string;
    body: string;
  }>;
  const [active, setActive] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [canvasUnavailable, setCanvasUnavailable] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const crystalHitRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const detailSize = useRef({ width: 248, height: 156 });
  const detailPlacement = useRef<PopoverPlacement | null>(null);
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const bodies = useRef<Body[]>(
    orbitStones.map((stone) => ({
      ...stonePoint(stone, 0),
      time: 0,
      returnAge: RETURN_SECONDS,
      offsetX: 0,
      offsetY: 0,
    })),
  );
  const interaction = useRef({
    active,
    paused,
    hover: null as number | null,
    focus: null as number | null,
    crystalHover: false,
  });
  interaction.current.active = active;
  interaction.current.paused = paused;
  const dragRef = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const pointer = useRef<Point | null>(null);
  const metrics = useRef({
    w: 1,
    h: 1,
    compact: false,
    parX: 0,
    parY: 0,
    focus: 0,
  });
  const engine = useRef<{ wake: () => void; stop: () => void } | null>(null);

  const layoutDetail = useCallback(() => {
    const index = interaction.current.active;
    const detail = detailRef.current;
    if (index === null || !detail || detail.hidden) return;
    const { w, h, compact, parX, parY } = metrics.current;
    if (w <= 1) return;
    const body = bodies.current[index];
    const anchor = {
      x: (body.x * w) / ORBIT_VIEW.w + parX,
      y: (body.y * h) / ORBIT_VIEW.h + parY,
    };
    const size = crystalSize(w, compact, 1);
    const cx = (ORBIT_VIEW.cx * w) / ORBIT_VIEW.w + parX * 0.35;
    const cy = (ORBIT_VIEW.cy * h) / ORBIT_VIEW.h + parY * 0.35;
    const obstacles = bodies.current
      .filter((_, i) => i !== index)
      .map((point) => ({
        x: (point.x * w) / ORBIT_VIEW.w + parX - 16,
        y: (point.y * h) / ORBIT_VIEW.h + parY - 16,
        width: 32,
        height: 32,
      }));
    obstacles.push({ x: w - 48, y: h * 0.12 - 4, width: 48, height: 52 });
    const placement = placeSolarPopover(
      anchor,
      detailSize.current,
      { width: w, height: h },
      {
        x: cx - size * 0.36 - 8,
        y: cy - size * 0.34 - 8,
        width: size * 0.72 + 16,
        height: size * 0.68 + 16,
      },
      obstacles,
      detailPlacement.current?.side,
    );
    detailPlacement.current = placement;
    detail.style.left = `${placement.x}px`;
    detail.style.top = `${placement.y}px`;
    detail.dataset.positioned = "true";
  }, []);

  const localPoint = useCallback(
    (event: { clientX: number; clientY: number }): Point => {
      const rect = stageRef.current!.getBoundingClientRect();
      const { parX, parY } = metrics.current;
      return {
        x: ((event.clientX - rect.left - parX) / rect.width) * ORBIT_VIEW.w,
        y: ((event.clientY - rect.top - parY) / rect.height) * ORBIT_VIEW.h,
        depth: 1,
      };
    },
    [],
  );

  const finishDrag = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    const button = buttonRefs.current[drag.index];
    if (button?.hasPointerCapture(drag.pointerId))
      button.releasePointerCapture(drag.pointerId);
    if (drag.moved) {
      const body = bodies.current[drag.index];
      const home = stonePoint(
        orbitStones[drag.index],
        body.time,
        metrics.current.compact,
      );
      body.offsetX = body.x - home.x;
      body.offsetY = body.y - home.y;
      body.returnAge = 0;
      suppressClick.current = true;
    }
    if (button) button.dataset.dragging = "false";
    engine.current?.wake();
  }, []);

  const dismiss = useCallback((restoreFocus = false) => {
    const previous = interaction.current.active;
    detailPlacement.current = null;
    setActive(null);
    if (restoreFocus && previous !== null)
      buttonRefs.current[previous]?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const outside = (event: globalThis.PointerEvent) => {
      const target = event.target as Node;
      if (
        !detailRef.current?.contains(target) &&
        !buttonRefs.current.some((button) => button?.contains(target))
      )
        dismiss();
    };
    const focusOutside = (event: FocusEvent) => {
      const target = event.target as Node;
      if (
        interaction.current.active !== null &&
        !detailRef.current?.contains(target) &&
        !buttonRefs.current[interaction.current.active]?.contains(target)
      )
        dismiss();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      finishDrag();
      dismiss(true);
    };
    const blur = () => {
      finishDrag();
      interaction.current.hover = null;
      interaction.current.crystalHover = false;
      pointer.current = null;
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", focusOutside);
    document.addEventListener("keydown", escape);
    window.addEventListener("blur", blur);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", focusOutside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("blur", blur);
    };
  }, [dismiss, finishDrag]);

  useLayoutEffect(() => {
    detailPlacement.current = null;
    const detail = detailRef.current;
    if (active === null || !detail) return;
    const measure = () => {
      detailSize.current = {
        width: detail.offsetWidth,
        height: detail.offsetHeight,
      };
      layoutDetail();
      engine.current?.wake();
    };
    measure();
    detail.focus({ preventScroll: true });
    const observer = new ResizeObserver(measure);
    observer.observe(detail);
    return () => observer.disconnect();
  }, [active, layoutDetail]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!stage || !canvas || !video) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      setCanvasUnavailable(true);
      return;
    }
    video.defaultPlaybackRate = CRYSTAL_MEDIA.playbackRate;
    video.playbackRate = CRYSTAL_MEDIA.playbackRate;
    const playback = createCrystalPlayback(video, CRYSTAL_MEDIA.fps);
    const poster = new window.Image();
    // Preserve the last decoded frame across loop boundaries and pending seeks.
    const mediaFrame = document.createElement("canvas");
    mediaFrame.width = CRYSTAL_MEDIA.width;
    mediaFrame.height = CRYSTAL_MEDIA.height;
    const mediaContext = mediaFrame.getContext("2d", { alpha: false });
    let hasMediaFrame = false;
    let mediaTime = -1;
    const stars = createStarfield(0x1b360, 220);
    const starSprites = Object.fromEntries(
      Object.entries(STARLIGHT_RGB).map(([tint, rgb]) => {
        const sprite = document.createElement("canvas");
        sprite.width = sprite.height = 64;
        const context = sprite.getContext("2d")!;
        const light = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        light.addColorStop(0, "rgba(255,255,255,1)");
        light.addColorStop(0.08, `rgba(${rgb},0.9)`);
        light.addColorStop(0.2, `rgba(${rgb},0.32)`);
        light.addColorStop(0.5, `rgba(${rgb},0.06)`);
        light.addColorStop(1, `rgba(${rgb},0)`);
        context.fillStyle = light;
        context.fillRect(0, 0, 64, 64);
        return [tint, sprite];
      }),
    );
    let trails = orbitStones.map((_, i) =>
      createParticleTrail(360 + i, TRAIL_CAPACITY.desktop),
    );
    const previousPoints = bodies.current.map((body) => ({
      x: body.x,
      y: body.y,
      depth: body.depth,
    }));
    let inView = false;
    let frame: number | null = null;
    let last = 0;
    let skyTime = 0;
    let lastScroll = window.scrollY;
    let dpr = 1;
    let alive = true;

    const frozen = () =>
      reducedMotion ||
      interaction.current.paused ||
      interaction.current.crystalHover ||
      !inView ||
      document.hidden;

    const paint = () => {
      const { w, h, parX, parY, compact, focus } = metrics.current;
      const sx = w / ORBIT_VIEW.w;
      const sy = h / ORBIT_VIEW.h;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < (compact ? 110 : 220); i++) {
        const star = stars[i];
        const appearance = starAppearance(star, skyTime, reducedMotion);
        const par = STAR_PARALLAX[star.layer];
        const x = appearance.x * w + parX * par * 0.4;
        const y = appearance.y * h + parY * par * 0.4;
        const alpha = Math.min(1, appearance.alpha * 1.3);
        const size = star.radius * 8;
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          starSprites[star.tint],
          x - size / 2,
          y - size / 2,
          size,
          size,
        );
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.3, star.radius * 0.58), 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${STARLIGHT_RGB[star.tint]})`;
        ctx.fill();
        if (star.alpha > 0.84) {
          const ray = star.radius * 2.5;
          ctx.beginPath();
          ctx.moveTo(x - ray, y);
          ctx.lineTo(x + ray, y);
          ctx.moveTo(x, y - ray);
          ctx.lineTo(x, y + ray);
          ctx.strokeStyle = `rgba(${STARLIGHT_RGB[star.tint]},0.22)`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      const radii = compact
        ? [COMPACT_RINGS[0], COMPACT_RINGS[2]]
        : ORBIT_RINGS;
      const highlight =
        interaction.current.active ??
        interaction.current.hover ??
        interaction.current.focus;
      radii.forEach((radius, index) => {
        const highlighted =
          highlight !== null &&
          (compact ? COMPACT_RINGS : ORBIT_RINGS)[
            orbitStones[highlight].ring
          ] === radius;
        ctx.beginPath();
        ctx.ellipse(
          ORBIT_VIEW.cx * sx + parX,
          ORBIT_VIEW.cy * sy + parY,
          radius * sx,
          radius * (compact ? COMPACT_TILT : ORBIT_TILT) * sy,
          0,
          0,
          Math.PI * 2,
        );
        const rgb = highlighted
          ? STAR_RGB[orbitStones[highlight!].color]
          : "255,255,255";
        ctx.strokeStyle = `rgba(${rgb},${highlighted ? 0.3 : 0.18 - index * 0.03})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      });

      const paintParticles = (front: boolean) => {
        if (reducedMotion) return;
        trails.forEach((trail, i) => {
          for (const p of trail.particles) {
            if (p.age >= p.life || p.depth >= 0.5 !== front) continue;
            const alpha = (1 - p.age / p.life) ** 1.2 * (0.5 + p.depth * 0.45);
            ctx.beginPath();
            ctx.arc(p.x * sx + parX, p.y * sy + parY, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${STAR_RGB[orbitStones[i].color]},${alpha})`;
            ctx.fill();
          }
        });
      };
      paintParticles(false);

      // Blend with actual scene pixels. Black video pixels cannot leave a matte.
      const mediaWidth = crystalSize(w, compact, focus);
      const cx = ORBIT_VIEW.cx * sx + parX * 0.35;
      const cy = ORBIT_VIEW.cy * sy + parY * 0.35;
      const decodedFrame = Math.floor(video.currentTime * CRYSTAL_MEDIA.fps);
      if (
        mediaContext &&
        video.readyState >= 2 &&
        !video.seeking &&
        (!hasMediaFrame || decodedFrame !== mediaTime)
      ) {
        mediaContext.drawImage(
          video,
          0,
          0,
          mediaFrame.width,
          mediaFrame.height,
        );
        hasMediaFrame = true;
        mediaTime = decodedFrame;
      }
      const source = hasMediaFrame
        ? mediaFrame
        : poster.complete && poster.naturalWidth
          ? poster
          : null;
      if (source) {
        ctx.globalCompositeOperation = "screen";
        ctx.drawImage(
          source,
          cx - mediaWidth / 2 + CRYSTAL_MEDIA.offsetX * mediaWidth,
          cy - mediaWidth / 2 + CRYSTAL_MEDIA.offsetY * mediaWidth,
          mediaWidth,
          mediaWidth,
        );
        ctx.globalCompositeOperation = "source-over";
      }
      paintParticles(true);
      if (interaction.current.active !== null && detailPlacement.current) {
        const body = bodies.current[interaction.current.active];
        const tip = detailPlacement.current.tip;
        const x = body.x * sx + parX;
        const y = body.y * sy + parY;
        // A distant mobile placement should not draw a wire through the crystal.
        if (Math.hypot(tip.x - x, tip.y - y) <= 80) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(tip.x, tip.y);
          ctx.strokeStyle = `rgba(${STAR_RGB[orbitStones[interaction.current.active].color]},0.35)`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
      const hit = crystalHitRef.current;
      if (hit) {
        hit.style.left = `${cx}px`;
        hit.style.top = `${cy}px`;
        hit.style.width = `${mediaWidth * 0.69}px`;
        hit.style.height = `${mediaWidth * 0.67}px`;
      }
    };

    const place = (dt: number) => {
      const { w, h, compact, parX, parY } = metrics.current;
      bodies.current.forEach((body, i) => {
        const from = previousPoints[i];
        const held =
          interaction.current.active === i ||
          interaction.current.hover === i ||
          interaction.current.focus === i ||
          dragRef.current?.index === i;
        if (!held) body.time += dt;
        const home = stonePoint(orbitStones[i], body.time, compact);
        if (!(dragRef.current?.index === i && dragRef.current.moved)) {
          body.returnAge += dt;
          const weight = reducedMotion ? 0 : returnWeight(body.returnAge);
          body.x = home.x + body.offsetX * weight;
          body.y = home.y + body.offsetY * weight;
          body.depth = home.depth;
        }
        if (dt > 0) trails[i].step(dt, from, body, pointer.current);
        from.x = body.x;
        from.y = body.y;
        from.depth = body.depth;
        const el = nodeRefs.current[i];
        if (!el) return;
        el.style.left = "0px";
        el.style.top = "0px";
        const x = (body.x * w) / ORBIT_VIEW.w + parX;
        const y = (body.y * h) / ORBIT_VIEW.h + parY;
        el.style.transform = `translate3d(${x}px,${y}px,0)`;
        el.style.setProperty(
          "--point-opacity",
          `${held ? 1 : 0.65 + body.depth * 0.35}`,
        );
        el.dataset.labelSide =
          x < 130 ? "start" : x > w - 130 ? "end" : "center";
        el.dataset.returning =
          body.returnAge < RETURN_SECONDS ? "true" : "false";
      });
      layoutDetail();
    };

    const step = (now: number) => {
      frame = null;
      if (!alive || !inView || document.hidden) return;
      const staticScene = reducedMotion || interaction.current.paused;
      const dt = staticScene ? 0 : Math.min((now - last) / 1000, 0.04);
      last = now;
      skyTime += dt;
      if (
        !staticScene &&
        !dragRef.current &&
        interaction.current.active === null
      ) {
        const p = pointer.current;
        const targetX =
          (p ? (p.x / ORBIT_VIEW.w - 0.5) * 8 : 0) +
          Math.sin(skyTime * 0.16) * 1.2;
        const targetY =
          (p ? (p.y / ORBIT_VIEW.h - 0.5) * 5 : 0) +
          Math.sin(skyTime * 0.12) * 0.6;
        const smooth = 1 - Math.exp(-6 * dt);
        metrics.current.parX += (targetX - metrics.current.parX) * smooth;
        metrics.current.parY += (targetY - metrics.current.parY) * smooth;
      }
      const targetFocus =
        !staticScene && interaction.current.active !== null ? 1 : 0;
      metrics.current.focus +=
        (targetFocus - metrics.current.focus) *
        (staticScene ? 1 : 1 - Math.exp(-4 * dt));
      playback.step(now, frozen());
      place(dt);
      paint();
      stage.dataset.motion = staticScene ? "paused" : "running";
      stage.dataset.mediaMode = playback.mode;
      if (!staticScene) frame = requestAnimationFrame(step);
    };

    const wake = () => {
      if (!alive || frame !== null || !inView || document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };
    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      playback.stop();
      stage.dataset.motion = "paused";
      stage.dataset.mediaMode = "paused";
    };
    engine.current = { wake, stop };

    const resize = () => {
      finishDrag();
      detailPlacement.current = null;
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const compact = rect.width <= 640;
      if (compact !== metrics.current.compact) {
        trails = orbitStones.map((_, i) =>
          createParticleTrail(
            360 + i,
            compact ? TRAIL_CAPACITY.compact : TRAIL_CAPACITY.desktop,
          ),
        );
        for (const body of bodies.current) body.returnAge = RETURN_SECONDS;
      }
      metrics.current = {
        ...metrics.current,
        w: rect.width,
        h: rect.height,
        compact,
      };
      dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      place(0);
      paint();
      wake();
    };
    const visibility = () => {
      lastScroll = window.scrollY;
      if (document.hidden) {
        finishDrag();
        stop();
      } else wake();
    };
    const scroll = () => {
      const delta = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      playback.scroll(
        delta,
        window.innerHeight,
        performance.now(),
        frozen() || dragRef.current !== null,
      );
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        lastScroll = window.scrollY;
        if (inView) wake();
        else {
          finishDrag();
          stop();
        }
      },
      { threshold: 0.08 },
    );
    const mediaObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        poster.src = CRYSTAL_MEDIA.poster;
        if (!reducedMotion && !video.getAttribute("src"))
          video.src = CRYSTAL_MEDIA.interactive;
        mediaObserver.disconnect();
      },
      { rootMargin: "300px" },
    );
    poster.onload = () => {
      paint();
      wake();
    };
    const resizer = new ResizeObserver(resize);
    resize();
    resizer.observe(stage);
    observer.observe(stage);
    mediaObserver.observe(stage);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      alive = false;
      stop();
      poster.onload = null;
      observer.disconnect();
      mediaObserver.disconnect();
      resizer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("scroll", scroll);
      engine.current = null;
    };
  }, [reducedMotion, finishDrag, layoutDetail]);

  useEffect(() => {
    engine.current?.wake();
  }, [active, paused]);

  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const p = localPoint(event);
    if (event.pointerType === "mouse") pointer.current = p;
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (
      !drag.moved &&
      Math.hypot(event.clientX - drag.clientX, event.clientY - drag.clientY) <
        DRAG_THRESHOLD
    )
      return;
    drag.moved = true;
    suppressClick.current = true;
    const body = bodies.current[drag.index];
    const { w, h } = metrics.current;
    const marginX = (24 * ORBIT_VIEW.w) / w;
    const marginY = (24 * ORBIT_VIEW.h) / h;
    body.x = Math.max(
      marginX,
      Math.min(ORBIT_VIEW.w - marginX, p.x + drag.offsetX),
    );
    body.y = Math.max(
      marginY,
      Math.min(ORBIT_VIEW.h - marginY, p.y + drag.offsetY),
    );
    body.depth = 1;
    const button = buttonRefs.current[drag.index];
    if (button) button.dataset.dragging = "true";
    engine.current?.wake();
  };

  const selected = active === null ? null : orbitStones[active];
  const selectedBody = selected
    ? descriptions.find((item) => item.title === selected.wwdTitle)?.body
    : "";

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="solar-system-title"
      style={{ "--crystal-scale": CRYSTAL_MEDIA.scale } as CSSProperties}
    >
      <div className={styles.heading}>
        {/* Taslak (Eylül 2026): başlık iki katmanlı okunuyor — üstte ince
            "One Hybrid Production", altta harf aralığı açılmış ECOSYSTEM.
            Erişilebilir ad özgün cümle olarak kalıyor, çünkü hem anlamı
            taşıyan metin o hem de e2e testleri başlığı bu adla buluyor. */}
        <h2
          id="solar-system-title"
          className={styles.title}
          aria-label={SOLAR_SYSTEM_TITLE}
        >
          <span className={styles.titleLead} aria-hidden="true">
            One Hybrid Production
          </span>
          <span className={styles.titleWord} aria-hidden="true">
            Ecosystem
          </span>
        </h2>
        <p className={styles.instruction}>
          {locale === "tr"
            ? "Servisleri keşfetmek için noktalara tıklayın"
            : "Click the points to explore each service"}
        </p>
      </div>
      <div
        className={styles.stage}
        ref={stageRef}
        data-testid="ecosystem-stage"
        onPointerMove={pointerMove}
        onPointerLeave={() => {
          pointer.current = null;
          interaction.current.hover = null;
        }}
      >
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        {!reducedMotion && (
          <button
            type="button"
            className={`${styles.control} ${styles.playbackControl}`}
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? t("resumeAnimation") : t("pauseAnimation")}
            aria-pressed={paused}
            title={paused ? t("resumeAnimation") : t("pauseAnimation")}
          >
            <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
          </button>
        )}
        {canvasUnavailable && (
          <Image
            src={CRYSTAL_MEDIA.poster}
            width={512}
            height={512}
            sizes="350px"
            alt=""
            className={styles.fallback}
          />
        )}
        <video
          ref={videoRef}
          className={styles.mediaSource}
          width={512}
          height={512}
          preload="none"
          muted
          loop
          playsInline
          aria-hidden="true"
          tabIndex={-1}
        />
        <div
          ref={crystalHitRef}
          className={styles.crystalHit}
          aria-hidden="true"
          data-testid="crystal-hit"
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse")
              interaction.current.crystalHover = true;
          }}
          onPointerLeave={() => {
            interaction.current.crystalHover = false;
          }}
        />
        <span className={styles.coreLabel} aria-hidden="true">
          HIBRID 360
        </span>
        {orbitStones.map((stone, index) => (
          <div
            key={stone.orbit}
            ref={(el) => {
              nodeRefs.current[index] = el;
            }}
            className={`${styles.point} ${active === index ? styles.pointActive : ""}`}
            style={
              {
                "--stone-color": `var(--color-brand-${stone.color})`,
                left: `${(stonePoint(stone, 0).x / ORBIT_VIEW.w) * 100}%`,
                top: `${(stonePoint(stone, 0).y / ORBIT_VIEW.h) * 100}%`,
              } as CSSProperties
            }
          >
            <button
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              className={styles.dot}
              aria-label={stone.label}
              aria-expanded={active === index}
              aria-controls="ecosystem-detail"
              aria-haspopup="dialog"
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse")
                  interaction.current.hover = index;
              }}
              onPointerLeave={() => {
                if (interaction.current.hover === index)
                  interaction.current.hover = null;
              }}
              onFocus={() => {
                interaction.current.focus = index;
              }}
              onBlur={() => {
                if (interaction.current.focus === index)
                  interaction.current.focus = null;
              }}
              onPointerDown={(event) => {
                if (!event.isPrimary || event.button !== 0 || dragRef.current)
                  return;
                suppressClick.current = false;
                if (paused || reducedMotion) return;
                const p = localPoint(event);
                const body = bodies.current[index];
                dragRef.current = {
                  index,
                  pointerId: event.pointerId,
                  clientX: event.clientX,
                  clientY: event.clientY,
                  offsetX: body.x - p.x,
                  offsetY: body.y - p.y,
                  moved: false,
                };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
              onLostPointerCapture={finishDrag}
              onClick={(event) => {
                if (event.detail > 0 && suppressClick.current) {
                  suppressClick.current = false;
                  return;
                }
                setActive((value) => (value === index ? null : index));
              }}
            >
              <span className={styles.dotCore} aria-hidden="true" />
              <span className={styles.dotLabel} aria-hidden="true">
                {stone.label}
              </span>
            </button>
          </div>
        ))}
        <div
          ref={detailRef}
          id="ecosystem-detail"
          className={styles.detail}
          hidden={!selected}
          role="dialog"
          aria-modal="false"
          aria-labelledby={selected ? "ecosystem-detail-title" : undefined}
          aria-describedby={
            selected ? "ecosystem-detail-description" : undefined
          }
          tabIndex={-1}
          onPointerMove={(event) => event.stopPropagation()}
          style={
            {
              "--stone-color": selected
                ? `var(--color-brand-${selected.color})`
                : undefined,
            } as CSSProperties
          }
        >
          {selected && (
            <>
              <div className={styles.detailHeader}>
                <h3 id="ecosystem-detail-title">{selected.label}</h3>
                <button
                  type="button"
                  className={styles.control}
                  onClick={() => dismiss(true)}
                  aria-label={t("closeDetails")}
                  title={t("closeDetails")}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <p id="ecosystem-detail-description">{selectedBody}</p>
              <Link href={selected.href} className={styles.detailLink}>
                {t("learnMore")} <span aria-hidden="true">→</span>
              </Link>
            </>
          )}
        </div>
      </div>
      <noscript>
        <nav aria-label={SOLAR_SYSTEM_TITLE}>
          {orbitStones.map((stone) => (
            <Link key={stone.orbit} href={stone.href}>
              {stone.label}{" "}
            </Link>
          ))}
        </nav>
      </noscript>
    </section>
  );
}
