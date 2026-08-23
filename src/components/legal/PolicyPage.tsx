import type { LegalDoc } from "@/types/legal";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import type { Locale } from "@/i18n/routing";
import styles from "./PolicyPage.module.css";

/**
 * Kurumsal politika/yasal sayfaların ortak render motoru — brief 14, 18.9.
 * İçerik src/data/policies/*.ts içinde, müşterinin teslim ettiği kurumsal
 * politika paketinden birebir aktarılmıştır.
 */
export function PolicyPage({
  doc,
  locale,
  breadcrumb,
}: {
  doc: LegalDoc;
  locale: Locale;
  breadcrumb: Array<{ name: string; path: string }>;
}) {
  return (
    <div className={styles.page}>
      <JsonLd data={breadcrumbListJsonLd(locale, breadcrumb)} />
      <h1 className={styles.title}>{doc.title}</h1>
      {doc.subtitle && <p className={styles.subtitle}>{doc.subtitle}</p>}
      {doc.lastUpdated && <p className={styles.lastUpdated}>{doc.lastUpdated}</p>}

      {doc.blocks.map((block, index) => {
        switch (block.kind) {
          case "heading":
            return (
              <h2 key={index} className={styles.heading}>
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={index} className={styles.paragraph}>
                {block.text}
              </p>
            );
          case "list":
            return (
              <ul key={index} className={styles.list}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "callout":
            return (
              <p key={index} className={styles.callout}>
                {block.text}
              </p>
            );
          case "table":
            return (
              <div key={index} className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {block.headers.map((header) => (
                        <th key={header} scope="col">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
