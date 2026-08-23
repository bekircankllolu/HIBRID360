"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  acquireSceneLock,
  releaseSceneLock,
  onSceneLockReleased,
} from "@/lib/webgl-scene";
import {
  createHibridWordmarkScene,
  type HibridSceneHandle,
} from "@/lib/hibrid-wordmark-scene";
import styles from "./HibridWebGL.module.css";

const MASK_URL = "/images/hibrid-wordmark.png";

/**
 * HIBRID sıvı tipografi — brief 4.1'in "harf içi dolgu + pırıltı +
 * elastik fare tepkisi + sürekli hareket" katmanlarının gerçek
 * uygulaması. Shader ve etkileşim matematiği müşteriden gelen referans
 * implementasyondan birebir korunmuştur (bkz.
 * src/lib/hibrid-wordmark-scene.ts).
 *
 * Katmanlama — LCP ve yedek aynı anda çözülüyor:
 *   1. Statik PNG (<img>) her zaman render edilir ve sayfanın LCP
 *      elemanıdır. 17KB, fetchPriority="high" — ilk boyama JS'i
 *      beklemez. Önceki SVG glif-path yaklaşımı da aynı LCP sorununu
 *      (web font indirmesini bekleyen ilk boyama) çözüyordu; maske
 *      görseli onun yerini alıyor.
 *   2. WebGL canvas üstüne biner ve maske dokusu hazır olunca açılır;
 *      o an PNG gizlenir (ikisi üst üste görünmez, kenar taşması olmaz).
 *   3. WebGL yoksa/başarısızsa veya prefers-reduced-motion açıksa canvas
 *      hiç kurulmaz — PNG görünür kalır, içerik eksilmez.
 *
 * CLAUDE.md kuralları:
 *   - "Aynı anda en fazla BİR WebGL sahnesi": kilit görünürlükle alınır
 *     ve bırakılır (ekrandan çıkınca serbest kalır), böylece aşağıdaki
 *     güneş sistemi sahnesi kendi sırası geldiğinde kilidi alabilir.
 *   - "Ekrandan çıkınca durur": IntersectionObserver rAF döngüsünü durdurur.
 *   - "prefers-reduced-motion zorunlu": hero animasyonu bu ayarda kapalı.
 */
export function HibridWebGL() {
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    // Hareket azaltma açıksa sahne hiç kurulmaz — statik PNG kalır.
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    let scene: HibridSceneHandle | null = null;
    let frameId: number | null = null;
    let visible = false;
    let holdsLock = false;
    const holder = Symbol("hibrid-wordmark");

    try {
      scene = createHibridWordmarkScene(canvas, MASK_URL, () => setLive(true));
    } catch (error) {
      console.error("HIBRID WebGL scene failed:", error);
    }

    if (!scene) {
      // WebGL yok veya shader derlenmedi — PNG yedeği görünür kalır.
      return;
    }

    const activeScene = scene;
    const start = performance.now();

    // Etkileşim durumu — referans implementasyondaki katsayılar birebir.
    const mouse = { x: 0.5, y: 0.5 };
    const velocity = { x: 0, y: 0 };
    const intensity = { current: 0, target: 0 };
    let lastMove = 0;

    const onMove = (event: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const point = "touches" in event ? event.touches[0] : event;
      if (!point || !rect.width || !rect.height) return;

      const x = (point.clientX - rect.left) / rect.width;
      const y = (point.clientY - rect.top) / rect.height;
      const dx = x - mouse.x;
      const dy = y - mouse.y;

      velocity.x = 2 * dx + 0.9 * velocity.x;
      velocity.y = 2 * dy + 0.9 * velocity.y;

      mouse.x = x;
      mouse.y = y;

      intensity.target = Math.min(
        1.5,
        intensity.target + 20 * Math.sqrt(dx * dx + dy * dy),
      );
      lastMove = performance.now();
    };

    const loop = () => {
      if (!visible) return;

      // İmleç durduğunda smear ve girdap sönümlenir; idle dalga sürer.
      if (performance.now() - lastMove > 100) {
        intensity.target *= 0.95;
        velocity.x *= 0.9;
        velocity.y *= 0.9;
      }
      intensity.current += (intensity.target - intensity.current) * 0.1;

      activeScene.renderFrame({
        time: (performance.now() - start) / 1000,
        mouseX: mouse.x,
        mouseY: mouse.y,
        velocityX: velocity.x,
        velocityY: velocity.y,
        intensity: intensity.current,
      });

      frameId = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    // Kilit görünürlükle alınır/bırakılır: hero ekrandan çıkınca güneş
    // sistemi sahnesi kilidi alabilsin diye (aynı anda yalnızca biri çalışır).
    // Kilit doluysa sıraya girilir — boşaldığında otomatik başlar; aksi
    // halde devir iki observer'ın tetiklenme sırasına kalıyordu.
    let inView = false;
    let unsubscribeWait: (() => void) | null = null;

    const startIfPossible = () => {
      if (!inView || visible) return;
      if (!holdsLock) holdsLock = acquireSceneLock(holder);
      if (!holdsLock) {
        unsubscribeWait ??= onSceneLockReleased(() => {
          unsubscribeWait = null;
          startIfPossible();
        });
        return;
      }
      visible = true;
      activeScene.resize();
      if (frameId === null) loop();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          startIfPossible();
        } else {
          visible = false;
          stopLoop();
          unsubscribeWait?.();
          unsubscribeWait = null;
          if (holdsLock) {
            releaseSceneLock(holder);
            holdsLock = false;
          }
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(stage);

    // CSS kutusu değiştiğinde çizim tamponu da güncellenmeli: yalnızca
    // window resize dinlemek yetmiyor (aspect-ratio ve font yüklemesi
    // layout'u sahne kurulduktan sonra da değiştirebiliyor).
    const resizeObserver = new ResizeObserver(() => activeScene.resize());
    resizeObserver.observe(stage);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      unsubscribeWait?.();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      stopLoop();
      activeScene.dispose();
      if (holdsLock) releaseSceneLock(holder);
      setLive(false);
    };
  }, [reducedMotion]);

  return (
    <div className={styles.stage} ref={stageRef}>
      {/* LCP elemanı + kalıcı yedek. WebGL devreye girince gizlenir. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MASK_URL}
        alt="HIBRID"
        width={1920}
        height={528}
        fetchPriority="high"
        decoding="async"
        className={`${styles.fallback} ${live ? styles.fallbackHidden : ""}`}
      />
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className={`${styles.canvas} ${live ? styles.canvasLive : ""}`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
