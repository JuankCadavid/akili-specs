# Requirements: changes/impeccable-design

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-design` |
| Source | `proposal.md` (approved 2026-10-29) |

## Functional Requirements

| ID | Requirement | Acceptance |
|---|---|---|
| FR-1 | A packaged skill `impeccable-bridge` exists with MIT license, AKILI authorship, `binding: conditional`, and an `inspired-by`/credit line naming Impeccable by Paul Bakaus (Apache-2.0) and its upstream URL | Frontmatter fields present |
| FR-2 | The bridge's Step 0 detects Impeccable (project or global skill folders, or a plugin-namespaced command) and the detector CLI, records one of `installed` / `skill only` / `absent` | Detection table lists the paths and the CLI probe |
| FR-3 | When absent, the bridge prints `npx impeccable install` (and the Claude Code plugin route), installs nothing without consent, and falls back to `ui-ux-pro-max` (catalog) + `frontend-design` (craft) + `stitch-design` (mockups), noting the gap in the phase's report | Fallback row present; the word STOP does not gate software specs |
| FR-4 | The bridge declares `docs/ux-ui/design.md` the single design source of truth; `PRODUCT.md`/`DESIGN.md` are derived views carrying a "derived from" header; `.stitch/DESIGN.md` is a mockup input; on conflict `docs/ux-ui/design.md` wins and the difference is drift | Source-of-truth section present |
| FR-5 | The bridge's phase map assigns Impeccable activities to AKILI phases: constitution/specify (`init`/`document` derived, `shape`, direction, page mode), execute (craft floor), test (detector suite), validate (`critique`, `audit`, detector gate), audit (design evaluation) | Phase map table present |
| FR-6 | Detector gate: `npx impeccable detect --json <target>`; exit 0 → pass, exit 2 → fail unless every finding is waived with a reason, exit 1 → `Unevaluated` (never pass); rendered-page rules require a URL target | Gate table present in bridge and wired in `/akili-validate` |
| FR-7 | Privacy: telemetry opt-in recorded (`DO_NOT_TRACK=1` default), hooks offered but never enabled silently, image-generation credit use needs consent | Privacy section present |
| FR-8 | `/akili-constitution` Step 4 and `/akili-specify` load `impeccable-bridge` for UI work, keep `ui-ux-pro-max` as catalog and the existing fallback | Command text references the bridge and the fallback |
| FR-9 | `/akili-validate` has a UI design-review step using `critique` + `audit` and the detector gate, recorded in the validation report | Step text present |
| FR-10 | `/akili-test` plans a design-detector suite for UI-heavy specs when the detector is available | Step text present |
| FR-11 | `/akili-audit design [<url\|path>]` produces `docs/specs/audits/design-<YYYY-MM-DD>[-<safe-branch>][-N].md` with scores, detector results, findings and P1/P2/P3 fixes routed to `/akili-quick` or `/akili-propose`; report-only; drift mode unchanged; design reports are never read as drift reports | Mode + report template present |
| FR-12 | `/akili-propose` accepts a design-evaluation report as a source and lists Impeccable mockups as a Visual Reference source | Text present |
| FR-13 | `ui-ux-pro-max` is described as a reference catalog, not the style authority; `frontend-design` as the fallback craft guide | Skill + docs text |
| FR-14 | Docs (skills README/governance/overview/skill pages, CLI counts, README, CHANGELOG Unreleased) updated in English | docs-overview tests pass |

## Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | No file from `pbakaus/impeccable` is copied into the package; no rule text reproduced |
| NFR-2 | A project without Impeccable behaves as today |
| NFR-3 | No AWS account ids anywhere |
| NFR-4 | Full suite `npm test` passes |
