# Validation Report — Modern Web Guidance

> **Re-validation verdict (2026-11-17, after remediation): PASS.** Both warnings are resolved. See §13.
> - **W-1 RESOLVED** (JC option A). `modern-web.md` *In a task* now runs search and retrieve before the UI edits and checks the built code after them. The Build route step 4 and *Platform guidance* item 3 carry the same order, before `polish`.
> - **W-2 RESOLVED** (JC option A). FR-9 THEN now reads "an availability and pin note, never a skill to assign; FR-2 BUT", which matches FR-2 BUT, DD-15 and the shipped Step 8D row.
> - All six gates pass on the working tree: `npm test` **2111/2111**, `pack:dry-run` 430 files.
> - Counts: **PASS 9 · WARN 0 · FAIL 0 · BLOCKED 0**. Three notes and two advisories, none gating.
> - **Q-1 ruled (JC option A, 2026-11-18 7:37 AM America/Bogota):** the `git diff --numstat` count (1,467 added lines, excluding `docs/specs/`) meets the ~1,470 budget. See §13.6.
> - **Archive readiness:** ready once the remediation is committed with the `[SPEC:changes/modern-web-guidance]` prefix and logged in `execution.md` (N-3).
>
> The first validation follows unchanged as history (§1–§12).

> **First validation verdict: PASS WITH WARNINGS.** The implementation does what the spec asks.
> - All 14 tasks are `[x]`, each with a final Reviewer PASS.
> - All six build gates pass: `npm test` 2109/2109, `pack:dry-run` 430 files.
> - Every FR-1 to FR-11 and NFR-1 to NFR-4 clause has an owning task, shipped text and test evidence.
> - **0 FAIL, 2 WARN.** W-1: the order of the execute-time guide check. W-2: FR-9's "use when present" no longer matches the amended FR-2. Both need a JC ruling (§11). Neither blocks the archive if JC accepts it.
> - The spec ships no web UI, so the UI design review does not apply.

## 1. Document Control

| Field | Value |
|---|---|
| Spec | `docs/specs/changes/modern-web-guidance/` |
| Branch / HEAD | `feat/modern-web-guidance` @ `ae5a918` (pushed, equal to `origin/feat/modern-web-guidance`) |
| PR | #146 into `dev`, OPEN. PR 1 (#145, T1–T8) was merged into `dev` at `6698b17` |
| Spec range | `688b35a~1..HEAD`: 27 commits, every one prefixed `[SPEC:changes/modern-web-guidance]` |
| Date | 2026-11-17 |
| Validator | T3 auditor (opus). Independent of the Implementers (sonnet) and of the session Leader |
| Skills | `cognitive-doc-design` (this report). `systematic-debugging` was not needed: no failure appeared |
| Baseline docs | None: no `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md` or `docs/specs/general-setup/` in this repo |
| Rulings in force (checked, not re-litigated) | F-5 `ENABLE_FILE_LOGGING=false`; FR-7 "unchanged in behavior"; FR-4 kept (a non-ready state may WARN in validate, never fail, stop or block); budget ~1,120 → ~1,400 → ~1,470; the `akili-audit.md` frontmatter fix folded into T12; the renamed test file `test/web-platform-guidance-coverage.test.js` kept |

## 2. Summary

| Check | Result | Note |
|---|---|---|
| Task completion | PASS | 14/14 `[x]`. Each task has a final Reviewer PASS and a non-author re-run marked VERIFIED |
| File existence | PASS | Every design §4 path is present. Two extra paths are each traced to a task or a ruling |
| Build integrity | PASS | All six gates exit 0. The Windows CI legs were still running when this report was written |
| Requirement coverage | PASS WITH WARNINGS | W-1 (FR-7 AND execute), W-2 (FR-9 THEN against FR-2 BUT) |
| Linting & code quality | PASS | 4R advisories only (§7) |
| Design conformance | PASS | No figure is contradicted between the spec documents. Two notes (§8) |
| Test evidence | PASS | The test report's matrix was cross-checked and reproduced |
| Agent guide / Constitution Impact | PASS | `AGENTS.md` *Design Skills* updated. No `## Constitution Impact` notes, and none were needed |
| UI design review | Not applicable | The spec ships rule text and docs only, with no web UI. The detector was not run |

Counts: **PASS 8 · WARN 2 · FAIL 0 · BLOCKED 0**. The eight are the per-check rows, with requirement coverage counted inside the two WARNs.

## 3. Task Completion

| Task | `tasks.md` | Final verdict (`execution.md`) | Attempts |
|---|---|---|---|
| T1 security review | [x] | PASS, verdict `PASS` recorded with every scan verbatim | 2 |
| T2 `modern-web.md` | [x] | PASS | 2 |
| T3 bridge row and version | [x] | PASS | 1 |
| T4 matrix edits | [x] | PASS | 1 |
| T5 governance rule 4 | [x] | PASS | 1 |
| T6 specify pointer (+ FR-7 amendment follow-up) | [x] | PASS | 1 (+1) |
| T7 test pointer | [x] | PASS | 1 |
| T8 validate pointer | [x] | PASS | 1 |
| T9 audit `modern-web` mode | [x] | PASS | 1 |
| T10 propose source | [x] | PASS | 2 |
| T11 Step 8D | [x] | PASS | 2 |
| T12 docs | [x] | PASS | 1 |
| T13 CHANGELOG | [x] | PASS | 1 |
| T14 cross-cutting | [x] | PASS | 3 |

The Summary records no REVIEW_WAIVED and no REVIEW_SKIPPED. Review rounds: 21 of ~24.

## 4. File Existence

Command: `git diff --name-status 688b35a~1..HEAD`. It lists 33 files: 2 added shipped files, 2 added test files, 7 added spec documents, and 22 modified.

| Design §4 path | Present |
|---|---|
| `.claude/skills/impeccable-bridge/references/modern-web.md` (new) | A, 147 lines, 13 sections, matching T2 Done criteria |
| `impeccable-bridge/SKILL.md` (*Roles* row, version 2.2) | M |
| `references/design-routing.md` | M |
| `docs/skills/governance.md` | M |
| 6 command files: specify, test, validate, audit, propose, constitution | M (6/6). `akili-execute.md` is not edited, per DD-12 |
| Docs: `impeccable-bridge.md`, `overview.md`, `cli.md`, `flow.md`, `commands/akili-audit.md`, `commands/README.md`, `AGENTS.md`, `CHANGELOG.md` | M (8/8) |
| `test/modern-web-guidance.test.js` (new) | A, 89 tests |

These files are outside the design §4 table, each one traced:

| Path | Trace |
|---|---|
| `docs/skills/README.md` | T11's forward pointer → T12 restatement (FR-2 AND) |
| `docs/skills/video-production.md` | T12 scope |
| `test/web-platform-guidance-coverage.test.js` | `/akili-test` gap tests, kept by JC ruling D-1 |
| consumer tests: `install-cursor`, `impeccable-bridge`, `design-skill-routing`, `design-skill-routing-coverage` | Each task's `Consumers` field |

The non-goals hold: `bin/`, `scripts/`, `package.json` and `.github/` are untouched in the range (`git diff --stat` is empty).

## 5. Build Integrity

These commands were run by the validator on Node v22.23.4 at `ae5a918`, with a clean tree:

| Command | Exit | Result |
|---|---|---|
| `npm test` | 0 | 2109 tests, 2109 pass, 0 fail, 0 skipped |
| `npm run verify:cli` | 0 | 14 commands, 32 skills, 1 plugin, 8 resources (akili-specs v2.44.0) |
| `npm run pack:dry-run` | 0 | 430 files, 3.7 MB packed, 8.5 MB unpacked |
| `git diff --check` | 0 | clean |
| `node bin/akili.js install --tool all --dry-run` | 0 | installed 0, skipped 405 (identical 313, differs 92). The only MWG path planned is the bridge's own `references/modern-web.md`. "Differs" comes from older copies in the real HOME |
| `node bin/akili.js doctor --tool all` | 0 | All targets HEALTHY, ok 43, missing 0. 56 entries differ, from the real HOME as above |
| `node --test test/modern-web-guidance.test.js` | 0 | 89/89 |
| `git grep 'modern-web-guidance@latest'` outside `docs/specs` and `test` | — | 0 hits |
| `find .claude/skills -type f \| wc -l` | — | 328 = `SKILL_FILE_EXPECTED` 321 + 7 `akili-panel` files |

PR #146 CI at the time of writing: ubuntu Node 18/22 and macOS Node 18/22 SUCCESS, `release-status` SUCCESS, and both Windows legs still running. The Node 18 legs satisfy the proposal's "Node 18 and 22" success criterion on two OSes. The Windows result is a merge precondition, not a validation input. No Local Environment contract applies.

## 6. Requirement Coverage

The primary evidence is the test report §7 matrix, cross-checked against the shipped text at HEAD.

| Req | Owner | Shipped text (evidence) | Tests | Result |
|---|---|---|---|---|
| FR-1 THEN / AND / BUT / AND IT MUST | T1 | `execution.md` T1 record: blobs `7483c781…` and `d6456956…` and shasum `06a05dda…` matched; the five named items classified and mapped; exit-2 rule and `perl` used; T1 commit `0349c6c` precedes the first wiring commit `cc888bc` | recorded evidence | PASS |
| FR-1 Review fails | T1 | Not triggered (verdict `PASS`); accepted gap in the test report §9 | — | PASS |
| FR-2 THEN, AND (3 selectors), AND IT MUST (outcome per selector), BUT, AND (restatements) | T5, T11, T12 | `governance.md` env-provided paragraph and rule 4. The obligation-keyed sweep by the validator found no stale "only instance" restatement (§8) | `governance (FR-2…)` ×4, `docs (FR-2 AND)` ×3 | PASS |
| FR-3 Web UI / Not web | T4, T6 | `design-routing.md` card, *Supporting line*, `Platform` field (`none — native` at ENV-3), *Platform guidance* | `matrix (FR-3)`, `(DD-4)` | PASS |
| FR-4 six states, AND, AND IT MUST telemetry, BUT, AND IT MUST NOT block | T2, T4, T7–T9 | `modern-web.md` *Gate* (6 rows, 5 continue); "No state stops, fails or blocks". JC FR-4 ruling: the validate sentence reads "recorded, never failed on" | `rules file (FR-4…)`, new #2–#5 | PASS |
| FR-5 default / override / `@latest` BUT | T2, T11, T14 | *Pin* table; `pin <x.y.z>` grammar; precedence row; 0 shipped `@latest` | `rules file (FR-5…)`, `cross-cutting (FR-5 BUT)` 430/430 | PASS |
| FR-6 placement, BUT, trigger containment | T2, T4 | *Disclosure* table; *Role* row 3 ("that description never triggers it") | `rules file (FR-6)`, new #1, #7 | PASS |
| FR-7 THEN specify, AND test, AND validate, BUT, AND IT MUST (amended) | T6–T8, T14 | Pointer lines name `modern-web.md` → *Test and validate reads*; specify bullet carries "unchanged in behavior" | `specify`, `test`, `validate`, `cross-cutting` | PASS |
| **FR-7 AND execute** | T4, T2 | See **W-1** | `matrix (DD-16)`, `rules file (FR-7)` | **WARN** |
| FR-8 both scenarios | T9, T10, T2 | `akili-audit.md` *Modern Web Mode*, Usage dispatch, `modern-web.md` *Audit scan* steps 1–7, F-5 flag in step 4 | `audit (…)`, `propose (FR-8)` ×4, new #8 | PASS |
| **FR-9 THEN** | T11 | See **W-2** | `constitution (FR-9…)` ×5 | **WARN** |
| FR-9 BUT | T11 | "never write the MWG row for a project with no web UI or assert that the skill is installed" | `constitution` | PASS |
| FR-10 both scenarios | T2, T12, T14 | No `bin/` change. Counts move by +1 file only (`SKILL_FILE_EXPECTED` `+ 1 modern-web.md`), 32 skills. Install routes: 3 verified, Cursor and OpenCode unverified, Grok Bot absent | `cross-cutting (FR-10 THEN)`, `rules file (FR-10)` | PASS |
| FR-11 THEN / AND / BUT | T12, T13 | Bridge page section, `overview.md`/`cli.md` rows, `AGENTS.md:82`, CHANGELOG; Apache-2.0 + Google Chrome on each; eval figures and MDN only under "Upstream's own statements" | `docs (FR-11…)`, `changelog (…)` | PASS |
| NFR-1 to NFR-4 | T14 | `engines` unchanged; no MWG bytes; rules held once; gates green (§5) | `cross-cutting (NFR-…)` | PASS |

### W-1: the execute-time guide check runs before the edits, not after

- **Clause (FR-7 AND):** "`/akili-execute`'s Build route runs the gate and, when `ready`, searches and retrieves the guides for the task's platform capabilities before UI edits, **then checks the code against them (upstream *Step 3*)**".
- **Upstream *Step 3*** ("Verify Guidance Compliance", pinned `SKILL.md:41-46`): "When generating or modifying code, cross-check the implementation against the retrieved guide **before concluding**". This is a check after implementation.
- **Shipped:** `modern-web.md:95` reads "3. Check the code against them (upstream's *Step 3*), **before the UI edits**". *Platform guidance* runs as Build route step 4, before the craft floor (`design-routing.md`). No later Build route step re-checks the built code against the retrieved guides. Step 8 only reports the MWG line.
- **Effect:** the compliance check of the built code is moved to `/akili-validate`'s *Test and validate reads* and to the Reviewer. Execute never cross-checks its own output. Design §8.1 reads "then check the code against them" without "before the UI edits", so the shipped text is narrower than both the design and the requirement.

### W-2: FR-9's "use when present" no longer matches the amended FR-2

- **Clause (FR-9 THEN):** "it may write an MWG row marked environment-provided (**"use when present"**), with an optional exact-version field".
- **Shipped** (`akili-constitution.md` Step 8D item 3): the row is "an availability and pin note, never a skill to assign", with *When to load* "never assigned or loaded directly; …". The literal marker "use when present" does not appear. The T11 Reviewer recorded this as an ADVISORY.
- **Root cause:** a spec-internal tension. The FR-2 BUT amendment (judgment-day S-4) says a Skill Map MWG row is "an availability and pin note only". FR-9's parenthetical predates it. The design (§8.4, DD-15) followed FR-2. The shipped text is therefore right by FR-2 and design, and literally short of FR-9.
- **Residual, related (advisory):** Step 8D item 2 tells the Leader to assign every Skill Map skill, and `.claude/templates/leader.md:25` uses the Skill Map as default assignments. Neither has an MWG carve-out. The guard against the S-4 bypass is only the row's own "never assigned or loaded directly" text, plus governance rule 4 and the specify bullet.

## 7. Linting & Code Quality (4R advisory, labelled ADVISORY: none gates)

**Validator 4R sweep**

| Lens | Advisory |
|---|---|
| Risk | Step 8D item 4's `platform guidance (modern-web-guidance, …)` field names MWG inside the Skill Map `### Design routing` block without the "never assigned" qualifier, and item 2 and `leader.md:25` have no carve-out (see W-2) |
| Readability | The CHANGELOG security bullet says the verdict holds "on the condition that the handling in `docs/skills/impeccable-bridge.md` stays in place". The handling lives in `references/modern-web.md`; the docs page is its summary |
| Reliability | The Windows call form is `UNVERIFIED` (`modern-web.md:74`). It is disclosed in the shipped text and the CHANGELOG (T1 F-3) |
| Readability | `modern-web.md` *Gate* says the gate is "probed once per session" while FR-4 says it runs "before every AKILI-directed call". This is consistent through design §8.1 (the state is reused), but not stated in those words |

**Carried forward from `execution.md`, unresolved and recorded only**

| Group | Items |
|---|---|
| Upstream / security (T1) | F-2 guide-text `@latest` (since covered by *Untrusted output*); F-3 Windows prefix syntax; F-4 `legacy-scan` traced, not read; `ldr` offset note |
| Rules text wording | T4: Build route intro does not mention ENV-0 for steps 4 and 8. T5: the *Vendored third-party* intro still lists four env skills without MWG; rule 4 is one dense paragraph. T9: "scan is not offered" vs a `not applicable` report; "behaves as today" phrasing. T10: no "unless the user asks" escape for modern-web findings. T11: overlong stop sentence. T12: "Every call" vs "every AKILI-directed call" on the docs page; `docs/commands/akili-audit.md` omits "unless you opt in"; `kaizen.md:24` and `akili-archive.md:70` do not name `modern-web-*.md` as a non-drift source; `AGENTS.md:82` omits the test/validate selector. T13: "direction, page mode and craft" wording; missing blank line |
| Test robustness | T2: verbatim-sentence regexes. T4: substring heading check. T6: only the `platform` bullet is checked. T9: P-23 reader lines not pinned. T10: one-line paragraph extraction. T11: `constitutionItem(n)` boundary. T12: Grok table-block check; `\b` binds only to the first alternative. T13: `changelogBullet()` whole-file search. T14: `NPM_OWN` mirrors npm-packlist; no OS-junk skip; NFR-1 scan misses `http.get`; `CONDITIONAL` judges blocks; NFR-2 cannot see renamed copies |

Under *Scope only grows through approval*, none of these becomes a task in this spec.

## 8. Design Conformance

**Cross-document figure check**

| Figure | requirements | design | tasks | execution | test-report | CHANGELOG / shipped | Result |
|---|---|---|---|---|---|---|---|
| Gate states | 6 | 6 | 6 | — | 6 | 6 (`modern-web.md`, CHANGELOG, bridge page) | consistent |
| Selectors | 3 | 3 | 3 | — | 3 | 3 (governance, CHANGELOG, `modern-web.md`) | consistent |
| Step 8D item 4 fields | — | +1 after motion, pointer last | 6 → 7 | — | 7 | 7 in `akili-constitution.md`; `coverage.test.js:132` "seven fields" | consistent |
| `npm test` | 2012 (baseline) | — | — | 2101 (T14) | 2101 → 2109 | — (no count in CHANGELOG) | consistent; validator 2109 |
| Packed files | — | +1 | — | 430 | 430/430 | — | consistent; validator 430 |
| `SKILL_FILE_EXPECTED` | +1 | 320 → +1 | +1 term | — | cited | `… + 2 + 1` = 321 | consistent |
| LOC budget | — | ~1,120 → ~1,400 → ~1,470 | same | same + ruling entry | ~1,470, actual ~1,469 | — | consistent (note N-1) |
| Review rounds | — | ~20 → ~24 | ~24 | 21 | — | — | consistent |
| Rule 4 restatements | — | P-16 list | T5/T11/T12 | T11 forward pointer | — | CHANGELOG *Changed* names six files: `flow`, `skills/README`, `video-production`, `overview`, `cli`, `AGENTS.md`. All six carry the per-selector outcome; `akili-constitution.md` item 3 also does | consistent |

**Notes (no finding)**

- **N-1 (LOC measurement):** `git diff --numstat 688b35a~1..HEAD -- . ':!docs/specs'` counts **1,443** inserted lines (48 deleted). The ~1,469 figure in the records is the sum of per-task increments, and rework churn makes that sum higher. Both are within ~1,470. Counted as insertions plus deletions (1,491), the total would exceed it. The spec's convention, from the T2 entry "147 rules + 275 test", is additions.
- **N-2 (stale status prose):** the `execution.md` *Summary* says "PR 2 (T9–T14) is local and unpushed". At validation it is PR #146, pushed at `ae5a918`. This was true when it was written. Refresh it at archive.

**Proposal intent, scope and non-goals:** honored. MWG is environment-provided via the bridge (D1 B). The pin is a default plus a Skill Map override (D2). `legacy-scan` lives only in `/akili-audit` (D3). Nothing is vendored or installed. AKILI's Node ≥ 18 floor is kept. No `@latest` ships. The T-sec verdict came before any wiring. The success criteria are met, with the Windows CI legs pending.

**Execute-time amendments:** F-5 is in design §1/§8.1/§8.3/DD-14 and shipped in *Call forms* and *Audit scan* step 4. The FR-7 amendment is in requirements §1 and shipped in the specify bullet. Both conform.

## 9. Test Evidence Summary

| Source | Evidence |
|---|---|
| Author suite | `test/modern-web-guidance.test.js`, 89/89 (validator re-run). Falsifier reds are quoted in each task entry |
| Gap suite | `test/web-platform-guidance-coverage.test.js`, 8 tests. Each was red against the mutated shipped file, then byte-restored (test report §3) |
| Consumer suites | `impeccable-bridge`, `install-cursor`, `design-skill-routing`, `design-skill-routing-coverage`, `backend-skill-routing-coverage`, `design-eval-contract`, `docs-overview`, `akili-security-command`: all green in the 2109 run |
| Accepted gaps | Agent behavior (requirements §8). The FR-1 fail path never fired. Install routes need the network (NFR-1) |
| Not covered by any test | W-1's ordering. No test asserts that the check runs after the edits; `rules file (FR-7)` pins the sentence as shipped |

## 10. Agent Guide / Constitution Impact

- `execution.md` has no `## Constitution Impact` section. No task created or reshaped a module, so none is owed.
- The root `AGENTS.md` changed in line with the spec: the *Design Skills* list gains `modern-web-guidance` (`:82`), and the `video-production` line carries the per-selector outcome (`:53`). No module guide is affected.

## 11. Remediation

| ID | Level | Item | Options for JC |
|---|---|---|---|
| W-1 | WARN | FR-7 AND execute: the guide check runs before the UI edits, not after them (upstream *Step 3*) | **A** Fix the implementation: change `modern-web.md:95` to check the built code after the edits, before the completion report, and add a Build route mention near step 8. A small follow-up, `/akili-quick` sized only if JC deems it copy-level; otherwise a Lite spec. **B** Fix the spec: amend FR-7 to accept a pre-edit check, with validate and the Reviewer as the post-edit check. **C** Accept as a recorded follow-up for the next MWG spec |
| W-2 | WARN | FR-9 "use when present" against FR-2 BUT "availability and pin note only" | **A** Fix the spec: amend FR-9's parenthetical to "an availability and pin note" (correction closure: sweep the spec folder). **B** Fix the implementation: add "use when present" to the row text. Not recommended, because it reads against "never loaded directly". **C** As A, plus a follow-up proposal for an MWG carve-out in Step 8D item 2 and `leader.md:25` |
| N-1, N-2 | Note | LOC measurement; stale PR status prose | Refresh at `/akili-archive` |

## 12. Archive Readiness Recommendation

**Ready to archive once JC rules on W-1 and W-2.** There are no FAIL findings, the build gates are green, and every clause is covered. If JC accepts both warnings (option C for W-1, option A for W-2), the next step is:

```text
/akili-archive changes/modern-web-guidance
```

Before merging PR #146, confirm that both Windows CI legs went green.

## 13. Re-validation after remediation

**Verdict: PASS.** W-1 and W-2 are resolved. No new finding gates. Run by the same T3 auditor (opus) on 2026-11-17, against `ae5a918` plus the uncommitted remediation. The auditor edited only this report.

### 13.1 JC rulings

| Item | Ruling | When |
|---|---|---|
| W-1 | **Option A.** Fix the shipped text at `modern-web.md:95`, and every mirror of it, so the check against the guides (upstream's *Step 3*) runs after the UI edits, not before | 2026-11-17 7:07 PM America/Bogota |
| W-2 | **Option A only.** Amend FR-9 *Web UI project* THEN to "availability and pin note". Document Control records JC's approval. No item-2 or `leader.md` follow-up unless a new gate requires one | 2026-11-17 7:07 PM America/Bogota |

### 13.2 Remediation reviewed

The diff covers 4 files: 33 lines added and 8 removed, including the 2 / 1 in `requirements.md`.

| File | Change |
|---|---|
| `.claude/skills/impeccable-bridge/references/modern-web.md` | *In a task* has five items: 1 search, 2 retrieve, 3 make the UI edits, 4 after the edits check the built code against the retrieved guides (upstream's *Step 3*), 5 record the guide ids. An intro line states the order |
| `.claude/skills/impeccable-bridge/references/design-routing.md` | Build route step 4 now reads "search and retrieve now; after the UI edits and before `polish` (step 7), check the built code against the retrieved guides". *Platform guidance* gains item 3 **After the edits.**, and Report becomes item 4. The step numbering is unchanged |
| `test/modern-web-guidance.test.js` | Two new tests: the order inside *In a task*, and the after-edits check in step 4 and in *Platform guidance*. Two regexes are loosened to fit the new wording |
| `docs/specs/changes/modern-web-guidance/requirements.md` | FR-9 THEN is amended. A new Document Control row, *Validate-time amendment (W-2, FR-9)*, records the ruling |

### 13.3 W-1: resolved

| Check | Evidence | Result |
|---|---|---|
| FR-7 AND (verbatim, `requirements.md:199`) | "searches and retrieves the guides for the task's platform capabilities before UI edits, then checks the code against them (upstream *Step 3*)". Shipped items 1–2 come before item 3 (the edits), and item 4 comes after it. Every term of the clause is present | PASS |
| Upstream *Step 3* ("cross-check the implementation against the retrieved guide before concluding") | Item 4 checks the built code after the edits, and the Build route places it before `polish` (step 7) and the completion report (step 8) | PASS |
| Where an agent runs it | The Build route step 4 line carries both halves, so an agent that reads only the numbered steps still meets the after-edits check. *Platform guidance* item 3 restates it and points to *In a task* item 4. Step 8 reports the MWG line only, which is correct | PASS |
| Step 5 craft floor ("immediately before UI edits") | No conflict. Step 4 does search and retrieve, step 5 reads the craft floor, then the edits happen, then the check runs. Step 5 is correctly unchanged | PASS |
| *Disclosure* | Unchanged. It still holds the report line, the guide ids and what each one changed. *In a task* item 5 feeds it | PASS |
| Validator mirror sweep (keyed on the obligation, not the phrase) | Searched `.claude/`, `docs/` (excluding `docs/specs/`), `AGENTS.md`, `README.md` and `CHANGELOG.md` `[Unreleased]` for "check … code against", "before (the) UI edits", "Step 3", "cross-check" and "retrieve … guides". The only hits are the three remediated lines, `akili-validate.md:160` and *Test and validate reads*, both validate-time and correct. The docs pages and the CHANGELOG describe the selectors, not the execute order. No stale mirror remains | PASS |
| Red / green | The Implementer's red was reproduced by the Leader: restoring the old sentence fails `not ok 20 - … (FR-7, W-1)`. The validator re-ran the MWG suite: 91/91 | PASS |

**Advisories (ADVISORY, 4R; neither gates):**

- **A-1 Readability.** *Platform guidance* item 2 tells the agent to follow *In a task*, whose item 3 is "Make the UI edits". Read alone at Build route step 4, that list could be taken as "edit now", before the step 5 craft-floor read. Step 4's own text ("search and retrieve now") and item 3 prevent that reading, so this is wording, not a defect.
- **A-2 Reliability.** `polish` (step 7) runs after the guide check and may change code again, so the check is not strictly the last thing before concluding. The Reviewer and `/akili-validate`'s *Test and validate reads* re-check the final code, so this is covered.

### 13.4 W-2: resolved

| Check | Evidence | Result |
|---|---|---|
| FR-9 THEN against FR-2 BUT and DD-15 | It now reads "an availability and pin note, never a skill to assign; FR-2 BUT". That is the same wording as `akili-constitution.md:745` (Step 8D item 3) | PASS |
| Forward closure ("use when present" in the spec folder) | Remaining hits: `requirements.md:22` (the amendment row quoting the old phrase), `execution.md:848` (the T11 advisory, history), `proposal.md:83`, and this report's history. None is a live requirement | PASS |
| Backward closure (references to FR-9) | `tasks.md:236`/`:323`, `test-report.md:88` and the six `constitution (FR-9…)` tests describe the row as "not a skill to assign" or "never asserts installed". None depends on the old phrase | PASS |
| `proposal.md:83` retention | Acceptable. The proposal is the approved intent record, and the requirements amendment row names the supersession. Changing an approved proposal after the fact would rewrite history | PASS |
| Shipped text | Unchanged, as the ruling requires | PASS |

### 13.5 Build integrity and figures

Run by the validator on Node v22.23.4 on the working tree:

| Command | Exit | Result |
|---|---|---|
| `npm test` | 0 | **2111** tests, 2111 pass, 0 fail, 0 skipped |
| `node --test test/modern-web-guidance.test.js` | 0 | 91/91 (89 + 2) |
| `npm run verify:cli` | 0 | 14 commands, 32 skills, 1 plugin, 8 resources (v2.44.0) |
| `npm run pack:dry-run` | 0 | 430 files, 3.7 MB packed, 8.5 MB unpacked (unchanged) |
| `git diff --check` | 0 | clean |
| `node bin/akili.js install --tool all --dry-run` | 0 | 92 entries differ from the real HOME, as in §5 |
| `node bin/akili.js doctor --tool all` | 0 | All five targets HEALTHY, ok 43, missing 0. 56 differ, as in §5 |

| Figure | Now | Recorded elsewhere | Classification |
|---|---|---|---|
| `npm test` | 2111 | `test-report.md` 2109 (lines 4, 34, 35, 42) | **Note N-4.** The test report is dated evidence from `/akili-test`. The remediation added 2 tests after it. Record the delta in `execution.md` with the remediation, or refresh at archive. Not a contradiction |
| MWG suite | 91 | §4 and §9 say 89 | History of the first run; superseded here |
| LOC (spec convention: additions, `git diff --numstat 688b35a~1 -- . ':!docs/specs'`) | **1,467** (48 deleted) | budget ~1,470 | Within the budget, **3 lines of headroom**. This was 1,443 at the first validation. The remediation's gross churn is +31/−7 shipped and test lines, net +24 |
| LOC (per-task-sum convention used in `execution.md`) | ~1,469 + 31 ≈ **~1,500** | budget ~1,470 | **Over the budget.** A possible tripwire for JC (§13.6, Q-1) |

### 13.6 Items for JC

| ID | Question | Options |
|---|---|---|
| Q-1 | The ~1,470 LOC budget: by `git diff --numstat` additions it holds (1,467, 3 lines left). By the per-task-sum convention the records have used, it is exceeded (~1,500). Does this trip the budget tripwire? | **A** Treat the budget as met by the `numstat` convention, and note it in `execution.md`. **B** Record a raise to ~1,500 at archive, as with the earlier ~1,400 and ~1,470 raises. **C** Treat it as tripped and decide before commit |

**Ruling (JC, 2026-11-18 7:37 AM America/Bogota): option A**, in JC's words: «Q-1: A, acepta el conteo de git diff y anótalo en execution.md». The budget is met at 1,467 of ~1,470 by `git diff --numstat`, excluding `docs/specs/`. No raise. Recorded in `execution.md`.

### 13.7 Notes (no finding)

- **N-3 (traceability):** the remediation is uncommitted, and `execution.md` has no entry for it. Before archive, commit it with the `[SPEC:changes/modern-web-guidance]` prefix and log the W-1/W-2 remediation in `execution.md`: the rulings, the files, the red run and the 2111 count.
- **N-4:** the 2109 → 2111 delta against `test-report.md` (above).
- N-1 and N-2 from §11 still stand.

### 13.8 Updated counts and archive readiness

Counts: **PASS 9 · WARN 0 · FAIL 0 · BLOCKED 0**. Requirement coverage moves from WARN to PASS. UI design review stays not applicable.

**Ready to archive** after the N-3 commit and log entry. Q-1 is answered (option A, §13.6). Then run:

```text
/akili-archive changes/modern-web-guidance
```

Before merging PR #146, confirm the Windows CI legs are green on the remediation commit.
