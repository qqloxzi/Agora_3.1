"""raw_capraces.json → Nefes Yarışı SGF'leri: yarısı atölye (Gelişim, Nefes Yarışı 1–5), yarısı Bulmaca.
Renk: '@' siyah, '!' beyaz; koordinatlar sol alttan, 'I' harfi yok (verify_capraces.py ile
288 cevap dizisinin tamamı kurallara uygun oynandı).
Bölme: kitaptaki tek numaralar → atölye, çift numaralar → bulmaca (iki taraf da kolaydan zora).
Çıktı: capraces_rows.json + Supabase'e yapıştırılacak kompakt VALUES + beklenen md5'ler."""
import hashlib
import json

raw = json.load(open('raw_capraces.json'))
P = {int(k): v for k, v in raw['problems'].items()}
A = {int(k): v for k, v in raw['answers'].items()}
LET = 'ABCDEFGHJKLMNOPQRST'
BOX = 30              # atölye kutusu başına ders
BULMACA_SORT0 = 679   # mevcut en büyük Bulmaca sort_order (tesuji-5 sonu)
RANK = '10 Kyu'       # kitabın zorluk etiketi
TAG = 'Nefes Yarışı'
# Kullanıcı düzeltmesi (2026-09-29): kitap 3 (atölye "Nefes Yarışı 2") son hamlede B2'nin yanında A1 de doğru.
EXTRA_LAST = {3: ['A1']}


def sgfc(x, y):
    return chr(97 + x) + chr(97 + y)


def stones(n):
    ab, aw = [], []
    for r, row in enumerate(P[n]['rows']):
        for c, ch in enumerate(row):
            if ch == '@':
                ab.append(sgfc(c, 8 + r))
            elif ch == '!':
                aw.append(sgfc(c, 8 + r))
    return sorted(ab), sorted(aw)


def sgf_of(n, ab, aw, moves):
    line = ''
    for k, mv in enumerate(moves):
        col = 'B' if k % 2 == 0 else 'W'
        if k == len(moves) - 1 and n in EXTRA_LAST:  # alternatif doğru son hamleler: kardeş dallar
            alts = [mv] + [sgfc(LET.index(m[0]), 19 - int(m[1:])) for m in EXTRA_LAST[n]]
            line += ''.join(f'(;{col}[{a}]TE[1]C[Doğru çözüm!])' for a in alts)
            break
        line += f';{col}[{mv}]' + ('TE[1]' if col == 'B' else '')
        if k == len(moves) - 1:
            line += 'C[Doğru çözüm!]'
    return (f'(;FF[4]CA[UTF-8]GM[1]GN[capturing-races-{n:03d}]SZ[19]KM[6.5]RU[Japanese]'
            f"AB{''.join(f'[{p}]' for p in ab)}AW{''.join(f'[{p}]' for p in aw)}({line}))")


rows = []
atolye_i = bulmaca_i = 0
for n in sorted(A):
    ab, aw = stones(n)
    moves = [sgfc(LET.index(m[0]), 19 - int(m[1:])) for m in A[n]]
    row = dict(n=n, sgf_filename=f'capturing-races-{n:03d}.sgf', sgf_raw=sgf_of(n, ab, aw, moves),
               ab=''.join(ab), aw=''.join(aw), mv=''.join(moves))
    if n % 2 == 1:
        row.update(dest='atolye', course_slug=f'nefes-yarisi-{atolye_i // BOX + 1}',
                   sort_order=atolye_i % BOX + 1, lesson_title=f'Nefes Yarışı {atolye_i + 1}')
        atolye_i += 1
    else:
        so = BULMACA_SORT0 + 1 + bulmaca_i
        row.update(dest='bulmaca', sort_order=so, lesson_title=f'Bulmaca {so}')
        bulmaca_i += 1
    rows.append(row)

json.dump(rows, open('capraces_rows.json', 'w'), ensure_ascii=False, indent=0)
open('capraces_values.txt', 'w').write(','.join(f"({r['n']},'{r['ab']}','{r['aw']}','{r['mv']}')" for r in rows))
for dest in ('atolye', 'bulmaca'):
    sel = sorted((r for r in rows if r['dest'] == dest), key=lambda r: r['sgf_filename'])
    print(dest, len(sel), 'md5', hashlib.md5('|'.join(r['sgf_raw'] for r in sel).encode()).hexdigest())
print('kutular', sorted({r['course_slug'] for r in rows if r['dest'] == 'atolye'}))
print(rows[0]['sgf_raw'])
