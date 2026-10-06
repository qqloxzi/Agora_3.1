import json, collections
raw = json.load(open('raw_capraces.json'))
P = {int(k): v for k, v in raw['problems'].items()}
A = {int(k): v for k, v in raw['answers'].items()}
print('letters used', sorted({m[0] for a in A.values() for m in a}), 'max row', max(int(m[1:]) for a in A.values() for m in a))
SIZE = 19

def nb(x, y):
    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
        if 0 <= x+dx < SIZE and 0 <= y+dy < SIZE: yield x+dx, y+dy

def group(b, p):
    c = b[p]; seen = {p}; st = [p]; libs = set()
    while st:
        q = st.pop()
        for n in nb(*q):
            if n not in b: libs.add(n)
            elif b[n] == c and n not in seen: seen.add(n); st.append(n)
    return seen, libs

def play(b, p, c):
    if p in b: return 'occupied'
    b[p] = c; cap = 0
    for n in nb(*p):
        if n in b and b[n] != c:
            g, l = group(b, n)
            if not l:
                for q in g: del b[q]
                cap += len(g)
    if not group(b, p)[1]: return 'suicide'
    return cap

def board_of(rows, black):
    b = {}
    for r, row in enumerate(rows):
        for c, ch in enumerate(row):
            if ch in '!@': b[(c, 8 + r)] = 'B' if ch == black else 'W'
    return b

def coord(m, skip_i):
    letters = 'ABCDEFGHJKLMNOPQRST' if skip_i else 'ABCDEFGHIJKLMNOPQRS'
    return letters.index(m[0]), 19 - int(m[1:])

res = {}
for black in '!@':
    for skip_i in (True, False):
        bad = []
        caps_total = 0
        for n, a in A.items():
            b = board_of(P[n]['rows'], black); col = 'B'
            for i, m in enumerate(a):
                r = play(b, coord(m, skip_i), col)
                if isinstance(r, str): bad.append((n, i + 1, m, r)); break
                caps_total += r
                col = 'W' if col == 'B' else 'B'
        res[(black, skip_i)] = bad
        print('black =', black, 'skipI =', skip_i, '-> illegal sequences:', len(bad), bad[:6], 'captures', caps_total)
