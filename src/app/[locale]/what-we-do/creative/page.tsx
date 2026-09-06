import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import serviceStyles from "@/styles/service-page.module.css";
import creativeStyles from "./page.module.css";

/**
 * CRE-01..04 (nihai copy deck, Ağustos 2026) — Creative alt sayfası.
 * Hizmet listesi (CRE-03) EN + TR aynı (marka dili).
 *
 * TODO: CRE-04 — "Bu bölümde kampanya görselleri, KV'ler, outdoor/
 * billboard işleri, logolar ve brand ID çalışmaları yer alacak." Galeri
 * varlıkları teslim edilmeden eklenemez.
 */

const SERVICES = [
  "CREATIVE STRATEGY",
  "CREATIVE DIRECTION",
  "BRAND CONSULTANCY",
  "CORPORATE IDENTITY",
  "CONCEPT DEVELOPMENT",
  "CONTENT GENERATION",
  "COMMERCIALS · TVC · PRESS · RADIO CAMPAIGN",
  "PACKAGING",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Creative",
    description:
      locale === "en"
        ? "Brand thinking, concept and campaign ideas — from strategy to key visual and packaging."
        : "Marka düşüncesi, konsept ve kampanya fikirleri; stratejiden ana görsele ve ambalaja uzanan kreatif çözümler.",
    alternates: localizedAlternates(locale, "/what-we-do/creative"),
  };
}

export default async function CreativePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("services.creative");
  const body = t.raw("body") as string[];

  return (
    <div className={creativeStyles.surface}>
      <div className={`${serviceStyles.page} ${creativeStyles.page}`}>
        <JsonLd
          data={breadcrumbListJsonLd(locale, [
            { name: "Home", path: "" },
            { name: "What We Do", path: "/what-we-do" },
            { name: "Creative", path: "/what-we-do/creative" },
          ])}
        />

        <p className={creativeStyles.eyebrow}>CREATIVE</p>
        <h1 className={`${serviceStyles.heroTitle} ${creativeStyles.heroTitle}`}>
          PURE. SIMPLE. POWERFUL.
        </h1>
        <p className={`${serviceStyles.heroSubtitle} ${creativeStyles.heroSubtitle}`}>
          {t("heroSubtitle")}
        </p>
        <div className={creativeStyles.showreel}>
          <video
            className={creativeStyles.showreelVideo}
            src="/videos/hibrid-stone-loop-20260827.mp4"
            poster="/videos/hibrid-stone-poster.webp"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={locale === "tr" ? "Hibrid 360 yaratıcı film döngüsü" : "Hibrid 360 creative film loop"}
          />
          <p className={creativeStyles.showreelLabel}>WE DON&rsquo;T REPLACE CREATIVITY. WE EXPAND IT.</p>
        </div>

        <div className={`${serviceStyles.body} ${creativeStyles.body}`}>
          {body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <ul className={`${serviceStyles.tagList} ${creativeStyles.tagList}`}>
          {SERVICES.map((service) => (
            <li
              key={service}
              className={`${serviceStyles.tag} ${creativeStyles.tag}`}
            >
              {service}
            </li>
          ))}
        </ul>

        <section className={`${serviceStyles.band} ${creativeStyles.band}`}>
          <p className={`${serviceStyles.bandText} ${creativeStyles.bandText}`}>
            WE DON&rsquo;T REPLACE CREATIVITY. WE EXPAND IT.
          </p>
        </section>

        <section className={creativeStyles.workPrompt}>
          <Image
            src="/images/site/services/creative.webp"
            alt={locale === "tr" ? "Yaratıcı fikirleri simgeleyen ampuller" : "Light bulbs representing creative ideas"}
            fill
            sizes="100vw"
            className={creativeStyles.workPromptImage}
          />
          <Link href="/work?service=Creative" className={creativeStyles.workPromptLink}>
            WANNA KNOW WHAT KEEPS US BUSY?
          </Link>
        </section>

        <section className={creativeStyles.closing}>
          <p className={creativeStyles.closingKicker}>READY TO CREATE WHAT&rsquo;S NEXT?</p>
          <h2>Hibrid 360 is building that future today.</h2>
          <p>Let&rsquo;s build the future of your brand together.</p>
          <Link href="/contact" className={creativeStyles.closingLink}>
            LET&rsquo;S BUILD SOMETHING EXTRAORDINARY.
          </Link>
        </section>
      </div>
    </div>
  );
}
