"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowUpRight, CornerUpLeft, Play, RotateCcw, Square, Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useMonaMachine } from "@/hooks/useMonaMachine";
import { useMonaVoice } from "@/hooks/useMonaVoice";
import { monaQuestions, openingLine, AI_DISCLAIMER, type MonaLine, type MonaQuestion } from "@/data/mona";
import { MONA_GENERAL_COUNT, suggestNext } from "@/lib/mona-suggestions";
import styles from "./Mona.module.css";
import { MonaDots } from "./MonaDots";

/** Konuşma geçmişinde bir tur: MONA'nın satırı ve varsa ziyaretçinin sorusu. */
type Turn = { line: MonaLine; prompt?: string };
type Phase = "idle" | "leave-forward" | "leave-backward";

const TRANSITION_MS = 300;
const questionIds = monaQuestions.map(item => item.id);

function dialogSize(length: number) {
  if (length > 280) return styles.dialogLong;
  if (length > 140) return styles.dialogMedium;
  return styles.dialogShort;
}

export function Mona({ locale, lines, variant = "full" }: {
  locale: Locale; lines?: MonaLine[]; variant?: "full" | "compact";
}) {
  const t = useTranslations("mona");
  const reducedMotion = usePrefersReducedMotion();
  const machine = useMonaMachine({ locale, reducedMotion });
  const trackingRef = useRef<HTMLDivElement>(null);
  const questionsRef = useRef<HTMLDivElement>(null);
  const transitionTimer = useRef<number | undefined>(undefined);
  const [started, setStarted] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set());
  const [phase, setPhase] = useState<Phase>("idle");
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
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

  useEffect(() => () => window.clearTimeout(transitionTimer.current), []);

  /** Mevcut satır önce yukarı kayıp bulanıklaşır, sonra yeni satır başlar. */
  const transition = (kind: Exclude<Phase, "idle">, commit: () => void) => {
    if (phase !== "idle") return;
    if (reducedMotion) { commit(); return; }
    setPhase(kind);
    transitionTimer.current = window.setTimeout(() => { commit(); setPhase("idle"); }, TRANSITION_MS);
  };
  const advance = (turn: Turn, reset = false) => {
    setDirection("forward");
    setTurns(previous => reset ? [turn] : [...previous, turn]);
    machine.speak(turn.line);
  };

  const start = (withSound = false) => {
    if (withSound) { voice.unlock(); machine.setMuted(false); }
    setStarted(true);
    transition("leave-forward", () => advance({ line: lines?.[compactIndex] ?? openingLine }, true));
  };
  const toggleSound = () => {
    if (machine.muted) {
      voice.unlock(); machine.setMuted(false);
      machine.speak(machine.activeLine);
    } else machine.setMuted(true);
  };
  const selectQuestion = (question: MonaQuestion, fromDeck = false) => {
    setStarted(true);
    if (!machine.muted) voice.unlock();
    if (fromDeck) trackingRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    transition("leave-forward", () => {
      setVisited(previous => new Set(previous).add(question.id));
      advance({ line: question, prompt: question.question[locale] });
    });
  };
  const goBack = () => {
    const previous = turns[turns.length - 2];
    if (!previous) return;
    transition("leave-backward", () => {
      setDirection("backward");
      setTurns(history => history.slice(0, -1));
      machine.speak(previous.line);
    });
  };
  const next = () => {
    if (!lines?.length) return;
    const index = (compactIndex + 1) % lines.length;
    setCompactIndex(index);
    transition("leave-forward", () => advance({ line: lines[index] }));
  };
  const scrollToQuestions = () => questionsRef.current?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth" });

  const current = turns[turns.length - 1];
  const fullText = started && current ? machine.activeLine.text[locale] : t("startHint");
  const shownText = started && current ? machine.visibleText : fullText;
  const typing = started && machine.state === "speaking" && machine.visibleText.length < fullText.length;
  const previousText = !started || !current ? null
    : current.prompt ?? (turns.length > 1 ? turns[turns.length - 2].line.text[locale] : t("startHint"));
  const activeQuestionId = current && questionIds.includes(current.line.id) ? current.line.id : null;
  const suggestions = suggestNext(questionIds, activeQuestionId, visited)
    .map(id => monaQuestions.find(item => item.id === id))
    .filter((item): item is MonaQuestion => Boolean(item));
  const action = monaQuestions.find(item => item.id === machine.activeLine.id)?.action;
  const Heading = variant === "full" ? "h1" : "h2";
  const stepClass = [
    styles.step,
    !typing && styles.expanded,
    phase === "leave-forward" && styles.leaveForward,
    phase === "leave-backward" && styles.leaveBackward,
    direction === "backward" && styles.enterBackward,
  ].filter(Boolean).join(" ");

  return (
    <section className={styles.stage} aria-labelledby={titleId} data-testid="mona-stage"
      data-started={started} data-state={machine.state} data-speaking={voice.speaking}>
      <div ref={trackingRef} className={styles.experience} data-testid="mona-experience"
        style={{ "--progress": visited.size / questionIds.length } as CSSProperties}>
        <MonaDots hostRef={trackingRef} levelRef={voice.levelRef} typing={typing} reducedMotion={reducedMotion} />
        <button className={styles.characterTarget} data-mona-character
          type="button" aria-label={started ? t("headLabel") : t("start")}
          onClick={() => started ? machine.registerHeadTap() : start()}>
        </button>

        <header className={styles.intro}>
          <p className={styles.eyebrow} lang="en">Hibrid 360 / AI</p>
          <Heading id={titleId}>MONA<span>.</span></Heading>
          <p className={styles.signature}>HUMAN INSTINCT.<br />DIGITAL MIND.</p>
        </header>
        <div className={styles.status} role="status">
          <span className={styles.statusDot} />
          {voice.speaking ? t("speaking") : started ? t("online") : t("standby")}
        </div>

        <div className={styles.conversation}>
          <div className={stepClass} key={`${turns.length}-${current?.line.id ?? "hint"}`}>
            {previousText && <p className={styles.previous} aria-hidden="true">{previousText}</p>}
            <p id={answerId} className={`${styles.dialog} ${dialogSize(fullText.length)}`}
              aria-live="polite" aria-atomic="true" data-testid="mona-answer">
              <span className={styles.typed} aria-hidden="true">{shownText}</span>
              <span className={styles.srOnly}>{fullText}</span>
            </p>
            <div className={styles.content}>
              {!started ? (
                <>
                  <button type="button" className={`${styles.pill} ${styles.pillPrimary}`} onClick={() => start(true)}>
                    <Play fill="currentColor" />{t("startAudio")}
                  </button>
                  <button type="button" className={styles.pill} onClick={() => start()}>{t("start")}</button>
                </>
              ) : (
                <>
                  {/* Ses kapalıyken makine "speaking"de kalır; Sustur yalnızca gerçekten
                      ses çalarken ya da metin hâlâ yazılırken anlamlı. */}
                  {voice.speaking || typing
                    ? <button type="button" className={styles.pill} onClick={silence}><Square fill="currentColor" />{t("stop")}</button>
                    : <button type="button" className={styles.pill} onClick={() => { voice.unlock(); machine.speak(machine.activeLine); }}><RotateCcw />{t("replay")}</button>}
                  {action && <Link className={styles.pill} href={action.href}>{action.label[locale]}<ArrowUpRight /></Link>}
                  {variant === "compact" && lines && lines.length > 1 &&
                    <button type="button" className={styles.pill} onClick={next}>{t("next")}<ArrowUpRight /></button>}
                  {variant === "full" && suggestions.map(item => (
                    <button key={item.id} type="button" className={styles.pill} onClick={() => selectQuestion(item)}>
                      {item.question[locale]}
                    </button>
                  ))}
                  {variant === "full"
                    ? <button type="button" className={`${styles.pill} ${styles.pillGhost}`} onClick={scrollToQuestions}>{t("allQuestions")}<ArrowDown /></button>
                    : <Link href="/what-we-do/ai-creative-production" className={`${styles.pill} ${styles.pillGhost}`}>{t("questionsLabel")}<ArrowUpRight /></Link>}
                </>
              )}
            </div>
          </div>
          <p className={styles.disclaimer}>{AI_DISCLAIMER[locale]}</p>
        </div>

        {started && turns.length > 1 && (
          <button type="button" className={styles.back} aria-label={t("back")} title={t("back")} onClick={goBack}>
            <CornerUpLeft />
          </button>
        )}
        {started && (
          <button type="button" className={`${styles.sound} ${machine.muted ? styles.soundMuted : ""}`}
            aria-label={machine.muted ? t("unmute") : t("mute")} title={machine.muted ? t("unmute") : t("mute")}
            aria-pressed={!machine.muted} onClick={toggleSound}>
            <span className={`${styles.soundIcon} ${styles.soundOn}`}><Volume2 /></span>
            <span className={`${styles.soundIcon} ${styles.soundOff}`}><VolumeX /></span>
          </button>
        )}
        {variant === "full" && (
          <div className={styles.progress} role="progressbar" aria-label={t("progress", { count: visited.size })}
            aria-valuemin={0} aria-valuemax={questionIds.length} aria-valuenow={visited.size} />
        )}
      </div>

      {voice.unavailable && <p role="status" className={styles.audioNote}>{t("audioUnavailable")}</p>}

      {variant === "full" && <div ref={questionsRef} className={styles.questionDeck} data-testid="mona-questions">
        <header className={styles.questionHeader}><h2>{t("questionsLabel")}</h2><p>{t("questionCount")}</p></header>
        <div className={styles.questionGroups}>
          {[monaQuestions.slice(0, MONA_GENERAL_COUNT), monaQuestions.slice(MONA_GENERAL_COUNT)].map((group, groupIndex) => <section key={groupIndex}>
            <h3 lang="en">{t(groupIndex ? "aiQuestions" : "generalQuestions")}</h3>
            <ul>{group.map((item, index) => <li key={item.id}>
              <button type="button" aria-pressed={item.id === activeQuestionId} aria-controls={started ? answerId : undefined} onClick={() => selectQuestion(item, true)}>
                <span className={styles.questionNumber}>{String(index + (groupIndex ? MONA_GENERAL_COUNT + 1 : 1)).padStart(2, "0")}</span>
                <span>{item.question[locale]}</span><ArrowUpRight size={18} />
              </button>
            </li>)}</ul>
          </section>)}
        </div>
      </div>}
    </section>
  );
}
