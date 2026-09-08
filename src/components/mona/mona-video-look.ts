export const MONA_LOOK = { right: 0.875, center: 1.75, left: 2.75, fps: 24 } as const;

/** Viewer-relative directions, calibrated against the supplied performance. */
export function monaLookTime(x: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  const position = Number.isFinite(x) ? Math.max(-1, Math.min(1, x)) : 0;
  const amount = Math.max(0, (Math.abs(position) - 0.04) / 0.96);
  const edge = position < 0 ? MONA_LOOK.left : MONA_LOOK.right;
  const time = MONA_LOOK.center + (edge - MONA_LOOK.center) * amount;
  return Math.max(0, Math.min(time, duration - 1 / MONA_LOOK.fps));
}

export function smoothMonaLook(current: number, target: number, deltaSeconds: number): number {
  const dt = Math.max(0, Math.min(0.05, deltaSeconds));
  const next = current + (target - current) * (1 - Math.exp(-14 * dt));
  return Math.abs(next - target) < 1 / (MONA_LOOK.fps * 4) ? target : next;
}
