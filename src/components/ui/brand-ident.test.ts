import { describe, expect, it } from "vitest";
import { gatherAmount } from "./brand-ident";

/*
 * `sampleText` ve `fitFontSize` gerçek bir canvas bağlamı istiyor
 * (`getImageData`, `measureText`) — o ikisinin sözleşmesi e2e'de,
 * bandın gerçekten "HIBRID 360" yazdığı ölçülerek bağlanıyor.
 * `gatherAmount` saf sayı olduğu için burada.
 */
describe("gatherAmount", () => {
  it("bant ekrana girmeden parçacıklar serbest", () => {
    expect(gatherAmount(0)).toBe(0);
    expect(gatherAmount(-0.4)).toBe(0);
  });

  it("toplanma evresinde artıyor", () => {
    expect(gatherAmount(0.1)).toBeGreaterThan(0);
    expect(gatherAmount(0.3)).toBeGreaterThan(gatherAmount(0.1));
  });

  /*
   * ASIL ŞART: yazı OKUNACAK kadar durmalı. Doğrudan toplanıp dağılan
   * bir animasyonda kelime seçilemiyordu; orta evrede değer tam 1'de
   * sabit kalıyor.
   */
  it("orta evrede tam toplanmış ve sabit", () => {
    expect(gatherAmount(0.45)).toBe(1);
    expect(gatherAmount(0.5)).toBe(1);
    expect(gatherAmount(0.6)).toBe(1);
  });

  it("dağılma evresinde azalıyor ve sonunda sıfırlanıyor", () => {
    expect(gatherAmount(0.8)).toBeLessThan(1);
    expect(gatherAmount(0.95)).toBeLessThan(gatherAmount(0.8));
    expect(gatherAmount(1)).toBeCloseTo(0, 5);
  });

  it("her zaman 0-1 aralığında", () => {
    for (let i = -20; i <= 120; i += 1) {
      const v = gatherAmount(i / 100);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("monoton: önce yalnız artar, sonra yalnız azalır", () => {
    let previous = gatherAmount(0);
    for (let i = 1; i <= 42; i += 1) {
      const v = gatherAmount(i / 100);
      expect(v).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = v;
    }
    previous = gatherAmount(0.62);
    for (let i = 63; i <= 100; i += 1) {
      const v = gatherAmount(i / 100);
      expect(v).toBeLessThanOrEqual(previous + 1e-9);
      previous = v;
    }
  });
});
