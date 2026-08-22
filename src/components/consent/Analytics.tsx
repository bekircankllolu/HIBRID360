"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { readConsent, type ConsentState } from "@/lib/consent";

/**
 * Analytics — brief-rev12.md Bölüm 1.7: "GA4 veya Plausible, çerez onayına
 * bağlı çalışacak (consent mode). Ölçülmeyen sayfa iyileştirilemez."
 *
 * Sağlayıcı seçimi env ile yapılır; hiçbiri tanımlı değilse HİÇBİR script
 * yüklenmez. Bu bilinçli: hangi sağlayıcının kullanılacağı ticari/hukuki
 * bir tercih (Plausible çerezsiz, GA4 değil) ve brief bunu ikisinden biri
 * olarak açık bırakmış.
 *
 * Script yalnızca kullanıcı analitik çerezine RIZA VERDİĞİNDE yüklenir —
 * rıza bandı kararı beklerken de, reddedilmişse de hiçbir istek gitmez.
 *
 * TODO: brief 1.7 — sağlayıcı seçilince ilgili env değişkeni
 * (.env.example'da tanımlı) production ortamında doldurulacak.
 */
export function Analytics() {
  const [consent, setConsent] = useState<ConsentState | null>(null);

  useEffect(() => {
    setConsent(readConsent());
    const onConsent = (event: Event) =>
      setConsent((event as CustomEvent<ConsentState>).detail);
    window.addEventListener("hibrid360:consent", onConsent);
    return () => window.removeEventListener("hibrid360:consent", onConsent);
  }, []);

  if (!consent?.analytics) return null;

  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;

  if (plausibleDomain) {
    return (
      <Script
        src="https://plausible.io/js/script.js"
        data-domain={plausibleDomain}
        strategy="afterInteractive"
      />
    );
  }

  if (ga4Id) {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('consent', 'default', { analytics_storage: 'granted' });
            gtag('config', '${ga4Id}', { anonymize_ip: true });
          `}
        </Script>
      </>
    );
  }

  return null;
}
