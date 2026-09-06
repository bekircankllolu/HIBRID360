"use client";

import { useTranslations } from "next-intl";
import { PrimaryCta } from "@/components/PrimaryCta";
import { Link, usePathname } from "@/i18n/navigation";
import { CONTACT } from "@/lib/site";
import styles from "./CtaBand.module.css";

/**
 * GEN-08/09 — iç sayfaların altındaki birincil + ikincil CTA. Ana sayfada
 * müşteri isteğiyle kaldırıldı; diğer rotalarda layout üzerinden ortak
 * olarak gösterilir.
 *
 * İkincil butonlar:
 *   - WhatsApp: CONTACT.phone'dan (gerçek, teyitli numara) türetilmiş
 *     wa.me linki — uydurma bir numara değil.
 *   - Takvim hesabı teslim edilmediği sürece Contact sayfasına giden
 *     eylem, randevu vaadinde bulunmayan dürüst bir iletişim etiketi taşır.
 */
export function CtaBand() {
  const t = useTranslations("cta");
  const pathname = usePathname();
  const whatsappHref = `https://wa.me/${CONTACT.phone.replace(/[^0-9]/g, "")}`;

  if (pathname === "/") return null;

  return (
    <section className={styles.band} aria-label={t("primary")}>
      <PrimaryCta />
      <div className={styles.secondary}>
        <Link href="/contact" className={styles.secondaryLink}>
          {t("contact")}
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className={styles.secondaryLink}
        >
          {t("whatsapp")}
        </a>
      </div>
    </section>
  );
}
