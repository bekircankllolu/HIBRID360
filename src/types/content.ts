/**
 * docs/supabase-schema.sql tablolarını birebir yansıtan tipler.
 *
 * Veri kaynağı: Supabase (bkz. src/lib/content.ts). Env değişkenleri
 * tanımlı değilken sorgular boş dizi döner ve sayfalar kendi boş
 * durumlarını gösterir — bu, gerçek içerik envanteri gelmeden de
 * arayüzün doğru davrandığını görebilmek için bilinçli bir tasarım.
 */

export interface Director {
  id: string;
  slug: string;
  full_name: string;
  role: string;
  one_liner_tr: string | null;
  one_liner_en: string | null;
  bio_tr: string | null;
  bio_en: string | null;
  reel_video_url: string | null;
  photo_url: string | null;
  city: string | null;
  languages: string[] | null;
  relationship_type: "staff" | "freelance";
  is_published: boolean;
  sort_order: number;
}

export interface Work {
  id: string;
  slug: string;
  client_name: string;
  client_name_confidential: boolean;
  year: number;
  format: "video" | "image" | "case_study";
  category: string | null;
  is_featured: boolean;
  permission_status: "approved" | "pending" | "not_allowed";
  cover_image_url: string | null;
  video_url: string | null;
  case_problem_tr: string | null;
  case_problem_en: string | null;
  case_solution_tr: string | null;
  case_solution_en: string | null;
  case_result_tr: string | null;
  case_result_en: string | null;
  director_id: string | null;
  published: boolean;
}

export interface Testimonial {
  id: string;
  person_name: string;
  person_title: string;
  brand_name: string;
  quote_tr: string | null;
  quote_en: string | null;
  video_url_vertical: string | null;
  video_url_horizontal: string | null;
  work_id: string | null;
  placement: string[] | null;
  written_consent_confirmed: boolean;
  is_published: boolean;
}

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
