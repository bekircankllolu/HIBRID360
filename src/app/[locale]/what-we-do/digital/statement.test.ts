import { describe, expect, it } from "vitest";
import { splitStatementLead } from "./statement";
import trMessages from "@/messages/tr.json";
import enMessages from "@/messages/en.json";

/**
 * Gerçek cümleler mesaj dosyalarından okunuyor (retype edilmiyor) — hem
 * Türkçe karakterlerin elle yeniden yazılırken bozulma riskini ortadan
 * kaldırır hem de mesaj metni değişirse test sessizce geçmek yerine
 * fallback davranışını görünür kılar.
 */
const enStatement = enMessages.services.digital.bandBody[0];
const trStatement = trMessages.services.digital.bandBody[0];

describe("splitStatementLead", () => {
  it("splits the English statement into a muted lead and full-contrast rest", () => {
    const result = splitStatementLead(enStatement, "en");
    expect(result).not.toBeNull();
    expect(result!.lead).toBe("We build ");
    expect(result!.rest).toBe("digital worlds people can move through.");
  });

  it("splits the Turkish statement into a muted lead and full-contrast rest", () => {
    const result = splitStatementLead(trStatement, "tr");
    expect(result).not.toBeNull();
    expect(result!.lead).toBe("İnsanların içinde dolaşabileceği ");
    expect(result!.rest).toBe("dijital dünyalar kuruyoruz.");
  });

  it("reconstructs the exact original text and spacing for both locales", () => {
    const en = splitStatementLead(enStatement, "en")!;
    expect(en.lead + en.rest).toBe(enStatement);

    const tr = splitStatementLead(trStatement, "tr")!;
    expect(tr.lead + tr.rest).toBe(trStatement);
  });

  /**
   * Asıl güvenlik ağı: mesaj dosyasındaki cümle normal bir içerik
   * güncellemesiyle değişirse sabit baş öbeği artık tutmaz. Beklenen
   * davranış sessiz bozulma değil, tam metnin normal render edilmesi.
   */
  it("falls back to null when the copy is rewritten and no longer starts with the lead", () => {
    expect(
      splitStatementLead("We create digital worlds people can move through.", "en"),
    ).toBeNull();
    expect(
      splitStatementLead("Dijital dünyalar kuruyoruz, insanlar içinde dolaşsın.", "tr"),
    ).toBeNull();
  });

  it("falls back to null for the wrong locale's lead, empty and lead-only text", () => {
    // TR cümlesi EN sabitiyle bölünemez ve tersi.
    expect(splitStatementLead(trStatement, "en")).toBeNull();
    expect(splitStatementLead(enStatement, "tr")).toBeNull();
    expect(splitStatementLead("", "en")).toBeNull();
    // Yalnızca baş öbek varsa geriye anlamlı bir "rest" kalmaz.
    expect(splitStatementLead("We build ", "en")).toBeNull();
  });

  it("keeps all three bandBody paragraphs intact in both locales (content integrity)", () => {
    expect(enMessages.services.digital.bandBody).toHaveLength(3);
    expect(trMessages.services.digital.bandBody).toHaveLength(3);
  });
});
