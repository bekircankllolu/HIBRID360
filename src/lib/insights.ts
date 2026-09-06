import type { Locale } from "@/i18n/routing";
import type { InsightsPost } from "@/types/content";

export function getInsightTitle(post: InsightsPost, locale: Locale) {
  return locale === "tr" ? post.title_tr : post.title_en;
}

export function getInsightSummary(post: InsightsPost, locale: Locale) {
  return locale === "tr" ? post.summary_tr : post.summary_en;
}

export function getInsightCategory(post: InsightsPost, locale: Locale) {
  const localized = locale === "tr" ? post.category_tr : post.category_en;
  return localized ?? post.category;
}

export function getInsightAuthor(post: InsightsPost, locale: Locale) {
  const localized = locale === "tr" ? post.author_name_tr : post.author_name_en;
  return localized ?? post.author_name;
}

export function getInsightParagraphs(post: InsightsPost, locale: Locale) {
  const body = locale === "tr" ? post.body_tr : post.body_en;
  return body?.split(/\r?\n\s*\r?\n/).map((paragraph) => paragraph.trim()).filter(Boolean) ?? [];
}
