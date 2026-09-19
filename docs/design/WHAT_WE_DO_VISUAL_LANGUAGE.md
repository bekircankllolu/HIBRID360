# What We Do — görsel dil ve üretim seti

**Durum:** üretim BEKLİYOR — Higgsfield konnektörü bu oturumda bağlı değil.
Bu belge hazır; bağlantı açılınca promptlar sırayla çalıştırılıp çıktılar
aşağıdaki teknik kurallara göre dışa aktarılır.

**Neden:** 18 Eylül 2026, kullanıcı: *"what-we-do sayfası içindeki görselleri
revize etmek lazım. biraz daha profesyonel ve 4k kalitesinde premium görseller
lazım. bunları da higgsfield kullanarak üret. ama bir görsel tarz oluştur ve
hepsinde aynı görsel dil olsun."*

Bugünkü durum: sekiz hizmetin görselleri üç ayrı kuşaktan geliyor (eski site
türevleri, AI "editorial-v2" seti, müşteri arşivinden duotone fotoğraflar).
Aynı sayfada üç ayrı ışık, üç ayrı renk sıcaklığı, üç ayrı kadraj mantığı var.
Sorun çözünürlük değil, DİL BİRLİĞİ.

---

## 1. Görsel dil (hepsinde aynı)

| Katman | Kural |
|---|---|
| Zemin | Siyah baskın. Kadrajın en az %40'ı gerçek karanlık (RGB < 20). |
| Renk | Tek kromatik aksan: marka sarısı. Sahnede FİLTRE olarak değil, PRATİK IŞIK olarak — ekran parıltısı, LED panel, spot, tungsten sızıntısı. Fuşya yalnız tek bir küçük nokta (bir gösterge ışığı, bir kablo etiketi) ya da hiç. |
| Ton | Ortalama parlaklık düşük, highlight'lar sıcak, gölgeler hafif soğuk. Cilt tonları korunur — duotone YOK (duotone geçici çözümdü; premium his kaybettiriyor). |
| Lens | 35 mm ya da 50 mm hissi, f/2 civarı sığ alan derinliği. Geniş açı bozulması yok. |
| Kadraj | 3:2 yatay. Konu merkezden hafif kaçık (üçte bir), önde bir nesne bulanık geçiş (foreground bokeh) — derinlik hissi bununla kuruluyor. |
| İnsan | Her karede en fazla iki kişi, İŞ YAPARKEN — kameraya bakan, gülümseyen "stok" poz YOK. Yüzler kısmen gölgede; kimlik değil, eylem anlatılıyor. |
| Doku | Hafif film grenli, temiz. HDR parlaması, aşırı keskinleştirme, plastik cilt yok. |
| Metin | Görselin İÇİNDE yazı YOK — tipografi sayfanın işi. |

**Tutarlılık çapası:** her prompt aynı üç cümleyle biter (ışık, lens, doku).
Bunlar aşağıda `ORTAK_KUYRUK` olarak tek yerde duruyor; hizmete özgü kısım
yalnız ilk cümle.

```
ORTAK_KUYRUK =
"Lit by a single practical source with warm yellow spill against deep black
surroundings, one small magenta indicator light as the only other colour.
Shot on a 50mm lens at f/2, shallow depth of field, an out-of-focus object
crossing the foreground. Muted cinematic grade, fine film grain, natural skin
tones, no text, no logos, no watermark."
```

## 2. Hizmet promptları

Her biri `ORTAK_KUYRUK` ile birleştirilir. Çıktı 16:9 değil **3:2** istenir.

| # | Hizmet | Sahne cümlesi |
|---|---|---|
| 01 | Creative | "Two creatives leaning over a table covered in printed storyboard frames in a dark studio, one pointing at a frame." |
| 02 | Production | "A camera operator's hands on a cinema camera rig during a night shoot, the monitor glowing on their face." |
| 03 | Post Production | "A colourist at a grading desk in a dark suite, control panel trackballs lit from below, reference monitor casting light." |
| 04 | Digital | "A content team reviewing vertical social edits on a wall of small screens in a dim room." |
| 05 | Live Broadcast | "A vision mixer's hands over a broadcast switcher in a dark gallery, a bank of preview monitors out of focus behind." |
| 06 | Cloud TV | "A single engineer in a dark machine room, server status lights receding into the distance, laptop screen lighting their face." |
| 07 | Event Management | "A stage manager with a headset and clipboard watching an empty arena stage during a lighting check." |
| 08 | Photography | "A photographer adjusting a strobe softbox on a dark set, the modelling light spilling across the floor." |

> **AI Creative Production** listede görsel ALMAZ — orada sahneyi MONA'nın
> partikül küresi dolduruyor (18 Eylül 2026'da uygulandı, `ServiceDirectory`
> + `MonaShard placement="center"`).

## 3. Teknik dışa aktarım

1. Üretim en yüksek çözünürlükte (4K sınıfı) yapılır; **kaynak dosya saklanır**.
2. Siteye giden türev: 3:2, **2400x1600 webp, quality 82** (mevcut
   `scripts/generate-service-photos.mjs` ile aynı hat — `duotone: false`).
   4K'nın kendisi siteye KOYULMAZ: ilk yükleme bütçesi < 2 MB (CLAUDE.md).
3. `src/data/site-images.ts` içinde `src`, iki dilde `alt` ve `focus`
   güncellenir. Alt metin görseli betimler, sloganı tekrarlamaz.
4. Kontrol: `node scripts/…` sonrası kontrast taraması yeniden koşulur —
   sahne etiketleri (derece + hizmet adı) fotoğrafın üzerinde AA'yı geçmeli.

## 4. Kabul ölçütleri

- [ ] Sekiz görsel yan yana konduğunda tek bir çekimden çıkmış gibi duruyor.
- [ ] Hiçbirinde yazı, logo, filigran yok.
- [ ] Her birinde sarı ışık sahnenin İÇİNDEN geliyor (filtre değil).
- [ ] Yüzler tanınabilir bir gerçek kişiye benzemiyor (telif/kişilik hakkı).
- [ ] 2400px türevler 200 KB'ı aşmıyor.
- [ ] Sahne etiketleri fotoğraf üzerinde AA kontrastı sağlıyor.
