---
name: akili-test
description: Write and execute comprehensive automated unit/integration tests for the implemented feature.
license: MIT
metadata:
  author: Juan Carlos Cadavid (jcadavid.com)
---

# Test AKILI-SPECS Implementation

Run automated and, when needed, manual tests against a spec path's implementation using the AKILI **Leader → Tester(s)** multi-agent harness. Produce `test-report.md` with results, requirement coverage, scenario traceability, and failures.

In this command you act as the **Leader** (Orchestrator). You partition testing into per-suite units, delegate each unit to a focused **Tester** subagent, aggregate their structured reports, and assemble the final `test-report.md`. Testing should prove the behavior promised in `requirements.md`, not only increase test count.

> **Recommended model tier:** Leader on T1 (orchestration judgment — partitions suites, selects each Tester's skills, adjudicates results; writes no tests), each Tester on T2 Coder (test authoring + verification). See the `## Model Routing` registry in the project's `AGENTS.md` / `CLAUDE.md`. Prefer a Tester model that differs from the Implementer that wrote the code (author ≠ tester reduces confirmation bias).

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

- **Claude Code / OpenCode:** if the project has a tool-native `akili-tester` agent wrapper (scaffolded by `/akili-constitution` Step 8E with a `model:` binding from the `## Model Routing` registry), **spawn that named agent** so each Tester runs on its tier's model — preferring a model different from the Implementer's (author ≠ tester). Otherwise, spawn a focused subagent (or sub-prompt context) seeded with `tester.md` plus the suite's context slice.
- **Google Antigravity:** invoke `invoke_subagent` (or the equivalent) using the prompt read from `.agents/tester.md` (no per-agent model binding — guidance-only routing).

**Token discipline — thin context per Tester (this is the core saving):**

- Give each Tester **only its slice**: its assigned suite, the specific requirements + Given/When/Then scenarios that suite must prove, and the project's test command. Never hand a Tester the full `requirements.md`/`design.md`/`tasks.md` unless a scenario genuinely needs it.
- **Prefer pointers over copies inside the slice** for a host Tester: name the scenario IDs and their section anchors in `requirements.md` and instruct the Tester to read them **verbatim at the source** — the exact text still reaches it, as its own cacheable input rather than as your output. Copy scenario text only for a **non-host** worker that cannot resolve project paths (see *Cross-host dispatch*), where the self-contained brief remains mandatory.
- **Author TDD coverage, when execute produced it:** if `execution.md` task entries cite red→green test files (`tdd` was assigned during `/akili-execute`), put those paths in the affected suite's slice with the instruction to **cite, not rewrite** — the Tester marks those scenarios covered by the author's tests in its matrix and spends its budget on what the author's loop does not prove (negative constraints, integration, E2E). Duplicated suites are MUDA paid on every future test run.
- **CodeGraph, when `.codegraph/` exists:** tell each Tester to locate the code under test via graph lookups (`codegraph_search` for the symbol, `codegraph_callers` for its usage surface) instead of exploratory full-file reads — a Tester needs to know a function's contract and call sites, which the graph answers in a fraction of the tokens. **Staleness rule:** `/akili-test` runs after `/akili-execute` changed the code, and the graph indexes the last re-index — which is precisely **not** the implementation under test. For the files this spec changed, the working tree wins; the graph is for the *surrounding* code the spec did not touch. Put that boundary in each slice.
- Each Tester's context is discarded when it finishes, so per-suite contexts never accumulate in one growing window.
- Load the `caveman` skill and apply its Scope Contract: Leader→Tester context slices and Tester structured reports use `full` compression; `test-report.md`, `PRODUCT_BUG` escalations to the user, and verbatim evidence (requirement and Given/When/Then scenario text quoted in slices, test output, `STATUS:` lines, error strings) are never compressed.
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

**Model checkpoint:** As Leader you run best on **T1** — orchestration here is judgment, not dispatch: you partition suites, **select each Tester's skills**, and adjudicate results. You write no tests, but these calls gate the whole run (low volume, high leverage). Testers route through the `akili-tester` wrapper (T2) when present. If the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) maps T1 to a model different from the current session model, check the direction first — the registry is a floor, not a ceiling: if the session model is the stronger one (e.g. a newer generation than a stale entry), pass silently and flag the registry entry for update instead of recommending a downgrade. Only when the registry model is stronger for this tier, tell the user in one line — e.g. *"The Leader loop is T1 — the registry recommends `/model opus`; you are on sonnet"* — and offer to switch (`/model …` in Claude Code, the model selector in OpenCode) at the first approval pause. Never block on this; continuing on the current model is always allowed.

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
3. Read the Tester persona `.agents/tester.md` **only when the project has no Step 8E `akili-tester` wrapper** — the wrapper's body loads the persona in the Tester's own context, so the Leader reading it too pays the same tokens twice. Verify the file exists either way (stop and direct the user to `/akili-constitution` if `.agents/tester.md` is missing — a wrapper pointing at a missing persona spawns a Tester with no contract).
4. Identify backend, frontend, and end-to-end scope from the design and tasks.
5. Extract key requirements, Given/When/Then scenarios, negative constraints (`BUT it must NOT`), and strict validations (`AND IT MUST`) from `requirements.md`.

### Phase 1: Plan Suites & Delegation (Leader)

1. Partition the work into concrete **suites**: backend unit, frontend unit, integration, E2E — only those the spec actually needs.
2. For each suite, assemble a **context slice**: the target requirements + scenarios, the negative/strict rules to assert, the repo test command, and the relevant skills.
   - **No test infrastructure is a STOP, not an improvisation.** If the project has no test command for a suite — no runner chosen, no config, no `test` script (the normal state of a greenfield project's first spec) — do **not** let a Tester pick a framework inside its inner loop: choosing the runner is a **stack decision** that belongs to the TRD, and scaffolding it (config, first smoke test, script wiring) is a **spec task** that deserves its own Implementer → Reviewer pass. Stop, tell the user which suites are blocked on missing infrastructure, and recommend the route: add the scaffolding task to this spec (or a quick prior spec) and re-run `/akili-test` after it lands. Proceed normally with any suite whose infrastructure does exist.
   - **Integration/E2E suites additionally get the `## Local Environment` contract** from `docs/infrastructure.md` (start, seed/reset, health-check commands and URLs) so Testers never guess how to bring the stack up. Run the contract's **pre-check at planning time** — if the primary route is unavailable (e.g. Docker daemon off), resolve it with the user (start it, or use the fallback route) before spawning suites, not mid-suite. If no contract exists, note the gap in the test report and recommend `/akili-constitution` (Step 6B).
3. Apply the **Deployment Rule** to decide inline vs delegated, and parallel vs sequential.
4. **Select each suite's skills and effort as Leader — you own both decisions.** The ownership rules are canonical in `.agents/leader.md` → *Delegation Discipline* (task/Skill-Map lists are overridable defaults; deviations recorded — here, in the test report's Summary). Suite-specific flavor: `systematic-debugging` for failure-heavy suites, `ui-ux-pro-max` for UI-heavy E2E; effort `low` for a trivial single-assertion suite, `xhigh` for complex integration/concurrency suites. Where the tool exposes a per-spawn effort knob, set it; otherwise steer depth in the suite's context slice.

### Phase 2: Execute Suites (Tester per suite)

For each suite, the assigned Tester (or the Leader inline) must:

- Author focused tests that prove one behavior clearly.
- **Explicitly** cover negative constraints (`BUT it must NOT`) and strict boundary validations (`AND IT MUST`).
- Map every test back to its requirement and scenario.
- Run the suite and apply the **bounded self-correction inner loop** (max 3 attempts):
  - fix genuine **test defects** and re-run;
  - keep a failing test that reveals a genuine **product defect** red, and report it as `STATUS: PRODUCT_BUG` instead of rewriting it to pass;
  - on each retry, **bump the effort one level** (`medium` → `high` → `xhigh`) — a fix that failed is usually under-thinking, not missing instructions.
- Prefer unit tests for internal logic, integration tests for cross-module/API behavior, and E2E only for critical user journeys — not every small component state.

Each Tester concludes with exactly one status — `PASS`, `FAIL`, or `PRODUCT_BUG` — plus a per-scenario coverage slice, per `.agents/tester.md`.

### Phase 3: Aggregate & Traceability (Leader)

Collect every Tester's coverage slice into one requirement-to-test matrix so every key requirement has test evidence or an explicit gap. Ensure negative constraints and strict validations are mapped. Carry through any `PRODUCT_BUG` findings as failures with remediation.

Recommended matrix columns:

| Requirement | Scenario | Test Type | Test File or Command | Result | Gap or Notes |
|---|---|---|---|---|---|

### Phase 4: Generate Test Report (Leader)

Create `docs/specs/$ARGUMENTS/test-report.md`. Write it following `cognitive-doc-design`: lead with the answer (overall status first), progressive disclosure, tables over prose.

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
- Test-infrastructure decisions (runner choice, framework config, CI test wiring) are never made inside this command — they are TRD stack decisions implemented as spec tasks. A missing test command stops the affected suite; it does not license a Tester to choose.
- **Performance/load testing is out of scope for this command's four suite types** (backend unit, frontend unit, integration, E2E). Performance is an NFR: it enters through the TRD's quality-attribute scenarios (`software-architect` skill) and, when a spec commits to a measurable target, through that spec's own verification tasks — named here so its absence reads as a decision, not an oversight.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
