import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd } from "@/lib/schema";
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import "@/styles/globals.css";

/**
 * Fontlar — CLAUDE.md marka sistemi: Montserrat (marka/başlık),
 * Inter (gövde, DECISIONS #2 VARSAYILANLA İLERLE).
 *
 * Performans notu: `weight` dizisi verilmediğinde next/font her ailenin
 * DEĞİŞKEN (variable) sürümünü tek dosya olarak yükler — sabit ağırlıklar
 * istendiğinde ağırlık başına ayrı dosya inerdi (5 dosya / ~238KB).
 * `latin-ext` alt kümesi Türkçe glifleri (ğ ş ı İ) için zorunlu.
 */
const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

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
    <html lang={locale} className={`${montserrat.variable} ${inter.variable}`}>
      <body>
        <JsonLd data={organizationJsonLd(locale as Locale)} />
        <NextIntlClientProvider messages={messages}>
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
