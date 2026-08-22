import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BRAND_SIGNATURE, SOCIAL_PLATFORMS } from "@/lib/site";
import styles from "./Footer.module.css";

// Sosyal kanal URL'leri henüz teyit edilmedi (brief 17.2: bazıları
// "var/açılacak" durumda) — bu yüzden gerçek href yerine erişilebilir,
// tıklanamaz ikon placeholder'ları render ediliyor. TODO: brief 17.2 —
// hesaplar teyit edilince <a href> ile değiştirilecek.

export function Footer() {
  const t = useTranslations("footer");

  const legalItems: Array<{ href: string; label: string }> = [
    { href: "/privacy", label: t("legal.privacy") },
    { href: "/cookie-policy", label: t("legal.cookie") },
    { href: "/kvkk", label: t("legal.kvkk") },
    { href: "/ai-usage-rights", label: t("legal.aiUsage") },
    { href: "/accessibility", label: t("legal.accessibility") },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <nav aria-label="Legal">
          <ul className={styles.legalList}>
            {legalItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.bottomRow}>
          <div className={styles.social} aria-label={t("social.label")}>
            {SOCIAL_PLATFORMS.map((platform) => (
              <span key={platform} className={styles.socialIcon}>
                <span className="srOnly">{platform}</span>
              </span>
            ))}
          </div>
          <p className={styles.copyright}>{t("copyright")}</p>
        </div>

        {/* brief-rev12.md Bölüm 2.2: marka imzası, her sayfanın footer'ında,
            iki dilde de değişmez (Kademe 1-2 sabit). */}
        <p className={styles.signature}>{BRAND_SIGNATURE}</p>
      </div>
    </footer>
  );
}
