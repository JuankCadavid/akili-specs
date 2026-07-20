---
description: Fast-track a trivial, low-risk change (copy edit, color tweak, small style/text change) with minimal traceability and automatic escalation when it is not actually trivial.
license: MIT
metadata:
  author: Juan Carlos Cadavid (jcadavid.com)
---

# Fast-Track a Trivial AKILI-SPECS Change

Make a small, low-risk change in a single step — without generating the full `requirements.md` / `design.md` / `tasks.md` / `execution.md` / `test-report.md` / `validation-report.md` set — while still preserving AKILI's spec-to-code traceability through a `[SPEC:quick/<name>]` commit and a one-line log entry.

This command exists for changes that are genuinely trivial: change a button color, fix a title's text, add a paragraph, adjust a label, tweak spacing. It is **not** a shortcut for real features, bugfixes with logic changes, or anything touching data, API, auth, or shared contracts. When a change turns out to be bigger than it looked, this command **stops and escalates** to the proper flow.

> **Recommended model tier:** T2 Coder (a small, direct edit + verification). See the `## Model Routing` registry in the project's `AGENTS.md` / `CLAUDE.md`. No deep-reasoning tier is required for a trivial change.

## Usage

```
/akili-quick <short-change-name> [free-text description of the change]
```

**Examples:**

- `/akili-quick login-button-color make the primary login button use the brand accent token`
- `/akili-quick hero-title fix the typo in the homepage hero title`
- `/akili-quick pricing-paragraph add a short paragraph under the pricing table explaining the annual discount`

## Arguments

- `$ARGUMENTS` — a short kebab-case change name, optionally followed by a free-text description.
  - The first token is the change name → the traceability slug is `quick/<change-name>`.
  - The rest is the change description. If no description is given, ask the user for one before touching code.

---

## Triviality Gate (run FIRST)

Before making any edit, confirm the change qualifies as trivial. A change is eligible ONLY if **all** of these hold:

- **Cosmetic or copy-only:** text/label/content edits, color/spacing/style-token tweaks, static markup additions.
- **No behavior change:** no new or modified logic, control flow, conditionals, state, or side effects.
- **No data / API / auth / contract change:** no schema, endpoint, request/response shape, permission, or shared-package surface change.
- **Small and local:** roughly **≤ ~20 LOC** and confined to **one component/file** (or a couple of tightly related files).
- **Design-token safe:** any color/spacing/typography change uses an existing approved token from `docs/ux-ui/design.md` — not a new hardcoded value.

### Automatic Escalation

If the change fails **any** gate criterion, do **not** fast-track it. Stop and recommend the right entry point:

- Small but with logic, or a real bugfix → `/akili-specify <spec-path>` in **Lite** depth.
- A **bug** (something is broken, not just a cosmetic edit) whose fix touches logic or behavior → `/akili-propose <name>` so the root cause is diagnosed first (Bug Track), then `/akili-specify` (Lite) in Bug Mode with a mandatory regression test. A purely cosmetic bug (e.g. a visible typo) may stay in `/akili-quick`.
- Non-trivial, risky, cross-cutting, or uncertain scope → `/akili-propose <change-name>` first.
- Introduces a **new** design token or visual pattern not in `docs/ux-ui/design.md` → route through `/akili-propose` (Visual Reference) or `/akili-specify` so the token is designed, not improvised.

State clearly which criterion failed and which command to run instead. Never silently downgrade a real change into a quick edit.

---

## Behavior

### Step 0: Load Minimal Context

**Model checkpoint:** This phase runs best on **T2 Coder** (small direct edit, light verification). If the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) maps that tier to a model different from the current session model, tell the user in one line — e.g. *"This phase is T2 — the registry recommends `/model sonnet`; you are on opus"* — and offer to switch (`/model …` in Claude Code, the model selector in OpenCode) at the first approval pause. Never block on this; continuing on the current model is always allowed.

Keep context small — this is a trivial change, not a full spec run.

1. Read only what the change needs:
   - the target file(s) for the change
   - `docs/ux-ui/design.md` **only if** the change involves a color, spacing, typography, or other design token (to use the approved token)
   - root `CLAUDE.md` / `AGENTS.md` only if repo conventions are unclear for the edit
2. **CodeGraph over full reads:** if `.codegraph/` exists, use `codegraph_search` to locate the exact symbol/component instead of scanning files.
3. Do **not** read the full constitution set, `docs/prd.md`, or `docs/trd/trd.md` for a trivial edit.

### Step 1: Confirm & Make the Change

1. Restate the change in one sentence and confirm the target file(s) and the exact before/after (e.g. old hex/token → new token, old text → new text). If the description is ambiguous, ask one focused question — do not guess.
2. Apply the smallest possible edit that satisfies the request. No refactors, no adjacent "while I'm here" cleanups, no scope creep.
3. Preserve all unrelated code, comments, and formatting.

### Step 2: Verify

1. Run the lightest applicable check for the change:
   - a lint / type-check / build for the touched file(s), or
   - the component's existing test if one already covers the surface, or
   - a clear manual verification note when no automated check is practical (e.g. "renders the hero title as 'X'").
2. Do **not** author a new test suite here. If the change genuinely needs new test coverage, that is a signal it is not trivial → escalate per the gate.

### Step 3: Record Traceability & Commit

Preserve spec-to-code traceability with the minimum footprint:

1. Append a **one-line entry** to `docs/specs/quick/quick-log.md` (create the file with a header if it does not exist):

   ```markdown
   # Quick Changes Log

   One-line record of trivial, fast-tracked changes made with `/akili-quick`.

   | Date | Change | Files | Verification | Commit |
   |---|---|---|---|---|
   | 2026-07-19 | quick/login-button-color — use brand accent token on primary login button | src/components/LoginButton.tsx | `npm run lint` pass | [SPEC:quick/login-button-color] |
   ```

2. Commit with the AKILI spec-reference standard, using the quick slug:

   ```bash
   git commit -m "[SPEC:quick/<change-name>] <concise description>"
   ```

Do **not** create `requirements.md`, `design.md`, `tasks.md`, `execution.md`, `test-report.md`, or `validation-report.md` for a quick change.

### Step 4: Report to User

Generate a short, easy-to-understand summary (summary facil de entender de lo que se hizo) including:

1. what changed (before → after) and the file(s) touched
2. which design token was used, if applicable
3. the verification performed and its result
4. the traceability slug and commit prefix used
5. a reminder that if follow-up work grows beyond a trivial tweak, it should move to `/akili-propose` or `/akili-specify`

---

## Rules

- Traceability is not optional: every quick change gets a `[SPEC:quick/<name>]` commit and a one-line log entry.
- Respect design tokens: never hardcode a new color/size to "just make it match"; use the approved token or escalate.
- One change per invocation. Batch unrelated tweaks into separate `/akili-quick` runs or a proper spec.
- When in doubt about triviality, escalate. A wrongly fast-tracked change costs more than a Lite spec.
- Keep the edit and the context minimal — this command's whole value is speed and low token cost.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
