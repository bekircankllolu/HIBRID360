// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useScrollScene, type SceneMode } from "./useScrollScene";

/**
 * useScrollScene sözleşmesi: JS yalnızca `--progress` yazar; hareket
 * azaltmada ölçüm yapılmaz ve sahne final durumda (1) kalır.
 */

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let intersect: ((entries: Array<{ isIntersecting: boolean }>) => void) | null = null;

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function Probe({ mode, onProgress }: { mode: SceneMode; onProgress?: (p: number) => void }) {
  const { ref, motion } = useScrollScene<HTMLDivElement>({ mode, onProgress });
  return <div ref={ref} data-motion={motion} />;
}

describe("useScrollScene", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    intersect = null;
    class ControlledObserver {
      constructor(callback: NonNullable<typeof intersect>) {
        intersect = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = "";
      thresholds = [];
    }
    vi.stubGlobal("IntersectionObserver", ControlledObserver);
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(1000);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: -500,
      height: 2000,
    } as DOMRect);

    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function mount(mode: SceneMode, onProgress?: (p: number) => void) {
    act(() => root.render(<Probe mode={mode} onProgress={onProgress} />));
    return container.firstElementChild as HTMLElement;
  }

  it("hareket azaltmada ölçmez, final durumu yazar", () => {
    mockReducedMotion(true);
    const onProgress = vi.fn();
    const element = mount("sticky", onProgress);

    expect(element.dataset.motion).toBe("static");
    expect(element.style.getPropertyValue("--progress")).toBe("1");
    expect(onProgress).toHaveBeenCalledWith(1);

    // `usePrefersReducedMotion` ilk render'da false döndüğü için bir IO
    // kısa süreliğine kurulmuş olabilir; görünürlük gelse bile ölçüm
    // yapılmamalı — sahne final durumda kalır.
    act(() => intersect?.([{ isIntersecting: true }]));
    expect(element.style.getPropertyValue("--progress")).toBe("1");
    expect(onProgress).not.toHaveBeenCalledWith(0.5);
  });

  it("görünür olana kadar ölçmez, görünür olunca sticky ilerlemeyi yazar", () => {
    mockReducedMotion(false);
    const onProgress = vi.fn();
    const element = mount("sticky", onProgress);

    expect(element.dataset.motion).toBe("scroll");
    expect(element.style.getPropertyValue("--progress")).toBe("");

    act(() => intersect?.([{ isIntersecting: true }]));
    // top -500, yükseklik 2000, ekran 1000 → yolun yarısı.
    expect(element.style.getPropertyValue("--progress")).toBe("0.5000");
    expect(onProgress).toHaveBeenLastCalledWith(0.5);
  });

  it("enabled false iken hiç dinlemez", () => {
    mockReducedMotion(false);
    function Disabled() {
      const { ref } = useScrollScene<HTMLDivElement>({ mode: "pass", enabled: false });
      return <div ref={ref} />;
    }
    act(() => root.render(<Disabled />));
    const element = container.firstElementChild as HTMLElement;

    expect(intersect).toBeNull();
    expect(element.style.getPropertyValue("--progress")).toBe("");
  });

  it("pass modunda öğenin ekrandan geçişini ölçer", () => {
    mockReducedMotion(false);
    const element = mount("pass");

    act(() => intersect?.([{ isIntersecting: true }]));
    // (1000 - (-500)) / (2000 + 1000) = 0.5
    expect(element.style.getPropertyValue("--progress")).toBe("0.5000");
  });
});
