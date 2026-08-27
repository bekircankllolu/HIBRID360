import { describe, expect, it } from "vitest";

import {
  advanceShootingStars,
  createStarfield,
  mulberry32,
  nextShootingStarDelay,
  shootingStarAlpha,
  spawnShootingStar,
  STAR_DRIFT,
  STAR_PARALLAX,
  STAR_RGB,
  type ShootingStar,
} from "./starfield";

describe("mulberry32", () => {
  it("aynı tohum aynı diziyi verir", () => {
    const a = mulberry32(1234);
    const b = mulberry32(1234);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("farklı tohum farklı dizi verir", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });

  it("değerler [0, 1) aralığında kalır", () => {
    const rng = mulberry32(99);
    for (let i = 0; i < 500; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("createStarfield", () => {
  const stars = createStarfield(0x1b360, 200);

  it("istenen sayıda yıldız üretir", () => {
    expect(stars).toHaveLength(200);
  });

  it("tohumlu: aynı çağrı aynı alanı verir", () => {
    expect(createStarfield(0x1b360, 40)).toEqual(createStarfield(0x1b360, 40));
  });

  it("konumlar normalize kutuda kalır", () => {
    for (const star of stars) {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThan(1);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeLessThan(1);
    }
  });

  it("her yıldızın katmanı için paralaks ve sürüklenme tanımlı", () => {
    for (const star of stars) {
      expect(STAR_PARALLAX[star.layer]).toBeTypeOf("number");
      expect(STAR_DRIFT[star.layer]).toBeTypeOf("number");
    }
  });

  it("yalnızca marka paletindeki renkleri kullanır", () => {
    const allowed = new Set(Object.keys(STAR_RGB));
    for (const star of stars) {
      expect(allowed.has(star.tint)).toBe(true);
    }
  });

  it("çok sayıda sönük, az sayıda parlak yıldız üretir", () => {
    // rng()**3 dağılımının amacı bu: homojen bir alan yapay görünüyor.
    const bright = stars.filter((s) => s.alpha > 0.6).length;
    expect(bright).toBeGreaterThan(0);
    expect(bright).toBeLessThan(stars.length * 0.25);
  });

  it("yarıçap ve parlaklık makul sınırlarda", () => {
    for (const star of stars) {
      expect(star.radius).toBeGreaterThan(0);
      // CSS pikseli: 0.35 taban + en fazla 1.05 parlaklık payı.
      expect(star.radius).toBeLessThanOrEqual(1.4);
      expect(star.alpha).toBeGreaterThan(0);
      expect(star.alpha).toBeLessThanOrEqual(1);
    }
  });
});

describe("spawnShootingStar", () => {
  it("her zaman aşağı doğru hareket eder", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      expect(spawnShootingStar(rng).vy).toBeGreaterThan(0);
    }
  });

  it("yatay bileşen dikeyden baskındır (dik inen meteor yapay durur)", () => {
    const rng = mulberry32(11);
    for (let i = 0; i < 100; i++) {
      const star = spawnShootingStar(rng);
      expect(Math.abs(star.vx)).toBeGreaterThan(Math.abs(star.vy));
    }
  });

  it("iki yönde de doğar", () => {
    const rng = mulberry32(3);
    const stars = Array.from({ length: 60 }, () => spawnShootingStar(rng));
    expect(stars.some((s) => s.vx < 0)).toBe(true);
    expect(stars.some((s) => s.vx > 0)).toBe(true);
  });

  it("ömrü ve kuyruğu pozitif", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 50; i++) {
      const star = spawnShootingStar(rng);
      expect(star.ttl).toBeGreaterThan(0);
      expect(star.length).toBeGreaterThan(0);
    }
  });
});

describe("nextShootingStarDelay", () => {
  it("aralık düzenli değil ama sınırlı", () => {
    const rng = mulberry32(42);
    const delays = Array.from({ length: 50 }, () => nextShootingStarDelay(rng));
    for (const delay of delays) {
      expect(delay).toBeGreaterThanOrEqual(3.4);
      expect(delay).toBeLessThanOrEqual(9.9);
    }
    expect(new Set(delays).size).toBeGreaterThan(40);
  });
});

describe("shootingStarAlpha", () => {
  const base = (age: number): ShootingStar => ({
    x: 0.5,
    y: 0.2,
    vx: 0.5,
    vy: 0.2,
    age,
    ttl: 1,
    length: 0.12,
    tint: "white",
  });

  it("doğumda ve ölümde görünmez", () => {
    expect(shootingStarAlpha(base(0))).toBe(0);
    expect(shootingStarAlpha(base(1))).toBe(0);
    expect(shootingStarAlpha(base(1.4))).toBe(0);
  });

  it("hızlı açılır", () => {
    expect(shootingStarAlpha(base(0.18))).toBeGreaterThan(0.7);
  });

  it("ömrün sonuna doğru söner", () => {
    expect(shootingStarAlpha(base(0.9))).toBeLessThan(
      shootingStarAlpha(base(0.4)),
    );
  });

  it("hiçbir zaman 1'i aşmaz", () => {
    for (let age = 0; age < 1; age += 0.01) {
      expect(shootingStarAlpha(base(age))).toBeLessThanOrEqual(1);
    }
  });
});

describe("advanceShootingStars", () => {
  const make = (age: number, ttl: number): ShootingStar => ({
    x: 0.2,
    y: 0.1,
    vx: 0.5,
    vy: 0.3,
    age,
    ttl,
    length: 0.1,
    tint: "white",
  });

  it("konumu hıza göre ilerletir", () => {
    const star = make(0, 2);
    advanceShootingStars([star], 0.5);
    expect(star.x).toBeCloseTo(0.45, 5);
    expect(star.y).toBeCloseTo(0.25, 5);
  });

  it("ömrü dolanları eler", () => {
    const alive = make(0, 2);
    const dying = make(1.95, 2);
    const result = advanceShootingStars([alive, dying], 0.1);
    expect(result).toEqual([alive]);
  });

  it("boş listeyi güvenle işler", () => {
    expect(advanceShootingStars([], 0.016)).toEqual([]);
  });
});
