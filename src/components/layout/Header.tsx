"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { MAIN_NAV, MEGA_MENU, type MegaMenuLink } from "@/data/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./Header.module.css";

const MENU_ID = "main-navigation";
const MEGA_MENU_ID = "desktop-mega-menu";

/** Mega menüde alt menüsü açılan madde. */
const MEGA_TRIGGER_HREF = "/what-we-do";

/**
 * Üst menü.
 *
 * Menü maddeleri, sıra ve mega menü sütunları `src/data/navigation.ts`
 * içinden geliyor; hizmet listesi de oradan `src/data/services.ts`'e
 * bağlanıyor. Bu bileşende paralel bir menü dizisi **yok** — daha önce
 * `NAV_ITEMS` ve `SERVICE_LINKS` burada sabit yazılıydı ve veri
 * dosyasıyla elle senkron tutuluyordu; Solutions'ın yanlış sayfaya
 * bakması ve dört maddenin yönlendirme URL'lerine gitmesi bu ikiliğin
 * sonucuydu.
 *
 * Etiketler `messages/*.json` → `nav.*`. Değerler Title Case; başlıkta
 * `text-transform` yok, yani görünen metin etiketin kendisi.
 */
export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasMenuOpen = useRef(false);

  /** Hizmet adları çevrilmez (marka dili); menü maddeleri çevrilir. */
  const linkLabel = (link: MegaMenuLink) =>
    link.labelKey ? t(link.labelKey) : link.label;

  /** Mobil panelde What We Do'nun altında açılan hizmet listesi. */
  const services =
    MAIN_NAV.find((item) => item.href === MEGA_TRIGGER_HREF)?.children ?? [];

  useEffect(() => {
    setIsMenuOpen(false);
    setIsMegaOpen(false);
    setIsLanguageOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsMenuOpen(false);
      setIsMegaOpen(false);
      setIsLanguageOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    const closeOnScroll = () => setIsMegaOpen(false);
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
      setIsMegaOpen(false);
    }
  };

  return (
    <header
      ref={headerRef}
      className={styles.header}
      onMouseLeave={() => setIsMegaOpen(false)}
      onBlur={closeDesktopMenuWhenFocusLeaves}
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          HIBRID 360
        </Link>

        <nav
          id={MENU_ID}
          className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}
          aria-label={t("menuLabel")}
          onMouseEnter={() => setIsMegaOpen(true)}
        >
          <ul className={styles.navList}>
            {MAIN_NAV.map((item, index) => {
              const isMegaTrigger = item.href === MEGA_TRIGGER_HREF;

              return (
                <li key={item.href} className={styles.navItem}>
                  <Link
                    href={item.href}
                    ref={index === 0 ? firstLinkRef : undefined}
                    className={
                      pathname === item.href ? styles.activeLink : undefined
                    }
                    aria-expanded={isMegaTrigger ? isMegaOpen : undefined}
                    aria-controls={isMegaTrigger ? MEGA_MENU_ID : undefined}
                    onFocus={() => setIsMegaOpen(true)}
                  >
                    {t(item.labelKey)}
                  </Link>

                  {isMegaTrigger && (
                    <ul className={styles.mobileServices}>
                      {services.map((service) => (
                        <li key={service.href}>
                          <Link href={service.href}>{service.label}</Link>
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
                setIsMegaOpen(false);
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
        className={`${styles.megaMenu} ${isMegaOpen ? styles.megaMenuOpen : ""}`}
        aria-hidden={!isMegaOpen}
        onMouseEnter={() => setIsMegaOpen(true)}
      >
        <div className={styles.megaInner}>
          <p className={styles.megaBrand}>HIBRID 360</p>

          {MEGA_MENU.map((column) =>
            column.variant === "services" ? (
              <div key={column.headingKey} className={styles.megaColumnWide}>
                <Link
                  href={column.headingHref ?? "/"}
                  className={styles.megaHeading}
                >
                  {t(column.headingKey)}
                </Link>
                <ul className={styles.serviceGrid}>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{linkLabel(link)}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div key={column.headingKey} className={styles.megaColumn}>
                <p className={styles.megaHeading}>{t(column.headingKey)}</p>
                {column.links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    {linkLabel(link)}
                  </Link>
                ))}
              </div>
            ),
          )}
        </div>
      </div>
    </header>
  );
}
