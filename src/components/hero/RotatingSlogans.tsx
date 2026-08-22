"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./RotatingSlogans.module.css";

/**
 * Dönüşümlü slogan bloğu — brief-rev12.md Bölüm 4.4.
 *
 * Üç slogan SİTEYE GİRECEK METİN kutularından birebir; marka dili olduğu
 * için TR sürümde de İngilizce kalır (CLAUDE.md i18n kuralı).
 *
 * Zamanlama brief'in önerdiği gibi: her blok 4,5 sn ekranda kalır,
 * 0,6 sn'de yazılır, 0,4 sn'de çıkar. Kullanıcı scroll ederse döngü durur.
 * prefers-reduced-motion açıkken döngü hiç başlamaz — üç slogan da
 * hareketsiz olarak listelenir, içerik eksilmez.
 */

const SLOGANS = [
  {
    lead: "PRECISE. VISIONARY. HUMAN.",
    body: "We design digital experiences people remember.",
  },
  {
    lead: "PURE. SIMPLE. POWERFUL.",
    body: "AI-native creative production for brands that shape what's next.",
  },
  {
    lead: "Human creativity. AI precision. Real impact.",
    body: "",
  },
];

const HOLD_MS = 4500;
const EXIT_MS = 400;

export function RotatingSlogans() {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [paused, setPaused] = useState(false);

  // brief 4.4: "Kullanıcı scroll ederse döngü durur."
  useEffect(() => {
    if (reducedMotion) return;
    const onScroll = () => setPaused(true);
    window.addEventListener("scroll", onScroll, { passive: true, once: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || paused) return;

    const holdTimer = setTimeout(() => {
      setExiting(true);
      const exitTimer = setTimeout(() => {
        setIndex((current) => (current + 1) % SLOGANS.length);
        setExiting(false);
      }, EXIT_MS);
      return () => clearTimeout(exitTimer);
    }, HOLD_MS);

    return () => clearTimeout(holdTimer);
  }, [index, paused, reducedMotion]);

  // Hareket kapalıysa (veya döngü durduysa) üç slogan birden okunur.
  if (reducedMotion) {
    return (
      <section className={styles.block} aria-label="Slogans">
        <ul className={styles.staticList}>
          {SLOGANS.map((slogan) => (
            <li key={slogan.lead}>
              <p className={styles.lead}>{slogan.lead}</p>
              {slogan.body && <p className={styles.body}>{slogan.body}</p>}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const slogan = SLOGANS[index];

  return (
    <section className={styles.block} aria-label="Slogans">
      {/* brief 4.4: bir ekranda aynı anda en fazla bir slogan görünür. */}
      <div
        className={`${styles.slot} ${exiting ? styles.exiting : styles.entering}`}
        aria-live="polite"
      >
        <p className={styles.lead}>{slogan.lead}</p>
        {slogan.body && <p className={styles.body}>{slogan.body}</p>}
      </div>
    </section>
  );
}
