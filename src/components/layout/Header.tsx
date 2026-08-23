"use client";

import { useEffect, useRef, useState } from "react";
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
//
// 390px'te 5 madde + dil seçici tek satıra sığmıyordu (header taşıyordu).
// ≤767px'te aynı <nav> CSS ile tam ekran panele dönüşür (bkz.
// Header.module.css .navOpen) — masaüstünde ayrı bir DOM ağacı yok,
// yalnızca stil değişiyor.
export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpen = useRef(false);

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

  // Panel açıkken arka plan kaymasın (tam ekran overlay) + odak ilk
  // linke gitsin; kapanınca odak hamburger düğmesine dönsün (klavye
  // kullanıcısı kaybolmasın).
  useEffect(() => {
    if (isMenuOpen) {
      firstLinkRef.current?.focus();
      const { overflow } = document.body.style;
      document.body.style.overflow = "hidden";
      wasOpen.current = true;
      return () => {
        document.body.style.overflow = overflow;
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      menuButtonRef.current?.focus();
    }
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
            {items.map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  ref={index === 0 ? firstLinkRef : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.controls}>
          <LanguageSwitcher />
          <button
            ref={menuButtonRef}
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
