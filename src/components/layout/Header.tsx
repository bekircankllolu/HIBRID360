"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./Header.module.css";

const MENU_ID = "main-navigation";

// GEN-01 (nihai copy deck, Ağustos 2026): ana menü tam olarak beş madde —
// WORK · WHAT WE DO · CULTURE · FRIENDS · CONTACT. Insights bu listede
// yok; deck'in 44 sayfasında Insights hiç geçmiyor (brief-rev12.md'nin
// DECISIONS #13 kararıyla çelişiyor). /insights rotası ve altyapısı
// silinmedi — sadece ana menüden çıkarıldı, footer'a taşındı. TODO:
// müşteriye sorulacak — Insights kalıcı olarak ana menüden mi çıktı, yoksa
// bu deck'te unutuldu mu?
export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const items: Array<{ href: string; label: string }> = [
    { href: "/work", label: t("work") },
    { href: "/what-we-do", label: t("whatWeDo") },
    { href: "/culture", label: t("culture") },
    { href: "/friends", label: t("friends") },
    { href: "/contact", label: t("contact") },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          HIBRID 360
        </Link>

        <nav
          id={MENU_ID}
          className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}
          aria-label={t("menuLabel")}
        >
          <ul className={styles.navList}>
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.controls}>
          <LanguageSwitcher />
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={isMenuOpen}
            aria-controls={MENU_ID}
            aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <span className={styles.menuLine} />
            <span className={styles.menuLine} />
            <span className={styles.menuLine} />
          </button>
        </div>
      </div>
    </header>
  );
}
