# Tasks: Gate Falsifiability

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/gate-falsifiability` |
| Depth | Standard |
| Type | Change |
| Approval Mode | `gated` |
| Status | Approved — ready for `/akili-execute` |
| Date | 2026-09-18 |
| Budget (design §11) | 5 tasks · ~120 LOC (prose) · 1 review round per task — trip on the second FAIL of any one task |
| Design review | Step 2.3 reversion challenge not triggered (no reverting DD); `judgment-day` not requested at Phase 2 (user chose Continue) |
| Format precedent | `docs/specs/archive/2026-09-18-changes--kaizen-loop-closure/tasks.md` |
| Dogfooding | Every task below carries the four Verification fields this spec introduces (`Falsifier`, `Red run`, `Disqualifier`, `Consumers`) with the absent-value rule |

## 2. Task Graph

```
T1 (akili-specify.md: Step 1.2 rows · field list · Falsifiability block · presence clause · checklist)
T2 (tdd SKILL.md: +2 anti-patterns · red-on-assertion · evidence row)          } T1 ∥ T2 ∥ T3 — disjoint files
T3 (akili-constitution.md: Step 7 item 3 task.md description)
        │
T1,T2,T3 ──→ T4 (mirrors + CHANGELOG) ──→ T5 (closure greps + parallel-safety diff + retro-fit walkthrough + packaging)
```

T1/T2/T3 are parallel-safe (different files, prose only, no shared build output). T4 mirrors final text. T5 is the global gate. No circular dependencies.

**Global verification caveat.** Every grep below is a **presence-assertion**: it proves text landed, not that an author following it writes a falsifiable gate. Prose executability has no automated check (accepted residual, `requirements.md` NFR-6) — the behavioral substitute is T5's retro-fit walkthrough. **A task may not report PASS on grep-green alone where its Done criteria name a walkthrough clause.**

**Grep hazard (all tasks).** Exclude `.claude/worktrees/`, `docs/specs/archive/`, and this spec's own folder, which quotes both the superseded and the new phrasings.

**Environment path that could pass for the wrong reason (all grep tasks).** A grep run from inside the spec folder or against a stale worktree reports the wrong tree; every grep is run from the repo root with explicit exclusions.

---

### T1 — `/akili-specify`: Falsifiability block, fields, defect-class rows, checklist

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L |
| Depends on | none |
| Requirements | FR-1 (both scenarios: mutation + diverging rows recorded; `BUT NOT` accept a named-only mutation), FR-2 (both scenarios: red rejected on timeout/intercept; deferred timing required; `BUT NOT` "was red" satisfies Bug Mode), FR-3 (both scenarios: source lock paired; geometry vs clipping ancestor; `BUT NOT` count green fragment tests), FR-4 (scenario + `AND IT MUST` falsifier), FR-5 (both scenarios; `BUT NOT` owner-suites-only; `AND IT MUST NOT` assert no coverage without the grep), FR-6 (three scenarios; `BUT NOT` font-timing as regression), FR-7 (specify half: field list + absent-value rule; `BUT NOT` omit a field), FR-9, FR-10 (block/table/checklist agree; KZ-006 lead unchanged; `BUT` no "named input alone is evidence" sentence), NFR-1 (≤ ~25 lines), NFR-2, NFR-5 |
| Design refs | §3 rule shape, §5, §7 rows 1–5, DD-1..DD-4 |

**Scope.** Edit `.claude/commands/akili-specify.md`, by section (never by line):
- **Step 1.2 defect-class table** — two rows per design row 1.
- **Step 3.2 "Each task should include"** — after `tests`: the four Verification fields, named, with a pointer to the block by name.
- **Step 3.2, the KZ-006 bullet ("name the input that would make the check fail")** — keep its text byte-identical; append the **Falsifiability** sub-list beneath it: (1) expressible falsifier — mutation *and* diverging fixture rows (`changes--toc-center-guard` KZ-2 in the parenthetical); (2) assertion-level red run — setup/intercept/timeout/synchronous-mock reds are not reds (`bugfix--confirm-submission-title-and-disclaimer`); (3) real-artifact lock — static source read or rendered geometry; visibility near a clipping ancestor is a rect comparison (`changes--sp-shell-app-viewport` KZ-3; `bugfix--reporting-table-actions-clipped` KZ-RTA-2); (4) compile gate — when the compiler is stricter than the runner, the build/type-check command joins the Verification of tasks assigning into typed contracts (`bugfix--lead-center-full-catalog` KZ-1); (5) Consumer Sweep — one grep per changed shared symbol/DOM hook/event over unit, component, E2E incl. CI-excluded suites; never "no coverage exists" without the grep (`result-framework-reporting--programme-results-created-by-filter` KZ-1; `changes--sidebar-toggle-consolidation` KZ-STC-1); (6) rendered-measurement checklist — *only when a gate asserts size, overflow, visibility, position, or containment*: baseline · fonts · geometry-not-classes · ≥2 viewports incl. squeeze band · effective CSS px with zoom named · clip containment (`bilateral--ai-processing-feedback` L1; `changes--aow-identity-column-starvation` KZ-2). Each sub-rule ≤ 3 lines; the framework name only inside the parenthetical.
- **Step 3.2, the presence-assertion bullet** — text unchanged; one trailing clause citing the real-artifact-lock rule by name.
- **Verification Checklist** — two items: the four fields present on every task with the absent-value rule; every geometry gate satisfies the checklist.

**Verification** (repo root; hazard exclusions).
1. `grep -n "name the input that would make the check fail" .claude/commands/akili-specify.md` — exactly the pre-change hit, byte-identical (NFR-5). *Falsifier:* the bullet reworded or moved.
2. *(amended by the Leader at T1 attempt 1, 2026-09-18 — the original `grep -c` counts matching lines, not occurrences; the intent was occurrences at three sites)* `grep -o "Falsifier\|Red run\|Disqualifier\|Consumers" .claude/commands/akili-specify.md | wc -l` — ≥ 6, and `grep -n` shows hits in the "Each task should include" list, the block, and the Verification Checklist. *Falsifier:* the checklist still reading only "verification guidance that accounts for the negative scenarios" with no field names.
3. `grep -nE "Angular|Cypress|Tailwind|Jest|ts-jest|jsdom|ng build" .claude/commands/akili-specify.md` — every new hit inside `(...)`; pre-existing hits enumerated as untouched. *Falsifier:* a rule sentence containing `ng build` outside a parenthetical.
4. `git diff -U0 -- .claude/commands/akili-specify.md | grep -c "^+"` — ≤ ~30 added lines (NFR-1). *Falsifier:* a 60-line block.
5. `git diff --check` clean.

**Red run:** `n/a (no test gate)`. **Disqualifier:** greps 1–4 prove text landed, not that the block bites — read each sub-rule and confirm it names a defect class, a task obligation, and a corpus falsifier; a sub-rule missing any of the three is not done. If the diff touches any bullet other than the KZ-006 lead, the presence bullet, the field list, the table, and the checklist, stop and report. **Consumers:** `docs/commands/akili-specify.md` (mirror — T4), the Verification Checklist in the same file (T1), `/akili-execute` brief copy line (hand-off, DD-6 — not run here).

**Done.** All five sites land; KZ-006 lead byte-identical; verification 1–5 with disqualifiers; the block's six sub-rules each carry class + obligation + falsifier; retro-fit walkthrough queued for T5.

**Skills:** `cognitive-doc-design`.

---

### T2 — `tdd` skill: two anti-patterns, red on the assertion, evidence row

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Depends on | none |
| Requirements | FR-8 (scenario: red names its assertion; setup red reported as not-a-red; `AND IT MUST` keep the existing three anti-patterns and seam rules), FR-2 (loop half), FR-10 (`tdd` agrees with the block's names) |
| Design refs | §5 anti-pattern table, §7 rows 6–8, DD-5 |

**Scope.** Edit `.claude/skills/tdd/SKILL.md`: Anti-patterns +2 bullets (inert fixture — tell: mutate the logic, still green; plumbing test — tell: delete the feature from the real file, still green), same voice as the existing three; Rules of the loop — "Red before green" gains the assertion-level clause; AKILI Integration "Verification evidence" row — the cited red names what it failed on; a red that failed in setup is reported as not-a-red. Frontmatter `description:` untouched (triggers unchanged — DD-9 precedent).

**Verification.**
1. `grep -c "^- \*\*" .claude/skills/tdd/SKILL.md` under Anti-patterns — 5 (was 3). *Falsifier:* 3 or 4.
2. `grep -n "Inert fixture\|Plumbing test\|fails on the behavioral assertion\|failed on" .claude/skills/tdd/SKILL.md` — hits in Anti-patterns, Rules of the loop, and the AKILI Integration table. *Falsifier:* the evidence row still reading only "a test that was never seen red is not TDD evidence".
3. `git diff -U0 -- .claude/skills/tdd/SKILL.md | grep -n "^[-+]description:"` — zero. *Falsifier:* any change to the description.
4. `git diff --check` clean.

**Red run:** `n/a`. **Disqualifier:** grep 1 counts bullets, not content — read the two new bullets: each must state the pattern and its *tell* in the imperative the file uses; a bullet without a tell is not done. If any of the three existing anti-patterns or the seam paragraph changed, stop. **Consumers:** `docs/skills/tdd.md` (T4); `/akili-execute` brief cites the skill by name (no change).

**Done.** Five anti-patterns; loop rule; evidence row; description byte-identical; greps 1–4 green.

**Skills:** `cognitive-doc-design`.

---

### T3 — `/akili-constitution`: `task.md` template description names the fields

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Depends on | none |
| Requirements | FR-7 (constitution half: the four fields + absent-value rule in the template description), NFR-3 (no migration) |
| Design refs | §7 row 9, DD-2 |

**Scope.** Edit `.claude/commands/akili-constitution.md` Step 7 item 3 only: the `task.md` description gains a clause naming the four Verification fields and the absent-value rule (`n/a (no test gate)`, `none (no shared symbol changed)`), citing `/akili-specify` Step 3.2's Falsifiability block by name. One item, ≤ 3 lines. No other Step 7 item changes.

**Verification.**
1. `grep -n "Falsifier" .claude/commands/akili-constitution.md` — exactly one hit, inside Step 7 item 3. *Falsifier:* a hit in Step 8 (wrong home) or none.
2. `git diff --stat -- .claude/commands/akili-constitution.md` — one hunk, ≤ 3 changed lines. *Falsifier:* a second hunk.
3. `git diff --check` clean.

**Red run:** `n/a`. **Disqualifier:** grep 1 proves the word; read the item — it must name all four fields and both absent values, or it is not done. **Consumers:** `docs/commands/akili-constitution.md` (T4); scaffolded projects (no migration — NFR-3).

**Done.** Item 3 names the fields; one hunk; greps green.

**Skills:** `cognitive-doc-design`.

---

### T4 — Mirrors and CHANGELOG

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T1, T2, T3 |
| Requirements | FR-10 (mirrors agree; framework neutrality in mirrors), NFR-4 (consumer-command mirrors untouched) |
| Design refs | §7 rows 10–11, DD-3 |

**Scope.** Bring `docs/commands/akili-specify.md` (Step 1.2 rows, the four fields, the Falsifiability block at summary altitude, the checklist items), `docs/skills/tdd.md` (five anti-patterns, red-on-assertion), and `docs/commands/akili-constitution.md` (Step 7 item 3 fields) to parity with the shipped text — no more, no less. `CHANGELOG.md` Unreleased: **Added** — Falsifiability block (six rules) in `/akili-specify` Step 3.2; four task Verification fields (specify list + constitution template); `tdd` anti-patterns inert fixture and plumbing test. **Notes** — release classification proposed **patch**; user may override.

**Verification.**
1. `grep -c "Falsifier\|Red run\|Disqualifier\|Consumers" docs/commands/akili-specify.md docs/commands/akili-constitution.md` — ≥ 4 and ≥ 1 respectively. *Falsifier:* a mirror naming three fields.
2. `grep -c "Inert fixture\|Plumbing test" docs/skills/tdd.md` — 2. *Falsifier:* 1.
3. `grep -nE "Angular|Cypress|Tailwind|Jest|ts-jest|jsdom|ng build" docs/commands/akili-specify.md docs/skills/tdd.md docs/commands/akili-constitution.md` — new hits only inside `(...)`. *Falsifier:* a mirror rule naming a framework.
4. `git diff --stat -- .claude/commands/akili-execute.md .claude/templates/ docs/commands/akili-execute.md` — empty (NFR-4). *Falsifier:* any hunk.
5. `git diff --check` clean.

**Red run:** `n/a`. **Disqualifier:** grep 1 finds words, not parity — per-file read of each mirrored section against the command; a mirror that over-claims (states a rule the command does not) or under-claims (drops one) is not done. Each CHANGELOG bullet names a surface T1–T3's diffs actually touched (KZ-002: check `git log --stat -3`). **Consumers:** none beyond the mirrors themselves.

**Done.** Three mirrors at parity; CHANGELOG entry; greps 1–5 green; consumer-command diff empty.

**Skills:** `cognitive-doc-design`.

---

### T5 — Closure gate: greps, parallel-safety diff, retro-fit walkthrough, packaging

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T4 |
| Requirements | FR-1..FR-6 (retro-fit walked), FR-10 post-edit scenario (framework grep; contradiction grep; no "named input alone" sentence), NFR-2, NFR-4, NFR-6 (residual discharged as far as a walkthrough can) |
| Design refs | DD-3, DD-7, §11 budget |

**Scope.** (a) Run at repo root: the framework grep (requirements §8 row 2) over the six changed files; the contradiction grep (§8 row 3); the parallel-safety diff (§8 row 5); enumerate every hit with a sanction. (b) **Retro-fit walkthrough** — as a literal reader of the **shipped** `/akili-specify` Step 3.2 and `tdd` text only (no memory of this spec), take five corpus entries read-only from `/Users/jcadavid/orca/workspaces/onecgiar_pr/qa-development-2026/docs/specs/kaizen/`: `changes--toc-center-guard.md` KZ-2 (inert fixture), `changes--sp-shell-app-viewport.md` KZ-3 (plumbing test), `bugfix--lead-center-full-catalog.md` KZ-1 (compiler-blind), `result-framework-reporting--programme-results-created-by-filter.md` KZ-1 (unswept consumer), `bilateral--ai-processing-feedback.md` L1 (baseline on a swipe strip). For each, reconstruct the gate as the entry describes it and state which shipped sentence rejects it at authoring time, quoted. A case no shipped sentence rejects is **INCONCLUSIVE** — reportable, never collapsed into PASS. Record in the scratchpad, not the repo; the Leader carries the record into `execution.md`. (c) `npm run verify:cli && npm run pack:dry-run && git diff --check`.

**Verification.**
1. Greps: zero unsanctioned hits; enumerated. *Falsifiers:* named in requirements §8 rows 2, 3, 5.
2. Walkthrough: five cases, each with a quoted rejecting sentence or INCONCLUSIVE; any INCONCLUSIVE is a FAIL for the spec, escalated to the user. *Falsifier:* the toc-center-guard fixture (one "Other" center) admitted by the shipped wording of rule (1).
3. Packaging exit 0 ×3; working tree clean.

**Red run:** `n/a (walkthrough, not a test)`. **Disqualifier:** a walkthrough performed from memory of this spec proves nothing — quote the shipped sentence, not the design. Grep-green plus one INCONCLUSIVE is a FAIL, not a note. The five entries must be read at the source (KZ-001), not from the batch summaries in this spec's proposal. **Consumers:** none.

**Done.** Greps clean with enumerated sanctions; five cases each rejected by a quoted shipped sentence (or escalation); packaging green; no repo file written by this task.

**Skills:** `cognitive-doc-design`, `systematic-debugging` (only if a case is INCONCLUSIVE).

---

## 3. Coverage — scenario and clause level

| Requirement · scenario / clause | Owner |
|---|---|
| FR-1 single-element fixture (`BUT NOT` named-only · `AND IT MUST` rows) · every-row-pinned | T1 · T5 (toc-center-guard) |
| FR-2 red on intercept timeout (`BUT NOT` "was red") · race under sync mocks | T1 · T2 (loop half) |
| FR-3 fragment mirrored (`BUT NOT` 210 green) · visible but clipped | T1 · T5 (sp-shell-app-viewport) |
| FR-4 green tests, broken build (`AND IT MUST` falsifier) | T1 · T5 (lead-center-full-catalog) |
| FR-5 sibling pins key list (`BUT NOT` owner-only) · token-gated E2E (`AND IT MUST NOT` assert no coverage) | T1 · T5 (programme-results-created-by-filter) |
| FR-6 swipe strip baseline · missing icon font (`BUT NOT` timing as regression) · one viewport height | T1 · T5 (ai-processing-feedback) |
| FR-7 non-test gate (`BUT NOT` omit a field) — specify half · constitution half | T1 · T3 |
| FR-8 Implementer reports a red (`AND IT MUST` keep existing anti-patterns) | T2 |
| FR-9 two table rows | T1 |
| FR-10 post-edit sweep (`BUT` no "named input alone" sentence) | T1 · T4 · T5 |
| NFR-1 · NFR-2 · NFR-3 · NFR-4 · NFR-5 · NFR-6 | T1 · T1+T4+T5 · T3 · T4+T5 · T1 · T5 |

No gap is discharged by citing a different requirement; every row quotes the clause it owns.

## 4. Estimate and PR strategy

**Estimated LOC:** ~120 lines of prose across 11 surface rows (design §11).

**PR strategy: one PR.** The block, the fields, the template description, and the `tdd` tells describe one contract; the mirrors must land with them. Under ~400 LOC, prose-only. Review order for the PR description (`cognitive-doc-design`): T1's Falsifiability block first, then T2, then parity.

**Recommended first task:** T1, T2 and T3 in one wave (disjoint files); T1 is the largest and defines the names the mirrors copy.
