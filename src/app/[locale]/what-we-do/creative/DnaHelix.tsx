"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useScrollScene } from "@/hooks/useScrollScene";
import { helixGeometry, type HelixGeometry } from "./dna-helix";
import styles from "./DnaHelix.module.css";

/**
 * Creative S5 — imza hareketi: pen tool markanın DNA'sını çizer
 * (docs/design/SERVICE_CHAPTER_SYSTEM.md §8). CRE-02 sloganının görsel
 * karşılığı ("Your Brand’s DNA Is the Ultimate AI Differentiator.").
 *
 * Mekanik — JS yalnızca `--progress` yazar:
 * - Çizim: iplikler soldan sağa açılan bir `<clipPath>` dikdörtgeniyle
 *   görünür (`transform: scaleX(--draw)`). `stroke-dashoffset` +
 *   `pathLength`, ölçeklenmeyen çizgi kalınlığıyla (`non-scaling-stroke`)
 *   bazı tarayıcılarda yanlış hesaplandığı için bilerek kullanılmadı.
 * - Anchor'lar kalem üstlerinden geçtiği anda (`--draw ≥ t`) belirir.
 * - Kalem ucu CSS `cos()` ile ipliğin üstünde ilerler; geometri sabitleri
 *   SVG'ye `--w/--mid/--amp/--turns` olarak geometriden aktarılır (tek kaynak).
 *
 * Sanat eseri beyaz (iplikler), araç arayüzü fuşya (anchor, tutamaç,
 * kalem) — Service Chapter enstrüman grameri. Slogan sarı: ekranın tek
 * odağı; baştan görünür, sahnenin tek hareketi çizimdir.
 * Mobilde ayrı, daha kısa bir geometri (1,5 tur) — tek SVG 350px'e
 * sığınca iplikler kıl gibi kalıyordu.
 */

const DESKTOP = helixGeometry({ width: 1200, height: 360, turns: 3 });
const MOBILE = helixGeometry({ width: 600, height: 360, turns: 1.5 });
/** viewBox payı — kenardaki anchor kareleri ve kalem kırpılmasın. */
const PAD = 28;

function Helix({ geometry }: { geometry: HelixGeometry }) {
  const clipId = `dna-clip-${useId().replace(/:/g, "")}`;
  const penVars = {
    "--w": `${geometry.width}px`,
    "--mid": `${geometry.height / 2}px`,
    "--amp": `${geometry.amplitude}px`,
    "--turns": `${geometry.turns}turn`,
  } as CSSProperties;

  const anchorsA = geometry.anchors.filter((anchor) => anchor.strand === "a");
  const anchorsB = geometry.anchors.filter((anchor) => anchor.strand === "b");
  const lastIndex = anchorsA.length - 1;

  return (
    <svg
      className={styles.helix}
      viewBox={`${-PAD} ${-PAD} ${geometry.width + 2 * PAD} ${geometry.height + 2 * PAD}`}
      aria-hidden="true"
      focusable="false"
      style={penVars}
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            className={styles.reveal}
            x={0}
            y={-PAD}
            width={geometry.width}
            height={geometry.height + 2 * PAD}
          />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {/* Basamaklar tek yol: kırpma zaten onları iplikle birlikte açıyor,
            ayrı ayrı eleman olmalarına gerek yok. */}
        <path
          className={styles.rung}
          d={geometry.rungs.map((rung) => `M${rung.x} ${rung.y1}V${rung.y2}`).join("")}
        />
        <path className={styles.back} d={geometry.strandB} />
        <path className={styles.front} d={geometry.strandA} />
      </g>

      {/* Seçili yol (A): dolu anchor'lar, tek sıradakilerde tutamaçlar. */}
      {anchorsA.map((anchor, index) => (
        <g
          key={`a-${index}`}
          className={styles.anchor}
          data-anchor=""
          style={{ "--t": anchor.t } as CSSProperties}
        >
          {index % 2 === 1 && index !== lastIndex ? (
            <>
              <line
                className={styles.handleLine}
                x1={anchor.handleIn.x}
                y1={anchor.handleIn.y}
                x2={anchor.handleOut.x}
                y2={anchor.handleOut.y}
              />
              <circle className={styles.handleEnd} cx={anchor.handleIn.x} cy={anchor.handleIn.y} r={3.5} />
              <circle className={styles.handleEnd} cx={anchor.handleOut.x} cy={anchor.handleOut.y} r={3.5} />
            </>
          ) : null}
          <rect className={styles.anchorFilled} x={anchor.x - 4.5} y={anchor.y - 4.5} width={9} height={9} />
        </g>
      ))}

      {/* Seçili olmayan yol (B): içi boş anchor'lar. */}
      {anchorsB.map((anchor, index) => (
        <g
          key={`b-${index}`}
          className={styles.anchor}
          data-anchor=""
          style={{ "--t": anchor.t } as CSSProperties}
        >
          <rect className={styles.anchorHollow} x={anchor.x - 4} y={anchor.y - 4} width={8} height={8} />
        </g>
      ))}

      {/* Kalem ucu: sivri uç (0,0) noktasında. */}
      <g className={styles.pen}>
        <path className={styles.nib} d="M0 0 L-8 -17 L0 -26 L8 -17 Z" />
        <path className={styles.nibSlit} d="M0 0 L0 -12" />
        <circle className={styles.nibHole} cx={0} cy={-13} r={2} />
      </g>
    </svg>
  );
}

export function DnaHelix({ slogan }: { slogan: string }) {
  const sloganId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [complete, setComplete] = useState(false);
  const onProgress = useCallback((progress: number) => {
    const next = progress >= 0.94;
    setComplete((current) => (current === next ? current : next));
  }, []);
  const { ref, motion } = useScrollScene<HTMLDivElement>({ mode: "sticky", onProgress });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduced || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    let nearest: SVGGElement | null = null;

    const clear = () => {
      nearest?.removeAttribute("data-near");
      nearest = null;
    };
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let distance = Number.POSITIVE_INFINITY;
        let next: SVGGElement | null = null;
        for (const anchor of stage.querySelectorAll<SVGGElement>("[data-anchor]")) {
          const rect = anchor.getBoundingClientRect();
          if (!rect.width || !rect.height) continue;
          const dx = event.clientX - (rect.left + rect.width / 2);
          const dy = event.clientY - (rect.top + rect.height / 2);
          const candidate = Math.hypot(dx, dy);
          if (candidate < distance) {
            distance = candidate;
            next = anchor;
          }
        }
        if (next === nearest) return;
        clear();
        nearest = next;
        nearest?.setAttribute("data-near", "");
      });
    };
    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerleave", clear);
    return () => {
      cancelAnimationFrame(frame);
      clear();
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", clear);
    };
  }, [reduced]);

  return (
    <section className={styles.section} aria-labelledby={sloganId}>
      <div ref={ref} className={styles.wrapper} data-motion={motion}>
        <div ref={stageRef} className={styles.stage} data-complete={complete ? "" : undefined}>
          <div className={`${styles.helixWrap} ${styles.desktop}`}>
            <Helix geometry={DESKTOP} />
          </div>
          <div className={`${styles.helixWrap} ${styles.mobile}`}>
            <Helix geometry={MOBILE} />
          </div>
          {/* CRE-02 bant sloganı — marka dili, TR sayfada da İngilizce
              (CLAUDE.md slogan kuralı, DECISIONS "Kasıtlı olarak İngilizce kalanlar"). */}
          <h2 id={sloganId} className={styles.slogan} lang="en">
            {slogan}
          </h2>
        </div>
      </div>
    </section>
  );
}
