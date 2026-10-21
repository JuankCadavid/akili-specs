# Judgment Day — `changes/grokbot-target` design

| Field | Value |
|---|---|
| Target | `design.md` at `7421b5e` (against `requirements.md`, `proposal.md`) |
| Mode | judgment_day, `/akili-specify` Step 2.5 *Review Design* |
| Judges | A, B — blind, read-only, parallel, model `sonnet` (author: `opus`) |
| Round | 1 — findings merged; awaiting the user's correction decision |
| Skill resolution | `judgment-day` (user skill dir); shared reference files not packaged — contract from SKILL.md only |

## Premise Ledger attack

Both judges re-ran P-1 … P-9: every `file:line` citation reproduces at `7421b5e`. P-2's literal grep also matches the worktree's `.git` gitfile (`--exclude-dir` does not exclude a file) and excludes `docs/` — the property holds, the command as written does not reproduce cleanly (A-15, B-11). P-10, P-11 stay `UNVERIFIED`, not refutable from this host; both judges accept the NFR-6 gate. Missing rows named by both: `copyTreeSync` merge semantics, `lstat` vs `existsSync`, doctor summary status, `args.tool` in next steps.

Counts re-run by both: 27 skills, 12 commands, 11 rows / 2 `UNVERIFIED`, resources list, 180+90+450=720 — all reproduce.

## Frozen findings ledger

| ID | Judges | Severity (A / B) | Finding | Status |
|---|---|---|---|---|
| J-1 | A-1, B-7 | SEVERE / WARNING | `--force` takeover merges into the foreign folder (`copyTreeSync` never deletes extra files, `bin/akili.js:50-66`); foreign extras survive inside a folder then recorded as owned. No premise row | **confirmed (severity split)** |
| J-2 | B-1, A-6 | SEVERE / WARNING | An unparsable record reads as empty; the next install merges "empty ∪ written" over it and permanently loses the owned set — every former AKILI folder becomes foreign | **confirmed (severity split)** |
| J-3 | A-2 | SEVERE | Stage + plain `rsync` overwrites a foreign folder on the box and replaces the box's record with one claiming it — FR-4 does not hold in staging mode | suspect (one judge) |
| J-4 | A-6, B-2 | WARNING | Record written only at the end: a mid-run throw leaves written folders unrecorded → foreign forever | confirmed |
| J-5 | A-3, B-4 | WARNING | Foreign-only grokbot row prints `HEALTHY` and "All checks passed" while exit is 1; `r.foreign` undefined for other tools → `NaN` unless defaulted | confirmed |
| J-6 | A-4, B-5 | WARNING | Next-step hints use `--tool ${args.tool}` (default `claude` on auto-detected runs) and drop root flags | confirmed |
| J-7 | A-7, B-8 | WARNING | Classifier must use `lstat`; `existsSync` reads a dangling foreign symlink as absent; `--force` writes through a symlinked dir; a foreign plain file makes `ensureDirectory` throw | confirmed |
| J-8 | A-14, B-9 | WARNING | "Five targets" claim family is wider than four sites: `bin/akili.js:217`, `:2073`, `README.md:192`, `docs/cli.md:21,23,243`, `AGENTS.md:3,11`, `.claude/README.md:11`, `package.json` description | confirmed |
| J-9 | A-15, B-11 | WARNING | P-2 citation does not reproduce cleanly as written | confirmed |
| J-10 | A-12, B-12 | SUGGESTION | `resolveToolTarget` treats an explicit flag equal to the default as absent (shared quirk) | confirmed, info |
| J-11 | A-11, B-13 | SUGGESTION | Grokbot pointed at `~/.agents/skills` would read Codex/Cursor folders as foreign; sibling-scan inclusion is otherwise inert | confirmed, info |
| J-12 | A-8 | WARNING | Existing detection tests (`test/install-cursor.test.js:664`, `scripts/ci/install-layout-regression.js:510-536`) don't pin `AKILI_GROKBOT_TARGET`; on a machine with a populated `/home/box/agent-data/akili` they'd see grokbot | suspect |
| J-13 | A-9 | WARNING | `akili update --force` would set `forceExplicit` → update takes over, contradicting FR-4's update column | suspect |
| J-14 | A-5, B-6 | WARNING | Generic next steps ("N existing file(s) preserved, re-run with --force"; `akili doctor --tool grokbot` without roots) contradict the grokbot-specific lines | confirmed |
| J-15 | B-3 | WARNING | Helper contract unspecified: copy helpers return counts only; per-folder gate + written-names need a stated signature change | suspect |
| J-16 | B-10 | WARNING | Record write must sit outside the `shouldInclude("resources")` gate (false under `--skills-only`/`--commands-only`) and ensure the dir | suspect |
| J-17 | A-10 | SUGGESTION | Header/summary print the workflows parent, which is neither root | info |
| J-18 | A-13 | SUGGESTION | A foreign author recreating a recorded name gets overwritten by update — inherent limit, state it | info |
| J-19 | B-14 | SUGGESTION | Update summary should show the foreign-skip count | info |
| J-20 | B-15, A-15 | SUGGESTION | Budget: enumerate T1–T5; ~180 LOC for `bin/akili.js` looks low; `update` runs the old loaded code (rules apply one version late) | info |

Counts: confirmed severe 2 (both severity-split) · suspect severe 1 · confirmed warning 7 · suspect warning 4 · info 6.

## Round 1 — scoped re-judgment (fix delta `f98ad57..4f628a9`)

Both judges re-ran every changed citation: all reproduce (P-4's `:655` is the line before the `test(` title at `:656` — cited as `:655-656`). Counts 13 / 11 / 2 confirmed; budget sum is 810, not ~800.

| J | A | B | Outcome |
|---|---|---|---|
| J-1, J-5 … J-7, J-9 … J-18 | resolved | resolved | closed |
| J-2 | partial | resolved | reopened as R-3 |
| J-3 | partial | **not resolved** | reopened as R-1 |
| J-4 | partial | resolved (caveat) | reopened as R-2, R-4 |
| J-8 | partial | partial | reopened as R-5 |
| J-19 | resolved in intent | resolved | R-8 |
| J-20 | resolved | partial | R-7 |

New findings (fix-caused or residual):

| ID | Judges | Severity | Finding | Status |
|---|---|---|---|---|
| R-1 | R-A-1, R-B-1 | **SEVERE / SEVERE** | `rsync --ignore-existing` skips per file: staged files still land inside a foreign folder, and a staged record claiming foreign names is delivered to a box without one → the next `update` there overwrites them | **confirmed** |
| R-2 | R-A-4, R-B-2 | WARNING | Takeover records before removing: a failed/crashed removal leaves a foreign entry recorded owned | confirmed |
| R-3 | R-A-2, R-B-3 | WARNING | Invalid-record policy incomplete: absent writes become unrecordable (foreign forever); takeover deletes but cannot record | confirmed |
| R-4 | R-A-3, R-B-5 | WARNING | "Interrupted install" promises `doctor --fix` repair it cannot see (partial entry with `SKILL.md` reads OK) | confirmed |
| R-5 | R-A-5, R-B-4 | WARNING | §9 claim family misses `Codex.*Cursor` enumerations and `--tool` value lists (README, docs/cli.md, docs/README.md, docs/flow.md) | confirmed |
| R-6 | R-A-4, R-B-7 | SUGGESTION | FR-3 "actually written" vs intent-first recording | confirmed |
| R-7 | R-A-8, R-B-6 | SUGGESTION | Budget ~800 should be ~810 | confirmed |
| R-8 | R-A-6 | SUGGESTION | Update `Files:` foreign count has no data path | suspect → applied |
| R-9 | R-A-7 | SUGGESTION | `test/agents-doctor-io.test.js` resolves tools (`doctor --agents`, `bin/akili.js:1635-1639`) — pin `AKILI_GROKBOT_TARGET` there too | suspect → applied |

## Round 2 — fix (final bounded round)

| ID | Fix |
|---|---|
| R-1 | DD-12 / FR-7: staging prints one command — an `ssh` precondition that both box roots are absent or empty, `&&` `rsync -a` of both staged roots; failed check copies nothing and says to install on the box. P-14 added (rsync `--ignore-existing` semantics) |
| R-2 | Takeover order remove → record → copy; removal failure stops the run, records nothing |
| R-3 | Invalid record blocks every workflows-root write (absent and takeover); install/update exit 1; `doctor --fix` writes nothing there |
| R-4 | Scenario scoped to `update` / `install --force`; `doctor --fix` limit stated as accepted |
| R-5 | §9: the grep rule is authoritative (76 hits at `4f628a9`), every hit classified in `execution.md`; known sites added incl. `--tool` value lists |
| R-6 | FR-3: "wrote or began writing" |
| R-7 | Budget ~810 |
| R-8 | `runInstall` stashes `args.foreignSkipped`; `runUpdate` reads it |
| R-9 | NFR-3, §4, P-4 add `test/agents-doctor-io.test.js` |

## Round 2 — final scoped re-judgment (fix delta `4f628a9..9935687`)

Both judges re-ran P-4, P-14 and the §9 grep (76 hits), and confirmed the counts: 14 / 12 / 2 and ~810.

| R | A | B |
|---|---|---|
| R-1 | resolved (with R2-A-1) | partial (R2-B-1) |
| R-2 … R-8 | resolved | resolved (R-5 unverifiable until `execution.md`) |
| R-9 | partial (R2-A-4) | partial (R2-B-2) |

Answers to the focus questions (both judges): the DD-12 precondition guarantees FR-4 on the box, and it delivers onto an empty box. The takeover order is sound. The invalid-record block fits FR-4 and the doctor exit.

Residual findings. Neither judge rated any of them severe, so all are info under the two-round ceiling:

| ID | Judges | Severity | Finding |
|---|---|---|---|
| I-1 | R2-B-1 | WARNING | `rsync` creates only the leaf directory. If `/home/box/agent-data/` is missing, the copy fails. Add `mkdir -p` to the `ssh` step |
| I-2 | R2-A-1 | WARNING | The copy order is workflows, then `akili/`. A partial copy leaves AKILI entries with no record, and they read foreign. Copy `akili/` first, then name the recovery (box `install`) |
| I-3 | R2-A-4, R2-B-2 | WARNING / SUGGESTION | `test/agents-doctor.test.js` (`doctor --agents` without `--tool`) also needs the `AKILI_GROKBOT_TARGET` pin. It is inert today because no test asserts the `Tool root` line |
| I-4 | R2-A-3, R2-B-4 | SUGGESTION | While the record is invalid, `doctor --fix` must print BLOCKED, not FIXED, and absent entries stay MISSING |
| I-5 | R2-B-3 | SUGGESTION | The FR-4 table needs an invalid-record footnote |
| I-6 | R2-A-2 | SUGGESTION | The recovery text should say to run `doctor` before deleting the record and running `install --force` |
| I-7 | R2-A-5, R2-B-5 | SUGGESTION | Fix P-14's citation (second `--ignore-existing` occurrence), mark it as rejected-alternative rationale, and move the row after P-13 |

## Terminal receipt

Round 1 had 2 confirmed severe findings (J-1, J-2) and 1 suspect severe (J-3). All were fixed and re-judged. Round 1's re-judgment found 1 confirmed severe (R-1), which round 2 fixed. Round 2's re-judgment found 0 severe, so I-1 to I-7 remain as info. Artifacts: `judgment.md`, commits `f98ad57`, `4f628a9`, `9935687`.

**JUDGMENT: APPROVED ✅**

## Post-judgment Adjust (user, 2026-10-21) — not re-judged

The user changed proposal Q1 to **box only**. The staging flow is gone: DD-12 now reads "box only", FR-7 is now *Grokbot next steps* with no copy, `rsync` or `ssh` step, and P-14 is dropped. That also removes the whole failure class behind J-3, R-1, I-1 and I-2. I-7 goes with P-14. Applied: I-3 (pin `test/agents-doctor.test.js`), I-4 (`BLOCKED`, never `FIXED`), I-5 (FR-4 invalid-record footnote), I-6 (recovery text names `doctor` first). Under the two-round ceiling these edits are a user-directed Adjust, not a third fix round. The terminal receipt above stands.
