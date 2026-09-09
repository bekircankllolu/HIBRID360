"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { MAIN_NAV, type NavChild } from "@/data/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./Header.module.css";

const MENU_ID = "main-navigation";
const MEGA_MENU_ID = "desktop-mega-menu";

/** Tek kaynaklı, klavye ve mobil erişimli ana navigasyon. */
export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuHref, setActiveMenuHref] = useState<string | null>(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasMenuOpen = useRef(false);

  const activeMenu = MAIN_NAV.find((item) => item.href === activeMenuHref);
  const linkLabel = (link: NavChild) => link.label;

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveMenuHref(null);
    setIsLanguageOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsMenuOpen(false);
      setActiveMenuHref(null);
      setIsLanguageOpen(false);
    };
    const closeOnScroll = () => setActiveMenuHref(null);

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("scroll", closeOnScroll);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen && !isLanguageOpen) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isLanguageOpen, isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      firstLinkRef.current?.focus();
      wasMenuOpen.current = true;
      return;
    }

    if (wasMenuOpen.current) {
      wasMenuOpen.current = false;
      menuButtonRef.current?.focus();
    }
  }, [isMenuOpen]);

  const closeDesktopMenuWhenFocusLeaves = (
    event: React.FocusEvent<HTMLElement>,
  ) => {
    if (!headerRef.current?.contains(event.relatedTarget as Node | null)) {
      setActiveMenuHref(null);
    }
  };

  return (
    <header
      ref={headerRef}
      className={styles.header}
      onMouseLeave={() => setActiveMenuHref(null)}
      onBlur={closeDesktopMenuWhenFocusLeaves}
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} lang="en">
          Hibrid 360
        </Link>

        <nav
          id={MENU_ID}
          className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}
          aria-label={t("menuLabel")}
        >
          <ul className={styles.navList}>
            {MAIN_NAV.map((item, index) => {
              const hasChildren = Boolean(item.children?.length);

              return (
                <li
                  key={item.href}
                  className={styles.navItem}
                  onMouseEnter={() =>
                    setActiveMenuHref(hasChildren ? item.href : null)
                  }
                >
                  <Link
                    href={item.href}
                    ref={index === 0 ? firstLinkRef : undefined}
                    className={pathname === item.href ? styles.activeLink : undefined}
                    aria-haspopup={hasChildren ? "true" : undefined}
                    aria-expanded={
                      hasChildren ? activeMenuHref === item.href : undefined
                    }
                    aria-controls={hasChildren ? MEGA_MENU_ID : undefined}
                    onFocus={() =>
                      setActiveMenuHref(hasChildren ? item.href : null)
                    }
                  >
                    {t(item.labelKey)}
                  </Link>

                  {hasChildren && (
                    <ul className={styles.mobileServices}>
                      {item.children?.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href}>{linkLabel(child)}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.controls}>
          <LanguageSwitcher
            isOpen={isLanguageOpen}
            onOpenChange={(open) => {
              setIsLanguageOpen(open);
              if (open) {
                setIsMenuOpen(false);
                setActiveMenuHref(null);
              }
            }}
          />
          <button
            ref={menuButtonRef}
            type="button"
            className={`${styles.menuButton} ${isMenuOpen ? styles.menuButtonOpen : ""}`}
            aria-expanded={isMenuOpen}
            aria-controls={MENU_ID}
            aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
            onClick={() => {
              setIsLanguageOpen(false);
              setIsMenuOpen((current) => !current);
            }}
          >
            <span className={styles.menuLine} />
            <span className={styles.menuLine} />
          </button>
        </div>
      </div>

      <div
        id={MEGA_MENU_ID}
        className={`${styles.megaMenu} ${activeMenu ? styles.megaMenuOpen : ""}`}
        aria-hidden={!activeMenu}
        onMouseEnter={() => activeMenu && setActiveMenuHref(activeMenu.href)}
      >
        <div className={styles.megaInner}>
          <p className={styles.megaBrand} lang="en">Hibrid 360</p>
          {activeMenu && (
            <div className={styles.megaColumnWide}>
              <Link href={activeMenu.href} className={styles.megaHeading}>
                {t(activeMenu.labelKey)}
              </Link>
              <ul
                className={`${styles.serviceGrid} ${
                  activeMenu.href === "/what-we-do" ? styles.serviceGridWide : ""
                }`}
              >
                {activeMenu.children?.map((child) => (
                  <li key={child.href}>
                    <Link href={child.href}>{linkLabel(child)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
