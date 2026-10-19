# Kaizen Entry — changes/akili-security

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security` |
| Date | 2026-10-18 |
| Branch | JuankCadavid/skill-security-audit (spec branch — `Default Branch: master`, no `Integration Branch:` pin) |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 13 (12 planned + T7a by Pivot) | tasks.md |
| Reviewer FAIL rework attempts | 4 — T2 ×2 (attempt 1 safety lens; attempt 2 conformance lens, FR-6 regression); T5b ×1 (three summary clauses overstated the command); T8 ×1 (shell-command record) | execution.md — T2, T5b, T8 entries |
| HALTs / FATAL_FAILs | 0 / 0 | execution.md |
| Pivots | 1 — Pivot Record T7a (gate-phrase precision); plus 3 execute-time spec amendments (T-1 run-path location, T-2 FR-12 tracked content, T-3 FR-4 *who*) from spec tensions at the T2 gate | execution.md — *Gate decision*, *Pivot Record: T7a* |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 2 confirmed severe (C-1, C-2) + 1 settled suspect (S-1), fixed in round 1; scoped re-judgment PASS/PASS | judgment.md |
| Validation FAIL / WARN | 0 / 8 (1 BLOCKED: Windows CI) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 against a skip record. Two defects did escape their task's gate: the "both gates stop on every run" overstatement (T2 → found at T5b/T7 review → Pivot T7a), and design §3 "ROUTING GATE (always stops)" (missed by T7a → validation W-5) | execution.md T5b/T7/T7a; validation-report.md W-5 |
| Review rounds vs budget | 21 / 18 (user-authorized: T7a, T8 and round 21) | execution.md — *Archive gate decisions* |
| Drift attributable | None. `docs/specs/audits/` holds no `drift-*.md`, only this spec's security index; per FR-13 the legacy `docs/specs/drift-report.md` (Date of Audit 2026-07-19, predates this spec) is the source | docs/specs/audits/, docs/specs/drift-report.md |

## Lessons

- **KZ-changes--akili-security-1 — A gate adjustment that adds a forbidden field or a fixed form was approved without walking the clauses that produce it.** (Methodology, Medium)
  - Root cause: at the specify gate, I-2 added "absolute home path / user name" to FR-8's forbidden list and fixed the run path as `~`-relative. I-9 put T8's `--out` under the session scratchpad, outside HOME. FR-4 already required the index to record *who* approved. The adjustments were applied as info items with no re-judgment, so no one walked FR-4 (*who*), FR-3 (any `--out`) or I-9 (a scratchpad path) against the new constraints. Three spec tensions surfaced only in T2's review rounds: T-1, the run path versus `--out`; T-3, *who* versus the user-name ban; and T-2, FR-12 versus FR-6. They cost a safety-lens FAIL and three requirement amendments.
  - Evidence: judgment.md — *Gate adjustments* (I-2, I-9, "no re-judgment was requested"). execution.md — T2 attempt 1, safety FAIL issues 3–4, and *Gate decision — 2026-10-18* (T-1, T-2, T-3).
  - Standardization: → P1

- **KZ-002 recurred (recurrence 7)** — the command's own inexact sentence, "both gates (Step 1, Step 5) stop on every run", was copied into four summary surfaces: the docs page, `README.md`, `docs/flow.md` and `CHANGELOG.md`. That cost Pivot T7a, and T7a itself missed the design §3 diagram (W-5). T5b's first attempt failed on three summary clauses that stated the default branch as the whole rule. The CHANGELOG figures went stale before release (W-6). The new twist: here the summaries faithfully copied an overstatement in the *source*, so quote-checking at HEAD could not catch it. → P2 (`digest-update`).

- **KZ-changes--akili-security-2 — A behavioural-evidence record was composed from memory instead of derived from the session transcript.** (Methodology, Medium)
  - Root cause: T8's Scope required "record every shell command the run issued". The Leader wrote a summary of the commands from recollection, after a session restart. It omitted five commands and wrongly claimed `python3 -I` for two non-isolated `python3 -c` calls. The record is the sole evidence for the "target code executed" defect class, so its Reviewer failed it. The run itself was sound, and the fix was to derive the list from the transcript.
  - Evidence: execution.md — *T8 — attempt 1 Reviewer: FAIL (record fidelity)* and *Corrected shell-command record*.
  - Standardization: → P3

## Noted, not a lesson

- **The sweep removed a live clause (K-5).** T2 attempt 2 replaced FR-6's "never under `docs/specs/` except the index" with amended FR-12's wording, because the Leader's brief listed a phrase still owned by an unamended clause as superseded. This is the inverse of KZ-changes--kaizen-loop-closure-2, which covers a sweep that misses a site. Single occurrence.
- **The installed methodology lagged the worktree during dogfooding (K-10).** This archive run loaded the user-global `/akili-archive` and `kaizen`, which still carry the unscoped "most recent report under `docs/specs/audits/`" read. Taken literally, they would read this spec's security index as a drift report. FR-13's semantics were applied by hand. It resolves once the release ships.
- **The self-audit execution surface (K-8).** The validators the command runs live inside the audited tree, so trusting them rests on T1's checksum walk. The parent's helper interpreters also ran non-isolated with the working directory inside the target. Neither is worded in the command; the fix is folded into the follow-up proposal.
- **The provenance check never states the pin literally (K-2 / W-2)**, so a stale AKILI copy would pass after a re-sync. Deferred to the follow-up proposal.
- **Exit-code-only negative smoke cases (K-3, T1 advisory).** A missing validator also exits 1.
- **`.agents/` is absent in fresh worktrees (K-6).** It is gitignored and was copied from the main checkout; the same happened in sibling worktrees.
- **FR-3's "every run" ignores the preflight abort paths (K-7).**
- **The branch-suffix index name embeds a GitHub handle (K-9).** FR-8 bans user names in content only.
- **Budget overrun, 21 / 18.** Six rounds went to T2 (three attempts × two lenses); T7a and T8 were added after the budget was set. Each step was authorized by the user.
- **The session restarted mid-T8 (account limit).** All state was recovered from disk, with no agent re-run.
- **Follow-up proposal backlog**, from validation and the dogfood: W-2, A-4…A-8 (slug collisions, the sandbox-control list, unrecorded foreign copies and mechanisms, `--force` scope, `git` in the target triggering `core.fsmonitor`), and the deferred audit units D-1…D-4 for a `standard` run.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-specify.md` — `## Correction Closure (every Adjust round)`, append one line |
| Edit | "A gate adjustment applied without re-judgment is still a correction: when it adds a forbidden field, a fixed form, or a new constraint, walk every clause that produces or consumes that field (another FR, a task's scope, another adjustment) before the gate closes — two adjustments approved together can contradict each other." |
| Severity | Medium |
| Status | applied (2026-10-18) |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | `KZ-002` |
| Edit | Add `changes/akili-security` as a source. Recurrence note: "recurred (changes/akili-security, recurrence 7: the command's own overstated gate sentence propagated to four summary surfaces — quote-checking at HEAD passes when the source itself overstates; T5b failed on three default-branch-only clauses; CHANGELOG figures went stale before release)". Severity stays High |
| Severity | High |
| Status | applied (2026-10-18) |

### P3

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/templates/leader.md` — Primary Instructions item 4, append after the *Finalize per Step 3* bullet |
| Edit | "A HITL behavioural-evidence record (a run's command log, an observation table a task demands) is derived from the session transcript, never composed from memory — cite the transcript range it was built from." |
| Severity | Medium |
| Status | applied (2026-10-18) |
