import { mulberry32 } from "./starfield";

export const RETURN_SECONDS = 0.9;
export const DRAG_THRESHOLD = 6;
export const TRAIL_CAPACITY = { desktop: 184, compact: 92 } as const;
export const PARTICLE_LIFETIME = { min: 4.8, max: 6.2 } as const;

export function wrapTime(time: number, duration: number): number {
  return duration > 0 && Number.isFinite(duration)
    ? ((time % duration) + duration) % duration
    : 0;
}

/** Analytic damped return: identical at 30, 60 and 120 Hz. */
export function returnWeight(seconds: number): number {
  if (seconds >= RETURN_SECONDS) return 0;
  const t = Math.max(0, seconds);
  return Math.exp(-10 * t) * (Math.cos(8 * t) + 1.25 * Math.sin(8 * t));
}

export interface Point {
  x: number;
  y: number;
  depth: number;
}

export interface Particle extends Point {
  vx: number;
  vy: number;
  age: number;
  life: number;
  radius: number;
}

/** A bounded, reusable pool. Emit along the actual path, including drags. */
export function createParticleTrail(seed: number, capacity: number) {
  const random = mulberry32(seed);
  const particles: Particle[] = Array.from({ length: capacity }, () => ({
    x: 0,
    y: 0,
    depth: 0,
    vx: 0,
    vy: 0,
    age: 1,
    life: 0,
    radius: 0,
  }));
  let cursor = 0;
  let emission = 0;

  return {
    particles,
    step(
      dt: number,
      from: Point,
      to: Point,
      pointer: Point | null,
      emit = true,
    ) {
      const elapsed = Math.min(Math.max(dt, 0), 0.05);
      for (const p of particles) {
        if (p.age >= p.life) continue;
        p.age += elapsed;
        if (pointer) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 0.01 && distance < 48) {
            const force = (1 - distance / 48) * 90 * elapsed;
            p.vx += (dx / distance) * force;
            p.vy += (dy / distance) * force;
          }
        }
        p.x += p.vx * elapsed;
        p.y += p.vy * elapsed;
        p.vx *= Math.exp(-2 * elapsed);
        p.vy *= Math.exp(-2 * elapsed);
      }

      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      if (!emit || distance < 0.025) {
        emission = 0;
        return;
      }
      emission += (elapsed * capacity) / PARTICLE_LIFETIME.max;
      const count = Math.min(Math.floor(emission), capacity);
      emission -= count;
      for (let i = 0; i < count; i++) {
        const fraction = (i + random()) / count;
        const p = particles[cursor++ % capacity];
        p.x = from.x + (to.x - from.x) * fraction + (random() - 0.5) * 2.6;
        p.y = from.y + (to.y - from.y) * fraction + (random() - 0.5) * 2.6;
        p.depth = from.depth + (to.depth - from.depth) * fraction;
        p.vx = (random() - 0.5) * 5;
        p.vy = (random() - 0.5) * 5;
        p.radius = 0.35 + random() * 0.7;
        p.age = 0;
        p.life =
          PARTICLE_LIFETIME.min +
          random() * (PARTICLE_LIFETIME.max - PARTICLE_LIFETIME.min);
      }
    },
    clear() {
      for (const p of particles) p.age = p.life;
      emission = 0;
    },
  };
}

type PlaybackVideo = Pick<
  HTMLVideoElement,
  | "currentTime"
  | "duration"
  | "paused"
  | "seeking"
  | "readyState"
  | "play"
  | "pause"
>;

/** Native playback when idle; bounded seeks while scrolling. Never queue seeks. */
export function createCrystalPlayback(video: PlaybackVideo, fps = 24) {
  let mode: "idle" | "scrub" | "paused" = "paused";
  let target = 0;
  let scrubUntil = 0;
  let pendingPlay = false;
  let playRejected = false;
  let revision = 0;
  let lastSeek = -1;
  let abortRetries = 0;
  let retryAt = 0;
  let clock = 0;

  const pause = () => {
    revision++;
    video.pause();
  };

  return {
    get mode() {
      return mode;
    },
    get targetTime() {
      return target;
    },
    scroll(
      delta: number,
      viewportHeight: number,
      now: number,
      frozen: boolean,
    ) {
      if (frozen || !Number.isFinite(video.duration) || video.duration <= 0)
        return;
      if (mode !== "scrub") {
        target = video.currentTime;
        lastSeek = -1;
      }
      target = wrapTime(
        target + (delta * video.duration) / (Math.max(1, viewportHeight) * 2),
        video.duration,
      );
      mode = "scrub";
      scrubUntil = now + 180;
      pause();
    },
    step(now: number, frozen: boolean) {
      clock = now;
      if (frozen) {
        if (mode !== "paused" || !video.paused) pause();
        mode = "paused";
        target = video.currentTime;
        return;
      }
      if (mode === "paused") {
        mode = "idle";
        playRejected = false;
        abortRetries = 0;
        retryAt = 0;
      }
      if (mode === "scrub") {
        if (video.seeking) return;
        const frameTime = Math.min(
          Math.round(target * fps) / fps,
          Math.max(0, video.duration - 1 / fps),
        );
        const error = Math.abs(frameTime - video.currentTime);
        // Some decoders round currentTime after seeking. Do not re-seek forever.
        if (error > 1 / (fps * 2) && lastSeek !== frameTime) {
          lastSeek = frameTime;
          video.currentTime = frameTime;
          return;
        }
        if (now < scrubUntil) return;
        mode = "idle";
      }
      if (video.paused && !pendingPlay && !playRejected && now >= retryAt) {
        pendingPlay = true;
        const requested = revision;
        video.play().then(
          () => {
            pendingPlay = false;
            if (requested !== revision) video.pause();
            else abortRetries = 0;
          },
          (error) => {
            pendingPlay = false;
            if (requested !== revision) return;
            // A loop/seek can transiently abort play in WebKit. Retry twice,
            // with backoff; permission and unsupported-media failures stay stopped.
            if (error?.name === "AbortError" && abortRetries < 2) {
              abortRetries++;
              retryAt = clock + 150 * abortRetries;
            } else playRejected = true;
          },
        );
      }
    },
    stop() {
      pause();
      mode = "paused";
      target = video.currentTime;
    },
  };
}
