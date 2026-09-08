"use client";

import {
  Fragment,
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import styles from "./TextFadeIn.module.css";

type FadeStyle = CSSProperties & {
  "--text-fade-duration": string;
};

type UnitStyle = CSSProperties & {
  "--text-fade-unit-delay": string;
};

export interface TextFadeInProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children: string;
  duration?: number;
  delay?: number;
  by?: "character" | "word";
  staggerDelay?: number;
}

export function TextFadeIn({
  children,
  className,
  duration = 0.6,
  delay = 0,
  by = "word",
  staggerDelay = 0.085,
  style,
  ...props
}: TextFadeInProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const units = by === "word" ? children.trim().split(/\s+/) : Array.from(children);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (reducedMotion.matches) return;

    let revealFrame = 0;
    let observer: IntersectionObserver | null = null;

    const reveal = () => {
      if (revealFrame !== 0) return;
      revealFrame = window.requestAnimationFrame(() => {
        revealFrame = 0;
        root.dataset.revealed = "true";
        observer?.disconnect();
      });
    };

    const handleMotionPreference = () => {
      if (!reducedMotion.matches) return;
      root.dataset.revealed = "true";
      observer?.disconnect();
    };

    root.dataset.motion = "on";
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.16 },
    );
    observer.observe(root);
    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      observer?.disconnect();
      reducedMotion.removeEventListener("change", handleMotionPreference);
      if (revealFrame !== 0) window.cancelAnimationFrame(revealFrame);
    };
  }, []);

  const rootStyle = {
    ...style,
    "--text-fade-duration": `${duration}s`,
  } as FadeStyle;

  return (
    <span
      ref={rootRef}
      className={`${styles.root}${className ? ` ${className}` : ""}`}
      style={rootStyle}
      {...props}
    >
      {units.map((unit, index) => (
        <Fragment key={`${unit}-${index}`}>
          <span
            className={styles.unit}
            style={{
              "--text-fade-unit-delay": `${delay + index * staggerDelay}s`,
            } as UnitStyle}
          >
            {unit}
          </span>
          {by === "word" && index < units.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
