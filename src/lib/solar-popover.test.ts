import { describe, expect, it } from "vitest";
import { placeSolarPopover, type SceneRect } from "./solar-popover";
import {
  COMPACT_RINGS,
  COMPACT_TILT,
  ORBIT_RINGS,
  ORBIT_TILT,
} from "../data/solar-system";

const area = (a: SceneRect, b: SceneRect) =>
  Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
  Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

describe("placeSolarPopover", () => {
  for (const width of [273, 343, 608, 640, 736, 1100]) {
    it(`keeps the panel inside a ${width}px stage and clear of the crystal`, () => {
      const compact = width <= 640;
      const height = Math.max(480, width * (compact ? 1.17 : 0.56));
      const size =
        (compact ? Math.min(178, width * 0.5) : Math.min(350, width * 0.32)) *
        0.85 *
        1.045;
      const cx = width * 0.5;
      const cy = (height * 324) / 640;
      const crystal = {
        x: cx - size * 0.36 - 8,
        y: cy - size * 0.34 - 8,
        width: size * 0.72 + 16,
        height: size * 0.68 + 16,
      };
      for (const ring of compact ? COMPACT_RINGS : ORBIT_RINGS) {
        for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
          const anchor = {
            x: cx + (Math.cos(angle) * ring * width) / 1000,
            y:
              cy +
              (Math.sin(angle) *
                ring *
                (compact ? COMPACT_TILT : ORBIT_TILT) *
                height) /
                640,
          };
          const result = placeSolarPopover(
            anchor,
            { width: 248, height: 148 },
            { width, height },
            crystal,
          );
          expect(result.x).toBeGreaterThanOrEqual(12);
          expect(result.y).toBeGreaterThanOrEqual(12);
          expect(result.x + result.width).toBeLessThanOrEqual(width - 12);
          expect(result.y + result.height).toBeLessThanOrEqual(height - 12);
          expect(area(result, crystal)).toBe(0);
        }
      }
    });
  }
  it("keeps its side while the pointer makes a tiny parallax change", () => {
    const crystal = { x: 460, y: 240, width: 180, height: 180 };
    const scene = { width: 1100, height: 616 };
    const panel = { width: 248, height: 148 };
    const first = placeSolarPopover({ x: 220, y: 350 }, panel, scene, crystal);
    const next = placeSolarPopover(
      { x: 221, y: 349 },
      panel,
      scene,
      crystal,
      [],
      first.side,
    );
    expect(next.side).toBe(first.side);
    expect(Math.hypot(next.x - first.x, next.y - first.y)).toBeLessThan(3);
  });
});
