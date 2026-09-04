"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./LessTalk.module.css";

/**
 * HOME-05 — 3. ekran açılış metni. Kaynak: mevcut site, deck'te
 * "özne–yüklem, noktalama, marka yazımı" düzeltilmiş hâliyle verilmiş.
 *
 * Eylül 2026 revizyonu (müşteri): başlık highlight bloklarına alındı,
 * sarı kutular yeniden kompoze edildi ve bölüm scroll'a tepki verir hâle
 * getirildi.
 *
 * Kutuların eski hâlindeki sorun: sabit `min-height` + `space-between`
 * numarayı en üste, metni en alta itiyordu; aradaki sarı alan ölü boşluk
 * olarak kalıyordu (özellikle kısa metinli 1. kutuda). Kutular artık
 * içeriklerine göre boyutlanıyor, ızgara `align-items: start` ile her
 * kutunun kendi yüksekliğinde durmasını sağlıyor.
 *
 * Hareket kuralları (CLAUDE.md):
 *   - Yeni kütüphane yok; IntersectionObserver + rAF, HeroTypography'deki
 *     desenin aynısı. Yeni WebGL sahnesi açılmıyor.
 *   - prefers-reduced-motion açıkken hiçbir dönüşüm uygulanmaz, bölüm
 *     doğrudan son hâliyle durur.
 *   - Paralaks yalnızca geniş ekranda çalışır; mobilde ızgara tek kolona
 *     düştüğü için yalnızca kademeli beliriverme kalır.
 */

/**
 * Başlığı satırlara böler. Deck metnine dokunulmaz (CLAUDE.md: "SİTEYE
 * GİRECEK METİN" kutuları birebir kopyalanır) — yalnızca çizim için
 * virgülden ayrılır ve virgül görselde düşürülür:
 *   "Less Talk, More Work" → ["Less Talk", "More Work"]
 *   "Az Laf, Çok İş"       → ["Az Laf", "Çok İş"]
 *
 * Büyük harf CSS'te (`text-transform`), metinde değil. Erişilebilir ad
 * h2'nin aria-label'ında özgün hâliyle ("Az Laf, Çok İş") duruyor —
 * ekran okuyucu ve arama motoru virgüllü, doğru büyük/küçük harfli
 * cümleyi okumaya devam eder.
 */
function splitTitleIntoLines(title: string): string[] {
  return title
    .split(",")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

/**
 * Madde metnindeki tasarım satırları.
 *
 * Satır kırılımları metnin kendisinde `\n` olarak duruyor (messages/*.json).
 * Sebebi ölçümle sabit: müşterinin verdiği kırılımlar doğal sarmayla elde
 * edilemiyor — 02 maddesi için sütunun aynı anda ≥498.3px (1. satır
 * sığsın diye) ve <474.8px ("her" 4. satıra çıkmasın diye) olması
 * gerekiyordu; böyle bir genişlik yok. Yani kırılımlar tasarımda elle
 * verilmiş ve veriyle taşınmaları gerekiyor.
 *
 * Dar ekranda bu sabit satırlar taşacağı için CSS'te satırlar inline'a
 * dönüyor ve metin doğal olarak yeniden sarıyor.
 */
function splitIntoDesignLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function LessTalk() {
  const t = useTranslations("home.lessTalk");
  const paragraphs = t.raw("paragraphs") as string[];
  const title = t("title");
  const titleLines = splitTitleIntoLines(title);

  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [motionReady, setMotionReady] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Beliriverme. Sunucu render'ında hiçbir hareket niteliği basılmaz; bölüm
  // JS olmadan da tam görünür durur. Mount anında zaten ekrandaysa aynı
  // commit'te açılır, böylece görünür içerik bir an gizlenip geri gelmez.
  useEffect(() => {
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    setMotionReady(true);

    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // NOT: Maddelere daha önce madde başına farklı hızda paralaks
  // uygulanıyordu. Referans kompozisyonun dikey boşlukları çok dar (02 ile
  // 03 arası yalnızca 6.8px) ve paralaks maddeleri birbirine göre ±42px
  // ötelediği için metinler kaydırma sırasında üst üste biniyordu —
  // ölçülen en kötü bindirme 1280-1920 arası her genişlikte 24-27px.
  // Paralaks kaldırıldı; görünür hareketi zaten kademeli beliriverme
  // sağlıyor ve o, bittiğinde transform bırakmadığı için yerleşimi bozmaz.

  // Hareket nitelikleri render anında türetilir, state'e güvenilmez.
  // usePrefersReducedMotion ilk render'da false döner (hydration uyumu
  // için); efektler o sırada motionReady'yi açıyor. Tercih sonradan true
  // olduğunda efekt yalnızca erken return ederdi ve açılmış nitelik
  // üzerinde kalırdı — bölüm opacity:0'da donup görünmez olurdu. Türetme
  // bu sıralamadan tamamen bağımsız.
  const motionActive = motionReady && !prefersReducedMotion;

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="less-talk-title"
      data-motion={motionActive ? "on" : undefined}
      data-revealed={motionActive ? String(revealed) : undefined}
    >
      {/* Görünen satırlar virgülsüz ve büyük harf; erişilebilir ad
          deck'teki özgün cümle. */}
      <h2 id="less-talk-title" className={styles.title} aria-label={title}>
        {titleLines.map((line) => (
          <span className={styles.titleLine} key={line} aria-hidden="true">
            <span className={styles.titleMark}>{line}</span>
          </span>
        ))}
      </h2>
      <ol className={styles.body}>
        {paragraphs.map((paragraph, index) => (
          <li
            className={styles.itemSlot}
            key={index}
            style={{ "--panel-order": index } as React.CSSProperties}
          >
            <article className={styles.item}>
              <span className={styles.index} aria-hidden="true">
                0{index + 1}
              </span>
              <p className={styles.itemText}>
                {splitIntoDesignLines(paragraph).map((line, lineIndex, all) => (
                  <span className={styles.line} key={line}>
                    {/* Dar ekranda satırlar inline'a döndüğünde kelimeler
                        birbirine yapışmasın diye araya boşluk. Blok
                        hâlindeyken bu boşluk zaten yok sayılır. */}
                    {lineIndex < all.length - 1 ? `${line} ` : line}
                  </span>
                ))}
              </p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
