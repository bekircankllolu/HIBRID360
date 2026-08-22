"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { briefQuestions, briefIntro, briefOutro } from "@/data/brief-builder";
import { submitBrief, type SubmissionResult } from "@/lib/submissions";
import styles from "./BriefBuilder.module.css";

/**
 * Brief Builder — brief-rev12.md Bölüm 18.8.
 * Altı soru, ekran ekran sorulur. MONA'nın açılış ve kapanış replikleri
 * SİTEYE GİRECEK METİN kutularından birebir.
 *
 * Gizlilik (brief 18.8 uygulama notu): KVKK açık rıza kutucuğu olmadan
 * form gönderilemez — hem burada hem sunucu tarafında (src/lib/submissions.ts)
 * doğrulanır. Verinin yalnızca teklif süreci için kullanıldığı tek cümleyle
 * sayfada yazar.
 */

interface Answers {
  what_making: string | null;
  who_for: string;
  when_live: string | null;
  where_running: string[];
  budget_band: string | null;
  reference_link: string;
  contact_email: string;
}

const EMPTY_ANSWERS: Answers = {
  what_making: null,
  who_for: "",
  when_live: null,
  where_running: [],
  budget_band: null,
  reference_link: "",
  contact_email: "",
};

export function BriefBuilder({ locale }: { locale: Locale }) {
  const t = useTranslations("brief");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSummary = step >= briefQuestions.length;
  const question = isSummary ? null : briefQuestions[step];

  const toggleMulti = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      where_running: prev.where_running.includes(value)
        ? prev.where_running.filter((v) => v !== value)
        : [...prev.where_running, value],
    }));
  };

  const onSubmit = async () => {
    setSubmitting(true);
    const response = await submitBrief({
      what_making: answers.what_making,
      who_for: answers.who_for || null,
      when_live: answers.when_live,
      where_running: answers.where_running,
      budget_band: answers.budget_band,
      reference_link: answers.reference_link || null,
      contact_email: answers.contact_email,
      kvkk_consent: consent,
      language: locale,
    });
    setResult(response);
    setSubmitting(false);
  };

  if (result?.ok) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.intro}>{briefOutro[locale]}</p>
        <p>{t("sent")}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* MONA konuşur — brief 18.8 açılış metni, birebir. */}
      <p className={styles.intro}>{briefIntro[locale]}</p>

      {result && !result.ok && (
        <p className={styles.error}>{t(`errors.${result.reason}`)}</p>
      )}

      {question && (
        <>
          <p className={styles.progress}>
            {t("progress", { current: step + 1, total: briefQuestions.length })}
          </p>
          <h2 className={styles.question}>{question.label[locale]}</h2>

          {question.type === "single" && (
            <div className={styles.options}>
              {question.options?.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={styles.option}
                  aria-pressed={answers[question.field] === option.value}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [question.field]: option.value }))
                  }
                >
                  {option.label[locale]}
                </button>
              ))}
              {question.field === "budget_band" && (
                // TODO: docs/DECISIONS.md #15 bekleniyor — bütçe bantları
                // How We Work sayfasındakiyle aynı olacak (brief 18.8).
                <p className={styles.pendingNote}>{t("budgetPending")}</p>
              )}
            </div>
          )}

          {question.type === "multi" && (
            <div className={styles.options}>
              {question.options?.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={styles.option}
                  aria-pressed={answers.where_running.includes(option.value)}
                  onClick={() => toggleMulti(option.value)}
                >
                  {option.label[locale]}
                </button>
              ))}
            </div>
          )}

          {question.type === "text" && (
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t("fields.whoFor")}</span>
              <textarea
                className={styles.textarea}
                value={answers.who_for}
                onChange={(event) =>
                  setAnswers((prev) => ({ ...prev, who_for: event.target.value }))
                }
              />
            </label>
          )}

          {question.type === "contact" && (
            <>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>{t("fields.reference")}</span>
                <input
                  type="url"
                  className={styles.input}
                  value={answers.reference_link}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      reference_link: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>{t("fields.email")}</span>
                <input
                  type="email"
                  required
                  className={styles.input}
                  value={answers.contact_email}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      contact_email: event.target.value,
                    }))
                  }
                />
              </label>
              {/* TODO: brief 18.8 — referans DOSYASI yüklemesi
                  (reference_file_url) Cloudflare R2 bucket'ı açılınca
                  eklenecek; şimdilik yalnızca link alanı var. */}
            </>
          )}

          <div className={styles.actions}>
            {step > 0 && (
              <button
                type="button"
                className={styles.secondary}
                onClick={() => setStep((s) => s - 1)}
              >
                {t("back")}
              </button>
            )}
            <button
              type="button"
              className={styles.primary}
              onClick={() => setStep((s) => s + 1)}
            >
              {t("next")}
            </button>
          </div>
        </>
      )}

      {isSummary && (
        <>
          <h2 className={styles.question}>{t("summaryTitle")}</h2>
          <dl className={styles.summary}>
            {briefQuestions.map((q) => {
              const value = answers[q.field];
              const display = Array.isArray(value)
                ? value.join(", ")
                : (value ?? "");
              return (
                <div key={q.field}>
                  <dt>{q.label[locale]}</dt>
                  <dd>{display || t("notAnswered")}</dd>
                </div>
              );
            })}
            <div>
              <dt>{t("fields.email")}</dt>
              <dd>{answers.contact_email || t("notAnswered")}</dd>
            </div>
          </dl>

          {/* brief 18.8: "Toplanan veri yalnızca teklif süreci için
              kullanılır ve bu sayfada tek cümleyle yazılır." */}
          <p className={styles.privacyNote}>{t("privacyNote")}</p>
          {/* brief 18.8: yapay zekâ kullanılıyorsa tek cümleyle belirtilir. */}
          <p className={styles.privacyNote}>{t("aiNote")}</p>

          <label className={styles.consent}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>{t("consent")}</span>
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => setStep((s) => s - 1)}
            >
              {t("back")}
            </button>
            <button
              type="button"
              className={styles.primary}
              disabled={!consent || submitting}
              onClick={onSubmit}
            >
              {submitting ? t("sending") : t("send")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
