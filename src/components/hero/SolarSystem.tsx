"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { orbitStones, SOLAR_SYSTEM_TITLE } from "@/data/solar-system";
import {
  createSolarSystemScene,
  stoneScreenPosition,
  acquireSceneLock,
  releaseSceneLock,
  type SceneHandle,
} from "@/lib/webgl-scene";
import styles from "./SolarSystem.module.css";

/**
 * Güneş sistemi — brief-rev12.md Bölüm 4.5.
 *
 * Performans (CLAUDE.md, sözleşme maddesi):
 *   - Aynı anda en fazla BİR WebGL sahnesi: modül seviyesindeki kilit
 *     (acquireSceneLock) ikinci sahnenin başlamasını engeller. Taşların
 *     kendisi WebGL dokusu DEĞİL — gerçek <img> (bkz. aşağı); WebGL
 *     yalnızca güneş ışıması ve yörünge halkalarını çiziyor.
 *   - Ekrandan çıkınca durur: IntersectionObserver rAF döngüsünü durdurur.
 *   - prefers-reduced-motion: sahne hiç başlatılmaz, erişilebilir statik
 *     liste gösterilir.
 *   - WebGL yoksa (eski cihaz, bağlam kaybı) aynı statik liste devreye girer.
 *   - Taş görselleri yalnızca 2 dosya (fuşya + sarı, ~15-35KB), 8 kez
 *     tekrar kullanılıyor — tarayıcı ilk istekten sonra önbellekten
 *     okuyor, aynı anda birden fazla ağ isteği olmuyor.
 */
export function SolarSystem() {
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const holder = Symbol("solar-system");
    if (!acquireSceneLock(holder)) {
      // Başka bir WebGL sahnesi zaten çalışıyor — bu sahne açılmaz.
      setWebglFailed(true);
      return;
    }

    let scene: SceneHandle | null = null;
    try {
      scene = createSolarSystemScene(canvas);
    } catch (error) {
      console.error("WebGL scene failed:", error);
    }

    if (!scene) {
      releaseSceneLock(holder);
      setWebglFailed(true);
      return;
    }

    let frameId: number | null = null;
    let visible = false;
    let pointerNdcX = 0;
    let pointerNdcY = 0;
    const start = performance.now();

    // HTML link katmanını shader'daki taş konumlarıyla aynı matematikten
    // besler — böylece taş görseli ve etiketi WebGL'deki halka ile
    // birlikte hareket eder. İmleç yaklaştıkça taş hafifçe büyür (aynı
    // "elastik fare tepkisi" hissi, shader'daki ışıma boost'uyla eşleşir).
    const positionLinks = (seconds: number) => {
      const rect = stage.getBoundingClientRect();
      const scale = Math.min(rect.width, rect.height);
      orbitStones.forEach((_, index) => {
        const link = linkRefs.current[index];
        if (!link) return;
        const { x, y } = stoneScreenPosition(index, seconds);
        link.style.left = `${rect.width / 2 + x * scale}px`;
        link.style.top = `${rect.height / 2 - y * scale}px`;

        const dx = pointerNdcX - x;
        const dy = pointerNdcY - y;
        const boost = Math.max(0, 1 - Math.hypot(dx, dy) / 0.35);
        link.style.setProperty("--stone-boost", boost.toFixed(3));
      });
    };

    const loop = () => {
      if (!visible || !scene) return;
      const seconds = (performance.now() - start) / 1000;
      scene.renderFrame(seconds);
      positionLinks(seconds);
      frameId = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && frameId === null) {
          loop();
        } else if (!visible && frameId !== null) {
          // Ekrandan çıktı — döngü durur (CLAUDE.md performans kuralı).
          cancelAnimationFrame(frameId);
          frameId = null;
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(stage);

    // Canvas'ın çizim tamponu, CSS boyutu her değiştiğinde yeniden
    // ayarlanmalı. Yalnızca window resize dinlemek yetmiyor: aspect-ratio
    // ve font yüklemesi layout'u sahne kurulduktan SONRA da değiştirebiliyor
    // ve tampon eski kalınca canvas'ın bir şeridi hiç çizilmemiş görünüyordu.
    const resizeObserver = new ResizeObserver(() => scene?.resize());
    resizeObserver.observe(stage);

    const onPointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      const scale = Math.min(rect.width, rect.height);
      pointerNdcX = (event.clientX - rect.left - rect.width / 2) / scale;
      pointerNdcY = -(event.clientY - rect.top - rect.height / 2) / scale;
      scene?.setPointer(pointerNdcX, pointerNdcY);
    };
    stage.addEventListener("pointermove", onPointerMove);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      if (frameId !== null) cancelAnimationFrame(frameId);
      scene?.dispose();
      releaseSceneLock(holder);
    };
  }, [reducedMotion]);

  const useStaticFallback = reducedMotion || webglFailed;

  return (
    <section className={styles.section} aria-labelledby="solar-system-title">
      <h2 id="solar-system-title" className={styles.title}>
        {SOLAR_SYSTEM_TITLE}
      </h2>

      {useStaticFallback ? (
        <ul className={styles.fallbackList}>
          {orbitStones.map((stone) => (
            <li key={stone.orbit}>
              <Link href={stone.href} className={styles.fallbackLink}>
                {stone.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.stage} ref={stageRef}>
          <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
          <span className={styles.center} aria-hidden="true">
            HIBRID
          </span>
          {orbitStones.map((stone, index) => (
            <Link
              key={stone.orbit}
              href={stone.href}
              className={styles.stoneLink}
              ref={(node) => {
                linkRefs.current[index] = node;
              }}
            >
              {/* next/image kasıtlı olarak kullanılmıyor: bu görsel zaten
                  önceden optimize edilmiş WebP (bkz. public/images/stones/,
                  hazırlık script'i commit mesajında), sabit boyutlu ve
                  konumu JS ile mutlak (absolute) piksele yazılıyor —
                  next/image'ın sunucu tarafı yeniden boyutlandırması burada
                  fayda sağlamaz ve Cloudflare Workers'ta ayrı bir görsel
                  optimizasyon binding'i gerektirirdi. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/stones/stone-${stone.color}.webp`}
                srcSet={`/images/stones/stone-${stone.color}.webp 1x, /images/stones/stone-${stone.color}@2x.webp 2x`}
                alt=""
                aria-hidden="true"
                loading="lazy"
                width={72}
                height={72}
                className={styles.stoneImage}
              />
              <span className={styles.stoneLabel}>{stone.label}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
