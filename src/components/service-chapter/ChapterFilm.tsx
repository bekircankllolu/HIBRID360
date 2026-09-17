"use client";

import type { CSSProperties } from "react";
import type { ServiceFilm } from "@/data/service-films";
import { useScrollScene } from "@/hooks/useScrollScene";
import { ChapterVideo } from "./ChapterVideo";
import styles from "./ChapterFilm.module.css";

/**
 * S2 — film penceresi (sayfanın zirvesi; docs/design/SERVICE_CHAPTER_SYSTEM.md §8).
 *
 * Karanlıkta küçük bir 16:9 pencere; kaydırdıkça ekranı kaplar. Film baştan
 * film alanını kaplar, büyüyen şey yalnızca `clip-path` — reflow yok.
 * Hero'nun sessiz kuyruğundan sonra gelir (zirveden önce sessizlik).
 *
 * Filmin üstünde metin YOK (chaptered editorial: media metnin altına
 * girmez). AI etiketi sahnenin kendi alt satırında: film görünür olduğu
 * sürece etiket de görünür (BeliefFounderVideo'daki uyarı ile aynı kural).
 * Sahne `<figure>`, etiket onun son çocuğu `<figcaption>`.
 *
 * Pencere dikeyde filmin odağına (`film.focusY`) yerleşir: ilk anda
 * görünen, karenin asıl konusu olsun. Poster SSR'da basılır — sahne hero'nun
 * hemen altında; JS yokken de boş bir pencere kalmasın.
 */
export function ChapterFilm({ film, caption }: { film: ServiceFilm; caption: string }) {
  const { ref, motion } = useScrollScene<HTMLDivElement>({ mode: "sticky" });

  return (
    <div ref={ref} className={styles.wrapper} data-motion={motion}>
      <figure
        className={styles.stage}
        style={{ "--focus-y": film.focusY ?? 0.5 } as CSSProperties}
      >
        <div className={styles.frame}>
          <ChapterVideo film={film} className={styles.media} eagerPoster />
        </div>
        <figcaption className={styles.caption}>{caption}</figcaption>
      </figure>
    </div>
  );
}
