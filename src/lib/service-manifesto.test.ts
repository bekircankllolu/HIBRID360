import { describe, expect, it } from "vitest";
import { selectManifesto, splitSentences } from "./service-manifesto";

/**
 * Testler sentetik değil, `src/messages/en.json`'daki gerçek servis
 * metinleriyle yazıldı: metin değişirse seçim sessizce bozulmasın.
 */

const PRODUCTION_BODY = [
  "Hibrid 360 is an experienced all-around production and post-production agency that offers new-generation solutions with in-house capabilities for a plethora of sound, light and stage productions for your events.",
  "With more than 20 years of experience in production, we work with in-house assets such as directors and camera crews, photographers, copywriters and screenwriters, lighting crews and specialists working with video editing software such as After Effects and Illustrator for light and colour correction, green screen effects and dubbing.",
] as const;

const POST_PRODUCTION_BODY = [
  "Our agency does all post-production work for both the digital and the production side of a project. We are a full-service post-production agency.",
  "Hibrid 360 also works with young YouTube-generation artists who are experienced in 3D architectural rendering, kinetic typography, character creation and AutoCAD animation.",
] as const;

const EVENT_BODY = [
  "Here at Hibrid 360, we provide services with a creative outlook and innovative ideas for the events, meetings and launch programmes of national and international corporate clients.",
  "We make a difference through unforgettable events.",
  "We provide a plethora of out-of-the-ordinary services ranging from concept projects, field activities and roadshows to test drives; from exhibitions, festivals, company parties and opening events to award ceremonies and social responsibility projects.",
] as const;

describe("splitSentences", () => {
  it("mevcut noktalamadan böler, noktalamayı cümlede bırakır", () => {
    expect(splitSentences(POST_PRODUCTION_BODY[0])).toEqual([
      "Our agency does all post-production work for both the digital and the production side of a project.",
      "We are a full-service post-production agency.",
    ]);
  });

  it("tek cümlelik paragrafı bölmez", () => {
    expect(splitSentences(EVENT_BODY[1])).toEqual([EVENT_BODY[1]]);
  });

  it("ondalık sayıda bölmez", () => {
    expect(splitSentences("The reel runs 3.5 minutes. Nothing more.")).toEqual([
      "The reel runs 3.5 minutes.",
      "Nothing more.",
    ]);
  });

  it("kapanış tırnağını cümlede bırakır", () => {
    expect(splitSentences("They call it “Cloudtivi.” Everyone watches.")).toEqual([
      "They call it “Cloudtivi.”",
      "Everyone watches.",
    ]);
  });

  it("boş metin için boş dizi döner", () => {
    expect(splitSentences("   ")).toEqual([]);
  });
});

describe("selectManifesto", () => {
  it("kendi başına kısa olan maddeyi seçer ve gövdeden çıkarır", () => {
    const result = selectManifesto({ candidates: EVENT_BODY, lede: "UNFORGETTABLE." });

    expect(result.source).toBe("candidate");
    expect(result.sentences).toEqual(["We make a difference through unforgettable events."]);
    expect(result.remainder).toEqual([EVENT_BODY[0], EVENT_BODY[2]]);
  });

  it("paragraf ortasından veya sonundan cümle çekmez, gövdeyi bütün bırakır", () => {
    const result = selectManifesto({
      candidates: POST_PRODUCTION_BODY,
      extras: ["Editing, colour, sound, motion and 3D."],
      lede: "THE SECOND-TO-LAST SHOT.",
    });

    expect(result.source).toBe("extra");
    expect(result.sentences).toEqual(["Editing, colour, sound, motion and 3D."]);
    expect(result.remainder).toEqual([...POST_PRODUCTION_BODY]);
  });

  it("hiçbir aday kısa değilse lede'ye düşer ve gövdeye dokunmaz", () => {
    const result = selectManifesto({
      candidates: PRODUCTION_BODY,
      lede: "PURE. SIMPLE. POWERFUL.",
    });

    expect(result.source).toBe("lede");
    expect(result.sentences).toEqual(["PURE. SIMPLE. POWERFUL."]);
    expect(result.remainder).toEqual([...PRODUCTION_BODY]);
  });

  it("aday listesi boşsa lede'ye düşer", () => {
    const result = selectManifesto({ candidates: [], lede: "THERE IS NO TIME LIKE RIGHT NOW." });

    expect(result.source).toBe("lede");
    expect(result.sentences).toEqual(["THERE IS NO TIME LIKE RIGHT NOW."]);
    expect(result.remainder).toEqual([]);
  });

  it("en fazla iki cümle seçer", () => {
    const result = selectManifesto({
      candidates: ["One short line.", "Another short line.", "A third short line."],
      lede: "X.",
    });

    expect(result.sentences).toEqual(["One short line.", "Another short line."]);
    expect(result.remainder).toEqual(["A third short line."]);
  });

  it("kelime sınırı: 14 kelime girer, 15 kelime girmez", () => {
    const fourteen = "One two three four five six seven eight nine ten eleven twelve thirteen fourteen.";
    const fifteen = "One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen.";

    expect(selectManifesto({ candidates: [fourteen], lede: "X." }).source).toBe("candidate");
    expect(selectManifesto({ candidates: [fifteen], lede: "X." }).source).toBe("lede");
  });

  it("bölünmez boşlukla yazılmış marka adını tek kelime sayar", () => {
    // Çeviri dosyalarında marka adı NBSP ile yazılıyor (bkz. split-words.ts):
    // normal boşlukla 15 kelime (sınırın üstü), NBSP ile 14 (sınırın içinde).
    const spaced = "Hibrid 360 one two three four five six seven eight nine ten eleven twelve thirteen.";
    const joined = spaced.replace("Hibrid 360", "Hibrid 360");

    expect(selectManifesto({ candidates: [joined], lede: "X." }).source).toBe("candidate");
    expect(selectManifesto({ candidates: [spaced], lede: "X." }).source).toBe("lede");
  });

  it("yalnız tam maddeleri seçer, paragrafın kuyruk cümlesini değil", () => {
    const result = selectManifesto({
      candidates: [
        "A long opening paragraph that keeps going well past the ceiling so it cannot qualify on its own. Short tail here.",
        "Short whole item.",
      ],
      lede: "X.",
    });

    expect(result.sentences).toEqual(["Short whole item."]);
    expect(result.remainder).toEqual([
      "A long opening paragraph that keeps going well past the ceiling so it cannot qualify on its own. Short tail here.",
    ]);
  });

  it("gövdede kısa cümle yoksa yalnız-slogan havuzundan seçer, gövdeye dokunmaz", () => {
    const result = selectManifesto({
      candidates: PRODUCTION_BODY,
      extras: ["Films, commercials and product content, shot end to end."],
      lede: "PURE. SIMPLE. POWERFUL.",
    });

    expect(result.source).toBe("extra");
    expect(result.sentences).toEqual(["Films, commercials and product content, shot end to end."]);
    expect(result.remainder).toEqual([...PRODUCTION_BODY]);
  });

  it("gövdedeki kısa maddeyi yalnız-slogan havuzuna tercih eder", () => {
    const result = selectManifesto({
      candidates: EVENT_BODY,
      extras: ["Events, conventions, launches and roadshows."],
      lede: "X.",
    });

    expect(result.source).toBe("candidate");
    expect(result.sentences).toEqual(["We make a difference through unforgettable events."]);
  });

  it("yalnız-slogan havuzu asla gövde metnine düşmez", () => {
    const result = selectManifesto({
      candidates: ["Short body line."],
      extras: ["Never rendered as a paragraph."],
      lede: "X.",
    });

    expect(result.remainder).toEqual([]);
  });

  it("girdiyi değiştirmez", () => {
    const candidates = [...EVENT_BODY];
    selectManifesto({ candidates, lede: "X." });

    expect(candidates).toEqual([...EVENT_BODY]);
  });
});
