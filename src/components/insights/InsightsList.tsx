"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
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

  const filteredPosts = useMemo(
    () =>
      activeCategory === "all"
        ? posts
        : posts.filter((post) => post.category === activeCategory),
    [posts, activeCategory],
  );

  if (posts.length === 0) {
    return <p className={styles.emptyState}>{t("comingSoon")}</p>;
  }

  return (
    <div>
      {categories.length > 1 && (
        <div className={styles.filters} role="group" aria-label={t("categoryLabel")}>
          <button
            type="button"
            className={styles.filterButton}
            aria-pressed={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          >
            {t("categoryAll")}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={styles.filterButton}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <p className={styles.emptyState}>{t("comingSoon")}</p>
      ) : (
        <div className={styles.grid}>
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/insights/${post.slug}`} className={styles.card}>
              {post.category && <span className={styles.cardCategory}>{post.category}</span>}
              <span className={styles.cardTitle}>
                {locale === "tr" ? post.title_tr : post.title_en}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
