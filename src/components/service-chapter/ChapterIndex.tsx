"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useScrollScene } from "@/hooks/useScrollScene";
import { activeIndex, rangeProgress } from "@/lib/scroll-scene";
import { ChapterRule } from "./ChapterRule";
import { ChapterVisualDeck, type ChapterVisual } from "./ChapterVisualDeck";
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
 * `aside` — listenin yanındaki boşluğa sayfaya özel bir içerik konabilir
 * (Creative: parallax görsel alanı, DECISIONS #48; önceki kristal çizimi
 * kullanıcı isteğiyle kaldırıldı). ≥1024px'te sayfanın sağ yarısında,
 * dar ekranda listenin altında; verilmezse liste tek sütun tam genişlik
 * kaplar (geri kalan sayfalar için varsayılan).
 */
export function ChapterIndex({
  title,
  items,
  aside,
  visuals,
  visualIndexByItem,
  visualCaption,
}: {
  title: string;
  items: readonly string[];
  aside?: ReactNode;
  visuals?: readonly ChapterVisual[];
  visualIndexByItem?: readonly number[];
  visualCaption?: string;
}) {
  const titleId = useId();
  const reduced = usePrefersReducedMotion();
  const [touch, setTouch] = useState(false);
  const [active, setActive] = useState(-1);
  const [preview, setPreview] = useState(-1);
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
  const focusedItem = spotlight ? active : preview;
  const visualIndex =
    focusedItem >= 0 ? (visualIndexByItem?.[focusedItem] ?? focusedItem) : 0;
  const hasVisualDeck = Boolean(visuals?.length && visualCaption);

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
        <ol className={styles.list} role="list" onPointerLeave={() => setPreview(-1)}>
          {items.map((item, index) => (
            <li
              key={item}
              className={styles.item}
              data-active={spotlight && index === active ? "" : undefined}
              onPointerEnter={() => setPreview(index)}
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
        {hasVisualDeck ? (
          <div className={styles.aside}>
            <ChapterVisualDeck
              visuals={visuals!}
              activeIndex={visualIndex}
              caption={visualCaption!}
            />
          </div>
        ) : aside ? (
          <div className={styles.aside}>{aside}</div>
        ) : null}
      </div>
    </section>
  );
}
