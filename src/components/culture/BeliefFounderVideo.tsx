"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  BELIEF_FOUNDER_VIDEO,
  type BeliefFounderVideo as BeliefVideo,
} from "@/data/what-we-believe";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./BeliefFounderVideo.module.css";

/**
 * What We Believe — kurucu/müşteri konuşma bölümü.
 *
 * Kaydırma ilerledikçe küçük medya alanı tam ekrana büyür: bölüm uzun bir
 * sarmalayıcı, içindeki sahne `position: sticky` ile ekranda kalır,
 * ilerleme 0→1 arasında ölçülüp bir CSS değişkenine yazılır.
 *
 * ## Video yoksa
 *
 * `BELIEF_FOUNDER_VIDEO` `null` olduğu sürece bölüm **hiç render
 * edilmez** — production arayüzünde "video hazırlanıyor" kutusu
 * göstermiyoruz, sahte kişi/video da üretilmedi. Yalnızca poster
 * verilirse bölüm "kontrollü poster modunda" çalışır: aynı büyüme,
 * oynatma yok.
 *
 * ## Erişilebilirlik / performans
 *
 * - `prefers-reduced-motion`: sticky ve büyüme tamamen devre dışı,
 *   medya tam genişlik statik olarak gösterilir (CLAUDE.md zorunlu).
 * - Otomatik ses YASAK: video `muted` başlar ve tarayıcı kontrolleri
 *   açıktır; sesi kullanıcı açar.
 * - `preload="none"` + poster (CLAUDE.md performans bütçesi).
 * - Kaydırma dinleyicisi `passive` ve rAF ile sınırlanmış; sticky sahne
 *   `overflow: hidden` içinde, mobilde içerik taşırmıyor.
 */
export function BeliefFounderVideo() {
  const video = BELIEF_FOUNDER_VIDEO;
  if (!video) return null;
  return <BeliefFounderVideoStage video={video} />;
}

function BeliefFounderVideoStage({ video }: { video: BeliefVideo }) {
  const t = useTranslations("video");
  const prefersReduced = usePrefersReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage) return;

    // Hareket azaltmada ilerleme hiç ölçülmez; sahne statik.
    if (prefersReduced) {
      stage.style.setProperty("--progress", "1");
      return;
    }

    // Görünür değilken kaydırma dinlemiyoruz — ekran dışındaki bölüm
    // kaydırma performansına yük olmasın.
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
      // Sarmalayıcının kaydırılabilir payı: yüksekliği eksi sticky
      // sahnenin kapladığı bir ekran.
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

  const playable = video.sources.length > 0;

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${prefersReduced ? styles.wrapperStatic : ""}`}
    >
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.media}>
          {playable ? (
            <video
              className={styles.video}
              poster={video.poster.src}
              width={video.poster.width}
              height={video.poster.height}
              controls
              // Otomatik ses YASAK (CLAUDE.md) — sessiz başlar, sesi
              // kullanıcı açar. autoPlay bilerek yok.
              muted
              playsInline
              preload="none"
            >
              {video.sources.map((source) => (
                <source key={source.src} src={source.src} type={source.type} />
              ))}
              {video.captions?.map((caption) => (
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
              src={video.poster.src}
              width={video.poster.width}
              height={video.poster.height}
              alt=""
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        {video.disclosure === "ai-generated" && (
          <p className={styles.disclaimer}>{t("aiGenerated")}</p>
        )}
      </div>
    </div>
  );
}
