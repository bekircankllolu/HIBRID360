"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Work } from "@/types/content";
import styles from "./WorkArchive.module.css";

const ALL = "__all__";

/**
 * WORK-05 — Archive bölümü + filtre (Yıl · Müşteri · Format).
 *
 * TODO: brief 7.1 WORK-05 formatı "Film · Photography · Live · AI" olarak
 * tarifliyor; docs/supabase-schema.sql'deki works.format kolonu şu an
 * "video" | "image" | "case_study" değerlerini kullanıyor (bkz.
 * src/types/content.ts). Envanter netleşmeden bu iki taksonomi
 * eşleştirilemez — bu yüzden format filtresi gerçek `category` alanındaki
 * serbest metni listeler, deck'teki dört sabit değeri değil.
 */
export function WorkArchive({
  works,
  confidentialLabel,
}: {
  works: Work[];
  confidentialLabel: string;
}) {
  const t = useTranslations("work");
  const tFilter = useTranslations("work.filter");
  const [year, setYear] = useState(ALL);
  const [client, setClient] = useState(ALL);
  const [format, setFormat] = useState(ALL);

  const years = useMemo(
    () => Array.from(new Set(works.map((w) => w.year))).sort((a, b) => b - a),
    [works],
  );
  const clients = useMemo(
    () =>
      Array.from(
        new Set(
          works
            .filter((w) => !w.client_name_confidential)
            .map((w) => w.client_name),
        ),
      ).sort(),
    [works],
  );
  const formats = useMemo(
    () => Array.from(new Set(works.map((w) => w.category).filter((c): c is string => Boolean(c)))).sort(),
    [works],
  );

  const filtered = works.filter((w) => {
    if (year !== ALL && String(w.year) !== year) return false;
    if (client !== ALL && w.client_name !== client) return false;
    if (format !== ALL && w.category !== format) return false;
    return true;
  });

  const byYear = filtered.reduce<Record<number, Work[]>>((acc, work) => {
    (acc[work.year] ??= []).push(work);
    return acc;
  }, {});
  const filteredYears = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <section className={styles.archive}>
      <h2 className={styles.title}>{t("archiveTitle")}</h2>

      <div className={styles.filters} role="group" aria-label={tFilter("label")}>
        <label className={styles.filterField}>
          <span>{tFilter("year")}</span>
          <select value={year} onChange={(event) => setYear(event.target.value)}>
            <option value={ALL}>{tFilter("all")}</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterField}>
          <span>{tFilter("client")}</span>
          <select value={client} onChange={(event) => setClient(event.target.value)}>
            <option value={ALL}>{tFilter("all")}</option>
            {clients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterField}>
          <span>{tFilter("format")}</span>
          <select value={format} onChange={(event) => setFormat(event.target.value)}>
            <option value={ALL}>{tFilter("all")}</option>
            {formats.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredYears.length === 0 ? (
        <p className={styles.empty}>{t("empty")}</p>
      ) : (
        filteredYears.map((y) => (
          <div key={y}>
            <h3 className={styles.year}>{y}</h3>
            <ul className={styles.list}>
              {byYear[y].map((work) => (
                <li key={work.id}>
                  <Link href={`/work/${work.slug}`}>
                    {work.client_name_confidential
                      ? confidentialLabel
                      : work.client_name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
