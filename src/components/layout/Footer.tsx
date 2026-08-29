import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BRAND_SIGNATURE, SOCIAL_PLATFORMS, CONTACT } from "@/lib/site";
import { isSustainabilityPublishable } from "@/data/sustainability";
import styles from "./Footer.module.css";

const FOOTER_NAV = [
  { href: "/work", en: "Work", tr: "Work" },
  { href: "/culture/who-we-are", en: "Who We Are", tr: "Biz Kimiz" },
  { href: "/what-we-do", en: "What We Do", tr: "Ne Yapıyoruz" },
  {
    href: "/culture/what-we-believe",
    en: "What We Believe",
    tr: "Neye İnanıyoruz",
  },
  { href: "/friends", en: "Clients", tr: "Müşteriler" },
  { href: "/culture/partners", en: "Partners", tr: "Partnerler" },
  { href: "/contact", en: "Contact", tr: "İletişim" },
] as const;

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const isTurkish = locale === "tr";

  const legalItems: Array<{ href: string; label: string }> = [
    { href: "/privacy", label: t("legal.privacy") },
    { href: "/cookie-policy", label: t("legal.cookie") },
    { href: "/kvkk", label: t("legal.kvkk") },
    { href: "/terms", label: t("legal.terms") },
    { href: "/ai-policy", label: t("legal.aiUsage") },
    { href: "/accessibility", label: t("legal.accessibility") },
    { href: "/culture/sustainability", label: t("legal.sustainability") },
  ];

  const showCarbonBadge = isSustainabilityPublishable();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <p className={styles.wordmark}>HIBRID 360</p>
          <p className={styles.statement}>{BRAND_SIGNATURE}</p>
        </div>

        <a className={styles.email} href={`mailto:${CONTACT.email}`}>
          {CONTACT.email}
        </a>

        <div className={styles.columns}>
          <section className={styles.column} aria-labelledby="footer-contact">
            <h2 id="footer-contact">
              {isTurkish ? "İletişim" : "Contact"}
            </h2>
            <address className={styles.contact}>
              <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>
                {CONTACT.phone}
              </a>
              <span>{CONTACT.addressLines.join(", ")}</span>
            </address>
          </section>

          <nav className={styles.column} aria-label="Footer">
            <h2>{isTurkish ? "Keşfet" : "Explore"}</h2>
            <ul>
              {FOOTER_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{isTurkish ? item.tr : item.en}</Link>
                </li>
              ))}
              <li>
                <Link href="/insights">{tNav("insights")}</Link>
              </li>
            </ul>
          </nav>

          <nav className={styles.column} aria-label="Legal">
            <h2>{isTurkish ? "Yasal" : "Legal"}</h2>
            <ul>
              {legalItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <section className={styles.column} aria-labelledby="footer-social">
            <h2 id="footer-social">{t("social.label")}</h2>
            <div className={styles.social}>
              {SOCIAL_PLATFORMS.map((platform) => (
                <span key={platform}>{platform}</span>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.bottomRow}>
          <p className={styles.copyright}>{t("copyright")}</p>
          {showCarbonBadge && (
            <Link href="/culture/sustainability" className={styles.carbonBadge}>
              {t("carbonNeutral")}
            </Link>
          )}
          <a href="#top" className={styles.backToTop}>
            {isTurkish ? "Yukarı" : "Back to top"} ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
