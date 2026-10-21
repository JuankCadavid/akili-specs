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
