"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./Header.module.css";

// GEN-01 (nihai copy deck, Ağustos 2026): ana menü tam olarak beş madde —
// WORK · WHAT WE DO · CULTURE · FRIENDS · CONTACT. Insights bu listede
// yok; deck'in 44 sayfasında Insights hiç geçmiyor (brief-rev12.md'nin
// DECISIONS #13 kararıyla çelişiyor). /insights rotası ve altyapısı
// silinmedi — sadece ana menüden çıkarıldı, footer'a taşındı. TODO:
// müşteriye sorulacak — Insights kalıcı olarak ana menüden mi çıktı, yoksa
// bu deck'te unutuldu mu?
export function Header() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpen = useRef(false);

  const items: Array<{ href: string; label: string }> = [
    { href: "/work", label: t("work") },
    { href: "/what-we-do", label: t("whatWeDo") },
    { href: "/culture", label: t("culture") },
    { href: "/friends", label: t("friends") },
    { href: "/contact", label: t("contact") },
  ];

  // 390px genişlikte header taşıyordu (5 madde + dil seçici tek satırda
  // sığmıyordu) — mobilde tam ekran açılır menüye geçildi. Desktop nav
  // (.nav/.desktopSwitcher) CSS ile değişmeden kalıyor, yalnızca ≤767px'te
  // gizlenip yerini hamburger + panel alıyor.
  useEffect(() => {
    if (open) {
      firstLinkRef.current?.focus();
      const { overflow } = document.body.style;
      document.body.style.overflow = "hidden";
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") setOpen(false);
      };
      document.addEventListener("keydown", onKeyDown);
      wasOpen.current = true;
      return () => {
        document.body.style.overflow = overflow;
        document.removeEventListener("keydown", onKeyDown);
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      toggleRef.current?.focus();
    }
  }, [open]);

  // Masaüstüne büyütülürken panel açık kalmasın (yalnızca mobil breakpoint
  // için var).
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const onChange = () => setOpen(false);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          HIBRID 360
        </Link>
        <nav className={styles.nav} aria-label="Main">
          <ul className={styles.navList}>
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.desktopSwitcher}>
          <LanguageSwitcher />
        </div>
        <button
          ref={toggleRef}
          type="button"
          className={styles.menuToggle}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? t("menuClose") : t("menuOpen")}
          onClick={() => setOpen((value) => !value)}
        >
          <span className={styles.menuToggleBar} aria-hidden="true" />
          <span className={styles.menuToggleBar} aria-hidden="true" />
          <span className={styles.menuToggleBar} aria-hidden="true" />
        </button>
      </div>

      <div
        id={menuId}
        className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("menuOpen")}
        aria-hidden={open ? undefined : true}
      >
        <ul className={styles.mobileNavList}>
          {items.map((item, index) => (
            <li key={item.href}>
              <Link
                href={item.href}
                ref={index === 0 ? firstLinkRef : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.mobileSwitcher}>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
