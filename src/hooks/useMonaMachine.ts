"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/routing";
import {
  openingLine,
  idleLines,
  returnLine,
  easterEggLine,
  type MonaLine,
} from "@/data/mona";

/**
 * MONA state machine — brief-rev12.md Bölüm 11.2 "Etkileşim kuralları".
 *
 * Durumlar:
 *   opening  — sayfa açıldı, açılış repliği yazılıyor, ses YOK
 *   speaking — kullanıcı bir soruya tıkladı; replik yazılıyor (+ ses varsa)
 *   paused   — kullanıcı scroll ile bölümden çıktı; MONA sustu, yazı kalıyor
 *   idle     — 30 sn hareketsizlik; boşta repliği yazılıyor, ses YOK
 *
 * Ses ve video varlıkları henüz yok (DECISIONS #8). Machine bu varlıklar
 * null iken de eksiksiz çalışır: replikler yazı olarak akar. Ses geldiğinde
 * yalnızca `audioSrc` doldurulacak, akış değişmeyecek.
 */

export type MonaState = "opening" | "speaking" | "paused" | "idle";

const IDLE_DELAY_MS = 30_000; // brief 11.2: 30 saniye hareketsizlik
const FADE_OUT_MS = 400; // brief 11.2: 0,4 saniyede fade out
const TYPE_SPEED_MS = 28; // karakter karakter yazım

export interface MonaMachine {
  state: MonaState;
  /** Ekranda o an görünen (yazılmakta olan) metin. */
  visibleText: string;
  /** O an gösterilen repliğin tamamı — altyazı/SEO için. */
  activeLine: MonaLine | null;
  /** Kullanıcı sesi kapattı mı. Varsayılan: sessiz (otomatik ses YASAK). */
  muted: boolean;
  toggleMuted: () => void;
  /** Bir soruya tıklandığında çağrılır. */
  speak: (line: MonaLine) => void;
  /** Esc veya scroll ile susturma — brief 11.2. */
  silence: () => void;
  /** MONA'nın kafasına tıklama (3 kez = easter egg). */
  registerHeadTap: () => void;
  /** Bölüm görünürlüğü değişince çağrılır (IntersectionObserver'dan). */
  setSectionVisible: (visible: boolean) => void;
  /** Fade-out animasyonu sürüyor mu — CSS geçişi için. */
  fadingOut: boolean;
}

export function useMonaMachine({
  locale,
  reducedMotion,
}: {
  locale: Locale;
  reducedMotion: boolean;
}): MonaMachine {
  const [state, setState] = useState<MonaState>("opening");
  const [activeLine, setActiveLine] = useState<MonaLine | null>(openingLine);
  const [visibleText, setVisibleText] = useState("");
  const [muted, setMuted] = useState(true); // brief 11.6: otomatik ses YASAK
  const [fadingOut, setFadingOut] = useState(false);

  const idleIndexRef = useRef(0);
  const headTapsRef = useRef(0);
  const hasLeftRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fullText = useMemo(
    () => (activeLine ? activeLine.text[locale] : ""),
    [activeLine, locale],
  );

  // Daktilo efekti. prefers-reduced-motion açıkken metin tek seferde
  // görünür — CLAUDE.md gereği hareket devre dışı kalır ama içerik tam.
  useEffect(() => {
    if (!activeLine) {
      setVisibleText("");
      return;
    }
    if (reducedMotion) {
      setVisibleText(fullText);
      return;
    }

    setVisibleText("");
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setVisibleText(fullText.slice(0, index));
      if (index >= fullText.length) clearInterval(timer);
    }, TYPE_SPEED_MS);

    return () => clearInterval(timer);
  }, [activeLine, fullText, reducedMotion]);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  // 30 sn hareketsizlik → boşta repliği (sessiz, sırayla döner).
  const scheduleIdle = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      const line = idleLines[idleIndexRef.current % idleLines.length];
      idleIndexRef.current += 1;
      setActiveLine(line);
      setState("idle");
      scheduleIdle();
    }, IDLE_DELAY_MS);
  }, [clearIdleTimer]);

  useEffect(() => {
    scheduleIdle();
    return clearIdleTimer;
  }, [scheduleIdle, clearIdleTimer]);

  const speak = useCallback(
    (line: MonaLine) => {
      setFadingOut(false);
      setActiveLine(line);
      setState("speaking");
      scheduleIdle();
    },
    [scheduleIdle],
  );

  // brief 11.2: MONA susar — cümlenin sonunu beklemez, 0,4 sn fade out.
  // Yazı ekranda kalır.
  const silence = useCallback(() => {
    setState((current) => {
      if (current !== "speaking") return current;
      setFadingOut(true);
      setTimeout(() => setFadingOut(false), FADE_OUT_MS);
      return "paused";
    });
  }, []);

  const setSectionVisible = useCallback(
    (visible: boolean) => {
      if (!visible) {
        hasLeftRef.current = true;
        silence();
        return;
      }
      // brief 11.2: geri dönünce kaldığı yerden devam etmez; kısa bir
      // "geri dönüş" repliği söyler, sonra soru listesine döner.
      if (hasLeftRef.current) {
        hasLeftRef.current = false;
        setActiveLine(returnLine);
        setState("paused");
        scheduleIdle();
      }
    },
    [silence, scheduleIdle],
  );

  const registerHeadTap = useCallback(() => {
    headTapsRef.current += 1;
    if (headTapsRef.current >= 3) {
      headTapsRef.current = 0;
      speak(easterEggLine);
    }
  }, [speak]);

  const toggleMuted = useCallback(() => setMuted((value) => !value), []);

  return {
    state,
    visibleText,
    activeLine,
    muted,
    toggleMuted,
    speak,
    silence,
    registerHeadTap,
    setSectionVisible,
    fadingOut,
  };
}
