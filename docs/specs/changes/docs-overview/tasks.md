# Tasks: a simple README and one overview that shows all of AKILI

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-overview` |
| Depth | Standard |
| Requirements / Design | `requirements.md` (FR-1…FR-17, NFR-1…6) · `design.md` (approved, judgment `APPROVED ✅`) |
| Phase 3 gate | `auto-approved (user mandate for /akili-specify, 2026-10-23)`. The run **stops before `/akili-execute`** (user rule) |
| Precondition for T1 | `changes/akili-marketing` is merged into `dev`, and this branch is rebased onto it (D2). If it is not merged when execution starts, the Leader stops and asks the user to choose between the D2 fallback (execute on the current `dev`) and waiting |
| Language | English for every doc line written (NFR-2) |
| Commits | Local only, `[SPEC:changes/docs-overview] …`; no push, tag, release or publish |
| Budget (tripwire) | 9 tasks · ~1,330 added / ~950 removed LOC · 20 review rounds, **tripwire 26** (design §13) |
| Baseline for "Red run" readings | Executed 2026-10-23 at `2784e57` unless a task says otherwise |

## 2. Task Graph

```text
T1 ──► T2 ──┐
  └──► T3 ──┼──► T4 ──► T5 ──► T6 ──► T7 ──► T8 ──► T9
```

T2 and T3 touch different files, so they may run in parallel after T1. Every other edge is sequential, because each task's verification needs the previous task's text (DD-1).

## 3. Tasks

### T1: Rebase check and move ledger

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~90 LOC spec artifact) |
| Depends on | Precondition (marketing merged, branch rebased) |
| Requirements | FR-12 (every heading gets one disposition; "already in" quotes the destination; BUT not on a heading match alone) |
| Design refs | §2 task map, DD-1, DD-2, P-9 |
| Consumers | P-9: after the rebase, re-run P-5 (inventory), P-7 (count regex), the 43-heading count and every README line number cited in `design.md`/`requirements.md`; record the new values in the ledger header |
| Review | `checklist`: a spec artifact, read by T2/T3/T6 Reviewers anyway |
| Skills | `cognitive-doc-design` |

**Scope.** Create `docs/specs/changes/docs-overview/move-ledger.md`, with one row per fence-aware `##`/`###` README heading at the rebased HEAD. The columns are: README line · heading · disposition (`kept` → new README heading / `moved` → file#anchor / `already in` → file#anchor / `dropped` → reason) · obligations (every command, path, flag, rule and claim the section states) · destination quote (filled by T2/T3/T6 at HEAD). Add marketing's README additions (the `/akili-marketing` rows and lines) as rows, with the marketing heading they sit under.

**Verification.**
- `awk '/^```/{f=!f} !f && /^#{2,3} /' README.md | wc -l` equals the ledger's row count.
- Every row has a disposition from the four allowed values.

| Verification field | Value |
|---|---|
| Falsifier | Delete one ledger row → the row-count check differs from the awk count. Write disposition `moved` without a file#anchor → the disposition check fails |
| Red run | At `2784e57` the ledger does not exist (`ls` → No such file), and awk → 43 |
| Disqualifier | A count taken with a non-fence-aware grep (26 `##`) is not evidence; only the fence-aware awk is |
| Consumers | none outside the spec folder |

**Done.** The ledger's row count equals the awk count, every row has a disposition, and the rebased values of P-5/P-7/line numbers are recorded.

### T2: Absorb README content into `docs/flow.md`

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~180 LOC) |
| Depends on | T1 |
| Requirements | FR-12 (moved content holds every obligation); FR-6 (target `## Practical Example` exists with the 3 sequences); NFR-2 (English) |
| Design refs | §3 `docs/flow.md` row; P-3 |
| Consumers | `test/akili-security-docs.test.js` reads `docs/flow.md` (`securityLines(FLOW)`), so any moved `/akili-security` line keeps the pinned wording |
| Review | `full`: the riskiest content-preservation task (KZ-changes--gate-falsifiability-2) |
| Skills | `cognitive-doc-design` |

**Scope.** For every ledger row whose destination is `docs/flow.md`, add the content where it is not already there:
- `## Practical Example`
- `## Writing Good Requirements`
- `## Requirement Delta Preview` (the explanation plus the fenced example)
- `## Review Points`
- `## Core Concepts`
- *Spec Paths*, merged into *Spec Folder Shape*
- `## Methodology Contract`
- `## Host Assumptions`
- any *Start Here*, *Kaizen Loop*, *Multi-Agent Harness*, *How To Choose The Right Depth* or *Notes* obligation the ledger marks missing

Fill each row's destination quote. Do not rewrite flow.md content that already exists.

**Verification.**
- For each T2 ledger row, `grep -n "<obligation token>" docs/flow.md` returns a hit, quoted in the ledger.
- `grep -c '^## Practical Example' docs/flow.md` → 1.
- `node --test test/akili-security-docs.test.js` → 0 fail.
- NFR-2 heuristic grep over `git diff -U0 docs/flow.md` `+` lines → 0.

| Verification field | Value |
|---|---|
| Falsifier | Remove the bugfix sequence from the new *Practical Example* → that row's obligation grep (`bugfix/login-redirect`) returns 0. Add "in-target directory" to a moved `/akili-security` line → the security-docs FR-7 family test goes red |
| Red run | `grep -c '^## Practical Example' docs/flow.md` → 0; `grep -c "Writing Good Requirements" docs/flow.md` → 0 (at `2784e57`) |
| Disqualifier | A heading present with its body abridged is not a move. The ledger quote must show each obligation token, not the heading |
| Consumers | `test/akili-security-docs.test.js` |

**Done.** Every T2 row is quoted at HEAD, the security-docs suite is green, and the English check is clean.

### T3: Absorb into `docs/cli.md`, `CONTRIBUTING.md`, roadmap, dotfiles; fix the Grok anchors

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~150 LOC) |
| Depends on | T1 |
| Requirements | FR-5 (detail reached via `docs/cli.md`); FR-12; FR-17 (roadmap, dotfiles, CONTRIBUTING repository structure, cli prerequisites and local checkout, dead-anchor fix); NFR-2; NFR-6 (`dotfiles/` stays unshipped) |
| Design refs | §3 rows for `docs/cli.md`, `CONTRIBUTING.md`, `docs/openspec-comparison.md`, `dotfiles/README.md`; P-4, P-7, P-10, P-14 |
| Consumers | `test/branching-flow.test.js` (reads `CONTRIBUTING.md`, so it must stay green); `test/diagram-design.test.js:415` (`docs/cli.md` "27 packaged skills", or "28" after the rebase); the 9 count hits in `docs/cli.md` (P-7) |
| Review | `full` |
| Skills | `cognitive-doc-design` |

**Scope.**
- `docs/cli.md`:
  - `## Prerequisites` with the 3 README tables (Required, Recommended, Conditional) and the CodeGraph install block.
  - `### Local Checkout Install`.
  - The per-host invocation note (Codex `$`, Cursor `/`, with its `Last verified: 2026-10-01` citation).
  - Any *Install Paths*, *Updating*, *Troubleshooting* or *Manual Install* obligation the ledger marks missing.
  - Replace `#grok-bot-grokbot` with `#grok-bot---tool-grokbot` at `:21, 48, 110`.
- `CONTRIBUTING.md`: `## Repository Structure` (README `:73-83`, with the `.claude/` note).
- `docs/openspec-comparison.md`: `## Roadmap` with the 3 planned items.
- `dotfiles/README.md`: the Neovim/tmux restore steps.

Fill the ledger quotes.

**Verification.**
- Ledger obligation grep per T3 row → hits quoted.
- `grep -c 'grok-bot-grokbot' docs/cli.md` → 0, and `grep -c 'grok-bot---tool-grokbot' docs/cli.md` → 3.
- `node --test test/branching-flow.test.js test/diagram-design.test.js` → 0 fail.
- `npm run pack:dry-run | grep -c dotfiles` → 0.
- NFR-2 grep → 0.

| Verification field | Value |
|---|---|
| Falsifier | Leave one `#grok-bot-grokbot` → the count check reads 1 (it is checked again by T8 (i), as a slug). Drop the `Git for Windows` row from the moved Conditional table → its obligation grep returns 0 |
| Red run | `grep -c 'grok-bot---tool-grokbot' docs/cli.md` → 0; `grep -c '^## Repository Structure' CONTRIBUTING.md` → 0; `grep -c '^## Roadmap' docs/openspec-comparison.md` → 0; `ls dotfiles/README.md` → No such file (at `2784e57`) |
| Disqualifier | An anchor "fixed" to a slug the target heading does not produce is not a fix. Until T8's slugger exists, derive it by the rule in design §10 (i) and write the derivation in the task report |
| Consumers | as above |

**Done.** All T3 rows are quoted, there are 0 dead Grok anchors in cli.md, both suites are green, `dotfiles/` is not packed, and the English check is clean.

### T4: `docs/overview.md`

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L (~300 LOC) |
| Depends on | T2, T3 (overview links into their new sections) |
| Requirements | FR-11 (8 parts in order; every command and skill once; 5 fixed groups; binding equals `SKILL.md`; Grok row cells and link; BUT membership by table row); FR-15 (the overview carries the positive security slug and run-directory text and the Archify pins); FR-3 AND IT MUST (marketing named); NFR-2; KZ-002 |
| Design refs | §8 (parts, groups, security-line constraint), DD-6, DD-7, DD-8, P-5, P-6 |
| Consumers | Pinned by T5 re-targets (`akili-security-docs`, `diagram-design`) |
| Review | `full`: quote-check every one-liner against its command/skill page (KZ-002) |
| Skills | `cognitive-doc-design` |

**Scope.** Write the 8 parts of design §8:
- Commands: every command at the rebased HEAD, `/akili-marketing` included.
- Skills: every skill in its fixed group, with `social-marketing` placed in *Deliverables* and its binding read from its `SKILL.md`.
- Under the hood: the 13 mechanisms.
- Install targets: 6 rows, Grok Bot reading `no / no / no`, linked to `docs/cli.md#grok-bot---tool-grokbot`.
- Optional tools: the Archify row carries `npx skills add tt-a1i/archify`, `[Archify](https://github.com/tt-a1i/archify) by tt-a1i (MIT licence)` and `never ships or installs it`.
- Glossary.
- I want to…

The `/akili-security` row uses the README `:813` wording for the run directory and the slug. Every overview security line obeys the §8 constraint.

**Verification.**
- An ad-hoc membership loop: `for n in $(ls .claude/commands | sed 's/\.md$//'); do grep -c "^| \[\`/$n" docs/overview.md; done`, and the same for skills → each prints 1.
- The binding cells equal the `grep -m1 binding:` loop.
- Before T5, run the three pinned regexes against the overview by hand with `node -e` (slug regex, `run directory (always outside the target)`, the Archify regexes) → each matches.
- Link targets exist.
- NFR-2 grep → 0.

| Verification field | Value |
|---|---|
| Falsifier | List `tdd` under two groups → the membership loop prints 2 for it. Change one binding to `core` → the binding comparison differs. Remove `-r<N>` from the slug → the slug regex fails to match |
| Red run | `ls docs/overview.md` → No such file (at `2784e57`) |
| Disqualifier | A skill or command name matched in prose, not as a row's first cell, does not count. The loop's `^| [` anchor enforces this |
| Consumers | T5 |

**Done.** Every command and skill appears once in its group, bindings match, the three pin regexes match the overview, links resolve, and the English check is clean.

### T5: Re-target the README pins; fix the diagram-design pointer

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~50 LOC changed) |
| Depends on | T4 |
| Requirements | FR-15 (positive pins move; README negative guards remain; scenario mutations; BUT no regex, token list or message changes; AND IT MUST: only S1/S2/S3); FR-17 (`docs/skills/diagram-design.md:21` names `docs/overview.md`); NFR-1 |
| Design refs | §9 (every row), DD-6, P-1, P-2, P-8 |
| Consumers | `test/branching-flow.test.js`, `test/akili-security-docs.test.js`, `test/diagram-design.test.js` (after the rebase, re-read `:405-420`: marketing edited `:413-417`) |
| Review | `full`: changes guarantee-bearing tests |
| Skills | `tdd` (red/green per moved pin) |

**Scope.** Apply design §9 exactly:
- `branching-flow`: drop the README section site; add the whole README to the negative loop.
- `akili-security-docs`: the `SLUG_PRESENCE_SITES` / `SLUG_SHAPE_SITES` split; the overview added to `RUN_DIR_SITES`; the presence site at `:118-124` moves to the overview, with the conditional README check; the overview added to the no-git sites.
- `diagram-design`: `:409-412` reads `docs/overview.md`.

Change `docs/skills/diagram-design.md:21` to name `docs/overview.md`. The README is **not** edited in this task.

**Verification.**
- `npm test` → 0 fail. The README is still the old one, so the negative guards must pass on it as P-8 showed.
- `git diff -U0 test/ | grep '^[-+]' | grep -E 'assert\.(match|ok|equal|doesNotMatch)'`: every changed assert line differs only in its variable or site name. Quote the pairs in the report.

| Verification field | Value |
|---|---|
| Falsifier | Run each mutation, observe it red, and quote it (executed, not predicted): (1) delete the slug from `docs/overview.md` → the FR-8/FR-10 slug presence test fails naming `docs/overview.md`; (2) delete `never ships or installs it` from the overview → the diagram-design FR-9 test fails; (3) add a README line `/akili-security … ignored in-target directory` → the FR-7 family test fails naming `README.md`; (4) append a fenced `git commit -m "chore(release)…"` + `git tag v` block to the README → the branching-flow negative test fails naming `README.md`. Revert each mutation after observing it |
| Red run | The four mutations above, run against the post-T5 tests. Each must go red on its assertion, not on a file-not-found |
| Disqualifier | A red caused by a missing file or a thrown `section()` "no heading" error is a setup red, not the assertion. Mutation (4) must fail in `hasDirectReleaseSequence` |
| Consumers | as above |

**Done.** `npm test` is green, the four mutations are each observed red and reverted, the assert-pair diff shows only site/variable changes, and diagram-design.md:21 is updated.

### T6: Rewrite the README

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L (+~190 / −~950) |
| Depends on | T5 (pins no longer need README text), T1–T4 (every ledger destination quoted) |
| Requirements | FR-1 (all clauses); FR-2 (≤ 200, install ≤ 90, no `<details>`; AND IT MUST: no packed lines, Reviewer-gated); FR-3 (≤ 3 sentences, 5 bullets with the overview link, 4-term glossary, marketing named, BUT no unshipped capability); FR-4 (figure kept and centered, new plain alt text, assets untouched); FR-5 (one install and one check, `docs/cli.md` link, BUT no per-tool doctor list or tables, Grok Bot named only); FR-6 (5 steps, quick and resume lines, `docs/flow.md#practical-example`, BUT no sample document); FR-7 (all commands in 2 groups linked, Windows note on the security row, 8 CLI rows; BUT no claim the command page lacks); FR-8; FR-9; FR-10; FR-12 (`kept` rows quoted); FR-17 BUT (no `## Dotfiles`/`nvim`); NFR-2, NFR-3, NFR-5 |
| Design refs | §7 (skeleton, plain-row table, security row wording), DD-9, DD-11, P-2, P-11, P-13, P-16 |
| Consumers | `test/akili-security-docs.test.js` (the README negative guards), `test/branching-flow.test.js` (the README negative guard), and inbound anchors (P-2: none in the repo; external anchors are an accepted Low risk) |
| Review | `full`: the Reviewer reads the README **whole** for plain language, packed lines and the jargon list (these gaps are not machine-checked) |
| Skills | `cognitive-doc-design` |

**Scope.** Replace `README.md` with the design §7 skeleton, using the plain-row wording table and the new alt text. Every explained term is in the 4-term glossary or inside a link text at its first use, and no banned term appears. Before the edit, confirm that every non-`kept` ledger row has a quoted destination. Fill the `kept` rows' quotes.

**Verification.**
- `wc -l README.md` → ≤ 200.
- `grep -n -m1 'npx akili-specs init' README.md` → line ≤ 90.
- `awk '/^```/{f=!f} !f && /^#{2,3} /' README.md` → exactly the 12 FR-1 headings, in order.
- `grep -c shields.io README.md` → 3.
- `grep -c '<details' README.md` → 0.
- `grep -cE '^## Dotfiles|nvim' README.md` → 0.
- `git diff --stat -- assets/` → empty.
- `npm test` → 0 fail.
- Link check of README targets.
- NFR-2 grep → 0.
- `grep -n 'docs/specs/changes/docs-overview' README.md` → 0.

| Verification field | Value |
|---|---|
| Falsifier | Insert `## Dotfiles` → the heading check differs. Add one badge → the shields count reads 4. Add "Reviewer" in prose → the banned-term check fails (by hand until T8, then by the test) |
| Red run | At `2784e57`: `wc -l` → 948; `grep -c shields.io` → 13; first `npx akili-specs init` at `:202`; 25 `##` headings |
| Disqualifier | A line count met by long packed lines is not compliance (FR-2 AND IT MUST). The Reviewer measures lines over ~300 characters and judges each one |
| Consumers | as above |

**Done.** Every check above passes, `npm test` is green, the ledger is fully quoted, and the Reviewer's whole-README reading is PASS.

### T7: Hub, routing line, governance checklist

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~40 LOC) |
| Depends on | T6 |
| Requirements | FR-13 (overview first in *Start Here* and the *Documentation Map*; governance linked in both; anytime commands as a table); FR-14 (one Grok Bot line; BUT no behavior `bin/routing.js` lacks); FR-17 (governance item 5 requires the overview row); NFR-2 |
| Design refs | §3 rows for `docs/README.md`, `docs/model-routing.md`, `docs/skills/governance.md`; DD-10; P-6 |
| Consumers | Marketing's hub line (after the rebase) becomes a table row |
| Review | `checklist` |
| Skills | `cognitive-doc-design` |

**Scope.**
- `docs/README.md`: the edits FR-13 lists.
- `docs/model-routing.md`: one line, e.g. "Grok Bot has no routing wrappers: `akili routing` does not target it (see the CLI's Grok Bot section)."
- `docs/skills/governance.md` item 5: add "a row in `docs/overview.md` under its purpose group".

**Verification.**
- `sed -n '/^## Start Here/,/^## /p' docs/README.md | grep -m1 -o '](\([^)]*\))'` → `](overview.md)`.
- `grep -c 'governance.md' docs/README.md` → ≥ 2.
- `grep -ci 'grok bot' docs/model-routing.md` → 1.
- `sed -n '/^5\. \*\*Docs/p' docs/skills/governance.md | grep -c overview` → 1.
- NFR-2 grep → 0.

| Verification field | Value |
|---|---|
| Falsifier | Put `flow.md` first again → the first-link check reads `](flow.md)` |
| Red run | At `2784e57`: the first link is `](flow.md)`; governance count 0; routing Grok count 0; item-5 overview count 0 |
| Disqualifier | A governance link only in the Documentation Map does not meet FR-13, which says "both" |
| Consumers | as above |

**Done.** The four checks read as required, and the English check is clean.

### T8: `test/docs-overview.test.js`

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L (~380 LOC) |
| Depends on | T4, T6, T7 |
| Requirements | FR-16 (a)–(j), every clause; FR-7 scenario (a new command fails with its name); FR-11 scenarios (a new skill, two groups, a wrong binding, the Grok code check); FR-10 scenario (unexplained `harness`, banned `Reviewer`, whole word, plural, case-insensitive); FR-6 (anchor resolves); FR-16 scenario (a stale `12 commands` / `12 command skills` fails); no hard-coded counts |
| Design refs | §10 (helpers and clauses), DD-3, DD-4, DD-5, DD-12, P-5, P-6, P-7, P-13, P-14 |
| Consumers | Future specs that add a command or skill. The failure messages must name the missing file and row |
| Review | `full` |
| Skills | `tdd` |

**Scope.** Implement the design §10 helpers and clauses (a)–(j) in the style of `test/diagram-design.test.js`. No count literal for commands or skills.

**Verification.**
- `node --test test/docs-overview.test.js` → 0 fail.
- `npm test` → 0 fail.
- `grep -nE '\b(12|13|27|28)\b' test/docs-overview.test.js` → 0 count literals.

| Verification field | Value |
|---|---|
| Falsifier | Each one is executed against a temporary copy, observed red and quoted (the test reads paths from `REPO_ROOT`; run the mutations in a scratch copy of the repo, never in the worktree): (a) add `.claude/skills/zz-fake/SKILL.md` → (a) and (c) fail naming `zz-fake`; (b) delete the `/akili-quick` row from the README → (b) fails; (d) write `12 commands` in `docs/cli.md` after the rebase → (d) fails naming the line; (e) swap two `##` headings → (e) fails; (g) write `harness` unlinked → (g) fails naming the line, and write `reviewer` → it fails as banned; (i) change `#practical-example` to `#practical-examples` → (i) fails; (j) add a 4th badge → (j) fails; (h) change the Grok routing cell to `yes` → (h) fails |
| Red run | Run the suite against the pre-change README (`git show <T6 parent>:README.md` written into the scratch copy) → (e), (f), (j) fail on their assertions, and their messages are quoted |
| Disqualifier | A mutation that turns red because a parser throws (for example, a table parse failure) and not on the clause's assertion is not evidence. Fix the parser and rerun |
| Consumers | as above |

**Done.** The suite is green, every listed mutation is observed red on its assertion and quoted, there are no count literals, and `npm test` is green.

### T9: CHANGELOG and final sweep

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~10 LOC) |
| Depends on | T8 |
| Requirements | FR-17 (one *Changed* entry replacing the placeholder or joining the marketing entries; each clause quote-checked); NFR-1, NFR-3, NFR-4, NFR-5, NFR-6; KZ-002; KZ-changes--kaizen-loop-closure-2 |
| Design refs | §3 CHANGELOG row; P-15 |
| Consumers | `test/diagram-design.test.js:420` (a CHANGELOG `diagram-design` entry must survive) |
| Review | `full`: CHANGELOG clauses are the KZ-002 hot spot |
| Skills | `cognitive-doc-design` |

**Scope.**
- Write one CHANGELOG *Changed* entry: the landing README, `docs/overview.md`, the derived test, the re-targeted pins, the moved sections and the Grok anchor fix.
- **Phrase-family sweep:**
  - grep shipped docs for claims that point at README content that no longer exists (`in the README`, `README's`, `root README`, `see the README`);
  - grep for `#grok-bot-grokbot`, `Five anytime`, `Six anytime`, `What AKILI Covers`.
  - Each hit is updated, or recorded as intentionally kept with a reason.

**Verification.**
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` → all pass.
- `git diff --stat <T1 base> -- .claude bin package.json assets` → empty.
- `git log --format=%s <T1 base>..HEAD | grep -vc '^\[SPEC:changes/docs-overview\]'` → 0.
- The pack output lists `README.md` and `docs/overview.md`, and not `dotfiles/`.
- Each CHANGELOG clause is quoted against HEAD in the report.

| Verification field | Value |
|---|---|
| Falsifier | Claim in the CHANGELOG that "every doc now links the overview" → the quote-check finds a doc that does not (an overstatement, so it fails). Leave one `What AKILI Covers` mention in a shipped doc → the sweep reports it |
| Red run | At `2784e57`: `grep -c 'docs/overview.md' CHANGELOG.md` → 0; the CHANGELOG has the placeholder (P-15) |
| Disqualifier | A sweep keyed on literal strings alone is not complete. It also greps the paraphrase family above and reads every hit |
| Consumers | as above |

**Done.** All four verification commands pass, the scope and commit checks are clean, the CHANGELOG clauses are quoted, and the sweep has no open hit.

## 4. Coverage (scenario and clause level)

| Requirement clause | Owner |
|---|---|
| FR-1 scenario THEN/AND (## and ### lists), BUT (no other headings), AND IT MUST (ignore fenced) | T6 (writes), T8 (e) (enforces) |
| FR-2 THEN (≤ 200), AND (install ≤ 90), BUT (no `<details>`), AND IT MUST (no packed lines, Reviewer-gated) | T6, T8 (f); packed lines: T6 Reviewer |
| FR-3 THEN (≤ 3 sentences: Reviewer), AND (5 bullets + overview link), AND (4 glossary rows), AND IT MUST (marketing), BUT (no unshipped capability) | T6; T8 (j) bullets/glossary; the sentence count and BUT: T6 Reviewer |
| FR-4 THEN (src + centered), AND (alt passes FR-10), BUT (assets untouched) | T6; T8 (g)(j); assets: T6/T9 diff-stat |
| FR-5 THEN/AND (one install, one check, cli link), BUT (no per-tool doctor list or tables), AND IT MUST (Grok Bot only named) | T6; T8 (j) (no `doctor --tool`); T3 (cli holds the detail) |
| FR-6 THEN (command + output per step), AND (anchor resolves), BUT (no sample document) | T6; T2 (target section); T8 (i) |
| FR-7 THEN (a new command fails), AND (links exist), BUT (no claim beyond the page), and the Windows note | T6; T8 (b)(i); BUT: T6 Reviewer quote-check |
| FR-8 THEN (targets exist), AND (overview first) | T6; T8 (i)(j) |
| FR-9 THEN (3 shields), AND (tools + OS line), BUT (no `### Supercharge`) | T6; T8 (j)(e) |
| FR-10 THEN (unexplained harness fails), AND (banned Reviewer fails), AND IT MUST (whole word, plural, case-insensitive) | T6; T8 (g) |
| FR-11 Skill-added scenario THEN, AND (two groups), AND (binding), BUT (row membership) | T4; T8 (a) |
| FR-11 Grok scenario THEN (three `no` cells + link), AND IT MUST (code check) | T4; T8 (h) |
| FR-12 THEN (Practical Example in flow), AND (link resolves), BUT (no heading-only "already in") | T1, T2, T3, T6 (quotes); T8 (i) |
| FR-13 THEN (first link overview), AND (governance), AND (table rows) | T7; T8 (j) |
| FR-14 THEN (one line), BUT (no false behavior) | T7; T8 (j); BUT: T7 Reviewer against `bin/routing.js` |
| FR-15 THEN (README guard fails), AND (overview slug removal fails), AND (Archify removal fails), BUT (no regex/token/message change), AND IT MUST (only S1/S2/S3) | T5 |
| FR-16 (a)–(j), the marketing-lands scenario THEN, AND (stale `12 commands`) | T8; T1 re-runs the counts after the rebase |
| FR-17 roadmap, dotfiles, CONTRIBUTING, cli prerequisites and local checkout, Grok anchors | T3 |
| FR-17 diagram-design.md:21 | T5 |
| FR-17 SKILL.md:76 accepted risk | recorded (requirements defect table); no task, out of scope |
| FR-17 governance item 5 | T7 |
| FR-17 CHANGELOG | T9 |
| FR-17 scenario THEN/AND (release flow + repo structure in CONTRIBUTING), BUT (no Dotfiles/nvim in README) | T3, T6 |
| NFR-1 | every task's verification; T9 full set |
| NFR-2 | every task (heuristic grep + Reviewer) |
| NFR-3, NFR-4, NFR-5, NFR-6 | T9 (plus T3 for NFR-6, T6 for NFR-5) |

No task is `skip-eligible`.
