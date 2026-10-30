# Kaizen Entry — changes/impeccable-design

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-design` |
| Date | 2026-10-30 |
| Branch | JuankCadavid/impeccable-hardening (spec branch; apply-capable branch: `dev`) |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 7 of 7 | tasks.md; execution.md |
| Reviewer FAIL rework attempts | not recorded | execution.md (no attempt records) |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0 | execution.md |
| PRODUCT_BUGs | n/a: no `test-report.md` | — |
| Judgment-day severe findings | none recorded | design.md |
| Validation FAIL / WARN | 0 / 0 (1 advisory: live behaviour untested) | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 recorded | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 recorded | execution.md |
| Escaped defects (§3) | 3, found on first real use (2026-10-30): the gate command can install implicitly; there is no `detector only` state; the `absent` state's detector rule contradicts the probe | `~/akili-audits/2026-10-30-akili-web-design.md` → *Gaps in akili-specs* 1–3; `docs/specs/changes/impeccable-hardening/proposal.md` C1–C4 |

## Lessons

- **KZ-changes--impeccable-design-1 — A prescribed external-CLI invocation was never walked against the tool, and the test pinned its unsafe form.** (Methodology, Medium)
  - Root cause: FR-6 fixed the gate command as `npx impeccable detect --json` from upstream docs. The same skill's own probe used `npx --no-install`, and its consent rule says "install nothing without consent". Nobody ran the gate command, because Impeccable was not installed, so the contradiction passed validation. `test/impeccable-bridge.test.js` (FR-3/FR-4) then pinned the installing form as a contract.
  - Evidence: `requirements.md` FR-6; `.claude/skills/impeccable-bridge/SKILL.md` *Step 0* probe vs *Detector gate*; `validation-report.md` advisory; audit report *Detector commands run* ("would have downloaded and installed the package"). This is a recurrence of a sub-threshold note: `changes--docs-refresh-2-34.md` → *Noted, not a lesson* ("a 'help' probe of an installer is not side-effect-free").
  - Standardization: → P1 (upstream)
- **KZ-changes--impeccable-design-2 — A state table collapsed two independent probes into three states, and the missing combination was the first one met in use.** (Methodology, Medium)
  - Root cause: design §1 derived `installed | skill only | absent` from two booleans (skill found, detector found). It omitted "detector found, skill absent", and it tied the detector consequence to the skill probe. The first real run hit exactly that combination and had to improvise.
  - Evidence: `requirements.md` FR-2; `design.md` §1; `SKILL.md` state table; audit report gaps 1 and 3.
  - Standardization: → P2 (upstream)

## Noted, not a lesson

- There is no `test-report.md`, and `tasks.md` carries no checkboxes. Archive readiness had to be read from `execution.md` and `validation-report.md`.
- `execution.md` records no Reviewer attempts or review-skip blocks, so harness metrics are not measurable for this spec.
- The validation advisory ("live behaviour untested") correctly predicted the escaped defects, but advisories cannot gate. Feeds recurrence only.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Premise Ledger: any external-CLI invocation a command or skill prescribes is walked once against the tool's own `--help` / exit-code contract in its non-installing form (`npx --no-install …`) before approval, and any text-contract test pins that safe form. |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` design guidance: a state table derived from N independent probes enumerates every combination (2^N rows) or states, per missing row, why it cannot occur; each consequence names the probe it follows. |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | factual-sweep |
| Target | `AGENTS.md` (root) → *Skill Usage* |
| Edit | Replace "- Use `frontend-design`, `ui-ux-pro-max`, `tailwind-design-system`, or `shadcn-ui` for UI work." with "- Use `impeccable-bridge` for UI work (it leads with Impeccable when installed, else `frontend-design` craft + `ui-ux-pro-max` catalog); `tailwind-design-system` or `shadcn-ui` for their stacks." |
| Severity | Low |
| Status | pending |
