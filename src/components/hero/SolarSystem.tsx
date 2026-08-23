"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
 *     (acquireSceneLock) ikinci sahnenin başlamasını engeller.
 *   - Ekrandan çıkınca durur: IntersectionObserver rAF döngüsünü durdurur.
 *   - prefers-reduced-motion: sahne hiç başlatılmaz, erişilebilir statik
 *     liste gösterilir.
 *   - WebGL yoksa (eski cihaz, bağlam kaybı) aynı statik liste devreye girer.
 *
 * TODO: brief 4.5 — "AI ile üretilmiş Hibrid taşı (sarı) ve fuşya varyantı"
 * görselleri teslim edilince shader'daki prosedürel taşlar bu doku (texture)
 * ile değiştirilecek. Şu anki sahne gerçek görsel varlık olmadan da
 * eksiksiz çalışıyor.
 */
export function SolarSystem() {
  const t = useTranslations("solarSystem");
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
    const start = performance.now();

    // HTML link katmanını shader'daki taş konumlarıyla aynı matematikten
    // besler — böylece etiketler taşlarla birlikte hareket eder.
    const positionLinks = (seconds: number) => {
      const rect = stage.getBoundingClientRect();
      const scale = Math.min(rect.width, rect.height);
      orbitStones.forEach((_, index) => {
        const link = linkRefs.current[index];
        if (!link) return;
        const { x, y } = stoneScreenPosition(index, seconds);
        link.style.left = `${rect.width / 2 + x * scale}px`;
        link.style.top = `${rect.height / 2 - y * scale}px`;
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
      scene?.setPointer(
        (event.clientX - rect.left - rect.width / 2) / scale,
        -(event.clientY - rect.top - rect.height / 2) / scale,
      );
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
              {stone.label}
            </Link>
          ))}
        </div>
      )}

      <p className={styles.assetNote}>{t("assetNote")}</p>
    </section>
  );
}
