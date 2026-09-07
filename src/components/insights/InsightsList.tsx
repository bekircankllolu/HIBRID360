"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/EmptyState";
import type { Locale } from "@/i18n/routing";
import {
  getInsightCategory,
  getInsightSummary,
  getInsightTitle,
} from "@/lib/insights";
import { getInsightVisual } from "@/data/insight-visuals";
import { EditorialImage } from "@/components/insights/EditorialImage";
import type { InsightsPost } from "@/types/content";
import styles from "./InsightsList.module.css";

export function InsightsList({
  posts,
  locale,
}: {
  posts: InsightsPost[];
  locale: Locale;
}) {
  const t = useTranslations("insights");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(posts.map((post) => post.category).filter((c): c is string => Boolean(c))),
      ),
    [posts],
  );

  const categoryLabels = useMemo(
    () =>
      new Map(
        categories.map((category) => {
          const post = posts.find((candidate) => candidate.category === category);
          return [category, post ? getInsightCategory(post, locale) ?? category : category];
        }),
      ),
    [categories, locale, posts],
  );

  const filteredPosts = useMemo(
    () =>
      activeCategory === "all"
        ? posts
        : posts.filter((post) => post.category === activeCategory),
    [posts, activeCategory],
  );

  if (posts.length === 0) {
    return <EmptyState message={t("comingSoon")} />;
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <p className={styles.resultCount}>{t("articleCount", { count: filteredPosts.length })}</p>
        {categories.length > 1 && (
          <label className={styles.categoryControl}>
            <span>{t("categoryLabel")}</span>
            <select
              value={activeCategory}
              onChange={(event) => setActiveCategory(event.target.value)}
            >
              <option value="all">{t("categoryAll")}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels.get(category)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {filteredPosts.length === 0 ? (
        <EmptyState message={t("comingSoon")} />
      ) : (
        <div className={styles.grid}>
          {filteredPosts.map((post, filteredIndex) => {
            const visual = getInsightVisual(post, locale);
            const absoluteIndex = posts.indexOf(post);

            return (
              <Link
                key={post.id}
                href={`/think-and-thank/${post.slug}`}
                className={styles.card}
                data-tone={visual.tone}
                data-featured={filteredIndex === 0 ? "true" : undefined}
              >
                <span className={styles.cardVisual}>
                  <EditorialImage
                    src={visual.src}
                    alt={visual.alt}
                    sizes={
                      filteredIndex === 0
                        ? "(max-width: 760px) 100vw, 60vw"
                        : "(max-width: 760px) 100vw, 50vw"
                    }
                  />
                </span>
                <span className={styles.cardMain}>
                  <span className={styles.cardTopline}>
                    <span className={styles.cardIndex} aria-hidden="true">
                      {String(absoluteIndex + 1).padStart(2, "0")}
                    </span>
                    {post.category && (
                      <span className={styles.cardCategory}>
                        {getInsightCategory(post, locale)}
                      </span>
                    )}
                  </span>
                  <span className={styles.cardTitle}>{getInsightTitle(post, locale)}</span>
                  {getInsightSummary(post, locale) && (
                    <span className={styles.cardSummary}>
                      {getInsightSummary(post, locale)}
                    </span>
                  )}
                  <span className={styles.cardMeta}>
                    {post.read_time_minutes && (
                      <span>{t("readTime", { minutes: post.read_time_minutes })}</span>
                    )}
                    <span className={styles.cardArrow} aria-hidden="true">↗</span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
