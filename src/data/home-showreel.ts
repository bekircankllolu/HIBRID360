export interface HomeShowreelAsset {
  mp4?: string;
  webm?: string;
  poster: string;
  title: Record<"tr" | "en", string>;
  disclosure?: "ai-generated";
}

/**
 * Client showreel delivery point.
 *
 * The approved showreel master has not arrived. Until then, the client-requested
 * representative poster is shown with an explicit AI disclosure. It does not
 * depict a real Hibrid 360 campaign. Once the approved files arrive, add `mp4`
 * and optionally `webm`; the frame and scroll behavior do not change.
 */
export const HOME_SHOWREEL: HomeShowreelAsset | null = {
  poster: "/images/site/home/showreel-representative-1600w.webp",
  title: {
    tr: "Film prodüksiyon setini gösteren temsili AI showreel görseli",
    en: "Representative AI showreel image of a film production set",
  },
  disclosure: "ai-generated",
};
