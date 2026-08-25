# Görsel/İçerik Blocker'ları

Bu liste `docs/DECISIONS.md`'deki mevcut açık maddelerle **çakışmıyor,
tamamlıyor** — DECISIONS.md'de zaten AÇIK olan maddeler burada tekrar
"yeni bulgu" gibi sunulmuyor, ilgili madde numarasına atıf yapılıyor.

## 1. Work içerik envanteri — müşteri girdisi bekliyor

`docs/DECISIONS.md` madde #16'da zaten **AÇIK — blocker** olarak
işaretli: iş adı, müşteri, yıl, format, yayın izni, dosya/video/görsel
konumu, vaka sayfası açılıp açılmayacağı bilgisi olmadan `/work` grid
tasarımı ve yayınlanacak işler kesinleşemez. Client'ın gönderdiği 119
fotoğraflık arşiv **bu envanterin yerini tutmuyor** — arşivdeki hiçbir
görsel kendi başına "bu iş, bu müşteri için, şu tarihte yapıldı" bilgisini
taşımıyor (Renova billboard'u hariç, bkz. madde 5).

**Bu doküman setinin katkısı:** Envanter gelene kadar mevcut
`story-clapper.webp` placeholder'ının kalması önerildi (dürüst, marka
renklerinde, sahte iddia yok) — bkz. NEW_SITE_IMAGE_PLACEMENT_PLAN.md.

## 2. MONA — gerçek video/ses varlıkları prodüksiyon bekliyor

`Mona.tsx` kodunda zaten iki TODO var: ses kararı (`docs/DECISIONS.md`
#8, AÇIK — prodüksiyon planlanmalı) ve karakter videosu (brief 11.6,
WebM VP9+alfa + MP4, 4:3). Şu an MONA'nın **hiçbir görsel/video/ses
varlığı yok** — state machine mock veriyle kurulu, tamamen metin.

**Bu doküman setinin katkısı:** Client'ın foto arşivi tarandı, MONA
karakteriyle (eski Mac kafalı, deniz kızı kostümlü, baby pink zeminli
figür) ilgili **hiçbir görsel bulunamadı** — beklenen bir sonuç, bu
görev foto arşiviyle çözülemeyecek türden bir illüstrasyon/3D
karakter/video prodüksiyonu. Ayrıca "AI Showreel filmi" de ayrı bir
TODO olarak sayfa kodunda bekliyor (Film A "Henüz Değil").

## 3. Görsellerin yayın/telif izni teyit edilmeli

İki somut risk tespit edildi:

- **Eski sitenin `bisiklet.jpg` görseli E.T. the Extra-Terrestrial
  (1982) film afişinin siluetidir** — telifli, kullanılamaz. Yeni site
  bunu zaten kullanmıyor (`closing-bicycle.webp` ile değiştirilmiş), bu
  madde ileride birinin eski varlığı "geri getirelim" demesine karşı bir
  **uyarı kaydı** olarak buraya not edildi.
- Client dump'ındaki bazı dosyalar (`shutterstock_*` adlı dosyalar,
  `Ekran Resmi` klasöründeki bazı görseller) görünüşe göre stok
  fotoğraf — bunların lisansı/satın alma kaydı elimizde yok.
  `ASSET_SELECTION_REPORT.md`'de "izin/telif riski" sütununda
  işaretlenenler **satın alma faturası/lisans teyidi olmadan
  yayınlanmamalı**.
- Client dump'ında en az bir dosya **özel/candid bir etkinlik
  fotoğrafı** (tanınabilir, isimsiz kişiler, gece/parti ortamı) —
  bunun için hiçbir rıza/izin kaydı yok, web'de kullanılmamalı
  (`ASSET_SELECTION_REPORT.md`'de "Kullanılmaması gerekenler").

## 4. Bazı görsellerin hangi servise ait olduğu doğrulanmalı

- **Renova billboard mockup** (`Ekran Resmi 2016-01-26...png` /
  `whatwedo.png`): Eski sitenin `/clients` sayfasında "Renova" adı
  geçiyor ve eski sitenin kendi "Solutions" hero'sunda bu görsel
  kullanılmış — yani muhtemelen gerçek, yayınlanmış bir Hibrid işi.
  **Ama** güncel kullanım hakkı, müşteri ilişkisinin hâlâ sürüp
  sürmediği ve görselin "bize ait mi yoksa müşteri/Renova'ya mı ait"
  olduğu netleştirilmeden `/work` sayfasına eklenmemeli.
- Eski sitenin `/solutions` sayfasında `adidas-bg.jpg` adlı bir dosya
  var — Adidas, eski sitenin `/clients` listesinde **geçmiyor**. Bu
  görsel gerçek bir Adidas işi olabilir ya da sadece isim benzerliği
  taşıyan jenerik bir spor-temalı stok görsel olabilir; **doğrulanmadan
  hiçbir yerde "Adidas işi" olarak sunulmamalı** (kullanıcının "sahte
  müşteri/vaka üretme" talimatına doğrudan bağlı bir risk noktası).
- `ASSET_SELECTION_REPORT.md`'deki her görsel için ayrı ayrı işaretlenen
  "önerilen kullanım yeri" **öneridir, kesin atama değildir** — özellikle
  client-dump'ındaki kategori klasör adları (CREATIVE, PRODUCTION vb.)
  müşterinin kendi önceden yaptığı bir sınıflandırma olabilir ama
  içerik bazen klasör adıyla örtüşmüyor (örn. bir "PRODUCTION"
  klasöründe stüdyo-dışı bir stok görsel çıkabilir) — ekip görsel görsel
  onaylamalı.

## 5. Creative sayfası — karar var, üretim yok

Ek/yeni bir açık karar değil ama net bir eksik: `docs/DECISIONS.md` #7
zaten "toz pembe zemin + siyah başlık + fuşya vurgu (brief'in kendi
önerisi)" kararını "VARSAYILANLA İLERLE" statüsünde vermiş. Kodda hâlâ
eski ampul stok görseli duruyor. **Bu bir tasarım kararı beklemiyor,
üretim/implementasyon bekliyor** — brief Bölüm 9'daki pullu/parıltılı
doku referans görseli (Hibrid'in kendi tasarımı, disko topu kafalı
figür) temin edilip uygulanmalı, ya da CSS gradient/doku ile
üretilmeli.

## 6. Kristal sistem — 8 benzersiz taş mı, 2 renk varyantı mı?

`src/data/solar-system.ts` yorumunda belgelenmiş bilinen bir geçmiş
sorun: teslim edilen orijinal taş paketinde 6/8 taş yanlış etiket
gösteriyordu, çözüm olarak tüm baskılı etiketler kırpıldı ve sistem 2
renk varyantına (sarı/fuşya) indirgendi. **Açık soru — müşteriye
sorulmalı:** Bu 2-varyant çözüm kalıcı mı, yoksa gelecekte her 8 servis
için görsel olarak da ayrı, doğru etiketli taş üretimi (yeni bir
AI-üretim/tasarım turu) planlanacak mı? Bu bir görsel-arşiv sorunu
değil, bir üretim kapsamı kararı.

## 7. Müşteri logoları eksik (Friends/Partners fırsatı)

Eski site 60+ müşteriyi düz metin liste olarak gösteriyordu, hiç logo
yoktu. Client dump'ında da müşteri logosu **yok**. Yeni sitenin
Friends/Partners sayfalarını güçlendirmek isteniyorsa bu ayrı bir talep
olarak müşteriden istenmeli — mevcut foto arşivinin kapsamı dışında.
