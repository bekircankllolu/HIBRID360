import { describe, expect, it } from "vitest";
import { createDriftDots, driftDensity, stepDrift } from "./mona-drift";

const BOUNDS = { width: 1200, height: 800 };

describe("createDriftDots", () => {
  it("returns the requested count within bounds", () => {
    const dots = createDriftDots(BOUNDS, 20);
    expect(dots).toHaveLength(20);
    for (const dot of dots) {
      expect(dot.x).toBeGreaterThanOrEqual(0);
      expect(dot.x).toBeLessThanOrEqual(BOUNDS.width);
      expect(dot.y).toBeGreaterThanOrEqual(0);
      expect(dot.y).toBeLessThanOrEqual(BOUNDS.height);
    }
  });

  it("is deterministic for a given seed", () => {
    const a = createDriftDots(BOUNDS, 15, 7);
    const b = createDriftDots(BOUNDS, 15, 7);
    expect(a).toEqual(b);
  });

  it("gives every dot some velocity (actually roams, doesn't sit still)", () => {
    const dots = createDriftDots(BOUNDS, 10);
    for (const dot of dots) {
      expect(Math.hypot(dot.vx, dot.vy)).toBeGreaterThan(0);
    }
  });
});

describe("stepDrift", () => {
  it("does not mutate the input", () => {
    const dots = createDriftDots(BOUNDS, 5);
    const snapshot = JSON.parse(JSON.stringify(dots));
    stepDrift(dots, BOUNDS, 1 / 60);
    expect(dots).toEqual(snapshot);
  });

  it("moves a dot by velocity * dt", () => {
    const dots = [{ x: 100, y: 100, vx: 30, vy: -20, size: 1, phase: 0 }];
    const next = stepDrift(dots, BOUNDS, 0.5);
    expect(next[0].x).toBeCloseTo(115, 5);
    expect(next[0].y).toBeCloseTo(90, 5);
  });

  it("wraps a dot that drifts past the right edge back to the left", () => {
    const dots = [{ x: BOUNDS.width + 30, y: 400, vx: 10, vy: 0, size: 1, phase: 0 }];
    const next = stepDrift(dots, BOUNDS, 1 / 60);
    expect(next[0].x).toBeLessThan(0);
  });

  it("wraps a dot that drifts past the top edge back to the bottom", () => {
    const dots = [{ x: 400, y: -30, vx: 0, vy: -10, size: 1, phase: 0 }];
    const next = stepDrift(dots, BOUNDS, 1 / 60);
    expect(next[0].y).toBeGreaterThan(BOUNDS.height);
  });
});

describe("driftDensity", () => {
  it("keeps the hero dense and thins the manifesto to forty percent", () => {
    expect(driftDensity(0, 800)).toBe(1);
    expect(driftDensity(440, 800)).toBe(1);
    expect(driftDensity(1240, 800)).toBeCloseTo(0.4, 5);
    expect(driftDensity(3000, 800)).toBeCloseTo(0.4, 5);
  });

  it("falls back safely for invalid viewport measurements", () => {
    expect(driftDensity(500, 0)).toBe(1);
    expect(driftDensity(Number.NaN, 800)).toBe(1);
  });
});
