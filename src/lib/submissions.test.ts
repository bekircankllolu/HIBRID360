import { describe, expect, it } from "vitest";
import {
  submitBrief,
  submitContact,
  type BriefSubmission,
  type ContactSubmission,
} from "@/lib/submissions";

/**
 * submitBrief/submitContact'in doğrulama kapıları.
 *
 * Bunlar kozmetik değil: KVKK rızası olmadan satır yazılmaması hem
 * sözleşme hem RLS gereği (docs/supabase-schema.sql — insert politikası
 * `kvkk_consent = true` şartlı, rıza yoksa veritabanı zaten reddeder).
 * Sunucu tarafındaki bu kontrol, kullanıcıya "error" yerine anlaşılır
 * "consent" nedeni dönebilmek için var — yani istemci doğrulaması
 * atlatılsa bile davranış tanımlı kalmalı.
 *
 * NEXT_PUBLIC_SUPABASE_* tanımlı olmadığı için getSupabase() null döner;
 * rıza/e-posta geçen durumlarda beklenen sonuç "unconfigured" olur. Bu
 * aynı zamanda sıranın doğruluğunu kanıtlıyor: rıza ve e-posta kontrolü
 * veritabanına hiç gidilmeden yapılıyor.
 */

const validBrief: BriefSubmission = {
  what_making: "reklam filmi",
  who_for: "örnek marka",
  when_live: "1 ay",
  where_running: ["TV"],
  budget_band: null,
  reference_link: null,
  contact_email: "kisi@example.com",
  kvkk_consent: true,
  language: "tr",
};

const validContact: ContactSubmission = {
  name: "Örnek Kişi",
  brand: null,
  message: "Merhaba",
  email: "kisi@example.com",
  kvkk_consent: true,
  language: "tr",
};

describe("submitBrief", () => {
  it("rıza kutucuğu işaretsizse veritabanına gitmeden reddeder", async () => {
    const result = await submitBrief({ ...validBrief, kvkk_consent: false });
    expect(result).toEqual({ ok: false, reason: "consent" });
  });

  it("rıza yoksa e-posta da geçersiz olsa bile önce rızayı bildirir", async () => {
    const result = await submitBrief({
      ...validBrief,
      kvkk_consent: false,
      contact_email: "gecersiz",
    });
    expect(result).toEqual({ ok: false, reason: "consent" });
  });

  it.each([
    ["boş", ""],
    ["@ yok", "kisiexample.com"],
    ["alan adı yok", "kisi@"],
    ["nokta yok", "kisi@example"],
    ["boşluk içeriyor", "kisi @example.com"],
  ])("geçersiz e-postayı reddeder (%s)", async (_ad, email) => {
    const result = await submitBrief({ ...validBrief, contact_email: email });
    expect(result).toEqual({ ok: false, reason: "email" });
  });

  it("rıza ve e-posta geçerliyken Supabase yapılandırılmamışsa dürüstçe bildirir", async () => {
    // Sessizce başarı dönmemeli — kullanıcı formu gönderdiğini sanmamalı.
    const result = await submitBrief(validBrief);
    expect(result).toEqual({ ok: false, reason: "unconfigured" });
  });
});

describe("submitContact", () => {
  it("rıza kutucuğu işaretsizse reddeder", async () => {
    const result = await submitContact({ ...validContact, kvkk_consent: false });
    expect(result).toEqual({ ok: false, reason: "consent" });
  });

  it("geçersiz e-postayı reddeder", async () => {
    const result = await submitContact({ ...validContact, email: "gecersiz" });
    expect(result).toEqual({ ok: false, reason: "email" });
  });

  it("rıza ve e-posta geçerliyken Supabase yapılandırılmamışsa dürüstçe bildirir", async () => {
    const result = await submitContact(validContact);
    expect(result).toEqual({ ok: false, reason: "unconfigured" });
  });
});
