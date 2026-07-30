# `tdd`

**Binding:** conditional · **Original author:** Matt Pocock (MIT) — [github.com/mattpocock/skills](https://github.com/mattpocock/skills) · **Adapted by:** Juan Carlos Cadavid — jcadavid.com

## What it does

The red → green loop with tests worth keeping: tests at pre-agreed **seams** (public boundaries, never internals), three anti-patterns named and banned (implementation-coupled, tautological, horizontal slicing), vertical slices as tracer bullets, and refactoring kept out of the loop (that belongs to review). Ships with `tests.md` (good/bad test examples) and `mocking.md` (mocking guidelines), both upstream verbatim.

## Why it was adopted

It passed the acceptance bar the other candidates evaluated the same week did not: current (no stale metrics or mechanical quotas), **agent-aware** (horizontal slicing — "bulk tests verify imagined behavior" — is precisely the default LLM failure mode), MIT, and complementary rather than colliding with the harness.

## AKILI adaptation (the Integration section in SKILL.md)

- **Leader-assigned, per task, never blanket** — logic-heavy tasks only (algorithms, business rules, contracts); pure overhead on copy/styling/config.
- **Expected values come from the approved spec**: the anti-tautological rule demands an independent source of truth, and `requirements.md` Given/When/Then scenarios *are* that source — already HITL-approved. A scenario too vague to yield an expected value is a spec gap to report, not a value to invent.
- **Seams come from `design.md`**: the upstream "confirm seams with the user" question is pre-answered by the approved design; only a genuinely undefined interface escalates (to the Leader, as design ambiguity).
- **Bug Mode alignment**: `/akili-specify` Bug Mode's mandatory red-before-green regression test is this same discipline — on bugfixes the two are one loop.
- **No duplication with `/akili-test`**: TDD tests are the author's tracer bullets; Testers remain the independent proof (author ≠ tester) and cite existing TDD coverage in their matrix instead of rewriting it.

## Used by

`/akili-execute` — the Leader assigns it in the Implementer's brief for qualifying tasks; the Implementer's completion report cites the red → green history as verification evidence.
