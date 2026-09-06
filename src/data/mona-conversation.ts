import type { Locale } from "@/i18n/routing";
import { monaQuestions, openingLine, type MonaLine } from "@/data/mona";
import { briefQuestions, briefIntro, briefOutro } from "@/data/brief-builder";

/**
 * MONA konuşma grafiği — brief-rev12.md Bölüm 11.2 (etkileşim kuralları) ve
 * Bölüm 18.8 (Brief Builder) tek bir akışta birleştirilir.
 *
 * Neden grafik: brief 11.2 MONA'yı "soru-cevap kütüphanesi + idle repliği +
 * geri dönüş repliği" olarak tanımlıyor, brief 18.8 ise altı soruluk bir
 * formu "MONA konuşur" notuyla tarif ediyor. İkisi bugüne kadar iki ayrı
 * sayfada (AI Creative Production ve /brief) yaşıyordu; bu dosya ikisini
 * adım grafiğine bağlar, böylece MONA hem cevap veren hem brief toplayan
 * tek bir asistan olur.
 *
 * METİN KAYNAKLARI — hiçbiri burada yeniden yazılmaz:
 *   - Açılış repliği ve soru-cevap kütüphanesi  → src/data/mona.ts (brief 11.3-11.5)
 *   - Brief soruları, açılış ve kapanış metni   → src/data/brief-builder.ts (brief 18.8)
 * Yalnızca menü etiketleri mesaj dosyalarındaki `mona.stage.*` anahtarlarından
 * gelir; bunlar işlevsel arayüz metnidir, SİTEYE GİRECEK METİN kutusu değildir.
 *
 * TODO: docs/DECISIONS.md #8 bekleniyor — MONA ses kararı. Adımların
 * `line` alanı MonaLine taşıdığı için ses geldiğinde akış değişmeden
 * `audioSrc` üzerinden bağlanır.
 */

export type MonaSentence = { tr: string; en: string };

export interface MonaChoice {
  id: string;
  /** Mesaj dosyasındaki anahtar (mona.stage.*) veya doğrudan metin. */
  label?: MonaSentence;
  labelKey?: string;
  /** Gidilecek adım. */
  next?: string;
  /** Site içi bağlantı — akıştan çıkar. */
  href?: string;
  /** Panoya kopyalanacak e-posta. */
  mailto?: string;
}

export type MonaStepKind =
  | "menu"
  | "answer"
  /** Brief sorusu — tek seçim, çoklu seçim veya serbest metin. */
  | "field"
  | "summary"
  | "sent";

export interface MonaStep {
  slug: string;
  kind: MonaStepKind;
  /** MONA'nın o adımda söylediği cümle. */
  sentence: MonaSentence;
  /** Onaylı replik kütüphanesinden geliyorsa ses/altyazı için taşınır. */
  line?: MonaLine;
  choices?: MonaChoice[];
  /** kind === "field" ise doldurulan brief_submissions sütunu. */
  briefFieldIndex?: number;
  next?: string;
  /** Geri gidilebilir mi — brief 18.8 özet ve gönderim adımlarında hayır. */
  canGoBack?: boolean;
}

export const INTRO_SLUG = "intro";
export const BRIEF_FIRST_SLUG = "brief-0";

const sentenceOf = (line: MonaLine): MonaSentence => ({
  tr: line.text.tr,
  en: line.text.en,
});

/** Ana menü — MONA açılış repliğini söyler, sonra dallar açılır. */
const introStep: MonaStep = {
  slug: INTRO_SLUG,
  kind: "menu",
  sentence: sentenceOf(openingLine),
  line: openingLine,
  canGoBack: false,
  choices: [
    { id: "brief", labelKey: "startBrief", next: BRIEF_FIRST_SLUG },
    { id: "questions", labelKey: "askQuestions", next: "questions" },
    { id: "work", labelKey: "seeWork", href: "/work" },
    { id: "contact", labelKey: "contact", href: "/contact" },
  ],
};

/** Soru listesi — brief 11.4 kütüphanesindeki on soru + easter egg dışarıda. */
const questionsStep: MonaStep = {
  slug: "questions",
  kind: "menu",
  sentence: sentenceOf(openingLine),
  canGoBack: true,
  choices: monaQuestions.map((question) => ({
    id: question.id,
    label: question.question,
    next: `answer-${question.id}`,
  })),
};

/** Her cevap kendi adımı — geri dönünce soru listesi korunur. */
const answerSteps: MonaStep[] = monaQuestions.map((question) => ({
  slug: `answer-${question.id}`,
  kind: "answer",
  sentence: sentenceOf(question),
  line: question,
  canGoBack: true,
  choices: [
    ...(question.action
      ? [
          {
            id: `${question.id}-action`,
            label: question.action.label,
            href: question.action.href,
          },
        ]
      : []),
    { id: `${question.id}-more`, labelKey: "askQuestions", next: "questions" },
    { id: `${question.id}-brief`, labelKey: "startBrief", next: BRIEF_FIRST_SLUG },
  ],
}));

/**
 * Brief dalı — altı soru, her biri kendi adımı. İlk adımın cümlesi
 * brief 18.8'in açılış metnidir; sonraki adımlarda sorunun kendisi
 * MONA'nın cümlesi olur.
 */
const briefSteps: MonaStep[] = briefQuestions.map((question, index) => ({
  slug: `brief-${index}`,
  kind: "field",
  sentence:
    index === 0
      ? {
          tr: `${briefIntro.tr} ${question.label.tr}`,
          en: `${briefIntro.en} ${question.label.en}`,
        }
      : question.label,
  briefFieldIndex: index,
  canGoBack: true,
  next: index === briefQuestions.length - 1 ? "brief-summary" : `brief-${index + 1}`,
}));

const summaryStep: MonaStep = {
  slug: "brief-summary",
  kind: "summary",
  sentence: briefOutro,
  canGoBack: true,
};

const sentStep: MonaStep = {
  slug: "brief-sent",
  kind: "sent",
  sentence: briefOutro,
  canGoBack: false,
};

export const monaSteps: Record<string, MonaStep> = Object.fromEntries(
  [introStep, questionsStep, ...answerSteps, ...briefSteps, summaryStep, sentStep].map(
    (step) => [step.slug, step],
  ),
);

export const briefStepSlugs = briefSteps.map((step) => step.slug);

export function getStep(slug: string): MonaStep {
  const step = monaSteps[slug];
  if (!step) throw new Error(`MONA adımı bulunamadı: ${slug}`);
  return step;
}

export function sentenceFor(step: MonaStep, locale: Locale): string {
  return step.sentence[locale];
}
