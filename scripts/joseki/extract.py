import pymupdf, json, re
import sys
d=pymupdf.open(sys.argv[1] if len(sys.argv) > 1 else '/home/alikarakaya/Downloads/4-4+keima.pdf')
out=[];anom=[]
# Section letter for captions that lose their leading letter (A = hoshi, B = komoku...).
SECTION=sys.argv[3] if len(sys.argv) > 3 else 'A'
for pi,p in enumerate(d):
    dr=p.get_drawings()
    B=[x['rect'] for x in dr if x.get('fill') and abs(x['fill'][0]-0.918)<0.01][0]
    hoshi=[x['rect'] for x in dr if x.get('fill')==(0,0,0) and x['rect'].width<3]
    hx=sorted(set(round((r.x0+r.x1)/2,1) for r in hoshi)); hy=sorted(set(round((r.y0+r.y1)/2,1) for r in hoshi))
    # Grid from the 19 board lines when they are all drawn (hoshi dots can be
    # hidden under stones); otherwise from the hoshi, assuming the leftmost and
    # topmost visible ones are on the 4th line.
    vx=set(); hy_=set()
    for x in dr:
        for it in x['items']:
            if it[0]=='l':
                a,b=it[1],it[2]
                if abs(a.x-b.x)<0.1 and abs(a.y-b.y)>50: vx.add(round(a.x,1))
                if abs(a.y-b.y)<0.1 and abs(a.x-b.x)>50: hy_.add(round(a.y,1))
    if len(vx)==19 and len(hy_)==19:
        sp=(max(vx)-min(vx))/18; x0=min(vx); y0=min(hy_)
    else:
        sp=(hx[-1]-hx[0])/12; x0=hx[0]-3*sp; y0=hy[0]-3*sp
    def cell(cx,cy):
        c=(cx-x0)/sp; r=(cy-y0)/sp
        if abs(c-round(c))>0.3 or abs(r-round(r))>0.3: anom.append((pi+1,'offgrid',c,r))
        return int(round(c)),int(round(r))
    stones={}; circles=[]
    for x in dr:
        r=x['rect']
        if x.get('fill') in [(0,0,0),(1,1,1)] and 10<r.width<sp*1.2:
            col='B' if x['fill']==(0,0,0) else 'W'
            if r.y1<=B.y1+1: stones[cell((r.x0+r.x1)/2,(r.y0+r.y1)/2)]=col
            else: circles.append((r,col))
    marks={}
    for x in dr:
        r=x['rect']
        if x['type']=='s' and 5<r.width<11 and 5<r.height<11 and r.y1<B.y1:
            marks[cell((r.x0+r.x1)/2,(r.y0+r.y1)/2)]='×'
    spans=[]
    for b in p.get_text('dict')['blocks']:
        for l in b.get('lines',[]):
            for s in l['spans']:
                t=s['text'].strip()
                if t: spans.append((s['bbox'],t))
    cap=[s for s in spans if '变化图' in s[1]] or [s for s in spans if s[1].startswith('变化')]
    capy=cap[0][0][1]
    code=None
    capline=''.join(t for bx,t in sorted(spans,key=lambda s:s[0][0]) if abs(bx[1]-capy)<4)
    m=re.search(r'变化图\s*([A-Z0-9\- ]+)',capline)
    if not m:  # caption broken over two lines: "变化" / "图C-2-…"
        nxt=[t for bx,t in spans if bx[1]>capy+4 and t.startswith('图')]
        m=re.search(r'图\s*([A-Z0-9\- ]+)',nxt[0]); capy=[bx for bx,t in spans if t==nxt[0]][0][1]
    code=m.group(1).replace(' ','').strip('-')
    if re.match(r'\d',code): code=SECTION+'-'+code  # some captions lose the leading letter span
    foot=[];text=[]
    for bx,t in spans:
        cx=(bx[0]+bx[2])/2; cy=(bx[1]+bx[3])/2
        if bx[3]<=B.y1+2 and bx[1]>=B.y0:
            c=cell(cx,cy); marks[c]=marks.get(c,'')+t
        elif B.y1-5<bx[1]<capy-4:
            col=None
            for r,cc in circles:
                if r.x0<=cx<=r.x1 and r.y0<=cy<=r.y1: col=cc
            foot.append((bx[0],t,col))
        elif bx[1]>capy+4 and bx[1]<780:
            text.append((round(bx[1]),bx[0],t))
    text.sort()
    comment=''.join(t for *_,t in text).replace(' ','')
    foot.sort()
    toks=[]
    for _,t,col in foot:
        for tok in re.findall(r'\d+|[A-Z]|=|弃+',t): toks.append((tok,col))
    footnotes=[];i=0
    while i<len(toks):
        if re.fullmatch(r'\d+',toks[i][0]):
            n=int(toks[i][0]);col=toks[i][1]
            # "3 5 弃弃": several moves in a row that are passes
            j=i
            while j<len(toks) and re.fullmatch(r'\d+',toks[j][0]): j+=1
            if j<len(toks) and toks[j][0].startswith('弃') and len(toks[j][0])==j-i:
                footnotes+=[[int(toks[k][0]),'pass',toks[k][1]] for k in range(i,j)]; i=j+1; continue
            if i+1<len(toks) and toks[i+1][0].startswith('弃'): footnotes.append([n,'pass',col]); i+=2; continue
            if i+2<len(toks) and toks[i+1][0]=='=': footnotes.append([n,toks[i+2][0],col]); i+=3; continue
        anom.append((pi+1,'foot',toks)); break
    moves={};labels={}
    for c,t in marks.items():
        if re.fullmatch(r'\d+',t):
            if c not in stones: anom.append((pi+1,'num-no-stone',c,t))
            moves[int(t)]=c
        else: labels[t]=list(c)
    moved=set(moves.values())
    mv=[[n,moves[n][0],moves[n][1],stones.get(moves[n])] for n in sorted(moves)]
    for n,tgt,col in footnotes:
        if tgt=='pass': mv.append([n,None,None,col])
        elif tgt in labels: mv.append([n,labels[tgt][0],labels[tgt][1],col])
        elif tgt.isdigit() and int(tgt) in moves: mv.append([n,moves[int(tgt)][0],moves[int(tgt)][1],col])
        else: anom.append((pi+1,'foot-target',n,tgt))
    mv.sort()
    # A footnote like "2=A" can point at a lettered stone: that stone is the
    # move itself, not part of the starting position.
    for n,tgt,col in footnotes:
        if tgt in labels and tuple(labels[tgt]) in stones and stones[tuple(labels[tgt])]==col:
            moved.add(tuple(labels[tgt]))
    nums=[m[0] for m in mv]
    if nums and nums!=list(range(1,len(nums)+1)): anom.append((pi+1,'gap',nums))
    for a,b in zip(mv,mv[1:]):
        if a[3]==b[3]: anom.append((pi+1,'samecolor',a[0],b[0]))
    out.append(dict(page=pi+1,code=code,base=[[c[0],c[1],col] for c,col in sorted(stones.items()) if c not in moved],
      moves=mv,labels=labels,footnotes=footnotes,comment=comment))
json.dump(out,open(sys.argv[2] if len(sys.argv) > 2 else 'raw.json','w'),ensure_ascii=False,indent=0)
print(len(out))
for a in anom: print(a)
import collections
print([c for c,n in collections.Counter(o['code'] for o in out).items() if n>1])
print(sorted(set(k for o in out for k in o['labels'])))
