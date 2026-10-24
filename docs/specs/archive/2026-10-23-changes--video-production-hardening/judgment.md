# Judgment Day — `changes/video-production-hardening` design

## Transaction

| Field | Value |
|---|---|
| Target | `requirements.md` (814a520) + `design.md` (a78c394), with `proposal.md` as intent |
| Mode | judgment_day, blind dual review; Premise Ledger attacked first |
| Judges | A and B, both `sonnet`, read-only Explore agents, identical prompt. The design was authored on `opus` (author ≠ auditor) |
| Round | 2 (scoped re-judgment 1 done; fix round 2 applied; scoped re-judgment 2 below) |
| Reversion challenge (Step 2.3) | One `sonnet` reviewer, one question per reverting DD; results in §4 |
| Status | **APPROVED** after 2 fix rounds and 2 scoped re-judgments (§7). Round 1 stopped for the user on confirmed severe findings, and the user chose **Fix and Re-judge** |

## 1. Counts

| Judge | Severe | Warning | Suggestion |
|---|---|---|---|
| A | 9 | 10 | 6 |
| B | 5 | 13 | 6 |

Merged: 9 confirmed (both judges; C-1–C-8 counted severe, plus C-9 at warning), 1 suspect settled by the architect (S-1), 0 contradictions. The rest are info.

## 2. Confirmed by both judges

| ID | A / B | Severity (A / B) | Finding | Correction |
|---|---|---|---|---|
| C-1 | J-1 / J-1 | severe / severe | P-21 is false: the `spawns:` line carries no model, so `/akili-test` cannot read Implementer models from it (`akili-execute.md:393`) | Source = registry T2 (or the wrapper binding) plus escalations recorded per `leader.md` instruction 3; P-21 rewritten; DD-3 reworded |
| C-2 | J-4 / J-2 | severe / severe | Every `snapshot` run clears its `-o` folder (installed `hyperframes/references/storyboard.md:12`). A shared `evidence/stills/` would delete earlier committed stills; §8.1 and §8.2 also disagree | Per-run subfolder `evidence/stills/<task>-<label>/` in both sites; new `data-env` row |
| C-3 | J-6 / J-3 | severe / severe | "Cold cache as the installed `hyperframes-cli` skill documents" does not reproduce; the only source is the friction log | The clause is dropped; the cache path (`~/.cache/hyperframes/fonts`) is cited as user-stated `UNVERIFIED` in a row owned by the font task |
| C-4 | J-7 / J-4 | severe / severe | `fixed, not re-judged` contradicts judgment-day's `approved \| escalated` terminal set (`SKILL.md:41,85`); "non-severe findings take Fix and Re-judge" contradicts "fix only severe" | The annotation lives at the AKILI layer: `judgment.md` closure in specify, never a skill terminal state. The non-severe rule is dropped. The skill bullet says the AKILI annotation sits outside its terminal set |
| C-5 | J-2 / J-5 | severe / severe | The restatement sweep missed `leader.md:333` (test-harness section, "A preference, not a hard rule"), `docs/commands/akili-test.md:23,32` and `docs/flow.md:394`; tier labels "Tester T2" now misdescribe the wrapper model | Every site is added to §9, with tier wording that says the Tester's *role* is T2 and its *model* is the first distinct auditor-tier pick |
| C-6 | J-5 / J-9 | severe / warning | Prefixing every HyperFrames command with `HYPERFRAMES_SKIP_SKILLS=1` turns `skills update` into a silent no-op (`skill-lifecycle.md:16`) | The prefix applies to `check`, `snapshot`, `render`, `preview` and `init`; `skills update`/`skills check` are exempt, with the reason stated |
| C-7 | J-3 / J-8 | severe / warning | P-1 and P-2 consumer rows are incomplete. Missing: video test `:127-143` (HeyGen-placement pin: an issue cite must not say `heygen-com/` outside allowed lines), `:152-175`, `:216-241` (host row split); routing tests `:313-318`, `:658-663`, `:722`, `:745`, `:801`; `routing-io.test.js:154,214` | P-1 and P-2 are re-run repo-wide and listed in full. Issue cites use the bare `#6138` form, or the placement test is amended deliberately |
| C-8 | J-9 / J-15 | severe / warning | DD-9 keeps `tester.md` unedited for persona-digest cost, yet edits `leader.md` with the same cost and no consumer row | One rule for both: edit both personas (`leader.md` :27, :35, :333; `tester.md` :7). Consumer row: `doctor --agents` reports deployed copies `outdated` until upgraded; `persona-digests`/`agents-doctor` tests are re-run |
| C-9 | J-10 / J-6 | warning / warning | The count line says 17 verified / 5 `UNVERIFIED`; the table has 4 `UNVERIFIED` rows | Recounted after the edits |

## 3. Single-judge findings (suspect, unless the architect settled them)

| ID | Judge | Finding | Architect disposition |
|---|---|---|---|
| S-1 | A J-8 | `embedded-captions` is not an upstream skill; the router owns captions (`hyperframes/SKILL.md:70` → `references/captions.md`) | **Settled at source: true.** `grep -rln embedded-captions` over the installed skills: 0. Captions route to the router |
| — | A J-11 | `planWrapper` boundary, write token, and existing-file drift are unspecified | Info. Adopted in the fix round (clarification, not a defect) |
| — | A J-12 / B J-17 | Ceiling rung: target tier unnamed; Claude Code T3 fallback `sonnet` falls below the author; no per-spawn Reviewer override; single-entry hosts | Info. Adopted |
| — | B J-10 / A J-21 | The test runtime stop is not marked as an exception; "exceptions above" has no antecedent in execute | Info. Adopted |
| — | A J-13 / B J-7 | P-3 and P-8 can be settled at source; P-6 scope wrong; issue-mapping row missing | Info. Adopted |
| — | A J-14 / B J-18 | `snapshot --review` row lacks `--describe false`/`--output` | Info. Adopted |
| — | A J-15, A J-16 | `story.md` owner for Bug/Trivial video; `SPEC.md` review-driven change | Info. Adopted |
| — | A J-17 / B J-16 | Cap raised on an unmeasured estimate | Info. Cap kept at 20,000 until measured (DD-6 reversed) |
| — | A J-18 / B J-14 | `docs/commands/*`, `docs/flow.md`, `docs/skills/*`, `SKILL.md:65,80` not in the file list | Info. Adopted |
| — | A J-19 | Warm-check daemon has no row | Info. Adopted (`UNVERIFIED` user-stated) |
| — | A J-20 / B J-20 | Rows for `--agent` target directories, `--output` path resolution, non-substituting hosts; validate `:36,:175` non-path sites | Info. Adopted |
| — | A J-23 / B J-19 | `--version` placed after `getArgs` validation | Info. Adopted: read before the validations |
| — | A J-24 / B J-24 | Sanitize gate proves only `$HOME` | Info. Adopted: a second grep for temp prefixes |
| — | A J-25 / B J-12 | Greenfield exception not carried to `Red run` field, checklist, Reviewer, or execute | Info. Adopted (specify field + checklist; Done criteria carry it to execute) |
| — | B J-13 | Friction items with no S-item or non-goal (GSAP CDN vendoring; design-baseline D-3) | Info. Added as non-goals |
| — | B J-21 | Cursor report-line change and Antigravity printed value | Info. Adopted |
| — | B J-22 | Budget arithmetic (14 rules tasks; 600 vs 650) | Info. Recomputed |
| — | B J-23 | `skills add --metadata` install telemetry | Info. Not adopted (the route passes no `--metadata`; out of scope) |
| — | A J-22 | `model-routing.section.md:30` "Tester(s) T2" | Info. Recorded in the kept-debt entry |

## 4. Step 2.3 reversion challenge — results

| Reverting decision | What removing it breaks | Disposition |
|---|---|---|
| (a) The Antigravity Tester wrapper and Tester = Implementer binding | `test/routing.test.js:646,658-663,313-318`; `akili-constitution.md:844-846`; `docs/commands/akili-test.md`; existing projects keep a stale wrapper | Tests are updated in the routing task. The stale file is reported, never deleted (§6). Docs are added to the sweep |
| (b) The "Rule 1 allows it" report line | `test/routing.test.js:852` | Updated in the routing task |
| (c) The 20,000 → 24,000 cap raise | Nothing concrete | Moot: DD-6 is reversed, the cap stays |
| (d) The 10-skill route → the 4-skill core | `docs/skills/video-production.md:29` repeats the route; `test/video-production.test.js:202-208` still passes if `--skill hyperframes ` stays | The doc page is added to the sweep |

## 5. Decision required

Confirmed severe findings C-1 to C-8 need a round-one correction. Per the skill, the architect asks before correcting.

## 6. Round 2 — scoped re-judgment 1 (target 66aaa91, ledger + fix delta from b3d3df1)

The user chose **Fix and Re-judge** (2026-10-23). The first launch of judge A died at the provider's session limit. On the user's instruction it was re-run with the identical prompt against the same target, and judge B's completed run stands.

| Finding | Judge A | Judge B | Merged |
|---|---|---|---|
| C-1, C-2, C-3, C-4, C-7, C-8, C-9, S-1 | RESOLVED | RESOLVED | resolved |
| C-5 (restatement sweep) | RESOLVED with residual `akili-test.md:86` | NOT RESOLVED: `docs/flow.md:379`, `akili-test.md:86` | **confirmed open**. Both judges name `akili-test.md:86`. Architect check: `docs/flow.md:379` reads "Ideally a Tester runs on a different model than the Implementer" (true) |
| C-6 (skip-skills prefix) | NOT RESOLVED: `requirements.md` FR-2 still says "any HyperFrames command" | RESOLVED, but R-2: `init` missing, `skills check` reason unsupported, telemetry on exempt commands unstated | **confirmed open** (both judges flag the prefix scope) |

New findings from the fix delta:

| ID | Judges | Finding | Fix round 2 (r3) |
|---|---|---|---|
| R2-1 | A R-1 / B R-2 | FR-2 prefix scope and the Privacy 1 row (C-6) | FR-2 scenario rewritten: skip-skills on `check`/`snapshot`/`render`/`preview`/`init`; never on `skills update` or bare `skills`; `skills check` gets telemetry only; telemetry everywhere. Privacy 1 matches |
| R2-2 | A R-2 / B R-1 | §9 misses `akili-test.md:86` and `docs/flow.md:379`; unclassified sweep hits | Both added (T9, T19); a "Not a Tester-model claim" row classifies the rest |
| R2-3 | A R-4 / B R-3 | P-24 owner T2 vs T3 | T3 owns it in both places |
| R2-4 | A R-3 / B R-4 | Base commit stated two ways | Document Control: b3d3df1/66aaa91 differ from 8679e25 only under `docs/specs/`; §8.5 says b3d3df1 |
| R2-5 | B R-5 (suspect, adopted) | Ceiling rung cites a runtime-ladder rung as its mechanism | Reworded: the same switches under a new, non-runtime trigger, which the Loop Rules sentence names |
| R2-6 | A R-4 (suspect, adopted) | No task map; T-ids not checkable | §15 Task map; every T-reference re-pointed; budget re-split (13 rules + 8 other → ~38 rounds) |
| R2-7 | A R-5 (suspect, adopted) | Daemon and `--output` resolution rows claimed but absent | P-28 and P-29 added (`UNVERIFIED`, Low); count 29 / 24 / 5 |

## 7. Round 2 — scoped re-judgment 2 (target 4c97c05, delta from 66aaa91)

| Item | Judge A | Judge B |
|---|---|---|
| C-5, C-6, R2-1 … R2-7 | 9/9 RESOLVED | 9/9 RESOLVED |
| New severe | 0 | 0 |
| F-1 (warning, both judges): §9 omits `bin/routing.js:603,849`, which T15 already owns via §7.1 row 6 and the §6 Tester line | info | info |
| F-2 (suggestion, both judges): trailing space in Document Control | info | info |

Both judges also re-counted the Premise Ledger (29 / 24 verified / 5 `UNVERIFIED`, Low 5), the budget (13 + 8 = 21 tasks; 13×2 + 8×1.5 = 38 rounds) and every task ID against §15, and all three agree.

F-1 and F-2 are info rows. They were applied after the terminal state as factual corrections (one §9 row; whitespace) and change no decision, task or scope item.

## Terminal

- Rounds: 2 fix rounds, 2 scoped re-judgments. The ceiling is reached and not exceeded.
- Confirmed: 9 in round 1 (8 severe), all resolved. 2 reopened in round 2 and resolved in r3.
- Contradictions: 0.
- Skill resolution: `judgment-day` (packaged); `systematic-debugging` and `software-architect` were not loaded (not a bug; no architectural-style decision).

**`JUDGMENT: APPROVED ✅`**
