# Eski Site Görsel Haritası (hibrid360.com)

Bu doküman `hibrid360.com`'un **hâlâ canlı olan eski sürümünü** (bu repodaki
yeni build henüz production domain'e bağlanmadı — bkz. README "Faz 0")
inceleyerek çıkarıldı. Yöntem: canlı sayfaların ham HTML'i çekildi, CSS
`background-image: url(...)` ve `<img>` referansları çıkarıldı, bulunan
görsellerin tamamı indirilip tek tek görüldü. Ekran görüntüsü değil,
gerçek üretim varlıkları üzerinden yapılmış bir envanterdir.

Her bölüm için: eski sitede ne var → yeni sitede karşılığı var mı → doğru
yerde mi → eksik/zayıf/yanlış mı.

---

## 0. Site geneli — tekrarlayan zemin görselleri

Eski sitenin **her sayfasında** (ana sayfa dahil tüm 13 sayfa) aynı dört
görsel dönüşümlü slider zemini olarak kullanılıyor: `kiz.jpg` (şapkalı,
gülümseyen kadın, siyah-beyaz stüdyo portresi), `mic.jpg` (vintage radyo
mikrofonu), `plak.jpg` (plak/vinil close-up), `5.png` (tasarımcı masası
üstten çekim — Pantone renk kartelası, laptop, kamera, kahve).

- **Yeni sitede karşılığı:** Yok — yeni site sayfa-özel görsel kullanıyor,
  site-geneli tekrarlayan slider zemini yaklaşımını (doğru şekilde) terk
  etmiş.
- **Değerlendirme:** Bu görseller büyük ihtimalle stok — telifi bilinmiyor,
  markaya özgü hiçbir şey yok (jenerik "yaratıcı ajans" klişesi). Yeni
  sitenin bunları taşımaması **doğru bir karar**, yeniden canlandırılması
  önerilmez.

---

## 1. Hero / "ay-bisiklet" sahnesi

**Eski sitede:** Ana sayfa hero'sunda dönen bir slogan carousel'i var
(`we don't just talk the talk...` / `we are not into one night stands` /
`come over for a coffee and see if we click` / `we believe love at first
sight`), zemininde `bg-index.jpg` (siyah-beyaz karahindiba/puşke çiçeği,
bokeh) kullanılıyor. Ayrı olarak site varlıkları arasında `bisiklet.jpg`
adlı bir görsel de var.

**KRİTİK BULGU — `bisiklet.jpg` telif riski:** Bu dosya jenerik bir
"bisiklet" görseli değil, **E.T. the Extra-Terrestrial (1982) film
afişinin birebir siluetidir** (çocuk + bisiklet, dolunayın önünde uçuyor,
sarıya boyanmış). Bu, stüdyo telifli bir görseldir; olduğu gibi web'de
kullanmak telif ihlalidir.

- **Yeni sitede karşılığı:** `ClosingBand.tsx` bileşeni + `public/images/
  site/home/closing-bicycle.webp` — siyah-beyaz, jenerik bir bisiklet
  gidon/çerçeve close-up fotoğrafı (muhtemelen client klasöründeki
  `Attractive_black_and_white_photo_of_bicycle_handlebars_Taipei_City`
  dosyasının kırpılmış hâli — bkz. ASSET_SELECTION_REPORT.md).
- **Doğru yerde mi:** Evet, sayfanın kapanış bandında (`ClosingBand`),
  eski sitenin "ay-bisiklet" hissinin bulunduğu yere karşılık geliyor.
  Kod yorumu bunu doğruluyor ("eski sitedeki bisiklet görsel hissi").
- **Eksik/zayıf/yanlış mı:** **Telif riski doğru şekilde ortadan
  kaldırılmış** ama bunun bedeli atmosfer kaybı — orijinal görselin
  "gece, ay ışığı, siluet, uçuş hissi" duygusu jenerik bir ürün
  fotoğrafına indirgenmiş. Bkz. BLOCKERS.md ve aşağıdaki "sorunlu
  görseller" notu — bu, orijinal fikri (gece/siluet/ay) telifsiz ve
  özgün şekilde yeniden üretmek için iyi bir aday.

---

## 2. "Make your brand 'the' brand"

**Eski sitede:** Ana sayfada kısa bir slogan bloğu; ayrı bir arka plan
görseli tespit edilemedi (muhtemelen düz metin bloğu, `5.png`/`ANA
SAYFA/20.jpg` gibi genel homepage görselleriyle komşu).

**ANA SAYFA/20.jpg** (client klasöründe de aynı görsel var) = video
kamera + tüylü boom mikrofon close-up, siyah-beyaz — homepage'de kullanılan
prodüksiyon görseli.

- **Yeni sitede karşılığı:** `MakeBrandBand.tsx` + `public/images/site/
  home/make-brand.webp` — **tam olarak aynı kamera+boom mikrofon
  görseli** kullanılıyor. Kod yorumu da bunu doğruluyor: "Eski sitedeki
  'Make your brand' fotoğraf üstü blok korunur."
- **Doğru yerde mi:** Evet, doğrudan devam ettirilmiş.
- **Eksik/zayıf/yanlış mı:** Sorun yok — bilinçli bir korumadır, görsel
  markaya nötr/uygun (prodüksiyon ekipmanı, siyah-beyaz, jenerik ama
  temiz). Video/hareketli versiyon eklenmesi (brief'in önerdiği gibi)
  bir iyileştirme fırsatı, ama mevcut foto kötü değil.

---

## 3. Solutions

**Eski sitede:** Ayrı bir `/solutions` sayfası var — 4 slogan tekrar
başta, ardından 19 hizmeti 7 kategori altında toplayan kart grid'i
(Brand consultancy, Advertising, Logo, Printed, Packing, Outdoor,
Website, TVC, Photo shooting, Shooting, Production, Live broadcast,
Post production, Cloud TV, Event). Her kart küçük bir "zoom" ikonuyla
(`adve-zoom.png`, `branding-zoom.png`, `outdoor-zoom.png`,
`packing-zoom.png`, `printed-zoom.png`, `ps-zoom.jpg`, `tvc-zoom.png`,
`website-zoom.png`, `event-zoom.jpg` vb.) gösteriliyor. Ayrıca sayfanın
kendi hero'su `whatwedo.png` — bu görsel **Renova müşterisi için yapılmış
gerçek bir OOH/billboard reklam mockup'ı** (bkz. ASSET_SELECTION_REPORT.md
— aynı görsel client klasöründeki bir "Ekran Resmi" dosyasıyla birebir
aynı).

- **Yeni sitede karşılığı:** Ayrı bir "Solutions" sayfası **yok** —
  yeni site mimarisi bu 19 hizmeti `WHAT WE DO` menüsü altında 8 servis
  sayfasına + ana sayfadaki `SolarSystem` (kristal) bileşenine
  dağıtmış (bkz. CLAUDE.md site haritası). Bu bilinçli bir bilgi
  mimarisi kararı — "Solutions" ayrı bir sayfa olarak yeniden
  kurulmuyor.
- **Doğru yerde mi:** Mimari olarak evet — dağınık 19 maddelik liste yerine
  8 net servis + kristal etkileşimi daha temiz bir çözüm.
  `SolarSystem`'ın 8 noktası (Production, Digital, Creative, AI, Live
  Broadcast, Photography, Post Production, Events) eski Solutions
  sayfasının prodüksiyon tarafını tam karşılıyor; Solutions'taki
  "Brand consultancy / Advertising / Logo / Printed / Packing / Outdoor
  / Website / TVC" gibi saf-Creative alt kalemleri ise yeni sitede
  `/what-we-do/creative` sayfasının hizmet listesine (`SERVICES` dizisi:
  BRAND CONSULTANCY, CORPORATE IDENTITY, ... PACKAGING, TV, PRESS, RADIO
  CAMPAIGNS) taşınmış — kayıp yok.
- **Eksik/zayıf/yanlış mı:** İçerik kaybı yok, ama eski sayfanın flagship
  görseli (Renova billboard) yeni sitede **hiçbir yerde kullanılmıyor**.
  Bu, gerçek ve markaya ait tek "kanıtlanmış iş örneği" olduğu için
  `/work` sayfası için değerlendirilmeli (bkz. NEW_SITE_IMAGE_PLACEMENT_PLAN.md
  ve BLOCKERS.md — kullanım izni teyidi gerekir).

---

## 4. What We Do servisleri

**Eski sitede:** 7 servis sayfası (Creative, Production, Post Production,
Digital, Live Broadcast, Cloud TV, Event Management), her biri kendi
`bg-*`/numaralı görseliyle:

| Eski servis sayfası | Eski görsel | Yeni sitede karşılığı | Not |
|---|---|---|---|
| Creative | `4-1.png` (ampul/"design thinking" stok görseli) | `creative.webp` — **BİREBİR AYNI GÖRSEL** | Bkz. "sorunlu görseller" — hem eskide hem yenide zayıf, hiç değişmemiş |
| Production | `25.jpg, 26.jpg, 29.jpg` | `production.webp` (pembe/mor stüdyo ışığında kamera) | Yeni görsel daha güçlü, markaya daha yakın |
| Post Production | `37.jpg, 38.jpg` | `post-production.webp` (DaVinci Resolve renk düzeltme odası) | Yeni görsel daha profesyonel/güncel |
| Digital | `digital2.jpg` (kalemlik yapılmış kuru kafa, s/b) | `digital.webp` (3D render, telefon+emoji, mor/pembe) | İkisi de zayıf — biri tuhaf/dated, diğeri jenerik stok 3D render; bkz. sorunlu görseller |
| Live Broadcast | `10.jpg, 17.jpg` | `live-broadcast.webp` (kamera lensi + "ON AIR" tabelası) | Yeni görsel net ve amaca uygun |
| Cloud TV | `14.jpg` | `cloud-tv.webp` (OB yayın aracı kontrol odası) | Yeni görsel net ve amaca uygun |
| Event Management | `16.jpg` + `pr.png` | `event-management.webp` — **`16.jpg` ile birebir aynı görsel** | Sahne ışığı + belli belirsiz Hibrid "H" logosu — kendi çekimleri, korunmuş, iyi |
| Photography | (eski sitede ayrı sayfa yok — Solutions'ta "Photo shooting" maddesi var) | `photography.webp` (s/b, iki kadın, kırmızı halı/ödül töreni havası) | Yeni sayfa eskiden yok, sıfırdan eklenmiş; görsel "photography" hizmetini geniş temsil etmiyor, dar okunuyor (bkz. sorunlu görseller) |

- **Genel değerlendirme:** Servis görsellerinin 5/8'i eskiye göre **net bir
  iyileşme** (Production, Post Production, Live Broadcast, Cloud TV,
  Event Management). 2 tanesi (**Creative, Digital**) hâlâ zayıf/jenerik —
  Creative hiç değişmeden taşınmış, Digital farklı ama eşit derecede
  markaya uzak bir stok görselle değiştirilmiş. Photography yeni bir
  sayfa, görseli hizmeti dar temsil ediyor.

---

## 5. Work / "Less Talk More Work"

**Eski sitede:** Ayrı bir "Work" bölümü yok — nav'da yok, ama ana sayfada
"the best works doesn't feel like work / Wanna know what keeps us busy?"
başlıklı bir blok var ve bu blok **dış bir portala** (`plug-ad.co`)
yönlendiriyor. Zemin görseli `bg-works.jpg` (s/b, not defterine yazan el,
laptop, kahve — "creative process" hissi). Client klasöründeki
`lessismore-940x555 kopya.jpg` dosya adı da muhtemelen bu bölümün
başlığıyla ("Less Talk More Work" / "less is more") ilişkili bir
stok/moodboard görseli.

- **Yeni sitede karşılığı:** Tam bir `/work` sayfası var (`src/app/
  [locale]/work/page.tsx`) — eskideki dış-portal yönlendirmesinin **yerini
  alıyor** (CLAUDE.md: "plug-ad.co yönlendirmesinin yerine geçer").
  Şu an `story-clapper.webp` (mor/sarı zeminde "YOUR STORY / DIRECTOR:
  HIBRID 360" yazan klaket) placeholder olarak kullanılıyor.
- **Doğru yerde mi:** Evet, mimari olarak doğru — dış yönlendirme yerine
  kendi sayfası.
- **Eksik/zayıf/yanlış mı:** Gerçek iş envanteri yok (`work/page.tsx`
  içindeki yorum ve DECISIONS.md #16 bunu zaten "AÇIK — blocker" olarak
  işaretlemiş). Placeholder görsel (klaket) **dürüst bir placeholder** —
  sahte müşteri/vaka iddia etmiyor, marka renklerinde. Bu doğru bir
  yaklaşım, değiştirilmesi gerekmiyor; gerçek işler geldikçe grid'e
  eklenecek.

---

## 6. Contact

**Eski sitede:** E-posta (`contact@hibrid360.com`), telefon
(`+90 532 613 50 45`), Instagram/LinkedIn/Vimeo linkleri — düz metin
blok, belirgin bir görsel/fon tespit edilmedi (muhtemelen site-geneli
`kiz.jpg/mic.jpg/plak.jpg/5.png` slider'ı).

- **Yeni sitede karşılığı:** `/contact` sayfası var, form + WhatsApp +
  randevu linki (CLAUDE.md #11). Telefon numarası eski sitede
  `+90 532 613 50 45` iken yeni sitede `src/lib/site.ts` üzerinden
  farklı bir numara (`+90 216 606 88 98`, brief'teki adres kutusundan)
  kullanılıyor — bu bir görsel konu değil ama tutarlılık için not
  düşülüyor.
- **Görsel gerekir mi:** Hayır — Contact eski sitede de görsel-ağırlıklı
  bir bölüm değildi, yeni sitede de form-ağırlıklı kalması doğru.
  Marka atmosferi için küçük bir dekoratif görsel/gradient yeterli,
  fotoğraf gerekmiyor.

---

## 7. Client / Partner alanları

**Eski sitede:** Ayrı bir `/clients` sayfası var — **düz metin liste**
olarak 60+ müşteri adı (Koç Holding, Arçelik-Beko grubu, Renova, Chery,
Tat Gıda, çeşitli oteller/üniversiteler vb.). Logo görseli **hiç yok** —
sadece isim listesi. Ayrı bir `/partners` sayfası da var, aynı jenerik
zemin görselleriyle (`about-screen01.jpg` dahil).

- **Yeni sitede karşılığı:** `Friends` (eski adı Clients — CLAUDE.md #6)
  ve `Culture > Partners` (Studio Food Room eklenir, Motive çıkar —
  CLAUDE.md #5) olarak yeniden kurgulanmış; "müşteri sözü sistemi"
  (testimonials) rev12 ile eklenmiş.
- **Doğru yerde mi:** Evet, isimlendirme ve hiyerarşi güncellenmiş.
- **Eksik/zayıf/yanlış mı:** Eski sitede zaten logo/görsel yoktu, o
  yüzden bu alanda "eski görselden devralınacak" bir şey yok — ama tam
  tersi bir fırsat var: eski sitenin en büyük eksiği (60+ müşteri, sıfır
  logo) yeni sitede düzeltilebilir. Bu iş **görsel klasöründe yok**
  (müşteri logoları client dump'ında bulunmadı) — BLOCKERS.md'ye
  eklendi: logo seti müşteriden ayrıca istenmeli.

---

## Sorunlu görseller — özet (Adım 4 ile çapraz bağlantı)

1. **Creative sayfası (ampul/"design thinking" görseli)** — eski sitede
   de, yeni sitede de **birebir aynı** jenerik stok görsel. Marka
   renkleriyle (mor/turuncu ışık, fuşya/sarı/siyah değil) çelişiyor.
   Üstelik brief + `docs/DECISIONS.md` madde 7 zaten bu sayfa için
   **"toz pembe zemin + siyah başlık + fuşya vurgu (pullu/parıltılı
   doku)"** kararını vermiş durumda — yani doğru yön zaten belirlenmiş,
   sadece uygulanmamış. Bu bir tasarım kararı boşluğu değil, bir
   **üretim/implementasyon boşluğu**.
2. **AI Creative Production / MONA** — şu an **hiçbir görsel/video
   varlığı yok** (`Mona.tsx` tamamen metin+state machine, `TODO: brief
   11.6 — MONA karakter videosu ... gerçek video ile değiştirilecek`).
   Bu, client'ın 119 fotoğraflık arşivinden çözülemez — MONA özel bir
   prodüksiyon/illüstrasyon işi (bkz. BLOCKERS.md).
3. **"Ay-bisiklet" hissi** — telif riski doğru şekilde temizlenmiş ama
   atmosfer kaybı var; jenerik bir bisiklet fotoğrafı, eski görselin
   "gece/ay/siluet" büyüsünü taşımıyor.
4. **Photography görseli** — "beauty/makeup" değil ama kırmızı
   halı/ödül töreni gibi dar bir okuma veriyor; genel prodüksiyon
   fotoğrafçılığını (ürün, portre, editorial çeşitliliği) temsil
   etmiyor.
