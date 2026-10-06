from tr_komoku_diger import T_IKIYUKSEKKAKARI as T

SLUG = 'komoku-iki-bosluklu-yuksek-kakari'
TITLE = 'Komoku + İki Boşluklu Yüksek Kakari'
SUBTITLE = "Komoku · beyaz iki boşluklu yüksek kakari"
DESCRIPTION = "Beyaz komokuya iki boşluklu yüksek kakari ile yaklaşır. Siyah köşeyi kapatabilir, keima ile kalkabilir ya da pincer yapabilir."
SOURCE = 'AI 围棋定式大全 (AI Go Joseki Ansiklopedisi), s. 3039–3050'
RAW = 'raw_3039-3050.json'
ROOT = 'B-4'
PAGE_OFFSET = 3038
TR = T
# Bölümün giriş sayfası PDF kesitinde yok: kök (siyah C4 + beyazın kakari taşı, sıra siyahta) elle eklendi.
EXTRA = [dict(page=1, code='B-4', base=[[2, 15, 'B'], [5,15, 'W']], moves=[], labels={}, footnotes=[], comment='')]
