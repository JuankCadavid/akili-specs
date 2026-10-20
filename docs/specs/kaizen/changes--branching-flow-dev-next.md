# Kaizen Entry — changes/branching-flow-dev-next

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/branching-flow-dev-next` |
| Date | 2026-10-19 |
| Branch | `JuankCadavid/branching-flow` — Branch Context: **spec** (`Default Branch: master`, `Integration Branch: dev`; current branch is neither) |
| Archive Run | 1 |
| Approval Mode | pre-approved (user, 2026-10-19) |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 5 (+ 1 validation fix, W-1) | tasks.md, execution.md |
| Reviewer FAIL rework attempts | 2 (T1: restore-failure test satisfiable by the plan line; T5: CHANGELOG + checklist inverted the *Base ahead* guard) | execution.md — T1 attempt 1, T5 attempt 1 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0 — one spec tension at the T4 gate (Kaizen Apply Mode on `dev` vs "never commit to `dev` directly") settled by the user as an amendment (DD-15) | execution.md — Gate record: T4 → T5 |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 0 dual-confirmed; 2 single-judge severe, both citation errors (`ci.yml:12-14` for `:9-10`; `bin/akili.js:893` misattributed) | judgment.md — J1, J2 |
| Validation FAIL / WARN | 0 / 6 (W-1, W-4 fixed in validation; W-2 at archive; W-3 pending; W-5, W-6 accepted) | validation-report.md |
| Budget | LOC 1001 vs ~780 estimate (tripwire raised ~1000 → ~1200 by the user at the T4 gate); review rounds 7/8 | execution.md — §3 Summary |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 against a `REVIEW_SKIPPED` task (none exist). W-1 (FR-6 edge case) passed the T2 Reviewer as an ADVISORY and surfaced at validation | validation-report.md — W-1 |

## Lessons

- **KZ-changes--branching-flow-dev-next-1 — The kaizen apply phase assumes the apply-capable branch is directly writable; on a host that protects it (PR-only), the methodology gives Apply Mode no way to land its edits.** (Methodology, Medium)
  - Root cause: the `kaizen` skill's Apply Mode and `/akili-archive` Step 4.4 say approved edits are "applied in this pass" on the apply-capable branch and never mention commit, push or PR. A project whose integration branch is protected (this repo since 2026-10-19: PR-only, admins included) has two constitution rules that cannot both be followed. The design's reversion challenge (design §10 item 1, written inline by the author rather than by a separate reviewer) concluded the Kaizen bullet needed no edit; judgment-day did not catch it; the T4 Reviewer did, and it cost a user gate.
  - Evidence: execution.md — T4 "Spec tension raised by the Reviewer" and *Gate record: T4 → T5*; design.md DD-15 and §10 item 1 (amended); `AGENTS.md` *Kaizen Loop* bullet (DD-15 sentence).
  - Standardization: → P1 (upstream)

## Noted, not a lesson

- **Recurrence — KZ-changes--kaizen-loop-closure-2:** the T4 phrase-family sweep keyed on release vocabulary (`commit the release|git tag|publish|push|directly|master`) and could not see the *Kaizen Loop* obligation ("approved edits to shared files are made" on the pinned branch) that the new "never commit to `dev`" prohibition removed the means to fulfil. A new prohibition is swept against every obligation it disables, not only against superseded phrasing → P2 (digest-update).
- **Recurrence — KZ-002:** T5's CHANGELOG and checklist described the *Base ahead* guard inverted ("`dev` is ahead of the base"); caught only by quote-checking against `scripts/release-next.js:141-148` → P3 (digest-update).
- **Recurrence — KZ-bugfix--init-ctrlc-abort-2 (Upstreamed):** test code ran ≈3× its estimate (T1 tests ~356 lines vs ~220 budgeted; the test phase added 511 more); the LOC tripwire fired and was raised by the user. Status already `Upstreamed` — no new item; noted for the recurrence feed.
- T1's first restore-failure test matched its message anywhere in stdout, where the plan line always printed it — the Falsifiability rule 1 *inert fixture* class, caught by the Reviewer's own mutation. Existing rule covered it; the task's Falsifier list simply did not name that clause.
- Judgment-day J1/J2: two premise citations were stated from memory (line numbers, a misattributed `:893`) — citation rule (e) *run before written* already covers it.
- `release:status` is network-flaky over 65 published versions: different versions report "missing remote tag / GitHub Release" on every run, with the old and new script alike (execution.md — T2 evidence re-run). Pre-existing; a product follow-up candidate, not a lesson of this spec.
- `.agents/` absent in a fresh worktree (gitignored) — copied from the main checkout, fourth spec in a row.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `kaizen` skill, *Apply Mode* step 4 (and `/akili-archive` Step 4.4's backlog offer): add one sentence — "When the apply-capable branch is protected (changes land only through pull requests), Apply Mode runs on an up-to-date checkout of it, then moves the uncommitted edits to a short-lived branch (`git switch -c kaizen/apply-<YYYY-MM-DD>`) before committing, and the edits land through a PR into the apply-capable branch; the entry-file status stamps travel in the same PR." **Falsifier:** a project with a protected integration branch whose constitution forbids direct commits, where Apply Mode's instructions end at "write the edits". |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--kaizen-loop-closure-2 |
| Edit | Add `changes/branching-flow-dev-next` as a source; recurrence note: "**recurred (changes/branching-flow-dev-next T4: a new prohibition — 'agents never commit to `dev`' — was swept against superseded release phrasing only; the *Kaizen Loop* obligation it disabled ('approved edits … are made' on the pinned branch) survived until the Reviewer read the file whole. A rule that forbids an action is swept against every obligation that needs that action)**" |
| Severity | High (unchanged) |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add `changes/branching-flow-dev-next` as a source; recurrence note: "**recurred (changes/branching-flow-dev-next T5: the CHANGELOG and release checklist described the *Base ahead* guard inverted — 'dev is ahead of the base' for 'the bumped base is ahead of every published stable'; caught by quote-checking against `scripts/release-next.js:141-148`)**" |
| Severity | High (unchanged) |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | factual-sweep |
| Target | `AGENTS.md` — *Repository Purpose*, line 14 |
| Edit | Replace "- `scripts/` contains helper scripts, including `scripts/release.js`, which prepares controlled npm package releases." with "- `scripts/` contains helper scripts, including `scripts/release.js` (prepares stable npm releases), `scripts/release-next.js` (publishes `next` prereleases from `dev`), and `scripts/release-status.js` (release drift check)." (validation W-3; implicit Constitution Impact of T1) |
| Severity | Low |
| Status | pending |
