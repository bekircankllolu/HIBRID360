import { cache } from "react";
import { getSupabase } from "@/lib/supabase";
import type { Director, InsightsPost, Testimonial, Work } from "@/types/content";

/**
 * İçerik sorguları. Supabase yapılandırılmamışsa boş dizi/null döner —
 * sayfalar bu durumda kendi boş durumlarını ("İçerik hazırlanıyor")
 * gösterir.
 *
 * TODO: docs/DECISIONS.md #16 (Works içerik envanteri) ve #14 (Directors &
 * Crew kadrosu) kapanmadan bu tablolar dolmayacak — arayüz hazır, veri
 * bekleniyor.
 */

async function selectFrom<T>(
  table: string,
  order?: { column: string; ascending: boolean },
  publishedColumn?: string,
): Promise<T[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase.from(table).select("*");
  // Yayın süzgeci asıl olarak RLS politikalarında (docs/supabase-schema.sql):
  // anon anahtar herkese açık olduğu için buradaki .eq() bir güvenlik önlemi
  // değil, yalnızca gereksiz satır çekmemek için. works_public view'i süzgeci
  // kendi içinde taşıdığından oraya uygulanmıyor.
  if (publishedColumn) query = query.eq(publishedColumn, true);
  if (order) query = query.order(order.column, { ascending: order.ascending });

  const { data, error } = await query;
  if (error) {
    console.error(`Supabase query failed for "${table}":`, error.message);
    return [];
  }
  return (data ?? []) as T[];
}

/**
 * `works` tablosu yerine `works_public` view'i: gizli müşteri adı burada
 * maskeleniyor ve yalnızca permission_status='approved' işler dönüyor.
 * Taban tablonun anon/authenticated'a select yetkisi kaldırıldı.
 *
 * `select("*")` bilinçli: kolon listesi view'de tanımlı ve view zaten
 * güvenlik sınırı. 29 Ağustos 2026 revizyonuyla eklenen filtre
 * facet'leri (`service` · `industry` · `content_format`) bu yüzden ek
 * değişiklik gerektirmeden akıyor. View ile `Work` tipi arasındaki el
 * ile senkron src/types/content.test.ts tarafından doğrulanıyor.
 */
export const getPublishedWorks = cache(() =>
  selectFrom<Work>("works_public", {
    column: "year",
    ascending: false,
  }),
);

export const getPublishedDirectors = cache(() =>
  selectFrom<Director>(
    "directors",
    { column: "sort_order", ascending: true },
    "is_published",
  ),
);

export const getPublishedTestimonials = cache(() =>
  selectFrom<Testimonial>("testimonials", undefined, "is_published"),
);

export const getPublishedInsights = cache(() =>
  selectFrom<InsightsPost>(
    "insights_posts",
    { column: "published_at", ascending: false },
    "is_published",
  ),
);

export async function getWorkBySlug(slug: string): Promise<Work | null> {
  const works = await getPublishedWorks();
  return works.find((work) => work.slug === slug) ?? null;
}

export async function getDirectorBySlug(slug: string): Promise<Director | null> {
  const directors = await getPublishedDirectors();
  return directors.find((director) => director.slug === slug) ?? null;
}
