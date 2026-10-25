# Execution Log: `changes/docs-overview`

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-overview` |
| Started | 2026-10-24 |
| Leader | Claude Code, `claude-opus-5-5` (T1) |
| Approval Mode | Continue gates auto-passed by user mandate 2026-10-24 ("Approved by Juan Carlos … Answer routine process gates with the recommended option and keep going; stop and ask only for product decisions or if the budget tripwire (26 review rounds or >9 tasks) is hit"). Exceptions (HALT, Pivot, tripwire, FATAL_FAIL, waiver) still stop |
| Budget | 9 tasks · ~1,350 added / ~955 removed LOC · 20 rounds; tripwire 26 rounds or > 9 tasks (design §13, user rule) |
| Personas | `.agents/` deployed 2026-10-24 from `.claude/templates/` (gitignored); `node bin/akili.js doctor --agents` → all sections `CURRENT`, "No persona drift blocking CI." |
| Delegation | No Step 8E wrappers in this repo → fallback spawn (`general-purpose` subagent, worker reads its own persona). Implementer `sonnet` (T2), Reviewer `opus` (T3 role on a different model than the Implementer — author ≠ auditor) |
| Base | `origin/dev` `dbc9275` (re-fetched 2026-10-24; branch HEAD `23baa72` contains it — no re-rebase needed) |
| Commits | Local only, `[SPEC:changes/docs-overview]`; no push, merge, tag, release or publish (user rule) |
| Language | English for every doc line (NFR-2, user rule) |

## 2. Task Execution History

### T1: Rebase check and move ledger — PASS (attempt 2)

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Final status | `PASS` |
| Attempts | 2 |
| Skills / effort | `cognitive-doc-design`; medium → high on attempt 2 |
| continuations | 1 (Observations 1–2: three obligations whose proposed homes were out of scope — redirected after the design amendment below) |
| spawns | Implementer (sonnet) 29 calls, 240,395 tokens, ended partial; Implementer continuation 2 calls, 244,733 tokens (cumulative), ended complete; Reviewer (opus) 31 calls, 124,925 tokens, ended fail; Implementer attempt 2 4 calls, 261,585 tokens (cumulative), ended complete; Reviewer re-review 5 calls, 135,076 tokens (cumulative), ended complete |
| Requirements covered | FR-12 (ledger side: one disposition per heading, `already in` quoted, no heading-only match) |
| Running totals | tasks 1/9 · LOC ~+102 (ledger 99, design 3) · review rounds 2/26 |

**Attempt 1.** Files: `docs/specs/changes/docs-overview/move-ledger.md` (new). Implementer verification: red — no ledger, awk → 43; green — `awk=43 ledger_H_rows=43 COUNT-OK`, `DISPOSITION-OK`; falsifiers on a scratch copy — H20 deleted → `awk=43 ledger_H_rows=42 COUNT-MISMATCH`; H22 `moved` without an anchor → `DISPOSITION-FAIL: | H22 no-file#anchor`. Rebase values confirmed at `23baa72`: P-5 13/28 (11/7/10), P-7 9 hits in `docs/cli.md` at `:125, 191, 192, 203, 204, 225 ×2, 242 ×2`, 43 headings (25/18), README 954 lines. Not Done / Assumptions (verbatim summary): 39 `moved` rows have `pending` quotes with GAPs for T2/T3/T4/T6 (by scope); H17 semver table, H35 `/akili-seo` setup steps and "recommended remediation paths" had no planned home (proposed `docs/release-checklist.md`, `docs/commands/akili-seo.md`, `docs/commands/akili-audit.md`); H18/H19 `already in` via flag rows + examples; H42 Notes bullets moved, not dropped. Continuation 1 applied the amendment; checks re-run green. Leader re-run: VERIFIED. Reviewer: **FAIL**, 4 issues — (1) H35 had two dispositions and unquoted `already in` obligations (`/akili-seo` audit areas, report filenames, "skipped with a note"; `/akili-resume` next command; `/akili-audit` score and timing; `/akili-security` index-only write); (2) conditional owners (H35 ranking claim, H09 pnpm clause) — an unrecorded drop; (3) H18/H19 quoted no destination for `--tool claude|opencode|both` (`docs/cli.md:104-105, 109`); (4) H42 → `docs/flow.md#notes`, a section design §3 does not list.

**Attempt 2.** Files: the ledger. Leader adjudication on issue 4: no new `## Notes`; bullets a–b → `docs/flow.md#methodology-contract`, c → `CONTRIBUTING.md#repository-structure`, d → `dotfiles/README.md#dotfiles`. Implementer verification: `awk=43 ledger_H_rows=43 COUNT-OK`, `DISPOSITION-OK`. Leader re-run: VERIFIED (43/43; 40 moved / 8 already in / 4 kept / 0 dropped over 51 rows, H35 now single; no conditional-owner phrase). Reviewer: **PASS** — every fix checked at its cited line; the design amendment changes no approved requirement's meaning (not Pivot evidence).

**ADVISORY (final verdict).** Readability: H42 bullets a–b are provenance notes; the T2 flow.md writer should give them a short lead-in (e.g. "Provenance") so they do not read as methodology rules. Reliability: ledger line-number quotes were read at `23baa72`; after T2/T3/T6 edit `docs/cli.md`/`docs/flow.md`, Reviewers should match quote text, not line numbers.

**Decisions made.** Execute-time spec edit, 2026-10-24, `design.md` §3 (`CONTRIBUTING.md` row: the README semver table joins `## Branches and Releases`; `docs/cli.md` row: the `/akili-seo` setup steps join Prerequisites) and §8 (the `/akili-audit` row keeps "recommended remediation paths"). Reason: requirements §4 puts `docs/commands/*.md` out of scope beyond link fixes and does not list `docs/release-checklist.md`; FR-12 forbids dropping the obligations; the FR-17 scenario puts the release flow in CONTRIBUTING. No approved requirement's meaning changes (Reviewer-confirmed). Carry as a named conformance check into the T2 and T3 Reviewer briefs (and T4 for §8).

**Forward pointers.** T2: H42 bullets a–b land in `## Methodology Contract` with a provenance lead-in `[advisory-grade]`. T3: semver table → `CONTRIBUTING.md` `## Branches and Releases`; `/akili-seo` setup steps → `docs/cli.md` Prerequisites; H09/H14 pnpm/`PNPM_HOME` clauses → `docs/cli.md#manual-installation`. T4: `/akili-audit` row keeps "recommended remediation paths"; H01 "100% local" → `## What AKILI is`.

**Issues encountered.** None beyond the FAIL above. The harness flagged the Implementer report as "instruction-shaped (settings-json)" because it named `~/.claude.json`; it was a path in a doc obligation, not an instruction.

**Final verification.** `awk … README.md | wc -l` → 43; ledger `^| H` rows → 43; every row's disposition is one of the four values.

### T3: Absorb into `docs/cli.md`, `CONTRIBUTING.md`, roadmap, dotfiles; fix the Grok anchors — PASS (attempt 1)

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Final status | `PASS` |
| Attempts | 1 (run in parallel with T2: disjoint files; the shared ledger edited row-by-row; Leader re-run taken after both reported, tree quiet) |
| Skills / effort | `cognitive-doc-design`; medium-high |
| spawns | Implementer (sonnet) 26 calls, 142,764 tokens, ended complete; Reviewer (opus) 21 calls, 111,013 tokens, ended complete |
| Requirements covered | FR-5 (detail via `docs/cli.md`), FR-12 (T3 rows H04, H07–H10, H12–H17, H20–H23, H34, H35 setup steps, H42 c–d), FR-17 (roadmap, dotfiles, CONTRIBUTING repository structure, cli prerequisites and local checkout, Grok anchor fix), NFR-2, NFR-6 |
| Running totals | tasks 2/9 (T1, T3) · LOC ~+300 so far for T3 (cli.md +165, CONTRIBUTING +24, openspec-comparison +8, dotfiles/README.md new, ledger rows) · review rounds 4/26 (T1 2, T2 1, T3 1) |

**Attempt 1.** Files: `docs/cli.md`, `CONTRIBUTING.md`, `docs/openspec-comparison.md`, `dotfiles/README.md` (new), ledger rows above. Implementer verification: `grep -c 'grok-bot-grokbot' docs/cli.md` → 0; `grep -c 'grok-bot---tool-grokbot' docs/cli.md` → **4**; `^## Repository Structure` 1; `^## Roadmap` 1; `node --test test/branching-flow.test.js test/diagram-design.test.js test/akili-marketing-docs.test.js` → `# pass 67`, `# fail 0`; `npm run pack:dry-run | grep -c dotfiles` → 0; NFR-2 → 0; P-7 still 9 hits. Falsifiers (scratch copy): one anchor reverted → 1; `Git for Windows` row dropped → 0. Slug derivation: ``## Grok Bot (`--tool grokbot`)`` → `grok-bot---tool-grokbot` (unique; P-14 still not checked against a rendered page). Leader re-run (after T2 and T3 both reported): VERIFIED — same counts, suites pass 67/fail 0, full `npm test` `pass 819, fail 0`, `git diff --check` clean. Reviewer: **PASS** — every T3 destination holds its README content verbatim, including both design amendments (semver table at `CONTRIBUTING.md:77-83`, `/akili-seo` setup at `docs/cli.md` `### /akili-seo Setup`); existing cli.md content only extended; `manual-install` vs `manual-installation` slugs distinct.

**Decisions made.** The task's `grok-bot---tool-grokbot` → 3 check reads 4 at HEAD: the fourth link sits in the new per-target *Use When* table, which ledger row H08 requires (its Grok Bot obligation includes the link). Reviewer adjudication: ledger-required content, not an addition; the check's intent (0 dead links, every link resolves to an existing heading) holds. Recorded count: 4.

**ADVISORY (final verdict).** Readability: `CONTRIBUTING.md:18` new note restates `:14`; a later pass could merge them. Risk: the P-7 hit lines moved from `:125…242` to `:247, 326-327, 338-339, 360 ×2, 377 ×2` — later briefs citing old lines must re-derive them. Readability: P-14 is still unverified against a rendered page; T8 (i) is the gate.

**Forward pointers.** T8/T9: P-7 line numbers in `docs/cli.md` are now `:247, 326-327, 338-339, 360 ×2, 377 ×2` (still 9 hits, 13/28).

**Issues encountered.** The T3 ledger rows are committed with T2 (the ledger was still being edited by T2's rework when T3 closed).

**Final verification.** As the Leader re-run above.

### T2: Absorb README content into `docs/flow.md` — PASS (attempt 2)

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Final status | `PASS` |
| Attempts | 2 (attempt 1 in parallel with T3) |
| Skills / effort | `cognitive-doc-design`; high → xhigh on attempt 2 |
| spawns | Implementer (sonnet) 18 calls, 145,779 tokens, ended complete; Reviewer (opus) 20 calls, 112,894 tokens, ended fail; Implementer attempt 2 7 calls, 160,290 tokens (cumulative), ended complete; Reviewer re-review 5 calls, 119,931 tokens (cumulative), ended complete |
| Requirements covered | FR-12 (T2 rows H24, H26–H33, H36, H38, H39, H41, H42 a–b, M5, M8), FR-6 (`## Practical Example` with the 3 sequences), NFR-2 |
| Running totals | tasks 3/9 · LOC ~+535 / −65 so far (T1 ~102, T2 flow.md ~+221/−16, T3 ~+200, ledger quotes) · review rounds 6/26 |

**Attempt 1.** Files: `docs/flow.md` (+207/−14), ledger T2 rows. New sections Start Here (with the `Six anytime commands run outside this loop` sentence verbatim), Core Concepts, Review Points, Requirement Delta Preview, Writing Good Requirements, Practical Example, Methodology Contract (H42 a–b under a "Provenance" lead-in), Host Assumptions; in-place extensions to the Modes, Depth, Spec Folder Shape, Harness and Kaizen parts. Implementer verification: Practical Example 1; Six anytime 1; `node --test test/akili-security-docs.test.js test/akili-marketing-docs.test.js` → `# pass 31`, `# fail 0`; NFR-2 0. Falsifiers: bugfix block removed (scratch) → `bugfix/login-redirect` 5 → 0; "in-target directory" added to the security bullet → `not ok 4 - FR-7 / FR-10 BUT: no restatement keeps an in-target run-directory option` and `not ok 13 - … run git status / check-ignore / rev-parse in the target`, reverted → pass. Leader re-run (tree quiet, after T3 reported): VERIFIED (full `npm test` `pass 819, fail 0`). Reviewer: **FAIL**, 3 issues (verbatim in the Reviewer report relayed to attempt 2): (1) H24 (h) CodeGraph usage list abridged — "semantic code exploration, symbol lookup, callers/callees, and impact checks" missing; (2) H24 (f) Legacy inspection scope missing "docs, architecture"; (3) H26 Lite rigor missing "keeps the documents short" and "testable". Each ledger quote showed a nearby line, not the obligation token.

**Attempt 2.** Files: `docs/flow.md`, ledger T2 rows. The three gaps fixed at `:176`, `:171`, `:245`; a mandated mechanical sweep over all 16 rows found one more gap (H28 "Gemba: real facts, never speculation", README `:662`) and fixed it at `:604`; the doubled blank line removed. Sweep: `tokens 210 misses 0`; every T2 quote rewritten as token text + line. Implementer verification: as attempt 1, all green. Leader re-run: VERIFIED (Practical Example 1, Six anytime 1, `callers/callees` 1, `testable scenario` 1, `docs, architecture, tests` 1, suites 31/0, `npm test` 819/0, NFR-2 0, `git diff --check` clean). Reviewer: **PASS** — the fixes match README `:586`, `:581`, `:618`, `:662`; all 210 quote pairs resolve at their cited lines; word-diff deletes only text the same edit restores in longer form; verbatim sections intact; the redirected obligations (seo setup, semver table, audit remediation) are absent from flow.md (named conformance check).

**ADVISORY (final verdict).** Readability: pre-existing flow.md `## Philosophy` and the Legacy row's `.agents/` cell name three default personas while the Methodology Contract lists four (with Tester); not a T2 obligation — a possible later `/akili-quick` follow-up. (Attempt-1 advisories: the Methodology Contract is a third restatement surface for the security pins — a back-link to §2b/§2c would help.)

**Decisions made.** None beyond the brief. The Leader required a full mechanical token sweep in the rework brief (Phrase-family sweep rule); it found the fourth gap before review.

**Issues encountered.** This commit also carries T3's ledger rows (T3 closed while T2's rework was editing the ledger).

**Final verification.** As the attempt-2 Leader re-run.

### T4: `docs/overview.md` — PASS (attempt 2)

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Final status | `PASS` |
| Attempts | 2 |
| Skills / effort | `cognitive-doc-design`; high → xhigh on attempt 2 |
| continuations | 1 (two `moved` obligations with no other shipped home: README `:850` `frontend-design` "UI validation/testing support"; README `:65` capabilities claim) |
| spawns | Implementer (sonnet) 29 calls, 140,623 tokens, ended partial; continuation 31 calls, 144,949 tokens (cumulative), ended complete; Reviewer (opus) 29 calls, 132,968 tokens, ended fail; Implementer attempt 2 12 calls, 169,057 tokens (cumulative), ended complete; Reviewer re-review 5 calls, 146,254 tokens (cumulative), ended complete |
| Requirements covered | FR-11 (8 parts in order; each command and skill once by first cell; 5 fixed groups; bindings = `SKILL.md`; Grok Bot row `no/no/no` + link; glossary of every AKILI term the overview uses), FR-15 (overview carries the positive security slug and run-directory text and the Archify pins), FR-3 AND IT MUST (marketing named), FR-12 (overview-destined ledger rows), NFR-2 |
| Running totals | tasks 4/9 · LOC ~+760 / −65 so far (overview 209 new) · review rounds 8/26 |

**Attempt 1.** Files: `docs/overview.md` (new), ledger rows H01, H03, H25, H35, H37, M1, M2, M6. Implementer verification: command membership 13 × `1` (anchor ``^| `/$n`` — the Command cell is unlinked per design §8, so the task text's ``^| [`/$n`` form does not apply; two under-the-hood rows renamed to avoid first-cell collisions); skill membership 28 × `1` (Skill cell linked, anchor ``^\| (\[)?`$n` ``); binding comparison clean; 16 pin regexes MATCH; `65 relative links checked; bad: []`; NFR-2 0; Grok row `no | no | no | yes` (= `bin/akili.js:517` `ALL_TOOLS`, `grep -ci grok bin/routing.js` → 0). Falsifiers on scratch copies: `tdd` twice → 2; `tdd` binding → `exp=conditional got=core`; `-r<N>` removed → `slug regex on mutated: NO MATCH`. Not Done / Assumptions (summary): Main-output column omitted per design §8; README `:65` intro and H37 `frontend-design` clause "not carried"; Figma/Jira context and re-index reminder left to command pages; count words removed. Leader check: two of those had no other shipped home → continuation 1 carried them (`:61` "and for UI validation and testing support"; Deliverables lead `:89`) and recorded the other two as held at `docs/commands/akili-propose.md:94` / `docs/commands/akili-archive.md:66`. Leader re-run: VERIFIED. Reviewer: **FAIL**, 2 issues — (1) glossary lacked AKILI terms the overview uses (Apply Mode, Skill Map, Lite, Bug Mode, Video Mode, Document Control, plan gate, run directory) — FR-11 (7); (2) ledger citations after `:88` off by two after the continuation's insert, and two H03 quotes not verbatim — DD-2, FR-12 BUT.

**Attempt 2.** Files: overview, ledger T4 rows. Glossary +14 rows (the 8 named + Project mode, Triviality gate, Agent wrapper, Phase 2B, Context Discipline, Fleet execution from a full-page scan), each sourced; advisories on the sentences this run wrote applied (Deliverables lead names SEO with its Python deps; Fleet "can run"; HITL "for example"; "tracked repository content"). Ledger T4 blocks rewritten verbatim and re-derived mechanically: `H01 3 bad 0 · H03 11 · H25 4 · H35 9 · H37 5 · M1 6 · M2 2 · M6 2` (all bad 0). Leader re-run: VERIFIED (membership and bindings clean; every `run directory` line carries "(always outside the target)"; no `git status|check-ignore|rev-parse`; NFR-2 0; pin strings present; `npm test` `pass 819, fail 0`; `git diff --check` clean). Reviewer: **PASS** — all 14 glossary rows quote-checked at source; §8 security constraint holds on the four matching lines (`:37`, `:94`, `:184`, `:202`); 36 ledger citations checked, 0 real mismatches.

**ADVISORY (final verdict).** Readability: the `seo-audit` row says "its domain verification"; the source gives verification to `/akili-seo` (`scripts/gsc_verify.py`) and also needs a Google service-account key. Readability: the *Run directory* glossary row could say "tracked repository content" to match `:37`.

**Decisions made.** Execute-time design §8 amendment (T1) checked: the `/akili-audit` row keeps "recommended remediation paths" (Reviewer-confirmed). The command membership loop uses the unlinked anchor because design §8 makes the Command cell unlinked.

**Forward pointers.** T6: the README glossary/term check must cover the README's own terms (Reviewer note on FR-11 (7)). T5: the overview's security lines are `:37`, `:94`, `:184`, `:202`; the `run directory` lines are `:37` and `:184`.

**Final verification.** As the attempt-2 Leader re-run.

### T5: Re-target the README pins; fix the diagram-design pointer — PASS (attempt 1)

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Final status | `PASS` |
| Attempts | 1 |
| Skills / effort | `tdd`; high |
| spawns | Implementer (sonnet) 13 calls, 86,878 tokens, ended complete; Reviewer (opus) 10 calls, 84,438 tokens, ended complete |
| Requirements covered | FR-15 (positive pins moved to the overview / flow.md; README negative guards kept; scenario mutations; no regex/token/message change beyond the site name; only S1–S4), FR-17 (`docs/skills/diagram-design.md:21` names `docs/overview.md`), NFR-1 |
| Running totals | tasks 5/9 · LOC ~+790 / −85 so far (T5 +28/−21) · review rounds 9/26 |

**Attempt 1.** Files: `test/branching-flow.test.js`, `test/akili-security-docs.test.js`, `test/diagram-design.test.js`, `test/akili-marketing-docs.test.js`, `docs/skills/diagram-design.md`; README untouched. Implementer verification: `npm test` → `# tests 812`, `# pass 812`, `# fail 0` (also after reverting every mutation). Assert pairs: only site/variable/file names changed (marketing credit "README …" → "docs/overview.md …"; command-file list → `hasLine(overview, "(commands/akili-marketing.md)")`; command-table literal unchanged on the overview; anytime message "README anytime-commands sentence" → "docs/flow.md anytime-commands sentence"; diagram-design `readme` → `overview`, regexes unchanged; one added S3 assert reusing the regex). Six executed mutations, each red on its assertion: (1) `not ok 1 … 'docs/overview.md has no routing slug of the form bugfix/security-<date>-r<N>-s<n>'`; (2) `not ok 8 … /never ships or installs it/`; (3) `not ok 4 … README.md (/akili-security lines) line 10 matches /ignored in-target/i`; (4) `not ok 31 … 'README.md still instructs a direct release commit + tag'` (in `hasDirectReleaseSequence`); (5) `not ok 5 … /Sergey Bulaev/`; (6) `not ok 7 … 'docs/flow.md anytime-commands sentence'`. Leader re-run: VERIFIED (`npm test` 812/812/0). Test count 819 → 812 traced by the Leader: `branching-flow` 42 → 35 (the 7-token positive loop no longer runs on the README section site, design §9 S1); `akili-security-docs` 19 → 19. Reviewer: **PASS** — all 11 §9 rows applied, only S1–S4; the 7 dropped tests are exactly `README.md (Releasing Package Updates) names <token>`, and all 7 tokens are present in both CONTRIBUTING.md and docs/release-checklist.md (P-8 independently confirmed); the Reviewer re-ran nine mutations on a scratch copy outside the worktree (the six plus S3 alone, the S4 page link, the README shape guard), all red on their assertions.

**ADVISORY (final verdict).** Readability: `test/akili-marketing-docs.test.js:82` variable `readmeRow` now holds an overview row; titles at `:78`/`:96` still say README. FR-15 freezes message text, so left as is.

**Decisions made.** Mutation (6)'s message: design §9 ("A message changes only in the file name it mentions") governs, so "README anytime-commands sentence" became "docs/flow.md anytime-commands sentence" (Reviewer-confirmed).

**Forward pointers.** T9: the suite total is 812 after T5 (T8 adds its own); re-run counts before any summary states them (KZ-002).

**Final verification.** `npm test` → 812 pass, 0 fail.

### T6: Rewrite the README — PASS (attempt 2)

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Final status | `PASS` |
| Attempts | 2 |
| Skills / effort | `cognitive-doc-design`; high → xhigh on attempt 2 |
| spawns | Implementer (sonnet) 23 calls, 115,101 tokens, ended complete; Reviewer (opus) 16 calls, 102,837 tokens, ended fail; Implementer attempt 2 3 calls, 121,627 tokens (cumulative), ended complete; Reviewer re-review 2 calls, 107,747 tokens (cumulative), ended complete |
| Requirements covered | FR-1…FR-10, FR-12 (`kept` rows H01, H02, H06, H43), FR-17 BUT, NFR-2, NFR-3, NFR-5 |
| Running totals | tasks 6/9 · LOC ~+950 / −1,040 so far (README +158 / −954) · review rounds 11/26 |

**Attempt 1.** Files: `README.md` (954 → 157 lines), ledger `kept` rows. Ledger precheck: every non-`kept` row quoted, no blocker. Implementer verification: `wc -l` 157; first `npx akili-specs init` at `:72`; the 12 FR-1 headings in order; shields 3; `<details` 0; `^## Dotfiles|nvim` 0; `assets/` diff empty; `npm test` `pass 812, fail 0`; 30 relative links, 0 bad anchors; NFR-2 0; spec-folder link 0; lines > 300 chars 0 (figure `<img>` attributes split); FR-10 scan: banned 0, `model routing` only inside link text. Falsifiers (scratch): `## Dotfiles` → heading list differs; extra badge → 4; "The Reviewer checks." → `BANNED Reviewer 28`. Leader re-run: VERIFIED (same values; banned-term grep 0; `doctor --tool` 0; `git diff --check` clean). Reviewer: **FAIL**, 1 issue — H02's quote claimed the Documentation Hub (`docs/README.md`) "stays reachable from `docs/overview.md`"; false at HEAD, nothing linked the hub after the rewrite (FR-12). The Reviewer adjudicated the deviations: (1) `/akili-execute` "each independently checked" is more accurate than design §7's "each checked by an independent review" (`docs/commands/akili-execute.md:50-52`); (2) "offline" dropped correctly (`docs/cli.md` never mentions it); (3) "100% local" owned by `docs/overview.md:7`.

**Attempt 2.** Files: `README.md` (158 lines), ledger `kept` rows. `## Learn more` row 2 `| browse all the docs | [docs/README.md](docs/README.md) |` at `:144` (overview row still first); `:157` "Every command and template carries this authorship notice."; all 22 `kept` citations re-derived, 0 bad. Checks as attempt 1, all green (31 links, 0 bad). Leader re-run: VERIFIED (158; `:72`; 12 headings; shields 3; 0 long lines; first *Learn more* link `](docs/overview.md)`; banned-term grep 0; `npm test` 812/0; `git diff --check` clean). Reviewer: **PASS** — hub link fixed and H02 quoted verbatim; README `:112` matches the amended design cell; no regression.

**ADVISORY (attempt-1 verdict, settled in attempt 2).** H01 (h) figure range corrected to `:49-54`; "role template" reworded.

**Decisions made.** Execute-time spec edit, 2026-10-24, `design.md` §7 plain-row table, `/akili-execute` row → "build the approved tasks one by one, each independently checked" (dated note). Reason: the earlier cell overclaimed — the conformance Reviewer can be skipped under Review intensity, the non-author evidence re-run never is. FR-7's meaning unchanged (Reviewer-confirmed). Carry as a named conformance check into the T7 Reviewer brief.

**Final verification.** As the attempt-2 Leader re-run.

### T7: Hub, routing line, governance checklist — PASS (attempt 2)

| Field | Value |
|---|---|
| Date | 2026-10-24 |
| Final status | `PASS` |
| Attempts | 2 |
| Skills / effort | `cognitive-doc-design`; medium → high on attempt 2 |
| spawns | Implementer (sonnet) 7 calls, 73,622 tokens, ended complete; Reviewer (opus) 4 calls, 71,526 tokens, ended fail; Implementer attempt 2 1 call, 75,720 tokens (cumulative), ended complete; Reviewer re-review 1 call, 74,671 tokens (cumulative), ended complete |
| Requirements covered | FR-13, FR-14 (incl. BUT, checked against `bin/routing.js` `HOST_KEYS`), FR-17 (governance item 5), NFR-2 |
| Running totals | tasks 7/9 · LOC ~+990 / −1,050 so far · review rounds 13/26 |

**Attempt 1.** Files: `docs/README.md`, `docs/model-routing.md`, `docs/skills/governance.md`. Red at HEAD: first *Start Here* link `](flow.md)`, governance 0, Grok 0, item-5 0. Green: `](overview.md)`; governance 2; `grok bot` 1; `no routing wrappers` 1; item-5 overview 1; English 0. Falsifier (stream copy): Overview line removed → `](flow.md)`. Tests: marketing 12/0, `npm test` 812/0. Grok line vs code: `grep -ci grok bin/routing.js` → 0; `HOST_KEYS` = claude, opencode, antigravity, codex, cursor. Leader re-run: VERIFIED. Reviewer: **FAIL**, 1 issue — the anytime table had two columns (`Command | Use When`); FR-13 (`requirements.md:230`) requires "(command · use it to · link)", and five of six rows linked nowhere.

**Attempt 2.** Files: `docs/README.md`. Table now `| Command | Use it to | Reference |` (`:36`), each row links `commands/akili-<name>.md`; every prior obligation kept (dashboard, drift, GSC/SEO reports, quick auto-escalation, security gates + Bug Track + Windows note verbatim, marketing platforms + `docs/marketing/` + never publishes). Checks: as attempt 1, plus each of six page links → 1. Leader re-run: VERIFIED (`npm test` 812/0, `git diff --check` clean). Reviewer: **PASS** — fix matches FR-13; per-row comparison against the old cells and command pages shows nothing dropped or overstated; FR-14 and item 5 unchanged.

**Decisions made.** None. The named check (design §7 `/akili-execute` wording, carried from T6) passed and now drops.

**Final verification.** As the attempt-2 Leader re-run.
