"""Joseki Sonrası derleyicisi: python3 build.py <cfg_modülü>

cfg modülü şunları tanımlar: SLUG, TITLE, SUBTITLE, DESCRIPTION, SOURCE, RAW
(extract.py çıktısı), ROOT (kök diyagram kodu), TR = {kod: (başlık, değerlendirme, metin)}.
Çıktı: <SLUG>.json — web ve mobil src/data/joseki/ klasörlerine kopyalanır.
"""
import importlib, json, re, sys
sys.path.insert(0, '.')
cfg = importlib.import_module(sys.argv[1])
TR = cfg.TR
ROOT = cfg.ROOT
raw = json.load(open(cfg.RAW))
# EXTRA (optional): hand-made diagrams in extract.py's format, placed first — e.g. a
# root position whose intro page is missing from the PDF excerpt.
raw = list(getattr(cfg, 'EXTRA', [])) + raw
# a raw file may hold several josekis (one PDF excerpt) — keep only ROOT's diagrams
# SKIP (optional): diagrams that cannot be replayed as printed (book misprints) are left out.
SKIP = set(getattr(cfg, 'SKIP', ()))
# PREFIXES (optional): several book subsections gathered under one hand-made ROOT diagram.
PREFIXES = tuple(getattr(cfg, 'PREFIXES', (ROOT,)))
by = {n['code']: n for n in raw if (n['code'] == ROOT or any(n['code'] == p or n['code'].startswith(p + '-') for p in PREFIXES)) and n['code'] not in SKIP}
SIZE = 19


def c2(x, y):
    return chr(97 + x) + chr(97 + y)


# ---------- go engine for replay validation ----------
def neighbors(x, y):
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < SIZE and 0 <= ny < SIZE:
            yield nx, ny


def group(b, x, y):
    col = b[(x, y)]
    seen = {(x, y)}
    st = [(x, y)]
    while st:
        p = st.pop()
        for q in neighbors(*p):
            if q not in seen and b.get(q) == col:
                seen.add(q)
                st.append(q)
    return seen


def libs(b, g):
    return {q for p in g for q in neighbors(*p) if q not in b}


def play(b, x, y, col):
    assert (x, y) not in b, 'occupied'
    b[(x, y)] = col
    opp = 'W' if col == 'B' else 'B'
    for q in neighbors(x, y):
        if b.get(q) == opp:
            g = group(b, *q)
            if not libs(b, g):
                for p in g:
                    del b[p]
    assert libs(b, group(b, x, y)), 'suicide'


def diagram_from_raw(n):
    base = {'B': '', 'W': ''}
    for x, y, col in n['base']:
        base[col] += c2(x, y)
    moves = []
    first = None
    for i, (num, x, y, col) in enumerate(n['moves']):
        assert num == i + 1
        if first is None:
            first = col if num == 1 else None
        moves.append(None if x is None else c2(x, y))
    if n['moves']:
        # colours strictly alternate (verified in extraction); derive first from move 1
        c = n['moves'][0][3]
        first = c
        for i, m in enumerate(n['moves']):
            exp = c if i % 2 == 0 else ('W' if c == 'B' else 'B')
            assert m[3] in (None, exp), (n['code'], m)
    labels = {k: c2(*v) for k, v in n['labels'].items() if k != '×'}
    marks = [c2(*n['labels']['×'])] if '×' in n['labels'] else []
    return dict(base=base, first=first or 'B', moves=moves, labels=labels, marks=marks)


def validate(code, d):
    b = {}
    for col in 'BW':
        s = d['base'][col]
        for i in range(0, len(s), 2):
            b[(ord(s[i]) - 97, ord(s[i + 1]) - 97)] = col
    col = d['first']
    for i, m in enumerate(d['moves']):
        if m:
            try:
                play(b, ord(m[0]) - 97, ord(m[1]) - 97, col)
            except AssertionError as e:
                print('REPLAY FAIL', code, 'move', i + 1, m, e)
                return False
        col = 'W' if col == 'B' else 'B'
    return True


nodes = {}
for code in by:  # book order: every position diagram precedes its variations
    d = diagram_from_raw(by[code])
    assert validate(code, d), f'{code} replay fails — fix the raw data or add it to SKIP'
    title, rating, text = TR[code]
    nodes[code] = dict(id=code, kind='variation' if code.count('-') == 5 else 'position', title=title,
                       rating=rating, text=text, diagram=d, bookPage=by[code]['page'] + cfg.PAGE_OFFSET)

# Final, simplified wording (final_<slug>.py): {code: (title, text)} overrides TR's title/text.
try:
    FINAL = importlib.import_module('final_' + cfg.SLUG.replace('-', '_')).FINAL
except ModuleNotFoundError:
    FINAL = None
if FINAL is not None:
    assert set(FINAL) == set(nodes), ('final_ keys differ', set(FINAL) ^ set(nodes))
    for code, (title, text) in FINAL.items():
        nodes[code]['title'], nodes[code]['text'] = title, text

# ---------- exercises ----------
# Tek alıştırma türü: "Josekiyi oyna" ("İyi mi, kötü mü?" 2026-09-29'da kullanıcı isteğiyle kaldırıldı).
ex = []
for code, n in nodes.items():
    d = n['diagram']
    if n['kind'] == 'variation' and n['rating'] in ('best', 'ok') and 3 <= len(d['moves']) <= 18 and all(d['moves']):
        ex.append(dict(id=f'seq-{code}', type='sequence', node=code,
                       question=f'Bu josekiyi baştan sona oyna ({len(d["moves"])} hamle).'))

# ---------- one merged move tree for the learn view ----------
# Every diagram is anchored at the tree node whose position equals its base
# (inserting a pass when the side to play differs, or a "setup" node when the
# diagram adds context stones such as a ladder breaker), then its moves are
# merged in. Branch points get letters: the diagram's own A/B/C where the
# child move sits on a labelled point, otherwise the next free letter.
def stones_key(b):
    return ''.join(sorted(f'{c2(*p)}{c}' for p, c in b.items()))


def board_of(d):
    b = {}
    for col in 'BW':
        s = d['base'][col]
        for i in range(0, len(s), 2):
            b[(ord(s[i]) - 97, ord(s[i + 1]) - 97)] = col
    return b


T = []
by_key = {}


def tnode(parent, move, color, board, toplay, inserter, setup=None):
    T.append(dict(p=parent, m=move, c=color, t=toplay, d=inserter, ch=[], board=board, setup=setup))
    i = len(T) - 1
    if parent is not None:
        T[parent]['ch'].append(i)
    by_key.setdefault((stones_key(board), toplay), []).append(i)
    return i


diag_codes = list(nodes)
tnode(None, None, None, board_of(nodes[ROOT]['diagram']), nodes[ROOT]['diagram']['first'], ROOT)
paths = {}
dropped = set()
for code in diag_codes:
    d = nodes[code]['diagram']
    b = board_of(d)
    k = stones_key(b)
    hit = by_key.get((k, d['first']))
    if hit:
        anchor = hit[0]
    elif by_key.get((k, 'W' if d['first'] == 'B' else 'B')):
        src = by_key[(k, 'W' if d['first'] == 'B' else 'B')][0]
        found = [x for x in T[src]['ch'] if T[x]['m'] == 'pass']
        anchor = found[0] if found else tnode(src, 'pass', T[src]['t'], T[src]['board'], d['first'], code)
    else:
        cands = [(len(b) - len(t['board']), i) for i, t in enumerate(T) if all(b.get(p) == c for p, c in t['board'].items())]
        if not cands:
            # Whole-board game examples (other corners, rotated) don't contain
            # the joseki's starting position — they are left out.
            print('SKIP (no anchor, whole-board example?)', code)
            dropped.add(code)
            continue
        best = min(cands)[1]
        extra = {p: c for p, c in b.items() if p not in T[best]['board']}
        setup = {'B': ''.join(c2(*p) for p, c in sorted(extra.items()) if c == 'B'), 'W': ''.join(c2(*p) for p, c in sorted(extra.items()) if c == 'W')}
        anchor = tnode(best, 'setup', None, b, d['first'], code, setup)
    path = [anchor]
    cur, col = anchor, d['first']
    for m in d['moves']:
        mv = m or 'pass'
        found = [x for x in T[cur]['ch'] if T[x]['m'] == mv]
        if found:
            cur = found[0]
        else:
            nb = dict(T[cur]['board'])
            if m:
                play(nb, ord(m[0]) - 97, ord(m[1]) - 97, col)
            cur = tnode(cur, mv, col, nb, 'W' if col == 'B' else 'B', code)
        path.append(cur)
        col = 'W' if col == 'B' else 'B'
    paths[code] = path

for code in dropped:
    del nodes[code]
ex = [e for e in ex if e['node'] not in dropped]
ends = {}
for code, path in paths.items():
    ends.setdefault(path[-1], []).append(code)
LETTERS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'
for i, t in enumerate(T):
    kids = t['ch']
    if not kids:
        continue
    end_d = nodes[ends[i][0]]['diagram'] if i in ends else None
    lab = {v: k for k, v in (end_d['labels'] if end_d else {}).items()}
    moves_k = [x for x in kids if T[x]['m'] not in ('pass', 'setup')]
    if len(kids) < 2 and not any(T[x]['m'] in lab for x in moves_k):
        continue
    used = set(lab.values())
    for x in moves_k:
        if T[x]['m'] in lab:
            T[x]['l'] = lab[T[x]['m']]
    free = (L for L in LETTERS if L not in used)
    for x in moves_k:
        if 'l' not in T[x]:
            T[x]['l'] = next(free)
    for x in kids:
        if T[x]['m'] == 'pass':
            T[x]['l'] = 'Tenuki'
tree = []
for t in T:
    o = dict(p=t['p'], m=t['m'], c=t['c'], t=t['t'], d=t['d'], ch=t['ch'])
    if t.get('l'):
        o['l'] = t['l']
    if t['setup']:
        o['s'] = t['setup']
    tree.append(o)
print('tree nodes', len(tree), 'branch points', sum(1 for t in T if len(t['ch']) > 1))

data = dict(slug=cfg.SLUG, title=cfg.TITLE, subtitle=cfg.SUBTITLE, description=cfg.DESCRIPTION, source=cfg.SOURCE,
            root=ROOT, size=SIZE, nodes=nodes, exercises=ex, tree=dict(nodes=tree, paths=paths))
json.dump(data, open(f'{cfg.SLUG}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
from collections import Counter
print(cfg.SLUG, 'diagrams', len(nodes), 'exercises', Counter(e["type"] for e in ex))
