"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { createDriftDots, driftDensity, stepDrift, type DriftDot } from "@/lib/mona-drift";
import styles from "./MonaDrift.module.css";

/**
 * Sayfa genelinde serbestçe gezinen ambient MONA noktaları (DECISIONS #45,
 * dördüncü geri bildirim turu: "tüm sayfada mona'nın noktacıklarına
 * benzer noktalar özgürce dolaşsın"). Köşedeki `MonaShard`'dan (MONA'nın
 * gerçek WebGL motoru, mıknatıs + tık tepkisi) bilerek AYRI: bu yalnız
 * MONA'nın renk/ışıma diliyle eşleşen, çok daha sade bir doku katmanı —
 * yay fiziği, imleç etkileşimi ya da "canlı varlık" mekaniği yok, yalnız
 * düz sürüklenme (`mona-drift.ts`). Etkileşimsiz olduğu için WebGL değil,
 * ucuz bir Canvas 2D.
 *
 * `MonaField`'in (SUPERSEDED, #40) reddedilen ilk denemesiyle aynı sticky
 * yerleşim hilesini kullanır ama bu kez renk/doku MONA'nın gerçek sarısı
 * ve yumuşak ışımasıyla eşleşiyor. Tamamen `pointer-events:none` —
 * sayfadaki hiçbir tıklama/hover davranışını etkilemez.
 *
 * Reduced motion: MonaShard'la aynı karar — tamamen dekoratif olduğu için
 * hiç render edilmez.
 */

const COUNT = 30;

function tokenColor(name: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || "#FFFC00";
}

export function MonaDrift() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const color = tokenColor("--color-brand-yellow");
    let bounds = { width: window.innerWidth, height: window.innerHeight };
    let dots: DriftDot[] = createDriftDots(bounds, COUNT);
    let dpr = 1;
    let density = driftDensity(window.scrollY, window.innerHeight);

    const rebuild = () => {
      bounds = { width: window.innerWidth, height: window.innerHeight };
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * dpr);
      canvas.height = Math.round(bounds.height * dpr);
      dots = createDriftDots(bounds, COUNT);
    };
    rebuild();
    window.addEventListener("resize", rebuild);

    let raf = 0;
    let last = 0;
    let running = false;

    const render = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, bounds.width, bounds.height);
      const visibleDots = Math.max(1, Math.round(dots.length * density));
      for (let index = 0; index < visibleDots; index += 1) {
        const dot = dots[index];
        const twinkle = 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(dot.phase));
        const glow = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dot.size * 4);
        glow.addColorStop(0, color);
        glow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.fillStyle = glow;
        ctx.globalAlpha = twinkle;
        ctx.arc(dot.x, dot.y, dot.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const onScroll = () => {
      density = driftDensity(window.scrollY, window.innerHeight);
    };

    const loop = (time: number) => {
      if (!running) return;
      const dt = last ? Math.min((time - last) / 1000, 0.1) : 1 / 60;
      last = time;
      dots = stepDrift(dots, bounds, dt);
      render();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || document.hidden) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    start();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", rebuild);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div className={styles.field} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
