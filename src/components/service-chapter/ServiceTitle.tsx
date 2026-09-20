"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ScrambleLine } from "./ScrambleLine";
import styles from "./ServiceTitle.module.css";

/**
 * Bölüm başlığı (h1) — karıştırma/çözülme efekti `ScrambleLine` üzerinden
 * çalışıyor: efektin kendisi aynı, yalnız her kelime nihai genişliğinde
 * bir yuvaya oturuyor, böylece başlık karışırken satır kırmıyor
 * (20 Eylül 2026 müşteri hatası, bkz. ScrambleLine notu).
 *
 * Gerçek metni ekran okuyucuya `aria-label` veriyor; görünen kelimeler
 * `aria-hidden`.
 */
export function ServiceTitle({ lines }: { lines: readonly string[] }) {
  const active = !usePrefersReducedMotion();
  const label = lines.join(" ");

  return (
    <h1 className={styles.title} lang="en" aria-label={label}>
      <ScrambleLine text={lines[0] ?? ""} active={active} durationMs={520} />
      {lines[1] ? (
        <ScrambleLine
          className={styles.accent}
          text={lines[1]}
          active={active}
          delayMs={90}
          durationMs={580}
        />
      ) : null}
    </h1>
  );
}
