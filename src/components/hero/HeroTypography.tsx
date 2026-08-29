"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { HOME_SHOWREEL } from "@/data/home-showreel";
import type { Locale } from "@/i18n/routing";
import { HibridWebGL } from "./HibridWebGL";
import styles from "./HeroTypography.module.css";

/**
 * Hero tipografisi — brief-rev12.md Bölüm 4.1 / HOME-01..03.
 *
 * Brief'in dört katmanı artık gerçek WebGL sahnesiyle karşılanıyor
 * (bkz. HibridWebGL + src/lib/hibrid-wordmark-scene.ts):
 *   1. Harf içi dolgu — alfa maskesi (public/images/hibrid-wordmark.png)
 *      üzerine dikey açık pembe → koyu magenta palet.
 *   2. Pırıltı/degrade — flow noise ile sürüklenen dalga + grain shimmer.
 *   3. Elastik fare tepkisi — mouse velocity kaynaklı smear ve swirl/curl,
 *      imleç çevresinde radyal dalga.
 *   4. Sürekli hareket — imleç dursa da devam eden idle dalga.
 *
 * Önceki sürüm bu etkiyi SVG glif path'leri + CSS degrade ile taklit
 * ediyordu (WebGL bütçesi güneş sistemine ayrılmıştı). Kilit artık
 * görünürlükle devrediliyor, bu yüzden iki sahne de kendi sırasında
 * çalışabiliyor — "aynı anda en fazla BİR sahne" kuralı korunuyor.
 *
 * HOME-03 — showreel küçük sağ üst kadrajdan başlar ve sayfa kaydırıldıkça
 * viewport'u kaplar. Medya teslim edilene kadar yanlış bir filmi temsil
 * etmemek için yalnızca etiket görünür; src/data/home-showreel.ts dolduğu
 * anda aynı bileşen scroll sahnesini etkinleştirir.
 */
export function HeroTypography() {
  const t = useTranslations("home");
  const locale = useLocale() as Locale;
  const stageRef = useRef<HTMLDivElement>(null);
  const hasShowreel = HOME_SHOWREEL !== null;

  useEffect(() => {
    if (!hasShowreel) return;

    const stage = stageRef.current;
    if (!stage) return;

    let frame = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const progress = reducedMotion.matches
        ? 1
        : Math.min(1, Math.max(0, -rect.top / travel));

      stage.style.setProperty("--showreel-progress", progress.toFixed(4));
      stage.style.setProperty("--showreel-rest", (1 - progress).toFixed(4));
      frame = 0;
    };

    const requestMeasure = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", requestMeasure, { passive: true });
    window.addEventListener("resize", requestMeasure);
    reducedMotion.addEventListener("change", requestMeasure);

    return () => {
      window.removeEventListener("scroll", requestMeasure);
      window.removeEventListener("resize", requestMeasure);
      reducedMotion.removeEventListener("change", requestMeasure);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [hasShowreel]);

  return (
    <div
      ref={stageRef}
      className={`${styles.stage} ${hasShowreel ? styles.stageWithMedia : ""}`}
    >
      <div className={styles.hero}>
        <div className={styles.showreel}>
          <span className={styles.showreelLabel}>{t("showreel.label")}</span>
          <span className={`${styles.showreelCta} ${styles.pointerCta}`}>
            {t("showreel.cta")}
          </span>
          <span className={`${styles.showreelCta} ${styles.touchCta}`}>
            {t("showreel.touchCta")}
          </span>
        </div>

        <div className={styles.inner}>
          <p className={styles.kicker}>
            MAKE IT MATTER.
            <span className={styles.kickerSecond}>
              HYPE THE VIBE. AMPLIFY THE IMPACT.
            </span>
          </p>

          <HibridWebGL />
        </div>

        {HOME_SHOWREEL && (
          <div className={styles.showreelFrame}>
            <video
              className={styles.showreelVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={HOME_SHOWREEL.poster}
              aria-label={HOME_SHOWREEL.title[locale]}
            >
              {HOME_SHOWREEL.webm && (
                <source src={HOME_SHOWREEL.webm} type="video/webm" />
              )}
              <source src={HOME_SHOWREEL.mp4} type="video/mp4" />
            </video>
          </div>
        )}
      </div>
    </div>
  );
}
