"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { readConsent, writeConsent } from "@/lib/consent";
import styles from "./CookieBanner.module.css";

/**
 * Çerez onay bandı — brief-rev12.md Bölüm 1.8 / 14:
 * "site açılışında onay bandı (kabul / reddet / ayarlar)".
 *
 * Reddetme, kabul etmek kadar kolay: iki buton yan yana, aynı görsel
 * ağırlıkta. "Ayarlar" analitik çerezini ayrı ayrı açıp kapatır.
 * Karar verilene kadar hiçbir analytics scripti yüklenmez.
 */
export function CookieBanner() {
  const t = useTranslations("consent");
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    // Rıza kaydı yoksa bandı göster.
    setVisible(readConsent() === null);
  }, []);

  if (!visible) return null;

  const decide = (allowAnalytics: boolean) => {
    writeConsent(allowAnalytics);
    setVisible(false);
  };

  return (
    <div className={styles.banner} role="dialog" aria-label={t("label")}>
      <div className={styles.inner}>
        <p className={styles.text}>
          {t("message")}{" "}
          <Link href="/cookie-policy" className={styles.link}>
            {t("policyLink")}
          </Link>
        </p>

        {showSettings && (
          <div className={styles.settings}>
            <label className={styles.setting}>
              <input type="checkbox" checked disabled />
              <span>{t("necessary")}</span>
            </label>
            <label className={styles.setting}>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
              />
              <span>{t("analytics")}</span>
            </label>
          </div>
        )}

        <div className={styles.actions}>
          {showSettings ? (
            <button
              type="button"
              className={styles.primary}
              onClick={() => decide(analytics)}
            >
              {t("save")}
            </button>
          ) : (
            <>
              <button
                type="button"
                className={styles.primary}
                onClick={() => decide(true)}
              >
                {t("accept")}
              </button>
              <button
                type="button"
                className={styles.primary}
                onClick={() => decide(false)}
              >
                {t("reject")}
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => setShowSettings(true)}
              >
                {t("settings")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
