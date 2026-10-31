# Proposal: Close the design-evaluation gaps found in the 2.40.0 audit

**Answer first:** the first real `/akili-audit design` run on 2.40.0 worked: Impeccable was found as `vendored 4.8.0`, and P-15 passed. But it only produced a correct report because the agent stepped outside the rules. The report lists 6 deviations under *Desviaciones de esta corrida*, and M3 and M5 describe 2 more: the extra viewport passes and the rebuild with test IDs. Without those steps it would have given false `PASS` results:

- No short-viewport pass (M3).
- No check that the consent banner was rendered (M5).
- Screenshots written into the repo during a read-only audit (M7).

This change rewrites the rules in AKILI's own files: `impeccable-bridge`, `design-evaluation.md`, `/akili-audit` and `/akili-constitution`. The audit's deviations become the written contract. The vendored Impeccable files are not edited. What only upstream can fix (launcher order, CMP detection, `aria-hidden`) goes into a drafted upstream request that is never filed without JC.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-contract` |
| Parent Spec | `changes/impeccable-audit-fixes` (family manifest `family.md`) |
| Type | Change |
| Deliverable | software (methodology rules, a skill reference, command prompts, text-contract tests) |
| Approval Mode | gated |
| Status | **Approved**, Juan Carlos Cadavid, 2026-10-30 16:21 (UTC-5), with the recommendations accepted: a primary CTA below the fold on a Persuade/Operate screen = P1; short-height pair `1366x768` + `375x667`, overridable in `design.md`; `doctor` reports `DIFFERS` as a warning, exit 0 |
| Requested by | Juan Carlos Cadavid (maintainer), 2026-10-30 |
| Source | `~/akili-audits/2026-10-30-akili-web-design-2.40.0.md`, sections *Fallos y vacíos de la metodología* (M1–M14) and *Desviaciones de esta corrida* |
| Source questions | Asked at the approval gate: no Jira, no Figma; the report is the source (JC, 2026-10-30 16:21) |
| Visual | None (no UI in this repository) |
| Depends on | none |
| Parallel-safe | yes (only `CHANGELOG.md` `Unreleased` is shared with the sibling) |
| Base | `8268cb7` (v2.40.0 on `dev`), branch `JuankCadavid/impeccable-audit-fixes`; local commits only, no push, PR or merge |
| Out of scope by the brief | Sentinel PRs |

## 2. Intent

When two agents run `/akili-audit design` on the same site, they should reach the same verdict. They should also be able to do it without hacks the rules do not describe: overriding `HOME`, rebuilding with fake IDs, running `npm ci` with no rule that allows it. Where a pass could not see something, the report should say `Unevaluated` and give the reason, never `PASS`.

## 3. Problem / Current Behavior

Brief numbering in brackets. Brief item (1), the installer, belongs to the sibling spec `install-stale-skills`.

| # | Current behavior | Citation |
|---|---|---|
| M1 [3] | The launcher tries `$HOME/.impeccable/bin/impeccable` before the `IMPECCABLE_HOME` cache, so setting `IMPECCABLE_HOME` does not isolate it. Only `IMPECCABLE_BIN` beats it: it is checked first, and the launcher `exec`s it | `.claude/skills/impeccable/scripts/impeccable:90-92`, `:122-127` |
| M1 | After a consented download, the bridge records `installed (consented)` but does not pin `IMPECCABLE_BIN` to the downloaded binary. Later launcher calls can therefore land on a different `~/.impeccable` engine. The consent text names the destination without warning about this | `impeccable-bridge/SKILL.md` Step 0 item 4; *Engine consent* row *Destination* |
| M2 [2] | Step 0 accepts any `impeccable/SKILL.md` with `UPSTREAM.md` beside it as `vendored (<version>)`. Its files are never checked against the per-file sha256 list in `UPSTREAM.md`, and other copies are never compared. `~` is not defined when the host runs under a profile `HOME` | `impeccable-bridge/SKILL.md` Step 0 item 1; `.claude/skills/impeccable/UPSTREAM.md` *Checksums*; report M2 |
| M3 [4] | The scan matrix has one desktop and one mobile viewport. The mobile default is `390x844`. No short-height pass exists, so first-visit FAILs at 1366×768, 1280×720 and 375×667 do not show up | `SKILL.md` *Scan matrix*; report *Medición adicional del fold* |
| M4 [5] | The first-visit pass fails "when the topmost element is neither the CTA nor its descendant". It does not separate *covered by an overlay* from *below the fold*, and it does not say how the primary CTA is found or how visibility is measured | `SKILL.md` *First-visit pass* item 3; report M4 (`offsetParent` false positive) |
| M5 [6] | Nothing asserts that the consent banner was rendered. A build without analytics IDs has no banner, and its first visit passes empty. The detector's `--no-consent-hiding`/`--no-overlay-hiding` only know third-party CMPs, so with a custom banner those passes add no evidence | `SKILL.md` *First-visit pass*; report M5 and *Scan matrix* note |
| M6 [7] | AKILI's design scale is P1–P3. Impeccable's critique uses P0–P3 with other cut-offs. No mapping exists | `references/design-evaluation.md` *Priorities*; `impeccable/reference/critique.md:627-638` |
| M7 [8] | Critique persists a snapshot to `.impeccable/critique/` (a repo write), may start `live-server`, and ends with questions to the user. It also requires Assessment A to finish before detector output reaches the parent, while E3 runs the detector first. The bridge lists no step to suppress in report-only mode | `critique.md:3`, `:10`, `:79`, `:198-232`; `design-evaluation.md` E3/E4; `akili-audit.md` *Design Evaluation Mode* ("report-only") |
| M8 [9] | E4 may delegate the critique to a subagent, but nothing bounds its return. The audit's result arrived truncated | report M8; `design-evaluation.md` E4 (no return contract) |
| M9 [10] | E3b resolves Lighthouse from `node_modules/.bin`, then `PATH`, then `npx --no-install`. A fresh worktree has no `node_modules`, and no rule covers `npm ci`. A run is judged by its exit code, but Lighthouse exits 1 on `ENOTEMPTY` cleanup **after** writing a valid JSON | `design-evaluation.md` E3b *Resolve, never install*, *Too few runs*; report *Performance* footnote |
| M10 [11] | Concurrency rules are per checkout. Machine load (other listening servers, load average) is not recorded beside a measurement | `design-evaluation.md` E3b *Concurrency*; report M10 (other `astro preview` on :4329) |
| M11 [12] | The constitution template already asks for a page mode per screen and a *Design Waivers* list (since 2.40.0). It does not number approved clauses, but the bridge's *Proposed waiver* example cites a clause ID (`A-06`). E1 detects a missing page-mode column but does not route the backfill | `akili-constitution.md:212` (blame `701c8ff`, first tag `v2.40.0`); `SKILL.md` *Design Waivers* example; `design-evaluation.md` E1 check 2 |
| M12 [13] | E2 caps the run at 8 key screens. A template with no screen among the 8 goes unreviewed, and nothing says so | `design-evaluation.md` E2; report M12 (48 pages, `BlogPost.astro` only source-scanned) |
| M13 [14] | `/akili-audit` design step 5 and its *Verification Checklist* require the report under `docs/specs/audits/`. E6 allows a user-directed path | `akili-audit.md` step 5, *Verification Checklist* (design mode); `design-evaluation.md` *E6* |
| M14 [15] | `text-occlusion` flags decorative `aria-hidden` cards (96 hits). The only waiver shapes are an upstream ignore (a repo edit) or a `design.md` clause | `SKILL.md` *Design Waivers*; report *Detector Results* |

## 4. Proposed Outcome

| Area | After this change |
|---|---|
| Engine isolation (M1) | A consented download pins `IMPECCABLE_BIN` to the binary it wrote. The consent question says the launcher reads `~/.impeccable/bin/impeccable` first unless `IMPECCABLE_BIN` is pinned. A user exclusion of `~/.impeccable` skips probe locations 3 and the default of 4. No `HOME` override is needed |
| Copy integrity (M2) | Step 0 verifies the copy it uses against its own `UPSTREAM.md` checksums: `vendored (4.8.0, verified)` or `vendored (4.8.0, modified: <n> files)`. It records the path used, lists any other copies found with their versions, and states what `~` resolved to |
| Viewports (M3) | Each viewport is `WxH` from `design.md`, or a stated default. The first-visit pass adds a **short-height** pair (default `1366x768` and `375x667`); the full scan matrix keeps two passes |
| First-visit verdicts (M4) | Outcomes: `pass`, `covered (<element>)` or `below fold (y=<n>)`. The CTA is declared per screen in `design.md`, otherwise it is the first Primary-policy CTA in `main`, recorded under *Assumptions*. Visibility uses computed style plus the bounding box. The CTA identification method is part of *Capture conditions* |
| Consent presence (M5) | When the product has a consent banner, the pass asserts it is visible. If the build does not render it, the result is `Unevaluated (consent banner not rendered: <reason>)`, with the documented fix (a build with test IDs, never real ones). Detector first-visit passes count as evidence only for a recognised CMP |
| Priority mapping (M6) | One table: Impeccable P0 → AKILI P1 tagged `blocking`; P1 → P1; P2 → P2; P3 → P3. The report keeps AKILI's scale, so `/akili-propose` and `/akili-validate` stay unchanged |
| Report-only suppression (M7) | A bridge list *Suppressed in `/akili-audit design`*: snapshot persistence, `live-server`/inject, and the closing questions. Assessment A runs isolated, and the detector output is kept out of its brief |
| Delegated returns (M8) | E4's brief requires an up-front finding count and a return in bounded text parts. The parent checks the count before writing |
| Lighthouse (M9) | `npm ci` from the lockfile counts as resolving a declared devDependency. It needs the same consent as any download, and the report records it. A run counts by its JSON (no `runtimeError`, performance score present), not its exit code |
| Machine load (M10) | The *Performance* section records the load average and the other listening dev servers at measurement time |
| Clause IDs (M11) | The `/akili-constitution` design template numbers approved clauses (`<section>-<nn>`). E1 check 2 routes a missing page-mode column, a missing waiver section or missing clause IDs to `/akili-constitution`, without writing anything |
| Coverage (M12) | E2 picks the 8 screens so that every distinct page template appears at least once. Templates left out are listed in a *Coverage* header field as a declared risk |
| Report location (M13) | Step 5 and the checklist accept the E6 user-directed path. "Nothing outside `docs/specs/audits/`" gains the same exception |
| Decorative occlusion (M14) | A report-only value `false positive (<reason>, <evidence>)`, allowed only for rules listed in the bridge (initially `text-occlusion` inside `aria-hidden="true"`). Such findings are counted in the header and never P1–P3, the same way proposed waivers are |
| Upstream (M1, M5b, M14) | `upstream-request.md` in this spec: launcher order, custom-banner hiding, and `aria-hidden` occlusion. Drafted only; JC files it |

## 5. Scope

- `.claude/skills/impeccable-bridge/SKILL.md`: Step 0 (M1, M2), *Engine consent*, *Scan matrix* and *First-visit pass* (M3–M5), a new *Suppressed in report-only mode* list (M7), *Design Waivers* (M14).
- `.claude/skills/impeccable-bridge/references/design-evaluation.md`: E1 (M11 routing), E2 (M12), E3b (M9, M10), E4 (M7 order, M8), *Priorities* (M6 mapping), the template and the checklist.
- `.claude/commands/akili-audit.md`: design step 5 and the *Verification Checklist* (M13).
- `.claude/commands/akili-constitution.md` Step 4 design template: clause IDs (M11).
- `test/impeccable-bridge.test.js`: text-contract assertions, one per new clause (KZ-bugfix--init-ctrlc-abort-2: budget per clause).
- `CHANGELOG.md` `Unreleased`, plus `docs/skills/impeccable-bridge.md` and `docs/skills/impeccable.md` wherever they restate a changed rule.
- `docs/specs/changes/impeccable-audit-fixes/design-eval-contract/upstream-request.md` (draft).

## 6. Non-Goals

- No edit to any vendored file under `.claude/skills/impeccable/` (launcher, detector, `critique.md`). The rule "AKILI edits none of its instructions" stands.
- No change to the akili.com.co findings D1–D20, or to that project's `design.md` (its D14 goes to `/akili-constitution` in that repo).
- No P0 level in AKILI's scale (option B below, rejected).
- No performance gate in `/akili-validate` (the hardening decision Q2 stands).
- No general subagent-truncation fix for the harness. M8 is handled only for E4's brief, since the host's notification limit is outside AKILI.
- No installer change (sibling spec). No Sentinel PRs.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| `/akili-audit design` users | New header fields (`Coverage`, machine load), new first-visit outcomes, the `false positive` value |
| `/akili-validate` design gate | It shares *Scan matrix* and *First-visit pass*, so it gains the short-height pair and the banner assertion. The gate cannot `PASS` on `Unevaluated` (existing rule) |
| `/akili-test` detector suite | Plans the short-height first-visit pair |
| `/akili-constitution` | The design template gains clause IDs |
| Related spec | `changes/impeccable-hardening` (not archived). This change builds on its FR-4 to FR-14 and does not reopen them |

## 8. Visual Reference

- Source: None
- Location: n/a
- Notes: methodology text only; no UI surface.

## 9. Requirement Delta Preview

### ADDED Requirements

- The bridge pins `IMPECCABLE_BIN` after a consented download, and honours a user exclusion of `~/.impeccable`.
- Step 0 verifies the copy in use against `UPSTREAM.md` checksums, and records the path, `~` resolution and other copies.
- The first-visit pass runs a short-height pair, has three outcomes, declares its CTA identification, and asserts the consent banner is present.
- A *Suppressed in `/akili-audit design`* list, an E4 return contract, a P0→P1 mapping table, a `Coverage` field, a machine-load record, a `false positive` report value, and clause IDs in the constitution template.

### MODIFIED Requirements

- E3b: `npm ci` (with consent) is an accepted resolution, and run validity comes from the JSON.
- `/akili-audit` design step 5 and its checklist follow E6.
- E1 check 2 routes baseline-template gaps to `/akili-constitution`.

### REMOVED Requirements

- None.

## 10. Approach Options

| Option | What | Pros | Cons |
|---|---|---|---|
| **A. Rules-only, AKILI files** (recommended) | Rewrite bridge, reference and command text; text-contract tests; upstream request drafted | Smallest safe path; keeps the vendored copy byte-identical; patch-sized | M1/M5b/M14 stay worked-around until upstream acts |
| B. Adopt Impeccable P0–P3 everywhere | Replace AKILI's scale | One scale | Touches `/akili-propose`, `/akili-validate`, `/akili-quick` routing and every past report's comparability; out of proportion to M6 |
| C. Patch the vendored launcher/detector | Fix M1/M14 at source | Real fix | Breaks the byte-identical vendoring contract and `impeccable-vendor.test.js`; diverges from upstream on the next pin |

## 11. Recommended Approach

**Option A.** Each gap has a fix in AKILI-owned text. The three that are upstream behavior get an AKILI-side contract now: pin `IMPECCABLE_BIN` (M1), assert the banner and discount detector first-visit evidence (M5b), and the `false positive` value (M14). They also get a drafted upstream request. Release type: **patch**. It is methodology text and tests only, with no new command, target or skill.

## 12. Risks, Dependencies, And Open Questions

| # | Item | Recommendation |
|---|---|---|
| R1 | The `false positive` value could hide real findings | Allowed only for rules on a closed list in the bridge, with evidence required; counted in the header; never P1–P3 |
| R2 | The short-height pair adds 2 browser captures per Persuade/Operate screen | First-visit only (hit-test plus screenshot), not the full detector matrix |
| R3 | Rules restated in `docs/skills/impeccable.md`, `/akili-validate` and `/akili-test` drift (KZ-changes--kaizen-loop-closure-2) | Phrase-family sweep keyed on each obligation before review; restatement checks as tests |
| R4 | Summary surfaces overstate (KZ-002): the brief says "15 failures", but the report lists 14 (M1–M14); the 15th is the installer item | The CHANGELOG and the requirements count 14 + 1, quote-checked at HEAD |
| Q1 | Is `below fold` a P1 for Persuade screens, or P2? | Recommend P1 for Persuade and Operate when the declared CTA is below the fold at a declared viewport; settle at `/akili-specify` |
| Q2 | Short-height defaults `1366x768` / `375x667`? | Yes, overridable in `design.md` |
| Q3 | Should `npm ci` need consent even when the lockfile already pins Lighthouse? | Yes: it is a network download (bridge *Privacy and consent*) |

## 13. Success Criteria

- A literal reading of the bridge and reference reproduces the 2.40.0 audit's verdicts **without** the deviations it recorded: the `HOME` override, the ad-hoc extra viewports, the rebuild with test IDs, the unruled `npm ci`, the suppressed critique steps and the report-location conflict.
- Re-running the audit's scenario on a build with no banner yields `Unevaluated (consent banner not rendered …)`, not `PASS`.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` pass. `impeccable-vendor.test.js` still proves the vendored copy is byte-identical.

## 14. Next Step

```text
/akili-specify changes/impeccable-audit-fixes/design-eval-contract
```
