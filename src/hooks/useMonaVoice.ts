"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MonaLine } from "@/data/mona";
import type { Locale } from "@/i18n/routing";

type Cue = { start: number; end: number; text: string };

export function useMonaVoice({ line, locale, enabled, requestId, onEnd }: {
  line: MonaLine; locale: Locale; enabled: boolean; requestId: number; onEnd: () => void;
}) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const context = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const levelRef = useRef(0);
  const [speaking, setSpeaking] = useState(false);
  const [caption, setCaption] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  // Create the audio graph only from an explicit visitor gesture.
  const unlock = useCallback(() => {
    if (!audio.current) { audio.current = new Audio(); audio.current.preload = "none"; }
    try {
      if (!context.current) {
        context.current = new AudioContext();
        analyser.current = context.current.createAnalyser();
        analyser.current.fftSize = 256;
        context.current.createMediaElementSource(audio.current).connect(analyser.current);
        analyser.current.connect(context.current.destination);
      }
      void context.current.resume().catch(() => undefined);
    } catch { /* Playback still works without waveform analysis. */ }
  }, []);

  useEffect(() => {
    let disposed = false;
    let frame = 0;
    let utterance: SpeechSynthesisUtterance | null = null;
    let fallbackStarted = false;
    const controller = new AbortController();
    const player = audio.current;
    player?.pause();
    setSpeaking(false); setCaption(""); setUnavailable(false); levelRef.current = 0;
    if (!enabled) return;
    const done = () => {
      if (disposed) return;
      setSpeaking(false); levelRef.current = 0; onEnd();
    };
    const fallback = () => {
      if (disposed || fallbackStarted) return;
      fallbackStarted = true;
      player?.pause();
      if (!("speechSynthesis" in window)) { setUnavailable(true); done(); return; }
      utterance = new SpeechSynthesisUtterance(line.text[locale]);
      utterance.lang = locale === "tr" ? "tr-TR" : "en-US";
      utterance.rate = 0.96;
      const voices = window.speechSynthesis.getVoices().filter(voice => voice.lang.startsWith(locale));
      const voice = voices.find(voice => /Emel|Jenny|Samantha|Aria|Seda|Yelda/i.test(voice.name)) ?? voices[0];
      if (voice) utterance.voice = voice;
      utterance.onstart = () => { if (!disposed) { setSpeaking(true); levelRef.current = 0.45; } };
      utterance.onend = done;
      utterance.onerror = () => { if (!disposed) { setUnavailable(true); done(); } };
      window.speechSynthesis.speak(utterance);
    };
    const src = line.audioSrc[locale];
    if (src && player) {
      let cues: Cue[] = [];
      let lastCaption = "";
      void fetch(src.replace(/\.mp3$/, ".json"), { signal: controller.signal })
        .then(response => response.ok ? response.json() : [])
        .then(value => { cues = value; }).catch(() => undefined);
      const samples = new Uint8Array(128);
      const tick = () => {
        if (disposed) return;
        analyser.current?.getByteTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) sum += Math.pow((sample - 128) / 128, 2);
        levelRef.current = analyser.current ? Math.min(1, Math.sqrt(sum / samples.length) * 5) : 0.4;
        const current = cues.find(cue => player.currentTime >= cue.start && player.currentTime <= cue.end)?.text ?? lastCaption;
        if (current !== lastCaption) { lastCaption = current; setCaption(current); }
        frame = requestAnimationFrame(tick);
      };
      player.src = src;
      player.onplaying = () => { if (!disposed) { setSpeaking(true); cancelAnimationFrame(frame); tick(); } };
      player.onended = done;
      player.onerror = fallback;
      void player.play().catch((error: unknown) => {
        if (disposed || fallbackStarted) return;
        if (error instanceof DOMException && error.name === "NotSupportedError") { fallback(); return; }
        setUnavailable(true); done();
      });
    } else fallback();
    return () => {
      disposed = true; controller.abort(); cancelAnimationFrame(frame); levelRef.current = 0;
      if (player) { player.pause(); player.onplaying = null; player.onended = null; player.onerror = null; }
      if (utterance) {
        utterance.onstart = null; utterance.onend = null; utterance.onerror = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [line, locale, enabled, requestId, onEnd]);

  useEffect(() => () => { audio.current?.pause(); void context.current?.close().catch(() => undefined); }, []);
  return { unlock, speaking, caption, levelRef, unavailable };
}
