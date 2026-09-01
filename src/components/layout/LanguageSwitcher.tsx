"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import styles from "./LanguageSwitcher.module.css";

const PANEL_ID = "language-panel";

type LanguageSwitcherProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function LanguageSwitcher({
  isOpen,
  onOpenChange,
}: LanguageSwitcherProps) {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (isOpen) {
      wasOpen.current = true;
      requestAnimationFrame(() => closeRef.current?.focus());
      return;
    }

    if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  const trapFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;

    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;

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

  const switchLocale = (nextLocale: (typeof routing.locales)[number]) => {
    if (nextLocale !== locale) {
      router.replace(pathname, { locale: nextLocale });
    }
    onOpenChange(false);
  };

  return (
    <div className={styles.wrapper}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={t("label")}
        aria-expanded={isOpen}
        aria-controls={PANEL_ID}
        onClick={() => onOpenChange(!isOpen)}
      >
        <span className={styles.globe} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          id={PANEL_ID}
          ref={panelRef}
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="language-panel-title"
          onKeyDown={trapFocus}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onOpenChange(false);
          }}
        >
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            aria-label={
              locale === "tr" ? "Dil panelini kapat" : "Close language panel"
            }
            onClick={() => onOpenChange(false)}
          >
            <span aria-hidden="true" />
          </button>

          <div className={styles.panelInner}>
            <p className={styles.eyebrow}>HIBRID 360</p>
            <h2 id="language-panel-title" className={styles.title}>
              {locale === "tr" ? "Dil seçin" : "Select language"}
            </h2>

            <div className={styles.languages} aria-label={t("label")}>
              {routing.locales.map((loc) => {
                const isCurrent = loc === locale;
                return (
                  <button
                    key={loc}
                    type="button"
                    className={styles.language}
                    aria-current={isCurrent ? "true" : undefined}
                    onClick={() => switchLocale(loc)}
                  >
                    <span className={styles.languageName}>
                      {loc === "tr" ? "Türkçe" : "English"}
                    </span>
                    <span className={styles.languageCode}>
                      {loc.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
