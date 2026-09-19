export const serviceSignatureVideos = {
  production: "/videos/service-signatures/production.mp4",
  postProduction: "/videos/service-signatures/post-production.mp4",
  liveBroadcast: "/videos/service-signatures/live-broadcast.mp4",
  eventManagement: "/videos/service-signatures/event-management.mp4",
  digital: "/videos/service-signatures/digital.mp4",
  cloudTv: "/videos/service-signatures/cloud-tv.mp4",
} as const;

/**
 * Filmin son karesi (tamamlanmış çizim) — sahne başında soluk iz olarak
 * gösterilir; filmlerin ilk karesi düz siyah olduğundan sahne boş açılıyordu.
 * Kareler videodan çıkarılır:
 *   ffmpeg -sseof -0.08 -i <film>.mp4 -update 1 -frames:v 1 -vf scale=1600:-1 \
 *     -c:v libwebp -quality 72 public/images/site/service-signatures/<film>-end.webp
 * Film değişirse kare de yeniden çıkarılmalı.
 */
export function serviceSignatureEndFrame(videoSrc: string): string {
  return videoSrc
    .replace("/videos/service-signatures/", "/images/site/service-signatures/")
    .replace(/\.mp4$/, "-end.webp");
}
