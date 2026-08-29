"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./Header.module.css";

const MENU_ID = "main-navigation";
const MEGA_MENU_ID = "desktop-mega-menu";

const SERVICE_LINKS = [
  { href: "/what-we-do/creative", en: "Creative", tr: "Creative" },
  { href: "/what-we-do/production", en: "Production", tr: "Production" },
  {
    href: "/what-we-do/post-production",
    en: "Post Production",
    tr: "Post Production",
  },
  { href: "/what-we-do/digital", en: "Digital", tr: "Digital" },
  {
    href: "/what-we-do/live-broadcast",
    en: "Live Broadcast",
    tr: "Live Broadcast",
  },
  { href: "/what-we-do/cloud-tv", en: "Cloud TV", tr: "Cloud TV" },
  {
    href: "/what-we-do/event-management",
    en: "Event Management",
    tr: "Event Management",
  },
  {
    href: "/what-we-do/ai-creative-production",
    en: "AI Creative Production",
    tr: "AI Creative Production",
  },
] as const;

// 29 Ağustos 2026 revizyonu — merge notu: bu bileşen menüyü kendi içinde
// tanımlıyor. Canonical rotaların ve sıranın asıl kaynağı
// `src/data/navigation.ts` (MAIN_NAV) ve `src/data/services.ts`
// (SERVICE_CATALOG). Aşağıdaki hedefler merge sırasında o kaynakla
// hizalandı: artık 308 yönlendirmeye değil doğrudan canonical rotalara
// gidiyorlar ve "Solutions" gerçek Solutions sayfasına bakıyor
// (önceden yanlışlıkla /what-we-do/how-we-work'e gidiyordu).
//
// TODO: bu iki dizi MAIN_NAV/SERVICE_CATALOG'dan türetilip kaldırılmalı.
// Bugün elle senkron: etiketler burada sabit yazılı (nav.* mesaj
// anahtarları kullanılmıyor) ve e2e/mobile-menu.spec.ts bu sabit
// etiketlere göre yazıldığı için merge'de yalnızca href'ler düzeltildi,
// etiketlere dokunulmadı.
const NAV_ITEMS = [
  {
    href: "/who-we-are",
    en: "Who We Are",
    tr: "Biz Kimiz",
  },
  { href: "/what-we-do", en: "What We Do", tr: "Ne Yapıyoruz" },
  {
    href: "/what-we-believe",
    en: "What We Believe",
    tr: "Neye İnanıyoruz",
  },
  {
    href: "/solutions",
    en: "Solutions",
    tr: "Çözümler",
  },
  { href: "/clients", en: "Clients", tr: "Müşteriler" },
  { href: "/partners", en: "Partners", tr: "Partnerler" },
  { href: "/contact", en: "Contact", tr: "İletişim" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasMenuOpen = useRef(false);
  const isTurkish = locale === "tr";

  const label = (item: { en: string; tr: string }) =>
    isTurkish ? item.tr : item.en;

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
            {NAV_ITEMS.map((item, index) => (
              <li key={item.href} className={styles.navItem}>
                <Link
                  href={item.href}
                  ref={index === 0 ? firstLinkRef : undefined}
                  className={pathname === item.href ? styles.activeLink : undefined}
                  aria-expanded={item.href === "/what-we-do" ? isMegaOpen : undefined}
                  aria-controls={
                    item.href === "/what-we-do" ? MEGA_MENU_ID : undefined
                  }
                  onFocus={() => setIsMegaOpen(true)}
                >
                  {label(item)}
                </Link>

                {item.href === "/what-we-do" && (
                  <ul className={styles.mobileServices}>
                    {SERVICE_LINKS.map((service) => (
                      <li key={service.href}>
                        <Link href={service.href}>{label(service)}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
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

          <div className={styles.megaColumnWide}>
            <Link href="/what-we-do" className={styles.megaHeading}>
              {isTurkish ? "Ne Yapıyoruz" : "What We Do"}
            </Link>
            <ul className={styles.serviceGrid}>
              {SERVICE_LINKS.map((service) => (
                <li key={service.href}>
                  <Link href={service.href}>{label(service)}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.megaColumn}>
            <p className={styles.megaHeading}>
              {isTurkish ? "Hakkımızda" : "About"}
            </p>
            <Link href="/who-we-are">
              {isTurkish ? "Biz Kimiz" : "Who We Are"}
            </Link>
            <Link href="/what-we-believe">
              {isTurkish ? "Neye İnanıyoruz" : "What We Believe"}
            </Link>
            <Link href="/partners">
              {isTurkish ? "Partnerler" : "Partners"}
            </Link>
          </div>

          <div className={styles.megaColumn}>
            <p className={styles.megaHeading}>
              {isTurkish ? "Keşfet" : "Explore"}
            </p>
            <Link href="/work">Work</Link>
            <Link href="/clients">
              {isTurkish ? "Müşteriler" : "Clients"}
            </Link>
            <Link href="/contact">{isTurkish ? "İletişim" : "Contact"}</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
