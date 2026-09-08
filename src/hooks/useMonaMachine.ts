"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/routing";
import { openingLine, easterEggLine, type MonaLine } from "@/data/mona";

export type MonaState = "opening" | "speaking" | "paused" | "idle";

export function useMonaMachine({ locale, reducedMotion }: { locale: Locale; reducedMotion: boolean }) {
  const [state, setState] = useState<MonaState>("opening");
  const [activeLine, setActiveLine] = useState<MonaLine>(openingLine);
  const [visibleText, setVisibleText] = useState("");
  const [muted, setMuted] = useState(true);
  const [requestId, setRequestId] = useState(0);
  const headTaps = useRef({ count: 0, at: 0 });

  useEffect(() => {
    const text = activeLine.text[locale];
    if (reducedMotion) { setVisibleText(text); return; }
    setVisibleText("");
    let index = 0;
    const timer = setInterval(() => {
      index += 3;
      setVisibleText(text.slice(0, index));
      if (index >= text.length) clearInterval(timer);
    }, 28);
    return () => clearInterval(timer);
  }, [activeLine, locale, reducedMotion, requestId]);

  const speak = useCallback((line: MonaLine) => {
    setActiveLine(line);
    setRequestId(value => value + 1);
    setState("speaking");
  }, []);
  const silence = useCallback(() => setState(current => current === "speaking" ? "paused" : current), []);
  const complete = useCallback(() => setState(current => current === "speaking" ? "idle" : current), []);
  const setSectionVisible = useCallback((visible: boolean) => { if (!visible) silence(); }, [silence]);
  const toggleMuted = useCallback(() => setMuted(value => !value), []);
  const registerHeadTap = useCallback(() => {
    const now = Date.now();
    headTaps.current.count = now - headTaps.current.at < 1500 ? headTaps.current.count + 1 : 1;
    headTaps.current.at = now;
    if (headTaps.current.count === 3) { headTaps.current.count = 0; speak(easterEggLine); }
  }, [speak]);

  return { state, activeLine, visibleText, muted, setMuted, toggleMuted, requestId, speak, silence, complete, registerHeadTap, setSectionVisible };
}
