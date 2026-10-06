from tr1 import T as T1
from tr2 import T as T2
from tr3 import T as T3
from tr4 import T as T4
from simple1 import S as S1
from simple2 import S as S2
from simple3 import S as S3

SLUG = 'hoshi-kogeima'
TITLE = 'Hoshi + Keima'
SUBTITLE = 'Hoshi · keima kakari · keima cevabı'
DESCRIPTION = 'Siyah hoshiye beyazın keima kakarisi ve siyahın keima cevabından sonra beyazın tüm seçenekleri: yapışma, 2. sıradan keima, kenarda açılma, 3-3, yandan yapışma, büyük keima ve tenuki.'
SOURCE = 'AI 围棋定式大全 (AI Go Joseki Ansiklopedisi), s. 11–182'
RAW = 'raw.json'
ROOT = 'A-1-1'
PAGE_OFFSET = 10  # PDF sayfası -> kitap sayfası
SIMPLE = {**S1, **S2, **S3}
TR = {k: (t, r, SIMPLE.get(k, x)) for k, (t, r, x) in {**T1, **T2, **T3, **T4}.items()}
