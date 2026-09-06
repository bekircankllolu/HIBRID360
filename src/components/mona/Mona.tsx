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
 * MONA karakter videosu sessiz ve etkileşimli çalışır. Masaüstünde
 * imlecin yatay konumu klibin zaman çizelgesini, dikey konumu ise hafif
 * perspektif eğimini yönetir; dokunmatik cihazlarda klip döngüye girer.
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
  const characterRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pointerFrameRef = useRef<number | null>(null);
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

  // Masaustunde yatay imlec konumu videonun zaman cizelgesine baglanir.
  // Boylece klipteki televizyon kafa saga ve sola bakarak imleci izler.
  // Dikey konum yalnizca cok hafif bir perspektif egimi verir. Dokunmatik
  // cihazlarda video sessiz bir dongu olarak oynar.
  useEffect(() => {
    const video = videoRef.current;
    const character = characterRef.current;
    if (!video || !character) return;

    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const positionAtRest = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      video.pause();
      video.currentTime = video.duration * 0.5;
    };

    const onLoadedMetadata = () => {
      if (reducedMotion) {
        positionAtRest();
      } else if (hasFinePointer) {
        positionAtRest();
      } else {
        void video.play().catch(() => undefined);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!hasFinePointer || reducedMotion || !Number.isFinite(video.duration)) return;
      if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);

      pointerFrameRef.current = requestAnimationFrame(() => {
        const xProgress = Math.min(1, Math.max(0, event.clientX / window.innerWidth));
        const yProgress = Math.min(1, Math.max(0, event.clientY / window.innerHeight));
        const safeStart = video.duration * 0.06;
        const safeRange = video.duration * 0.88;
        video.currentTime = safeStart + safeRange * xProgress;
        character.style.setProperty("--mona-tilt-x", `${(0.5 - yProgress) * 4}deg`);
        character.style.setProperty("--mona-tilt-y", `${(xProgress - 0.5) * 5}deg`);
      });
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    if (video.readyState >= 1) onLoadedMetadata();

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      window.removeEventListener("pointermove", onPointerMove);
      if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
    };
  }, [reducedMotion]);

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
        <div ref={characterRef} className={styles.character}>
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
            <video
              ref={videoRef}
              className={styles.characterVideo}
              src="/videos/mona-tv-head.mp4"
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
            <span className={styles.videoSheen} aria-hidden="true" />
          </div>
          <p className={styles.mediaNote}>{t("pointerHint")}</p>
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
            <div className={styles.questionGroups}>
              <section>
                <h2 className={styles.groupTitle}>{t("generalQuestions")}</h2>
                <ul className={styles.questionList}>
                  {monaQuestions.slice(0, 18).map((question) => (
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
              </section>
              <section>
                <h2 className={styles.groupTitle}>{t("aiQuestions")}</h2>
                <ul className={styles.questionList}>
                  {monaQuestions.slice(18).map((question) => (
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
              </section>
            </div>
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
