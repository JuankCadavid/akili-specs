---
description: Validate that the implemented feature strictly matches all requirements, design tokens, and user flows.
license: MIT
metadata:
  author: Juan Carlos Cadavid (jcadavid.com)
---

# Validate AKILI-SPECS Implementation

Validate that a spec path's implementation matches its AKILI-SPECS documents. Produce `validation-report.md` with pass, warning, fail, and remediation details.

Validation is the final conformance audit. It checks whether the implementation still matches the approved requirements, scenarios, design decisions, tasks, tests, and constitutional baseline.

> **Recommended model tier:** T3 Auditor (deep independent review). Ensure you are using a strong reasoning model that differs from the one used during implementation.

## Usage

```
/akili-validate <spec-path>
```

**Examples:**

- `/akili-validate loan`
- `/akili-validate enhancements/renewals`

## Arguments

- `$ARGUMENTS` — Relative path under `docs/specs/` containing `requirements.md`, `design.md`, `tasks.md`, and optionally `execution.md`.

## Output

Create or update `docs/specs/$ARGUMENTS/validation-report.md`.

Validation should produce a clear recommendation for whether the spec can be archived with `/akili-archive $ARGUMENTS`.

Use these result levels consistently:

| Result | Meaning |
|---|---|
| PASS | The implementation satisfies the requirement, task, or check with evidence |
| WARN | The implementation is acceptable but has risk, missing evidence, or minor drift |
| FAIL | The implementation does not satisfy the requirement, task, or check |
| BLOCKED | Validation could not complete because required context, tooling, or access is missing |

---

## Behavior

### Phase 0: Load Context

**Model checkpoint:** This phase runs best on **T3 Auditor** — and it MUST resolve to a different model than the one that implemented the work (author ≠ auditor). If the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) maps that tier to a model different from the current session model, tell the user in one line — e.g. *"This phase is T3 — the registry recommends `/model opus`; you are on sonnet, which also implemented the spec"* — and offer to switch (`/model …` in Claude Code, the model selector in OpenCode) at the first approval pause. Never block on this; continuing on the current model is always allowed.

**Token Optimization (Prompt Caching):** To maximize prompt caching, always read the constitutional baseline documents FIRST and in the exact same order across all sessions before reading task-specific files.

1. Read constitutional context (IN THIS ORDER):
   - root `CLAUDE.md`
   - `AGENTS.md`
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
   - `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
   - `docs/specs/general-setup/`
   - package-level `CLAUDE.md` files if they exist
2. Read spec context:
   - `docs/specs/$ARGUMENTS/proposal.md` if present. If it has a **Visual Reference** section, note the design source (Figma, an agent-generated mockup under `docs/specs/$ARGUMENTS/mockup/`, or a `.stitch/DESIGN.md` reference) so UI conformance can be audited against it, not only `docs/ux-ui/design.md`.
   - `docs/specs/$ARGUMENTS/requirements.md`
   - `docs/specs/$ARGUMENTS/design.md`
   - `docs/specs/$ARGUMENTS/tasks.md`
   - `docs/specs/$ARGUMENTS/execution.md` if present (including any `## Constitution Impact` notes)
   - `docs/specs/$ARGUMENTS/test-report.md` if present. **Reuse its evidence** — the requirement-to-test matrix and each suite's `PASS` / `FAIL` / `PRODUCT_BUG` status — instead of re-deriving coverage from scratch. This is a deliberate token saving: validate audits and cross-checks the recorded evidence rather than re-running the whole test analysis.

### Phase 1: Task Completion Check

Verify task status coverage and report PASS, WARN, or FAIL per task.

Check that completed tasks include execution notes and verification evidence.

### Phase 2: File Existence Check

Parse the design file tree and verify expected new, modified, and deleted files.

### Phase 3: Build Integrity

Run the project's relevant build, type-check, and lint commands.

Prefer the commands defined by the repo rather than assuming a fixed stack.

If no command exists, record the gap and recommend the smallest useful command to add.

### Phase 4: Requirement Coverage Verification

For every requirement in `requirements.md`, verify:

1. it appears in at least one task
2. mapped tasks are complete when full implementation is claimed
3. code evidence exists
4. key scenarios have automated or documented manual test evidence
5. negative constraints (`BUT it must NOT`) and strict validations (`AND IT MUST`) have been explicitly implemented and verified
6. behavior matches the requirement intent, not only the task wording

**Reuse `test-report.md` as the primary coverage evidence** when it exists. Cross-check its requirement-to-test matrix against `requirements.md` rather than re-deriving coverage, and carry its verdicts through:

- A recorded `PRODUCT_BUG` (a correct test kept red on a real defect) is an unresolved failure → mark the affected requirement **FAIL**.
- A `FAIL`, `GAP`, flaky, or `AUTOMATION_DEFERRED` entry without an accepted remediation → mark **WARN** (or FAIL if it covers a negative constraint or strict validation).
- If `test-report.md` is missing or stale relative to the current code, note it and fall back to verifying coverage directly.

### Phase 5: Quality Audit

Use skills as needed:

- **Stack skills come from the project's `## Skill Map`** (root `AGENTS.md`/`CLAUDE.md`) — load the entries matching the code under validation; do not assume a fixed list.
- Conditional skills by situation: `ui-ux-pro-max` (fallback `frontend-design`) for UX/UI-heavy validation; `systematic-debugging` when failures or inconsistencies appear.

Check for:

- architecture compliance
- API quality
- frontend quality
- design-system compliance
- UX consistency with the UX/UI design document, and with the proposal's **Visual Reference** (a Figma design or an agent-generated mockup) when the spec was designed against one
- error handling and observability where relevant
- accessibility and responsive behavior for UI work
- security and authorization boundaries for protected flows

### Phase 6: Design Conformance

Compare the implementation against the module design and the constitutional docs where relevant.

If the implementation intentionally differs from the design, verify that the design or execution notes explain the change. Otherwise mark the drift as WARN or FAIL depending on risk.

If `proposal.md` exists, also verify that final behavior remains aligned with the approved intent, scope, non-goals, and success criteria. When the proposal has a **Visual Reference** (Figma or a generated mockup), confirm the delivered UI is consistent with it.

**Agent Guide / Constitution Impact check (lightweight):** If `execution.md` contains `## Constitution Impact` notes (a task created or reshaped a module, moved a boundary, or changed a public surface), verify that the referenced child `CLAUDE.md`/`AGENTS.md` and the parent `## Module Guides` index are present and not stale. Do not perform a full guide-drift sweep here — that is `/akili-audit`'s job — but flag any unsynced guide as **WARN** and note it as pending work for `/akili-archive` (Constitution & Graph Sync).

### Phase 7: Generate Validation Report

Create `docs/specs/$ARGUMENTS/validation-report.md`. Write it following `cognitive-doc-design`: lead with the verdict, progressive disclosure, tables over prose.

The report must include:

1. Document Control
2. Summary
3. Task Completion
4. File Existence
5. Build Integrity
6. Requirement Coverage
7. Linting & Code Quality
8. Design Conformance
9. Test Evidence Summary
10. Agent Guide / Constitution Impact
11. Remediation
12. Archive Readiness Recommendation

The report title must be `# Validation Report — {Spec Name}`.

### Phase 8: Report to User

Generate a short, easy-to-understand summary (summary facil de entender de lo que se hizo) of the overall status, key findings, remediation count, and archive readiness. If issues exist, ask whether to fix all, fix critical only, or keep only the report. If the work is archive-ready, show the exact next command:

```text
/akili-archive $ARGUMENTS
```

---

## Error Handling

- If AKILI-SPECS documents are missing, report the missing files and stop.
- If build fails, continue other checks when possible.
- If a skill is unavailable, fall back to the next documented skill and note it in the report.
- If no tasks are complete, still allow partial validation but make the incompleteness explicit.
- If implementation evidence is inconclusive, mark WARN or BLOCKED instead of guessing.
- If validation finds spec drift, recommend whether to update the spec, update implementation, or split follow-up work.

---

## Archive Readiness Guidance

The work is ready to consider complete when:

- all required tasks are `[x]`
- no FAIL findings remain unresolved
- WARN findings are accepted or have follow-up tasks
- tests cover the key requirements and scenarios
- implementation drift is reflected in the AKILI-SPECS docs or execution notes
- the user has reviewed the validation summary

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
