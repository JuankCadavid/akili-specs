# Kaizen Entry — changes/go-backend-routing/backend-skill-routing

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/go-backend-routing/backend-skill-routing` |
| Date | 2026-11-02 |
| Branch | JuankCadavid/backend-skill-routing (Branch Context: spec — `Integration Branch: dev` pinned) |
| Archive Run | 1 |
| Approval Mode | gated (routine task gates widened by JC after T1) |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 9 + 2 amendment passes | tasks.md, execution.md |
| Reviewer FAIL rework attempts | 6 (T1, T5, T6, T7, T9 evidence, A-6 — one each) | execution.md |
| HALTs / FATAL_FAILs | 0 / 0 | execution.md |
| Pivots | 0 (5 execute-time amendments A-2..A-6, all JC-approved) | execution.md — Amendments |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 2 confirmed (round 1, fixed in design rev. 2) | judgment.md |
| Validation FAIL / WARN | 0 / 1 (W-1 stale Summary figures, fixed) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 | test-report.md / validation-report.md |
| Budget | 9 tasks · 689 LOC vs ~650 · 17 review rounds vs ~18 | execution.md — Summary addendum |

## Lessons

- **KZ-changes--go-backend-routing--backend-skill-routing-1 — A Tester shipped scope-limit checks as permanent tests pinned to a commit.** (Methodology, Medium)
  - Root cause: `.claude/templates/tester.md` has no rule separating *this change's* scope constraints (NFR "files X must not change", FR "BUT file Y unchanged") from permanent invariants. Asked to cover NFR-2/NFR-4/FR-9 BUT, the Tester wrote `git diff --quiet 94215ce -- <paths>` tests plus a "never mentions `golang-pro`" assertion: they turn red on any later legitimate edit (re-vendoring, the recorded Go-layering follow-up) and skip silently under CI's depth-1 checkout, so they guard nothing where they run.
  - Evidence: test-report.md §2 *Leader rework of the suite*; §7.2 one-time scope evidence (the replacement).
  - Standardization: → P1 (upstream)

## Noted, not a lesson

- T5 Scope gap: `tasks.md` T5 Scope omitted FR-5's "record any deviation from it" clause; the Reviewer walked the FR, not the Scope, and caught it (execution.md — T5 attempt 1). Recurrence of KZ-changes--gate-falsifiability-2 → P2. T1 attempt 1 (dropped §5.1 Source column) is the same class.
- KZ-002 recurrence ×3: T6 CHANGELOG "one lead skill" over-claim; T7 `governance.md` "names the file and section" over-claim; A-6 Leader-drafted "retry with backoff" not backed by any cited heading (execution.md — T6, T7, A-5/A-6). → P3.
- P-13 premise gap: the design's role-claim grep keyed on phrases and missed the `ai-agent-development.md` Purpose sentence ("how to shape the agent … multi-agent topology"); found by the T7 Reviewer read. Same family as KZ-changes--kaizen-loop-closure-2 (key the sweep on the obligation, not the identifier) → folded into P4.
- An approved amendment (A-3, a third named source) created a new two-lead reading that only the held-out walkthrough (T9) surfaced; closed by A-5. One occurrence — watch for amendments re-opening FR-1-style uniqueness rules.
- T9's Leader-written evidence dropped a Scope obligation ("names who decides retries, error body, test values and diagnosis"); Reviewer FAIL, fixed in one round — same class as P2.
- Persona drift (`.agents/leader.md`, `.agents/tester.md` OUTDATED) did not affect the run; untracked copies.
- Archive Step 3 on a spec branch: factual-claims sweep of root `AGENTS.md`/`CLAUDE.md` found no falsified claim; no `## Constitution Impact` block, no guide-sync or TRD item owed (no `docs/trd/trd.md`).

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `.claude/templates/tester.md` test-authoring rules, append: "A requirement that limits *this change's* scope ('X must not change', 'BUT Y unchanged') is one-time evidence in `test-report.md` (a `git diff --stat <spec-base>` run), never a shipped test pinned to a commit — such a test reds on any later legitimate edit and skips under shallow CI checkouts." |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--gate-falsifiability-2 |
| Edit | Add source `changes/go-backend-routing/backend-skill-routing`; recurrence note: "recurred ×3 (changes/go-backend-routing/backend-skill-routing: T5's task Scope omitted FR-5's deviation-record clause; T1 dropped design §5.1's Source column; T9's Leader-written evidence dropped a Scope obligation — each caught by a Reviewer walking the FR/Scope term by term, one round each)". Severity stays High |
| Severity | High |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add source `changes/go-backend-routing/backend-skill-routing`; recurrence note: "recurred ×3 (changes/go-backend-routing/backend-skill-routing: T6 CHANGELOG 'one lead skill' vs named-source leads; T7 `governance.md` 'names the file and section' vs file-only pointers; amendment A-6's Leader-drafted 'retry with backoff' backed by no cited heading — the Leader's own amendment text needs the same quote-check)" |
| Severity | High |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--kaizen-loop-closure-2 |
| Edit | Add source `changes/go-backend-routing/backend-skill-routing`; recurrence note: "recurred at specify (design P-13: a role-claim grep keyed on phrases — 'agent architecture', 'architecture decisions' — missed `ai-agent-development.md`'s 'how to shape the agent … multi-agent topology'; the T7 Reviewer's reading found it)" |
| Severity | High |
| Status | pending |
