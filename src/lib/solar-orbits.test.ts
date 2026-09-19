import { describe, expect, it } from "vitest";
import {
  approach,
  cameraEye,
  eccentricAnomaly,
  focusDistance,
  lookAt,
  multiply,
  orbitPath,
  orbitPosition,
  orbitalPeriod,
  perspective,
  projectToScreen,
  shortestAngle,
  type OrbitalElements,
} from "./solar-orbits";

const CIRCLE: OrbitalElements = {
  semiMajor: 4,
  eccentricity: 0,
  inclination: 0,
  node: 0,
  phase: 0,
};
const ELLIPSE: OrbitalElements = { ...CIRCLE, eccentricity: 0.3 };

describe("Kepler çözücü", () => {
  it("E − e·sin E = M denklemini sağlar", () => {
    for (const e of [0, 0.1, 0.25, 0.4]) {
      for (const m of [0, 0.5, 1.7, 3.1, 4.9, 6.1]) {
        const E = eccentricAnomaly(m, e);
        expect(Math.abs(E - e * Math.sin(E) - m)).toBeLessThan(1e-8);
      }
    }
  });

  it("dairesel yörüngede E = M", () => {
    expect(eccentricAnomaly(1.234, 0)).toBeCloseTo(1.234, 12);
  });
});

describe("orbitPosition", () => {
  it("dairesel yörüngede yarıçap sabit kalır", () => {
    const period = orbitalPeriod(CIRCLE.semiMajor);
    for (let i = 0; i <= 8; i++) {
      const p = orbitPosition(CIRCLE, (i / 8) * period);
      expect(Math.hypot(p[0], p[1], p[2])).toBeCloseTo(4, 6);
    }
  });

  it("bir periyot sonra başlangıç noktasına döner", () => {
    const period = orbitalPeriod(ELLIPSE.semiMajor);
    const start = orbitPosition(ELLIPSE, 0);
    const wrapped = orbitPosition(ELLIPSE, period);
    for (let i = 0; i < 3; i++) expect(wrapped[i]).toBeCloseTo(start[i], 5);
  });

  it("elipste yakın noktada hızlı, uzak noktada yavaş ilerler (Kepler II)", () => {
    const period = orbitalPeriod(ELLIPSE.semiMajor);
    const step = period / 200;
    const speedAt = (t: number) => {
      const a = orbitPosition(ELLIPSE, t);
      const b = orbitPosition(ELLIPSE, t + step);
      return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / step;
    };
    const perihelion = speedAt(0); // E = 0 → odağa en yakın
    const aphelion = speedAt(period / 2);
    expect(perihelion).toBeGreaterThan(aphelion * 1.5);
  });

  it("içteki gezegen dıştakinden hızlı döner (Kepler III)", () => {
    expect(orbitalPeriod(2)).toBeLessThan(orbitalPeriod(6));
    // T ∝ a^1.5: yarıçap 4 katına çıkınca periyot 8 katı olmalı.
    expect(orbitalPeriod(8) / orbitalPeriod(2)).toBeCloseTo(8, 6);
  });

  it("eğim yörüngeyi düzlemden çıkarır", () => {
    const tilted = orbitPosition({ ...CIRCLE, inclination: 0.4 }, orbitalPeriod(4) * 0.25);
    expect(Math.abs(tilted[1])).toBeGreaterThan(0.5);
    const flat = orbitPosition(CIRCLE, orbitalPeriod(4) * 0.25);
    expect(Math.abs(flat[1])).toBeLessThan(1e-9);
  });

  it("yörünge yolu kapalı ve doğru sayıda nokta üretir", () => {
    const path = orbitPath(ELLIPSE, 64);
    expect(path).toHaveLength(64 * 3);
    expect(path.every((v) => Number.isFinite(v))).toBe(true);
  });
});

describe("izdüşüm", () => {
  const view = lookAt([0, 0, 10], [0, 0, 0]);
  const projection = perspective(Math.PI / 4, 16 / 9, 0.1, 100);
  const vp = multiply(projection, view);

  it("orijini ekranın ortasına düşürür", () => {
    const p = projectToScreen(vp, [0, 0, 0], 1600, 900);
    expect(p.x).toBeCloseTo(800, 3);
    expect(p.y).toBeCloseTo(450, 3);
    expect(p.visible).toBe(true);
  });

  it("sağdaki nokta merkezin sağına düşer, yukarıdaki yukarı", () => {
    expect(projectToScreen(vp, [2, 0, 0], 1600, 900).x).toBeGreaterThan(800);
    expect(projectToScreen(vp, [0, 2, 0], 1600, 900).y).toBeLessThan(450);
  });

  it("kameranın arkasındaki noktayı görünmez işaretler", () => {
    const behind = projectToScreen(vp, [0, 0, 40], 1600, 900);
    expect(behind.visible).toBe(false);
  });

  it("geçersiz koordinatta NaN sızdırmaz", () => {
    const bad = projectToScreen(vp, [Number.NaN, 0, 0], 1600, 900);
    expect(Number.isFinite(bad.x)).toBe(true);
    expect(bad.visible).toBe(false);
  });
});

describe("kamera", () => {
  it("uzaklığı korur", () => {
    const eye = cameraEye({ target: [1, 0, -2], distance: 7, yaw: 0.9, pitch: 0.3 });
    expect(Math.hypot(eye[0] - 1, eye[1], eye[2] + 2)).toBeCloseTo(7, 6);
  });

  it("odak uzaklığı büyük gezegende daha uzak", () => {
    const fov = Math.PI / 4;
    expect(focusDistance(0.3, fov)).toBeGreaterThan(focusDistance(0.1, fov));
  });

  it("yaklaşma kare hızından bağımsız: iki yarım adım bir tam adıma eşit", () => {
    const one = approach(0, 10, 4, 0.2);
    const two = approach(approach(0, 10, 4, 0.1), 10, 4, 0.1);
    expect(two).toBeCloseTo(one, 10);
  });

  it("kısa yoldan döner", () => {
    // 350° → 10°: uzun yol +340°, kısa yol +20°.
    const from = (350 * Math.PI) / 180;
    const to = (10 * Math.PI) / 180;
    expect(shortestAngle(from, to) - from).toBeCloseTo((20 * Math.PI) / 180, 6);
  });
});
