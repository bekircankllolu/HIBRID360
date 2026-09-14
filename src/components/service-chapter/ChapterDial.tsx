import type { CSSProperties } from "react";
import styles from "./ChapterDial.module.css";

/**
 * 360° kadranı — Service Chapter derece sisteminin küçük enstrümanı
 * (docs/design/SERVICE_CHAPTER_SYSTEM.md §2). 72 çentik (5°), servislerin
 * durduğu her 45°'de uzun çentik; fuşya işaret sayfanın derecesini
 * gösterir (0° = saat 12, saat yönünde).
 *
 * Dekoratiftir (`aria-hidden`): derece bilgisi okunabilir metin olarak
 * değil marka dili olarak taşınır. Ebeveyn `--turn` verirse (ör. sıradaki
 * servis satırının hover'ı) işaret o kadar daha döner.
 */

const CENTER = 50;
const RADIUS = 46;

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * 72 çentik iki `<path>` olarak (küçük / büyük) — 72 ayrı `<line>`
 * elemanı her kadranda DOM'u, HTML'i ve RSC yükünü şişiriyordu
 * (Lighthouse: stil + layout süresi). Görüntü aynı.
 */
function ticksPath(major: boolean): string {
  return Array.from({ length: 72 }, (_, index) => index)
    .filter((index) => (index % 9 === 0) === major) // 9 × 5° = 45°
    .map((index) => {
      const angle = (index * 5 * Math.PI) / 180;
      const inner = RADIUS - (major ? 9 : 4);
      const x1 = round(CENTER + inner * Math.sin(angle));
      const y1 = round(CENTER - inner * Math.cos(angle));
      const x2 = round(CENTER + RADIUS * Math.sin(angle));
      const y2 = round(CENTER - RADIUS * Math.cos(angle));
      return `M${x1} ${y1}L${x2} ${y2}`;
    })
    .join("");
}

const MINOR_TICKS = ticksPath(false);
const MAJOR_TICKS = ticksPath(true);

export function ChapterDial({
  degree,
  size = 28,
  className,
}: {
  degree: number;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={`${styles.dial} ${className ?? ""}`}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ "--deg": `${degree}deg` } as CSSProperties}
    >
      <circle className={styles.ring} cx={CENTER} cy={CENTER} r={RADIUS} />
      <path className={styles.minor} d={MINOR_TICKS} />
      <path className={styles.major} d={MAJOR_TICKS} />
      <g className={styles.marker}>
        <line x1={CENTER} y1={CENTER} x2={CENTER} y2={CENTER - RADIUS + 2} />
        <circle cx={CENTER} cy={CENTER - RADIUS + 2} r={5} />
      </g>
      <circle className={styles.hub} cx={CENTER} cy={CENTER} r={3} />
    </svg>
  );
}
