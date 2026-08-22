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

async function selectPublished<T>(
  table: string,
  publishedColumn: string,
  order?: { column: string; ascending: boolean },
): Promise<T[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase.from(table).select("*").eq(publishedColumn, true);
  if (order) query = query.order(order.column, { ascending: order.ascending });

  const { data, error } = await query;
  if (error) {
    console.error(`Supabase query failed for "${table}":`, error.message);
    return [];
  }
  return (data ?? []) as T[];
}

export function getPublishedWorks() {
  return selectPublished<Work>("works", "published", {
    column: "year",
    ascending: false,
  });
}

export function getPublishedDirectors() {
  return selectPublished<Director>("directors", "is_published", {
    column: "sort_order",
    ascending: true,
  });
}

export function getPublishedTestimonials() {
  return selectPublished<Testimonial>("testimonials", "is_published");
}

export function getPublishedInsights() {
  return selectPublished<InsightsPost>("insights_posts", "is_published", {
    column: "published_at",
    ascending: false,
  });
}

export async function getWorkBySlug(slug: string): Promise<Work | null> {
  const works = await getPublishedWorks();
  return works.find((work) => work.slug === slug) ?? null;
}

export async function getDirectorBySlug(slug: string): Promise<Director | null> {
  const directors = await getPublishedDirectors();
  return directors.find((director) => director.slug === slug) ?? null;
}
