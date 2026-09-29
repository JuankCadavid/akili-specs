# Tasks: Re-baseline AKILI for Claude Opus 5.5

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/opus-5-5-rebaseline` |
| Depth | **Standard** |
| Status | **Approved** (user, 2026-09-29) |
| Date | 2026-09-29 |
| Source | `requirements.md` (FR-1..FR-7, NFR-1..5), `design.md` (budget §9: 4 tasks · ~75 lines · 6 review rounds), `judgment.md` (JD-1..3 fixed) |
| Baselines | Every count below was **run at `31b6d31` before it was written**. B1: start-high obligation grep (§T1) → **2** (`model-routing.md:363`, `:401`). B2: `Opus 5` present-tense grep → lines `103,104,188,272,363,392`. B3: `Opus 5\.5` in `model-routing.md` → **0**. B4: `Don't stop short` in `implementer/tester/reviewer/leader.md` → **0/0/0/0**. B5: `continuation` in `akili-execute.md` → **0**. B6: `time signal\|elapsed` (case-insensitive) in `model-routing.md` → **0**. B7: `AKILI-measured` → **0**. B8: `prompting-claude-opus-5-5` in `model-routing.md` → **0** |
| Commit prefix | `[SPEC:changes/opus-5-5-rebaseline]` |

## 2. Task Graph

```
T1 (model-routing.md: FR-1, FR-2, FR-3, FR-6) ─┐
T2 (implementer.md + tester.md: FR-4)          ├─→ T4 (CHANGELOG + closure sweep)
T3 (akili-execute.md item 0 + /goal: FR-5)     ─┘
```

T1, T2 and T3 touch disjoint files, so they are **parallel-safe** (a width of 2–3 fits the Delegation Ceiling). T4 depends on all three.

**Scope discipline (every task, NFR-1).** Zero hunks in `bin/`, `scripts/`, `package.json`, `.claude/templates/reviewer.md`, `.claude/templates/leader.md`, `.claude/commands/akili-constitution.md` and `docs/commands/`. Any hunk there is a FAIL regardless of content.

---

### T1: `docs/model-routing.md` speaks for Opus 5.5

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Review | `full`: rewrites load-bearing routing guidance, and **replaces delivered guidance** (DD-1, the reversion challenge was run) |
| Depends on | none |
| Requirements | FR-1 (all five bullets, provenance, the AKILI-measured line); FR-2 (every present-tense `Opus 5` site; history kept); FR-3 (values frozen, a pointer added); FR-6 (all three bullets, no persona reference); NFR-2, NFR-4, NFR-5 |
| Design refs | DD-1 (7-point content order, kept points (a)/(b), the reversion outcome), DD-2 (the site table including `:275` and `:374–375`), DD-3 n/a, DD-5, §4 |

**Scope.** Edit `docs/model-routing.md` only:

- **`:401` *Opus specifics*:** rewrite in place with DD-1's 7 points, in order. Keep the rework-bump point and the `max`-for-critical point. Every vendor figure carries the source URL (`https://platform.claude.com/docs/es/build-with-claude/prompt-engineering/prompting-claude-opus-5-5`) and `2026-09-29`. The status line reads `AKILI-measured: none yet (2026-09-29)`.
- **`:360–375` re-baseline paragraph:** the vendor sentence at `:363` names Opus 5.5 (`medium`) as current and Opus 5's `xhigh`/`high` as the previous generation. **The reconciliation's premise changes**: the vendor now also starts at `medium`, so the paragraph must stop saying the vendor "starts higher", and must state that AKILI's T1/T3 `high` defaults await the sweep. `:374–375` keeps its values, and its justification no longer leans on Opus 5 numbers (DD-2).
- **`:103–104`:** keep the Opus 5 worked example and add a clause saying the same held for Opus 5.5.
- **`:275`:** add a clause saying the `xhigh`/`max` escalation trial is the measured-gain case.
- **`:392`:** "resolves to Opus 5" → "resolves to Opus 5.5".
- **`:350` role table:** values untouched. One pointer sentence: family deviations live in *Sonnet specifics* / *Opus specifics*.
- **New subsection** *Time signals (harness capability, optional)*, placed before `## Review intensity`, with DD-5's content.

**Verification** (repo root).

| Field | Value |
|---|---|
| Command | **1.** `grep -rnE 'start(s)? high\|iterate \**down\|sweep down' --include='*.md' .claude docs README.md \| grep -v '^docs/specs/'` → **0** (B1 = 2). **2.** `grep -nE 'Opus 5([^.0-9]\|$)' docs/model-routing.md`: read every hit and class it as history or as an explicit previous generation. Zero present-tense. **3.** `grep -c 'Opus 5\.5' docs/model-routing.md` ≥ 3 (B3 = 0). **4.** `grep -c 'AKILI-measured' docs/model-routing.md` = 1 (B7 = 0). **5.** `grep -c 'prompting-claude-opus-5-5' docs/model-routing.md` ≥ 2 (Opus notes + time signals; B8 = 0). **6.** `grep -ciE 'time signal\|elapsed' docs/model-routing.md` ≥ 2 (B6 = 0). **7.** Values frozen: `git diff 31b6d31 -- docs/model-routing.md` shows the table rows `:352–356` byte-identical. **8.** `grep -rn "elapsed" .claude/templates .claude/commands` → 0 (FR-6: no persona or command reference) |
| Falsifier | Checks 1 and 3–6 fail on `31b6d31` (all were run: B1 = 2, B3/B6/B7/B8 = 0). **Executed falsifier required:** on a scratch copy of the edited file, re-insert the sentence "start high and iterate down" into *Opus specifics*; check 1 must go to 1. Then change one value in the role table; check 7 must show a hunk. Observe both, then discard the copy |
| Red run | `n/a (no test gate)` |
| Disqualifier | Greps count strings, not meaning. **Read the rewritten `:360–375` paragraph whole** (KZ-changes--leader-brief-contract-1): if any sentence still implies the vendor starts higher than AKILI's T2 default, the reconciliation is false with every grep green. A time-signal subsection that omits the Reviewer exclusion or the "advisory, not a hard stop" clause meets check 6 and fails FR-6 |
| Consumers | Readers of the *Effort dial*: `leader.md:26`, `reviewer.md:7`, `tester.md:17`, `akili-test.md:111,123`, `akili-execute.md:148,172`, `akili-constitution.md:554`. All of them read the **role defaults** or the **rework bump**, which are unchanged (P-3, P-11), so **no edit is owed**. Confirm by reading each hit after the edit |

**Pre-review sweep** (KZ-changes--kaizen-loop-closure-2, keyed on the obligation). `grep -niE 'opus[^|]{0,40}(high\|xhigh\|max)\|vendor' docs/model-routing.md`: read every hit and confirm none restates the old Opus starting point in other words.

**Done.** All edits land, verification 1–8 run and quoted, the falsifier executed with both reds recorded, the `:360–375` paragraph read whole, consumers read.

**Skills:** `cognitive-doc-design`.

---

### T2: Workers name the premature stops

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Review | `full`: persona text is re-read on every spawn in every downstream project, and it sits beside the truthful-partial rule |
| Depends on | none |
| Requirements | FR-4 (every bullet; both scenarios, including *BUT must NOT proceed past a destructive-action confirmation* and *PRODUCT_BUG is not a premature stop*); NFR-3, NFR-4 |
| Design refs | DD-3 (content obligations, placement, the Tester's own-contract outcomes per JD-2), §7 anchor |

**Scope.**

- `.claude/templates/implementer.md` item 2: a new bullet whose lead-in is **"Don't stop short"**, placed directly **after** the *"Report completion only when it is actually complete"* bullet (`:24`) and before the Pivot-deferral bullet (`:25`). `:24` and `:25` are not edited.
- `.claude/templates/tester.md` item 4: a new closing bullet with the same lead-in, naming only the Tester's own outcomes (`PRODUCT_BUG`, a `FAIL` with `AUTOMATION_DEFERRED`, inner-loop exhaustion).
- Both bullets carry every DD-3 content obligation: the final message **is** the report and the turn does not resume without new input; the four shapes; status notes travel with the next action; the legitimate stops; the destructive-action carve-out.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c "Don't stop short"` → implementer **1**, tester **1**, reviewer **0**, leader **0** (B4 = 0/0/0/0). **2.** `grep -n FATAL_FAIL .claude/templates/tester.md` → 0 (JD-2). **3.** `git diff 31b6d31 -- .claude/templates/implementer.md` shows lines `:24` and `:25` unchanged. **4.** `git diff --stat 31b6d31 -- .claude/templates/` lists only `implementer.md` and `tester.md` |
| Falsifier | Check 1 fails on `31b6d31` (run: 0/0). **Executed falsifier required:** on a scratch copy of `tester.md`, append "or `FATAL_FAIL`" to the new bullet; check 2 must go to 1. Discard |
| Red run | `n/a (no test gate)` |
| Disqualifier | **No automated check can see a contradiction between the new bullet and `:24`** (requirements §8, row 4). Reviewer walk, term by term: the new bullet must not (a) forbid the truthful partial with a named blocker, (b) tell a Tester to keep fixing the test when the fault is a `PRODUCT_BUG` (item 4's fail-fast rule), (c) override "escalate to the Leader only when two readings would produce materially different work" (`:23`), or (d) omit the destructive-action carve-out. A bullet that carries all four shapes and fails any of (a)–(d) passes check 1 and fails FR-4 |
| Consumers | `changes/scoped-constitution-reads` edits `:14` of both files (P-7). Confirm after the edit that `:14` is byte-identical to `31b6d31` in both files |

**Pre-review sweep.** Read implementer item 2 and tester items 3–4 **whole**, together with the tester output contract (`STATUS: PASS/FAIL/PRODUCT_BUG`).

**Done.** Both bullets land, verification 1–4 run, the falsifier executed, the (a)–(d) walk recorded in the report.

**Skills:** `cognitive-doc-design`.

---

### T3: The Leader's `Not Done` handling is split, ordered and bounded

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Review | `full`: edits the loop's completion gate and the unattended turn bound |
| Depends on | none |
| Requirements | FR-5 (the three rows; precedence for mixed content; the cap of 2; no attempt consumed; no budget round; recorded in `execution.md`; the `/goal` provision; all three scenarios, including *gated unchanged* and *BUT must NOT re-send the judgment call as work*) |
| Design refs | DD-4 (the table, the precedence per JD-3, accounting, "why 2", the unattended turn budget), §5 (the `continuations:` line), P-4, P-6, P-13 |

**Scope.** Edit `.claude/commands/akili-execute.md` only:

- **Step 2.3 item 0 (`:223`):** keep the existing first sentence and the `[x]`-blocking sentence. Add the three-row split, the precedence order, the cap of 2 under `pre-approved` with `[~]` on the third, the accounting (not an attempt, not a runtime event, not a budget round), and the `continuations: <n> (<items>)` line. `gated` behavior stays word-for-word what it is today.
- **Step 5 Unattended Mode `<N>` formula (`:322`):** add `+ 2 continuations per task`.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c "continuation" .claude/commands/akili-execute.md` ≥ 3 (B5 = 0). **2.** `grep -n "2 continuations" .claude/commands/akili-execute.md` → hits in item 0 **and** at the `<N>` formula. **3.** `git diff 31b6d31 -- .claude/commands/akili-execute.md` shows the Accounting rule (`:64`) and the Budget Tripwire (`:257`) unchanged. **4.** `git diff --stat 31b6d31 -- .claude/commands/` lists only `akili-execute.md` |
| Falsifier | Check 1 fails on `31b6d31` (run: 0). **Walk falsifier required:** walk the three FR-5 scenarios plus one **held-out** case the requirements do not cite: a `Not Done` field holding **only** an inconclusive verification under `pre-approved`. The shipped text must route it to "never a continuation"; a reading that re-spawns it is a FAIL |
| Red run | `n/a (no test gate)` |
| Disqualifier | Read the amended item 0 **against** the Accounting rule (`:64`, *"and by nothing else"*), the runtime-event enumeration (`:62`) and `:380` (judgment JD-4: item 0's obligation is restated there). If any sentence can be read as a continuation consuming an attempt, being a runtime event, or letting a gap reach `[x]`, the text is ambiguous whatever the greps say |
| Consumers | `:380` restates item 0's `[x]`-blocking obligation. It stays true; confirm by reading it. `/akili-resume` and `kaizen` read `execution.md` as prose (P-10), so no edit is owed |

**Pre-review sweep.** `grep -n "re-spawn\|Not Done" .claude/commands/akili-execute.md`: read every hit.

**Done.** Both edits land, verification 1–4 run, four cases walked (the three scenarios plus the held-out one) with the deciding sentence quoted, the disqualifier read.

**Skills:** `cognitive-doc-design`.

---

### T4: CHANGELOG and closure sweep

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | XS |
| Review | `checklist`: one CHANGELOG paragraph plus mechanical re-runs |
| Depends on | T1, T2, T3 |
| Requirements | FR-7; NFR-1 (bounded surfaces across the whole spec), NFR-5 (the final obligation sweep); proposal Success Criteria 1–5 |
| Design refs | §2, §9, DD-6 |

**Scope.** `CHANGELOG.md` → `Unreleased`: replace the `No unreleased changes yet` placeholder with a `### Changed` entry covering the Opus 5.5 recalibration, the "don't stop short" worker rule, the bounded `Not Done` continuation and the time-signal note, in user terms, with no internal IDs.

**Verification.**

| Field | Value |
|---|---|
| Command | **1.** `grep -c "No unreleased changes yet" CHANGELOG.md` → 0. **2.** Re-run T1 checks 1–2, T2 check 1 and T3 check 1 on the final tree. **3.** `git diff --stat 31b6d31` lists exactly: `CHANGELOG.md`, `docs/model-routing.md`, `.claude/templates/implementer.md`, `.claude/templates/tester.md`, `.claude/commands/akili-execute.md`, plus `docs/specs/changes/opus-5-5-rebaseline/**`. **4.** `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` all pass |
| Falsifier | Check 1 reads 1 on `31b6d31`. Check 3 fails if any frozen path appears (a hunk in `reviewer.md` is the likeliest one) |
| Red run | `n/a` |
| Disqualifier | A CHANGELOG entry that claims the Opus 5.5 defaults were **measured by AKILI** contradicts NFR-2 and the `AKILI-measured: none yet` line, whatever the greps say |
| Consumers | `scripts/release.js` reads `Unreleased` at release time. It is a release-time consumer, and no edit is owed here |

**Done.** Entry written, checks 1–4 run and quoted, Success Criteria 1–5 each ticked with its evidence.

**Skills:** `cognitive-doc-design`.

---

## 3. Coverage (scenario and clause granularity)

| Requirement · scenario / clause | Owner |
|---|---|
| FR-1 · all five bullets, provenance, the AKILI-measured line; scenario *A Leader sets a worker's effort*, incl. *AND IT MUST see vendor-measured* and *BUT must NOT find start-high* | T1 (checks 1, 4, 5 + disqualifier) |
| FR-2 · *every hit reads as history*; *AND IT MUST name Opus 5.5*; *BUT must NOT delete the worked example* | T1 (checks 2, 3; the `:103` edit keeps the example) |
| FR-3 · values kept; pointer; *BUT must NOT receive an Opus-derived `medium`* | T1 (check 7) |
| FR-4 · shapes, legitimate stops, notes-with-action, carve-out; *Implementer mid-task*, incl. *AND IT MUST allow a truthful partial* and *BUT must NOT proceed past a destructive confirmation*; *Tester PRODUCT_BUG*, incl. *BUT must NOT be read as premature* | T2 (check 1 + the (a)–(d) walk) |
| FR-5 · three rows, precedence, cap, accounting, record, `/goal`; *stops short twice*, incl. *AND IT MUST record* and *BUT must NOT decrement*; *gated unchanged*; *mixed report*, incl. *AND IT MUST carry verbatim* and *BUT must NOT re-send* | T3 (checks 1–3 + the four-case walk) |
| FR-6 · harness-injected, Reviewer exclusion, advisory; *BUT personas must NOT reference* | T1 (checks 6, 8 + disqualifier) |
| FR-7 | T4 |
| NFR-1 | Each task's scope-discipline check; T4 check 3 |
| NFR-2 | T1 check 5; T4 disqualifier |
| NFR-3 | T2 Consumers (`:14` byte-identical) |
| NFR-4 | The T1/T2/T3 disqualifiers (whole-paragraph reads) |
| NFR-5 | The T1/T3 pre-review sweeps; T4 check 2 |

No `skip-eligible` task: every task edits a rule document that is re-read on every spawn or every run.
