# Archive Summary — Premise Ledger

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/premise-ledger` |
| Archive Path | `docs/specs/archive/2026-09-29-changes--premise-ledger/` |
| Archive Date | 2026-09-29 |
| Branch | `master`. Branch Context is `default` and apply-capable, resolved from the `Default Branch: master` pin in `AGENTS.md`; no `Integration Branch:` pin exists |
| Final Status | **Complete: 10/10 tasks PASS · 1 Pivot (approved, closed) · validation 0 FAIL · 4 WARN resolved** |
| Released in | v2.26.0 (2026-09-19, `minor`), carried in v2.27.0 — shipped before validation and archive ran |

## 2. Outcome

A design's claims about the existing system are now auditable rows instead of prose:

- `design.md` carries a **Premise Ledger**: claim, class, citation as run, verified-at commit, what breaks if false. An unverifiable claim is written `UNVERIFIED` with an owner.
- `judgment-day` attacks the Premise Ledger before anything else, including rows that are uncited or cited to a document.
- The Bug Diagnosis records a four-check **Blast Radius**, with *Already fixed?* run first.

## 3. Requirements Delivered

| Req | Delivered by | Status |
|---|---|---|
| FR-1 Ledger section and row shape | T1 | ✅ |
| FR-2 Closed classes and triggers | T1, T9 (amended `shared-state` trigger) | ✅ |
| FR-3 Citation rules (a)–(e) | T1 | ✅ |
| FR-4 `UNVERIFIED` routing and hand-off | T1, T2 | ✅ |
| FR-5 Step 2.1 · Step 2.5 · checklist | T2 | ✅ |
| FR-6 Upstream cite-or-mark | T2, T4 | ✅ |
| FR-7 Ledger-first judge rule | T3, T8 (reach clause) | ✅ |
| FR-8 Two stale pointers | T2, T3 | ✅ |
| FR-9 Blast Radius | T4 | ✅ |
| FR-10 Constitution template clause | T5 | ✅ |
| FR-11 Coherence sweep | T6, T10 | ✅ |
| NFR-1..8 | T7 / T10 gates | ✅ |

## 4. Files Changed

132 shipped lines by per-task count (+128 −14 cumulative). No packaged file added.

| File | Change | Commit |
|---|---|---|
| `.claude/commands/akili-specify.md` | Step 2.2 item 11 and the *Premise Ledger* block; Step 1.2, 2.1, 2.3 pointer, 2.5, Verification Checklist; amended `shared-state` trigger | `617ee1b`, `abba310`, `c063456` |
| `.claude/skills/judgment-day/SKILL.md` | Ledger-first Hard Rule, reach clause, Integration row, version 1.7 → 1.9 | `f872afa`, `8ebe03f` |
| `.claude/commands/akili-propose.md` | `Impact & Scope` → `Blast Radius`, run order, cite-or-mark, checklist, report | `b7891fe` |
| `.claude/commands/akili-constitution.md` | Step 7 item 2 names the section | `5dfbd33` |
| `docs/commands/akili-{specify,propose,constitution}.md`, `docs/skills/judgment-day.md`, `docs/flow.md` | Mirrors and one flow line | `f24b698` |
| `CHANGELOG.md` | Entry, amended at the re-gate | `f24b698`, `2d005b2` |

## 5. Test Evidence

There is no `test-report.md`, and its absence is **accepted**: the change is prose only and every task records `Red run: n/a`. The behavioral evidence is `walkthrough.md`:

- a blind literal reader walked 14 corpus cases (7 held out) and 2 negative controls;
- the first gate reached 11 of 14 key premises and failed T7, which triggered the Pivot;
- after T8 and T9 a second blind reader on a different model re-walked the three failing cases, and all 14 now reach their key premise;
- the block-mutation falsifier was executed and moved the verdict;
- both negative controls demand zero blast-radius rows.

## 6. Validation

`validation-report.md`: **0 FAIL**. Two passes, `opus` then `fable`, reproduced every gate at HEAD. The four WARNs were all in spec documents and were resolved in `9f40710`. `npm run verify:cli`, `pack:dry-run` (275 files) and `git diff --check` pass.

## 7. Accepted Warnings / Follow-Ups

| # | Item | Suggested route |
|---|---|---|
| 1 | **F9** — the Blast Radius has no deployed-revision comparison | Input to `budget-and-concurrency` |
| 2 | **F14** — a claim that also feeds a triggered row has no stated route (own row, or discharged by the sibling list) | `/akili-propose` |
| 3 | **F15** — a design citing its own enumeration is classed by neither the block nor the judge rule | `/akili-propose` |
| 4 | **P-13** (`UNVERIFIED`, Low) — whether judges on the three non-Claude hosts can search when read-only | Owner: the user, at the first non-Claude `judgment-day` run |
| 5 | Seven readability advisories listed in `validation-report.md` §7 | Pick up if a later spec touches those lines |
| 6 | Budget overrun: 15 review rounds vs 12, 4 rework attempts vs 2; escalated at the tripwire | — |
| 7 | Premise rot between specify and execute | Input to `budget-and-concurrency` (standing non-goal) |

## 8. Historical Notes

- **The closure gate did its job.** T1–T6 passed first time against requirements that were themselves incomplete; only the blind walkthrough found that the judge rule did not reach an uncited row, a document-cited row, or a shared template condition.
- **Pivot, Option B.** The user delegated the choice; the Leader amended FR-2 and FR-7 and added T8–T10.
- **The amendment left two defects in the spec documents** that validation found ten days later: an overwritten scenario heading in `requirements.md`, and `walkthrough.md` §3/§7 left at the first-gate reading.
- **Dogfooding.** `design.md` §11 is the first Premise Ledger written. Five of its thirteen rows were first drafted from memory and were wrong when run; citation rule (e) caught them before approval.
- T8 closed under `REVIEW_WAIVED` (degraded-pair `opus`/`sonnet`); T9 received two independent Reviewer verdicts after a session limit idled the first Reviewer.
