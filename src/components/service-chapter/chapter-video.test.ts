import { describe, expect, it } from "vitest";

import type { ServiceFilmSource } from "@/data/service-films";
import { orderedSources, playbackState } from "./chapter-video";

/**
 * ChapterVideo'nun tarayıcı gerektirmeyen kararları.
 *
 * Oynatma kuralı (CLAUDE.md + WCAG 2.2.2): hareket azaltmada otomatik
 * oynatma yok ama kullanıcı isterse oynar; kullanıcının duraklatması her
 * şeyi ezer; ekran dışındaki film her durumda durur.
 */

describe("playbackState", () => {
  it("otomatik modda yalnız görünürken ve hareket serbestken oynar", () => {
    expect(playbackState({ reduced: false, visible: true, intent: "auto" })).toBe("play");
    expect(playbackState({ reduced: false, visible: false, intent: "auto" })).toBe("pause");
    expect(playbackState({ reduced: true, visible: true, intent: "auto" })).toBe("pause");
  });

  it("kullanıcı oynatırsa hareket azaltmada da oynar, ekran dışında durur", () => {
    expect(playbackState({ reduced: true, visible: true, intent: "play" })).toBe("play");
    expect(playbackState({ reduced: false, visible: false, intent: "play" })).toBe("pause");
  });

  it("kullanıcı duraklatırsa her koşulda durur", () => {
    expect(playbackState({ reduced: false, visible: true, intent: "pause" })).toBe("pause");
  });
});

describe("orderedSources", () => {
  const webm1080: ServiceFilmSource = { src: "/f-1080.webm", type: "video/webm" };
  const mp41080: ServiceFilmSource = { src: "/f-1080.mp4", type: "video/mp4" };
  const webm720: ServiceFilmSource = {
    src: "/f-720.webm",
    type: "video/webm",
    media: "(max-width: 767px)",
  };
  const mp4720: ServiceFilmSource = {
    src: "/f-720.mp4",
    type: "video/mp4",
    media: "(max-width: 767px)",
  };

  it("media koşullu kaynakları öne, her grupta AV1/WebM'i MP4'ün önüne alır", () => {
    expect(orderedSources([mp41080, webm1080, mp4720, webm720])).toEqual([
      webm720,
      mp4720,
      webm1080,
      mp41080,
    ]);
  });

  it("girdiyi değiştirmez", () => {
    const input = [mp41080, webm1080];
    orderedSources(input);
    expect(input).toEqual([mp41080, webm1080]);
  });
});
