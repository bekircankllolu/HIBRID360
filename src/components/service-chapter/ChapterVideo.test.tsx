// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { NextIntlClientProvider } from "next-intl";
import trMessages from "@/messages/tr.json";
import type { PosterServiceFilm, VideoServiceFilm } from "@/data/service-films";
import { ChapterVideo } from "./ChapterVideo";

/**
 * ChapterVideo'nun erişilebilirlik ve performans sözleşmesi:
 * `preload="none"`, `autoPlay` yok, görünür duraklat/oynat butonu,
 * hareket azaltmada otomatik oynatma yok ama kullanıcı isterse oynar.
 */

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const FILM: VideoServiceFilm = {
  kind: "video",
  sources: [
    { src: "/videos/f-1080.mp4", type: "video/mp4" },
    { src: "/videos/f-1080.webm", type: "video/webm" },
  ],
  poster: { src: "/videos/f-poster.webp", width: 1920, height: 1080 },
  alt: { tr: "Test filmi", en: "Test film" },
  uploadDate: "2026-09-13",
};

const POSTER: PosterServiceFilm = {
  kind: "poster",
  poster: FILM.poster,
  alt: FILM.alt,
};

/** Test içinden görünürlük vermek için IO çağırımlarını yakalar. */
let observers: Array<(entries: Array<{ intersectionRatio: number; isIntersecting: boolean }>) => void> = [];

function reveal(ratio: number) {
  act(() => {
    for (const callback of observers) {
      callback([{ intersectionRatio: ratio, isIntersecting: ratio > 0 }]);
    }
  });
}

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

describe("ChapterVideo", () => {
  let container: HTMLDivElement;
  let root: Root;
  let play: ReturnType<typeof vi.fn>;
  let pause: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observers = [];
    class ControlledObserver {
      constructor(callback: (typeof observers)[number]) {
        observers.push(callback);
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

    // jsdom medya oynatmayı uygulamıyor; gerçek tarayıcı gibi olay yayalım
    // ki bileşenin `onPlay`/`onPause` durumu da test edilsin.
    play = vi.fn(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    });
    pause = vi.fn(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("pause"));
    });
    HTMLMediaElement.prototype.play = play as unknown as HTMLMediaElement["play"];
    HTMLMediaElement.prototype.pause = pause as unknown as HTMLMediaElement["pause"];

    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  function mount(film: VideoServiceFilm | PosterServiceFilm) {
    act(() => {
      root.render(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <ChapterVideo film={film} />
        </NextIntlClientProvider>,
      );
    });
  }

  it("performans sözleşmesi: preload none, autoplay yok, sessiz döngü, WebM önce", () => {
    mockReducedMotion(false);
    mount(FILM);
    const video = container.querySelector("video")!;

    expect(video.getAttribute("preload")).toBe("none");
    expect(video.hasAttribute("autoplay")).toBe(false);
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.getAttribute("aria-label")).toBe("Test filmi");
    const sources = [...video.querySelectorAll("source")].map((source) => source.getAttribute("type"));
    expect(sources).toEqual(["video/webm", "video/mp4"]);
  });

  it("görünür olunca oynar; buton duraklatır ve etiketini değiştirir", () => {
    mockReducedMotion(false);
    mount(FILM);
    const video = container.querySelector("video")!;
    const button = container.querySelector("button")!;

    expect(play).not.toHaveBeenCalled();
    reveal(0.5);
    expect(play).toHaveBeenCalled();
    expect(video.dataset.playback).toBe("playing");
    expect(button.getAttribute("aria-label")).toBe("Filmi duraklat");

    act(() => button.click());
    expect(pause).toHaveBeenCalled();
    expect(video.dataset.playback).toBe("paused");
    expect(button.getAttribute("aria-label")).toBe("Filmi oynat");
  });

  it("hareket azaltmada kendiliğinden oynamaz, kullanıcı isterse oynar", () => {
    mockReducedMotion(true);
    mount(FILM);
    const button = container.querySelector("button")!;

    reveal(1);
    expect(play).not.toHaveBeenCalled();
    expect(button.getAttribute("aria-label")).toBe("Filmi oynat");

    act(() => button.click());
    expect(play).toHaveBeenCalled();
  });

  it("oynatma reddedilirse buton ölü kalmaz, sonraki tıklama yeniden dener", async () => {
    mockReducedMotion(true);
    // Güç tasarrufu modu gibi: ilk deneme reddedilir, ikincisi başarır.
    play.mockImplementationOnce(() => Promise.reject(new Error("NotAllowedError")));
    mount(FILM);
    const button = container.querySelector("button")!;
    reveal(1);

    await act(async () => button.click());
    expect(play).toHaveBeenCalledTimes(1);
    expect(button.getAttribute("aria-label")).toBe("Filmi oynat");

    await act(async () => button.click());
    expect(play).toHaveBeenCalledTimes(2);
    expect(button.getAttribute("aria-label")).toBe("Filmi duraklat");
  });

  it("eagerPoster ile poster SSR'da basılır, varsayılanda tembel", () => {
    mockReducedMotion(false);
    act(() => {
      root.render(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <ChapterVideo film={FILM} eagerPoster />
        </NextIntlClientProvider>,
      );
    });
    expect(container.querySelector("video")?.getAttribute("poster")).toBe(FILM.poster.src);

    act(() => {
      root.render(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <ChapterVideo key="lazy" film={FILM} />
        </NextIntlClientProvider>,
      );
    });
    expect(container.querySelector("video")?.hasAttribute("poster")).toBe(false);
  });

  it("poster modunda görsel gösterir, kontrol basmaz", () => {
    mockReducedMotion(false);
    mount(POSTER);
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("Test filmi");
  });
});
