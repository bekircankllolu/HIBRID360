"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  WORDMARK_GLYPHS,
  WORDMARK_ADVANCE,
  WORDMARK_ASCENDER,
  WORDMARK_DESCENDER,
} from "@/data/wordmark";
import styles from "./HeroTypography.module.css";

/**
 * Hero tipografisi — brief-rev12.md Bölüm 4.1.
 *
 * Brief'in "kopyalamak yerine aynı etkiyi kendi harflerimizle üretmek"
 * notundaki dört katman:
 *   1. Harf içine dolgu — SVG <mask> yerine doğrudan glif path'leri +
 *      dolgu (fill). Video varlığı geldiğinde aynı path'ler <mask> olarak
 *      kullanılıp arkasına video konacak; şu an marka renklerinden
 *      degrade akıyor.
 *   2. Pırıltı/degrade — hareketli degrade katmanı.
 *   3. Elastik fare tepkisi — imleç mesafesine göre harf başına transform.
 *   4. Sürekli hareket — düşük genlikli sonsuz dalgalanma.
 *
 * Harfler <text> değil PATH: bu blok sayfanın LCP elemanı ve <text>
 * olarak bırakıldığında ilk boyama web font indirmesini bekliyor,
 * LCP 2,5sn bütçesini aşıyordu (bkz. src/data/wordmark.ts).
 *
 * WebGL kullanılmadı: CLAUDE.md "aynı anda en fazla BİR WebGL sahnesi"
 * kuralı gereği tek WebGL bütçesi güneş sistemine ayrıldı (bkz.
 * SolarSystem). Aynı görsel etki SVG + degrade ile elde ediliyor.
 *
 * TODO: brief 4.1 — harf içi VİDEO dolgusu ve tipografinin ProRes 4444 +
 * alfa video dışa aktarımı prodüksiyon işi; varlık teslim edilince
 * <defs> içindeki degrade, path'lerden üretilen maske + video ile
 * değiştirilecek.
 *
 * HOME-03 — "AI SHOWREEL" film alanı etiketi sağ üstte, menünün altında.
 * Deck: "Fare hareket ettikçe alan büyüyerek tam ekrana oturur." Film A
 * varlığı henüz teslim edilmedi (bkz. what-we-do/ai-creative-production
 * TODO'su) — bu yüzden yalnızca etiket render ediliyor, tam ekrana
 * büyüyen etkileşim video geldiğinde eklenecek.
 */

const VIEW_HEIGHT = WORDMARK_ASCENDER - WORDMARK_DESCENDER;

export function HeroTypography() {
  const t = useTranslations("home");
  const reducedMotion = usePrefersReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const letterRefs = useRef<Array<SVGGElement | null>>([]);

  useEffect(() => {
    if (reducedMotion) return;

    const svg = svgRef.current;
    if (!svg) return;

    let frameId: number | null = null;
    let visible = false;
    let pointerX = 0;
    let pointerY = 0;
    const start = performance.now();

    const onPointerMove = (event: PointerEvent) => {
      const rect = svg.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width;
      pointerY = (event.clientY - rect.top) / rect.height;
    };

    const loop = () => {
      if (!visible) return;
      const seconds = (performance.now() - start) / 1000;

      WORDMARK_GLYPHS.forEach((glyph, index) => {
        const letter = letterRefs.current[index];
        if (!letter) return;
        const letterCenter = (glyph.x + glyph.advance / 2) / WORDMARK_ADVANCE;
        const distance = Math.abs(pointerX - letterCenter);
        // İmleç yaklaştıkça harf yukarı kalkar ve hafifçe büyür.
        const pull = Math.max(0, 1 - distance * 4);
        // Sürekli düşük genlikli dalgalanma (katman 4).
        const wave = Math.sin(seconds * 1.4 + index * 0.6) * 12;
        const lift = pull * -70 + wave;
        const scale = 1 + pull * 0.06;
        const tilt = (pointerY - 0.5) * pull * 5;
        letter.style.transform = `translateY(${lift}px) scale(${scale}) rotate(${tilt}deg)`;
      });

      frameId = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && frameId === null) {
          loop();
        } else if (!visible && frameId !== null) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(svg);
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [reducedMotion]);

  return (
    <div className={styles.hero}>
      <div className={styles.showreel}>
        <span className={styles.showreelLabel}>{t("showreel.label")}</span>
        <span className={styles.showreelCta}>{t("showreel.cta")}</span>
      </div>

      <div className={styles.inner}>
        {/* brief 4.2 — SİTEYE GİRECEK METİN, TR sürümde de aynı. */}
        <p className={styles.kicker}>
          MAKE IT MATTER.
          <span className={styles.kickerSecond}>
            HYPE THE VIBE. AMPLIFY THE IMPACT.
          </span>
        </p>

        <svg
          ref={svgRef}
          className={styles.wordmark}
          viewBox={`0 0 ${WORDMARK_ADVANCE} ${VIEW_HEIGHT}`}
          role="img"
          aria-label="HIBRID"
        >
          <defs>
            {/* TODO: brief 4.1 — video dolgu varlığı gelince bu degrade
                yerine path'lerden üretilen <mask> + <video> kullanılacak. */}
            <linearGradient id="hero-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-fuchsia)" />
              <stop offset="55%" stopColor="var(--color-brand-fuchsia)" />
              <stop offset="100%" stopColor="var(--color-brand-yellow)" />
            </linearGradient>
          </defs>

          {WORDMARK_GLYPHS.map((glyph, index) => (
            <g
              key={`${glyph.char}-${index}`}
              className={styles.letter}
              ref={(node) => {
                letterRefs.current[index] = node;
              }}
              style={{
                transformOrigin: `${glyph.x + glyph.advance / 2}px ${VIEW_HEIGHT / 2}px`,
              }}
            >
              {/* Font birimleri y-yukarı; SVG y-aşağı — bu yüzden çevrilir. */}
              <path
                d={glyph.d}
                transform={`translate(${glyph.x} ${WORDMARK_ASCENDER}) scale(1 -1)`}
                fill="url(#hero-fill)"
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
