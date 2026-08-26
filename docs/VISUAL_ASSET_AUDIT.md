# Visual Asset Audit — 2026-08-25

> **Güncel tur:** Bu doküman 25 Ağustos turunun kaydıdır ve arşiv olarak
> korunuyor. Sonraki tur ölçümlü ekran görüntüleriyle yapıldı ve bulguların
> bir kısmını doğruladı, bir kısmını kapattı:
> **`docs/visual-audit/VISUAL_QA_2026-08-26.md`**.
> Aşağıdaki maddelerden `3840w` transfer uyarısı ve mobil çerez bandı
> maddesi o turda ölçülerek **kapatıldı**; Creative/Photography/MONA
> görselleri ve sarı vurgu maddeleri **hâlâ açık**.

Amaç: eski `hibrid360.com` görsel hafızasını, yeni Next.js sitedeki görsel
yerleşimlerle karşılaştırmak. Bu doküman uygulama talimatı değil; Claude ve
Codex'in paralel çalışmasında çakışmayı azaltacak karar kaydıdır.

## Kısa karar

Yeni site teknik olarak daha temiz ve hızlı; eski site ise daha güçlü görsel
hafıza noktalarına sahip. Sonraki turda yeni sitenin semantik/performans
omurgası korunmalı, eski sitenin sinematik sahne gücü seçilmiş bölümlere geri
taşınmalıdır.

## Eski site -> yeni site eşleşmesi

| Eski site alanı | Yeni sitedeki durum | Karar |
|---|---|---|
| Ay + bisiklet hero videosu | Yeni ilk ekranda büyük fuşya HIBRID wordmark var; bisiklet hissi closing band'e taşınmış | Yeni hero marka için doğru, fakat eski sitenin sinematik hafızası ilk ekrandan kayboluyor |
| `MAKE YOUR BRAND "THE" BRAND` kamera sahnesi | `MakeBrandBand` içinde doğru görselle kullanılıyor | Doğru yerde; sarı tipografik vurgu eski siteye göre zayıf |
| Sarı `Solutions` kristal dünyası | What We Do hub görsel kart grid'ine dönmüş | İşlevsel ama art direction gücü azalmış; kristal/service system fikri geri getirilmeli |
| `Less Talk, More Work` / work çağrısı | Work sayfasında clapper poster kullanılıyor | Ton doğru, fakat gerçek iş envanteri gelene kadar fake portfolio algısı yaratmamalı |
| Production / live / post görselleri | Servis hub ve detay sayfalarında kullanılıyor | Genel olarak doğru eşleşme |
| Contact | Yeni contact çoğunlukla tipografik ve form odaklı | Temiz; ileride gerçek ofis/stüdyo görseliyle ısıtılabilir |

## Görsel kalite notları

- Hero HIBRID wordmark etkisi brief ile uyumlu; animasyon alanı ayrıca
  korunacak, bu dokümanda kapsam dışı.
- Creative kartındaki lightbulb/design-thinking görseli fazla jenerik. Gerçek
  stüdyo, strateji masası veya üretim süreci görseli bulunursa değiştirilmeli.
- Digital görseli enerjik ve anlaşılır, ancak premium studio tonundan biraz
  sosyal medya stok hissine kayıyor.
- Photography görseli beauty/makeup olarak dar okunabilir. Ürün/yemek/portre
  çeşitliliğini anlatan daha geniş bir görsel tercih edilmeli.
- MONA bölümü renk ayrımı açısından brief'e uygun, fakat mevcut bilgisayar
  placeholder'ı prodüksiyon kalitesini aşağı çekiyor. Gerçek MONA görsel/video
  asset'i gelene kadar daha kontrollü bir "content pending" sunumu gerekir.

## Performans notları

- Eski sitede desktop açılışında ağır video ve büyük CSS yükü var. Yeni site
  Next image pipeline ile belirgin şekilde daha hafif.
- Yeni sitede yatay mobil overflow görülmedi.
- Büyük full-bleed görsellerde `sizes` değerleri düzenli izlenmeli; gereksiz
  `3840w` varyantları canlı ağ koşullarında fazla transfer yaratabilir.
- What We Do hub sekiz görseli aynı sayfada kullanıyor. İlk viewport'taki
  görseller dışında lazy yükleme korunmalı.
- Mobil çerez bandı deneyimi kesmemeli; banner yüksekliği düşük tutulmalı ve
  butonlar taşmadan iki satırda çözülmeli.

## Görsel envanter için doğrulanacak alanlar

Her kullanılacak iş/görsel için bu veri gelmeden fake portfolio veya müşteri
iddiası yayınlanmayacak:

- iş adı
- müşteri
- yıl
- format
- yayın izni durumu
- dosya/video/görsel konumu
- vaka sayfası açılacak mı?

## Öncelikli aksiyonlar

1. What We Do için eski sarı `Solutions` enerjisini taşıyan interaktif kristal
   / servis sistemi tasarlanacak.
2. Creative, Photography ve MONA görselleri gerçek asset klasöründen daha iyi
   adaylarla değiştirilecek.
3. Work sayfası gerçek iş envanteri gelene kadar profesyonel boş durum olarak
   kalacak.
4. MakeBrandBand tipografisinde sarı vurgunun geri getirilmesi tasarım turunda
   değerlendirilecek.
