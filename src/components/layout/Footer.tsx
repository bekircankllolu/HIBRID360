import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BRAND_SIGNATURE, SOCIAL_PLATFORMS, CONTACT } from "@/lib/site";
import { isSustainabilityPublishable } from "@/data/sustainability";
import styles from "./Footer.module.css";

// Sosyal kanal URL'leri henüz teyit edilmedi (GEN-07: "Tüm hesap adları
// 'Hibrid 360' olacak. LinkedIn şu an 'hibrid-production' adıyla duruyor.")
// — bu yüzden gerçek href yerine erişilebilir, tıklanamaz ikon
// placeholder'ları render ediliyor. TODO: hesaplar teyit edilince <a href>
// ile değiştirilecek.

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  // GEN-06 — footer yasal blok bu üç linki sayıyor; diğer yasal sayfalar
  // (Terms, AI Usage, Accessibility, Sustainability) brief-rev12.md'nin
  // kendi bölümlerinde mandatory olduğu için kaldırılmadı, listeye eklendi.
  const legalItems: Array<{ href: string; label: string }> = [
    { href: "/privacy", label: t("legal.privacy") },
    { href: "/cookie-policy", label: t("legal.cookie") },
    { href: "/kvkk", label: t("legal.kvkk") },
    { href: "/terms", label: t("legal.terms") },
    { href: "/ai-policy", label: t("legal.aiUsage") },
    { href: "/accessibility", label: t("legal.accessibility") },
    { href: "/culture/sustainability", label: t("legal.sustainability") },
  ];

  // brief 1.9 — karbon nötr rozeti YALNIZCA ölçüm + sertifika verisi
  // girildiğinde yayınlanır. Veri yokken rozet gösterilmez (greenwashing
  // uyarısı, bkz. src/data/sustainability.ts).
  const showCarbonBadge = isSustainabilityPublishable();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* GEN-05 — footer iletişim mikro metni. */}
        <address className={styles.contact}>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>{CONTACT.phone}</a>
          <span>{CONTACT.addressLines.join(", ")}</span>
        </address>

        <nav aria-label="Legal">
          <ul className={styles.legalList}>
            {/* GEN-01'in beş maddelik ana menüsünde yok; SEO/GEO
                keşfedilebilirliği (Faz 1) kaybolmasın diye footer'a
                taşındı — bkz. Header.tsx yorum notu. */}
            <li>
              <Link href="/insights">{tNav("insights")}</Link>
            </li>
            {legalItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.bottomRow}>
          {/* GEN-07 — sosyal medya ikon etiketleri. */}
          <div className={styles.social} aria-label={t("social.label")}>
            {SOCIAL_PLATFORMS.map((platform) => (
              <span key={platform} className={styles.socialIcon}>
                <span className="srOnly">{platform}</span>
              </span>
            ))}
          </div>
          <p className={styles.copyright}>{t("copyright")}</p>
        </div>

        {showCarbonBadge && (
          <Link href="/culture/sustainability" className={styles.carbonBadge}>
            {t("carbonNeutral")}
          </Link>
        )}

        {/* GEN-04 — marka imzası, her sayfanın footer'ında, iki dilde de değişmez. */}
        <p className={styles.signature}>{BRAND_SIGNATURE}</p>
      </div>
    </footer>
  );
}
