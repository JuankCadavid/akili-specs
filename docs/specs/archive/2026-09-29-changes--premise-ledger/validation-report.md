# Validation Report — Premise Ledger

**Verdict: archive-ready. 0 FAIL · 0 WARN open · 4 WARN resolved · 0 BLOCKED.** Every shipped surface still satisfies FR-1..FR-11 and NFR-1..NFR-8 at `HEAD` (`d3a2ee7`), and every global gate this validation re-ran independently is green. All four WARNs sit in the spec's own documents — a scenario heading the pivot overwrote, a budget figure whose parts do not sum, and a walkthrough section left at its first-gate reading. None of them touches packaged text. The fourth, the author ≠ auditor gap on the first pass, was resolved by a second independent pass on a different model that reproduced every finding and every gate.

| Area | Result |
|---|---|
| Tasks | **PASS** — 10/10 `[x]`, each with execution notes and Reviewer verdicts |
| Files | **PASS** — every file in design §4 / §7.1 edited; no packaged file added (275 files) |
| Build | **PASS** — `verify:cli`, `pack:dry-run`, `git diff --check` all exit 0 |
| Requirements | **PASS** on shipped text; **WARN** W1 on `requirements.md` itself |
| Design conformance | **PASS**; **WARN** W2 (figure), W3 (walkthrough staleness) |
| Process | W4 **resolved** — second pass on `fable`, which implemented no task |

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/premise-ledger` |
| Validated at | `d3a2ee7` (HEAD, `master`); last spec commit `2d005b2` |
| Date | 2026-09-29 |
| Validator model | Pass 1 `opus` (Opus 5.5); pass 2 `fable` (Fable 5.1), same day, gates and W1–W3 evidence re-run from scratch. Implementers: `opus` (T1, T3, T4, T6, T10 gates), `sonnet` (T5, re-walk reader). Reviewers: `fable`, `sonnet`, `opus` — see W4 |
| Inputs | `proposal.md`, `requirements.md`, `design.md`, `tasks.md`, `execution.md`, `walkthrough.md`. No `test-report.md` — prose-only spec; `walkthrough.md` is its behavioral evidence (tasks.md §2 global caveat) |
| Constitutional docs | `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, `docs/specs/general-setup/` do not exist in this repo (it packages the methodology) — recorded in `requirements.md` §1, not a gap |
| Release state | Shipped in **v2.26.0** (2026-09-19) as `minor`; carried in v2.27.0 |

## 2. Summary

The Premise Ledger is defined once in `/akili-specify` Step 2.2 and cited by name from `judgment-day`, `/akili-propose`, `/akili-constitution`, Step 1.2 / 2.1 / 2.5 and four mirrors. The judge rule's reach clause (T8) and the widened `shared-state` trigger (T9) survive at HEAD. Later specs (`review-intensity-routing`, `opus-5-5-rebaseline`) edited `akili-specify.md`, `akili-constitution.md`, `README.md`, `docs/flow.md` and three mirrors after `2d005b2`; re-reading each premise-ledger site at HEAD shows none was reverted or contradicted.

## 3. Task Completion

| Task | Status | Evidence | Result |
|---|---|---|---|
| T1 Block + item 11 | `[x]` | 7 checks + falsifier executed on scratch copy | PASS |
| T2 Step 1.2 · 2.1 · 2.3 · 2.5 · checklist | `[x]` | 6 checks | PASS |
| T3 `judgment-day` rule | `[x]` | 6 checks | PASS |
| T4 Blast Radius | `[x]` | 6 checks | PASS |
| T5 Constitution clause | `[x]` | 3 checks | PASS |
| T6 Mirrors · flow · CHANGELOG | `[x]` | 5 checks + parity read | PASS |
| T7 Closure gate | `[x]` | Failed first pass → Pivot (Option B) → closed by T10 | PASS |
| T8 Reach clause | `[x]` | 6 checks | PASS |
| T9 `shared-state` trigger | `[x]` | 6 checks, 3 Reviewer verdicts | PASS |
| T10 Re-gate | `[x]` | Gates re-run, 3 cases re-walked — §3 update incomplete (W3) | PASS with W3 |

Budget tripwire fired on review rounds (15 vs 12) and rework (4 vs 2); escalated in `walkthrough.md` §6 and `execution.md`. Recorded, not a validation finding.

## 4. File Existence

| Design §4 / §7.1 file | At HEAD | Premise-ledger content present |
|---|---|---|
| `.claude/commands/akili-specify.md` | ✓ | "Premise Ledger" ×11; `condition or signal` at `:300` |
| `.claude/commands/akili-propose.md` | ✓ | `### Blast Radius` at `:204`; 4 owner hits, all one section |
| `.claude/commands/akili-constitution.md` | ✓ | Step 7 item 2 at `:317` |
| `.claude/skills/judgment-day/SKILL.md` | ✓ | rule at `:26–:38`; `version: "1.9"`; Integration row `:79` → Step 2.5 |
| `docs/commands/akili-{specify,propose,constitution}.md`, `docs/skills/judgment-day.md` | ✓ | "Premise Ledger" ≥ 1 each |
| `docs/flow.md` | ✓ | `:111` "blast radius" |
| `CHANGELOG.md` | ✓ | `[2.26.0]` lines 37–43 |

## 5. Build Integrity

| Command | Exit | Reading |
|---|---|---|
| `npm run verify:cli` | 0 | 11 commands · 24 skills · 7 resources (v2.27.0) |
| `npm run pack:dry-run` | 0 | total files: 275 |
| `git diff --check` | 0 | — |

## 6. Requirement Coverage

Global gates re-run independently at HEAD (repo root; worktree excluded — see note):

| Gate | Command (abridged) | Result |
|---|---|---|
| (a) Frozen paths | `git show --stat` of every `[SPEC:changes/premise-ledger]` commit, limited to `akili-execute.md`, `akili-test.md`, `.claude/templates`, `.claude/skills/tdd`, `bin`, `scripts`, `package.json` | **0 lines** — PASS. (Later specs edited some of these paths; this spec did not) |
| (a) Falsifiability block | 8-line block from `571edaf` vs HEAD, `diff` | **identical** — PASS |
| (b) Defined once | files carrying `` `live-path` `` / `` `shared-state` `` / `` `data-env` `` | only `akili-specify.md` and its mirror — PASS |
| (c) Marker bytes | every `UNVERIFIED [—–-] confirm…` under `.claude`, `docs/commands` vs `akili-execute.md` | 0 non-matching — PASS |
| (d) Held-out slugs | 7 slugs over `.claude docs README.md CHANGELOG.md AGENTS.md`, spec folders excluded | **0** — PASS |
| (e) Rules by class | product/corpus names over the four packaged files | **0** hits — PASS |
| FR-8 stale pointers | `grep -rnE "Step 2\.3 — \*\*Review Design\|opt-in Step 2\.4 pass"` | **0** — PASS |
| FR-9 one owner | `grep -c "Impact & Scope\|impact/scope" akili-propose.md` | **0**; 4 "Blast Radius" hits, one section — PASS |
| NFR-6 vocabulary | `grep -n -i ledger judgment-day/SKILL.md` | pre-existing "frozen/findings ledger" hits intact; every added hit reads "Premise Ledger" — PASS |

**Grep-hazard note (reproduced).** My own first run passed the exclude flags through an unsplit zsh variable and reported 4 `impact/scope` hits — all inside `.claude/worktrees/authorship/`. Re-run with literal flags: 0. This is exactly the environment path `tasks.md` §2 warns about; the shipped result is 0.

**Scenario-level coverage.** `tasks.md` §3 maps every scenario and every `AND IT MUST` / `BUT` clause to a named task, with clauses quoted. Cross-checked against the shipped block, rule and template: every clause has a demanding sentence in shipped text. Behavioral evidence is `walkthrough.md` §3 + §8: 14/14 cases reach their key premise after the amendment, both negative controls demand 0 blast-radius rows.

| Requirement | Shipped evidence | Result |
|---|---|---|
| FR-1 | Step 2.2 item 11; block row shape, dependence test, stated-empty, every depth | PASS |
| FR-2 | class table, trigger table (amended), sibling definition, dispatch chain | PASS — **W1** on the requirements text |
| FR-3 (a)–(e) | block citation rules, each with a falsifier | PASS |
| FR-4 | `UNVERIFIED` paragraph; hand-off incl. "All other classes have no hand-off" | PASS |
| FR-5 | Step 2.1 paragraph, Step 2.5 count line + recommendation (non-blocking), 4 checklist items | PASS |
| FR-6 | Step 1.2 bullet; `/akili-propose` Step 2 sentence — both cite the block | PASS |
| FR-7 | Hard Rule: 3 actions, reach clause, 6-row severity table, read-only, protocol unchanged | PASS |
| FR-8 | Integration row + Step 2.3 name Step 2.5 **Review Design** by option name | PASS |
| FR-9 | Blast Radius: 4 checks, *Already fixed?* first, all branches + ticket ID, one owner | PASS |
| FR-10 | Step 7 item 2 cites the block, no class tokens | PASS |
| FR-11 | 4 mirrors, flow line, CHANGELOG `minor` | PASS |
| NFR-1..8 | gates above; NFR-2 row counts and NFR-7 read in `walkthrough.md` §5, §7 | PASS |

## 7. Linting & Code Quality

No linter applies to prose. `git diff --check` is clean.

**4R advisory sweep (advisory — does not drive the verdict).** Carried forward from `execution.md`, all still true at HEAD, none acted on:

| Source | Lens | Advisory |
|---|---|---|
| T1 | Readability | Rule (c)'s falsifier omits "label" (FR-3(c) names it); the obligation still holds through rule (d) |
| T2 | Readability | Step 2.5 prints the count line but not the trigger line (FR-5 does not ask for it) |
| T4 | Readability | Bug Track bullet says "with its citation as run and its result" — omits the `UNVERIFIED` alternative the template carries |
| T4 | Readability | `/akili-propose` Step 2 paraphrases the dependence test as decision-only (block says decision / task / scope) |
| T6 | Readability | CHANGELOG `judgment-day` bullet says bare "ledger" twice; "run after the diagnosis" reads ambiguously |
| Walkthrough F9 | Risk | No deployed-revision comparison in the Blast Radius — recorded as input to `budget-and-concurrency` |
| Walkthrough F14, F15 | Reliability | A claim that also feeds a triggered row has no stated route; a design citing its own enumeration is classed by neither rule |

## 8. Design Conformance

Shipped text matches design §5.1–§5.8, §7.1 rows 1–22, DD-1..DD-15. Findings:

**W1 — `requirements.md` FR-2: the pivot overwrote a scenario heading and moved its citation.** Pivot commit `f93f7d7` replaced `#### Scenario: Fix on a versioned path (bugfix--evidence-storage-link-validation.md, KZ-EVL-1)` with the new *Sibling block on the same condition* heading. Result at `requirements.md:152–163`: the versioned-path GIVEN/WHEN/THEN now sits headless under the sibling-block scenario, and the sibling-block `BUT` clause cites `KZ-EVL-1`. The corpus source (`bugfix--evidence-storage-link-validation.md:25`) and the proposal (`:33`, "Code not on the live path") both make KZ-EVL-1 a **live-path** lesson. The shipped block cites it correctly under `live-path` (`akili-specify.md:299`). `tasks.md` T1 and §3 still reference the *versioned path* scenario, which no longer exists by name. Shipped text is unaffected; the spec document asserts a false attribution.

**W2 — cross-document figure: the re-sized budget does not sum.** `design.md` §13 reads "**~160** — 126 shipped through T6, plus ~10 for the two amendments". 126 + ~10 = ~136, not ~160. `tasks.md` §4 repeats it ("~160 shipped (126 through T6, ~10 in the amendment)"), and its own per-task column sums to ~158. `walkthrough.md` §6 then measures 132 against ~160 ("18% under"). Against the stated parts (~136) the actual is ~3% under. The approved figure is not wrong as an approval record, but its stated derivation contradicts it.

**W3 — `walkthrough.md` §3 and §7 left at their first-gate reading.** T10's scope says to update "§3's three rows and the headline counts, §7's success-criterion 2". At HEAD:

- §3 headline still reads "11 of 14 on the primary key bullet… disqualifier fires on four counts", and rows 2, 11, 12 still show `INCONCLUSIVE`, with no pointer to §8.
- §7's table row 2 was updated to "Met after the amendment", but the closing sentence below it still reads "**Five of six met; criterion 2 is not.** … the judge rule, as shipped, does not reach the case" — which now contradicts its own table.
- §7 row 1 still says "Held-out Case 2 reaches only its supporting bullet".

The file's lead verdict and §8 are correct. A reader entering at §3 or §7 gets the superseded reading.

**Constitution Impact:** `execution.md` records no `## Constitution Impact` notes; no module or guide was created or reshaped — nothing to sync.

## 9. Test Evidence Summary

No `test-report.md`: prose-only spec, `Red run: n/a (no test gate)` on every task. Behavioral evidence is `walkthrough.md`:

| Evidence | Reading |
|---|---|
| First gate (T7) | 11/14 key premises; F1, F2, F3 → Pivot |
| Amendment pass (T10) | Cases 2, 11, 12 all `DEMANDED` by a fresh reader on a different model; F1–F3 closed |
| Mutation falsifier | Executed — deleting the `shared-state` trigger row flips Case 2 (`walkthrough.md` §4) |
| Negative controls | 0 blast-radius rows on both (NFR-2) |
| Known-hard case 5 | `DEMANDED` with a recorded caveat |

## 10. Agent Guide / Constitution Impact

None recorded, none required. No `CLAUDE.md` / `AGENTS.md` / `## Module Guides` change is pending for `/akili-archive`.

## 11. Remediation

| # | Level | Fix | Touches shipped text? |
|---|---|---|---|
| W1 | **Fixed 2026-09-29** | `requirements.md`: restore `#### Scenario: Fix on a versioned path (bugfix--evidence-storage-link-validation.md, KZ-EVL-1)` above the orphaned GIVEN at `:160`; strip the `(bugfix--evidence-storage-link-validation.md, KZ-EVL-1)` citation from the sibling-block `BUT` clause (its true source is held out, so the clause stays uncited). Correction closure: grep `KZ-EVL-1` and `versioned path` across the spec folder | No |
| W2 | **Fixed 2026-09-29** (annotated, figure kept) | `design.md` §13 and `tasks.md` §4: keep ~160 as the approved figure and annotate that its stated parts sum to ~136 — do not rewrite the figure, since `walkthrough.md` §6 reads against it | No |
| W3 | **Fixed 2026-09-29** | `walkthrough.md`: mark the §3 headline and rows 2 / 11 / 12 "superseded at the amendment pass — see §8"; replace §7's closing sentence with "Six of six met — criterion 2 after the amendment (§8)"; append the §8 result to §7 row 1 | No |
| W4 | Resolved | Pass 2 ran on `fable`, which implemented no task: frozen paths 0, Falsifiability block identical (8 lines), held-out slugs 0, class tokens in two files only, one marker variant (5 hits), stale pointers 0; W1–W3 reproduced at the cited lines. Residual: `fable` was also the execution Reviewer on T1–T7, so pass 2 is independent of the authors, not of the earlier review | No |
| — | Process note | The spec shipped in v2.26.0 before validation ran. Nothing in this report changes packaged text, so no patch release is implied | — |

## 12. Archive Readiness Recommendation

**Ready for `/akili-archive changes/premise-ledger`.** W1–W3 were corrected in the spec documents on 2026-09-29 with correction closure run in both directions: `versioned path` is referenced by `tasks.md` (T1, §3) and `execution.md` (T1), all of which are true again with the heading restored; `KZ-EVL-1` now appears only on the live-path scenario and in `proposal.md`. All tasks are `[x]`, no FAIL remains, the shipped text holds at HEAD, and the closure gate's evidence is intact. W1 and W3 are cheap document corrections and worth making before archive: an archived spec's scenario index and closing evidence are what the next spec cites.
