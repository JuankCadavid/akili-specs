# Judgment Day: install-stale-skills design

| Field | Value |
|---|---|
| Target | `design.md` rev 1 + `requirements.md` at `d5018e3` (uncommitted draft) |
| Mode | `judgment_day`, two blind read-only judges (sonnet; author opus), under `pre-approved (JC, 2026-10-31)` |
| Round 1 | 2026-10-31. Both judges: `FINDINGS`. Neither found a path that writes without `--force` |

## Frozen ledger (round 1)

| ID | Sev. | Finding | Status | Action |
|---|---|---|---|---|
| A-J2 / B-J3 | warning / severe | The doctor hint's position against the `missing + foreign` exit block; a `HEALTHY` status and "All checks passed" on a `DIFFERS`-only run | **Confirmed** (both); re-read `bin/akili.js:2335-2380` | FR-3 sharpened; §6, §7.3: the hint goes outside the block, the closing line changes, the status and exit code are untouched |
| A-J4 / B-J2 | warning / severe | Doctor compared only the first location; Antigravity writes 3 dirs | **Confirmed** (both) | FR-3 "at any location"; §7.3 every location; P-3 |
| A-J1 | severe | `test/fixtures/doctor-codex-baseline.txt` byte-compares a healthy doctor run; an always-printed `differs 0` would break it | Suspect (one judge). **Settled by the parent's re-read** (`tail test/fixtures/doctor-codex-baseline.txt`) | DD-7: the column prints only when N > 0; P-7 |
| B-J1 | severe | A foreign `impeccable/` (no `UPSTREAM.md`) would read `DIFFERS`, and `update` never clears it (`forceExplicit` is install-only) | Suspect (one judge). **Settled by the parent's re-read** (`bin/akili.js:431-434`, `:888-892`) | FR-3 exclusion; DD-8; P-10 |
| A-J3 | warning | P-7 missed parsers: `skipped (\d+)`, the `Install Summary` split, `row.skipped`, the grokbot `HEALTHY … foreign 0` regex, the fixture | Info | P-7 rewritten |
| A-J5 / B-J7 | warning | P-8 is settled by P-5 | Confirmed | P-8 now verified via P-5; the ledger has 0 `UNVERIFIED` |
| A-J7, A-J8 / B-J4 | suggestion / warning | Name `CHANGELOG.md:11` and the `docs/cli.md` sites that the change falsifies (`:217`, `:413`, `:426`, the ownership table row) | Confirmed | FR-5; §7.4 |
| B-J5 | warning | The replace hints lack the tool and roots | Info | FR-2, FR-3; DD-9 |
| B-J6 | warning | The `Home:` line would print for a `--local` install under home | Info | FR-4: default global roots only |
| A-J6, B-J8, B-J9, B-J10 | suggestion | The `/preserved/` assertion; the Grok Bot non-dir branch is `differs` by construction; the direct `skipped += 1`; source symlinks and source-side errors | Info | §10 reversion note, §7.2, P-3, §7.1 |

The two severe single-judge findings were facts with a single right answer, settled by one re-read each. They are logged as factual corrections. FR-2 to FR-5 were sharpened within the proposal's approved intent: no new behavior, no new scope.

## Round 1 fix delta

`design.md` rev 2; `requirements.md` FR-2 (hint roots), FR-3, FR-4, FR-5.

## Scoped re-judgment 1 (round 1 delta)

Every round-1 ID is resolved, except as follows.

| ID | Sev. | Finding | Status | Round 2 action |
|---|---|---|---|---|
| B-J5 / N-1 | severe | "Built the way `doctorHintFor` builds…" carries roots only for Grok Bot (`bin/akili.js:653-656`) | **Confirmed** (both) | FR-2/FR-3: the hints repeat `--tool`, `--local` and the non-default `--*-target` flags through one helper, `rootArgsFor`; DD-9; P-11 |
| B-J6 (A) | warning | `Home:` would print for a root that comes from `CODEX_HOME`, `CURSOR_CONFIG_DIR` or `AKILI_GROKBOT_TARGET` | Confirmed | FR-4 and §6: not for env overrides; P-12 |
| N-2 (B) / new 1 (A) | warning / suggestion | Closing-line precedence when `--fix` repaired something and `DIFFERS` is also present | Confirmed (both) | FR-3 and §6: four-step precedence |

## Round 2 fix delta

`design.md` rev 3 (§6 rows, §7.2 Home row, DD-9, P-11, P-12); `requirements.md` FR-2, FR-3, FR-4.

## Scoped re-judgment 2 (round 2 delta): lineage exhausted

| ID | Judge A | Judge B |
|---|---|---|
| B-J5 / N-1 (hint roots) | Resolved in intent; D-1 (multi-tool runs), D-2 (resolved vs raw values, quoting), D-3 (delegate to `grokbotRootFlags`): warnings | **Not resolved**: R2-1 (bare `--target` not covered, severe), R2-2 (grokbot resources root has no default, severe), R2-3 (`--local` with `both`/`all`, quoting) |
| B-J6 (`Home:`) | Resolved | **Not resolved**: R2-4 (grokbot's default root is a fixed box path, not home-derived; severe), R2-5 (two-root tools) |
| N-2 (closing line) | Resolved | Resolved |

Severe findings remain after round two, and the judges disagree on B-J6. Per the skill: escalate and stop. The FR-1 core (classification, skip labels, counts, `DIFFERS`, exit code) is clean in both judges' reports. Every open item is in the two refinements added at specify: hints that rebuild root flags, and the `Home:` rule.

JUDGMENT: ESCALATED ⚠️

## Escalation resolved (2026-10-31)

Provenance: the driver chose the option in the session at about 14:15. JC approved it at 2026-10-31 14:23 (UTC-5), transmitted by the driver with JC's words: "Apruebo el 1 y acepto tu opcion del 2" (option 1 = "Simplify both").

Answer: **"Simplify both (Recommended)"**.
- **Hints.** The hints name `akili update` / `install --force` and tell the user to repeat this run's `--tool`, `--local` and `--target` flags; no flags are rebuilt. This removes R2-1, R2-2, R2-3, D-1, D-2 and D-3.
- **`Home:`.** `Home:` prints when the run did not use `--local` and some printed root lies under `os.homedir()`. This removes R2-4 and R2-5: the Grok Bot box path never qualifies, and the root is printed beside the line.
- **Re-judgment.** JC chose to proceed without a third judge round. The lineage stays `ESCALATED`, closed by a human decision, and the Reviewer gate at execute audits the shipped text.
