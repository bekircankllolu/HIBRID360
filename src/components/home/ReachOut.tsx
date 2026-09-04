"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ContactForm } from "@/components/contact/ContactForm";
import type { Locale } from "@/i18n/routing";
import styles from "./ReachOut.module.css";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const ctaRef = useRef<HTMLButtonElement>(null);
  const ctaLabelRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Hover'da ok bloğu başa geçer. İki blok da YALNIZCA transform ile
  // kayar — yerleşim değişmediği için CLS üretmez ve hareket compositor
  // üzerinde kalır.
  //
  // Etiketin ne kadar yol alacağı sabit (ok karesi + boşluk), ama okun
  // alacağı yol etiket genişliğine bağlı ve bu dile göre değişiyor
  // ("Bize ulaşın" ≠ "Reach out"). Sabit bir değer yazılsaydı diğer
  // dilde bloklar üst üste binerdi; bu yüzden ölçülüp CSS değişkenine
  // yazılıyor ve ResizeObserver ile güncel tutuluyor (font yüklenmesi,
  // dil değişimi, ekran genişliği).
  useEffect(() => {
    const label = ctaLabelRef.current;
    const button = ctaRef.current;
    if (!label || !button) return;

    const measure = () => {
      button.style.setProperty("--cta-label-width", `${label.offsetWidth}px`);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(label);
    return () => observer.disconnect();
  }, []);

  // aria-modal="true" bir diyalog açıkken klavye odağı arkadaki sayfaya
  // kaçmamalı (WAI-ARIA Dialog Pattern) — önceden yalnızca Escape ile
  // kapanıyordu, Tab ile dışarı çıkılabiliyordu. Açılışta odak popup'a
  // girer, Tab/Shift+Tab popup içinde döner, kapanışta odak tetikleyici
  // butona geri döner (klavye kullanıcısı kaybolmaz).
  useEffect(() => {
    if (!open) return;

    const popup = popupRef.current;
    const trigger = ctaRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFirst = () => {
      const first = popup?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      first?.focus();
    };
    focusFirst();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !popup) return;

      const focusable = Array.from(
        popup.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  return (
    <section className={styles.section} aria-labelledby="reach-out-title">
      <h2 id="reach-out-title" className={styles.title}>
        {t("title")}
      </h2>
      <button
        ref={ctaRef}
        type="button"
        className={styles.cta}
        onClick={() => setOpen(true)}
      >
        <span ref={ctaLabelRef} className={styles.ctaLabel}>
          {t("cta")}
        </span>
        <span className={styles.ctaArrow} aria-hidden="true">
          →
        </span>
      </button>

      {open && (
        <div className={styles.overlay} onMouseDown={() => setOpen(false)}>
          <div
            ref={popupRef}
            className={styles.popup}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reach-out-popup-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.close}
              aria-label={t("close")}
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true" />
            </button>
            <div className={styles.popupVisual} aria-hidden="true">
              <p className={styles.popupEyebrow}>HIBRID 360 / CONTACT</p>
              <Image
                className={styles.illustration}
                src="/images/site/home/reach-out-illustration-woman-stylized.svg"
                alt=""
                width={1449}
                height={1086}
                sizes="(max-width: 899px) 100vw, 46vw"
              />
            </div>
            <div className={styles.popupContent}>
              <p id="reach-out-popup-title" className={styles.popupIntro}>
                {t("popupIntro")}
              </p>
              <ContactForm locale={locale} theme="yellow" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
