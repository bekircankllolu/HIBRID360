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
 *
 * Müşteri incelemesi sonrası (Faz 1):
 * - Seviye: ambiyans −30 LUFS'tan ≈ −22 LUFS'a çıkarıldı (kısıklık "ses çalışmadı"
 *   izlenimi veriyordu); çıkışta hafif sınırlayıcı taşmayı önler.
 * - Geri bildirim: açılırken kısa onay sesi; ses desteklenmiyorsa durum
 *   `unavailable` (kalıcı), dosyalar inemediyse `error` (geçici: düğme "tekrar
 *   dene" der, bir sonraki dokunuş yeniden dener). İkisi de sessizce yutulmaz.
 * - iPhone: Web Audio sessiz anahtara uyar → Ses Oturumu API'si ya da sessiz
 *   `<audio>` ile "playback" kategorisine geçilir.
 * - Eski Safari: `webkitAudioContext` ve geri çağrımlı `decodeAudioData`.
 */

const BASE = "/audio/ecosystem";

const SOUNDS = {
  ambient: { src: `${BASE}/ambient-loop.mp3`, volume: 0.8 },
  hover: { src: `${BASE}/hover.mp3`, volume: 0.75 },
  fly: { src: `${BASE}/fly-in.mp3`, volume: 0.6 },
  close: { src: `${BASE}/fly-out.mp3`, volume: 0.7 },
} as const;

type SoundName = keyof typeof SOUNDS;

export type EcosystemSoundStatus = "off" | "loading" | "on" | "error" | "unavailable";

/** Aynı küre üstünde hızlı titreşen imleç tık yağmuruna dönmesin. */
const HOVER_GAP_MS = 140;

/** 0,25 sn sessiz 8-bit WAV: iOS'ta ses oturumunu "playback"e almak için. */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";

interface AmbientNodes {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

type AudioContextCtor = typeof AudioContext;

function audioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    // iPadOS masaüstü sınıfı kimlik bildirir.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** Eski Safari (<14.1) `decodeAudioData`'da yalnız geri çağrım destekler. */
function decode(context: AudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const result = context.decodeAudioData(data, resolve, reject);
    // Modern tarayıcılar ayrıca Promise döndürür; ikisini birden dinlemek zararsız.
    if (result && typeof result.then === "function") result.then(resolve, reject);
  });
}

export function useEcosystemSound() {
  const [status, setStatus] = useState<EcosystemSoundStatus>("off");
  const enabledRef = useRef(false);
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const buffersRef = useRef<Partial<Record<SoundName, AudioBuffer>>>({});
  const loadingRef = useRef<Promise<void> | null>(null);
  const ambientRef = useRef<AmbientNodes | null>(null);
  const lastHoverRef = useRef(0);
  const stopTimersRef = useRef<Set<number>>(new Set());
  const silentRef = useRef<HTMLAudioElement | null>(null);

  // Ses hiç desteklenmiyorsa (çok eski tarayıcı, kilitli mod) düğme bunu göstersin.
  useEffect(() => {
    if (!audioContextCtor()) setStatus("unavailable");
  }, []);

  /**
   * Henüz inmemiş sesleri indirir. Söz YALNIZ devam eden yükleme sırasında
   * paylaşılır (hızlı aç-kapa-aç çift indirme yapmasın); bitince temizlenir,
   * böylece zayıf bağlantıda kopan bir indirme oturum boyunca sesi öldürmez —
   * bir sonraki dokunuş eksik olanları yeniden dener.
   */
  const load = useCallback((context: AudioContext): Promise<void> => {
    if (loadingRef.current) return loadingRef.current;
    const missing = (Object.keys(SOUNDS) as SoundName[]).filter((name) => !buffersRef.current[name]);
    const pending = Promise.all(
      missing.map(async (name) => {
        try {
          const response = await fetch(SOUNDS[name].src);
          if (!response.ok) return;
          const data = await response.arrayBuffer();
          buffersRef.current[name] = await decode(context, data);
        } catch {
          // Bir ses inmezse sahne sessiz o eylemle çalışmaya devam eder.
        }
      }),
    )
      .then(() => undefined)
      .finally(() => {
        loadingRef.current = null;
      });
    loadingRef.current = pending;
    return pending;
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

  const play = useCallback((name: Exclude<SoundName, "ambient">, volume?: number) => {
    const context = contextRef.current;
    const master = masterRef.current;
    const buffer = buffersRef.current[name];
    if (!enabledRef.current || !context || !master || !buffer) return;
    if (context.state !== "running") return;
    const source = context.createBufferSource();
    source.buffer = buffer;
    const gain = context.createGain();
    gain.gain.value = volume ?? SOUNDS[name].volume;
    source.connect(gain).connect(master);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
    source.start();
  }, []);

  const stopSilent = useCallback(() => {
    const element = silentRef.current;
    silentRef.current = null;
    if (element) {
      element.pause();
      element.removeAttribute("src");
      element.load();
    }
  }, []);

  /**
   * Sesi kapatıp nedeni bildirir. `unavailable`: tarayıcı Web Audio'yu hiç
   * sunmuyor / bağlam kurulamadı (kalıcı, düğme devre dışı). `error`: dosyalar
   * inmedi ya da çözülemedi (geçici, düğme tekrar denemeye izin verir).
   */
  const fail = useCallback(
    (reason: "unavailable" | "error" = "unavailable") => {
      enabledRef.current = false;
      stopAmbient();
      stopSilent();
      setStatus(reason);
    },
    [stopAmbient, stopSilent],
  );

  /** Ses düğmesi: bu çağrı bir tıklama olayının İÇİNDEN yapılmalı. */
  const toggle = useCallback(() => {
    if (status === "unavailable") return;
    if (enabledRef.current) {
      enabledRef.current = false;
      setStatus("off");
      stopAmbient();
      stopSilent();
      return;
    }
    const Ctor = audioContextCtor();
    if (!Ctor) {
      fail();
      return;
    }
    try {
      if (!contextRef.current) {
        const context = new Ctor();
        const master = context.createGain();
        master.gain.value = 1;
        // Hafif sınırlayıcı: ambiyans + efektler üst üste bindiğinde taşmasın.
        const limiter = context.createDynamicsCompressor();
        limiter.threshold.value = -10;
        limiter.knee.value = 8;
        limiter.ratio.value = 6;
        limiter.attack.value = 0.003;
        limiter.release.value = 0.25;
        master.connect(limiter).connect(context.destination);
        contextRef.current = context;
        masterRef.current = master;
      }
      const context = contextRef.current;
      enabledRef.current = true;
      setStatus("loading");

      // iPhone: sessiz anahtar Web Audio'yu susturur → "playback" oturumu.
      try {
        const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
        if (session) session.type = "playback";
        else if (isIOS() && !silentRef.current) {
          const element = new Audio(SILENT_WAV);
          element.loop = true;
          silentRef.current = element;
          void element.play().catch(() => undefined);
        }
      } catch {
        // Oturum ayarı desteklenmiyorsa Web Audio yine de çalışır (anahtar açıksa).
      }

      // Safari, ses grafiğini ancak kullanıcı hareketi içinde başlatılan bir
      // kaynakla açıyor: 1 örneklik sessiz tampon.
      try {
        const unlock = context.createBufferSource();
        unlock.buffer = context.createBuffer(1, 1, 22050);
        unlock.connect(context.destination);
        unlock.start(0);
      } catch {
        // Kritik değil.
      }

      void context
        .resume()
        .then(() => load(context))
        .then(() => {
          if (!enabledRef.current) return;
          if (Object.keys(buffersRef.current).length === 0) {
            fail("error"); // hiçbir ses inip çözülemedi: geçici, tekrar denenebilir
            return;
          }
          setStatus("on");
          startAmbient();
          // Açılış onayı: kullanıcı sesin geldiğini duysun.
          play("hover", 0.9);
        })
        .catch(() => fail("error"));
    } catch {
      fail();
    }
  }, [status, load, startAmbient, stopAmbient, stopSilent, play, fail]);

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
    silentRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    const context = contextRef.current;
    // Safari, arama/kilit sonrası "interrupted" durumuna geçebilir.
    if (
      enabledRef.current &&
      context &&
      context.state !== "running" &&
      context.state !== "closed"
    ) {
      void context.resume().catch(() => undefined);
    }
    if (enabledRef.current) void silentRef.current?.play().catch(() => undefined);
  }, []);

  useEffect(
    () => () => {
      enabledRef.current = false;
      stopAmbient();
      stopSilent();
      // Kapanıştan sonra tetiklenen kaynak temizliği kapalı bağlamı yakalamasın.
      for (const timer of stopTimersRef.current) window.clearTimeout(timer);
      stopTimersRef.current.clear();
      const context = contextRef.current;
      contextRef.current = null;
      masterRef.current = null;
      if (context) void context.close().catch(() => undefined);
    },
    [stopAmbient, stopSilent],
  );

  return {
    /** Düğme basılı mı (yükleniyor dahil). */
    enabled: status === "on" || status === "loading",
    status,
    toggle,
    hover,
    fly,
    close,
    pause,
    resume,
  };
}
