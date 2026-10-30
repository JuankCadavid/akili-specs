# Requirements: Harden the Impeccable integration

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-hardening` |
| Depth | **Standard**. Methodology text across one skill, one reference, five commands, two docs pages and one test file. There is no CLI or installer code, but every design evaluation and UI validation gate reads this text |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | `gated`. The maintainer instructed on 2026-10-30 10:38: "Continúa con /akili-specify changes/impeccable-hardening y detente en su gate de aprobación". This run stops at the Phase 1 gate (Step 1.3) |
| Status | Phase 1: awaiting approval |
| Date | 2026-10-30 |
| Proposal | `proposal.md`, **Approved** 2026-10-30 10:38 (UTC-5). Q1: `/akili-validate` requires the first-visit pass. Q2: no performance gate in `/akili-validate`. Q3: mobile viewport `390x844` by default, overridden by `docs/ux-ui/design.md`. Q4: `changes/impeccable-design` archived first (done, `b6575d8`) |
| Source | `~/akili-audits/2026-10-30-akili-web-design.md` (gaps G1–G12 and the report body). The Jira/Figma questions were skipped, with maintainer confirmation |
| Format source | `docs/specs/archive/2026-10-26-changes--akili-review/requirements.md`. This repo has no `docs/specs/general-setup/` (`ls docs/specs/general-setup` → `No such file or directory`, as run 2026-10-30) |
| Verified at | `b6575d8` |
| Release | Behavior change to an existing skill and commands, with no new command → **patch** (semver discipline), recorded only. No release, push, PR or publish in this cycle |

## 2. Executive Summary

The bridge and its consumers get rules that match what the first real run met. The key changes:

- Detection records the skill and the detector separately, giving four states.
- The detector is invoked one way only, and that way never installs.
- Exit `1` is `Unevaluated` whatever caused it.
- Every URL is scanned at desktop and mobile width. Persuade and Operate screens also get a first-visit pass that keeps consent banners and overlays on the page.
- Design mode adds a multi-run Lighthouse step and a stale-baseline check.
- The report template gains fields that keep exclusions, waivers and score provenance visible.

`/akili-validate` gains the mobile and first-visit passes, but no performance gate.

## 3. Glossary

| Term | Meaning |
|---|---|
| Skill probe | The bridge's search for the Impeccable skill (project, global and plugin locations) |
| Detector probe | The bridge's check that the Impeccable detector CLI runs without installing anything |
| Resolution source | Where the detector probe found the CLI: `project` (the project's `node_modules/.bin`), `PATH`, or `npx cache` |
| Resolved invocation | The exact command prefix the detector probe succeeded with. Every detector run in the same phase reuses it |
| Scan matrix | The set of detector passes per URL: `desktop`, `mobile`, and, for Persuade/Operate screens, `first-visit` |
| First-visit pass | A URL scan in a fresh browser context with no stored consent, with consent banners and overlays kept on the page, plus a fold screenshot and a primary-CTA hit-test |
| Primary CTA | The single main action of a Persuade or Operate screen, as named in `docs/ux-ui/design.md` or the spec's `design.md`, or inferred and listed under *Assumptions* |
| Capture conditions | Browser locale, reduced-motion setting, viewport and consent state of a pass |
| Design Waiver | A row in `docs/ux-ui/design.md` → *Design Waivers* that approves a detector finding as intended |
| Proposed waiver | A finding that design mode judges to match an approved pattern that has no *Design Waivers* row. Design mode is report-only, so it proposes the row instead of writing it |
| Report-only mode | `/akili-audit design`: it writes only its report under `docs/specs/audits/` (or a recorded user-directed path) |
| Unevaluated | A check that did not produce a usable reading. It is never a pass |

## 4. System Context & Scope

Today (at `b6575d8`):

| Fact | Evidence (as run) |
|---|---|
| Detection has three states, and `absent` is defined as "neither found" | `.claude/skills/impeccable-bridge/SKILL.md` *Step 0 — Detection*, state table |
| The detector consequence of `absent` and of the fallback section is `Unevaluated (Impeccable absent)`, regardless of the detector probe | `SKILL.md` *Fallback behavior*; `.claude/commands/akili-audit.md` *Design Evaluation Mode* item 4; `.claude/commands/akili-validate.md` *UI design review*, closing paragraph |
| The probe uses `npx --no-install impeccable --version`; the gate uses `DO_NOT_TRACK=1 npx impeccable detect --json` | `SKILL.md` *Step 0* (Detector CLI row) vs *Detector gate*; the same gate string appears in `akili-audit.md`, `akili-validate.md`, `akili-test.md`, `docs/skills/impeccable-bridge.md` and `docs/commands/akili-audit.md` (`grep -rn "npx impeccable detect" .claude docs` excluding `docs/specs/`, run 2026-10-30) |
| `npx --no-install <missing package>` exits `1`, the same code the detector uses for "could not scan" | `npx --no-install definitely-not-a-pkg-xyz --version` → exit 1 (run 2026-10-30, macOS, npm bundled with the local Node) |
| Detector 4.8.0 supports `--viewport <WxH>` (default `1280x800`), `--no-consent-hiding`, `--no-overlay-hiding`, `--no-design-system`; exit `1` takes precedence in a partial multi-target scan | `DO_NOT_TRACK=1 npx --no-install impeccable detect --help`, impeccable `4.8.0` from this machine's npx cache (run 2026-10-30) |
| `/akili-constitution` and `/akili-specify` route on "`installed` or `skill only`" vs "`absent`" | `.claude/commands/akili-constitution.md` *Lead design skill* bullets; `.claude/commands/akili-specify.md` Step 2.1 bullets |
| Constitution records *Design Waivers* as "(rule, reason, who approved)" | `akili-constitution.md` paragraph after *Lead design skill* |
| E0–E7 have no performance step, no staleness check and no viewport or overlay instruction | `.claude/skills/impeccable-bridge/references/design-evaluation.md` *Steps* |
| The text-contract test pins the literal `npx impeccable detect --json` | `test/impeccable-bridge.test.js`, test "FR-3/FR-4: detection states …" |

**In scope:** proposal §5 (bridge skill, design-evaluation reference, five commands, two docs pages, tests, CHANGELOG `Unreleased`).
**Out of scope:** proposal §6 *Non-Goals*. Specifically: CLI/installer code, any akili.com.co fix, upstream Impeccable changes, any write by design mode outside its report, a performance gate in `/akili-validate` (Q2), PSI/CrUX integration, and the root `AGENTS.md` *Skill Usage* line (recorded as kaizen pending item P3 of `changes--impeccable-design`, so not taken into this spec).

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| Agent running `/akili-audit design` | One unambiguous state, one command form, and a fixed pass list, so no step requires improvising |
| Agent running `/akili-validate` on a UI spec | A gate that sees what a first-time mobile visitor sees and that never passes on an unusable reading |
| Project owner | No package download without consent; exclusions and approved patterns respected; numbers that can be compared between runs |
| AKILI maintainer | One rule set across the skill, commands and docs, with tests that fail if an old phrasing returns |

## 6. Functional Requirements

### FR-1: Two independent probes, four detection states

The bridge SHALL record the skill probe and the detector probe separately and derive exactly one of four states:

| State | Skill probe | Detector probe | Routing | Detector consequence |
|---|---|---|---|---|
| `installed` | found | found | Impeccable leads | gate active |
| `skill only` | found | not found | Impeccable leads | rows `Unevaluated (detector unavailable)` |
| `detector only` | not found | found | fallback (`ui-ux-pro-max` catalog + `frontend-design` + `stitch-design`) | gate active |
| `absent` | not found | not found | fallback | rows `Unevaluated (detector unavailable)` |

Routing SHALL follow the skill probe only, and the detector consequence SHALL follow the detector probe only. Install routes are printed once when the skill probe fails, with no install performed.

#### Scenario: Cached CLI without the skill

- GIVEN no Impeccable skill in any probed location
- AND the detector probe succeeds from the npx cache
- WHEN any phase runs Step 0
- THEN the recorded state is `detector only`
- AND the fallback skills lead
- AND the detector gate runs
- BUT it must NOT record `absent` or mark detector rows `Unevaluated (Impeccable absent)`

#### Scenario: Skill without CLI

- GIVEN the skill is found and the detector probe fails
- WHEN Step 0 runs
- THEN the state is `skill only`, Impeccable leads, and detector rows read `Unevaluated (detector unavailable)`

**Consumers.** Every command that branches on the state (`/akili-constitution`, `/akili-specify`, `/akili-audit design`, `/akili-validate`, `/akili-test`) SHALL state what `detector only` does there. A step written for three states MUST NOT leave `detector only` to a fall-through.

### FR-2: Reproducible detector resolution

The detector probe SHALL try, in order: the project's `node_modules/.bin/impeccable`; `impeccable` on `PATH`; `npx --no-install impeccable`. It SHALL record the resolution source, the version, and the resolved invocation.

- A resolution from the npx cache alone SHALL be recorded as valid for this run and flagged `non-reproducible (npx cache)`, with the install routes printed for a durable setup.
- Every detector run in the same phase SHALL use the resolved invocation.
- Detection results SHALL NOT be persisted or reused across runs or phases. Each phase probes again.

#### Scenario: Resolution recorded

- GIVEN the CLI is resolvable only through the npx cache
- WHEN Step 0 runs
- THEN the report records `Detector: 4.8.0 via npx cache (non-reproducible)` (or equivalent wording with source and version)
- AND IT MUST name the resolved invocation that later passes reuse

### FR-3: The detector is never invoked in a form that can install

Every detector invocation the package prescribes SHALL use the resolved invocation from FR-2. When that invocation is `npx`, it SHALL be `npx --no-install`. Every run SHALL be prefixed with `DO_NOT_TRACK=1` unless the user opted in to telemetry.

- The package MUST NOT contain a prescribed detector or Lighthouse command of the form `npx impeccable …` or `npx lighthouse …` without `--no-install`. The printed install routes (`npx impeccable install`, `npx impeccable update`) are the only exception: they are printed for the user and never run without consent.

#### Scenario: Package missing

- GIVEN the CLI is not in any resolution location
- WHEN a phase reaches the detector gate
- THEN no command that downloads a package runs
- AND the detector rows read `Unevaluated (detector unavailable)`

### FR-4: Exit codes and `Unevaluated`

The gate SHALL read exit codes as follows:

| Exit | Reading |
|---|---|
| `0` | pass |
| `2` | fail, unless every primary finding is fixed or waived (FR-9). If all are waived, it passes, and the report lists each waiver |
| `1` | `Unevaluated`, never a pass, whatever the cause: an unreachable target, a partial multi-target scan, a missing package under `--no-install`, or an unknown flag on an older detector |
| any other | `Unevaluated` |

- The report SHALL record the first line of stderr for every non-zero exit other than `2`.
- Findings returned alongside an exit `1` SHALL be reported, but the pass reads `Unevaluated`.

#### Scenario: Partial scan

- GIVEN a scan of 6 URLs where one URL times out and five return findings
- WHEN the detector exits `1`
- THEN the pass is `Unevaluated` with the stderr line recorded, and the five URLs' findings are still listed
- BUT it must NOT be reported as a fail-with-findings or as a pass

### FR-5: Desktop and mobile passes for every URL

Every detector URL scan, in `/akili-audit design` and in `/akili-validate`'s design gate, SHALL run a `desktop` pass (detector default, `1280x800`) and a `mobile` pass (`--viewport <mobile>`).

- `<mobile>` SHALL be the mobile viewport declared in `docs/ux-ui/design.md` when it declares one, otherwise `390x844` (Q3). The report records which value was used and where it came from.
- `/akili-test`'s detector suite SHALL plan the same two passes.
- Source-path scans take no viewport and stay a single pass.

#### Scenario: Mobile finding only

- GIVEN a page whose tap targets fail only below 400 px width
- WHEN design mode or the validate gate scans it
- THEN the mobile pass reports the finding
- AND a desktop-only result MUST NOT be presented as the page's verdict

### FR-6: First-visit pass for Persuade and Operate screens

For every screen whose page mode is Persuade or Operate, `/akili-audit design` and `/akili-validate`'s design gate (Q1) SHALL run a `first-visit` pass at both viewports from FR-5:

1. A detector URL scan with `--no-consent-hiding --no-overlay-hiding`.
2. A fresh browser context with no stored consent or cookies.
3. A fold screenshot and a hit-test at the center of the primary CTA. The pass fails when the topmost element at that point is not the CTA or a descendant of it.

- Capture conditions (locale, reduced motion, viewport, consent state) SHALL be recorded for every pass.
- When no browser automation is available for the screenshot and the hit-test, those two checks read `Unevaluated (no browser automation)`, and the detector part of the pass still runs.
- When the detector rejects either flag (an older version), the detector part of the pass reads `Unevaluated (detector <version> lacks <flag>)`.

#### Scenario: CTA covered by consent banner (the 2026-10-30 P1)

- GIVEN a Persuade home page whose hero CTA is covered by a consent banner on first visit at 390×844
- WHEN the first-visit pass runs
- THEN the hit-test at the CTA center returns the banner, and the pass reports a P1 (design mode) or a FAIL (validate)
- BUT the default (consent-hiding) passes alone MUST NOT be presented as covering the first visit

#### Scenario: Read screen

- GIVEN a screen whose page mode is Read
- WHEN design mode runs
- THEN no first-visit pass is required, and the report says so for that screen

### FR-7: Performance step (design mode only)

`/akili-audit design` SHALL add a performance step for each URL target:

- **Resolution.** Resolve Lighthouse without installing, in the same order as FR-2 (project bin, `PATH`, `npx --no-install`). If it does not resolve, the step reads `Unevaluated (Lighthouse unavailable)`.
- **Runs.** At least **3** mobile runs per URL, reporting the median and the range (min–max) of the performance score and LCP.
- **Spread.** When the range is wider than the difference any recommended fix is expected to make, the report says the number cannot serve as a baseline or gate.
- **Concurrency.** The step SHALL NOT run while a delegated agent is active (AGENTS.md *Concurrency*).
- `/akili-validate` SHALL NOT gain a performance gate in this spec (Q2).

#### Scenario: Bimodal score

- GIVEN three runs scoring 92, 89 and 64
- WHEN the step reports
- THEN it shows median 89 and range 64–92
- BUT it must NOT report a single run's score as the page's score

### FR-8: Baseline checks at context time (E1)

When `docs/ux-ui/design.md` exists, design mode SHALL, before reviewing screens:

1. **Staleness.** Compare the last commit date of `docs/ux-ui/design.md` with the newest commit touching the UI source directories. When the UI is newer, the report header SHALL carry `Baseline possibly stale` with both dates and the newer UI commits (up to 5).
2. **Page modes.** When the Screen Inventory has no page-mode column, or a screen in scope has no mode, flag it as baseline drift, and list the inferred modes under *Assumptions*.
3. **Derived context.** When root `PRODUCT.md`/`DESIGN.md` are absent, note that the detector ran without design-system context, and that design-system rules (e.g. `overused-font`) may report patterns the authority approves.
4. **Non-git.** When the target has no git history, the staleness check reads `Unevaluated (no git history)`.

#### Scenario: Redesign after the baseline

- GIVEN `docs/ux-ui/design.md` last committed 2026-10-17 and a hero redesign committed 2026-10-28
- WHEN design mode runs E1
- THEN the report header shows `Baseline possibly stale (design.md 2026-10-17; UI 2026-10-28)` with the redesign commit listed

### FR-9: Approved exceptions (Design Waivers)

`docs/ux-ui/design.md` → *Design Waivers* rows SHALL carry: rule id, scope (selector, file or value), reason, approver, and date. `/akili-constitution` SHALL write new rows in that shape.

- Every mode SHALL match detector findings against these rows. A match is reported as `waived (design.md)`, not as a defect. A waiver whose scope matches nothing in the run SHALL be listed as `unused`.
- In report-only mode, a finding that matches a pattern the authority approves but that has no waiver row SHALL be reported as `Proposed waiver` with the authority clause cited, and never written.
- Upstream ignores (`.impeccable/config.json`, inline `impeccable-disable`) remain valid waivers when they carry a reason.

#### Scenario: Approved rounded top border

- GIVEN `design.md` approves rounded top borders on colored cards (A-06) and has no *Design Waivers* row for `border-accent-on-rounded`
- WHEN design mode reports detector results
- THEN those findings show `Proposed waiver (A-06)`
- BUT they must NOT be counted as P1–P3 defects
- AND IT MUST NOT write the waiver row

### FR-10: Report template fields

The design-evaluation report template SHALL add:

| Field | Content |
|---|---|
| Out of scope | Sections or screens the owner excluded, with the detector hits inside them counted by rule id. They are never dropped silently |
| Score source | `Impeccable critique` or `fallback checklist`. Fallback scores MUST NOT be trended against Impeccable scores |
| Detector | State, resolution source and version, resolved invocation, and the scan-matrix table (pass × URL → exit, finding count) |
| Capture conditions | Per pass (FR-6) |
| Performance | The FR-7 table, or `Unevaluated (<reason>)` |
| Baseline | The FR-8 result |
| Report location | The default path, or a user-directed path with who directed it |
| Detector Results `Waived?` column | Values `no`, `waived (design.md)`, `waived (upstream ignore)`, `Proposed waiver (<clause>)`, `out of scope` |

The design-mode checklist SHALL accept a recorded user-directed report location in place of `docs/specs/audits/`.

### FR-11: One rule set across consumers

The bridge SHALL own the rules of FR-1 to FR-6 and FR-9, and the design-evaluation reference SHALL own FR-7, FR-8 and FR-10. Commands and docs SHALL point at the bridge rather than restate its command strings. Where a command or doc names a state, a command form or an `Unevaluated` reason, it MUST match the bridge.

#### Scenario: No surviving old phrasing

- GIVEN the shipped package
- WHEN `npx impeccable detect` (without `--no-install`) and `Unevaluated (Impeccable absent)` are searched across `.claude/` and `docs/` (excluding `docs/specs/`)
- THEN there are zero hits

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Nothing in the package installs, downloads or updates Impeccable, Lighthouse or a browser without explicit user consent |
| NFR-2 | Impeccable stays unvendored; no upstream rule text is reproduced (`changes/impeccable-design` NFR-1 stands) |
| NFR-3 | The rules are version-tolerant: a missing flag or capability on a different detector version yields `Unevaluated` with the reason, never a silent pass |
| NFR-4 | Command prose never points at a rule by line number (KZ-005) |
| NFR-5 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` pass; no test depends on `docs/specs/changes/<this spec>` (KZ-changes--archify-diagrams-1) |
| NFR-6 | Cost stays bounded: the 8-screen cap stands, first-visit passes are limited to Persuade/Operate screens, and Lighthouse runs on mobile only by default |
| NFR-7 | Docs and CHANGELOG are in English; aggregate claims ("every invocation …") are falsified by grep before they are written (KZ-002) |

## 8. Defect Classes and Gates

| Defect class | Gate |
|---|---|
| An old phrasing survives (installing command form, `Impeccable absent` reason, three-state list) | A negative text-contract test over `.claude/` and `docs/`, plus a sweep keyed on each superseded phrase and its paraphrases before Review (KZ-changes--kaizen-loop-closure-2) |
| A consumer branches on three states and leaves `detector only` to a fall-through | A text-contract test per consuming command for the `detector only` wording, plus a Reviewer walk of each state-branching step |
| Two surfaces state contradictory rules (bridge vs command vs doc) | Reviewer conformance against FR-11 |
| A prescribed flag or exit code does not exist in the real tool | The Premise Ledger rows verified against `detect --help` (4.8.0); NFR-3 covers other versions |
| A rule is not executable by an agent on a real project | **No automated gate in this repo.** Substitute: a validate-time walkthrough that re-walks the 2026-10-30 run against the shipped text, plus at least one **held-out** case the text does not cite (e.g. `skill only` on a project without `design.md`), judged at the HITL pause |
| Live behavior on a real UI project | **Accepted risk**: not testable in this repository. Recorded for the next real `/akili-audit design` run |

## 9. Requirement ID Index

| ID | Title | Gaps covered |
|---|---|---|
| FR-1 | Two probes, four states | G1, G3 |
| FR-2 | Reproducible resolution | user gap 10, C5 |
| FR-3 | Never install | G2, user gap 8 |
| FR-4 | Exit codes | user gap 2 |
| FR-5 | Desktop + mobile | G4, Q3 |
| FR-6 | First-visit pass | G5, C14, Q1 |
| FR-7 | Performance step | G7, C15, Q2 |
| FR-8 | Baseline checks | G6, G8, G12 |
| FR-9 | Design Waivers | G9, user gap 9 |
| FR-10 | Template fields | G10, G11, C16 |
| FR-11 | One rule set | all |
| NFR-1..7 | — | — |
