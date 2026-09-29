import json,glob,os,sys,collections,re
root=os.path.expanduser('~/.claude/projects')
want=sys.argv[1]
files=[]
for p in glob.glob(root+'/*'):
    if not any(k in p for k in sys.argv[2:]):continue
    for f in glob.glob(p+'/*/subagents/*.jsonl'):
        mf=f[:-6]+'.meta.json'
        if os.path.exists(mf):
            md=json.load(open(mf))
            if want in ((md.get('customAgentType') or '')+' '+(md.get('agentType') or '')):files.append(f)
def size(c):
    if isinstance(c,str):return len(c)
    if isinstance(c,list):return sum(len(x.get('text','')) if isinstance(x,dict) and x.get('type')=='text' else 0 for x in c)
    return 0
bytool=collections.Counter();cnt=collections.Counter();cmd=collections.Counter();cmdn=collections.Counter();big=collections.Counter()
prompt=[];reads=collections.Counter();readn=collections.Counter()
for f in files:
    names={};first=True
    for line in open(f,errors='ignore'):
        try:o=json.loads(line)
        except:continue
        m=o.get('message',{});c=m.get('content')
        if o.get('type')=='user' and first:
            prompt.append(size(c) if not isinstance(c,str) else len(c));first=False
        if not isinstance(c,list):continue
        for b in c:
            if not isinstance(b,dict):continue
            if b.get('type')=='tool_use':
                names[b['id']]=(b['name'],b.get('input',{}))
            elif b.get('type')=='tool_result':
                n,inp=names.get(b.get('tool_use_id'),('?',{}))
                s=size(b.get('content'))
                bytool[n]+=s;cnt[n]+=1
                if s>20000:big[n]+=1
                if n=='Bash':
                    k=re.sub(r'\s+',' ',inp.get('command',''))
                    k=re.sub(r'^(cd \S+ ?(&&|;) ?)+','',k)
                    k=' '.join(k.split(' ')[:3])[:40]
                    cmd[k]+=s;cmdn[k]+=1
                if n=='Read':
                    k=os.path.basename(inp.get('file_path',''))
                    k='*.spec.ts' if k.endswith('.spec.ts') else k
                    reads[k]+=s;readn[k]+=1
tot=sum(bytool.values())
print(f"{want}: {len(files)} spawns; brief median {sorted(prompt)[len(prompt)//2]:,} chars; tool-result total {tot/1e6:.1f}M chars = {tot/len(files)/4:,.0f} tok/spawn")
for n,s in bytool.most_common(7):print(f"  {n:22}{cnt[n]:>6} calls {s/tot*100:5.1f}%  avg {s/cnt[n]:>8,.0f} chars  >20k: {big[n]}")
print(" top Bash by output:")
for k,s in cmd.most_common(10):print(f"  {k:42}{cmdn[k]:>5}x {s/1e3:>8,.0f}k chars avg {s/cmdn[k]:>7,.0f}")
print(" top Read by size:")
for k,s in reads.most_common(10):print(f"  {k:42}{readn[k]:>5}x {s/1e3:>8,.0f}k chars")
