from tr_komoku_diger import T_YANDAN as T

SLUG = 'komoku-yandan-yapisma'
TITLE = 'Komoku + Yandan Yapışma'
SUBTITLE = "Komoku · beyaz komokunun yanına yapışır"
DESCRIPTION = "Beyaz komoku taşının hemen yanına yapışır. Siyah alttan ya da üstten hane ile veya uzayarak cevap verir; bazı varyasyonlar çığ josekisine döner."
SOURCE = 'AI 围棋定式大全 (AI Go Joseki Ansiklopedisi), s. 3083–3106'
RAW = 'raw_3083-3108.json'
ROOT = 'B-5'
PAGE_OFFSET = 3082
TR = T
# Bölümün giriş sayfası PDF kesitinde yok: kök (siyah C4 + beyazın kakari taşı, sıra siyahta) elle eklendi.
EXTRA = [dict(page=1, code='B-5', base=[[2, 15, 'B'], [3,15, 'W']], moves=[], labels={}, footnotes=[], comment='')]
