import { describe, expect, it } from "vitest";
import { suggestNext } from "./mona-suggestions";

const ids = Array.from({ length: 28 }, (_, i) => `q${i + 1}`);
const none = new Set<string>();

describe("suggestNext", () => {
  it("opens with two Hibrid 360 questions and the first AI question", () => {
    expect(suggestNext(ids, null, none)).toEqual(["q1", "q2", "q19"]);
  });

  it("follows the active group and mixes in the other one", () => {
    expect(suggestNext(ids, "q1", new Set(["q1"]))).toEqual(["q2", "q19", "q3"]);
    expect(suggestNext(ids, "q19", new Set(["q19"]))).toEqual(["q20", "q1", "q21"]);
  });

  it("skips visited questions and wraps inside the group", () => {
    const visited = new Set(["q17", "q18", "q1"]);
    expect(suggestNext(ids, "q18", visited)).toEqual(["q2", "q19", "q3"]);
  });

  it("never suggests the active question and always fills the pills", () => {
    const everything = new Set(ids);
    const picks = suggestNext(ids, "q5", everything);
    expect(picks).toHaveLength(3);
    expect(picks).not.toContain("q5");
    expect(new Set(picks).size).toBe(3);
  });
});
