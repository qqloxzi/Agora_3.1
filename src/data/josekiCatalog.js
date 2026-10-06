// "Joseki Sonrası" kutuları — AI 围棋定式大全, 星→小飞挂角 (hoshi → keima kakari)
// bölümünün içindekiler sayfasıyla aynı sıra; ardından kitabın diğer
// bölümleri (hoshi: 3-3 işgali, alttan yapışma; komoku: kakariler ve kapatmalar; 3-3, mokuhazushi, takamoku). `group`
// Joseki Sonrası sayfasındaki başlığı belirler. `slug` olanlar hazır josekilerdir
// (src/data/joseki/<slug>.json); olmayanlar yalnızca başlık + içerik bilgisiyle
// "Yakında" kutusu olarak gösterilir. Mobil: Go_Akademisi_mobil/src/data/josekiCatalog.ts
export const JOSEKI_CATALOG = [
  { key: 'keima', slug: 'hoshi-kogeima', title: 'Hoshi + Keima', info: 'Siyah keima ile köşeyi kapatır. En sağlam ve en çok oynanan cevap.', bookPage: 11, group: 'Hoshi + Keima Kakari', exercises: 47 },
  { key: 'ikken-tobi', slug: 'hoshi-ikken-tobi', title: 'Hoshi + Bir Boşluklu Zıplama', info: 'Siyah bir boşluk zıplayarak köşeyi kapatır; merkeze önem verir.', bookPage: 183, group: 'Hoshi + Keima Kakari', exercises: 15 },
  { key: 'ikken-basami-low', slug: 'hoshi-ikken-basami', title: 'Hoshi + Pincer', info: 'Siyah alçak bir boşluklu pincer ile beyazın taşına hemen saldırır.', bookPage: 285, group: 'Hoshi + Keima Kakari', exercises: 35 },
  { key: 'ikken-basami-high', slug: 'hoshi-ikken-basami-high', title: 'Hoshi + Yüksek Pincer', info: 'Yüksek bir boşluklu pincer. Altı pincer türü içinde en az oynananı.', bookPage: 441, group: 'Hoshi + Keima Kakari', exercises: 10 },
  { key: 'niken-basami-low', slug: 'hoshi-niken-basami', title: 'Hoshi + İki Boşluklu Pincer', info: 'Alçak iki boşluklu pincer. Beyaza biraz daha fazla yer bırakır.', bookPage: 467, group: 'Hoshi + Keima Kakari', exercises: 33 },
  { key: 'niken-basami-high', slug: 'hoshi-niken-basami-high', title: 'Hoshi + Yüksek İki Boşluklu Pincer', info: 'Yüksek iki boşluklu pincer. Merkeze daha çok önem verir.', bookPage: 567, group: 'Hoshi + Keima Kakari', exercises: 22 },
  { key: 'sangen-basami-low', title: 'Hoshi + Üç Boşluklu Pincer', info: 'Alçak üç boşluklu pincer. Hem saldırır hem de kenarda yer açar.', bookPage: 655, group: 'Hoshi + Keima Kakari' },
  { key: 'sangen-basami-high', title: 'Hoshi + Yüksek Üç Boşluklu Pincer', info: 'Yüksek üç boşluklu pincer. Geniş ve esnek bir saldırı.', bookPage: 735, group: 'Hoshi + Keima Kakari' },
  { key: 'kosumi-tsuke', slug: 'hoshi-kosumi-tsuke', title: 'Hoshi + Kosumi-tsuke', info: 'Siyah çapraz yapışarak beyazı yükselmeye zorlar.', bookPage: 808, group: 'Hoshi + Keima Kakari', exercises: 19 },
  { key: 'ogeima', slug: 'hoshi-ogeima', title: 'Hoshi + Ōgeima', info: 'Siyah büyük keima ile köşeyi kapatır; daha geniş ama daha zayıf.', bookPage: 888, group: 'Hoshi + Keima Kakari', exercises: 7 },
  { key: 'tsuke-osae', slug: 'hoshi-tsuke-osae', title: 'Hoshi + Üstten Yapışma', info: 'Siyah beyazın taşına üstten yapışıp onu alçakta tutar.', bookPage: 911, group: 'Hoshi + Keima Kakari', exercises: 18 },
  { key: 'niro-keima', slug: 'hoshi-niro-keima', title: 'Hoshi + 2. Sıradan Keima', info: 'Siyah 2. sıradan keima ile beyazın kökünü hedef alır.', bookPage: 971, group: 'Hoshi + Keima Kakari', exercises: 6 },
  { key: 'nidan-tobi', title: 'Hoshi + İki Boşluklu Zıplama', info: 'Siyah iki boşluk zıplayarak köşeyi kapatır; hızlı ama ince.', bookPage: 993, group: 'Hoshi + Keima Kakari' },
  { key: 'kosumi', title: 'Hoshi + Kosumi', info: 'Siyah çapraz adımla köşeyi sağlamlaştırır.', bookPage: 999, group: 'Hoshi + Keima Kakari' },
  { key: 'kata', title: 'Hoshi + Omuz Vuruşu', info: 'Siyah beyazın taşına omuzdan vurur ve onu kenara bastırır.', bookPage: 1008, group: 'Hoshi + Keima Kakari' },
  { key: 'niro-tsuke', title: 'Hoshi + 2. Sıradan Yapışma', info: 'Siyah beyazın taşına alttan, 2. sıradan yapışır.', bookPage: 1025, group: 'Hoshi + Keima Kakari' },
  { key: 'tenuki', slug: 'hoshi-tenuki', title: 'Hoshi + Tenuki', info: 'Siyah kakariye cevap vermez ve başka yere oynar.', bookPage: 1033, group: 'Hoshi + Keima Kakari', exercises: 36 },
  { key: 'hoshi-sansan', slug: 'hoshi-sansan', title: 'Hoshi + 3-3 İşgali', info: 'Beyaz boş köşede hoshinin altına, 3-3 noktasına girer. Bugün standart bir hamle.', bookPage: 1154, group: 'Hoshi + Diğer Yaklaşımlar', exercises: 80 },
  { key: 'hoshi-alttan-yapisma', slug: 'hoshi-alttan-yapisma', title: 'Hoshi + Alttan Yapışma', info: 'Beyaz hoshinin hemen altına yapışır; çoğu varyasyon 3-3 işgaline döner.', bookPage: 1440, group: 'Hoshi + Diğer Yaklaşımlar', exercises: 9 },
  { key: 'komoku-keima-kakari-keima', slug: 'komoku-keima-kakari-keima', title: 'Komoku + Keima Kakari: Keima', info: 'Siyah kakariye keima ile cevap verir; bugün en popüler cevaplardan biri.', bookPage: 1663, group: 'Komoku + Keima Kakari', exercises: 13 },
  { key: 'komoku-keima-kakari-kosumi', slug: 'komoku-keima-kakari-kosumi', title: 'Komoku + Keima Kakari: Kosumi', info: 'Shusaku\'nun kosumisi: eski bir hamle, yapay zekâ çağında yeniden moda.', bookPage: 1696, group: 'Komoku + Keima Kakari', exercises: 7 },
  { key: 'komoku-keima-kakari-kosumi-tsuke', slug: 'komoku-keima-kakari-kosumi-tsuke', title: 'Komoku + Keima Kakari: Kosumi-tsuke', info: 'Siyah çapraz yapışır; eskiden kaba sayılırdı, bugün çok normal.', bookPage: 1719, group: 'Komoku + Keima Kakari', exercises: 3 },
  { key: 'komoku-keima-kakari-bastirma', slug: 'komoku-keima-kakari-bastirma', title: 'Komoku + Keima Kakari: Üstten Bastırma', info: 'Siyah üstten yapışıp bastırarak sol tarafı büyütür; çevrede destek ister.', bookPage: 1754, group: 'Komoku + Keima Kakari', exercises: 7 },
  { key: 'komoku-keima-kakari-pincer', slug: 'komoku-keima-kakari-pincer', title: 'Komoku + Keima Kakari: Pincer', info: 'Bir boşluklu alçak pincer; beyaz genelde keima ile bastırır.', bookPage: 1778, group: 'Komoku + Keima Kakari', exercises: 14 },
  { key: 'komoku-keima-kakari-yuksek-pincer', slug: 'komoku-keima-kakari-yuksek-pincer', title: 'Komoku + Keima Kakari: Yüksek Pincer', info: 'Bir boşluklu yüksek pincer; genelde sağ altın siyah olması gerekir.', bookPage: 1825, group: 'Komoku + Keima Kakari', exercises: 19 },
  { key: 'komoku-keima-kakari-iki-bosluklu-pincer', slug: 'komoku-keima-kakari-iki-bosluklu-pincer', title: 'Komoku + Keima Kakari: İki Boşluklu Pincer', info: 'İki boşluklu alçak pincer; sağ taraf destekliyken çok yaygın.', bookPage: 1900, group: 'Komoku + Keima Kakari', exercises: 28 },
  { key: 'komoku-yuksek-kakari-alttan-yapisma', slug: 'komoku-yuksek-kakari-alttan-yapisma', title: 'Komoku + Yüksek Kakari: Alttan Yapışma', info: 'Siyah alttan yapışır; küçük ve büyük çığ josekileri buradan çıkar.', bookPage: 2438, group: 'Komoku + Yüksek Kakari', exercises: 23 },
  { key: 'komoku-yuksek-kakari-kosumi', slug: 'komoku-yuksek-kakari-kosumi', title: 'Komoku + Yüksek Kakari: Kosumi', info: 'Siyah kosumi oynar; çoğu varyasyon kosumi-tsuke şekillerine döner.', bookPage: 2542, group: 'Komoku + Yüksek Kakari', exercises: 1 },
  { key: 'komoku-yuksek-kakari-keima', slug: 'komoku-yuksek-kakari-keima', title: 'Komoku + Yüksek Kakari: Keima', info: 'Siyah keima oynar; eskiden yaygındı, yapay zekâ biraz kayıp görür.', bookPage: 2551, group: 'Komoku + Yüksek Kakari', exercises: 2 },
  { key: 'komoku-yuksek-kakari-ziplama', slug: 'komoku-yuksek-kakari-ziplama', title: 'Komoku + Yüksek Kakari: Zıplama', info: 'Siyah zıplar; sağlam ama tempo biraz yavaş.', bookPage: 2558, group: 'Komoku + Yüksek Kakari', exercises: 3 },
  { key: 'komoku-yuksek-kakari-pincer', slug: 'komoku-yuksek-kakari-pincer', title: 'Komoku + Yüksek Kakari: Pincer', info: 'Bir boşluklu alçak pincer; beyazın en iyi cevabı köşeye alttan yapışmak.', bookPage: 2645, group: 'Komoku + Yüksek Kakari', exercises: 16 },
  { key: 'komoku-yuksek-kakari-yuksek-pincer', slug: 'komoku-yuksek-kakari-yuksek-pincer', title: 'Komoku + Yüksek Kakari: Yüksek Pincer', info: 'Bir boşluklu yüksek pincer; yapay zekâ bu pinceri fazla sıkı görür.', bookPage: 2735, group: 'Komoku + Yüksek Kakari', exercises: 7 },
  { key: 'komoku-yuksek-kakari-iki-bosluklu-pincer', slug: 'komoku-yuksek-kakari-iki-bosluklu-pincer', title: 'Komoku + Yüksek Kakari: İki Boşluklu Pincer', info: 'İki boşluklu alçak pincer; yapay zekâdan esinlenmiş ilginç bir hamle.', bookPage: 2782, group: 'Komoku + Yüksek Kakari', exercises: 12 },
  { key: 'komoku-yuksek-kakari-iki-bosluklu-yuksek-pincer', slug: 'komoku-yuksek-kakari-iki-bosluklu-yuksek-pincer', title: 'Komoku + Yüksek Kakari: İki Boşluklu Yüksek Pincer', info: 'İki boşluklu yüksek pincer; ünlü şeytan kılıcı josekisi buradan çıkar.', bookPage: 2826, group: 'Komoku + Yüksek Kakari', exercises: 18 },
  { key: 'komoku-buyuk-keima-kakari', slug: 'komoku-buyuk-keima-kakari', title: 'Komoku + Büyük Keima Kakari', info: 'Beyaz komokuya büyük keima ile uzaktan yaklaşır.', bookPage: 2987, group: 'Komoku + Diğer Yaklaşımlar', exercises: 8 },
  { key: 'komoku-iki-bosluklu-yuksek-kakari', slug: 'komoku-iki-bosluklu-yuksek-kakari', title: 'Komoku + İki Boşluklu Yüksek Kakari', info: 'Beyaz komokuya iki boşluklu yüksek kakari ile yaklaşır.', bookPage: 3039, group: 'Komoku + Diğer Yaklaşımlar', exercises: 2 },
  { key: 'komoku-yandan-yapisma', slug: 'komoku-yandan-yapisma', title: 'Komoku + Yandan Yapışma', info: 'Beyaz komoku taşının hemen yanına yapışır.', bookPage: 3083, group: 'Komoku + Diğer Yaklaşımlar', exercises: 5 },
  { key: 'komoku-keima-kapatma', slug: 'komoku-keima-kapatma', title: 'Komoku + Keima ile Kapatma', info: 'Kaygısız köşe: alan çok sağlam, merkeze etkisi az.', bookPage: 3108, group: 'Komoku Köşe Kapatmaları', exercises: 7 },
  { key: 'komoku-bir-bosluklu-kapatma', slug: 'komoku-bir-bosluklu-kapatma', title: 'Komoku + Bir Boşluklu Kapatma', info: 'Merkeze önem verir ama köşe biraz boştur.', bookPage: 3130, group: 'Komoku Köşe Kapatmaları', exercises: 14 },
  { key: 'komoku-buyuk-keima-kapatma', slug: 'komoku-buyuk-keima-kapatma', title: 'Komoku + Büyük Keima ile Kapatma', info: 'Son zamanlarda popüler; yapay zekâ yeni cevaplar getirdi.', bookPage: 3171, group: 'Komoku Köşe Kapatmaları', exercises: 12 },
  { key: 'komoku-iki-bosluklu-kapatma', slug: 'komoku-iki-bosluklu-kapatma', title: 'Komoku + İki Boşluklu Kapatma', info: 'Eskiden boş sayılırdı; bugün en popüler kapatma.', bookPage: 3243, group: 'Komoku Köşe Kapatmaları', exercises: 13 },
  { key: 'ucuc', slug: 'ucuc', title: '3-3 Noktası', info: 'Siyah köşeyi 3-3 noktasından alır: alan sağlam, merkez zayıf.', bookPage: 3306, group: '3-3', exercises: 18 },
  { key: 'mokuhazushi-ucuc-kakari', slug: 'mokuhazushi-ucuc-kakari', title: 'Mokuhazushi + 3-3 Kakari', info: 'Beyaz 3-3 noktasından yaklaşır; iki doğru cevaptan biri.', bookPage: 3353, group: 'Mokuhazushi', exercises: 7 },
  { key: 'mokuhazushi-komoku-kakari', slug: 'mokuhazushi-komoku-kakari', title: 'Mokuhazushi + Komoku Kakari', info: 'Beyaz komoku noktasından yaklaşır; ünlü taisha josekisi burada.', bookPage: 3385, group: 'Mokuhazushi', exercises: 22 },
  { key: 'mokuhazushi-diger', slug: 'mokuhazushi-diger', title: 'Mokuhazushi + Diğer Kakariler', info: 'Hoshi noktası, takamoku ve mokuhazushi kakari; hepsi biraz geride.', bookPage: 3491, group: 'Mokuhazushi', exercises: 4 },
  { key: 'takamoku', slug: 'takamoku', title: 'Takamoku', info: 'Siyah köşeyi takamoku noktasından alır: merkeze önem verir, köşe boştur.', bookPage: 3506, group: 'Takamoku', exercises: 5 },
]

// Ana sayfa kartı önizlemesi — sync_catalog.py üretir.
export const JOSEKI_HOME_PREVIEW = { B: 'cncqdpepeqfp', W: 'crdqdrerfqgq' }
