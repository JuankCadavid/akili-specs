import json,glob,os,sys,collections,statistics,re
root=os.path.expanduser('~/.claude/projects')
rows=[]
specread=collections.Counter();specwhole=collections.Counter();testruns=[];rereads=[]
for p in glob.glob(root+'/*'):
    if not any(k in p for k in sys.argv[2:]):continue
    for f in glob.glob(p+'/*/subagents/*.jsonl'):
        mf=f[:-6]+'.meta.json'
        if not os.path.exists(mf):continue
        md=json.load(open(mf))
        if sys.argv[1] not in ((md.get('customAgentType') or '')+' '+(md.get('agentType') or '')):continue
        seen={};tr=0;files=collections.Counter()
        for line in open(f,errors='ignore'):
            try:o=json.loads(line)
            except:continue
            m=o.get('message',{})
            if o.get('type')=='assistant' and m.get('usage'):seen[m.get('id')]=m['usage']
            c=m.get('content')
            if isinstance(c,list):
                for b in c:
                    if isinstance(b,dict) and b.get('type')=='tool_use':
                        i=b.get('input',{})
                        if b['name']=='Read':
                            k=os.path.basename(i.get('file_path',''));files[i.get('file_path','')]+=1
                            if k in('design.md','tasks.md','requirements.md','trd.md','execution.md'):
                                specread[k]+=1
                                if not i.get('offset') and not i.get('limit'):specwhole[k]+=1
                        if b['name']=='Bash' and re.search(r'\b(jest|cypress|vitest|npm (run )?test|ng test|playwright)\b',i.get('command','')):tr+=1
        if not seen:continue
        us=list(seen.values())
        ctx=[u.get('input_tokens',0)+u.get('cache_creation_input_tokens',0)+u.get('cache_read_input_tokens',0) for u in us]
        rows.append((sum(u.get('cache_read_input_tokens',0) for u in us),len(us),max(ctx)))
        testruns.append(tr);rereads.append(sum(v-1 for v in files.values() if v>1))
rows.sort(reverse=True);n=len(rows);tot=sum(r[0] for r in rows)
q=lambda l,p:sorted(l)[min(len(l)-1,int(len(l)*p))]
print(f"{sys.argv[1]} n={n} total cache_read={tot/1e6:,.0f}M")
print(" turns p50/p75/p90/max:",q([r[1] for r in rows],.5),q([r[1] for r in rows],.75),q([r[1] for r in rows],.9),max(r[1] for r in rows))
print(" cache_read per spawn p50/p90 (M):",round(q([r[0] for r in rows],.5)/1e6,1),round(q([r[0] for r in rows],.9)/1e6,1))
print(f" top 10% of spawns ({n//10}) hold {sum(r[0] for r in rows[:n//10])/tot*100:.0f}% of cache_read; top 25% hold {sum(r[0] for r in rows[:n//4])/tot*100:.0f}%")
for t in (40,60,100):
    s=[r for r in rows if r[1]>t];print(f" spawns over {t} turns: {len(s)} ({len(s)/n*100:.0f}%) hold {sum(r[0] for r in s)/tot*100:.0f}% of cache_read")
for t in (150000,200000):
    s=[r for r in rows if r[2]>t];print(f" spawns peaking over {t//1000}k ctx: {len(s)} ({len(s)/n*100:.0f}%) hold {sum(r[0] for r in s)/tot*100:.0f}%")
print(" test-runner invocations per spawn p50/p90/max:",q(testruns,.5),q(testruns,.9),max(testruns))
print(" repeat Reads of an already-read file per spawn p50/p90:",q(rereads,.5),q(rereads,.9))
print(" spec-doc Reads (whole/total):",{k:f"{specwhole[k]}/{v}" for k,v in specread.items()})
