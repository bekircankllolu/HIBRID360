"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./CustomCursor.module.css";

/**
 * Custom cursor — brief-rev12.md Bölüm 1.5.
 *
 * docs/DECISIONS.md #3 (VARSAYILANLA İLERLE): Seçenek B — derece işareti
 * (°), fuşya. Gerekçe: taş varyantından daha hafif, performans dostu.
 *
 * Kapalı olduğu durumlar:
 *   - prefers-reduced-motion açıkken (CLAUDE.md: custom cursor bu ayarda
 *     devre dışı kalır)
 *   - dokunmatik / kaba işaretçili cihazlarda (imleç yok, anlamsız)
 * Sistem imleci hiçbir zaman gizlenmiyor: özel imleç onun üzerine eklenen
 * bir katman. Böylece imleç kaybolma riski ve erişilebilirlik sorunu olmaz.
 */
export function CustomCursor() {
  const reducedMotion = usePrefersReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      setEnabled(false);
      return;
    }
    // Yalnızca hassas işaretçisi olan cihazlarda (fare/trackpad).
    const query = window.matchMedia("(pointer: fine)");
    setEnabled(query.matches);

    const onChange = (event: MediaQueryListEvent) => setEnabled(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [reducedMotion]);

  useEffect(() => {
    if (!enabled) return;

    let frameId: number | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (frameId === null) frameId = requestAnimationFrame(follow);
    };

    // Hafif gecikmeli takip — brief'in "elastik" hissi, tek transform ile.
    const follow = () => {
      currentX += (targetX - currentX) * 0.2;
      currentY += (targetY - currentY) * 0.2;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
      const settled =
        Math.abs(targetX - currentX) < 0.5 && Math.abs(targetY - currentY) < 0.5;
      frameId = settled ? null : requestAnimationFrame(follow);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <span ref={dotRef} className={styles.cursor} aria-hidden="true">
      °
    </span>
  );
}
