# Görsel Klasörü Sınıflandırma Raporu

Kaynak: müşteriden gelen `hibrid-360_wb-site-fotograglar_2026-08-21_0937`
arşivi, `wb site fotoğraglar` klasörü (1.3GB, 119 dosya, 10 klasör).
Arşiv repoya dahil değil; yerel olarak incelendi.
Tüm 119 dosya tek tek açılıp incelendi (3 paralel görev + doğrudan
inceleme). Hiçbir dosya siteye otomatik konmadı — bu sadece bir
sınıflandırma/öneri dokümanıdır.

## Önce oku: en kritik 12 bulgu

1. **`maxresdefault kopya.jpg`** — E.T. the Extra-Terrestrial film
   afişinin birebir kopyası. **Asla kullanma.** (Eski sitenin
   `bisiklet.jpg`'siyle aynı risk — bkz. OLD_SITE_VISUAL_MAP.md.)
2. **`Ekran Resmi 2016-04-12 19.41.18.png`** ve onun filigranı
   kırpılarak gizlenmiş kopyası **`CAM19326 kopya.jpg`** — "ANDREAS
   STAVRIDES PHOTOGRAPHY" filigranlı üçüncü taraf telifli fotoğraf.
   **Asla kullanma**, ayrıca filigranı kırpıp gizlemiş olmak başlı
   başına bir risk artırıcı unsur.
3. **Özel/candid etkinlik fotoğrafları** — `Ekran Resmi 2016-04-12
   16.01.22.png`, `Ekran Resmi 2016-04-12 19.42.34.png`, `_MG_0295.jpg`,
   `PRODUCTION/32.jpg`, `SHOOTİNG -PRODUCTION/studyo_5.jpg`,
   `ANA SAYFA/19.jpg`, `ANA SAYFA/20.jpg` — bunların çoğu **aynı
   gecenin/aynı restoran sahnesinin tekrarlayan kopyaları**, tanınabilir
   kişiler, rıza kaydı yok. **Hiçbiri kullanılmamalı.**
4. **Stok filigranlı/kaynaklı dosyalar** — `POST PRODUCTION/34.png`
   ("Social Media ICons Read..." filigranı), `POST PRODUCTION/
   thumb_955_blogs_big.jpg` (blog thumbnail kalitesi), `POST PRODUCTION/
   Video-Post-Production-Services.jpg` (üçüncü taraf ajans sitesinden),
   `Office_Site_2014_Studio_Images-012 kopya.jpg` (başka bir stüdyonun
   kendi tanıtım fotoğrafı) — hiçbiri kullanılmamalı.
5. **En güçlü "yükseltme" adayları** (mevcut placeholder'lardan daha iyi
   veya eşdeğer, sadece lisans/rıza teyidi + sıkıştırma gerekiyor):
   - `HİBRİD WEB SAYFASI GÖRSEL 2/10.png` — production hero, mevcut
     `production.webp` ile aynı konsept, çok daha yüksek çözünürlük.
   - `HİBRİD WEB SAYFASI GÖRSEL 2/42.png` — büyük ölçekli etkinlik/çoklu
     kamera, güçlü hero adayı.
   - `SHOOTİNG -PRODUCTION/10.png` ve `PRODUCTION/deal-hero-image.jpg`
     — production için ek adaylar.
   - `POST PRODUCTION/roof_fix_1.2.1.jpg` — post-production için daha
     sinematik ama **ekranda üçüncü taraf içerik görünüyor, riskli**.
6. **CREATIVE klasörünün tamamı (12 dosya) kullanılabilir değil** —
   hepsi aynı iki stok görselin (ampul/"design thinking" ve S/B masaüstü
   flatlay) varyasyonları. Brief'in istediği pullu/parıltılı/disko
   dokusuna sahip **hiçbir görsel yok**. Creative sayfası için mevcut
   arşivde çözüm yok — bkz. BLOCKERS.md #5.
7. **WCAG kontrast ihlali riski** — `PRODUCTION/29.jpg` (klaket
   görseli) fuşya zemin üstünde **beyaz** metin kullanıyor; marka kuralı
   (CLAUDE.md) fuşya zeminde **siyah** metin şart. Bu görsel kullanılırsa
   metin katmanı yeniden yapılmalı.
2. **Aynı fotoğrafın birden fazla klasörde tekrarı (MD5 doğrulandı):**
   `LIVE BROAD CAST/22.png` = `POST PRODUCTION/22.png` (birebir aynı
   dosya); `LIVE BROAD CAST/29.png` = `POST PRODUCTION/29.png` (birebir
   aynı, doğru yeri Live Broadcast). Bu, client'ın kendi klasörlemesinin
   %100 güvenilir olmadığını gösteriyor — klasör adına değil, içeriğe
   göre karar verilmeli.
3. **Üçüncü taraf marka/logo göründüğü için dikkat edilmesi gerekenler:**
   `Attractive_black_and_white_photo_of_bicycle_handlebars_Taipei_City`
   (DURCUS ONE bisiklet logosu — mevcut `closing-bicycle.webp`'nin
   kaynağı, yeniden kırpımda bu alandan kaçının), `SHOOTİNG
   -PRODUCTION/17.png` (camda bulanık üçüncü taraf logo), `HİBRİD WEB
   SAYFASI GÖRSEL 2/38.png` (HITACHI logosu net görünüyor), `.../41.png`
   (ekranda Kiril alfabesi — ekipmanın kime ait olduğu belirsiz).
4. **Gerçek, doğrulanabilir müşteri işi:** `Ekran Resmi 2016-01-26
   19.44.07 kopya.png` (= `whatwedo.png`, eski sitenin Solutions
   hero'su) — Renova için yapılmış OOH billboard mockup'ı. Tek "gerçek
   iş" statüsünde güçlü aday ama müşteri onayı olmadan `/work`'e
   konmamalı — bkz. BLOCKERS.md #4.
5. **Marka rengiyle tesadüfen örtüşen ilginç bir bulgu:**
   `Ekran Resmi 2016-12-16 23.55.17.png` — sarı-siyah düoton bir portre,
   HIBRID360 logosu görünüyor, yeni marka paletiyle şaşırtıcı derecede
   uyumlu. Kişinin kimliği/güncel onayı doğrulanırsa `/culture` için
   ilginç bir referans.

---

## A) "HİBRİD WEB SAYFASI GÖRSEL 2" klasörü (40 dosya)

8K (7680×4320), 2-46MB PNG dosyalarından oluşan, büyük ölçüde otantik
stüdyo/canlı yayın/prodüksiyon behind-the-scenes fotoğraf arşivi.
~30 dosya gerçek/otantik görünüyor (TV stüdyosu ışık rigleri, OB van/
rejisi ekipmanı, kamera operatörleri, greenscreen/LED sanal set, ürün
fotoğrafçılığı, büyük ölçekli etkinlik multi-kamera dizilimi); ~9-10
dosya stok fotoğraf/stok 3D render/hazır grafik görünümünde (filigranlı
veya bozuk-metin render dahil). **Tüm dosyalar WebP/AVIF'e sıkıştırılıp
responsive boyutlara indirilmeden web'e konulamaz** (orijinaller 8K).

| Dosya | Kategori | Kullanım yeri | Güçlü/zayıf | Crop | Web? | Telif/izin |
|---|---|---|---|---|---|---|
| 3.png | Photography | /what-we-do/photography | Temiz boş cyclorama stüdyo, negatif alan geniş | 16:9, üst-orta negatif alan | evet | bilinmiyor, muhtemelen kendi çekimi |
| 4.png | Production | /what-we-do/photography | Otantik BTS, ön plan bulanıklığı kompozisyonu bozuyor | Sağ 2/3'e kırp | evet, düşük öncelik | ekip üyesi tanınıyor, rıza teyidi gerek |
| 6.png | Live Broadcast | /what-we-do/live-broadcast | Karanlık atmosferik, marka siyahına uyumlu | 16:9 native | evet | yok |
| 8.png | Live Broadcast | /what-we-do/live-broadcast, hero | Operatör arkadan, dramatik ışık | Portre kırpım | evet | düşük, yüz yok |
| 9.png | Live Broadcast | /what-we-do/live-broadcast | OB ekipman envanteri, insansız | 21:9 wide | evet | yok |
| 10.png | Live Broadcast / Hero | **ana sayfa hero adayı** | Sinematik pembe/kırmızı bokeh, marka fuşyasına yakın — çok güçlü | 16:9, sol 1/3 negatif alan | evet, yüksek öncelik | bilinmiyor, muhtemelen kendi çekimi |
| 11.png | Live Broadcast | /what-we-do/live-broadcast | Vision mixer detay, teknik özgünlük yüksek | Kare/16:9 detay | evet | yok |
| 12.png | Production | /what-we-do/production | Endüstriyel ışık rigi, dramatik, insansız | 16:9 | evet | yok |
| 13.png | Production (sanal set) | /what-we-do/production, /creative | LED/tracking sanal set — teknoloji farkı gösterir | 16:9 tam kare | evet, yüksek öncelik | ekip arkadan, tanınmıyor |
| 14.png | Production | /what-we-do/production | Otantik POV, gerçek BTS hissi | Kare, kamera+tencere | evet | sadece eller, risk yok |
| 15.png | Photography | /what-we-do/photography | İyi kompoze ürün çekimi (gitar) | 16:9, sağ alt reflektörü kırp | evet, yüksek öncelik | jenerik ürün, logo net değil |
| 16.png | Hero (şüpheli) | ana sayfa (onaysız kullanma) | Grafik siluet, beyaz zemin marka renklerine uyumlu; dosya küçük | 21:9 | evet ama onay şart | olası stok, kaynak teyidi gerek |
| 17.png | Event Management | /what-we-do/event-management | Dış mekan OB kurulumu, gerçekçi | Portre kırpım | evet | camda belirsiz desen, düşük risk |
| 18.png | Production | /what-we-do/production, /culture | Ekip cyc set üzerinde çalışıyor, otantik | 16:9 | evet | yüzler ters ışıkta seçilmiyor |
| 19.png | Production | /what-we-do/production | Gritty BTS, hareket bulanıklığı | 16:9, kameraya odak | evet, düşük öncelik | yüzler bulanık, düşük risk |
| 20.png | Hero (şüpheli) | ana sayfa (onaysız kullanma) | 16.png ile aynı siluet serisi | 21:9 | evet ama onay şart | olası stok serisi |
| 21.png | Event Management | **hero adayı** | Gece etkinliği, geniş negatif alan, dinamik | 16:9, operatör sol 1/3 | evet, yüksek öncelik | arkadan çekim, düşük risk |
| 22.png | **Kullanılmaması gerekenler** | hiçbiri | Elde bindirilmiş waveform/timecode grafiği, bariz stok paket | — | hayır | kesin stok, yüksek risk |
| 23.png | Production | /what-we-do/production | Renkli set, jib monitör detayı | 16:9 | evet, düşük öncelik | arka plan duvar tasarımı 3.taraf olabilir |
| 24.png | **Kullanılmaması gerekenler** | hiçbiri | Klaket+kamera, mavi gradyan, tipik stok | — | hayır | yüksek olasılık stok |
| 25.png | **Kullanılmaması gerekenler** | hiçbiri | Sarı 3D "DIRECTOR" sandalyesi render, metin bozuk/glitch | — | hayır | büyük olasılık stok 3D render |
| 26.png | Production | /what-we-do/production, /post-production | Temiz greenscreen stüdyo, insansız, iyi kalite | 16:9 | evet, yüksek öncelik | yok |
| 28.png | Production | /what-we-do/production, /culture | Otantik prodüksiyon günü, ekip arka planda | 16:9 | evet, düşük öncelik | maskeli kişi (COVID dönemi), eskimiş görünebilir |
| 29.png | Live Broadcast | /what-we-do/live-broadcast | Switcher paneli, renkli LED, insansız | 16:9 | evet | yok |
| 30.png | Live Broadcast | /what-we-do/live-broadcast | Rejisi masası, insansız | 16:9 | evet | yok |
| 32.png | **Kullanılmaması gerekenler** | hiçbiri | Gerçek değil — 3D render haber stüdyosu mockup'ı | — | hayır/düşük öncelik | render'ın sahibi bilinmiyor |
| 33.png | Live Broadcast | hiçbiri | Aşırı bulanık, kullanılamaz kalite | — | hayır | kalite yetersiz |
| 34.png | **Kullanılmaması gerekenler** | hiçbiri | "Social Media ICons Read..." filigranı görünür | — | hayır | kesin stok, filigranlı — yüksek risk |
| 35.png | Live Broadcast | /what-we-do/live-broadcast | Sinematik mavi/turuncu bokeh, keskin | 16:9 hero | evet, yüksek öncelik | olası stok, teyit gerek |
| 36.png | Event Management (arka plan) | /what-we-do/event-management | Atmosferik bokeh, özne belirsiz | 21:9 arka plan katmanı | evet | yok, tanınmıyor |
| 37.png | Production | /what-we-do/production | Greenscreen röportaj konsepti güzel ama jenerik "röportaj" hissi | 16:9 | evet, düşük öncelik | tanınabilir kişi, rıza/kaynak bilinmiyor |
| 38.png | Live Broadcast | hiçbiri/düşük öncelik | HITACHI marka logosu net görünüyor, video-grab kalite | — | hayır, düşük öncelik | 3. taraf ekipman markası görünür |
| 39.png | Post Production | /what-we-do/post-production | Fader detay, sıcak bokeh, biraz stok hissi | 16:9 | evet, orta öncelik | bilinmiyor, olası stok |
| 40.png | Live Broadcast | /what-we-do/live-broadcast | Keskin makro fader detayı, insansız | 16:9/kare | evet | yok |
| 41.png | Live Broadcast | /what-we-do/live-broadcast (onay sonrası) | Detaylı CCU/joystick paneli, ekranda Kiril alfabesi | 16:9 | evet, onay sonrası | ekipmanın kime ait olduğu belirsiz |
| 42.png | Event Management | **hero adayı** | Büyük arena/etkinlik, çok kamera, çok güçlü | 21:9 hero | evet, yüksek öncelik | yok, tanınmıyor |
| 43.png | Event Management | /what-we-do/event-management | Kamera sırası kamuya açık mekanda, gerçekçi | 16:9, yayaları kırp | evet | arka planda sıradan yayalar — KVKK dikkat |
| 45.png | Live Broadcast / Hero | /what-we-do/live-broadcast | İkonik "ON AIR" tabelası, video-grab yumuşaklığı | Kare, tabelaya odak | evet, sınırlı (düşük çöz.) | yok |
| 47.png | Hero (şüpheli) | ana sayfa/production (onaysız kullanma) | 16/20 ile aynı siluet serisi, yeşil zemin marka rengi değil | 16:9, sağ negatif alan | evet, düşük öncelik | olası stok serisi, teyit gerek |
| 48.png | Live Broadcast | /what-we-do/live-broadcast | 10.png ile neredeyse aynı çekim, alternatif açı | 16:9 | evet | yok, tanınmıyor |

---

## B) CREATIVE klasörü (12 dosya) + kök dizindeki gevşek dosyalar (30 dosya)

**CREATIVE klasörü özet:** 12 dosya, aslında sadece 2 farklı stok
görselin (ampul/"design thinking" + S/B masaüstü flatlay) 8+4
varyasyonundan ibaret. **Brief'in istediği simli/payetli/disko
dokusuna sahip hiçbiri yok.**

| Dosya | Kategori | Kullanım yeri | Güçlü/zayıf | Crop | Web? | Telif/izin |
|---|---|---|---|---|---|---|
| CREATIVE/3.1.png, 3.png, 4.1.png, 4.png | **Kullanılmaması gerekenler** | hiçbiri (mevcut creative.webp'nin kaynağı) | Mor/turuncu ampul stoku, marka renkleriyle çelişiyor | — | hayır | bilinmiyor, stok |
| CREATIVE/5.png | Hero (düşük öncelik) | /what-we-do/creative alternatif | S/B tasarımcı masası, temiz ama jenerik | Laptop+pantone bölümü | düşük öncelik | bilinmiyor, stok |
| CREATIVE/CREATIVE/30.jpg, 31.jpg | **Kullanılmaması gerekenler** | hiçbiri | Aynı ampul görselinin geniş kırpımları | — | hayır | bilinmiyor, stok |
| CREATIVE/CREATIVE/33.jpg | Hero (düşük öncelik) | /what-we-do/creative alternatif | Flatlay, farklı kırpım | Sol pantone/kahve bölümü | düşük öncelik | bilinmiyor, stok |
| CREATIVE/CREATIVE/shutterstock_1636265755(.jpg / kopya.jpg) | **Kullanılmaması gerekenler** | hiçbiri | Ampul görseli varyantları | — | hayır | Shutterstock ID'li, stok |
| CREATIVE/CREATIVE/shutterstock_1711538074 kopya.jpg | Hero (düşük öncelik) | /what-we-do/creative alternatif | S/B flatlay, boş laptop ekranı — üstüne marka rengi bindirilebilir | Merkez kırpım | düşük öncelik | Shutterstock ID'li, stok |
| CREATIVE/CREATIVE/shutterstock_1711538074.jpg | **Kullanılmaması gerekenler** | hiçbiri | Renkli orijinal, marka renklerine hiç uymuyor | — | hayır | Shutterstock ID'li, stok |

**Kök dizin gevşek dosyalar özet:** Karışık içerik — gerçek yayın
ekipmanı çekimleri, İstanbul/Boğaz manzaraları, eski ana sayfa
mood-slide'ları, 3 adet sosyal-medya emoji-el 3D illüstrasyonu ve
kritik risk taşıyan dosyalar (E.T. kopyası, watermark'lı çalıntı
fotoğraf, özel etkinlik fotoğrafları).

| Dosya | Kategori | Kullanım yeri | Güçlü/zayıf | Crop | Web? | Telif/izin |
|---|---|---|---|---|---|---|
| 11288-ks-games-puzzle...jpg1.jpg | Hero (dikkatli) | hiçbiri | Etkileyici Boğaz köprüsü gece manzarası ama bir yapboz kutusu ürün görseli | Panoramik zaten uygun | hayır | telif riski — 3. taraf/yapboz lisanslı stok |
| 13.jpg, 14.jpg, cb5e7cba...png | Digital (düşük öncelik) | /what-we-do/digital | 3D emoji-el illüstrasyon serisi, marka renginde değil | Merkez kırpım | düşük öncelik | bilinmiyor, stok 3D illüstrasyon |
| 17.jpg | Live Broadcast | /what-we-do/live-broadcast | "ON AIR" tabelası + lens, atmosferik | Mevcut kare kırpım | evet | bilinmiyor, muhtemelen kendi çekimi |
| 21.jpg | Live Broadcast | **hero adayı** | Gerçek yayın kontrol/switcher masası, S/B, güçlü | Zaten geniş | evet | bilinmiyor, muhtemelen kendi çekimi |
| 37.jpg | Post Production | /what-we-do/post-production | Ses mikser + waveform overlay; overlay eski/2016 tasarımlı | Waveform kaldırılabilir | düşük öncelik | bilinmiyor, kendi çekimi + eski overlay |
| 38.jpg | Live Broadcast | /what-we-do/live-broadcast | 21.jpg ile eşleşen ikinci açı | Mevcut kırpım yeterli | evet | bilinmiyor, muhtemelen kendi çekimi |
| 46.png | MONA / AI / teknoloji | düşük öncelik | Sarı TV-robot maskotu, amatör 3D render kalitesi | Kare | düşük öncelik (yeniden tasarım öner.) | bilinmiyor, muhtemelen stok/hazır model |
| Attractive_black_and_white...bicycle... kopya.jpg | Hero | **zaten kullanımda** (closing-bicycle.webp kaynağı) | Atmosferik, marka S/B estetiğine uygun; çerçevede "DURCUS ONE" bisiklet logosu var | Gidon detayına kırp, logodan kaçın | evet (mevcutta kullanılıyor) | 3. taraf marka logosu görünür — düşük ama not edilmeli |
| CAM19326 kopya.jpg | **Kullanılmaması gerekenler** | hiçbiri | Filigranı kırpılmış/karartılmış — bkz. Ekran Resmi 19.41.18 | — | hayır | YÜKSEK RİSK — çalıntı/filigranlı 3.taraf fotoğraf |
| Ekran Resmi 2016-01-26 19.44.07 kopya.png | Work / case (doğrulanarak) | /work (onay şart) | Gerçek Renova OOH kampanyası, pembe/sarı tesadüfen marka renginde | Billboard'a odaklı, zaten uygun | düşük öncelik, onay şart | Renova logosu görünüyor — müşteri onayı gerekebilir |
| Ekran Resmi 2016-02-04 23.05.01.jpg | **Kullanılmaması gerekenler** | hiçbiri | Boş/jenerik saat mockup'ı, hangi projeye ait belirsiz | — | hayır | bilinmiyor, muhtemelen UI mockup şablonu |
| Ekran Resmi 2016-04-12 16.01.22.png | **Kullanılmaması gerekenler** | hiçbiri | Özel/candid gece etkinliği, iki kadın tanınabilir | — | hayır | YÜKSEK RİSK — tanınabilir kişiler, rıza yok |
| Ekran Resmi 2016-04-12 18.57.16.png | Culture (doğrulanmadan kullanma) | /culture/who-we-are (onay şart) | İnandırıcı tasarım stüdyosu iç mekanı ama Hibrid'in kendi ofisi olduğu doğrulanamıyor | — | hayır (doğrulanana kadar) | muhtemelen başka bir ajansın referans görseli |
| Ekran Resmi 2016-04-12 19.41.18.png | **Kullanılmaması gerekenler** | hiçbiri | "ANDREAS STAVRIDES PHOTOGRAPHY" filigranı açıkça görünüyor | — | hayır | YÜKSEK RİSK — 3.taraf telifli, tanınabilir çocuk yüzü |
| Ekran Resmi 2016-04-12 19.42.34.png | **Kullanılmaması gerekenler** | hiçbiri | Özel/candid etkinlik, tanınabilir yüzler | — | hayır | YÜKSEK RİSK — rıza yok |
| Ekran Resmi 2016-04-12 20.35.06.png | Work (iç kullanım) | hiçbiri | 2016 tarihli soyut "TEAM 1/2/3" pitch grafiği, güncel değil | — | hayır | bilinmiyor, eski pitch deck |
| Ekran Resmi 2016-12-16 23.55.17.png | Work/Culture (doğrulanarak) | /culture veya /work (onay şart) | Sarı-siyah düoton, HIBRID360 logosu görünüyor, marka paletiyle şaşırtıcı uyum | Zaten portre kırpım | düşük öncelik, onay şart | tanınabilir kişi — rıza/güncel onay kontrol edilmeli |
| NEW_web_background_original_yellow-1 kopya.jpg | Hero (deneysel, düşük öncelik) | ana sayfa hero alternatif | Atmosferik silüet ama karanlık, marka bağlantısı zayıf | Zaten geniş | düşük öncelik | bilinmiyor, muhtemelen stok |
| Office_Site_2014_Studio_Images-012 kopya.jpg | **Kullanılmaması gerekenler** | hiçbiri | Başka bir stüdyonun kendi tanıtım fotoğrafı görünüyor (duvarda 3.taraf posterler) | — | hayır | telif riski — izinsiz kullanılamaz |
| _MG_0295.jpg | **Kullanılmaması gerekenler** | hiçbiri | Ham kamera dosyası, özel/candid, tanınabilir yüzler | — | hayır | YÜKSEK RİSK — rıza yok |
| dandelion...kopya.jpg, g3u5bqiziep.jpg | Hero (emekli) | hiçbiri | Eski sitenin mood-slide'ları, S/B minimalist ama anlamsız marka bağlantısı | — | hayır | bilinmiyor, stok |
| house-bw1.jpg | Hero | hiçbiri | Göl kenarı ev/iskele, ajans hizmetleriyle ilgisi yok | — | hayır | bilinmiyor, stok |
| istanbul-07 kopya.jpg | Hero (düşük öncelik) | ana sayfa hero / /contact | Panoramik Boğaz köprüsü gecesi, 11288-ks ile tekrar riski | Zaten panoramik | düşük öncelik | bilinmiyor, muhtemelen stok |
| lessismore-940x555 kopya.jpg | Hero | hiçbiri | Aşırı soyut (kablo halkası), Creative'in aradığı dokuyla ilgisi yok | — | düşük öncelik | bilinmiyor, stok |
| maxresdefault kopya.jpg | **Kullanılmaması gerekenler — ASLA** | hiçbiri | **E.T. filminin afiş görüntüsünün birebir kopyası** | — | hayır | ÇOK YÜKSEK RİSK — telifli film IP'si |
| negativecoffee.jpg | Culture (düşük öncelik) | /culture ofis kültürü | Minimalist S/B kahve fincanı, jenerik ama uygun estetik | Zaten kare | düşük öncelik | bilinmiyor, stok |
| shutterstock_1039387927.jpg | Photography (yeniden üretilmeden hayır) | /what-we-do/photography ikon fikri | Eğlenceli 3D kamera render ama pembe/turuncu/mavi marka dışı | Zaten yatay | hayır (marka rengine göre yeniden üretilmeden) | Shutterstock ID'li — lisans doğrulanmalı |

---

## C) PRODUCTION, SHOOTİNG-PRODUCTION, POST PRODUCTION, LIVE BROAD CAST, EVENT MANAGEMENT, ANA SAYFA, COME OVER FOR A COOFFE (34 dosya)

**Genel:** Çoğu klasör aynı Shutterstock kaynak görsellerinin hem ham
hem de marka rengine boyanmış (duoton S/B/sarı/fuşya) tekrarlarından
oluşuyor. Gerçek özgün 8K içerik esasen `SHOOTİNG -PRODUCTION`
klasöründe. `EVENT MANAGEMENT` mevcut seçimi doğruluyor (değişiklik
gerekmiyor); `LIVE BROAD CAST/22.png` = `POST PRODUCTION/22.png` ve
`LIVE BROAD CAST/29.png` = `POST PRODUCTION/29.png` **birebir aynı
dosyalar** (MD5 doğrulandı) — doğru klasör Live Broadcast.

### PRODUCTION (11 dosya)

| Dosya | Kategori | Kullanım yeri | Güçlü/zayıf | Crop | Web? | Telif/izin |
|---|---|---|---|---|---|---|
| 25.jpg, 26.jpg, 27.jpg | Production | production galeri | Duoton kulis fotoğrafları, mevcut renkli hero'dan soluk; SHOOTİNG-PRODUCTION'daki shutterstock dosyalarının duotonu | Zaten 16:9 | evet | bilinmiyor, muhtemelen stok — lisans teyidi gerek |
| 29.jpg | Hero (kontrast düzeltmeli) | ana sayfa/what-we-do hero | "YOUR STORY / HIBRID 360" klaketi, gerçek marka metni var; **fuşya zeminde beyaz metin — WCAG ihlali, siyah olmalı** | Sol negatif alan metne uygun | evet, metin kontrastı düzeltilerek | klaket objesi muhtemelen stok |
| 32.jpg | **Kullanılmaması gerekenler** | hiçbiri | Restoranda iki kişi, 3 kopyası daha var (studyo_5.jpg, ANA SAYFA/19-20.jpg) | — | hayır (tekrar) | tanınabilir yüzler + 3.taraf mekan — yüksek risk |
| 34.jpg | Hero (düşük öncelik) | ana sayfa/production alternatif | Kamera silüeti, marka sarısıyla uyum; jenerik | Zaten hazır | evet | muhtemelen stok, bilinmiyor |
| 35.jpg | Production | production galeri | Otantik kulis (mutfak çekimi); 8K renkli kaynağı (14.png) kendi arşivlerine işaret ediyor | Zaten wide | evet | düşük risk, muhtemelen kendi çekimi |
| 36.jpg | Live Broadcast | live-broadcast alternatif | Yayın kamerası+teleprompter, dış mekan; renkli kaynakta (17.png) bulanık 3.taraf logo | Dikey kırpılabilir | evet | dikkat — 3.taraf logo riski |
| 39.jpg | Live Broadcast | live-broadcast/cloud-tv galeri | Çoklu kamera/monitör sahnesi | Zaten wide | evet | düşük-orta risk, muhtemelen kendi çekimi |
| deal-hero-image.jpg | Production | **production hero adayı** | Renkli, doğal ışık, otantik BTS — güçlü alternatif; kişi kısmen tanınabilir | Dikey/kare, kişiye odak | evet, iyi çözünürlük | bilinmiyor, tanınabilir yüz varsa rıza teyidi gerek |
| shutterstock_1267273540.jpg | **Kullanılmaması gerekenler** | hiçbiri | Boş "YOUR STORY" klaketi, mavi/sarı, marka dışı; 29.jpg'nin ham kaynağı | — | hayır | Shutterstock — lisans doğrulanmadan kullanılmaz |

### SHOOTİNG -PRODUCTION (11 dosya)

| Dosya | Kategori | Kullanım yeri | Güçlü/zayıf | Crop | Web? | Telif/izin |
|---|---|---|---|---|---|---|
| 10.png | Hero | **production hero — güçlü aday** | Pembe/mor ışıklı kamera, production.webp ile aynı konsept, çok yüksek çöz. (25MB) | Zaten 16:9 | evet, zorunlu sıkıştırma | düşük risk, muhtemelen kendi seti |
| 14.png | Production | production galeri | Otantik mutfak/el kamerası, 8K net | Zaten wide | evet, sıkıştırma şart (35MB) | düşük risk, muhtemelen kendi çekimi |
| 17.png | Live Broadcast | live-broadcast alternatif | Dış mekan çatı üstü yayın kamerası; camda bulanık 3.taraf logo | Dikey kırpılabilir | evet, sıkıştırma şart (28MB) | dikkat — mekan telifi teyit edilmeli |
| 20.png | **Kullanılmaması gerekenler** | hiçbiri | Kamera silüeti beyaz fonda; 34.jpg'nin sarı fonlu versiyonu zaten var | — | hayır, gereksiz | bilinmiyor, olası stok |
| 25.png | **Kullanılmaması gerekenler** | hiçbiri | 3D render "DIRECTOR" sandalyesi, jenerik/ucuz | — | hayır | kesin stok 3D render |
| 42.png | Live Broadcast | live-broadcast/cloud-tv galeri | Renkli çoklu kamera/monitör, gerçek prodüksiyon (42MB) | Zaten wide | evet, zorunlu sıkıştırma | düşük risk, muhtemelen kendi çekimi |
| shutterstock_1042050784.jpg, shutterstock_1042050787.jpg | **Kullanılmaması gerekenler** | hiçbiri | 25.jpg/27.jpg'nin ham kaynakları | — | hayır | Shutterstock — lisans doğrulanmalı |
| shutterstock_104724869.jpg, shutterstock_1131022427.jpg | Production (düşük öncelik) | hiçbiri/düşük öncelik | S/B mikrofon/kamera detayları, jenerik stok | Kare kırpılabilir | düşük öncelik | Shutterstock — lisans doğrulanmalı |
| studyo_5.jpg | **Kullanılmaması gerekenler** | hiçbiri | PRODUCTION/32.jpg ile birebir aynı (3. kopya) | — | hayır | tanınabilir yüzler — yüksek risk |

### POST PRODUCTION (6 dosya)

| Dosya | Kategori | Kullanım yeri | Güçlü/zayıf | Crop | Web? | Telif/izin |
|---|---|---|---|---|---|---|
| 22.png | **Kullanılmaması gerekenler** | hiçbiri | Ses mikser + sabit waveform overlay; LIVE BROAD CAST'te birebir kopyası var | — | hayır | muhtemelen stok kompozit |
| 29.png | Live Broadcast | live-broadcast/cloud-tv galeri (yanlış klasöre konmuş) | Gerçek TV galeri/vision mixer + yeşil ekran; LIVE BROAD CAST/29.png ile **birebir aynı** | Zaten wide | evet, sıkıştırma şart | bilinmiyor, muhtemelen stüdyo tesisi |
| Resolve_Crop_Master-1.jpg | Post Production | post-production detay galerisi | DaVinci Resolve trackball yakın çekim, hero'yu değiştirecek güçte değil | Zaten 21:9 | evet, küçük dosya | jenerik stok başlığı — lisans bilinmiyor |
| Video-Post-Production-Services.jpg | **Kullanılmaması gerekenler** | hiçbiri | Renk düzeltme paneli, kalite iyi ama dosya adı 3.taraf kaynak gösteriyor | — | hayır | YÜKSEK RİSK — üçüncü taraf ajans sitesi |
| roof_fix_1.2.1.jpg | Post Production (riskli) | post-production hero adayı | Tam grading tiyatrosu, sinematik ama ekranda tanınabilir 3.taraf içerik/model | Zaten 21:9 sinema oranı | evet, düşük çöz. (2602×1076) | YÜKSEK RİSK — kaynak teyidi şart |
| thumb_955_blogs_big.jpg | **Kullanılmaması gerekenler** | hiçbiri | Çok düşük çözünürlük (~900×497), blog thumbnail kalitesi | — | hayır | 3.taraf blog/CMS kaynağı |

### LIVE BROAD CAST (4 dosya)

| Dosya | Kategori | Kullanım yeri | Güçlü/zayıf | Crop | Web? | Telif/izin |
|---|---|---|---|---|---|---|
| 11.png | Live Broadcast | live-broadcast galeri/detay | Gerçek switcher paneli, mor/mavi ışık marka rengine yakın; çok yakın çekim | Biraz uzaklaştırılabilir | evet, sıkıştırma şart (23MB) | düşük risk, muhtemelen kendi ekipmanı |
| 22.png | **Kullanılmaması gerekenler** | hiçbiri (POST PRODUCTION/22.png ile aynı) | — | — | hayır | aynı notlar |
| 29.png | Live Broadcast | **doğru klasör burası** | POST PRODUCTION/29.png ile birebir aynı | Zaten wide | evet | bilinmiyor |
| shutterstock_77786614.jpg | Hero | **mevcut live-broadcast.webp'nin muhtemel kaynağı** | Kamera lensi + "ON AIR" tabelası, mevcut hero ile neredeyse birebir aynı konsept | Zaten hazır | evet | **öncelikli kontrol**: shutterstock — lisans teyidi (mevcut hero buysa lisans zaten var demektir) |

### EVENT MANAGEMENT (2 dosya)

| Dosya | Kategori | Kullanım yeri | Güçlü/zayıf | Crop | Web? | Telif/izin |
|---|---|---|---|---|---|---|
| 16.jpg | Event Management | event-management (mevcut hero'yla aynı/çok yakın) | S/B sahne ışığı + silik Hibrid logosu | Zaten dar/dikey | evet | düşük risk, muhtemelen kendi çekimi |
| event2.jpg | Event Management | event-management galeri/alternatif | 16.jpg'nin geniş versiyonu, kadrajda EXIT tabelası | Sağdan kırp, EXIT'i kadraj dışına al | evet | aynı, muhtemelen kendi çekimi |

*Not: Bu iki dosya mevcut `event-management.webp` ile aynı kaynağa
işaret ediyor — yeni bir üstünlük sunmuyor, mevcut seçim doğrulanıyor.*

### ANA SAYFA (2 dosya)

| Dosya | Kategori | Kullanım yeri | Güçlü/zayıf | Crop | Web? | Telif/izin |
|---|---|---|---|---|---|---|
| 19.jpg, 20.jpg | **Kullanılmaması gerekenler** | hiçbiri | PRODUCTION/32.jpg ve studyo_5.jpg ile aynı fotoğraf (restoranda iki kişi) — 3-4 kopyası var | — | hayır | tanınabilir yüzler — yüksek risk, rıza bilinmiyor |

### COME OVER FOR A COOFFE (1 dosya)

| Dosya | Kategori | Kullanım yeri | Güçlü/zayıf | Crop | Web? | Telif/izin |
|---|---|---|---|---|---|---|
| 5.png | Culture (yeniden kullanılmamalı) | hiçbiri | S/B üstten tasarımcı masası flat-lay — eski sitenin "come over for a coffee" bölümünün kaynağı; kaliteli ama çok yaygın stok temalı kompozisyon | Zaten kare/geniş | düşük öncelik | muhtemelen stok flat-lay — lisans doğrulanmalı |

---

## Kategori bazlı hızlı sayım

| Kategori | Yaklaşık dosya sayısı |
|---|---|
| Kullanılmaması gerekenler | ~35 |
| Web için uygun / yüksek öncelik (hero/servis adayı) | ~20 |
| Web için uygun / düşük öncelik ya da onay şartlı | ~40 |
| Kategori dışı / iç kullanım (pitch grafiği vb.) | ~5 |
| Belirsiz / doğrulanmadan karar verilemez | ~19 |

(119 toplam — sayılar yaklaşık, bazı dosyalar birden fazla notta
geçtiği için tam toplama denk gelmeyebilir.)
