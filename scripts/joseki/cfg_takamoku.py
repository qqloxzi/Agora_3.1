from tr_mokuhazushi3 import T_TAKAMOKU as T

SLUG = 'takamoku'
TITLE = 'Takamoku'
SUBTITLE = 'Siyah köşeyi takamoku noktasından alır'
DESCRIPTION = "Siyah köşeyi takamoku noktasından alır: merkeze önem verir ama köşe boştur. Beyaz komoku, 3-3 ya da mokuhazushi kakari ile cevap verir."
SOURCE = 'AI 围棋定式大全 (AI Go Joseki Ansiklopedisi), s. 3507–3525'
RAW = 'raw_C.json'
ROOT = 'C-3'
PAGE_OFFSET = 0
TR = T
# Bölümün giriş sayfası (s. 3506) PDF kesitinde yok: kök elle eklendi.
EXTRA = [dict(page=3506, code='C-3', base=[], moves=[[1, 3, 14, 'B']], labels={'A': [3, 16], 'B': [2, 16], 'C': [4, 16]}, footnotes=[], comment='')]
