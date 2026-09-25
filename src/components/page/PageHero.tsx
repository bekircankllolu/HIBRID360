import { Fragment, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { TitleLang } from "@/lib/page-title";
import styles from "./PageHero.module.css";

/**
 * Sayfa başlık bandı — Faz 2 tasarım dili. Gramer hizmet sayfası hero'sundan
 * (`ChapterHero`): meta satırı (kırıntı solda, `meta` sağda, altında ince
 * çizgi) → boşluk → başlık → lede. Derece/kadran YOK; o yalnız hizmet
 * sayfalarının koordinat dili.
 *
 * Başlık yuvası çağıranın: `title={<PageTitle … />}`. Hero en fazla dört metin
 * taşır: kırıntı, meta, h1, lede (tek cümle).
 *
 * Kırıntı bir `<p>` içinde bağlantı + metin; liste (`ol/li`) BİLEREK değil:
 * e2e sözleşmeleri sayfadaki `main li` sayısını sayıyor (`/solutions` = 15).
 * Ayraç `/` ekran okuyucudan gizli.
 */

/**
 * Marka adı kırıntısı her zaman `lang="en"` basılır: `html lang="tr"` altında
 * büyük harf dönüşümü "Hibrid 360"ı "HİBRİD 360"a çevirir (CLAUDE.md: tek marka
 * yazımı). Çağıranın `lang` vermesini beklemeden burada garanti edilir.
 */
const BRAND_CRUMB = "hibrid 360";

function crumbLang(crumb: PageHeroCrumb): TitleLang | undefined {
  if (crumb.lang) return crumb.lang;
  return crumb.label.trim().toLowerCase() === BRAND_CRUMB ? "en" : undefined;
}

/** Kırıntı: `href` varsa dahili bağlantı, yoksa düz metin (bulunulan sayfa). */
export interface PageHeroCrumb {
  label: string;
  /** Dahili yol; locale önekini `Link` ekler. */
  href?: string;
  /**
   * Etiket sayfa dilinden farklıysa (TR sayfada İngilizce hizmet adı): "en".
   * Büyük harf dönüşümü de buna bağlı — "tr"de "Directors" → "DİRECTORS".
   */
  lang?: TitleLang;
}

/** band: doğal yükseklik; screen: ≥900 px'te ekran boyu, başlık alta oturur. */
export type PageHeroSize = "band" | "screen";

export interface PageHeroProps {
  crumbs?: readonly PageHeroCrumb[];
  /** Meta satırının sağ ucu (ör. sayı, tarih). */
  meta?: ReactNode;
  /** Başlık yuvası: `<PageTitle … />`. */
  title: ReactNode;
  /** TEK cümle. */
  lede?: string;
  /**
   * Lede sayfa dilinden farklıysa ("en"): ekran okuyucu yanlış telaffuz etmesin
   * (WCAG 3.1.2). Örn. Service Production'ın İngilizce lede'i TR sayfada.
   */
  ledeLang?: TitleLang;
  size?: PageHeroSize;
  /** Lede'nin altına akan ek içerik (ör. buton). */
  children?: ReactNode;
}

export function PageHero({
  crumbs = [],
  meta,
  title,
  lede,
  ledeLang,
  size = "band",
  children,
}: PageHeroProps) {
  const hasCrumbs = crumbs.length > 0;

  return (
    <header className={styles.hero} data-size={size}>
      {hasCrumbs || meta ? (
        <div className={styles.meta}>
          {hasCrumbs ? <Crumbs crumbs={crumbs} /> : null}
          {meta ? <div className={styles.aside}>{meta}</div> : null}
        </div>
      ) : null}

      <div className={styles.title}>{title}</div>

      {lede ? (
        <p className={styles.lede} lang={ledeLang}>
          {lede}
        </p>
      ) : null}

      {children}
    </header>
  );
}

/**
 * Ayraçların iki yanındaki boşluklar flex düzeninde çizilmez (boşluk-yalnız
 * metin düğümü flex öğesi olmaz), ama `textContent`'i "A / B" yapar: okuyucu
 * kipi, arama önizlemesi ve kopyala-yapıştır kelimeleri yapışık görmez.
 */
function Crumbs({ crumbs }: { crumbs: readonly PageHeroCrumb[] }) {
  return (
    <p className={styles.crumbs}>
      {crumbs.map((crumb, index) => (
        <Fragment key={`${index}:${crumb.label}`}>
          {index > 0 ? (
            <>
              {" "}
              <span className={styles.slash} aria-hidden="true">
                /
              </span>{" "}
            </>
          ) : null}
          {crumb.href ? (
            <Link href={crumb.href} lang={crumbLang(crumb)} className={styles.crumbLink}>
              {crumb.label}
            </Link>
          ) : (
            <span lang={crumbLang(crumb)}>{crumb.label}</span>
          )}
        </Fragment>
      ))}
    </p>
  );
}
