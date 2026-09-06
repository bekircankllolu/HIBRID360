"use client";

import { useEffect, type RefObject } from "react";

/**
 * MONA'nın bakışı — kafa imleci pürüzsüz takip eder.
 *
 * Karakter iki katmana ayrıldı (kafa / gövde) ve kafa CSS 3B dönüşümüyle
 * döndürülüyor. WebGL kullanılmadı: CLAUDE.md performans bütçesi ve
 * "WebGL yalnızca Faz 5" kuralı geçerli, ayrıca MONA'nın kafası bir KUTU
 * olduğu için perspektif altında dönen düz görsel ikna edici duruyor —
 * aynı numara bir insan yüzünde çalışmazdı.
 *
 * PÜRÜZSÜZLÜK: hedefe üstel yaklaşma (exponential smoothing) + kare
 * süresine göre normalize edilmiş adım. Sabit çarpan kullanılsaydı hareket
 * 60Hz ve 144Hz ekranlarda farklı hızda akardı; burada `dt` ile
 * ölçeklendiği için her ekranda aynı ritimde ilerler.
 *
 * PERFORMANS: React state YOK. Her karede setState çağırmak tüm MONA
 * ağacını yeniden render ederdi; değerler doğrudan CSS özel değişkenine
 * yazılıyor ve dönüşümü compositor yürütüyor. Hedefe ulaşınca döngü
 * kendini durdurur, boşta CPU yakmaz.
 *
 * ERİŞİLEBİLİRLİK: `enabled` false iken (prefers-reduced-motion) hiçbir
 * dinleyici bağlanmaz ve değişkenler hiç yazılmaz — kafa sabit durur.
 */

/** Saniyede kapatılan mesafe oranı. Düşük = daha ağır, daha "mekanik". */
const SMOOTHING_PER_SECOND = 0.92;
/** Bu farkın altında döngü durur. */
const EPSILON = 0.0008;
/** İmleç hiç görülmediğinde (dokunmatik) hafif salınım. */
const IDLE_AMPLITUDE = 0.3;
const IDLE_PERIOD_MS = 11000;

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
    let lastTime = performance.now();
    const startedAt = lastTime;

    const clamp = (value: number) => (value < -1 ? -1 : value > 1 ? 1 : value);

    const tick = (now: number) => {
      // Kare süresi: sekme arka plandayken devasa dt gelebilir, sınırlanıyor.
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!pointerSeen) {
        const phase = ((now - startedAt) % IDLE_PERIOD_MS) / IDLE_PERIOD_MS;
        targetX = Math.sin(phase * Math.PI * 2) * IDLE_AMPLITUDE;
        targetY = Math.sin(phase * Math.PI * 4) * IDLE_AMPLITUDE * 0.35;
      }

      // Kare hızından bağımsız üstel yaklaşma.
      const step = 1 - Math.pow(1 - SMOOTHING_PER_SECOND, dt);
      currentX += (targetX - currentX) * step;
      currentY += (targetY - currentY) * step;

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
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      // Dokunmatik sürüklemede sayfa kaydırılırken kafa oynamasın.
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
