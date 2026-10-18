# Validation Report — Antigravity registry refresh (Gemini 4 Argon)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/antigravity-argon-registry` |
| Depth | Lite |
| Validated at | `33ddd3c` (clean tree, branch `JuankCadavid/argon-registry`, no upstream). First validation was at `20184cc` (committed as `1c6600a`) |
| Implementation diff | `git diff 6e802a5..HEAD -- ':!docs/specs'`: 8 files, 109+/59-. Of that, T5 is `git diff 1c6600a..33ddd3c -- ':!docs/specs'`: 4 files, 14+/9- |
| Date | 2026-10-18 |
| Validator | T3 Auditor, Opus 5.5, fresh context. The Implementers were `sonnet`, so author ≠ auditor holds |
| Baseline docs | `docs/prd.md`, `docs/trd/`, `docs/ux-ui/` and `docs/specs/general-setup/` do **not exist** in this repo (`ls` returns "No such file or directory" for each). Validation is against the spec folder, `AGENTS.md`, and the Kaizen `## Active Lessons` digest |
| Scope of writes | This file only. No other file was edited, and nothing was committed, pushed, tagged or released |

### Re-validation after Pivot A5

The first validation (`20184cc`) passed with 6 WARN. The user then fixed W1–W3 through Pivot A5: design §17 (P-17..P-19, DD-8), task T5, and the `execution.md` Pivot Record and T5 entry. T5 passed on attempt 2, after a Reviewer FAIL on an ambiguous parenthetical. W4–W6 were deliberately **carried to the Kaizen retrospective and follow-ups, with the user's acceptance**.

At `33ddd3c` I re-ran:

- the four build checks;
- the scratch `akili routing` run;
- a read of the whole Step 8E Antigravity bullet, `docs/commands/akili-constitution.md:98`, and `docs/model-routing.md:236-262`, compared against `bin/routing.js`;
- a repo-wide sweep for stale `/agents` and success-condition claims.

## 2. Summary

**Verdict: PASS. W1–W3 are resolved; 3 WARNs are carried with the user's acceptance. Archive-ready.** No FAIL, no BLOCKED, and the T5 edits introduce no new stale claim.

| Result | Count |
|---|---|
| PASS | 44 |
| WARN | 3 (W4–W6, carried, user-accepted) |
| FAIL | 0 |
| BLOCKED | 0 |

| # | Status | One line |
|---|---|---|
| W1 | **Resolved** (`33ddd3c`) | The Step 8E bullet now creates a wrapper only "for each role whose tier pick has a wrapper value". It says that on the packaged roster "the Leader and Reviewer are skipped, and only `akili-implementer/` and `akili-tester/` are written". The `/agents` check now reads "`akili-leader` appears only when its wrapper was written; on the packaged roster … no AKILI entry appears, and that is expected" |
| W2 | **Resolved** | `:98` now says "a structural author ≠ auditor guarantee where a Reviewer wrapper is written … on Antigravity's packaged roster no Reviewer wrapper is written, and author ≠ auditor holds by running the session on Argon" |
| W3 | **Resolved** | `docs/model-routing.md:242` now reads "…is satisfied when the session runs on `gemini-4-argon-high` (see *Argon is not a wrapper tier* below)" |
| W4 | WARN, carried and user-accepted | Figures disagree across spec documents: 14 vs 16 rejected candidates, 16 "given" vs 19 actually given, and P-8 says "9 hits" where the grep returns 10 |
| W5 | WARN, carried and user-accepted | A2 known debt: a freshly rendered `AGENTS.md` puts Argon on T3 in its table, while its prose says "Gemini 3.1 Pro as the T3 auditor" |
| W6 | WARN, carried and user-accepted | `tasks.md` T4 cites FR-3 `BUT` through a paraphrase that is not the clause's text |

## 3. Task Completion

| Task | `tasks.md` | Execution evidence | Closing Reviewer | Result |
|---|---|---|---|---|
| T1 | `[x]` | Attempt 1 FAIL (the "16 spellings" sentence), attempt 2 PASS. Drift test `# pass 7`; the falsifier red is quoted. Commit `2f0235f` | `opus` PASS (attempt 2) | PASS |
| T2 | `[x]` | The grep baseline of 2/1/1 hits is now empty; the falsifier is quoted; `verify:cli` OK. Commit `b00440b` | `opus` PASS | PASS |
| T3 | `[x]` | The TDD red is quoted. Falsifiers for `:842` and `tools` are quoted (the second as corrected by the Reviewer). `npm test` 259/0. Commit `afea75c` | `opus` PASS | PASS |
| T4 (Pivot A4) | `[x]` | Pivot Record with the user's decision quoted. The grep that was red at `afea75c` now returns only the 2 correct hits; the falsifier is quoted. Commit `25a6238` | `opus` PASS | PASS |
| T5 (Pivot A5) | `[x]` | Pivot Record with the user's decision quoted (`3425294`). The red grep (`:871`, `:873`) is now empty. Falsifier run on the reworded `:873`, and the deviation is recorded. Attempt 1 FAIL: at `:835` the parenthetical read as if the Implementer and Tester were the skipped roles. Attempt 2 changed `:835-837` only. Commit `33ddd3c` | `opus` PASS (attempt 2, named conformance check against DD-8 as amended) | PASS |

Commit discipline: all commits in `git log 6e802a5..HEAD` carry the `[SPEC:changes/antigravity-argon-registry]` prefix. `git rev-parse @{u}` reports "no upstream configured", so nothing has been pushed.

## 4. File Existence

| Check | Evidence | Result |
|---|---|---|
| Design §4 edit sites, as amended by A1, A2, A4 and A5 | `git diff --stat 6e802a5..HEAD -- ':!docs/specs'` lists exactly 8 files: `.claude/commands/akili-constitution.md`, `.claude/templates/model-registry.json`, `CHANGELOG.md`, `bin/routing.js` (1 line, A1), `docs/cli.md`, `docs/commands/akili-constitution.md`, `docs/model-routing.md`, `test/routing.test.js`. T5 touches only 4 of them (`--numstat`: 11/6, 1/1, 1/1, 1/1) | PASS |
| A2: `.claude/templates/model-routing.section.md` unchanged | Absent from the diff stat; `:48` still reads "Gemini 3.1 Pro as the T3 auditor" | PASS |
| A4 site: the Step 8E example | `.claude/commands/akili-constitution.md:841-851` (`name:` at `:843`): `name: akili-implementer`, `model: flash`, no `tools:` | PASS |

## 5. Build Integrity

All four checks were re-run by me at `33ddd3c`.

| Command | Output | Result |
|---|---|---|
| `npm test` | `# tests 259` · `# pass 259` · `# fail 0` · `# skipped 0` | PASS |
| `npm run verify:cli` | `Summary: 11 commands \| 24 skills \| 8 resources (akili-specs v2.32.2)` | PASS |
| `npm run pack:dry-run` | `total files: 280` | PASS |
| `git diff --check` (worktree) and `git diff --check 6e802a5..HEAD` | rc=0 for both, no output | PASS |

The drift test also passes on its own (`node --test test/registry-drift.test.js`: `# pass 7` / `# fail 0`). It matters here because `docs/model-routing.md` is its input and T5 edited that file.

## 6. Requirement Coverage

"Re-run" below means I executed the check myself; it is not quoted from `test-report.md`. Rows marked "(1st)" were re-run at `20184cc`. T5 touched no code, JSON or test file, so those rows still hold, and §5 confirms the suite is still green at `33ddd3c`.

| Req | Clause | Owner | Evidence | Result |
|---|---|---|---|---|
| FR-1 | Retired ids: 0 hits | T1, T2 | Re-run (1st): `grep -rn "gemini-3.1-pro-high\|claude-sonnet-4-6" .claude/templates docs/model-routing.md bin .claude/commands` → rc=1 | PASS |
| FR-1 | `AND` Argon High and Sonnet 5.5 High, with `alias:false` and `dated:false` | T1 | Re-run (1st): node script read of the registry | PASS |
| FR-1 | `BUT` no unrouted roster ids | T1 | Re-run (1st): the routed id set equals the `models[]` id set → `true`; 5 entries | PASS |
| FR-1 | `AND IT MUST` labels byte-equal to `agy models` | T1 | Re-run (1st): `agy models` (agy 1.4.2) lists 13 ids; 5/5 are `served label-ok` | PASS |
| FR-2 | T1/T3 → `gemini-4-argon-high`, T2 → Flash Medium | T1, T3 | Scratch routing `AGENTS.md:49`, `:51`; tests `(i)` and 134 | PASS |
| FR-2 | `AND` author ≠ auditor satisfied | T3 | Scratch `AGENTS.md:74` reads Implementer `gemini-3.8-flash-medium` ≠ Reviewer `gemini-4-argon-high`; 0 "NOT satisfied"; test `(g)` | PASS |
| FR-2 | `BUT` no other host changed | T1 | Re-run (1st): the `claude`, `opencode`, `codex` and `cursor` blocks and `crossHost` are deep-equal to `6e802a5` | PASS |
| FR-3 | Implementer/Tester `flash`; Leader/Reviewer skipped, naming the id | T3, T5 (prose) | Re-run at `33ddd3c` (`validate-i1b`): `created` only `akili-implementer` and `akili-tester`; both `no wrapper — \`gemini-4-argon-high\`…` lines appear; exit 0. Tests 66 and 82 | PASS |
| FR-3 | `BUT` no `model:` outside `inherit`/`flash`/`pro` | T1, T3 | `bin/routing.js:649-650` binds only `entry.wrapperModel`, and every Antigravity `wrapperModel` is `flash`. Re-run (1st): `agy plugin validate --strict --json` → `"agents": 2`, `"findings": []` | PASS |
| FR-3 | `AND IT MUST` documented | T1, T2, T4, T5 | `docs/model-routing.md:247-257` and `:537`; constitution `:833-837`, `:855`, `:870-877`; `docs/commands/akili-constitution.md:98`; `docs/cli.md:448` | PASS |
| FR-3 | T4 site traceability | T4 | T4 cites "FR-3 `BUT`" through a paraphrase. The literal clause allows `pro`, so the site really belongs to the FR-3 scenario and `AND IT MUST`, which T5's row now cites correctly | **WARN (W6, carried)** |
| FR-4 | Dates `2026-10-18` | T1 | JSON `lastVerified`; doc `:135` and `:237`; `:104` reads `2026-10` | PASS |
| FR-4 | Prose: Argon on top; the 3.1 Pro / Sonnet 4.6 text dropped | T1 | `git grep -i '3\.1 Pro\|Sonnet 4\.6'` finds only `model-routing.section.md:48` (A2) | PASS |
| FR-4 | Drift test passes | T1 | `# pass 7` at `33ddd3c` | PASS |
| FR-4 | `AND IT MUST` falsifier still red | T1 | Re-run (1st) in a scratch copy: setting a cell to `gemini-9-bogus` gives `not ok 1 … not in models[]` | PASS |
| FR-5 | Suite green | T3 | 259/0 at `33ddd3c` | PASS |
| FR-5 | `BUT` no deleted or weakened test | T3 | Re-counted (1st): 136/383/120 → 136/391/121. Falsifiers re-run: `:842` → `not ok 82`; `tools` → `not ok 66`, `not ok 82`. T5 did not touch tests | PASS |
| NFR-1 | `verify:cli`, `pack:dry-run`, `diff --check` | T3 | §5 | PASS |
| NFR-2 | CHANGELOG quote-checked, patch | T3, T4, T5 | §8 | PASS |
| NFR-3 | Local commits, prefixed | all | §3 | PASS |

## 7. Linting & Code Quality

No linter is configured. The only code change is `bin/routing.js:842` (`planned.leader`), as A1 specifies.

| # | Lens | Finding | Evidence | Result |
|---|---|---|---|---|
| W1 | Reliability | **Resolved.** The bullet now creates a wrapper "for each role whose tier pick has a wrapper value (`flash`/`pro`)", and says "on the packaged roster the Leader and Reviewer are skipped, and only `akili-implementer/` and `akili-tester/` are written". This matches the `:855` row, `bin/routing.js:649`, and the scratch run, which wrote exactly those two directories. The `/agents` check now says `akili-leader` appears only when its wrapper was written, and gives the failure signal as "the Implementer, Reviewer or Tester listed as a main agent". That fits `mainAgent: ${role === "leader"}` (`bin/routing.js:651`) and the gated report at `:842-844`. The sweep `git grep -e 'only \`akili-leader\`' -e 'success condition' -e 'One entry'` finds only `bin/routing.js:843` and `test/routing.test.js:865`, which is the correct gated path and its clone fixture | `.claude/commands/akili-constitution.md:833-837`, `:872-879` | PASS |
| W2 | Readability | **Resolved.** The guarantee is now scoped to "where a Reviewer wrapper is written", with an explicit Antigravity exception and the session-on-Argon condition, consistent with `docs/model-routing.md:253` | `docs/commands/akili-constitution.md:98` | PASS |
| W3 | Readability | **Resolved.** `:242` is now conditional and points forward to `:247`. Read whole, `:236-262` is coherent: `:242` and `:253` state the same condition, and the upgrade paragraph's "NOT satisfied" covers a different case (dropped ids) | `docs/model-routing.md:242` | PASS |
| W5 | Risk | Carried and user-accepted. A2 debt confirmed live: a rendered `AGENTS.md` has the T3 table at `:51` = Argon, but `:58` says "Gemini 3.1 Pro as the T3 auditor". It is queued for the template-evolution Bug | scratch `AGENTS.md:51`, `:58` | WARN |
| — | Readability | `docs/model-routing.md:242` is now 186 columns long, inside a paragraph hard-wrapped at about 100 (T5) | `awk 'FNR==242{print length}'` → 186 | ADVISORY (new) |
| — | Readability | `tasks.md` Doc Control Status still reads "Amendments A1–A3 approved", although A4 and A5 are user-approved and recorded in the budget row | `tasks.md:9` | ADVISORY (new; W4 family) |
| — | Readability | Test `(g)`'s title still says "distinct wrapper models"; the `(i)` comment cites FR-5 for an FR-3 behaviour; CHANGELOG "stand alone"; skip text omits `inherit` (rejected in DD-1); the `:855` row gives no rule for when `pro` is used; `tools` guidance names a Reviewer that has no wrapper; the DD-4 sentence should quote the full command; keep the Implementer `description` examples in sync | carried from `execution.md` T1–T4 | ADVISORY |

## 8. Design Conformance

| Item | Evidence | Result |
|---|---|---|
| DD-1 (amended A1): one code edit | `bin/routing.js:842`; falsifier re-run red | PASS |
| DD-2: Argon has no `wrapperModel` | JSON | PASS |
| DD-3: mitigation documented | `docs/model-routing.md:253-255`; CHANGELOG "Mitigation" | PASS |
| DD-4: reopen-path sentence | `docs/model-routing.md:255-257` | PASS |
| DD-5: order Argon → Flash ×3 → Claude | JSON `models[]` | PASS |
| DD-6 (extended): rebase by role; registry-clone seam | tests 66, 69, 82, `(g)`, `(h)`, `(i)`, `:297`; Cursor id at `:337` untouched | PASS |
| DD-7 (A4): example is the Implementer wrapper with `flash` | constitution `:841-851` | PASS |
| DD-8 (A5): qualify, don't restructure | Each of the four bullets matches the shipped text, including the first bullet's wording as corrected in place during T5 (annotated in §17 and recorded in `execution.md` "Decisions made"). Nothing outside the four sites plus one CHANGELOG clause changed (`--numstat`) | PASS |
| CHANGELOG quote-check (KZ-002) | All clauses were re-checked at the first validation. The T5 clause, "Step 8E's `/agents` check and wrapper list in `/akili-constitution` now match the skipped Leader and Reviewer", matches `:833-837` and `:872-879`. The "plain re-run degrades" clause still rests on design P-14 and was not re-run | PASS |
| Proposal alignment | Intent, scope and non-goals hold. Two wordings differ from what shipped, and both were superseded by approved decisions: (a) the Proposed Outcome's "still writes a valid wrapper for every role whose tier routes to Argon" shipped as its "or skips with a reason" branch (Q1); (b) the ADDED list names `-medium`/`-low`, but only `-high` shipped (Q3). Every success criterion passes as written | PASS (noted) |
| Cross-document figures | See below | **WARN (W4, carried)** |

**W4: figures that contradict each other (carried, user-accepted).**

| Figure | Where | Contradiction |
|---|---|---|
| Rejected wrapper candidates | `requirements.md` §4: 5 Argon spellings + "**nine** other candidates", i.e. 14 | Design P-3 lists **16** (5 + 11); `docs/model-routing.md:248` also says 16 |
| Candidates "given" | `docs/model-routing.md:248`: "rejected all 16 candidate values **it was given**" | Design P-2 shows two runs of 5 and 14 values, so **19** were given, of which `flash`, `pro` and `inherit` loaded |
| Retired-id hits in tests | Design P-8: "**9** hits" | Re-running the same grep at `b8289f6` returns **10** lines |

**Figures that agree, re-checked after A5:**

| Figure | Check |
|---|---|
| Budget | 5 tasks / ~170 LOC / 8 rounds in `tasks.md:11`, the `execution.md` Doc Control row, and design §17 |
| Tripwire | 5 / ~200 / 8, the same in `tasks.md` and `execution.md` |
| Actual LOC | ~174 = 151 + 23. T5's `--numstat` sums to 14+/9- = 23 |
| Review rounds | 7 = 5 + 2 (T5 FAIL + PASS) |
| Tests | 259 / 136 |
| Pack | 280 files |

Not findings:

- The net diff is 109+/59- = 168, below the 174 sum, because T4 and T5 each rewrote a CHANGELOG line added earlier.
- `execution.md` T5 cites `:870-877`, while `tasks.md` cites `:870-874`; that is line drift from the edit itself.

## 9. Test Evidence Summary

| Evidence | Source | Re-run by validator |
|---|---|---|
| Unit 259/259; drift 7/7 | `npm test`, `node --test` | yes, at `33ddd3c` |
| Drift, `:842` and `tools` falsifiers red | scratch `git archive` copy | yes, at `20184cc`. T5 changed none of their inputs except the doc prose, and drift is still green |
| Fresh routing with packaged ids | scratch `validate-i1b` | yes, at `33ddd3c`: exit 0; wrappers `akili-implementer` and `akili-tester` only |
| `agy plugin validate` on the rendered wrappers | scratch plugin with a `plugin.json` | yes (1st): `"agents": 2`, no findings |
| Idempotent re-run | scratch | yes (1st): `no changes` |
| A retired id fails fast (I4) | `test-report.md` | no; P-15 evidence |
| Roster and labels | `agy models` | yes (1st): 5/5 |
| Accepted gaps A–E | `test-report.md` §9 | reviewed. Gap C, the live probe of which model `pro` runs on, stays with the user (DD-4) |

## 10. Agent Guide / Constitution Impact

`execution.md` has no `## Constitution Impact` block, and none was needed. No module was created or reshaped: T5 is prose only, and the code delta is one condition in an existing function. `AGENTS.md`'s descriptions of `bin/routing.js`, the registry and the templates are still accurate. **PASS.**

## 11. Remediation

Nothing blocks the archive. W1–W3 were remediated by T5 and are verified above. The rest is carried as the user decided.

| Item | Route | Owner |
|---|---|---|
| W4 | Correct `requirements.md` §4 ("nine" → "eleven"), design P-8 ("9" → "10"), and the doc's "it was given" → "16 rejected of 19 tried". Also refresh the `tasks.md` Status row to name A4/A5 | Kaizen retrospective / follow-up |
| W5 | The template-evolution Bug (design A2) | queued |
| W6 | Traceability lesson: cite the literal clause, not a paraphrase | Kaizen retrospective |
| New advisory | Re-wrap `docs/model-routing.md:242` to the paragraph's width | `/akili-quick`, optional |

## 12. Archive Readiness Recommendation

**Ready to archive.** All 5 tasks are `[x]` with a closing Reviewer PASS. Every FR/NFR clause has evidence I re-ran. The build is green at `33ddd3c`. W1–W3 are closed, and the T5 edits introduce no new stale claim.

Carry these into the Kaizen retrospective:

- W4–W6.
- The advisories.
- T5's own lesson: design wording that attributes a role set must name that set, or the ambiguity will be copied verbatim. Here it cost one round.
- The lesson behind W1: a code fix whose claim is also stated in rules text needs a sweep of that rules text (the KZ-changes--kaizen-loop-closure-2 family).
