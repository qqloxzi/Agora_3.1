from tr_komoku_diger import T_BUYUK as T

SLUG = 'komoku-buyuk-keima-kakari'
TITLE = 'Komoku + Büyük Keima Kakari'
SUBTITLE = "Komoku · beyaz büyük keima ile yaklaşır"
DESCRIPTION = "Beyaz komokuya büyük keima ile uzaktan yaklaşır. Siyah kosumi, zıplama ya da pincer ile cevap verir."
SOURCE = 'AI 围棋定式大全 (AI Go Joseki Ansiklopedisi), s. 2987–3022'
RAW = 'raw_2987-3022.json'
ROOT = 'B-3'
PAGE_OFFSET = 2986
TR = T
# Bölümün giriş sayfası PDF kesitinde yok: kök (siyah C4 + beyazın kakari taşı, sıra siyahta) elle eklendi.
EXTRA = [dict(page=1, code='B-3', base=[[2, 15, 'B'], [5,16, 'W']], moves=[], labels={}, footnotes=[], comment='')]
