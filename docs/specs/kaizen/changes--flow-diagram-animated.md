# Kaizen Entry: changes/flow-diagram-animated

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/flow-diagram-animated` |
| Date | 2026-10-27 |
| Branch | `JuankCadavid/flow-diagram-animated`. Branch Context: **spec**. The `Integration Branch: dev` pin exists, so the apply-capable branch is `dev` |
| Archive Run | 1 |
| Approval Mode | pre-approved (Juan Carlos Cadavid, 2026-10-27) |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 4 | tasks.md |
| Reviewer FAIL rework attempts | 5: T1 ×2, T2 ×1, T4 ×2 | execution.md |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0. One Leader adjudication that P-7 needed no Pivot, upheld by the Reviewer | execution.md T2 |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 1 confirmed by both judges (F-1); 2 single-judge findings confirmed by the architect's re-run (F-2, F-3) | judgment.md |
| Validation FAIL / WARN | 0 / 3. All 3 WARNs are user-only checks. 3 stale figures were corrected | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects | 1. The CHANGELOG test count (1140) went stale when `/akili-test` added 12 tests; caught at validation (R-1) | test-report.md, validation-report.md |

## Lessons

- **KZ-changes--flow-diagram-animated-1: a committed file that a test compares byte for byte needs `-text` in `.gitattributes` from the start.** (Product, Medium)
  - Root cause: the design specified a byte-exact staleness test (FR-6, DD-8) for a committed generated asset. The Premise Ledger never asked how the CI matrix checks files out, and the `windows-latest` legs run with `core.autocrlf=true`. The repository already had the remedy for `test/fixtures/**`, but `AGENTS.md` describes it as a fixtures-only arrangement, so neither the architect nor the Implementer generalized it.
  - Evidence: `execution.md`, T1 attempt 1, Reviewer FAIL issue 1 (simulated CRLF checkout: `animate(static) === animated` → false, 135,793 vs 135,802 chars). The fix landed in attempt 2.
  - Standardization: → P1
- **KZ-changes--flow-diagram-animated-2: a pixel-equality gate is evidence only when the baseline render shows the content.** (Methodology, Medium)
  - Root cause: design P-12 and the T2 plan cited `rsvg-convert` AE 0 as proof of the CSS-less case. rsvg does not resolve `var()`, so both renders were an almost-black canvas and the equality was vacuous. The same blindness made the specified falsifier (a) inert: a black overlay on black, and a trace already hidden by its dashoffset. The rendered-measurement checklist (`/akili-specify` Step 3.2, Falsifiability item 6) checks fonts, viewports and baselines for overflow gates, but nothing tells a pixel-equality gate to prove that its baseline render is non-trivial.
  - Evidence: `execution.md`, T2 attempt 1, Reviewer FAIL ("Step 4b is INCONCLUSIVE … P-12's rsvg citation is vacuous"); attempt 2, the stripped-render control (red fill with `opacity="0"` kept → 0).
  - Standardization: → P2 (upstream)

## Noted, not a lesson

- **KZ-002 recurrence**, which goes to P3 as a digest-update. T4 needed 3 attempts for 5 CHANGELOG overstatements: the wrong loop path, a false SMIL cause, npm asserted as fact, `.gitattributes` missing from the scope line, and a bracket "(re-run after `/akili-test`)" claiming a step not yet run. The last one came from the **Leader's own brief**, whose process note was shipped as text. Validation then found the count stale (1140 → 1152) and two design figures stale after T2's premise settlement.
- **The Leader's brief as a defect source.** A brief's process instruction ("this count will be re-run after /akili-test") became shipped prose. `leader.md` item 4 already warns about "the task's instruction verb shipped as rule text", so this is not a new lesson; it is the same mechanism in a brief rather than a task.
- **Judgment-day caught a probe gap.** The design depended on rendering mechanisms (`opacity` attribute overridden by CSS, `pathLength` dashes, `calc()` delays) that only a toy probe had run (F-1). The architect's spike settled them in about 10 minutes, before any task ran. The Premise Ledger rule worked as intended.
- **Environment.** The claude-in-chrome extension was not connected, so headless Playwright stood in for the live-path checks. Headless Firefox 1534 hung at launch three times. Both are recorded as accepted gaps, not lessons.
- **Post-validation amendment.** The user changed the Bug Track pulse colour after validation. It was applied by the Leader with a test that went red first and a rendered check, and with no separate Reviewer spawn, all recorded in `execution.md`. That is a one-off, below the lesson bar.
- **KZ-changes--flow-diagram-review-1 did not recur.** `.agents/` was present in this worktree. The P1 pending item in that entry still stands.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `AGENTS.md`, *Repository Purpose*, the `test/` bullet (the clause "`.gitattributes` keeps `test/fixtures/**` byte-exact …") |
| Edit | Append: "Any committed file a test compares byte for byte (generated assets such as `assets/akili-flow-animated.svg` included) gets a `-text` line in `.gitattributes` in the same change: the `windows-latest` CI legs check out with `core.autocrlf=true`." |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Step 3.2, Falsifiability item 6 (rendered-measurement checklist), add: "A pixel-equality gate (`AE 0`, 'identical render') first proves its baseline render is non-trivial: the content is visible (colour count, a known element sampled). A renderer that cannot resolve the artifact's CSS yields an equal, empty canvas on both sides, and its falsifier is inert." |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add `changes/flow-diagram-animated` as a source. Recurrence note: "recurred (changes/flow-diagram-animated: T4 took 3 attempts for 5 CHANGELOG overstatements, one introduced by the Leader's brief, whose process note '(re-run after /akili-test)' shipped as text; validation then found the test count and two design figures stale after later phases)". Severity stays High. |
| Severity | High |
| Status | pending |
