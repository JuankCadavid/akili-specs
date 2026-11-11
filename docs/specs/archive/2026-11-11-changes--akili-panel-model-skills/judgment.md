# Judgment Day — changes/akili-panel-model-skills design

## Transaction

| Field | Value |
|---|---|
| Target | `design.md` (draft, uncommitted, at `8e8c5ba`), with `requirements.md` and `proposal.md` as approved intent |
| Mode | `judgment_day`, requested by JC 2026-11-10: «Haz la revisión doble del diseño (judgment-day)» |
| Judges | Two blind, read-only `general-purpose` agents on **Sonnet** (author: Opus 5.5), identical prompt and scope, run in parallel |
| Round | 1 of at most 2 |
| State | **Closed: `fixed, not re-judged` (J-1, J-2).** JC, 2026-11-10: «Corrige J-1 y J-2 sin volver a revisar» (Fix only, limited to J-1 and J-2). No re-judgment |

## Verdicts

| Judge | Verdict |
|---|---|
| A | FINDINGS (2 severe, 4 warning, 3 suggestion) |
| B | FINDINGS (3 severe, 5 warning, 3 suggestion) |

## Confirmed severe (both judges) — eligible for the fix round

| ID | Finding | Judges | Evidence |
|---|---|---|---|
| **J-1** | The P-8 consumer list and the §4 test-edit list miss pinned assertions this design breaks: `test/akili-panel-contract.test.js:49` and `:66` (exactly two `command.run` observers; DD-6 adds a third), `:148-149` (atoms are exactly the five; adds `host`, `skillsUi`), `:157` (render reads exactly `pending, tokens, usage, view`), `:159` (functions handed `$` in render exactly `press, read`; toggles add `update`); `.claude/skills/akili-panel/tests/panel.test.tsx:870` (`rows` 16), `:888` and `:1003-1004` (Next last child; children = rows asked), `:1033` (14 drawn lines). The kit rig mocks neither `session.model` nor `command.list` (B-10) | A-1, B-1 | Both read the files; the design's own grep pattern cannot see these pins |
| **J-2** | §8.5's "`protect` keeps the `▸`/`▾` mark" cannot work: `fitParts` (`flow.mjs:538-559`) applies `protect` only when `cols >= protect`, and a trailing mark makes `protect` the full row length, so on any real cut the mark is dropped. Example at 14 columns: `  conditional (9) ▸` (19 chars) loses its mark. FR-6 *Skills rows too long* is not delivered | A-2, B-3 | `flow.mjs` `fitParts` read by both |

## Suspect (one judge) — not auto-fixed

| ID | Finding | Judge | Settlement |
|---|---|---|---|
| B-2 | P-8's "5 hits" does not reproduce (4) | B | **Refuted by architect re-run:** `grep -rn "'session'\]\|'session', 'gap'" test .claude/skills/akili-panel/tests \| wc -l` → `5` at `8e8c5ba`. Closed, no change |
| B-5 | No premise row for atom survival across `/clear`, resume, hot reload; DD-7 says `skillsUi` is not reset by `/clear`, while `register.jsx:33-34` says `/clear` can wipe session atoms | B | Open (warning) |
| A-4 | §8.5 drops the `model` label below 19 columns; FR-6 says the id is cut "after the label column has narrowed", not that the label goes | A | Open (warning) |
| A-6 | P-2 was probed from an empty project, so only `~/.claude/skills` skills; project-level `.claude/skills/` (dogfood) unprobed; a person's own skill of the same name would be listed | A | Open (warning) |

## Warnings both judges raised (info — not auto-fixed by the protocol)

| ID | Finding | Judges |
|---|---|---|
| W-1 | FR-1 "re-read after … resume" has no mechanism: `session.end` `resume` runs only `resetSums`, `startSession` does not refresh; §3 says triggers are unchanged | A-3, B-4 |
| W-2 | No rule for `rule-skills` / `skills` when nothing is listed, when `view` is null, or when `view.next` is null (`flow.test.js:1016`, `:1022`, `:1128`, `:1164`) | A-5, B-8 |
| W-3 | FR-9 stale text not in §4: `README.md:3` and `docs/plugins/akili-panel.md:3` ("one button"), `README.md:5` ("Version `1.0.0`"), "Press the button" at `README.md:22` and `docs/plugins/akili-panel.md:12` | A-9, B-6 |
| W-4 | FR-7 reachability (P-5): the `rows` doc reads as an open-time size, the `Pane.scroll` doc says "inline the frame fits the tree"; the design picks the second with no fallback named, while the proposal's R3 listed re-request or scroll | A (P-5 not re-run), B-7 |

## Suggestions and other info

| ID | Finding | Judge |
|---|---|---|
| A-7 | P-7: whether `afterTurnStart` sees `/<skill>` in a skill's turn text is unobserved; harmless (the run's settle clears `pending`) | A |
| A-8 / B-11 | §5 maps rejection to `null` but not an empty string (FR-1); "logs once" has no state; §8.5 example `claude…-5-5` is wrong (`shortenMiddle` gives `claude-…us-5-5`); "full id" observed headless only | A, B |
| A-9 | Mockups restate 32/12/9/11 (KZ-002); budget "≈1.5 per code task" sums to 7, not 8; P-4 missing from the live-path trigger line | A |
| B-9 | Catalog test should normalise CRLF (`contract.test.js:19`, PR #130 lesson) | B |
| B-11 | `proposal.md:117`, `:174` say "exactly two rows"; the design adds three (requirements allow the rule) | B |
| P-11 | Judge B found `session.model` and `command.list` in the 2.1.318 binary (`grep -a`); the row may move to verified with that citation | B |

## Premise Ledger results

| P | A | B |
|---|---|---|
| P-1 | confirmed (headless only) | confirmed |
| P-2 | confirmed, user scope only | confirmed |
| P-3 | not re-run | not re-run |
| P-4 | not re-run | not re-run |
| P-5 | not re-run | not re-run (docs conflict) |
| P-6 | confirmed | confirmed |
| P-7 | partly confirmed | confirmed |
| P-8 | refuted as complete (J-1) | refuted (J-1; count part refuted by re-run, see B-2) |
| P-9 | confirmed | confirmed |
| P-10 | confirmed (secondary) | confirmed in code, secondary for behaviour |
| P-11 | not re-run | confirmed from the 2.1.318 binary |
| P-12 | confirmed | not re-run |

## Counts

Confirmed severe: 2 (J-1, J-2). Suspect: 4 (B-2 refuted and closed; B-5, A-4, A-6 open). Contradictions between judges: 0. Info: 4 shared warnings + 6 suggestion rows.

## Fix Record (Fix only — not re-judged)

| ID | Fix applied in `design.md` |
|---|---|
| J-1 | §4 edit list names every pinned assertion (contract `:48-49`, `:66`, `:148-149`, `:157`, `:159`, `:160`, `:164-176`; kit `:870`, `:888`, `:1003-1004`, `:1033`, rig mocks for `$.session.model` / `$.command.list`); P-8 row lists the same consumers with the reads as run. Lines re-read by the architect at `8e8c5ba` before writing |
| J-2 | §8.5: rows with a trailing mark are built already fitted — label cut to `cols - 2` with `…`, then space and mark appended (mark kept at every width ≥ 3; mark alone below 3); `fitParts`' `protect` no longer relied on for them |

Correction closure: forward sweep `grep -n "protect" design.md` → only the new §8.5 sentence (naming why `protect` is not used); backward sweep — FR-6 (`requirements.md`) and §8.3 still agree with §8.5. No other finding applied: B-5, A-4, A-6 (suspect) and W-1 … W-4 and the suggestions stay as recorded above.

**Terminal: `fixed, not re-judged` — J-1, J-2.** Not `JUDGMENT: APPROVED`.
