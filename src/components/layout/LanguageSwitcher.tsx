"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import styles from "./LanguageSwitcher.module.css";

export function LanguageSwitcher() {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className={styles.wrapper} role="group" aria-label={t("label")}>
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          className={styles.option}
          aria-current={loc === locale ? "true" : undefined}
          disabled={loc === locale}
          onClick={() => router.replace(pathname, { locale: loc })}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
