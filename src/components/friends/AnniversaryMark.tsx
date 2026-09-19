"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useScrollScene } from "@/hooks/useScrollScene";
import {
  ANNIVERSARY_GOLD,
  ANNIVERSARY_RAYS,
  ANNIVERSARY_RING,
  ANNIVERSARY_VIEWBOX,
} from "@/data/friends-anniversary";
import styles from "./AnniversaryMark.module.css";

/**
 * "20 YEARS & COUNTING" — çizilen marka işareti.
 *
 * Önceden 863 KB'lık düz bir PNG'ydi (18 Eylül 2026 kullanıcı geri bildirimi:
 * "içinde 20 yazan görsel var, bunu şık bir animasyon haline getir. üzerine
 * geldiğimiz anda yüklensin").
 *
 * İşaret üç parçaya ayrıldı (`scripts/extract-anniversary-mark.mjs`):
 * halka ve 67 ışın VEKTÖR (bu yüzden tek tek çizilebiliyorlar), "2" rakamı ve
 * alt metin alfa kanallı 30 KB'lık webp. Toplam ağırlık ~%96 azaldı.
 *
 * Koreografi `--progress`'e bağlı (useScrollScene "pass"), zamana değil:
 *   .06 → .34  halka soldan saat yönünde çizilir
 *   .18 → .60  ışınlar saat yönünde, merkezden DIŞA doğru sırayla fırlar
 *   .30 → .54  "2" ve metin belirir
 * İmleç üzerine gelince altın parlama işaretin üzerinden geçer.
 *
 * Yükleme: raster katman ancak bölüm görünür alana yaklaşınca DOM'a girer —
 * sayfanın üstündeki taç videosunu görüp geri dönen ziyaretçi 30 KB'ı
 * indirmez. Vektör kısmı zaten HTML'in içinde, ek istek yok.
 *
 * Hareket azaltmada `--progress` 1: işaret tam çizili, hiçbir geçiş yok.
 */
export function AnniversaryMark({ label }: { label: string }) {
  const { ref, motion } = useScrollScene<HTMLDivElement>({ mode: "pass" });
  const [typeReady, setTypeReady] = useState(false);

  // Raster katman sahne kabına bağlı: aynı düğümü gözlüyoruz, ayrı bir ref
  // birleştirmeye gerek yok.
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setTypeReady(true);
        observer.disconnect();
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [ref]);

  const size = ANNIVERSARY_VIEWBOX;

  return (
    <div
      ref={ref}
      className={styles.host}
      data-motion={motion}
      style={{ "--n": ANNIVERSARY_RAYS.length } as CSSProperties}
    >
      <svg
        className={styles.svg}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={label}
      >
        <defs>
          <linearGradient id="anniversary-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={ANNIVERSARY_GOLD.from} />
            <stop offset="1" stopColor={ANNIVERSARY_GOLD.to} />
          </linearGradient>
        </defs>

        {/* pathLength=1 → dashoffset birimi yolun oranı; geometriden bağımsız
            tek formül (imza çizimlerindeki kalıbın aynısı). */}
        <circle
          className={styles.ring}
          cx={ANNIVERSARY_RING.cx}
          cy={ANNIVERSARY_RING.cy}
          r={ANNIVERSARY_RING.r}
          pathLength={1}
          fill="none"
          stroke="url(#anniversary-gold)"
          strokeWidth={ANNIVERSARY_RING.stroke}
        />

        <g className={styles.rays}>
          {ANNIVERSARY_RAYS.map((ray, index) => (
            <line
              key={`${ray.x1}-${ray.y1}`}
              className={styles.ray}
              x1={ray.x1}
              y1={ray.y1}
              x2={ray.x2}
              y2={ray.y2}
              pathLength={1}
              stroke="url(#anniversary-gold)"
              strokeWidth={ray.w}
              strokeLinecap="round"
              style={{ "--i": index } as CSSProperties}
            />
          ))}
        </g>

        {typeReady ? (
          <image
            className={styles.type}
            href="/images/site/friends/anniversary-type.webp"
            x={0}
            y={0}
            width={size}
            height={size}
          />
        ) : null}
      </svg>
    </div>
  );
}
