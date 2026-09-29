import json,glob,os,sys,collections,statistics
root=os.path.expanduser('~/.claude/projects')
projs=[p for p in glob.glob(root+'/*') if any(k in p for k in sys.argv[1:])]
def scan(f):
    seen={};order=[]
    for line in open(f,errors='ignore'):
        try:o=json.loads(line)
        except: continue
        if o.get('type')!='assistant':continue
        m=o.get('message',{});u=m.get('usage')
        if not u:continue
        mid=m.get('id') or o.get('uuid')
        if mid not in seen:order.append(mid)
        seen[mid]=(u,m.get('model'))
    turns=[seen[i] for i in order]
    return turns
def tot(turns):
    t=collections.Counter()
    for u,_ in turns:
        t['in']+=u.get('input_tokens',0);t['cw']+=u.get('cache_creation_input_tokens',0)
        t['cr']+=u.get('cache_read_input_tokens',0);t['out']+=u.get('output_tokens',0)
    return t
def ctx(u):return u.get('input_tokens',0)+u.get('cache_creation_input_tokens',0)+u.get('cache_read_input_tokens',0)
agg=collections.defaultdict(lambda:{'n':0,'turns':[],'first':[],'peak':[],'t':collections.Counter(),'models':collections.Counter()})
for p in projs:
    for f in glob.glob(p+'/*.jsonl'):
        tr=scan(f)
        if not tr:continue
        a=agg['MAIN session'];a['n']+=1;a['turns'].append(len(tr));a['first'].append(ctx(tr[0][0]));a['peak'].append(max(ctx(u) for u,_ in tr));a['t']+=tot(tr)
        for _,m in tr:a['models'][m]+=1
    for f in glob.glob(p+'/*/subagents/*.jsonl'):
        tr=scan(f)
        if not tr:continue
        role='?'
        mf=f[:-6]+'.meta.json'
        if os.path.exists(mf):
            md=json.load(open(mf));role=md.get('customAgentType') or md.get('agentType') or '?'
            if not md.get('customAgentType'):
                import re;role='other:'+re.sub(r'[-_ ]?[T0-9].*','',role)[:14]
        a=agg[role];a['n']+=1;a['turns'].append(len(tr));a['first'].append(ctx(tr[0][0]));a['peak'].append(max(ctx(u) for u,_ in tr));a['t']+=tot(tr)
        for _,m in tr:a['models'][m]+=1
print(f"{'role':24}{'n':>4}{'turns med':>10}{'first ctx med':>14}{'peak med':>10}{'peak max':>10}{'cache_read':>13}{'cache_write':>12}{'input':>10}{'output':>10}  models")
for r,a in sorted(agg.items(),key=lambda x:-x[1]['t']['cr']):
    t=a['t']
    print(f"{r:24}{a['n']:>4}{statistics.median(a['turns']):>10.0f}{statistics.median(a['first']):>14,.0f}{statistics.median(a['peak']):>10,.0f}{max(a['peak']):>10,}{t['cr']:>13,}{t['cw']:>12,}{t['in']:>10,}{t['out']:>10,}  {dict(a['models'].most_common(2))}")
