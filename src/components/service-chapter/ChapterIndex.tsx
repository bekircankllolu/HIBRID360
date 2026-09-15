"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useScrollScene } from "@/hooks/useScrollScene";
import { activeIndex, rangeProgress } from "@/lib/scroll-scene";
import { ChapterRule } from "./ChapterRule";
import styles from "./ChapterIndex.module.css";

/**
 * S4 — hizmet dizini: dikey, tek sütunlu liste, her kalem kendi satırında,
 * solda fuşya sıra numarası (docs/design/SERVICE_CHAPTER_SYSTEM.md §8).
 *
 * 13 Eylül 2026: önceki "akan dev kelimeler" (MAG referansı) düzeni
 * kullanıcı tarafından karışık bulundu — uzun bir kalem ikinci satıra
 * taştığında komşu kalemle görsel olarak birleşiyordu. Şimdiki dikey
 * dizin (STRV/portföy referansı) her kalemi kendi satırına sabitliyor.
 *
 * - İmleçli cihazda: üzerine gelinen satır sarı olur ve kısa bir RGB
 *   kayması (glitch) yapar, diğerleri söner — tamamen CSS.
 * - Dokunmatikte hover yok; aynı "bir kalem öne çıkar" deneyimini
 *   kaydırma verir: bölüm ekrandan geçerken sıradaki satır sarı olur.
 * - Hareket azaltmada ikisi de yok, bütün liste beyaz.
 *
 * Hover arkasında zorunlu içerik yok; efekt dekoratif. `role="list"`
 * açıkça yazıldı: Safari `list-style: none` olan listelerin rolünü düşürür.
 *
 * Kullanıcı kararı: görsel/enstrüman hizmet satırlarının içinde değil,
 * listenin ardından gelen tek imza sahnesinde bulunur. Bu bileşen bu yüzden
 * yalnız dizini yönetir.
 */
export function ChapterIndex({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  const titleId = useId();
  const reduced = usePrefersReducedMotion();
  const [touch, setTouch] = useState(false);
  const [active, setActive] = useState(-1);
  const spotlight = touch && !reduced;
  // Kaydırma geri çağırımı her karede çalışır; güncel değeri ref'ten okur,
  // böylece dinleyici her mod değişiminde yeniden kurulmaz.
  const spotlightRef = useRef(spotlight);
  useEffect(() => {
    spotlightRef.current = spotlight;
  }, [spotlight]);

  useEffect(() => {
    const query = window.matchMedia("(hover: none)");
    setTouch(query.matches);
    const onChange = (event: MediaQueryListEvent) => setTouch(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const onProgress = useCallback(
    (progress: number) => {
      if (!spotlightRef.current) return;
      const next = activeIndex(rangeProgress(progress, 0.25, 0.75), items.length);
      // Aynı indeks yeniden yazılırsa React render'dan vazgeçer: kare başına
      // değil, kelime değişiminde tek render.
      setActive(next);
    },
    [items.length],
  );

  // İmleçli cihazlarda odak hover'dan gelir; kaydırma yalnız dokunmatikte dinlenir.
  const { ref, motion } = useScrollScene<HTMLElement>({
    mode: "pass",
    onProgress,
    enabled: spotlight,
  });
  return (
    <section
      ref={ref}
      className={styles.section}
      aria-labelledby={titleId}
      data-motion={motion}
      data-mode={spotlight ? "spotlight" : "hover"}
    >
      <ChapterRule title={title} id={titleId} />
      <div className={styles.layout}>
        <ol className={styles.list} role="list">
          {items.map((item, index) => (
            <li
              key={item}
              className={styles.item}
              data-active={spotlight && index === active ? "" : undefined}
              tabIndex={0}
            >
              <span className={styles.index} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.word} lang="en">
                {item}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
