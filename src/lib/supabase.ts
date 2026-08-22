import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase istemcisi — yalnızca publishable (anon) anahtarla, public read
 * için. docs/supabase-schema.sql'deki RLS politikaları published=true olan
 * satırları herkese açar; form tabloları yalnızca insert kabul eder.
 *
 * Proje henüz açılmadığı için env değişkenleri tanımlı olmayabilir. Bu
 * durumda null döner ve çağıran taraf boş sonuç üretir — build ve sayfalar
 * hata vermeden çalışır.
 */
let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  if (!cached) cached = createClient(url, key);
  return cached;
}
