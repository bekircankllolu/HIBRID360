"use client";

import { useEffect, useState } from "react";
import { scrambleReveal } from "@/lib/scramble-text";

/**
 * Bir kelimeyi karıştırılmış halinden gerçek metnine "çözer" — sayfa
 * yüklendiğinde tek seferlik giriş efekti (kullanıcının verdiği referans
 * bileşenin scramble mantığı, bkz. CreativeTitle.tsx, DECISIONS #49).
 *
 * İlk render (sunucu ve hidrasyon öncesi) her zaman gerçek `word`'ü
 * döndürür — hidrasyon uyuşmazlığı olmaz, JS gelmeden/yavaşsa metin zaten
 * doğru. Animasyon yalnızca mount SONRASI (`useEffect`) ve `active` true
 * ise başlar; `active=false` (ör. prefers-reduced-motion) render hiç
 * değişmez. Süre dolunca değer tam olarak `word`'e sabitlenir — kayan
 * noktalı `progress>=1` karşılaştırmasına güvenmez.
 */
export function useScrambleReveal(
  word: string,
  { active, delayMs = 0, durationMs = 800 }: { active: boolean; delayMs?: number; durationMs?: number },
): string {
  const [display, setDisplay] = useState(word);

  useEffect(() => {
    setDisplay(word);
    if (!active) return;

    let frame = 0;
    const start = () => {
      const started = performance.now();
      const tick = (now: number) => {
        const elapsed = now - started;
        if (elapsed >= durationMs) {
          setDisplay(word);
          return;
        }
        setDisplay(scrambleReveal(word, elapsed / durationMs, Math.random));
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const timeout = setTimeout(start, delayMs);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [word, active, delayMs, durationMs]);

  return display;
}
