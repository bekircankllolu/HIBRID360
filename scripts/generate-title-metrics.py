"""Başlık ölçü tablosunu üretir: Space Grotesk 700 harf ilerlemeleri (em).

    python scripts/generate-title-metrics.py

Çıktı: `src/lib/title-metrics.ts` — ÜRETİLMİŞ dosya, elle düzenlenmez,
commit'lenir.

Neden: PageTitle başlığı `font-size: min(kademe, calc(100cqw / fit))` ile
kabına sığdırıyor; `fit` = başlığın en uzun kelimesinin em genişliği × 1.03
(`src/lib/page-title.ts`). Bu genişlik tarayıcıda ölçülmüyor — PageTitle
sunucu bileşeni, istemcide ölçmek de ilk çizimde yazının zıplaması demek.
Font dosyası sabit olduğu için harf başına ilerleme bir kez buradan çıkarılır.

Değer = advanceWidth / unitsPerEm, 4 ondalık. Kerning YOK, bilinçli: bu
fontta kerning çiftleri neredeyse hep daraltıyor, ham toplam tarayıcı
ölçümünden en çok ~%1,2 geniş çıkıyor (SUSTAINABILITY 7,620 / 7,534 em).
Genişleten yalnız üç çift var ("/V", "/T" +0,020 em; "()" +0,016 em); kalan
payı 1.03 katsayısı taşır. `src/lib/page-title.test.ts` tabloyu tarayıcıda
ölçülmüş genişliklerle karşılaştırır.

Font yeniden üretilirse (alt küme, ağırlık) bu betik yeniden çalıştırılır.
"""

from __future__ import annotations

import json
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "public" / "fonts" / "space-grotesk-700-latin-tr.woff2"
OUT = ROOT / "src" / "lib" / "title-metrics.ts"
WEIGHT = 700

# Tablodaki karakterler, çıktıdaki sırasıyla. Ölçüm hep BÜYÜK HARFE
# çevrilmiş dizgeyle yapılır (CSS `text-transform: uppercase`); küçük harfler
# kaynak metin karışık harfli olabildiği için yine de tabloda.
#
# Şapkalı harfler (Â Î Û) Türkçe metinde geçiyor: "SORUMLU YAPAY ZEKÂ
# POLİTİKASI" gerçek bir H1. Bölünmez boşluk (U+00A0) çeviri dosyalarında
# birlikte kalması gereken ifadeleri bağlıyor (bkz. src/lib/split-words.ts).
GROUPS: tuple[tuple[str, str], ...] = (
    ("Büyük harfler", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
    ("Türkçe büyük harfler ve şapkalılar", "ÇĞİÖŞÜÂÎÛ"),
    ("Küçük harfler (karışık kalıp; ölçüm yine büyük harfle)", "abcdefghijklmnopqrstuvwxyz"),
    ("Türkçe küçük harfler ve şapkalılar", "çğıöşüâîû"),
    ("Rakamlar", "0123456789"),
    ("Boşluk ve bölünmez boşluk", "  "),
    ("Noktalama ve işaretler", ".,!?:;&'’“”\"-–—/()+#@"),
)

HEADER = """\
/**
 * Space Grotesk 700 harf ilerlemeleri (em) — PageTitle ölçü tablosu.
 *
 * ÜRETİLDİ, ELLE DÜZENLEME. Yeniden üretmek için:
 *   python scripts/generate-title-metrics.py
 *
 * Kaynak: public/fonts/space-grotesk-700-latin-tr.woff2 (unitsPerEm {upem}).
 * Değer = advanceWidth / unitsPerEm, 4 ondalık. Kerning yok: payı
 * `titleFit`'teki 1.03 katsayısı taşır (bkz. src/lib/page-title.ts).
 */
"""


def load_font() -> TTFont:
    """Fontu açar; ölçünün yanlış ağırlıktan gelmesini engeller."""
    try:
        font = TTFont(FONT)
    except ImportError as error:  # woff2 açmak brotli ister
        raise SystemExit("woff2 okumak için brotli gerekli: pip install brotli") from error
    # Değişken fontta hmtx VARSAYILAN örneğin (Light) genişliklerini verir;
    # 700 genişliği ancak örneklenmiş (statik) dosyadan okunabilir.
    if "fvar" in font:
        raise SystemExit(f"{FONT.name}: değişken font, önce {WEIGHT}'e sabitlenmeli")
    weight = font["OS/2"].usWeightClass
    if weight != WEIGHT:
        raise SystemExit(f"{FONT.name}: ağırlık {weight}, beklenen {WEIGHT}")
    return font


def ts_key(char: str) -> str:
    """TS nesne anahtarı; görünmez karakter (NBSP) kaçış dizisiyle yazılır."""
    return json.dumps(char, ensure_ascii=not char.isprintable())


def render(font: TTFont) -> str:
    """Tabloyu TypeScript kaynağı olarak döndürür."""
    upem = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    metrics = font["hmtx"].metrics

    wanted = "".join(chars for _, chars in GROUPS)
    missing = [char for char in wanted if ord(char) not in cmap]
    if missing:
        raise SystemExit(f"{FONT.name}: glif eksik -> {' '.join(missing)}")
    if len(set(wanted)) != len(wanted):
        raise SystemExit("GROUPS içinde aynı karakter iki kez var")

    def advance(char: str) -> str:
        return repr(round(metrics[cmap[ord(char)]][0] / upem, 4))

    lines = [HEADER.format(upem=upem)]
    lines.append("export const TITLE_ADVANCES: Readonly<Record<string, number>> = Object.freeze({")
    for label, chars in GROUPS:
        lines.append(f"  // {label}")
        lines.extend(f"  {ts_key(char)}: {advance(char)}," for char in chars)
    lines.append("});")
    lines.append("")
    lines.append("/** Kelime arası boşluğun genişliği (em). */")
    lines.append(f"export const TITLE_SPACE_ADVANCE = {advance(' ')};")
    return "\n".join(lines) + "\n"


def main() -> None:
    font = load_font()
    source = render(font)
    # newline="\n": Windows'ta da LF yazılsın, yeniden üretim git'te fark çıkarmasın.
    OUT.write_text(source, encoding="utf-8", newline="\n")
    count = sum(len(chars) for _, chars in GROUPS)
    print(f"{OUT.relative_to(ROOT).as_posix()}: {count} karakter, unitsPerEm {font['head'].unitsPerEm}")


if __name__ == "__main__":
    main()
