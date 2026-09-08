import { describe, expect, it } from "vitest";
import { MONA_LOOK, monaLookTime, smoothMonaLook } from "./mona-video-look";

describe("Mona video look mapping", () => {
  it("maps viewer left, center and right to the calibrated source frames", () => {
    expect(monaLookTime(-1, 15)).toBe(MONA_LOOK.left);
    expect(monaLookTime(0, 15)).toBe(MONA_LOOK.center);
    expect(monaLookTime(1, 15)).toBe(MONA_LOOK.right);
  });
  it("clamps input and invalid or short media durations", () => {
    expect(monaLookTime(-3, 15)).toBe(MONA_LOOK.left);
    expect(monaLookTime(4, 15)).toBe(MONA_LOOK.right);
    expect(monaLookTime(NaN, 15)).toBe(MONA_LOOK.center);
    for (const duration of [NaN, Infinity, -1, 0]) expect(monaLookTime(0, duration)).toBe(0);
    expect(monaLookTime(-1, 1)).toBeLessThan(1);
  });
  it("has a stable center and moves monotonically across the video", () => {
    expect(monaLookTime(-0.03, 15)).toBe(monaLookTime(0.03, 15));
    let previous: number = MONA_LOOK.left;
    for (let i = -100; i <= 100; i++) {
      const next = monaLookTime(i / 100, 15);
      expect(next).toBeLessThanOrEqual(previous);
      previous = next;
    }
  });
  it("eases in both directions without overshooting and eventually settles", () => {
    for (const [start, target] of [[0.875, 2.75], [2.75, 0.875]]) {
      let current = start;
      for (let i = 0; i < 60; i++) {
        current = smoothMonaLook(current, target, 1 / 60);
        expect(current).toBeGreaterThanOrEqual(Math.min(start, target));
        expect(current).toBeLessThanOrEqual(Math.max(start, target));
      }
      expect(current).toBe(target);
    }
    expect(smoothMonaLook(1, 2, -1)).toBe(1);
    expect(smoothMonaLook(1, 2, 10)).toBe(smoothMonaLook(1, 2, 0.05));
  });
});
