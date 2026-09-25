"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Volume2, VolumeX } from "lucide-react";
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
  const tVideo = useTranslations("video");
  const locale = useLocale() as Locale;
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showreelInView, setShowreelInView] = useState(false);
  /**
   * Showreel indirmesi sayfa oturana kadar BEKLETİLİR.
   *
   * 19 Eylül 2026'da ölçüldü (Lighthouse, mobil throttling): showreel
   * videosu kadraja konur konmaz LCP ÖĞESİ oldu ve LCP 5.1 sn'ye çıktı —
   * CLAUDE.md'nin 2.5 sn'lik sözleşme maddesinin iki katı. Sebep: kadraj
   * hero'nun içinde, yani daha ilk karede görünür; `preload="none"` olsa
   * da `play()` hemen çağrılınca 1.2 MB'lık dosya kritik yola giriyordu.
   *
   * Çözüm indirmeyi ERTELEMEK: `load` olayından (ve varsa bir boşta
   * geçen kareden) sonra başlıyor. O ana kadar poster karesi (88 KB webp)
   * görünüyor ve LCP'yi o karşılıyor; video birkaç yüz milisaniye sonra
   * sessizce devralıyor. Kullanıcı açısından görünen kadraj aynı.
   */
  const [deferredLoad, setDeferredLoad] = useState(false);
  /**
   * Ses: video HER ZAMAN sessiz başlar (otomatik ses yasak). Ziyaretçi düğmeye
   * basınca açılır. Hareket azaltma açıksa video kendiliğinden oynamaz; sesi
   * açmak aynı zamanda oynatma isteğidir (`userStarted`).
   */
  const [muted, setMuted] = useState(true);
  const [userStarted, setUserStarted] = useState(false);
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
    if (!hasShowreel || prefersReducedMotion) return;

    let idle = 0;
    let timer = 0;
    const begin = () => {
      // Boşta geçen ilk kareyi bekle: hidrasyon işi videoyla yarışmasın.
      const request = window.requestIdleCallback;
      if (request) idle = request(() => setDeferredLoad(true), { timeout: 1500 });
      else timer = window.setTimeout(() => setDeferredLoad(true), 400);
    };

    if (document.readyState === "complete") {
      begin();
    } else {
      window.addEventListener("load", begin, { once: true });
    }

    return () => {
      window.removeEventListener("load", begin);
      if (idle) window.cancelIdleCallback?.(idle);
      if (timer) window.clearTimeout(timer);
    };
  }, [hasShowreel, prefersReducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (showreelInView && ((deferredLoad && !prefersReducedMotion) || userStarted)) {
      void video.play().catch(() => {
        // Tarayıcı otomatik oynatmayı engellerse poster görünmeye devam eder.
      });
      return;
    }

    video.pause();
  }, [deferredLoad, prefersReducedMotion, showreelInView, userStarted]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
    if (nextMuted) return;
    setUserStarted(true);
    if (video.paused) {
      void video.play().catch(() => {
        // Oynatma reddedilirse (ör. güç tasarrufu) sessiz duruma geri dön.
        video.muted = true;
        setMuted(true);
      });
    }
  };

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

      // İlk konum zaten stylesheet'te 0/1 olarak tanımlı. Hydration anında
      // aynı değerleri inline stile yeniden yazmak tüm hero'yu gereksiz
      // boyayıp LCP zamanını hydration sonrasına taşıyordu.
      if (
        progress === 0 &&
        !stage.style.getPropertyValue("--showreel-progress")
      ) {
        frame = 0;
        return;
      }

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
                  <source src={HOME_SHOWREEL.webm} type={HOME_SHOWREEL.webmType ?? "video/webm"} />
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
                loading="lazy"
                fetchPriority="low"
                decoding="async"
              />
            )}
            {hasPlayableShowreel && HOME_SHOWREEL.hasAudio && (
              <button
                type="button"
                className={styles.showreelSound}
                onClick={toggleSound}
                aria-pressed={!muted}
                aria-label={muted ? tVideo("soundOn") : tVideo("soundOff")}
                title={muted ? tVideo("soundOn") : tVideo("soundOff")}
              >
                {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
              </button>
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
