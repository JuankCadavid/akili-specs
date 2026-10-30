# Proposal: Harden the Impeccable integration (bridge, `/akili-audit design`, `/akili-validate` design gate)

**Answer first:** the first real dogfooding run of `/akili-audit design` (akili.com.co, 2026-10-30) found that the methodology, followed literally, would have missed the site's top P1, could have installed a package without consent, and had no state for the setup it actually met. This change closes those gaps in one bounded spec. It splits detection into two independent probes (skill, detector), pins one detector command that never installs, and requires a mobile pass and a first-visit pass with overlays left visible. It adds a multi-run Lighthouse step and a stale-baseline check, and gives the report template fields for scope, waivers and score provenance. The change is prompt-, skill-, docs- and test-only, with no CLI or installer code.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-hardening`. Slug derived from the free-text argument; it matches the worktree name |
| Type | Change. It hardens a shipped feature against gaps found in use. Only one gap (implicit install, G2) is a defect in the strict sense, and its fix is a one-token command change, so it does not justify a separate Bug Track |
| Deliverable | software (methodology prompts, packaged skill, docs, tests) |
| Approval Mode | gated |
| Status | **Approved**: Juan Carlos Cadavid, 2026-10-30 10:38 (UTC-5, Bogotá), with the recommendations: Q1 yes, Q2 no, Q3 `design.md` override with `390x844` default, Q4 yes (archive `changes/impeccable-design` first) |
| Requested by | Juan Carlos Cadavid (maintainer), 2026-10-30 |
| Source | `~/akili-audits/2026-10-30-akili-web-design.md`: the design evaluation of `https://akili.com.co`, in particular *Methodology flow notes* → *Gaps in akili-specs found during this run* (12 gaps, cited below as G1–G12) |
| Source questions | Requirement source and visual source were both supplied by the brief (the report; no UI in this repository). The Jira/Figma questions were not asked. Under `gated` mode this is logged rather than silently skipped; **confirmed by the maintainer at approval** (2026-10-30 10:38) |
| Visual | None (no UI in this repository) |
| Depends on | `changes/impeccable-design`, shipped in v2.39.0 (`CHANGELOG.md` `## [2.39.0]`) and archived 2026-10-30 to `docs/specs/archive/2026-10-30-changes--impeccable-design/` (Q4) |
| Parallel-safe | yes with `mcp-separation` and `review-intensity-trial-terms`, except the shared `CHANGELOG.md` `Unreleased` block |
| Branch | `JuankCadavid/impeccable-hardening` (worktree at `c268314`, equal to `origin/dev`), local only: no push, no PR, no publish |

## 2. Intent

A design evaluation or design gate run by AKILI should see what a first-time visitor sees, on the phone they use, and never install anything to do it. It should report the exact state it found and keep its numbers comparable across runs.

## 3. Problem / Current Behavior

| # | Current behavior | Citation | Gap |
|---|---|---|---|
| C1 | Detection has three states: `installed` (skill **and** detector), `skill only`, and `absent` (**neither**). No state covers "detector available, skill absent". The run hit that case: no skill, CLI 4.8.0 resolved from the npx cache | `.claude/skills/impeccable-bridge/SKILL.md:40-44`; report *Impeccable-bridge detection state* | G1 |
| C2 | The `absent` state and the fallback section mark detector rows `Unevaluated (Impeccable absent)` even when the detector probe succeeded, so the skill probe overrides the detector probe | `SKILL.md:44`, `:101`; `.claude/commands/akili-audit.md:141`; `.claude/commands/akili-validate.md:140` | G3 |
| C3 | The detection probe uses `npx --no-install`, but the gate command is plain `npx impeccable detect`, which downloads the package into the npx cache when it is missing. That contradicts "install nothing without consent" | probe `SKILL.md:36`; gate `SKILL.md:82`, `akili-audit.md:141`, `akili-validate.md:137`, `.claude/commands/akili-test.md:189`, `docs/skills/impeccable-bridge.md:34`; consent rule `SKILL.md:44`, `:97` | G2 |
| C4 | Exit `1` is defined as `Unevaluated`, but nothing says that `npx --no-install` *also* exits `1` when the package is missing, or that exit `1` overrides findings in a partial multi-target scan | `SKILL.md:88`; ran `npx --no-install definitely-not-a-pkg-xyz --version` → exit 1; `impeccable detect --help` (4.8.0): "Operational failure takes precedence when a multi-target scan is partial" | G2 |
| C5 | Detection result depends on the machine's npx cache: `npx --no-install impeccable --version` succeeded only because an earlier session had cached it (`~/.npm/_npx/1a4eb60c8f6b0f89/`). `which impeccable` failed. The state is not reproducible across machines or after a cache clean, and the report does not record where the CLI resolved from | report *Impeccable-bridge detection state* probe table; `SKILL.md:36` | user gap 10 |
| C6 | No mobile pass. The detector defaults to 1280×800 and no step asks for `--viewport`, even though the project's `design.md` rates Mobile 375 as Critical. The run's mobile pass (390×844) found a different finding set (142 vs 208) | `SKILL.md:82`; `design-evaluation.md:12` (E3); `detect --help`: `--viewport <WxH> (default 1280x800)`; report *Detector commands run* rows 3–4 | G4 |
| C7 | URL scans hide consent managers and overlays by default. That hid the top P1: on first visit the primary CTA was covered by stacked consent, language-hint and voice-widget overlays. The P1 came from screenshots, not from any methodology step | `detect --help`: `--no-consent-hiding`, `--no-overlay-hiding`; report *Detector blind spot* and the P1 *Primary CTA hidden behind stacked overlays* | G5 |
| C8 | No performance step. E0–E7 never run Lighthouse or Core Web Vitals. The run found a bimodal score (64–92 for the same build), so a single run is not a usable baseline | `design-evaluation.md:7-16`; report P2 *EN home mobile Lighthouse 71* | G7 |
| C9 | E1 reads `docs/ux-ui/design.md` but never checks its age against UI changes. The baseline predated a hero redesign by 11 days, and its typography and H1 drift surfaced only late | `design-evaluation.md:10`; report header *Design source of truth* | G12 |
| C10 | The report template has no field for owner-scoped exclusions, so excluded detector hits are either reported as defects or dropped silently | `design-evaluation.md:28-70`; report header *Out of scope by request* | G11 |
| C11 | Approved patterns are flagged as defects on every run (`border-accent-on-rounded` approved by `design.md` A-06; `overused-font`). Design mode is report-only and cannot write waivers, and the template has no *Proposed waiver* column. The derived root `DESIGN.md` that the detector loads was absent, so the detector also ran with no design context | `SKILL.md:63`, `:87`; `detect --help`: "--no-design-system  Do not load local DESIGN.md"; report *Detector Results* "Waived?" column | G8, G9 |
| C12 | The bridge requires one page mode per screen in `design.md`, but nothing flags a baseline that has no page-mode column. The run had to infer all six modes | `SKILL.md:73`; `design-evaluation.md:76`; report *Assumptions* | G6 |
| C13 | The template's *Critique score* is an Impeccable heuristic score when Impeccable is installed and a subjective checklist judgement in the fallback, but it carries no field saying which | `design-evaluation.md:36`, `:43`; report *Assumptions* (last bullet) | G10 |
| C14 | Capture conditions that change results are not recorded: browser locale (the language hint showed only for a mismatched locale), reduced motion (desktop contrast hits on a mid-animation fan) | report *Assumptions* bullets 3–4 | report body |
| C15 | Supporting tools (Lighthouse, Playwright) have no resolution rule. `npx --no-install lighthouse` exited 1, and the run used the target project's local binary instead | report *Detector commands run* → supporting tools | report body |
| C16 | The run wrote its report to a user-directed path instead of `docs/specs/audits/`. The checklist assumes the default path, and there is no field recording an override | `design-evaluation.md:15`, `:74`; report header *Report location* | report body |

## 4. Proposed Outcome

1. **Two independent probes, four states.** Detection records the skill and the detector separately: `installed` (both), `skill only`, `detector only` (new), `absent` (neither). Routing follows the skill probe: Impeccable leads, or the fallback skills lead. The detector consequence follows the detector probe: the gate is active, or its rows read `Unevaluated (detector unavailable)`. `detector only` means fallback skills plus an active detector gate.
2. **One detector command that never installs.** Every detector invocation in the package reads `DO_NOT_TRACK=1 npx --no-install impeccable detect --json …`. Exit `1` is always `Unevaluated`, never a pass, whether the cause is an unreachable target, a partial scan or a missing package. The report records the first stderr line.
3. **Reproducible detection.** The probe records *where* the CLI resolved from (project `node_modules/.bin`, `PATH`, or npx cache) and its version. A resolution from the npx cache alone is valid for the run but is flagged non-reproducible. Every gate run in the same phase uses the invocation the probe resolved. Detection results are never persisted between runs.
4. **Scan matrix per URL.** Desktop (default 1280×800) **and** mobile (`--viewport 390x844`) passes are mandatory. Persuade and Operate screens also get a **first-visit pass** with `--no-consent-hiding --no-overlay-hiding`, in a fresh browser context, with no consent stored. A fold screenshot plus a hit-test at the primary CTA's center confirms the CTA is not covered. Locale and reduced-motion settings are recorded as capture conditions.
5. **Performance step (design mode).** When a URL target exists and Lighthouse resolves without installing, run it **≥ 3 times per URL** (mobile) and report the median and the range of score and LCP. A single run is never used as a gate or a baseline. Without Lighthouse the step reads `Unevaluated (<reason>)`, and nothing is downloaded.
6. **Stale-baseline check.** E1 compares the last commit date of `docs/ux-ui/design.md` with the newest commit touching the UI source directories. When the UI is newer, the report header flags *Baseline possibly stale* and lists the newer UI commits, so drift is read with that caveat up front. A missing page-mode column and missing derived `PRODUCT.md`/`DESIGN.md` are flagged in the same step.
7. **Approved exceptions instead of recurring false positives.** Detector findings that match a `docs/ux-ui/design.md` *Design Waivers* row count as waived in every mode. In report-only design mode, a finding that matches an approved pattern with no waiver row is shown as a *Proposed waiver*. A finding is a defect only if neither applies. The waiver row gets a minimal schema (rule id, scope or value, reason, approver, date).
8. **Report template fields:** *Out of scope* (with excluded hits counted, never dropped), *Score source* (`Impeccable critique` vs `fallback checklist`), *Capture conditions*, *Report location* (default, or user override recorded), a *Proposed waiver* column, the scan-matrix table, and the performance table.
9. **The same rules reach every consumer:** the bridge, `design-evaluation.md`, `/akili-audit design`, the `/akili-validate` design gate, the `/akili-test` detector suite, the `/akili-constitution` and `/akili-specify` state lists, the docs pages, and the text-contract tests.

## 5. Scope

| In scope | Files (expected) |
|---|---|
| Detection states, CLI resolution, gate command, exit codes, scan matrix, waiver matching, privacy | `.claude/skills/impeccable-bridge/SKILL.md` |
| E-steps (stale check, page-mode and derived-file checks, scan matrix, performance step) and report template fields | `.claude/skills/impeccable-bridge/references/design-evaluation.md` |
| Command wiring (state names, command string, `Unevaluated` wording) | `.claude/commands/akili-audit.md`, `akili-validate.md`, `akili-test.md`, `akili-constitution.md`, `akili-specify.md` |
| User docs | `docs/skills/impeccable-bridge.md`, `docs/commands/akili-audit.md` (and any other page the superseded-phrasing sweep finds) |
| Tests | `test/impeccable-bridge.test.js`: text contracts for the four states, `--no-install`, the scan matrix, the performance step and the template fields; no test pinned to `docs/specs/changes/…` (KZ-changes--archify-diagrams-1) |
| Release notes | `CHANGELOG.md` `Unreleased` |

## 6. Non-Goals

- No CLI, installer or `bin/` code; AKILI still never installs, vendors or pins Impeccable or Lighthouse.
- No fix to akili.com.co itself; its P1–P3 findings belong to that project's own specs.
- No change to Impeccable upstream (flags, exit codes, rule catalog).
- Design mode stays report-only: it writes no waiver rows, no derived `DESIGN.md`, no `.impeccable/config.json`.
- No performance gate in `/akili-validate` in this spec (see Open Question Q2).
- No PageSpeed Insights / CrUX integration beyond noting it as optional evidence when reachable.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Users running `/akili-audit design` | More passes per URL (2–3 detector passes, 3 Lighthouse runs): longer runs, much better coverage |
| UI-heavy specs at `/akili-validate` | Mobile and first-visit passes join the design gate. A spec that passed on desktop alone may now fail on a covered CTA |
| `/akili-test` design-detector suite | Same command and matrix; still evidence-only |
| Projects without Impeccable but with a cached CLI | Now recorded as `detector only`, and the gate runs instead of a contradictory `absent` |
| `changes/impeccable-design` | Its FR-3/FR-4 text contracts (`test/impeccable-bridge.test.js:24-31`) assert the literal `npx impeccable detect --json`. These are amended, not deleted |

## 8. Visual Reference

- Source: None
- Location: n/a
- Notes: methodology text change; no UI in this repository.

## 9. Requirement Delta Preview

### ADDED Requirements

- A `detector only` state; the detector consequence follows the detector probe in every state (G1, G3).
- Detection records the CLI resolution source and version, flags npx-cache-only resolution as non-reproducible, and reuses the resolved invocation for the whole phase (gap 10).
- A mandatory desktop + mobile (`390x844`) detector pass per URL (G4).
- A first-visit pass with `--no-consent-hiding --no-overlay-hiding` plus fold screenshot and primary-CTA hit-test for Persuade/Operate screens; capture conditions (locale, reduced motion) recorded (G5, C14).
- A design-mode performance step: Lighthouse ≥ 3 runs per URL, median and range, resolved without installing, `Unevaluated` otherwise; a single run never gates (G7, C15).
- A stale-baseline check in E1, plus flags for a missing page-mode column and missing derived context files (G6, G8, G12).
- *Design Waivers* row schema; waiver matching in every mode; *Proposed waiver* in report-only mode (G9, user gap 9).
- Template fields: *Out of scope*, *Score source*, *Capture conditions*, *Report location* (G10, G11, C16).

### MODIFIED Requirements

- Every detector invocation becomes `DO_NOT_TRACK=1 npx --no-install impeccable detect --json …` (G2).
- Exit `1` explicitly covers a missing package and a partial scan, and always reads `Unevaluated` (G2, user gap 2).
- `absent` means *neither* probe succeeded. `Unevaluated (Impeccable absent)` becomes `Unevaluated (detector unavailable)` (G3).
- The design-mode checklist accepts a user-directed report location when it is recorded (C16).

### REMOVED Requirements

- None.

## 10. Approach Options

| Option | What | Trade-off |
|---|---|---|
| **A. One spec, all gaps** (recommended) | Every gap above, in the same ~9 files | One coherent rule set, one sweep for superseded phrasing, one release note. Medium-size spec |
| B. Two specs | (1) detection and gate hardening (G1–G4, gap 10, waivers); (2) evaluation coverage (overlays, performance, stale check, template fields) | Smaller reviews, but both edit the same bridge and template sections, so they serialize anyway and duplicate the sweep |
| C. Minimal | Only the safety and correctness gaps (G1–G3, gap 10) | Fastest, but leaves the gap that actually hid the P1 (G5) and the mobile gap (G4) open |

## 11. Recommended Approach

**Option A.** The gaps share files and vocabulary (state names, the command string, the template), so splitting them buys no parallelism and doubles the risk of a stale restatement surviving in one half. Every gap is prompt and test text. The spec stays bounded by the non-goals: no code, no upstream changes, no project fixes.

## 12. Risks, Dependencies, And Open Questions

| # | Item | Mitigation / owner |
|---|---|---|
| R1 | The superseded command string and `Unevaluated (Impeccable absent)` appear in at least 8 places (skill, 5 commands, 2 docs pages, test, CHANGELOG history). A surviving restatement leaves two rules (KZ-changes--kaizen-loop-closure-2) | The spec's tasks include a grep sweep keyed on each superseded phrase and its paraphrases before Review; historical CHANGELOG entries are left as history |
| R2 | Detector flags (`--viewport`, `--no-consent-hiding`, `--no-overlay-hiding`) are verified on 4.8.0 only. Older installs may reject them, and a rejected flag would surface as an unclear failure | Record the version. On an unknown-flag error, the affected pass reads `Unevaluated (detector <version> lacks <flag>)`, never a pass |
| R3 | Whether `npx --no-install` resolves project `node_modules/.bin` and global installs before the npx cache: `UNVERIFIED — confirm at source before relying on it` (owner: `/akili-specify` Premise Ledger) | The resolution-source recording does not depend on npx internals: probe local bin, `PATH`, then npx, in that order |
| R4 | Run time and cost grow: up to 3 detector passes and 3 Lighthouse runs per URL. With the existing cap of 8 screens, that is up to 48 runs | Scope the first-visit pass to Persuade/Operate screens; Lighthouse is mobile-only by default; the cap of 8 screens stays |
| R5 | Measurement beside a running subagent is wrong, not just slow (AGENTS.md *Concurrency*) | The performance step states it runs only when no delegated agent is active |
| R6 | Aggregate claims in CHANGELOG/docs ("every detector invocation…") (KZ-002) | Run the falsifying grep before writing them |
| R7 | Test budget underestimates (KZ-bugfix--init-ctrlc-abort-2) | Budget test tasks at ~3× the first estimate |
| Q1 | Should `/akili-validate`'s design gate also require the first-visit pass, or only design mode? | **Decided: yes.** `/akili-validate` requires the first-visit pass for Persuade/Operate screens in scope |
| Q2 | Should `/akili-validate` gain a performance gate? | **Decided: no.** No performance gate in `/akili-validate` for now; design mode reports performance only |
| Q3 | Mobile viewport: fixed `390x844`, or read from the project's `design.md` breakpoints when present? | **Decided:** `390x844` default, overridden by a mobile viewport declared in `docs/ux-ui/design.md` |
| Q4 | Should `changes/impeccable-design` be archived before this spec executes, so the test tags and history point at the archive? | **Decided: yes.** Archive `changes/impeccable-design` before this spec is specified/executed; this spec only amends its text contracts |

## 13. Success Criteria

- Re-walking the 2026-10-30 akili.com.co run against the amended text would record `detector only` and run no `npx` command that can install. It would mandate the mobile pass and surface the CTA-overlay P1 from a methodology step. It would report Lighthouse as median/range over ≥ 3 runs, flag the stale `design.md`, and show A-06 hits as waived or proposed waivers.
- A grep for `npx impeccable detect` (without `--no-install`) and for `Unevaluated (Impeccable absent)` across `.claude/` and `docs/` (excluding `docs/specs/archive/` and CHANGELOG history) returns nothing.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` pass.

## 14. Next Step

```text
/akili-specify changes/impeccable-hardening
```
