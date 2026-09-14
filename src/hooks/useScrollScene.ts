"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { passProgress, stickyProgress } from "@/lib/scroll-scene";

/**
 * Service Chapter scroll sahnesi — `MeetTheCrewReveal`'daki kalıbın
 * genelleştirilmiş hâli (culture bileşenlerine dokunulmadı; rollout'ta
 * onlar da buna bağlanacak — docs/design/SERVICE_CHAPTER_SYSTEM.md §11).
 *
 * JS'in tek işi bir sayı yazmak: sahnenin `--progress` değişkeni (0→1).
 * Ölçülerin tamamı CSS'te o değişkenden türetilir; React state'e kare
 * başına yazılmaz, yani kaydırma boyunca yeniden render yok.
 *
 * - Görünür değilken kaydırma dinlenmez (IntersectionObserver kapısı).
 * - Dinleyici pasif ve rAF ile birleştirilir: kare başına en fazla bir ölçüm.
 * - Hareket azaltmada ölçülmez: `--progress` 1 (final durum).
 * - Sahnenin YERLEŞİMİ (sticky yükseklik vb.) JS'e değil CSS media
 *   query'sine bağlıdır; hidrasyonda sayfa yüksekliği sıçramaz. `motion`
 *   yalnızca test/Playwright için `data-motion` kancasıdır.
 */

export type SceneMode = "sticky" | "pass";
export type SceneMotion = "scroll" | "static";

export interface ScrollSceneOptions {
  /** `sticky`: uzun sarmalayıcı + yapışkan sahne. `pass`: akan öğe. */
  mode: SceneMode;
  rootMargin?: string;
  /** İlerleme her ölçüldüğünde (rAF içinde) çağrılır — ör. SVG uç noktası. */
  onProgress?: (progress: number) => void;
  /**
   * false ise hiç dinlemez (IO dahil) — sahne yalnız bazı cihazlarda
   * kaydırmaya bağlıysa (ör. hizmet dizininin dokunmatik odağı) diğerlerinde
   * boşuna kare başına stil hesaplatmasın. Varsayılan true.
   */
  enabled?: boolean;
}

export function useScrollScene<T extends HTMLElement>({
  mode,
  rootMargin = "10% 0px",
  onProgress,
  enabled = true,
}: ScrollSceneOptions): { ref: RefObject<T>; motion: SceneMotion } {
  const ref = useRef<T>(null);
  const prefersReduced = usePrefersReducedMotion();
  const [inView, setInView] = useState(false);

  // Geri çağırımı ref'te tutuyoruz: her render'da yeni fonksiyon gelse de
  // dinleyiciler yeniden kurulmasın.
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReduced) {
      element.style.setProperty("--progress", "1");
      onProgressRef.current?.(1);
      return;
    }
    if (!enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [prefersReduced, rootMargin, enabled]);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReduced || !inView || !enabled) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress =
        mode === "sticky"
          ? stickyProgress(rect.top, rect.height, viewport)
          : passProgress(rect.top, rect.height, viewport);
      element.style.setProperty("--progress", progress.toFixed(4));
      onProgressRef.current?.(progress);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [inView, prefersReduced, mode, enabled]);

  return { ref, motion: prefersReduced ? "static" : "scroll" };
}
