# Validation Report — Close the design-evaluation gaps found in the 2.40.0 audit

**Verdict: PASS with WARN. 0 FAIL, 0 BLOCKED, 7 WARN.** All 11 tasks are done, every build check is green (`npm test` 1315/1315), and every requirement clause has a task that owns it and a test. The walkthrough found no false `PASS`. It did find four places where the rules text is unclear or leaves a gap: the banner and fold verdicts on the same capture, the SKILL.md hash, an off-edge CTA, and the exclusion on the download call. It also found some count drift between documents and one CHANGELOG tense. P-16 is backed by evidence but still waits on JC. **Archive is possible once JC accepts or schedules the WARNs.** W-1 is the one to decide first.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-contract` |
| Validated at | `4b8dbd4` (clean tree); baseline `3961990` (spec commit on `8268cb7`) |
| Date | 2026-10-31 |
| Auditor | T3 Auditor, Claude Opus 5.5. The Implementers ran on `sonnet` (`execution.md`), so the author and the auditor are different models. There is no `## Model Routing` registry in this repo, so the checkpoint passes silently |
| Constitutional context | Read: root `CLAUDE.md` and `AGENTS.md`. **Absent** (each checked with `ls`): `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/`, `docs/specs/general-setup/`. There are no package-level `CLAUDE.md` files |
| Spec docs read | `proposal.md`, `requirements.md`, `design.md`, `tasks.md`, `execution.md` (whole), `test-report.md`, `upstream-request.md`. `judgment.md` was consulted through the design's references only |
| Deliverable | `software`. There is no video gate |
| Skills | `cognitive-doc-design` (this report). `impeccable-bridge` is the *subject* of the audit, not a gate: this repo has no UI |
| Scope rule | Report only. No shipped file, spec doc or test was edited. Nothing was committed |

## 2. Summary

| Area | Result |
|---|---|
| Task completion | **PASS**: 11/11 `[x]`, each with execution evidence, an evidence re-run and a Reviewer verdict |
| File existence | **PASS**: every file in design §4 exists as declared. The vendored folder is untouched |
| Build integrity | **PASS**: 5/5 checks. The UI design gate is N/A |
| Requirement coverage | **18 PASS, 3 WARN** (FR-2, FR-5, FR-16) across FR-1 to FR-16 and NFR-1 to NFR-5 |
| Design conformance | **WARN**: from the walkthrough (W-1, W-3, W-4), P-16 pending (W-5) and figure drift (W-6) |
| Agent guides | **PASS**: no `## Constitution Impact` notes, and no module was created |

**WARN findings**

| # | Finding | Remediation |
|---|---|---|
| W-1 | When a CTA is below the fold and the consent banner is not rendered (the 2.40.0 `/es/` case), item 3 says `below fold` (P1/FAIL) and item 4 says the capture "reads `Unevaluated (consent banner not rendered…)`". No order between the two is stated. A literal agent loses the P1 and validate reads `WARN` instead of `FAIL`. It never yields `PASS` | Amend FR-5 and add one bridge sentence: "a missing banner replaces only a `pass`; `covered` and `below fold` stand". Add one assertion. Needs JC approval (it changes requirement text) |
| W-2 | The FR-2 *Verify* hash depends on the tool. The vendored `SKILL.md` has no trailing newline. An `awk` strip of the `metadata:` block adds one and gives `modified: 1 files: SKILL.md`. `sed`, and the Node logic in the existing test, give `verified` | Add to *Verify*: "byte-exact: keep the file's last byte, add no newline". Or name one reference command |
| W-3 | Outcome (c) checks only the bottom edge. When a CTA's centre is off the right edge, the hit-test returns nothing. Outcome (e) says "returns another element", so its condition is not met literally either, and the label `covered` misdescribes an overflow | A future spec: an `off-screen (x=<left>)` outcome, or (c) covering every edge. This was already an execution advisory |
| W-4 | Under an exclusion, the probe skips an `IMPECCABLE_BIN` or `PATH` engine that lies under `~/.impeccable`. The one download call does not, and the launcher runs both before it downloads. The excluded binary runs once. The run then fails closed to `unavailable` | Add to item 4: the download call also runs with `IMPECCABLE_BIN` unset and no excluded `PATH` entry |
| W-5 | P-16 is `UNVERIFIED` (owner JC). A GET of `/es/` supports the CTA order (§8.3) | JC confirms on the rendered page, then P-16 becomes verified |
| W-6 | Count drift between documents (§8.1): T1 and T3 *Done criteria* (14 and 9 assertions) against their *Tests* (16 and 10); design §12 "68 assertions" against §7.6's 71; §7.6's 71 against 72 shipped; the measured LOC predates the 93-line coverage test | Correction pass on `tasks.md` and `design.md` with correction closure, or accept as history at archive |
| W-7 | The CHANGELOG says "A separate change **handles** the installer item", but the sibling spec has not been specified or shipped | Change it to "will handle", or ship the sibling first. Quick edit before release |

## 3. Task Completion

| Task | Status | Attempts | Evidence | Result |
|---|---|---|---|---|
| T1 Bridge Step 0, consent, launcher | `[x]` | 2 (FAIL → PASS) | Red run, 16 tests, falsifiers quoted, P-15 and P-20 settled | PASS |
| T2 Detector gate | `[x]` | 1 | 15 tests, 17 mutations, FR-4 walkthrough | PASS |
| T3 Waivers and suppression | `[x]` | 1, plus an amendment | 10 tests, §7.3 amendment re-reviewed | PASS |
| T4 Reference steps | `[x]` | 1 | 13 tests, 40 mutations | PASS |
| T5 Template and checklist | `[x]` | 1 | 6 tests, 11 mutations | PASS |
| T6 Constitution Step 4 | `[x]` | 2 | 1 test, red quoted | PASS |
| T7 Audit step 5 and checklist | `[x]` | 2 | 1 test, red quoted | PASS |
| T8 Validate fold-check line | `[x]` | 1 | 1 test | PASS |
| T9 Propose source sentence | `[x]` | 1 | 1 test | PASS |
| T10 Docs and sweep | `[x]` | 1 | 8 tests, 12 falsifiers | PASS |
| T11 CHANGELOG, upstream draft, verification | `[x]` | 2 | KZ-002 quote-check, full verification | PASS |

There was no HALT, Pivot or tripwire. The execute-time spec edits (design §7.1 rows 1 and 4, §7.3 *False positive*, the §7.6 counts) are recorded with their reason, and none changes an approved requirement.

## 4. File Existence

| Design §4 entry | At HEAD | Result |
|---|---|---|
| Bridge `SKILL.md`, reference `design-evaluation.md` | Edited (+50/−13, +56/−20) | PASS |
| `akili-audit`, `-validate`, `-constitution`, `-propose` | Edited (2/2, 1/1, 1/1, 1/1) | PASS |
| `docs/skills/impeccable-bridge.md`, `docs/commands/akili-audit.md` | Edited (3/3, 1/1) | PASS |
| `docs/skills/impeccable.md` | Unchanged, as designed (T10 grep recorded) | PASS |
| `CHANGELOG.md` | Edited (+12/−1) | PASS |
| `test/design-eval-contract.test.js` | New, 537 lines | PASS |
| `test/design-eval-contract-coverage.test.js` | New, 93 lines (`/akili-test`; not in design §4, which is expected for a Tester file) | PASS |
| `upstream-request.md` | New, 57 lines, not shipped | PASS |
| Not touched: `.claude/skills/impeccable/**`, `bin/`, `test/impeccable-bridge.test.js`, `akili-test.md` | Untouched (`git diff --stat 3961990 HEAD`) | PASS |

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` | `# tests 1315 / # pass 1315 / # fail 0`. The two new files pass 72/72 and 10/10 |
| `npm run verify:cli` | exit 0, "14 commands \| 31 skills \| 8 resources (akili-specs v2.40.0)" |
| `npm run pack:dry-run` | exit 0, `total files: 407`, 0 `docs/specs` entries |
| `git diff --check` | clean |
| `git diff --stat 8268cb7 -- .claude/skills/impeccable/` | empty (NFR-1) |
| UI design review / detector gate (Phase 5) | **N/A**: the repository has no UI, dev server or screens. The rules it ships govern UI in the projects that install AKILI |
| Environment boot smoke | N/A: there is no `docs/infrastructure.md` |

## 6. Requirement Coverage

The coverage below is checked clause by clause. Each row quotes the clause and names the task that owns it, following `tasks.md` § Coverage, which was cross-checked line by line. Test evidence reuses the `test-report.md` matrix: no `PRODUCT_BUG`, `GAP` or `AUTOMATION_DEFERRED`.

| Req | Clause (quoted) | Task | Test evidence | Result |
|---|---|---|---|---|
| FR-1 | "pin `IMPECCABLE_BIN` to the binary it wrote … for every later launcher call"; BUT "must NOT change the home variable for any call other than that one download call"; AND IT MUST "record the exclusion and the pinned path" | T1 (T5 fields) | 8 author tests | PASS (held-out gap: W-4) |
| FR-2 | "hash every listed file (`SKILL.md` with the `metadata:` block removed)"; BUT "must NOT select the 4.7.0 copy"; AND IT MUST "show the resolved `HOME`" | T1 (T5 `Home:`) | 7 author tests | **WARN** (W-2: the hash can diverge by tool) |
| FR-3 | "Every viewport SHALL be `WxH`"; "short-height pair … records each value and its source"; BUT "must NOT report … passed on the strength of the `1280x800` pass alone" | T2, T5, T6, T8 | 6 author tests, 1 new | PASS |
| FR-4 | "CTA identification, in order"; "Never `offsetParent`"; the five outcomes; BUT "must NOT read `covered` … not … an overlay defect"; AND IT MUST "record the CTA identification method" | T2, T3, T5, T6 | 7 author tests, 1 new | PASS (held-out: W-3) |
| FR-5 | "each first-visit capture SHALL assert it is visible"; BUT "must NOT read `pass`"; AND IT MUST "name the test-ID build as the remedy" | T2 | 5 author tests | **WARN** (W-1: precedence against FR-4) |
| FR-6 | Mapping table; "priority note cites the table"; BUT "must NOT create a P0 section" | T4, T5 | 3 tests | PASS |
| FR-7 | Suppressed list; "Assessment A SHALL run with no detector output"; BUT "must NOT write `.impeccable/critique/` or start `live-server`" | T3, T4 | 4 tests | PASS |
| FR-8 | "finding count stated first … bounded parts … no file output"; BUT "must NOT write a report with 17 findings as if complete" | T4 | 3 tests | PASS |
| FR-9 | "`npm ci` … only with the consent"; validity by JSON; BUT "`runtimeError` must NOT count"; AND IT MUST "never run `npm ci` without consent or when Lighthouse is not declared" | T4, T5 | 4 tests | PASS |
| FR-10 | Load average and listening dev servers; BUT "must NOT omit the record … (it reads `none`)" | T4, T5 | 2 tests | PASS |
| FR-11 | "stable ID `<section>-<nn>`"; E1 drift routed; "`§<section> l.<line>`"; BUT "must NOT edit `design.md`" | T3, T4, T6 | 4 tests | PASS |
| FR-12 | Template coverage; BUT "must NOT leave the field empty when a template is uncovered" | T4, T5 | 2 tests, 1 new | PASS |
| FR-13 | "step 5 and its *Verification Checklist* SHALL accept the E6 user-directed path"; BUT "must NOT also require a copy" | T5, T7, T9, T10 | 2 tests, pattern 7, 2 new | PASS |
| FR-14 | Closed list; "`False positives: N`"; BUT "a `low-contrast` hit must NOT"; AND IT MUST "require evidence that the subtree is `aria-hidden`" | T3, T5 | 6 tests | PASS |
| FR-15 | "three reproducible items … nothing is filed" | T11 | Manual: title "DRAFT, not filed"; M1, M5b and M14 each have Repro, Observed vs Expected, Citation and Fix. The M1 citations match the launcher at HEAD (re-read here) | PASS |
| FR-16 | "Every shipped restatement … SHALL match"; "counts 14 audit gaps plus the installer item" | T8, T10, T11 | 7-pattern sweep, walker reach, 3 new | **WARN** (W-7: tense) |
| NFR-1 | No byte under `.claude/skills/impeccable/` changes | All | Vendored diff empty; vendor test green | PASS |
| NFR-2 | Single owner; no bridge string in commands | All | `impeccable-bridge.test.js` green; E4 only says "reproduce that list" | PASS |
| NFR-3 | No download or install without consent | T1, T4 | FR-9 tests and the new NFR-3 test | PASS |
| NFR-4 | One assertion per clause, each red under mutation | All | Mutation reds quoted per task in `execution.md` | PASS |
| NFR-5 | The four commands pass | T11 | §5, re-run here | PASS |

**Cross-check of `test-report.md`.** Its matrix rows match `requirements.md`, FR-1 to FR-16 and NFR-1 to NFR-5. Its totals (72 author, 10 new, 1315) were re-run here and match. Its *Tested at* reads `0a006aa` plus an uncommitted file; that file is now committed in `4b8dbd4`, unchanged, so the report is still current.

## 7. Linting & Code Quality

There is no lint step for markdown or tests in this repo. `git diff --check` is clean.

**4R advisory sweep (advisory, not spec violations).** These include unresolved advisories carried over from `execution.md`.

| Lens | Advisory | Source |
|---|---|---|
| Readability | The CHANGELOG's "each launcher reads `~/.impeccable/bin/impeccable[.exe]` first" drops the bridge's "before `IMPECCABLE_HOME`". The launcher checks `IMPECCABLE_BIN` and a bundled `scripts/bin` before it (no bundled bin ships today), so "first" is loose | T11 advisory, confirmed against `scripts/impeccable` |
| Readability | The bridge's *Exit codes* cell for `2` does not name the audit's `false positive` reading. The *Design Waivers* pointer reaches it | T3 advisory |
| Readability | The E3b row label *Resolve, never install* now sits over a consented `npm ci` | T4 advisory |
| Readability | The bridge frontmatter `description` does not name the report-only suppression. Item 4's "when none is set, or the one set lies under" comma | T1, T3 advisories |
| Reliability | The template's `Machine load` line does not point at the E3b timing rule | T5 advisory |
| Reliability | Sweep pattern 7 scans every in-scope file. Narrow it if a non-design line ever legitimately carries the phrase | T10 advisory |
| Resilience | Outcome (c) checks the bottom edge only. **Promoted to W-3** by the held-out walkthrough | T2 advisory |
| Resilience | The sweep walker skips symlinks silently (none exist in scope) | T10 advisory |
| Risk | The *False positive* row is one cell of about 90 words. Split it if a second rule lands | T3 advisory |
| Risk | The dev-server filter (ports 3000–9999) lists unrelated services. It is informational only | T4 advisory |
| Risk | The CHANGELOG names only `test/design-eval-contract.test.js`; the coverage file is not mentioned. This understates, it does not overstate (`test/` is not shipped) | New |
| Risk | The CHANGELOG's present tense on the installer. **Promoted to W-7** | T11 advisory |

## 8. Design Conformance

Design-to-code: every §7.1 to §7.4 row was walked against the shipped text, including the execute-time amendments. The text matches, so there is no unexplained drift.

Proposal alignment: the intent and the non-goals hold. Two documented, approved departures:

- **A1/A1-W:** one download call changes `HOME` or `USERPROFILE`. The proposal said "No `HOME` override is needed".
- **DD-4:** `/akili-test` does not plan the short-height pair. Proposal §7 said it would.

Both are recorded in the design with JC approval. PASS.

### 8.1 Cross-document figure check

| Figure | Sources | Agree? |
|---|---|---|
| Audit gaps: 14 (+1 installer) | requirements FR-16, proposal R4, CHANGELOG "14 gaps", M1–M14 rows | Yes |
| Assertions in the §7.6 map: 71 (per-FR sum re-added: 8+7+6+7+5+3+4+3+4+2+4+2+2+6+0+7+1) | design §7.6; `tasks.md` per-task Tests 16+15+10+13+6+1+1+1+1+7 = 71 | Yes |
| Shipped author tests: **72** | `node --test` → 72; execution T10 "7 pattern + 1 walker-reach" | §7.6 says 71: the walker-reach assertion is not in the map. **W-6** |
| T1 and T3 assertion counts | `tasks.md` Tests (16), (10), against Done criteria "14 assertions … (1233 + 14)" and "9 assertions" | **No. W-6** |
| Assertion basis for the budget | design §12 "68 assertions", against §7.6's 71 | **No** (frozen at approval; §7.6 notes "68 at approval"). **W-6** |
| Suite totals: 1233 → 1305 → 1315 | tasks baseline, execution summary, test-report, run here | Yes (1233 + 72 = 1305; + 10 = 1315) |
| Authored LOC: 721 | execution summary against `git diff --numstat 3961990 HEAD`: tests 537, bridge 50, reference 56, commands 5, docs 4, CHANGELOG 12, upstream 57 = 721 | Yes for the execute phase. Adding the `/akili-test` file (93) gives **814**, under the ~900 ceiling. The summary does not say this. **W-6** |
| Review rounds: 16 of ~18 | Per task 2+1+2+1+1+2+2+1+1+1+2 | Yes |
| Premise ledger: 21 rows, 3 `UNVERIFIED` (P-15, P-16, P-20) | design §11 | Yes. P-15 and P-20 were settled in T1; P-16 is open (W-5) |
| `UPSTREAM.md` lines 58, folder files 61 | requirements §4, P-4; re-run here: 58 listed, plus `LICENSE`, `NOTICE` and `UPSTREAM.md` unlisted | Yes |
| Package files: 407 | execution, test-report, run here | Yes |

### 8.2 Walkthrough (requirements §7, *Defect classes*: "a rule an agent cannot follow")

Each scenario was walked as a literal agent reading only the shipped bridge, reference and command text.

| Scenario | Verdict the shipped text produces | Equals THEN/BUT? |
|---|---|---|
| FR-1 exclusion, `IMPECCABLE_HOME=/tmp/x` | Probe skips location 3; location 4 is absent → `consent needed` → the one call `HOME=<empty dir in /tmp/x> … engine-probe`. Launcher: `IMPECCABLE_BIN` is unset, no bundled bin, the `home_bin` under the empty `HOME` is absent, the cache is absent → download to `/tmp/x/bin/<VERSION>/`. Pin, then `<pin> engine-probe` directly; every later call has the inline prefix and the real `HOME`. `Excluded:`, `IMPECCABLE_BIN:` and `Download home override:` are recorded | Yes |
| FR-2 two copies | Location 1 is selected. `Other copies: ~/.claude/skills/impeccable (4.7.0)`, `Home:` recorded, never selected. **Executed on the real vendored copy:** 57/57 non-`SKILL.md` files OK, and no unlisted file besides `LICENSE`, `NOTICE` and `UPSTREAM.md`. The `SKILL.md` strip matches with `sed` (`a2ba4387…`) and **fails with `awk`** (`6fccc12f…`, an added trailing newline) | Yes with `sed`. **Diverges by tool: W-2** |
| FR-3 CTA at y=800–869 | `1280x800`: centre 834.5 ≥ 800 → `below fold (y=800)`. `1366x768` → `below fold`. `390x844`: centre < 844 → hit-test. `375x667` → `below fold`. Each viewport reports its own outcome and source | Yes |
| FR-4 `/es/` at 375x667, top 650 | (a) and (b) do not apply. With height ≥ 34, centre ≥ 667 → (c) `below fold (y=650)` → P1, not `covered`, method recorded. Note: a CTA under 34 px tall would have its centre inside the viewport and read `pass`. This is the approved A2 rule, so the scenario is under-specified, not wrong | Yes (height ≥ 34) |
| FR-5 build without analytics IDs | Banner found in source and not rendered → `Unevaluated (consent banner not rendered: …)`, never `pass`, remedy named | Yes |
| **FR-4 + FR-5 together** (the 2.40.0 `/es/` run had both) | Item 3 gives `below fold (y=650)`. Item 4 says the capture "reads `Unevaluated (…)`". There is no precedence rule. A literal agent records `Unevaluated` → validate `WARN`, and the audit loses the P1. Another agent records `below fold` → `FAIL`. Never `PASS`. After the named remedy (a test-ID build) both converge on a non-pass | **Diverges: W-1** |
| FR-6 critique P0 | P1 tagged `blocking`; no P0 section | Yes |
| FR-7 literal executor | E4 and the delegated brief point at *Suppressed in `/akili-audit design`*: skip *Persist the Snapshot*, no `live-server`, ends `Questions skipped: …`; Assessment A isolated | Yes |
| FR-8 23 stated, 17 received | The parent compares, fetches the rest, and never writes short | Yes |
| FR-9 exit 1 with a valid JSON | Counted; exit and stderr recorded; `runtimeError` never counts; `npm ci` only if declared, `node_modules` absent, and consented | Yes |
| FR-10 `astro preview` on :4329 | `node` on a port between 3000 and 9999 → listed with the load average; nothing listening → `none` | Yes |
| FR-11 older baseline | `Page modes: drift (page-mode column missing, clause IDs missing; routed to /akili-constitution)`; `Proposed waiver (§7 l.144)`; nothing written | Yes |
| FR-12 48 pages, 9 templates | 8 templates covered; `Coverage: 8 of 9 templates; not covered: <name>` | Yes |
| FR-13 `/tmp/report.md` | The existence item accepts the recorded path; `Report location: /tmp/report.md (directed by <who>)`; written once, no copy | Yes |
| FR-14 96 decorative hits | `false positive (decorative, aria-hidden; <selector>)`, counted; `low-contrast` is not on the list; evidence required | Yes |

**Held-out cases** (not cited by the text):

| Case | Shipped text yields | Sensible and determinate? |
|---|---|---|
| H-1: CTA partly off the right edge at `375x667` | Centre inside the viewport → (d) `pass` (sensible: clickable). Centre outside (e.g. x=420) → (c) does not fire (bottom only), and the hit-test returns null. (e) reads "otherwise, the hit-test returns another element: `covered (<topmost element>)`" | **Not fully.** Most agents take "otherwise" → `covered (none)`, a P1 (correct severity, wrong label). Some may write `Unevaluated`. **W-3** |
| H-2: Read screen with a consent banner | "**Read** screens need no first-visit pass" → `not required (Read)`. Item 4 belongs to the pass, so no banner check runs | Yes: determinate and consistent with the page-mode design |
| H-3: exclusion with `IMPECCABLE_BIN` exported to `~/.impeccable/bin/impeccable` (or a `PATH` entry there) | The probe skips it. The download call, with `HOME` overridden, still runs the launcher, which execs `IMPECCABLE_BIN` (or `command -v impeccable`) before downloading. The pin to `/tmp/x/bin/<VERSION>/` then fails its probe → `unavailable` | Determinate and fail-closed, but **the excluded binary runs once. W-4** |

**Walkthrough outcome:** 15 of the 16 scenarios walk to the stated THEN/BUT; FR-2 walks only with some tools. The combined 2.40.0 case and two of the held-out cases show gaps (W-1, W-3, W-4). None produces a false `PASS`.

### 8.3 P-16: the CTA order on a real Persuade page

| Item | Evidence (one GET of `https://akili.com.co/es/`, 2026-10-31, 95,945 bytes) |
|---|---|
| Baseline in reach | No `Primary CTA` column or style is visible for that site, so step 3 applies: the first `main a\|button` |
| `<main>` | `<main id="main" tabindex="-1" class="flex-grow pt-20">`. The 14 anchors and buttons before it (header) are excluded by the `main` scope |
| Step 3 picks | The first `<a>` inside `main`: "Agenda tu diagnóstico gratuito · 30 min sin costo" → `https://calendar.app.google/AS5t4jSiPh16RVrt9`, after the `<h1>` |
| Visible hero CTA | The same element: the primary hero button (the secondary is "Cómo trabajamos") |
| Banner (FR-5 input) | Source carries `data-consent-banner` and `ConsentBanner`, so item 4 applies to this page |
| Limits | Static server HTML only (Astro); no rendered DOM, no viewport, and only one page |

**Result: WARN (W-5), pending JC confirmation.** The evidence supports DD-5's order on `/es/`. P-16 is owned by JC and was specified for the HITL pause.

## 9. Test Evidence Summary

| Suite | Count | Result |
|---|---|---|
| `test/design-eval-contract.test.js` (author, red→green with executed mutations) | 72 | 72/72 |
| `test/design-eval-contract-coverage.test.js` (Tester; 9 clause tests and 1 guard) | 10 | 10/10 |
| Full `npm test` | 1315 | 1315/1315 |
| Manual | FR-15 (`upstream-request.md`), `docs/skills/impeccable.md` (no restatement site) | PASS |
| Accepted gaps from `test-report.md` §9 | Agent-followability (§8.2 here), P-16 (§8.3), the M5b and M14 upstream facts (`UNVERIFIED` in the draft, outside the spec) | Carried; see W-1 to W-5 |

## 10. Agent Guide / Constitution Impact

`execution.md` has no `## Constitution Impact` notes. No module was created or reshaped, and no boundary or public surface moved. **PASS.** CodeGraph re-indexing is left to `/akili-archive` as usual.

## 11. Remediation

| # | Level | Action | Where | Gate |
|---|---|---|---|---|
| W-1 | WARN (decide first; JC may promote it to blocking) | Precedence: a missing banner replaces only `pass`; `covered` and `below fold` stand. Add one assertion | Requirements FR-5 amendment, bridge *First-visit pass* item 4 | Pivot or JC amendment, or a follow-up spec |
| W-2 | WARN | "Byte-exact: keep the last byte, add no newline", or a reference strip command | Bridge Step 0 *Verify* | `/akili-quick`-sized, but it is a rules change: follow-up spec or JC-approved amendment |
| W-3 | WARN | An off-screen outcome, or (c) on every edge | Bridge item 3; FR-4 | Future spec |
| W-4 | WARN | The download call runs with `IMPECCABLE_BIN` unset and no excluded `PATH` entry | Bridge Step 0 item 4 | Follow-up spec (FR-1 text) |
| W-5 | WARN | JC confirms P-16 on the rendered `/es/` | design §11 P-16 | HITL |
| W-6 | WARN | Correct T1 and T3 *Done criteria*; note 72 = 71 + walker reach in §7.6; add the 93-line Tester file to the LOC record. Apply correction closure (grep old values forward and backward across the spec folder) | `tasks.md`, `design.md`, `execution.md` | At archive, doc-only |
| W-7 | WARN | "will handle", or ship the sibling first | `CHANGELOG.md` Unreleased | Before release |

No remediation was applied: this run is report-only.

## 12. Archive Readiness Recommendation

| Criterion | State |
|---|---|
| All tasks `[x]` | Yes |
| No unresolved FAIL | Yes (0 FAIL) |
| WARNs accepted or with follow-up | **Pending JC**: W-1 to W-7 |
| Tests cover the key scenarios | Yes (1315/1315; the walkthrough fills the no-automation class) |
| Drift reflected in the spec docs | Yes, except the W-6 figures |
| User reviewed this summary | Pending |

**Recommendation: ready to archive after JC's decision on the WARNs.** The suggested path:

1. Accept W-3 and W-5 as follow-ups (W-5 is a quick look at `/es/`).
2. Fix W-6 and W-7 as doc edits.
3. Route W-1, W-2 and W-4 into one small follow-up spec, or a JC-approved amendment, under the `impeccable-audit-fixes` family. Do W-1 first, because it can hide a P1.

Then run:

```text
/akili-archive changes/impeccable-audit-fixes/design-eval-contract
```

## Post-report Gate Decision and Remediation Applied (Leader, 2026-10-31)

Gate decision: JC's mandate for this run is to take the recommended option at each gate, so the Leader took the auditor's recommendation. The decision is logged as `auto-approved (JC mandate)`. No approved requirement's meaning was changed.

| Finding | Action | Evidence |
|---|---|---|
| W-7 CHANGELOG tense | **Fixed.** "A separate change handles the installer item from the same audit." now reads "A separate change, not yet shipped, will handle the installer item from the same audit." | `CHANGELOG.md` `## [Unreleased]` |
| W-6 cross-document counts | **Fixed** (doc corrections). `tasks.md` T1 Done criteria now reads 16 assertions (`npm test` 1233 + 16); T3 reads 10. `design.md` §7.6 Total now notes the 72nd shipped test (T10 walker reach). §12 notes 68 at approval and 71 after the amendments. The `execution.md` summary now adds the Tester file: 814 LOC in total, under the ~900 ceiling | Correction closure: grep for `68`, `14 assertions`, `9 assertions`, `721`, `handles the installer` and `1305` over the spec folder and `CHANGELOG.md`. The remaining hits are append-only history in `execution.md` (true when written), `judgment.md` (history) and `test-report.md` (correct) |
| W-1 FR-4/FR-5 outcome precedence, W-2 hash tool determinism, W-4 download call under an exclusion | **Deferred to a follow-up spec**, W-1 first. W-1 amends FR-5, so it needs JC's approval through `/akili-propose`; it is not edited here | Recommended by the auditor; recorded for `/akili-archive` and the family file |
| W-3 off-edge CTA outcome, W-5 P-16 pending JC | **Accepted as follow-ups.** W-5's evidence supports the CTA order. JC confirms it on the rendered page | §6 / §8 above |

After the fixes, `npm test` first showed 1 failure. The Tester's FR-16 CHANGELOG test pinned the old sentence verbatim. The test literal was updated to the corrected sentence in `test/design-eval-contract-coverage.test.js`, and the rerun gave `# tests 1315 / # fail 0`.
