/**
 * brief-rev12.md Bölüm 20.5 — How We Work.
 *
 * Süreç adımları ve bütçe bandı tablosu, SİTEYE GİRECEK METİN kutularından
 * birebir alınmıştır. Brief'in kendi metninde [X] ve [n] yer tutucuları var —
 * bunlar uydurulmadı, `null` olarak bırakıldı ve arayüzde "bekleniyor"
 * durumu gösteriliyor.
 *
 * TODO: docs/DECISIONS.md #15 bekleniyor — "[X] alanlarına yazılacak
 * başlangıç bantları ticari karardır", müşteride kalmalı. Karar geldiğinde
 * `startingFrom` ve `deliverables`/`duration` alanları doldurulacak.
 */

export const processSteps = [
  {
    step: 1,
    title: "Brief & fit",
    body: "a 30-minute call. What you're launching, when, and for which platforms.",
    pendingDecision: false,
  },
  {
    step: 2,
    title: "Concept & budget",
    // Brief metni: "treatment, references and a line budget within [X]
    // working days." Brief'in kendi [X] yer tutucusu ekrana basılmıyor;
    // {pending} işaretçisi arayüzde "karar bekleniyor" rozetine dönüşüyor.
    body: "treatment, references and a line budget within {pending} working days.",
    pendingDecision: true,
  },
  {
    step: 3,
    title: "Pre-production",
    body: "casting, locations, permits, schedule and the shooting board.",
    pendingDecision: false,
  },
  {
    step: 4,
    title: "Shoot & AI production",
    body: "our own crew, our own gear, and AI-assisted variations produced in parallel.",
    pendingDecision: false,
  },
  {
    step: 5,
    title: "Post & delivery",
    body: "edit, colour, sound, adaptation to every platform ratio, and final files with subtitles.",
    pendingDecision: false,
  },
] as const;

export interface BudgetBand {
  format: string;
  /** Brief'teki "from [X]" — DECISIONS #15 kapanmadan doldurulmaz. */
  startingFrom: string | null;
  /** Brief'te rakamı verilmiş, kesin olan kapsam bilgileri. */
  scope: string[];
  /** Brief'teki "[n] weeks" — DECISIONS #15 kapanmadan doldurulmaz. */
  duration: string | null;
}

export const budgetBands: BudgetBand[] = [
  {
    format: "Social content package",
    startingFrom: null,
    scope: ["1 shoot day", "all platform ratios"],
    duration: null,
  },
  {
    format: "Product / how-to film",
    startingFrom: null,
    scope: ["1–2 shoot days", "1 main film + cutdowns"],
    duration: null,
  },
  {
    format: "Commercial / campaign film",
    startingFrom: null,
    scope: ["2–4 shoot days", "concept, cast, licensing included"],
    duration: null,
  },
  {
    format: "Corporate live broadcast",
    startingFrom: null,
    scope: ["multi-camera, streaming and recording"],
    duration: null,
  },
  {
    format: "Cloud TV",
    startingFrom: null,
    scope: ["setup + monthly operation"],
    duration: null,
  },
  {
    format: "AI production add-on",
    startingFrom: null,
    scope: ["variations, adaptations and versioning at scale"],
    duration: null,
  },
];
