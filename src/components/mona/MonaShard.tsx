"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { createCreature, creatureFrame, stepCreature } from "@/lib/mona-creature";
import { createParticleCloud } from "@/lib/mona-dots-geometry";
import {
  createMonaDotsScene,
  monaShardLayoutFor,
  NEUTRAL_FRAME,
  SHARD_BLEED,
  tokenRgb,
  type MonaDotsFrame,
  type MonaDotsGhost,
  type MonaDotsScene,
} from "@/lib/mona-dots-scene";
import { createLotus, LOTUS_OFFSET, lotusTargets, lotusWeight, stepLotus } from "@/lib/mona-lotus";
import { LOTUS_DENSITY } from "@/lib/mona-lotus-density";
import { serviceShapeTargets, type MonaServiceShape } from "@/lib/mona-service-shapes";
import { acquireSceneLock, onSceneLockReleased, releaseSceneLock } from "@/lib/webgl-scene";
import styles from "./MonaShard.module.css";

/**
 * Bir parça MONA — sayfa köşesine yerleşen, MONA'nın gerçek küresinin bir
 * kısmı (docs/DECISIONS.md #43, üçüncü geri bildirim turu: "sayfaların
 * hepsinde mona'nın bir kısmını görelim... yine aynı monodaki mekanikler
 * geçerli").
 *
 * Yeni icat edilmiş bir şekil DEĞİL — `MonaDots.tsx` ile birebir aynı motor
 * (`createParticleCloud`, `createMonaDotsScene`, `mona-creature.ts`'in
 * yaşayan varlık durum makinesi, sahne kilidi). Tek fark `monaShardLayout`:
 * kürenin gerçek merkezi kabın köşesinin hemen dışına düşer, böylece
 * noktaların bir kısmı görünür kalır ("MONA'nın yarısını görücez").
 *
 * 13 Eylül 2026, beşinci geri bildirim turu (DECISIONS #47): "bu sayfadaki
 * mona, mona sayfasındaki monadan farklı bir mona olacak. görünüm ve
 * animasyon aynı olacak ama sürekli şekil değiştirmeyecek" — göz/kalp/halka
 * biçim döngüsü bilerek bastırıldı (`shapeEye/Heart/Ring` hep 0), MONA
 * burada her zaman organik blob formunda kalıyor. Canvas hero'nun tamamını
 * kaplıyor, küre sağ-alt kenarda (`monaShardLayout`) — açılışta noktalar
 * hero'nun kenarlarından uçup geliyor, MONA sayfasındaki gibi; kutu kenarı
 * yok, "maske" hissi yok.
 *
 * Altıncı tur (DECISIONS #48):
 * - Canvas hero'nun ALTINA uzar (`SHARD_BLEED`): küre hero'nun alt
 *   kenarından taşıyor, sayfa kayınca düz bir çizgiyle kesilmesin.
 * - Küre %10 küçük (`monaShardLayout`).
 * - "Arada bir bu şekli alsın": MONA ara sıra nilüfere dönüşür
 *   (`mona-lotus.ts` programı). Çiçek anında bütün kütle sola ve biraz
 *   yukarı kayar (`LOTUS_OFFSET`) ki çiçek sayfa kenarında yarım kalmasın.
 *   Çiçek MONA'yı uyandırır: uyurken açma zamanı gelirse önce uyanır.
 *
 * Sohbete özel girdiler (yazma nabzı, ses seviyesi, dış "sahne" elemanı)
 * yok: `speaking` her zaman 0. Kap `pointer-events:none` (metinlerin
 * altında) — imleç/tık `window` üzerinden izlenip canvas'a çevrilir.
 * Geri kalan her şey — açılışta ekran dışından gelme, irkilme, uyku,
 * kaçış, imleç mıknatısı — MONA'nın kendisiyle aynı.
 *
 * CLAUDE.md: tek WebGL sahnesi kilidi (`acquireSceneLock`), ekrandan
 * çıkınca durur, prefers-reduced-motion'da tek statik kare. WebGL yoksa
 * (dekoratif bir eleman için) sessizce render edilmez — MONA'nın kendi
 * sayfasındaki SVG yedeği burada gerekli değil.
 */

const INTRO_SECONDS = 2.8;
const MAGNET_REACH = 1.7;
const TRAILS: readonly [number, number][] = [[3, 0.28], [6, 0.12]];
const HISTORY = 7;

type Mode = "pending" | "webgl" | "static" | "none";

export function MonaShard({
  shape = "lotus",
  side = "right",
}: {
  shape?: MonaServiceShape;
  side?: "left" | "right";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("pending");
  const [desktop, setDesktop] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const query = window.matchMedia("(min-width: 900px)");
    const sync = () => setDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!desktop) {
      setMode("none");
      return;
    }
    const root = rootRef.current;
    if (!root) return;

    const canvas = document.createElement("canvas");
    canvas.className = styles.canvas;
    canvas.setAttribute("aria-hidden", "true");
    root.appendChild(canvas);

    let scene: MonaDotsScene | null = null;
    try {
      // MONA'nın kendi bulutu (varsayılan ~19.000 nokta) — "görünüm olarak
      // aynı olacak". Nokta boyutu yarıçapla ölçeklendiği için (bkz.
      // mona-dots-scene.ts `u_pointSize`) aynı bulut büyük yarıçapta da
      // MONA sayfasıyla aynı yoğunlukta görünüyor. Nilüfer hedefleri
      // buluta yalnız burada eklenir.
      const cloud = createParticleCloud({
        shell: 9900,
        core: 3600,
        halo: 2250,
        dust: 720,
        haze: 630,
      });
      scene = createMonaDotsScene(
        canvas,
        {
          ...cloud,
          lotus:
            shape === "lotus"
              ? lotusTargets(cloud, LOTUS_DENSITY)
              : serviceShapeTargets(cloud, shape),
        },
        { dot: tokenRgb("--color-brand-yellow"), background: tokenRgb("--color-brand-black") },
        monaShardLayoutFor(side),
      );
    } catch (error) {
      console.error("MonaShard scene failed:", error);
    }
    if (!scene) {
      canvas.remove();
      setMode("none");
      return;
    }
    const active = scene;

    if (reducedMotion) {
      setMode("static");
      const still = () => { active.resize(); active.render(NEUTRAL_FRAME); };
      still();
      const resizeObserver = new ResizeObserver(still);
      resizeObserver.observe(canvas);
      return () => { resizeObserver.disconnect(); active.dispose(); canvas.remove(); };
    }
    setMode("webgl");

    const holder = Symbol("mona-shard");
    const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, strength: 0, target: 0 };
    const parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const look = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const input = { pointerMoved: false, keyed: false, taps: [] as { x: number; y: number }[] };
    let creature = createCreature(Math.random);
    let lotus = createLotus(Math.random);
    /** Kütlenin anlık kayması (model birimi) — imleç mıknatısı da kayan merkeze göre ölçer. */
    const shift = { x: 0, y: 0 };
    let lotusPhase = "";
    const history: MonaDotsFrame[] = [];
    let elapsed = 0;
    let sceneTime = 0;
    let lastFrame = 0;
    let frameId: number | null = null;
    let running = false;
    let inView = false;
    let holdsLock = false;
    let unsubscribeWait: (() => void) | null = null;

    const fromCenter = (x: number, y: number) => {
      const width = canvas.clientWidth, height = canvas.clientHeight;
      const layout = monaShardLayoutFor(side)(width, height);
      return {
        dx: ((x - layout.centerX) * width) / layout.radius - shift.x,
        dy: ((y - layout.centerY) * height) / layout.radius + shift.y,
      };
    };
    const onLeave = () => {
      pointer.target = 0;
      parallax.targetX = parallax.targetY = 0;
      look.targetX = look.targetY = 0;
    };
    // Kap `pointer-events:none` (metinlerin altında, hero'nun tamamında) —
    // imleç `window`'dan izlenir, canvas'ın dışındaysa "ayrıldı" sayılır.
    const local = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      return x >= 0 && x <= 1 && y >= 0 && y <= 1 ? { x, y } : null;
    };
    const onMove = (event: PointerEvent) => {
      const point = local(event);
      if (!point) {
        onLeave();
        return;
      }
      pointer.targetX = point.x;
      pointer.targetY = point.y;
      const { dx, dy } = fromCenter(point.x, point.y);
      const distance = Math.hypot(dx, dy);
      pointer.target = distance < MAGNET_REACH ? 1 : 0;
      parallax.targetX = point.x - 0.5;
      parallax.targetY = point.y - 0.5;
      look.targetX = distance > 1 ? dx / distance : dx;
      look.targetY = distance > 1 ? dy / distance : dy;
      input.pointerMoved = true;
    };
    const onDown = (event: PointerEvent) => {
      const point = local(event);
      if (!point) return;
      onMove(event);
      const { dx, dy } = fromCenter(point.x, point.y);
      if (Math.hypot(dx, dy) < 1.05) input.taps.push({ x: point.x, y: point.y });
    };

    const loop = () => {
      if (!running) return;
      const now = performance.now();
      const realDt = lastFrame ? (now - lastFrame) / 1000 : 0;
      lastFrame = now;
      const dt = Math.min(0.05, realDt);
      elapsed += dt;
      const intro = Math.min(1, elapsed / INTRO_SECONDS);

      lotus = stepLotus(lotus, dt, Math.random);
      const bloom = lotusWeight(lotus);
      shift.x = (shape === "lotus" ? LOTUS_OFFSET.x : side === "right" ? -0.88 : 0.88) * bloom;
      shift.y = (shape === "lotus" ? LOTUS_OFFSET.y : 0.28) * bloom;
      const phase = bloom >= 1 ? "open" : bloom > 0 ? "moving" : "closed";
      if (phase !== lotusPhase) {
        lotusPhase = phase;
        root.dataset.morph = phase;
        if (shape === "lotus") root.dataset.lotus = phase;
      }

      // Çiçek MONA'nın kendi hareketi: açarken uyanır, açıkken uyumaz.
      creature = stepCreature(
        creature,
        { ...input, keyed: input.keyed || bloom > 0, speaking: 0 },
        realDt,
        Math.random,
      );
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
        level: 0,
        parallaxX: parallax.x,
        parallaxY: parallax.y,
        scale: mood.scale,
        dim: mood.dim,
        flash: mood.flash,
        scatter: mood.scatter,
        scatterOriginX: mood.scatterOrigin[0],
        scatterOriginY: mood.scatterOrigin[1],
        // Bilerek 0 — bu MONA "farklı" (DECISIONS #47): görünüm ve hareket
        // MONA'nın kendisiyle birebir aynı ama göz/kalp/halka döngüsüne hiç
        // girmiyor. `mood.shapeWeights` creature'ın içinde hâlâ hesaplanıyor
        // (zararsız, ucuz), yalnızca shader'a iletilmiyor. Tek şekli arada
        // bir açan nilüfer (#48).
        shapeEye: 0,
        shapeHeart: 0,
        shapeRing: 0,
        shapeLotus: bloom,
        shiftX: shift.x,
        shiftY: shift.y,
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
      frameId = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      lastFrame = 0;
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
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
      active.resize();
      loop();
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) startIfPossible();
      else { unsubscribeWait?.(); unsubscribeWait = null; stop(); }
    }, { threshold: 0.05 });
    observer.observe(root);
    const onVisibility = () => { if (document.hidden) stop(); else startIfPossible(); };
    document.addEventListener("visibilitychange", onVisibility);
    const resizeObserver = new ResizeObserver(() => active.resize());
    resizeObserver.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      unsubscribeWait?.();
      stop();
      active.dispose();
      canvas.remove();
      delete root.dataset.morph;
      delete root.dataset.lotus;
    };
  }, [desktop, reducedMotion, shape, side]);

  // Uzantı oranı tek kaynaktan: yerleşim (`monaShardLayout`) aynı sabiti kullanıyor.
  const bleed = { "--shard-bleed": SHARD_BLEED } as CSSProperties;
  return (
    <div
      ref={rootRef}
      className={styles.shard}
      style={bleed}
      data-dots={mode}
      data-shape={shape}
      data-side={side}
      aria-hidden="true"
    />
  );
}
