/**
 * docs/supabase-schema.sql tablolarını birebir yansıtan tipler. Faz 1-2
 * arasında gerçek bir Supabase projesi bağlanana kadar `src/data/*.ts`
 * içindeki yerel sabitler bu tiplerle uyumlu, drop-in bir stand-in olarak
 * kullanılıyor — Supabase bağlandığında yalnızca veri kaynağı değişir,
 * bileşenler değişmez.
 */
export interface InsightsPost {
  id: string;
  slug: string;
  title_tr: string;
  title_en: string;
  summary_tr: string | null;
  summary_en: string | null;
  body_tr: string | null;
  body_en: string | null;
  cover_image_url: string | null;
  category: string | null;
  published_at: string | null;
  last_reviewed_at: string | null;
  author_name: string | null;
  author_title: string | null;
  is_published: boolean;
}
