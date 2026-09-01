"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { HOME_SHOWREEL } from "@/data/home-showreel";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
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
 * viewport'u kaplar. Gerçek medya teslim edilene kadar açıkça temsili
 * olduğu belirtilen poster aynı scroll sahnesinde gösterilir; onaylı
 * video geldiğinde yalnızca src/data/home-showreel.ts güncellenir.
 */
export function HeroTypography() {
  const t = useTranslations("home");
  const locale = useLocale() as Locale;
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showreelInView, setShowreelInView] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const hasShowreel = HOME_SHOWREEL !== null;
  const hasPlayableShowreel = Boolean(
    HOME_SHOWREEL?.mp4 || HOME_SHOWREEL?.webm,
  );

  useEffect(() => {
    if (!hasShowreel) return;

    const stage = stageRef.current;
    if (!stage) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowreelInView(entry.isIntersecting),
      { rootMargin: "20% 0px", threshold: 0.01 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, [hasShowreel]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (showreelInView && !prefersReducedMotion) {
      void video.play().catch(() => {
        // Tarayıcı otomatik oynatmayı engellerse poster görünmeye devam eder.
      });
      return;
    }

    video.pause();
  }, [prefersReducedMotion, showreelInView]);

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
            {hasPlayableShowreel ? (
              <video
                ref={videoRef}
                className={styles.showreelVideo}
                muted
                loop
                playsInline
                preload="none"
                poster={HOME_SHOWREEL.poster}
                aria-label={HOME_SHOWREEL.title[locale]}
              >
                {HOME_SHOWREEL.webm && (
                  <source src={HOME_SHOWREEL.webm} type="video/webm" />
                )}
                {HOME_SHOWREEL.mp4 && (
                  <source src={HOME_SHOWREEL.mp4} type="video/mp4" />
                )}
              </video>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={styles.showreelVideo}
                src={HOME_SHOWREEL.poster}
                width={1600}
                height={900}
                alt={HOME_SHOWREEL.title[locale]}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            )}
            {HOME_SHOWREEL.disclosure === "ai-generated" && (
              <span className={styles.showreelDisclosure}>
                {t("showreel.representative")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
