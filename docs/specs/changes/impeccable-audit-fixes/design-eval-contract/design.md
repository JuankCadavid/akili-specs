# Design: Close the design-evaluation gaps found in the 2.40.0 audit

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-contract` |
| Depth | Standard (upper end) |
| Status | **Approved** by JC 2026-10-31 ("Continue" after Fix only; budget re-derived at Phase 3 and approved: 11 tasks, ~870 LOC, ceiling ~900, ~18 rounds). Judgment-day round 1 ran; **Fix only** chosen by JC 2026-10-31: J-1 to J-5 and W-1 to W-9 fixed, not re-judged (`judgment.md`). Amendments A1, A1-W (FR-1) and A2 (FR-4) approved by JC 2026-10-31 |
| Requirements | `requirements.md`, approved by JC 2026-10-31, with A1, A1-W and A2 applied |
| Verified at | `8268cb7`; engine `impeccable-engine 0.1.18` (darwin-arm64); Lighthouse 12.8.2 |
| Format source | `docs/specs/changes/impeccable-hardening/design.md` (there is no `docs/specs/general-setup/`) |
| Skills applied | `impeccable-bridge` (the subject); `cognitive-doc-design`; `judgment-day` (round 1). Not architecturally significant (rules text and tests only): no `software-architect` Decision Spine, no diagram slot |
| Lessons applied | KZ-changes--kaizen-loop-closure-2 (phrase-family sweep keyed on the obligation, DD-12, §7.6), KZ-changes--gate-falsifiability-2 (the clause-to-assertion map in §7.6 is the Reviewer's term-by-term walk list), KZ-004 (enumerated-value walk, §7.5), KZ-005 (no line pointers inside shipped prose, DD-11), KZ-002 (counts re-run, §12), KZ-bugfix--init-ctrlc-abort-2 (test LOC per clause, §12), KZ-changes--leader-brief-contract-2 (falsifiers executed, §7.6), KZ-changes--archify-diagrams-1 (no shipped file or test cites the active spec path, DD-10) |

## 2. Executive Summary

Every rule this spec adds lives in one of two AKILI-owned files. The commands only point at them:

| Owner | Takes | Requirements |
|---|---|---|
| **Bridge** (`impeccable-bridge/SKILL.md`) | Engine pin, exclusion and the one-call home change; verified copy; viewports; first-visit procedure, CTA, outcomes and banner; *Suppressed in `/akili-audit design`* (including Assessment A isolation); the `first-visit` waiver row; the `false positive` list | FR-1 to FR-5, FR-7, FR-14 |
| **Reference** (`references/design-evaluation.md`) | E1 to E4 steps, priority mapping and note, E3b install/validity/load, report template, checklist | FR-6, FR-8 to FR-12, FR-14 (template) |
| **Commands** | `/akili-audit` step 5 and checklist (FR-13); `/akili-validate` fold-check line (FR-3); `/akili-constitution` Step 4: clause IDs, `Primary CTA` column, scan viewports (FR-11, FR-4, FR-3); `/akili-propose` report-source sentence (FR-13) | pointer lines only |
| **Spec folder** | `upstream-request.md` (FR-15) | not shipped |
| **Docs, CHANGELOG** | Restatements (FR-16) | — |

Decisions taken at the Phase 2 gate:

- **A1 and A1-W (FR-1).** One download call changes the home variable the launcher reads.
- **A2 (FR-4).** The first-visit outcomes and the CTA identification order.
- **Clause-ID shape `<n>-<nn>`.** Approved with this design.

## 3. Architecture Overview

How an audit reaches each rule. The structure is unchanged; only the content of the boxes changes:

| # | Step | File that owns it | What changes |
|---|---|---|---|
| 1 | `/akili-audit design` design steps 1–6 | `akili-audit.md` | Step 5 and the checklist accept the E6 path (FR-13) |
| 2 | E0 Skill source and engine | bridge *Step 0* | Exclusion, pin after download (inline on every call), one-call home change, verified copy (FR-1, FR-2) |
| 3 | E1 Baseline | reference | Check 2 also covers the waiver list and clause IDs (FR-11) |
| 4 | E2 Target | reference | Template coverage, `Coverage` field (FR-12) |
| 4a | Assessment A, inline only | bridge *Suppressed in `/akili-audit design`* | Runs between E2 and E3, only when no sub-agent tool exists (FR-7) |
| 5 | E3 Detector | bridge *Detector gate* | `WxH` viewports, short-height pair, CTA, outcomes, banner (FR-3 to FR-5) |
| 6 | E3b Performance | reference | `npm ci` with consent, validity by JSON, machine load (FR-9, FR-10) |
| 7 | E4 Review | reference + bridge suppression section | Suppressed steps, bounded delegated return (FR-7, FR-8) |
| 8 | E5 Prioritize | reference *Priorities* + bridge *Design Waivers* | P0 mapping and note, `first-visit` waivers, `false positive` (FR-4, FR-6, FR-14) |
| 9 | E6 Write | reference | New header fields and table columns |
| 10 | `/akili-validate` design gate | `akili-validate.md` → bridge | The manual fold check covers every first-visit viewport. `covered` and `below fold` read FAIL through the bridge's priority bullet; validate's consequence row already points there (FR-3, FR-4) |

## 4. Extended Directory Structure

```text
.claude/skills/impeccable-bridge/
  SKILL.md                            EDITED (Step 0, Engine consent, Launcher form, Detector gate, Design Waivers, new "Suppressed in /akili-audit design")
  references/design-evaluation.md     EDITED (E1, E2, E3b, E4, Priorities, template, checklist)
.claude/commands/
  akili-audit.md                      EDITED (design step 5; Verification Checklist design-mode paragraph)
  akili-validate.md                   EDITED (the first-visit manual fold-check sentence)
  akili-constitution.md               EDITED (Step 4: clause IDs, Primary CTA column, scan viewports)
  akili-propose.md                    EDITED (Design evaluation as a source: report location)
docs/skills/impeccable-bridge.md      EDITED (report location; first-visit summary; skill-source readings)
docs/commands/akili-audit.md          EDITED (report location)
docs/skills/impeccable.md             CHECKED, unchanged (no restatement site: P-11 grep)
CHANGELOG.md                          EDITED (Unreleased)
test/design-eval-contract.test.js     NEW (text contracts + retired-phrase sweep)
docs/specs/changes/impeccable-audit-fixes/design-eval-contract/upstream-request.md   NEW, not shipped
```

Not touched:

- `.claude/skills/impeccable/**` (NFR-1).
- `bin/`.
- `test/impeccable-bridge.test.js`: its pinned strings stay true (P-10).
- `.claude/commands/akili-test.md`: it plans the scan matrix only, which keeps two passes. The short-height pair is browser-only (DD-4).

## 5. Data Model (record shapes in the report and the baseline)

### 5.1 Report header (`design-evaluation.md` template)

| Field | Change | Values |
|---|---|---|
| `Impeccable` | Extended (FR-1, FR-2) | `<skill source>` + `<engine state>`, then sub-lines: `Copy: <absolute path>`; `Home: HOME=<resolved>` (or `USERPROFILE=<resolved>` on Windows); `Other copies: <path (version)>, … \| none`; `Excluded: ~/.impeccable \| none`; `IMPECCABLE_BIN: <pinned path> \| not set`; `Download home override: <variable>=<dir> (one call) \| none` |
| `Viewports` | Replaces the `Mobile viewport` sub-line (FR-3) | `desktop <WxH> (<source>)`, `mobile <WxH> (<source>)`, `short-height <WxH> + <WxH> (<source>)`; source is `docs/ux-ui/design.md`, `default`, or `incomplete (<value>), default used` |
| `Coverage` | New (FR-12) | `all templates` \| `<n> of <m> templates; not covered: <names>` |
| `False positives` | New (FR-14) | `N` |
| `Score source` | Extended (W-1) | adds `, degraded (single-context: <reason>)` when Assessment A ran inline |
| `Baseline` → `Page modes` sub-line | **Name kept**; values extended (FR-11) | `ok` \| `drift (<page-mode column missing \| screens without a mode \| Design Waivers list missing \| clause IDs missing>; routed to /akili-constitution)` |
| `Performance` | Extended (FR-9, FR-10) | plus `Install: none \| npm ci (consented by <who>) \| Unevaluated (Lighthouse unavailable: npm ci failed: <first stderr line>)` and `Machine load: <load average 1/5/15>; other listening dev servers: <port process>, … \| none \| unavailable (<reason>)`, recorded once per E3b run, immediately before its first Lighthouse run |
| `Report location` | Unchanged values | `default` \| `<path> (directed by <who>)` |

### 5.2 Tables and notes

| Table | Change |
|---|---|
| *Screens Evaluated* `First-visit pass` column | Format: `<WxH> <outcome>` per first-visit viewport, separated by `; `. Each outcome is one of: `pass`, `covered (<element>)`, `below fold (y=<n>)`, `Unevaluated (<reason>)`, optionally followed by ` waived (design.md)`. A Read screen reads `not required (Read)`. The value `run` is retired |
| *Capture conditions* | One row per first-visit capture (screen × first-visit viewport). Adds `CTA (method)` (`declared`, `primary style`, `first main action`) and `Banner` (`visible`, `not rendered: <reason>`, `none in product`) |
| *Performance* | Adds `Exit codes` (per run, with the first stderr line when non-zero) |
| *Detector Results* `Waived?` | Adds `false positive (<reason>; <evidence>)` |
| *Findings* priority note | New line above `### P1`: "Priorities follow *Priorities*; an Impeccable P0 appears as P1 tagged `blocking` (mapping table)" (FR-6) |

### 5.3 `docs/ux-ui/design.md` (written by `/akili-constitution`, read by E1 and E3)

| Item | Shape |
|---|---|
| Clause ID | `<n>-<nn>` at the start of each approved rule, token or decision line in sections 1–13 of the *Required structure*. The ID is the line's first token, e.g. `8-06 Colored cards use rounded top borders`. `<n>` is the section number; `<nn>` is a two-digit counter in order of writing, never reused after deletion. Backfilling an existing baseline numbers its lines in document order |
| Screen Inventory | Adds a `Primary CTA` column: a selector or attribute naming the screen's main action, or `—` |
| Design Waivers row | Unchanged five columns. The clause it rests on is cited in its **Reason** cell (`per 8-06`). A first-visit waiver uses Rule `first-visit` and Scope `<screen> @ <WxH>` (FR-4) |
| Primary CTA style | Optional, under *Component Inventory*: the class, token or attribute that marks the Primary CTA style. CTA step 2 runs only when it exists |
| Scan viewports | Under *Responsive Behavior*: `desktop`, `mobile` and the `short-height` pair, each `WxH`. Optional; defaults apply when absent |

### 5.4 Closed list (bridge)

| Rule id | Allowed `false positive` reason | Required evidence |
|---|---|---|
| `text-occlusion` | `decorative, aria-hidden`: the occluded text sits inside an element with `aria-hidden="true"` | the selector of that `aria-hidden` ancestor |

- The list starts with one row. Adding a row changes the bridge, so it needs a spec.
- The value exists only in `/akili-audit design` reports. `/akili-validate` has no `false positive`: a finding there is fixed or waived.

## 6. API Design

No CLI, installer or code API changes. Upstream contracts consumed:

- both launchers' resolution order and download (P-1 to P-3, P-2b);
- the engine's `detect` flags (P-5);
- the vendored critique's invariants (P-18);
- the Lighthouse result's `runtimeError` and performance score (P-6).

## 7. Module Design (rules text and tests)

### 7.1 Bridge, *Step 0*, *Engine consent* and *Launcher form*

| Item | Rule | FR |
|---|---|---|
| 1 Skill source, new **Verify** paragraph | The hash rule applies to a `vendored` copy; `Copy`, `Home` and `Other copies` are recorded for any selected copy, `vendored` or `user-installed` (amended 2026-10-31, T1 Reviewer, to match FR-2 bullets 1 and 3). The table keeps `vendored (<version>)`. Hash every file `UPSTREAM.md` lists. Any sha256 tool works: `shasum -a 256`, `sha256sum`, or `certutil -hashfile <file> SHA256` on Windows. Hash `SKILL.md` with its `metadata:` block removed, from the line `metadata:` up to, **not** including, the closing `---` fence. A file in the folder that is neither listed nor one of `LICENSE`, `NOTICE`, `UPSTREAM.md` counts as modified. Extend the recorded value to `vendored (<version>, verified)` or `vendored (<version>, modified: <n> files: <first 3 names>)`. Record `Copy`, `Home` and `Other copies` (§5.1): every other `impeccable/SKILL.md` found in the locations, with its version. **Never select another copy.** A `modified` copy still leads; the report states it as an environment finding, never a design finding | FR-2 |
| 2 Engine probe, new **Exclusion** paragraph | When the user excludes `~/.impeccable`, skip location 3. Also skip any other candidate whose resolved path lies under `~/.impeccable`, such as an `IMPECCABLE_BIN` or a `PATH` entry pointing there. Location 4 counts only with an `IMPECCABLE_HOME` outside `~/.impeccable`. Record `Excluded: ~/.impeccable`. Say that the exclusion covers where the engine is found, and state what P-20 settles about its state files | FR-1 |
| 3 Ready | The existing pinned `export` sentence stays. Added: shell state may not persist between an agent's tool calls, so **every** launcher call carries `IMPECCABLE_BIN=<pinned path>` as an inline prefix | FR-1 |
| 4 Consent | The existing download sentence stays. Added: **under an exclusion**, the consent question asks for an `IMPECCABLE_HOME` outside `~/.impeccable` when none is set, or the one set lies under `~/.impeccable` (amended 2026-10-31, T1 Reviewer, to match FR-1 bullet 3). If none is given, record `unavailable (excluded location, no IMPECCABLE_HOME)` and do not download. That one download call runs with the launcher's home variable set to an empty directory inside `IMPECCABLE_HOME`: `HOME` for `scripts/impeccable`, `USERPROFILE` for `scripts/impeccable.cmd`. No other call changes it (**A1, A1-W**). On success, set the pin to `${IMPECCABLE_HOME:-~/.impeccable}/bin/<VERSION>/impeccable` (`impeccable.exe` on Windows). Then run `<pin> engine-probe` directly; a pin that does not answer records `unavailable (<first stderr line>)`. Record `IMPECCABLE_BIN` and the `Download home override` | FR-1 |
| *Engine consent* | The `Destination` cell adds: "`IMPECCABLE_HOME` alone does not isolate: without the pin, each launcher reads `~/.impeccable/bin/impeccable[.exe]` first." A new field **Home override**: "under an exclusion, the download call alone runs with `HOME` (or `USERPROFILE`) set to an empty directory inside `IMPECCABLE_HOME`" | FR-1 |
| *Launcher form* | The command line gains the `IMPECCABLE_BIN=<pinned path>` prefix. The sentence "`IMPECCABLE_BIN` stays pinned from Step 0" becomes "every call carries the Step 0 pin inline". The prefix goes before the existing command line, so the substring the existing test pins survives (P-10) | FR-1 |

### 7.2 Bridge, *Detector gate*

| Section | Rule | FR |
|---|---|---|
| *Scan matrix* | Still two passes. New sentence: every viewport is `WxH`. A `docs/ux-ui/design.md` value without a height reads `incomplete (<value>)`, and the default is used. `desktop` takes its value from *Responsive Behavior* in `docs/ux-ui/design.md` when declared, else `1280x800` | FR-3 |
| *First-visit pass*, opening | Runs for every Persuade and Operate screen. Item 1 (the detector with the two flags) runs at the scan matrix's two viewports. Items 2–4 run at **every first-visit viewport**: `desktop`, `mobile`, and the **short-height pair** (default `1366x768` and `375x667`, overridable in `docs/ux-ui/design.md`). The report records each value with its source. The wording "at **both** viewports" is retired | FR-3 |
| Item 3, CTA | Identification order: (1) the screen's `Primary CTA` in the Screen Inventory; (2) only when `docs/ux-ui/design.md` defines a Primary CTA style, the first element in `main` with it; (3) the first `main a\|button`. Record the method. A non-declared CTA goes under *Assumptions* | FR-4 |
| Item 3, measurement and outcomes | Visibility comes from computed style (`display`, `visibility`, `opacity`) plus the bounding box against the viewport, never from `offsetParent`. The hit-test is at the box centre. Outcomes, checked in this order: (a) no candidate → `Unevaluated (no CTA found)`; (b) hidden by computed style, or a zero-size box → `Unevaluated (CTA not visible: <style>)`; (c) centre at or below the viewport's bottom edge → `below fold (y=<top>)`; (d) hit-test returns the CTA or one of its descendants → `pass`; (e) otherwise → `covered (<topmost element>)`. The old failure sentence "The pass **fails** when the topmost element …" is retired; the descendant tolerance survives in (d) | FR-4 |
| New item 4, banner | When the product has a consent banner (named in `docs/ux-ui/design.md`, or found in the UI source), each capture asserts it is visible, using the item 3 measurement applied to the banner. If it is not rendered, the capture reads `Unevaluated (consent banner not rendered: <reason>)` and the report names the remedy: a build that renders the banner with **test** identifiers, never production ones. The detector's flags count as banner evidence only where the capture confirmed the banner on screen; otherwise the report says the detector added no first-visit evidence | FR-5 |
| Priority bullet | Replaces the `390x844` example bullet. On Persuade and Operate screens, `covered` or `below fold` at any first-visit viewport is **P1** in `/akili-audit design` and **FAIL** in `/akili-validate`. The exception is a *Design Waivers* row with Rule `first-visit` covering that screen and viewport. An `Unevaluated` outcome is never a pass: in `/akili-validate` the gate reads `WARN (unverified first visit)` until a manual or automated capture gives an outcome, as in the no-automation case | FR-4, FR-5 |
| *Without browser automation* | Wording kept, except it now asks for "a manual fold check at every first-visit viewport" | FR-3 |

### 7.3 Bridge, *Design Waivers* and new *Suppressed in `/akili-audit design`*

| Section | Rule | FR |
|---|---|---|
| *Design Waivers*, row shape | Adds the `first-visit` Rule with Scope `<screen> @ <WxH>`, and the clause citation in **Reason** (§5.3) | FR-4, FR-11 |
| *Design Waivers*, new row **False positive** | `false positive (<reason>; <evidence>)` is allowed only for a rule on the closed list (§5.4), and only in `/akili-audit design`. It is counted in `False positives: N` and never among P1–P3. Any other rule needs a waiver or stays a finding | FR-14 |
| *Design Waivers*, example | `(clause A-06)` becomes `(clause 8-06)`. Adds: with no clause IDs, a proposed waiver cites `§<section> l.<line>` | FR-11 |
| New section *Suppressed in `/akili-audit design`* (after *Phase map*) | In report-only mode, an agent following Impeccable's `critique` skips three steps: persisting the snapshot (`.impeccable/critique/`); starting `live-server` or any inject; the closing user questions. It ends with the line `Questions skipped: report-only (/akili-audit design)` instead. Assessment A runs as an isolated sub-agent given no detector output. Inline is allowed only when no sub-agent tool exists: it then runs between E2 and E3, and `Score source` records `degraded (single-context: <reason>)`, which carries upstream's banner. A delegated critique brief reproduces this list | FR-7 |

### 7.4 Reference

| Step / section | Rule | FR |
|---|---|---|
| Steps table | New row **E2b** between E2 and E3: "Assessment A inline, only per the bridge's *Suppressed in `/akili-audit design`*". E4 points at the same section | FR-7 |
| E1 check 2 | Renamed **Baseline shape**. Any of these is drift: a missing page-mode column, a screen with no mode, a missing *Design Waivers* list, or missing clause IDs. Drift reads `Page modes: drift (<what>; routed to /akili-constitution)`, and nothing is written. Without IDs, proposed waivers cite `§<section> l.<line>` | FR-11 |
| E2 | Pick key screens so that every distinct template in the UI source (a layout or page component, e.g. `BlogPost.astro`) appears once while the cap of 8 allows. Record `Coverage` | FR-12 |
| E3b *Resolve, never install* | Adds a fourth way to resolve Lighthouse: `npm ci` from the lockfile, recorded in `Install`. All three conditions must hold: Lighthouse is declared in the project's `devDependencies`; `node_modules` is **absent** and git-ignored (a fresh worktree); the bridge's consent is given, and the consent question says that `npm ci` installs every devDependency and runs their install scripts. Never when Lighthouse is not declared or `node_modules` exists. A failed `npm ci` reads `Unevaluated (Lighthouse unavailable: npm ci failed: <first stderr line>)` | FR-9 |
| E3b new row *Run validity* | A run counts as completed when its JSON exists, has no `runtimeError`, and has a performance score, whatever the exit code. Record the exit code and the first stderr line. *Too few runs* counts completed runs by this rule | FR-9 |
| E3b new row *Machine load* | Record once per E3b run, right before its first Lighthouse run. Sources are given after this table | FR-10 |
| E4 | Points at the bridge's *Suppressed in `/akili-audit design`*. A delegated critique's brief must: (1) reproduce that list; (2) give the sub-agent no E3 output; (3) require the finding count first, then the findings as text in bounded parts; (4) forbid file output. The parent compares the count before writing and fetches any shortfall | FR-7, FR-8 |
| *Priorities* | Adds the mapping table: Impeccable P0 → P1 tagged `blocking`; P1 → P1; P2 → P2; P3 → P3. A finding that is both blocking and inaccessible is one P1. The template gains the priority note (§5.2) | FR-6 |
| Template | Applies the §5 fields. The *Screens Evaluated* format replaces the line `run \| not required \| Unevaluated` | FR-3, FR-4, FR-10, FR-12, FR-14 |
| Checklist, rewritten items | *Capture conditions* has one row per first-visit capture (screen × viewport). Every key screen has a page mode, and either a first-visit outcome per viewport or `not required (Read)`. The last item: nothing was written outside `docs/specs/audits/`, except a recorded user-directed report location and a recorded consented `npm ci` | FR-3, FR-9, FR-13 |
| Checklist, new items | `Coverage` names every uncovered template. `False positives` equals the count of such rows, none of them in P1–P3. The `Machine load` line is present | FR-10, FR-12, FR-14 |

**Machine-load sources:**

- **Load average:** `uptime` on macOS and Linux.
- **Listeners:** `lsof -nP -iTCP -sTCP:LISTEN`, or `ss -ltnp` on Linux.
- **Dev server:** a listener whose process is `node`, `bun`, `deno`, `python`, `ruby`, `php` or `java`, or whose port is 3000–9999. The audit's own server is excluded.
- **No dev server listening:** `none`.
- **No source on the host:** `unavailable (<reason>)`.

### 7.5 Enumerated-value walk (KZ-004)

| New value | Consumer (as run, P-14 and P-11) | What it does there |
|---|---|---|
| `vendored (<version>, verified \| modified …)` | The bridge's *Roles* and *Who does what*; the `vendored` rows of six commands (audit, constitution, propose, specify, test, validate); the readings table in `docs/skills/impeccable-bridge.md`; `test/impeccable-bridge.test.js` | All of them key on the word `vendored`, so the reading is unchanged. The docs readings cell adds "(verified or modified)". `modified` adds only an environment finding |
| First-visit outcomes (`pass`, `covered`, `below fold`, two `Unevaluated`) | Bridge priority bullet; validate's consequence row (points at the bridge); the audit template's *Screens Evaluated* and its checklist; `/akili-propose` (carries the P1s) | `covered` and `below fold` are P1 or FAIL unless waived. `Unevaluated` is never a pass, and validate reads `WARN (unverified first visit)`. Propose carries the P1 like any other |
| Retired value `run` | The *Screens Evaluated* note and a checklist item in `design-evaluation.md` | Replaced by the per-viewport format and swept (§7.6) |
| `Unevaluated (consent banner not rendered: …)` | Validate gate; audit report | Validate is `WARN (unverified first visit)` (§7.2 priority bullet). The audit records it with the test-ID remedy |
| ` waived (design.md)` on a first-visit outcome | *Screens Evaluated*; E5; exit-code table | The outcome is not P1 or FAIL. The detector exit code is unaffected, because first-visit outcomes are browser results, not detector findings |
| Waiver Rule `first-visit` | *Design Waivers* matching (`waived (design.md)`, `unused`) | Matched on screen and viewport like any scope |
| `false positive (…)` | The `Waived?` footnote, the *Counting* row, E5, the checklist, the exit-code row `2` | Audit only, counted apart, never P1–P3. For exit `2` it counts as waived only in the audit's reading of the scan matrix; validate has no such value |
| `drift (… clause IDs missing …)` | E1 output; the `Page modes` sub-line | Routed to `/akili-constitution`; the audit continues with `§<section> l.<line>` citations |
| `Install`, `Coverage`, `Excluded`, `Download home override`, `incomplete (…)`, `Machine load: unavailable` | Report header only; the checklist checks `Coverage`, `False positives` and `Machine load` | Informational; none changes a priority or a gate |

### 7.6 Tests (`test/design-eval-contract.test.js`, new)

The table below maps each clause to its assertions, and it is also the Reviewer's list for a term-by-term walk. Every assertion ships with an executed mutation that turns it red (NFR-4, KZ-changes--leader-brief-contract-2), recorded in the task's evidence.

| Requirement | Clauses → assertions | n |
|---|---|---|
| FR-1 | Pin after download (with the `.exe` note); `IMPECCABLE_HOME` alone does not isolate; the exclusion paragraph (location 3, the resolved-path rule, an outside `IMPECCABLE_HOME`); the one-call home change naming `HOME` and `USERPROFILE`; the inline `IMPECCABLE_BIN=` prefix on every call; BUT no home change after the pin; AND the `Excluded:` and `IMPECCABLE_BIN:` header fields | 7 |
| FR-2 | The hash rule with the `metadata:` range; the `verified` and `modified` values; `Copy` and `Home`; other copies; BUT "never select another copy"; "environment finding, never a design finding" | 6 |
| FR-3 | `WxH` and `incomplete (`; the scan matrix keeps two passes; `1366x768` and `375x667` with override and source; validate says "every first-visit viewport"; BUT a P1 at any first-visit viewport, not on `1280x800` alone; AND each viewport is listed with its source | 6 |
| FR-4 | The CTA order (three steps, in order, step 2 conditional); computed style plus box, "never `offsetParent`"; the five outcomes in order, with the descendant tolerance; P1 or FAIL unless a `first-visit` waiver; THEN `below fold` is P1; BUT `below fold` is not `covered` and not an overlay defect; AND the method is recorded | 7 |
| FR-5 | The banner-visible assertion; `Unevaluated (consent banner not rendered`; test identifiers, never production ones; detector evidence only where confirmed; BUT never `pass` without the banner | 5 |
| FR-6 | The mapping rows; the priority note; BUT no `### P0` in the template | 3 |
| FR-7 | The three suppressed steps; `Questions skipped: report-only`; Assessment A isolated, inline only without a sub-agent tool, marked `degraded`; BUT no `.impeccable/critique/` write and no `live-server` | 4 |
| FR-8 | Count first, bounded parts, no file output; the parent compares and fetches; BUT no report short of the count | 3 |
| FR-9 | `npm ci` only when declared, `node_modules` absent, and the consent naming install scripts; run validity (three conditions); BUT `runtimeError` never counts; AND the `npm ci failed` state | 4 |
| FR-10 | Load average, the dev-server filter and the sources; BUT `none` | 2 |
| FR-11 | `<n>-<nn>` in constitution Step 4; E1 drift routing; `§<section> l.<line>`; BUT nothing written | 4 |
| FR-12 | Template coverage and `Coverage`; BUT the field names every uncovered template | 2 |
| FR-13 | Audit step 5 and the checklist accept the E6 path; the propose sentence names the recorded location | 2 |
| FR-14 | The closed-list row; `False positives: N`; never P1–P3, audit only; BUT `low-contrast` is not on the list; AND the evidence names the `aria-hidden` ancestor | 5 |
| FR-15 | No test: the file is not shipped (DD-10). The T6 Reviewer checks its three items | 0 |
| FR-16 | Retired-phrase sweep (seven patterns, listed below the table) | 7 |
| Guard | The new test reads no `docs/specs/` file | 1 |
| **Total** | | **68** |

The FR-16 sweep runs over `.claude/`, `docs/` and `README.md`, minus `docs/specs/` and the vendored folder. Its seven patterns:

1. `fold check at both viewports`
2. `run, at **both** viewports`
3. `(clause A-06)`
4. `` `run` \| `not required (Read)` `` and `` (`run`, `not required (Read)` ``
5. `The pass **fails** when the topmost element`
6. `` A hero CTA under a consent banner at `390x844` ``
7. Every design-mode line containing `` outside `docs/specs/audits/` `` (the `akili-audit.md` design checklist, the reference) also names the user-directed exception.

## 8. Frontend / UX Component Architecture

n/a: there is no UI in this repository. The rules govern UI evaluation in projects that install AKILI.

## 9. Shared Contracts or Package Extensions

| Surface | Change |
|---|---|
| Package contents | No new shipped file. `test/` and `docs/specs/` are not shipped (`package.json` `files`, P-12) |
| Report contract | Additive fields and values (§5). The `run` value is retired. An older report stays readable |
| Baseline contract | Clause IDs, the `Primary CTA` column, the Primary CTA style and the scan viewports are optional for old baselines. Missing IDs or waivers are drift reported by E1. A missing CTA column or style falls through to CTA step 3, and missing viewports to the defaults. None of them stops the audit |
| Release | Patch, recorded only (no release in this cycle) |

## 10. Design Decisions

| DD | Decision | Why | Rejected |
|---|---|---|---|
| DD-1 | Pin `IMPECCABLE_BIN` after consent, and pass it **inline on every launcher call** | Both launchers run an existing `IMPECCABLE_BIN` first (P-1, P-2b). Shell state may not persist between an agent's calls, so `export` alone guarantees nothing (J-5) | Overriding `HOME` on every call, as the 2.40.0 run did; `export` alone |
| DD-2 (**A1, A1-W**, approved by JC 2026-10-31) | Under an exclusion, the one consented download call runs with the launcher's home variable (`HOME` or `USERPROFILE`) set to an empty directory inside `IMPECCABLE_HOME`. No other call changes it | Without `IMPECCABLE_BIN`, each launcher runs `~/.impeccable/bin/impeccable[.exe]` before its download, and the POSIX probe mode refuses to download (P-2, P-2b). No other no-code route reaches the download | Refusing the download outright (no route left); downloading outside the launcher (AKILI would re-implement the checksum check) |
| DD-3 | Keep the skill-source value `vendored (<version>)` and extend the recorded value after verifying | Six commands, one docs table and one test key on it (§7.5, P-10). FR-2's strings stay literal | A separate `Copy` state, a new enumerated type to walk in every command |
| DD-4 | The short-height pair runs the browser items (2–4) only. The detector (item 1) and the scan matrix stay at two viewports | M3 is a fold problem. Detector rules do not depend on height (proposal R2) | A four-viewport detector scan |
| DD-5 | The CTA is identified in a fixed order (declared, then a defined style, then the first main action), with the method recorded | Two agents get the same CTA, or the report shows why not (M4). Step 2 needs a defined style; today no AKILI template defines one (J-3, P-17) | Agent judgment; a "Primary CTA policy" no template defines |
| DD-6 | A first-visit waiver is an ordinary *Design Waivers* row with Rule `first-visit` | The waiver shape and matching already exist; a new list would be a second authority | A separate first-visit exceptions table |
| DD-7 | `false positive` is a closed list in the bridge, audit-only, starting with one rule | It removes the M14 noise without letting the value swallow real findings: `low-contrast` can never use it. Validate keeps fix-or-waive | A free `false positive` (unbounded); an upstream fix only (outside AKILI's control, so it goes in FR-15) |
| DD-8 | The clause ID `<n>-<nn>` is the line's first token, keyed on the *Required structure* number, and a waiver cites it in its Reason cell | The template already numbers 13 sections. IDs survive edits; line numbers do not. The waiver row keeps its five columns | Letter prefixes like `A-06` (no source for the letter); hashes (not human-citable); a sixth waiver column |
| DD-9 | Assessment A runs as an isolated sub-agent; inline only without a sub-agent tool, between E2 and E3, marked degraded | It meets the vendored critique's invariants (P-18) and keeps the order E3 → E3b → E4 for concurrency | Unconditional inline (contradicts `critique.md`); moving E4 before E3 |
| DD-10 | `upstream-request.md` stays in the spec folder; the CHANGELOG mentions it without a path | A shipped file must not cite the active spec's path (P-12) | A shipped doc page for the request |
| DD-11 | Commands point by section name, never by line | KZ-005 | — |
| DD-12 | Before review, run a phrase-family sweep over `.claude/` and `docs/`, keyed on each obligation: fold, viewport count, the CTA failure test, `run`, report location, P0. The test sweep (§7.6) keeps the retired phrases out | KZ-changes--kaizen-loop-closure-2. The sites are P-11 and P-14 as run | Sweeping only the identifiers |

### Reversion challenges (Step 2.3)

| Reverted behavior | "What does removing this break?" | Resolution |
|---|---|---|
| E3b: a run with a non-zero exit counted as failed | A run that exits 1 with a JSON describing a broken page would count | It counts only with no `runtimeError` **and** a performance score. The exit and stderr are recorded, so a reader can still discount it |
| The first-visit failure sentence "fails when the topmost element is neither the CTA nor its descendant" | Dropping the descendant clause would make the CTA's own `<span>` read `covered`, a false P1 (judgment-day J-1) | Outcome (d) keeps the descendant tolerance; only the sentence form is retired. `below fold` is a new failing outcome, and the two `Unevaluated` outcomes never pass |
| The value `run` in *Screens Evaluated* | Older reports read `run` | Old reports stay valid as history. New reports use per-viewport outcomes, and the sweep keeps `run` out of shipped text |
| The audit checklist's flat "nothing outside `docs/specs/audits/`" | A report at a user-directed path and a consented `node_modules` now pass | Both exceptions are named and must be recorded; anything else still fails |
| Impeccable critique's snapshot, `live-server` and closing questions in report-only mode | `/impeccable polish` cannot pick up a snapshot from an audit | The audit report is the artifact. `Questions skipped:` closes the run, as upstream requires. `/impeccable` run directly keeps upstream behavior (*Disclosure* bullet) |

## 11. Premise Ledger

**Count:** 21 rows · 18 verified · 3 `UNVERIFIED` (High: 1, Low: 2). In table cells, `\|` stands for the pipe `|` in the command as run.
**Blast-radius triggers:**

- `live-path`: the design names `/akili-audit design` and the `/akili-validate` design gate.
- `shared-state`: several commands and sections read *First-visit pass* and *Design Waivers*.
- `consumer`: new report values and fields, a retired value, changed text pinned by tests, and a new member of the skill-source readings.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | The POSIX launcher execs an executable `IMPECCABLE_BIN` before any other candidate | location | `.claude/skills/impeccable/scripts/impeccable:90-92` (`if [ -n "${IMPECCABLE_BIN:-}" ] && [ -x … ]; then exec`) | `8268cb7` | DD-1 does not isolate (High) | — |
| P-2 | With `IMPECCABLE_BIN` unset and not probing, the POSIX launcher runs `$HOME/.impeccable/bin/impeccable` before the cache and the download. In probe mode it refuses to download | location | `scripts/impeccable:122-124` (`home_bin=…; if [ -z "$probing" ] && [ -x "$home_bin" ] && probe_ok`); `:180-182` (`if [ -n "$probing" ]` → "no download", `exit 127`) | `8268cb7` | A1 is unnecessary (High) | — |
| P-2b | The Windows launcher tries `IMPECCABLE_BIN` first. It reads `USERPROFILE`, not `HOME`, for both the home binary and the default cache, and its names carry `.exe` | location | `grep -n -E "USERPROFILE\|%HOME%\|IMPECCABLE_BIN" .claude/skills/impeccable/scripts/impeccable.cmd` → `:29-31` (`IMPECCABLE_BIN` → `run`), `:51` (`home_bin=%USERPROFILE%\.impeccable\bin\impeccable.exe`), `:60` (`IMPECCABLE_HOME=%USERPROFILE%\.impeccable`); no `%HOME%` | `8268cb7` | A1-W targets the wrong variable (High) | — |
| P-3 | A download lands at `${IMPECCABLE_HOME:-$HOME/.impeccable}/bin/<VERSION>/impeccable$exe` | data-env | `scripts/impeccable:127-128` (`cache_root=…; cached="$cache_root/bin/$version/impeccable$exe"`) | `8268cb7` | The pin path in §7.1 is wrong (High) | — |
| P-4 | `UPSTREAM.md` has 58 `<sha256>  <path>` lines. `shasum -a 256 -c` fails only `SKILL.md`. The folder holds 61 files | data-env | In `.claude/skills/impeccable`: `grep -cE '^[0-9a-f]{64}  ' UPSTREAM.md` → 58; `grep -E '^[0-9a-f]{64}  ' UPSTREAM.md \| shasum -a 256 -c \| grep -v ': OK$'` → `SKILL.md: FAILED`; `find . -type f \| wc -l` → 61 | `8268cb7` | FR-2's verify rule needs another method (High) | — |
| P-5 | Engine 0.1.18 `detect` takes `--viewport <WxH>` (default `1280x800`). Its help documents `--no-consent-hiding` as "keep known consent managers' banners (OneTrust, Cookiebot, ...) on the page instead of hiding them" | data-env | `DO_NOT_TRACK=1 IMPECCABLE_NO_UPDATE_CHECK=1 ~/.npm/_npx/1a4eb60c8f6b0f89/node_modules/@impeccable/cli-darwin-arm64/bin/impeccable detect --help`; its `engine-probe` → `impeccable-engine 0.1.18`, exit 0 (darwin-arm64). The help text says nothing of custom banners. FR-5's evidence rule holds either way, because the browser capture is the evidence | engine 0.1.18 | The first-visit detector item needs another flag (High) | — |
| P-6 | A Lighthouse result carries an optional `runtimeError` | data-env | `~/.npm/_npx/8003d8991b0d346b/node_modules/lighthouse/types/lhr/lhr.d.ts:44` (`runtimeError?: {`), Lighthouse 12.8.2 (the result type the runner fills) | 12.8.2 | FR-9's validity test becomes a score-only check (Low) | — |
| P-7 | Impeccable's critique and audit use P0–P3 | data-env | `.claude/skills/impeccable/reference/critique.md:627-638`; `reference/audit.md:92-93` | `8268cb7` | FR-6's mapping is moot (Low) | — |
| P-8 | Critique persists `.impeccable/critique/`, may start `live-server`, ends with *Ask the User*, and requires Assessment A before detector output | location | `critique.md:198` (`### Persist the Snapshot`), `:79`, `:236` (`### Ask the User`), `:10` | `8268cb7` | The suppression list names the wrong steps (Low) | — |
| P-9 | The constitution's Step 4 already asks for page modes and a five-column *Design Waivers* list. Its *Required structure* numbers 13 sections (9 = *Responsive Behavior*). It never says "clause" | existence | `akili-constitution.md:212`; `:218-232` (`:228` `9. Responsive Behavior`); `grep -c -i clause .claude/commands/akili-constitution.md` → 0 | `8268cb7` | DD-8's ID shape needs another key (High) | — |
| P-10 | Tests that read the edited files pin only strings this design keeps: the Step 0 FR-5 strings, the launcher-form substring, `390x844`/`1280x800`, the audit's default report path, and "no bridge string in commands" | consumer | `grep -rln -E "design-evaluation\|impeccable-bridge\|akili-audit\.md\|akili-validate\.md\|akili-constitution\.md" test/*.js` → 7 files, each read: `impeccable-bridge.test.js:40, 45, 63-64, 73, 76, 104, 115`; `akili-security-command.test.js:396, 576-580` (drift steps only); `akili-review-contract-coverage.test.js:338` (carve-out line); `diagram-design`, `growth-track`, `tasks-gate`, `video-production` (other sections) | `8268cb7` | A hidden red test at execute (Low) | — |
| P-11 | Restatement sites of the changed rules: `akili-validate.md:144`; `akili-audit.md:150, :159`; `akili-propose.md:139`; `docs/skills/impeccable-bridge.md:24, :37, :41`; `docs/commands/akili-audit.md:12`; reference `:11, :37, :97, :147, :152, :154`; bridge `:162, :167, :171, :174, :177`. "Scan matrix at both viewports" (`akili-test.md:193`, `akili-audit.md:147`, `akili-validate.md:140`) stays true. `docs/skills/impeccable.md` has none | consumer | `grep -rn -E "both viewports\|fold check\|390x844\|1280x800\|up to \*\*8\|8 key screens\|outside \`docs/specs/audits/\`\|P0" .claude/commands .claude/skills/impeccable-bridge .claude/templates docs README.md \| grep -v "^docs/specs/"`; `grep -n "audits/design" .claude/commands/akili-propose.md` → `:139`; `sed -n 22,26p docs/skills/impeccable-bridge.md` (readings table) | `8268cb7` | A restatement drifts (High; the §7.6 sweep catches the retired ones) | — |
| P-12 | `docs/specs` is excluded from the package, and a shipped file must not cite the active spec's own path | other | `node -e 'console.log(require("./package.json").files)'` → includes `'!docs/specs'`; `docs/specs/kaizen-log.md:21` (KZ-changes--archify-diagrams-1: "a test in the shipped suite never depends on `docs/specs/<active spec path>`", extended in the same row to any shipped file) | `8268cb7` | DD-10 is unnecessary (Low) | — |
| P-13 | The audit and validate design steps reach the engine, detector and waiver rules through the bridge and the reference; their own restatements are the P-11 sites. Branch points: skill source (`vendored`/`missing`), engine state (5 values), exclusion (yes/no), page mode (Persuade/Operate vs Read), browser automation (yes/no), critique placement (sub-agent/inline) | live-path | `akili-audit.md:140-150` (the consequence table → bridge *Detector gate*; step 5 → reference template); `design-evaluation.md:9-17` (E0–E7 → bridge sections); `akili-validate.md:136-144` → bridge *Detector gate*; critique branch: `critique.md:8-9` | `8268cb7` | A command holds its own copy of a rule and needs its own edit (High) | — |
| P-14 | All readers of *First-visit pass* and *Design Waivers*: `akili-audit.md:147`; `akili-validate.md:140, :144`; `akili-constitution.md:212` (the waiver writer); bridge `:3, :113, :165-177, :185, :194-205`; reference `:3, :12, :15, :94, :97, :135, :147, :152`; `docs/skills/impeccable-bridge.md:37` | shared-state | `grep -rn -E "Design Waivers\|First-visit pass\|first-visit\|first visit" .claude docs README.md \| grep -v "^docs/specs/" \| grep -v "^.claude/skills/impeccable/"` → those sites (run 2026-10-31 at `8268cb7`, before writing) | `8268cb7` | A reader keeps the old two-viewport, `run` or neither-CTA meaning (High) | — |
| P-15 | Windows hosts can hash with `certutil -hashfile <file> SHA256` | data-env | `UNVERIFIED — confirm at source before relying on it` | — | Step 0 verification reads `unavailable (no sha256 tool)` on Windows (Low: a stated fall-through) | T1: cite Microsoft's `certutil` documentation, or drop the example; owner: T1 Implementer |
| P-16 | The CTA order (Primary CTA column → defined style → first main action) picks the hero CTA on a real Persuade page (akili.com.co `/es/`) | other | `UNVERIFIED — confirm at source before relying on it` | — | DD-5's order changes (High) | `/akili-validate` walkthrough at the HITL pause (requirements, defect classes); owner: JC |
| P-17 | No AKILI template defines a Primary CTA policy or a per-screen CTA declaration today | existence | `grep -rn -i -E "primary cta\|CTA policy\|primary-cta\|data-primary" .claude docs README.md \| grep -v "^docs/specs/"` → hits only in `ui-ux-pro-max` (`data/landing.csv`, `data/styles.csv`, `scripts/core.py`, `scripts/design_system.py`), `stitch-design/SKILL.md` and bridge `SKILL.md` (`:171`); `grep -c -w -i cta .claude/commands/akili-constitution.md` → 0 | `8268cb7` | The new column and style are redundant (Low) | — |
| P-18 | The vendored critique requires A and B as isolated sub-agents when a sub-agent tool exists. Inline needs a `⚠️ DEGRADED: single-context (<reason>)` banner. A run with neither questions nor `Questions skipped: <reason>` is incomplete | location | `critique.md:8` (sub-agents; inline only without the tool), `:9` (banner), `:16` (`Questions skipped: <reason>`) | `8268cb7` | DD-9 and the suppression wording change (Low) | — |
| P-19 | The launchers do not check whether `IMPECCABLE_BIN` or a `PATH` engine lies under `~/.impeccable`, so only the bridge can enforce the exclusion for those candidates | location | `scripts/impeccable:90-92` (`IMPECCABLE_BIN` executed if executable, no path test); `:147` (`command -v impeccable`, no path test); `impeccable.cmd:29-31` | `8268cb7` | The resolved-path rule in §7.1 item 2 is redundant (Low) | — |
| P-20 | A pinned engine run with the real `HOME` writes no state under `~/.impeccable` | data-env | `UNVERIFIED — confirm at source before relying on it`. On this host `~/.impeccable` holds `update-check.json` and `hook-claims`, writer not identified. `IMPECCABLE_NO_UPDATE_CHECK=1` disables the update check | — | The exclusion covers the engine's location, not its state files, and the *Exclusion* paragraph must say so (Low) | T1: grep upstream `docs/CLI-CONTRACT.md` for state-file writes and state the limit in the paragraph; owner: T1 Implementer |

## 12. Budget (Step 2.4)

| Measure | Estimate | Basis |
|---|---|---|
| Tasks | **11** (re-derived at Phase 3, approved by JC 2026-10-31: the six groups below split per rules file and at ~8 edit sites per task, Step 3.2; see `tasks.md`). Groups: | T1: bridge *Step 0*, *Engine consent*, *Launcher form* (FR-1, FR-2). T2: bridge *Detector gate*, *Design Waivers*, *Suppressed in `/akili-audit design`* (FR-3 to FR-5, FR-7, FR-14). T3: reference (FR-6 to FR-12, FR-14 template). T4: commands (FR-3, FR-4, FR-11, FR-13). T5: tests (§7.6). T6: docs, CHANGELOG, `upstream-request.md`, full verification (FR-15, FR-16) |
| Authored LOC | **~870**, ceiling **~900** (approved by JC 2026-10-31 at the tasks gate), made up of: rules prose ~330 (bridge ~150, reference ~130, commands ~30, docs ~20); `upstream-request.md` ~70; CHANGELOG ~20; **tests ~450** (68 assertions × ~6 LOC, plus ~40 for the sweep walker; per clause, KZ-bugfix--init-ctrlc-abort-2) | The §7.6 map: 68 assertions |
| Review rounds | **~18** (re-derived at Phase 3, approved by JC 2026-10-31; was ~13): 2 for each `full` task (7 tasks = 14), 1 for each `checklist` task (4) | Rules documents: 2 rounds per task (Step 2.4) |

Depth check: this is the upper end of Standard. The design has more than 400 LOC, so the tasks gate will propose 2 PRs: the rules (T1–T4), then the tests and docs (T5–T6).

## 13. Diagrams

None. The design is not architecturally significant, and no baseline doc slot changes (this repository has no `docs/trd/`).
