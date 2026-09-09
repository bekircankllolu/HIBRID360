"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { CultureFilm } from "@/data/who-we-are";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./MeetTheCrewReveal.module.css";

/**
 * CUL-06 — "Meet the crew" ekip filmi.
 *
 * monks.com'daki dairesel scroll-reveal mekaniğinin sadeleştirilmiş
 * karşılığı: kaydırma ilerledikçe (1) arka plandaki "Hibrid 360" wordmark'ı
 * outline'dan dolu hale geçer, (2) önündeki dairesel video küçük bir
 * noktadan sahneyi kaplayana kadar büyür. Orijinaldeki iki kopya
 * video/logo ve özel SVG ilerleme halkası burada yok — `BeliefFounderVideo`
 * ile aynı `--progress` tekniği ve native `<video controls>` yeterli
 * (YAGNI; native scrubber zaten erişilebilir).
 *
 * `--progress` (0→1) rAF içinde yazılır, tüm ölçüler CSS'te bu tek
 * değişkenden türetilir — JS'in tek işi bir sayı yazmak.
 */
export function MeetTheCrewReveal({
  film,
  label,
}: {
  film: CultureFilm;
  label: string;
}) {
  const locale = useLocale() as "tr" | "en";
  const prefersReduced = usePrefersReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Görünür değilken kaydırma dinlemiyoruz — ekran dışındaki bölüm
  // kaydırma performansına yük olmasın (BeliefFounderVideo ile aynı desen).
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage) return;

    if (prefersReduced) {
      stage.style.setProperty("--progress", "1");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "10% 0px" },
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [prefersReduced]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage || prefersReduced || !inView) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = wrapper.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) {
        stage.style.setProperty("--progress", "1");
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top / travel, 0), 1);
      stage.style.setProperty("--progress", scrolled.toFixed(4));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [inView, prefersReduced]);

  const playable = film.sources.length > 0;
  const alt = film.alt[locale];

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${prefersReduced ? styles.wrapperStatic : ""}`}
    >
      <div ref={stageRef} className={styles.stage}>
        <p className={styles.wordmark} data-text="Hibrid 360" aria-hidden="true" lang="en">
          Hibrid 360
        </p>

        <figure className={styles.circleFigure}>
          <div className={styles.circle}>
            {playable ? (
              <video
                className={styles.video}
                poster={film.poster.src}
                width={film.poster.width}
                height={film.poster.height}
                controls
                aria-label={alt}
                // Otomatik ses YASAK (CLAUDE.md) — sessiz başlar, sesi
                // kullanıcı açar. autoPlay bilerek yok.
                muted
                playsInline
                preload="none"
              >
                {film.sources.map((source) => (
                  <source key={source.src} src={source.src} type={source.type} />
                ))}
                {film.captions?.map((caption) => (
                  <track
                    key={caption.src}
                    kind="captions"
                    src={caption.src}
                    srcLang={caption.srcLang}
                    label={caption.label}
                  />
                ))}
              </video>
            ) : (
              // Kontrollü poster modu: video henüz yok ama görsel hazır.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={styles.video}
                src={film.poster.src}
                width={film.poster.width}
                height={film.poster.height}
                alt={alt}
                loading="lazy"
                decoding="async"
              />
            )}
          </div>
          <figcaption className={styles.cta}>{label}</figcaption>
        </figure>
      </div>
    </div>
  );
}
