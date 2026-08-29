import { getTranslations } from "next-intl/server";

import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

// brief-rev12.md Bölüm 3.1 / nihai copy deck Bölüm 6 — CULTURE altı.
//
// 29 Ağustos 2026 revizyonu: Who We Are · What We Believe · Partners üst
// menüye kendi canonical rotalarıyla çıktı (eski /culture/* yolları oraya
// kalıcı olarak yönlendiriliyor). CULTURE'ın kendisi de üst menüden çıktı
// ama rota **silinmedi**: Directors & Crew ve Sustainability'nin başka bir
// üst sayfası yok, ikisi de buradan ve footer'dan erişiliyor.
//
// Sunum: numaralı kart ızgarası. Kart etiketleri `culture.hub`
// sözlüğünden geliyor; her kart gittiği sayfanın kendi adını gösteriyor.
// TR karşılığı onaylı olmayan bölüm adı İngilizce kaldı — bkz.
// DECISIONS.md "TR çevirisi bekleyen metinler".
//
// Kartlara açıklama YAZILMADI — deck bu hub için tanım cümlesi vermedi ve
// uydurma metin commit edilmiyor.
export const metadata = { title: "Culture" };

const SECTIONS = [
  { href: "/culture/directors", key: "directors" },
  { href: "/culture/sustainability", key: "sustainability" },
] as const;

export default async function CulturePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "culture.hub" });

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
              <span className={styles.cardTitle}>{t(section.key)}</span>
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
