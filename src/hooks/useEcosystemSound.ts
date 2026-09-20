"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Ekosistem sahnesinin sesi (20 Eylül 2026).
 *
 * Proje sözleşmesi: otomatik başlayan ses YASAK, istisna yok. Bu yüzden:
 * - Ses varsayılan olarak KAPALI; AudioContext yalnız ziyaretçinin ses
 *   düğmesine tıklamasıyla (kullanıcı hareketi içinde) kurulur.
 * - Ses dosyaları YALNIZ ses açılınca iniyor: sesi hiç açmayan ziyaretçi
 *   bayt ödemiyor (performans bütçesi).
 * - Sahne görünür alandan çıkınca ya da sekme gizlenince `pause()`.
 *
 * Sesler: ambiyans (kesintisiz döngü), hover tıkı, uçuş ve kapanış whoosh'u.
 */

const BASE = "/audio/ecosystem";

const SOUNDS = {
  ambient: { src: `${BASE}/ambient-loop.mp3`, volume: 0.32 },
  hover: { src: `${BASE}/hover.mp3`, volume: 0.5 },
  fly: { src: `${BASE}/fly-in.mp3`, volume: 0.55 },
  close: { src: `${BASE}/fly-out.mp3`, volume: 0.45 },
} as const;

type SoundName = keyof typeof SOUNDS;

/** Aynı küre üstünde hızlı titreşen imleç tık yağmuruna dönmesin. */
const HOVER_GAP_MS = 140;

interface AmbientNodes {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

export function useEcosystemSound() {
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const buffersRef = useRef<Partial<Record<SoundName, AudioBuffer>>>({});
  const loadingRef = useRef<Promise<void> | null>(null);
  const ambientRef = useRef<AmbientNodes | null>(null);
  const lastHoverRef = useRef(0);
  const stopTimersRef = useRef<Set<number>>(new Set());

  const load = useCallback((context: AudioContext): Promise<void> => {
    loadingRef.current ??= Promise.all(
      (Object.keys(SOUNDS) as SoundName[]).map(async (name) => {
        try {
          const response = await fetch(SOUNDS[name].src);
          if (!response.ok) return;
          const data = await response.arrayBuffer();
          buffersRef.current[name] = await context.decodeAudioData(data);
        } catch {
          // Bir ses inmezse sahne sessiz o eylemle çalışmaya devam eder.
        }
      }),
    ).then(() => undefined);
    return loadingRef.current;
  }, []);

  const startAmbient = useCallback(() => {
    const context = contextRef.current;
    const master = masterRef.current;
    const buffer = buffersRef.current.ambient;
    if (!context || !master || !buffer || ambientRef.current || !enabledRef.current) return;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = context.createGain();
    gain.gain.value = 0;
    source.connect(gain).connect(master);
    source.start();
    gain.gain.setTargetAtTime(SOUNDS.ambient.volume, context.currentTime, 0.9);
    ambientRef.current = { source, gain };
  }, []);

  const stopAmbient = useCallback(() => {
    const context = contextRef.current;
    const ambient = ambientRef.current;
    if (!context || !ambient) return;
    ambientRef.current = null;
    ambient.gain.gain.setTargetAtTime(0, context.currentTime, 0.25);
    const timer = window.setTimeout(() => {
      stopTimersRef.current.delete(timer);
      try {
        ambient.source.stop();
        ambient.source.disconnect();
        ambient.gain.disconnect();
      } catch {
        // Zaten durmuş / bağlantısı kopmuş olabilir.
      }
    }, 1200);
    stopTimersRef.current.add(timer);
  }, []);

  const play = useCallback((name: Exclude<SoundName, "ambient">) => {
    const context = contextRef.current;
    const master = masterRef.current;
    const buffer = buffersRef.current[name];
    if (!enabledRef.current || !context || !master || !buffer) return;
    if (context.state !== "running") return;
    const source = context.createBufferSource();
    source.buffer = buffer;
    const gain = context.createGain();
    gain.gain.value = SOUNDS[name].volume;
    source.connect(gain).connect(master);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
    source.start();
  }, []);

  /** Ses düğmesi: bu çağrı bir tıklama olayının İÇİNDEN yapılmalı. */
  const toggle = useCallback(() => {
    if (enabledRef.current) {
      enabledRef.current = false;
      setEnabled(false);
      stopAmbient();
      return;
    }
    try {
      if (!contextRef.current) {
        const context = new AudioContext();
        const master = context.createGain();
        master.gain.value = 1;
        master.connect(context.destination);
        contextRef.current = context;
        masterRef.current = master;
      }
      const context = contextRef.current;
      enabledRef.current = true;
      setEnabled(true);
      void context
        .resume()
        .then(() => load(context))
        .then(() => startAmbient())
        .catch(() => undefined);
    } catch {
      enabledRef.current = false;
      setEnabled(false);
    }
  }, [load, startAmbient, stopAmbient]);

  const hover = useCallback(() => {
    const now = performance.now();
    if (now - lastHoverRef.current < HOVER_GAP_MS) return;
    lastHoverRef.current = now;
    play("hover");
  }, [play]);

  const fly = useCallback(() => play("fly"), [play]);
  const close = useCallback(() => play("close"), [play]);

  /** Sahne görünür alandan çıkınca / sekme gizlenince tüm ses durur. */
  const pause = useCallback(() => {
    const context = contextRef.current;
    if (context && context.state === "running") void context.suspend().catch(() => undefined);
  }, []);

  const resume = useCallback(() => {
    const context = contextRef.current;
    if (enabledRef.current && context && context.state === "suspended") {
      void context.resume().catch(() => undefined);
    }
  }, []);

  useEffect(
    () => () => {
      enabledRef.current = false;
      stopAmbient();
      // Kapanıştan sonra tetiklenen kaynak temizliği kapalı bağlamı yakalamasın.
      for (const timer of stopTimersRef.current) window.clearTimeout(timer);
      stopTimersRef.current.clear();
      const context = contextRef.current;
      contextRef.current = null;
      masterRef.current = null;
      if (context) void context.close().catch(() => undefined);
    },
    [stopAmbient],
  );

  return { enabled, toggle, hover, fly, close, pause, resume };
}
