# Tasks: Close the design-evaluation gaps found in the 2.40.0 audit

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-contract` |
| Status | **Approved** by JC, 2026-10-31 ("Continue" at the tasks gate), with the re-derived budget. Spec complete; ready for `/akili-execute` |
| Requirements / Design | `requirements.md` (approved 2026-10-31, with A1, A1-W, A2); `design.md` revision 2 (approved 2026-10-31 at "Continue"; judgment-day round 1 `fixed, not re-judged`) |
| Baseline | `8268cb7`. `npm test` → `# tests 1233`, `# pass 1233`, `# fail 0` (run 2026-10-31) |
| Baseline readings (run 2026-10-31; `grep -cF <p> <file>`) | Bridge `SKILL.md`: `Excluded: ~/.impeccable`, `USERPROFILE`, `IMPECCABLE_BIN=<pinned path>`, `vendored (<version>, verified)`, `1366x768`, `375x667`, `below fold`, `covered (`, `Unevaluated (no CTA found)`, `consent banner not rendered`, `false positive`, `` Suppressed in `/akili-audit design` ``, `Questions skipped`, `` first-visit` `` → **0** each; `(clause A-06)` → **1**. Reference: `blocking`, `Baseline shape`, `Coverage`, `npm ci`, `runtimeError`, `Machine load`, `E2b`, `False positives` → **0** each; `` `run` \| `not required (Read)` `` → **1**. `akili-constitution.md`: `<n>-<nn>` → 0, `Primary CTA` → 0. `akili-audit.md`: `user-directed` → 0. `akili-validate.md`: `every first-visit viewport` → 0. `akili-propose.md`: `Report location` → 0. `test/design-eval-contract.test.js` → `No such file or directory` |
| Retired-phrase sites at baseline (`grep -rnF <p> .claude docs README.md \| grep -v '^docs/specs/' \| grep -v '^.claude/skills/impeccable/'`) | `fold check at both viewports` → `akili-validate.md:144`. `run, at **both** viewports` → bridge `:167`. `(clause A-06)` → bridge `:205`. `` `run` \| `not required (Read)` `` → reference `:97`. `` (`run`, `not required (Read)` `` → reference `:152`. `The pass **fails** when the topmost element` → bridge `:171`. `` A hero CTA under a consent banner at `390x844` `` → bridge `:174`. `` outside `docs/specs/audits/` `` → `akili-audit.md:159`, reference `:154` |
| Commit prefix | `[SPEC:changes/impeccable-audit-fixes/design-eval-contract]`. Local commits only: no push, PR or merge |
| Budget (design §12, re-derived here) | **11 tasks · ~870 authored LOC · ~18 review rounds.** LOC is unchanged from design revision 2. The 6 tasks became 11 because of the Step 3.2 rule "a task that edits rules text is bounded by what one review can read": no task may hold more than ~8 edit sites or sites in more than one rules document. Rounds: 2 for each `full` rules task (T1–T5, T10, T11 = 14), 1 for each `checklist` task (T6–T9 = 4). **Approved by JC 2026-10-31: ~870 LOC, ceiling ~900.** `/akili-execute` stops and escalates when actuals exceed it |
| PR strategy | **PR 1** (T1–T5): bridge and reference with their assertions, ~600 LOC. **PR 2** (T6–T11): commands, docs, sweep, CHANGELOG, `upstream-request.md`, ~270 LOC. Both target `dev`; proposed only. JC 2026-10-31: no PRs in this cycle |

## Dependency graph

```text
T1 ──► T2 ──► T3 ──► T4 ──► T5 ──► T6 ──► T7 ──► T8 ──► T9 ──► T10 ──► T11
```

The graph has no cycles. Every task appends assertions to the one new test file, `test/design-eval-contract.test.js`, and T1–T3 and T4–T5 also edit the same two rules files. So the order is linear and no task is parallel-safe.

## Shared rules for every task

- **Test first, inside the task.** Add the task's assertions to `test/design-eval-contract.test.js` and run them red. Then edit the rules text and run them green.
- **Section-scoped assertions.** Each assertion reads the section it names, sliced between two headings (as `impeccable-bridge.test.js` does with `index()`), never the whole file. A string that already exists elsewhere in the file must not satisfy it.
- **Mutation check.** For each assertion, delete or alter the sentence it pins and observe the red, then quote it in `execution.md` (NFR-4, Falsifiability items 1 and 8).
- **Before review: phrase-family sweep.** Sweep the obligations the task changes (KZ-changes--kaizen-loop-closure-2, design DD-12) over `.claude/` and `docs/`, minus `docs/specs/` and `.claude/skills/impeccable/`. Read every hit.
- **Vendored copy.** `git diff --stat -- .claude/skills/impeccable/` must be empty after every task (NFR-1), and `test/impeccable-vendor.test.js` must stay green.
- **Commands carry no bridge strings.** No command may gain `scripts/impeccable`, `DO_NOT_TRACK`, `IMPECCABLE_NO_UPDATE_CHECK`, `IMPECCABLE_BIN` or `detect --json` (`test/impeccable-bridge.test.js:102-105`).
- **No spec-path citations.** No shipped file and no test may cite `docs/specs/changes/impeccable-audit-fixes` (P-12).
- **Line pointers.** Line numbers in this document are baseline pointers for the Implementer. They never go into shipped prose (KZ-005).

---

### T1: Bridge *Step 0*, *Engine consent* and *Launcher form*; create the test file

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~60 LOC prose, ~95 LOC tests) |
| Depends on | — |
| Requirements | FR-1 (all four SHALL bullets, the scenario's THEN, BUT and AND IT MUST, A1, A1-W); FR-2 (three SHALL bullets, "a `modified` copy still leads … environment finding", the scenario's BUT and AND IT MUST); NFR-1, NFR-2, NFR-3 |
| Design | §5.1 `Impeccable` sub-lines; §7.1 (all six rows); DD-1, DD-2, DD-3; P-1, P-2, P-2b, P-3, P-4, P-15, P-19, P-20 |
| Scope | `.claude/skills/impeccable-bridge/SKILL.md`, six sites: Step 0 item 1 (new **Verify** paragraph), item 2 (new **Exclusion** paragraph), item 3 (the inline-prefix sentence after the pinned `export` sentence), item 4 (exclusion consent, the one-call home change, the `.exe` pin, the post-pin `engine-probe`), *Engine consent* (`Destination` cell + new **Home override** field), *Launcher form* (the prefix and the reworded "pinned" sentence). New `test/design-eval-contract.test.js`: header comment `// @akili-spec changes/impeccable-audit-fixes/design-eval-contract`, `read`/`index`/`slice` helpers copied in shape from `test/impeccable-bridge.test.js`, the guard assertion, FR-1 and FR-2 assertions |
| First step | Settle **P-15**: cite Microsoft's `certutil -hashfile` documentation (URL and the `SHA256` argument) in `execution.md`, or drop the Windows example from the Verify paragraph. Settle **P-20**: read upstream `docs/CLI-CONTRACT.md` (the `context.mjs -> impeccable context` section, *Update cache* and *Env vars read*; the bridge already cites it) for files written under `~/.impeccable`. State the limit in the Exclusion paragraph ("the exclusion covers where the engine is found; …"). Record both outcomes in `execution.md` before editing |
| Tests (14) | FR-1 ×7 and FR-2 ×6, per design §7.6 rows FR-1 and FR-2. Guard ×1: the test source contains no `docs/specs/` read (it asserts on its own text via `fs.readFileSync(__filename)`) |
| Falsifier | (1) Delete the inline-prefix sentence → the FR-1 "every call carries `IMPECCABLE_BIN=`" assertion goes red. (2) Change `USERPROFILE` to `HOME` in item 4 → the A1-W assertion goes red. (3) Delete "Never select another copy" → the FR-2 BUT assertion goes red. (4) Move the Verify paragraph out of *Step 0* (into *Engine state*) → the section-scoped FR-2 assertions go red. Each is executed and its red quoted in `execution.md` |
| Red run | Observed at baseline: the readings in Document Control show `Excluded: ~/.impeccable`, `USERPROFILE`, `IMPECCABLE_BIN=<pinned path>` and `vendored (<version>, verified)` → 0 in the bridge. For the test file: `predicted — greenfield artifact (observed in T1)`. T1's `execution.md` quotes the first `node --test test/design-eval-contract.test.js` run failing on the FR-1 and FR-2 assertions (not on setup) |
| Disqualifier | Any of these voids the evidence: an assertion passes against the baseline bridge (it pins a string that already exists); an assertion reads the whole file instead of the named section; a `HOME` change appears for any call other than the download call; `test/impeccable-bridge.test.js` goes red at `:63`, `:64` or `:73` (the pinned `export`, download and launcher-form strings must survive); the vendored diff is non-empty |
| Consumers | `test/impeccable-bridge.test.js:40, 45` (`vendored (<version>)`), `:63-64` (Step 0 strings), `:73` (launcher-form substring), `:104` (no bridge strings in commands): all must stay green (P-10). `docs/skills/impeccable-bridge.md:24` readings table (updated in T10) |
| Review | `full`: engine-isolation and consent rules other agents execute |
| Done criteria | 14 assertions green, each with its quoted mutation red. P-15 and P-20 settled and recorded. `npm test` green (1233 + 14). The phrase-family sweep for "pinned from Step 0", "export", "HOME" and "Destination" has its hits read. The vendored diff is empty |
| Skills | `impeccable-bridge` (subject), `tdd` |

### T2: Bridge *Detector gate*: viewports, first-visit procedure, CTA, outcomes, banner

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~55 LOC prose, ~95 LOC tests) |
| Depends on | T1 |
| Requirements | FR-3 (`WxH` and `incomplete`, scan matrix keeps two passes, the short-height pair with override and source, the scenario's BUT); FR-4 (CTA order, measurement, five outcomes per A2, P1/FAIL unless a `first-visit` waiver, the scenario's THEN and BUT); FR-5 (all three SHALL bullets, the scenario's THEN, BUT and AND IT MUST) |
| Design | §7.2 (all seven rows); §5.2 (outcome values); §7.5 rows 2, 4, 5; DD-4, DD-5; P-5, P-14, P-16, P-17 |
| Scope | `.claude/skills/impeccable-bridge/SKILL.md` *Detector gate*, six sites: *Scan matrix* (the `WxH` sentence and the declarable `desktop`); the *First-visit pass* opening (item 1 at two viewports, items 2–4 at every first-visit viewport, retiring "at **both** viewports"); item 3 (CTA order and the five ordered outcomes, retiring "The pass **fails** when the topmost element"); new item 4 (banner); the priority bullet replacing the `390x844` example (P1/FAIL, waiver, `Unevaluated` → `WARN`); the *Without browser automation* bullet ("every first-visit viewport") |
| Tests (15) | FR-3 ×4 (`WxH`/`incomplete`, two passes, the pair, BUT at any viewport); FR-4 ×6 (order, measurement "never `offsetParent`", the five outcomes in order with the descendant tolerance, P1/FAIL + `first-visit` waiver, THEN `below fold` is P1, BUT `below fold` ≠ `covered`); FR-5 ×5 |
| Falsifier | (1) Swap outcomes (c) and (d) → the "five outcomes in order" assertion goes red. (2) Delete "or one of its descendants" → the descendant-tolerance assertion goes red. (3) Remove "only when `docs/ux-ui/design.md` defines a Primary CTA style" → the conditional-step-2 assertion goes red. (4) Write "`pass`" for a missing banner → the FR-5 BUT assertion goes red. Executed and quoted |
| Red run | Observed at baseline: `1366x768`, `375x667`, `below fold`, `covered (`, `Unevaluated (no CTA found)` and `consent banner not rendered` → 0 in the bridge. Test red: `predicted — greenfield artifact (observed in T2)`, the new assertions failing on their text |
| Disqualifier | Any of these voids the evidence: the `below fold` rule is written on the box top only (the J-1 defect; the A2 rule is the centre at or below the bottom edge); `390x844` or `1280x800` disappears from the bridge (`impeccable-bridge.test.js:76` pins both); the scan matrix shows four passes (DD-4); "at **both** viewports" survives in *First-visit pass* |
| Consumers | `test/impeccable-bridge.test.js:75-76` (first-visit flags, both scan viewports), `:81-82` (`WARN (unverified first visit)`, `never \`PASS\``, `Unevaluated (no browser automation)`): must stay green. Readers of *First-visit pass* (P-14): `akili-audit.md:147`, `akili-validate.md:140, :144` (T8), reference `:12, :94, :97, :147, :152` (T4, T5), `docs/skills/impeccable-bridge.md:37` (T10) |
| Review | `full`: verdict rules (P1/FAIL) that two agents must apply identically |
| Done criteria | 15 assertions green, each with its quoted mutation red. A walkthrough of the FR-4 scenario at 375x667 (CTA top 650, height ≥ 34 → centre ≥ 667 → `below fold (y=650)`) is written in `execution.md` against the shipped sentence. The phrase-family sweep for "both viewports", "topmost element", "hit-test" and "fold" has its hits read. `npm test` green |
| Skills | `impeccable-bridge`, `tdd` |

### T3: Bridge *Design Waivers* and new *Suppressed in `/akili-audit design`*

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S–M (~35 LOC prose, ~55 LOC tests) |
| Depends on | T2 |
| Requirements | FR-7 (the list, Assessment A isolation, the scenario's THEN, BUT and AND IT MUST); FR-14 (the value, the closed list, "never P1–P3", the scenario's BUT and AND IT MUST); FR-11 (the waiver cites the clause; `§<section> l.<line>` without IDs); FR-4 (the `first-visit` waiver row) |
| Design | §7.3 (all four rows); §5.3 (Reason cell); §5.4; §7.5 rows 6, 7; DD-6, DD-7, DD-8, DD-9; P-7, P-8, P-18 |
| Scope | `.claude/skills/impeccable-bridge/SKILL.md`, four sites: *Design Waivers* row-shape cell (`first-visit` Rule, Scope `<screen> @ <WxH>`, clause in Reason); a new **False positive** row with the closed-list table; the example (`(clause A-06)` → `(clause 8-06)`, plus the `§<section> l.<line>` fallback); a new section *Suppressed in `/akili-audit design`* after *Phase map* |
| Tests (9) | FR-7 ×4; FR-14 ×4 (the closed-list row with `decorative, aria-hidden`; audit-only and never P1–P3; BUT `low-contrast` absent from the list; AND evidence names the `aria-hidden` ancestor); FR-11 ×1 (`§<section> l.<line>` in the bridge example) |
| Falsifier | (1) Add `low-contrast` to the closed list → the BUT assertion goes red. (2) Delete "Inline is allowed only when no sub-agent tool exists" → the isolation assertion goes red. (3) Delete the `Questions skipped:` line → its assertion goes red. Executed and quoted |
| Red run | Observed at baseline: `false positive`, `` Suppressed in `/akili-audit design` ``, `Questions skipped` and `` first-visit` `` → 0 in the bridge; `(clause A-06)` → 1. Test red: `predicted — greenfield artifact (observed in T3)` |
| Disqualifier | Any of these voids the evidence: `false positive` is allowed in `/akili-validate`; the suppression section allows inline Assessment A without the sub-agent condition (it contradicts `critique.md:8-9`, P-18); `Proposed waivers do **not** count toward P1` or `` `Proposed waivers: N` `` disappears (`impeccable-bridge.test.js:83-84`) |
| Consumers | `test/impeccable-bridge.test.js:49` (slices *Exit codes* up to `## Design Waivers`: the heading must keep its exact text), `:83-84`. Readers of *Design Waivers* (P-14): `akili-constitution.md:212` (T6), reference `:15, :135` (T4, T5) |
| Review | `full`: report-only safety and a value that could swallow findings |
| Done criteria | 9 assertions green with their quoted mutation reds. `## Design Waivers` heading byte-identical. The phrase-family sweep for "A-06", "clause", "waived" and "snapshot" has its hits read. `npm test` green |
| Skills | `impeccable-bridge`, `tdd` |

### T4: Reference steps: E1, E2, E2b, E3b, E4, *Priorities*

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~55 LOC prose, ~85 LOC tests) |
| Depends on | T3 |
| Requirements | FR-6 (the mapping table); FR-7 (E2b and E4 point at the bridge section); FR-8 (both SHALL clauses, BUT); FR-9 (both bullets, the scenario's BUT and AND IT MUST, the failure state); FR-10 (the SHALL, BUT `none`); FR-11 (E1 drift routed, BUT nothing written); FR-12 (E2 template coverage) |
| Design | §7.4 rows Steps table, E1, E2, E3b ×3, E4, *Priorities*; the machine-load sources; P-6, P-7, P-13 |
| Scope | `.claude/skills/impeccable-bridge/references/design-evaluation.md`, five sites: the Steps table (new E2b row; E2 coverage; E4 pointer, brief items 1–4, count check); E1 check 2 (Baseline shape, routing, `§<section> l.<line>`); the E3b rules table (`npm ci` conditions, *Run validity*, *Machine load*); the machine-load sources paragraph; *Priorities* (mapping table) |
| Tests (13) | FR-6 ×1 (the four mapping rows and `blocking`); FR-8 ×3; FR-9 ×4; FR-10 ×2; FR-11 ×2 (routing to `/akili-constitution`; "nothing written"); FR-12 ×1 (E2 names templates and `Coverage`) |
| Falsifier | (1) Delete "`node_modules` is **absent**" → the FR-9 precondition assertion goes red. (2) Change "has no `runtimeError`" to "exits 0" → the validity assertion goes red. (3) Remove the dev-server filter → the FR-10 assertion goes red. (4) Delete the count-first clause → the FR-8 assertion goes red. Executed and quoted |
| Red run | Observed at baseline: `blocking`, `Baseline shape`, `Coverage`, `npm ci`, `runtimeError`, `Machine load` and `E2b` → 0 in the reference. Test red: `predicted — greenfield artifact (observed in T4)` |
| Disqualifier | Any of these voids the evidence: `npm ci` allowed without consent or when Lighthouse is undeclared (NFR-3); the reference restates a bridge rule instead of pointing at it (NFR-2: the suppression list lives only in the bridge, and E4 reproduces it only inside the delegated-brief instruction); the E3b *Concurrency* row loses its "never while a delegated agent is active" sentence |
| Consumers | `test/impeccable-bridge.test.js:118-119` (`E0`, `E7` in the reference): must stay green. `docs/skills/impeccable-bridge.md:41` ("steps E0–E7"): checked in T10 |
| Review | `full` |
| Done criteria | 13 assertions green with their quoted mutation reds. The phrase-family sweep for "8 key screens", "never install", "failed run" and "P0" has its hits read. `npm test` green |
| Skills | `impeccable-bridge`, `tdd` |

### T5: Reference report template and checklist

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~45 LOC prose, ~40 LOC tests) |
| Depends on | T4 |
| Requirements | FR-3 (AND: each viewport with its source); FR-4 (AND: the CTA method recorded); FR-6 (the priority note; BUT no P0 section); FR-10 (the header line); FR-12 (BUT: `Coverage` names every uncovered template); FR-13 (the checklist accepts the E6 path); FR-14 (`False positives: N`); FR-9 (`Install`, the checklist exception) |
| Design | §5.1, §5.2; §7.4 rows Template and the two Checklist rows; §7.5 rows 2, 3, 9 |
| Scope | Reference, seven sites: the template header block (`Impeccable` sub-lines, `Viewports`, `Coverage`, `False positives`, `Score source`, `Page modes` values, `Performance` with `Install` and `Machine load`); the *Screens Evaluated* note (per-viewport format, `run` retired); the *Capture conditions* header (`CTA (method)`, `Banner`); the *Performance* table (`Exit codes`); the *Findings* priority note; the `Waived?` footnote (`false positive`); the *Checklist* block (three rewritten items, three new items) |
| Tests (6) | FR-3 ×1 (the `Viewports` line with source); FR-4 ×1 (`CTA (method)`); FR-6 ×2 (the note; no `### P0` in the template block); FR-12 ×1 (the checklist item on uncovered templates); FR-14 ×1 (`False positives:` header) |
| Falsifier | (1) Re-add `` `run` \| `` to the *Screens Evaluated* note → the T10 sweep pattern 4 goes red (observed in T10). (2) Add `### P0` to the template → the FR-6 BUT assertion goes red. (3) Delete `False positives:` → its assertion goes red. Executed and quoted |
| Red run | Observed at baseline: `False positives` and `Coverage` → 0 in the reference; `` `run` \| `not required (Read)` `` → 1 (reference `:97`). Test red: `predicted — greenfield artifact (observed in T5)` |
| Disqualifier | Any of these voids the evidence: the `Page modes:` sub-line is renamed (FR-11's scenario reads `Page modes: drift`); the checklist keeps the item at `:152` listing `run`; `Report location` loses either value |
| Consumers | No test pins the template (`grep -rn "Screens Evaluated\|Capture conditions\|Report location" test/*.js` → run as the task's first step and list the hits here). `/akili-propose` reads the report (`akili-propose.md:139`, T9) |
| Review | `full` |
| Done criteria | 6 assertions green with their quoted mutation reds. `grep -cF '(\`run\`, \`not required (Read)\`' <reference>` → 0. The phrase-family sweep for "first-visit entry", "one row per first-visit pass" and "Mobile viewport" has its hits read. `npm test` green |
| Skills | `impeccable-bridge`, `cognitive-doc-design`, `tdd` |

### T6: `/akili-constitution` Step 4: clause IDs, `Primary CTA` column, scan viewports

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~8 LOC prose, ~8 LOC tests) |
| Depends on | T5 |
| Requirements | FR-11 (the template gives approved clauses stable IDs `<section>-<nn>`, here `<n>-<nn>`; waiver rows cite them); FR-4 (the declared-CTA source: the `Primary CTA` column, the optional Primary CTA style); FR-3 (the short-height pair overridable in `docs/ux-ui/design.md`) |
| Design | §5.3 (all five rows); DD-5, DD-8; P-9, P-17 |
| Scope | `.claude/commands/akili-constitution.md` Step 4, the paragraph that begins **This document is the single design source of truth** (one site). Add: the clause-ID rule (`<n>-<nn>`, first token, never reused, backfill in document order, cited in a waiver's Reason cell); the Screen Inventory `Primary CTA` column; the optional Primary CTA style under *Component Inventory*; scan viewports under *Responsive Behavior* as `WxH`. Point at `impeccable-bridge` → *First-visit pass* by section name; no bridge command string |
| Tests (1) | FR-11 ×1: Step 4 contains `<n>-<nn>`, `Primary CTA` and `WxH`, scoped to the Step 4 slice |
| Falsifier | Delete the `<n>-<nn>` sentence → red. Executed and quoted |
| Red run | Observed at baseline: `<n>-<nn>` → 0, `Primary CTA` → 0 in `akili-constitution.md` |
| Disqualifier | Any of these voids the evidence: the paragraph gains a bridge command string (`impeccable-bridge.test.js:104`); `diagram-design.test.js:321-323` (exactly 3 `diagram-design` lines) goes red; `growth-track.test.js` or `tasks-gate.test.js` go red |
| Consumers | `test/impeccable-bridge.test.js:97-104`, `test/diagram-design.test.js:321-323`, `test/growth-track.test.js:37`, `test/tasks-gate.test.js:47` (they read this file; all must stay green) |
| Review | `checklist`: one paragraph, pointer-level |
| Done criteria | 1 assertion green with its quoted red. `npm test` green |
| Skills | `impeccable-bridge`, `tdd` |

### T7: `/akili-audit` design step 5 and Verification Checklist

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~4 LOC prose, ~8 LOC tests) |
| Depends on | T6 |
| Requirements | FR-13 (step 5 and the checklist accept the E6 user-directed path; "nothing outside `docs/specs/audits/`" carries the same exception; the scenario's BUT) |
| Design | §3 row 1; §7.4 checklist row; P-11 |
| Scope | `.claude/commands/akili-audit.md`, two sites: design step 5 ("write the report at the reference's E6 location: the default `docs/specs/audits/design-<YYYY-MM-DD>[-<safe-branch>][-N].md`, or the user-directed path"), and the design-mode paragraph of *Verification Checklist* (the report exists at its E6 location; nothing outside `docs/specs/audits/` was edited except a recorded user-directed report location and a recorded consented `npm ci`) |
| Tests (1) | FR-13 ×1: step 5 and the design-mode checklist paragraph both name the user-directed exception |
| Falsifier | Delete the exception from the checklist paragraph → red. Executed and quoted |
| Red run | Observed at baseline: `user-directed` → 0 in `akili-audit.md` |
| Disqualifier | The default path string `docs/specs/audits/design-<YYYY-MM-DD>[-<safe-branch>][-N].md` disappears (`impeccable-bridge.test.js:115`); the drift-mode checklist item at `:163` changes; `akili-security-command.test.js:396, 576-580` goes red |
| Consumers | `test/impeccable-bridge.test.js:87-117` (five consequence rows, the default path, P1–P3, routes), `test/akili-security-command.test.js:396, 576-580`, `test/akili-review-contract-coverage.test.js:338` (carve-out line, untouched) |
| Review | `checklist` |
| Done criteria | 1 assertion green with its quoted red. `npm test` green |
| Skills | `tdd` |

### T8: `/akili-validate` first-visit fold-check sentence

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~1 LOC prose, ~6 LOC tests) |
| Depends on | T7 |
| Requirements | FR-3 ("`/akili-validate`'s manual fold check covers all four first-visit viewports") |
| Design | §7.2 *Without browser automation* row; §3 row 10; P-11 |
| Scope | `.claude/commands/akili-validate.md`, the sentence beginning "First-visit pass without browser automation" (one site): "a manual fold check at every first-visit viewport (the bridge's *First-visit pass*)" |
| Tests (1) | FR-3 ×1: the sentence names "every first-visit viewport" |
| Falsifier | Restore "at both viewports" → red here, and red in T10's sweep pattern 1. Executed and quoted |
| Red run | Observed at baseline: `every first-visit viewport` → 0; `fold check at both viewports` → 1 (`akili-validate.md:144`) |
| Disqualifier | The consequence table changes (it already points at the bridge, §7.5); `video-production.test.js:262` (≥ 4 `Deliverable: video` in this file) goes red |
| Consumers | `test/impeccable-bridge.test.js:87-110` (validate rows, the exit `2` sentence), `test/video-production.test.js:262` |
| Review | `checklist` |
| Done criteria | 1 assertion green with its quoted red. `npm test` green |
| Skills | `tdd` |

### T9: `/akili-propose` design-evaluation source sentence

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~1 LOC prose, ~6 LOC tests) |
| Depends on | T8 |
| Requirements | FR-13 (the report location is one rule everywhere; FR-16 restatement) |
| Design | §7.5 row 2 (propose carries the P1s); P-11 (`akili-propose.md:139`) |
| Scope | `.claude/commands/akili-propose.md`, the **Design evaluation as a source** sentence (one site): "a report from `/akili-audit design` (`docs/specs/audits/design-*.md`, or the path recorded in its `Report location` field)" |
| Tests (1) | FR-13 ×1: the sentence names `Report location` |
| Falsifier | Delete the added clause → red. Executed and quoted |
| Red run | Observed at baseline: `Report location` → 0 in `akili-propose.md` |
| Disqualifier | The carve-out line keyed on `` `kaizen/` `` and `` `audits/` `` changes (`akili-review-contract-coverage.test.js:330-341`) |
| Consumers | `test/akili-review-contract-coverage.test.js:330-341`, `test/impeccable-bridge.test.js:97-104` |
| Review | `checklist` |
| Done criteria | 1 assertion green with its quoted red. `npm test` green |
| Skills | `tdd` |

### T10: Docs restatements and the retired-phrase sweep test

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~20 LOC prose, ~70 LOC tests) |
| Depends on | T9 |
| Requirements | FR-16 (every shipped restatement matches); FR-13 (docs report location); FR-2 (docs readings: "(verified or modified)") |
| Design | §4 (docs rows; `docs/skills/impeccable.md` checked); §7.5 row 1; §7.6 FR-16 (patterns 1–7); DD-12; P-11, P-14 |
| Scope | `docs/skills/impeccable-bridge.md`, three sites: the readings table (`:24`), the detector summary (`:37`: the first-visit pass at every first-visit viewport, outcomes, banner), the design-mode sentence (`:41`: "or a user-directed path"). `docs/commands/akili-audit.md` (`:12`: the report location). `docs/skills/impeccable.md`: confirm there is no restatement site and record the grep. In the test file, the sweep test with patterns 1–7 over `.claude/`, `docs/` and `README.md`, minus `docs/specs/` and `.claude/skills/impeccable/`, with a walker shaped like `impeccable-bridge.test.js:143-175` |
| Tests (7) | FR-16 ×7, one per pattern. Pattern 7: every line holding `` outside `docs/specs/audits/` `` in `akili-audit.md` and the reference also contains `user-directed` |
| Falsifier | Re-add each retired phrase at one site, one at a time → the matching pattern goes red naming `file:line`. Executed for all seven patterns and quoted. Enumeration-wide (Falsifiability item 7): the walker reaches every file in the scope, asserted the way `impeccable-bridge.test.js:163-165` asserts it |
| Red run | Observed at baseline: the retired-phrase sites in Document Control (eight sites; T1–T9 remove them). Test red: `predicted — greenfield artifact (observed in T10)`, observed by applying the falsifier (re-adding each phrase at one site) after T9 and quoting each red |
| Disqualifier | Any of these voids the evidence: the sweep excludes more than `docs/specs/` and the vendored folder; it skips `README.md`; a pattern is so specific that it matches no baseline site (each pattern must have matched at least one baseline site, as Document Control lists) |
| Consumers | `test/docs-overview.test.js` (docs inventory: run and stay green), `test/akili-review-contract-coverage.test.js:54-60` (shipped-text walker, same scope rule) |
| Review | `full`: summary surfaces, KZ-002 quote-check |
| Done criteria | 7 assertions green; each falsifier red quoted. Every edited doc sentence is quote-checked against the shipped bridge or reference text at HEAD. `npm test` green |
| Skills | `cognitive-doc-design`, `tdd` |

### T11: CHANGELOG, `upstream-request.md`, full verification

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~90 LOC: CHANGELOG ~20, `upstream-request.md` ~70) |
| Depends on | T10 |
| Requirements | FR-15 (three reproducible items: M1 launcher order, M5b detector first-visit flags and custom banners, M14 `aria-hidden` occlusion; a draft, not filed); FR-16 (the CHANGELOG counts 14 audit gaps plus the installer item handled by the sibling spec); NFR-5 |
| Design | DD-10; §9 Release row; P-2, P-2b, P-5, P-12 |
| Scope | `CHANGELOG.md` `## [Unreleased]`: replace "No unreleased changes yet." with this spec's notes, including the upstream request without a path (DD-10). New `docs/specs/changes/impeccable-audit-fixes/design-eval-contract/upstream-request.md`: three items, each with repro steps, observed vs expected, the launcher or engine citation, and a proposed fix. Then the full verification |
| Tests | No new assertion. `test/impeccable-bridge.test.js:129-131` (the Unreleased slice must still contain `impeccable-bridge` and `/akili-audit design`) must stay green |
| Falsifier | Remove `/akili-audit design` from the new Unreleased notes → `impeccable-bridge.test.js:131` is still green, because the slice reaches back to `## [2.38.0]`. That shows the test cannot see this entry, so the CHANGELOG's gate is the Reviewer's quote-check of every clause at HEAD (KZ-002), executed and recorded |
| Red run | Observed at baseline: `CHANGELOG.md` Unreleased reads `- No unreleased changes yet.` (`sed -n 7,12p CHANGELOG.md`) |
| Disqualifier | Any of these voids the evidence: a CHANGELOG clause states a count (tests, assertions, gaps) not re-run at HEAD after T10; a shipped file cites `docs/specs/changes/impeccable-audit-fixes` (`grep -rn "impeccable-audit-fixes" .claude docs README.md CHANGELOG.md \| grep -v '^docs/specs/'` → must be empty); `upstream-request.md` claims it was filed |
| Consumers | `test/impeccable-bridge.test.js:129-131` |
| Review | `full`: KZ-002 quote-check of every CHANGELOG clause |
| Done criteria | `npm test` (count re-run and quoted), `npm run verify:cli`, `npm run pack:dry-run` (no `docs/specs` in the pack list) and `git diff --check` pass, with their outputs in `execution.md`. The final phrase-family sweep (DD-12) for fold, viewport count, CTA failure test, `run`, report location and P0 has its hits read. The vendored diff is empty across the spec (`git diff --stat 8268cb7 -- .claude/skills/impeccable/` → empty) |
| Skills | `cognitive-doc-design` |

---

## Coverage (clause granularity)

Each row quotes the clause. A row is closed only by the task named, never by another requirement.

| Requirement clause | Task |
|---|---|
| FR-1 "pin `IMPECCABLE_BIN` to the binary it wrote … for every later launcher call" | T1 |
| FR-1 "state in *Engine consent* that … the launcher reads `~/.impeccable/bin/impeccable` before `IMPECCABLE_HOME`" | T1 |
| FR-1 "when the user excludes `~/.impeccable`, skip probe location 3 and require an `IMPECCABLE_HOME` outside it … and record the exclusion" | T1 |
| FR-1 A1/A1-W "run the one consented download call with the home variable the launcher reads … set to an empty directory" | T1 |
| FR-1 scenario THEN "the probe never calls … the download lands in `/tmp/x/bin/<VERSION>/`, and every later launcher call runs with `IMPECCABLE_BIN` pinned" | T1 |
| FR-1 BUT "must NOT change the home variable for any call other than that one download call" | T1 |
| FR-1 AND IT MUST "record the exclusion and the pinned path in the report" | T1 (bridge record), T5 (template fields) |
| FR-2 "record its absolute path, and what `~` resolved to" | T1, T5 |
| FR-2 "hash every listed file … record `vendored (<version>, verified)` or … `modified …`" | T1 |
| FR-2 "list every other `impeccable/SKILL.md` … never selecting it" | T1 |
| FR-2 "A `modified` copy still leads … environment finding, never … design finding" | T1 |
| FR-2 scenario BUT "must NOT select the 4.7.0 copy"; AND IT MUST "show the resolved `HOME`" | T1 |
| FR-3 "Every viewport SHALL be `WxH` … `incomplete (<value>)`" | T2 |
| FR-3 "The scan matrix keeps its two passes" | T2 |
| FR-3 "The first-visit pass SHALL add the short-height pair … overridable … records each value and its source" | T2 (rule), T6 (where it is declared), T5 (field) |
| FR-3 "`/akili-validate`'s manual fold check covers all four first-visit viewports" | T8 (command), T2 (bridge bullet) |
| FR-3 scenario BUT "must NOT report the screen's first visit as passed on the strength of the `1280x800` pass alone"; AND IT MUST "list each first-visit viewport with its source" | T2; T5 |
| FR-4 "CTA identification, in order …" (A2) | T2 (rule), T6 (the declaration column and style) |
| FR-4 "Measurement … Never `offsetParent`" | T2 |
| FR-4 "Outcomes …" (A2, five values) | T2 |
| FR-4 "Priority: … P1 … FAIL … unless a *Design Waivers* row covers that screen and viewport" | T2 (rule), T3 (the `first-visit` row shape) |
| FR-4 scenario THEN "`below fold (y=650)` and the finding is P1"; BUT "must NOT read `covered` … not … an overlay defect"; AND IT MUST "record the CTA identification method" | T2; T2; T5 |
| FR-5 all three bullets; scenario THEN, BUT "must NOT read `pass`", AND IT MUST "name the test-ID build" | T2 |
| FR-6 the mapping table; "The report's priority note cites the table"; BUT "must NOT create a P0 section" | T4; T5; T5 |
| FR-7 the suppressed list; Assessment A isolation; scenario THEN, BUT, AND IT MUST | T3 (rules), T4 (E2b and E4 pointers) |
| FR-8 brief and parent check; BUT "must NOT write a report with 17 findings as if complete" | T4 |
| FR-9 `npm ci` bullet; validity bullet; BUT "`runtimeError` must NOT count"; AND IT MUST "never run `npm ci` without consent or when Lighthouse is not declared" | T4 (rules), T5 (`Install` field, checklist exception) |
| FR-10 the SHALL; BUT "must NOT omit the record … (it reads `none`)" | T4 (rule), T5 (header line) |
| FR-11 "the design template SHALL give each approved clause a stable ID" | T6 |
| FR-11 "E1 check 2 SHALL report … as baseline drift routed to `/akili-constitution` … Without IDs … `§<section> l.<line>`"; BUT "must NOT edit `design.md`" | T4 (E1), T3 (bridge fallback citation) |
| FR-12 the SHALL; BUT "must NOT leave the field empty when a template is uncovered" | T4; T5 |
| FR-13 "step 5 and its *Verification Checklist* SHALL accept the E6 user-directed path"; BUT "must NOT also require a copy" | T7 (command), T5 (reference checklist), T9 (propose), T10 (docs) |
| FR-14 the value and the closed list; "`False positives: N`"; "never … P1–P3"; BUT "`low-contrast` … must NOT"; AND IT MUST "require evidence that the subtree is `aria-hidden`" | T3; T5; T3; T3; T3 |
| FR-15 "`upstream-request.md` with three reproducible items … nothing is filed" | T11 |
| FR-16 "`akili-validate.md:144`, `docs/skills/impeccable-bridge.md`, `docs/skills/impeccable.md`, and the CHANGELOG … 14 audit gaps plus the installer item" | T8, T10, T10 (checked), T11 |
| NFR-1 to NFR-5 | Shared rules (every task); NFR-5 closed by T11 |

## Premise Ledger hand-off

| Row | Kind | Owner |
|---|---|---|
| P-15 (`UNVERIFIED`, Low) | Settled as the first step | T1 |
| P-20 (`UNVERIFIED`, Low) | Settled as the first step | T1 |
| P-16 (`UNVERIFIED`, High) | Settled at the `/akili-validate` HITL walkthrough, with a held-out case the text does not cite; owner JC | `/akili-validate` (not a task) |
| P-10 (`consumer`) | Copied into the `Consumers` fields | T1, T2, T3, T4, T6, T7, T8, T9, T11 |
| P-11 (`consumer`) | Copied into the `Consumers` fields | T2, T5, T7, T8, T9, T10 |
| P-14 (`shared-state`) | Copied into the `Consumers` fields | T2, T3 |
| Any premise a check refutes | Pivot Protocol (`/akili-execute`), never a quiet edit | — |
