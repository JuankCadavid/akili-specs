# Requirements: Close the design-evaluation gaps found in the 2.40.0 audit

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-contract` |
| Parent Spec | `changes/impeccable-audit-fixes` (`family.md`, child 1, `active`) |
| Depth | **Standard**. Rules text in one skill, one reference and three commands, plus text-contract tests. No code, no installer change, no vendored edit |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | `gated`. This run stops at the Phase 1 gate (Step 1.3) |
| Status | **Approved** by JC, 2026-10-31 ("Continue" at the Phase 1 gate). Spec complete (design and tasks approved 2026-10-31) |
| Date | 2026-10-30 |
| Proposal | `proposal.md`, approved by JC 2026-10-30 16:21 (UTC-5). Decisions: a primary CTA below the fold on a Persuade/Operate screen = P1; short-height pair `1366x768` + `375x667`, overridable in `docs/ux-ui/design.md`; no Jira, no Figma |
| Source | `~/akili-audits/2026-10-30-akili-web-design-2.40.0.md`, M1–M14 and *Desviaciones de esta corrida* |
| Format source | `docs/specs/changes/impeccable-hardening/requirements.md`. There is no `docs/specs/general-setup/` (`ls docs/specs/general-setup` → "No such file or directory", 2026-10-30) |
| Verified at | `8268cb7` |
| Release | Patch, recorded only. No release, push, PR or merge in this cycle |

## 2. Executive Summary

The 2.40.0 audit gave correct verdicts only because the agent stepped outside the rules. This spec turns each of those steps into a written rule, and each blind spot into `Unevaluated` or a measured outcome:

- The engine stays isolated without overriding `HOME` (FR-1).
- The copy of Impeccable in use is verified, not assumed (FR-2).
- The first visit is measured at a short height too, with three distinct outcomes, a declared CTA and a banner that must actually be on screen (FR-3 to FR-5).
- One priority scale, with a mapping from Impeccable's (FR-6).
- Critique steps that would write to the repo are suppressed in report-only mode, and a delegated critique returns complete (FR-7, FR-8).
- Lighthouse runs from a fresh worktree are ruled and judged by their JSON; machine load is recorded (FR-9, FR-10).
- Baseline clause IDs, template coverage, one report-location rule, and a bounded `false positive` value (FR-11 to FR-14).
- What only upstream can fix is drafted as a request (FR-15). Restatements stay in step (FR-16).

## 3. Glossary

| Term | Meaning |
|---|---|
| Bridge | `.claude/skills/impeccable-bridge/SKILL.md`, the AKILI-owned layer |
| Reference | `.claude/skills/impeccable-bridge/references/design-evaluation.md` (steps E0–E7, report template, checklist) |
| Vendored copy | `.claude/skills/impeccable/`, byte-identical to upstream except for the declared `metadata:` block; never edited by this spec |
| Short-height pair | The two first-visit viewports added by FR-3: default `1366x768` (desktop) and `375x667` (mobile) |
| Primary CTA | The screen's main action, as FR-4 identifies it |
| First-visit outcome | `pass`, `covered (<element>)` or `below fold (y=<n>)` (FR-4) |
| Report-only mode | `/akili-audit design`: writes one report, edits nothing else |
| Assessment A | Impeccable critique's independent heuristic assessment (`critique.md:10`) |
| Clause ID | `<section>-<nn>`, the stable label of an approved clause in `docs/ux-ui/design.md` (FR-11) |
| Template | A distinct page layout in the product's source (for example `BlogPost.astro`) |

## 4. System Context & Scope

Today, at `8268cb7`:

| Fact | Evidence (as run) |
|---|---|
| The launcher `exec`s `IMPECCABLE_BIN` first, then tries `$HOME/.impeccable/bin/impeccable` (outside probe mode), then the `IMPECCABLE_HOME` cache | `.claude/skills/impeccable/scripts/impeccable:90-92`, `:122-124`, `:127-128` |
| After a consented download, Step 0 records `installed (consented)`; only step 3 (a probe hit) exports `IMPECCABLE_BIN` | `impeccable-bridge/SKILL.md` Step 0 items 3 and 4 |
| `UPSTREAM.md` lists 58 `sha256  path` lines; `shasum -a 256 -c` over them in the vendored folder fails only `SKILL.md`, which is hashed upstream without AKILI's `metadata:` block | `grep -cE '^[0-9a-f]{64}  ' UPSTREAM.md` equivalent → 58; `shasum -a 256 -c` → `SKILL.md: FAILED`, all others OK; `test/impeccable-vendor.test.js:64-98` (`skillWithoutMetadata`) |
| Step 0 calls a copy `vendored` when `UPSTREAM.md` sits beside it, with no checksum check | `SKILL.md` Step 0 item 1 table |
| The scan matrix has `desktop` (default `1280x800`) and `mobile` (`design.md` value, else `390x844`); no short-height pass | `SKILL.md` *Scan matrix* |
| The first-visit pass fails "when the topmost element is neither the CTA nor its descendant", with no method for finding the CTA or measuring visibility | `SKILL.md` *First-visit pass* item 3 |
| No rule requires the consent banner to be on screen during the first-visit pass | `SKILL.md` *First-visit pass* (no presence clause) |
| AKILI's design scale is P1–P3; Impeccable's critique and audit use P0–P3 | `design-evaluation.md` *Priorities*; `impeccable/reference/critique.md:627-638`; `impeccable/reference/audit.md:92-93` |
| Critique persists `.impeccable/critique/`, may run `live-server`, closes with questions, and requires Assessment A before detector output enters the parent | `critique.md:3`, `:10`, `:79`, `:198-232`, `:236` |
| E3 (detector) runs before E4 (critique); E4 says nothing about delegated returns | `design-evaluation.md` *Steps* |
| E3b resolves Lighthouse from `node_modules/.bin`, `PATH`, `npx --no-install`; a failed run counts against the 3 | `design-evaluation.md` *E3b* rows *Resolve, never install*, *Too few runs* |
| E3b concurrency is per process; no machine-load record | `design-evaluation.md` *E3b* row *Concurrency* |
| The constitution template already asks for page modes and a *Design Waivers* list (first released in 2.40.0), with no clause IDs; the bridge's example cites `A-06` | `akili-constitution.md:212` (blame `701c8ff`, `git tag --contains` → `v2.40.0`); `SKILL.md` *Design Waivers* example |
| E2 caps key screens at 8 with no coverage statement | `design-evaluation.md` E2 |
| `/akili-audit` design step 5 and its checklist name only `docs/specs/audits/`; E6 allows a user-directed path | `akili-audit.md:150`, `:159`; `design-evaluation.md` *E6* |
| Waived values are `no`, `waived (design.md)`, `waived (upstream ignore)`, `Proposed waiver (<clause>)`, `out of scope` | `design-evaluation.md` *Detector Results* footnote |
| `/akili-validate` restates "a manual fold check at both viewports" | `akili-validate.md:144` |
| Commands restate no bridge command string (`IMPECCABLE_BIN`, `DO_NOT_TRACK`, `scripts/impeccable` …) | `test/impeccable-bridge.test.js:102-105` |

**In scope:** proposal §5, plus `akili-validate.md:144` (a restatement FR-3 changes).
**Out of scope:** proposal §6: any vendored file; akili.com.co itself; a P0 level in AKILI; a performance gate; a general harness truncation fix; the installer (sibling spec); Sentinel PRs.

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| Agent running `/akili-audit design` or the `/akili-validate` design gate | Rules it can follow literally and that give the same verdict as another agent following them |
| Project owner | No false `PASS`; no writes during a read-only audit; their exclusions and approved patterns respected |
| AKILI maintainer | One owner per rule, restatements that cannot drift silently, the vendored copy untouched |
| Upstream (Impeccable) | A precise, reproducible request, filed only by JC |

## 6. Functional Requirements

### FR-1: Engine isolation; the home variable changes for one download call at most (M1)

The bridge SHALL:

- after a consented download succeeds, pin `IMPECCABLE_BIN` to the binary it wrote (`${IMPECCABLE_HOME:-~/.impeccable}/bin/<VERSION>/impeccable`) for every later launcher call in the phase;
- state in *Engine consent* that, without that pin, the launcher reads `~/.impeccable/bin/impeccable` before `IMPECCABLE_HOME`;
- when the user excludes `~/.impeccable`, skip probe location 3 and require an `IMPECCABLE_HOME` outside it for location 4 and the download, and record the exclusion;
- under that exclusion, run the one consented download call with the home variable the launcher reads (`HOME` for `scripts/impeccable`, `USERPROFILE` for `scripts/impeccable.cmd`) set to an empty directory inside `IMPECCABLE_HOME`, because each launcher runs `~/.impeccable/bin/impeccable[.exe]` before its download whenever `IMPECCABLE_BIN` is unset (amendment A1, design P-2, approved by JC 2026-10-31; Windows variant A1-W, design P-2b, approved by JC 2026-10-31 after judgment-day J-4).

#### Scenario: User says "do not use ~/.impeccable"

- GIVEN `~/.impeccable/bin/impeccable` exists and the user excludes `~/.impeccable`
- WHEN Step 0 runs and the user consents to a download into `IMPECCABLE_HOME=/tmp/x`
- THEN the probe never calls `~/.impeccable/bin/impeccable`, the download lands in `/tmp/x/bin/<VERSION>/`, and every later launcher call runs with `IMPECCABLE_BIN` pinned to it
- BUT it must NOT change the home variable for any call other than that one download call (A1, A1-W), and never for a call made after the pin
- AND IT MUST record the exclusion and the pinned path in the report

### FR-2: Verified skill copy (M2)

Step 0 SHALL, for the copy it selects:

- record its absolute path, and what `~` resolved to (the agent process's `HOME`, or `USERPROFILE` on Windows);
- when `UPSTREAM.md` is present, hash every listed file (`SKILL.md` with the `metadata:` block removed) and record `vendored (<version>, verified)` or `vendored (<version>, modified: <n> files: <first names>)`;
- list every other `impeccable/SKILL.md` found in the Step 0 locations with its version, never selecting it.

A `modified` copy still leads; the report states it as a finding about the environment, never as a design finding.

#### Scenario: Two copies, one stale

- GIVEN the copy beside the bridge is 4.8.0 and verifies, and `~/.claude/skills/impeccable` is 4.7.0
- WHEN Step 0 runs
- THEN the header reads `vendored (4.8.0, verified)` with the path, and lists `~/.claude/skills/impeccable (4.7.0)` as another copy
- BUT it must NOT select the 4.7.0 copy
- AND IT MUST show the resolved `HOME`

### FR-3: Declared viewports and a short-height first-visit pair (M3)

- Every viewport SHALL be `WxH`. A `docs/ux-ui/design.md` value with a width but no height is recorded as `incomplete (<value>)` and the default is used.
- The scan matrix keeps its two passes.
- The first-visit pass SHALL add the **short-height pair**, default `1366x768` and `375x667`, overridable in `docs/ux-ui/design.md`; the report records each value and its source.
- Without browser automation, the short-height captures read `Unevaluated (no browser automation)` like the others; `/akili-validate`'s manual fold check covers all four first-visit viewports.

#### Scenario: Laptop-height miss

- GIVEN a Persuade screen whose CTA sits at y=800–869 at every width
- WHEN the first-visit pass runs with defaults
- THEN the `1280x800` and `1366x768` results read `below fold`
- BUT it must NOT report the screen's first visit as passed on the strength of the `1280x800` pass alone
- AND IT MUST list each first-visit viewport with its source

### FR-4: First-visit outcomes and the primary CTA (M4)

- **CTA identification**, in order: a CTA declared for the screen in `docs/ux-ui/design.md` (the Screen Inventory's `Primary CTA` column: a selector or attribute); else, only when `docs/ux-ui/design.md` defines a Primary CTA style, the first element in `main` with that style; else the first `main a|button` (amendment A2, approved by JC 2026-10-31 after judgment-day J-3). The method used is recorded in *Capture conditions*; a non-declared CTA is listed under *Assumptions*.
- **Measurement:** visibility from computed style (`display`, `visibility`, `opacity`) plus the bounding box against the viewport; the hit-test at the box centre. Never `offsetParent`.
- **Outcomes** (amendment A2, approved by JC 2026-10-31 after judgment-day J-1): `pass` when the box centre is inside the viewport and the hit-test returns the CTA or one of its descendants; `covered (<topmost element>)` when the centre is inside the viewport and the hit-test returns an element that is neither the CTA nor its descendant; `below fold (y=<top>)` when the centre is at or below the viewport's bottom edge (a top at or below that edge included); `Unevaluated (no CTA found)`; `Unevaluated (CTA not visible: <style>)` when computed style hides it or its box has zero size.
- **Priority:** on a Persuade or Operate screen, `covered` and `below fold` at any first-visit viewport are **P1** in `/akili-audit design` and **FAIL** in `/akili-validate`, unless a *Design Waivers* row covers that screen and viewport.

#### Scenario: Below the fold, not covered

- GIVEN `/es/` at `375x667`, CTA at y=650, nothing over it after a scroll
- WHEN the pass runs
- THEN the outcome is `below fold (y=650)` and the finding is P1
- BUT it must NOT read `covered`, and it must NOT be counted as an overlay defect
- AND IT MUST record the CTA identification method

### FR-5: The consent banner must be seen (M5)

- When the product has a consent banner (named in `docs/ux-ui/design.md`, or found in the UI source), each first-visit capture SHALL assert it is visible.
- If it is not rendered, the capture reads `Unevaluated (consent banner not rendered: <reason>)` and the report names the remedy: a build that renders it with **test** identifiers, never production ones.
- The detector's first-visit flags SHALL count as banner evidence only where the browser capture confirmed the banner on screen; otherwise the report states that the detector pass added no first-visit evidence.

#### Scenario: Gate build without analytics IDs

- GIVEN a build whose banner renders only with analytics IDs, built without them
- WHEN the first-visit pass runs
- THEN every capture reads `Unevaluated (consent banner not rendered: …)`
- BUT it must NOT read `pass`
- AND IT MUST name the test-ID build as the remedy

### FR-6: Priority mapping (M6)

The reference SHALL keep AKILI's P1–P3 and add one mapping table: Impeccable P0 → P1 tagged `blocking`; P1 → P1; P2 → P2; P3 → P3. A finding that is both blocking and inaccessible stays one P1. The report's priority note cites the table.

#### Scenario: Critique returns a P0

- GIVEN Assessment A tags a finding P0
- WHEN the report is written
- THEN the finding appears under P1 with the `blocking` tag
- BUT it must NOT create a P0 section

### FR-7: Report-only suppression and Assessment A isolation (M7)

The bridge SHALL list, as *Suppressed in `/akili-audit design`*: critique's snapshot persistence (`.impeccable/critique/`), `live-server` and any inject, and the closing user questions. Assessment A SHALL run with no detector output in its context (an isolated subagent, or before E3 when run inline), so E3's order stays.

#### Scenario: Literal executor

- GIVEN an agent following `critique.md` inside `/akili-audit design`
- WHEN it reaches *Persist the Snapshot*
- THEN it skips it, citing the bridge list
- BUT it must NOT write `.impeccable/critique/` or start `live-server`
- AND IT MUST keep Assessment A free of detector output

### FR-8: Bounded return from a delegated critique (M8)

When E4 delegates, the brief SHALL require: the finding count stated first, findings returned as text in bounded parts, and no file output. The parent SHALL compare received findings to the stated count before writing; a shortfall is fetched, never silently dropped.

#### Scenario: Truncated notification

- GIVEN a subagent states 23 findings and the notification carries 17
- WHEN the parent checks
- THEN it requests the rest before writing the report
- BUT it must NOT write a report with 17 findings as if complete

### FR-9: Lighthouse from a fresh worktree; run validity by JSON (M9)

- E3b SHALL accept `npm ci` from the project's lockfile as resolving a **declared** devDependency, only with the consent the bridge's *Privacy and consent* requires, and recorded in the report.
- A run SHALL count as completed when its JSON exists, has no `runtimeError`, and has a performance score, whatever the exit code; the exit code and first stderr line are recorded.

#### Scenario: Exit 1 after a valid JSON

- GIVEN a run that exits 1 on `ENOTEMPTY` cleanup after writing a valid JSON
- WHEN runs are counted
- THEN it counts as completed and the footnote records the exit
- BUT a run whose JSON has a `runtimeError` must NOT count
- AND IT MUST never run `npm ci` without consent or when Lighthouse is not declared

### FR-10: Machine load beside each measurement (M10)

The *Performance* section SHALL record, at measurement time, the load average and the other listening development servers (port and process name) on the machine.

#### Scenario: Another preview is running

- GIVEN another `astro preview` listens on :4329
- WHEN Lighthouse runs
- THEN the section lists it with the load average
- BUT it must NOT omit the record when nothing else is listening (it reads `none`)

### FR-11: Clause IDs in the baseline; routed backfill (M11)

- The `/akili-constitution` design template SHALL give each approved clause a stable ID `<section>-<nn>`; *Proposed waiver* and *Design Waivers* rows cite it.
- E1 check 2 SHALL report a missing page-mode column, a missing *Design Waivers* list, or missing clause IDs as baseline drift routed to `/akili-constitution`, writing nothing. Without IDs, a proposed waiver cites `§<section> l.<line>`.

#### Scenario: Older baseline

- GIVEN a `design.md` with no page-mode column and no clause IDs
- WHEN E1 runs
- THEN `Page modes: drift`, the routing to `/akili-constitution`, and proposed waivers citing `§7 l.144`
- BUT it must NOT edit `design.md`

### FR-12: Template coverage (M12)

E2 SHALL choose the key screens so every distinct template in the UI source appears at least once while the cap allows; templates left out are listed in a `Coverage` header field as a declared risk. More screens only on request.

#### Scenario: 48 pages, 9 templates

- GIVEN 9 templates and the cap of 8
- WHEN E2 selects
- THEN 8 templates are covered and the ninth is named under `Coverage`
- BUT it must NOT leave the field empty when a template is uncovered

### FR-13: One report-location rule (M13)

`/akili-audit` design step 5 and its *Verification Checklist* SHALL accept the E6 user-directed path; "nothing outside `docs/specs/audits/`" SHALL carry the same exception.

#### Scenario: User-directed path

- GIVEN the user directs `/tmp/report.md`
- WHEN the checklist runs
- THEN it passes with `Report location: /tmp/report.md (directed by <who>)`
- BUT it must NOT also require a copy under `docs/specs/audits/`

### FR-14: Bounded `false positive` value (M14)

The bridge SHALL add the value `false positive (<reason>; <evidence>)` to *Detector Results*, allowed only for rules on a closed list in the bridge, initially `text-occlusion` where the occluded text is inside `aria-hidden="true"`. Such rows are counted in a `False positives: N` header line and never appear among P1–P3. Any other rule needs a waiver or stays a finding.

#### Scenario: Decorative cards

- GIVEN 96 `text-occlusion` hits, all inside `aria-hidden="true"` cards
- WHEN E5 classifies them
- THEN they read `false positive (decorative, aria-hidden; <selector>)` and the header counts them
- BUT a `low-contrast` hit must NOT be classed `false positive`
- AND IT MUST require evidence that the subtree is `aria-hidden`

### FR-15: Upstream request draft

The spec folder SHALL hold `upstream-request.md` with three reproducible items: launcher order (M1), detector first-visit flags ignoring custom banners (M5b), `aria-hidden` occlusion (M14). It is a draft; nothing is filed.

### FR-16: Restatements stay in step

Every shipped restatement of a changed rule SHALL match it: `akili-validate.md:144`, `docs/skills/impeccable-bridge.md`, `docs/skills/impeccable.md`, and the `CHANGELOG.md` `Unreleased` entry, which counts 14 audit gaps plus the installer item handled by the sibling.

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | No byte under `.claude/skills/impeccable/` changes; `test/impeccable-vendor.test.js` stays green |
| NFR-2 | Single owner: detector, viewport, first-visit, suppression and waiver rules live in the bridge; the reference and the commands point at them. No command restates a bridge command string (existing test at `test/impeccable-bridge.test.js:102-105`) |
| NFR-3 | No new download or install path without consent, in any approval mode |
| NFR-4 | One text-contract assertion per new `SHALL`, `BUT` and `AND IT MUST` clause, each with a mutation that turns it red |
| NFR-5 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` pass |

### Defect classes and their gates

| Defect class | Gate |
|---|---|
| A required clause missing from the shipped text | Text-contract tests (NFR-4), plus the Reviewer's term-by-term walk (KZ-changes--gate-falsifiability-2) |
| A superseded phrasing surviving elsewhere | A phrase-family sweep keyed on each obligation before review, plus a sweep test for retired strings (KZ-changes--kaizen-loop-closure-2) |
| An edit to the vendored copy | `test/impeccable-vendor.test.js` |
| A bridge command string restated in a command | Existing test, `test/impeccable-bridge.test.js:102-105` |
| A rule an agent cannot follow, or that gives a different verdict than intended | **No automated check.** Substitute: at `/akili-validate`, a walkthrough of the 2.40.0 audit's scenarios against the shipped text, plus one held-out case the text does not cite, at the HITL pause |
| A CHANGELOG or doc clause that overstates the shipped text (KZ-002) | Quote-check of each clause at HEAD by the Reviewer; counts re-run after each phase that adds tests |

## 8. Requirement ID Index

| ID | Gap | Owner file(s) |
|---|---|---|
| FR-1 | M1 | bridge |
| FR-2 | M2 | bridge |
| FR-3 | M3 | bridge, `akili-validate.md` |
| FR-4 | M4 | bridge |
| FR-5 | M5 | bridge |
| FR-6 | M6 | reference |
| FR-7 | M7 | bridge, reference E4 |
| FR-8 | M8 | reference E4 |
| FR-9 | M9 | reference E3b |
| FR-10 | M10 | reference E3b, template |
| FR-11 | M11 | `akili-constitution.md`, reference E1 |
| FR-12 | M12 | reference E2, template |
| FR-13 | M13 | `akili-audit.md`, reference checklist |
| FR-14 | M14 | bridge, reference template |
| FR-15 | M1, M5b, M14 | `upstream-request.md` |
| FR-16 | — | docs, CHANGELOG, `akili-validate.md` |
| NFR-1 to NFR-5 | — | all |
