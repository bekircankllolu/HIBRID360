"""Metrik uyumlu yedek font değerlerini hesaplar.

    python scripts/font-fallback-metrics.py <font.ttf> [--base georgia|arial]

`src/styles/fonts.css` içindeki `@font-face` yedeklerinin üç değeri elle
hesaplanmıştı; bu script onu tekrarlanabilir kılar:

  ascent-override / descent-override : hhea tablosundan, unitsPerEm oranı
  size-adjust                        : web fontun ORTALAMA GENİŞLİĞİ bölü
                                       yedek sistem fontunun ortalama genişliği

Ortalama genişlik, Türkçe metinde gerçekten geçen harflerin sıklığına göre
AĞIRLIKLI ortalamadır — düz ortalama nadir glifleri (Q, X, W) fazla sayar ve
oranı bozar. Referans temeller `BASE_WIDTH` içinde: bunlar aynı yöntemle bir
kez ölçülüp sabitlendi, çünkü sistem fontları depoda yok.
"""

from __future__ import annotations

import sys
from pathlib import Path

from fontTools.ttLib import TTFont

# Türkçe + İngilizce karışık metinde harf sıklığı (yaklaşık, normalize edilir).
FREQ = {
    "a": 11.9, "e": 9.0, "i": 8.6, "n": 7.2, "r": 6.8, "l": 5.8, "ı": 5.1, "k": 4.7,
    "d": 4.7, "t": 3.3, "s": 3.0, "m": 3.0, "u": 3.2, "y": 3.4, "o": 2.6, "b": 2.8,
    "ü": 2.0, "ş": 1.8, "z": 1.5, "g": 1.3, "ç": 1.2, "h": 1.2, "ğ": 1.1, "v": 1.0,
    "c": 1.0, "p": 0.9, "ö": 0.8, "f": 0.5, "j": 0.1, " ": 14.0,
}


def average_width(font: TTFont) -> float:
    """Ağırlıklı ortalama ilerleme genişliği (em cinsinden)."""
    upem = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    metrics = font["hmtx"].metrics
    total = 0.0
    weight = 0.0
    for char, freq in FREQ.items():
        glyph = cmap.get(ord(char))
        if glyph is None or glyph not in metrics:
            continue
        total += metrics[glyph][0] / upem * freq
        weight += freq
    if not weight:
        raise SystemExit("Ölçülecek glif bulunamadı")
    return total / weight


# Aynı yöntemle ölçülmüş sistem font temelleri (fonts.css'teki değerlerle
# tutarlı: Georgia 0.44246, Arial 0.42... ).
BASE_WIDTH = {"georgia": 0.44246, "arial": 0.42}


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    path = Path(sys.argv[1])
    base = "georgia"
    if "--base" in sys.argv:
        base = sys.argv[sys.argv.index("--base") + 1]

    font = TTFont(path)
    upem = font["head"].unitsPerEm
    hhea = font["hhea"]
    width = average_width(font)

    print(f"{path.name}  (unitsPerEm {upem})")
    print(f"  ascent-override : {hhea.ascent / upem * 100:.1f}%")
    print(f"  descent-override: {abs(hhea.descent) / upem * 100:.1f}%")
    print(f"  line-gap-override: {hhea.lineGap / upem * 100:.1f}%")
    print(f"  ortalama genişlik: {width:.5f} em")
    print(f"  size-adjust ({base} temelli): {width / BASE_WIDTH[base] * 100:.2f}%")


if __name__ == "__main__":
    main()
