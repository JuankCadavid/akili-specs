# T8 validation evidence — cases 1, 2, 11 (real pseudo-TTY via expect) and case 10 (constitution Step 8C proxy walk)

Recorded verbatim by two T8 Implementers on 2026-10-02 in scratch projects outside the repo; appended to the spec folder by the Leader. Case 10 is a **proxy walk**: a Claude Code subagent executed `.claude/commands/akili-constitution.md` Step 8C literally with the user's chat answers supplied in the brief — not a human-driven session.

---

# T8 cases 1, 2, 11 — live pseudo-TTY evidence (changes/model-routing-configurator)

- Date: 2026-10-02 · repo HEAD fdaf8eb · node v22.12.0 · `akili` = `node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js`
- Scratch project (outside the repo): `/private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/t8proj.Z8mFX7` — `git init`, `.agents/{leader,implementer,reviewer,tester}.md` copied from `.claude/templates/`, `AGENTS.md` = prose, no section; baseline commit 82026c0.
- TTY: `/usr/bin/expect` spawn (pty). Every prompt is matched on its text up to readline's trailing cursor escape (`ESC[<n>G`), answered, and tagged `<<Pn …>>` via send_user (the tags appear in the log because log_file records send_user).
- Harness note (not product): the first case-1 expect script anchored prompts on `
> $`; the pty emits `
` and readline appends ` ESC[4G` after the prompt, so it timed out at the first prompt with nothing written (`git status` clean). Patterns were fixed to the escape anchor; no product behavior involved.

### Case 1 — interactive happy path: 1,5 → Claude 1,2,3 → Cursor family + claude-opus-4-6 @ 1,3 → Enter/Enter → Y → A; expected 8 prompts (FR-1 7 + Cursor placement)

#### Run 1a — answers exactly as the brief wrote them

```tcl
set timeout 30
set P [lindex $argv 0]
set LOG [lindex $argv 1]
log_file -noappend $LOG
cd $P
set n 0
set rosters 0
# readline ends every prompt with a cursor-column escape (ESC[<n>G); the
# question text itself carries no ESC after its leading clear, so
# <text>[^\x1b]*\x1b\[[0-9]+G matches only once the whole prompt is drawn.
set E {[^\x1b]*\x1b\[[0-9]+G}
spawn node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing
expect {
  -re "Which hosts do you use\\?$E"            { incr n; send_user "\n<<P$n hosts>>\n"; send "1,5\r"; exp_continue }
  -re "which models do you have\\?$E"          { incr n; incr rosters
                                                 if {$rosters == 1} { send_user "\n<<P$n claude roster>>\n"; send "1,2,3\r" } else { send_user "\n<<P$n cursor roster>>\n"; send "1\r" }
                                                 exp_continue }
  -re "model id for $E"                        { incr n; send_user "\n<<P$n family id>>\n"; send "claude-opus-4-6\r"; exp_continue }
  -re "Which tier\\(s\\) does $E"              { incr n; send_user "\n<<P$n placement>>\n"; send "1,3\r"; exp_continue }
  -re "Why pin the dated id$E"                 { incr n; send_user "\n<<P$n UNEXPECTED reason>>\n"; exit 96 }
  -re "CLI invocation \\\[claude\\\]$E"        { incr n; send_user "\n<<P$n claude cli>>\n"; send "\r"; exp_continue }
  -re "CLI invocation \\\[agent\\\]$E"         { incr n; send_user "\n<<P$n cursor cli>>\n"; send "\r"; exp_continue }
  -re "Bind the personas$E"                    { incr n; send_user "\n<<P$n wrappers>>\n"; send "Y\r"; exp_continue }
  -re "\\\[q\\\] quit$E"                       { incr n; send_user "\n<<P$n confirm>>\n"; send "A\r"; exp_continue }
  -re "NOT satisfied$E"                        { incr n; send_user "\n<<P$n UNEXPECTED unsatisfiable>>\n"; exit 98 }
  -re "\\\[a\\\]dopt / \\\[s\\\]kip$E"         { incr n; send_user "\n<<P$n UNEXPECTED adopt>>\n"; exit 97 }
  -re "try again\\."                           { send_user "\n<<UNEXPECTED re-ask>>\n"; exit 95 }
  timeout                                      { send_user "\n<<TIMEOUT after $n prompts>>\n"; exit 99 }
  eof
}
send_user "\n<<PROMPTS ANSWERED: $n>>\n"
lassign [wait] pid spawnid os_error value
send_user "<<CHILD EXIT: $value>>\n"
exit $value
```

Raw transcript (verbatim, incl. ANSI):
```text
spawn node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
[1G[0JWhich hosts do you use? (comma-separated numbers)
  [ ] 1) Claude Code
  [ ] 2) OpenCode
  [ ] 3) Antigravity
  [ ] 4) Codex
  [ ] 5) Cursor
>  [4G
<<P1 hosts>>
1,5
[1G[0JClaude Code — which models do you have? (comma-separated numbers)
  [ ] 1) Opus (opus)
  [ ] 2) Sonnet (sonnet)
  [ ] 3) Haiku (haiku)
  [ ] 4) other (type id)
>  [4G
<<P2 claude roster>>
1,2,3
[1G[0JCursor — which models do you have? (comma-separated numbers)
  [ ] 1) Claude Opus family — type its id
  [ ] 2) Composer family — type its id
  [ ] 3) GPT-5.6 Sol/Terra family — type its id
  [ ] 4) Claude Sonnet family — type its id
  [ ] 5) Composer (Fast) family — type its id
  [ ] 6) Gemini 3.8 Flash family — type its id
  [ ] 7) other (type id)
>  [4G
<<P3 cursor roster>>
1
[1G[0JCursor — model id for Claude Opus family
>  [4G
<<P4 family id>>
claude-opus-4-6
[1G[0JWhich tier(s) does `claude-opus-4-6` serve? (1–6, comma-separated)
>  [4G
<<P5 placement>>
1,3
[1G[0JClaude Code — CLI invocation [claude] (Enter accepts, type another, `-` leaves <CONFIRM>)
>  [claude] [13G
<<P6 claude cli>>

[1G[0JCursor — CLI invocation [agent] (Enter accepts, type another, `-` leaves <CONFIRM>)
  commands invoked as `/akili-<name>`
>  [agent] [12G
<<P7 cursor cli>>

[1G[0JBind the personas with native wrappers (Step 8E)? [Y/n]
>  [Y] [8G
<<P8 wrappers>>
Y
[1G[0JDerived tier table:
Claude Code (author ≠ auditor: ok)
  T1  opus  (fallback sonnet)  — *(alias — always latest)*
  T2  sonnet  (fallback haiku)
  T3  opus  (fallback sonnet)  — *(must differ from T2)*
  T4  sonnet  (fallback opus)  — (long context)
  T5  haiku  (fallback sonnet)
  T6  sonnet  (fallback opus)  — (vision)
Cursor (author ≠ auditor: unsatisfiable)
  T1  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T2  <CONFIRM SLUG>  (fallback —)  — Composer family (Cursor-native)
  T3  claude-opus-4-6  (fallback <CONFIRM SLUG>)  — author ≠ auditor NOT satisfied — add a model or dispatch T3 cross-host
  T4  <CONFIRM SLUG>  (fallback —)  — Claude Sonnet family (1M context)
  T5  <CONFIRM SLUG>  (fallback —)  — Composer (Fast) family
  T6  <CONFIRM SLUG>  (fallback —)  — Gemini 3.8 Flash family (vision)
[A]ccept / [t] adjust a tier / [q] quit
>  [a] [8G
<<P9 confirm>>
A
[1G[0JCursor: author ≠ auditor NOT satisfied — the Reviewer cannot differ from the Implementer
  1) add a model
  2) dispatch T3 cross-host
  3) leave it (no wrappers for Cursor)
>  [4G
<<P10 UNEXPECTED unsatisfiable>>
```

Cleaned copy (ANSI stripped, CR removed):
```text
spawn node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing
 █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝
Which hosts do you use? (comma-separated numbers)
  [ ] 1) Claude Code
  [ ] 2) OpenCode
  [ ] 3) Antigravity
  [ ] 4) Codex
  [ ] 5) Cursor
>  
<<P1 hosts>>
1,5
Claude Code — which models do you have? (comma-separated numbers)
  [ ] 1) Opus (opus)
  [ ] 2) Sonnet (sonnet)
  [ ] 3) Haiku (haiku)
  [ ] 4) other (type id)
>  
<<P2 claude roster>>
1,2,3
Cursor — which models do you have? (comma-separated numbers)
  [ ] 1) Claude Opus family — type its id
  [ ] 2) Composer family — type its id
  [ ] 3) GPT-5.6 Sol/Terra family — type its id
  [ ] 4) Claude Sonnet family — type its id
  [ ] 5) Composer (Fast) family — type its id
  [ ] 6) Gemini 3.8 Flash family — type its id
  [ ] 7) other (type id)
>  
<<P3 cursor roster>>
1
Cursor — model id for Claude Opus family
>  
<<P4 family id>>
claude-opus-4-6
Which tier(s) does `claude-opus-4-6` serve? (1–6, comma-separated)
>  
<<P5 placement>>
1,3
Claude Code — CLI invocation [claude] (Enter accepts, type another, `-` leaves <CONFIRM>)
>  [claude] 
<<P6 claude cli>>

Cursor — CLI invocation [agent] (Enter accepts, type another, `-` leaves <CONFIRM>)
  commands invoked as `/akili-<name>`
>  [agent] 
<<P7 cursor cli>>

Bind the personas with native wrappers (Step 8E)? [Y/n]
>  [Y] 
<<P8 wrappers>>
Y
Derived tier table:
Claude Code (author ≠ auditor: ok)
  T1  opus  (fallback sonnet)  — *(alias — always latest)*
  T2  sonnet  (fallback haiku)
  T3  opus  (fallback sonnet)  — *(must differ from T2)*
  T4  sonnet  (fallback opus)  — (long context)
  T5  haiku  (fallback sonnet)
  T6  sonnet  (fallback opus)  — (vision)
Cursor (author ≠ auditor: unsatisfiable)
  T1  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T2  <CONFIRM SLUG>  (fallback —)  — Composer family (Cursor-native)
  T3  claude-opus-4-6  (fallback <CONFIRM SLUG>)  — author ≠ auditor NOT satisfied — add a model or dispatch T3 cross-host
  T4  <CONFIRM SLUG>  (fallback —)  — Claude Sonnet family (1M context)
  T5  <CONFIRM SLUG>  (fallback —)  — Composer (Fast) family
  T6  <CONFIRM SLUG>  (fallback —)  — Gemini 3.8 Flash family (vision)
[A]ccept / [t] adjust a tier / [q] quit
>  [a] 
<<P9 confirm>>
A
Cursor: author ≠ auditor NOT satisfied — the Reviewer cannot differ from the Implementer
  1) add a model
  2) dispatch T3 cross-host
  3) leave it (no wrappers for Cursor)
>  
<<P10 UNEXPECTED unsatisfiable>>
```

exit=98 (expect script exit for the unscripted step-8 prompt; the wizard was still waiting — nothing written, scratch `git status --short` empty)

**Observed (1a):** after `A` at P9 the wizard asked a 10th question — `Cursor: author ≠ auditor NOT satisfied — the Reviewer cannot differ from the Implementer` (step 8). With one Cursor model the derived table shows `Cursor (author ≠ auditor: unsatisfiable)`, T2 = `<CONFIRM SLUG>`, T3 = `claude-opus-4-6`. Prompt count before step 8 = 9, not 8: the family option asks the id separately (P4 `Cursor — model id for Claude Opus family`) before the placement question (P5). — DOES NOT MATCH the brief's expectation (8 prompts ending at A). Note: FR-1's ≤ 8 bound is stated for "every id is packaged"; Cursor has no packaged ids (registry `hosts.cursor.models` are all `id: null` families), so the case as written is outside that bound and a single-model Cursor roster cannot satisfy author ≠ auditor.

#### Run 1b — same answers, step 8 answered `1` (add a model) → keep `claude-opus-4-6` + Claude Sonnet family → `claude-sonnet-4-6` @ T2 → A (deviation from the brief, chosen so both wrapper sets exist for inspection and cases 2/11)

```tcl
set timeout 30
set P [lindex $argv 0]
set LOG [lindex $argv 1]
log_file -noappend $LOG
cd $P
set n 0
set rosters 0
set ids 0
set places 0
set confirms 0
set E {[^\x1b]*\x1b\[[0-9]+G}
spawn node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing
expect {
  -re "Which hosts do you use\\?$E"            { incr n; send_user "\n<<P$n hosts>>\n"; send "1,5\r"; exp_continue }
  -re "which models do you have\\?$E"          { incr n; incr rosters
                                                 if {$rosters == 1} { send_user "\n<<P$n claude roster>>\n"; send "1,2,3\r" } elseif {$rosters == 2} { send_user "\n<<P$n cursor roster>>\n"; send "1\r" } else { send_user "\n<<P$n cursor roster (add a model)>>\n"; send "1,5\r" }
                                                 exp_continue }
  -re "model id for $E"                        { incr n; incr ids
                                                 if {$ids == 1} { send_user "\n<<P$n family id>>\n"; send "claude-opus-4-6\r" } else { send_user "\n<<P$n family id (add)>>\n"; send "claude-sonnet-4-6\r" }
                                                 exp_continue }
  -re "Which tier\\(s\\) does $E"              { incr n; incr places
                                                 if {$places == 1} { send_user "\n<<P$n placement>>\n"; send "1,3\r" } else { send_user "\n<<P$n placement (add)>>\n"; send "2\r" }
                                                 exp_continue }
  -re "Why pin the dated id$E"                 { incr n; send_user "\n<<P$n UNEXPECTED reason>>\n"; exit 96 }
  -re "CLI invocation \\\[claude\\\]$E"        { incr n; send_user "\n<<P$n claude cli>>\n"; send "\r"; exp_continue }
  -re "CLI invocation \\\[agent\\\]$E"         { incr n; send_user "\n<<P$n cursor cli>>\n"; send "\r"; exp_continue }
  -re "Bind the personas$E"                    { incr n; send_user "\n<<P$n wrappers>>\n"; send "Y\r"; exp_continue }
  -re "\\\[q\\\] quit$E"                       { incr n; incr confirms; send_user "\n<<P$n confirm #$confirms>>\n"; send "A\r"; exp_continue }
  -re "NOT satisfied$E"                        { incr n; send_user "\n<<P$n unsatisfiable -> 1 add a model>>\n"; send "1\r"; exp_continue }
  -re "\\\[a\\\]dopt / \\\[s\\\]kip$E"         { incr n; send_user "\n<<P$n UNEXPECTED adopt>>\n"; exit 97 }
  -re "try again\\."                           { send_user "\n<<UNEXPECTED re-ask>>\n"; exit 95 }
  timeout                                      { send_user "\n<<TIMEOUT after $n prompts>>\n"; exit 99 }
  eof
}
send_user "\n<<PROMPTS ANSWERED: $n>>\n"
lassign [wait] pid spawnid os_error value
send_user "<<CHILD EXIT: $value>>\n"
exit $value
```

Raw transcript (verbatim, incl. ANSI):
```text
spawn node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
[1G[0JWhich hosts do you use? (comma-separated numbers)
  [ ] 1) Claude Code
  [ ] 2) OpenCode
  [ ] 3) Antigravity
  [ ] 4) Codex
  [ ] 5) Cursor
>  [4G
<<P1 hosts>>
1,5
[1G[0JClaude Code — which models do you have? (comma-separated numbers)
  [ ] 1) Opus (opus)
  [ ] 2) Sonnet (sonnet)
  [ ] 3) Haiku (haiku)
  [ ] 4) other (type id)
>  [4G
<<P2 claude roster>>
1,2,3
[1G[0JCursor — which models do you have? (comma-separated numbers)
  [ ] 1) Claude Opus family — type its id
  [ ] 2) Composer family — type its id
  [ ] 3) GPT-5.6 Sol/Terra family — type its id
  [ ] 4) Claude Sonnet family — type its id
  [ ] 5) Composer (Fast) family — type its id
  [ ] 6) Gemini 3.8 Flash family — type its id
  [ ] 7) other (type id)
>  [4G
<<P3 cursor roster>>
1
[1G[0JCursor — model id for Claude Opus family
>  [4G
<<P4 family id>>
claude-opus-4-6
[1G[0JWhich tier(s) does `claude-opus-4-6` serve? (1–6, comma-separated)
>  [4G
<<P5 placement>>
1,3
[1G[0JClaude Code — CLI invocation [claude] (Enter accepts, type another, `-` leaves <CONFIRM>)
>  [claude] [13G
<<P6 claude cli>>

[1G[0JCursor — CLI invocation [agent] (Enter accepts, type another, `-` leaves <CONFIRM>)
  commands invoked as `/akili-<name>`
>  [agent] [12G
<<P7 cursor cli>>

[1G[0JBind the personas with native wrappers (Step 8E)? [Y/n]
>  [Y] [8G
<<P8 wrappers>>
Y
[1G[0JDerived tier table:
Claude Code (author ≠ auditor: ok)
  T1  opus  (fallback sonnet)  — *(alias — always latest)*
  T2  sonnet  (fallback haiku)
  T3  opus  (fallback sonnet)  — *(must differ from T2)*
  T4  sonnet  (fallback opus)  — (long context)
  T5  haiku  (fallback sonnet)
  T6  sonnet  (fallback opus)  — (vision)
Cursor (author ≠ auditor: unsatisfiable)
  T1  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T2  <CONFIRM SLUG>  (fallback —)  — Composer family (Cursor-native)
  T3  claude-opus-4-6  (fallback <CONFIRM SLUG>)  — author ≠ auditor NOT satisfied — add a model or dispatch T3 cross-host
  T4  <CONFIRM SLUG>  (fallback —)  — Claude Sonnet family (1M context)
  T5  <CONFIRM SLUG>  (fallback —)  — Composer (Fast) family
  T6  <CONFIRM SLUG>  (fallback —)  — Gemini 3.8 Flash family (vision)
[A]ccept / [t] adjust a tier / [q] quit
>  [a] [8G
<<P9 confirm #1>>
A
[1G[0JCursor: author ≠ auditor NOT satisfied — the Reviewer cannot differ from the Implementer
  1) add a model
  2) dispatch T3 cross-host
  3) leave it (no wrappers for Cursor)
>  [4G
<<P10 unsatisfiable -> 1 add a model>>
1
[1G[0JCursor — which models do you have? (comma-separated numbers; Enter keeps [x])
  [x] 1) claude-opus-4-6 (your id, placed T1+T3)
  [ ] 2) Claude Opus family — type its id
  [ ] 3) Composer family — type its id
  [ ] 4) GPT-5.6 Sol/Terra family — type its id
  [ ] 5) Claude Sonnet family — type its id
  [ ] 6) Composer (Fast) family — type its id
  [ ] 7) Gemini 3.8 Flash family — type its id
  [ ] 8) other (type id)
>  [1] [8G
<<P11 cursor roster (add a model)>>
1,5
[1G[0JCursor — model id for Claude Sonnet family
>  [4G
<<P12 family id (add)>>
claude-sonnet-4-6
[1G[0JWhich tier(s) does `claude-sonnet-4-6` serve? (1–6, comma-separated)
>  [4G
<<P13 placement (add)>>
2
[1G[0JDerived tier table:
Claude Code (author ≠ auditor: ok)
  T1  opus  (fallback sonnet)  — *(alias — always latest)*
  T2  sonnet  (fallback haiku)
  T3  opus  (fallback sonnet)  — *(must differ from T2)*
  T4  sonnet  (fallback opus)  — (long context)
  T5  haiku  (fallback sonnet)
  T6  sonnet  (fallback opus)  — (vision)
Cursor (author ≠ auditor: ok)
  T1  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T2  claude-sonnet-4-6  (fallback <CONFIRM SLUG>)
  T3  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T4  <CONFIRM SLUG>  (fallback —)  — Claude Sonnet family (1M context)
  T5  <CONFIRM SLUG>  (fallback —)  — Composer (Fast) family
  T6  <CONFIRM SLUG>  (fallback —)  — Gemini 3.8 Flash family (vision)
[A]ccept / [t] adjust a tier / [q] quit
>  [a] [8G
<<P14 confirm #2>>
A
appended  AGENTS.md
created  .claude/agents/akili-leader.md
created  .claude/agents/akili-implementer.md
created  .claude/agents/akili-reviewer.md
created  .claude/agents/akili-tester.md
created  .cursor/agents/akili-leader.md
created  .cursor/agents/akili-implementer.md
created  .cursor/agents/akili-reviewer.md
created  .cursor/agents/akili-tester.md
created  .agents/model-routing.json
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
Cursor: effort bracket omitted — rung unconfirmed
Cursor Tester: same model as the Implementer (`claude-sonnet-4-6`, T2 primary) — Step 8E default; Rule 1 allows it
[36mhint:[0m commit .agents/model-routing.json and the wrappers — akili doctor --agents --fix refuses a dirty .agents/

<<PROMPTS ANSWERED: 14>>
<<CHILD EXIT: 0>>
```

Cleaned copy:
```text
spawn node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing
 █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝
Which hosts do you use? (comma-separated numbers)
  [ ] 1) Claude Code
  [ ] 2) OpenCode
  [ ] 3) Antigravity
  [ ] 4) Codex
  [ ] 5) Cursor
>  
<<P1 hosts>>
1,5
Claude Code — which models do you have? (comma-separated numbers)
  [ ] 1) Opus (opus)
  [ ] 2) Sonnet (sonnet)
  [ ] 3) Haiku (haiku)
  [ ] 4) other (type id)
>  
<<P2 claude roster>>
1,2,3
Cursor — which models do you have? (comma-separated numbers)
  [ ] 1) Claude Opus family — type its id
  [ ] 2) Composer family — type its id
  [ ] 3) GPT-5.6 Sol/Terra family — type its id
  [ ] 4) Claude Sonnet family — type its id
  [ ] 5) Composer (Fast) family — type its id
  [ ] 6) Gemini 3.8 Flash family — type its id
  [ ] 7) other (type id)
>  
<<P3 cursor roster>>
1
Cursor — model id for Claude Opus family
>  
<<P4 family id>>
claude-opus-4-6
Which tier(s) does `claude-opus-4-6` serve? (1–6, comma-separated)
>  
<<P5 placement>>
1,3
Claude Code — CLI invocation [claude] (Enter accepts, type another, `-` leaves <CONFIRM>)
>  [claude] 
<<P6 claude cli>>

Cursor — CLI invocation [agent] (Enter accepts, type another, `-` leaves <CONFIRM>)
  commands invoked as `/akili-<name>`
>  [agent] 
<<P7 cursor cli>>

Bind the personas with native wrappers (Step 8E)? [Y/n]
>  [Y] 
<<P8 wrappers>>
Y
Derived tier table:
Claude Code (author ≠ auditor: ok)
  T1  opus  (fallback sonnet)  — *(alias — always latest)*
  T2  sonnet  (fallback haiku)
  T3  opus  (fallback sonnet)  — *(must differ from T2)*
  T4  sonnet  (fallback opus)  — (long context)
  T5  haiku  (fallback sonnet)
  T6  sonnet  (fallback opus)  — (vision)
Cursor (author ≠ auditor: unsatisfiable)
  T1  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T2  <CONFIRM SLUG>  (fallback —)  — Composer family (Cursor-native)
  T3  claude-opus-4-6  (fallback <CONFIRM SLUG>)  — author ≠ auditor NOT satisfied — add a model or dispatch T3 cross-host
  T4  <CONFIRM SLUG>  (fallback —)  — Claude Sonnet family (1M context)
  T5  <CONFIRM SLUG>  (fallback —)  — Composer (Fast) family
  T6  <CONFIRM SLUG>  (fallback —)  — Gemini 3.8 Flash family (vision)
[A]ccept / [t] adjust a tier / [q] quit
>  [a] 
<<P9 confirm #1>>
A
Cursor: author ≠ auditor NOT satisfied — the Reviewer cannot differ from the Implementer
  1) add a model
  2) dispatch T3 cross-host
  3) leave it (no wrappers for Cursor)
>  
<<P10 unsatisfiable -> 1 add a model>>
1
Cursor — which models do you have? (comma-separated numbers; Enter keeps [x])
  [x] 1) claude-opus-4-6 (your id, placed T1+T3)
  [ ] 2) Claude Opus family — type its id
  [ ] 3) Composer family — type its id
  [ ] 4) GPT-5.6 Sol/Terra family — type its id
  [ ] 5) Claude Sonnet family — type its id
  [ ] 6) Composer (Fast) family — type its id
  [ ] 7) Gemini 3.8 Flash family — type its id
  [ ] 8) other (type id)
>  [1] 
<<P11 cursor roster (add a model)>>
1,5
Cursor — model id for Claude Sonnet family
>  
<<P12 family id (add)>>
claude-sonnet-4-6
Which tier(s) does `claude-sonnet-4-6` serve? (1–6, comma-separated)
>  
<<P13 placement (add)>>
2
Derived tier table:
Claude Code (author ≠ auditor: ok)
  T1  opus  (fallback sonnet)  — *(alias — always latest)*
  T2  sonnet  (fallback haiku)
  T3  opus  (fallback sonnet)  — *(must differ from T2)*
  T4  sonnet  (fallback opus)  — (long context)
  T5  haiku  (fallback sonnet)
  T6  sonnet  (fallback opus)  — (vision)
Cursor (author ≠ auditor: ok)
  T1  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T2  claude-sonnet-4-6  (fallback <CONFIRM SLUG>)
  T3  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T4  <CONFIRM SLUG>  (fallback —)  — Claude Sonnet family (1M context)
  T5  <CONFIRM SLUG>  (fallback —)  — Composer (Fast) family
  T6  <CONFIRM SLUG>  (fallback —)  — Gemini 3.8 Flash family (vision)
[A]ccept / [t] adjust a tier / [q] quit
>  [a] 
<<P14 confirm #2>>
A
appended  AGENTS.md
created  .claude/agents/akili-leader.md
created  .claude/agents/akili-implementer.md
created  .claude/agents/akili-reviewer.md
created  .claude/agents/akili-tester.md
created  .cursor/agents/akili-leader.md
created  .cursor/agents/akili-implementer.md
created  .cursor/agents/akili-reviewer.md
created  .cursor/agents/akili-tester.md
created  .agents/model-routing.json
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
Cursor: effort bracket omitted — rung unconfirmed
Cursor Tester: same model as the Implementer (`claude-sonnet-4-6`, T2 primary) — Step 8E default; Rule 1 allows it
hint: commit .agents/model-routing.json and the wrappers — akili doctor --agents --fix refuses a dirty .agents/

<<PROMPTS ANSWERED: 14>>
<<CHILD EXIT: 0>>
```

exit=0 (child exit 0)

Numbered prompts observed (1b): P1 hosts · P2 Claude Code roster · P3 Cursor roster · P4 Cursor family id · P5 placement of `claude-opus-4-6` · P6 Claude Code CLI · P7 Cursor CLI · P8 wrappers · P9 confirm → A · P10 step 8 unsatisfiable → 1 · P11 Cursor roster again (pre-checked `claude-opus-4-6`) · P12 family id `claude-sonnet-4-6` · P13 placement → 2 · P14 confirm → A = **14** (9 up to the first confirm).

Files after run 1b (`cat AGENTS.md`, `ls .claude/agents .cursor/agents`, both reviewer wrappers, `cat .agents/model-routing.json`):

```text
$ cat AGENTS.md
# Agents

This scratch project exercises akili routing. Prose only, no Model Routing section.

<!-- akili:section id=model-routing since=v2.31.0 -->
## Model Routing

**Criteria first, model second:** each phase declares what it needs, the tier names that need, and only the registry below names models. Principles: match the dominant demand; ARCHITECT = BUILDER; **author ≠ auditor**; reserve deep reasoning for propose, specify, verify, **and the orchestrating Leader**; fast & cheap for archive and formatting only — **`tasks.md` decomposition is T1, not cheap formatting**.

### Capability tiers

| Tier | Definition |
|---|---|
| **T1 Architect** | Deep reasoning for architecture, trade-offs, intent, **task decomposition**, and **live orchestration judgment** (decomposition in flight, runtime skill selection, FAIL adjudication, pivot). |
| **T2 Coder** | Maximum coding throughput and instruction-following for writing and editing code and tests. |
| **T3 Auditor** | Independent critical review — conformance, bug-finding, drift; must differ from the author model. |
| **T4 Context-Ingest** | Large-context absorption of legacy codebases and baseline docs — window size over depth. |
| **T5 Fast-Cheap** | Cheap, fast structured formatting and summarization. |
| **T6 Multimodal** | Visual / UI-UX reasoning over images, screenshots, and design references. |

### Phase → tier mapping

| Phase / Role | Tier(s) |
|---|---|
| `/akili-constitution` | T4 + T1 |
| `/akili-propose` | T1 |
| `/akili-quick` | T2 |
| `/akili-specify` → requirements.md / design.md / tasks.md | T1 |
| `/akili-specify` → UX/UI design | T6 |
| `/akili-execute` → **Leader** (writes no code; selects skills, adjudicates FAILs, decides pivots) | T1 |
| `/akili-execute` → **Implementer** | T2 |
| `/akili-execute` → **Reviewer** | T3 |
| `/akili-execute` → **Verifier** (evidence re-run) | T5 |
| `/akili-test` → **Leader** (orchestration; writes no tests) | T1 |
| `/akili-test` → **Tester(s)** (test authoring) | T2 |
| `/akili-validate` | T3 |
| `/akili-audit` | T4 + T3 |
| `/akili-archive`, `/akili-resume` | T5 |
| `/akili-seo` | T3 + T5 |

**The Reviewer model MUST differ from the Implementer model** (author ≠ auditor): T2 and T3 resolve to different concrete models; if they collapse, escalate the Reviewer one tier. Prefer a Tester model different from the Implementer's (author ≠ tester).

### Model registry

Updated: 2026-10

**Alias-first rule:** the Claude Code column uses floating aliases (`opus`, `sonnet`, `haiku`), so it survives model churn with zero edits. Pin a dated model ID only when you deliberately want to freeze a version, and record why next to the pin. OpenCode slugs are concrete (no alias mechanism); a roster that is unknown takes a `<CONFIRM SLUG>` placeholder rather than a guess.

| Tier | Claude Code | OpenCode | Antigravity | Codex | Cursor | Fallback |
|---|---|---|---|---|---|---|
| **T1 Architect** | `opus` *(alias — always latest)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` Sol where the plan allows | `claude-opus-4-6` | `sonnet` (Claude Code) · `opencode-go/glm-5.3` (OpenCode) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
| **T2 Coder** | `sonnet` | `opencode-go/deepseek-v4.1-flash` (32,500 @ $15; 4x promo → 130,000 @ $60 through 2026-09-20) | `gemini-3.8-flash-medium` | `gpt-5.6-luna` | `claude-sonnet-4-6` | `haiku` (Claude Code) · `opencode-go/deepseek-v4-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
| **T3 Auditor** *(≠ T2)* | `opus` *(must differ from T2)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) *(≠ T2)* | `gemini-3.1-pro-high` *(≠ T2 family)* | `gpt-5.6-terra` *(≠ Luna)*; Sol where the plan allows | `claude-opus-4-6` | `sonnet` (Claude Code) · `claude-sonnet-4-6` (Antigravity) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
| **T4 Context-Ingest** | `sonnet` (long context) | `opencode-go/deepseek-v4.1-flash` `<CONFIRM>` context window (32,500 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` | `<CONFIRM SLUG>` Claude Sonnet family (1M context) | `opus` (Claude Code) · `opencode-go/mimo-v2.5` (OpenCode) · `<CONFIRM SLUG>` (Codex) |
| **T5 Fast-Cheap** | `haiku` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `<CONFIRM SLUG>` Composer (Fast) family | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) |
| **T6 Multimodal** | `sonnet` (vision) | `opencode-go/deepseek-v4-flash-vision-exp` (32,500 @ $15; **Exp**) | `gemini-3.8-flash-high` vision | `gpt-5.6-terra` prefer cross-host dispatch | `<CONFIRM SLUG>` Gemini 3.8 Flash family (vision) | `opus` (Claude Code) · `<CONFIRM ID>` (Antigravity) · `<CONFIRM SLUG>` (Codex) |

No dated model ID is pinned.

**Antigravity** names the family and effort ID: Gemini 3.8 Flash for the volume tiers, Gemini 3.1 Pro as the T3 auditor, confirmed with `agy models`. Dial → ID map:

| Dial | `low` | `medium` | `high` / `xhigh` / `max` |
|---|---|---|---|
| Antigravity effort ID | `-low` | `-medium` | `-high` |

**Codex** names a tier family (Astra, Sol, Terra, Luna); the exact slug for the wrapper's `model =` is confirmed against the project's own `/model` roster **and account plan** — Astra and Sol are plan-gated. Where they are gated, keep author ≠ auditor with Reviewer `gpt-5.6-terra` ≠ Implementer `gpt-5.6-luna`.

**Cursor** names a tier family, not a slug — the roster is multi-vendor with no floating alias besides `auto`. Confirm the exact ID against the `/model` picker in the `agent` CLI; an effort parameter maps the dial as `low`→`[effort=low]`, `medium`→`[effort=medium]`, `high`/`xhigh`/`max`→`[effort=high]` `<CONFIRM>`; a model whose picker shows no effort parameter takes no bracket.

**Every host column stays, including hosts this session is not running in** — the registry belongs to the project, not to the session that wrote it. An unknown roster is a `<CONFIRM SLUG>` placeholder, never a dropped column.

**Author ≠ auditor per host:**

- **Claude Code:** Implementer (T2) `sonnet` ≠ Reviewer (T3) `opus`.
- **OpenCode:** packaged defaults — Implementer (T2) `opencode-go/deepseek-v4.1-flash` ≠ Reviewer (T3) `opencode-go/deepseek-v4-pro`.
- **Antigravity:** packaged defaults — Implementer (T2) `gemini-3.8-flash-medium` ≠ Reviewer (T3) `gemini-3.1-pro-high`.
- **Codex:** packaged defaults — Implementer (T2) `gpt-5.6-luna` ≠ Reviewer (T3) `gpt-5.6-terra`.
- **Cursor:** Implementer (T2) `claude-sonnet-4-6` ≠ Reviewer (T3) `claude-opus-4-6`.

**CLI invocation per host** (confirmed with the user, never probed; unconfirmed values stay `<CONFIRM>`):

| Claude Code | OpenCode | Antigravity | Codex | Cursor |
|---|---|---|---|---|
| `claude` | `<CONFIRM>` | `<CONFIRM>` | `<CONFIRM>` | `agent` |

**Cross-host dispatch:** T6 Multimodal → Antigravity (packaged default) (not selected in this run). The line records the routing preference only, never the dispatcher. Reach across hosts before degrading within one, but only for a real capability gap — a cross-host spawn costs a fresh context, which a one-tier difference does not repay.

To change models, re-run `akili routing` — it regenerates only this fenced section — or remove the fence and edit the table by hand. Never pin a dated model name where a floating alias exists. Never add `model:` to command frontmatter; enforced bindings live only in the Step 8E agent wrappers.

*Generated by `akili routing` from `.agents/model-routing.json`; a hand edit inside this fence is refused on the next run unless `--force`.*

**Rate limits are per-generation, not per-family:** a new top-tier generation draws on its own quota, so moving T1/T3 onto it neither frees nor inherits headroom. **A frontier escalation pin** (e.g. `claude-fable-5` on T1/T3) is re-justified whenever the `opus` alias advances a generation: try the alias at `xhigh`/`max` before renewing the pin, and record the reason for the pin.

### Effort dial

Effort is the second, **per-task** routing dimension, orthogonal to the tier: the tier picks the model, effort picks how hard it thinks on *this* task. The `/akili-execute` and `/akili-test` Leaders read this subsection to set each worker's effort.

| Signal | Effort |
|---|---|
| Trivial / mechanical (copy, rename, style) | `low` |
| Standard task, clear scope | `medium` |
| Complex (algorithm, concurrency, security, ambiguity) | `xhigh` |
| Correctness-critical (can't be wrong, hard to revert) | `max` |

| Role / Phase | Default effort |
|---|---|
| T1 `/akili-propose` / `/akili-specify` / **Leader** | `high` |
| T2 **Implementer / Tester** | `medium` — flex by task |
| T3 **Reviewer** / `/akili-validate` | `high` |
| T5 `/akili-archive` / setup steps | `low` |

- **Rework:** bump effort one level on every retry.
- **Tier ↔ effort:** never `max` a cheaper tier — escalate the tier instead.
- **Re-baseline:** effort defaults are per-generation — sweep them (`medium`/`high`/`xhigh` on a real spec) whenever the model generation changes; the tier mapping survives churn, these defaults do not. A task that arrives under-specified (a `[~]` resume or a post-Pivot retry) starts one level higher.
- **Effort is not a verbosity dial:** lowering effort does not reliably shorten output — fix long reports in the brief (`caveman` / `cognitive-doc-design`), never by dropping effort.
<!-- /akili:section -->
$ ls .claude/agents .cursor/agents
.claude/agents:
akili-implementer.md
akili-leader.md
akili-reviewer.md
akili-tester.md

.cursor/agents:
akili-implementer.md
akili-leader.md
akili-reviewer.md
akili-tester.md
$ cat .cursor/agents/akili-reviewer.md
---
name: akili-reviewer
description: AKILI Reviewer — independent audit of the Implementer's diff against the spec.
model: claude-opus-4-6
readonly: true
---
Read `.agents/reviewer.md` in the project root and adopt it fully as your persona and
operating contract before doing anything else.
$ cat .claude/agents/akili-reviewer.md
---
name: akili-reviewer
description: AKILI Reviewer — independent audit of the Implementer's diff against the spec.
model: opus
tools: Read, Grep, Glob
---
Read `.agents/reviewer.md` in the project root and adopt it fully as your persona and
operating contract before doing anything else.
$ cat .agents/model-routing.json
{
  "authorAuditor": {
    "claude": "ok",
    "cursor": "ok"
  },
  "cli": {
    "claude": "claude",
    "cursor": "agent"
  },
  "decisions": {
    "claude": {
      "restriction": "applied"
    },
    "cursor": {
      "effortBracket": "omitted: rung unconfirmed",
      "restriction": "applied"
    }
  },
  "generatedBy": "2.31.0",
  "hosts": [
    "claude",
    "cursor"
  ],
  "mapping": {
    "claude": {
      "T1": {
        "fallback": "sonnet",
        "note": "*(alias — always latest)*",
        "primary": "opus"
      },
      "T2": {
        "fallback": "haiku",
        "note": "",
        "primary": "sonnet"
      },
      "T3": {
        "fallback": "sonnet",
        "note": "*(must differ from T2)*",
        "primary": "opus"
      },
      "T4": {
        "fallback": "opus",
        "note": "(long context)",
        "primary": "sonnet"
      },
      "T5": {
        "fallback": "sonnet",
        "note": "",
        "primary": "haiku"
      },
      "T6": {
        "fallback": "opus",
        "note": "(vision)",
        "primary": "sonnet"
      }
    },
    "cursor": {
      "T1": {
        "fallback": "<CONFIRM SLUG>",
        "note": "",
        "primary": "claude-opus-4-6"
      },
      "T2": {
        "fallback": "<CONFIRM SLUG>",
        "note": "",
        "primary": "claude-sonnet-4-6"
      },
      "T3": {
        "fallback": "<CONFIRM SLUG>",
        "note": "",
        "primary": "claude-opus-4-6"
      },
      "T4": {
        "fallback": "—",
        "note": "Claude Sonnet family (1M context)",
        "primary": "<CONFIRM SLUG>"
      },
      "T5": {
        "fallback": "—",
        "note": "Composer (Fast) family",
        "primary": "<CONFIRM SLUG>"
      },
      "T6": {
        "fallback": "—",
        "note": "Gemini 3.8 Flash family (vision)",
        "primary": "<CONFIRM SLUG>"
      }
    }
  },
  "roster": {
    "claude": [
      {
        "id": "opus",
        "source": "packaged"
      },
      {
        "id": "sonnet",
        "source": "packaged"
      },
      {
        "id": "haiku",
        "source": "packaged"
      }
    ],
    "cursor": [
      {
        "id": "claude-opus-4-6",
        "source": "user",
        "tiers": [
          "T1",
          "T3"
        ]
      },
      {
        "id": "claude-sonnet-4-6",
        "source": "user",
        "tiers": [
          "T2"
        ]
      }
    ]
  },
  "unselectedHosts": "keep-previous-else-packaged",
  "updatedAt": "2026-10-02",
  "version": 1,
  "wrappers": "yes"
}
```

**Observed (case 1):** fenced `<!-- akili:section id=model-routing since=v2.31.0 -->` appended below the prose (prose untouched); Cursor column T1/T3 `claude-opus-4-6`, T2 `claude-sonnet-4-6`, no fixed T3 note on the user-placed Cursor primary (T9 behavior); 4 + 4 wrappers created; `.cursor/agents/akili-reviewer.md` has `model: claude-opus-4-6` + `readonly: true`; Claude reviewer `model: opus`, `tools: Read, Grep, Glob`; answers file records both rosters, `cli` claude/agent, wrappers yes. Prompt count — DOES NOT MATCH: 9 prompts to the first confirm (family id prompt not counted by the brief), then an unscripted step-8 question because a one-model Cursor roster is unsatisfiable; files — match once step 8 is resolved.

### Case 2 — adjust round: re-run, Enter through pre-fill, t → host → T3 → sonnet (one-line rejection naming T3 = T2) → opus → A

Scratch state before: run-1b output committed (390c522).

```tcl
set timeout 30
set P [lindex $argv 0]
set LOG [lindex $argv 1]
log_file -noappend $LOG
cd $P
set n 0
set confirms 0
set picks 0
set E {[^\x1b]*\x1b\[[0-9]+G}
spawn node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing
expect {
  -re "Which hosts do you use\\?$E"            { incr n; send_user "\n<<P$n hosts (pre-filled) Enter>>\n"; send "\r"; exp_continue }
  -re "which models do you have\\?$E"          { incr n; send_user "\n<<P$n roster (pre-filled) Enter>>\n"; send "\r"; exp_continue }
  -re "model id for $E"                        { incr n; send_user "\n<<P$n UNEXPECTED id re-typed>>\n"; exit 94 }
  -re "Which tier\\(s\\) does $E"              { incr n; send_user "\n<<P$n UNEXPECTED placement>>\n"; exit 93 }
  -re "CLI invocation \\\[$E"                  { incr n; send_user "\n<<P$n cli (pre-filled) Enter>>\n"; send "\r"; exp_continue }
  -re "Bind the personas$E"                    { incr n; send_user "\n<<P$n wrappers (pre-filled) Enter>>\n"; send "\r"; exp_continue }
  -re "\\\[q\\\] quit$E"                       { incr n; incr confirms
                                                 if {$confirms == 1} { send_user "\n<<P$n confirm #1 -> t>>\n"; send "t\r" } else { send_user "\n<<P$n confirm #$confirms -> A>>\n"; send "A\r" }
                                                 exp_continue }
  -re "Adjust which host\\?$E"                 { incr n; send_user "\n<<P$n host -> 1 Claude Code>>\n"; send "1\r"; exp_continue }
  -re "Adjust which tier\\? $E"                { incr n; send_user "\n<<P$n tier -> 3 (T3)>>\n"; send "3\r"; exp_continue }
  -re "T3 — pick a model:$E"                   { incr n; incr picks
                                                 if {$picks == 1} { send_user "\n<<P$n pick -> 2 (sonnet)>>\n"; send "2\r" } else { send_user "\n<<P$n pick -> 1 (opus)>>\n"; send "1\r" }
                                                 exp_continue }
  -re "NOT satisfied$E"                        { incr n; send_user "\n<<P$n UNEXPECTED unsatisfiable>>\n"; exit 98 }
  -re "\\\[a\\\]dopt / \\\[s\\\]kip$E"         { incr n; send_user "\n<<P$n UNEXPECTED adopt>>\n"; exit 97 }
  -re "try again\\."                           { send_user "\n<<UNEXPECTED re-ask>>\n"; exit 95 }
  timeout                                      { send_user "\n<<TIMEOUT after $n prompts>>\n"; exit 99 }
  eof
}
send_user "\n<<PROMPTS ANSWERED: $n>>\n"
lassign [wait] pid spawnid os_error value
send_user "<<CHILD EXIT: $value>>\n"
exit $value
```

Raw transcript (verbatim, incl. ANSI):
```text
spawn node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing
[36m █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝[0m
[1G[0JWhich hosts do you use? (comma-separated numbers; Enter keeps [x])
  [x] 1) Claude Code
  [ ] 2) OpenCode
  [ ] 3) Antigravity
  [ ] 4) Codex
  [x] 5) Cursor
>  [1,5] [10G
<<P1 hosts (pre-filled) Enter>>

[1G[0JClaude Code — which models do you have? (comma-separated numbers; Enter keeps [x])
  [x] 1) Opus (opus)
  [x] 2) Sonnet (sonnet)
  [x] 3) Haiku (haiku)
  [ ] 4) other (type id)
>  [1,2,3] [12G
<<P2 roster (pre-filled) Enter>>

[1G[0JCursor — which models do you have? (comma-separated numbers; Enter keeps [x])
  [x] 1) claude-opus-4-6 (your id, placed T1+T3)
  [x] 2) claude-sonnet-4-6 (your id, placed T2)
  [ ] 3) Claude Opus family — type its id
  [ ] 4) Composer family — type its id
  [ ] 5) GPT-5.6 Sol/Terra family — type its id
  [ ] 6) Claude Sonnet family — type its id
  [ ] 7) Composer (Fast) family — type its id
  [ ] 8) Gemini 3.8 Flash family — type its id
  [ ] 9) other (type id)
>  [1,2] [10G
<<P3 roster (pre-filled) Enter>>

[1G[0JClaude Code — CLI invocation [claude] (Enter accepts, type another, `-` leaves <CONFIRM>)
>  [claude] [13G
<<P4 cli (pre-filled) Enter>>

[1G[0JCursor — CLI invocation [agent] (Enter accepts, type another, `-` leaves <CONFIRM>)
  commands invoked as `/akili-<name>`
>  [agent] [12G
<<P5 cli (pre-filled) Enter>>

[1G[0JBind the personas with native wrappers (Step 8E)? [Y/n]
>  [Y] [8G
<<P6 wrappers (pre-filled) Enter>>

[1G[0JDerived tier table:
Claude Code (author ≠ auditor: ok)
  T1  opus  (fallback sonnet)  — *(alias — always latest)*
  T2  sonnet  (fallback haiku)
  T3  opus  (fallback sonnet)  — *(must differ from T2)*
  T4  sonnet  (fallback opus)  — (long context)
  T5  haiku  (fallback sonnet)
  T6  sonnet  (fallback opus)  — (vision)
Cursor (author ≠ auditor: ok)
  T1  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T2  claude-sonnet-4-6  (fallback <CONFIRM SLUG>)
  T3  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T4  <CONFIRM SLUG>  (fallback —)  — Claude Sonnet family (1M context)
  T5  <CONFIRM SLUG>  (fallback —)  — Composer (Fast) family
  T6  <CONFIRM SLUG>  (fallback —)  — Gemini 3.8 Flash family (vision)
[A]ccept / [t] adjust a tier / [q] quit
>  [a] [8G
<<P7 confirm #1 -> t>>
t
[1G[0JAdjust which host?
  1) Claude Code
  2) Cursor
>  [4G
<<P8 host -> 1 Claude Code>>
1
[1G[0JAdjust which tier? (1–6)
  T1  opus
  T2  sonnet
  T3  opus
  T4  sonnet
  T5  haiku
  T6  sonnet
>  [4G
<<P9 tier -> 3 (T3)>>
3
[1G[0JT3 — pick a model:
  1) opus (current)
  2) sonnet
  3) haiku
>  [4G
<<P10 pick -> 2 (sonnet)>>
2
[1G[0JT3 = T2 rejected: `sonnet` is the Implementer's model (T2) — the Reviewer must run on a different model (author ≠ auditor)
T3 — pick a model:
  1) opus (current)
  2) sonnet
  3) haiku
>  [4G
<<P11 pick -> 1 (opus)>>
1
[1G[0JDerived tier table:
Claude Code (author ≠ auditor: ok)
  T1  opus  (fallback sonnet)
  T2  sonnet  (fallback haiku)
  T3  opus  (fallback sonnet)
  T4  sonnet  (fallback opus)  — (long context)
  T5  haiku  (fallback sonnet)
  T6  sonnet  (fallback opus)  — (vision)
Cursor (author ≠ auditor: ok)
  T1  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T2  claude-sonnet-4-6  (fallback <CONFIRM SLUG>)
  T3  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T4  <CONFIRM SLUG>  (fallback —)  — Claude Sonnet family (1M context)
  T5  <CONFIRM SLUG>  (fallback —)  — Composer (Fast) family
  T6  <CONFIRM SLUG>  (fallback —)  — Gemini 3.8 Flash family (vision)
[A]ccept / [t] adjust a tier / [q] quit
>  [a] [8G
<<P12 confirm #2 -> A>>
A
replaced  AGENTS.md
unchanged  .claude/agents/akili-leader.md
unchanged  .claude/agents/akili-implementer.md
unchanged  .claude/agents/akili-reviewer.md
unchanged  .claude/agents/akili-tester.md
unchanged  .cursor/agents/akili-leader.md
unchanged  .cursor/agents/akili-implementer.md
unchanged  .cursor/agents/akili-reviewer.md
unchanged  .cursor/agents/akili-tester.md
replaced  .agents/model-routing.json
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
Cursor: effort bracket omitted — rung unconfirmed
Cursor Tester: same model as the Implementer (`claude-sonnet-4-6`, T2 primary) — Step 8E default; Rule 1 allows it
[36mhint:[0m commit .agents/model-routing.json and the wrappers — akili doctor --agents --fix refuses a dirty .agents/

<<PROMPTS ANSWERED: 12>>
<<CHILD EXIT: 0>>
```

Cleaned copy:
```text
spawn node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js routing
 █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝
Which hosts do you use? (comma-separated numbers; Enter keeps [x])
  [x] 1) Claude Code
  [ ] 2) OpenCode
  [ ] 3) Antigravity
  [ ] 4) Codex
  [x] 5) Cursor
>  [1,5] 
<<P1 hosts (pre-filled) Enter>>

Claude Code — which models do you have? (comma-separated numbers; Enter keeps [x])
  [x] 1) Opus (opus)
  [x] 2) Sonnet (sonnet)
  [x] 3) Haiku (haiku)
  [ ] 4) other (type id)
>  [1,2,3] 
<<P2 roster (pre-filled) Enter>>

Cursor — which models do you have? (comma-separated numbers; Enter keeps [x])
  [x] 1) claude-opus-4-6 (your id, placed T1+T3)
  [x] 2) claude-sonnet-4-6 (your id, placed T2)
  [ ] 3) Claude Opus family — type its id
  [ ] 4) Composer family — type its id
  [ ] 5) GPT-5.6 Sol/Terra family — type its id
  [ ] 6) Claude Sonnet family — type its id
  [ ] 7) Composer (Fast) family — type its id
  [ ] 8) Gemini 3.8 Flash family — type its id
  [ ] 9) other (type id)
>  [1,2] 
<<P3 roster (pre-filled) Enter>>

Claude Code — CLI invocation [claude] (Enter accepts, type another, `-` leaves <CONFIRM>)
>  [claude] 
<<P4 cli (pre-filled) Enter>>

Cursor — CLI invocation [agent] (Enter accepts, type another, `-` leaves <CONFIRM>)
  commands invoked as `/akili-<name>`
>  [agent] 
<<P5 cli (pre-filled) Enter>>

Bind the personas with native wrappers (Step 8E)? [Y/n]
>  [Y] 
<<P6 wrappers (pre-filled) Enter>>

Derived tier table:
Claude Code (author ≠ auditor: ok)
  T1  opus  (fallback sonnet)  — *(alias — always latest)*
  T2  sonnet  (fallback haiku)
  T3  opus  (fallback sonnet)  — *(must differ from T2)*
  T4  sonnet  (fallback opus)  — (long context)
  T5  haiku  (fallback sonnet)
  T6  sonnet  (fallback opus)  — (vision)
Cursor (author ≠ auditor: ok)
  T1  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T2  claude-sonnet-4-6  (fallback <CONFIRM SLUG>)
  T3  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T4  <CONFIRM SLUG>  (fallback —)  — Claude Sonnet family (1M context)
  T5  <CONFIRM SLUG>  (fallback —)  — Composer (Fast) family
  T6  <CONFIRM SLUG>  (fallback —)  — Gemini 3.8 Flash family (vision)
[A]ccept / [t] adjust a tier / [q] quit
>  [a] 
<<P7 confirm #1 -> t>>
t
Adjust which host?
  1) Claude Code
  2) Cursor
>  
<<P8 host -> 1 Claude Code>>
1
Adjust which tier? (1–6)
  T1  opus
  T2  sonnet
  T3  opus
  T4  sonnet
  T5  haiku
  T6  sonnet
>  
<<P9 tier -> 3 (T3)>>
3
T3 — pick a model:
  1) opus (current)
  2) sonnet
  3) haiku
>  
<<P10 pick -> 2 (sonnet)>>
2
T3 = T2 rejected: `sonnet` is the Implementer's model (T2) — the Reviewer must run on a different model (author ≠ auditor)
T3 — pick a model:
  1) opus (current)
  2) sonnet
  3) haiku
>  
<<P11 pick -> 1 (opus)>>
1
Derived tier table:
Claude Code (author ≠ auditor: ok)
  T1  opus  (fallback sonnet)
  T2  sonnet  (fallback haiku)
  T3  opus  (fallback sonnet)
  T4  sonnet  (fallback opus)  — (long context)
  T5  haiku  (fallback sonnet)
  T6  sonnet  (fallback opus)  — (vision)
Cursor (author ≠ auditor: ok)
  T1  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T2  claude-sonnet-4-6  (fallback <CONFIRM SLUG>)
  T3  claude-opus-4-6  (fallback <CONFIRM SLUG>)
  T4  <CONFIRM SLUG>  (fallback —)  — Claude Sonnet family (1M context)
  T5  <CONFIRM SLUG>  (fallback —)  — Composer (Fast) family
  T6  <CONFIRM SLUG>  (fallback —)  — Gemini 3.8 Flash family (vision)
[A]ccept / [t] adjust a tier / [q] quit
>  [a] 
<<P12 confirm #2 -> A>>
A
replaced  AGENTS.md
unchanged  .claude/agents/akili-leader.md
unchanged  .claude/agents/akili-implementer.md
unchanged  .claude/agents/akili-reviewer.md
unchanged  .claude/agents/akili-tester.md
unchanged  .cursor/agents/akili-leader.md
unchanged  .cursor/agents/akili-implementer.md
unchanged  .cursor/agents/akili-reviewer.md
unchanged  .cursor/agents/akili-tester.md
replaced  .agents/model-routing.json
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
Cursor: effort bracket omitted — rung unconfirmed
Cursor Tester: same model as the Implementer (`claude-sonnet-4-6`, T2 primary) — Step 8E default; Rule 1 allows it
hint: commit .agents/model-routing.json and the wrappers — akili doctor --agents --fix refuses a dirty .agents/

<<PROMPTS ANSWERED: 12>>
<<CHILD EXIT: 0>>
```

exit=0 (child exit 0)

Numbered prompts: P1 hosts (`[x]` 1,5, Enter) · P2 Claude roster (`[x]` 1,2,3, Enter) · P3 Cursor roster (`[x]` both user ids, not re-typed, Enter) · P4/P5 CLI (`[claude]`/`[agent]`, Enter) · P6 wrappers (`[Y]`, Enter) · P7 confirm → t · P8 host → 1 · P9 tier → 3 · P10 pick → 2 sonnet · P11 pick (re-asked) → 1 opus · P12 confirm → A = 12.

Rejection line (verbatim):
```text
T3 = T2 rejected: `sonnet` is the Implementer's model (T2) — the Reviewer must run on a different model (author ≠ auditor)
```

Resulting T3 row (`AGENTS.md`):
```text
53:| **T3 Auditor** *(≠ T2)* | `opus` | `opencode-go/deepseek-v4-pro` (5,200 @ $15) *(≠ T2)* | `gemini-3.1-pro-high` *(≠ T2 family)* | `gpt-5.6-terra` *(≠ Luna)*; Sol where the plan allows | `claude-opus-4-6` | `sonnet` (Claude Code) · `claude-sonnet-4-6` (Antigravity) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
```

`git diff --stat` vs case 1 state:
```text
 .agents/model-routing.json | 9 ++++++---
 AGENTS.md                  | 4 ++--
 2 files changed, 8 insertions(+), 5 deletions(-)
```

`git diff`:
```diff
diff --git a/.agents/model-routing.json b/.agents/model-routing.json
index 1360cc0..a922799 100644
--- a/.agents/model-routing.json
+++ b/.agents/model-routing.json
@@ -25,7 +25,7 @@
     "claude": {
       "T1": {
         "fallback": "sonnet",
-        "note": "*(alias — always latest)*",
+        "note": "",
         "primary": "opus"
       },
       "T2": {
@@ -35,7 +35,7 @@
       },
       "T3": {
         "fallback": "sonnet",
-        "note": "*(must differ from T2)*",
+        "note": "",
         "primary": "opus"
       },
       "T4": {
@@ -91,7 +91,10 @@
     "claude": [
       {
         "id": "opus",
-        "source": "packaged"
+        "source": "user",
+        "tiers": [
+          "T3"
+        ]
       },
       {
         "id": "sonnet",
diff --git a/AGENTS.md b/AGENTS.md
index 21f37fa..406955a 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -48,9 +48,9 @@ Updated: 2026-10
 
 | Tier | Claude Code | OpenCode | Antigravity | Codex | Cursor | Fallback |
 |---|---|---|---|---|---|---|
-| **T1 Architect** | `opus` *(alias — always latest)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` Sol where the plan allows | `claude-opus-4-6` | `sonnet` (Claude Code) · `opencode-go/glm-5.3` (OpenCode) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
+| **T1 Architect** | `opus` | `opencode-go/deepseek-v4-pro` (5,200 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` Sol where the plan allows | `claude-opus-4-6` | `sonnet` (Claude Code) · `opencode-go/glm-5.3` (OpenCode) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
 | **T2 Coder** | `sonnet` | `opencode-go/deepseek-v4.1-flash` (32,500 @ $15; 4x promo → 130,000 @ $60 through 2026-09-20) | `gemini-3.8-flash-medium` | `gpt-5.6-luna` | `claude-sonnet-4-6` | `haiku` (Claude Code) · `opencode-go/deepseek-v4-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
-| **T3 Auditor** *(≠ T2)* | `opus` *(must differ from T2)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) *(≠ T2)* | `gemini-3.1-pro-high` *(≠ T2 family)* | `gpt-5.6-terra` *(≠ Luna)*; Sol where the plan allows | `claude-opus-4-6` | `sonnet` (Claude Code) · `claude-sonnet-4-6` (Antigravity) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
+| **T3 Auditor** *(≠ T2)* | `opus` | `opencode-go/deepseek-v4-pro` (5,200 @ $15) *(≠ T2)* | `gemini-3.1-pro-high` *(≠ T2 family)* | `gpt-5.6-terra` *(≠ Luna)*; Sol where the plan allows | `claude-opus-4-6` | `sonnet` (Claude Code) · `claude-sonnet-4-6` (Antigravity) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
 | **T4 Context-Ingest** | `sonnet` (long context) | `opencode-go/deepseek-v4.1-flash` `<CONFIRM>` context window (32,500 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` | `<CONFIRM SLUG>` Claude Sonnet family (1M context) | `opus` (Claude Code) · `opencode-go/mimo-v2.5` (OpenCode) · `<CONFIRM SLUG>` (Codex) |
 | **T5 Fast-Cheap** | `haiku` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `<CONFIRM SLUG>` Composer (Fast) family | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) |
 | **T6 Multimodal** | `sonnet` (vision) | `opencode-go/deepseek-v4-flash-vision-exp` (32,500 @ $15; **Exp**) | `gemini-3.8-flash-high` vision | `gpt-5.6-terra` prefer cross-host dispatch | `<CONFIRM SLUG>` Gemini 3.8 Flash family (vision) | `opus` (Claude Code) · `<CONFIRM ID>` (Antigravity) · `<CONFIRM SLUG>` (Codex) |
```

**Observed (case 2):** pre-fill held on every prompt (hosts, both rosters, CLIs, wrappers); the T3 = T2 rejection is one line naming `sonnet` as the Implementer's model (T2) and the pick was re-asked; opus accepted; wrappers `unchanged`, AGENTS.md + answers file `replaced`. — matches. **Flag for the Leader (observed, not explained away):** re-picking opus — already T3's current primary — is not a no-op: the roster entry flips `opus` from `source: packaged` to `source: user, tiers: [T3]`, and step 6's `!userIds.includes(primary)` then drops the fixed notes on **both** T3 (`*(must differ from T2)*`) and T1 (`*(alias — always latest)*`), although T1 was never adjusted. The Claude Code T3 cell went from ``opus`` *(must differ from T2)* to ``opus``.

### Case 11 — Cursor CLI: `.cursor/agents/akili-reviewer.md` listed and `readonly` holds

```text
$ agent --version
2026.10.01-14929f9
$ agent --help | head -40
Usage: agent [options] [command] [prompt...]

Start the Cursor Agent

Arguments:
  prompt                       Initial prompt for the agent

Options:
  -v, --version                Output the version number
  --api-key <key>              API key for authentication (can also use
                               CURSOR_API_KEY env var)
  -H, --header <header>        Add custom header to agent requests (format:
                               'Name: Value', can be used multiple times)
  -e, --endpoint <url>         Target API endpoint URL (can also use
                               CURSOR_API_ENDPOINT env var) (default:
                               "https://api2.cursor.sh", env:
                               CURSOR_API_ENDPOINT)
  -p, --print                  Print responses to console (for scripts or
                               non-interactive use). Has access to all tools,
                               including write and shell. (default: false)
  --output-format <format>     Output format (only works with --print): text |
                               json | stream-json (default: "text")
  --stream-partial-output      Stream partial output as individual text deltas
                               (only works with --print and stream-json format)
                               (default: false)
  --mode <mode>                Start in the given execution mode. plan:
                               read-only/planning (analyze, propose plans, no
                               edits). ask: Q&A style for explanations and
                               questions (read-only). (choices: "plan", "ask")
  --plan                       Start in plan mode (shorthand for --mode=plan).
                               (default: false)
  --resume [chatId]            Select a session to resume (default: false)
  --continue                   Continue previous session (default: false)
  --model <model>              Model to use (e.g., gpt-5, sonnet-4-thinking).
                               Parameterized models accept quoted bracket
                               overrides, e.g.
                               'claude-opus-4-8[context=1m,effort=high,fast=false]'
  --list-models                List available models and exit (default: false)
  -f, --force                  Force allow commands unless explicitly denied
                               (default: false)
$ agent status | head -5
✓ Logged in as alliance-it-ibd-suscriptions@cgiar.org
Team: IBD (id 17931305)
```

Run 0 (harness): `timeout 90 agent …` → `(eval):1: command not found: timeout` (macOS has no coreutils timeout; agent never started). Replaced by `perl -e 'alarm 90; exec @ARGV' --`.

Run 1, inside the scratch project:
```text
$ perl -e 'alarm 90; exec @ARGV' -- agent -p --mode ask --output-format text "List the subagents available in this project (from .cursor/agents) and whether each is read-only. Do not edit anything."

⚠ Workspace Trust Required

  Cursor Agent can execute code and access files in this directory.
  Do you trust the contents of this directory?

    /private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/t8proj.Z8mFX7

  To proceed, you can either:
    • Run 'agent' interactively to decide
    • Pass --trust, --yolo, or -f if you trust this directory
exit=1
```

Run 2 (adds `--trust`; `--mode ask` keeps it read-only):
```text
$ perl -e 'alarm 90; exec @ARGV' -- agent -p --trust --mode ask --output-format text "List the subagents available in this project (from .cursor/agents) and whether each is read-only. Do not edit anything."
Here are the subagents defined under `.cursor/agents` in this project:

| Subagent | File | `readonly` in frontmatter | Read-only? |
|----------|------|---------------------------|------------|
| **akili-leader** | `akili-leader.md` | *(not set)* | **No** |
| **akili-implementer** | `akili-implementer.md` | *(not set)* | **No** |
| **akili-reviewer** | `akili-reviewer.md` | `readonly: true` | **Yes** |
| **akili-tester** | `akili-tester.md` | *(not set)* | **No** |

There are **four** project subagents, all AKILI roles. Only **akili-reviewer** sets `readonly: true` in YAML frontmatter, which is what Cursor uses to block mutating edits for that subagent.

The others do not declare `readonly`, so they are **not** read-only at the agent-config level. **akili-leader** is still described as orchestrating without writing code (`writes no code` in its description), but that is behavioral guidance in the persona text, not the `readonly` flag. **akili-implementer** and **akili-tester** are intended to change the repo (implementation and tests).
exit=0
```

Side check — `agent --list-models` (exit 0, 248 lines): no `claude-opus-4-6` / `claude-sonnet-4-6` slug on this account; nearest Opus slugs are `claude-opus-4-8-*`, `claude-opus-5-5-*`; Sonnet 4.6 appears as `claude-4.6-sonnet-medium`.
```text
49:claude-opus-5-5-high - Claude Opus 5.5 1M High
73:claude-opus-4-8-high - Claude Opus 4.8 1M
165:claude-4.6-sonnet-medium - Claude Sonnet 4.6 1M
166:claude-4.6-sonnet-medium-thinking - Claude Sonnet 4.6 1M Thinking
```

**Observed (case 11):** Cursor Agent 2026.10.01, logged in; inside the scratch project it reports four project subagents from `.cursor/agents`, `akili-reviewer` with `readonly: true` (the only read-only one). — matches, with a limit: this shows the agent sees the wrapper and its frontmatter; Cursor's runtime refusal of edits by `akili-reviewer` (spawning it and attempting a write) was not exercised. The example id `claude-opus-4-6` is not a live slug on this account, so the wrapper's `model:` would not resolve here (the wizard does not probe ids by design — "confirmed with the user, never probed").

### Summary

| Case | Expected | Observed | Match |
|---|---|---|---|
| 1 | 8 prompts (7 + Cursor placement), ends at A; fenced section, 2 wrapper sets, answers file | 9 prompts to first confirm (separate family-id prompt); then step-8 `Cursor: author ≠ auditor NOT satisfied` (one-model Cursor roster unsatisfiable). After answering add a model → `claude-sonnet-4-6` @ T2: 14 prompts, exit 0, files correct | DOES NOT MATCH (count + unscripted step 8); files match |
| 2 | pre-filled re-run, t → T3 → sonnet rejected (one line, T3 = T2) → opus → A | pre-fill held; rejection line verbatim as above; 12 prompts; exit 0; AGENTS.md 4 lines changed | matches; flag: re-picking current opus flips it to `source: user` and drops T1 + T3 fixed notes |
| 11 | `agent` lists `.cursor/agents/akili-reviewer.md`, `readonly` holds | listed with `readonly: true` (run 2, `--trust --mode ask`); runtime write refusal not exercised; `claude-opus-4-6` not in `--list-models` | matches (listing); readonly enforcement not exercised |


---

# T8 case 10 — /akili-constitution Step 8C delegation walk (proxy walk)

**Mode:** proxy walk — a Claude Code subagent executing the Step 8C text (akili-constitution.md L465–690, Step 8E L736+/L922+, Step 9 L1393+), user answers pre-supplied. Repo HEAD `fdaf8eb`, branch master. Date 2026-10-02.
**Setup:** new shim `/private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/c10/shim/akili` → `exec node /Users/jcadavid/Development/sdd-jc-methodology/bin/akili.js "$@"`; old shim `/private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/c10/oldshim/akili` → `exec node /private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/akili-old/bin/akili.js "$@"` (worktree at `8eb0227`, package.json 2.31.0). Scratch projects `/private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/c10/projA`, `/private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/c10/projB` (git init, 4 personas in `.agents/`, 5-line AGENTS.md, one commit). All runs with `</dev/null` (no TTY).

**Flag composition from the answers (Step 8C item 1 table):** Q1 → `--hosts claude,cursor`; Q2 → `--models claude=opus,sonnet,haiku` + `--models cursor=claude-opus-4-6@T1+T3,composer-2@T2+T5,claude-sonnet-4-6@T4+T6` (no dated id → no `--pin-reason`); Q3 → `--cli claude=claude --cli cursor=agent`; Q4/Q5 n/a → no flag; Q6 → `--wrappers yes`; Q7 → `--yes` after preview accepted; Q8 → no `--t3-cross-host` (none unsatisfiable — confirmed by `authorAuditor` below).

### Branch A — CLI present and knows `routing`

**A.1 Preview, literal first reading (no `--yes`, since Q7 says `--yes` "once accepted"):**
```
akili routing --project . --hosts claude,cursor --models claude=opus,sonnet,haiku --models cursor=claude-opus-4-6@T1+T3,composer-2@T2+T5,claude-sonnet-4-6@T4+T6 --cli claude=claude --cli cursor=agent --wrappers yes --dry-run
```
```
ERROR: stdin is not a TTY and answers are still missing: --yes — use the non-interactive form: akili routing --hosts <h1,h2> --models <host>=<id>[@T<n>[+T<m>]],… --cli <host>=<binary> --wrappers yes|no --yes
```
exit=1. Nothing written. **Text finding F1** (below).

**A.2 Preview as the text's "same command plus `--dry-run`" (the bash block includes `--yes`; `--json` removed):**
```
akili routing --project . --hosts claude,cursor --models claude=opus,sonnet,haiku --models cursor=claude-opus-4-6@T1+T3,composer-2@T2+T5,claude-sonnet-4-6@T4+T6 --cli claude=claude --cli cursor=agent --wrappers yes --yes --dry-run
```
```
[dry-run] would create 2 dirs
[dry-run] appended  AGENTS.md
[dry-run] created  .claude/agents/akili-leader.md
[dry-run] created  .claude/agents/akili-implementer.md
[dry-run] created  .claude/agents/akili-reviewer.md
[dry-run] created  .claude/agents/akili-tester.md
[dry-run] created  .cursor/agents/akili-leader.md
[dry-run] created  .cursor/agents/akili-implementer.md
[dry-run] created  .cursor/agents/akili-reviewer.md
[dry-run] created  .cursor/agents/akili-tester.md
[dry-run] created  .agents/model-routing.json
Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it
Cursor: effort bracket omitted — rung unconfirmed
Cursor Tester: same model as the Implementer (`composer-2`, T2 primary) — Step 8E default; Rule 1 allows it

| Tier | Claude Code | OpenCode | Antigravity | Codex | Cursor | Fallback |
|---|---|---|---|---|---|---|
| **T1 Architect** | `opus` *(alias — always latest)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` Sol where the plan allows | `claude-opus-4-6` | `sonnet` (Claude Code) · `opencode-go/glm-5.3` (OpenCode) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
| **T2 Coder** | `sonnet` | `opencode-go/deepseek-v4.1-flash` (32,500 @ $15; 4x promo → 130,000 @ $60 through 2026-09-20) | `gemini-3.8-flash-medium` | `gpt-5.6-luna` | `composer-2` | `haiku` (Claude Code) · `opencode-go/deepseek-v4-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
| **T3 Auditor** *(≠ T2)* | `opus` *(must differ from T2)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) *(≠ T2)* | `gemini-3.1-pro-high` *(≠ T2 family)* | `gpt-5.6-terra` *(≠ Luna)*; Sol where the plan allows | `claude-opus-4-6` | `sonnet` (Claude Code) · `claude-sonnet-4-6` (Antigravity) · `gpt-5.6-sol` (Codex) · `<CONFIRM SLUG>` (Cursor) |
| **T4 Context-Ingest** | `sonnet` (long context) | `opencode-go/deepseek-v4.1-flash` `<CONFIRM>` context window (32,500 @ $15) | `gemini-3.8-flash-high` | `gpt-5.6-terra` | `claude-sonnet-4-6` | `opus` (Claude Code) · `opencode-go/mimo-v2.5` (OpenCode) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
| **T5 Fast-Cheap** | `haiku` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | `gemini-3.8-flash-low` | `gpt-5.6-luna` | `composer-2` | `sonnet` (Claude Code) · `opencode-go/qwen3.8-flash` (OpenCode) · `<CONFIRM SLUG>` (Cursor) |
| **T6 Multimodal** | `sonnet` (vision) | `opencode-go/deepseek-v4-flash-vision-exp` (32,500 @ $15; **Exp**) | `gemini-3.8-flash-high` vision | `gpt-5.6-terra` prefer cross-host dispatch | `claude-sonnet-4-6` | `opus` (Claude Code) · `<CONFIRM ID>` (Antigravity) · `<CONFIRM SLUG>` (Codex) · `<CONFIRM SLUG>` (Cursor) |
```
exit=0; stderr empty; `git status --porcelain` empty (nothing written). User (pre-supplied Q7) accepts the table unchanged.

**A.3 Live:**
```
akili routing --project . --hosts claude,cursor --models claude=opus,sonnet,haiku --models cursor=claude-opus-4-6@T1+T3,composer-2@T2+T5,claude-sonnet-4-6@T4+T6 --cli claude=claude --cli cursor=agent --wrappers yes --yes --json
```
stdout (stderr 0 bytes):
```json
{
  "dryRun": false,
  "exitCode": 0,
  "hosts": [
    "claude",
    "cursor"
  ],
  "writes": [
    {
      "relPath": "AGENTS.md",
      "token": "appended"
    },
    {
      "relPath": ".claude/agents/akili-leader.md",
      "token": "created"
    },
    {
      "relPath": ".claude/agents/akili-implementer.md",
      "token": "created"
    },
    {
      "relPath": ".claude/agents/akili-reviewer.md",
      "token": "created"
    },
    {
      "relPath": ".claude/agents/akili-tester.md",
      "token": "created"
    },
    {
      "relPath": ".cursor/agents/akili-leader.md",
      "token": "created"
    },
    {
      "relPath": ".cursor/agents/akili-implementer.md",
      "token": "created"
    },
    {
      "relPath": ".cursor/agents/akili-reviewer.md",
      "token": "created"
    },
    {
      "relPath": ".cursor/agents/akili-tester.md",
      "token": "created"
    },
    {
      "relPath": ".agents/model-routing.json",
      "token": "created"
    }
  ],
  "restrictions": {
    "claude": "applied",
    "cursor": "applied"
  },
  "authorAuditor": {
    "claude": "ok",
    "cursor": "ok"
  },
  "placeholdersByColumn": {
    "claude": 0,
    "opencode": 1,
    "antigravity": 1,
    "codex": 2,
    "cursor": 6
  },
  "sectionBytes": 9348,
  "stale": [],
  "reports": [
    "Claude Code Tester: same model as the Implementer (`sonnet`, T2 primary) — Step 8E default; Rule 1 allows it",
    "Cursor: effort bracket omitted — rung unconfirmed",
    "Cursor Tester: same model as the Implementer (`composer-2`, T2 primary) — Step 8E default; Rule 1 allows it"
  ],
  "hints": [
    "commit .agents/model-routing.json and the wrappers — akili doctor --agents --fix refuses a dirty .agents/"
  ]
}
```
exit=0. Returned without input (stdin `/dev/null`) — **zero TTY prompts**.

**JSON top-level keys** (`node -e 'Object.keys(JSON.parse(...))'`): `dryRun, exitCode, hosts, writes, restrictions, authorAuditor, placeholdersByColumn, sectionBytes, stale, reports, hints` — exactly the 11 keys Step 8C's branch table lists. `writes[]` entries carry `relPath` + `token` only (no `note` key on any entry).

`git status --porcelain` after:
```
 M AGENTS.md
?? .agents/model-routing.json
?? .claude/
?? .cursor/
```
Fence in AGENTS.md: L7 `<!-- akili:section id=model-routing since=v2.31.0 -->`, L118 `<!-- /akili:section -->`. Wrappers spot-check: `.claude/agents/akili-reviewer.md` `model: opus` + `tools: Read, Grep, Glob`; `.cursor/agents/akili-reviewer.md` `model: claude-opus-4-6` + `readonly: true`; Cursor implementer `model: composer-2`; Claude implementer `model: sonnet`.

**Step 9 Model Routing lines produced from the JSON:**
- Written by `akili routing` (Fallback **not** used) into root `AGENTS.md` — `writes[0]` = `{"relPath":"AGENTS.md","token":"appended"}`; `exitCode` = `0`.
- Hosts configured: Claude Code, Cursor — `hosts` = `["claude","cursor"]`. All five host columns present (registry header `Tier | Claude Code | OpenCode | Antigravity | Codex | Cursor | Fallback`).
- Placeholders per column — `placeholdersByColumn` = `{"claude":0,"opencode":1,"antigravity":1,"codex":2,"cursor":6}` (see F3: the 6 Cursor ones are all in the Fallback column; the Cursor column itself is fully concrete).
- Files written: AGENTS.md `appended`; `.claude/agents/akili-{leader,implementer,reviewer,tester}.md` `created` ×4; `.cursor/agents/akili-{leader,implementer,reviewer,tester}.md` `created` ×4; `.agents/model-routing.json` `created`. None skipped.
- Reviewer restriction: `restrictions` = `{"claude":"applied","cursor":"applied"}` — Claude Code by `tools: Read, Grep, Glob`, Cursor by `readonly: true`.
- Author ≠ auditor: `authorAuditor` = `{"claude":"ok","cursor":"ok"}` (Claude Implementer `sonnet` ≠ Reviewer `opus`; Cursor Implementer `composer-2` ≠ Reviewer `claude-opus-4-6`; Leader/Reviewer share T1/T3 `claude-opus-4-6`).
- Stale ids: `stale` = `[]`.
- Section byte length: `sectionBytes` = `9348`.
- Reports relayed: `reports` (3 lines: both Testers share the Implementer model, Rule 1 allows; Cursor effort bracket omitted — rung unconfirmed). Hint: commit `.agents/model-routing.json` and the wrappers.
- Fallback used: no.

**Observed:** preview + live run, non-interactive, zero prompts, JSON with the 11 documented keys, Step 9 lines derivable entirely from JSON — **matches**, with the caveat that the preview needed `--yes` (F1).

### Branch B — CLI present but older (`8eb0227`)

Fresh project `projB`, `PATH=/private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/c10/oldshim:$PATH` (`which akili` → old shim).

**B.1 Live command as Step 8C composes it:**
```
akili routing --project . --hosts claude,cursor --models claude=opus,sonnet,haiku --models cursor=claude-opus-4-6@T1+T3,composer-2@T2+T5,claude-sonnet-4-6@T4+T6 --cli claude=claude --cli cursor=agent --wrappers yes --yes --json
```
stdout: empty. stderr (ANSI stripped):
```
ERROR: Unknown option '--project'. To specify a positional argument starting with a '-', place it at the end of the command after '--', as in '-- "--project"
```
exit=1. `git status --porcelain`: empty.

**This is NOT the `ERROR: Unknown command: routing` the Step 8C branch table names.** The old CLI's strict `parseArgs` (old `bin/akili.js` L308–310, `strict: true`) rejects the first routing-only flag before command dispatch. Read literally, Step 8C sends this to "Any other `ERROR:` line (a usage error, a flag the CLI rejects) is not a fallback trigger: fix the flags from the message and re-run" — a dead end (every routing flag is unknown to the old CLI). **Text finding F2.** Probes on the old CLI:
```
akili routing                 -> ERROR: Unknown command: routing   exit=1
akili routing --yes           -> ERROR: Unknown option '--yes'. ...   exit=1
akili routing --dry-run --force -> ERROR: Unknown command: routing  exit=1
akili routing --json          -> ERROR: Unknown option '--json'. ...  exit=1
```
Only flags the old CLI already knows (`--dry-run`, `--force`, none) reach the `Unknown command: routing` line. Proceeding as the work order directs (the brief's intent is the "predates routing" branch): Fallback.

**B.2 Fallback, by hand:**
- Section appended to root `AGENTS.md` inside `<!-- akili:section id=model-routing since=v2.31.0 -->` … `<!-- /akili:section -->`, each on its own line. Version `v2.31.0` = `version` in the package.json of the binary on PATH (`8eb0227` → `2.31.0`); that is the "installed AKILI version" the agent can see (F5). Contents: philosophy line, six tiers, phase→tier mapping (Leader/Implementer/Reviewer split + Reviewer ≠ Implementer note; /akili-test Leader/Tester split), 5-host registry + `Updated: 2026-10` (Claude/Cursor from answers, OpenCode/Antigravity/Codex packaged defaults), CLI invocation line, Cross-host dispatch line, the item-5 instruction verbatim, Effort dial (a)–(f). AGENTS.md 4,982 bytes after.
- Wrappers: `.claude/agents/akili-{leader,implementer,reviewer,tester}.md` (`opus/sonnet/opus/sonnet`, Reviewer `tools: Read, Grep, Glob`); `.cursor/agents/akili-{leader,implementer,reviewer,tester}.md` (`claude-opus-4-6/composer-2/claude-opus-4-6/composer-2`, Reviewer `readonly: true`, no effort bracket — rung unconfirmed). Bodies reference `.agents/<role>.md`.
- No answers file (`ls .agents` → `implementer.md leader.md reviewer.md tester.md`).

**Step 9 would report:** "`## Model Routing` written by hand — **the Fallback was used** because the installed `akili` (2.31.0) predates `routing` (`Unknown command: routing` / here `Unknown option '--project'`); a newer `akili-specs` package provides the command. Root `AGENTS.md`, all five host columns, Claude Code + Cursor filled, `<CONFIRM SLUG>` placeholders in the Fallback column for Cursor, `<CONFIRM>` CLI invocations for OpenCode/Antigravity/Codex. Wrappers hand-written for Claude Code (Reviewer read-only by `tools` allowlist) and Cursor (Reviewer read-only by `readonly: true`). A later `akili routing` run needs `--force` on the hand-written fence." No JSON exists, so no JSON-sourced values.

**B.3 a′ claim — new shim, same answers, no `--force`:**
```
akili routing --project . --hosts claude,cursor --models claude=opus,sonnet,haiku --models cursor=claude-opus-4-6@T1+T3,composer-2@T2+T5,claude-sonnet-4-6@T4+T6 --cli claude=claude --cli cursor=agent --wrappers yes --yes
```
```
refused (hand-edited fence; --force to regenerate)  AGENTS.md
skipped (exists; --force to replace)  .claude/agents/akili-leader.md
unchanged  .claude/agents/akili-implementer.md
unchanged  .claude/agents/akili-reviewer.md
skipped (exists; --force to replace)  .claude/agents/akili-tester.md
skipped (exists; --force to replace)  .cursor/agents/akili-leader.md
unchanged  .cursor/agents/akili-implementer.md
unchanged  .cursor/agents/akili-reviewer.md
skipped (exists; --force to replace)  .cursor/agents/akili-tester.md
created  .agents/model-routing.json
    --- AGENTS.md (current)
    +++ AGENTS.md (akili routing)
    @@ -1,70 +1,110 @@
    ... (full diff in /private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/c10/B-a1.out)
```
exit=1; stderr empty. `cmp` AGENTS.md vs pre-run copy → **unchanged byte-for-byte**. Token: `refused (hand-edited fence; --force to regenerate)`. Answers file written (`created`); implementer/reviewer wrappers `unchanged`; leader/tester wrappers `skipped (exists; --force to replace)` (F6).

**B.4 Same + `--force`:**
```
akili routing --project . --hosts claude,cursor --models claude=opus,sonnet,haiku --models cursor=claude-opus-4-6@T1+T3,composer-2@T2+T5,claude-sonnet-4-6@T4+T6 --cli claude=claude --cli cursor=agent --wrappers yes --yes --force
```
```
overwritten  AGENTS.md
overwritten  .claude/agents/akili-leader.md
unchanged  .claude/agents/akili-implementer.md
unchanged  .claude/agents/akili-reviewer.md
overwritten  .claude/agents/akili-tester.md
overwritten  .cursor/agents/akili-leader.md
unchanged  .cursor/agents/akili-implementer.md
unchanged  .cursor/agents/akili-reviewer.md
overwritten  .cursor/agents/akili-tester.md
unchanged  .agents/model-routing.json
    (diff printed again — full in /private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/c10/B-a2.out)
```
exit=0. Token: `overwritten`. Fenced section after `--force` is **byte-identical** to Branch A's (`diff` of the two fence ranges → empty).

**Observed:** older CLI does not emit `Unknown command: routing` for the composed command (it emits `Unknown option '--project'`) — **DOES NOT MATCH** the branch table's trigger text; Fallback executable by hand; a′ `refused (hand-edited fence; --force to regenerate)` exit 1 then `overwritten` exit 0 — **matches**.

### Summary

| Branch | Expected | Observed | Match |
|---|---|---|---|
| A preview | `--dry-run` prints table + planned writes, writes nothing | needs `--yes` without a TTY (exit 1 otherwise); with `--yes --dry-run`: table + 10 planned writes, exit 0, tree clean | matches (with F1) |
| A live | `--yes --json`, zero prompts, JSON for Step 9 | exit 0, stdin /dev/null, 11 documented keys, all 10 writes created/appended, restrictions applied, authorAuditor ok | matches |
| A Step 9 | lines from JSON | produced from `hosts`, `placeholdersByColumn`, `writes`, `restrictions`, `authorAuditor`, `stale`, `sectionBytes` | matches (F3 caveat) |
| B older CLI | `ERROR: Unknown command: routing`, exit 1 | `ERROR: Unknown option '--project'. …`, exit 1 | **DOES NOT MATCH** |
| B Fallback | hand-written fence + wrappers, no answers file | done; `since=v2.31.0` | matches |
| B a′ | `refused (hand-edited fence; --force to regenerate)` | that token, exit 1, AGENTS.md untouched | matches |
| B a′ --force | `overwritten` | `overwritten`, exit 0, section == Branch A | matches |

### Text findings

- **F1 — preview needs `--yes` (Step 8C item 1 Q7 vs item 2).** Q7 maps to "`--yes` once accepted", but item 2's preview is "the same command plus `--dry-run`" and, without a TTY, `--dry-run` alone fails: `ERROR: stdin is not a TTY and answers are still missing: --yes`. An agent following Q7 literally (no `--yes` before acceptance) hits that error; the text should say the preview is `… --yes --dry-run` (the `--yes` is harmless under `--dry-run`), or the CLI should not require `--yes` with `--dry-run`.
- **F2 — "predates routing" trigger text is wrong for the composed command (most important).** Released 2.31.0 (`8eb0227`) rejects `--project` (and every routing flag) via strict `parseArgs` before dispatch, so the agent sees `ERROR: Unknown option '--project'. …`, which the text explicitly classes as "not a fallback trigger: fix the flags … and re-run" — an unbounded fix-and-retry loop. Fix: name both stderr shapes (`Unknown command: routing` **or** `Unknown option '--<routing flag>'`) as the predates-routing branch, or tell the agent to probe with bare `akili routing --dry-run` first.
- **F3 — `placeholdersByColumn` is keyed by host, and counts Fallback-column cells.** Cursor = 6 though the Cursor column has zero placeholders: all six are `<CONFIRM SLUG> (Cursor)` entries in the Fallback column. Step 9's "`<CONFIRM SLUG>` placeholders left for the user to fill" read from this key would misreport the Cursor column as unfilled. Text (or key name/doc) should say what the count covers.
- **F4 — `writes[]` `note` field.** Step 8C lists `writes[]` (`relPath`, `token`, `note`); no entry carried `note` in this run. Text should say `note` is optional.
- **F5 — Fallback `since=<version>`: "installed AKILI version" is undefined.** Candidates: the PATH binary's package version, the installed commands' version, or (if the binary is absent) nothing. Used the PATH binary's `package.json` (2.31.0). Here HEAD is also 2.31.0 (minor unreleased), so the walk cannot tell the readings apart; the CLI-absent branch has no version source at all.
- **F6 — Fallback wrappers for Leader/Tester have no canonical description.** Step 8E gives exact frontmatter only for implementer and reviewer; the hand-written leader/tester descriptions differ from the CLI's, so a later `akili routing` reports them `skipped (exists; --force to replace)`. Step 8C's `refused` row says "wrappers and the answers file **were** written" — only partly true after a Fallback (implementer/reviewer `unchanged`, leader/tester skipped).
- **F7 — Fallback "Ask the same questions in the same order"** is redundant when the CLI was already attempted with all answers collected; should read "reuse the answers".
- **F8 — `--force` run re-prints the diff after `overwritten`.** Cosmetic; not covered by text.
- **F9 — Step 9 Cursor wording** "two distinct `model` values bound to Leader/Implementer vs Reviewer" does not fit: Leader shares the Reviewer's model (`claude-opus-4-6`), not the Implementer's (`composer-2`). Same wording on Codex.

**Cleanup:** worktree `/private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/2a07de0d-2260-4a79-93a5-5f2a3dfe36f6/scratchpad/akili-old` removed (`git worktree list` no longer shows it; two pre-existing `prunable` worktrees untouched). `git -C /Users/jcadavid/Development/sdd-jc-methodology status --porcelain` → empty; HEAD `fdaf8eb`.
