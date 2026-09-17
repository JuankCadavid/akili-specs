# Judgment Day — `changes/codex-install-target` design.md

| Field | Value |
|---|---|
| Target | `docs/specs/changes/codex-install-target/design.md` (immutable at judgment time), with `requirements.md` and `proposal.md` in scope |
| Mode | judgment_day (two blind read-only judges, Opus; author Fable 5.1 — author ≠ auditor) |
| Round | 1 |
| Date | 2026-09-16 |
| Judge A | 4 SEVERE · 10 WARNING · 5 SUGGESTION (19) |
| Judge B | 7 SEVERE · 15 WARNING · 3 SUGGESTION (25) |
| Confirmed severe (both judges) | **5** (CS-1..CS-5) |
| Suspect severe (one judge, parent-verified true) | **3** (S-1..S-3) |
| Contradictions | 0 |
| INFO (warnings/suggestions, kept as info) | 19 merged rows |
| State | round 1 corrected (user chose **Fix only** — no scoped re-judgment); terminal state for this lineage: **approved by user decision**, findings closed as listed below |

## Confirmed severe (both judges)

| ID | A | B | Finding | Evidence |
|---|---|---|---|---|
| CS-1 | F1 | F1 | `doctor --tool codex --fix` crashes: a second `tool === "antigravity"` branch lives in `doctorTool`'s `--fix` path, preceded by `path.join(paths.commands[0], command)`; with `commands: []` the join throws | `bin/akili.js:913-915` |
| CS-2 | F2 | F2 | `cleanupLegacyFiles` and `doctorTool` iterate `LEGACY_SKILLS` (`gsap-*`) over every skills dir and `rm -rf` / report `STALE`; for Codex that dir is the shared `~/.agents/skills` → foreign skills deleted, doctor exits 1. Violates FR-2 `BUT`, NFR-1, requirements §1 Deviation | `bin/akili.js:502, 951` |
| CS-3 | F3 | F7 | §5.3 drops the Reviewer's read-only axis of author ≠ auditor for Codex ("all three hosts restrict the Reviewer"; Step 9 checklist requires naming the Reviewer's state) with no field and no recorded omission | `akili-constitution.md:698, 724-729, 876` |
| CS-4 | F9 (W) | F6 (S) | DD-10's closure greps miss real three-host claims: `.claude/README.md:3` "three tools", `:13` "other two targets", `docs/cli.md:147` "three-tool install", `README.md:169` "All three paths", wizard "All three". Gate reports green with stale claims surviving (KZ-002) | greps run by both judges |
| CS-5 | F17 (Sg) | F5 (S) | §6's DD-6 row ("Step 8F title") is not §8's DD-6 (script reuse); the title change has no DD and the real DD-6 got no reversion challenge | design.md §6 vs §8 |

CS-4 and CS-5 were reported by both judges with split severity (B severe, A warning/suggestion). Treated as confirmed: the *finding* agrees; only the label differs.

## Suspect severe (one judge) — parent verification

| ID | Judge | Finding | Parent check | Verdict |
|---|---|---|---|---|
| S-1 | B-F3 | Step 8C (registry scaffold) still says "supported hosts are Claude Code, OpenCode, and Antigravity — all three get a column", and the Step 9 checklist repeats it; unlisted in requirements §4 and design §7 → projects keep three-column registries, FR-7 audit scenario cannot hold | `grep` hits at `akili-constitution.md:489, 880` | **True** |
| S-2 | B-F4 | Surface row 17 instructs a "host list in the spawn-mechanics pointer" of `leader.md`; that pointer (`:27`) names no host; the only host mention is `:138` (Antigravity terminal-idle field case) | `grep` over `leader.md`: one hit, `:138` | **True** — the edit site does not exist |
| S-3 | A-F4 | §5.4 narrows FR-6's "payload field names may differ" to the denial mechanism; the gate script parses `.tool_input.file_path`, `.tool_name`, `old_string/new_string/content` and the matcher is `Edit\|Write`; a different tool name/field falls through to `exit 0` (a check no input can fail) | `akili-constitution.md:761-773, 797` | **True** |

## INFO — warnings and suggestions (merged; not auto-fixed)

| ID | A | B | Summary |
|---|---|---|---|
| W-1 | F5 | F11 | `rootPath` printed in install/doctor headers vs FR-1 "resources root"; `~/.agents/skills` (35 of 36 artifacts) never appears in any summary |
| W-2 | F6 | — | `--target <tmp>` with `--tool codex` no longer sandboxes skills (they still land in real `~/.agents/skills`); consequence for users, CI, and FR-4 baseline unstated |
| W-3 | F7 | F15 | Detection rule "dir non-empty" is weaker than FR-1's "`akili-*/SKILL.md` present"; source of the `akili-<cmd>` name list unstated |
| W-4 | F8 | F8, F9 | Task "regression baseline + CI" has no surface row, no artifact, no procedure for producing the v2.23.2 baseline tree |
| W-5 | F10 | F10 | Missing surfaces: `docs/commands/README.md:3`, `CONTRIBUTING.md:14`, `.claude/README.md:5-9` install-target table |
| W-6 | F11 | F18 | KZ-005 cited for "one script vs two" — the lesson says nothing about script duplication (KZ-001 class) |
| W-7 | F12 | — | `/reasoning` presented as settled wording; unexercised, unpinned, absent from FR-10 evidence list |
| W-8 | F13 | F13 | §4 tenant claims and §5.4 hooks shape carry no pin, contrary to DD-8/NFR-5 |
| W-9 | F14 | F20 | FR-3 legacy `~/.codex/skills` "may be mentioned" clause has no design element (orphan) |
| W-10 | — | F12 | §5.4 says "exit/stdout behavior kept"; the script writes denials to **stderr** and exits 2 |
| W-11 | — | F14 | No mapping from AKILI effort values (`low/medium/xhigh/max`, plus `high`) to what `model_reasoning_effort` accepts |
| W-12 | — | F16 | `akili-test.md:84` model checkpoint enumerates hosts; not covered by row 16 ("Tester spawn") |
| W-13 | — | F17 | `toolFlagFor` returns `all` for any non-{claude,opencode} pair → auto-detected pairs get a hint that now checks Codex and exits 1 on MISSING |
| W-14 | — | F19 | Proposal R4 mitigation (Step 9 `AGENTS.md` byte-cap check) dropped without a recorded deviation |
| W-15 | — | F21 | `execCliSync` appends `.cmd` on win32 unconditionally: a standalone `codex.exe` reports NOT FOUND (informational) |
| W-16 | — | F22 | Live validation may force reopening the constitution task (hook branch); dependency/rework unbudgeted |
| Sg-1 | F15 | — | Env-row filtering mechanism (predicate on entry vs filter in `runDoctor`) undecided |
| Sg-2 | F16 | — | Windows `.cmd` behavior for the codex probe unstated (correct for npm installs) |
| Sg-3 | F18 | — | `execution.md` listed as a surface row; it is an output |
| Sg-4 | F19 | F23 | 9,471 chars not reproducible (judges measure 9,493); rule unstated; conclusion unaffected |
| Sg-5 | — | F24 | ~90-line docs bucket looks thin for 9+ files |
| Sg-6 | — | F25 | DD-9 says "24 canonical files" but the measured surface is 35 entries |

## Round log

| Round | Action | Result |
|---|---|---|
| 1 | Two blind judges, parallel, identical scope | Ledger above; 0 contradictions |
| 1-fix | User: **Fix only**. Parent applied inline (specify's fix actor is absorbable inline) | Fixed in `design.md` + `requirements.md`: CS-1 (§3, §7 row 7a, DD-1), CS-2 (§3, §7 row 7b, DD-11), CS-3 (§5.3 Reviewer `sandbox_mode = "read-only"`, FR-5), CS-4 (DD-10 named pattern set + table read, FR-9), CS-5 (§6 rows re-attributed; real DD-6 challenged), S-1 (§7 row 11a, requirements §4 + FR-7), S-2 (§7 row 17 = no edit; requirements §4, FR-8, index), S-3 (§5.4 host-data table + fail-closed rule, FR-6). Warnings absorbed: W-1, W-2 (DD-2 rewritten: `--target` = single-root sandbox), W-3, W-4 (§7 row 24 regression script), W-5, W-6, W-7, W-8, W-9, W-10, W-11, W-12, W-13, W-14, W-15, W-16 (DD-12); suggestions Sg-1, Sg-3, Sg-4, Sg-5, Sg-6. Budget re-stated: 7 tasks · ~470 lines · 1 round/task + 1 reserved. Closure sweep run (superseded values only survive in `proposal.md` history and as explicit supersession notes) |
| — | Not re-judged | Residual risk accepted by the user: the fixes themselves were not independently reviewed |
