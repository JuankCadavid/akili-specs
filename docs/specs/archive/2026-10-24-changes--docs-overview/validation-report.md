# Validation Report — docs-overview

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-overview` |
| Spec Name | A simple README and one overview that shows all of AKILI |
| Date | 2026-10-24 |
| Auditor | Independent T3 validation auditor, `claude-opus-5-5`. It did not implement or orchestrate this spec. Implementer `sonnet`, so author ≠ auditor holds |
| Branch / HEAD | `JuankCadavid/docs-overview` at `06564e6` |
| Base | `origin/dev` `dbc9275` (v2.36.0) |
| Runtime | Node v22.12.0, darwin |
| Inputs read | `CLAUDE.md` → `AGENTS.md`; `proposal.md`, `requirements.md`, `design.md`, `tasks.md`, `execution.md`, `test-report.md`, `move-ledger.md`, `judgment.md` |
| Missing baseline | `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md` and `docs/specs/general-setup/` do not exist in this repository. That is expected for a methodology package and not a finding. Conformance is checked against `AGENTS.md` and the spec documents |
| Deliverable | software (documentation). Video Mode, the final look and the delivery render do not apply |
| Visual Reference | none. `assets/akili-flow.png` is kept unchanged (FR-4) |

## 2. Summary

**Verdict: ready to archive with 4 accepted WARNs. There are 0 FAILs and 0 BLOCKED checks.** The implementation meets every requirement (FR-1…FR-17, NFR-1…NFR-6). The four verification commands pass at HEAD, and `npm test` gives 844 pass, 0 fail. The scope diff on `.claude bin package.json assets` is empty. Each WARN is a figure or wording drift that is cheap to fix. None of them breaks a requirement's intent.

| Result | Count |
|---|---|
| PASS | 54 |
| WARN | 4 |
| FAIL | 0 |
| BLOCKED | 0 |

| # | WARN | Remediation |
|---|---|---|
| W-1 | `CHANGELOG.md` `### Notes` says "The suite is 825 tests", but HEAD has 844. The 19-test `test/docs-overview-contract.test.js` suite added by `/akili-test` is not mentioned anywhere in the CHANGELOG | Change the Notes bullet to 844 and name the contract suite. Make this edit on the branch before merge (it is in-scope FR-17 text) |
| W-2 | `README.md:157` says "Every command and template carries this authorship notice". That overstates the facts (KZ-002): `.claude/templates/model-routing.section.md`, `model-registry.json` and `digests.json` carry no authorship. The source sentence at `dbc9275:README.md:954` said "every agent role template" | Reword to "Every command and agent role template carries this authorship notice." (one line, `/akili-quick` or a branch fix before merge) |
| W-3 | `execution.md` §3 figures disagree with its own rows. Review rounds read **15**, but the Attempts row sums to **14**: T2's running total double-counts its attempt 1, 4 → 6. "5 of 6 FAILs" is wrong: there are **5** Reviewer FAILs (T1, T2, T4, T6, T7). T1 says "40 moved / 8 already in / 4 kept over 51 rows", which sums to 52; the ledger holds **39** / 8 / 4 = 51 | `/akili-archive` corrects §3 (and the T1 tally) with correction closure, before the Kaizen metrics read them |
| W-4 | No `## Constitution Impact` block was recorded. The `AGENTS.md:16` bullet "`README.md` documents installation and methodology usage" is now only half true: the README is a landing page, and methodology usage moved to `docs/overview.md` and `docs/flow.md` | `/akili-archive` Constitution & Graph Sync records it as a pending guide item. This is a spec branch, so the edit itself waits for Apply Mode on `dev`. Suggested text: "`README.md` is the landing page (what AKILI is, install, first spec); `docs/overview.md` is the full capability map" |

## 3. Task Completion

All 9 tasks are `[x]` in `tasks.md`. Each one has an `execution.md` entry with a Leader re-run (VERIFIED) and a closing Reviewer **PASS**. There is no `REVIEW_SKIPPED`, `REVIEW_WAIVED`, HALT or Pivot.

| Task | Status | Attempts | Closing verdict | Evidence | Result |
|---|---|---|---|---|---|
| T1 Move ledger | `[x]` | 2 | Reviewer PASS | awk 43 = ledger 43 rows; dispositions valid; falsifiers executed | PASS |
| T2 flow.md | `[x]` | 2 | Reviewer PASS | 210 token quotes, 0 misses; security and marketing suites 31/0 | PASS |
| T3 cli.md, CONTRIBUTING, roadmap, dotfiles | `[x]` | 1 | Reviewer PASS | 0 dead Grok anchors; 4 valid (decision recorded); pack has no dotfiles | PASS |
| T4 overview.md | `[x]` | 2 | Reviewer PASS | 13/28 membership by first cell; bindings match; 16 pin regexes match | PASS |
| T5 Pin re-targets | `[x]` | 1 | Reviewer PASS | 6 + 9 mutations red on their assertions; 819 → 812 traced (7 README-section token tests) | PASS |
| T6 README rewrite | `[x]` | 2 | Reviewer PASS | 158 lines; install at `:72`; 12 headings; whole-README reading | PASS |
| T7 Hub, routing line, governance | `[x]` | 2 | Reviewer PASS | 3-column anytime table with links; Grok line checked against `HOST_KEYS` | PASS |
| T8 Derived test | `[x]` | 1 | Reviewer PASS | 13 tests; 17 Reviewer mutations; no count literals | PASS |
| T9 CHANGELOG and sweep | `[x]` | 1 | Reviewer PASS | 4 commands pass; sweep has no open hit (but see W-1: the 825 figure went stale at `/akili-test`) | PASS |

## 4. File Existence

`git diff --stat dbc9275..HEAD`: 26 files, +3,415 / −951 (spec folder included). Without `docs/specs`: 18 files, +1,685 / −951.

| Expected (design §3/§4) | Present at HEAD | Result |
|---|---|---|
| `docs/overview.md` (new) | 209 lines | PASS |
| `dotfiles/README.md` (new) | 25 lines; *Restore Neovim*, *Restore tmux* | PASS |
| `test/docs-overview.test.js` (new) | 477 lines, 13 tests | PASS |
| `docs/specs/changes/docs-overview/move-ledger.md` (new) | 99 lines; 43 H rows + 8 M rows | PASS |
| `test/docs-overview-contract.test.js` (added by `/akili-test`, outside design §4) | 417 lines, 19 tests. Test-phase additions are expected, and `test-report.md` §2 records it | PASS |
| Modified per §3: `README.md`, `docs/README.md`, `docs/flow.md`, `docs/cli.md`, `docs/model-routing.md`, `docs/openspec-comparison.md`, `CONTRIBUTING.md`, `docs/skills/diagram-design.md`, `docs/skills/governance.md`, `CHANGELOG.md`, and the 4 pin tests | All 15 present in the diff; no unlisted shipped file changed | PASS |

## 5. Build Integrity

| Command | Result at HEAD `06564e6` | Result |
|---|---|---|
| `npm test` | `# tests 844`, `# pass 844`, `# fail 0` | PASS |
| `npm run verify:cli` | exit 0; `13 commands \| 28 skills \| 8 resources (akili-specs v2.36.0)` | PASS |
| `npm run pack:dry-run` | exit 0; 326 files; lists `README.md` (8.4kB), `docs/overview.md` (22.1kB), `assets/akili-flow.png`; `dotfiles` hits 0 (NFR-6) | PASS |
| `git diff --check` (worktree and `dbc9275..HEAD`) | clean | PASS |
| `git diff --stat dbc9275 -- .claude bin package.json assets` | empty (NFR-3) | PASS |
| `git log --format=%s dbc9275..HEAD \| grep -vc '^\[SPEC:changes/docs-overview\]'` | 0 (NFR-4) | PASS |

`node bin/akili.js doctor --tool all` was not run: the installer did not change.

## 6. Requirement Coverage

The primary evidence is the `test-report.md` §7 matrix, cross-checked against `requirements.md` clause by clause. It has no `PRODUCT_BUG`, `FAIL`, flaky or `AUTOMATION_DEFERRED` entry. Its human-judgment gaps (§9) each have a named owner and are accepted. The auditor re-ran or spot-checked the clauses marked **(re-run)**.

| Req | Clause (quoted) → owner → evidence | Result |
|---|---|---|
| FR-1 | "the `##` list equals the seven headings"; "BUT it must NOT contain any other `##` or `###`"; "AND IT MUST ignore heading-like lines inside code blocks" → T6/T8 (e). Fence-aware awk on README gives exactly 7 + 5 **(re-run)** | PASS |
| FR-2 | "count is ≤ 200" (158 **(re-run)**); "line number ≤ 90" (`:72`); "BUT … no `<details>`" (T8 (f)); "AND IT MUST NOT … packing several sentences into one long line" → T6 Reviewer. Longest README line is 228 chars at `:121`, the security table row, which has two sentences, not a packed paragraph **(re-run)** | PASS |
| FR-3 | "≤ 3 sentences" (3 lines, `:28-30`); "5 bullets, one of them linking `docs/overview.md`" (`:34-38`); "rows for exactly those 4 terms" (`:42-45`); "AND IT MUST name marketing" ("social marketing", `:38`); "BUT it must NOT name a capability the package does not ship" → all five extras ship as commands/skills **(re-run)** | PASS |
| FR-4 | "`src` … inside a `<p align="center">`" (`:49-54`); "`alt` passes FR-10" (contract FR-4, (g)); "BUT it must NOT modify `assets/`" (scope diff empty) | PASS |
| FR-5 | "one command to install and one to check" (`:72`, `:81`); link to `docs/cli.md` (`:86`); "BUT … no per-tool `doctor --tool <x>`" ((j)); "AND IT MUST name Grok Bot only as a supported tool" (`:22`, `:67`; contract FR-5) | PASS |
| FR-6 | "each step names a command and an output file or effect" (`:92-96`); "`#practical-example` anchor resolves" ((i); `docs/flow.md:336`); "BUT … no sample `proposal.md`" (contract FR-6) | PASS |
| FR-7 | "the test fails, naming `akili-x`" ((b), mutation at T8); "each row's link target exists" ((i)); Windows note on `/akili-security` (`:121`); 8 CLI rows (`:128-135`); "BUT it must NOT describe a command with a claim its page does not make" → T6 Reviewer. Auditor spot-check on `/akili-security`, `/akili-seo`, `/akili-resume`, `/akili-marketing`, `akili update`, `check-update`, `notifications`: each matches its page **(re-run)** | PASS |
| FR-8 | "the target file exists" ((i)); "`docs/overview.md` is the first row" (`:143`); CONTRIBUTING, release-checklist, MIT and authorship line (`:155-156`). The extra sentence at `:157` is W-2 | PASS |
| FR-9 | "`shields.io` appears exactly 3 times"; the tools + OS line (`:22`); "BUT … not keep `### Supercharge…`" ((j), (e), contract FR-9) | PASS |
| FR-10 | "fails, naming `harness`"; "`Reviewer` … fails"; "AND IT MUST match whole words … case-insensitively" → T8 (g) with mutations | PASS |
| FR-11 | Skill scenario: "naming `new-skill`", "two groups fails", "binding cell … fails", "BUT … membership is by table row" → T8 (a). Grok scenario: "three `no` cells … links `docs/cli.md#grok-bot---tool-grokbot`" (`overview.md:130`), "AND IT MUST match the code" → T8 (h). 8 parts in order; 13 under-the-hood rows **(re-run)** | PASS |
| FR-12 | "`docs/flow.md` has a `## Practical Example`" (`:336`); "FR-6's link resolves" ((i)); "BUT it must NOT mark a section 'already in' on … a heading match alone" → T1–T6 Reviewer walks, ledger quotes token by token. Auditor sampled H28 (`flow.md:614`, `:630`), H38 and H43: the quotes hold at HEAD **(re-run)** | PASS |
| FR-13 | "the first link is `overview.md`" (`docs/README.md:9`); governance in both lists (`:16`, `:60`); anytime table `Command \| Use it to \| Reference` (`:36-43`) | PASS |
| FR-14 | "one line states it has no routing wrappers" (`model-routing.md:17`); "BUT … no behavior `bin/routing.js` does not have" (contract FR-14 on `HOST_KEYS`) | PASS |
| FR-15 | The 4 scenario mutations → T5 (6 executed, plus 9 by the Reviewer); "BUT it must NOT change any regex, token list or message text" and "AND IT MUST limit structural changes to … S1–S4" → T5 assert-pair diff, Reviewer PASS | PASS |
| FR-16 | (a)–(j) → T8; "passes without edits" (13 + 28 at HEAD); "a `docs/cli.md` line still saying `12 commands` … fails, naming the file and line" (T8 mutation, all 3 lines). Auditor re-ran P-7: 9 hits, all 13/28 **(re-run)** | PASS |
| FR-17 | Roadmap 3 bullets (`openspec-comparison.md:45-51`); dotfiles; `CONTRIBUTING.md:16` Repository Structure; `cli.md:5` Prerequisites, `:155` Local Checkout; `diagram-design.md:21` names `docs/overview.md`; governance item 5 (`:101`); CHANGELOG placeholder replaced; "BUT the root README must NOT contain `## Dotfiles` or `nvim`" (0). `SKILL.md:76` is the accepted Low risk **(re-run)** | PASS |
| NFR-1 | All four commands pass (§5) | PASS |
| NFR-2 | Heuristic grep over `+` lines of shipped `*.md`: 0 hits **(re-run)**; Reviewer readings | PASS |
| NFR-3 | Scope diff empty (§5) | PASS |
| NFR-4 | 0 non-prefixed commits; nothing pushed | PASS |
| NFR-5 | No shipped doc references `docs/specs/changes/docs-overview` (the only hit is the guard regex inside the contract test) **(re-run)** | PASS |
| NFR-6 | Pack lists README, overview and figure; no `dotfiles/`; `package.json` `files` does not list it | PASS |

## 7. Linting & Code Quality

The repository has no linter for Markdown or tests. `git diff --check` is the formatting gate, and it is clean. No stack skills apply from a `## Skill Map` (there is none in this repo).

### 4R advisory sweep (advisory only)

| Lens | Advisory |
|---|---|
| Readability | `overview.md:136` "Every command runs without these" sits above the HyperFrames row, which says a video spec stops at the gate. The row explains it, but the lead sentence is absolute |
| Readability | `test/docs-overview-contract.test.js` and `docs-overview.test.js` overlap on several README clauses, so one structural edit can fail two suites. Acceptable, but worth a header note |
| Reliability | `execution.md` labels `git diff --shortstat dbc9275 -- . ':!docs/specs'` "shipped files", but `test/` is not in the npm package. The figure (+1,268/−951 at `54f75d2`) is correct for what it measures |
| Risk | External deep links to removed README anchors (`#cli-commands`, `#the-kaizen-loop`) stop resolving. The design (§11) accepts this as a Low risk; `#install` survives |

### Carried forward from `execution.md` (unresolved ADVISORY)

| From | Advisory |
|---|---|
| T1 | Ledger line-number quotes were read at `23baa72`; match quote text, not lines |
| T2 | `docs/flow.md` `## Philosophy` and the Legacy row name three default personas, while the Methodology Contract lists four (with Tester). Possible `/akili-quick` |
| T2 | The Methodology Contract is a third restatement surface for the security pins; a back-link to §2b/§2c would help |
| T3 | `CONTRIBUTING.md:18` restates `:14`; could merge |
| T3 | P-14 (`#grok-bot---tool-grokbot`) checked only by the in-test slugger, not on a rendered page |
| T4 | `seo-audit` row says "its domain verification"; the source gives verification to `/akili-seo` (`scripts/gsc_verify.py`), which also needs a service-account key |
| T4 | The *Run directory* glossary row could say "tracked repository content" to match `:37` |
| T5 | `test/akili-marketing-docs.test.js:82` variable `readmeRow` now holds an overview row; titles at `:78`/`:96` still say README (FR-15 freezes message text) |
| T8 | Clause (d) scans fenced code too; one structural README change can light up (e) and (j); (j) matches hub rows against every table in `docs/README.md` |
| T9 | CHANGELOG "I want to..." uses three dots, the heading "…"; "a command table" understates the README's two command tables |

## 8. Design Conformance

| Check | Finding | Result |
|---|---|---|
| §7 README skeleton | 7 sections, hero, 3 badges, figure, CLI rows, plain-row wording (`/akili-audit`, `akili doctor --agents`, `akili routing`) as designed | PASS |
| §8 overview | 8 parts in order; groups 7 + 9 + 6 + 1 + 5 = 28; bindings 11 core / 7 conditional / 10 stack **(re-run)**; security-line constraint holds at `:37`, `:94`, `:184`, `:202` | PASS |
| §9 pin re-targets | Only S1–S4 (T5 Reviewer); 819 → 812 drop traced to the 7 README-section token tests | PASS |
| §10 derived test | Helpers and clauses (a)–(j) as designed; no count literal | PASS |
| Amendment §3 `CONTRIBUTING.md` (semver table) | Recorded under T1 *Decisions made* and as a dated note in the design cell; present in `CONTRIBUTING.md` (`Patch` row `:81`) | PASS |
| Amendment §3 `docs/cli.md` (`/akili-seo` setup) | Recorded under T1 and in the design cell; `### /akili-seo Setup` present (overview links `cli.md#akili-seo-setup`, resolved by (i)) | PASS |
| Amendment §8 `/akili-audit` "recommended remediation paths" | Recorded under T1 and §8; `overview.md:34` carries it | PASS |
| Amendment §7 `/akili-execute` row | Recorded under T6 and the dated note; `README.md:112` "each independently checked" matches `docs/commands/akili-execute.md:50-52` | PASS |
| Proposal intent and non-goals | U1–U6 met (954 → 158 lines, fixed order, install at `:72`). No change to `.claude`, `bin`, `package.json` or `assets`; figure unchanged; no push, tag or release | PASS |
| Proposal success criteria | All 8 met; "install within ~70 lines" holds: the code block opens at `:71`, the command is at `:72` | PASS |
| Cross-document figures: CHANGELOG | "825 tests" contradicted at HEAD | WARN (W-1) |
| Cross-document figures: execution.md | Rounds, FAIL count and ledger tally contradicted by its own rows | WARN (W-3) |
| KZ-002 quote-check of one-liners | 14 overview and README lines checked against their pages; 13 hold, 1 overstated (W-2) | WARN (W-2) |

### Cross-document figure check

| Figure | Asserted in | Contrasted with | Verdict |
|---|---|---|---|
| README 954 lines (before) | requirements §2/§4, design §12, CHANGELOG, execution T6 | `git show dbc9275:README.md \| wc -l` → 954. The proposal's 948 is dated `8679e25`, and its rebase addendum explains the difference | holds |
| README 158 lines (after) | CHANGELOG, execution T6 | HEAD `wc -l` → 158 | holds |
| 13 commands / 28 skills | requirements §4, design P-5, ledger header, verify:cli | `ls` → 13 / 28. The proposal's 12/27 are dated pre-rebase | holds |
| Bindings 11 / 7 / 10 | design §8, P-5, ledger | `binding:` tally → 11 core, 7 conditional, 10 stack | holds |
| 43 headings (25 / 18) | requirements §4, FR-12, design, ledger, T1 | fence-aware awk at `dbc9275` → 43; ledger H rows → 43 | holds |
| 9 P-7 hits | requirements §4, design P-7, ledger, T3, T8 | HEAD → 9 at `cli.md:247, 326, 327, 338, 339, 360 ×2, 377 ×2`, all 13/28 | holds (T8's "8" was a recorded slip) |
| Marketing README lines | design §12 "added 6 lines"; ledger "8 changed lines" | 948 → 954 is net +6; 8 lines changed. Both are true for what they measure | holds |
| Tests 819 → 812 → 825 → 844 | design §12/P-8 (819), execution T5 (812), T8 and §3 (825), test-report (844) | HEAD → 844; each step traced | holds |
| CHANGELOG "825 tests" | `CHANGELOG.md` Notes | HEAD → 844 | **contradicted (W-1)** |
| Review rounds 15 | execution §3, T9 running total | Attempts row 2+2+1+2+1+2+2+1+1 = 14; T2's running total jumps 4 → 6 | **contradicted (W-3)** |
| "5 of 6 FAILs" | execution §3 | Per-task entries: 5 FAILs (T1, T2, T4, T6, T7) | **contradicted (W-3)** |
| Ledger 40 moved / 8 / 4 over 51 | execution T1 attempt 2 | Ledger: 39 / 8 / 4 = 51 | **contradicted (W-3)** |
| LOC +1,268 / −951 | execution T9, §3 | `git diff --shortstat dbc9275 54f75d2 -- . ':!docs/specs'` → +1,268 / −951. At HEAD it is +1,685 (the contract test, after the log closed) | holds as dated |
| Budget ~1,350 / ~955, 20 rounds, tripwire 26 | design §13, tasks, execution | The proposal's ~1,250/~950, 22/28 are explicitly superseded by design §13 | holds |
| 13 under-the-hood mechanisms | FR-11, design §8 | overview `:105-117` → 13 rows | holds |
| Grok anchors 3 (task) vs 4 (HEAD) | tasks T3 vs execution T3 | HEAD → 4; decision recorded (ledger H08 requires the 4th) | holds (recorded) |

## 9. Test Evidence Summary

| Suite | Tests | Result | Source |
|---|---|---|---|
| `test/docs-overview.test.js` (T8, author) | 13 | 13 pass / 0 fail **(re-run)** | T8 + 17 Reviewer mutations |
| `test/docs-overview-contract.test.js` (`/akili-test`, Tester on `opus`) | 19 | 19 pass / 0 fail **(re-run)** | 30 Tester mutations, all red on their assertions |
| Re-targeted pin suites (4 files) | in `npm test` | green | T5: 6 + 9 mutations |
| Full `npm test` | 844 | 844 pass / 0 fail **(re-run)** | §5 |

Accepted gaps (from `test-report.md` §9, still accepted): plain language and packed lines (Reviewer); FR-3/FR-7 BUT meaning checks (Reviewer, plus the auditor's spot-check above); ledger completeness (a shipped test must not read the spec folder); P-13/P-14 rendered anchors (the user's PR preview); NFR-3 pinned to `dbc9275`.

## 10. Agent Guide / Constitution Impact

| Item | Finding | Result |
|---|---|---|
| `## Constitution Impact` in `execution.md` | Absent. No module was created or reshaped (docs and tests only), so a module-guide block was not strictly owed | — |
| `AGENTS.md:16` "`README.md` documents installation and methodology usage." | Stale. The README now covers what AKILI is, install and a first spec; methodology usage lives in `docs/overview.md` / `docs/flow.md`. `docs/overview.md` is not named in Repository Purpose | **WARN (W-4)**, pending for `/akili-archive` |
| `dotfiles/README.md` | Docs inside an existing, unshipped folder; no guide entry needed | PASS |
| `.claude/skills/diagram-design/SKILL.md:76` "documented in the project README" | Accepted Low, out of scope (NFR-3); follow-up `/akili-quick` (CHANGELOG *Known debt*) | accepted risk |

## 11. Remediation

| # | Fix | Where / when | Size |
|---|---|---|---|
| W-1 | CHANGELOG Notes: "825" → "844", and name `test/docs-overview-contract.test.js` (19 tests) | On the branch before the PR into `dev` | 1–2 lines |
| W-2 | `README.md:157`: "Every command and template" → "Every command and agent role template" | On the branch before the PR (or `/akili-quick`) | 1 line |
| W-3 | `execution.md` §3: rounds 15 → 14; "5 of 6 FAILs" → "4 of 5 FAILs were FR-12 gaps (T4 also had an FR-11 glossary gap; T7 was FR-13)", or similar; T1 tally 40 → 39 moved | `/akili-archive`, with correction closure (grep `15`, `6 FAILs`, `40 moved` across the spec folder) | 3 lines |
| W-4 | Guide sync of `AGENTS.md:16` | `/akili-archive` Constitution & Graph Sync → pending item; applied in Apply Mode on `dev` | 1 line |

Spec drift recommendation: W-1 and W-2 are implementation text (fix the docs). W-3 is spec-record text (fix at archive). W-4 is a guide sync (archive pending item). None needs a new spec or a Pivot.

## 12. Archive Readiness Recommendation

**Ready with accepted WARNs.** All 9 tasks are `[x]` with a Reviewer PASS, there are no FAILs, the tests cover every requirement and scenario, and the execute-time design amendments are recorded and consistent. Accept W-1…W-4, or apply W-1/W-2 on the branch first (about 3 lines), then archive:

```text
/akili-archive changes/docs-overview
```

## Post-validation Resolution (Leader, 2026-10-24)

The WARNs that had a single correct answer were applied after this report. The user's instruction was to answer routine gates with the recommended option.

| WARN | Resolution | Evidence |
|---|---|---|
| W-1 | `CHANGELOG.md` Notes now says **844 tests**. The *Changed* bullet on tests names `test/docs-overview-contract.test.js` (19 tests) | `npm test` → `# tests 844`, `# pass 844`, `# fail 0` |
| W-2 | `README.md:157` → "Every command and every agent template carries this authorship notice." The four agent templates (`.claude/templates/{leader,implementer,reviewer,tester}.md`) and every command carry it; the data files are no longer claimed | `grep -c Authorship .claude/templates/*.md` → 1 per persona, 0 for `model-routing.section.md` |
| W-3 | `execution.md`: review rounds corrected to **14** in §3 and in every per-task running total from T2 on (T2 was first written as 6, not 5). The FAIL count is now "5 of 5 FAILs", and the T1 ledger tally reads 39 moved. Swept the spec folder for `15/26` and "5 of 6": no other hits outside this report's own finding text | `grep -no "review rounds [0-9]*/26" execution.md` → 2, 4, 5, 7, 8, 10, 12, 13, 14 |
| W-4 | Left to `/akili-archive`, as recommended: a pending guide-sync item for `AGENTS.md:16` | — |
