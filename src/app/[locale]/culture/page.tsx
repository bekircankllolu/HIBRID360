import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

// brief-rev12.md Bölüm 3.1 / nihai copy deck Bölüm 6 — CULTURE altı:
// Who We Are · What We Believe · Directors & Crew · Partners ·
// Sustainability. Beşi de artık gerçek sayfalar (task #20).
export const metadata = { title: "Culture" };

export default async function CulturePage({
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
          { name: "Culture", path: "/culture" },
        ])}
      />
      <h1 className={styles.title}>CULTURE</h1>
      <ul className={styles.subPages}>
        <li>
          <Link href="/culture/who-we-are">Who We Are</Link>
        </li>
        <li>
          <Link href="/culture/what-we-believe">What We Believe</Link>
        </li>
        <li>
          <Link href="/culture/directors">Directors &amp; Crew</Link>
        </li>
        <li>
          <Link href="/culture/partners">Partners</Link>
        </li>
        <li>
          <Link href="/culture/sustainability">Sustainability</Link>
        </li>
      </ul>
    </div>
  );
}
