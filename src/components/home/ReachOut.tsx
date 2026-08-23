"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ContactForm } from "@/components/contact/ContactForm";
import type { Locale } from "@/i18n/routing";
import styles from "./ReachOut.module.css";

/**
 * HOME-11 — 8. ekran, scroll ortası, iletişim ikonları + pop-up.
 *
 * Deck: "Pop-up formu tek soruluk adımlarla ilerler (isim → marka → ne
 * yapmak istiyorsunuz → e-posta)." Bu, Brief Builder'daki gibi çok adımlı
 * bir wizard UX'i tarifliyor. TODO: burada, mevcut tek-ekranlı
 * ContactForm bileşeni yeniden kullanıldı (basitleştirme) — tek soruluk
 * adım akışı ayrı bir iterasyonda eklenecek.
 */
export function ReachOut() {
  const t = useTranslations("home.reachOut");
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <section className={styles.section} aria-labelledby="reach-out-title">
      <h2 id="reach-out-title" className={styles.title}>
        {t("title")}
      </h2>
      <button type="button" className={styles.cta} onClick={() => setOpen(true)}>
        {t("cta")}
      </button>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div
            className={styles.popup}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reach-out-popup-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.close}
              aria-label={t("close")}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <p id="reach-out-popup-title" className={styles.popupIntro}>
              {t("popupIntro")}
            </p>
            <ContactForm locale={locale} />
          </div>
        </div>
      )}
    </section>
  );
}
