import { describe, expect, it } from "vitest";

import {
  activeIndex,
  passProgress,
  rangeProgress,
  stickyProgress,
} from "@/lib/scroll-scene";

/**
 * Service Chapter scroll sahnelerinin tarayıcı gerektirmeyen ölçüm
 * mantığı. Sonuçlar doğrudan bir CSS custom property'sine yazıldığı için
 * her koşulda [0, 1] aralığında ve NaN'dan arınmış olmalı — geçersiz bir
 * değer `clip-path`'i düşürür ve sahne siyah kalır.
 */

describe("stickyProgress", () => {
  it("sahne üst kenardayken 0, yolun yarısında 0.5 döner", () => {
    expect(stickyProgress(0, 2000, 1000)).toBe(0);
    expect(stickyProgress(-500, 2000, 1000)).toBe(0.5);
  });

  it("yolun ötesinde 1'e, öncesinde 0'a kısılır", () => {
    expect(stickyProgress(-5000, 2000, 1000)).toBe(1);
    expect(stickyProgress(300, 2000, 1000)).toBe(0);
  });

  it("kaydırma payı yoksa ya da ölçü bozuksa final durumu (1) verir", () => {
    expect(stickyProgress(0, 800, 1000)).toBe(1);
    expect(stickyProgress(Number.NaN, 2000, 1000)).toBe(1);
  });
});

describe("passProgress", () => {
  it("öğe ekranın altından girerken 0, üstünden çıkarken 1 döner", () => {
    expect(passProgress(1000, 500, 1000)).toBe(0);
    expect(passProgress(-500, 500, 1000)).toBe(1);
  });

  it("yolun ortasında doğrusal ilerler", () => {
    expect(passProgress(250, 500, 1000)).toBe(0.5);
  });

  it("aralık dışını kısar, bozuk ölçüde final durumu verir", () => {
    expect(passProgress(4000, 500, 1000)).toBe(0);
    expect(passProgress(-4000, 500, 1000)).toBe(1);
    expect(passProgress(Number.NaN, 500, 1000)).toBe(1);
  });
});

describe("rangeProgress", () => {
  it("ilerlemeyi bir alt aralığa eşler", () => {
    expect(rangeProgress(0.5, 0.25, 0.75)).toBe(0.5);
    expect(rangeProgress(0.25, 0.25, 0.75)).toBe(0);
    expect(rangeProgress(0.9, 0.25, 0.75)).toBe(1);
  });

  it("sıfır genişlikli aralıkta eşik gibi davranır", () => {
    expect(rangeProgress(0.4, 0.5, 0.5)).toBe(0);
    expect(rangeProgress(0.5, 0.5, 0.5)).toBe(1);
  });
});

describe("activeIndex", () => {
  it("ilerlemeyi liste indeksine çevirir, sonu son öğeye kısar", () => {
    expect(activeIndex(0, 10)).toBe(0);
    expect(activeIndex(0.5, 10)).toBe(5);
    expect(activeIndex(1, 10)).toBe(9);
  });

  it("boş listede -1 döner", () => {
    expect(activeIndex(0.5, 0)).toBe(-1);
  });
});
