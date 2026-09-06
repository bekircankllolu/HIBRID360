import { describe, expect, it } from "vitest";
import { monaQuestions } from "@/data/mona";

describe("MONA FAQ import", () => {
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
