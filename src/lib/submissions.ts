"use server";

import { getSupabase } from "@/lib/supabase";

/**
 * Form gönderimleri — docs/supabase-schema.sql `brief_submissions` ve
 * `contact_submissions` tabloları.
 *
 * RLS politikası: her iki tabloya da yalnızca `kvkk_consent = true` olan
 * satırlar insert edilebilir; okuma public'e kapalı. Bu yüzden rıza
 * kutucuğu sunucu tarafında da doğrulanır (istemci doğrulaması tek başına
 * yeterli değildir).
 */

export type SubmissionResult =
  | { ok: true }
  | { ok: false; reason: "consent" | "email" | "unconfigured" | "error" };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export interface BriefSubmission {
  what_making: string | null;
  who_for: string | null;
  when_live: string | null;
  where_running: string[];
  budget_band: string | null;
  reference_link: string | null;
  contact_email: string;
  kvkk_consent: boolean;
  language: "tr" | "en";
}

export async function submitBrief(
  submission: BriefSubmission,
): Promise<SubmissionResult> {
  if (!submission.kvkk_consent) return { ok: false, reason: "consent" };
  if (!isValidEmail(submission.contact_email)) return { ok: false, reason: "email" };

  const supabase = getSupabase();
  // Supabase projesi henüz bağlanmadıysa form sessizce başarılı gibi
  // davranmaz — kullanıcıya dürüst bir hata gösterilir.
  if (!supabase) return { ok: false, reason: "unconfigured" };

  const { error } = await supabase.from("brief_submissions").insert(submission);
  if (error) {
    console.error("brief_submissions insert failed:", error.message);
    return { ok: false, reason: "error" };
  }
  return { ok: true };
}

export interface ContactSubmission {
  name: string;
  brand: string | null;
  message: string | null;
  email: string;
  kvkk_consent: boolean;
  language: "tr" | "en";
}

export async function submitContact(
  submission: ContactSubmission,
): Promise<SubmissionResult> {
  if (!submission.kvkk_consent) return { ok: false, reason: "consent" };
  if (!isValidEmail(submission.email)) return { ok: false, reason: "email" };

  const supabase = getSupabase();
  if (!supabase) return { ok: false, reason: "unconfigured" };

  const { error } = await supabase.from("contact_submissions").insert(submission);
  if (error) {
    console.error("contact_submissions insert failed:", error.message);
    return { ok: false, reason: "error" };
  }
  return { ok: true };
}
