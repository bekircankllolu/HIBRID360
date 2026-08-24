import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

// brief-rev12.md Bölüm 3.1 / nihai copy deck Bölüm 6 — CULTURE altı:
// Who We Are · What We Believe · Directors & Crew · Partners ·
// Sustainability. Beşi de artık gerçek sayfalar (task #20).
//
// Sunum: beş düz bağlantı yerine numaralı kart ızgarası. Bölüm adları
// marka dili olduğu için iki dilde de İngilizce kalıyor (CLAUDE.md i18n
// kuralı); kartlara açıklama YAZILMADI — deck bu hub için tanım cümlesi
// vermedi ve uydurma metin commit edilmiyor. TODO: deck'ten beş bölümün
// birer satırlık tanımı gelirse .cardText olarak eklenecek.
export const metadata = { title: "Culture" };

const SECTIONS = [
  { href: "/culture/who-we-are", label: "Who We Are" },
  { href: "/culture/what-we-believe", label: "What We Believe" },
  { href: "/culture/directors", label: "Directors & Crew" },
  { href: "/culture/partners", label: "Partners" },
  { href: "/culture/sustainability", label: "Sustainability" },
] as const;

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

      <ul className={styles.grid}>
        {SECTIONS.map((section, index) => (
          <li key={section.href} className={styles.card}>
            <Link href={section.href} className={styles.cardLink}>
              <span className={styles.index} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.cardTitle}>{section.label}</span>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
