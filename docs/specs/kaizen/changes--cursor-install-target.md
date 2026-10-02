# Kaizen Entry — changes/cursor-install-target

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/cursor-install-target` |
| Date | 2026-10-01 |
| Branch | master (apply-capable: `Default Branch: master`, no `Integration Branch:` pin) |
| Archive Run | 1 |
| Approval Mode | gated → user mandate "continue with all tasks" after wave 1 |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 8 | tasks.md |
| Reviewer FAIL rework attempts | 9 (T7 ×1, T4 ×2, T5 ×1, T2 ×1, T3 ×1, T6 ×1, T8 ×2) + 1 PASS set aside by the Leader (T4 attempt 2) | execution.md |
| HALTs / FATAL_FAILs | 1 / 0 (T8, 3-attempt ceiling; resolved by the user's option B) | execution.md — ## HALT: T8 |
| Checkpoints | 2 (T8, both harness stops, not bounds) | execution.md |
| Runtime events | spawn failure ×2 (wave 1, harness tmux) · provider-limit death ×1 (Opus 429, T8 Reviewer → rung 3 `fable`) | execution.md |
| Pivots | 0 (5 execute-time amendments: NFR-7 red set, FR-2/FR-4 counters, FR-7 IDE `/model`, DD-8 "plan-gated", FR-10 IDE half deferred) | execution.md |
| PRODUCT_BUGs | n/a — `/akili-test` skipped by the user | — |
| Judgment-day severe findings | 8 confirmed + 2 settled contradictions (Fix only) | judgment.md |
| Validation FAIL / WARN | n/a — `/akili-validate` skipped by the user | — |
| Budget | 8 tasks / ~700 lines / 16 rounds → 8 / ~1,100 / **18** (tripwire fired twice; both over-budget rounds user-approved) | design.md §9 vs execution.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 1 — T8 `inline` (one Leader-corrected pin line after the ceiling; mechanics PASSed by rounds 17–18) | execution.md — ## REVIEW_WAIVED: T8 |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 | — |
| Worker call-bound overruns | 6 of 14 Implementer spawns over 60 host-counted calls (62, 65, 101, 84, 119, 79, 69) with personas current | execution.md spawn lines |

## Lessons

- **KZ-changes--cursor-install-target-1 — The Leader relayed summarizer output and Reviewer advisories inside quotation marks as if verbatim, four times.** (Methodology — local in this repo, **High**)
  - Root cause: the rule "a quotation is a claim of byte identity" (KZ-001, standardized into the Implementer persona by `changes/codex-install-target` P4) binds the Implementer only; the Leader's brief contract has no quotation rule, so a WebFetch summary (`new_content` — proposal; "Models are set via…" — T4 brief), a summarized pricing page ("Requires approval"/"plan-gated" — T4 brief and DD-8) and a Reviewer advisory ("Common Hook Input Fields…" — T8 attempt-3 brief) entered briefs and the design as sourced quotations. Cost: review rounds T4 ×2, T5 ×1, T8 ×1 (the round that pushed the spec to the ceiling), plus one spec premise (P-6) built on a sentence that did not exist.
  - Evidence: execution.md — T4 attempt 2 Leader adjudication; T5 attempt 1 "Leader accountability"; T8 round 18 verdict + "Leader accountability"; judgment.md X1.
  - Standardization: → P1
- **KZ-changes--cursor-install-target-2 — The Implementer's 60-call bound is self-counted and unobservable; current personas still overran it in 6 of 14 spawns without checkpointing.** (Methodology — local in this repo, Medium)
  - Root cause: `KZ-changes--persona-upgrade-1` attributed the earlier overruns to outdated personas; this spec ran `doctor --agents` clean (all sections CURRENT) and the host still reported 62–119 calls on spawns that self-reported under the bound — the count a worker keeps under-reads the host's, so the bound as written never fires. No harm resulted (every overrunning spawn completed verified), which is why it has gone unaddressed.
  - Evidence: execution.md — spawn lines for T1 (62), T2 (65, 84), T3 (101), T6 (119, 69), T8 reopen (79).
  - Standardization: → P2 · recurrence → P5

## Noted, not a lesson

- Budget 18 vs 16: the "two rounds per rules-document task" estimate held for T3/T5/T6; the overrun is lesson 1's cost plus T8's genuine P-17 refutation (the design's pre-planned mechanism (i) was needed) — no separate lesson.
- Live validation reopened the constitution task once (DD-12), exactly as budgeted; the IDE half is deferred (user decision) — follow-up.
- `akili update --dry-run` runs the package-manager step before honoring `--dry-run` (observed: a real `npm install -g`) — a product bug for `/akili-propose` (Bug), not a kaizen lesson.
- Two harness spawn failures (tmux pane) at wave 1 and two forced checkpoints at T8 — environment; recovered by the ladder as designed.
- One headless `agent -p` run hung >13 min (C4) — observational task friction; superseded by a later run.
- Review intensity: no task qualified for `skip-eligible`; every task drew a Reviewer, as planned.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/templates/leader.md` — Primary Instructions, item 3 *Brief contract (principle)*, append after "state every infrastructure or third-party fact source-or-`UNVERIFIED`" |
| Edit | "**A quotation in a brief is raw-verified by the Leader before it is written** — a summarizing fetch, a Reviewer advisory, or a prior spec's summary is never a source for text inside quotation marks: fetch the raw page and grep the sentence, or write the claim as a paraphrase carrying the `UNVERIFIED` marker." |
| Severity | High |
| Status | applied (2026-10-02) |

### P2

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/templates/implementer.md` — item 4 *Verification Rigor*, append one line after the bound table |
| Edit | "Your own call count under-reads the host's (observed 62–119 host-counted calls on spawns that self-reported under the bound, personas current — `changes/cursor-install-target`): treat **45** by your count as the checkpoint point so the host-counted bound still holds." |
| Severity | Medium |
| Status | deferred |

> Apply pass 2026-10-02: approved and written, then **reverted** — `test/agents-doctor.test.js` compares `test/fixtures/personas/*` (incl. `verbatim-marked.md`, a byte copy of the implementer template) against the current implementer template, so the edit turned six tests red. Applying it needs the persona fixtures regenerated in the same change — a task for `/akili-propose`/`/akili-quick`, not an archive-time edit. Stays deferred; the re-verify probe (anchor present) did not see this blast radius.

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | `KZ-002` |
| Edit | Add `changes/cursor-install-target` as a source spec; recurrence 6 — a CHANGELOG clause claimed "new command capability" (no command shipped), FR-4 asserted "210 files" for a counter that counts operations, the constitution said "All four `exit 0` terminals route through `allow`" (three do), and the registry stated "plan-gated"/"Requires approval" from a summarizing fetch; each caught only by quote-checking the clause at HEAD. Severity stays High. |
| Severity | High |
| Status | applied (2026-10-02) |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | `KZ-changes--leader-brief-contract-2` |
| Edit | Add `changes/cursor-install-target` as a source spec; recurrence ×2 — NFR-7 declared F1 "red" (it exits 2 at baseline; never run before written) and FR-7 asserted "`/model` in both IDE and CLI" from no source; both found at execute time. Raise Medium → **High**. |
| Severity | High |
| Status | applied (2026-10-02) |

### P5

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | `KZ-changes--persona-upgrade-1` |
| Edit | Add `changes/cursor-install-target` as a source spec; recurrence with **current** personas (`doctor --agents` clean) — 6 of 14 spawns over the 60-call bound — so the root cause is broader than drift: the self-counted bound is unobservable (see KZ-changes--cursor-install-target-2 / P2). |
| Severity | Medium |
| Status | applied (2026-10-02) |

**Standardize menu (apply-capable branch):** the user moved to archive/release before answering → recorded as **Defer all**; every item stays in the backlog and is re-offered at the next apply pass (`kaizen apply` on `master`). Backlog across `docs/specs/kaizen/` at this pass: these 5 items, highest severity **High**.

**Apply pass 2026-10-02 (`master`, apply-capable):** P1–P5 re-verified at HEAD and approved — P1 appended to the leader template's *Brief contract* bullet; **P2 reverted after it turned six `agents-doctor` tests red (see its block) — deferred**; P3–P5 merged into the digest (P4 merged with `changes/model-routing-configurator`'s recurrence of the same ID and raised to High). Digest row added for KZ-changes--cursor-install-target-1 (not -2, whose edit is deferred).
