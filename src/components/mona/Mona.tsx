"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMonaMachine } from "@/hooks/useMonaMachine";
import { useMonaGaze } from "@/hooks/useMonaGaze";
import { monaQuestions, AI_DISCLAIMER, type MonaLine, type MonaQuestion } from "@/data/mona";
import styles from "./Mona.module.css";

/** Figür masaüstünde en fazla 420px, mobilde kolon genişliği kadar. */
const FIGURE_SIZES = "(max-width: 900px) 70vw, 420px";

/**
 * MONA — brief-rev12.md Bölüm 11.
 *
 * Erişilebilirlik kuralları (brief 11.6, pazarlık yok):
 *   - Otomatik başlayan ses YOK. Machine `muted: true` ile başlar ve ses
 *     varlıkları gelene kadar hiçbir ses öğesi render edilmez.
 *   - Her replik yazı olarak tam okunur; ses kapalıyken deneyim eksiksiz.
 *   - Sessize alma düğmesi her zaman görünür.
 *   - Klavye: sorular tab ile gezilir, Enter ile açılır, Esc ile susturulur.
 *   - prefers-reduced-motion: ekran döngüsü durur, daktilo efekti kapanır.
 *
 * TODO: docs/DECISIONS.md #8 bekleniyor — MONA ses kararı. Karar +
 * prodüksiyon tamamlanınca src/data/mona.ts içindeki audioSrc/captionsSrc
 * alanları dolacak ve buradaki <audio> + <track> bloğu devreye girecek.
 * TODO: brief 11.6 — MONA karakter videosu (WebM VP9+alfa + MP4) ve 4:3
 * ekran içi görüntü döngüsü teslim edilince .head bloğundaki CSS silüet
 * gerçek video ile değiştirilecek.
 */

export function Mona({
  locale,
  lines,
  variant = "full",
}: {
  locale: Locale;
  /** Kısa sürüm (ana sayfa) için sırayla gösterilecek replikler. */
  lines?: MonaLine[];
  variant?: "full" | "compact";
}) {
  const t = useTranslations("mona");
  const reducedMotion = usePrefersReducedMotion();
  const machine = useMonaMachine({ locale, reducedMotion });
  const sectionRef = useRef<HTMLElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [compactIndex, setCompactIndex] = useState(0);

  const { setSectionVisible, silence, speak } = machine;

  // Kafanın imleci takibi. prefers-reduced-motion açıkken hiç bağlanmaz.
  useMonaGaze(figureRef, { enabled: !reducedMotion });

  // brief 11.2: kullanıcı scroll edip başka bölüme geçince MONA susar;
  // geri dönünce kısa bir "geri dönüş" repliği söyler.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setSectionVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [setSectionVisible]);

  // brief 11.6: Esc ile susturulur.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") silence();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [silence]);

  const onQuestionClick = (question: MonaQuestion) => {
    setActiveQuestionId(question.id);
    speak(question);
  };

  const onCompactAdvance = () => {
    if (!lines || lines.length === 0) return;
    const next = (compactIndex + 1) % lines.length;
    setCompactIndex(next);
    speak(lines[next]);
  };

  // Kısa sürümde ilk replik mount'ta gösterilir.
  useEffect(() => {
    if (variant === "compact" && lines && lines.length > 0) {
      speak(lines[0]);
    }
    // Yalnızca mount'ta çalışır; lines sabit bir modül verisidir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  const activeAction =
    variant === "full"
      ? monaQuestions.find((q) => q.id === machine.activeLine?.id)?.action
      : undefined;

  return (
    <section
      ref={sectionRef}
      className={`${styles.stage} ${variant === "compact" ? styles.compact : ""}`}
      aria-label={t("sectionLabel")}
    >
      <div className={styles.inner}>
        <div className={styles.character}>
          {/* Karakter iki katman: gövde altta, kafa üstte. Kafa imleci
              takip ederek döner (useMonaGaze). Katmanların konumu kaynak
              görselden ölçüldü (1672×941 içinde figür 714×886). Kesim TV
              kasasının altından yapılır, boyundan değil — boyun yalnızca
              gövde katmanındadır.

              Arka plan siyah olduğu için katmanlar şeffaf değil: siyah
              üstünde siyah görünmez. Bu hem dosyaları küçültüyor
              (960px AVIF ikilisi toplam 40 KB) hem de kenar/dikiş
              sorununu tamamen ortadan kaldırıyor. */}
          <div className={styles.figure} ref={figureRef}>
            <picture>
              <source
                type="image/avif"
                sizes={FIGURE_SIZES}
                srcSet="/images/mona/mona-body-480.avif 480w, /images/mona/mona-body-960.avif 960w"
              />
              <source
                type="image/webp"
                sizes={FIGURE_SIZES}
                srcSet="/images/mona/mona-body-480.webp 480w, /images/mona/mona-body-960.webp 960w"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.body}
                src="/images/mona/mona-body-480.webp"
                alt={t("characterAlt")}
                width={480}
                height={340}
                decoding="async"
              />
            </picture>

            <div
              className={styles.headLayer}
              role="button"
              tabIndex={0}
              aria-label={t("headLabel")}
              onClick={machine.registerHeadTap}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  machine.registerHeadTap();
                }
              }}
            >
              <picture>
                <source
                  type="image/avif"
                  sizes={FIGURE_SIZES}
                  srcSet="/images/mona/mona-head-480.avif 480w, /images/mona/mona-head-960.avif 960w"
                />
                <source
                  type="image/webp"
                  sizes={FIGURE_SIZES}
                  srcSet="/images/mona/mona-head-480.webp 480w, /images/mona/mona-head-960.webp 960w"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.headImage}
                  src="/images/mona/mona-head-480.webp"
                  alt=""
                  width={480}
                  height={289}
                  decoding="async"
                />
              </picture>
            </div>
          </div>
          <p className={styles.mediaNote}>{t("mediaPending")}</p>
        </div>

        <div className={styles.dialogue}>
          {/* Replik metni. Ses olsun olmasın her zaman tam okunur —
              brief 11.6: "ses kapalıyken deneyim eksiksiz çalışmalı". */}
          <p
            className={`${styles.speech} ${machine.fadingOut ? styles.speechFading : ""}`}
            aria-live="polite"
          >
            {machine.visibleText}
            {!reducedMotion &&
              machine.activeLine &&
              machine.visibleText.length < machine.activeLine.text[locale].length && (
                <span className={styles.caret} aria-hidden="true">
                  &nbsp;
                </span>
              )}
          </p>

          <div className={styles.controls}>
            {/* Sessize alma düğmesi her zaman görünür (brief 11.6).
                Ses varlıkları gelene kadar bilgilendirici kalır. */}
            <button
              type="button"
              className={styles.controlButton}
              onClick={machine.toggleMuted}
              aria-pressed={machine.muted}
            >
              {machine.muted ? t("unmute") : t("mute")}
            </button>
            <button
              type="button"
              className={styles.controlButton}
              onClick={machine.silence}
            >
              {t("stop")}
            </button>
            {variant === "compact" && lines && lines.length > 1 && (
              <button
                type="button"
                className={styles.controlButton}
                onClick={onCompactAdvance}
              >
                {t("next")}
              </button>
            )}
          </div>

          {variant === "full" && (
            <ul className={styles.questionList}>
              {monaQuestions.map((question) => (
                <li key={question.id}>
                  <button
                    type="button"
                    className={styles.questionButton}
                    aria-pressed={activeQuestionId === question.id}
                    onClick={() => onQuestionClick(question)}
                  >
                    {question.question[locale]}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {activeAction && (
            <Link href={activeAction.href} className={styles.action}>
              {activeAction.label[locale]}
            </Link>
          )}

          {variant === "compact" && (
            <Link href="/what-we-do/ai-creative-production" className={styles.action}>
              AI Creative Production →
            </Link>
          )}
        </div>
      </div>

      {/* MONA-16 — zorunlu ibare, konum/dil değişmez. */}
      <p className={styles.disclaimer}>{AI_DISCLAIMER[locale]}</p>
    </section>
  );
}
