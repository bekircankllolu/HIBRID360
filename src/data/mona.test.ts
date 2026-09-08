import { describe, expect, it } from "vitest";
import { monaQuestions, openingLine } from "@/data/mona";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

describe("MONA FAQ import", () => {
  it("ships both voices and timed captions for every live answer", () => {
    for (const line of [openingLine, ...monaQuestions]) {
      for (const locale of ["tr", "en"] as const) {
        expect(line.audioSrc[locale]).toBeTruthy();
        const audio = join(process.cwd(), "public", line.audioSrc[locale]!);
        expect(statSync(audio).size).toBeGreaterThan(1000);
        const cues = JSON.parse(readFileSync(audio.replace(/\.mp3$/, ".json"), "utf8")) as { start: number; end: number; text: string }[];
        expect(cues.length).toBeGreaterThan(0);
        for (const cue of cues) {
          expect(cue.start).toBeGreaterThanOrEqual(0);
          expect(cue.end).toBeGreaterThan(cue.start);
          expect(cue.text.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });
  it("keeps all 28 questions in source order", () => {
    expect(monaQuestions).toHaveLength(28);
    expect(monaQuestions.map(({ id }) => id)).toEqual(
      Array.from({ length: 28 }, (_, index) => `q${index + 1}`),
    );
  });

  it("provides unique, non-empty Turkish and English content", () => {
    const localizedQuestions = monaQuestions.flatMap(({ question }) => [
      question.tr,
      question.en,
    ]);

    expect(new Set(localizedQuestions).size).toBe(localizedQuestions.length);

    for (const item of monaQuestions) {
      expect(item.question.tr.trim()).not.toBe("");
      expect(item.question.en.trim()).not.toBe("");
      expect(item.text.tr.trim()).not.toBe("");
      expect(item.text.en.trim()).not.toBe("");
    }
  });
});
