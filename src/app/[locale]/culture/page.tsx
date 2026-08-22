import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

// brief-rev12.md Bölüm 3.1 — CULTURE altı: Who We Are · What We Believe ·
// Directors & Crew · Partners · Sustainability.
// Faz 2'de yalnızca Directors & Crew sayfası açıldı; diğerleri kendi
// fazlarında (Who We Are/What We Believe/Partners → içerik taşıma,
// Sustainability → Faz 6) eklenecek ve buradaki listeye link olarak girecek.
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
          <Link href="/culture/directors">Directors &amp; Crew</Link>
        </li>
        {/* TODO: brief Bölüm 6 — Who We Are, What We Believe, Partners
            sayfaları mevcut siteden taşınacak; Sustainability Faz 6'da
            (ölçüm + sertifika olmadan yayınlanamaz). */}
        <li className={styles.pending}>Who We Are</li>
        <li className={styles.pending}>What We Believe</li>
        <li className={styles.pending}>Partners</li>
        <li className={styles.pending}>Sustainability</li>
      </ul>
    </div>
  );
}
