"use client";

import { useCallback, useEffect, useId, useRef, type CSSProperties, type MutableRefObject } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useScrollScene } from "@/hooks/useScrollScene";
import { ChapterRule } from "./ChapterRule";
import type { SignatureGeometry, SignatureRole } from "./service-signature/geometry";
import styles from "./ServiceSignatureDrawing.module.css";

/**
 * Servis sayfalarının imza sahnesi: pen tool sayfanın kendi enstrümanını
 * kaydırma boyunca çizer. Creative'in `DnaHelix`'inin genelleştirilmiş
 * kardeşi — geometri sayfaya özel, motor ortak.
 *
 * Mekanik — JS `--progress` yazar ve kalem ucunu aktif SVG yolunda yürütür:
 * - Her yol `pathLength="1"` ile normalize edilir; `stroke-dasharray: 1` ve
 *   `stroke-dashoffset: 1 - p` ile kendi yönünde çizilir. DnaHelix soldan
 *   sağa açılan bir clipPath kullanıyor (orada iplikler hep soldan sağa
 *   ilerliyor); buradaki geometriler halka, yay ve topoloji içerdiği için
 *   yolun KENDİ yönünde ilerleyen dashoffset doğru olan. `non-scaling-stroke`
 *   bilinçli kullanılmadı: DnaHelix'te not edildiği gibi ikisi birlikte bazı
 *   tarayıcılarda yanlış hesaplanıyor. Çizgi kalınlığı bunun yerine
 *   breakpoint'te büyür.
 * - Her yolun kendi `--from`/`--to` aralığı var: sahnenin koreografisi
 *   geometride yazılı, sayfadan sayfaya farklı.
 * - Kaydırma geri alınınca `--progress` düşer, çizim geri sarılır.
 * - Anchor kareleri çizim kendilerine vardığında belirir; imlece 90px'den
 *   yakın olan anchor büyür (DnaHelix kalıbı + mesafe sınırı: uzak bir
 *   anchor sürekli seçili kalmasın).
 * - Hareket azaltmada `--progress` 1: çizim ilk kareden itibaren tamamlanmış.
 * - Mobil geometri verilmişse (`mobileGeometry`) DnaHelix'teki gibi iki ayrı
 *   SVG render edilir, CSS breakpoint'i hangisinin görüneceğini seçer —
 *   masaüstü küçültülmüş hâli değil, gerçek bir yeniden yerleşim.
 *   Verilmemişse (henüz taşınmamış sayfalar) eski tek-SVG davranışı korunur.
 *
 * SVG dekoratiftir (`aria-hidden`); bölümün anlamını `ChapterRule` başlığı
 * ve altındaki metin taşır.
 */

/** viewBox payı — kenardaki anchor kareleri kırpılmasın. */
const PAD = 34;
const DRAW_START = 0.04;
const DRAW_DURATION = 0.72;
/** Pointer bir anchor'a bu mesafeden (px) uzaksa hiçbiri "yakın" sayılmaz. */
const NEAR_THRESHOLD = 90;

function drawProgress(progress: number): number {
  return Math.min(1, Math.max(0, (progress - DRAW_START) / DRAW_DURATION));
}

function pathClass(role: SignatureRole): string {
  if (role === "front") return styles.front;
  if (role === "back") return styles.back;
  if (role === "accent") return styles.accent;
  return styles.construction;
}

/** Bir geometrinin kalem ucunu aktif yol üzerinde yürüten durum + fonksiyon. */
function useSignaturePen(geometry: SignatureGeometry) {
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const penRef = useRef<SVGGElement>(null);

  const position = useCallback(
    (progress: number) => {
      const pen = penRef.current;
      if (!pen) return;

      const draw = drawProgress(progress);
      if (draw <= 0.002 || draw >= 0.997) {
        pen.style.opacity = "0";
        return;
      }

      let activeIndex = -1;
      for (let index = 0; index < geometry.paths.length; index += 1) {
        const path = geometry.paths[index];
        if (draw >= path.from && draw <= path.to) activeIndex = index;
      }

      if (activeIndex < 0) {
        activeIndex = geometry.paths.reduce(
          (latest, path, index) => (path.to <= draw ? index : latest),
          0,
        );
      }

      const definition = geometry.paths[activeIndex];
      const path = pathRefs.current[activeIndex];
      if (!definition || !path) return;

      const span = Math.max(0.001, definition.to - definition.from);
      const local = Math.min(1, Math.max(0, (draw - definition.from) / span));
      const length = path.getTotalLength();
      const point = path.getPointAtLength(length * local);
      const next = path.getPointAtLength(Math.min(length, length * local + 0.8));
      const angle = Math.atan2(next.y - point.y, next.x - point.x) * (180 / Math.PI);

      pen.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle - 90})`);
      pen.style.opacity = "1";
    },
    [geometry],
  );

  return { pathRefs, penRef, position };
}

function SignatureSvg({
  geometry,
  pathRefs,
  penRef,
  className,
}: {
  geometry: SignatureGeometry;
  pathRefs: MutableRefObject<Array<SVGPathElement | null>>;
  penRef: MutableRefObject<SVGGElement | null>;
  className: string;
}) {
  return (
    <svg
      className={className}
      data-signature=""
      viewBox={`${-PAD} ${-PAD} ${geometry.width + 2 * PAD} ${geometry.height + 2 * PAD}`}
      aria-hidden="true"
      focusable="false"
    >
      {geometry.paths.map((path, index) => (
        <path
          key={path.id}
          ref={(node) => {
            pathRefs.current[index] = node;
          }}
          className={`${styles.path} ${pathClass(path.role)}`}
          data-role={path.role}
          d={path.d}
          pathLength={1}
          style={{ "--from": path.from, "--to": path.to } as CSSProperties}
        />
      ))}

      {geometry.handles.map((handle, index) => (
        <g key={`handle-${index}`} className={styles.handle} style={{ "--t": handle.t } as CSSProperties}>
          <path
            className={styles.handleLine}
            d={`M${handle.inX} ${handle.inY}L${handle.x} ${handle.y}L${handle.outX} ${handle.outY}`}
          />
          <circle className={styles.handleEnd} cx={handle.inX} cy={handle.inY} r={4} />
          <circle className={styles.handleEnd} cx={handle.outX} cy={handle.outY} r={4} />
        </g>
      ))}

      {geometry.nodes.map((node, index) => (
        <g
          key={`node-${index}`}
          className={styles.anchor}
          data-anchor=""
          style={{ "--t": node.t } as CSSProperties}
        >
          <rect
            className={node.kind === "filled" ? styles.nodeFilled : styles.nodeHollow}
            x={node.x - 4.5}
            y={node.y - 4.5}
            width={9}
            height={9}
          />
        </g>
      ))}

      <g ref={penRef} className={styles.pen}>
        <path className={styles.nib} d="M0 0L-8 -17L0 -26L8 -17Z" />
        <path className={styles.nibSlit} d="M0 0L0 -12" />
        <circle className={styles.nibHole} cx={0} cy={-13} r={2} />
      </g>
    </svg>
  );
}

export function ServiceSignatureDrawing({
  geometry,
  mobileGeometry,
  title,
  caption,
}: {
  geometry: SignatureGeometry;
  /** Gerçek mobil yeniden yerleşim. Verilmezse `geometry` tüm genişliklerde kullanılır (eski davranış). */
  mobileGeometry?: SignatureGeometry;
  title: string;
  caption?: string;
}) {
  const titleId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const desktopPen = useSignaturePen(geometry);
  const mobilePen = useSignaturePen(mobileGeometry ?? geometry);

  const onProgress = useCallback(
    (progress: number) => {
      desktopPen.position(progress);
      if (mobileGeometry) mobilePen.position(progress);
    },
    [desktopPen, mobilePen, mobileGeometry],
  );

  const { ref, motion } = useScrollScene<HTMLDivElement>({
    mode: "sticky",
    onProgress,
  });

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
        let shortest = Number.POSITIVE_INFINITY;
        let candidate: SVGGElement | null = null;

        for (const anchor of stage.querySelectorAll<SVGGElement>("[data-anchor]")) {
          const rect = anchor.getBoundingClientRect();
          if (!rect.width || !rect.height) continue;
          const distance = Math.hypot(
            event.clientX - (rect.left + rect.width / 2),
            event.clientY - (rect.top + rect.height / 2),
          );
          if (distance < shortest) {
            shortest = distance;
            candidate = anchor;
          }
        }

        if (shortest > NEAR_THRESHOLD) candidate = null;
        if (candidate === nearest) return;
        clear();
        nearest = candidate;
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
    <section className={styles.section} aria-labelledby={titleId}>
      <div ref={ref} className={styles.wrapper} data-motion={motion}>
        <div ref={stageRef} className={styles.stage}>
          <ChapterRule title={title} id={titleId} />

          <SignatureSvg
            geometry={geometry}
            pathRefs={desktopPen.pathRefs}
            penRef={desktopPen.penRef}
            className={mobileGeometry ? `${styles.drawing} ${styles.desktop}` : styles.drawing}
          />
          {mobileGeometry ? (
            <SignatureSvg
              geometry={mobileGeometry}
              pathRefs={mobilePen.pathRefs}
              penRef={mobilePen.penRef}
              className={`${styles.drawing} ${styles.mobile}`}
            />
          ) : null}

          {caption ? <p className={styles.caption}>{caption}</p> : null}
        </div>
      </div>
    </section>
  );
}
