import { describe, expect, it } from "vitest";
import {
  createCreature, creatureFrame, SCATTER_TAPS, SHAPES, SLEEP_AFTER, stepCreature,
  type CreatureInput, type CreatureState,
} from "./mona-creature";

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const quiet: CreatureInput = { pointerMoved: false, taps: [], keyed: false, speaking: 0 };
const DT = 1 / 60;

function run(state: CreatureState, seconds: number, input: CreatureInput, random: () => number) {
  let s = state;
  for (let t = 0; t < seconds; t += DT) s = stepCreature(s, input, DT, random);
  return s;
}

describe("mona creature", () => {
  it("falls asleep after the idle limit, shrinking and dimming", () => {
    const random = seeded(1);
    let s = run(createCreature(random), SLEEP_AFTER - 1, quiet, random);
    expect(s.mood).toBe("awake");
    s = run(s, 5, quiet, random);
    expect(s.mood).toBe("sleeping");
    const frame = creatureFrame(s);
    expect(frame.scale).toBeLessThan(0.8);
    expect(frame.dim).toBeLessThan(0.6);
    expect(frame.timeScale).toBeLessThan(0.5);
  });

  it("wakes with a small overshoot when the pointer moves", () => {
    const random = seeded(2);
    let s = run(createCreature(random), SLEEP_AFTER + 4, quiet, random);
    s = stepCreature(s, { ...quiet, pointerMoved: true }, DT, random);
    expect(s.mood).toBe("awake");
    expect(s.wake).toBeGreaterThan(0.9);
  });

  it("flinches on a tap and springs back", () => {
    const random = seeded(3);
    let s = run(createCreature(random), 1, { ...quiet, pointerMoved: true }, random);
    s = stepCreature(s, { ...quiet, taps: [{ x: 0.6, y: 0.5 }] }, DT, random);
    let smallest = Infinity;
    for (let t = 0; t < 0.4; t += DT) {
      s = stepCreature(s, quiet, DT, random);
      smallest = Math.min(smallest, 1 + s.squash);
    }
    expect(smallest).toBeLessThan(0.88);
    s = run(s, 1.5, quiet, random);
    expect(Math.abs(s.squash)).toBeLessThan(0.02);
  });

  it(`scatters after ${SCATTER_TAPS} quick taps and gathers again`, () => {
    const random = seeded(4);
    let s = run(createCreature(random), 1, quiet, random);
    for (let i = 0; i < SCATTER_TAPS; i++) {
      s = stepCreature(s, { ...quiet, taps: [{ x: 0.7, y: 0.4 }] }, 0.2, random);
    }
    expect(s.mood).toBe("scattered");
    expect(s.scatterOrigin).toEqual([0.7, 0.4]);
    s = run(s, 0.8, quiet, random);
    expect(creatureFrame(s).scatter).toBeCloseTo(1, 2);
    s = run(s, 4, quiet, random);
    expect(s.mood).toBe("awake");
    expect(creatureFrame(s).scatter).toBe(0);
  });

  it("does not scatter when taps are far apart", () => {
    const random = seeded(5);
    let s = createCreature(random);
    for (let i = 0; i < SCATTER_TAPS + 2; i++) {
      s = stepCreature(s, { ...quiet, taps: [{ x: 0.5, y: 0.5 }] }, DT, random);
      s = run(s, 2, quiet, random);
    }
    expect(s.scatterStage).toBe("none");
  });

  it("drifts into eye, heart or ring and back to the blob while awake", () => {
    const random = seeded(6);
    let s = createCreature(random);
    const seen = new Set<string>();
    let returned = false;
    for (let t = 0; t < 90; t += DT) {
      s = stepCreature(s, { ...quiet, pointerMoved: true }, DT, random);
      const frame = creatureFrame(s);
      if (Math.max(...frame.shapeWeights) > 0.99) seen.add(frame.shape);
      if (seen.size > 0 && frame.shape === "blob") returned = true;
    }
    expect(seen.size).toBeGreaterThan(0);
    for (const shape of seen) expect(SHAPES).toContain(shape);
    expect(returned).toBe(true);
  });

  it("stays a blob while MONA is speaking", () => {
    const random = seeded(7);
    const s = run(createCreature(random), 60, { ...quiet, speaking: 0.5 }, random);
    expect(creatureFrame(s).shape).toBe("blob");
    expect(s.mood).toBe("awake");
  });

  it("keeps changing its organic form", () => {
    const random = seeded(8);
    const start = createCreature(random);
    const later = run(start, 12, { ...quiet, pointerMoved: true }, random);
    const moved = later.morph.some((value, i) => Math.abs(value - start.morph[i]) > 0.1);
    expect(moved).toBe(true);
  });
});
