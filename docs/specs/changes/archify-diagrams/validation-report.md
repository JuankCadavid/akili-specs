# Validation Report — diagram-design (Interactive Methodology Diagrams via Archify)

**Verdict: NOT ARCHIVE-READY. 1 FAIL, 8 WARN findings.** The shipped skill, the command wiring and the docs conform to the approved spec. The one blocker is in the test file this spec added: `test/diagram-design.test.js` reads `docs/specs/changes/archify-diagrams/requirements.md` and `design.md` at runtime. `/akili-archive` Step 5 moves that folder, and a simulated move turns 2 of its 13 tests red (`ENOENT`). Running archive as things stand would leave `npm test` red on master. The fix is small and touches only the test file. After it, the spec is archive-ready; every WARN is non-blocking.

| Result | Rows |
|---|---|
| PASS | 106 |
| WARN | 15 rows → 8 findings (W-1…W-8) |
| FAIL | 1 (F-1) |
| BLOCKED | 0 |

---

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/archify-diagrams` |
| Validated at | `3f084a7` (worktree `skill-archify`, clean tree), pre-spec base `1db53eb` (= `git merge-base HEAD master`) |
| Date | 2026-10-18 |
| Validator | Opus 5.5 (`claude-opus-5-5`), T3 Auditor, fresh context. Implementer was `sonnet`, so author ≠ auditor holds |
| Audit rules | `.agents/reviewer.md`: the Audit Checklist and the 4R lenses |
| Constitutional docs | `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, `docs/specs/general-setup/`: **n/a**, none of them exists in this repo. Root `CLAUDE.md` → `AGENTS.md` were read |
| Kaizen lessons applied | KZ-002 (CHANGELOG quote-check), KZ-changes--gate-falsifiability-2 (clause-level walk), KZ-changes--leader-brief-contract-2 (every figure here was run, not predicted), KZ-changes--model-routing-configurator-1 (enumeration-wide negative) |
| Constraints observed | Only this file was written. No commit, no network, no npm install or npx, Archify not run. Scratch exports went to the session scratchpad only |

## 2. Summary

| Area | Result | One line |
|---|---|---|
| Tasks | PASS | T1–T7 are `[x]`. Each has a Reviewer PASS and a Leader-verified evidence re-run |
| Files | PASS | Every file in design §4/§8 and the tasks.md scopes exists. No unscoped package file changed |
| Build | PASS | `npm test` 272/272. `verify:cli` reports 25 skills. Pack +13 591 B with 0 Archify paths. `git diff --check` is clean |
| Requirements | **FAIL** ×1, WARN ×8 rows | F-1 breaks FR-10 at archive. The WARN rows are the behavioural gaps test-report already records (FR-2, FR-5, FR-7) plus one CHANGELOG clause |
| Design | PASS, WARN ×5 rows | All 8 DDs are reflected, and the DD-6 deviation is recorded. P-13 stays UNVERIFIED. Two figures drift (LOC, pack bytes). Doc status fields are stale. Success criterion 1 was not executed end to end |
| Constitution impact | WARN ×2 rows | execution.md has no `## Constitution Impact` block, and root `AGENTS.md` → *Skill Usage* does not mention `diagram-design`. Both are pending for `/akili-archive` |
| Advisories | 13 (advisory only) | Includes the **accepted** `review-<n>` out-dir gap (user decision 2026-10-18) |

## 3. Task Completion

| Task | Status | Closing record (execution.md) | Evidence | Result |
|---|---|---|---|---|
| T1 skill | `[x]` | Reviewer PASS, attempt 2 (attempt 1 FAIL on the doubled-prefix path) | Five checks re-run by the Leader. Falsifier executed (flag grep 1 → 0) | PASS |
| T2 constitution | `[x]` | Reviewer PASS, attempt 2 (attempt 1 FAIL: "whose condition holds" missing from the Step 5 line) | 3 hits under Steps 3/4/5. `archify` 0. Falsifier: line moved to Step 6 | PASS |
| T3 specify | `[x]` | Reviewer PASS, attempt 1 | 1 hit at :222, inside Step 2.1 (207–236). Falsifier: line moved to Step 3.2 | PASS |
| T4 archive | `[x]` | Reviewer PASS, attempt 1 | Single hunk before `### Step 3`. `Kind` count 2 → 2. Falsifier: added `diagram-sync` | PASS |
| T5 views-doc | `[x]` | Reviewer PASS (skip claim judged not earned, so it was reviewed) | Original clause ×1, `diagram-design` ×1, 1+/1− | PASS |
| T6 docs/counts | `[x]` | Reviewer PASS, attempt 2 (attempt 1 FAIL: the CHANGELOG "pins … 25 dirs" clause) | Red run quoted ("expected 199 … counted 201"). 259/259 | PASS |
| T7 walkthrough | `[x]` | Reviewer PASS, attempt 1 | Runs A–D verified on disk by the Leader. User authorization quoted | PASS |

No task used REVIEW_SKIPPED or REVIEW_WAIVED. 10 review rounds were spent against a budget of 12.

## 4. File Existence

Compared against `git diff --stat 1db53eb..HEAD`: 21 files, +1813/−17.

| File (design §4 / §8, tasks.md scope) | Expected | At HEAD | Result |
|---|---|---|---|
| `.claude/skills/diagram-design/SKILL.md` | new | 76 lines, 5 989 B | PASS |
| `.claude/skills/diagram-design/references/slot-catalog.md` | new | 32 lines, 2 954 B | PASS |
| `docs/skills/diagram-design.md` | new | 26 lines | PASS |
| `.claude/commands/akili-constitution.md` | +1 line ×3 | +6 (3 lines + 3 blank) | PASS |
| `.claude/commands/akili-specify.md` | +1 line in Step 2.1 | +2 | PASS |
| `.claude/commands/akili-archive.md` | item 11 in Step 2 | +1 | PASS |
| `.claude/skills/software-architect/references/views-documentation.md` | sentence extended | 1+/1− | PASS |
| `docs/skills/governance.md` | conditional row + env example | 2+/2− | PASS |
| `docs/skills/README.md` | inventory row | +1 | PASS |
| `README.md` | Archify install note | +3 | PASS |
| `docs/cli.md` | 24 → 25 ×3 | 3+/3− | PASS |
| `test/install-cursor.test.js` | 199 literal + comments | 8+/8− | PASS |
| `test/fixtures/doctor-codex-baseline.txt` | amendment 2026-10-18 | 2+/1− | PASS |
| `CHANGELOG.md` | `[Unreleased]` | 8+/2− | PASS |
| `test/diagram-design.test.js` | `/akili-test` output (not in design §8; owned by the test phase) | 504 lines, 13 tests | PASS (exists; see F-1 for its defect) |
| Unscoped changes | none | none: `bin/` untouched, `.claude/skills/kaizen` untouched, no `model:` key | PASS |

## 5. Build Integrity

| Command | Output (run 2026-10-18 at `3f084a7`) | Result |
|---|---|---|
| `npm test` | `# tests 272` · `# pass 272` · `# fail 0` | PASS |
| `npm run verify:cli` | `Summary: 11 commands \| 25 skills \| 8 resources (akili-specs v2.32.2)`; `diagram-design` listed | PASS |
| `npm run pack:dry-run` + `npm pack --dry-run --json --ignore-scripts --offline` | `unpackedSize` 4 507 765, 283 files. Baseline re-measured from a `git archive 1db53eb` export: 4 494 174, 280 files. **Δ +13 591 B ≤ 20 KB.** Archify-artifact regex (`archify.mjs\|renderers/\|\.schema\.json\|brand-marks\|THIRD_PARTY`) → 0 | PASS |
| `git diff --check` (worktree, and `1db53eb..HEAD`) | clean, exit 0 | PASS |
| `node bin/akili.js install --tool all --dry-run` | `diagram-design` ×7, TOTAL installed 7 / skipped 318 | PASS |
| `node bin/akili.js doctor --tool all` (real HOME) | 5 × `MISSING diagram-design`, `ok 43 \| missing 1` per host. **Environmental:** the new skill is not installed in this machine's HOME yet. This shows doctor already enumerates the new skill | PASS (environmental note) |

## 6. Requirement Coverage

The primary evidence is reused from `test-report.md` §7 and cross-checked clause by clause against the shipped text. Every quote below was read at HEAD.

### FR-1 — Packaged original-authorship conditional skill

| Clause | Owner | Shipped text | Evidence | Result |
|---|---|---|---|---|
| Fields + `binding: conditional` | T1 | `SKILL.md:2–9`: `name: diagram-design`, `license: MIT`, `author: Juan Carlos Cadavid — jcadavid.com`, `binding: conditional`, `version: "1.0"`, `inspired-by` | FR-1 test | PASS |
| BUT no `adapted-by`/`adapted-for`/`source` | T1 | absent from the frontmatter | FR-1 test | PASS |
| MUST name Archify, tt-a1i, MIT, URL | T1 | `:9` "Archify by tt-a1i (MIT, https://github.com/tt-a1i/archify)" | FR-1 test | PASS |
| No Archify file ships: zero matches | T6 | pack list | regex → 0 (re-run above) | PASS |
| MUST: only AKILI-authored files | T1 | dir = `SKILL.md` + `references/slot-catalog.md` | FR-1 test | PASS |

### FR-2 — Slot catalog

| Clause | Owner | Shipped text | Evidence | Result |
|---|---|---|---|---|
| ≥ 10 rows naming doc · section · condition · Archify type · Mermaid type · question | T1 | `slot-catalog.md:9–18`, 10 rows, all six columns | FR-2 test (matched against the FR-2 table read from `requirements.md`) | PASS |
| THEN TRD carries C4 Context + Container, each with a legend | T1, T2 | catalog `:12–13` `always`; `:20` "each carry a legend and are always filled"; constitution Step 5 "C4 Context and C4 Container are always filled" | Static only. T7 Run A rendered C4 Container, but no C4 Context, and not through `/akili-constitution` (test-report gap 3) | WARN (W-1) |
| BUT no slot whose condition is false (negative) | T1 | SKILL `:32` "A slot whose condition is false leaves nothing in the document: no empty block, no placeholder, no note." | Wording test only; behaviour not executed | WARN (W-1) |
| MUST: absence is the signal; the catalog owns conditions | T1 | SKILL `:32` "The catalog owns the conditions." | Wording only | WARN (W-1) |

### FR-3 — Mermaid is canonical

| Clause | Owner | Shipped text | Evidence | Result |
|---|---|---|---|---|
| Inline `mermaid` block + legend in the slot's section | T1 | SKILL `:36` "Every filled slot is an inline fenced `mermaid` block in the slot's section, followed by a legend." | T7 Run C | PASS |
| THEN Mermaid with no link (Archify absent) | T1 | `:36` "Without an interactive view, write no link line" | Run C: `grep -c "Interactive view"` 0 | PASS |
| MUST NOT state or imply a view | T1 | `:36` "do not state or imply that one exists" | Run C | PASS |

### FR-4 — Interactive render

| Clause | Owner | Shipped text | Evidence | Result |
|---|---|---|---|---|
| Paths (baseline / spec) | T1 | `:42` `docs/diagrams/<slot-id>.json` … `docs/specs/<spec-path>/diagrams/<slot-id>.json` | Run A files `docs/diagrams/trd-c4-container.{json,html}` | PASS |
| THEN files exist + all gates passed | T1 | §5 table "All gates passed → Write the link line" | Run A exit 0, all four gates pass | PASS |
| AND link by relative path + credit | T1 | `:43` exact §5.2 template | Run A link lines byte-exact; FR-4 test | PASS |
| BUT receipts not committed (`.gitignore`) | T1 | `:44`, four patterns | `git check-ignore` 8/8 | PASS |
| MUST reuse slot paths | T1 | `:42` "reuse the same paths, never timestamped copies" | Run B re-render, same paths, no duplicates. Residual: accepted advisory A-1 | PASS |
| Browser-less THEN HTML kept + linked | T1 | §5 row "Keep the HTML, write the link line with the suffix" | Run B exit 2 `skipped`, HTML sha identical | PASS |
| MUST annotate, never verified | T1 | `:43` ` · browser check not run`; §5 "never call the view verified" | Run B suffix present | PASS |

### FR-5 — Fallback never blocks

| Clause | Owner | Shipped text | Evidence | Result |
|---|---|---|---|---|
| Unavailable → Mermaid only, phase continues | T1 | `:56` "never blocks the phase. The slot stands as Mermaid only." | Run C | PASS |
| Command report names the slots left Mermaid-only and why | T1 | `:56` "Report in one line each slot left without an interactive view and why." | Run C report text **not captured verbatim** | WARN (W-2) |
| THEN failure: no link + partial output deleted; AND continue | T1 | §5 row "Delete any partial output for the slot, write no link line, continue the phase" | Not exercisable on demand; Reviewer walk only | WARN (W-2) |
| BUT no retry beyond Archify's limit (negative) | T1 | §5 row "do not retry beyond that limit" | Reviewer walk only | WARN (W-2) |

### FR-6 — No stale interactive view

| Clause | Owner | Shipped text | Evidence | Result |
|---|---|---|---|---|
| Re-render or remove link + `.json`/`.html` | T1 | `:60` "re-render its view in the same run, or remove its link line and its `.json` and `.html`" | Run D: link + both files removed, lifecycle untouched | PASS |
| MUST report the removal | T1 | `:60` "report the removal in the command's summary" | Run D report quoted verbatim | PASS |

### FR-7 — Guard-rails

| Clause | Owner | Shipped text | Evidence | Result |
|---|---|---|---|---|
| Never offer explainer | T1 | `:66` | FR-7 test; T7: no offer | PASS |
| Never write `[archify explainer: …]` | T1 | `:67` | `~/.claude/CLAUDE.md` sha1 unchanged | PASS |
| Never install/update/snooze/ignore | T1 | `:68` | FR-7 test; NFR-4 grep | PASS |
| Relay update notice at most once (strict) | T1 | `:69` "at most once per command run, as information only" | Not exercised: the update check was disabled by user rule | WARN (W-2) |
| No third-party brand marks unless asked | T1 | `:70` | FR-7 test | PASS |
| Delegate every command/flag/repair rule | T1 | `:41`, `:71` | DD-5 negative grep → 0 (`--quality\|--json\|--repo-root\|--out-dir\|finalize `) | PASS |
| BUT never alter the user's Archify config/env (negative) | T1 | `:72` | T7 checksum; no env written | PASS |

### FR-8 — Command wiring

| Clause | Owner | Shipped text | Evidence | Result |
|---|---|---|---|---|
| Rows 1–3, constitution Steps 3/4/5 | T2 | `:163` "fill the PRD slots whose condition holds"; `:208` UX/UI; `:245` "…TRD slots whose condition holds; C4 Context and C4 Container are always filled." | FR-8 test (exactly 3, each under its step) | PASS |
| Row 4, specify Step 2.1 | T3 | `:222` "If the design is architecturally significant (the same test as above), load `diagram-design` and fill the `design.md` slots the change alters." | FR-8 test | PASS |
| Row 5, archive Step 2 | T4 | `:124` "11. Diagrams: links to the spec's interactive views, and each baseline diagram slot the spec's design made stale as a follow-up (load `diagram-design` only when the spec has a `diagrams/` folder or slot)" | FR-8 test | PASS |
| views-documentation keeps Mermaid default + pointer | T5 | `:14` "Mermaid is the default renderer in AKILI docs. The `diagram-design` skill owns diagram slots, storage, and the optional interactive view." | FR-8 test | PASS |
| THEN each line names the skill + states its condition | T2–T4 | as quoted | Reviewer PASS ×3 | PASS |
| BUT no command names `archify` (negative, closed set) | T2–T4 | — | `grep -rlic archify .claude/commands` → none (re-run); enumeration-wide test + mutation M1 red | PASS |
| MUST leave archive Step 3 unchanged | T4 | — | Step 3 byte-identical to `1db53eb` (test); `Kind` 2 → 2 | PASS |

### FR-9 — Governance, docs, CHANGELOG

| Clause | Owner | Shipped text | Evidence | Result |
|---|---|---|---|---|
| governance: `conditional` row + `archify` env example | T6 | `governance.md:38` "`diagram-design` (diagram slots of constitution/specify/archive)"; `:21` "and `archify` (tt-a1i's interactive diagram renderer, MIT)" | FR-9 test | PASS |
| `docs/skills/diagram-design.md` exists | T6 | 26 lines | FR-9 test | PASS |
| skills README row (Binding, Origin, Wired In) | T6 | "`conditional` \| Juan Carlos Cadavid — jcadavid.com (MIT) \| … \| `/akili-constitution` Steps 3–5, `/akili-specify` Step 2.1, `/akili-archive` Step 2" | FR-9 test | PASS |
| README optional install, user's choice, credit + licence | T6 | `README.md:831` "install [Archify](…) by tt-a1i (MIT licence) yourself: `npx skills add tt-a1i/archify`. AKILI references it and never ships or installs it" | FR-9 test | PASS |
| `docs/cli.md` 24 → 25 at every site | T6 | `:183`, `:195`, `:216` | `grep "24 packaged"` outside specs → 0 | PASS |
| CHANGELOG, every clause quote-checked (KZ-002, strict) | T6 | `CHANGELOG.md:11` "Every diagram slot in the baseline and spec documents is filled as an inline Mermaid block". SKILL `:36` says "Every **filled** slot"; conditional slots whose condition is false are never filled (`:32`) | Re-checked here: every other clause matches HEAD, including `:17` (201 / 212 / 25 / 36 / `ok 44`) | WARN (W-3) |

### FR-10 — Package and test hygiene

| Clause | Owner | Shipped text | Evidence | Result |
|---|---|---|---|---|
| install-cursor literal 199 → 201 + comments | T6 | `:244–248` `201`; comments 212/25/36 | `find .claude/skills -type f` 201, 25 dirs (baseline export: 199, 24) | PASS |
| doctor-codex fixture updated (amendment) | T6 | `OK diagram-design`, `ok 44` | test 75 green | PASS |
| `npm test` passes | T6, `/akili-test` | — | 272/272 at HEAD. **After a simulated archive move it is 270/272**: tests 3 (FR-2) and 4 (FR-4) fail with `ENOENT … docs/specs/changes/archify-diagrams/requirements.md` / `design.md` | **FAIL (F-1)** |
| Pack growth ≤ 20 KB | T6 | — | +13 591 B | PASS |
| `verify:cli` lists the skill | T6 | — | listed | PASS |
| `git diff --check` clean | T6 | — | clean | PASS |

### NFRs

| ID | Measure | At HEAD | Result |
|---|---|---|---|
| NFR-1 | `SKILL.md` ≤ 8 KB; dir ≤ 16 KB | 5 989 B; 8 943 B | PASS |
| NFR-2 | catalog in `references/`, read only at a slot step | SKILL `:32` "Read `references/slot-catalog.md` at a slot step, not before." | PASS |
| NFR-3 | host roots only in the availability check | six roots only at SKILL `:40`; none in the 5 wired lines (NFR-3 test) | PASS |
| NFR-4 | no install/npx/fetch in command or skill text | `grep -rnE "model:\|npx\|npm install\|curl\|wget"` on the skill dir → 0; `npx` only in README (user doc) | PASS |
| NFR-5 | no `model:` key | 0 | PASS |

## 7. Linting & Code Quality (4R, advisory)

The repo has no linter. `git diff --check` and `npm test` are the gates (§5). Everything below is **ADVISORY**: none of it gates the spec and none of it may become a task in this spec.

| # | Lens | Finding | Source | Suggested follow-up |
|---|---|---|---|---|
| A-1 | RISK | **Accepted advisory.** Archify gives later runs after a browser-check `--out-dir <folder>/review-<n>`. A successful repair could land the HTML off the slot path, against FR-4 "reuse the slot's existing paths". The skill has no promote or clean-up sentence | execution.md T7 | User decision 2026-10-18: keep as an advisory, candidate for a separate spec. The spec is not reopened |
| A-2 | RISK / READABILITY | Browser-skipped exits 2, and Archify's output also carries `ok:false` / `failedStage:"browser-check"`. An agent could enter the repair loop. Run B showed no loop, but one sentence would close the gap: "a skipped browser check is not a failed delivery; do not repair it" | T1, T7 | Same follow-up spec as A-1 |
| A-3 | READABILITY | `:56` "Report in one line each slot…" can be read as one line per slot. FR-5 and design §6 ask for one line listing all of them | T1 | Reword in a later edit |
| A-4 | RELIABILITY | Receipts from re-runs land in review subfolders. The patterns have no slash, so they still match at any depth | T1 | none (harmless) |
| A-5 | READABILITY | governance `:21` has two "and"s in a row, and `archify` sits loosely under the paragraph's "skills that belong in the Skill Map" framing, because FR-8 reaches it only through `diagram-design` | T6 | Copy edit (`/akili-quick`) |
| A-6 | RELIABILITY | `test/install-cursor.test.js:216` keeps the attribution "brief: 'confirm 201 …'", but the original brief said 199. The attributed quote was altered | T6 | Restore the quote or drop the attribution |
| A-7 | RELIABILITY | After a §6 removal the four receipt sidecars stay orphaned (git-ignored; conforms, since FR-6 names only `.json`/`.html`) | T7 | Optional clean-up sentence |
| A-8 | — | T7 observation 3 is consistent with P-7 (a named location overrides `.archify/`) | T7 | none |
| A-9 | READABILITY (new) | SKILL `:36` puts the legend after the block ("followed by a legend"), and `:43` puts the link line "Directly under the Mermaid block". Both claim the line after the block, so the order of block, legend and link line is unstated | validator | State the order in one clause |
| A-10 | RISK (new) | `test/diagram-design.test.js:316–326` turns a one-time spec rule into permanent invariants. `doesNotMatch(step3, /diagram/i)` and the Step 3 byte-identity against `git merge-base master HEAD` both apply. Once merged, the merge-base on master is HEAD, so the identity check compares Step 3 with itself and proves nothing. A future branch that legitimately edits archive Step 3 goes red | validator | Fix together with F-1: pin the comparison to `1db53eb` or drop it once archived |
| A-11 | READABILITY (new) | The README "Skill governance" paragraph (`:829`) lists tool-shipped skills `orchestration`, `playwright-cli` and `hyperframes` but not `archify`, which `governance.md` now lists | validator | Copy edit, or leave as is (archify is not a Skill Map skill) |
| A-12 | — | The T1 Implementer assumptions (slot id stems, `version: "1.0"`, type choices, Antigravity treated as unavailable) were judged non-conflicting. Confirmed: they do not contradict any FR | T1 | none |
| A-13 | RELIABILITY (new) | Test seams `DD_MUTATE_COMMANDS_DIR` / `DD_MUTATE_EXPECT` are inert unless set, and the test is not in the package. No risk; noted for the next maintainer | validator | none |

Security and authorization: n/a, since the change adds no executable product code. Network: none is introduced by AKILI (NFR-4). Archify's own update check is documented as Archify's behaviour.

## 8. Design Conformance

### Design decisions

| DD | Reflected at HEAD | Result |
|---|---|---|
| DD-1 conditional, original authorship | frontmatter `binding: conditional`, `inspired-by`, no `adapted-*` | PASS |
| DD-2 catalog in `references/` | commands carry one line each and no slot types | PASS |
| DD-3 commit `.json` + `.html`, ignore receipts | SKILL `:44` | PASS |
| DD-4 fixed `Interactive view:` line | SKILL `:43` | PASS |
| DD-5 outcomes, never flags | flag grep → 0 | PASS |
| DD-6 no archive Step 3 write; stale slots go to the Step 2 follow-ups. **Deviation from proposal §5 is recorded** at `proposal.md:52` ("changed at specify (design DD-6)") and in design DD-6 | Step 3 byte-identical to the base | PASS |
| DD-7 availability by host list **or** known roots | SKILL `:40` | PASS |
| DD-8 explainer suppressed | SKILL `:66–67` | PASS |

### Premise Ledger at HEAD

| Row | State at HEAD | Result |
|---|---|---|
| P-1 | Holds. The line drifted by this spec's own insertion: C4 requirement now at `akili-constitution.md:262` (was `:256`) | PASS |
| P-2 | Holds as a baseline premise at `854547f`. It was superseded by design (the commands now name `diagram-design`) | PASS |
| P-3 | Holds (`governance.md:17–23`) | PASS |
| P-4 | Holds: `bin/akili.js:50` `copyTreeSync`, `:66` recursion, `:670` call. `bin/` unchanged | PASS |
| P-5 | Holds, including the amended fixture consumer | PASS |
| P-6, P-7, P-8, P-9 | Archify data-env at `208acba`. Not re-run by the validator (Archify run prohibited). T7 Runs A/B re-observed P-6 (exit 2 `skipped`), P-7 (named location) and P-8 (HTML 811 507 B, four receipts) | PASS |
| P-10 | Holds. Drifted to `akili-archive.md:132` (was `:131`) | PASS |
| P-11 | Holds. Step 2.1 conditional lines now at `:213–222` | PASS |
| P-12 | Holds. `archive-summary` readers at `:109`, `:202` (was `:201`) | PASS |
| P-13 | **Still UNVERIFIED** (Low). This validator session lists `diagram-design` from the project `.claude/skills/` but has no `archify`, so the host route cannot be exercised here. That corroborates T7's explanation; it does not verify the row. The *If false* fallback (root check) held in T7 Runs A/C | WARN (W-4) |

### Cross-document figure check

| Figure | Documents | At HEAD | Result |
|---|---|---|---|
| Skills 24 → 25 | requirements §4, design §8, CHANGELOG, `docs/cli.md`, execution T6 | 25 dirs (baseline export: 24); `verify:cli` 25 | PASS |
| Skill files 199 → 201 | requirements §4, CHANGELOG, test, execution | 201 (baseline: 199); shared root 212, ops 36 | PASS |
| Slots = 10 | FR-2 table, catalog, T1 check (2), test | 10 rows | PASS |
| LOC | design §11 ≈ 300; execution summary "≈ 157 changed lines"; T6 entry "114 + 27/−16" | Measured with `git diff --numstat 1db53eb..HEAD`, shipped non-spec files excluding the test-phase file: **+171/−17**. T6 alone (`19555fd..c19252a`): **+53/−16**, not +27/−16. Within budget either way | WARN (W-5) |
| Review rounds | design 12 budget; execution 10 | Recount: T1 2 + T2 2 + T3 1 + T4 1 + T5 1 + T6 2 + T7 1 = 10 | PASS |
| Pack bytes | execution T6 and summary "+13 518 B"; test-report "+13 591" | HEAD +13 591 (re-measured; baseline 4 494 174 re-measured). The 73 B gap is exactly T6 attempt 2's longer CHANGELOG `:17` clause (computed), so the execution figure is the stale pre-rework measure | WARN (W-5) |
| Tests 259 / 272 | tasks baseline 259; execution 259; test-report 272 (+13) | 272 | PASS |
| HTML size | proposal "812 KB", P-8 830 859 B, T7 811 507 B | consistent (KiB vs B; different diagrams) | PASS |
| Doc status | requirements/design/tasks Document Control "Draft — awaiting the specify approval gate" | Contradicted by execution.md (7/7 executed). No specify-gate approval is recorded in any spec document. Approvals of the amendment and of T7 are recorded | WARN (W-6) |

### Proposal alignment

| Item | Evidence | Result |
|---|---|---|
| Option C (thin AKILI skill + referenced Archify) | 8.9 KB skill, 0 Archify files, commands wired | PASS |
| Non-goals: no vendoring; no installer `npx`; no re-draw of repo docs; explainer suppressed; no `/akili-audit` drift; Mermaid kept | `bin/` untouched; `docs/flow.md` untouched; SKILL §7; Mermaid canonical | PASS |
| SC-1: constitution run with Archify → TRD C4 Context + Container each Mermaid + linked HTML that passed `finalize` | **Never executed end to end.** T7 Run A rendered only C4 Container (plus a held-out lifecycle) in a toy TRD, not through `/akili-constitution`, and there was no C4 Context slot. The rules text supports it; the evidence covers half the slots and not the command | WARN (W-7) |
| SC-2: same run without Archify → Mermaid only, no error, no claim | T7 Run C at the skill boundary; wiring is proven statically (FR-8 test) | PASS |
| SC-3: governance lists `diagram-design` + `archify`; docs page; CHANGELOG | §6 FR-9 | PASS |
| SC-4: test / verify / pack ≤ ~20 KB / diff-check | §5 | PASS |
| SC-5: no Archify repository file in the package | pack regex 0; skill dir has 2 files | PASS |

## 9. Test Evidence Summary

| Source | Status | Cross-check |
|---|---|---|
| `test-report.md` | Overall PASS, 272/272, 0 `PRODUCT_BUG`, 4 accepted gaps | Matrix confirmed against requirements at clause level (§6). Gaps 1–3 are carried as W-1, W-2, W-7; gap 4 (approximate pack test) is superseded by the real delta re-measured here |
| Mutation evidence M1, M2 | red at the assertion, reverted | Plausible from the seams' code; not re-run (not needed for a verdict) |
| T7 Runs A–D | Leader-verified on disk, Reviewer PASS | Behavioural proof for FR-3/4/5 (unavailable)/6/7 (explainer, config) |
| New defect found by validation | — | **F-1:** the test suite depends on the un-archived spec folder (reproduced in a scratch `git archive HEAD` export with the folder moved: `# pass 11 # fail 2`) |

## 10. Agent Guide / Constitution Impact

| Check | Finding | Result |
|---|---|---|
| `## Constitution Impact` blocks in execution.md | None, although T1 created a new packaged skill and T2–T4 reshaped three command surfaces | WARN (W-8) |
| Root `AGENTS.md` → *Skill Usage* | Lists `gsap-animation`, `kaizen`, `software-architect`, `cognitive-doc-design` and others with their wiring; **no `diagram-design` line**. *Skill Governance* text is generic and needs no change | WARN (W-8) |
| `## Module Guides` / child guides | n/a: the repo has no Module Guides index, and the change creates no module with divergent conventions | PASS |
| CodeGraph | Re-index due at `/akili-archive` Step 3 (new skill files) | note |

Both WARN rows are **pending work for `/akili-archive`** (Constitution & Graph Sync). On this spec branch they become a `Kind: guide-sync` pending item, not an edit. This report does not edit them.

## 11. Remediation

| ID | Finding | Remediation | Owner | Blocks archive |
|---|---|---|---|---|
| **F-1** | `test/diagram-design.test.js:57` hardcodes `SPEC_DIR = docs/specs/changes/archify-diagrams`; tests FR-2 (`:200`) and FR-4 (`:241`) read `requirements.md` / `design.md` from it. `/akili-archive` Step 5 moves the folder, after which `npm test` is red (270/272, `ENOENT`) and FR-10 "`npm test` passes" is false on master | Resolve the spec dir with a fallback (`changes/archify-diagrams` or `archive/*-changes--archify-diagrams`), or embed the FR-2 rows and the §5.2 template as literals that cite the spec. Re-run `npm test` and the simulated-move check (export HEAD, move the folder, `node --test test/diagram-design.test.js`). Fold in A-10 | `/akili-test changes/archify-diagrams` (Tester owns the file) | **Yes** |
| W-1 | FR-2 behavioural clauses (both C4 slots with a legend; no false-condition slot; absence is the signal) are static-only | Accept as test-report gap 3, or exercise them on the first real `/akili-constitution` run | User (accept) | No |
| W-2 | FR-5 report line not captured verbatim; FR-5 failure path and its no-retry BUT not executed; FR-7 "at most once" notice not exercised. These are negative or strict clauses, judged **WARN, not FAIL**: each is implemented by its own sentence in the shipped rules (the deliverable), and executing them needs a forced Archify failure or network, which the user forbade | Accept as test-report gap 2; optional live check later | User (accept) | No |
| W-3 | CHANGELOG `:11` "Every diagram slot … is filled" overstates SKILL `:36` "Every filled slot" (KZ-002) | Reword to "Every filled diagram slot …" | Implementer, via `/akili-quick` or in the F-1 fix commit | No |
| W-4 | P-13 host-listed route still UNVERIFIED (Low; fallback proven) | Verify in a live session with Archify in a scanned root | User / next live session | No |
| W-5 | execution.md figures stale: pack "+13 518 B" (HEAD +13 591) and LOC "≈157" / T6 "+27/−16" (measured +171/−17 shipped, T6 +53/−16) | Correct both figures in execution.md §3 and the T6 entry at archive (spec-folder write) | `/akili-archive` | No |
| W-6 | requirements/design/tasks still read "Draft — awaiting the specify approval gate"; the specify approval is not recorded | User confirms the approval date; archive records it and flips the status fields | User + `/akili-archive` | No |
| W-7 | Success criterion 1 not executed end to end (only C4 Container rendered, outside `/akili-constitution`) | Accept as an accepted risk, or run one `/akili-constitution` TRD step with Archify | User (accept) | No |
| W-8 | No `## Constitution Impact` block; root `AGENTS.md` *Skill Usage* lacks `diagram-design` | Record as a `guide-sync` pending item: one line such as "Use `diagram-design` for diagram slots in PRD/UX/TRD/design.md (Mermaid canonical; Archify optional)". Re-index CodeGraph | `/akili-archive` Step 3 | No |

Remediation count: 1 blocking and 8 non-blocking findings, plus 13 advisories (A-1 accepted).

## 12. Archive Readiness Recommendation

**Not ready yet.** The only condition left unmet is "no FAIL findings remain unresolved". F-1 is a 2-test, test-file-only fix, and archiving before it lands would put a red suite on master. Every WARN is non-blocking and needs either user acceptance (W-1, W-2, W-4, W-7) or archive-time bookkeeping (W-5, W-6, W-8). W-3 is a one-word CHANGELOG fix.

Next command:

```text
/akili-test changes/archify-diagrams
```

That run fixes F-1 (and optionally W-3 and A-10). Re-validate F-1 only: run `npm test` plus the simulated-move check. Then:

```text
/akili-archive changes/archify-diagrams
```
