"""Import the approved bilingual MONA FAQ documents into site data."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from docx import Document


QUESTION_RE = re.compile(r"^(\d{2})\s+(.+)$")


def clean(value: str) -> str:
    value = value.replace("\u00a0", " ").replace("\u2013", "-")
    value = re.sub(r"\s+", " ", value).strip()
    value = re.sub(r"\s+([?!.,;:])", r"\1", value)
    return value


def read_questions(path: Path) -> dict[int, tuple[str, str]]:
    paragraphs = [clean(p.text) for p in Document(path).paragraphs]
    result: dict[int, tuple[str, str]] = {}

    for index, paragraph in enumerate(paragraphs):
        match = QUESTION_RE.match(paragraph)
        if not match:
            continue

        number = int(match.group(1))
        if number < 1 or number > 28:
            continue

        answer = ""
        for candidate in paragraphs[index + 1 :]:
            if candidate:
                answer = re.sub(r"^Mona:\s*", "", candidate, flags=re.IGNORECASE)
                break

        if not answer:
            raise ValueError(f"Missing answer for question {number} in {path}")

        result[number] = (clean(match.group(2)), clean(answer))

    if sorted(result) != list(range(1, 29)):
        raise ValueError(f"Expected questions 1-28 in {path}; got {sorted(result)}")
    return result


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: import-mona-faq.py TR.docx EN.docx output.json")

    tr = read_questions(Path(sys.argv[1]))
    en = read_questions(Path(sys.argv[2]))
    output = [
        {
            "id": f"q{number}",
            "question": {"tr": tr[number][0], "en": en[number][0]},
            "text": {"tr": tr[number][1], "en": en[number][1]},
        }
        for number in range(1, 29)
    ]

    target = Path(sys.argv[3])
    target.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Imported {len(output)} bilingual MONA questions to {target}")


if __name__ == "__main__":
    main()
