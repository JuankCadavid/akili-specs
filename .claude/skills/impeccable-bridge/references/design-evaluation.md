# Design Evaluation of an Existing Product

Used by `/akili-audit design [<url|path>]`. Report-only: no project file is edited, and nothing is downloaded or set up except under the consent the bridge's *Privacy and consent* section requires. This reference owns the report template, the baseline checks (E1) and the performance step (E3b). Everything about the skill source, the engine, the detector, the scan matrix, the first-visit pass, exit codes and Design Waivers lives in `SKILL.md`; this file points at those sections and never restates them.

## Steps

| Step | Action |
|---|---|
| E0 | **Skill source and engine.** Run the bridge's *Step 0 — Skill source and engine gate*. Record both values in the `Impeccable` header field. The audit's row of *Who does what in each state* says what each state means for this step |
| E1 | **Context and baseline checks** (below). Read `docs/prd.md` and `docs/ux-ui/design.md` if present, then run the three baseline checks |
| E2 | **Target.** A given URL or path; otherwise the dev-server URL from the TRD or `package.json` scripts plus the UI source directories. Name up to **8** key screens; more only on request. Record any **owner exclusion** (a path, screen or element the owner said to leave out) for `Out of scope` |
| E3 | **Detector.** Run the bridge's *Detector gate*: the *Scan matrix* on the URL and the source, and the *First-visit pass* for each Persuade and Operate screen. Record each result as a row of the *Scan matrix* and *Capture conditions* tables, with exit code and findings by rule id. Exit codes read as the bridge's *Exit codes* table says |
| E3b | **Performance** (below). Runs after E3 has finished and before any delegated agent starts |
| E4 | **Review.** Per key screen, run Impeccable `critique` (heuristic scores) and `audit` (accessibility, performance, responsive, theming, anti-patterns), judged against that screen's page mode. When the skill source is `missing`, run the same checks with `ui-ux-pro-max` rules and `frontend-design` (the bridge's *Fallback* section). Set `Score source` from what produced the scores |
| E5 | **Prioritize.** Every finding gets a priority and a route (below). Match findings against *Design Waivers* as the bridge says (including its *Counting* row) |
| E6 | **Write** the report to the default path `docs/specs/audits/design-<YYYY-MM-DD>[-<safe-branch>][-N].md`, unless the user directed another location (below) |
| E7 | **Offer routes**: P1/P2 fixes small enough for one file go to `/akili-quick`; the rest are bundled into one `/akili-propose` whose Source is this report; or keep the report |

## E1 - Baseline checks

Run these only when `docs/ux-ui/design.md` exists, before any screen review. Without it (an external or legacy product) skip the three checks, set `Baseline` to `none (no docs/ux-ui/design.md)`, infer audience, main tasks and the page mode of each key screen from the product itself, and list every inference under *Assumptions*.

| # | Check | Result |
|---|---|---|
| 1 | **Staleness.** Compare the last commit date of `docs/ux-ui/design.md` with the newest commit touching the UI source directories (those E2 resolves) | UI newer: `Baseline possibly stale (design.md <date>; UI <date>)` plus up to **5** newer commits, newest first. Not newer: `current`. No git history (not a repository, or no commits for either side): `Unevaluated (no git history)` |
| 2 | **Page modes.** Is there a page-mode column, and does every in-scope screen carry a mode? | A missing column, or a screen with no mode: baseline drift. List the inferred modes under *Assumptions*. Otherwise `ok` |
| 3 | **Derived context.** Do root `PRODUCT.md` and `DESIGN.md` exist? | Missing: note that the detector lacks design-system context, so its design-system rules may flag approved patterns. Present: `ok` |

Example: `design.md` last committed 2026-10-17 and a hero redesign committed 2026-10-28 give `Baseline possibly stale (design.md 2026-10-17; UI 2026-10-28)`, followed by the redesign commit.

## E3b - Performance

Lighthouse measures a rendered page, so the step needs a URL. Mobile is the default form factor; run desktop only on request.

| Rule | Content |
|---|---|
| Scope | Per audited URL, within the E2 cap of 8 key screens |
| Resolve, never install | In order: the project's `node_modules/.bin`, then `PATH`, then `npx --no-install lighthouse`. None found: the step reads `Unevaluated (Lighthouse unavailable)`. Downloading Lighthouse or a browser follows the bridge's *Privacy and consent* |
| No URL | A path-only target with no reachable URL reads `Unevaluated (no URL)` |
| Runs | At least **3** mobile runs per URL. Report the **median** and the **range** of the score and of LCP |
| Too few runs | Fewer than 3 completed runs (a run failed or timed out) reads `Unevaluated (<n> of 3 runs completed)`. The partial numbers may be listed, never reported as the page score |
| One run is never the score | Runs scoring 92, 89 and 64 report median 89 and range 64-92. Reporting any single run as the page score is a defect of the report |
| Spread | When the range is wider than the effect a recommended fix targets, the report states that the number cannot serve as a baseline or gate. With no performance fix recommended the column reads `n/a` |
| Concurrency | **Never run while a delegated agent is active, and never beside the E3 detector or browser capture.** A measurement competes for ports, build output and CPU, so one taken beside another process is wrong, not slow (`.agents/leader.md`, *Concurrency protocol*). Run it in the quiet window after E3, and start any delegated agent for E4 only after it ends |
| No gate | `/akili-validate` gains no performance gate. This step is design-mode evidence only |

Report one row per URL in the *Performance* table of the template.

## E6 - Report location

| Case | Path | `Report location` field |
|---|---|---|
| Default | `docs/specs/audits/design-<YYYY-MM-DD>[-<safe-branch>][-N].md` | `default` |
| User-directed | The path the user gave, taken exactly as given | `<path> (directed by <who>)`; `<who>` is the person or instruction that named it |

A user-directed path replaces the default; the report is written once, at that path. Either way nothing else is written.

## Priorities

| Priority | Meaning |
|---|---|
| P1 | Blocks the main task or fails accessibility (contrast, keyboard, focus, tiny text), or breaks on narrow screens |
| P2 | Hurts comprehension, hierarchy or trust on a key screen; generic or inconsistent visual system |
| P3 | Polish: spacing, rhythm, motion, consistency |

## Report template

```markdown
# AKILI Design Evaluation Report

- **Date of Evaluation:** YYYY-MM-DD
- **Target:** <URL and/or paths>
- **Impeccable:** <skill source> + <engine state> (as recorded by the bridge's Step 0)
- **Detector:** `<launcher invocation>`, engine <version> at <location> | Unevaluated (<reason>)
  - **Mobile viewport:** <WxH> (source: docs/ux-ui/design.md | default)
  - Scan matrix: see below
- **Score source:** Impeccable critique | fallback checklist (the two are never trended together)
- **Design source of truth:** docs/ux-ui/design.md | none (inferred, see Assumptions)
- **Baseline:** current | Baseline possibly stale (design.md <date>; UI <date>) | Unevaluated (no git history) | none (no docs/ux-ui/design.md)
  - Newer UI commits (up to 5): <sha date subject> | none
  - Page modes: ok | drift (<what>; inferred modes under Assumptions)
  - Derived context (`PRODUCT.md`/`DESIGN.md`): present | missing (the detector lacks design-system context)
- **Out of scope:** <owner exclusion> - <N> detector hits (<rule id>: <count>, ...) | none
- **Performance:** see table below | Unevaluated (<reason>)
- **Proposed waivers:** N
- **Report location:** default | <path> (directed by <who>)
- **Overall Design Score:** X/10

## Executive Summary
Two to four sentences: what works, the one thing to fix first.

## Screens Evaluated

| Screen | Page mode | First-visit pass | Critique score | Audit issues (P1/P2/P3) |
| :--- | :--- | :--- | :--- | :--- |

`First-visit pass`: `run` | `not required (Read)` | `Unevaluated (<reason>)`.

## Scan matrix

| Pass | Target | Viewport | Exit | Findings | First stderr line (exit other than 0 or 2) |
| :--- | :--- | :--- | :--- | :--- | :--- |

## Capture conditions

| Pass | Screen | Locale | Reduced motion | Viewport | Consent state |
| :--- | :--- | :--- | :--- | :--- | :--- |

## Performance

| URL | Form factor | Runs | Score median (range) | LCP median (range) | Usable as baseline or gate? |
| :--- | :--- | :--- | :--- | :--- | :--- |

`Usable as baseline or gate?`: `yes` | `no (range <N> wider than the targeted effect <M>)` | `n/a (no performance fix recommended)`. A URL that could not be measured carries `Unevaluated (<reason>)` instead of numbers.

## Findings

### P1
- **[Finding]:** what is wrong, where, and why it matters for the screen's mode.
  - **Evidence:** file:line, URL + selector, or detector rule id
  - **Fix:** the concrete change
  - **Route:** `/akili-quick` | `/akili-propose`

### P2
- ...

### P3
- ...

## Detector Results

| Rule id | Count | Example location | Waived? |
| :--- | :--- | :--- | :--- |

`Waived?`: `no` | `waived (design.md)` | `waived (upstream ignore)` | `Proposed waiver (<clause>)` | `out of scope`. Proposed-waiver counting follows the bridge's *Design Waivers*; `out of scope` rows are not P1-P3 findings.

## Assumptions
Inferences made without a baseline, and the inferred page modes.

## Recommended Next Steps
Ordered list; the first item is the first P1 fix.
```

## Checklist

- [ ] The report file exists at the default path, or at the recorded user-directed location, and carries the date, `Impeccable` (skill source and engine state), `Detector` (or `Unevaluated` with the reason), `Score source`, `Baseline`, `Out of scope`, `Performance`, `Proposed waivers` and `Report location`.
- [ ] The *Scan matrix* has one row per pass and target, and *Capture conditions* one row per first-visit pass.
- [ ] Every non-zero exit other than `2` carries its first stderr line.
- [ ] *Performance* shows, per measured URL, at least 3 mobile runs with median and range, or `Unevaluated (<reason>)`; no single run stands as the page score; a spread wider than the targeted fix is flagged.
- [ ] No performance measurement ran while a delegated agent was active.
- [ ] Every finding has evidence, a fix and a route.
- [ ] Every key screen has a page mode and a first-visit entry (`run`, `not required (Read)` or `Unevaluated`).
- [ ] `Proposed waivers` equals the count of `Proposed waiver` rows, and none of them appears among P1-P3.
- [ ] Nothing was written outside `docs/specs/audits/`, except a recorded user-directed report location.
