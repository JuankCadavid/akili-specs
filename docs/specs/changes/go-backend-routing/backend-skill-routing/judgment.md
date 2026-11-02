# Judgment Day — `changes/go-backend-routing/backend-skill-routing` design

## Transaction

| Field | Value |
|---|---|
| Target | `requirements.md` rev. 2 (incl. A-1) + `design.md` rev. 1, at `c5d8eb7` (immutable) |
| Mode | judgment_day, `/akili-specify` Step 2.5 **Review Design** (JC, 2026-11-02: "Aprueba A-1 y DD-7, y corre judgment-day") |
| Judges | Two blind read-only judges, Sonnet (author: Opus 5.5 — author ≠ auditor), identical scope and criteria |
| Round | 1 of 2 |
| State | **closed — fixed, not re-judged** (C-1, C-2, C-3, C-4, C-5, C-6, C-7, B-J-5, B-J-6, B-J-10) |

## Premise Ledger attack

| Judge | Confirmed | Incomplete | Not re-run |
|---|---|---|---|
| A | 18/18 reproduce | (P-5 per-file claim, A-J-7) | none |
| B | 15/18 exact | P-7, P-13, P-17 reproduce but miss readers | none |

Judge B ran baseline: `node --test` on install-cursor, design-skill-routing, design-skill-routing-coverage, golang-skill → 46 pass / 0 fail; `find .claude/skills -type f | wc -l` → 317.

## Frozen ledger — confirmed by both judges

| ID | Severity (A / B) | Finding | Judge refs |
|---|---|---|---|
| C-1 | severe / severe | Consumer readers missing: `test/design-skill-routing-coverage.test.js` slices Step 2.1 (`:69`, `:112`), Step 8D item 4 (`:120`), the policy block to `### Step 8E` split on `"\n- "` (`:135-136`) and the UI rule (`:151`); `test/golang-skill.test.js:126-137` slices specify Step 2.1 and constitution Step 5/8D. Item 5 lands inside the item-4 slices (`design-skill-routing.test.js:141`, `:213`; coverage `:120`) and inherits their no-stack-name / no-pointer assertions. No concrete break found | A-J-1, B-J-1 |
| C-2 | severe / severe | Expertise cards claim capabilities their cited heading does not state (FR-4 BUT): `error-handling-patterns` (philosophy/categories under *Core Concepts*; "propagation" not in body), `tdd` (*Seams*, *Anti-patterns*), `systematic-debugging` (*The Four Phases*), `aws-serverless` (*Anti-Patterns*, *Sharp Edges*), `software-architect` (agent patterns in *Routing* / `agentic-ai.md`), `golang-pro` (gRPC/REST in description only; layout in *Reference Guide*). DD-9's "taxonomy, propagation" rests on (a) | A-J-3, B-J-3 |
| C-3 | severe / warning | `test-first` vs `test-suite`: specify writes the line, but `tdd` is the Leader's to assign (`leader.md:25`) — two owners; the line goes stale when the Leader adds or drops `tdd` | A-J-2, B-J-8 |
| C-4 | suggestion / severe | FR-1 "each skill appears in at least one row": `nestjs-expert`, `aws-serverless` are named in no matrix row (only §8.2, §8.4); the Skill-set test does not check rows | A-J-8, B-J-4 |
| C-5 | warning / severe | FR-8 docs sweep incomplete: P-13 grep covered 5 skill pages; `docs/overview.md:78`, `docs/skills/README.md:21` state `ai-agent-development` owns agent architecture (contradicts DD-7); `AGENTS.md` `## Skill Usage` `:54`, `:60` undecided | A-J-5, B-J-2 |
| C-6 | warning / suggestion | `install-cursor.test.js` also hard-codes 317 / 331 at `:228`, `:244`, `:347` and the `:253` message; T1 names only `:249` | A-J-4, B-J-13 |
| C-7 | warning / suggestion | §2 "five docs pages" vs §4 T7's eight files; count line lacks the `UNVERIFIED` Impact split | A-J-5, B-J-13 |

C-3, C-4, C-5: judges agree the defect is real and disagree on severity → per protocol a **human decision** (JC).

## Suspect — one judge only (not auto-fixed)

| ID | Sev. | Finding |
|---|---|---|
| A-J-6 | warning | P-18 omits two applicable lessons (gate-falsifiability-2, leader-brief-contract-2); §7.2 falsifiers not executed; "fixture copy" falsifier ambiguous |
| A-J-7 | suggestion | P-5 proves directory-level copy, not per-file |
| B-J-5 | warning | `framework-selection` led by "stack skill", but only `ai-agent-development` has framework-selection text; cards say stacks only "support" |
| B-J-6 | warning | AI-agent `implement` lead `ai-agent-development` — its text says "Does not own … SDK usage … deployment implementation"; hosting choice has two claimants |
| B-J-7 | warning | T5 "parenthesis only" cannot carry three behaviours; FR-5 names-only BUT untested |
| B-J-9 | warning | `software-architect` version bump exceeds NFR-2's allowance |
| B-J-10 | warning | Stale installs (skip without `--force`, `bin/akili.js:997-1030`) lack `backend-routing.md`; no fallback in specify/Leader text; no ledger row |
| B-J-11 | warning | P-9 live path should cite `akili-execute.md:185` (scope copied) |
| B-J-12 | suggestion | P-9 / P-11 line ranges imprecise (`:25`; `:761`, `:763-771`) |
| B-J-14 | suggestion | FR-3 / FR-7 "no install recommendation" clauses untested |
| B-J-15 | suggestion | Status-code / error-body boundary between `api-contract` and `error-model` not drawn |

## Resolution

JC, 2026-11-02 (widget): **Fix only** — "Corrige el alcance recomendado sin re-juzgar". Scope: C-1 – C-7, B-J-5, B-J-6, B-J-10. No round 2.

| ID | Fix in `design.md` rev. 2 |
|---|---|
| C-1 | P-19 (coverage and golang-skill slices); DD-5 / DD-6 placement rules; both tests on *Must stay green* |
| C-2 | Cards cite the headings that state each claim (P-16 re-read); "propagation" dropped; DD-9 reworded |
| C-3 | §5.1 `tdd` ownership; §8.1 rule 8; `test-first` / `test-suite` contexts; Leader switch is a deviation record; test row |
| C-4 | `implement` split per stack (DD-15); Skill-set test checks Matrix rows |
| C-5 | P-13 grep widened; `docs/overview.md`, `docs/skills/README.md` added to T7; `AGENTS.md` `## Skill Usage` kept, with reason; P-21 |
| C-6 | T1 names five count sites; post-edit grep for `317` / `331` |
| C-7 | §2 counts (19 rows, ten docs files); count line with Impact split |
| B-J-5 | `framework-selection` split: AI agent → `ai-agent-development`; others → `software-architect` / existing design (DD-14) |
| B-J-6 | AI-agent `implement` led by the runtime skill; `ai-agent-development` supports; hosting choice under `framework-selection`; rule 7 (skip absent idioms) |
| B-J-10 | P-20; §8.5 absent-file fallback; test row |

Suspects not in scope stay `info`: A-J-6 (lessons partly applied in P-18), A-J-7, B-J-7 (partly addressed by DD-10's extra sentence and the names-only test), B-J-9 (version bump dropped as a side effect of §4), B-J-11 / B-J-12 (corrected while editing P-9 / P-11), B-J-14 (test row added), B-J-15 (boundary drawn in the `error-model` row).

**fixed, not re-judged** — C-1, C-2, C-3, C-4, C-5, C-6, C-7, B-J-5, B-J-6, B-J-10.
