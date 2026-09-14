import { describe, expect, it } from "vitest";
import { createParticleCloud, LAYER } from "./mona-dots-geometry";
import {
  BLOOM_EVERY_MAX,
  BLOOM_EVERY_MIN,
  BLOOM_FALL,
  BLOOM_HOLD,
  BLOOM_RISE,
  BLOOM_TOTAL,
  bloomWeight,
  createLotus,
  decodeDensity,
  FIRST_BLOOM_MAX,
  FIRST_BLOOM_MIN,
  LOTUS_SCALE,
  lotusTargets,
  lotusWeight,
  sampleDensity,
  stepLotus,
} from "./mona-lotus";
import { LOTUS_DENSITY } from "./mona-lotus-density";

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

const toBase64 = (bytes: number[]) => Buffer.from(Uint8Array.from(bytes)).toString("base64");

describe("decodeDensity", () => {
  it("decodes the generated lotus map to size² cells", () => {
    const density = decodeDensity(LOTUS_DENSITY);
    expect(density).toHaveLength(LOTUS_DENSITY.size * LOTUS_DENSITY.size);
    expect(density.some((value) => value > 0)).toBe(true);
  });

  it("rejects data that does not match the declared size", () => {
    expect(() => decodeDensity({ size: 3, data: toBase64([1, 2, 3]) })).toThrow();
  });
});

describe("sampleDensity", () => {
  it("returns (u, v) pairs inside [-1, 1]", () => {
    const density = decodeDensity(LOTUS_DENSITY);
    const samples = sampleDensity(density, LOTUS_DENSITY.size, 2000, seeded(1));
    expect(samples).toHaveLength(4000);
    for (const value of samples) {
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it("only lands in lit cells, top row is v = +1", () => {
    // 2×2: yalnız sol üst hücre dolu → her örnek u<0, v>0.
    const samples = sampleDensity(Uint8Array.from([255, 0, 0, 0]), 2, 500, seeded(2));
    for (let i = 0; i < samples.length; i += 2) {
      expect(samples[i]).toBeLessThanOrEqual(0);
      expect(samples[i + 1]).toBeGreaterThanOrEqual(0);
    }
  });

  it("follows the weights: a 3× brighter cell gets ~3× the points", () => {
    // 2×2: üst satır [60, 180], alt satır boş → örneklerin ~%75'i sağda.
    const samples = sampleDensity(Uint8Array.from([60, 180, 0, 0]), 2, 4000, seeded(3));
    let right = 0;
    for (let i = 0; i < samples.length; i += 2) if (samples[i] > 0) right++;
    expect(right / 4000).toBeCloseTo(0.75, 1);
  });

  it("a softer exponent spreads points into dimmer cells (core fills the petals)", () => {
    // Üst satır [255, 64]: üs 1'de sağ hücre ~%20, üs 0,5'te ~%33.
    const density = Uint8Array.from([255, 64, 0, 0]);
    const share = (exponent: number) => {
      const samples = sampleDensity(density, 2, 6000, seeded(11), exponent);
      let right = 0;
      for (let i = 0; i < samples.length; i += 2) if (samples[i] > 0) right++;
      return right / 6000;
    };
    expect(share(1)).toBeCloseTo(64 / 319, 1);
    expect(share(0.5)).toBeCloseTo(0.5 / 1.5, 1);
  });

  it("returns nothing when asked for nothing", () => {
    expect(sampleDensity(Uint8Array.from([1, 0, 0, 0]), 2, 0, seeded(3))).toHaveLength(0);
  });

  it("is deterministic for the same random source", () => {
    const density = decodeDensity(LOTUS_DENSITY);
    const a = sampleDensity(density, LOTUS_DENSITY.size, 300, seeded(9));
    const b = sampleDensity(density, LOTUS_DENSITY.size, 300, seeded(9));
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it("refuses an empty map", () => {
    expect(() => sampleDensity(new Uint8Array(4), 2, 10, seeded(4))).toThrow();
  });
});

describe("lotusTargets", () => {
  const cloud = createParticleCloud({ shell: 900, core: 300, halo: 120, dust: 60, haze: 20 });
  const targets = lotusTargets(cloud, LOTUS_DENSITY);
  const isBody = (index: number) => cloud.meta[index * 4 + 2] <= LAYER.core;

  it("gives every point an xyz target", () => {
    expect(targets).toHaveLength(cloud.count * 3);
  });

  it("puts body points on the flower, within the lotus scale and nearly flat", () => {
    for (let index = 0; index < cloud.count; index++) {
      if (!isBody(index)) continue;
      expect(Math.abs(targets[index * 3])).toBeLessThanOrEqual(LOTUS_SCALE);
      expect(Math.abs(targets[index * 3 + 1])).toBeLessThanOrEqual(LOTUS_SCALE);
      expect(Math.abs(targets[index * 3 + 2])).toBeLessThanOrEqual(0.06);
    }
  });

  it("leaves halo, dust and haze where they are (same convention as heart/ring)", () => {
    for (let index = 0; index < cloud.count; index++) {
      if (isBody(index)) continue;
      expect(targets[index * 3]).toBe(cloud.positions[index * 3]);
      expect(targets[index * 3 + 1]).toBe(cloud.positions[index * 3 + 1]);
      expect(targets[index * 3 + 2]).toBe(cloud.positions[index * 3 + 2]);
    }
  });

  it("shell draws the petal outlines, core fills them: core lands in dimmer cells on average", () => {
    const density = decodeDensity(LOTUS_DENSITY);
    const size = LOTUS_DENSITY.size;
    const brightness = (x: number, y: number) => {
      const column = Math.min(size - 1, Math.floor(((x / LOTUS_SCALE + 1) / 2) * size));
      const row = Math.min(size - 1, Math.floor(((1 - y / LOTUS_SCALE) / 2) * size));
      return density[row * size + column];
    };
    const mean = { shell: 0, core: 0 };
    const count = { shell: 0, core: 0 };
    for (let index = 0; index < cloud.count; index++) {
      const layer = cloud.meta[index * 4 + 2];
      if (layer > LAYER.core) continue;
      const key = layer === LAYER.shell ? "shell" : "core";
      mean[key] += brightness(targets[index * 3], targets[index * 3 + 1]);
      count[key]++;
    }
    expect(mean.core / count.core).toBeLessThan(mean.shell / count.shell);
  });

  it("is upright: the stem is the narrow bottom part, the bloom is the wide top", () => {
    const bottom: number[] = [];
    const top: number[] = [];
    for (let index = 0; index < cloud.count; index++) {
      if (!isBody(index)) continue;
      const x = targets[index * 3];
      const y = targets[index * 3 + 1];
      if (y < -0.55 * LOTUS_SCALE) bottom.push(Math.abs(x));
      if (y > 0) top.push(Math.abs(x));
    }
    const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
    expect(bottom.length).toBeGreaterThan(10);
    expect(mean(bottom)).toBeLessThan(0.15 * LOTUS_SCALE);
    expect(mean(top)).toBeGreaterThan(2 * mean(bottom));
  });

  it("is deterministic", () => {
    expect(Array.from(lotusTargets(cloud, LOTUS_DENSITY))).toEqual(Array.from(targets));
  });

  it("does not disturb the cloud it reads (MONA page shares the generator)", () => {
    const fresh = createParticleCloud({ shell: 900, core: 300, halo: 120, dust: 60, haze: 20 });
    expect(Array.from(cloud.positions)).toEqual(Array.from(fresh.positions));
  });
});

describe("bloomWeight", () => {
  it("is closed before and after a bloom", () => {
    expect(bloomWeight(-1)).toBe(0);
    expect(bloomWeight(0)).toBe(0);
    expect(bloomWeight(BLOOM_TOTAL)).toBe(0);
    expect(bloomWeight(BLOOM_TOTAL + 5)).toBe(0);
  });

  it("opens smoothly, holds fully open, then closes", () => {
    expect(bloomWeight(BLOOM_RISE / 2)).toBeCloseTo(0.5, 5);
    expect(bloomWeight(BLOOM_RISE)).toBe(1);
    expect(bloomWeight(BLOOM_RISE + BLOOM_HOLD / 2)).toBe(1);
    expect(bloomWeight(BLOOM_RISE + BLOOM_HOLD + BLOOM_FALL / 2)).toBeCloseTo(0.5, 5);
  });

  it("never jumps: rises monotonically, falls monotonically", () => {
    let previous = 0;
    for (let t = 0; t <= BLOOM_RISE; t += 0.05) {
      const value = bloomWeight(t);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
    for (let t = BLOOM_RISE + BLOOM_HOLD; t < BLOOM_TOTAL; t += 0.05) {
      const value = bloomWeight(t);
      expect(value).toBeLessThanOrEqual(previous);
      previous = value;
    }
  });
});

describe("lotus schedule", () => {
  it("first bloom comes a little after the page opens", () => {
    for (let seed = 0; seed < 20; seed++) {
      const lotus = createLotus(seeded(seed));
      expect(lotus.start).toBeGreaterThanOrEqual(FIRST_BLOOM_MIN);
      expect(lotus.start).toBeLessThanOrEqual(FIRST_BLOOM_MAX);
      expect(lotusWeight(lotus)).toBe(0);
    }
  });

  it("blooms now and then: the next start is 30–45 s after the previous one", () => {
    const random = seeded(5);
    let lotus = createLotus(random);
    const starts = [lotus.start];
    for (let frame = 0; frame < 60 * 200; frame++) {
      lotus = stepLotus(lotus, 1 / 60, random);
      if (lotus.start !== starts[starts.length - 1]) starts.push(lotus.start);
    }
    expect(starts.length).toBeGreaterThan(3);
    for (let i = 1; i < starts.length; i++) {
      const gap = starts[i] - starts[i - 1];
      expect(gap).toBeGreaterThanOrEqual(BLOOM_EVERY_MIN);
      expect(gap).toBeLessThanOrEqual(BLOOM_EVERY_MAX);
    }
  });

  it("is open only during a bloom", () => {
    const random = seeded(6);
    let lotus = createLotus(random);
    lotus = stepLotus(lotus, lotus.start - 0.5, random);
    expect(lotusWeight(lotus)).toBe(0);
    lotus = stepLotus(lotus, 0.5 + BLOOM_RISE + 1, random);
    expect(lotusWeight(lotus)).toBe(1);
  });

  it("survives a huge time step without scheduling into the past", () => {
    const random = seeded(7);
    const lotus = stepLotus(createLotus(random), 1000, random);
    expect(lotus.start + BLOOM_TOTAL).toBeGreaterThan(lotus.clock);
  });
});
