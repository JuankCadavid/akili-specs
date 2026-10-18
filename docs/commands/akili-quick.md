# `/akili-quick`

Fast-track a genuinely trivial, low-risk change in one step, with minimal traceability and automatic escalation when the change is not actually trivial.

## Usage

```text
/akili-quick <short-change-name> [free-text description]
```

Examples:

```text
/akili-quick login-button-color make the primary login button use the brand accent token
/akili-quick hero-title fix the typo in the homepage hero title
/akili-quick pricing-paragraph add a short paragraph under the pricing table
```

## Use When

- The change is cosmetic or copy-only: text/label edits, color/spacing/style-token tweaks, small static markup additions.
- It changes no behavior, data, API, auth, or shared contract.
- It is small and local (~≤ 20 LOC, one component/file).
- It is not a video composition: it does not edit a HyperFrames composition or a file that renders to a video deliverable, however small or cosmetic the edit.
- Any visual change uses an existing approved token from `docs/ux-ui/design.md`.

Do **not** use it for real features, logic changes, bugfixes with behavior impact, or anything that introduces a new design token or pattern.

## Triviality Gate & Escalation

Before editing, the command checks all gate criteria. If any fails, it **stops and escalates**:

- Small but with logic, or a real bugfix → `/akili-specify <spec-path>` (Lite).
- A **bug** whose fix touches logic/behavior → `/akili-propose <name>` (Bug Track: diagnose the root cause first), then `/akili-specify` (Lite) in Bug Mode with a mandatory regression test. A purely cosmetic bug (e.g. a visible typo) may stay in `/akili-quick` when it passes every gate criterion, including *Not a video composition*.
- Fails *Not a video composition* (edits a HyperFrames composition, or a file that renders to the video deliverable) → `/akili-propose <change-name>`; a video edit needs render evidence that `/akili-quick` cannot produce, so it is never fast-tracked.
- Non-trivial, risky, cross-cutting, or uncertain → `/akili-propose <change-name>`.
- Needs a new design token/pattern → `/akili-propose` or `/akili-specify` so the token is designed, not improvised.

## Output

- The edit applied to the target file(s).
- A one-line entry appended to `docs/specs/quick/quick-log.md` (date, change, files, verification, commit).
- A commit prefixed `[SPEC:quick/<change-name>]`.

It does **not** create `requirements.md`, `design.md`, `tasks.md`, `execution.md`, `test-report.md`, or `validation-report.md`.

## Key Rules

- Traceability is not optional: every quick change gets a `[SPEC:quick/<name>]` commit and a log line.
- Respect design tokens — never hardcode a new value to "just make it match"; use the token or escalate.
- One change per invocation.
- When in doubt about triviality, escalate.

## Next Step

None required — the change is committed. If follow-up work grows beyond a trivial tweak, move it to `/akili-propose` or `/akili-specify`.
