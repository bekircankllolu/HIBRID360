"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Work } from "@/types/content";
import styles from "./WorkArchive.module.css";

const ALL = "__all__";

type FilterKey = "service" | "industry";

function optionsOf(works: Work[], pick: (work: Work) => string | null) {
  return Array.from(
    new Set(works.map(pick).filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b));
}

function workTitle(work: Work, locale: "tr" | "en", fallback: string) {
  const localized = locale === "tr" ? work.title_tr : work.title_en;
  return (
    localized ??
    work.title_en ??
    work.title_tr ??
    work.content_format ??
    work.service ??
    fallback
  );
}

export function WorkArchive({
  works,
  locale,
  confidentialLabel,
}: {
  works: Work[];
  locale: "tr" | "en";
  confidentialLabel: string;
}) {
  const t = useTranslations("work");
  const tFilter = useTranslations("work.filter");
  const [year, setYear] = useState(ALL);
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    service: ALL,
    industry: ALL,
  });

  const years = useMemo(
    () => Array.from(new Set(works.map((work) => work.year))).sort((a, b) => b - a),
    [works],
  );
  const services = useMemo(() => optionsOf(works, (work) => work.service), [works]);
  const industries = useMemo(
    () => optionsOf(works, (work) => work.industry),
    [works],
  );

  const filtered = useMemo(
    () =>
      works.filter((work) => {
        if (year !== ALL && String(work.year) !== year) return false;
        if (filters.service !== ALL && work.service !== filters.service) return false;
        if (filters.industry !== ALL && work.industry !== filters.industry) return false;
        return true;
      }),
    [filters, works, year],
  );

  const updateFilter = (key: FilterKey, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className={styles.archive} aria-label={t("recentTitle")}>
      <div className={styles.toolbar} role="group" aria-label={tFilter("label")}>
        <label className={styles.filterField}>
          <span>{tFilter("year")}</span>
          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
            disabled={years.length === 0}
          >
            <option value={ALL}>{tFilter("all")}</option>
            {years.map((option) => (
              <option key={option} value={String(option)}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filterField}>
          <span>{tFilter("service")}</span>
          <select
            value={filters.service}
            onChange={(event) => updateFilter("service", event.target.value)}
            disabled={services.length === 0}
          >
            <option value={ALL}>{tFilter("all")}</option>
            {services.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filterField}>
          <span>{tFilter("industry")}</span>
          <select
            value={filters.industry}
            onChange={(event) => updateFilter("industry", event.target.value)}
            disabled={industries.length === 0}
          >
            <option value={ALL}>{tFilter("all")}</option>
            {industries.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty} data-testid="work-empty-state">
          <p className={styles.emptyTitle}>{t("empty")}</p>
          <p className={styles.emptyDetail}>{t("emptyDetail")}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((work) => {
            const client = work.client_name ?? confidentialLabel;
            const title = workTitle(work, locale, t("projectFallback"));

            return (
              <Link key={work.id} href={`/work/${work.slug}`} className={styles.project}>
                <div className={styles.media}>
                  {work.cover_image_url ? (
                    <Image
                      src={work.cover_image_url}
                      alt={`${client} - ${title}`}
                      fill
                      sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className={styles.image}
                      unoptimized
                    />
                  ) : (
                    <span className={styles.placeholder} aria-hidden="true">
                      {client.slice(0, 2)}
                    </span>
                  )}
                </div>
                <span className={styles.meta}>
                  {client}
                  <span>{work.year}</span>
                </span>
                <span className={styles.projectTitle}>{title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
