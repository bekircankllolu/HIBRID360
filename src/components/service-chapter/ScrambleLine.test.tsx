// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ScrambleLine, splitWordSlots } from "./ScrambleLine";

/**
 * ScrambleLine sözleşmesi: (1) görünen her şey `aria-hidden` — erişilebilir
 * adı üst başlığın `aria-label`'ı veriyor; (2) her kelime nihai metniyle
 * yazılmış görünmez bir "hayalet" kopyanın üzerinde duruyor, yani yuvanın
 * genişliği karışma sırasında değişmiyor; (3) karışan dize satırın tamamı
 * için üretilip kelime sınırlarından dilimleniyor (soldan sağa çözülme).
 */

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("splitWordSlots", () => {
  it("keeps every word's index in the original string", () => {
    expect(splitWordSlots("BUILT FOR THE FEED.")).toEqual([
      { word: "BUILT", start: 0 },
      { word: "FOR", start: 6 },
      { word: "THE", start: 10 },
      { word: "FEED.", start: 14 },
    ]);
  });

  it("returns nothing for empty or blank text", () => {
    expect(splitWordSlots("")).toEqual([]);
    expect(splitWordSlots("   ")).toEqual([]);
  });
});

describe("ScrambleLine", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame", "performance"],
    });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  const ghosts = () => [...container.querySelectorAll("span span > span:first-child")].map((n) => n.textContent);
  const live = () => [...container.querySelectorAll("span span > span:last-child")].map((n) => n.textContent);

  it("hides itself from the accessibility tree", () => {
    act(() => root.render(<ScrambleLine text="POST PRODUCTION" active={false} />));
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders plain text (no slots) when nothing is scrambling", () => {
    act(() => root.render(<ScrambleLine text="POST PRODUCTION" active={false} />));
    // Duruk hal düzeltme öncesiyle aynı DOM: tek metin düğümü. Yuvalar
    // atomik kutu olduğu için kelimeler arası kerning'i bozuyor, bu yüzden
    // yalnız animasyon sırasında var olmalılar.
    expect(container.querySelectorAll("span span")).toHaveLength(0);
    expect(container.textContent).toBe("POST PRODUCTION");
  });

  it("returns to plain text after the reveal settles", () => {
    act(() => root.render(<ScrambleLine text="CLOUD TV" active durationMs={200} />));
    act(() => vi.advanceTimersByTime(40));
    expect(container.querySelectorAll("span span").length).toBeGreaterThan(0);
    act(() => vi.advanceTimersByTime(1000));
    expect(container.querySelectorAll("span span")).toHaveLength(0);
    expect(container.textContent).toBe("CLOUD TV");
  });

  it("keeps the ghost (the box) at the final word while the live copy scrambles", () => {
    act(() => root.render(<ScrambleLine text="POST PRODUCTION" active durationMs={400} />));
    act(() => vi.advanceTimersByTime(40));
    expect(ghosts()).toEqual(["POST", "PRODUCTION"]);
    const scrambled = live();
    expect(scrambled[0]).toHaveLength(4);
    expect(scrambled[1]).toHaveLength(10);
    expect(scrambled.join(" ")).not.toBe("POST PRODUCTION");
  });

  it("renders nothing for empty text", () => {
    act(() => root.render(<ScrambleLine text="" active />));
    expect(container.textContent).toBe("");
  });
});
