import type { InsightsPost } from "@/types/content";
import posts from "./insights-posts.json";

/**
 * Müşterinin 5 Eylül 2026 tarihli TR/EN MAG belgelerinden içe aktarılan
 * 19 makale. JSON, scripts/import-think-and-thank-docx.py ile üretilir.
 */
export const insightsPosts = posts satisfies InsightsPost[];
