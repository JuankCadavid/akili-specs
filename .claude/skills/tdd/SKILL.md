---
name: tdd
description: "Trigger: test-driven development, TDD, red-green, test-first implementation of a logic-heavy task, 'red-green-refactor'. Red → green loop with tests worth keeping: seams, anti-patterns (implementation-coupled, tautological, horizontal slicing), vertical slices. In AKILI-SPECS the Leader assigns it per task; expected values come from the approved requirements.md scenarios and seams from design.md."
license: MIT
metadata:
  author: Matt Pocock
  source: https://github.com/mattpocock/skills
  adapted-by: "Juan Carlos Cadavid — jcadavid.com"
  adapted-for: "AKILI-SPECS"
  binding: conditional
  version: "1.0"
---

# Test-Driven Development

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle — consult them before and during the loop, not after.

When exploring the codebase, read `CONTEXT.md` (if it exists) so test names and interface vocabulary match the project's domain language, and respect ADRs in the area you're touching.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification — "user can checkout with valid cart" tells you exactly what capability exists — and survives refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Seams — where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them with the user. No test is written at an unconfirmed seam. You can't test everything — agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case.

Ask: "What's the public interface, and which seams should we test?"

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests private methods, or verifies through a side channel (querying the database instead of using the interface). The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological** — the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`, a snapshot derived by hand the same way, a constant asserted equal to itself), so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth — a known-good literal, a worked example, the spec.
- **Horizontal slicing** — writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead — one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or add speculative features.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** It belongs to the review stage (see the `code-review` skill), not the red → green implementation cycle.

## AKILI-SPECS Integration

In AKILI projects this skill runs **inside the Implementer's inner loop**, assigned per task — it changes *how* a task is built, never *what* the spec approved.

| Upstream rule | How it lands here |
|---|---|
| **Assignment is the Leader's call (binding: `conditional`)** | The `/akili-execute` Leader assigns this skill in the brief for **logic-heavy tasks** (algorithms, business rules, data transformations, contract implementations). Never blanket: TDD on a copy tweak or a styling task is pure cost. When assigned, the Implementer loads it before writing any code. |
| **Expected values come from the spec, not from the user mid-loop** | The anti-tautological rule demands an independent source of truth — in AKILI that source already exists and is already approved: the **Given/When/Then scenarios in `requirements.md`** named by the task. Derive each red test's expected value from its scenario; if a scenario is too vague to yield one, that is a spec gap to report to the Leader, not a value to invent. |
| **Seams are pre-agreed in `design.md`, not asked live** | The upstream "confirm seams with the user" question is already answered: the public interfaces in the spec's `design.md` (and the TRD's module boundaries) **are** the agreed seams — the Leader's brief points at them. Only when the design genuinely defines no interface for the task's area does the seam question go to the Leader (as a design ambiguity, per `/akili-execute`'s error handling — never straight to the user). |
| **Bug Mode is already TDD** | `/akili-specify` Bug Mode mandates a regression test **red before the fix, green after** — this skill generalizes that same discipline to feature tasks. On a bugfix task, the two are one loop: the mandatory regression test is the first red. |
| **Refactoring belongs to review** | The upstream rule maps 1:1 onto the AKILI harness: the Reviewer's 4R lenses and the `simplify` pass own refactoring. The Implementer's loop stays red → green; do not gold-plate inside it. |
| **No duplication with `/akili-test`** | TDD tests are the *author's* tracer bullets at unit seams; `/akili-test`'s Testers remain the **independent** proof (author ≠ tester): negative constraints, integration, E2E. Testers cite existing TDD coverage in their per-scenario matrix instead of rewriting it, and add what the author's loop does not cover. |
| **Verification evidence** | The Implementer's completion report cites the red → green history as verification evidence: the test file(s), the scenario each test proves, and the final green run. A test that was never seen red is not TDD evidence — say so rather than implying it. |

One sentence to remember: *the spec supplies the expected values, the design supplies the seams, the Leader supplies the assignment — the loop supplies only the discipline.*

## Authorship

TDD skill by **Matt Pocock** — [github.com/mattpocock/skills](https://github.com/mattpocock/skills), MIT License. Adapted for AKILI-SPECS by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com).
