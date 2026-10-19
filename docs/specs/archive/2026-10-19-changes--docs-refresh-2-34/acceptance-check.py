import re,os,subprocess,sys
R=lambda p:open(p).read()
res=[]
def seg(t,a,b=None):
    i=t.find(a)
    if i<0: return ''
    j=t.find(b,i) if b else -1
    return t[i:j] if j>=0 else t[i:]
def ck(id,desc,ok,ev=""): res.append((id,desc,'PASS' if ok else 'FAIL',ev))
cmds=sorted(c[:-3] for c in os.listdir('.claude/commands')); skills=sorted(os.listdir('.claude/skills'))
svg=R('assets/akili-flow.svg'); readme=R('README.md'); flow=R('docs/flow.md'); hub=R('docs/README.md')
drawn=' '.join(re.sub(r'<[^>]+>','',t) for t in re.findall(r'<text\b[^>]*>(.*?)</text>',svg,re.S))
w=float(re.search(r'viewBox="[\d.]+ [\d.]+ ([\d.]+)',svg).group(1))
ck('FR-1','every packaged command drawn in the figure',all(('/'+c) in drawn for c in cmds),f"{sum(('/'+c) in drawn for c in cmds)}/{len(cmds)}")
ck('FR-1','video + diagram labels drawn','video' in drawn.lower() and 'diagram' in drawn.lower())
ck('FR-1 BUT','no unpackaged akili command drawn',not (set(re.findall(r'/akili-[a-z]+',drawn))-set('/'+c for c in cmds)),str(sorted(set(re.findall(r'/akili-[a-z]+',drawn)))))
ck('FR-1 BUT','HyperFrames/Archify only as user-installed/optional notes',all(('install' in s.lower() or 'optional' in s.lower()) for s in re.findall(r'[^<>]*(?:HyperFrames|Archify)[^<>]*',drawn)))
fs=[float(x) for x in re.findall(r'font-size="([\d.]+)"',svg)]
ck('FR-1 AND IT MUST','font floor ≥5.5 at 900 (amended)',min(fs)*900/w>=5.5,f"{min(fs)}*900/{w}={min(fs)*900/w:.2f}")
lab=[float(x) for x in re.findall(r'data-node-label[^>]*font-size="([\d.]+)"',svg)+re.findall(r'font-size="([\d.]+)"[^>]*data-node-label',svg)]
ck('FR-1 AND IT MUST','node labels ≥8 at 900 (amended)',bool(lab) and min(lab)*900/w>=8,f"min label {min(lab) if lab else None}")
png=subprocess.run(['magick','identify','-format','%w %h','assets/akili-flow.png'],capture_output=True,text=True).stdout
ck('FR-1 AND IT MUST','PNG 1800 px wide',png.split()[0]=='1800',png)
ck('FR-1 (amended)','README image links to full-size PNG',re.search(r'<a href="https://raw\.githubusercontent\.com/[^"]+akili-flow\.png"><img',readme) is not None)
alt_r=re.search(r'<img alt="([^"]*)" src="https://raw[^"]*akili-flow',readme).group(1)
alt_f=re.search(r'!\[([^\]]*)\]\(\.\./assets/akili-flow\.svg\)',flow).group(1)
desc=re.search(r'<desc[^>]*>(.*?)</desc>',svg,re.S).group(1).replace('&amp;','&')
ck('FR-2 AND IT MUST','alt identical at both sites and = SVG desc',alt_r==alt_f==desc)
ck('FR-2','alt names /akili-security, video, diagram, Kaizen',all(k in alt_r for k in ['/akili-security','video','diagram','Kaizen']))
ck('FR-2','SVG role=img + title',"role=\"img\"" in svg and 'AKILI-SPECS methodology lifecycle' in svg)
ck('FR-2','SVG standalone: no script/external fetch/@import',svg.count('<script')==0 and not re.search(r'(href|src)="https?://|url\(https?:',svg) and '@import' not in svg)
sec=seg(readme,'## What AKILI Covers','## Repository Structure')
ck('FR-3','capabilities section before Install with 3 linked rows',bool(sec) and all(l in sec for l in ['docs/commands/akili-security.md','docs/skills/video-production.md','docs/skills/diagram-design.md']))
ck('FR-3 AND IT MUST','native Windows statement',re.search(r'not (supported )?on native Windows',sec) is not None)
ck('FR-3','Start Here names /akili-security → Bug Track',re.search(r'/akili-security[^\n]*Bug Track',seg(readme,'## Start Here','## Command Map')) is not None)
cont=readme[readme.index('## Contents'):readme.index('## Install')]
cb=re.findall(r'^  - `(akili-[a-z-]+)\.md`',cont,re.M); sb=re.findall(r'^  - `([a-z0-9-]+)`$',cont[cont.index('.claude/skills/'):cont.index('.claude/templates/')],re.M)
ck('FR-4','Contents commands == package',sorted(cb)==cmds,f"{len(cb)}")
ck('FR-4','Contents skills == package',sorted(sb)==skills,f"{len(sb)}")
hdr=readme[:readme.index('</div>')]
ck('FR-5','Windows caveat in header, badge kept','Windows-supported' in hdr and '/akili-security</code> is not supported on native Windows' in hdr)
ck('FR-6','hub names every command',all(re.search('/'+c+r'\b',hub) for c in cmds))
ck('FR-6','hub points to video + diagram pages','skills/video-production.md' in hub and 'skills/diagram-design.md' in hub)
pl=flow[flow.index('## Primary Lifecycle'):flow.index('## Fast-Track')]
ck('FR-6','flow Primary Lifecycle shows /akili-security','/akili-security' in pl)
ck('FR-6','flow §10 video + §11 diagrams with conditions','### 10. Video Deliverables' in flow and '### 11. Diagram Slots' in flow and 'architecturally significant' in seg(flow,'### 11.') and 'diagrams/' in seg(flow,'### 11.'))
new_links=re.findall(r'\]\(([^)]+)\)',seg(flow,'### 10.'))
ck('FR-6 AND IT MUST','§10/§11 link only to skills/commands pages',bool(new_links) and all(l.startswith(('skills/','commands/')) for l in new_links),str(new_links))
for f,anchor,needle in [('docs/commands/akili-constitution.md','## Skill Map Scaffolding','whose condition holds'),('docs/commands/akili-specify.md','## Key Rules','Step 2.1'),('docs/commands/akili-archive.md','## Archive Summary','only when the spec has')]:
    t=R(f); sg=seg(t,anchor); k=sg.find('\n## ',5); sg=sg[:k] if k>0 else sg
    ck('FR-7',f'{f} names diagram-design + condition','diagram-design' in sg and needle in sg)
    ck('FR-7 BUT',f'{f} not mandatory / Archify not required',not re.search(r'diagrams? (are|is) (mandatory|required)|Archify (is )?required|requires Archify',sg))
inv=re.findall(r'^\| \[`([a-z0-9-]+)`\]',R('docs/skills/README.md'),re.M)
ck('FR-8','skills index alphabetical',inv==sorted(inv))
ch=R('CHANGELOG.md'); un=ch[ch.index('## [Unreleased]'):ch.index('## [2.34.1]')]
ck('FR-8','Unreleased: ### Changed, no placeholder, npm vs master wording','### Changed' in un and 'No unreleased changes yet.' not in un and 'npm' in un and 'master' in un)
ck('NFR-4','PNG ≤409600 B, SVG ≤153600 B',os.path.getsize('assets/akili-flow.png')<=409600 and os.path.getsize('assets/akili-flow.svg')<=153600,f"{os.path.getsize('assets/akili-flow.png')} / {os.path.getsize('assets/akili-flow.svg')}")
for shipped in ['README.md','docs/README.md','docs/flow.md']:
    ck('KZ-archify-1',f'{shipped}: no new link into docs/specs/changes',len(re.findall(r'\]\(docs/specs/changes|\]\(specs/changes',R(shipped)))==0)
for r in res: print('|'.join(r))
print('TOTAL',len(res),'FAIL',sum(r[2]=='FAIL' for r in res))
