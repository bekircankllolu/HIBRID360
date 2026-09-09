import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { JsonLd } from "@/components/seo/JsonLd";
import { siteImages } from "@/data/site-images";
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
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Our Culture",
    description:
      locale === "en"
        ? "The ideas, people and values that define us."
        : "Bizi tanımlayan fikirler, insanlar ve değerler.",
  };
}

const SECTIONS = [
  { href: "/who-we-are", key: "whoWeAre" },
  { href: "/what-we-believe", key: "whatWeBelieve" },
  { href: "/think-and-thank", key: "thinkAndThank" },
  { href: "/culture/directors", key: "directors" },
  { href: "/culture/sustainability", key: "sustainability" },
] as const;

const STAND_FOR_COPY = {
  tr: {
    lead: [
      "Şundan eminiz: En iyi işleri mutlu insanlar üretir.",
      "Bu yüzden herkesin gelişebildiği, desteklendiğini hissettiği ve her gün en iyi hâlini ortaya koyabildiği bir kültür kurduk.",
    ],
    values: [
      {
        title: "BİRLİKTE DAHA İYİYİZ",
        body: "Harika hiçbir şey tek başına üretilmez. Egoları, politik çekişmeleri ve olumsuzluğu kapının dışında bırakıp uzmanlıklarımızı ve iş birliği enerjimizi yaptığımız her işe taşıdığımızda, birlikte her zaman daha iyi işler üretiriz.",
      },
      {
        title: "VAZGEÇMEDEN MERAK ET",
        body: "Merak kediyi öldürmedi. Ama mevcut düzenle yetinmek öldürür. Sorular sormayı, var olan çözümleri didik didik etmeyi ve yarının en öncü işlerini bugünden üretme yolunda beklenenle asla yetinmemeyi sürdüreceğiz.",
      },
      {
        title: "İŞİ BİTİR",
        body: "Bardak altlıkları kupalar içindir. Biz ancak ürettiğimiz iş ve müşterilerimize teslim ettiğimiz sonuçlar kadar iyiyiz. Yarını beklemeyiz. Sorumluluk alır, çok çalışır ve işleri bugün ileri taşırız.",
      },
    ],
  },
  en: {
    lead: [
      "We know one thing for sure: happy people create the best work.",
      "That’s why we’ve built a culture where everyone can thrive, feel supported, and bring their A-game every day.",
    ],
    values: [
      {
        title: "BETTER TOGETHER",
        body: "Nothing great is made alone. By leaving egos, politics and negativity at the door and bringing our specialisms and collaborative energy to everything we do, we’ll always make better work together.",
      },
      {
        title: "RELENTLESSLY CURIOUS",
        body: "Curiosity didn’t kill the cat. But sticking to the status quo will. We’ll always ask questions, kick the tyres of existing solutions, and never settle for the expected in the pursuit of tomorrow’s most pioneering work, today.",
      },
      {
        title: "GET SH*T DONE",
        body: "Coasters are for mugs. We are only as good as the work we do and the results we deliver for our clients. We don’t wait for tomorrow. We take ownership, work hard and drive things forward, today.",
      },
    ],
  },
} satisfies Record<
  Locale,
  {
    lead: readonly [string, string];
    values: readonly { title: string; body: string }[];
  }
>;

export default async function CulturePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "culture.hub" });
  const standFor = STAND_FOR_COPY[locale];

  return (
    <div className={styles.page}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Culture", path: "/culture" },
        ])}
      />
      <div className={styles.hub}>
        <h1 className={styles.title}>CULTURE</h1>
        <p className={styles.lead}>
          {locale === "tr"
            ? "Bizi tanımlayan fikirler, insanlar ve değerler."
            : "The ideas, people and values that shape who we are."}
        </p>

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

      <section className={styles.standFor} aria-labelledby="stand-for-title">
        <div className={styles.standForIntro}>
          <span className={styles.standForMarker} aria-hidden="true" />
          <p className={styles.standForEyebrow} lang="en">Hibrid 360 / Culture</p>
          <h2 id="stand-for-title" className={styles.standForTitle}>
            WHAT WE
            <br />
            STAND FOR
          </h2>
          <p className={styles.standForLead}>
            <strong>{standFor.lead[0]}</strong>
            <span>{standFor.lead[1]}</span>
          </p>
        </div>

        <figure className={styles.standForImage}>
          <Image
            src={siteImages.culture.standFor.src}
            alt={siteImages.culture.standFor.alt[locale]}
            fill
            sizes="100vw"
          />
        </figure>

        <ol className={styles.values}>
          {standFor.values.map((value, index) => (
            <li key={value.title} className={styles.value}>
              <span className={styles.valueNumber} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.valueTitle}>{value.title}</h3>
              <p className={styles.valueBody}>{value.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
