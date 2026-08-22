import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

/**
 * brief-rev12.md Bölüm 3.1 — WHAT WE DO listesi: Creative · Production ·
 * Post Production · Digital · Live Broadcast · Cloud TV · Event Management ·
 * Photography · AI Creative Production · Service Production (International) ·
 * How We Work.
 *
 * Faz 3'te Service Production ve How We Work, Faz 4'te AI Creative
 * Production açıldı. Kalan maddeler mevcut siteden taşınacak.
 */
export const metadata = { title: "What We Do" };

const OPEN_PAGES = [
  { href: "/what-we-do/ai-creative-production", label: "AI Creative Production" },
  { href: "/what-we-do/service-production", label: "Service Production (International)" },
  { href: "/what-we-do/how-we-work", label: "How We Work" },
];

const PENDING_PAGES = [
  "Creative",
  "Production",
  "Post Production",
  "Digital",
  "Live Broadcast",
  "Cloud TV",
  "Event Management",
  "Photography",
];

export default async function WhatWeDoPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "What We Do", path: "/what-we-do" },
        ])}
      />
      <h1 className={styles.title}>WHAT WE DO</h1>
      <ul className={styles.subPages}>
        {PENDING_PAGES.map((label) => (
          // TODO: brief Bölüm 9-10 — bu sayfalar mevcut siteden taşınacak.
          <li key={label} className={styles.pending}>
            {label}
          </li>
        ))}
        {OPEN_PAGES.map((page) => (
          <li key={page.href}>
            <Link href={page.href}>{page.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
