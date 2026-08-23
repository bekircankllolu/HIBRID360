import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CtaBand } from "@/components/cta/CtaBand";
import { CustomCursor } from "@/components/CustomCursor";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { ConsentInitScript } from "@/components/consent/ConsentInitScript";
import { Analytics } from "@/components/consent/Analytics";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd } from "@/lib/schema";
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s · ${SITE_NAME}`,
    },
    // brief-rev12.md Bölüm 1.7: anahtar kelime istifi temizlendi — tek,
    // doğal cümle. Sayfa özelinde farklı bir açıklama hazır olduğunda
    // ilgili page.tsx kendi generateMetadata'sında bunu geçersiz kılar.
    description: SITE_TAGLINE,
    openGraph: {
      siteName: SITE_NAME,
      locale,
      type: "website",
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        tr: "/tr",
        en: "/en",
        "x-default": "/tr",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale as Locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {/* Gövde fontu ilk boyamada gereken tek font — preload edilir.
            Montserrat (başlık) preload EDİLMEZ: kritik yolu meşgul
            etmesin, display:swap ile hemen sonra yerine oturur. */}
        <link
          rel="preload"
          href="/fonts/inter-latin-tr.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <ConsentInitScript />
      </head>
      <body>
        <JsonLd data={organizationJsonLd(locale as Locale)} />
        <NextIntlClientProvider messages={messages}>
          <Header />
          {children}
          {/* GEN-08/09 — sitenin tek birincil eylemi, her sayfanın altı,
              footer'dan önce. Ayrıca ana sayfada HOME-12 kendi Work
              linkine sahip; bu ikisi farklı hedeflere gider, birbirinin
              yerini tutmaz. */}
          <CtaBand />
          <Footer />
          {/* DECISIONS #3 (VARSAYILANLA İLERLE) — derece işareti imleci.
              prefers-reduced-motion ve dokunmatik cihazlarda kapalı. */}
          <CustomCursor />
          {/* brief 1.8 / 14 — çerez onay bandı (kabul / reddet / ayarlar).
              Analytics yalnızca rıza verildiğinde yüklenir (brief 1.7). */}
          <CookieBanner />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
