# Kaizen Entry — changes/docs-refresh-2-34

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-refresh-2-34` |
| Date | 2026-10-19 |
| Branch | `JuankCadavid/docs-refresh` — Branch Context: **spec** (`Default Branch: master`, no `Integration Branch:` pin) |
| Archive Run | 1 |
| Approval Mode | pre-approved (Juan Carlos Cadavid, 2026-10-19) |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 4 | tasks.md |
| Reviewer FAIL rework attempts | 1 (T4 attempt 1: constitution bullet without its condition) | execution.md — T4 attempt 1 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0 — one spec tension at T1 (FR-1 font floor vs the Archify decision) settled by the user as a one-line amendment | execution.md — T1 |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 3 confirmed by both judges, severity split (A warning / B severe): missing `judgment.md`, ~95 KB embedded fonts vs "no web-font import", P-5 export mechanism mis-stated | judgment.md — L-1…L-3 |
| Validation FAIL / WARN | 0 / 4 (A-1, A-2 fixed in validation; F-1, F-2 accepted) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 1 — A-1 (alt text "diagram slots are filled at … archive") passed T1, T2 and T3 Reviewers and was found at `/akili-validate`; no task carried `REVIEW_SKIPPED` | validation-report.md — A-1 |

## Lessons

- **KZ-changes--docs-refresh-2-34-1 — Product text the Leader writes into a brief for the worker to ship verbatim was never checked against its source, and the Reviewers checked it for identity, not truth.** (Methodology, Medium)
  - Root cause: the brief contract's source rule (`/akili-execute` Step 2.2 clause (c)) covers infrastructure and third-party facts only. The Leader composed two pieces of shippable copy in briefs — the figure's alt/`<desc>` text (T1 brief, step 4: "use it verbatim") and the constitution bullet (T4 brief, scope 1) — from memory of the command files. The workers copied them faithfully; the Reviewers checked the alt text for byte-identity across sites and against the figure, not against `.claude/commands/akili-archive.md:124`, which says archive *links* diagram views and fills none.
  - Evidence: execution.md — T4 attempt 1 (Violated Rule: requirements.md FR-7 "with its condition"; the dropped clause was absent from the Leader's brief text); validation-report.md — A-1 (escaped through T1/T2/T3 Reviewer PASSes).
  - Standardization: → P1 (upstream)

## Noted, not a lesson

- **Recurrence:** a numeric requirement (FR-1 font floor ≥ 10 px at 900 px) was fixed at the requirements gate for an artifact an UNVERIFIED tool would generate (P-5), and proved unreachable at T1 — same root cause as KZ-changes--subagent-context-budget-2 → P2 (digest-update).
- Spec-time Premise Ledger rules worked as designed, three times: P-7's first grep was narrowed ("exactly two sites") and refuted by running it (citation rule (e)); T3's membership check keyed on `akili-x.md` was wrong and was caught by executing the red run before the gate (KZ-changes--leader-brief-contract-2); judgment-day's attack on P-5 replaced a doc-sourced premise with the primary source (`template.html`).
- A non-browser renderer (librsvg) was briefly taken as the proxy for GitHub's SVG rendering and drew black blocks; headless Chromium over `http://127.0.0.1` rendered it correctly. `playwright-cli open file://…` silently stayed on `about:blank` — a blank screenshot is not evidence of a broken asset.
- `npx skills add tt-a1i/archify --help` ignored `--help` and installed project-scoped into the current directory (the scratchpad) — harmless here, but a "help" probe of an installer is not side-effect-free.
- `.agents/` absent in a fresh worktree (gitignored) — copied from the main checkout, third spec in a row (precedent: `bugfix/update-check-deadline`, `bugfix/init-ctrlc-abort`).

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-execute` Step 2.2 *Brief contract*, clause (c): extend "Every infrastructure or third-party fact the brief states" to "…and every piece of product text the brief supplies for the worker to ship verbatim (alt text, a bullet, a table cell)": it cites the source line it restates, or carries the `UNVERIFIED` marker. **Falsifier:** a brief that tells the worker to copy a sentence about a command's behavior with no `file:line` beside it. Optionally, `reviewer.md` *Requirement Conformance*: verbatim-supplied text is audited against its cited source, not only for identity across sites. |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--subagent-context-budget-2 |
| Edit | Add source spec `changes/docs-refresh-2-34` and the recurrence note: "recurred (changes/docs-refresh-2-34: an FR-1 font-size floor fixed at requirements for a figure an UNVERIFIED external tool would generate; unreachable at T1, settled by a user amendment) — a cap on a tool-generated artifact belongs in the Premise Ledger as UNVERIFIED, owned by the first task". Raise severity Low → Medium (it stopped the run for a user decision). |
| Severity | Medium |
| Status | pending |
