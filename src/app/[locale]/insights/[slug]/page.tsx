import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/lib/schema";
import { insightsPosts } from "@/data/insights";
import { routing, type Locale } from "@/i18n/routing";
import styles from "./page.module.css";

// Faz 1 — vaka/yazı detay şablonu. src/data/insights.ts içindeki hiçbir
// kayıt henüz is_published=true değil (gövde metni hazır değil), bu yüzden
// generateStaticParams şu an boş döner. Faz 2+'de Supabase'e bağlanınca ve
// ilk yazılar yayınlanınca bu sayfa otomatik üretilmeye başlar.
export function generateStaticParams() {
  return insightsPosts
    .filter((post) => post.is_published)
    .flatMap((post) => routing.locales.map((locale) => ({ locale, slug: post.slug })));
}

function getPost(slug: string) {
  return insightsPosts.find((post) => post.slug === slug && post.is_published);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const title = locale === "tr" ? post.title_tr : post.title_en;
  const description = (locale === "tr" ? post.summary_tr : post.summary_en) ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: `/${locale}/insights/${slug}` },
  };
}

export default async function InsightsPostPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const title = locale === "tr" ? post.title_tr : post.title_en;
  const body = locale === "tr" ? post.body_tr : post.body_en;

  return (
    <article className={styles.article}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Insights", path: "/insights" },
          { name: title, path: `/insights/${slug}` },
        ])}
      />
      <h1>{title}</h1>
      {/* TODO: brief-rev12.md Bölüm 20.6 — gövde metni "her yazıda
          bulunması zorunlu dört şey" kuralına göre yazılınca body_tr/
          body_en alanları dolduracak; burada zengin metin/Markdown
          render edilecek. */}
      {body && <div className={styles.body}>{body}</div>}
    </article>
  );
}
