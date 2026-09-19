# Closure Gate: Premise Ledger

**Current verdict (after the T10 amendment pass): gates green, walkthrough green on every key premise.** The three cases that failed the first gate were re-walked by a fresh reader against the amended text and all three now reach their key premise (§8); the six movable gates were re-run and none moved (§2, *Amendment pass*); proposal success criterion 2 is now met (§7). Two non-gating ambiguities the amendment itself introduced are recorded as F14 and F15 rather than chased. The paragraph below is the **first gate's** verdict, kept as written because the pivot it triggered is what produced the amendment.

**First-gate verdict — gates green, walkthrough red. T7's gate result was FAIL, and the failure was a spec gap for the user, not a defect in the shipped edits.** All seven global gates (a)–(g) are green with their output recorded, and gate (b) went red under its own falsifier, so it measures something rather than matching nothing. NFR-7 passes on a read: no shipped sentence makes a command fail on a design that has no Premise Ledger section (§7). Five of the proposal's six success criteria are met; criterion 2, the judge rule reading `changes--bilateral-review-ux-polish`'s three premises at the source, is not (§7). The literal-reader walkthrough reaches the key premise in **11 of 14** cases on the key's primary bullet, **12 of 14** counting either bullet, and both negative controls pass with zero blast-radius rows. Three cases miss the primary bullet. `changes--bilateral-review-ux-polish` and `changes--kp-cgspace-browse`, both judged against the **judge rule**, return `INCONCLUSIVE` on every key premise, because the rule's three actions do not reach a row that is uncited and carries no `UNVERIFIED` marker, and a document citation has no stated fallback (§3, findings F1 and F2). Held-out `bugfix--toc-unmapped-orange-notes` returns `INCONCLUSIVE` on its primary bullet while reaching its supporting one. A fourth hit sits inside a passing case: held-out `bugfix--global-search-prod-deploy` returns `NOT DEMANDED` on its supporting key bullet, because no Blast Radius check compares the deployed revision with the one in hand (F9). Per tasks.md, any `INCONCLUSIVE` on a key premise and any held-out `NOT DEMANDED` other than the known-hard case **fails this task** — six key-premise `INCONCLUSIVE` and one held-out `NOT DEMANDED` across four cases, so it fails. The known-hard case, `changes--result-sidebar-collapse-mobile`, in fact read `DEMANDED`, with the authorship caveat recorded in §3. The block-mutation falsifier met its literal criterion on Case 2's primary key bullet, which flipped to `NOT DEMANDED`, and not on the case verdict, which rule 1 carries on the supporting bullet — that one moved from `DEMANDED` only as far as `INCONCLUSIVE` (§4). **Routing:** these failures go to the user as a spec gap under the Pivot Protocol, never patched by widening a task. The Pivot Record belongs in `execution.md` and is the Leader's to write; this document is the evidence it cites.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/premise-ledger` |
| Task | T7 — closure gate, complete |
| Date | 2026-09-19 |
| HEAD at gate run | `f24b698` (T1–T6 committed; working tree clean) |
| Base commit for every diff | `571edaf` |
| Scope | The whole closure gate: global gates (a)–(g) with gate (b)'s falsifier (§2) · the 16-case literal-reader walkthrough (§3) · the block-mutation falsifier (§4) · row counts (§5) · budget actuals (§6) · the NFR-7 read and the success-criteria map (§7). **No packaged file is edited** (NFR-1); the only file written is this one |
| Authorship | §2 by the gates runner. §3 and §5 from a fresh-context literal reader, §4 from a second fresh-context reader on a mutated copy, both assembled here by a third context that never read for either of them. No reader saw this document, the corpus lesson text, or the spec documents (DD-13) |
| Requirements covered | NFR-1 (gate a) · NFR-3 (gate b) · NFR-6 (gate c) · DD-12/DD-13 (gate d, §3, §4) · NFR-4 (gate e) · FR-2 last clause and design §7.2 (gate f) · FR-11 packaging (gate g) · **NFR-2** (§5 row counts and the two negative controls) · **NFR-7** (§7 read) · `requirements.md` §8 rows *a rule a literal reader cannot execute* (§3) and *ceremony* (§5) · proposal success criteria 1–6 (§7) |
| Evidence rule | Every gate below records the command as run and its output verbatim. A gate recorded green without its output is not a gate (KZ-changes--leader-brief-contract-2). **One stated exception:** gate (g) records exit codes and the decisive lines rather than the full 275-file pack listing; the figures it turns on — file count, package size, the seven edited paths, the zero `premise-ledger` hits — are all quoted |
| Format precedent | `docs/specs/archive/2026-09-19-changes--leader-brief-contract/t6-walkthrough.md` |

**Tooling note that changes how these commands must be typed.** `grep` in this shell is a `ugrep` wrapper, and the gates are written with the excludes *after* the file operands. Placing `--` before the pattern — a habit when the pattern starts with a backtick — terminates option parsing, so the three `--exclude-dir` arguments are read as **filenames** and the exclusions silently do not apply. The spec folder then appears in the hit list and the gate reads red for the wrong reason. Both forms were run and compared:

```
# B — with `--` before the pattern (WRONG)
/usr/bin/grep -rln -- "`data-env`" .claude docs README.md CHANGELOG.md AGENTS.md CLAUDE.md --exclude-dir=worktrees --exclude-dir=archive --exclude-dir=premise-ledger
grep: --exclude-dir=worktrees: No such file or directory
grep: --exclude-dir=archive: No such file or directory
grep: --exclude-dir=premise-ledger: No such file or directory
.claude/commands/akili-specify.md
docs/specs/changes/premise-ledger/requirements.md
docs/specs/changes/premise-ledger/tasks.md
docs/specs/changes/premise-ledger/execution.md
docs/specs/changes/premise-ledger/design.md
docs/commands/akili-specify.md

# A — no `--` (CORRECT)
/usr/bin/grep -rln "`data-env`" .claude docs README.md CHANGELOG.md AGENTS.md CLAUDE.md --exclude-dir=worktrees --exclude-dir=archive --exclude-dir=premise-ledger
.claude/commands/akili-specify.md
docs/commands/akili-specify.md
```

Every grep recorded below uses form A and the explicit `/usr/bin/grep` binary.

## 2. Global gates (a)–(g)

| Gate | Asserts | Result | Decisive figure |
|---|---|---|---|
| (a) | Frozen paths untouched (NFR-1) | **green** | 0 bytes of diffstat; Falsifiability block `diff` empty over 8 lines |
| (b) | Class tokens defined once (NFR-3) | **green** | 2 files per token, all three tokens |
| (c) | `UNVERIFIED` marker bytes identical (NFR-6) | **green** | 1 distinct string; 0 dash near-misses |
| (d) | No held-out slug shipped (DD-13) | **green** | 0 hits |
| (e) | Rules by mechanism (NFR-4) | **green** | 0 product hits; 23 corpus slugs, 23 inside parentheticals |
| (f) | Class × reader enumeration (FR-2, §7.2) | **green** | 24 cells filled, 0 empty |
| (g) | Packaging (FR-11) | **green** | 3 commands, exit 0; 275 files, 0 new packaged file |

---

### Gate (a) — Frozen paths

**Part 1 — diffstat over the frozen paths.**

```
git diff --stat 571edaf -- .claude/commands/akili-execute.md .claude/commands/akili-test.md .claude/templates .claude/skills/tdd bin scripts package.json
```

Output, verbatim — the command printed nothing:

```
```

Measured rather than eyeballed, since empty output and unrun are indistinguishable on screen:

```
$ git diff --stat 571edaf -- <the same seven paths> | wc -c
       0
```

**Part 2 — Falsifiability-block identity (T1 check 5, re-run).** The block's opening line sits at `571edaf:.claude/commands/akili-specify.md:347` and at working-tree line 406; the range runs 8 lines, through rule 6.

```
git show 571edaf:.claude/commands/akili-specify.md | sed -n '347,354p' > fals.base.txt
sed -n '406,413p' .claude/commands/akili-specify.md         > fals.head.txt
diff fals.base.txt fals.head.txt
```

Output, verbatim — no differences; `DIFF_EXIT=0`, and `wc -l` reports 8 lines in each file:

```
       8 .../fals.base.txt
       8 .../fals.head.txt
```

**Verdict: GREEN.** Every frozen path is byte-unchanged from the base commit, and the Falsifiability block survived T1 and T2 intact. NFR-1 holds.

---

### Gate (b) — Defined once

The three blast-radius class tokens must be backticked in exactly two files: the command and its mirror.

```
for t in 'live-path' 'shared-state' 'data-env'; do
  /usr/bin/grep -rln "\`$t\`" .claude docs README.md CHANGELOG.md AGENTS.md CLAUDE.md \
    --exclude-dir=worktrees --exclude-dir=archive --exclude-dir=premise-ledger
done
```

Complete hit list, verbatim:

```
`live-path`      .claude/commands/akili-specify.md   docs/commands/akili-specify.md
`shared-state`   .claude/commands/akili-specify.md   docs/commands/akili-specify.md
`data-env`       .claude/commands/akili-specify.md   docs/commands/akili-specify.md
```

Two files per token, three tokens, six hits, no seventh file. The citing surfaces — `judgment-day`, `/akili-propose`, `/akili-constitution`, `docs/flow.md`, `CHANGELOG.md` — name the block and restate no class.

**Verdict: GREEN.** NFR-3 holds. The falsifier for this gate was executed; see **Gate (b) falsifier** below.

---

### Gate (c) — Marker bytes

**Part 1 — every distinct marker string.**

```
/usr/bin/grep -rho "UNVERIFIED — [^\`|]*" .claude docs/commands \
  --exclude-dir=worktrees --exclude-dir=archive --exclude-dir=premise-ledger | sort -u
```

Output, verbatim — one line, meaning one distinct string across the whole scope:

```
UNVERIFIED — confirm at source before relying on it
```

That is byte-identical to `/akili-execute` Step 2.2 clause (c). The canonical bytes, dumped from `akili-execute.md` itself, confirm the em dash (`—`) rather than a hyphen or en dash:

```
$ /usr/bin/grep -o "UNVERIFIED — confirm at source before relying on it" .claude/commands/akili-execute.md | od -c
0000000    U   N   V   E   R   I   F   I   E   D       —  **  **       c
0000020    o   n   f   i   r   m       a   t       s   o   u   r   c   e
0000040        b   e   f   o   r   e       r   e   l   y   i   n   g
0000060    o   n       i   t  \n
```

Occurrence counts by file:

```
.claude/commands/akili-specify.md:2
.claude/commands/akili-propose.md:2
.claude/commands/akili-execute.md:1
```

**Part 2 — near-misses.**

```
/usr/bin/grep -rn "UNVERIFIED [-–]" .claude docs/commands \
  --exclude-dir=worktrees --exclude-dir=archive --exclude-dir=premise-ledger
```

Output, verbatim — nothing printed; exit status 1, which for `grep` means zero matching lines:

```
```

**Part 3 — the other `UNVERIFIED` occurrences.** Twenty-three lines under `.claude`, `docs/commands`, and `docs/skills` contain the word. Every one that is not the five-hit marker above was read: each carries the bare backticked token `` `UNVERIFIED` `` naming the state, with no dash and no trailing marker text. The mirrors (`docs/commands/akili-specify.md:62`, `:76`; `docs/commands/akili-propose.md:75`, `:81`) and the judge rule (`.claude/skills/judgment-day/SKILL.md:26`) are in this group — they name the state and cite the block for the marker rather than reproducing it, which is what NFR-3 requires of them.

**Verdict: GREEN.** One marker string, correct bytes, zero drift. NFR-6 holds.

---

### Gate (d) — Held-out slugs

```
/usr/bin/grep -rn -E "target-tooltip|toc-unmapped-orange-notes|emerging-creation-hide-indicator-ui|result-sidebar-collapse-mobile|kp-project-match|kp-cgspace-browse|global-search-prod-deploy" \
  .claude docs README.md CHANGELOG.md \
  --exclude-dir=worktrees --exclude-dir=archive --exclude-dir=premise-ledger
```

Output, verbatim — nothing printed; exit status 1:

```
```

Piped to `wc -l`, to make the zero a measurement rather than an absence of scrollback:

```
       0
```

**Verdict: GREEN.** Zero hits, matching the design's expected total. No held-out case can be reached from the shipped text, so the §3 walkthrough is not an inert fixture (DD-12, DD-13).

---

### Gate (e) — Rules by class

**Part 1 — product, framework, and organisation names.**

```
/usr/bin/grep -nE "onecgiar|PRMS|CGSpace|Cypress|Angular|Jest|Cognito|driver\.js" \
  .claude/commands/akili-specify.md .claude/commands/akili-propose.md \
  .claude/commands/akili-constitution.md .claude/skills/judgment-day/SKILL.md
```

Output, verbatim — nothing printed; exit status 1:

```
```

Zero hits is stronger than the gate demands: the gate allows these names inside parentheticals, and the shipped text uses none of them anywhere. The pattern was proved live against the same four files before the zero was accepted — `/usr/bin/grep -cE "Premise Ledger"` on the identical file list returns `11`, `2`, `1`, `3`, so the regex engine and the paths are both working.

**Part 2 — corpus slugs, each checked for parenthetical containment.** Every occurrence of `changes--`, `bugfix--`, `results--`, `result-framework-reporting--`, or `bilateral--` was located, and the parenthesis depth immediately before the match computed on its line. Depth greater than zero means the slug sits inside `( … )`.

| File · line | Slug | Inside parenthetical |
|---|---|---|
| `akili-specify.md:266` | `changes--kp-report-modal-auto-create` | yes |
| `akili-specify.md:299` | `bugfix--evidence-storage-link-validation` | yes |
| `akili-specify.md:300` | `changes--realtime-section-completion` | yes |
| `akili-specify.md:301` | `changes--sidebar-toggle-consolidation` | yes |
| `akili-specify.md:306` | `changes--clear-filters` | yes |
| `akili-specify.md:306` | `changes--clear-filters-1` | yes |
| `akili-specify.md:308` | `changes--result-indicator-back-link` | yes |
| `akili-specify.md:308` | `bugfix--emerging-result-contributor-catalog` | yes |
| `akili-specify.md:308` | `changes--my-work-board` | yes |
| `akili-specify.md:309` | `changes--leader-brief-contract-2` | yes |
| `akili-specify.md:310` | `changes--cognito-email-otp-login` | yes |
| `akili-specify.md:408` | `changes--toc-center-guard` | yes |
| `akili-specify.md:408` | `bugfix--other-fields-toc-visibility` | yes |
| `akili-specify.md:409` | `bugfix--confirm-submission-title-and-disclaimer` | yes |
| `akili-specify.md:409` | `bugfix--phase-filter-missing-phases-prod` | yes |
| `akili-specify.md:410` | `changes--sp-shell-app-viewport` | yes |
| `akili-specify.md:410` | `bugfix--reporting-table-actions-clipped` | yes |
| `akili-specify.md:411` | `bugfix--lead-center-full-catalog` | yes |
| `akili-specify.md:412` | `result-framework-reporting--programme-results-created-by-filter` | yes |
| `akili-specify.md:412` | `changes--sidebar-toggle-consolidation` | yes |
| `akili-specify.md:413` | `bilateral--ai-processing-feedback` | yes |
| `akili-specify.md:413` | `changes--aow-identity-column-starvation` | yes |
| `akili-propose.md:102` | `bugfix--innovation-dev-p25-save-500` | yes |

Twenty-three hits, twenty-three inside parentheticals, zero outside. Lines 408–413 are the pre-existing Falsifiability block, whose byte identity gate (a) confirmed; lines 266–310 are this spec's additions; `akili-propose.md:102` is T4's Bug Track sentence. `akili-constitution.md` and `judgment-day/SKILL.md` carry no corpus slug at all.

**Verdict: GREEN.** Every shipped rule states a mechanism; every named case sits in a parenthetical. NFR-4 holds.

---

### Gate (f) — Class × reader enumeration

This gate is a **read**, not a grep, and the enumeration is what `requirements.md` §8 names as the substitute for the check that does not exist: *"A class with no stated behavior at one of its three readers → Manual enumeration: seven classes × (Step 2.5 counts, judge table, task hand-off)."* Three surfaces were read whole:

| Surface | Location |
|---|---|
| Step 2.2 *Premise Ledger* block | `.claude/commands/akili-specify.md:263–317` |
| Step 2.5 summary paragraph | `.claude/commands/akili-specify.md:348` |
| Judge Hard Rule + severity table | `.claude/skills/judgment-day/SKILL.md:26–37` |

**The eight-row enumeration.** Seven classes plus the `UNVERIFIED` state, against the three readers.

| Class / state | Step 2.5 counts | Judge rule | Task hand-off |
|---|---|---|---|
| `location` | Counted. "Print the **Premise Ledger**'s count line as written" (`:348`); the count line is defined as "verified, `UNVERIFIED`, and the `UNVERIFIED` split by Impact" (`:280`), so a verified `location` row lands in the verified figure | Attacked. "re-run or re-read every citation" (`SKILL.md:26`); "The source contradicts a premise — **severe**"; "A citation does not reproduce at its verified-at commit — **severe**"; "A depended-on premise with no row — finding, severity by Impact" | None, stated: "**All other classes have no hand-off** — they act through their *If false* cell" (`:315`) |
| `existence` | Counted, same sentence | Attacked, same three severity rows | None, stated — same sentence (`:315`) |
| `data-env` | Counted, same sentence | Attacked, same three severity rows | None, stated — same sentence (`:315`) |
| `other` | Counted, same sentence. The block names `other` a row-bearing class: "a premise the six named classes do not fit is still a row, classed `other`" (`:294`) | Attacked, same three severity rows | None, stated — same sentence (`:315`) |
| `live-path` | Counted, same sentence. Its trigger state reaches a reader one surface over: "Every blast-radius trigger the design fires has its row, and a design that fires none carries the `Blast-radius triggers: none apply — <reason>` line" (Verification Checklist, `:465`) | Attacked, **plus** its own severity row: "A triggered class with no row — **severe**" (`SKILL.md:33`) | None, stated — same sentence (`:315`) |
| `shared-state` | Counted, same sentence; same checklist item at `:465` | Attacked, **plus** "A triggered class with no row — **severe**" (`SKILL.md:33`) | None, stated — same sentence (`:315`) |
| `consumer` | Counted, same sentence; same checklist item at `:465` | Attacked, **plus** "A triggered class with no row — **severe**" (`SKILL.md:33`) | **Copied.** "A `consumer` row is copied into the owning task's existing `Consumers` field, beside the test files Step 3.2's **Consumer Sweep** rule finds" (`:312`), with the one-owner split stated in the same bullet |
| `UNVERIFIED` (any class) | Printed in full. "every `UNVERIFIED` row in full — claim, Impact, and the *Settled by* owner" (`:348`); an open `High` row makes **Review Design** the recommendation without gating the menu | Refuted or reported. "try to refute every `UNVERIFIED` row with their own search" (`SKILL.md:26`); a judge that cannot run a cited command "reports that row `not re-run` — never as confirmed" (`SKILL.md:37`) | **Settled first.** "An `UNVERIFIED` row is settled by its owning task **as that task's first step**, before anything is built on it, and the task's Done criteria record the outcome" (`:313`) |

**Empty cells: 0 of 24.** Every class and the `UNVERIFIED` state has a stated behavior at each of the three readers, and the table reproduces design §7.2's own class × reader table without contradicting a cell of it.

**One observation, reported not papered over.** At the Step 2.5 reader the seven classes are **indistinguishable from one another** — the count line is indexed by status and Impact, never by class, so `live-path` and `location` rows are counted identically. This is not a gap: design §7.2 records exactly this ("counted by status and Impact" for the first four classes, "same" for the rest), and FR-5 asks Step 2.5 for counts "verified and `UNVERIFIED`, with `UNVERIFIED` split by Impact" and nothing per class. The consequence worth stating plainly is that the **trigger line is not printed at Step 2.5**. A design that fires a trigger and omits the row is caught at the Verification Checklist (`:465`) and by the judge's severe row, not by the summary the user reads. That matches the approved design and is recorded here so the user can overrule it at the HITL pause rather than discover it later.

**Verdict: GREEN.** FR-2's last clause and design §7.2 hold.

---

### Gate (g) — Packaging

```
npm run verify:cli && npm run pack:dry-run && git diff --check
```

Exit codes and decisive output lines:

| Command | Exit | Decisive line |
|---|---|---|
| `npm run verify:cli` | `0` | `Summary: 11 commands \| 24 skills \| 7 resources (akili-specs v2.25.0)` |
| `npm run pack:dry-run` | `0` | `npm notice total files: 275` · `package size: 2.1 MB` · `unpacked size: 3.8 MB` |
| `git diff --check` | `0` | no output (no whitespace error, no conflict marker) |

**The four edited packaged files are in the tarball**, alongside their mirrors:

```
npm notice 53.7kB .claude/commands/akili-specify.md
npm notice 22.4kB .claude/commands/akili-propose.md
npm notice 89.0kB .claude/commands/akili-constitution.md
npm notice  6.1kB .claude/skills/judgment-day/SKILL.md
npm notice  6.4kB docs/commands/akili-specify.md
npm notice  6.0kB docs/commands/akili-propose.md
npm notice 17.3kB docs/commands/akili-constitution.md
```

**No new packaged file entered the tarball.** The only files added since the base are the four spec-local documents, and `package.json` excludes their directory:

```
$ git diff --name-status --diff-filter=ADR 571edaf -- .
A	docs/specs/changes/premise-ledger/design.md
A	docs/specs/changes/premise-ledger/execution.md
A	docs/specs/changes/premise-ledger/requirements.md
A	docs/specs/changes/premise-ledger/tasks.md

$ /usr/bin/grep -c "premise-ledger" <pack:dry-run output>
0

package.json "files": [..., "docs", "!docs/specs", ...]
```

No packaged file was added, deleted, or renamed — every change under a packaged path is a modification of a file that already existed at `571edaf`:

```
 .claude/commands/akili-constitution.md   |  2 +-
 .claude/commands/akili-propose.md        | 21 +-
 .claude/commands/akili-specify.md        | 67 +++-
 .claude/skills/judgment-day/SKILL.md     | 17 +-
 CHANGELOG.md                             | 12 +-
 docs/commands/akili-constitution.md      |  2 +-
 docs/commands/akili-propose.md           | 13 +-
 docs/commands/akili-specify.md           |  3 +-
 docs/flow.md                             |  2 +-
 docs/skills/judgment-day.md              |  1 +
```

**Verdict: GREEN.** Three commands, three zero exits, no packaging regression. FR-11's packaging half holds.

---

### Gate (b) falsifier — executed

A gate that cannot go red proves nothing, so gate (b) was run against a deliberately broken copy. `.claude/skills/judgment-day/SKILL.md` was copied to the session scratchpad and the class list pasted into the judge rule on the copy; **the real file was never touched.**

The mutation, applied to the copy's line 26:

```
- Row shape, classes, and triggers are defined in `/akili-specify` Step 2.2 …
+ Row shape, classes (`location`, `existence`, `data-env`, `other`, `live-path`,
+ `shared-state`, `consumer`), and triggers are defined in `/akili-specify` Step 2.2 …
```

Gate (b)'s grep re-run with the scratch path added to the scope:

```
`live-path`      .claude/commands/akili-specify.md  docs/commands/akili-specify.md  <scratch>/SKILL.mut.md
`shared-state`   .claude/commands/akili-specify.md  docs/commands/akili-specify.md  <scratch>/SKILL.mut.md
`data-env`       .claude/commands/akili-specify.md  docs/commands/akili-specify.md  <scratch>/SKILL.mut.md
```

**The gate went red: a third file is listed for all three tokens.** Gate (b) detects a restated class list, so its green reading above is a measurement and not an artifact of a pattern that could never match.

The copy was then deleted and the state re-checked:

```
$ ls <scratch>/SKILL.mut.md
ls: …/SKILL.mut.md: No such file or directory

$ git status --porcelain .claude/skills/judgment-day/SKILL.md
(no output — clean)
```

Gate (b) re-run on the clean tree returns to two files per token, as recorded above.

---

### Amendment pass (T10) — the six movable gates, re-run after T8 and T9

**Nothing moved. Six gates re-run, six green, every decisive figure identical to the original pass except three that the amendment is expected to change** — the `judgment-day` skill grew by one *Premise Ledger* mention and 0.9 kB, `/akili-specify` by 0.1 kB, and the spec folder gained this document. Gate (f) is re-read for the `shared-state` row only and reports **no empty cell**. The readings below sit beside the original pass above, which is left exactly as it was written.

| Field | Value |
|---|---|
| Task | T10 — closure re-gate, gates half |
| Date | 2026-09-19 |
| HEAD at this run | `c063456` (T8 = `8ebe03f`, T9 = `c063456`; working tree carried only the `CHANGELOG.md` edit of this task) |
| Base commit for every diff | `571edaf`, unchanged — the amendment is measured against the same base as T1–T6, not against the pivot baseline |
| Pivot baseline | `178ce97`, the commit T8 and T9 amend |
| Gates re-run | (a) frozen paths + Falsifiability identity · (b) defined once · (c) marker bytes · (d) held-out slugs · (e) rules by class · (g) packaging. **(f)** re-read for one row |
| Gates not re-run | None of (a)–(g) is skipped; (f) is narrowed to the `shared-state` row because T9 edited no other row and T8 edited no class |
| Evidence rule | Unchanged from §1: command as run, output verbatim. Gate (g) keeps its stated exception for the 275-file pack listing |

| Gate | Result | Decisive figure | Moved since the original pass? |
|---|---|---|---|
| (a) | **green** | 0 bytes of diffstat; Falsifiability `diff` empty over 8 lines | no |
| (b) | **green** | 2 files per token, all three tokens | no |
| (c) | **green** | 1 distinct marker string; 0 dash near-misses | no |
| (d) | **green** | 0 hits | no |
| (e) | **green** | 0 product hits; 23 corpus slugs, 23 inside parentheticals | no (liveness count 3 → 4 in `SKILL.md`, expected) |
| (f) | **green** | `shared-state` row: 3 of 3 reader cells filled, 0 empty | no |
| (g) | **green** | 3 commands, exit 0; 275 files, 0 new packaged file | no (two file sizes grew) |

---

#### Falsifier first — the CHANGELOG check before the edit

T10's verification check 1 was run at `c063456` **before** `CHANGELOG.md` was touched, so the check is known to fail on the pre-amendment text:

```
$ grep -c "secondary source\|condition or signal" CHANGELOG.md
0
```

Exit status 1. After the two bullets were amended, the same command on the same file:

```
$ grep -c "secondary source\|condition or signal" CHANGELOG.md
2
```

Two matching lines — the Premise Ledger bullet carries `condition or signal`, the judge-rule bullet carries `secondary source`. The edit is confined to that one file:

```
$ git diff --numstat
2	2	CHANGELOG.md
```

Two lines replaced, two added, no other path.

---

#### Gate (a) — Frozen paths · **GREEN**

**Part 1 — diffstat over the frozen paths.**

```
git diff --stat 571edaf -- .claude/commands/akili-execute.md .claude/commands/akili-test.md .claude/templates .claude/skills/tdd bin scripts package.json
```

Output, verbatim — the command printed nothing:

```
```

Measured rather than eyeballed:

```
$ git diff --stat 571edaf -- <the same seven paths> | wc -c
       0
```

**Part 2 — Falsifiability-block identity.** The block still opens at `571edaf:.claude/commands/akili-specify.md:347` and at working-tree line 406 — T8 and T9 moved no line of this file above the block, so the head range is unchanged from the original pass.

```
git show 571edaf:.claude/commands/akili-specify.md | sed -n '347,354p' > fals.base.txt
sed -n '406,413p' .claude/commands/akili-specify.md                   > fals.head.txt
diff fals.base.txt fals.head.txt
```

Output, verbatim — no differences:

```
DIFF_EXIT=0
       8 .../fals.base.txt
       8 .../fals.head.txt
```

The 8th line of the head range is still Falsifiability rule 6 (*Rendered-measurement checklist*), read at its tail to confirm the range ends where the gate says it does.

**NFR-1 holds after the amendment.** T8 touched only `.claude/skills/judgment-day/SKILL.md`, T9 only the Step 2.2 trigger row.

---

#### Gate (b) — Defined once · **GREEN**

```
for t in 'live-path' 'shared-state' 'data-env'; do
  /usr/bin/grep -rln "\`$t\`" .claude docs README.md CHANGELOG.md AGENTS.md CLAUDE.md \
    --exclude-dir=worktrees --exclude-dir=archive --exclude-dir=premise-ledger
done
```

Complete hit list, verbatim:

```
`live-path`      .claude/commands/akili-specify.md   docs/commands/akili-specify.md
`shared-state`   .claude/commands/akili-specify.md   docs/commands/akili-specify.md
`data-env`       .claude/commands/akili-specify.md   docs/commands/akili-specify.md
```

Two files per token, no third file. This is the gate the amendment was most able to break in two ways, and it broke neither: T8's reach clause cites citation rule (d) rather than restating what a secondary source is, and the amended CHANGELOG bullets describe the widened trigger in prose without backticking a class token. **NFR-3 holds.**

---

#### Gate (c) — Marker bytes · **GREEN**

**Part 1 — every distinct marker string.**

```
/usr/bin/grep -rho "UNVERIFIED — [^\`|]*" .claude docs/commands \
  --exclude-dir=worktrees --exclude-dir=archive --exclude-dir=premise-ledger | sort -u
```

Output, verbatim — one line, so one distinct string across the scope:

```
UNVERIFIED — confirm at source before relying on it
```

Occurrence counts by file, unchanged from the original pass:

```
.claude/commands/akili-specify.md:2
.claude/commands/akili-propose.md:2
.claude/commands/akili-execute.md:1
```

**Part 2 — near-misses.**

```
/usr/bin/grep -rn "UNVERIFIED [-–]" .claude docs/commands \
  --exclude-dir=worktrees --exclude-dir=archive --exclude-dir=premise-ledger
```

Nothing printed; exit status 1, and piped to `wc -l`:

```
       0
```

T8's clause names the marker with the bare backticked token `` `UNVERIFIED` `` and does not reproduce the marker text, which is why the five-hit count did not move. **NFR-6 holds.**

---

#### Gate (d) — Held-out slugs · **GREEN**

```
/usr/bin/grep -rn -E "target-tooltip|toc-unmapped-orange-notes|emerging-creation-hide-indicator-ui|result-sidebar-collapse-mobile|kp-project-match|kp-cgspace-browse|global-search-prod-deploy" \
  .claude docs README.md CHANGELOG.md \
  --exclude-dir=worktrees --exclude-dir=archive --exclude-dir=premise-ledger
```

Nothing printed; exit status 1. Piped to `wc -l`:

```
       0
```

This is T10 verification check 5, and it matters more after the amendment than before it: the two cases that drove the pivot are `changes--bilateral-review-ux-polish` (cited already, not held out) and held-out `bugfix--toc-unmapped-orange-notes`. Zero hits means no shipped or summary sentence learned the held-out case's name while being amended to cover it. **DD-12 and DD-13 hold.**

---

#### Gate (e) — Rules by class · **GREEN**

**Part 1 — product, framework, and organisation names.**

```
/usr/bin/grep -nE "onecgiar|PRMS|CGSpace|Cypress|Angular|Jest|Cognito|driver\.js" \
  .claude/commands/akili-specify.md .claude/commands/akili-propose.md \
  .claude/commands/akili-constitution.md .claude/skills/judgment-day/SKILL.md
```

Nothing printed; exit status 1. The pattern was proved live against the same four files before the zero was accepted:

```
$ /usr/bin/grep -cE "Premise Ledger" <the same four files>
.claude/commands/akili-specify.md:11
.claude/commands/akili-propose.md:2
.claude/commands/akili-constitution.md:1
.claude/skills/judgment-day/SKILL.md:4
```

**One figure moved, and it is the expected one.** The original pass read `11`, `2`, `1`, `3`; `SKILL.md` now reads `4` because T8's reach clause cites the *Premise Ledger* block by full name once more. `11`, `2`, `1` are unchanged — T9 replaced one line inside an existing sentence and added no new mention.

**Part 2 — corpus slugs, each checked for parenthetical containment.** Every occurrence of `changes--`, `bugfix--`, `results--`, `result-framework-reporting--`, or `bilateral--` was located and the parenthesis depth before the match computed on its line:

```
TOTAL=23 INSIDE=23 OUTSIDE=0
```

Twenty-three hits, twenty-three inside parentheticals, zero outside — the same 23 lines the original pass tabulated, at the same file:line positions. Neither amendment added a corpus slug: T8's clause names no case, and T9's trigger row keeps the single pre-existing `changes--realtime-section-completion` citation it already carried. **NFR-4 holds.**

---

#### Gate (f) — the `shared-state` row across its three readers · **GREEN, 0 empty cells**

This gate is a read, not a grep, and only one row is re-read: T9 edited the trigger table's `shared-state` row, and T8 edited no class. The three readers were re-opened at `c063456`.

| Reader | Location at `c063456` | `shared-state` cell after the amendment |
|---|---|---|
| Step 2.5 counts | `.claude/commands/akili-specify.md:348`, with the count line defined at `:280` | **Filled, and unchanged.** The count line is indexed by status and Impact, never by class (`:280`), so a `shared-state` row is counted exactly as it was before T9 |
| Judge rule | `.claude/skills/judgment-day/SKILL.md:35` | **Filled, and unchanged.** "A triggered class with no row — **severe**" reaches `shared-state` through its trigger, whatever that trigger's wording |
| Task hand-off | `.claude/commands/akili-specify.md:315` | **Filled, and unchanged.** "**All other classes have no hand-off** — they act through their *If false* cell"; `shared-state` is not one of the three named hand-off cases, so it falls in this sentence |

**The amended wording leaves no cell empty.** The reason is structural rather than lucky: none of the three readers is keyed to the trigger's text. Step 2.5 reads status and Impact, the judge reads "a triggered class", and the hand-off rule reads the class name. T9 widened *when* the class fires and *who counts as a sibling*, both inside the trigger table, so every reader that consumed a `shared-state` row before the amendment consumes the same row after it. The trigger line itself still reaches Step 2.5 only through the Verification Checklist item at `:465` and the judge's severe row — the observation the original pass recorded under gate (f), unchanged by this amendment.

---

#### Gate (g) — Packaging · **GREEN**

```
npm run verify:cli && npm run pack:dry-run && git diff --check
```

Exit codes and decisive output lines:

| Command | Exit | Decisive line |
|---|---|---|
| `npm run verify:cli` | `0` | `Summary: 11 commands \| 24 skills \| 7 resources (akili-specs v2.25.0)` |
| `npm run pack:dry-run` | `0` | `npm notice total files: 275` · `package size: 2.1 MB` · `unpacked size: 3.8 MB` |
| `git diff --check` | `0` | no output (no whitespace error, no conflict marker) |

**Same 275 files, same 2.1 MB.** The two amended packaged files are in the tarball at their new sizes:

```
npm notice 89.0kB .claude/commands/akili-constitution.md
npm notice 22.4kB .claude/commands/akili-propose.md
npm notice 53.8kB .claude/commands/akili-specify.md      (53.7kB before the amendment)
npm notice  7.0kB .claude/skills/judgment-day/SKILL.md   ( 6.1kB before the amendment)
npm notice 216.8kB CHANGELOG.md
npm notice 17.3kB docs/commands/akili-constitution.md
npm notice  6.0kB docs/commands/akili-propose.md
npm notice  6.4kB docs/commands/akili-specify.md
```

**No new packaged file entered the tarball.** The files added since the base are the five spec-local documents, and `package.json` excludes their directory:

```
$ git diff --name-status --diff-filter=ADR 571edaf -- .
A	docs/specs/changes/premise-ledger/design.md
A	docs/specs/changes/premise-ledger/execution.md
A	docs/specs/changes/premise-ledger/requirements.md
A	docs/specs/changes/premise-ledger/tasks.md
A	docs/specs/changes/premise-ledger/walkthrough.md

$ /usr/bin/grep -c "premise-ledger" <pack:dry-run output>
0
```

`walkthrough.md` is the one addition since the original pass — this document, which did not yet exist when gate (g) first ran and lists four files there.

Every change under a packaged path is still a modification of a file that existed at `571edaf`:

```
 .claude/commands/akili-constitution.md |  2 +-
 .claude/commands/akili-propose.md      | 21 +++++++++--
 .claude/commands/akili-specify.md      | 67 +++++++++++++++++++++++++++++++++-
 .claude/skills/judgment-day/SKILL.md   | 19 +++++++++-
 CHANGELOG.md                           | 12 +++++-
 docs/commands/akili-constitution.md    |  2 +-
 docs/commands/akili-propose.md         | 13 ++++++-
 docs/commands/akili-specify.md         |  3 +-
 docs/flow.md                           |  2 +-
 docs/skills/judgment-day.md            |  1 +
 10 files changed, 128 insertions(+), 14 deletions(-)
```

The `SKILL.md` line moved from `17 +-` to `19 ++-` (T8) and the packaged-file count did not change. **FR-11's packaging half holds after the amendment.**

---

#### What the CHANGELOG now says, and why it is not a restatement

`CHANGELOG.md` `Unreleased` carries two amended bullets and no other change. Both were written against the shipped files re-opened at `c063456`, not against the task brief (KZ-002):

| Bullet | What it gained | Shipped sentence it describes |
|---|---|---|
| `judgment-day` attacks the Premise Ledger first | The reach clause: a citation cell holding neither a citation as run nor the marker, and a citation naming a **secondary source** rather than the primary one, are both attacked as though the row carried the marker; the judge searches for the primary source and reports `not re-run` where the host cannot reach it; re-reading a document settles that document, never the system it describes; recording a severity does not discharge the rule; which sources count as secondary is set by the block's citation rules | `.claude/skills/judgment-day/SKILL.md:28` |
| Premise Ledger | The trigger for shared state fires on a **condition or signal** more than one block or component reads, not only on the containers a value lives in, and a sibling is any reader of that state, condition, or signal, a conditional block in the same template included | `.claude/commands/akili-specify.md:300` |

The judge-rule bullet's version line also moves from `Skill version 1.7 → 1.8.` to `Skill version 1.7 → 1.9.`, because the frontmatter at `c063456` reads `version: "1.9"` and the old sentence would otherwise describe a file that no longer exists. Release classification stays **minor**; the Notes paragraph is untouched, as is every other entry in the file (NFR-8).

Neither bullet backticks a class token — that is what keeps gate (b) at two files per token with `CHANGELOG.md` inside its scope — and neither restates the citation rules or the row shape (NFR-3).

## 3. Literal-reader walkthrough

**Result: 11 of 14 on the primary key bullet; 12 of 14 counting either bullet. The task's disqualifier fires on four counts.** Three cases miss their primary key bullet: both judge-rule cases return `INCONCLUSIVE` on every key premise, and held-out `bugfix--toc-unmapped-orange-notes` returns `INCONCLUSIVE` on its primary bullet while reaching its supporting one. One held-out Blast Radius supporting bullet returns `NOT DEMANDED`. Both negative controls behave as designed: zero blast-radius rows, no over-triggering.

### Reader inputs and what was withheld

| Field | Value |
|---|---|
| Reader | Fresh context, separate from the contexts that implemented T1–T6 and from the context that ran the gates in §2 |
| Read | `.claude/commands/akili-specify.md:263–317` (the *Premise Ledger* bullet only) · `.claude/skills/judgment-day/SKILL.md:17–41` (`## Hard Rules` only) · `.claude/commands/akili-propose.md:99–105` and `:204–216` · the 16 situation cards |
| Withheld, confirmed by the reader | Everything under `docs/specs/` (so: no `requirements.md`, no `design.md`, no corpus entry and no lesson text) · `CHANGELOG.md` · `docs/commands/` · `docs/skills/` · `git log` · the assembler's key |
| Reading rule | Every `( … )` parenthetical stripped and marked `[…]` before a verdict was formed. Case slugs that appear inside parentheticals in the block were not used for any verdict |
| Situation given per case | The work as its author framed it *before* the defect was found: the goal, the claims the design took as given, and the artifacts that existed at that moment |

### Scoring rules applied

1. **The case verdict is the reader's verdict on the key premise** — the card bullet that was the problem premise in the corpus entry. Where the key names a **primary** bullet and a **supporting** one (Cases 2, 13, 14), the primary is listed first and both verdicts are given; where it names two or three co-equal problem premises (Cases 6, 7, 8, 10, 12), they are listed in the key's order. Two headline counts are reported rather than one, because they differ: **on the primary bullet alone**, and **counting a case as reached when any of its key bullets reads `DEMANDED`**. The first is the stricter reading and the one the failure list follows.
2. **A verdict must rest on a general sentence with its parenthetical stripped.** Every quoted sentence below was checked for parenthetical content; `[…]` marks where a parenthetical was removed. A verdict justified by a parenthetical example is struck (tasks.md Disqualifier). None was.
3. **Distractors and neutral claims do not move the case verdict.** Each card carries claims beyond the key premise, some deliberate distractors. A `NOT DEMANDED` or `INCONCLUSIVE` on a design decision, a specification of new behavior, or a statement that mixes a created fact with an existing one is the text working as written, not a case failure. Those readings are listed in the last column and never in the verdict column.
4. **Failures are recorded, not softened.** Per tasks.md, any `INCONCLUSIVE` on a key premise, and any held-out `NOT DEMANDED` other than the known-hard case, fails this task and routes to the user as a spec gap.

### The 16 cases

| Case | Set | Surface | Key premise (short) | Verdict | Sentence quoted (parenthetical stripped) | Other-claim readings |
|---|---|---|---|---|---|---|
| 1 · `kp-report-modal-auto-create` | cited | block | The URL's create surface is `AowHloCreateModalComponent` | **DEMANDED** | "the dispatch chain from the entry point to the changed code, naming each branch point and the branch taken; the changed code's own `file:line` proves the code exists, not that the user reaches it […]" | 6 D · 0 ND · 0 INC |
| 2 · `toc-unmapped-orange-notes` | **held out** | block | **primary:** consequences contained to the two edited blocks · **supporting:** the "Other(s)" control auto-activates on its own separate gate | **INCONCLUSIVE** on the primary; **DEMANDED** on the supporting | For the supporting bullet: "A claim earns a row only when *if this claim were false, a design decision, a task, or the scope would change*." No demanding sentence was found for the primary | 2 D · 1 ND · 1 INC. The ND is the mapped-branch claim (finding F13); the INC is the effect-prediction claim (F6) — **superseded by §8:** the primary bullet now reads `DEMANDED` against the amended trigger |

| 3 · `evidence-storage-link-validation` | cited | block | **primary:** that method is the code the reporting UI's green check runs through · **supporting:** the verdict is produced server-side, so the correction belongs on the server | **DEMANDED** on both | "the dispatch chain from the entry point to the changed code" | 3 D · 0 ND · 1 INC. The INC is on `calculateValidationSections`, which the reader read out under "A true statement about the repository whose falsity changes no decision, task, or scope item is trivia and stays out." |
| 4 · `target-tooltip` | **held out** | block | The `achievedTooltip` pattern is keyboard reachable, so a same-built tooltip is | **DEMANDED** | "A "same as the sibling" claim names the sibling's mechanism at `file:line`." | 4 D · 0 ND · 0 INC |
| 5 · `result-sidebar-collapse-mobile` | **held out** · known-hard | block | Section-switch links are reachable at `.panel_menu .sections a` | **DEMANDED** — with the caveat below | "A claim earns a row only when *if this claim were false, a design decision, a task, or the scope would change*." | 4 D · 1 ND · 0 INC. The ND is a specification of new behavior, exempt under rule 3 |
| 6 · `realtime-section-completion` | cited | block | (a) No section's save handler notifies anyone or sends anything outward · (b) a debounced background save is the mechanism the user asked for | **DEMANDED** on (a); **NOT DEMANDED** on (b) | "A "no X exists" claim — no coverage, no consumer, no prior fix, no writer — quotes the command, pattern, and scope **verbatim as run** and includes the concept's known alternate names, because a "verified absent" claim is only as true as its search pattern." | 4 D · 0 ND · 0 INC beyond the two key bullets |
| 7 · `emerging-creation-hide-indicator-ui` | **held out** | block | (a) That `@if` wraps Card 2 and nothing else · (b) no other copy depends on Card 2 being present | **DEMANDED** on both | (a) "A claim earns a row only when *if this claim were false, a design decision, a task, or the scope would change*." · (b) "A "no X exists" claim — no coverage, no consumer, no prior fix, no writer — quotes the command, pattern, and scope **verbatim as run** and includes the concept's known alternate names, because a "verified absent" claim is only as true as its search pattern." | 3 D · 1 ND · 0 INC. The ND is a scoping statement about the change, exempt under rule 3 |
| 8 · `my-work-board` | cited | block | Completeness persisted per section in `validation` · five-value status vocabulary · phase filtering server-side | **DEMANDED** on all three | "A citation points at the code that writes or reads the thing, the definition of the contract, or the route or dispatch table. A UI label, a comment, a component name, a document, another spec's summary, and a person's recollection are **secondary**." | 3 D · 0 ND · 1 INC. The INC is the tab-position claim, which mixes a created fact with an existing one — exempt under rule 3. The TRD-borne `status_id` distractor read DEMANDED |
| 9 · `kp-project-match` | **held out** | block | CGSpace exposes a `project` facet on its Discovery API | **DEMANDED** | "A premise about an environment no command in the repository can reach is still a row […]." | 5 D · 0 ND · 0 INC. The UX-copy distractor ("one no-matches message covers both") also read DEMANDED |
| 10 · `sidebar-toggle-consolidation` | cited | block | (a) The consumers of the shared DOM hook are the co-located Jest specs · (b) no automated coverage exists for the hint engine's anchor timing | **DEMANDED** on both | (a) "every reader found by a search over the whole repository, with the command, pattern, and scope as run — end-to-end suites and suites CI skips included, never a list derived from the files sitting beside the changed component […]" · (b) the "no X exists" sentence quoted at Case 6 | 3 D · 1 ND · 0 INC. The ND is a created design decision, exempt under rule 3 |
| 11 · `bilateral-review-ux-polish` | cited | judge rule | Three uncited premises: Clear filters only in the popover · the Actions cell has no `border-l` · the toolbar region is all lucide | **INCONCLUSIVE** on all three | No demanding sentence found. "Before any other reading, judges attack the design's Premise Ledger at its source: re-run or re-read every citation, try to refute every `UNVERIFIED` row with their own search, and look for premises the design depends on that carry no row." | 1 D · 0 ND · 2 INC. One of the two INC is the contrast premise (`ring-[var(--pr-focus-ring)]`, cited to a document) — also a key reading, see Findings — **superseded by §8:** all three uncited premises now read `DEMANDED` against the reach clause |
| 12 · `kp-cgspace-browse` | **held out** | judge rule | (a) The reporting-year rule is a UX default (uncited) · (b) Discovery field names are as recorded in the research notes (cited, second-hand) | **INCONCLUSIVE** on both | No demanding sentence found. "A premise is never accepted because the requirements and the design agree on it — only the source settles it." | 1 D · 0 ND · 3 INC. All three are document-cited premises reading the same way as (b) — **superseded by §8:** both key premises now read `DEMANDED` against the reach clause and the document sentence |
| 13 · `innovation-dev-p25-save-500` | cited | Blast Radius | **primary:** no in-flight spec touches `innovation_dev/`; the pre-flight covered two spec folders · **supporting:** the bug report cites no ticket identifier, so there is nothing external to reconcile | **DEMANDED** on the primary; **NOT DEMANDED** on the supporting | "History query over the target files **and** the ticket ID, **across all branches**, quoted as run" | 2 D + 2 implicit D · 2 ND · 0 INC. The supporting `NOT DEMANDED` is on a **cited** case, so it does not fire the held-out clause; the text takes the ticket ID as an input to the history query and demands no search for one |
| 14 · `global-search-prod-deploy` | **held out** | Blast Radius | **primary:** no change addressing the symptom on any reachable branch · **supporting:** staging and production run the same revision | **DEMANDED** on the primary; **NOT DEMANDED** on the supporting | "History query over the target files **and** the ticket ID, **across all branches**, quoted as run" | 0 D + 2 implicit D · 4 ND · 0 INC. Every ND is an environment-parity or code-vs-data claim; see finding F9 |
| Control A · prose-only design | control | block | *none* — the design names no existing code, data, contract, or rule | **PASS** — 0 rows, 0 blast-radius rows | "A design that names no existing code, data, contract, or rule replaces the table with one line: `Premise Ledger: none — <reason>`." | One ambiguity, no over-trigger; see Findings |
| Control B · one-caller private function | control | block | *none* — no exported symbol, shared state, or user-facing branch changes | **PASS** — 2 dependence rows, 0 blast-radius rows | "When no trigger fires, write the line in full: `Blast-radius triggers: none apply — <reason>`." | The reader demanded no sibling and no consumer check, which is the designed control outcome |

**Case 5 caveat — recorded, not argued away.** The reader returned `DEMANDED` on the selector claim, quoting the dependence test: if the selector is false, the end-to-end task changes. But the card presented the selector among the design's claims, and in the corpus it was not one. The premise lived in a Cypress spec the end-to-end task authored, not in `design.md`. The shipped block's reach is stated in its own definition — "a statement the **design** makes about the **existing** system" — so the text reaches this claim only if a design author writes it down. A selector first written inside a task's own test artifact is outside that stated reach, and no shipped sentence pulls it back in. The `DEMANDED` verdict is therefore conditional on where the claim is authored, and the design-authored branch is the one the reader was shown. This is reported in both directions and settled by neither.

### Findings — gaps and ambiguities the literal reader named

| # | Finding | Surfaced at | Reader's words | Case failure? |
|---|---|---|---|---|
| F1 | The judge rule's three actions do not reach an **uncited row that carries no `UNVERIFIED` marker**. Re-running a citation needs a citation; the refute clause is keyed to the marker; the no-row clause needs a missing row. A row with evidence "none" satisfies none of the three | 11 (three premises), 12 (one premise) | ""none" is not a citation to "re-run or re-read"; it is not the `UNVERIFIED` marker the refute clause names" · "The three actions in Q-J do not name this state." | **Yes** — the largest single cause, 4 key-premise `INCONCLUSIVE` |
| F2 | A premise **cited to a document** gets a demanded re-read of the document, which tests the document rather than the system. The degrade branch is written for a command, so a document citation has no stated fallback | 11 (focus-ring token), 12 (research notes, server guide, component inventory) | "Q-J demands re-reading the notes; that tests the notes, not Discovery. "only the source settles it" names no procedure for a source outside the repository; Q-J2's `not re-run` fallback is written for "a cited command", not a document citation." | **Yes** — Case 12's key premise (b) |
| F3 | The `shared-state` trigger is worded for runtime state, a service, a base class, or a lifecycle hook. A **template conditional keyed off the same underlying state** is none of those as written, so the trigger does not fire on it | 2 | "a template gate is not "state, a service, a base class, or a lifecycle hook"" | **Yes** — contributed to the `INCONCLUSIVE` on Case 2's primary key bullet; the supporting sibling claim survived only through an `existence` row and the Bug Mode rows, not through the trigger built for it |
| F4 | Bug Mode says the architect "runs those same four checks" but **names the four only inside the parenthetical**. With the parenthetical stripped, the block does not say which four | 2 (both readers) | Reader B: "With the parenthetical gone, the block never names the four checks." | No for reader A, who imported the names from the Blast Radius template. Reader B, reading the block alone, could name only "four checks" and left their content unresolvable |
| F5 | Control A: the stated-empty line and the **two fixed opening lines** are not reconciled. One sentence says the two lines open the section; the other says the design replaces the table with one line | Control A | "Q-LINES says they "open the section", Q-EMPTY says the design "replaces the table with one line" — the text does not say whether the two lines survive when the table is replaced." | No — the control still produced zero rows, which is what NFR-2 asks of it |
| F6 | A **prediction about the edit's effect** is excluded by the definition, and the text does not say whether it must be decomposed into the existing-system facts inside it | 2 (claim 2, the `planned_result` gate extension) | "The embedded existing-system fact" … "but the text does not say a prediction must be decomposed into its embedded premises." | No — non-key claim, exempt under rule 3 |
| F7 | A statement that **mixes a created fact with an existing one** has no stated split | 8 (tab position) | "Q-DEF admits only what "the design takes as given rather than creates"; the text does not say how a mixed statement is split." | No — non-key claim |
| F8 | Whether a claim passes the dependence test can depend on **facts the design must supply and the block does not demand**, leaving admission open | 3 (`calculateValidationSections`) | "The text leaves admission to a test the card does not resolve." | No — non-key claim |
| F9 | The Blast Radius checks contain **no environment-parity and no deployed-revision comparison**. The history query looks for a fix, not for the revision each environment is running | 14 (three claims, one of them a key bullet) | "No check compares the deployed revision with the local one; Q-BR-AF queries history for a fix, not for the running revision." | **Yes** — the held-out `NOT DEMANDED` on Case 14's supporting key bullet |
| F10 | No Blast Radius check examines **the fix's own effect on a response shape or a stored field**; the consumer enumeration finds readers, not the change's shape | 13 | "but no check examines the fix's effect on the shape." | No — cited case, non-key claim |
| F11 | Whether `shared-state` fires on **an endpoint or a configuration file** is left open by the trigger's wording, so the row count for such a design is a range rather than a number | 8, 9 | "fires only if the endpoint is "a service … that more than one component uses"; the card does not say who else calls it" · "configuration is not "state, a service, a base class, or a lifecycle hook" as written" | No — a row-count uncertainty, reported in §5 |
| F12 | The block's stated reach is what **the design** writes, so a premise first authored inside a task's own test artifact is outside it | 5 | See the Case 5 caveat above | No, on the branch the reader was shown; unresolved on the other branch |
| F13 | The `live-path` row traces **only the branch the reproduction takes**. A claim that *no other* branch's rendering changes is therefore untested: nothing in the text demands the untaken branch be walked | 2 (claim 6) | "Q-LP demands "naming each branch point and the branch taken" — only the branch the reproduction takes; nothing demanded traces the mapped branch." | No — non-key claim, but it is the second half of Case 2's containment gap and was missed in the first assembly of this table |

## 4. Falsifier — the block mutation

**Outcome: not met on the case verdict as rule 1 carries it; met on the primary key bullet.** Case 2's case verdict is carried by its supporting bullet, and that bullet moved only from `DEMANDED` to `INCONCLUSIVE`, not to `NOT DEMANDED`. The **primary** key bullet did flip to `NOT DEMANDED`, exactly as tasks.md words the criterion. Reader B's own reasoning names the deleted row as the cause on both. A walkthrough that was reading the case rather than the text would not have moved at all; four of Case 2's six claims moved, every one of them looser.

**The mutation.** The Leader copied the shipped `/akili-specify.md` to the scratchpad and deleted exactly one line — the `shared-state` row of the blast-radius trigger table, shipped line 300. The real file was never touched; §2 gate (a) and the final `git status` below both confirm it. The complete `diff` of the mutated copy against the shipped file:

```
$ diff <scratch>/akili-specify.mut.md .claude/commands/akili-specify.md
299a300
>     | changes state, a service, a base class, or a lifecycle hook that more than one component uses | `shared-state` | every sibling, each with its mechanism at `file:line` — all of them, never a sample, and a count without the list is not a row (`changes--realtime-section-completion`) |
```

One line, one direction. Nothing else in the block differs.

**The re-walk.** Reader B was a separate fresh context that never saw the shipped file, never saw reader A's output, and read only the mutated block and Case 2's card. Its first recorded observation is the mutation itself, reached without being told to look for one:

> "The trigger table has **two** rows: `live-path` and `consumer`. There is **no** `shared-state` trigger row. The class table still says `shared-state` is required when "its trigger below fires". No such trigger exists below, so that condition can never be satisfied."

**Movement, per claim.** Both key premises are marked; the other four claims are shown because their movement is what measures the confound.

| Case 2 claim | Reader A (shipped) | Reader B (mutated) | Movement | Tied to the deleted row? |
|---|---|---|---|---|
| 1 Both blocks gated by `isCP2026()` | DEMANDED | DEMANDED | none | — |
| 2 Extending the gate yields the asked visibility | INCONCLUSIVE | NOT DEMANDED | `INCONCLUSIVE → NOT DEMANDED` | No |
| 3 `hasReferenceCenters()` reports mapped centers | DEMANDED | INCONCLUSIVE | `DEMANDED → INCONCLUSIVE` | No |
| **4 — key, supporting** "Other(s)" control on its own separate gate | **DEMANDED** | **INCONCLUSIVE** | `DEMANDED → INCONCLUSIVE` | **Yes, explicitly** |
| **5 — key, primary** Consequences contained to the two edited blocks | **INCONCLUSIVE** | **NOT DEMANDED** | `INCONCLUSIVE → NOT DEMANDED` | **Yes** |
| 6 The unmapped case is the only rendering that changes | NOT DEMANDED | NOT DEMANDED | none | — |

Reader B's reason for the supporting bullet (claim 4) names the deletion without prompting:

> "whose requirement is "its trigger below fires", and no `shared-state` trigger exists in the table (O1), so by that route no row is demanded."

And for the primary bullet (claim 5):

> "`consumer` trigger not fired; `shared-state` has no trigger. No row in Step 1 tests it, subject only to the unnamed R3–R6."

**Row count also moved.** Reader A demanded 7 rows for Case 2 — three dependence rows plus four Bug Mode rows. Reader B could hold only one firm row, one disputed, and four whose content it could not name. The `shared-state` route to the sibling claim closed entirely.

**Against tasks.md's literal criterion.** The task states: *"delete the `shared-state` trigger row and re-walk `bugfix--toc-unmapped-orange-notes` — the verdict must flip from its recorded value to `NOT DEMANDED`."* On the key's **primary** bullet — consequences contained — the verdict flipped to `NOT DEMANDED` exactly as written. On the **supporting** bullet the verdict moved but stopped at `INCONCLUSIVE`, because the block offers two other routes to that claim — `location` and `existence` through the dependence test — and reader B recorded that the block "gives no tie-break between a trigger-gated class and a dependence-gated class". The criterion is therefore **met on the primary key bullet and not met on the case verdict**, which rule 1 carries on the supporting bullet. The gate is falsifiable: it moved, in the right direction, on the claim the deleted row governed.

**Confound, stated plainly.** Reader A and reader B are two different fresh contexts, not one context read twice. That substitution is forced — a reader who has seen the shipped text cannot un-see it, and DD-13 requires the walkthrough be run by a context that has read only the shipped text. The cost is that reader variance and mutation effect are not separable by this design. Two of the four movements (claims 2 and 3) touch nothing the deleted row governs, so some of the loosening is reader B being the stricter reader rather than the block being weaker. Claims 4 and 5 are the two the deleted row governs, and they are the two where reader B names the missing trigger in its own reasoning. That is the strongest attribution this design can produce, and it is weaker than a same-reader before-and-after would be.

**Gate (b)'s falsifier is separate and already executed** — see *Gate (b) falsifier — executed* in §2, where pasting the class list into the judge rule on a scratch copy turned that gate red.

## 5. Row counts (NFR-2)

**NFR-2 holds. The text costs six to eight rows on a real design, zero on a design that names nothing, and two on a change with one caller.** No retro-fitted design produced a row the reader could not tie back to a named decision, task, or scope item.

| Retro-fitted design | Rows the text would require | Blast-radius triggers that fired | `none apply` / stated-empty line |
|---|---|---|---|
| 1 · `kp-report-modal-auto-create` | 7 | `live-path` | neither |
| 2 · `toc-unmapped-orange-notes` | 7 (3 dependence + 4 Bug Mode) | `live-path` | neither |
| 3 · `evidence-storage-link-validation` | 7 (3 + 4 Bug Mode); 8 if one open claim is admitted | `live-path` | neither |
| 4 · `target-tooltip` | 6 | `live-path` | neither |
| 5 · `result-sidebar-collapse-mobile` | 6 | `live-path`, `shared-state` | neither |
| 6 · `realtime-section-completion` | 6 | `live-path`, `shared-state` | neither |
| 7 · `emerging-creation-hide-indicator-ui` | 6 | `live-path` | neither |
| 8 · `my-work-board` | 8; 9 if `shared-state` fires (F11) | `live-path`, `consumer` | neither |
| 9 · `kp-project-match` | 8 | `live-path`, `consumer` | neither |
| 10 · `sidebar-toggle-consolidation` | 6 | `live-path`, `consumer` | neither |
| **Control A** · prose-only | **0** | none | **stated-empty line demanded**: `Premise Ledger: none — <reason>` |
| **Control B** · one-caller private function | **2** | none | **`none apply` line demanded** in full |
| **This spec** (design.md §11) | **13** | `consumer`, `live-path`; `shared-state` does not apply | neither |

| Measure | Corpus designs 1–10 | This spec |
|---|---|---|
| Rows | 6 to 8 | 13 |
| Median | 6.5 | — |
| Blast-radius rows beyond the dependence rows | 0 in every case — every triggered class was carried by a row the dependence test already admitted | 0 |

**Ceremony risk, read once (requirements §8, last row).** That row accepts ceremony as a residual risk with no automated check and asks this walkthrough for the counts so the user can read them at the HITL pause. The counts say the risk did not materialise on this corpus: six to eight rows is the size of the "took as given" list each design already wrote in prose, so the block reformats work the design was doing rather than adding work. Both controls confirm the floor — a design that claims nothing writes one line, and a design with one caller writes two rows and no blast-radius row. This spec's own thirteen is roughly double the corpus median, which is what a spec that edits six citing surfaces should cost; it is not evidence about a product feature.

## 6. Budget actuals (design §13)

**Read against the budget as re-sized at the pivot.** Design §13 originally read 7 tasks · ~150 lines · 9 rounds; the pivot that T7's failure triggered re-sized it to **10 tasks · ~160 lines · 12 rounds** with the user's approval. Both readings are kept below, because the first gate's entry was written against the original and is still true of the work it described.

### First-gate reading (T1–T7, against the original budget)

| Measure | Original estimate | Actual at T7 | Reading |
|---|---|---|---|
| Tasks | 7 | 7 | Exact. No task was split, merged, or added |
| Shipped lines | ~150 | **126** | 16% under. T1 56 · T2 9 · T3 15 · T4 17 · T5 1 · T6 28 · T7 0 |
| Review rounds | 9 | **8** | One per task (7) plus T7's rework review |
| Rework attempts | 2 budgeted | **1 consumed** | T7 only, on document fidelity. T1–T6 passed first time |

### Full run (T1–T10, against the re-sized budget)

| Measure | Re-sized estimate | Actual | Reading |
|---|---|---|---|
| Tasks | 10 | **10** | Exact. T8–T10 are the pivot's amendment tasks |
| Shipped lines (packaged files and mirrors) | ~160 | **132** | 18% under. The first seven above (126), plus T8 3 · T9 1 (one line replaced) · T10 2 (the CHANGELOG bullets). **Two countings, both recorded:** summing each task's own `git diff --numstat` gives **132 added**, which is the figure this row uses because the breakdown is per task; the cumulative `git diff --numstat 571edaf HEAD` over the same paths reads **+128 −14**, four fewer, because a line a later task re-changed is counted once there and twice here — T9 replaced the trigger row T1 had added, and T10 replaced two CHANGELOG lines T6 had added |
| Review rounds | 12 | **15** | **Over by three — the tripwire fires; see below** |
| Rework attempts | 2 budgeted | **4 consumed** | T7 (document fidelity), T9 (a dropped term), T10 **twice** (a misattributed quote, then an arithmetic error in this very table). Over by two |

**Tripwire: review rounds exceeded the re-sized budget by three, and rework attempts by two.** The round count is T1–T6 one each (6), T7 two, T8 one, T9 **three**, T10 **three**. The unbudgeted rounds are:

- **T9's third verdict.** A replacement Reviewer had been dispatched when the first went idle after a session limit; the first recovered and delivered, so two independent audits of the same attempt exist. The second was redundant by construction, and it is the one that caught the stale two-term wording in T9's task scope bullet, so the round bought something. It is counted rather than written off.
- **T10's two rework rounds.** First, a quote in §8 was attributed to the reader's verdicts file when those words came from its completion report. Second, this table's own shipped-lines cell read 130 against a breakdown that sums to 132, because the figure had been taken from the cumulative diff while the breakdown is per task. Both were caught by the Reviewer, fixed, and re-confirmed; the second is recorded here rather than quietly corrected because it was an error in the budget record itself.

Neither round is a mis-sized task: shipped lines and task count both came in under. The overrun is entirely **audit volume** — two runtime events in the Reviewer slot, and three rework rounds on evidence fidelity rather than on shipped text. **Escalated to the user with this document** (`/akili-execute` Budget Tripwire), and no further work was opened after it fired.

The spec-local `walkthrough.md` is outside the shipped-line count, as design §13 states.

## 7. NFR-7 read and proposal success criteria

### NFR-7 — backward compatibility

**PASS. No shipped sentence makes a command fail on a design that has no Premise Ledger section.** NFR-7 reads: *"A design without the section reads as "no ledger recorded". No command fails on it; a judge reports it per FR-7."* `requirements.md` §8 assigns this to a read rather than a check, because a command that never runs cannot be made to fail by a grep. Every shipped sentence that mentions the section was located and read for what it binds.

```
/usr/bin/grep -rn "Premise Ledger" .claude docs README.md CHANGELOG.md AGENTS.md CLAUDE.md \
  --exclude-dir=worktrees --exclude-dir=archive --exclude-dir=premise-ledger
```

Twenty-six hits across nine files. The four that could bind an existing design, and what each actually binds:

| Sentence | Where | What it binds | Fails on an old design? |
|---|---|---|---|
| "An absent section is never a valid empty state" | `akili-specify.md:281` | The design `/akili-specify` is **authoring in this run**, inside Step 2.2 *Minimum content*. No command reads a design from disk and applies this | **No** |
| "`design.md` carries a **Premise Ledger** — the table, or the stated-empty line with its reason; an absent section is not an empty one" | `akili-specify.md:463` | `/akili-specify`'s own exit checklist, on the design it just wrote. `/akili-audit`, `/akili-constitution` and `/akili-seo` each carry a separate Verification Checklist and none contains this item | **No** |
| "Print the **Premise Ledger**'s count line as written" | `akili-specify.md:348` | Step 2.5, presenting the design Step 2.2 produced in the same pass. It is an instruction to print, and it names no failure and no gate — the same paragraph says "the recommendation does not gate the menu" | **No** |
| "The design names existing code and has no Premise Ledger, or a false stated-empty line — **severe**" | `judgment-day/SKILL.md:32` | A judge's **finding**, which is the FR-7 report path NFR-7 asks for. A severe finding is reported, not thrown; the protocol around it is unchanged | **No — this is the required behavior** |

Two further readings support the pass:

- **The one sentence written for an older artifact does the opposite of failing.** Bug Mode states: *"When the proposal carries no Blast Radius section — an older proposal, or a bug specified without a proposal — the architect runs those same four checks … during Step 2.1 and writes the results as rows here."* A pre-existing proposal without the new section proceeds, with the architect supplying what the section would have carried.
- **No other command knows the concept exists.** `grep -rn -i "premise"` over `/akili-execute`, `/akili-validate`, `/akili-audit`, `/akili-archive`, `/akili-resume`, `/akili-test`, `/akili-quick` and `/akili-seo` returns **zero hits** (exit 1). Only `/akili-specify` (on the design it authors), `/akili-constitution` (writing a template for a new project), `/akili-propose` (a new diagnosis) and `judgment-day` (the report path) touch it at all.

### Proposal success criteria 1–6

| # | Criterion (abbreviated) | Result | Evidence |
|---|---|---|---|
| 1 | A literal reader of the block is told by a quoted general sentence to write the row that would have exposed each false premise, for the five cited entries **and at least two held-out ones** | **Met** | §3: all five cited block cases (1, 3, 6, 8, 10) `DEMANDED` on the key premise, and four held-out block cases (4, 5, 7, 9) likewise — well past "at least two". Held-out Case 2 reaches only its supporting bullet |
| 2 | A literal reader of the `judgment-day` rule re-runs `bilateral-review-ux-polish`'s three premises at the source instead of reading for plausibility | **Met after the amendment** (was *Not met* at the first gate) | §8 Case 11: all three uncited premises now `DEMANDED`. The reader quoted the reach clause by name — "a citation cell holding neither a citation as run nor the `UNVERIFIED` marker … attacked under action 2, as though the row carried the marker: the judge searches for the primary source itself" — which is what F1 said the rule lacked |
| 3 | A literal reader of the Bug Diagnosis runs the already-fixed check before proposing a fix for `innovation-dev-p25-save-500` | **Met** | §3 Case 13: primary key bullet `DEMANDED`, quoting the history query, with the reader recording that it "runs **first**, before any root-cause work" and is never `n/a` |
| 4 | A backend-only or prose-only design triggers no blast-radius row — the cost bound holds | **Met** | §5: Control A 0 rows and the stated-empty line; Control B 2 dependence rows and 0 blast-radius rows. The reader demanded no sibling and no consumer check on either |
| 5 | Every cross-reference is by section name; `judgment-day`'s Integration row names Step 2.5; the mirrors agree; `verify:cli`, `pack:dry-run` and `git diff --check` pass | **Met** | §2 gate (b) — two files per token, citing surfaces restate no class — and gate (g) — three commands, three zero exits |
| 6 | No hunk in `/akili-execute`, the personas, `tdd`, or Step 3.2's Falsifiability block | **Met** | §2 gate (a) — 0 bytes of diffstat over the seven frozen paths, and the Falsifiability block byte-identical over its 8 lines |

**Five of six met; criterion 2 is not.** That is the same gap §3's findings F1 and F2 name and the same one the Pivot Record must carry: the judge rule, as shipped, does not reach the case it was written for.

---

## 8. Amendment pass — the three cases re-walked (T10)

**All three cases now reach their key premise.** After T8 shipped the judge rule's reach clause and T9 widened the `shared-state` trigger, a **fresh literal reader** — a different context and a different model from the first gate's reader, which saw neither this spec, nor the key, nor any earlier verdict — re-walked Cases 2, 11 and 12 against the amended text. The three key-premise `INCONCLUSIVE` verdicts that failed T7 are closed. Per T10's Disqualifier, a case still `INCONCLUSIVE` on its key premise would be reported as still open and **not** chased with a further amendment; none is.

### Reader isolation

| Field | Value |
|---|---|
| Inputs permitted | the Step 2.2 *Premise Ledger* block; the `## Hard Rules` section of `judgment-day/SKILL.md`; Cases 2, 11 and 12 of the prepared card deck, unchanged from the first gate |
| Inputs forbidden | everything under `docs/`, `CHANGELOG.md`, `README.md`, any other card, any other section of the two files, `git log`, `git diff`, and any file named `t7-key*`, `t7-reader*`, `walkthrough*` or `t10*` |
| Confirmed by the reader | In its completion report to the Leader: "Read nothing outside the three permitted inputs (the block, the judge rule's Hard Rules section, Cases 2/11/12 by header boundary)." The verdicts file itself carries the narrower positive form, "Inputs read: akili-specify.md Step 2.2 \"Premise Ledger\" bullet (the block); judgment-day SKILL.md \"## Hard Rules\" (the judge rule); t7-cards.md Cases 2, 11, 12 only." The two provenances are distinguished here because the negative confirmation exists only in the report |
| Reading rule | every `( … )` parenthetical stripped; no verdict may rest on a parenthetical |

### Movement, per key premise

| Case | Key premise | First gate | Amendment pass | Sentence the reader quoted (parenthetical stripped) |
|---|---|---|---|---|
| 2 · `toc-unmapped-orange-notes` (held out) | **primary:** consequences contained to the two edited blocks | `INCONCLUSIVE` | **DEMANDED** | "every sibling, each with its mechanism at `file:line` — a sibling is any reader of that state, condition, or signal, a conditional block in the same template included; all of them, never a sample, and a count without the list is not a row […]" |
| 2 · same | **supporting:** the "Other(s)" control auto-activates on its own separate gate | `DEMANDED` | **DEMANDED**, with the row it belongs to `INCONCLUSIVE` — see F14 | as above, plus "A claim earns a row only when *if this claim were false, a design decision, a task, or the scope would change*." |
| 11 · `bilateral-review-ux-polish` (cited) | three uncited premises: Clear filters only in the popover · the Actions cell has no `border-l` · the toolbar region is all lucide | `INCONCLUSIVE` ×3 | **DEMANDED** ×3 | "a citation cell holding neither a citation as run nor the `UNVERIFIED` marker […] attacked under action 2, as though the row carried the marker: the judge searches for the primary source itself and reports what that search returns, including `not re-run` where its host cannot reach that source" |
| 12 · `kp-cgspace-browse` (held out) | (a) the reporting-year rule is a UX default, uncited | `INCONCLUSIVE` | **DEMANDED** | the same empty-cell sentence |
| 12 · same | (b) Discovery field names are as recorded in the research notes, cited second-hand | `INCONCLUSIVE` | **DEMANDED** | "Re-reading a document settles that document, never the system it describes, so a document that agrees with the design is not confirmation." |

Case 12's remaining three document citations — the server guide, the component inventory, the year-filter note — all read `DEMANDED` under the same document sentence. Its one code citation, `findOnCGSpace` by file path, is an ordinary action-1 re-run rather than one of the two attacked states, which is the correct reading: a path to the code is a primary source.

### Case 2's row count, re-read

The amended trigger fires where it did not before: the reader wrote that the `shared-state` trigger "fires here because the card's own claim states two blocks read one condition", and that the trigger line "must name the fired trigger(s), not read `Blast-radius triggers: none apply — <reason>`". At the first gate the same case produced no `shared-state` row at all. Row count moves from 7 (3 dependence + 4 Bug Mode) to **at least 4 dependence rows including the `shared-state` row**, the Bug Mode four unchanged; the reader states the total as 4 or 5, and 6 if `live-path` also fires.

### Findings carried forward, and two new ones

F1, F2 and F3 are **closed** by the movement above. F9 is unchanged and remains a series input, not amended here. F4–F8 and F10–F13 are unchanged. Two findings are new, both surfaced **by** the amendment and neither gating:

| # | Finding | Surfaced at | Reader's words | Case failure? |
|---|---|---|---|---|
| F14 | A claim that also feeds a triggered row's required content has no stated route: the text does not say whether it still needs its own row under the dependence test, or is discharged by appearing in the triggered row's sibling list | 2, claim 4 | "the text does not say whether a claim that also feeds a triggered row's required content is exempt from separately passing the dependence test" | No — the claim is `DEMANDED` either way; only the row it belongs to is open |
| F15 | A **design's citation to its own enumeration** is classified by neither rule: it is not a separate document, so the document sentence does not plainly reach it, and the judge rule defers what counts as secondary to the block, which the judge is not shown | 11, the twenty-controls premise | "it's not a separate document, and the text doesn't say whether a design's self-citation counts as primary or falls under the document rule" | No — not a key premise. **Note the direction:** this premise read `DEMANDED` at the first gate and `INCONCLUSIVE` now, because the amendment gave the reader two named states to classify against and this citation fits neither cleanly |

F15 is the honest cost of the amendment and is recorded as such rather than smoothed away: closing three key-premise gaps moved one non-key premise from a confident reading to an open one. The `live-path` trigger's "branch point" wording is also `INCONCLUSIVE` for Case 2 once its examples are stripped, which is the pre-existing ambiguity the first gate recorded, not a new one.

### What this pass does not claim

The two readers are different contexts and different models, so a verdict that moved is evidence about the **text** only where the reader quoted a sentence that did not exist before, which is the case for every key-premise movement in the table above. F14 and F15 are ambiguities in sentences the amendment introduced or re-framed, and they are reported, not argued away. No case was re-walked whose key premise did not turn on an amended sentence: Cases 1, 3–10, 13 and 14 keep their first-gate verdicts, and re-walking them with a different reader would produce movement that is reader variance rather than text.
