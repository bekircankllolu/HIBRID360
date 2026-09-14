import { describe, expect, it } from "vitest";
import { scrambleReveal } from "./scramble-text";

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("scrambleReveal", () => {
  it("at progress 0 keeps the length and scrambles every letter", () => {
    const result = scrambleReveal("CREATIVITY", 0, seeded(1));
    expect(result).toHaveLength(10);
    expect(result).not.toBe("CREATIVITY");
    expect(result).toMatch(/^[A-Z0-9]+$/);
  });

  it("at progress 1 returns the exact target", () => {
    expect(scrambleReveal("CREATIVITY", 1, seeded(2))).toBe("CREATIVITY");
  });

  it("reveals left to right: the first floor(progress*length) characters match the target", () => {
    const target = "WITHOUT";
    const revealed = Math.floor(0.5 * target.length);
    const result = scrambleReveal(target, 0.5, seeded(3));
    expect(result.slice(0, revealed)).toBe(target.slice(0, revealed));
  });

  it("keeps spaces as spaces regardless of progress", () => {
    const result = scrambleReveal("AB CD", 0, seeded(4));
    expect(result[2]).toBe(" ");
    expect(result).toHaveLength(5);
  });

  it("clamps progress above 1 to the exact target", () => {
    expect(scrambleReveal("LIMITS", 5, seeded(5))).toBe("LIMITS");
  });

  it("clamps negative progress to fully scrambled", () => {
    const result = scrambleReveal("LIMITS", -1, seeded(6));
    expect(result).not.toBe("LIMITS");
    expect(result).toHaveLength(6);
  });

  it("is deterministic for the same random source", () => {
    const a = scrambleReveal("MONA", 0.25, seeded(7));
    const b = scrambleReveal("MONA", 0.25, seeded(7));
    expect(a).toBe(b);
  });

  it("only draws hidden characters from the scramble charset", () => {
    const result = scrambleReveal("HIBRID", 0, seeded(8));
    expect(result).toMatch(/^[A-Z0-9]{6}$/);
  });

  it("empty target returns empty string at any progress", () => {
    expect(scrambleReveal("", 0, seeded(9))).toBe("");
    expect(scrambleReveal("", 1, seeded(9))).toBe("");
  });
});
