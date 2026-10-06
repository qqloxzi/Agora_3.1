"""Joseki JSON'larından küçük katalog verisini günceller (web .js + mobil .ts):
her hazır kutuya `exercises: N` yazar ve ana sayfa kartı için JOSEKI_HOME_PREVIEW
pozisyonunu üretir. Ana sayfa böylece ~1 MB'lık joseki verisini yüklemez.

    python3 sync_catalog.py
"""
import glob, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(HERE, '../../src')
MOBILE = os.path.expanduser('~/Desktop/Go_Akademisi_mobil/src')
PREVIEW = ('hoshi-kogeima', 'A-1-1-1-1-1')  # en çok oynanan keima josekisinin son hali
SIZE = 19

josekis = {os.path.basename(f)[:-5]: json.load(open(f)) for f in glob.glob(os.path.join(WEB, 'data/joseki/*.json'))}


def neighbors(x, y):
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        if 0 <= x + dx < SIZE and 0 <= y + dy < SIZE:
            yield x + dx, y + dy


def play(b, x, y, col):
    b[(x, y)] = col
    for q in neighbors(x, y):
        if b.get(q) not in (None, col):
            group, stack, libs = {q}, [q], False
            while stack:
                for n in neighbors(*stack.pop()):
                    if n not in b:
                        libs = True
                    elif b[n] == b[q] and n not in group:
                        group.add(n)
                        stack.append(n)
            if not libs:
                for p in group:
                    del b[p]


slug, code = PREVIEW
d = josekis[slug]['nodes'][code]['diagram']
b = {}
for col in 'BW':
    s = d['base'][col]
    for i in range(0, len(s), 2):
        b[(ord(s[i]) - 97, ord(s[i + 1]) - 97)] = col
col = d['first']
for m in d['moves']:
    if m:
        play(b, ord(m[0]) - 97, ord(m[1]) - 97, col)
    col = 'W' if col == 'B' else 'B'
preview = {c: ''.join(chr(97 + x) + chr(97 + y) for (x, y), v in sorted(b.items()) if v == c) for c in 'BW'}

for path, semi in ((os.path.join(WEB, 'data/josekiCatalog.js'), ''), (os.path.join(MOBILE, 'data/josekiCatalog.ts'), ';')):
    src = open(path).read()
    for s, j in josekis.items():
        line = re.search(r"\{ key: '[^']+', slug: '%s',[^\n]*\}" % re.escape(s), src)
        if not line:
            continue
        entry = re.sub(r", exercises: \d+", '', line.group(0))
        entry = entry[:-2] + ', exercises: %d }' % len(j['exercises'])
        src = src.replace(line.group(0), entry)
    src = re.sub(r"\n// Ana sayfa kartı[^\n]*\nexport const JOSEKI_HOME_PREVIEW[^\n]*\n", '\n', src)
    src = src.rstrip('\n') + "\n\n// Ana sayfa kartı önizlemesi — sync_catalog.py üretir.\nexport const JOSEKI_HOME_PREVIEW = { B: '%s', W: '%s' }%s\n" % (preview['B'], preview['W'], semi)
    open(path, 'w').write(src)
    print('updated', path)
