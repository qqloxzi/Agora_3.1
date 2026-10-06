# Bulmaca PDF içe aktarma (101weiqi kitapları)

`specialized-training-in-tesuji-4.pdf` → `go_problems` (category `Bulmaca`, tag `Tesuji`, rank `10 Kyu`, sort_order 101–398).

1. `python3 extract_tesuji4.py <pdf>` → `raw_tesuji4.json` (diyagramlar Go yazı tipiyle metin; 11×12 sol alt köşe penceresi, cevap anahtarı son sayfalarda)
2. `python3 verify_tesuji4.py` — iki renk eşlemesini ve I'lı/I'sız koordinatları cevap dizilerini kurallara göre oynatarak dener.
   Sonuç: `@` = siyah, `!` = beyaz, `I` harfi yok → 298 dizinin tamamı yasal (ters eşlemede 80 dizi bozuluyor).
   Kitapta 150 ve 242 "eliminated" — atlandı.
3. `python3 build_tesuji4.py` → `tesuji4_rows.json` (SGF: siyah hamleleri TE[1], beyaz cevapları otomatik; ağaçta olmayan her hamle yanlış sayılır)
4. Veritabanına eklendikten sonra `md5(string_agg(sgf_raw, '|' order by sgf_filename))` yereldeki ile karşılaştırıldı (aynı).

## Part 5 (`specialized-training-in-tesuji-5.pdf`, 2026-09-29)

Aynı adımlar: `extract_tesuji5.py` → `verify_tesuji5.py` → `build_tesuji5.py` → `tesuji5_rows.json`.
- 300 problem, 15'i "eliminated" (96, 135, 205, 210–212, 220, 222, 224, 234, 235, 257, 280, 284, 292).
- 110, 158, 167, 242 atlandı: cevap dizisi bu tahtada kurallara aykırı (dolu nokta / intihar).
- 281 bulmaca eklendi, sort_order 399–679; sonra kitap 197 (Bulmaca 590) kullanıcı isteğiyle silindi → 280, tag `Tesuji`. Seviye kitap sırasına göre: 1–100 `8 Kyu` (99), 101–200 `7 Kyu` (95), 201–300 `6 Kyu` (86).
- Veritabanı md5 = yerel md5 = `2b0ccd76de31ac22f79739c3b755c6a0`.

## Capturing Races (`specialized-training-in-capturing-races.pdf`, 2026-09-29)

`extract_capraces.py` → `verify_capraces.py` (288/288 yasal, `@` siyah) → `build_capraces.py` → `capraces_rows.json`.
- Kitap tek numaraları → atölye: Gelişim'in başına eklenen `nefes-yarisi-1…5` (30/30/30/30/24), category/tag `Nefes Yarışı`, ders adı `Nefes Yarışı 1…144`.
- Kitap çift numaraları → Bulmaca 680–823, tag `Nefes Yarışı`.
- Hepsi `10 Kyu` (kitabın zorluk etiketi). Kutular web `src/data/workshopCatalog.js` + mobil `src/lib/education/curriculumSeed.ts`.
- md5: atölye `d11f3b1e9f9e6ee2f3bf7f14115cb67d`, bulmaca `22bb71428f7b44045946103f1450ab26` (veritabanı = yerel).
- Düzeltme: kitap 3 (atölye "Nefes Yarışı 2") son hamlede B2 yanında A1 de doğru (`EXTRA_LAST`, veritabanında da güncellendi).

## 2026-09-29: atölyeden Bulmacalar'a taşıma
Nefes Yarışı 3–5 (`nefes-yarisi-3..5`, 84) ve Tesuji 3–8 (`gelisim-atolye-7..12`, 180) kutularının bütün problemleri
`category='Bulmaca'`, `course_slug=null` yapıldı; kutu sırası + kutu içi sırayla Bulmaca 824–1087
(824–907 Nefes Yarışı, 908–1087 Tesuji; tag/rank aynı). Kutular iki katalogdan da kaldırıldı. Sonraki Bulmaca sort_order: 1088.
