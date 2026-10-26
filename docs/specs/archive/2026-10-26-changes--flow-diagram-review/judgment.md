# Judgment Day: `changes/flow-diagram-review` design

| Field | Value |
|---|---|
| Target | `requirements.md` + `design.md` at `3cc8f0c` (immutable) |
| Judges | Two blind, read-only judges (Explore, model `sonnet`). The author model is `opus`, so author ≠ auditor |
| Mode | `/akili-specify` Step 2.5 under `pre-approved` (judgment-day always runs) |
| Round 1 fixes | `8540017`, applied by the orchestrator |

## Reversion challenge (Step 2.3, DD-6)

One reviewer (Explore, `sonnet`) was asked: "What in this repository does removing the 2.37.0 debt bullet, and adding an `[Unreleased]` note that names `/akili-review`, break?"

Answer: only `test/akili-review-contract-coverage.test.js:348-359` (FR-14) breaks, for both reasons. DD-7 already addresses it. The reviewer also checked these readers and found them safe:

| Reader | Location |
|---|---|
| Release script | `scripts/release.js:75-89` |
| Release status | `scripts/release-status.js:55-59,159` |
| Slack notifier | `scripts/notify-slack.js` |
| Release-notify workflow | `.github/workflows/release-notify.yml` |
| CHANGELOG parser | `bin/akili.js:1270-1290` |
| Other CHANGELOG tests | `akili-marketing-docs`, `branching-flow`, `docs-overview-contract` FR-17 |

## Ledger (round 1)

| ID | Judge A | Judge B | Status | Finding | Fix |
|---|---|---|---|---|---|
| L-1 | J-A6 (suggestion) | J-B1 (severe), J-B2 | **suspect → settled by re-run** | P-3 cited `execution.md:22`; the precedent is at `:24` | `grep -n "P-5 settled"` → 24. Cited `:24`, precedent versions named; the row stays `UNVERIFIED` until T1 step 1 |
| L-2 | J-A1 | J-B5 | confirmed (warning) | The design cited a `judgment.md` that did not exist | This file; the wording now says the answer "is recorded in `judgment.md`" |
| L-3 | J-A2 | — | applied (warning) | Test 3's "external fetch" was ambiguous: the SVG has `xmlns` and licence-comment URLs | Design §6: attribute-form patterns, with `xmlns`, comments and `data:` exempt |
| L-4 | J-A3 | J-B4 | confirmed (warning) | No rows for the size caps or the font floor after the two-row layout | P-12 (caps, with a lossless re-encode then stop-and-ask), P-13 (`UNVERIFIED`, High, T1) |
| L-5 | J-A4 | — | applied (warning) | No row for a multi-column two-row lane or the edge routing | P-14 (`UNVERIFIED`, Low, T1 step 2) |
| L-6 | J-A5 | — | applied (warning) | The test-file → task mapping and LOC split were unclear | Design §6 marks T2 and T3; §8 LOC is now ~95, split per task; `tasks.md` budget aligned |
| L-7 | — | J-B3 | applied (warning) | The alt text said `/akili-review` findings enter the Bug Track with no "local run" qualifier (`docs/commands/akili-review.md:41`) | Design §4 alt text and FR-3 now read "confirmed critical `/akili-review` findings from a local run" |
| L-8 | — | J-B6 | applied (warning) | FR-1's `<title>`, `role="img"` and no-Archify clauses had no automated gate | Test 3 extended; defect-class row added; FR-6 THEN extended |
| L-9 | J-A7 | — | applied | P-8 should cite `:348-360` | Fixed in design, requirements and tasks |
| L-10 | J-A8 | — | applied | The `[Unreleased]` note could trip the CHANGELOG phrase-family scans (`:276-308`) | Design §5 and T3 step 4: do not restate the inline cap, the `--fail-on` default or the carve-out lists |
| L-11 | J-A9 | — | applied | No row for Kaizen under `/akili-archive` | P-15 (PNG at `66c91de` read as an image) |
| L-12 | — | J-B7 | applied | `Verified at` reads `66c91de`, but the target is `3cc8f0c` | The count line states that only spec files differ (`git diff --stat 66c91de 3cc8f0c` → 2 files, both spec docs) |
| L-13 | — | J-B8 | applied | The FR-14 test title would become false | Design §6 and T3 step 1: rename the title |
| L-14 | — | J-B9 | applied | Test 1's substring match was too loose | Test 1 matches the whole trimmed content of a `<text>` element |

Only one judge rated a finding severe: L-1, from J-B1. It was a citation line number, and one re-run settled it. No finding is contested between the judges. Every fix is a single-answer factual or wording correction, so each was applied and logged rather than escalated.

## Round 2 (scoped re-judgment)

Scope: the round-1 ledger plus the fix delta `3cc8f0c..8540017`, which adds `tasks.md` to the scope. The same two blind judges ran it.

| Judge | Result | New findings | Applied |
|---|---|---|---|
| A | All items resolved except L-2, because `judgment.md` was not yet written. The other judge's items are resolved too | 3 suggestions: the DT check used substring matching; P-14's If-false cell was garbled; the `npm test` baseline was not re-run by the judge | DT now uses exact trimmed matching (output unchanged, re-run). P-14 cell rewritten. The baseline is from the orchestrator's run at `66c91de`: 1108 pass, 0 fail |
| B | 14 of 15 items resolved. L-2 is open until this file exists | Warnings: P-14 should be High; the `tasks.md` status preceded the closure. Suggestions: no floor script; T2 falsifier (3) used an impossible temporary copy; DT/test match mismatch | P-14 is now High (count High 3, Low 0). Status lines hold once this file is committed. FL one-liner added (baseline `1005 6.6 5.91`). Falsifier (3) now edits the asset, then `git checkout`. DT fixed as above |

L-2 closes with this file. No finding was severe in round 2, and none is contested.

**JUDGMENT: APPROVED ✅**. 0 severe findings are open. Three `UNVERIFIED` premises remain, all High and all owned by T1: P-3 (step 1), P-13 (verification) and P-14 (step 2). Each has a stop-and-ask fallback (DD-4).
