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

  const items: Array<{ href: string; label: string }> = [
    { href: "/work", label: t("work") },
    { href: "/what-we-do", label: t("whatWeDo") },
    { href: "/culture", label: t("culture") },
    { href: "/friends", label: t("friends") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
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
        <LanguageSwitcher />
      </div>
    </header>
  );
}
