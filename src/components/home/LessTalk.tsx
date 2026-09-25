"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useScrollScene } from "@/hooks/useScrollScene";
import {
  HAND_CIRCLE_PATH,
  LESS_TALK_EMPHASIS,
  scalePath,
  splitEmphasis,
  splitLead,
} from "./less-talk";
import styles from "./LessTalk.module.css";

/**
 * HOME-05 — 3. ekran açılış metni. Kaynak metin: mevcut site, deck'te
 * "özne–yüklem, noktalama, marka yazımı" düzeltilmiş hâliyle verilmiş.
 * Metne DOKUNULMUYOR (CLAUDE.md: "SİTEYE GİRECEK METİN" kutuları birebir);
 * değişen yalnız o metnin tipografisi ve yerleşimi.
 *
 * ## 25 Eylül 2026 — poster (Syne), 2. tur
 *
 * Kullanıcı kuralları: içi boş başlayıp sonradan dolan tipografi YOK,
 * büyük harf yok (küçük harf), ince→kalın ağırlık geçişi yok.
 *
 * Sanat yönetimi — "az konuşuyoruz, çok çalışıyoruz":
 * - "az laf," küçük, "çok iş" dev; ikisi de Syne ExtraBold (800), durağan
 *   (harf zıplaması denendi, kullanıcı istemedi).
 * - "çok iş"in etrafına elle, hızlıca çekilmiş ince beyaz bir halka.
 * - Maddelerin açılış cümlelerinde TEK kilit kelime aynı halkayla
 *   çevrilir ({@link LESS_TALK_EMPHASIS}).
 * - Sahnenin üstünde baskı greni (statik doku, `mix-blend-mode`).
 *
 * Maddeler: numara · dev açılış cümlesi · gövde ({@link splitLead}).
 */

/** Sığdırma payı: kenar yumuşatması ve alt piksel yuvarlaması için %3. */
const FIT_MARGIN = 1.03;

/**
 * Ölçüm yapılana kadar (font inmeden) kaba sığdırma: harf başına 0,72 em —
 * Syne 800'de ortalama ~0,6 em, yani tahmin geniş ve taşma yok.
 */
const FIT_GUESS_PER_CHAR = 0.72;

function splitTitleIntoLines(title: string): string[] {
  return title
    .split(/(?<=,)\s+/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

function wordsOf(line: string): string[] {
  return line.split(/\s+/).filter((word) => word.length > 0);
}

/** Ekrana girip girmediği; `once` ise ilk girişte kilitlenir. */
function useInView<T extends HTMLElement>(threshold: number, once: boolean) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || (once && inView)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (once && !entry.isIntersecting) return;
        setInView(entry.isIntersecting);
      },
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once, inView]);
  return { ref, inView };
}

/**
 * İnce beyaz halka; `drawn` olunca bir el hareketi hızında çizilir. Kendi
 * kutusunu ölçüp yolu o boyuta sayısal olarak ölçekler ({@link scalePath}):
 * çizgi kalınlığı her eksende aynı kalır ve çizim yolun tamamını kapsar.
 */
function HandCircle({ drawn, className }: { drawn: boolean; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState({ width: 200, height: 100 });
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setBox({ width, height });
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);
  return (
    <svg
      ref={ref}
      className={`${styles.circle} ${className ?? ""}`}
      data-drawn={drawn ? "true" : "false"}
      viewBox={`0 0 ${box.width} ${box.height}`}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={scalePath(HAND_CIRCLE_PATH, box.width / 200, box.height / 100)}
        pathLength={1}
      />
    </svg>
  );
}

/** Açılış cümlesi: kilit kelime (varsa) halkaya alınır; metin aynen kalır. */
function Lead({ text, emphasis }: { text: string; emphasis?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>(1, true);
  const parts = emphasis ? splitEmphasis(text, emphasis) : null;
  if (!parts) return <span className={styles.lead}>{text}</span>;
  return (
    <span className={styles.lead}>
      {parts.before}
      <span ref={ref} className={styles.circled}>
        {parts.word}
        <HandCircle drawn={inView} />
      </span>
      {parts.after}
    </span>
  );
}

/**
 * Madde yuvası — kendi scroll sahnesi. Maddeler sayfada farklı
 * yüksekliklerde durduğu için her madde kendi `--progress`'iyle, ekrana
 * girdiği anda belirir.
 */
function RevealSlot({ children }: { children: ReactNode }) {
  const { ref, motion } = useScrollScene<HTMLLIElement>({ mode: "pass" });
  return (
    <li ref={ref} className={styles.itemSlot} data-motion={motion}>
      {children}
    </li>
  );
}

/**
 * Satırların (ve dar ekran için kelimelerin) em genişliğini ölçer ve
 * başlığa `--fit-line` / `--fit-word` olarak yazar; CSS puntoyu
 * `100cqw / fit` ile verir. Ölçü görünmez bir kopyada alınır: kelimeler
 * ekranda ayrı kutularda (ve "çok iş" harf harf) durduğu için boşluklu düz
 * metin gerçek genişliği veriyor. Em genişliği puntodan bağımsız — font
 * indiğinde bir kez ölçmek yetiyor.
 */
function useFitTitle(title: string) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const heading = ref.current;
    if (!heading) return;
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const widest: Record<string, number> = {};
      heading.querySelectorAll<HTMLElement>("[data-fit]").forEach((element) => {
        const kind = element.dataset.fit ?? "line";
        const probe = document.createElement("span");
        probe.textContent = element.dataset.text ?? element.textContent;
        Object.assign(probe.style, {
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "nowrap",
        });
        element.parentElement?.appendChild(probe);
        const size = parseFloat(getComputedStyle(probe).fontSize);
        if (size && probe.offsetWidth) {
          widest[kind] = Math.max(widest[kind] ?? 0, probe.offsetWidth / size);
        }
        probe.remove();
      });
      Object.entries(widest).forEach(([kind, value]) => {
        heading.style.setProperty(`--fit-${kind}`, (value * FIT_MARGIN).toFixed(4));
      });
    };
    measure();
    void document.fonts?.load("800 1em Syne").then(measure, () => undefined);
    return () => {
      cancelled = true;
    };
  }, [title]);
  return ref;
}

/** Satır: kelimeler ayrı kutularda — geniş ekranda yan yana, dar ekranda alt alta. */
function Words({ text }: { text: string }) {
  return (
    <span className={styles.line} data-fit="line" data-text={text}>
      {wordsOf(text).map((word, index) => (
        <span key={index} className={styles.word} data-fit="word" data-text={word}>
          {word}
        </span>
      ))}
    </span>
  );
}

export function LessTalk() {
  const t = useTranslations("home.lessTalk");
  const locale = useLocale() === "en" ? "en" : "tr";
  const paragraphs = t.raw("paragraphs") as string[];
  const title = t("title");
  const lines = splitTitleIntoLines(title);
  const [talk = "", work = ""] = lines;
  const emphasis = LESS_TALK_EMPHASIS[locale];

  const titleRef = useFitTitle(title);
  const { ref: workRef, inView: circled } = useInView<HTMLSpanElement>(0.6, true);

  const longestLine = Math.max(talk.length, work.length);
  const longestWord = Math.max(...lines.flatMap(wordsOf).map((word) => word.length), 1);
  const titleStyle = {
    "--fit-line": (longestLine * FIT_GUESS_PER_CHAR).toFixed(2),
    "--fit-word": (longestWord * FIT_GUESS_PER_CHAR).toFixed(2),
  } as CSSProperties;
  const count = String(paragraphs.length).padStart(2, "0");

  return (
    <section className={styles.section} aria-labelledby="less-talk-title">
      <div className={styles.stage}>
        {/* Görünen satırlar küçük harf ve dekoratif (aria-hidden);
            erişilebilir ad deck'teki özgün cümle. */}
        <h2
          id="less-talk-title"
          ref={titleRef}
          className={styles.title}
          aria-label={title}
          style={titleStyle}
        >
          <span className={`${styles.row} ${styles.talk}`} aria-hidden="true">
            <Words text={talk} />
          </span>
          <span ref={workRef} className={`${styles.row} ${styles.work}`} aria-hidden="true">
            <Words text={work} />
            <HandCircle drawn={circled} className={styles.workCircle} />
          </span>
        </h2>

        {/* Künye: posterin alt kenarı. Marka yazımı "Hibrid 360" (tek
            yazım); barkod ve sayaç dekoratif. */}
        <div className={styles.colophon} aria-hidden="true">
          <span>Hibrid 360</span>
          <span className={styles.barcode} />
          <span>01 — {count}</span>
        </div>
      </div>

      <ol className={styles.body}>
        {paragraphs.map((paragraph, index) => {
          const { lead, rest } = splitLead(paragraph);
          return (
            <RevealSlot key={index}>
              <article className={styles.item}>
                <span className={styles.index} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className={styles.itemText}>
                  <Lead text={lead} emphasis={emphasis[index]} />
                  {rest ? <span className={styles.rest}>{rest}</span> : null}
                </p>
                {/* Satır üzerinde imleç gezerken soldan sağa akan sarı
                    hairline. Dekoratif; içeriğin taşıyıcısı değil. */}
                <span className={styles.sweep} aria-hidden="true" />
              </article>
            </RevealSlot>
          );
        })}
      </ol>
    </section>
  );
}
