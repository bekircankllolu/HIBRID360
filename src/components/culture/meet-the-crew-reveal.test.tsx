// @vitest-environment jsdom
import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import trMessages from "@/messages/tr.json";
import { CULTURE_FILM, type PosterOnlyCultureFilm, type VideoCultureFilm } from "@/data/who-we-are";
import { MeetTheCrewReveal } from "./MeetTheCrewReveal";
import styles from "./MeetTheCrewReveal.module.css";
import {
  CTA_REVEAL_THRESHOLD,
  captionTracks,
  isCtaRevealed,
  isPlayableFilm,
  passiveCtaLabel,
  revealProgress,
} from "./meet-the-crew-reveal";

/**
 * CUL-06 "Meet the crew" reveal'ı.
 *
 * Bölüm production'da SESSİZ DÖNGÜ modunda yayında (18 Eylül 2026): konuşan
 * gerçek film hâlâ teslim edilmedi, daire MONA'nın performans çekimiyle
 * açılıyor. Bu testler üç şeyi bekçilik ediyor: (1) sessiz döngü altyazı/ses
 * numarası yapmıyor ve temsili olduğunu yazıyor, (2) film gelip sabit
 * `kind: "video"` ile doldurulduğunda erişilebilirlik sözleşmesi (TR+EN
 * altyazı, sessiz başlama, hareket azaltma) bugünden garanti, (3) arka
 * plandaki wordmark geri gelmiyor (kullanıcı kaldırılmasını istedi).
 */

// React'in act() ortam bayrağı; olmadan her istemci render'ı
// "testing environment is not configured to support act(...)" basar.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * `next-intl/server` istek bağlamı ister; sayfayı test içinde
 * çalıştırabilmek için gerçek TR sözlüğünü okuyan bir çevirici veriyoruz —
 * yani iddialar uydurma değil, siteye giren metnin kendisi üzerinden.
 */
vi.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace?: string }) =>
    serverTranslator(typeof arg === "string" ? arg : (arg.namespace ?? "")),
}));

function messageAt(path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (node, key) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[key]
          : undefined,
      trMessages,
    );
}

function serverTranslator(namespace: string) {
  const translate = (key: string) => {
    const value = messageAt(`${namespace}.${key}`);
    if (typeof value !== "string") {
      throw new Error(`Sözlükte yok: ${namespace}.${key}`);
    }
    return value;
  };
  return Object.assign(translate, {
    raw: (key: string) => messageAt(`${namespace}.${key}`),
  });
}

const LABEL = "Ekiple tanışın →";

const POSTER_ONLY: PosterOnlyCultureFilm = {
  kind: "poster",
  poster: { src: "/test/crew-poster.webp", width: 1600, height: 900 },
  alt: { tr: "Ekip poster karesi", en: "Crew poster frame" },
};

const FILM: VideoCultureFilm = {
  kind: "video",
  sources: [
    { src: "/test/crew.webm", type: "video/webm; codecs=av01" },
    { src: "/test/crew.mp4", type: "video/mp4" },
  ],
  poster: { src: "/test/crew-poster.webp", width: 1600, height: 900 },
  alt: { tr: "Ekip filmi", en: "Crew film" },
  captions: {
    tr: { src: "/test/crew.tr.vtt", label: "Türkçe" },
    en: { src: "/test/crew.en.vtt", label: "English" },
  },
};

/** Gerçek sağlayıcı — `useLocale`/`useTranslations` mock'lanmıyor. */
function WithIntl({ locale, children }: { locale: "tr" | "en"; children: ReactNode }) {
  return (
    <NextIntlClientProvider locale={locale} messages={trMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

/** Sunucu render'ı — yapısal iddialar için; effect'ler çalışmaz. */
function renderStatic(
  film: PosterOnlyCultureFilm | VideoCultureFilm,
  locale: "tr" | "en" = "tr",
): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(
    <WithIntl locale={locale}>
      <MeetTheCrewReveal film={film} label={LABEL} />
    </WithIntl>,
  );
  return host;
}

describe("revealProgress", () => {
  const HEIGHT = 2200;
  const VIEWPORT = 800;

  it("maps the sticky travel to 0→1", () => {
    expect(revealProgress(0, HEIGHT, VIEWPORT)).toBe(0);
    expect(revealProgress(-700, HEIGHT, VIEWPORT)).toBe(0.5);
    expect(revealProgress(-1400, HEIGHT, VIEWPORT)).toBe(1);
  });

  it("clamps below the section and past the end", () => {
    // Bölüm henüz ekranın altında (top pozitif) → hiç açılmamış.
    expect(revealProgress(900, HEIGHT, VIEWPORT)).toBe(0);
    // Bölüm yukarı çıkmış → sonuna kilitli, 1'i aşmaz.
    expect(revealProgress(-99999, HEIGHT, VIEWPORT)).toBe(1);
    for (const top of [500, 0, -350, -700, -1400, -5000]) {
      const progress = revealProgress(top, HEIGHT, VIEWPORT);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    }
  });

  it("returns a fully open scene when there is no travel", () => {
    // Hareket azaltmada sarmalayıcı `height: auto` — pay yok, sahne açık.
    expect(revealProgress(0, 400, 800)).toBe(1);
    expect(revealProgress(0, 800, 800)).toBe(1);
  });

  it("never leaks NaN or Infinity into the CSS custom property", () => {
    for (const progress of [
      revealProgress(Number.NaN, HEIGHT, VIEWPORT),
      revealProgress(0, Number.NaN, VIEWPORT),
      revealProgress(0, HEIGHT, Number.NaN),
      revealProgress(-1, Number.POSITIVE_INFINITY, VIEWPORT),
    ]) {
      expect(Number.isFinite(progress)).toBe(true);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    }
  });

  it("reveals the CTA only once the mask has covered the corners on common aspect ratios", () => {
    expect(CTA_REVEAL_THRESHOLD).toBe(0.9);
    expect(isCtaRevealed(0)).toBe(false);
    expect(isCtaRevealed(0.75)).toBe(false);
    expect(isCtaRevealed(0.89)).toBe(false);
    expect(isCtaRevealed(0.9)).toBe(true);
    expect(isCtaRevealed(1)).toBe(true);
  });
});

describe("culture film data contract", () => {
  it("narrows poster-only and playable films by their discriminant", () => {
    expect(isPlayableFilm(FILM)).toBe(true);
    expect(isPlayableFilm(POSTER_ONLY)).toBe(false);
  });

  /*
   * 18 Eylül 2026'ya kadar bu test `CULTURE_FILM`'in null kalmasını
   * bekçilik ediyordu: film teslim edilmemişti ve sahte medya yayına
   * girmesin isteniyordu. Kullanıcı geri bildirdi — dairesel reveal
   * (monks kalıbı) yazılmıştı ama null yüzünden sayfada hiç görünmüyordu.
   * Karar değişti: bölüm GERÇEK bir arşiv fotoğrafıyla poster modunda
   * açılıyor. Dürüstlük kuralı aynen duruyor ve testin yeni işi bu:
   * poster modunda oynatılabilir film numarası yapılmamalı.
   */
  it("runs the reveal on a real asset, without faking a playable film", () => {
    expect(CULTURE_FILM).not.toBeNull();
    const film = CULTURE_FILM!;
    // 18 Eylül 2026: sessiz karakter döngüsü (MONA'nın performans çekimi).
    // Konuşan gerçek film gelince kind "video" olacak ve altyazı zorunlu
    // hale gelecek — sözleşme orada değişmiyor.
    expect(film.kind).toBe("loop");
    // Sesli film numarası yok: CTA pasif etikete düşüyor, altyazı istenmiyor.
    expect(isPlayableFilm(film)).toBe(false);
    expect("captions" in film).toBe(false);
    // Poster gerçek bir dosya — yol uydurulmuş olamaz.
    expect(existsSync(join(process.cwd(), "public", film.poster.src))).toBe(true);
    // CLS için ölçüler zorunlu ve gerçek dosyayla tutarlı olmalı.
    expect(film.poster.width).toBeGreaterThan(0);
    expect(film.poster.height).toBeGreaterThan(0);
    expect(film.alt.tr.length).toBeGreaterThan(10);
    expect(film.alt.en.length).toBeGreaterThan(10);
  });

  it("emits both mandated caption tracks, defaulting to the active locale", () => {
    expect(captionTracks(FILM, "tr")).toEqual([
      { src: "/test/crew.tr.vtt", label: "Türkçe", srcLang: "tr", isDefault: true },
      { src: "/test/crew.en.vtt", label: "English", srcLang: "en", isDefault: false },
    ]);
    expect(captionTracks(FILM, "en").map((track) => track.isDefault)).toEqual([
      false,
      true,
    ]);
  });

  it("drops the promise-of-action arrow from the passive poster label", () => {
    expect(passiveCtaLabel("Ekiple tanışın →")).toBe("Ekiple tanışın");
    expect(passiveCtaLabel("Meet the crew →")).toBe("Meet the crew");
    // Ok yoksa metne dokunulmaz.
    expect(passiveCtaLabel("Meet the crew")).toBe("Meet the crew");
  });
});

describe("MeetTheCrewReveal markup", () => {
  it("renders an image and no video in poster-only mode", () => {
    const host = renderStatic(POSTER_ONLY);

    const image = host.querySelector("img");
    expect(image).not.toBeNull();
    expect(image?.getAttribute("src")).toBe("/test/crew-poster.webp");
    expect(image?.getAttribute("alt")).toBe("Ekip poster karesi");
    expect(host.querySelector("video")).toBeNull();
    expect(host.querySelector("track")).toBeNull();
    expect(host.firstElementChild?.getAttribute("data-film")).toBe("poster");
  });

  it("renders a muted, lazily loaded video with both caption tracks", () => {
    const host = renderStatic(FILM);

    const video = host.querySelector("video");
    expect(video).not.toBeNull();
    expect(host.querySelector("img")).toBeNull();
    // CLAUDE.md: otomatik ses YASAK + preload="none" + poster kare.
    expect(video?.hasAttribute("muted")).toBe(true);
    expect(video?.hasAttribute("autoplay")).toBe(false);
    expect(video?.getAttribute("preload")).toBe("none");
    expect(video?.getAttribute("poster")).toBe("/test/crew-poster.webp");
    // Kontroller ancak kullanıcı oynatmayı başlatınca basılır — küçük
    // daire evresinde maskenin dışında kalan bir kontrol çubuğu olmasın.
    expect(video?.hasAttribute("controls")).toBe(false);

    expect(
      [...host.querySelectorAll("source")].map((source) => source.getAttribute("src")),
    ).toEqual(["/test/crew.webm", "/test/crew.mp4"]);

    const tracks = [...host.querySelectorAll("track")];
    expect(tracks.map((track) => track.getAttribute("srclang"))).toEqual(["tr", "en"]);
    expect(tracks.map((track) => track.getAttribute("src"))).toEqual([
      "/test/crew.tr.vtt",
      "/test/crew.en.vtt",
    ]);
    expect(tracks.every((track) => track.getAttribute("kind") === "captions")).toBe(true);
  });

  it("marks the active locale's track as default", () => {
    const tr = [...renderStatic(FILM, "tr").querySelectorAll("track")];
    expect(tr.map((track) => track.hasAttribute("default"))).toEqual([true, false]);

    const en = [...renderStatic(FILM, "en").querySelectorAll("track")];
    expect(en.map((track) => track.hasAttribute("default"))).toEqual([false, true]);
    // Aynı sahne İngilizce'de İngilizce alt metni kullanır.
    expect(en[0]?.ownerDocument).toBeDefined();
    expect(
      renderStatic(FILM, "en").querySelector("video")?.getAttribute("aria-label"),
    ).toBe("Crew film");
  });

  /* 18 Eylül 2026, kullanıcı: "içi tamamen boş olsun, burada hibrit
     yazmasına gerek yok" — arka plandaki wordmark kaldırıldı. Test artık
     geri gelmediğini bekçilik ediyor. */
  it("leaves the stage empty behind the circle — no background wordmark", () => {
    const host = renderStatic(FILM);
    expect(host.textContent).not.toContain("Hibrid 360");
    expect(host.querySelector("[data-text]")).toBeNull();
  });

  it("wires the CTA button to the video it controls", () => {
    const host = renderStatic(FILM);

    const button = host.querySelector("button");
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe(LABEL);
    expect(button?.getAttribute("type")).toBe("button");
    expect(button?.getAttribute("aria-controls")).toBe(
      host.querySelector("video")?.getAttribute("id"),
    );
  });

  it("degrades the CTA to a passive caption in poster-only mode", () => {
    const host = renderStatic(POSTER_ONLY);

    expect(host.querySelector("button")).toBeNull();
    const caption = host.querySelector("figcaption");
    expect(caption).not.toBeNull();
    // Ok işareti yok: tıklanacak bir eylem de yok.
    expect(caption?.textContent).toBe("Ekiple tanışın");
    expect(caption?.className).toContain(styles.ctaPassive);
  });
});

describe("MeetTheCrewReveal behaviour", () => {
  let container: HTMLDivElement;
  let root: Root;
  let play: ReturnType<typeof vi.fn>;

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

  beforeEach(() => {
    // jsdom ne IntersectionObserver ne de medya oynatma uygular.
    class NoopObserver {
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
    vi.stubGlobal("IntersectionObserver", NoopObserver);
    play = vi.fn(() => Promise.resolve());
    HTMLMediaElement.prototype.play = play as unknown as HTMLMediaElement["play"];

    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  function mount(film: PosterOnlyCultureFilm | VideoCultureFilm) {
    act(() => {
      root.render(
        <WithIntl locale="tr">
          <MeetTheCrewReveal film={film} label={LABEL} />
        </WithIntl>,
      );
    });
    return container.firstElementChild as HTMLElement;
  }

  it("switches to the static scene when motion is reduced", () => {
    mockReducedMotion(true);
    const wrapper = mount(FILM);

    expect(wrapper.dataset.reveal).toBe("static");
    expect(wrapper.className).toContain(styles.wrapperStatic);
    // Sahne baştan tamamen açık: açıklık 1, yani daire final ölçeğinde ve
    // CTA odaklanılabilir.
    const stage = wrapper.querySelector<HTMLElement>(`.${styles.stage}`);
    expect(stage?.style.getPropertyValue("--open")).toBe("1");
    expect(wrapper.querySelector("button")?.className).toContain(styles.ctaRevealed);
  });

  it("keeps the scroll-driven scene when motion is allowed", () => {
    mockReducedMotion(false);
    const wrapper = mount(FILM);

    expect(wrapper.dataset.reveal).toBe("scroll");
    expect(wrapper.className).not.toContain(styles.wrapperStatic);
    // CTA daire viewport'u kapatana kadar `visibility: hidden` sınıfını
    // almaz, yani tab sırasına da girmez.
    expect(wrapper.querySelector("button")?.className).not.toContain(styles.ctaRevealed);
  });

  it("starts playback muted from the CTA and hands over to native controls", () => {
    mockReducedMotion(false);
    const wrapper = mount(FILM);
    const video = wrapper.querySelector("video") as HTMLVideoElement;
    const button = wrapper.querySelector("button") as HTMLButtonElement;

    expect(video.hasAttribute("controls")).toBe(false);

    // jsdom `<video controls>`'ü odaklanabilir saymıyor (tarayıcılar
    // sayıyor), bu yüzden odak devrini `activeElement` yerine niyet
    // üzerinden doğruluyoruz.
    const focus = vi.spyOn(video, "focus");

    act(() => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    // CLAUDE.md: otomatik ses YASAK — istisnasız, MONA dahil.
    expect(play).toHaveBeenCalledTimes(1);
    expect(video.muted).toBe(true);
    // Görevi biten branded CTA saklanır, erişilebilir kontroller devralır.
    expect(video.hasAttribute("controls")).toBe(true);
    expect(button.className).toContain(styles.ctaStarted);
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it("offers nothing to press in poster-only mode", () => {
    mockReducedMotion(false);
    const wrapper = mount(POSTER_ONLY);

    expect(wrapper.querySelector("button")).toBeNull();
    expect(wrapper.querySelector("video")).toBeNull();
    expect(wrapper.querySelector("img")).not.toBeNull();
    expect(play).not.toHaveBeenCalled();
  });
});

describe("Who We Are CUL-06 section gate", () => {
  it("renders the circular reveal in silent-loop mode — video, no captions, no playable CTA", async () => {
    const { default: WhoWeArePage } = await import("@/app/[locale]/who-we-are/page");

    const page = await WhoWeArePage({
      params: Promise.resolve({ locale: "tr" as const }),
    });

    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<WithIntl locale="tr">{page}</WithIntl>);

    // Reveal sayfada: bölüm artık boş durum değil.
    const reveal = host.querySelector("[data-reveal]");
    expect(reveal).not.toBeNull();
    expect(reveal?.getAttribute("data-film")).toBe("loop");
    // Sessiz döngü: video var ama sesi ve altyazısı yok, bekleme metni yok.
    const video = host.querySelector("video");
    expect(video).not.toBeNull();
    expect(video?.hasAttribute("muted")).toBe(true);
    expect(video?.hasAttribute("autoplay")).toBe(false);
    expect(video?.getAttribute("preload")).toBe("none");
    expect(host.querySelector("track")).toBeNull();
    expect(host.textContent).not.toContain(trMessages.culture.whoWeAre.filmNote);
    // CTA oktan arınmış pasif etikete düşer — başlatılacak sesli film yok.
    expect(host.textContent).toContain(passiveCtaLabel(trMessages.culture.whoWeAre.filmCta));
    // "AI ile üretilmiş temsili görseldir" etiketi görünür olmalı.
    expect(host.textContent).toContain(trMessages.video.aiGenerated);
    // Tek buton WCAG 2.2.2 duraklat/oynat — sesli film başlatan CTA değil.
    const buttons = [...host.querySelectorAll("button")];
    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent).toBe(trMessages.video.pause);
  });
});
