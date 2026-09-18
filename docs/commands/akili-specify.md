# `/akili-specify`

Generate the requirements, design, and task plan for one bounded feature, bugfix, enhancement, or module.

## Usage

```text
/akili-specify <spec-path>
```

Examples:

```text
/akili-specify loan
/akili-specify enhancements/renewals
/akili-specify admin/user-management
```

## Use When

- A proposal has been approved and needs full specification.
- A small change is clear enough to specify directly.
- A feature needs behavior, design, task, and verification traceability before coding.

## Inputs

Reads context from:

- `docs/specs/<spec-path>/proposal.md` when present
- `docs/specs/general-setup/`
- `docs/prd.md`
- `docs/ux-ui/design.md`
- `docs/trd/trd.md`
- related specs under `docs/specs/`
- `docs/specs/kaizen-log.md` when present — only the `## Active Lessons` digest; relevant lessons are applied and cited by ID in design decisions
- root and package-level agent guidance files

## Outputs

Creates or updates:

```text
docs/specs/<spec-path>/requirements.md
docs/specs/<spec-path>/design.md
docs/specs/<spec-path>/tasks.md
```

## Documentation Depth

| Depth | Use For |
|---|---|
| Lite | Small bugfixes, copy updates, narrow UI tweaks |
| Standard | Normal features and enhancements |
| Full | Risky, cross-cutting, API, data, auth, migration, or high-impact work |

## Key Rules

- Requirements describe observable behavior, not implementation details.
- A number transcribed from a screenshot or pasted table is proposal context, not a source — confirm it against the page or command it came from before it enters a requirement, scenario, or design cell.
- Key requirements include Given/When/Then scenarios.
- Design extends the current architecture instead of replacing it.
- Tasks reference requirements, design sections, dependencies, done criteria, verification, and relevant skills.
- Verification commands are matched to the spec's named defect classes, including two explicit gates: a **compiler-only defect** (gate: the project's build/type-check command, needed when the compiler is stricter than the test runner) and a **layout/geometry defect** (gate: a rendered measurement per the rendered-measurement checklist below, or the existing HITL/T6 substitute when one isn't available).
- Every task's verification carries four named fields — **Falsifier**, **Red run**, **Disqualifier**, and **Consumers** — with absent values written as `n/a` or `none`, never left blank.
- **Falsifiability:** a task's verification must name an input that would make the check fail, not only a criterion for passing. Six rules apply:
  - *Expressible falsifier* — name the mutation and the fixture row or stub behavior where correct and mutated readings diverge, and run the mutation against the post-change code.
  - *Assertion-level red run* — the `Red run` cited must fail on the behavioral assertion, not on setup, an intercept, a timeout, or a synchronous mock.
  - *Real-artifact lock* — presence and visibility claims bind to the shipped file or a rendered measurement, never a fragment authored in the test.
  - *Compile gate* — when the build/type-check is stricter than the test runner, a task assigning into a typed contract includes it in Verification.
  - *Consumer Sweep* — a changed shared symbol, DOM hook, or event gets one grep per symbol over unit, component, and E2E suites, listed under `Consumers`.
  - *Rendered-measurement checklist* — only when a gate asserts size, overflow, visibility, position, or containment: baseline, production fonts, real geometry (never class presence), at least two viewports differing on the dimension the gate depends on, effective CSS px with zoom named, and clip containment.
- Before final approval, every task's four verification fields (`Falsifier`, `Red run`, `Disqualifier`, `Consumers`) are checked present with `n/a`/`none` rather than blank, and every gate asserting size, overflow, visibility, position, or containment is checked against the rendered-measurement checklist above.
- Any visual design context in the proposal — a Figma link, an agent-generated mockup under `docs/specs/<spec-path>/mockup/`, or a `.stitch/DESIGN.md` reference — is treated as approved input and drives the `Design Impact` guidance across requirements, design, and tasks.
- **Bug Mode:** when the spec is a bug (`Type: Bug`, a `bugfix/*` path, or framed as a defect), specify frames requirements around the corrected behavior from the confirmed root cause and **requires a regression test** — at least one task adds a test that is red before the fix and green after. The root cause is confirmed with `systematic-debugging` if no proposal diagnosis exists.
- The user approves requirements, design, and tasks before implementation begins.
- **Scope Chunking** mirrors `/akili-propose`'s manifest contract: splitting a proposal into children writes/updates the parent's `family.md` before any child folder exists. Running `/akili-specify` on a manifest-listed child reads that parent manifest first and warns (never blocks) if a dependency child isn't `done` yet.

## Next Step

After approval:

```text
/akili-execute <spec-path>
```
