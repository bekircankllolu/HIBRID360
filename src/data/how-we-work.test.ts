import { describe, expect, it } from "vitest";
import { routing } from "@/i18n/routing";
import { budgetBands, processSteps } from "@/data/how-we-work";

/**
 * TR çevirisi EN metinle aynı yapıda kalmalı: adım sayısı, {pending} işaretçisi
 * ve bütçe satırları. Biri güncellenip diğeri unutulursa sayfa dilleri
 * arasında tutarsız bir tablo çıkar.
 */
describe("how-we-work verisi", () => {
  it("her locale için tanımlı", () => {
    for (const locale of routing.locales) {
      expect(processSteps[locale].length).toBeGreaterThan(0);
      expect(budgetBands[locale].length).toBeGreaterThan(0);
    }
  });

  it("süreç adımları iki dilde aynı sırada ve aynı sayıda", () => {
    expect(processSteps.tr.map((s) => s.step)).toEqual(processSteps.en.map((s) => s.step));
    expect(processSteps.tr.map((s) => s.pendingDecision)).toEqual(
      processSteps.en.map((s) => s.pendingDecision),
    );
  });

  it("{pending} işaretçisi yalnızca karar bekleyen adımda ve her iki dilde tek kez", () => {
    for (const locale of routing.locales) {
      for (const step of processSteps[locale]) {
        const markers = step.body.split("{pending}").length - 1;
        expect(markers).toBe(step.pendingDecision ? 1 : 0);
      }
    }
  });

  it("bütçe satırları iki dilde aynı sayıda; rakamlar uydurulmamış", () => {
    expect(budgetBands.tr).toHaveLength(budgetBands.en.length);
    budgetBands.tr.forEach((band, index) => {
      const source = budgetBands.en[index];
      expect(band.scope).toHaveLength(source.scope.length);
      expect(band.startingFrom).toBe(source.startingFrom);
      expect(band.duration).toBe(source.duration);
    });
  });

  it("çevrilmemiş (İngilizce kalmış) Türkçe başlık yok", () => {
    // "Cloud TV" ürün adıdır, iki dilde aynı kalır; diğer tüm başlıklar farklı olmalı.
    const sameTitles = processSteps.tr.filter(
      (step, i) => step.title === processSteps.en[i].title,
    );
    expect(sameTitles).toEqual([]);
    const sameFormats = budgetBands.tr
      .filter((band, i) => band.format === budgetBands.en[i].format)
      .map((band) => band.format);
    expect(sameFormats).toEqual(["Cloud TV"]);
  });
});
