# Work İçerik Envanteri — Veri Talebi

**Kime:** Hibrid 360 · Zühre Didem Gödek
**Kimden:** Web sitesi yenileme ekibi
**Tarih:** 2026-08-26
**Konu:** `/work` sayfası ve vaka sayfaları için gereken iş listesi

---

## Neden bu form

`/work` sayfası şu an sitenin **en büyük blocker'ı**. Sayfa teknik olarak
hazır: grid, filtre, vaka sayfası şablonu, arşiv görünümü — hepsi kodda
duruyor ve çalışıyor. Eksik olan tek şey **hangi işlerin yayınlanacağı
bilgisi**.

Bu bilgi gelmeden sayfa yayına alınamaz, çünkü:

- Yayın izni olmayan bir müşteri adının siteye konması hukuki risk.
- İş envanteri olmadan konulacak her görsel "sahte portfolyo" olur —
  bu bizim çalışma kuralımıza aykırı, sitede sahte iş/sahte müşteri
  yayınlamıyoruz.
- Kaç iş olacağı bilinmeden grid tasarımı (kaç sütun, kaç satır, öne
  çıkan iş var mı) kesinleşmiyor.

Gönderdiğiniz 119 fotoğraflık arşiv bu envanterin yerini tutmuyor:
arşivdeki görsellerin hiçbiri kendi başına "bu iş, bu müşteri için, şu
tarihte yapıldı" bilgisini taşımıyor.

---

## Nasıl doldurulur

- **Excel / Google Sheets tercih edilir** — her satır bir iş, sütun
  başlıkları aşağıdaki gibi. Tek tek Word/e-posta da olur ama tablo
  daha hızlı işlenir.
- **Eksik alan bırakabilirsiniz** — "bilmiyorum" yazın, boş bırakmayın.
  Boş alan ile "bilinmiyor" arasındaki fark bizim için önemli.
- **Az ve emin olmak, çok ve belirsiz olmaktan iyidir.** 8 emin iş,
  25 belirsiz işten daha güçlü bir Work sayfası yapar.
- **Minimum:** 6–8 iş ile sayfa yayına alınabilir. Arşiv sonradan
  büyütülebilir.

---

## A) Her iş için doldurulacak alanlar

Aşağıdaki 12 alan, sitenin veritabanı şemasındaki alanların birebir
karşılığıdır — yani bu tablo doldurulduğu anda sisteme girilebilir.

| # | Alan | Açıklama | Örnek | Zorunlu? |
|---|---|---|---|---|
| 1 | **İş adı** | Kampanyanın/filmin adı | "Yaz Kampanyası 2024" | ✅ Zorunlu |
| 2 | **Müşteri** | Marka/şirket adı | "Arçelik" | ✅ Zorunlu |
| 3 | **Yıl** | Yayın yılı | 2024 | ✅ Zorunlu |
| 4 | **Format** | `Video` / `Görsel` / `Vaka çalışması` — hangisi? | Video | ✅ Zorunlu |
| 5 | **Kategori** | Creative · Production · Digital · AI · Live Broadcast · Photography · Post Production · Event Management | Production | ✅ Zorunlu |
| 6 | **Yayın izni var mı?** | Aşağıdaki §B'ye bakın | Evet — sözleşmede var | ✅ Zorunlu |
| 7 | **Müşteri adı gizlensin mi?** | İzin yoksa iş yayınlanıp marka adı gizlenebilir ("Lider bir beyaz eşya markası") | Hayır | ✅ Zorunlu |
| 8 | **Görsel/video dosya konumu** | Klasör adı, WeTransfer linki, Drive linki, YouTube/Vimeo linki — hangisi varsa | `.../ARÇELİK_2024/final/` | ✅ Zorunlu |
| 9 | **Öne çıksın mı?** | Recent Works bölümünde üstte görünsün mü? | Evet | Opsiyonel |
| 10 | **Vaka sayfası açılacak mı?** | §C'ye bakın | Evet | ✅ Zorunlu |
| 11 | **Yönetmen / ekip** | Directors & Crew sayfasına bağlanacaksa | "Ahmet Yılmaz" | Opsiyonel |
| 12 | **Notlar** | Bilmemiz gereken her şey | "Müşteri logo kullanımına izin vermiyor" | Opsiyonel |

### Kopyalanabilir sütun başlığı satırı

```
İş adı | Müşteri | Yıl | Format | Kategori | Yayın izni | Müşteri adı gizlensin mi | Dosya konumu | Öne çıksın mı | Vaka sayfası | Yönetmen/ekip | Notlar
```

---

## B) Yayın izni — üç seçenekten biri

Bu alan sayfanın hukuki omurgası. Her iş için **tam olarak** bu üç
cevaptan biri gerekiyor:

| Cevap | Ne demek | Sitede ne olur |
|---|---|---|
| **ONAYLI** | Sözleşmede referans/portfolyo kullanım izni var, ya da müşteri yazılı onay verdi | İş, müşteri adıyla birlikte yayınlanır |
| **BEKLEMEDE** | Emin değiliz / müşteriye sorulacak | İş **yayınlanmaz**, sistemde bekler. Onay gelince tek tıkla yayına alınır |
| **İZİN YOK** | Sözleşme yasaklıyor ya da müşteri istemiyor | İş sitede hiç görünmez |

**"Bilmiyorum" = BEKLEMEDE.** Emin olmadığınız hiçbir işi ONAYLI
işaretlemeyin — sonradan kaldırmak, hiç koymamaktan çok daha maliyetli.

### İzin yoksa ama iş güçlüyse

7. alan (`Müşteri adı gizlensin mi`) bunun içindir. Marka adı olmadan iş
yayınlanabilir: *"Lider bir beyaz eşya markası için 6 ülkede yayınlanan
lansman filmi."* Bu, birçok sözleşmede serbesttir. Hangi işlerde bu yola
gidilebileceğini işaretleyin.

---

## C) Vaka sayfası açılacak mı — ve açılacaksa gereken içerik

Her iş için iki seviye var:

| Seviye | Ne gerekiyor | Nerede görünür |
|---|---|---|
| **1 — Kart** | Görsel/video + ad + müşteri + yıl | Sadece `/work` grid'inde. Tıklanmaz |
| **2 — Vaka sayfası** | Kart bilgileri + aşağıdaki Sorun/Çözüm/Sonuç | `/work` grid'inde tıklanır, kendi sayfası açılır |

**Her iş için vaka sayfası gerekmez.** 3–5 güçlü vaka sayfası, 20 zayıf
sayfadan iyidir. Hangi işlerin vaka sayfasına değeceğini siz seçin.

### Vaka sayfası açılacaksa — üç alan

| Alan | Ne yazılacak | Uzunluk |
|---|---|---|
| **Sorun** | Müşteri hangi problemle geldi? Ne çözülmesi gerekiyordu? | 2–3 cümle |
| **Çözüm** | Ne yaptık? Hangi yaklaşımı seçtik? Neden? | 3–4 cümle |
| **Sonuç** | **Rakam varsa mutlaka yazın.** İzlenme, erişim, satış artışı, kaç ülkede yayınlandı, kaç format üretildi… | 1–2 cümle + rakam |

**Rakam en değerli kısım.** "Beğenildi" hiçbir şey anlatmıyor;
"3 haftada 12 platform versiyonu, 4 dilde" her şeyi anlatıyor.

Bu üç alan **TR ve EN** olarak gerekiyor. Sadece TR yazarsanız biz
çeviririz, ama onayınıza sunarız — onaysız çeviri siteye girmiyor.

---

## D) Kullanılamayacak işler / müşteriler — ayrı liste

Bu ayrı bir soru ve **çok önemli**:

> Sitede **kesinlikle görünmemesi gereken** bir müşteri, marka ya da iş
> var mı?

Şunlar için sorulyor:

- Sözleşmesi gizlilik maddesi içeren müşteriler
- İlişkisi kötü biten müşteriler
- Artık çalışılmayan ve referans gösterilmesi istenmeyen markalar
- Rakip konumdaki iki markanın aynı sayfada görünmesinin sorun yaratacağı durumlar
- Yayınlanmamış / iptal olmuş kampanyalar

**Bu listeyi boş bırakmayın.** "Yok" yazın, ama boş bırakmayın —
"sorulmadı" ile "yok" arasındaki farkı sonradan kimse hatırlamıyor.

---

## E) Arşivden çıkan iki somut soru

Gönderdiğiniz fotoğraf arşivini incelerken iki dosya "gerçek, yayınlanmış
iş" olabileceği için işaretlendi. Bunları doğrudan soruyoruz:

| # | Dosya | Ne görünüyor | Sorumuz |
|---|---|---|---|
| 1 | `Ekran Resmi 2016-01-26 19.44.07 kopya.png` (= `whatwedo.png`) | **Renova** için yapılmış outdoor/billboard mockup'ı. Eski sitenin "Solutions" hero'su olarak kullanılmış | Bu gerçek bir Hibrid işi mi? Renova ile ilişki sürüyor mu? Bu görseli yayınlama hakkımız var mı? |
| 2 | `adidas-bg.jpg` (eski sitenin `/solutions` sayfasında) | Dosya adı Adidas diyor, ama Adidas eski sitenin müşteri listesinde **geçmiyor** | Adidas gerçek bir müşteri mi, yoksa bu sadece isim benzerliği olan jenerik bir görsel mi? |

**2. madde özellikle kritik:** doğrulanmadan hiçbir yerde "Adidas işi"
olarak sunulmayacak.

---

## F) Görsel/video teslim formatı

Envanter tablosuyla birlikte dosyaların da gelmesi gerekiyor. Teknik
notlar:

| Konu | İhtiyaç |
|---|---|
| **Görsel** | En yüksek çözünürlük — biz küçültürüz. Sıkıştırılmış/ekran görüntüsü kalitesinde dosya kullanılamıyor |
| **Video** | Mümkünse master dosya ya da yüksek bitrate mp4. Vimeo/YouTube linki de olur (gömülü oynatıcı kullanırız) |
| **En-boy oranı** | Grid 16:9 ve 4:5 kullanıyor. Farklı oranda geldiyse kırpma alanını siz işaretleyin, biz tahmin etmeyelim |
| **Logo/marka görünürlüğü** | Üçüncü taraf marka logosu görünen kareler için ayrı izin gerekebilir — hangi karelerde logo var, not düşün |

---

## G) Teslim sonrası ne olacak

1. Envanter gelir → yayın izni ONAYLI olanlar sisteme girilir
2. `/work` grid'i gerçek işlerle dolar, "İş envanteri hazırlanıyor."
   boş durumu kaybolur
3. Vaka sayfası işaretlenen işler için Sorun/Çözüm/Sonuç sayfaları açılır
4. BEKLEMEDE olanlar sistemde durur, onay geldikçe yayına alınır
5. Aynı veri seti **Creative sayfasının kampanya galerisini** ve
   **MONA'nın ekranındaki iş döngüsünü** de besler — üç iş tek talebe
   bağlı

---

## H) Kontrol listesi — göndermeden önce

- [ ] Her işin adı, müşterisi ve yılı yazıldı
- [ ] Her iş için yayın izni ONAYLI / BEKLEMEDE / İZİN YOK olarak işaretlendi
- [ ] Dosya konumları yazıldı (klasör adı, link, ya da "bende yok")
- [ ] Vaka sayfası açılacak işler işaretlendi
- [ ] Vaka sayfası açılacak işler için Sorun / Çözüm / Sonuç yazıldı
- [ ] **Kullanılamayacak müşteri/iş listesi dolduruldu** (yoksa "yok" yazıldı)
- [ ] §E'deki iki soru (Renova, Adidas) cevaplandı
- [ ] Görsel/video dosyaları paylaşıldı ya da nereden alınacağı belirtildi

---

### İlgili dokümanlar

- `docs/DECISIONS.md` #16 — bu talebin açık karar kaydı
- `docs/visual-audit/BLOCKERS.md` #1, #4 — blocker gerekçesi ve arşiv bulguları
- `docs/supabase-schema.sql` — `works` tablosu, bu formun alanlarının teknik karşılığı
- `docs/brief-rev12.md` Bölüm 7.3 — vaka sayfası şablonu
