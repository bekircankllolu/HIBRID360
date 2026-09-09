import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { insightsPosts } from "@/data/insights";
import { getPublishedInsights } from "@/lib/content";
import { articleJsonLd, breadcrumbListJsonLd } from "@/lib/schema";
import { routing, type Locale } from "@/i18n/routing";
import { localizedAlternates } from "@/lib/site";
import {
  getInsightAuthor,
  getInsightCategory,
  getInsightParagraphs,
  getInsightSummary,
  getInsightTitle,
} from "@/lib/insights";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { InsightsPost } from "@/types/content";
import { getInsightVisual } from "@/data/insight-visuals";
import { EditorialImage } from "@/components/insights/EditorialImage";
import styles from "./page.module.css";

export function generateStaticParams() {
  return insightsPosts
    .filter((post) => post.is_published)
    .flatMap((post) => routing.locales.map((locale) => ({ locale, slug: post.slug })));
}

async function getPost(slug: string): Promise<InsightsPost | null> {
  const fromDb = await getPublishedInsights();
  return (
    fromDb.find((post) => post.slug === slug) ??
    insightsPosts.find((post) => post.slug === slug && post.is_published) ??
    null
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const title = getInsightTitle(post, locale);
  const description = getInsightSummary(post, locale) ?? undefined;

  return {
    title,
    description,
    alternates: localizedAlternates(locale, `/think-and-thank/${slug}`),
  };
}

export default async function ThinkAndThankPostPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "insights" });
  const post = await getPost(slug);
  if (!post) notFound();

  const title = getInsightTitle(post, locale);
  const summary = getInsightSummary(post, locale);
  const category = getInsightCategory(post, locale);
  const author = getInsightAuthor(post, locale);
  const paragraphs = getInsightParagraphs(post, locale);
  const visual = getInsightVisual(post, locale);

  return (
    <article className={styles.article} data-tone={visual.tone}>
      <JsonLd
        data={breadcrumbListJsonLd(locale, [
          { name: "Home", path: "" },
          { name: "Think & Thank", path: "/think-and-thank" },
          { name: title, path: `/think-and-thank/${slug}` },
        ])}
      />
      <JsonLd data={articleJsonLd(locale, post)} />
      <header className={styles.articleHeader}>
        <div className={styles.headerCopy}>
          <div className={styles.headerTopline}>
            <span lang="en">Hibrid 360 Mag</span>
            {category && <span className={styles.category}>{category}</span>}
          </div>
          <h1>{title}</h1>
          {summary && <p className={styles.summary}>{summary}</p>}
        </div>
        <div className={styles.headerVisual}>
          <EditorialImage
            src={visual.src}
            alt={visual.alt}
            sizes="(max-width: 760px) 100vw, 50vw"
            priority
          />
        </div>
      </header>
      <div className={styles.articleContent}>
        <aside className={styles.meta} aria-label={t("articleInfo")}>
          {author && <span>{author}</span>}
          {post.read_time_minutes && (
            <span>{t("readTime", { minutes: post.read_time_minutes })}</span>
          )}
          {post.published_at && (
            <time dateTime={post.published_at}>
              {new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
                new Date(post.published_at),
              )}
            </time>
          )}
        </aside>
        <div className={styles.body}>
          {paragraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph}`}>{paragraph}</p>
          ))}
          <Link href="/think-and-thank" className={styles.backLink}>
            <span aria-hidden="true">←</span> {t("backToIndex")}
          </Link>
        </div>
      </div>
    </article>
  );
}
