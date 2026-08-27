export interface SceneRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Side =
  | "above"
  | "below"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface PopoverPlacement extends SceneRect {
  side: Side;
  tip: { x: number; y: number };
}

function overlap(a: SceneRect, b: SceneRect) {
  return (
    Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
    Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
  );
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(Math.max(min, max), value));

/** Prefer the point's nearest clear side; never let the panel leave the stage. */
export function placeSolarPopover(
  anchor: { x: number; y: number },
  panel: { width: number; height: number },
  scene: { width: number; height: number },
  crystal: SceneRect,
  obstacles: SceneRect[] = [],
  preferred?: Side,
): PopoverPlacement {
  const padding = 12;
  const gap = 24;
  const { width, height } = panel;
  const maxX = scene.width - width - padding;
  const maxY = scene.height - height - padding;
  const point = { x: anchor.x - 18, y: anchor.y - 18, width: 36, height: 36 };
  const candidates: Array<[Side, number, number]> = [
    ["above", anchor.x - width / 2, anchor.y - height - gap],
    ["below", anchor.x - width / 2, anchor.y + gap],
    ["left", anchor.x - width - gap, anchor.y - height / 2],
    ["right", anchor.x + gap, anchor.y - height / 2],
    ["top-left", padding, padding],
    ["top-right", maxX, padding],
    ["bottom-left", padding, maxY],
    ["bottom-right", maxX, maxY],
  ];
  return candidates
    .map(([side, x, y]) => {
      const rect = {
        x: clamp(x, padding, maxX),
        y: clamp(y, padding, maxY),
        width,
        height,
      };
      const tip = {
        x: clamp(anchor.x, rect.x, rect.x + width),
        y: clamp(anchor.y, rect.y, rect.y + height),
      };
      // Hysteresis prevents a tiny parallax change from flipping an open panel.
      const occlusion = overlap(rect, crystal);
      const score =
        (occlusion > 0 ? 1_000_000 : 0) +
        occlusion * 100 +
        overlap(rect, point) * 80 +
        obstacles.reduce((sum, obstacle) => sum + overlap(rect, obstacle), 0) *
          2 +
        Math.hypot(anchor.x - tip.x, anchor.y - tip.y) +
        (preferred && side !== preferred ? 16_384 : 0);
      return { ...rect, side, tip, score };
    })
    .sort((a, b) => a.score - b.score)[0];
}
