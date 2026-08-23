"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { submitContact, type SubmissionResult } from "@/lib/submissions";
import styles from "./ContactForm.module.css";

/**
 * GEN-11 / CON-06 — iletişim formu. Alan etiketleri ve mesajlar copy
 * deck'ten birebir. KVKK onay kutusu olmadan gönderilemez (brief +
 * docs/supabase-schema.sql RLS politikası aynı şartı koyuyor).
 *
 * TODO: GEN-11 "Phone (optional)" alanını listeliyor ama
 * docs/supabase-schema.sql'deki contact_submissions tablosunda phone
 * sütunu yok. Şema genişletilene kadar bu alan forma eklenmedi.
 */
export function ContactForm({ locale }: { locale: Locale }) {
  const t = useTranslations("contactForm");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const response = await submitContact({
      name,
      brand: brand || null,
      message: message || null,
      email,
      kvkk_consent: consent,
      language: locale,
    });
    setResult(response);
    setSubmitting(false);
  };

  if (result?.ok) {
    return <p className={styles.success}>{t("success")}</p>;
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {result && !result.ok && (
        <p className={styles.error}>
          {result.reason === "consent" ? t("errorConsent") : t("error")}
        </p>
      )}

      <label className={styles.field}>
        <span>{t("name")}</span>
        <input
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span>{t("brand")}</span>
        <input
          type="text"
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span>{t("message")}</span>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} />
      </label>

      <label className={styles.field}>
        <span>{t("email")}</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>{t("consent")}</span>
      </label>

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? t("sending") : t("send")}
      </button>
    </form>
  );
}
