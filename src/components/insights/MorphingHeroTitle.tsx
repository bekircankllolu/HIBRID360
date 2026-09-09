"use client";

import { useCallback, useEffect, useRef } from "react";

import styles from "./MorphingHeroTitle.module.css";

const MORPH_TIME = 1.5;
const COOLDOWN_TIME = 0.5;
const TITLE_STATES = ["THINK", "& THANK"] as const;

function useMorphingText(texts: readonly string[]) {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(0);
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const setStyles = useCallback(
    (fraction: number) => {
      const current1 = text1Ref.current;
      const current2 = text2Ref.current;

      if (!current1 || !current2) return;

      const nextFraction = Math.max(fraction, 0.001);
      const currentFraction = Math.max(1 - fraction, 0.001);

      current2.style.filter = `blur(${Math.min(8 / nextFraction - 8, 100)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4)}`;
      current1.style.filter = `blur(${Math.min(8 / currentFraction - 8, 100)}px)`;
      current1.style.opacity = `${Math.pow(1 - fraction, 0.4)}`;

      current1.textContent = texts[textIndexRef.current % texts.length];
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    },
    [texts],
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    const fraction = Math.min(morphRef.current / MORPH_TIME, 1);
    setStyles(fraction);

    if (fraction === 1) {
      cooldownRef.current = COOLDOWN_TIME;
      textIndexRef.current += 1;
    }
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;

    if (!text1Ref.current || !text2Ref.current) return;

    text2Ref.current.style.filter = "none";
    text2Ref.current.style.opacity = "1";
    text1Ref.current.style.filter = "none";
    text1Ref.current.style.opacity = "0";
  }, []);

  useEffect(() => {
    const current1 = text1Ref.current;
    const current2 = text2Ref.current;

    if (!current1 || !current2) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current1.textContent = "THINK & THANK";
      current1.style.filter = "none";
      current1.style.opacity = "1";
      current2.style.display = "none";
      return;
    }

    let animationFrameId = 0;
    timeRef.current = performance.now();

    const animate = (time: number) => {
      const delta = (time - timeRef.current) / 1000;
      timeRef.current = time;
      cooldownRef.current -= Math.min(delta, 0.1);

      if (cooldownRef.current <= 0) doMorph();
      else doCooldown();

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [doCooldown, doMorph]);

  return { text1Ref, text2Ref };
}

export function MorphingHeroTitle({ className }: { className?: string }) {
  const { text1Ref, text2Ref } = useMorphingText(TITLE_STATES);

  return (
    <h1
      className={`${styles.title}${className ? ` ${className}` : ""}`}
      aria-label="THINK & THANK"
    >
      <span className={styles.stage} aria-hidden="true">
        <span ref={text1Ref} className={styles.text}>
          THINK
        </span>
        <span ref={text2Ref} className={styles.text} />
      </span>
      <svg className={styles.filterDefinitions} aria-hidden="true">
        <defs>
          <filter id="think-title-threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </h1>
  );
}
