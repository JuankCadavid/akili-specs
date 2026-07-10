---
description: Write and execute comprehensive automated unit/integration tests for the implemented feature.
---

# Test SDD Implementation

Run automated and, when needed, manual tests against a spec path's implementation. Produce `test-report.md` with results, requirement coverage, scenario traceability, and failures.

Testing should prove the behavior promised in `requirements.md`, not only increase test count.

## Usage

```
/sdd-test <spec-path>
```

**Examples:**

- `/sdd-test loan`
- `/sdd-test enhancements/renewals`

## Arguments

- `$ARGUMENTS` — Relative path under `docs/specs/` that contains `requirements.md`, `design.md`, and `tasks.md`.

## Output

Create or update `docs/specs/$ARGUMENTS/test-report.md` with:

- commands run and their results
- requirement-to-test matrix
- scenario coverage status
- failures and remediation steps
- accepted gaps with reasons when full automation is not practical

---

## Behavior

### Phase 0: Load Context

1. Read:
   - `docs/specs/$ARGUMENTS/requirements.md`
   - `docs/specs/$ARGUMENTS/design.md`
   - `docs/specs/$ARGUMENTS/tasks.md`
2. Read project-level context:
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
   - `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
   - root and package-level `CLAUDE.md` files
3. Identify backend, frontend, and end-to-end scope from the design and tasks.
4. Extract key requirements and Given/When/Then scenarios from `requirements.md`.

### Phase 1: Unit Tests

- Create or improve backend unit tests where needed.
- Create or improve frontend unit tests where needed.
- Map tests back to requirements and scenarios.
- Prefer focused tests that prove one behavior clearly over broad tests with unclear intent.

Use skills as needed:

- `nestjs-expert`
- `systematic-debugging`
- `vercel-react-best-practices`
- `react-doctor`

### Phase 2: Integration Tests

- Create or improve API integration tests where relevant.
- Validate auth, request/response shape, and major flows.
- Cover cross-module behavior that cannot be proven by unit tests alone.

### Phase 3: End-to-End Tests

- Create or improve E2E tests for user-visible workflows.
- If the work is UI-heavy, prefer `ui-ux-pro-max` when available.
- Otherwise use `frontend-design` and the UX/UI design doc as the UX reference.
- Use E2E tests for critical user journeys, not every small component state.

### Phase 4: Coverage & Traceability

Create a requirement-to-test matrix so every key requirement has test evidence or an explicit gap.

Recommended matrix columns:

| Requirement | Scenario | Test Type | Test File or Command | Result | Gap or Notes |
|---|---|---|---|---|---|

### Phase 5: Generate Test Report

Create `docs/specs/$ARGUMENTS/test-report.md`.

**Automated Test Parsing Option:** If the repository uses standard testing frameworks (like Jest or Vitest) and has a JCSPECS test parsing helper installed (e.g. `sdd-jc/scripts/parse_tests.js`), you may run the tests outputting to JSON (e.g. `jest --json --outputFile=jest-results.json` or `vitest --reporter=json --outputFile=test-results.json`) and run:
`node <path-to-sdd-jc>/scripts/parse_tests.js jest-results.json`
to automatically scaffold the results matrix directly into the test report sections.

The report must include:

1. Document Control
2. Summary
3. Backend Unit Tests
4. Frontend Unit Tests
5. Integration Tests
6. E2E Tests
7. Coverage & Traceability
8. Remediation
9. Accepted Gaps, if any

### Phase 6: Report to User

Present overall test status, test counts, requirement coverage, scenario gaps, and top failures. If failures exist, ask whether to fix failures, add missing tests, fix all, or keep only the report.

---

## UX Testing Guidance

When a spec includes meaningful UI/UX behavior, verify more than raw functionality:

- flow clarity
- responsive behavior
- state transitions
- accessibility basics
- visual consistency with `docs/ux-ui/design.md`

If `ui-ux-pro-max` is unavailable, use `frontend-design` plus the UX/UI design document as the fallback reference.

---

## Testing Rules

- Do not mark a requirement covered just because related code exists.
- Do not hide missing coverage; record it as an explicit gap with remediation.
- Prefer repository-specific test commands over hardcoded framework assumptions.
- If a test is flaky, record the flake and avoid treating it as passing evidence until stabilized.
- If no automated test is practical, document the manual verification steps and why automation was deferred.
