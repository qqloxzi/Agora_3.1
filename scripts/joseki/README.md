# Joseki Sonrası — PDF → JSON hattı

"AI 围棋定式大全" PDF kesitlerini `src/data/joseki/<slug>.json` dosyasına çevirir
(web ve mobil aynı JSON'u kullanır: `Go_Akademisi_mobil/src/data/joseki/`).

1. `pip install --user pymupdf`
2. `python3 extract.py <pdf> raw_<ad>.json` — taşlar, numaralı hamleler, A–G harfleri, × işaretleri, "3=A" / "弃权" dipnotları, Çince açıklama
3. `tr_<ad>.py` — her diyagram kodu için `(başlık, değerlendirme, sade açıklama)`. Değerlendirme: best | ok | situational | bad
   (terimler: "yapışma" — "temas" değil, "pincer" — "kıskaç" değil, "keima", "işgal" — "invazyon" değil; açıklamalar çok sade)
4. `cfg_<slug>.py` — SLUG, TITLE, SUBTITLE, DESCRIPTION, SOURCE, RAW, ROOT, PAGE_OFFSET, TR
5. `final_<slug>.py` (isteğe bağlı) — `{kod: (başlık, açıklama)}`: sitede görünen son, sade metin; varsa `TR`'deki başlık ve açıklamanın yerine geçer
   (terimler: "merkez" — "dış güç" değil, "işgal" — "girmek" değil, "boşluk" — "aralık" değil; kısa ve akıcı cümleler)
6. `python3 build.py cfg_<slug>` → `<slug>.json` (birleşik hamle ağacı + alıştırmalar; her diyagram yakalama kurallarıyla doğrulanır)
7. JSON'u iki projedeki `src/data/joseki/` klasörüne kopyala, `JOSEKI_LIST`'e ekle (`src/lib/joseki.js` + mobil `src/lib/joseki.ts`)
   ve `josekiCatalog` (web .js + mobil .ts) içindeki ilgili kutuya `slug` ver.
8. `python3 sync_catalog.py` — kataloglara `exercises` sayılarını ve ana sayfa kartının önizlemesini (JOSEKI_HOME_PREVIEW) yazar.
   Ana sayfa büyük joseki JSON'larını yüklemez; sayıları buradan okur, bu yüzden her yeni joseki/alıştırma değişikliğinden sonra çalıştır.

Bir PDF kesiti birden fazla joseki içerebilir: `build.py` ham dosyadan yalnızca `ROOT` ile başlayan diyagramları alır.

Mevcut: cfg_hoshi_kogeima (keima), cfg_hoshi_ikken_tobi (bir boşluklu zıplama), cfg_hoshi_ikken_basami (alçak bir aralık pincer),
cfg_hoshi_ikken_basami_high, cfg_hoshi_niken_basami, cfg_hoshi_niken_basami_high (raw_441.json),
cfg_hoshi_kosumi_tsuke, cfg_hoshi_ogeima, cfg_hoshi_tsuke_osae, cfg_hoshi_niro_keima (raw_808.json).

## 2026-09-29 değişiklikleri
- "İyi mi, kötü mü?" alıştırmaları tamamen kaldırıldı: build.py artık sadece "Josekiyi oyna" (`seq-…`) üretir; mevcut JSON'lardan da silindi (212 alıştırma kaldı), `sync_catalog.py` sayıları güncelledi.
- Joseki Sonrası sayfasının üstünde bütün josekiler tek tahtada: `allJoseki()` (web `src/lib/joseki.js`, mobil `src/lib/joseki.ts`) ağaçları ortak kökte (hoshi + keima kakari) birleştirir; aynı pozisyondan aynı hamle tek düğüm olur.
- Atölyeler → Gelişim'de Tesuji'lerden sonra her joseki bir kutu (`joseki-<slug>`), dersleri o josekinin "Josekiyi oyna" alıştırmaları; lesson id `joseki:<slug>:seq-…` Joseki Sonrası ile ortak.

## 2026-09-30: ~/Desktop/ilovepdf_split-range (kitap s. 1033–3307) — 25 yeni joseki
- `python3 extract.py <pdf> raw_<başlangıç-bitiş>.json <A|B>` — 3. argüman başındaki harfi kaybolan başlıkların bölümü.
  extract.py artık ızgarayı 19 tahta çizgisinden hesaplar (yıldız noktaları taşların altında kalabiliyor) ve "2=A" gibi
  harfli taşa işaret eden dipnotlarda o taşı başlangıç taşlarından çıkarır.
- build.py yenilikleri: `SKIP` (kitapta basıldığı gibi oynanamayan diyagramlar), `EXTRA` (PDF kesitinde giriş sayfası
  olmayan dallar için elle kök diyagram), başlangıç pozisyonunu içermeyen tam tahta maç örnekleri otomatik atlanır
  (ekrana `SKIP (no anchor…)` yazar). Eski josekiler birebir aynı derleniyor (kontrol edildi).
- Yeni cfg/tr: hoshi_tenuki, hoshi_sansan (tr_sansan), hoshi_alttan_yapisma (tr_alttan), komoku_keima_kakari_* (tr_komoku_keima1–4),
  komoku_yuksek_kakari_* (tr_komoku_yuksek1–4), komoku_buyuk_keima_kakari / iki_bosluklu_yuksek_kakari / yandan_yapisma (tr_komoku_diger),
  komoku_*_kapatma (tr_kapatma1–3).
- Kesik bölümler alınmadı: A-4 (yüksek kakari, yalnız giriş), B-1-4, B-1-9, B-2-5, B-2-11 (yalnız giriş), C-1 (3-3, 2 diyagram).
- Katalog girişlerinde `group` var; Joseki Sonrası kartları bu başlıklarla gruplanır, `allJoseki()` boş tahtadan her
  josekinin başlangıç taşlarını sırayla (gerekirse tenuki) oynayarak hepsini tek ağaçta birleştirir.

## 2026-09-30 (2): ~/Desktop/son josekiler (kitap s. 3306–3527) — C bölümü, 5 yeni joseki
- Üç PDF'in C diyagramları tek dosyada: `raw_C.json` (sayfalar kitabın mutlak sayfası, `PAGE_OFFSET = 0`).
  extract.py artık iki satıra bölünmüş "变化 / 图C-…" başlıklarını da okur.
- build.py: `PREFIXES` (isteğe bağlı) — birden çok alt bölümü elle yazılmış tek bir `ROOT` diyagramı altında toplar.
- cfg_ucuc (C-1, 3-3 Noktası), cfg_mokuhazushi_ucuc_kakari (C-2-1), cfg_mokuhazushi_komoku_kakari (C-2-2, taisha),
  cfg_mokuhazushi_diger (C-2-3/4/5, kök C-2-X), cfg_takamoku (C-3, giriş sayfası 3506 kesitte yok → EXTRA).
  Metinler: tr_ucuc, tr_mokuhazushi1–3. C-2-0 (tanıtım) ve C-4 (süper takamoku, yalnız giriş + 1 diyagram) alınmadı.
- Katalog grupları '3-3', 'Mokuhazushi', 'Takamoku' → Atölyeler'de Aydınlanma.
