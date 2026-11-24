# Judgment Day: `changes/nestjs-official-skills` design

| Field | Value |
|---|---|
| Target | `design.md` at `1714528`, with `requirements.md` and `proposal.md` as approved inputs |
| Mode | judgment_day, blind dual review, read-only judges |
| Judges | A and B, both `sonnet`, Explore agents (author model: `opus`; author ≠ auditor) |
| Round | 1 of 2 |
| State | **closed: fixed, not re-judged** (Fix only, approved by JC 2026-11-22) |

## Counts

| Bucket | Count |
|---|---|
| Confirmed severe (both judges) | 3 |
| Suspect severe (one judge) | 1 |
| Contradictions between judges | 0 |
| Info, both judges (warnings and suggestions) | 7 |
| Info, one judge | 12 |

## Confirmed severe (both judges)

| ID | Judges | Finding | Evidence |
|---|---|---|---|
| C-1 | A J-2 · B J-1 | DD-10 and P-11 are wrong: replacing the `nestjs-expert` example in `implementer.md:27` breaks the persona fixtures. `verbatim-marked.md` is byte-identical to the live `implementer.md`, and `agents-doctor.test.js` compares fixtures against the live template | B, in a scratch copy: `sed` swap, then `node --test test/agents-doctor.test.js test/agents-doctor-io.test.js test/persona-digests.test.js` → pass 65, fail 4 (`not ok 7, 31, 33, 35`). A: `sectionStates` gives `context-alignment: custom-edited` |
| C-2 | A J-1 · B J-2 | P-10 is contradicted. Its own grep returns 6 files, not 7, and it misses `test/akili-panel-flow.test.js`: `SKILL_NAMES.stack` at line 1436, and the pins `Skills (32)`, `Skills (31)` and `core (12) / conditional (10) / stack (10)` at lines 1491–1752. It also misses `install-akili-panel.test.js:114,398`. `akili-panel-cli-coverage.test.js:537` pins 33, which becomes 38 | `grep -rlE "3[23] skills\|32 packaged\|SKILL_DIR_COUNT ="` over the same scope → 6 files; `grep -nE "\(32\)\|\(31\)\|stack \(10\)" test/akili-panel-flow.test.js` |
| C-3 | A J-3 · B J-3 | FR-1 requires the npm shasum in every `UPSTREAM.md`, but a git checkout cannot supply it and the script runs offline (NFR-2). §7.1 names no input for it | `git ls-tree -r v0.1.1` holds no registry shasum; the value appears only in `proposal.md:43`, from `npm view` |

## Suspect severe (one judge)

| ID | Judge | Finding | Architect re-run |
|---|---|---|---|
| S-1 | B J-4 | The budget's review rounds read 13, but its own basis sums to 14 | 3 × 2 + 5 × 1 + 3 = 14. **Reproduces.** A factual correction; offered to the user, not auto-fixed |

## Info: reported by both judges

| ID | Judges | Finding |
|---|---|---|
| I-1 | A J-4 · B J-5 | The staging folder `.claude/skills/.nestjs-sync-staging/` and the unnamed aside folder would be listed, installed, packed and counted if left behind (`listEntries` has no dot filter, `bin/akili.js:495-502`; no `.gitignore` entry) |
| I-2 | A J-5 · B J-6 | The per-folder swap is not atomic across the six folders: a failure on folder 4 leaves the set on mixed pins. The first run has no current folder to set aside |
| I-3 | A J-6 · B J-7 | The bytes come from the working tree, not from git objects (`git show <sha>:<path>`), so they are exposed to `autocrlf` and eol attributes. The script requires commit = `HEAD`, but the clone's `HEAD` is `7f05f49`, so the maintainer must check out `v0.1.1` first |
| I-4 | A J-7 · B J-10 | The routing text-contract tests pin "eight rules", "nine cards" and "AGENTS.md names the nine", and require one card per skill (`backend-skill-routing.test.js:43,85,99-105,137`; `-coverage.test.js:90,114,156`). The design names none of them. The family card also drops "testing strategy" and "debugging method" from *Must not decide*; `nestjs-testing` against `tdd` ownership |
| I-5 | A J-8 · B J-11 | Observe text also lives in the lead skill `nestjs-feature` (`references/http.md`, `references/structure.md`). Scaffolding and wiring `ObserveModule` add a third-party telemetry dependency by default, which rule 9's list (link, MCP, paid rules) does not cover. DD-9 puts the Observe note on only two pages |
| I-6 | A J-11 · B J-12 | `SKILL_FILE_EXPECTED` today is 321, which excludes the plugin's 7 files; the new value is 354. 328 and 361 are the wrong figures. The baseline's `ok 54` becomes 59 |
| I-7 | A J-12 · B J-13 | P-1 cites `:1431`; the line is `:1432`. P-12's dispatch is at `:3321`; `:2445` is the function definition |

## Info: reported by one judge

| ID | Judge | Finding |
|---|---|---|
| I-8 | A J-9 | The retired-cleanup `rmSync` would delete a user's own `nestjs-expert` (another tool installs it too) on Claude, OpenCode and Antigravity with no ownership check. FR-4 allows it ("same rules as gsap-*"), but §10.1 does not record it |
| I-9 | A J-10 | Two counts disagree only because their scopes differ: 22 files (design) against 20 (requirements). State the scope next to the 22 |
| I-10 | A J-13 | `docs/cli.md` documents the install and doctor output formats; the new `RETIRED`, `deleted retired skill` and `skip foreign … npx` lines are not listed there |
| I-11 | B J-8 | Governance *Vendored* rule 4 says the pin moves "only through `scripts/sync-impeccable.js`"; "Current member: `impeccable`"; `release-checklist.md:21` names only that script. None of the three is in the design's edit list |
| I-12 | B J-9 | `adapted-by` should be `Juan Carlos Cadavid — jcadavid.com`, per the governance schema and the impeccable precedent (`governance.md:104-105,111`; `impeccable/SKILL.md:9-11`). The design writes AKILI-SPECS. FR-1's metadata list does not fix the value |
| I-13 | B J-14 | §7.4 does not say whether a `## ` line inside a fence ends the section, or whether an H1 does |
| I-14 | B J-15 | Have the grep test exclude `docs/specs/` wholesale, which keeps NFR-5; docs that show `RETIRED` output use a placeholder name |
| I-15 | B J-16 | `doctor --tool all` (NFR-7) on a real home reports `STALE nestjs-expert` and exits 1 until `update` runs; the gate depends on the environment |
| I-16 | B J-17 | P-4's prose lists fewer extra upstream files than its command returns (12) |
| I-17 | A, B ledger | P-13 was not refuted locally; neither judge queried the remote |

## Premise Ledger verdicts

| Row | A | B |
|---|---|---|
| P-1 | confirmed (line +1) | confirmed (line +1) |
| P-2 to P-9 | confirmed | confirmed |
| P-10 | contradicted | contradicted |
| P-11 | contradicted for `implementer.md` | precedent too narrow |
| P-12 | confirmed (dispatch line) | confirmed (dispatch line) |
| P-13 | not re-run | not refuted locally |

Rows missing, named by both judges: the npm shasum source (C-3), the staging leftover (I-1), the live persona-fixture comparison (C-1) and the `akili-panel-flow` pins (C-2).

## Verdicts

A: `needs-fix` · B: `needs-fix`

## Round-one correction (Fix only)

The user chose **Fix only** on 2026-11-22. The scope was the 3 confirmed severe findings, the suspect S-1 (re-run by the architect), the 7 findings both judges reported, and I-11 and I-12. Each was applied to `design.md`, with FR-8 amended in `requirements.md`. Nothing was re-judged.

| ID | Applied as |
|---|---|
| C-1 | DD-12: `implementer.md` left unchanged; FR-8 persona bullet and grep allowlist amended; new premise row P-15 |
| C-2 | P-10 rerun with a broader pattern and cited as run; §8 lists the `akili-panel-flow` pins; 33 → 38 named |
| C-3 | §7.1 step 1: `--npm-shasum` is a required argument; new premise row P-14; release-checklist step |
| S-1 | Budget review rounds 13 → 14 |
| I-1 | Staging and aside moved to a gitignored `.nestjs-sync/` at the repo root; a leftover refuses the run |
| I-2 | §7.1 step 6: one transaction with full rollback; first-run case stated |
| I-3 | Bytes read from git objects; the maintainer checks out the tag first |
| I-4 | §9: routing text-contract test edits named; family card naming rule; *Must not decide* restored (testing strategy, debugging method) |
| I-5 | Rule 9 covers default telemetry (`--no-observe`, no `ObserveModule` unless chosen); DD-9 adds the Observe note to `nestjs-feature` |
| I-6 | `SKILL_FILE_EXPECTED` 321 → 354; baseline `ok 54` → `ok 59` |
| I-7 | P-1 → `:1432`; P-12 dispatch `:3321` |
| I-11 | §9: governance rule 4, "Current members", and the release-checklist step generalized |
| I-12 | §5: `adapted-by: Juan Carlos Cadavid — jcadavid.com`; `adapted-for` and `source` follow the impeccable shape |

Left as info, not fixed: I-8, I-9 (P-9 now states the scope difference), I-10 (partly, since §6 now names `docs/cli.md`), I-13 (fixed in §7.4 with the section-end rule), and I-14 to I-17.

**fixed, not re-judged** — C-1, C-2, C-3, S-1, I-1, I-2, I-3, I-4, I-5, I-6, I-7, I-11, I-12
