"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMonaMachine } from "@/hooks/useMonaMachine";
import { monaQuestions, AI_DISCLAIMER, type MonaLine, type MonaQuestion } from "@/data/mona";
import styles from "./Mona.module.css";

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
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [compactIndex, setCompactIndex] = useState(0);

  const { setSectionVisible, silence, speak } = machine;

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
          <div
            className={styles.head}
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
            <span className={styles.cameraNotch} aria-hidden="true" />
            <div className={styles.screen}>
              <span className={styles.screenLoop} aria-hidden="true" />
              <span className={styles.screenGrid} aria-hidden="true" />
              <span className={styles.screenLabel}>hello</span>
            </div>
            <span className={styles.statusRail} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className={styles.headBase} aria-hidden="true">
              <span className={styles.driveSlot} />
            </span>
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
