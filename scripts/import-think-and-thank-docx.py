"""Convert the paired Think & Thank DOCX files into local article JSON."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path

from docx import Document


ARTICLE_TITLE = re.compile(r"^\s*(\d+)\s*[-–—]\s*(.+?)\s*$")
READ_TIME = re.compile(r"(\d+)\s*(?:dk|min)\b", re.IGNORECASE)


def non_empty_paragraphs(path: Path) -> list[dict[str, str]]:
    document = Document(path)
    return [
        {"style": paragraph.style.name if paragraph.style else "", "text": paragraph.text.strip()}
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    ]


def parse_articles(path: Path) -> list[dict[str, object]]:
    paragraphs = non_empty_paragraphs(path)
    articles: list[dict[str, object]] = []

    for index, paragraph in enumerate(paragraphs):
        if not paragraph["style"].startswith("Heading 1"):
            continue

        match = ARTICLE_TITLE.match(paragraph["text"])
        if not match:
            continue

        if index == 0 or index + 5 >= len(paragraphs):
            raise ValueError(f"Incomplete article near {paragraph['text']!r}")

        read_time_match = READ_TIME.search(paragraphs[index + 2]["text"])
        if not read_time_match:
            raise ValueError(f"Missing read time near {paragraph['text']!r}")

        articles.append(
            {
                "number": int(match.group(1)),
                "category": paragraphs[index - 1]["text"],
                "title": match.group(2),
                "summary": paragraphs[index + 1]["text"],
                "read_time_minutes": int(read_time_match.group(1)),
                "author": paragraphs[index + 2]["text"].split("/")[-1].strip(),
                "body": "\n\n".join(
                    item["text"] for item in paragraphs[index + 3 : index + 6]
                ),
            }
        )

    if len(articles) != 19:
        raise ValueError(f"Expected 19 articles in {path}, found {len(articles)}")

    return articles


def slugify(value: str) -> str:
    ascii_value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")


def build_posts(tr_path: Path, en_path: Path) -> list[dict[str, object]]:
    tr_articles = parse_articles(tr_path)
    en_articles = parse_articles(en_path)
    posts: list[dict[str, object]] = []

    for tr_article, en_article in zip(tr_articles, en_articles, strict=True):
        if tr_article["number"] != en_article["number"]:
            raise ValueError("Turkish and English article order does not match")

        number = int(tr_article["number"])
        posts.append(
            {
                "id": f"mag-{number:02d}",
                "slug": slugify(str(en_article["title"])),
                "title_tr": tr_article["title"],
                "title_en": en_article["title"],
                "summary_tr": tr_article["summary"],
                "summary_en": en_article["summary"],
                "body_tr": tr_article["body"],
                "body_en": en_article["body"],
                "cover_image_url": None,
                "category": slugify(str(en_article["category"])),
                "category_tr": tr_article["category"],
                "category_en": en_article["category"],
                "read_time_minutes": tr_article["read_time_minutes"],
                "published_at": None,
                "last_reviewed_at": None,
                "author_name": None,
                "author_name_tr": tr_article["author"],
                "author_name_en": en_article["author"],
                "author_title": None,
                "is_published": True,
            }
        )

    return posts


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tr", type=Path, required=True)
    parser.add_argument("--en", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    posts = build_posts(args.tr, args.en)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        json.dumps(posts, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
