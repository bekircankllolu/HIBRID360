import type { ServiceFilmSource } from "@/data/service-films";

/**
 * ChapterVideo'nun tarayıcı gerektirmeyen kararları — bileşen yalnızca
 * DOM'u kurar (bkz. culture/meet-the-crew-reveal.ts ile aynı ayrım).
 */

/**
 * Kullanıcının oynatma niyeti. `auto` = kullanıcı henüz karar vermedi,
 * sayfa kuralı geçerli.
 */
export type PlaybackIntent = "auto" | "play" | "pause";

/**
 * Oynatma kuralı (CLAUDE.md + WCAG 2.2.2):
 * - Kullanıcının duraklatması her şeyi ezer.
 * - Hareket azaltmada otomatik oynatma yok; kullanıcı isterse oynar.
 * - Ekran dışındaki film her durumda durur (pil, CPU).
 */
export function playbackState({
  reduced,
  visible,
  intent,
}: {
  reduced: boolean;
  visible: boolean;
  intent: PlaybackIntent;
}): "play" | "pause" {
  if (intent === "pause" || !visible) return "pause";
  if (intent === "play") return "play";
  return reduced ? "pause" : "play";
}

const rank = (source: ServiceFilmSource) =>
  (source.media ? 0 : 2) + (source.type.includes("webm") ? 0 : 1);

/**
 * Tarayıcı, tipi desteklenen VE `media`sı eşleşen İLK `<source>`'u seçer.
 * Bu yüzden: ekran koşullu kaynaklar (mobil 720p) genel olanlardan önce,
 * her grupta AV1/WebM (küçük) MP4 yedeğinden önce.
 */
export function orderedSources(sources: readonly ServiceFilmSource[]): ServiceFilmSource[] {
  return [...sources].sort((a, b) => rank(a) - rank(b));
}
