# Ekosistem etkileşimi: uygulama ve doğrulama

Tarih: 2026-08-27

Dal: `codex/ecosystem-interactions`

Başlangıç: `origin/claude/phase-0-setup-amip8r`, `14bab227`.
Kapsam yalnızca ana sayfanın Hibrid ekosistem bölümüdür. HIBRID hero
wordmark animasyonu, MONA, diğer sayfa tasarımları ve Supabase değişmedi.

## Uygulanan davranış

- Kullanıcının mevcut sarı kristal videosu korundu. Yeni görsel veya AI
  videosu üretilmedi.
- Video, halkalar, arka plan ve parçacıklar aynı Canvas yüzeyinde çizilir.
  Siyah video pikselleri `screen` birleştirmesiyle sahneye karışır; bu
  gerçek alfa kanalı değildir.
- Küçük hizmet küreleri düz fuşya/sarı noktalara dönüştürüldü. Görsel çap
  masaüstünde 8px, mobilde 9px; tıklama/dokunma alanı 44px olarak kaldı.
- Kristal boşta sürekli döner. Kristalin üstündeyken video durur;
  imleç ayrıldığında aynı konumdan devam eder. Diğer noktalar hareketini
  sürdürebilir. Tüm sahne için ayrıca duraklat/devam düğmesi vardır.
- Sayfa aşağı/yukarı kaydırıldığında kristal ileri/geri sarılır. Kaydırma
  bittikten 180ms sonra normal döngüye döner. Hover, manuel duraklatma ve
  azaltılmış hareket tercihi kaydırmadan önceliklidir; bekleyen kaydırma
  hareketleri sonradan atlamaya neden olmaz.
- Noktalar sürüklenip bırakıldığında yaklaşık 0.9 saniyelik sönümlü dönüşle
  hareket eden yörüngelerine yerleşir. 6px eşik tıklamayı sürüklemeden ayırır.
  Escape, pointer cancel, pencere odağının kaybı ve boyut değişimi ele alınır.
- İzler sabit çizgi değil, gerçek konum geçmişinden yayılan küçük
  parçacıklardır. Sürükleme yolunu takip eder; yakındaki fare konumundan
  hafifçe uzaklaşır ve 1.2-2 saniyede söner.
- Tıklama/dokunma hizmetin kısa açıklamasını sahnenin altında açar.
  Açıklamalar mevcut TR/EN içerikten gelir; bağlantılar gerçek hizmet
  rotalarına gider. Escape/kapat odağı ilgili noktaya döndürür.
- Mobilde iki halka ve daha yavaş hareket kullanılır. Noktada sürükleme
  yapılabilir; sahnenin boş alanından başlayan dikey kaydırma engellenmez.
- Klavye ile açma/kapatma, görünür odak, `aria-expanded`, `aria-controls`,
  TR/EN erişilebilir düğme adları ve açık detay için axe denetimi eklendi.

## Medya ve performans

`public/videos/hibrid-stone-interactive.mp4` mevcut optimize MP4'ten
türetildi; önceki MP4/WebM ve poster dosyaları kaynak olarak korunur.

| Özellik | Değer |
| --- | --- |
| Boyut | 1,651,526 bayt, yaklaşık 1.65 MB |
| Çözünürlük | 512 x 512 |
| Kare hızı / uzunluk | 24 fps, 165 kare, 6.875 saniye |
| Kodlama | H.264, bütün kareler I-frame, B-frame yok, ses yok |
| Renk aralığı | Full-range YUV 4:2:0, `color_range=pc` |
| Yükleme | Bölüme 300px yaklaşınca; ilk ekran için video isteği yok |
| Azaltılmış hareket | Video yüklenmez; mevcut poster çizilir |

Dosya normal oynatım kaynağından büyüktür: bağımsız I-frame'ler ileri/geri
kare erişimi için bilinçli bir tercihtir. Sayfa iki video formatını birden
indirmez. Bölüm ekrandan çıkınca ve sekme gizlenince oynatım/rAF durur.
Parçacık havuzu masaüstünde en fazla 192, mobilde 96 öğedir. Canvas DPR
üst sınırı masaüstünde 2, mobilde 1.5'tir. Her kare React render'ı yapılmaz.

Kodlama komutu (FFmpeg geliştirme aracı, uygulama bağımlılığı değildir):

```sh
ffmpeg -i public/videos/hibrid-stone.mp4 -an \
  -vf scale=in_range=tv:out_range=pc \
  -c:v libx264 -preset slow -crf 21 -g 1 -bf 0 \
  -pix_fmt yuvj420p -color_range pc -movflags +faststart \
  public/videos/hibrid-stone-interactive.mp4
```

128px RGB örnekleme denetiminde bütün karelerin dört köşesi siyahtır.
Son/ilk kare ortalama mutlak farkı 1.703; normal komşu karelerin ortalaması
2.824'tür. Bu ölçüm tek başına kusursuz döngü kanıtı sayılmaz; ayrıca
tarayıcıda üç tam tur ve görünür Canvas pikselleri test edilir.

## WebKit sırasında bulunanlar

1. Gizli kaynak video 1px boyutlandırıldığında Windows WebKit video
   görüntüsünü tek renge indiriyordu. Kaynak artık gerçek boyutlu, sahne
   merkezinde ve kırpılarak gizlidir; Canvas görünür çıktıyı üretir.
2. Limited-range video bu tarayıcıda siyah yerine gri mat oluşturuyordu.
   Full-range türev ile giderildi. Testler yalnızca "Canvas dolu mu"
   demiyor; köşelerin siyahlığını ve kristalin renk çeşitliliğini de ölçüyor.
3. Döngü/seek sırasında geçici `AbortError`, kalıcı autoplay hatası gibi
   işleniyordu. En fazla iki gecikmeli yeniden deneme eklendi. İzin veya
   desteklenmeyen medya hataları her karede yeniden denenmez.
4. Hedef zaman gerçek video karesine yuvarlanır; decoder saati yuvarlasa
   bile aynı kareye sonsuz seek gönderilmez. Son çözülen kare, seek/döngü
   arasında tamponda tutulur; poster-video geçişi tekrarlanmaz.

## Doğrulama

İlk etkileşim uygulamasının doğrulama sonuçları:

| Kapı | Sonuç |
| --- | --- |
| `npm run lint` | Hata/uyarı yok |
| `npm run typecheck` | Geçti |
| `npm run test` | 96/96 geçti |
| `npm run test:e2e -- --workers=3` | 92/92 geçti; mevcut 77 test dahil |
| Chromium + WebKit ekosistem paketi | 29 geçti, 1 açıkça atlandı |
| WebKit ileri/geri kaydırma tekrarı | Son 5 bağımsız çalıştırma geçti |
| `npm run build` | Geçti; 66 statik sayfa üretildi |
| `git diff --check` | Boşluk hatası yok |
| Üretim önizlemesi | `http://localhost:3000/tr`, `next start` |

Üretim sunucusunda `/tr`, `/en`, `/tr/work`,
`/tr/what-we-do/ai-creative-production`, `/robots.txt`, `/sitemap.xml` ve
yeni MP4 200 döndü. Uygulama içi tarayıcıda üretim derlemesi 1440px ve
390px genişlikte ayrıca gözle kontrol edildi: video/Canvas dolu,
hover duraklatıp devam ettiriyor, mobil detay alanı kırpılmıyor;
ana sayfada bir `main` ve bir `h1` var. Geçici ekran boyutu ayarı kaldırıldı.

Piksel ve görsel testleri 390/768/1440px ekran görüntülerini
`test-results/**/ecosystem-*.png` altında üretir. Her test çalıştırması bu
geçici klasörü yeniler. Ana sayfa için build'in raporladığı First Load JS
142 kB'dır; bu değer video transfer boyutunu veya Lighthouse puanını içermez.

Tekrar çalıştırma:

```sh
npm install
npx playwright install chromium webkit
npm run lint
npm run typecheck
npm run test
npm run test:e2e -- --workers=3
npx playwright test --config=playwright.ecosystem.config.ts --workers=2
npm run build
```

Ekosistem testleri: hover önceliği, ileri/geri kaydırma, sekiz noktanın
sürüklenip dönmesi, Escape sonrası yeniden tıklama, TR/EN klavye ve detay
erişilebilirliği, manuel duraklatma, ekran dışı durma, azaltılmış hareket,
ilk ekran yükleme bütçesi, 390/768/1440px taşma/piksel denetimi, üç video
döngüsü, dokunarak detay açma ve doğal mobil kaydırma.

Dokunmatik sürükleme testinin giriş mekanizması Chromium CDP olduğundan
aynı test WebKit'te açıkça atlanır; WebKit'te dokunarak açma ayrıca test
edilir. Windows WebKit, gerçek Safari/iPhone cihaz testi değildir.
[Playwright tarayıcı kapsamı](https://playwright.dev/docs/browsers#webkit).

### 2026-08-27: boyut ve hız ayarı

- Kristal ölçeği `0.85`: Canvas, poster ve hover alanı %15 küçültüldü.
- Otomatik oynatım hızı `0.8`: bir tur yaklaşık 8.59 saniye sürer.
  Kaydırma tepkisi, yörüngeler ve küçük noktaların hızı değiştirilmedi.
- Lint, typecheck, 97 birim testi ve üretim build'i geçti; 66 sayfa üretildi.
- Odaklı Chromium/WebKit çalıştırmasında 14 testin 13'ü geçti. WebKit üç
  döngü testinde tek örnek kare boş olarak ölçüldü; aynı test tek başına
  yeniden çalıştırıldığında geçti. Bu sonuç kesintisiz 14/14 geçiş değildir.
  Boş karelerin zaman ve decoder durumunu raporlayan tanı çıktısı eklendi.
- Güncel üretim önizlemesinde 1440px ve 390px görsel kontrol yapıldı.
  Gerçek medya hızı `0.8` ve %15 küçülmüş hover alanı DOM üzerinden doğrulandı.
  Bu dar kapsamlı ayarda bütün site E2E paketi yeniden çalıştırılmadı.

## Değişen dosyalar

- `src/components/hero/SolarSystem.tsx`: sahne, medya ve pointer yaşam döngüsü.
- `src/components/hero/SolarSystem.module.css`: düz noktalar, mobil düzen,
  detay alanı ve oynatım kontrolü.
- `src/lib/solar-motion.ts`: saf dönüş/parçacık ve medya durum yönetimi.
- `src/data/solar-system.ts`: kompakt yörüngeler ve etkileşimli medya kaynağı.
- `src/data/solar-system.test.ts`: hareket ve medya regresyonları.
- `src/messages/tr.json`, `src/messages/en.json`: üç kontrol etiketi.
- `e2e/solar-system.spec.ts`, `playwright.ecosystem.config.ts`: çapraz
  tarayıcı doğrulaması.
- `public/videos/hibrid-stone-interactive.mp4`: mevcut videodan türev.
- `docs/DECISIONS.md` ve bu rapor: son kullanıcı kararı ve denetim kaydı.

## Sınırlar ve kalan işler

- Gerçek iPhone/iPad Safari, düşük güç modu ve eski Android cihazlarda
  fiziksel cihaz kontrolü yapılmadı. Autoplay engellenirse poster korunur.
- Bu tur genel Lighthouse/Core Web Vitals ölçümü değildir; bütün sitenin
  performansına ilişkin yeni bir puan veya cihazdan bağımsız FPS iddiası yoktur.
- Çalışma yereldir; bu tur commit, push, merge veya Vercel deploy yapılmadı.
- Works envanteri, MONA karakter/ses prodüksiyonu, onaylı çeviriler ve yasal
  teyitler gibi mevcut proje blocker'ları bu çalışmayla kapanmaz.
