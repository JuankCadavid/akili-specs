---
description: Write and execute comprehensive automated unit/integration tests for the implemented feature.
---

# Test AKILI-SPECS Implementation

Run automated and, when needed, manual tests against a spec path's implementation using the AKILI **Leader → Tester(s)** multi-agent harness. Produce `test-report.md` with results, requirement coverage, scenario traceability, and failures.

In this command you act as the **Leader** (Orchestrator). You partition testing into per-suite units, delegate each unit to a focused **Tester** subagent, aggregate their structured reports, and assemble the final `test-report.md`. Testing should prove the behavior promised in `requirements.md`, not only increase test count.

> **Recommended model tier:** Leader on T5 Fast-Cheap (orchestration — writes no tests), each Tester on T2 Coder (test authoring + verification). See the `## Model Routing` registry in the project's `AGENTS.md` / `CLAUDE.md`. Prefer a Tester model that differs from the Implementer that wrote the code (author ≠ tester reduces confirmation bias).

## Usage

```
/akili-test <spec-path>
```

**Examples:**

- `/akili-test loan`
- `/akili-test enhancements/renewals`

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

## Multi-Agent Harness

The Leader delegates concrete test authoring to the **Tester** persona defined in the project's `.agents/` directory:

- `.agents/tester.md` — the persona used when delegating a single test suite (backend unit, frontend unit, integration, or E2E).

If `.agents/tester.md` is missing, run `/akili-constitution` first to scaffold it. Do not invent the persona inline — the constitution is the source of truth.

**Delegation mechanism by tool:**

- **Claude Code / OpenCode:** spawn a focused subagent (or sub-prompt context) seeded with `tester.md` plus the suite's context slice.
- **Google Antigravity:** invoke `invoke_subagent` (or the equivalent) using the prompt read from `.agents/tester.md`.

**Token discipline — thin context per Tester (this is the core saving):**

- Give each Tester **only its slice**: its assigned suite, the specific requirements + Given/When/Then scenarios that suite must prove, and the project's test command. Never hand a Tester the full `requirements.md`/`design.md`/`tasks.md` unless a scenario genuinely needs it.
- Each Tester's context is discarded when it finishes, so per-suite contexts never accumulate in one growing window.
- The Leader writes no tests itself unless the Deployment Rule below says to run inline, or a Tester exhausts its inner loop and the user approves a Leader fallback.

**Deployment Rule (how many Testers to spawn):**

| Situation | Action |
|---|---|
| Lite depth, or a single trivial suite (e.g. one bugfix test) | **Run inline** — the Leader authors it directly. Spawning a subagent would cost more tokens than the work saves. |
| Standard / Full depth with one substantial suite | Spawn **one** Tester for that suite. |
| Multiple suites that are **independent** (touch different domains/files — e.g. backend unit vs frontend unit vs E2E) | Spawn **one Tester per suite, in parallel**. |
| Multiple suites that **share files or fixtures** | Spawn Testers **sequentially** (or a single Tester covering them) to avoid conflicting writes. |

The Leader decides the count from the spec's depth and the independence of the suites — favor the fewest spawns that still keep each context small and each suite independent.

---

## Behavior

### Phase 0: Load Context (Leader)

**Token Optimization (Prompt Caching):** To maximize prompt caching, always read the constitutional baseline documents FIRST and in the exact same order across all sessions before reading task-specific files.

1. Read project-level context (IN THIS ORDER):
   - root `CLAUDE.md`
   - `AGENTS.md`
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
   - `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
   - Package-level `CLAUDE.md` and `AGENTS.md` files if they exist
2. Read spec context:
   - `docs/specs/$ARGUMENTS/requirements.md`
   - `docs/specs/$ARGUMENTS/design.md`
   - `docs/specs/$ARGUMENTS/tasks.md`
3. Read the Tester persona `.agents/tester.md` (stop and direct the user to `/akili-constitution` if it is missing).
4. Identify backend, frontend, and end-to-end scope from the design and tasks.
5. Extract key requirements, Given/When/Then scenarios, negative constraints (`BUT it must NOT`), and strict validations (`AND IT MUST`) from `requirements.md`.

### Phase 1: Plan Suites & Delegation (Leader)

1. Partition the work into concrete **suites**: backend unit, frontend unit, integration, E2E — only those the spec actually needs.
2. For each suite, assemble a **context slice**: the target requirements + scenarios, the negative/strict rules to assert, the repo test command, and the relevant skills.
3. Apply the **Deployment Rule** to decide inline vs delegated, and parallel vs sequential.
4. Assign skills per suite as needed:
   - `nestjs-expert`, `systematic-debugging` — backend
   - `vercel-react-best-practices`, `react-doctor` — frontend
   - `ui-ux-pro-max` (fallback `frontend-design`) — UI-heavy E2E

### Phase 2: Execute Suites (Tester per suite)

For each suite, the assigned Tester (or the Leader inline) must:

- Author focused tests that prove one behavior clearly.
- **Explicitly** cover negative constraints (`BUT it must NOT`) and strict boundary validations (`AND IT MUST`).
- Map every test back to its requirement and scenario.
- Run the suite and apply the **bounded self-correction inner loop** (max 3 attempts):
  - fix genuine **test defects** and re-run;
  - keep a failing test that reveals a genuine **product defect** red, and report it as `STATUS: PRODUCT_BUG` instead of rewriting it to pass.
- Prefer unit tests for internal logic, integration tests for cross-module/API behavior, and E2E only for critical user journeys — not every small component state.

Each Tester concludes with exactly one status — `PASS`, `FAIL`, or `PRODUCT_BUG` — plus a per-scenario coverage slice, per `.agents/tester.md`.

### Phase 3: Aggregate & Traceability (Leader)

Collect every Tester's coverage slice into one requirement-to-test matrix so every key requirement has test evidence or an explicit gap. Ensure negative constraints and strict validations are mapped. Carry through any `PRODUCT_BUG` findings as failures with remediation.

Recommended matrix columns:

| Requirement | Scenario | Test Type | Test File or Command | Result | Gap or Notes |
|---|---|---|---|---|---|

### Phase 4: Generate Test Report (Leader)

Create `docs/specs/$ARGUMENTS/test-report.md`.

**Automated Test Parsing Option:** If the repository uses standard testing frameworks (like Jest or Vitest) and has a AKILI test parsing helper installed (e.g. `akili/scripts/parse_tests.js`), you may run the tests outputting to JSON (e.g. `jest --json --outputFile=jest-results.json` or `vitest --reporter=json --outputFile=test-results.json`) and run:
`node <path-to-akili>/scripts/parse_tests.js jest-results.json`
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

When Testers were delegated, record in the Summary how many suites ran, how many Testers were spawned (and whether in parallel), and any suite run inline.

### Phase 5: Report to User (Leader)

Generate a short, easy-to-understand summary (summary facil de entender de lo que se hizo) of the overall test status, test counts, requirement coverage, scenario gaps, product bugs found, and top failures. If failures exist, ask whether to fix failures, add missing tests, fix all, or keep only the report.

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
- A Tester must never rewrite a test to hide a genuine product defect; a real failure is reported as `PRODUCT_BUG`, not silenced.
- Do not delegate trivial single-test work to a subagent when running it inline is cheaper (see the Deployment Rule).

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com)
