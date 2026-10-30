# Design Evaluation of an Existing Product

Used by `/akili-audit design [<url|path>]`. Report-only: nothing is edited, nothing is installed.

## Steps

| Step | Action |
|---|---|
| E0 | Run the bridge's Step 0 detection; record the state |
| E1 | **Context.** Read `docs/prd.md` and `docs/ux-ui/design.md` if present. Without an AKILI baseline (an external or legacy product), infer audience, main tasks and the page mode of each key screen from the product itself, and list every inference under *Assumptions* |
| E2 | **Target.** A given URL or path; otherwise the dev-server URL from the TRD or `package.json` scripts plus the UI source directories. Name up to 8 key screens; more only on request |
| E3 | **Detector.** Run the detector gate on the URL and on the source; record exit code and findings by rule id |
| E4 | **Review.** Per key screen, run Impeccable `critique` (heuristic scores) and `audit` (accessibility, performance, responsive, theming, anti-patterns), judged against that screen's page mode. Fallback: same checks using `ui-ux-pro-max` rules and `frontend-design` |
| E5 | **Prioritize.** Every finding gets a priority and a route (below) |
| E6 | **Write** `docs/specs/audits/design-<YYYY-MM-DD>[-<safe-branch>][-N].md` |
| E7 | **Offer routes**: P1/P2 fixes small enough for one file go to `/akili-quick`; the rest are bundled into one `/akili-propose` whose Source is this report; or keep the report |

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
- **Impeccable:** installed | skill only | absent
- **Detector:** `<command>` → exit <0|1|2> (<N> findings) | Unevaluated (<reason>)
- **Design source of truth:** docs/ux-ui/design.md | none (inferred, see Assumptions)
- **Overall Design Score:** X/10

## Executive Summary
Two to four sentences: what works, the one thing to fix first.

## Screens Evaluated

| Screen | Page mode | Critique score | Audit issues (P1/P2/P3) |
| :--- | :--- | :--- | :--- |

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

## Assumptions
Inferences made without a baseline.

## Recommended Next Steps
Ordered list; the first item is the first P1 fix.
```

## Checklist

- [ ] The report file exists and carries the date, the Impeccable state and the detector result (or `Unevaluated` with the reason).
- [ ] Every finding has evidence, a fix and a route.
- [ ] Every key screen has a page mode.
- [ ] Nothing outside `docs/specs/audits/` was written.
