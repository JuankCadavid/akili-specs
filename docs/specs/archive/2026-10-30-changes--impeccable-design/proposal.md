# Proposal: Impeccable as AKILI's lead design skill, plus design evaluations of existing products

**Answer first:** make Impeccable (Paul Bakaus, `pbakaus/impeccable`, Apache-2.0) the lead design skill of AKILI-SPECS for visual direction, craft rules and rendered-page review, without vendoring a single file of it. A new AKILI-authored bridge skill, `impeccable-bridge` (MIT), owns the availability gate, the phase map, the design source-of-truth rule, the detector quality gate and the fallback to today's behavior. `ui-ux-pro-max` becomes a reference catalog only; `frontend-design` becomes the fallback craft guide. `/akili-audit design` adds design evaluations of existing products with a prioritized fix list.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-design` |
| Type | Change |
| Deliverable | software (methodology prompts, skill, docs, tests) |
| Approval Mode | gated |
| Status | **Approved** — Juan Carlos Cadavid, 2026-10-29 21:32 (UTC-5): "Sí, de acuerdo. Y que también nos sirva para hacer evaluaciones de diseño de productos ya existentes … adoptemos este skill en la metodología y haz el cambio" |
| Requested by | Juan Carlos Cadavid (maintainer), 2026-10-29 |
| Source | Read-only evaluation on 2026-10-29 comparing Impeccable with the bundled `ui-ux-pro-max`; upstream README and `skill/SKILL.src.md` read at `pbakaus/impeccable` HEAD on 2026-10-29 |
| Visual | None (no UI in this repository) |
| Depends on | none |
| Parallel-safe | yes with `mcp-separation` and `review-intensity-trial-terms`, except the shared `CHANGELOG.md` `Unreleased` block |
| Branch | `JuankCadavid/impeccable-design` (worktree off `origin/dev` at `702a584`), local commits only |

## 2. Intent

Interfaces built with AKILI should look designed, not generated, and AKILI should be able to evaluate the design of a product that already exists. Today the design guidance is three overlapping skills with no single authority and no rendered-page check.

## 3. Problem / Current Behavior

| # | Current behavior | Citation |
|---|---|---|
| C1 | `ui-ux-pro-max` is "AKILI's preferred UI/UX skill" and the style authority; `frontend-design` + `stitch-design` are the fallback chain | `.claude/skills/ui-ux-pro-max/SKILL.md:28`; `docs/skills/README.md:45`, `:52` |
| C2 | `frontend-design` carries its own full aesthetic rule set (tone, typography, color, motion, anti-patterns) that competes with any other lead skill | `.claude/skills/frontend-design/SKILL.md` §3, §4, §7 |
| C3 | Constitution Step 4 and specify pick "`ui-ux-pro-max` if available, otherwise `frontend-design` + `stitch-design`" | `.claude/commands/akili-constitution.md:209-210`; `.claude/commands/akili-specify.md:232-233`, `:462-463` |
| C4 | `/akili-validate` checks UX consistency against `docs/ux-ui/design.md` by reading code; no rendered-page review and no automated design gate | `.claude/commands/akili-validate.md:119`, `:127` |
| C5 | `/akili-audit` audits spec-to-code drift only; there is no way to evaluate the design quality of an existing product | `.claude/commands/akili-audit.md:11-17` |
| C6 | Design context can live in three places: `docs/ux-ui/design.md`, `.stitch/DESIGN.md`, and (once Impeccable runs) its root `PRODUCT.md`/`DESIGN.md`; no rule says which wins | `.claude/commands/akili-propose.md:132-135`; upstream README |
| C7 | Governance already has the pattern for tool-provided skills: referenced, never vendored, routed through a packaged AKILI bridge (`video-production` → HyperFrames) | `docs/skills/governance.md` *Environment-provided skills* |

## 4. Proposed Outcome

1. **Lead design skill.** When installed, Impeccable leads UI direction (`shape`, the direction picker, the Persuade/Operate/Read/Experience modes), craft (its craft floor) and review (`critique`, `audit`, `polish`, `harden`, `clarify`).
2. **Never vendored.** Impeccable is environment-provided. AKILI ships only the MIT bridge `impeccable-bridge`, which detects the install, prints `npx impeccable install` (consent-gated) when absent, and falls back to today's chain. No STOP: a project without Impeccable runs exactly as before, with the gap noted in the report.
3. **One design source of truth: `docs/ux-ui/design.md`.** Impeccable's root `PRODUCT.md` and `DESIGN.md` are derived views generated from `docs/prd.md` and `docs/ux-ui/design.md`; `.stitch/DESIGN.md` is a per-mockup input folded into `docs/ux-ui/design.md` on approval. On conflict `docs/ux-ui/design.md` wins and the difference is reported as drift.
4. **Wiring.** Constitution Step 4 and specify set direction through the bridge. `/akili-validate` gains a UI design-review step (`critique` + `audit` on the rendered page) and the detector as a quality gate (`npx impeccable detect --json`: exit 0 pass, 2 findings, 1 unevaluated). `/akili-test` plans a design-detector suite for UI-heavy specs.
5. **Design evaluation of existing products.** `/akili-audit design [<url|path>]` writes `docs/specs/audits/design-<YYYY-MM-DD>[-<safe-branch>][-N].md`: scores, detector results, findings with P1/P2/P3 fixes routed to `/akili-quick` or `/akili-propose`. Report-only; works without an AKILI baseline.
6. **Roles realigned.** `ui-ux-pro-max` = reference catalog (palettes, font pairings, styles and anti-patterns by industry). `frontend-design` = fallback craft guide when Impeccable is absent. `stitch-design` = mockup generation, unchanged.

## 5. Scope

- New `.claude/skills/impeccable-bridge/SKILL.md` and `references/design-evaluation.md`.
- Commands: `akili-constitution`, `akili-specify`, `akili-propose` (Visual Reference + design-evaluation source), `akili-validate`, `akili-test`, `akili-audit`.
- Skills realigned: `ui-ux-pro-max` (integration section), `frontend-design` (role section).
- Docs: `docs/skills/impeccable-bridge.md` (with attribution/notice), `docs/skills/README.md`, `docs/skills/governance.md`, `docs/skills/ui-ux-pro-max.md`, `docs/skills/frontend-design.md`, `docs/overview.md`, `docs/commands/akili-audit.md` (if present), `docs/cli.md` skill counts, `README.md`, `CHANGELOG.md` `Unreleased`.
- Tests: new `test/impeccable-bridge.test.js`; `test/install-cursor.test.js` packaged file count.

## 6. Out of Scope

- Copying any Impeccable file, its rules, or its anti-pattern catalog into the package.
- Installing Impeccable in this repository or in any project automatically.
- Changing Stitch mockup generation, the PRD/TRD structure, or the flow figure.
- Release, version bump, push or PR.

## 7. Decisions

| ID | Decision | Why |
|---|---|---|
| D-1 | Bridge skill, not command text, owns all Impeccable detail | Mirrors `video-production`; governance rule 1 forbids vendoring tool-provided skills |
| D-2 | Graceful fallback, no STOP | Impeccable is a quality booster for software specs, not a selected `Deliverable`; governance rule 4's STOP applies only to selector-gated skills |
| D-3 | `docs/ux-ui/design.md` is the single design source of truth | Already the baseline every command reads and the Reviewer audits; root `DESIGN.md` and `.stitch/DESIGN.md` become derived/inputs |
| D-4 | Existing-product evaluation is an `/akili-audit` mode | `/akili-audit` is already the report-only "compare reality against a standard" command with an `audits/` folder; a propose path would force a spec for what is a diagnosis |
| D-5 | Detector gate: exit 2 fails validation unless each finding is waived with a reason; exit 1 is `Unevaluated`, never a pass | A gate that passes on "could not scan" is not a gate |
| D-6 | Telemetry and hooks are opt-in decisions recorded in the report | Upstream fetches visual directions and has hooks that run outside model approval |

## 8. Licensing

Impeccable is Apache-2.0 and is **not redistributed**. AKILI ships only original MIT text that names the tool, its commands and its install route, and credits "Impeccable by Paul Bakaus (Apache-2.0)". No upstream text is copied, so no NOTICE propagation is required; the attribution is recorded in `docs/skills/impeccable-bridge.md`.
