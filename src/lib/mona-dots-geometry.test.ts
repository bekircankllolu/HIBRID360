import { describe, expect, it } from "vitest";
import {
  createParticleCloud, LAYER, MAX_DELAY, projectFrontDots, RING_RADIUS, RING_TUBE,
} from "./mona-dots-geometry";

const cloud = createParticleCloud({ shell: 3000, core: 1000, halo: 600, dust: 200, haze: 150 });
const layerOf = (i: number) => cloud.meta[i * 4 + 2];
const isBody = (i: number) => layerOf(i) <= LAYER.core;
const vec3 = (data: Float32Array, i: number) => Array.from(data.slice(i * 3, i * 3 + 3));

describe("createParticleCloud", () => {
  it("creates every layer and keeps the haze at the end", () => {
    const counts = [0, 0, 0, 0, 0];
    for (let i = 0; i < cloud.count; i++) counts[layerOf(i)]++;
    expect(counts).toEqual([3000, 1000, 600, 200, 150]);
    expect(cloud.hazeCount).toBe(150);
    for (let i = cloud.count - cloud.hazeCount; i < cloud.count; i++) expect(layerOf(i)).toBe(LAYER.haze);
    expect(cloud.eye).toHaveLength(cloud.count * 4);
    expect(cloud.heart).toHaveLength(cloud.count * 3);
    expect(cloud.ring).toHaveLength(cloud.count * 3);
  });

  it("keeps each layer inside its radius band", () => {
    const bands: Record<number, [number, number]> = {
      [LAYER.shell]: [0.97, 1.03], [LAYER.core]: [0, 0.79], [LAYER.halo]: [1.14, 1.91],
      [LAYER.dust]: [1.89, 3.21], [LAYER.haze]: [0.14, 0.96],
    };
    for (let i = 0; i < cloud.count; i++) {
      const [min, max] = bands[layerOf(i)];
      const radius = Math.hypot(...vec3(cloud.positions, i));
      expect(radius).toBeGreaterThanOrEqual(min);
      expect(radius).toBeLessThanOrEqual(max);
    }
  });

  it("starts every dot just outside the screen and compresses the delays", () => {
    for (let i = 0; i < cloud.count; i++) {
      const edge = Math.max(Math.abs(cloud.starts[i * 2]), Math.abs(cloud.starts[i * 2 + 1]));
      expect(edge).toBeGreaterThanOrEqual(1.07);
      expect(edge).toBeLessThanOrEqual(1.51);
      const delay = cloud.meta[i * 4 + 3];
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(delay).toBeLessThanOrEqual(MAX_DELAY);
    }
  });

  it("mixes mostly small dots with a few large ones and big faint haze", () => {
    const sizes: number[] = [];
    for (let i = 0; i < cloud.count; i++) {
      const size = cloud.meta[i * 4 + 1];
      if (layerOf(i) === LAYER.haze) {
        expect(size).toBeGreaterThanOrEqual(8);
        expect(size).toBeLessThanOrEqual(14);
      } else {
        expect(size).toBeGreaterThanOrEqual(0.6);
        expect(size).toBeLessThanOrEqual(3.2);
        sizes.push(size);
      }
    }
    const large = sizes.filter(size => size > 1.8).length / sizes.length;
    expect(large).toBeGreaterThan(0.01);
    expect(large).toBeLessThan(0.2);
  });

  it("places the eye, heart and ring targets inside their outlines", () => {
    let followers = 0;
    for (let i = 0; i < cloud.count; i++) {
      if (!isBody(i)) continue;
      const [ex, ey, , gaze] = Array.from(cloud.eye.slice(i * 4, i * 4 + 4));
      expect(Math.abs(ex)).toBeLessThanOrEqual(1.2);
      expect(Math.abs(ey)).toBeLessThanOrEqual(0.7);
      expect([0, 1]).toContain(gaze);
      if (gaze === 1) {
        followers++;
        expect(Math.hypot(ex, ey)).toBeLessThanOrEqual(0.461);
      }
      const [hx, hy] = vec3(cloud.heart, i);
      expect(Math.abs(hx)).toBeLessThanOrEqual(1.1);
      expect(Math.abs(hy)).toBeLessThanOrEqual(1.1);
      const [rx, ry, rz] = vec3(cloud.ring, i);
      expect(Math.abs(Math.hypot(rx, ry) - RING_RADIUS)).toBeLessThanOrEqual(RING_TUBE + 1e-6);
      expect(Math.abs(rz)).toBeLessThanOrEqual(RING_TUBE + 1e-6);
    }
    // Göz: iris ve gözbebeği bakışı izler, kapaklar sabit kalır.
    expect(followers / 4000).toBeGreaterThan(0.4);
    expect(followers / 4000).toBeLessThan(0.8);
  });

  it("leaves the atmosphere layers where they are in every shape", () => {
    for (let i = 0; i < cloud.count; i++) {
      if (isBody(i)) continue;
      const own = vec3(cloud.positions, i);
      expect(vec3(cloud.heart, i)).toEqual(own);
      expect(vec3(cloud.ring, i)).toEqual(own);
      expect(Array.from(cloud.eye.slice(i * 4, i * 4 + 3))).toEqual(own);
    }
  });

  it("is deterministic per seed", () => {
    const options = { shell: 500, core: 100, halo: 50, dust: 20, haze: 10 };
    const a = createParticleCloud({ seed: 7, ...options });
    const b = createParticleCloud({ seed: 7, ...options });
    const c = createParticleCloud({ seed: 8, ...options });
    expect(Array.from(a.positions)).toEqual(Array.from(b.positions));
    expect(Array.from(a.heart)).toEqual(Array.from(b.heart));
    expect(Array.from(a.positions)).not.toEqual(Array.from(c.positions));
  });
});

describe("projectFrontDots", () => {
  it("projects only the visible shell and core inside the sphere", () => {
    const dots = projectFrontDots(cloud);
    expect(dots.length).toBeGreaterThan(4000 * 0.35);
    expect(dots.length).toBeLessThan(4000 * 0.65);
    for (const dot of dots) {
      expect(Math.hypot(dot.x, dot.y)).toBeLessThanOrEqual(1.03);
      expect(dot.depth).toBeGreaterThan(0);
    }
  });
});
