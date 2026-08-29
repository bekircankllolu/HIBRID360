export interface HomeShowreelAsset {
  mp4: string;
  webm?: string;
  poster?: string;
  title: Record<"tr" | "en", string>;
}

/**
 * Client showreel delivery point.
 *
 * Keep this null until the approved master and poster arrive. Supplying an
 * unrelated repository video would misrepresent the agency's work. Once the
 * files are copied to public/videos, only this object needs to change; the
 * hero already contains the small-frame to full-viewport scroll behavior.
 */
export const HOME_SHOWREEL: HomeShowreelAsset | null = null;
