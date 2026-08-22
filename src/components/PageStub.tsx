import type { Locale } from "@/i18n/routing";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import styles from "./PageStub.module.css";

/**
 * Faz 0 routing iskeleti — gerçek sayfa içeriği ilgili fazda eklenecek.
 * Görünür sahte/placeholder metin yazılmaz; yalnızca başlık render edilir.
 * `locale` + `path` verildiğinde BreadcrumbList JSON-LD de üretilir
 * (brief-rev12.md Bölüm 1.7 — GEO/AI görünürlüğü).
 */
export function PageStub({
  title,
  locale,
  path,
}: {
  title: string;
  locale?: Locale;
  path?: string;
}) {
  return (
    <div className={styles.stub}>
      {locale && path && (
        <JsonLd
          data={breadcrumbListJsonLd(locale, [
            { name: "Home", path: "" },
            { name: title, path },
          ])}
        />
      )}
      <h1>{title}</h1>
    </div>
  );
}
