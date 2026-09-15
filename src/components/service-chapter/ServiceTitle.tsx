"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useScrambleReveal } from "@/hooks/useScrambleReveal";
import styles from "./ServiceTitle.module.css";

export function ServiceTitle({ lines }: { lines: readonly string[] }) {
  const active = !usePrefersReducedMotion();
  const first = useScrambleReveal(lines[0] ?? "", { active, durationMs: 520 });
  const second = useScrambleReveal(lines[1] ?? "", { active, delayMs: 90, durationMs: 580 });
  const label = lines.join(" ");

  return (
    <h1 className={styles.title} lang="en" aria-label={label}>
      <span aria-hidden="true">{first}</span>
      {lines[1] ? (
        <span className={styles.accent} aria-hidden="true">
          {second}
        </span>
      ) : null}
    </h1>
  );
}
