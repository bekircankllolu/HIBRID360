"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./ParallaxScrollFeature.module.css";

/**
 * Parallax scroll feature — 21st.dev "parallax-scroll-feature-section"
 * bileşeninin görsel animasyonu (DECISIONS #48; kullanıcı: "prompt'ta
 * sadece görsel animasyonunu kullanmak için sana attım... oradaki paralaks
 * efektini kullan").
 *
 * Efekt prompttakiyle aynı: ilerlemenin ilk %70'inde görsel soldan sağa
 * perde açılır gibi belirir (clip-path) ve soluktan netleşir; tüm yol
 * boyunca 50px yukarıdan yerine kayar.
 *
 * Prompttan bilinçli farklar:
 * - İlerlemenin bitişi `center start` değil `center center`. Promptta
 *   hedef ekran boyunda bir bölümdü ve görsel onun ortasındaydı; perde,
 *   görsel ekranın ortasına geldiğinde tamamlanıyordu. Burada hedef
 *   görselin kendisi — `center start` perdeyi görsel ekranın tepesine
 *   varana kadar açık bırakıyordu (ölçüldü: liste okunurken %87 açık,
 *   sağ kenar kesik). Aynı his için bitiş görselin ortası ekranın ortası.
 * - Tailwind/shadcn yok — sitenin CSS Modules yapısı (Tailwind'in temel
 *   stil sıfırlaması bütün sayfaları etkilerdi).
 * - Demo başlığı, "The End" ve lorem metinleri alınmadı; dış CDN görselleri
 *   yerine sayfanın kendi görseli, `next/image` ile.
 * - Hook'lar döngü içinde değil, her örnek kendi bileşeni (React kuralı —
 *   prompttaki kod lint'ten geçmiyordu).
 * - Hareket azaltmada ve JS gelmeden görsel doğrudan açık.
 */
export function ParallaxScrollFeature({
  src,
  alt,
  sizes,
  caption,
}: {
  src: string;
  alt: string;
  /** `next/image` için; görselin sayfadaki genişliği. */
  sizes: string;
  /** Görselin altında durur (ör. AI etiketi), üstüne bindirilmez. */
  caption?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  // Sunucu HTML'i ve ilk kare açık görseli basar; hareket hidrasyondan sonra bağlanır.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const opacity = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const clipPath = useTransform(scrollYProgress, [0, 0.7], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  const y = useTransform(scrollYProgress, [0, 1], [-50, 0]);
  const animate = mounted && !reduced;

  return (
    <figure ref={ref} className={styles.figure} data-motion={animate ? "scroll" : "static"}>
      <motion.div className={styles.frame} style={{ y: animate ? y : 0 }}>
        <motion.div
          className={styles.reveal}
          style={{ opacity: animate ? opacity : 1, clipPath: animate ? clipPath : "none" }}
        >
          <Image src={src} alt={alt} fill sizes={sizes} className={styles.image} />
        </motion.div>
      </motion.div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
