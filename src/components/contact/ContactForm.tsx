"use client";

import { useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { submitContact, type SubmissionResult } from "@/lib/submissions";
import styles from "./ContactForm.module.css";

/**
 * GEN-11 / CON-06 — iletişim formu. Alan etiketleri ve mesajlar copy
 * deck'ten birebir. KVKK onay kutusu olmadan gönderilemez (brief +
 * docs/supabase-schema.sql RLS politikası aynı şartı koyuyor).
 *
 * ## 19 Eylül 2026 — yeniden tasarlandı
 *
 * Kullanıcı: *"En alttaki formu biraz daha bize özel kişiselleştirebiliriz."*
 * Haklıydı: form herhangi bir sitede durabilecek, kenarlıklı kutulardan
 * oluşan jenerik bir yığındı — sayfanın geri kalanıyla hiçbir akrabalığı
 * yoktu.
 *
 * Yeni hâli sitenin kendi dilinden: her alanın başında iki haneli bir
 * numara (LessTalk, What We Believe ve Creative kontak baskısıyla aynı
 * sayma dili), kutu yok, alanın altında bir hairline var ve odaklanınca
 * o çizgi soldan sağa marka sarısına dönüyor. Girdi puntosu büyük —
 * burası bir form değil, bir konuşmanın başlangıcı.
 *
 * ## Erişilebilirlik
 * Etiketler GERÇEK `<label>`: yüzen etiket numarası da placeholder da
 * etiketin yerini almıyor. Etiket her zaman görünür ve okunur ölçüde
 * (placeholder-as-label deseni ekran okuyucuda ve otomatik doldurmada
 * bozuluyor). Odak halkası korunuyor; hairline animasyonu odak
 * göstergesinin YERİNE değil, yanına geçiyor.
 * Hata ve başarı mesajları `role="status"` ile duyuruluyor.
 *
 * TODO: GEN-11 "Phone (optional)" alanını listeliyor ama
 * docs/supabase-schema.sql'deki contact_submissions tablosunda phone
 * sütunu yok. Şema genişletilene kadar bu alan forma eklenmedi.
 */

function Field({
  index,
  label,
  className,
  children,
}: {
  index: string;
  label: string;
  className?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className={`${styles.field}${className ? ` ${className}` : ""}`}>
      <span className={styles.fieldIndex} aria-hidden="true">
        {index}
      </span>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
      </label>
      {children(id)}
      {/* Odakla soldan sağa dolan hairline. Dekoratif: odak halkası
          ayrıca duruyor, bu çizgi onun yerine geçmiyor. */}
      <span className={styles.fieldRule} aria-hidden="true" />
    </div>
  );
}

export function ContactForm({
  locale,
  theme = "dark",
}: {
  locale: Locale;
  theme?: "dark" | "yellow";
}) {
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
    return (
      <p className={styles.success} role="status">
        {t("success")}
      </p>
    );
  }

  return (
    <form
      className={`${styles.form} ${theme === "yellow" ? styles.yellow : ""}`}
      onSubmit={onSubmit}
    >
      {result && !result.ok && (
        <p className={styles.error} role="status">
          {result.reason === "consent" ? t("errorConsent") : t("error")}
        </p>
      )}

      <Field index="01" label={t("name")}>
        {(id) => (
          <input
            id={id}
            className={styles.input}
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        )}
      </Field>

      <Field index="02" label={t("brand")}>
        {(id) => (
          <input
            id={id}
            className={styles.input}
            type="text"
            autoComplete="organization"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
          />
        )}
      </Field>

      <Field index="03" label={t("email")} className={styles.emailField}>
        {(id) => (
          <input
            id={id}
            className={styles.input}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
      </Field>

      <Field index="04" label={t("message")} className={styles.messageField}>
        {(id) => (
          <textarea
            id={id}
            className={`${styles.input} ${styles.textarea}`}
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        )}
      </Field>

      <label className={styles.consent}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>{t("consent")}</span>
      </label>

      <button type="submit" className={styles.submit} disabled={submitting}>
        <span>{submitting ? t("sending") : t("send")}</span>
        <ArrowRight aria-hidden="true" size={20} strokeWidth={1.75} />
      </button>
    </form>
  );
}
