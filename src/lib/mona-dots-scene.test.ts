import { describe, expect, it } from "vitest";
import { monaShardLayout, SHARD_BLEED } from "./mona-dots-scene";

/** Canvas yüksekliği: hero + altına taşan uzantı (bkz. SHARD_BLEED). */
const canvasFor = (hero: number) => hero * (1 + SHARD_BLEED);

describe("monaShardLayout", () => {
  it("anchors the sphere's center on the right edge, in the lower part of the hero", () => {
    const hero = 827;
    const layout = monaShardLayout(1440, canvasFor(hero));
    expect(layout.centerX).toBe(1);
    // Oran canvas'a göre; hero'ya çevrilince %72'de.
    expect(layout.centerY * canvasFor(hero)).toBeCloseTo(0.72 * hero, 5);
  });

  it("scales the radius from the smaller of width and hero height, not the canvas", () => {
    const wide = monaShardLayout(1440, canvasFor(800));
    const tall = monaShardLayout(800, canvasFor(1440));
    expect(wide.radius).toBeCloseTo(800 * 0.495, 5);
    expect(tall.radius).toBeCloseTo(800 * 0.495, 5);
  });

  it("is 10% smaller than the fifth round's sphere (0.55 → 0.495)", () => {
    const layout = monaShardLayout(1440, canvasFor(827));
    expect(layout.radius / (827 * 0.55)).toBeCloseTo(0.9, 5);
  });

  it("the canvas reaches past the sphere's body, so nothing is cut at the hero's bottom edge", () => {
    const hero = 827;
    const canvas = canvasFor(hero);
    const layout = monaShardLayout(1440, canvas);
    // Kabuk organik şişme + nefes/irkilme payıyla yarıçapın ~1,2 katına kadar çıkar.
    const bodyBottom = layout.centerY * canvas + layout.radius * 1.2;
    expect(bodyBottom).toBeGreaterThan(hero);
    expect(bodyBottom).toBeLessThan(canvas * 0.8);
  });

  it("is independent of the width<=1024 heuristic monaDotsLayout uses", () => {
    const narrow = monaShardLayout(960, canvasFor(700));
    const wide = monaShardLayout(1920, canvasFor(1000));
    expect(wide.centerX).toBe(narrow.centerX);
    expect(wide.centerY).toBeCloseTo(narrow.centerY, 10);
  });
});
