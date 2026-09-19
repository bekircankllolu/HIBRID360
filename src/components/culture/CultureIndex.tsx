"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useScrollScene } from "@/hooks/useScrollScene";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Link } from "@/i18n/navigation";
import styles from "./CultureIndex.module.css";

export interface CultureIndexItem {
  href: string;
  title: string;
  /** Dekoratif önizleme — bağlantının anlamını başlık taşıyor, alt metni yok. */
  image: string;
}

/**
 * Culture hub'ının bölüm listesi — büyük tipografik indeks.
 *
 * Eski hâli numaralı kartlardı (17 Eylül 2026 kullanıcı geri bildirimi:
 * "yazılar kutunun kenarına çok yakın, daha havalı bir yapı kuralım, farklı
 * bir animasyon bulalım"). Üç yön prototiplendi; bu, monks.com'un tipografi
 * diline en yakın olan ve mobilde en okunaklı kalan yön.
 *
 * Etkileşim katmanları:
 * - Scroll'a BAĞLI açılış: liste görünüme girdikçe satır çizgileri soldan
 *   çizilir, başlıklar alttan yerine oturur. Zamana değil `--progress`'e
 *   bağlı — geri kaydırınca geri sarılır (useScrollScene "pass" modu).
 * - Hover / klavye odağı: satır aşağıdan marka sarısıyla dolar, metin
 *   SİYAHA döner (CLAUDE.md kontrast kuralı: sarı zeminde siyah metin).
 * - İmleç önizlemesi: hassas işaretçili cihazlarda imleci yumuşakça takip
 *   eden, bölümle ilgili siyah-sarı bir görsel. Dokunmatikte ve hareket
 *   azaltmada hiç oluşmaz.
 */
export function CultureIndex({ items }: { items: readonly CultureIndexItem[] }) {
  const { ref, motion } = useScrollScene<HTMLUListElement>({ mode: "pass" });
  const reducedMotion = usePrefersReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  // Görsel ile görünürlük ayrı: imleç çıkınca önizleme SÖNERKEN son
  // görseli taşımaya devam etsin, arka plan anında boşa düşmesin.
  const [peekImage, setPeekImage] = useState<string | null>(null);
  const [peekVisible, setPeekVisible] = useState(false);
  const peekRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointer(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const peekEnabled = finePointer && !reducedMotion;

  // Önizleme imleci gecikmeli izler (lerp). Döngü yalnız görselken döner.
  useEffect(() => {
    if (!peekEnabled || !peekVisible) return;
    const peek = peekRef.current;
    if (!peek) return;
    let frame = 0;
    const current = { ...target.current };
    const tick = () => {
      current.x += (target.current.x - current.x) * 0.16;
      current.y += (target.current.y - current.y) * 0.16;
      peek.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%) rotate(-4deg)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [peekEnabled, peekVisible]);

  return (
    <div
      className={styles.wrap}
      onPointerMove={(event) => {
        target.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerLeave={() => setPeekVisible(false)}
    >
      <ul ref={ref} className={styles.list} data-motion={motion}>
        {items.map((item, index) => (
          <li
            key={item.href}
            className={styles.row}
            style={{ "--i": index } as CSSProperties}
            onPointerEnter={() => {
              setPeekImage(item.image);
              setPeekVisible(true);
            }}
          >
            <Link
              href={item.href}
              className={styles.link}
              onFocus={() => setPeekVisible(false)}
            >
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.title}>{item.title}</span>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {peekEnabled ? (
        <div
          ref={peekRef}
          className={styles.peek}
          data-visible={peekVisible}
          style={peekImage ? { backgroundImage: `url(${peekImage})` } : undefined}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
