"use client";

import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { useScrollScene } from "@/hooks/useScrollScene";
import { Link } from "@/i18n/navigation";
import styles from "./CreativeArchive.module.css";

/**
 * Creative kontak baskısı — gerçek kampanya galerisi teslim edilene kadarki
 * hâli.
 *
 * 19 Eylül 2026 kullanıcı isteği: *"bu dijital sayfası altındaki 'içerik
 * hazırlanıyor' diye üstte 4 tane kutucuk var, buraya da temsili görseller
 * koyabiliriz. Yine görsellere bir hareket de verebiliriz."*
 *
 * Kareler artık boş değil: dördü de What We Do v4 setiyle AYNI görsel
 * dilden (siyah baskın kadraj, tek pratik sarı ışık, tek fuşya gösterge,
 * 50mm f/2) — yaratıcı ekibin işini anlatan sahneler. Temsili oldukları
 * durumun altında AÇIKÇA yazıyor; galerinin hazırlandığı notu da yerinde
 * duruyor, yani hiçbir şey gerçek iş gibi sunulmuyor.
 *
 * Hareket kaydırmaya bağlı (`useScrollScene` "pass"), zamana değil:
 *   - tarama çizgisi kareleri yukarıdan aşağı SIRAYLA tarar (`--scan`),
 *   - her kare kendi kadrajında hafifçe kayar (`--drift`), sıra geciktirmeli;
 *     kontak baskısı sabit bir ızgara değil, canlı bir yüzey gibi duruyor.
 * `prefers-reduced-motion`: ikisi de durur, kareler yerinde kalır.
 */

const FRAMES = [
  { number: "01", src: "/images/site/services/creative/sheet-01.webp" },
  { number: "02", src: "/images/site/services/creative/sheet-02.webp" },
  { number: "03", src: "/images/site/services/creative/sheet-03.webp" },
  { number: "04", src: "/images/site/services/creative/sheet-04.webp" },
] as const;

/** Kare görsellerinin iki dildeki betimlemesi — sloganı tekrarlamaz. */
const FRAME_ALT: Record<(typeof FRAMES)[number]["number"], Record<"tr" | "en", string>> = {
  "01": {
    tr: "Karanlık bir stüdyoda duvara iğnelenmiş storyboard kartlarından birini yerinden alan el",
    en: "A hand lifting one of the storyboard cards pinned to a wall in a dark studio",
  },
  "02": {
    tr: "Masa lambasının altında kâğıda kaba bir anahtar görsel eskizi çizen el",
    en: "A hand sketching a rough key visual on paper under a desk lamp",
  },
  "03": {
    tr: "Siyah duvara iğnelenmiş, yandan gelen ışıkla taranan referans baskıları",
    en: "Reference prints pinned to a black wall, raked by light from one side",
  },
  "04": {
    tr: "Karanlık bir odada yerleşim çıktılarıyla dolu duvarın önünde duran iki kişi",
    en: "Two people standing in front of a wall of layout printouts in a dark room",
  },
};

export function CreativeArchive({
  locale,
  pending,
  link,
}: {
  locale: "tr" | "en";
  pending: { label: string; message: string; representative: string };
  link: { href: string; label: string };
}) {
  const { ref, motion } = useScrollScene<HTMLDivElement>({ mode: "pass" });

  return (
    <section className={styles.archive} aria-labelledby="creative-archive-title">
      <div ref={ref} className={styles.contactSheet} data-motion={motion}>
        {FRAMES.map((frame, index) => (
          <figure
            key={frame.number}
            className={styles.frame}
            data-archive-frame=""
            style={{ "--i": index } as CSSProperties}
          >
            {/* next/image kullanılmıyor: kareler sabit oranlı, sabit ölçülü
                ve zaten hedef boyutunda üretildi (1200x800 webp, ~40-66 KB).
                Ek bir optimizasyon katmanı kazanç vermez, istek ekler. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.photo}
              src={frame.src}
              width={1200}
              height={800}
              alt={FRAME_ALT[frame.number][locale]}
              loading="lazy"
              decoding="async"
            />
            <span className={styles.number} aria-hidden="true">
              {frame.number}
            </span>
            <i className={styles.scan} aria-hidden="true" />
          </figure>
        ))}
      </div>

      <div className={styles.status}>
        <p id="creative-archive-title" className={styles.pending} role="status">
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.pendingLabel}>{pending.label}</span>
          <span>{pending.message}</span>
          {/* Temsili görsel açıklaması — CLAUDE.md'nin dürüstlük kuralı:
              AI ile üretilmiş bir görsel gerçek iş gibi sunulmaz. */}
          <span className={styles.representative}>{pending.representative}</span>
        </p>
        <Link href={link.href} className={styles.link}>
          {link.label}
          <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
        </Link>
      </div>
    </section>
  );
}
