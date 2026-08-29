import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import tr from "@/messages/tr.json";

/**
 * Works veri sözleşmesi — 29 Ağustos 2026 revizyonu.
 *
 * `Work` tipi, `docs/supabase-schema.sql` ve `works_public` view'i el ile
 * senkron tutuluyor (üretilmiş tip yok). Bu testler o senkronun sessizce
 * kopmasını engelliyor: tip yeni bir alan kazanırsa ama view'e
 * eklenmezse, sorgu sessizce `undefined` döndürürdü.
 */

const SCHEMA = fs.readFileSync(
  path.join(process.cwd(), "docs/supabase-schema.sql"),
  "utf8",
);
const MIGRATION_DIR = path.join(process.cwd(), "supabase/migrations");

/** `create view public.works_public ... from public.works` gövdesi. */
function worksPublicColumns(sql: string): string[] {
  const start = sql.indexOf("create view public.works_public");
  expect(start, "works_public view bulunamadı").toBeGreaterThan(-1);
  const body = sql.slice(sql.indexOf("select", start), sql.indexOf("from public.works", start));
  return body
    .replace(/^select/, "")
    .split(",")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const alias = line.match(/\bas\s+([a-z_]+)$/i);
      return alias ? alias[1] : line;
    });
}

describe("works filtre facet'leri", () => {
  const facets = ["service", "industry", "content_format"] as const;

  it.each(facets)("%s kolonu şema referansında nullable tanımlı", (column) => {
    // `not null` almadan tanımlanmış olmalı: envanter gelmeden doldurulamaz.
    const match = SCHEMA.match(new RegExp(`^\\s*${column} text.*$`, "m"));
    expect(match, `${column} docs/supabase-schema.sql'de yok`).not.toBeNull();
    expect(match?.[0]).not.toMatch(/not null/i);
  });

  it.each(facets)("%s kolonu works_public view'inde açığa çıkıyor", (column) => {
    expect(worksPublicColumns(SCHEMA)).toContain(column);
  });

  it("mevcut format ve category kolonları korunuyor", () => {
    // Anlamları değiştirilmedi; content_format ayrı bir kolon olarak eklendi.
    expect(SCHEMA).toMatch(
      /format text not null check \(format in \('video', 'image', 'case_study'\)\)/,
    );
    expect(worksPublicColumns(SCHEMA)).toEqual(
      expect.arrayContaining(["format", "category", "content_format"]),
    );
  });

  it("view gizli müşteri maskesini ve yayın izni süzgecini koruyor", () => {
    expect(SCHEMA).toContain(
      "case when client_name_confidential then null else client_name end as client_name",
    );
    expect(SCHEMA).toContain("where published = true and permission_status = 'approved'");
  });

  it("migration Supabase CLI adlandırmasına uyuyor ve view'i yeniden kuruyor", () => {
    const files = fs.readdirSync(MIGRATION_DIR).filter((f) => f.endsWith(".sql"));
    // <14 haneli zaman damgası>_<ad>.sql — CLI'nin ürettiği biçim.
    for (const file of files) {
      expect(file).toMatch(/^\d{14}_[a-z0-9_]+\.sql$/);
    }

    const migration = files.find((f) => f.includes("extend_works_filter_facets"));
    expect(migration, "facet migration'ı yok").toBeDefined();
    const sql = fs.readFileSync(path.join(MIGRATION_DIR, migration!), "utf8");

    for (const column of facets) {
      expect(sql).toContain(`add column if not exists ${column} text`);
    }
    // View drop+create edildiği için grant'ın yeniden verilmesi şart.
    expect(sql).toContain("drop view if exists public.works_public");
    expect(sql).toContain("grant select on public.works_public to anon, authenticated");
    expect(worksPublicColumns(sql)).toEqual(worksPublicColumns(SCHEMA));
  });

  it("seed dosyasına sahte iş eklenmedi", () => {
    const seed = fs.readFileSync(path.join(process.cwd(), "supabase/seed.sql"), "utf8");
    expect(seed).not.toMatch(/insert\s+into\s+public\.works/i);
  });
});

describe("arşiv filtre etiketleri", () => {
  it.each(["tr", "en"] as const)("%s: dört eksenin de etiketi var", (locale) => {
    const filter = (locale === "tr" ? tr : en).work.filter as Record<string, string>;
    for (const key of ["year", "client", "service", "industry", "contentFormat", "all"]) {
      expect(filter[key], `work.filter.${key} eksik`).toBeTruthy();
    }
  });
});
