import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

/**
 * WWD-01/02 (nihai copy deck, Ağustos 2026) — What We Do hub sayfası.
 * Eski "Solutions" sayfasının yerini alıyor; dokuz hizmet WWD-02'deki
 * sıraya ve başlık+tek satır tanım biçimine birebir uyuyor.
 */

const HREFS: Record<string, string> = {
  Creative: "/what-we-do/creative",
  Production: "/what-we-do/production",
  "Post Production": "/what-we-do/post-production",
  Digital: "/what-we-do/digital",
  "Live Broadcast": "/what-we-do/live-broadcast",
  "Cloud TV": "/what-we-do/cloud-tv",
  "Event Management": "/what-we-do/event-management",
  Photography: "/what-we-do/photography",
  "AI Creative Production": "/what-we-do/ai-creative-production",
};

export const metadata: Metadata = { title: "What We Do" };

export default async function WhatWeDoPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("whatWeDo");
  const list = t.raw("list") as Array<{ title: string; body: string }>;

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
        ])}
      />
      <h1 className={styles.title}>{t("heroTitle")}</h1>
      <p className={styles.heroBody}>{t("heroBody")}</p>

      <ul className={styles.subPages}>
        {list.map((item) => (
          <li key={item.title}>
            <Link href={HREFS[item.title] ?? "/what-we-do"} className={styles.item}>
              <span className={styles.itemTitle}>{item.title}</span>
              <span className={styles.itemBody}>{item.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
