// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useScrambleReveal } from "./useScrambleReveal";

/**
 * useScrambleReveal sözleşmesi: ilk render her zaman gerçek kelime
 * (hidrasyon güvenli), `active=false` iken hiç değişmez, `active=true`
 * iken gecikmeden sonra başlar ve süre dolunca tam olarak kelimeye döner.
 * Karışık aradaki tam metni değil yalnız açığa çıkan öneki deterministik
 * doğruluyoruz — kapalı kalan kısım `Math.random`'a bağlı.
 */

function Probe({
  word,
  active,
  delayMs,
  durationMs,
  onRender,
}: {
  word: string;
  active: boolean;
  delayMs?: number;
  durationMs?: number;
  onRender: (value: string) => void;
}) {
  const display = useScrambleReveal(word, { active, delayMs, durationMs });
  onRender(display);
  return <span>{display}</span>;
}

describe("useScrambleReveal", () => {
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

  it("renders the real word immediately, before any effect runs", () => {
    const seen: string[] = [];
    act(() => {
      root.render(<Probe word="CREATIVITY" active={false} onRender={(value) => seen.push(value)} />);
    });
    expect(seen[0]).toBe("CREATIVITY");
  });

  it("when inactive, never changes even as time passes", () => {
    const seen: string[] = [];
    act(() => {
      root.render(<Probe word="LIMITS" active={false} onRender={(value) => seen.push(value)} />);
    });
    act(() => vi.advanceTimersByTime(2000));
    expect(seen.every((value) => value === "LIMITS")).toBe(true);
  });

  it("does not start before delayMs elapses", () => {
    const seen: string[] = [];
    act(() => {
      root.render(
        <Probe word="AB" active delayMs={300} durationMs={200} onRender={(value) => seen.push(value)} />,
      );
    });
    act(() => vi.advanceTimersByTime(299));
    expect(seen.every((value) => value === "AB")).toBe(true);
  });

  it("reveals left to right mid-animation and settles back to the exact word", () => {
    const seen: string[] = [];
    act(() => {
      root.render(
        <Probe word="WITHOUT" active durationMs={400} onRender={(value) => seen.push(value)} />,
      );
    });
    act(() => vi.advanceTimersByTime(200)); // yarı yol: floor(0.5*7)=3 karakter kilitli
    const midway = seen[seen.length - 1];
    expect(midway).toHaveLength(7);
    expect(midway.slice(0, 3)).toBe("WIT");

    act(() => vi.advanceTimersByTime(1000)); // süreyi kesin geçer
    expect(seen[seen.length - 1]).toBe("WITHOUT");
  });

  it("changing the word restarts the reveal for the new word", () => {
    const seen: string[] = [];
    act(() => {
      root.render(<Probe word="A" active durationMs={200} onRender={(value) => seen.push(value)} />);
    });
    act(() => vi.advanceTimersByTime(1000));
    expect(seen[seen.length - 1]).toBe("A");

    act(() => {
      root.render(<Probe word="B" active durationMs={200} onRender={(value) => seen.push(value)} />);
    });
    expect(seen[seen.length - 1]).toBe("B"); // yeni kelimenin ilk render'ı hidrasyon-güvenli
    act(() => vi.advanceTimersByTime(1000));
    expect(seen[seen.length - 1]).toBe("B");
  });

  it("cleans up pending timers and frames on unmount without throwing", () => {
    act(() => {
      root.render(<Probe word="X" active onRender={() => {}} />);
    });
    expect(() => act(() => root.unmount())).not.toThrow();
  });
});
