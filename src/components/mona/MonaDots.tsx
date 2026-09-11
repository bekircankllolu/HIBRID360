"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createCreature, creatureFrame, stepCreature } from "@/lib/mona-creature";
import { createParticleCloud, projectFrontDots } from "@/lib/mona-dots-geometry";
import {
  createMonaDotsScene,
  monaDotsLayout,
  NEUTRAL_FRAME,
  type MonaDotsFrame,
  type MonaDotsGhost,
  type MonaDotsScene,
  type Rgb,
} from "@/lib/mona-dots-scene";
import { acquireSceneLock, onSceneLockReleased, releaseSceneLock } from "@/lib/webgl-scene";
import styles from "./Mona.module.css";

type DotsMode = "pending" | "webgl" | "static" | "fallback";
type Flag = "running" | "reacting" | "intro" | "mood" | "shape";

/** Noktaların ekran dışından gelip şekli kurma süresi. */
const INTRO_SECONDS = 2.8;
/** Mıknatıs, imleç kütlenin bu kadar yarıçap yakınına gelince devreye girer. */
const MAGNET_REACH = 1.7;
/** İzler: kaç kare önceki durumun, hangi alfa ile tekrar çizileceği. */
const TRAILS: readonly [number, number][] = [[3, 0.28], [6, 0.12]];
const HISTORY = 7;

/** Marka rengini token'dan okur — sahne kodunda hex tutulmaz. */
function tokenRgb(name: string): Rgb {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim().replace("#", "");
  const hex = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const int = Number.parseInt(hex, 16);
  if (Number.isNaN(int) || hex.length !== 6) return [1, 1, 1];
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
}

/**
 * MONA'nın yerini alan sarı parçacık varlığı.
 *
 * - Açılış: sahne ilk görünür olduğunda noktalar ekran dışından kalabalık
 *   akıntılar halinde gelip şekli kurar. Zaman yalnızca sahne çalışırken akar.
 * - Davranış `mona-creature.ts`'te: tıklanınca irkilir, 4 hızlı tıkta
 *   noktalar kaçar, 20 sn dokunulmazsa uyur, ara sıra göz/kalp/halka olur,
 *   biçimi sürekli rastgele değişir. Göz şeklinde gözbebeği imlece bakar.
 * - İmleç yaklaşınca noktalar mıknatıs gibi çekilir; konuşurken dalgalanır.
 * - CLAUDE.md: tek WebGL sahnesi kilidi, ekrandan çıkınca durur,
 *   prefers-reduced-motion'da tek statik kare. WebGL yoksa SVG yedeği.
 *
 * Test öznitelikleri: data-dots (webgl|static|fallback), data-intro
 * (pending|playing|done), data-running, data-reacting, data-mood
 * (awake|sleeping|scattered), data-shape (blob|eye|heart|ring) — her karede
 * değil, yalnızca değiştiklerinde yazılır.
 */
export function MonaDots({ hostRef, levelRef, typing, reducedMotion }: {
  hostRef: RefObject<HTMLElement | null>;
  levelRef: RefObject<number>;
  typing: boolean;
  reducedMotion: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef(typing);
  const [mode, setMode] = useState<DotsMode>("pending");

  useEffect(() => { typingRef.current = typing; }, [typing]);

  useEffect(() => {
    const root = rootRef.current;
    const host = hostRef.current;
    if (!root || !host) return;

    const setFlag = (name: Flag, value: boolean | string) => {
      const next = String(value);
      if (root.dataset[name] !== next) root.dataset[name] = next;
    };
    setFlag("running", false);
    setFlag("reacting", false);
    setFlag("intro", "pending");
    setFlag("mood", "awake");
    setFlag("shape", "blob");

    // Canvas her kurulumda yeniden oluşturulur: dispose() bağlamı
    // kaybettirdiği için aynı canvas'ta ikinci kurulum (Strict Mode'un çift
    // efekt çağrısı, reduced-motion değişimi) sessizce başarısız olurdu.
    const canvas = document.createElement("canvas");
    canvas.className = styles.canvas;
    canvas.setAttribute("aria-hidden", "true");
    root.appendChild(canvas);

    let scene: MonaDotsScene | null = null;
    try {
      scene = createMonaDotsScene(canvas, createParticleCloud(), {
        dot: tokenRgb("--color-brand-yellow"),
        background: tokenRgb("--color-brand-black"),
      });
    } catch (error) {
      console.error("MONA dots scene failed:", error);
    }
    if (!scene) {
      canvas.remove();
      setFlag("intro", "done");
      setMode("fallback");
      return;
    }
    const active = scene;

    if (reducedMotion) {
      setFlag("intro", "done");
      setMode("static");
      const still = () => { active.resize(); active.render(NEUTRAL_FRAME); };
      still();
      const resizeObserver = new ResizeObserver(still);
      resizeObserver.observe(canvas);
      return () => { resizeObserver.disconnect(); active.dispose(); canvas.remove(); };
    }
    setMode("webgl");

    const holder = Symbol("mona-dots");
    const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, strength: 0, target: 0 };
    // Parallax imleç sahnenin neresinde olursa olsun izler; mıknatıs yalnızca yakında.
    const parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const look = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const input = { pointerMoved: false, keyed: false, taps: [] as { x: number; y: number }[] };
    let creature = createCreature(Math.random);
    const history: MonaDotsFrame[] = [];
    let level = 0;
    // Açılış ve sahne zamanı yalnızca sahne çalışırken ilerler: açılış
    // ekran dışındayken tükenmez; uykuda sahne zamanı yavaşlar.
    let elapsed = 0;
    let sceneTime = 0;
    let lastFrame = 0;
    let frameId: number | null = null;
    let running = false;
    let inView = false;
    let holdsLock = false;
    let unsubscribeWait: (() => void) | null = null;

    /** İmlecin kütle merkezine uzaklığı, yarıçap cinsinden. */
    const fromCenter = (x: number, y: number) => {
      const width = canvas.clientWidth, height = canvas.clientHeight;
      const layout = monaDotsLayout(width, height);
      return {
        dx: ((x - layout.centerX) * width) / layout.radius,
        dy: ((y - layout.centerY) * height) / layout.radius,
      };
    };
    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.targetX = (event.clientX - rect.left) / rect.width;
      pointer.targetY = (event.clientY - rect.top) / rect.height;
      const { dx, dy } = fromCenter(pointer.targetX, pointer.targetY);
      const distance = Math.hypot(dx, dy);
      pointer.target = distance < MAGNET_REACH ? 1 : 0;
      parallax.targetX = pointer.targetX - 0.5;
      parallax.targetY = pointer.targetY - 0.5;
      look.targetX = distance > 1 ? dx / distance : dx;
      look.targetY = distance > 1 ? dy / distance : dy;
      input.pointerMoved = true;
    };
    const onDown = (event: PointerEvent) => {
      onMove(event);
      const { dx, dy } = fromCenter(pointer.targetX, pointer.targetY);
      if (Math.hypot(dx, dy) < 1.05) input.taps.push({ x: pointer.targetX, y: pointer.targetY });
    };
    const onLeave = () => {
      pointer.target = 0;
      parallax.targetX = parallax.targetY = 0;
      look.targetX = look.targetY = 0;
    };
    const onKey = () => { input.keyed = true; };

    const loop = () => {
      if (!running) return;
      const now = performance.now();
      const realDt = lastFrame ? (now - lastFrame) / 1000 : 0;
      lastFrame = now;
      const dt = Math.min(0.05, realDt);
      elapsed += dt;
      const intro = Math.min(1, elapsed / INTRO_SECONDS);
      setFlag("intro", intro < 1 ? "playing" : "done");

      const pulse = typingRef.current
        ? 0.28 + 0.22 * Math.abs(Math.sin(elapsed * 8.3) * Math.sin(elapsed * 3.1 + 1))
        : 0;
      level += (Math.max(levelRef.current ?? 0, pulse) - level) * 0.18;

      // Bekleme süresi gerçek zamanla sayılır; animasyonlar 50 ms ile sınırlı.
      creature = stepCreature(creature, { ...input, speaking: level }, realDt, Math.random);
      input.pointerMoved = false;
      input.keyed = false;
      input.taps = [];
      const mood = creatureFrame(creature);
      sceneTime += dt * mood.timeScale;

      pointer.x += (pointer.targetX - pointer.x) * 0.12;
      pointer.y += (pointer.targetY - pointer.y) * 0.12;
      pointer.strength += (pointer.target - pointer.strength) * 0.08;
      parallax.x += (parallax.targetX - parallax.x) * 0.04;
      parallax.y += (parallax.targetY - parallax.y) * 0.04;
      look.x += (look.targetX - look.x) * 0.1;
      look.y += (look.targetY - look.y) * 0.1;

      const frame: MonaDotsFrame = {
        time: sceneTime,
        intro,
        yaw: sceneTime * 0.12 + (pointer.x - 0.5) * 0.5 * pointer.strength + parallax.x * 0.25,
        pitch: 0.28 + (pointer.y - 0.5) * 0.3 * pointer.strength + parallax.y * 0.15,
        pointerX: pointer.x,
        pointerY: pointer.y,
        pointerStrength: pointer.strength,
        level,
        parallaxX: parallax.x,
        parallaxY: parallax.y,
        scale: mood.scale,
        dim: mood.dim,
        flash: mood.flash,
        scatter: mood.scatter,
        scatterOriginX: mood.scatterOrigin[0],
        scatterOriginY: mood.scatterOrigin[1],
        shapeEye: mood.shapeWeights[0],
        shapeHeart: mood.shapeWeights[1],
        shapeRing: mood.shapeWeights[2],
        lookX: look.x,
        lookY: look.y,
        blink: mood.blink,
        morph: mood.morph,
      };
      history.push(frame);
      if (history.length > HISTORY) history.shift();
      const trails = window.innerWidth <= 640 ? TRAILS.slice(0, 1) : TRAILS;
      const ghosts: MonaDotsGhost[] = [];
      for (const [lag, alpha] of trails) {
        const past = history[history.length - 1 - lag];
        if (past) ghosts.push({ frame: past, alpha });
      }
      active.render(frame, ghosts);

      setFlag("reacting", pointer.strength > 0.2 || level > 0.1);
      setFlag("mood", mood.mood);
      setFlag("shape", mood.shape);
      frameId = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      lastFrame = 0;
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      setFlag("running", false);
      if (holdsLock) { releaseSceneLock(holder); holdsLock = false; }
    };
    const startIfPossible = () => {
      if (!inView || running || document.hidden) return;
      if (!holdsLock) holdsLock = acquireSceneLock(holder);
      if (!holdsLock) {
        unsubscribeWait ??= onSceneLockReleased(() => { unsubscribeWait = null; startIfPossible(); });
        return;
      }
      running = true;
      setFlag("running", true);
      active.resize();
      loop();
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) startIfPossible();
      else { unsubscribeWait?.(); unsubscribeWait = null; stop(); }
    }, { threshold: 0.05 });
    observer.observe(host);
    const onVisibility = () => { if (document.hidden) stop(); else startIfPossible(); };
    document.addEventListener("visibilitychange", onVisibility);
    const resizeObserver = new ResizeObserver(() => active.resize());
    resizeObserver.observe(canvas);
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerdown", onDown, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    window.addEventListener("keydown", onKey);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("keydown", onKey);
      unsubscribeWait?.();
      stop();
      active.dispose();
      canvas.remove();
    };
  }, [hostRef, levelRef, reducedMotion]);

  return (
    <div ref={rootRef} className={styles.dots} data-dots={mode} aria-hidden="true">
      {mode === "fallback" && <DotsFallback />}
    </div>
  );
}

function DotsFallback() {
  const dots = useMemo(() => projectFrontDots(
    createParticleCloud({ shell: 2000, core: 600, halo: 0, dust: 0, haze: 0 }),
  ), []);
  return (
    <svg className={styles.dotsFallback} viewBox="-1.05 -1.05 2.1 2.1" data-testid="mona-dots-fallback">
      {dots.map((dot, index) => (
        <circle key={index} cx={dot.x.toFixed(3)} cy={(-dot.y).toFixed(3)}
          r={(0.006 + 0.006 * dot.depth).toFixed(4)} opacity={(0.25 + 0.75 * dot.depth).toFixed(2)} />
      ))}
    </svg>
  );
}
