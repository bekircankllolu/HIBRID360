"""Marka fontlarının Latin+Türkçe alt kümelerini üretir.

    python scripts/generate-fonts.py

Kaynak TTF'ler google/fonts deposundan indirilir, `varLib.instancer` ile
eksen aralıkları daraltılır, `subset` ile Latin + Türkçe gliflere kesilir ve
`public/fonts/` altına woff2 olarak yazılır. Lisans metinleri (OFL 1.1)
fontların yanına kopyalanır.

Bu, `src/styles/fonts.css` başındaki elle çalıştırılan pyftsubset komutunun
tekrarlanabilir hâli — Montserrat/Inter için uygulanan yöntemin aynısı.

Neden alt küme: Google'ın hazır alt kümelerinde Türkçe için gereken beş glif
(ğ Ğ İ ş Ş) yalnız "latin-ext" dosyasında ve o dosya beş glif için 733 glif
birden indiriyor. Kendi alt kümemiz yalnız gerçekten kullanılan aralığı taşır.
"""

from __future__ import annotations

import io
import shutil
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "fonts"
GF = "https://raw.githubusercontent.com/google/fonts/main/ofl"

# src/styles/fonts.css'teki üretim komutuyla aynı aralık:
# Latin temel + noktalama + Türkçe (ğ Ğ İ ı ş Ş) + para/ok işaretleri.
#
# Tek fark U+FEFF (BOM / sıfır genişlikli boşluk): Archivo'da bu glif cmap'te
# var ama gvar'da varyasyon verisi yok, subset o yüzden KeyError veriyor.
# Görünmeyen bir kontrol karakteri, hiçbir metni etkilemiyor — çıkarıldı.
UNICODES = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,"
    "U+2212,U+2215,U+FFFD,U+011E-011F,U+0130,U+015E-015F"
)
LAYOUT_FEATURES = ["kern", "liga", "calt"]

# Türkçe için varlığı zorunlu glifler — subset sonrası doğrulanır.
TURKISH = {0x011E: "Ğ", 0x011F: "ğ", 0x0130: "İ", 0x0131: "ı", 0x015E: "Ş", 0x015F: "ş"}


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "hibrid360-fontbuild"})
    with urllib.request.urlopen(request, timeout=120) as response:
        return response.read()


def repair_gvar(font: TTFont) -> None:
    """Varyasyon verisi olmayan glifler için boş kayıt ekler.

    Archivo'nun `gvar` tablosu kontrol karakterleri (CR, NULL) ve BOM gibi
    çizimi olmayan glifleri taşımıyor, ama `cmap` onları listeliyor. fontTools
    subset ederken her glif için gvar kaydı arıyor ve KeyError veriyor.
    Boş liste eklemek doğru karşılık: bu glifler zaten hiç çizilmiyor, yani
    varyasyonları da yok.
    """
    if "gvar" not in font:
        return
    gvar = font["gvar"]
    missing = [name for name in font.getGlyphOrder() if name not in gvar.variations]
    for name in missing:
        gvar.variations[name] = []
    if missing:
        print(f"  gvar onarıldı: {len(missing)} glif için boş varyasyon")


def build(font: TTFont, destination: Path) -> None:
    """Alt kümeye indir, woff2 olarak yaz, Türkçe glifleri doğrula."""
    repair_gvar(font)
    options = subset.Options()
    options.layout_features = LAYOUT_FEATURES
    options.name_IDs = ["*"]
    options.flavor = "woff2"
    # Variable font ekseni korunur: instancer ile daraltılan aralık kalır.
    options.retain_gids = False

    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=subset.parse_unicodes(UNICODES))
    subsetter.subset(font)

    cmap = font.getBestCmap()
    missing = [char for code, char in TURKISH.items() if code not in cmap]
    if missing:
        raise SystemExit(f"{destination.name}: Türkçe glif eksik -> {' '.join(missing)}")

    font.flavor = "woff2"
    destination.parent.mkdir(parents=True, exist_ok=True)
    font.save(destination)
    print(f"  {destination.name}: {destination.stat().st_size / 1024:.1f} KB, {len(cmap)} glif")



def build_logo_font() -> None:
    """Montserrat — yalnız logotype ("Hibrid 360" yazımı) için.

    17 Eylül 2026 tipografi yenilemesinde --font-brand Archivo'ya geçti ve
    Montserrat tamamen kaldırılmıştı. Kullanıcı geri bildirdi: gerçek logo
    render'ları (Header nav, Header mega menü, Footer, MeetTheCrewReveal
    arka plan wordmark'ı, LanguageSwitcher eyebrow — hepsi literal
    "Hibrid 360" metni) eskisi gibi kalmalı, fontu güncellenmemeli.

    Beş kullanım da tek ağırlıkta (800, var(--font-weight-brand)) ve
    değişken genişlik/ağırlık aralığına ihtiyaç yok — bu yüzden TEK
    STATİK ağırlığa (800) sabitlenip alt kümeleniyor. Eskiden 300-800
    değişken aralığı 32.3 KB tutuyordu (o aralık hero SolarSystem ve
    Digital sayfasının ince ağırlık ihtiyacı içindi, ki onlar artık
    Archivo kullanıyor). Tek ağırlık çok daha küçük.
    """
    print("Montserrat — yalnız logotype (statik 800)")
    # google/fonts'ta roman ve italik ayrı dosyalar (ital,wght birleşik
    # eksenli tek dosya yok); logo hiçbir yerde italik kullanmıyor, yalnız
    # roman dosyası çekilip 800'e sabitlenir.
    montserrat = TTFont(io.BytesIO(fetch(f"{GF}/montserrat/Montserrat%5Bwght%5D.ttf")))
    montserrat = instancer.instantiateVariableFont(
        montserrat, {"wght": 800}, updateFontNames=False
    )
    build(montserrat, OUT / "montserrat-logo-800-latin-tr.woff2")

    target = OUT / "OFL-Montserrat.txt"
    target.write_bytes(fetch(f"{GF}/montserrat/OFL.txt"))
    print(f"  {target.name}")


def build_syne(source: TTFont | None = None) -> None:
    """Syne — ana sayfa "az laf, çok iş" poster tipografisi (25 Eylül 2026).

    Değişken ağırlık (400-800) KORUNUR: bölümün hareketi ağırlık ekseninin
    kendisi ("az laf" incelir, "çok iş" kalınlaşır). Kullanıcının teslim
    ettiği TTF verilirse (`source`) indirme atlanır.
    """
    print("Syne — poster (wght 400-800 değişken)")
    font = source or TTFont(io.BytesIO(fetch(f"{GF}/syne/Syne%5Bwght%5D.ttf")))
    build(font, OUT / "syne-latin-tr.woff2")

    target = OUT / "OFL-Syne.txt"
    if not target.exists():
        target.write_bytes(fetch(f"{GF}/syne/OFL.txt"))
    print(f"  {target.name}")


def main() -> None:
    print("Archivo — display + başlık (wght 300-800, wdth 112 sabit)")
    archivo = TTFont(io.BytesIO(fetch(f"{GF}/archivo/Archivo%5Bwdth%2Cwght%5D.ttf")))
    # Ağırlık ekseni değişken kalır; genişlik 112'de SABİTLENİR.
    #
    # Genişlik ekseni tek başına 21.4 KB tutuyor (48.3 -> 26.9 KB ölçüldü) ve
    # tasarımın onu değiştirmeye ihtiyacı yok: tek bir genişlik seçilip her
    # yerde kullanılıyor. 112 bilinçli bir orta nokta — Montserrat'ın dar
    # geometrisinden belirgin biçimde ayrılacak kadar geniş, ama 125'e
    # çıkmıyor: Türkçe başlıklar ("Sürdürülebilirlik", "Prodüksiyon")
    # İngilizce karşılıklarından uzun ve tam genişlikte kötü kırılıyor.
    #
    # Ağırlık tabanı 300: kod tabanında iki yer `font-weight: 300` istiyor
    # (hero SolarSystem `.titleLead` ve Digital `.weightLight`). 500'de
    # başlasaydı ikisi de sessizce kalınlaşırdı. 300'e inmek yalnız 1.2 KB
    # tutuyor (26.9 -> 28.1 KB ölçüldü) — sessiz bozulmadan ucuz.
    archivo = instancer.instantiateVariableFont(
        archivo, {"wght": (300, 600, 800), "wdth": 112}, updateFontNames=False
    )
    build(archivo, OUT / "archivo-latin-tr.woff2")

    build_logo_font()
    build_syne()

    # Editoryal serif: 18 Eylül 2026'da Instrument Serif'ten Newsreader'a
    # geçildi (kullanıcı: "serifli fontları daha okunaklı şık serifli fontla
    # değiştir"). Instrument Serif dar ve ince; alıntı puntolarında (20-48px)
    # okunabilirliği düşüktü — numune: ölçülen ortalama genişlik 0.344 em,
    # Newsreader 0.405 em, harfler belirgin biçimde daha açık.
    #
    # İki eksen de SABİTLENİR. wght 400: beş kullanımın hepsi 400. opsz 24:
    # optik boyut eksenini değişken bırakmak ölçüldü — 20.3 KB yerine 53.9 KB,
    # yani yalnız birkaç alıntı için +34 KB. Kullanılan punto aralığı 20-48px
    # (≈15-36pt) ve 24 bu aralığın ortası; kazanç bütçeye değmiyor
    # (CLAUDE.md performans bütçesi).
    print("Newsreader — editoryal serif (wght 400, opsz 24 sabit)")
    serif = TTFont(io.BytesIO(fetch(f"{GF}/newsreader/Newsreader%5Bopsz%2Cwght%5D.ttf")))
    serif = instancer.instantiateVariableFont(
        serif, {"wght": 400, "opsz": 24}, updateFontNames=False
    )
    build(serif, OUT / "newsreader-latin-tr.woff2")

    print("Lisanslar (OFL 1.1)")
    for family, name in (("archivo", "Archivo"), ("newsreader", "Newsreader")):
        target = OUT / f"OFL-{name}.txt"
        target.write_bytes(fetch(f"{GF}/{family}/OFL.txt"))
        print(f"  {target.name}")

    total = sum(path.stat().st_size for path in OUT.glob("*.woff2"))
    print(f"\npublic/fonts toplam woff2: {total / 1024:.1f} KB")
    for path in sorted(OUT.glob("*.woff2")):
        print(f"  {path.stat().st_size / 1024:7.1f} KB  {path.name}")


if __name__ == "__main__":
    main()
