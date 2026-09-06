"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMonaConversation } from "@/hooks/useMonaConversation";
import { briefQuestions } from "@/data/brief-builder";
import { AI_DISCLAIMER } from "@/data/mona";
import styles from "./MonaStage.module.css";

/**
 * MONA Stage — tam ekran konuşma sahnesi.
 *
 * brief-rev12.md Bölüm 11 MONA'yı bir bölüm bileşeni olarak tarif ediyordu;
 * 6 Eylül 2026 müşteri revizyonu bunun tam sayfa, başlatmalı ve dallanan bir
 * asistan deneyimi olmasını istedi. Akışın iskeleti (başlat kapısı → menü →
 * dal → adım adım form → özet) bir referans siteden yapı olarak alındı;
 * görsel dil, karakter, replikler ve renk sistemi tamamen Hibrid 360'ındır.
 *
 * Erişilebilirlik (brief 11.6 — pazarlık yok):
 *   - Sayfa açıldığında hiçbir şey oynamaz. Kullanıcı başlatana kadar MONA
 *     sessizdir; otomatik ses yoktur.
 *   - Sessize alma düğmesi her zaman görünür.
 *   - Esc konuşmayı durdurur, tıklama/Enter yazımı atlar.
 *   - Her replik yazı olarak tam okunur; sayfanın altındaki transkript
 *     sunucu tarafında da render edilir (SEO + ses kapalı deneyim).
 *   - prefers-reduced-motion: daktilo ve geçişler kapanır, içerik tam kalır.
 *
 * TODO: brief 11.6 — MONA karakter videosu (WebM VP9+alfa + MP4) teslim
 * edilince buradaki durağan görsel <video> ile değiştirilecek. Görsel şu an
 * yapay zekâ ile üretilmiş bir yer tutucudur (docs/DECISIONS.md #8/#17).
 */

/**
 * Görselin kapladığı alan viewport GENİŞLİĞİNE değil YÜKSEKLİĞİNE bağlı:
 * `object-fit: contain` ile yükseklik sınırlıyor, genişlik ondan türüyor.
 * En-boy oranı 1260/2119 = 0,595 → genişlik = yükseklik × 0,595.
 *   mobil   : .characterWrap 32svh  → 32 × 0,595 ≈ 19vh
 *   masaüstü: .character     94%    → 94 × 0,595 ≈ 56vh
 * Önceki `100vw` değeri mobilde 960px'lik dosyayı seçtiriyordu; gerçekte
 * boyanan alan ~160 CSS px. Lighthouse bunu 88 KiB gereksiz yük olarak
 * raporladı.
 */
const CHARACTER_SIZES = "(max-width: 900px) 19vh, 56vh";

export function MonaStage({
  locale,
  title,
  lead,
}: {
  locale: Locale;
  /** Sayfanın h1'i — sahne ilk ekranı kapladığı için başlık buraya taşınır. */
  title: string;
  lead: string;
}) {
  const t = useTranslations("mona");
  const tb = useTranslations("brief");
  const reducedMotion = usePrefersReducedMotion();
  const c = useMonaConversation({ locale, reducedMotion });
  const panelRef = useRef<HTMLDivElement>(null);

  const { step, briefQuestion, answers, typing, skipTyping } = c;

  // brief 11.6: Esc ile susturulur — burada yazımı tamamlar ve durdurur.
  // Bağımlılık `c` değil: konuşma nesnesi her render'da yeniden üretiliyor
  // ve dinleyici gereksiz yere her karakterde yeniden bağlanıyordu.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && typing) skipTyping();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [typing, skipTyping]);

  const renderChoices = () => {
    if (!step.choices?.length) return null;
    return (
      <ul className={styles.choices}>
        {step.choices.map((choice) => {
          const label = choice.labelKey
            ? t(`stage.${choice.labelKey}`)
            : choice.label?.[locale];
          if (choice.href) {
            return (
              <li key={choice.id}>
                <Link className={styles.choice} href={choice.href}>
                  {label}
                </Link>
              </li>
            );
          }
          return (
            <li key={choice.id}>
              <button
                type="button"
                className={styles.choice}
                onClick={() => choice.next && c.goTo(choice.next)}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderField = () => {
    if (!briefQuestion) return null;
    const { field, type, options } = briefQuestion;

    return (
      <div className={styles.field}>
        {type === "single" && (
          <>
            <ul className={styles.choices}>
              {options?.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={styles.choice}
                    aria-pressed={answers[field] === option.value}
                    onClick={() => c.setAnswer(field, option.value)}
                  >
                    {option.label[locale]}
                  </button>
                </li>
              ))}
            </ul>
            {field === "budget_band" && (
              // TODO: docs/DECISIONS.md #15 bekleniyor — bütçe bantları
              // How We Work sayfasındakiyle aynı olacak (brief 18.8).
              <p className={styles.note}>{tb("budgetPending")}</p>
            )}
          </>
        )}

        {type === "multi" && (
          <ul className={styles.choices}>
            {options?.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  className={styles.choice}
                  aria-pressed={answers.where_running.includes(option.value)}
                  onClick={() => c.toggleMulti(option.value)}
                >
                  {option.label[locale]}
                </button>
              </li>
            ))}
          </ul>
        )}

        {type === "text" && (
          <label className={styles.inputRow}>
            <span className={styles.srOnly}>{tb("fields.whoFor")}</span>
            <input
              type="text"
              className={styles.input}
              placeholder={tb("fields.whoFor")}
              value={answers.who_for}
              onChange={(event) => c.setAnswer("who_for", event.target.value)}
            />
          </label>
        )}

        {type === "contact" && (
          <>
            <label className={styles.inputRow}>
              <span className={styles.srOnly}>{tb("fields.reference")}</span>
              <input
                type="url"
                className={styles.input}
                placeholder={tb("fields.reference")}
                value={answers.reference_link}
                onChange={(event) =>
                  c.setAnswer("reference_link", event.target.value)
                }
              />
            </label>
            <label className={styles.inputRow}>
              <span className={styles.srOnly}>{tb("fields.email")}</span>
              <input
                type="email"
                required
                className={styles.input}
                placeholder={tb("fields.email")}
                value={answers.contact_email}
                onChange={(event) =>
                  c.setAnswer("contact_email", event.target.value)
                }
              />
            </label>
          </>
        )}
      </div>
    );
  };

  const renderSummary = () => (
    <div className={styles.field}>
      <h2 className={styles.summaryTitle}>{tb("summaryTitle")}</h2>
      <dl className={styles.summary}>
        {briefQuestions.map((question) => {
          const value = answers[question.field];
          const text = Array.isArray(value)
            ? value.join(", ") || tb("notAnswered")
            : value || tb("notAnswered");
          return (
            <div key={question.field}>
              <dt>{question.label[locale]}</dt>
              <dd>{text}</dd>
            </div>
          );
        })}
      </dl>

      {/* KVKK açık rızası olmadan gönderilemez — hem burada hem
          src/lib/submissions.ts içinde sunucu tarafında doğrulanır. */}
      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={c.consent}
          onChange={(event) => c.setConsent(event.target.checked)}
        />
        <span>{tb("consent")}</span>
      </label>
      <p className={styles.note}>{tb("privacyNote")}</p>
      <p className={styles.note}>{tb("aiNote")}</p>

      {c.result && !c.result.ok && (
        <p className={styles.error} role="alert">
          {tb(`errors.${c.result.reason}`)}
        </p>
      )}

      <button
        type="button"
        className={styles.send}
        disabled={c.submitting || !c.consent}
        onClick={() => void c.submit()}
      >
        {c.submitting ? tb("sending") : tb("send")}
      </button>
    </div>
  );

  return (
    <section className={styles.stage} aria-label={t("sectionLabel")}>
      <div className={styles.masthead}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lead}>{lead}</p>
      </div>

      <div className={styles.characterWrap}>
        <picture>
          <source
            type="image/avif"
            sizes={CHARACTER_SIZES}
            srcSet="/images/mona/mona-stage-640.avif 640w, /images/mona/mona-stage-960.avif 960w, /images/mona/mona-stage-1400.avif 1400w"
          />
          <source
            type="image/webp"
            sizes={CHARACTER_SIZES}
            srcSet="/images/mona/mona-stage-640.webp 640w, /images/mona/mona-stage-960.webp 960w, /images/mona/mona-stage-1400.webp 1400w"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.character}
            src="/images/mona/mona-stage-640.webp"
            alt={t("stage.characterAlt")}
            width={640}
            height={1076}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>

      {!c.started && (
        <div className={styles.gate}>
          <button type="button" className={styles.startButton} onClick={c.start}>
            {t("stage.start")}
          </button>
          <p className={styles.gateNote}>{t("stage.startHint")}</p>
        </div>
      )}

      {c.started && (
        <div className={styles.panel} ref={panelRef}>
          {c.previousText && (
            <p className={styles.previous} aria-hidden="true">
              {c.previousText}
            </p>
          )}

          <p
            className={styles.speech}
            aria-live="polite"
            onClick={c.typing ? c.skipTyping : undefined}
          >
            {c.visibleText}
            {c.typing && (
              <span className={styles.caret} aria-hidden="true">
                &nbsp;
              </span>
            )}
          </p>

          {step.kind === "field" && renderField()}
          {step.kind === "summary" && renderSummary()}
          {step.kind === "sent" && <p className={styles.sent}>{tb("sent")}</p>}
          {(step.kind === "menu" || step.kind === "answer") && renderChoices()}

          {step.kind === "field" && (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.advance}
                disabled={!c.canAdvance}
                onClick={c.advance}
                aria-label={t("stage.advance")}
              >
                <span aria-hidden="true">→</span>
              </button>
              <span className={styles.progressLabel}>
                {tb("progress", {
                  current: (step.briefFieldIndex ?? 0) + 1,
                  total: briefQuestions.length,
                })}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={styles.controls}>
        {c.canGoBack && (
          <button type="button" className={styles.control} onClick={c.back}>
            {tb("back")}
          </button>
        )}
        {/* Sessize alma düğmesi her zaman görünür (brief 11.6). Ses
            varlıkları gelene kadar bilgilendirici kalır. */}
        <button
          type="button"
          className={styles.control}
          onClick={c.toggleMuted}
          aria-pressed={c.muted}
        >
          {c.muted ? t("unmute") : t("mute")}
        </button>
      </div>

      <p className={styles.disclaimer}>{AI_DISCLAIMER[locale]}</p>

      {c.progress > 0 && (
        <div
          className={styles.progressBar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(c.progress * 100)}
          aria-label={t("stage.progressLabel")}
        >
          <span style={{ transform: `scaleX(${c.progress})` }} />
        </div>
      )}
    </section>
  );
}
