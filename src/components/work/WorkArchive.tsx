"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Work } from "@/types/content";
import styles from "./WorkArchive.module.css";

const ALL = "__all__";

/**
 * WORK-05 — Archive bölümü + filtreler.
 *
 * 29 Ağustos 2026 revizyonu (INNOCEAN referansı): süzgeç ekseni
 * Yıl · Hizmet · Sektör · Format. Hizmet/sektör/format artık `works`
 * tablosunun kendi nullable facet kolonlarından geliyor
 * (`service` · `industry` · `content_format`).
 *
 * Bundan önce "Format" süzgeci `category` serbest metnini listeliyordu —
 * belgelenmiş bir geçici çözümdü ve iki farklı şeyi aynı ada bağlıyordu.
 * `works.format` da bu süzgeç değil: o, varlık türü (video/image/
 * case_study). `category` verisi başka bir anlama **dönüştürülmedi**,
 * yalnızca süzgeçten ayrıldı.
 *
 * İŞ ENVANTERİ BLOCKER'I (docs/DECISIONS.md #16): seçenekler yalnızca
 * gerçek veriden türer ve **boş eksen hiç render edilmez**. Envanter
 * gelmeden sahte filtre seçeneği üretilmez; hiç iş yokken tüm süzgeç
 * bloğu gizlenir ve profesyonel "içerik hazırlanıyor" durumu kalır.
 */

type FacetKey = "service" | "industry" | "contentFormat";

const FACETS: Array<{ key: FacetKey; of: (work: Work) => string | null }> = [
  { key: "service", of: (work) => work.service },
  { key: "industry", of: (work) => work.industry },
  { key: "contentFormat", of: (work) => work.content_format },
];

function optionsOf(works: Work[], pick: (work: Work) => string | null) {
  return Array.from(
    new Set(works.map(pick).filter((value): value is string => Boolean(value))),
  ).sort();
}

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
  const [facets, setFacets] = useState<Record<FacetKey, string>>({
    service: ALL,
    industry: ALL,
    contentFormat: ALL,
  });

  const years = useMemo(
    () => Array.from(new Set(works.map((w) => w.year))).sort((a, b) => b - a),
    [works],
  );
  const clients = useMemo(
    () =>
      // Gizli işlerde client_name null gelir (works_public view) — süzgeç
      // listesinde marka adı görünmemeli.
      optionsOf(works, (work) => work.client_name),
    [works],
  );
  const facetOptions = useMemo(
    () =>
      FACETS.map((facet) => ({
        key: facet.key,
        of: facet.of,
        options: optionsOf(works, facet.of),
      })),
    [works],
  );

  const filtered = works.filter((work) => {
    if (year !== ALL && String(work.year) !== year) return false;
    if (client !== ALL && work.client_name !== client) return false;
    for (const facet of FACETS) {
      const selected = facets[facet.key];
      if (selected !== ALL && facet.of(work) !== selected) return false;
    }
    return true;
  });

  const byYear = filtered.reduce<Record<number, Work[]>>((acc, work) => {
    (acc[work.year] ??= []).push(work);
    return acc;
  }, {});
  const filteredYears = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  // Envanter yokken hiçbir eksende seçenek olmaz; boş süzgeç kutuları
  // göstermek yerine bloğu tamamen gizle.
  const hasAnyFilter =
    years.length > 0 ||
    clients.length > 0 ||
    facetOptions.some((facet) => facet.options.length > 0);

  return (
    <section className={styles.archive}>
      <h2 className={styles.title}>{t("archiveTitle")}</h2>

      {hasAnyFilter && (
        <div className={styles.filters} role="group" aria-label={tFilter("label")}>
          {years.length > 0 && (
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
          )}

          {clients.length > 0 && (
            <label className={styles.filterField}>
              <span>{tFilter("client")}</span>
              <select
                value={client}
                onChange={(event) => setClient(event.target.value)}
              >
                <option value={ALL}>{tFilter("all")}</option>
                {clients.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          )}

          {facetOptions.map((facet) =>
            facet.options.length === 0 ? null : (
              <label key={facet.key} className={styles.filterField}>
                <span>{tFilter(facet.key)}</span>
                <select
                  value={facets[facet.key]}
                  onChange={(event) =>
                    setFacets((current) => ({
                      ...current,
                      [facet.key]: event.target.value,
                    }))
                  }
                >
                  <option value={ALL}>{tFilter("all")}</option>
                  {facet.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ),
          )}
        </div>
      )}

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
                    {work.client_name ?? confidentialLabel}
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
