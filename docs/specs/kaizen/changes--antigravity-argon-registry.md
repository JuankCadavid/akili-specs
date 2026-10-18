# Kaizen Entry — changes/antigravity-argon-registry

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/antigravity-argon-registry` |
| Date | 2026-10-18 |
| Branch | `JuankCadavid/argon-registry` (spec branch — `Default Branch: master`, no integration pin; nothing applied here) |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 5 (3 planned + T4 from Pivot A4 + T5 from Pivot A5) | tasks.md |
| Reviewer FAIL rework attempts | 2 (T1 — "16 Argon spellings" overstated design P-3; T5 — ambiguous role-set parenthetical copied from DD-8) | execution.md — T1, T5 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 2 (A4 after T3 — Step 8E example YAML still showed a `pro` Reviewer; A5 after validation — Step 8E `/agents` and wrapper-list prose, W1–W3) | execution.md — ## Pivot Record: T4, ## Pivot Record: T5 |
| Specify-time amendments | 3 (A1 refuted DD-1 "no code change" — `/agents` report; A2 template edit dropped — fence refusal; A3 silent degrade documented) — all found by executing falsifiers and repros at baseline, before execution | design.md §13–§15 |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | n/a (Review Design not requested) | design.md Document Control |
| Validation FAIL / WARN | 0 / 6 → 0 / 3 after T5 (W4–W6 carried) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 in skipped tasks (none skipped). Rules-text staleness (W1) passed the T2 and T3 Reviewers and surfaced at validation | validation-report.md W1 |
| Review rounds | 7 of 8 (budget raised 6 → 8 by A5) | execution.md |
| Runtime events | 0 | execution.md |
| Budget | tasks 3 → 5, LOC ~100 → ~174, both raised by user-approved Pivots | execution.md Document Control |
| Drift attributable to this spec | none (no `docs/specs/audits/` report; legacy drift-report silent) | — |

## Lessons

- **KZ-changes--antigravity-argon-registry-1 — A qualifier placed after a clause about one role set is read as describing that set.** (Methodology — this repository *is* the methodology; Medium)
  - Root cause: design DD-8 wrote "a role routed to Argon gets none and is reported (on the packaged roster: Implementer and Tester only)". The parenthetical names the *written* roles but follows the clause about the *skipped* ones. The Implementer copied the design wording verbatim, so shipped Step 8E text told agents to skip the wrong roles. Nothing in `/akili-specify`'s design guidelines asks that a sentence covering two role or value sets name each set where it applies.
  - Evidence: execution.md — T5 attempt 1 (Reviewer FAIL: "Read in order, it says the Implementer and Tester are the roles routed to Argon and skipped"); design.md §17 DD-8 (wording corrected in place, annotated).
  - Standardization: → P1

## Noted, not a lesson

- **W6:** T4 cited FR-3 `BUT` by paraphrase; the site really belonged to the FR-3 scenario and its `AND IT MUST`. Coverage was intact. Feeds the coverage-citation recurrence check.
- **W5 / A2:** `model-routing.section.md:48` still names Gemini 3.1 Pro. The cause is the template-evolution bug (editing the template refuses existing fences), already queued as its own Bug.
- **Worktrees:** `.agents/` is gitignored, so a new worktree has no personas. `akili doctor --agents` reported `ABSENT`, and the Leader copied the directory from the main checkout. This was friction, not a defect. If it recurs, a worktree note in `AGENTS.md` (Concurrency bullet) is the candidate home.
- **Leader brief deviation:** the T1 Reviewer got a 118-line diff by scratchpad path instead of inline (≤300-line rule). It caused no harm and is recorded in execution.md.
- **test-report.md cited the wrong test:** it named `(i)` as evidence for the Implementer/Tester `flash` wrappers, but `(i)` skips that check for Antigravity. The validator caught it; test 66 and the CLI run were the real evidence.
- **LOC accounting:** per-commit sums (151) and the net diff (149) differ when a later task rewrites an earlier task's line. Reported totals should say which one they are.
- **Session permissions:** a live `agy -p` subagent probe (DD-4) was denied by the session's permission classifier. P-4 stays `UNVERIFIED` with the user as owner.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-specify.md` — Step 2.2 guidelines, after the "A design table that restates a requirement's table keeps every cell's obligations." bullet |
| Edit | `- **A sentence that covers two role or value sets names each set where it applies.** A trailing qualifier or parenthetical attaches to the clause just before it; when it describes the *other* set, name that set ("the Leader and Reviewer are skipped; only the Implementer and Tester are written"), because Implementers copy design wording verbatim (\`changes/antigravity-argon-registry\` T5).` |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--kaizen-loop-closure-2 |
| Edit | Add source `changes/antigravity-argon-registry`. Recurrence note: "**recurred twice (changes/antigravity-argon-registry: the design-time consumer sweep P-7 keyed on a backticked `` `pro` `` missed the Step 8E example's bare `model: pro` — Pivot A4; and A1's code fix to the `/agents` claim left the same claim in Step 8E prose — validation W1, Pivot A5). A code change that retires a claim sweeps the rules text that restates it, keyed on the claim, not on the code identifier**" |
| Severity | High |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add source `changes/antigravity-argon-registry`. Recurrence note: "**recurred (changes/antigravity-argon-registry: T1 attempt 1 called 16 mixed candidate values '16 Argon spellings' — a Reviewer FAIL; validation W4 found the same figures restated differently across spec documents: 14 vs 16 candidates, 'all 16 given' vs 19, 9 vs 10 grep hits)**" |
| Severity | High |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--leader-brief-contract-2 |
| Edit | Add source `changes/antigravity-argon-registry`. Recurrence note: "**recurred (changes/antigravity-argon-registry T3: Falsifier 2, 'remove `wrapperModel` from the clone → the `tools:` assertion red', was written at specify before the clone existed. Executed, it went red on an earlier Leader-render assertion and never reached its target. The Reviewer ran the right mutation (`const tools = []`). A falsifier for an assertion mutates the behaviour that assertion checks, not a setup step before it; no attempt lost)**" |
| Severity | High |
| Status | pending |

### P5

| Field | Value |
|---|---|
| Kind | factual-sweep |
| Target | `AGENTS.md` — Development Rules › **Model Routing** bullet |
| Edit | The sentence "Enforced bindings live only in the **Step 8E tool-native agent wrappers** (…), which pin each persona to its tier's model;" should read "… which pin each persona to its tier's model where the host has a wrapper value for that pick (an Antigravity Gemini 4 Argon pick has none, so that role is skipped and reported);" |
| Severity | Low |
| Status | pending |
