"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Play, RotateCcw, Square, Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMonaMachine } from "@/hooks/useMonaMachine";
import { useMonaVoice } from "@/hooks/useMonaVoice";
import { monaQuestions, openingLine, AI_DISCLAIMER, type MonaLine, type MonaQuestion } from "@/data/mona";
import styles from "./Mona.module.css";
import { MonaVideo } from "./MonaVideo";

export function Mona({ locale, lines, variant = "full" }: {
  locale: Locale; lines?: MonaLine[]; variant?: "full" | "compact";
}) {
  const t = useTranslations("mona");
  const reducedMotion = usePrefersReducedMotion();
  const machine = useMonaMachine({ locale, reducedMotion });
  const trackingRef = useRef<HTMLDivElement>(null);
  const questionsRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [compactIndex, setCompactIndex] = useState(0);
  const titleId = useId();
  const answerId = useId();
  const { silence, setSectionVisible } = machine;
  const voice = useMonaVoice({
    line: machine.activeLine, locale,
    enabled: started && !machine.muted && machine.state === "speaking",
    requestId: machine.requestId, onEnd: machine.complete,
  });

  useEffect(() => {
    const node = trackingRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(() => {
      // Question selection can scroll before a queued intersection entry is delivered.
      const bounds = node.getBoundingClientRect();
      const overlap = Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0));
      setSectionVisible(overlap >= bounds.height * 0.15);
    }, { threshold: 0.15 });
    observer.observe(node);
    const onVisibility = () => { if (document.hidden) silence(); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") silence(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("keydown", onKey);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keydown", onKey);
    };
  }, [silence, setSectionVisible]);

  const start = (withSound = false) => {
    if (withSound) { voice.unlock(); machine.setMuted(false); }
    setStarted(true);
    setActiveQuestionId(null);
    machine.speak(lines?.[compactIndex] ?? openingLine);
  };
  const toggleSound = () => {
    if (machine.muted) {
      voice.unlock(); machine.setMuted(false);
      machine.speak(machine.activeLine);
    } else machine.setMuted(true);
  };
  const selectQuestion = (question: MonaQuestion) => {
    setStarted(true); setActiveQuestionId(question.id);
    if (!machine.muted) voice.unlock();
    machine.speak(question);
    trackingRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  };
  const next = () => {
    if (!lines?.length) return;
    const index = (compactIndex + 1) % lines.length;
    setCompactIndex(index); setStarted(true); machine.speak(lines[index]);
  };
  const question = monaQuestions.find(item => item.id === activeQuestionId);
  const action = monaQuestions.find(item => item.id === machine.activeLine.id)?.action;
  const caption = voice.speaking && voice.caption ? voice.caption : started ? machine.visibleText : "";
  const shortCaption = caption.length > 200 ? caption.slice(0, 197).trimEnd() + "..." : caption;
  const Heading = variant === "full" ? "h1" : "h2";

  return (
    <section className={styles.stage} aria-labelledby={titleId} data-testid="mona-stage"
      data-started={started} data-state={machine.state} data-speaking={voice.speaking}>
      <div ref={trackingRef} className={styles.experience} data-testid="mona-experience">
        <header className={styles.intro}>
          <p className={styles.eyebrow}>HIBRID 360 / AI</p>
          <Heading id={titleId}>MONA<span>.</span></Heading>
          <p className={styles.signature}>HUMAN INSTINCT.<br />DIGITAL MIND.</p>
        </header>
        <div className={styles.status} role="status">
          <span className={styles.statusDot} />
          {voice.speaking ? t("speaking") : started ? t("online") : t("standby")}
        </div>
        <div className={styles.portrait}>
          <MonaVideo trackingRef={trackingRef} reducedMotion={reducedMotion}
            pauseLabel={locale === "tr" ? "Hareketi duraklat" : "Pause motion"}
            playLabel={locale === "tr" ? "Hareketi oynat" : "Play motion"} />
          <button className={styles.characterTarget} data-mona-character
            type="button" aria-label={started ? t("headLabel") : t("start")}
            onClick={() => started ? machine.registerHeadTap() : start()}>
          </button>
        </div>
        <div className={styles.caption} aria-hidden="true">{shortCaption}</div>
        <div className={styles.toolbar}>
          {!started ? (
            <button type="button" className={styles.startButton} onClick={() => start(true)}>
              <Play size={17} fill="currentColor" />{t("startAudio")}
            </button>
          ) : (
            <div className={styles.controls}>
              <button type="button" title={machine.muted ? t("unmute") : t("mute")}
                aria-label={machine.muted ? t("unmute") : t("mute")} aria-pressed={!machine.muted} onClick={toggleSound}>
                {machine.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button type="button" title={t("stop")} aria-label={t("stop")} onClick={silence} disabled={machine.state !== "speaking"}><Square size={16} fill="currentColor" /></button>
              <button type="button" title={t("replay")} aria-label={t("replay")} onClick={() => { voice.unlock(); machine.speak(machine.activeLine); }}><RotateCcw size={19} /></button>
              {variant === "compact" && lines && lines.length > 1 && <button type="button" title={t("next")} aria-label={t("next")} onClick={next}><ArrowUpRight size={20} /></button>}
            </div>
          )}
        </div>
        {variant === "full" ? <button type="button" className={styles.askLink} onClick={() => questionsRef.current?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth" })}>
          {t("questionsLabel")} <span>28</span><ArrowDown size={18} />
        </button> : <Link href="/what-we-do/ai-creative-production" className={styles.askLink}>{t("questionsLabel")}<ArrowUpRight size={18} /></Link>}
        <p className={styles.disclaimer}>{AI_DISCLAIMER[locale]}</p>
      </div>
      {voice.unavailable && <p role="status" className={styles.audioNote}>{t("audioUnavailable")}</p>}
      {started && <div className={styles.answer} id={answerId}>
        <p className={styles.answerLabel}>{question?.question[locale] ?? t("sectionLabel")}</p>
        <div>
          <p aria-live="polite" aria-atomic="true" data-testid="mona-answer">{machine.activeLine.text[locale]}</p>
          {action && <Link className={styles.action} href={action.href}>{action.label[locale]}<ArrowUpRight size={18} /></Link>}
        </div>
      </div>}
      {variant === "full" && <div ref={questionsRef} className={styles.questionDeck} data-testid="mona-questions">
        <header className={styles.questionHeader}><h2>{t("questionsLabel")}</h2><p>{t("questionCount")}</p></header>
        <div className={styles.questionGroups}>
          {[monaQuestions.slice(0, 18), monaQuestions.slice(18)].map((group, groupIndex) => <section key={groupIndex}>
            <h3>{t(groupIndex ? "aiQuestions" : "generalQuestions")}</h3>
            <ul>{group.map((item, index) => <li key={item.id}>
              <button type="button" aria-pressed={item.id === activeQuestionId} aria-controls={started ? answerId : undefined} onClick={() => selectQuestion(item)}>
                <span className={styles.questionNumber}>{String(index + (groupIndex ? 19 : 1)).padStart(2, "0")}</span>
                <span>{item.question[locale]}</span><ArrowUpRight size={18} />
              </button>
            </li>)}</ul>
          </section>)}
        </div>
      </div>}
    </section>
  );
}
