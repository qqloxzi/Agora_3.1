"""Specialized Training in Tesuji Part 4 (101weiqi, 300 problems) → raw JSON.
Diagrams are typeset with a Go font as text rows; answers are listed at the end."""
import json, re, sys, collections
import pymupdf

PDF = sys.argv[1]
doc = pymupdf.open(PDF)
ROWCH = set('[+*!@,)')
problems = {}
answers = {}
for pi, page in enumerate(doc):
    spans = []
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            for s in l['spans']:
                t = s['text'].strip()
                if t:
                    spans.append((s['bbox'], t, s['font']))
    # answers: "(123) E2 F2 E1"
    full = page.get_text()
    for m in re.finditer(r'\((\d+)\)\s*((?:[A-T]\d{1,2}\s*)+)', full):
        answers[int(m.group(1))] = m.group(2).split()
    rows = [(bb, t) for bb, t, f in spans if len(t) >= 10 and set(t) <= ROWCH]
    nums = [(bb, int(t)) for bb, t, f in spans if re.fullmatch(r'\d{1,3}', t)]
    # group diagram rows by column (x0) and vertical proximity
    rows.sort(key=lambda r: (round(r[0][0]), r[0][1]))
    groups = []
    for bb, t in rows:
        g = groups[-1] if groups else None
        if g and abs(g['x'] - bb[0]) < 15 and 0 < bb[1] - g['y'] < 20:
            g['rows'].append(t); g['y'] = bb[1]; g['x1'] = max(g['x1'], bb[2])
        else:
            groups.append({'x': bb[0], 'x1': bb[2], 'y0': bb[1], 'y': bb[1], 'rows': [t]})
    for g in groups:
        # the problem number sits just below the diagram, horizontally within it
        cand = [(n, bb) for bb, n in nums if g['y'] < bb[1] < g['y'] + 40 and g['x'] - 20 < (bb[0] + bb[2]) / 2 < g['x1'] + 20]
        if len(cand) != 1:
            print('page', pi + 1, 'ambiguous number', cand, g['rows'][:2]); continue
        n = cand[0][0]
        assert n not in problems, n
        problems[n] = {'page': pi + 1, 'rows': g['rows']}
print('problems', len(problems), 'answers', len(answers))
print('missing problems', [n for n in range(1, 301) if n not in problems])
print('missing answers', [n for n in range(1, 301) if n not in answers])
print('row counts', collections.Counter(len(p['rows']) for p in problems.values()))
print('row widths', collections.Counter(len(r) for p in problems.values() for r in p['rows']))
print('chars', collections.Counter(c for p in problems.values() for r in p['rows'] for c in r))
json.dump({'problems': problems, 'answers': answers}, open('raw_tesuji5.json', 'w'), indent=0)
