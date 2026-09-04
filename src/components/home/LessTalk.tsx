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
 * Madde metnini cümlelere böler — referans tasarımda her cümle yeni
 * satırda başlıyor, metin değişmiyor.
 *
 * Bunun doğal sarma olmadığı ölçümle doğrulandı: 01 maddesinin ikinci
 * satırı ("Çözüme giden yol budur.") 336px, sütun ise 548px — sonraki
 * kelime rahat sığardı, yani satır bilerek kırılmış. 02 ve 03 tek
 * cümleden olustuğu için bu kuraldan etkilenmez ve doğal sarar; yani tek
 * kural üç maddede de referanstaki kırılımı veriyor.
 *
 * Regex lookbehind yerine kelime döngüsü: Safari 16.4 öncesi için de
 * güvenli ve niyeti daha açık.
 */
function splitIntoSentences(text: string): string[] {
  const lines: string[] = [];
  let current = "";

  for (const word of text.split(" ")) {
    current = current ? `${current} ${word}` : word;
    if (word.endsWith(".")) {
      lines.push(current);
      current = "";
    }
  }
  if (current) lines.push(current);

  return lines;
}

/** Kutu başına paralaks katsayısı — kompozisyon tek parça gibi kaymasın diye farklı. */
const PANEL_PARALLAX_SPEED = [1, -0.6, 0.45];

export function LessTalk() {
  const t = useTranslations("home.lessTalk");
  const paragraphs = t.raw("paragraphs") as string[];
  const title = t("title");
  const titleLines = splitTitleIntoLines(title);

  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [motionReady, setMotionReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [parallaxEnabled, setParallaxEnabled] = useState(false);

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

  // Paralaks yalnızca ızgaranın çok kolonlu olduğu genişlikte anlamlı.
  useEffect(() => {
    if (prefersReducedMotion) return;

    const query = window.matchMedia("(min-width: 801px)");
    setParallaxEnabled(query.matches);

    const onChange = (event: MediaQueryListEvent) => setParallaxEnabled(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!parallaxEnabled || prefersReducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    let frameId: number | null = null;

    // Tek stil yazımı: bölüm ilerlemesi CSS değişkenine yazılır, kutular
    // kendi katsayılarıyla ondan türetir. Kare başına üç yerine bir yazım.
    const update = () => {
      frameId = null;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const travel = viewportHeight + rect.height;
      // Bölüm ekranın altındayken -1, üstünden çıkarken +1.
      const progress = ((viewportHeight - rect.top) / travel) * 2 - 1;
      const clamped = Math.max(-1, Math.min(1, progress));
      section.style.setProperty("--scroll-progress", clamped.toFixed(4));
    };

    const onScroll = () => {
      if (frameId === null) frameId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frameId !== null) cancelAnimationFrame(frameId);
      section.style.removeProperty("--scroll-progress");
    };
  }, [parallaxEnabled, prefersReducedMotion]);

  // Hareket nitelikleri render anında türetilir, state'e güvenilmez.
  // usePrefersReducedMotion ilk render'da false döner (hydration uyumu
  // için); efektler o sırada motionReady'yi açıyor. Tercih sonradan true
  // olduğunda efekt yalnızca erken return ederdi ve açılmış nitelik
  // üzerinde kalırdı — bölüm opacity:0'da donup görünmez olurdu. Türetme
  // bu sıralamadan tamamen bağımsız.
  const motionActive = motionReady && !prefersReducedMotion;
  const parallaxActive = motionActive && parallaxEnabled;

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="less-talk-title"
      data-motion={motionActive ? "on" : undefined}
      data-revealed={motionActive ? String(revealed) : undefined}
      data-parallax={parallaxActive ? "on" : undefined}
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
            style={
              {
                "--panel-speed": PANEL_PARALLAX_SPEED[index] ?? 0,
                "--panel-order": index,
              } as React.CSSProperties
            }
          >
            <article className={styles.item}>
              <span className={styles.index} aria-hidden="true">
                0{index + 1}
              </span>
              <p className={styles.itemText}>
                {splitIntoSentences(paragraph).map((sentence) => (
                  <span className={styles.sentence} key={sentence}>
                    {sentence}
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
