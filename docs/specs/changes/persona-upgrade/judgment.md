# Judgment: `changes/persona-upgrade`

**JUDGMENT: ESCALATED ⚠️** — the user chose *Fix only*; the corrections were applied and not re-judged.

## 1. Transaction

| Field | Value |
|---|---|
| Target | `requirements.md`, `design.md`; `proposal.md` as context |
| Frozen at | `2ab6bbc`, 2026-09-30. SHA-256 prefixes: `requirements.md` `53f1bf17028a0acd`, `design.md` `7e1f5bbfc908c487`, `proposal.md` `45ee135c2e221c91` |
| Mode | `judgment_day`, from `/akili-specify` Step 2.5, *Review Design* |
| Judges | Two, blind, read-only, on `opus`; design authored on Fable 5.1 |
| Round | 1 of 2 |

## 2. Counts

| | Judge A | Judge B |
|---|---|---|
| Severe | 9 | 8 |
| Warning | 10 | 12 |
| Suggestion | 1 | 3 |

| Merged class | Count |
|---|---|
| Severe, confirmed by both | **7** |
| Severe by one judge, warning by the other | 2 |
| Warning, raised by both | 9 |
| Warning or suggestion, one judge, confirmed at the source by the architect | 8 |
| Contradictions between judges | 0 |

## 3. Premise Ledger, as the judges found it

| Row | Judge A | Judge B | Architect's re-run |
|---|---|---|---|
| P-1, P-2, P-4, P-6, P-7, P-8, P-9, P-10 | reproduces | reproduces | Stand |
| P-3 | does not reproduce: the grep also hits `:6`, the `require` | same | Row corrected; the claim (no hashing helper) holds |
| P-5 | reproduces, but `AGENT_TEMPLATES` is a fixed four-name list | same | Feeds S1 |
| P-11 | **refuted**: STAR's items use one space after the number; `grep -c "^[0-9]\. \*\*"` → 7 | refuted, same command, lines 20, 25, 29, 41 | **Refuted.** Re-run: 7. The design's rewritten-persona fixture models a shape that does not exist |
| P-12 | reproduces; `node --test <dir>` fails on Node 22 | reproduces; `node:test` stable in 20, experimental in 18 | Re-run: `node --test .` → "Could not find '.'"; `node --test` with no argument discovers `*.test.js` and passes. DD-9's script string is wrong; the runner is fine |
| P-13 | stands; STAR's leader and tester add whole custom `##` sections | stands; 13 downstream `implementer.md` read: 9 two-space, 4 one-space, most older than v2.29.0 | Stands, now bounded by B's survey |
| P-14 | stands; STAR records no release | confirmed on 13 files | Stands |

## 4. Frozen findings ledger

| ID | Finding | A | B | Architect |
|---|---|---|---|---|
| S1 | `digests.json` is never installed: the copy loop, `doctorTool` and `scripts/ci/install-layout-regression.js` iterate a fixed list of four names. Safe Update's by-hand fallback and the audit therefore have no digests | severe | severe | Confirmed (`bin/akili.js:74`, `:695–699`, `:1137`; `scripts/ci/install-layout-regression.js:199`) |
| S2 | The digest table is sparse (an entry only when a section changes), so "`current` = hash at `digests.version`" fails for every section unchanged since an earlier release; the `"pre"` seed collides with "append when it differs from the latest"; `"pre"` has no ordering among semver keys | severe | severe | Confirmed by reading §5.3 and DD-3 |
| S3 | DD-6(b)'s stop rule (next `##`/`###` heading or numbered item) cuts every `##`-level section short: `reporting`, `review-output`, `test-report`, `delegation`, `test-harness`. A later replacement duplicates the unfenced remainder | severe | severe | Confirmed against the templates' headings |
| S4 | The project-block insertion rule has no answer when nothing is fenced and there is no `## Authorship` — STAR's three personas | severe | severe | Confirmed: `grep -c Authorship` → 0 on STAR's `implementer.md` |
| S5 | DD-12 proceeds when no pin exists; the kaizen skill it claims to reuse falls back to `origin/HEAD`, then the unique `main`/`master` rule, and treats unresolved as a spec branch. `--fix` would write personas on a spec branch in any unpinned project | severe | severe | Confirmed (`kaizen/SKILL.md:303–306`) |
| S6 | After `--section` inserts an `unlocated` section, the migration record still lists it: two states apply. Updating the record would write project space, which FR-4 forbids | severe | severe | Confirmed by reading DD-13 and FR-4 |
| S7 | Requirements claim 10, finding 2, the FR-5 scenario and the FR-9 fixture rest on P-11, which is refuted | severe | severe | Confirmed |
| S8 | FR-4's idempotence (exit 0 on the second run) contradicts §5.4, where `unlocated` keeps exit 1 | severe | warning | Confirmed |
| S9 | This repo's `.agents/implementer.md` is an older scaffold (79 changed lines, item 1 titled "Prompt Caching & Skills"), so the FR-5 scenario "most by exact match" cannot hold with a `"pre"` seed of v2.29.0 alone; the "28 diff lines" figure reproduces under no method | warning | severe | Confirmed: `git diff --no-index --stat` → 7+/72−; `grep -c "Prompt Caching"` → 1 |
| W1 | Budget arithmetic: T1a–d + T2–T7 = 10 tasks; 6×2 + 4 code tasks = 16 rounds; ~650 vs ~700 lines; CLI ~350 vs ~380 | warning | warning | Confirmed |
| W2 | `--allow-branch` is absent from the CLI surface and the argument plumbing; `parseArgs({strict:true})` rejects it | warning | warning | Confirmed |
| W3 | DD-12's dirty-tree check trips on `--fix`'s own output (new `.agents/.gitignore`, rewritten personas) | warning | warning | Confirmed |
| W4 | Stale text after the amendments: FR-5 bullet 3 says `unmarked` for a not-located section; the Glossary's "Section state" says "installed template"; proposal `:50`, `:61`, `:139` | warning | warning | Confirmed |
| W5 | Unowned clauses: FR-8's `README.md:550` and `akili-constitution.md:1166` sweep items (§12 says README "stays true"); `docs/flow.md:134` ("append only the minimal upgrade blocks needed"); FR-10's "run `akili update` first"; FR-3's "names the CLI release"; FR-9's backup-before-write assertion against pure-function tests | warning | warning | Confirmed |
| W6 | DD-3's `git add` hint names two files where up to five change; the §11 drift test is red on every template edit until a release; `ci.yml` never runs `npm test` | warning | warning | Confirmed |
| W7 | `## 🎯 Primary Instructions` and the `---` rules are neither fenced nor on FR-1's allowed list; with blank lines around markers the overhead is 1,977 bytes | warning | warning | Confirmed |
| W8 | Figures: "92 diff lines" is this repo's count, STAR's is 153; STAR `git ls-files .agents` → 4, not 3 | warning | warning | Confirmed |
| W9 | Step 8B's inline-draft path produces personas with no markers and no project block | warning | suggestion | Confirmed |
| W10 | CRLF: a marker line ending in `\r` fails a strict own-line regex, so the persona reads `unmarked`; a marker inside YAML front matter is undefined | suggestion | warning | Confirmed |
| W11 | `akili-audit.md:60` item (c) already checks persona structure against installed templates; DD-8 defines the check twice; the `:59(c)` pointer at `:116` is stale | — | warning | Confirmed |
| W12 | DD-4's "when there is no project block" insertion branch never runs, since §5.1 makes such a persona `unreadable` | warning | — | Confirmed |
| W13 | §12 point 2 cites "§7.2", which does not exist | — | warning | Confirmed |
| W14 | FR-4 scenario uses id `self-correction`, not in §5.2; an `absent` persona has no `--fix` action and keeps exit 1 | warning | warning | Confirmed |
| G1 | `--dry-run` with the existing `doctor --fix` hard-codes `dryRun: false`; the design's reuse is new behaviour, and whether the branch and dirty-tree checks run under it is unstated | suggestion | — | Confirmed (`:1038`, `:1150`) |
| G2 | Seed `"pre"` from every tagged release (`git show vX:.claude/templates/…`) rather than v2.29.0 alone | — | suggestion | Accepted as the fix for S9 |
| G3 | Add `npm test` to `.github/workflows/ci.yml` | — | suggestion | — |

## 5. Corrections

User decision, 2026-09-30: **Fix only**. Every row of §4 was corrected; the map from ledger id to the place it landed is `design.md` §13 and `requirements.md` §10. Two rows are recorded rather than fixed: P-13 and P-14 stay `UNVERIFIED`, owned by T5's first step (a judge's survey of 13 downstream personas is not a citation the architect ran).

Correction closure: forward sweep for the superseded values (`1,200`, `2,000`, `installed template`, `92`, `28`, `no numbered items`, `"pre"`, `self-correction`, `§7.2`, `9 tasks`, `14 rounds`) over the spec folder; backward sweep of the referrers of FR-1, FR-3, FR-4, FR-5, FR-9 and the Premise Ledger rows P-3, P-11, P-12.

## 6. Re-judgment

None, by the user's choice. The corrected design has been read by its author only.

## 7. Terminal receipt

`JUDGMENT: ESCALATED ⚠️` — 7 severe confirmed by both judges, 2 split, 14 warnings, 3 suggestions; all corrected, 2 premises left `UNVERIFIED` with an owner. No independent verification of the corrections ran.
