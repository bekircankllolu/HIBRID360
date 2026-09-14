import { describe, expect, it } from "vitest";

import { helixGeometry } from "./dna-helix";

/**
 * Creative DNA sarmalının geometrisi (S5 — imza hareketi).
 *
 * SVG, pen tool ile çizilmiş gibi görünmeli: anchor'lar tepe ve çukur
 * noktalarında, tutamaçlar yatay. İki iplik birbirinin aynası; çizim
 * soldan sağa ilerlediği için anchor'ların `t` eşikleri artan sırada.
 */

const BOX = { width: 1200, height: 360, turns: 3 } as const;

function lastPoint(d: string): { x: number; y: number } {
  const numbers = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  return { x: numbers[numbers.length - 2], y: numbers[numbers.length - 1] };
}

describe("helixGeometry", () => {
  const geometry = helixGeometry(BOX);
  const anchorsA = geometry.anchors.filter((anchor) => anchor.strand === "a");
  const anchorsB = geometry.anchors.filter((anchor) => anchor.strand === "b");

  it("iplikler sol kenardan başlayıp sağ kenarda biter", () => {
    expect(geometry.strandA.startsWith("M0 ")).toBe(true);
    expect(geometry.strandB.startsWith("M0 ")).toBe(true);
    expect(lastPoint(geometry.strandA).x).toBe(BOX.width);
    expect(lastPoint(geometry.strandB).x).toBe(BOX.width);
  });

  it("her iplikte tur başına iki uç nokta + bir başlangıç anchor'ı vardır, eşit aralıklı", () => {
    expect(anchorsA).toHaveLength(BOX.turns * 2 + 1);
    expect(anchorsB).toHaveLength(BOX.turns * 2 + 1);
    const step = BOX.width / (BOX.turns * 2);
    anchorsA.forEach((anchor, index) => {
      expect(anchor.x).toBeCloseTo(index * step, 6);
    });
  });

  it("anchor eşikleri x/width'tir, artan sırada ve [0, 1] içinde", () => {
    let previous = -1;
    for (const anchor of anchorsA) {
      expect(anchor.t).toBeCloseTo(anchor.x / BOX.width, 6);
      expect(anchor.t).toBeGreaterThan(previous);
      expect(anchor.t).toBeGreaterThanOrEqual(0);
      expect(anchor.t).toBeLessThanOrEqual(1);
      previous = anchor.t;
    }
  });

  it("tutamaçlar yataydır: anchor ile aynı yükseklikte, iki yana eşit uzaklıkta", () => {
    for (const anchor of geometry.anchors) {
      expect(anchor.handleIn.y).toBe(anchor.y);
      expect(anchor.handleOut.y).toBe(anchor.y);
      expect(anchor.x - anchor.handleIn.x).toBeCloseTo(anchor.handleOut.x - anchor.x, 6);
    }
  });

  it("iki iplik birbirinin aynasıdır", () => {
    anchorsA.forEach((anchor, index) => {
      expect(anchorsB[index].y).toBeCloseTo(BOX.height - anchor.y, 6);
    });
  });

  it("basamaklar iki iplik arasında kalır ve yukarıdan aşağı sıralıdır", () => {
    expect(geometry.rungs.length).toBeGreaterThan(0);
    for (const rung of geometry.rungs) {
      expect(rung.y1).toBeLessThan(rung.y2);
      expect(rung.x).toBeGreaterThan(0);
      expect(rung.x).toBeLessThan(BOX.width);
      expect(rung.t).toBeCloseTo(rung.x / BOX.width, 6);
    }
  });

  it("pozitif olmayan ölçüde hata fırlatır", () => {
    expect(() => helixGeometry({ width: 0, height: 360, turns: 3 })).toThrow();
    expect(() => helixGeometry({ width: 1200, height: -1, turns: 3 })).toThrow();
    expect(() => helixGeometry({ width: 1200, height: 360, turns: 0 })).toThrow();
  });

  it("aynı girdiye aynı çıktıyı verir", () => {
    expect(helixGeometry(BOX)).toEqual(geometry);
  });
});
