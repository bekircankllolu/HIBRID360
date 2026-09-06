"use client";

import { useEffect, type RefObject } from "react";

/**
 * MONA'nın imleci takibi — kafanın bakışı.
 *
 * Referans site bunu Three.js'te gerçek bir 3D modelin boyun/gövde
 * rotasyonuyla yapıyor (`additiveRotations.neck`). Burada WebGL YOK:
 * CLAUDE.md performans bütçesi zaten aşılmış durumda ve Three.js + dokulu
 * GLB tek başına 2 MB'lık ilk yükleme sınırını katlardı. Bunun yerine
 * karakter iki katmana ayrıldı (kafa / gövde) ve kafa CSS 3B dönüşümüyle
 * döndürülüyor. MONA'nın kafası bir KUTU olduğu için perspektif altında
 * dönen düz bir görsel ikna edici duruyor — aynı numara bir insan yüzünde
 * çalışmazdı.
 *
 * PERFORMANS: React state kullanılmıyor. Her karede setState çağırmak tüm
 * konuşma ağacını yeniden render ederdi; bunun yerine değerler doğrudan
 * DOM'a CSS özel değişkeni olarak yazılıyor ve animasyonu compositor
 * yürütüyor.
 *
 * ERİŞİLEBİLİRLİK: `enabled` false olduğunda (prefers-reduced-motion)
 * hiçbir dinleyici bağlanmaz ve değişkenler 0'da kalır — kafa sabit durur.
 */

/** Hedefe yaklaşma oranı; düşük değer = daha ağır, daha "mekanik" bir kafa. */
const EASING = 0.075;
/** Bu farkın altında animasyon döngüsü durur — boşta CPU yakmasın. */
const EPSILON = 0.0005;
/** İmleç hiç oynamadığında (dokunmatik) hafif salınım. */
const IDLE_AMPLITUDE = 0.35;
const IDLE_PERIOD_MS = 9000;

export function useMonaGaze(
  ref: RefObject<HTMLElement | null>,
  { enabled }: { enabled: boolean },
) {
  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;
    let running = false;
    let pointerSeen = false;
    const startedAt = performance.now();

    const clamp = (value: number) => Math.max(-1, Math.min(1, value));

    const tick = () => {
      // İmleç hiç görülmediyse (dokunmatik cihaz) yavaş bir salınım uygula;
      // karakter tamamen ölü görünmesin.
      if (!pointerSeen) {
        const phase = ((performance.now() - startedAt) % IDLE_PERIOD_MS) / IDLE_PERIOD_MS;
        targetX = Math.sin(phase * Math.PI * 2) * IDLE_AMPLITUDE;
        targetY = Math.sin(phase * Math.PI * 4) * IDLE_AMPLITUDE * 0.4;
      }

      currentX += (targetX - currentX) * EASING;
      currentY += (targetY - currentY) * EASING;
      node.style.setProperty("--gaze-x", currentX.toFixed(4));
      node.style.setProperty("--gaze-y", currentY.toFixed(4));

      const settled =
        Math.abs(targetX - currentX) < EPSILON && Math.abs(targetY - currentY) < EPSILON;
      if (settled && pointerSeen) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      // Dokunmatik sürüklemede sayfa kaydırılırken kafayı oynatmıyoruz.
      if (event.pointerType === "touch") return;
      pointerSeen = true;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetX = clamp((event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2));
      targetY = clamp((event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2));
      wake();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      wake();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    wake();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(frame);
      node.style.removeProperty("--gaze-x");
      node.style.removeProperty("--gaze-y");
    };
  }, [ref, enabled]);
}
