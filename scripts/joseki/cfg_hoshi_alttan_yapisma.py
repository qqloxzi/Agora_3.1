from tr_alttan import T

SLUG = 'hoshi-alttan-yapisma'
TITLE = 'Hoshi + Alttan Yapışma'
SUBTITLE = 'Hoshi · beyaz hoshinin altına yapışır'
DESCRIPTION = 'Beyaz boş köşedeki hoshinin hemen altına yapışır. Siyah dıştan ya da içeriden hane ile veya uzayarak cevap verir; birçok varyasyon 3-3 işgaline döner.'
SOURCE = 'AI 围棋定式大全 (AI Go Joseki Ansiklopedisi), s. 1440–1460'
RAW = 'raw_1440-1462.json'
ROOT = 'A-3'
PAGE_OFFSET = 1439
TR = T
# Bölümün giriş sayfası PDF kesitinde yok: kök pozisyon elle eklendi (siyah D4, beyaz D3, sıra siyahta).
EXTRA = [dict(page=1, code='A-3', base=[[3, 15, 'B'], [3, 16, 'W']], moves=[], labels={}, footnotes=[], comment='')]
