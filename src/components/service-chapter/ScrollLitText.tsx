"use client";

import { Fragment, type CSSProperties } from "react";
import { useScrollScene } from "@/hooks/useScrollScene";
import { splitWords } from "@/lib/split-words";
import styles from "./ScrollLitText.module.css";

/**
 * S3 — manifesto: okudukça kelime kelime yanan metin
 * (docs/design/SERVICE_CHAPTER_SYSTEM.md §8). Okuma hızını okur belirler.
 *
 * Görsel katman kelime span'leri (`aria-hidden`); ekran okuyucu cümlenin
 * tamamını gizli bir kopyadan tek parça okur — VoiceOver span'lere bölünmüş
 * metni kelime kelime okuyabiliyor (LessTalk'taki bölünmüş başlık kalıbının
 * paragraf karşılığı). Kelimeler arasındaki boşluklar gerçek metin, yani
 * kopyala-yapıştır da cümleyi olduğu gibi alır. Yanma yalnızca opaklık;
 * JS yoksa ve hareket azaltmada metin tamamen yanık (`--progress` 1).
 *
 * Renk dengesi: her cümle kendi tonunda. Creative'de ilk cümle beyaz
 * (anlatım), ikincisi sarı (bu ekranın tek odağı).
 */

export interface LitSentence {
  text: string;
  tone: "white" | "yellow";
}

function LitSentenceScene({ sentence, index }: { sentence: LitSentence; index: number }) {
  const { ref, motion } = useScrollScene<HTMLDivElement>({ mode: "pass" });
  const words = splitWords(sentence.text);

  return (
    <div
      ref={ref}
      className={styles.scene}
      data-motion={motion}
      data-manifesto-scene=""
      data-align={index % 2 === 0 ? "start" : "end"}
      style={{ "--n": words.length } as CSSProperties}
    >
      <p className={sentence.tone === "yellow" ? styles.yellow : styles.white}>
        <span className="srOnly">{sentence.text}</span>
        <span aria-hidden="true">
          {words.map((word, wordIndex) => (
            <Fragment key={`${word}-${wordIndex}`}>
              {wordIndex > 0 ? " " : null}
              <span
                className={styles.word}
                style={{ "--i": wordIndex } as CSSProperties}
              >
                {word}
              </span>
            </Fragment>
          ))}
        </span>
      </p>
    </div>
  );
}

export function ScrollLitText({ sentences }: { sentences: readonly LitSentence[] }) {
  return (
    <section className={styles.lit}>
      {sentences.map((sentence, index) => (
        <LitSentenceScene key={sentence.text} sentence={sentence} index={index} />
      ))}
    </section>
  );
}
