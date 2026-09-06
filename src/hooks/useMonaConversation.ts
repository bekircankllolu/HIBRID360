"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/routing";
import {
  getStep,
  sentenceFor,
  INTRO_SLUG,
  briefStepSlugs,
  type MonaStep,
} from "@/data/mona-conversation";
import { briefQuestions } from "@/data/brief-builder";
import { idleLines } from "@/data/mona";
import { submitBrief, type SubmissionResult } from "@/lib/submissions";

/**
 * MONA konuşma makinesi — adım grafiğinde gezinir.
 *
 * useMonaMachine (brief 11.2) tek bir bölümde duran MONA içindir: açılış,
 * konuşma, susma, idle. Bu hook onun üstüne dallanmayı, geçmişi ve brief
 * cevaplarını ekler. İkisi ayrı tutuldu çünkü useMonaMachine ana sayfadaki
 * kısa sürümde de kullanılıyor ve orada dallanma yok.
 *
 * Erişilebilirlik kuralları burada da bağlayıcı (brief 11.6):
 *   - `started` false iken hiçbir şey oynatılmaz. Otomatik ses YASAK;
 *     kullanıcı başlatmadan MONA konuşmaz.
 *   - `muted` varsayılan true.
 *   - prefers-reduced-motion açıkken daktilo efekti kapanır, cümle tam
 *     görünür — içerik hiçbir zaman animasyona bağlı değildir.
 */

const TYPE_SPEED_MS = 28; // useMonaMachine ile aynı ritim
const IDLE_DELAY_MS = 30_000; // brief 11.2: 30 saniye hareketsizlik

export interface BriefAnswers {
  what_making: string | null;
  who_for: string;
  when_live: string | null;
  where_running: string[];
  budget_band: string | null;
  reference_link: string;
  contact_email: string;
}

export const EMPTY_ANSWERS: BriefAnswers = {
  what_making: null,
  who_for: "",
  when_live: null,
  where_running: [],
  budget_band: null,
  reference_link: "",
  contact_email: "",
};

export interface MonaConversation {
  started: boolean;
  start: () => void;
  step: MonaStep;
  /** Yazılmakta olan metin (daktilo). */
  visibleText: string;
  /** Cümlenin tamamı — SEO/altyazı ve "yazımı atla" için. */
  fullText: string;
  typing: boolean;
  skipTyping: () => void;
  /** Bir önceki adımın cümlesi — Locomotive'deki soluk üst satır gibi. */
  previousText: string | null;
  goTo: (slug: string) => void;
  back: () => void;
  canGoBack: boolean;
  muted: boolean;
  toggleMuted: () => void;
  answers: BriefAnswers;
  setAnswer: (field: keyof BriefAnswers, value: string | null) => void;
  toggleMulti: (value: string) => void;
  consent: boolean;
  setConsent: (value: boolean) => void;
  /** Mevcut adımdaki brief sorusu (kind === "field" ise). */
  briefQuestion: (typeof briefQuestions)[number] | null;
  /** Bu adım cevaplandı mı — "→" düğmesi buna bakar. */
  canAdvance: boolean;
  advance: () => void;
  submit: () => Promise<void>;
  submitting: boolean;
  result: SubmissionResult | null;
  /** 0-1 arası ilerleme — brief dalındayken alt çubuğu besler. */
  progress: number;
}

export function useMonaConversation({
  locale,
  reducedMotion,
}: {
  locale: Locale;
  reducedMotion: boolean;
}): MonaConversation {
  const [started, setStarted] = useState(false);
  const [slug, setSlug] = useState(INTRO_SLUG);
  const [history, setHistory] = useState<string[]>([]);
  const [visibleText, setVisibleText] = useState("");
  const [muted, setMuted] = useState(true); // brief 11.6: otomatik ses YASAK
  const [answers, setAnswers] = useState<BriefAnswers>(EMPTY_ANSWERS);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [idleText, setIdleText] = useState<string | null>(null);

  const idleIndexRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = useMemo(() => getStep(slug), [slug]);
  const fullText = useMemo(() => sentenceFor(step, locale), [step, locale]);

  const previousText = useMemo(() => {
    const previousSlug = history[history.length - 1];
    if (!previousSlug) return null;
    return sentenceFor(getStep(previousSlug), locale);
  }, [history, locale]);

  // Daktilo. Başlatılmadan önce hiçbir şey yazılmaz; reduced-motion açıkken
  // cümle tek seferde görünür (CLAUDE.md zorunlu davranış).
  useEffect(() => {
    if (!started) {
      setVisibleText("");
      return;
    }
    if (reducedMotion) {
      setVisibleText(fullText);
      return;
    }
    setVisibleText("");
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setVisibleText(fullText.slice(0, index));
      if (index >= fullText.length) clearInterval(timer);
    }, TYPE_SPEED_MS);
    return () => clearInterval(timer);
  }, [started, fullText, reducedMotion]);

  const typing = started && visibleText.length < fullText.length;
  const skipTyping = useCallback(() => setVisibleText(fullText), [fullText]);

  // brief 11.2: 30 sn hareketsizlik → boşta repliği. Adım değişmez, yalnızca
  // ek bir satır belirir; kullanıcı akışın neresinde kaldığını kaybetmez.
  const clearIdle = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
  }, []);

  const scheduleIdle = useCallback(() => {
    clearIdle();
    idleTimerRef.current = setTimeout(() => {
      const line = idleLines[idleIndexRef.current % idleLines.length];
      idleIndexRef.current += 1;
      setIdleText(line.text[locale]);
      scheduleIdle();
    }, IDLE_DELAY_MS);
  }, [clearIdle, locale]);

  useEffect(() => {
    if (!started) return;
    scheduleIdle();
    return clearIdle;
  }, [started, slug, scheduleIdle, clearIdle]);

  const goTo = useCallback(
    (next: string) => {
      setIdleText(null);
      setHistory((prev) => [...prev, slug]);
      setSlug(next);
    },
    [slug],
  );

  // setSlug, setHistory güncelleyicisinin İÇİNDE çağrılmamalı: React
  // güncelleyicileri saf kabul eder ve StrictMode'da iki kez çalıştırır.
  const back = useCallback(() => {
    if (!history.length) return;
    setIdleText(null);
    setSlug(history[history.length - 1]);
    setHistory((prev) => prev.slice(0, -1));
  }, [history]);

  const start = useCallback(() => setStarted(true), []);
  const toggleMuted = useCallback(() => setMuted((value) => !value), []);

  const setAnswer = useCallback((field: keyof BriefAnswers, value: string | null) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleMulti = useCallback((value: string) => {
    setAnswers((prev) => ({
      ...prev,
      where_running: prev.where_running.includes(value)
        ? prev.where_running.filter((item) => item !== value)
        : [...prev.where_running, value],
    }));
  }, []);

  const briefQuestion =
    step.briefFieldIndex === undefined ? null : briefQuestions[step.briefFieldIndex];

  // "→" ne zaman aktif olur. Serbest metin ve referans alanı isteğe bağlı
  // (brief 18.8 zorunlu tutmuyor); e-posta ve KVKK rızası zorunlu.
  const canAdvance = useMemo(() => {
    if (!briefQuestion) return true;
    switch (briefQuestion.type) {
      case "single":
        return answers[briefQuestion.field] !== null;
      case "multi":
        return answers.where_running.length > 0;
      case "text":
        return true;
      case "contact":
        return answers.contact_email.trim().length > 0;
      default:
        return true;
    }
  }, [briefQuestion, answers]);

  const advance = useCallback(() => {
    if (step.next) goTo(step.next);
  }, [step.next, goTo]);

  const submit = useCallback(async () => {
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
    if (response.ok) goTo("brief-sent");
  }, [answers, consent, locale, goTo]);

  const progress = useMemo(() => {
    const index = briefStepSlugs.indexOf(slug);
    if (index === -1) return slug.startsWith("brief-") ? 1 : 0;
    return (index + 1) / (briefStepSlugs.length + 1);
  }, [slug]);

  return {
    started,
    start,
    step,
    visibleText: idleText ?? visibleText,
    fullText,
    typing,
    skipTyping,
    previousText,
    goTo,
    back,
    canGoBack: (step.canGoBack ?? true) && history.length > 0,
    muted,
    toggleMuted,
    answers,
    setAnswer,
    toggleMulti,
    consent,
    setConsent,
    briefQuestion,
    canAdvance,
    advance,
    submit,
    submitting,
    result,
    progress,
  };
}
