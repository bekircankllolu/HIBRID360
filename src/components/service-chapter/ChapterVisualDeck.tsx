"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./ChapterVisualDeck.module.css";

export interface ChapterVisual {
  src: string;
  alt: string;
}

export function ChapterVisualDeck({
  visuals,
  activeIndex,
  caption,
}: {
  visuals: readonly ChapterVisual[];
  activeIndex: number;
  caption: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.7],
    ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
  );
  const y = useTransform(scrollYProgress, [0, 1], [-50, 0]);
  const animate = mounted && !reduced;
  const resolved = Math.max(0, Math.min(activeIndex, visuals.length - 1));
  const visual = visuals[resolved];

  return (
    <figure
      ref={ref}
      className={styles.figure}
      data-visual={resolved}
      data-motion={animate ? "scroll" : "static"}
    >
      <motion.div className={styles.frame} style={{ y: animate ? y : 0 }}>
        <motion.div
          className={styles.reveal}
          style={{
            opacity: animate ? opacity : 1,
            clipPath: animate ? clipPath : "none",
          }}
        >
          {visual ? (
            <Image
              key={visual.src}
              className={styles.image}
              src={visual.src}
              alt={visual.alt}
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
            />
          ) : null}
        </motion.div>
        <span className={styles.reticle} aria-hidden="true" />
        <span className={styles.counter} aria-hidden="true">
          {String(resolved + 1).padStart(2, "0")} / {String(visuals.length).padStart(2, "0")}
        </span>
      </motion.div>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
