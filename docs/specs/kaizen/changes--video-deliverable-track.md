# Kaizen Entry — changes/video-deliverable-track

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-deliverable-track` |
| Date | 2026-10-18 |
| Branch | JuankCadavid/skill-hyperframes (spec branch — `Default Branch: master`, no integration pin; every item below awaits Apply Mode on `master`) |
| Archive Run | 1 |
| Approval Mode | gated (continue gates pre-authorized T1→T11 by the user) |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 14 (12 planned + A3, A4 pivot tasks) | tasks.md |
| Reviewer FAIL rework attempts | 3 (T2 bridge vs environment skill named wrong; T11 CHANGELOG overstatement; T12 evidence misstatements) | execution.md — T2, T11, T12 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 2 recorded (T1 — `skills update` is global; A3 — live-smoke findings S1–S5) + amendments A2, A4, V1 | execution.md — ## Pivot Record: T1, A3; Amendment A2, V1; A4 |
| PRODUCT_BUGs | 0 (first `/akili-test` run FAIL: 3 ambiguity findings F1–F3, fixed by A4) | test-report.md |
| Judgment-day severe findings | 6 confirmed (J-1–J-6) | judgment.md |
| Validation FAIL / WARN | 0 / 3 (resolved via V1) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 (T12 claimed `skip-eligible`; not earned — Reviewer ran) | execution.md — T12 |
| Escaped defects (§3) | 3 found at `/akili-test` (F1 in T9, F2 in T7, F3 in FR-6) — none in a skipped task | test-report.md §8 |
| Review rounds | 20 / 20 tripwire (reached, not exceeded) | execution.md — A4 |
| Runtime events | 1 provider-limit death (Suite 2 Tester) → resume-by-message | test-report.md §2 |

## Lessons

- **KZ-changes--video-deliverable-track-1 — A third-party CLI premise was verified for existence, not for side effects.** (Methodology, High)
  - Root cause: the Premise Ledger checked that each HyperFrames command exists and what it is for (P-8, P-19 from upstream README and skill docs) but never where it writes, what it downloads, or what it reads. Three side-effect facts surfaced only during execution: `npx hyperframes skills update` always installs globally (`skills.ts:97-119`, Pivot T1); the first `render` downloads its own ~204 MB headless browser into `~/.cache/hyperframes` and updates `~/.hyperframes` (T12, P-23 refuted); `skills check` reads only the global skills dir (T12 F1). Each cost a pivot or an amendment after the plan was approved.
  - Evidence: execution.md — Pivot Record: T1; T12 entry (Deviation, Spec tensions S1–S5); Pivot Record: A3; design.md §11 P-19, P-23, P-24.
  - Standardization: → P1 (upstream)

- **KZ-changes--video-deliverable-track-2 — A "stop if it happens" rule in a brief cannot stop a side effect the worker only sees afterwards.** (Methodology, Medium)
  - Root cause: the T12 brief said "if a download outside the scratch dir is unavoidable, STOP and report". HyperFrames gave no pre-flight warning, so the download had already happened when the worker could detect it; the worker did not stop, and ~205 MB landed in the user's home. The containment should have been environmental (redirect `HOME` / `XDG_CACHE_HOME` / tool cache variables into the scratch dir, or ask before the first run), not a conditional instruction.
  - Evidence: execution.md — T12, Deviation (recorded); t12-smoke-evidence.md F2, §4; Pivot Record: A3 (Cleanup).
  - Standardization: → P2 (upstream)

## Noted, not a lesson

- A Reviewer saw the F1 ambiguity at T9 ("a strict reading never reaches the bullet") and it was carried as information because the design prescribed "exactly one escalation line"; it returned as a `/akili-test` FAIL. This is the existing lesson KZ-changes--persona-upgrade-3 recurring → P3.
- T11's CHANGELOG sentence "The package gains only `.claude/skills/video-production/`" dropped the measured scope, and T12 attempt 1's evidence file stated two facts (`~/.hyperframes` created, no browser download) that `stat` and `render.log` refuted. Both are the KZ-002 class (claim written without checking at source) → P4.
- T2 attempt 1 named the packaged bridge as the environment-provided skill; caught by the Reviewer in one round. One occurrence — below the lesson bar.
- A provider session limit killed a Tester after its file was complete but before its report; the runtime ladder's tree probe plus resume-by-message recovered it with zero lost work. The ladder worked as written.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Premise Ledger: a `data-env` row about a third-party CLI command the spec will instruct must also record the command's side effects — write locations (project vs home/global), downloads, network use, and what state it reads — verified at source or by a sandboxed probe before the tasks gate. |
| Severity | High |
| Status | upstreamed (2026-10-18, docs/specs/kaizen/upstream-2026-10-18.md) |

### P2

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-execute` Brief contract: when a task forbids side effects outside a sandbox (live third-party runs), contain them environmentally — redirect `HOME`/`XDG_CACHE_HOME`/the tool's cache variables into the sandbox, or ask the user before the first run — never rely on a "stop if it happens" instruction the worker can only observe after the fact. |
| Severity | Medium |
| Status | upstreamed (2026-10-18, docs/specs/kaizen/upstream-2026-10-18.md) |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--persona-upgrade-3 |
| Edit | Add source `changes/video-deliverable-track`; recurrence note: "recurred — a T9 Reviewer observation that the quick escalation bullet is unreachable under a strict reading was carried as information because the design said 'one line'; it became `/akili-test` FAIL F1 and rework A4." Severity stays Medium. |
| Severity | Medium |
| Status | applied (2026-10-18) |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add source `changes/video-deliverable-track`; recurrence note: "recurred ×2 — T11 CHANGELOG 'package gains only `.claude/skills/video-production/`' (dropped scope; `docs/skills/video-production.md` also new) and T12 evidence claims refuted by `stat`/`render.log`; each cost a rework attempt." Severity stays High. |
| Severity | High |
| Status | applied (2026-10-18) |

### Step 3 (Constitution & Graph Sync) — no pending items

- `guide-sync`: none — no `## Constitution Impact` block; the new skill reaches agents through `AGENTS.md` Skill Usage and governance, both updated in-branch by T10/V1.
- `factual-sweep`: root `CLAUDE.md` (`@AGENTS.md`) and `AGENTS.md` swept — no claim falsified by this cycle (skill counts live in `docs/cli.md`, updated to 25 at T10; `AGENTS.md` quick-gate parenthetical updated at V1).
- `trd-adr`: none — no `docs/trd/trd.md` in this repo; no ADR overturned.
- CodeGraph: `.codegraph/` exists — re-index recommended after merge.
