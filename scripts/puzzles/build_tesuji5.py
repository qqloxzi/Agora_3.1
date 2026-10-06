"""raw_tesuji5.json → SGF (web/mobil bulmaca biçimi) + Supabase insert SQL.
Renk: '@' siyah, '!' beyaz; koordinatlar sol alttan, 'I' harfi yok (verify_tesuji5.py ile
281 cevap dizisi kurallara uygun oynanarak doğrulandı)."""
import json
raw = json.load(open('raw_tesuji5.json'))
P = {int(k): v for k, v in raw['problems'].items()}
A = {int(k): v for k, v in raw['answers'].items()}
LET = 'ABCDEFGHJKLMNOPQRST'
SORT0 = 398  # mevcut en büyük sort_order (tesuji-4 sonu)
# Kitapta 15 problem "eliminated" (cevabı yok, zaten atlanıyor).
# 110, 158, 167, 242: cevap dizisi bu tahtada kurallara aykırı (dolu noktaya/intihar hamlesi) → atlandı.
EXCLUDE = {110, 158, 167, 242}
EXTRA_LAST = {}
# Kullanıcı düzeltmesi (2026-09-29): kitap 197 (Bulmaca 590) kaldırıldı; numaralar kaymasın diye sonradan çıkarılır.
REMOVED = {197}

def rank_of(n):
    # Seviye 6-8 kyu: kitap sırası zorluğa göre, üçe bölündü
    return '8 Kyu' if n <= 100 else '7 Kyu' if n <= 200 else '6 Kyu'

def sgfc(x, y):
    return chr(97 + x) + chr(97 + y)

rows_out = []
for i, n in enumerate(sorted(k for k in A if k not in EXCLUDE)):
    ab, aw = [], []
    for r, row in enumerate(P[n]['rows']):
        for c, ch in enumerate(row):
            if ch == '@': ab.append(sgfc(c, 8 + r))
            elif ch == '!': aw.append(sgfc(c, 8 + r))
    moves = [sgfc(LET.index(m[0]), 19 - int(m[1:])) for m in A[n]]
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
    sgf = (f'(;FF[4]CA[UTF-8]GM[1]GN[tesuji-5-{n:03d}]SZ[19]KM[6.5]RU[Japanese]'
           f"AB{''.join(f'[{p}]' for p in sorted(ab))}AW{''.join(f'[{p}]' for p in sorted(aw))}({line}))")
    rows_out.append(dict(n=n, sgf_filename=f'tesuji-5-{n:03d}.sgf', sgf_raw=sgf, sort_order=SORT0 + 1 + i,
                         lesson_title=f'Bulmaca {SORT0 + 1 + i}', rank=rank_of(n)))
rows_out = [r for r in rows_out if r['n'] not in REMOVED]
json.dump(rows_out, open('tesuji5_rows.json', 'w'), ensure_ascii=False, indent=0)

def q(s):
    return "'" + s.replace("'", "''") + "'"
vals = ',\n'.join(
    f"({q(r['sgf_filename'])}, 'Bulmaca', {q(r['sgf_raw'])}, 'Siyah oynar — doğru hamleyi bulun.', 'sgf_marks', "
    f"{q(r['lesson_title'])}, {r['sort_order']}, 'Tesuji', {q(r['rank'])})" for r in rows_out)
sql = ('insert into public.go_problems (sgf_filename, category, sgf_raw, initial_description, validation_mode, lesson_title, sort_order, tag, rank)\n'
       'select * from (values\n' + vals + '\n) v(sgf_filename, category, sgf_raw, initial_description, validation_mode, lesson_title, sort_order, tag, rank)\n'
       "where not exists (select 1 from public.go_problems g where g.sgf_filename like 'tesuji-5-%');\n")
open('tesuji5_insert.sql', 'w').write(sql)
print(len(rows_out), 'rows; sql bytes', len(sql))
print(rows_out[0]['sgf_raw']); print(rows_out[-1]['sgf_raw'])
