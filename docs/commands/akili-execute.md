# `/akili-execute`

Implement the next eligible task from an approved spec path using the AKILI **Leader → Implementer → Reviewer** multi-agent harness. In Claude Code, a spec whose Approval Mode is `pre-approved` can additionally be driven to completion unattended with `/goal` — the command text's Step 5 carries the canonical condition template and its requirements.

## Usage

```text
/akili-execute <spec-path>
```

## Use When

- `requirements.md`, `design.md`, and `tasks.md` are approved.
- `.agents/` is in place (scaffolded by `/akili-constitution`).
- You want incremental, audited execution instead of broad untracked implementation.
- A previous task is marked `[~]` and should be resumed.

## Inputs

Reads:

- `docs/specs/<spec-path>/requirements.md`
- `docs/specs/<spec-path>/design.md`
- `docs/specs/<spec-path>/tasks.md`
- `docs/specs/<spec-path>/execution.md` when present
- `docs/specs/kaizen-log.md` when present — only the `## Active Lessons` digest; the Leader passes matching rows to the Implementer per task
- Constitution docs (`docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`)
- `CLAUDE.md` and `AGENTS.md`
- `.agents/leader.md`, `.agents/implementer.md`, `.agents/reviewer.md`

## Behavior

`/akili-execute` runs each task through a bounded rework loop. The caller acts as the **Leader** and delegates to two subordinate roles:

| Role | File | Responsibilities |
|---|---|---|
| Leader | `.agents/leader.md` | Picks the next task, delegates, enforces the loop, updates `tasks.md` and `execution.md`, commits |
| Implementer | `.agents/implementer.md` | Writes code strictly within task scope, applies design tokens, runs verification before reporting |
| Reviewer | `.agents/reviewer.md` | Read-only diff audit; emits `STATUS: PASS` or `STATUS: FAIL` with structured findings |

### Per-task loop

```text
1. Leader selects the next [ ] or [~] task whose dependencies are complete
2. Spawn Implementer with task scope, design context, and prior FAIL feedback (if rework)
3. Implementer writes code and runs the verification command
4. Leader extracts git diff
5. Spawn Reviewer with diff + relevant spec slices
6. Reviewer returns STATUS: PASS or STATUS: FAIL

if PASS  → append execution.md, then update tasks.md to [x], commit, advance to next task
if FAIL  → log issues; if attempts < 3, respawn Implementer with the unchanged Reviewer report
if 3 consecutive FAILs → HALT, mark task [~], present full audit trail
```

On PASS, if the task created a new module/package or moved a module boundary, the Leader also appends a `## Constitution Impact: <Task ID>` block to `execution.md` (child guide needed, parent `## Module Guides` index entry, pending CodeGraph re-index). `/akili-archive` consumes these notes during Constitution & Graph Sync.

### Reviewer output contract

On `FAIL`, every finding lists three fields so the Implementer has actionable instructions on the next loop iteration:

- **Discovered Issue** — what is incorrect or missing.
- **Violated Rule** — the specific spec document and section that the diff contradicts.
- **Remediation Suggestion** — what the next Implementer attempt must change.

## Outputs

- Focused code or documentation changes (only after Reviewer PASS).
- Updated `tasks.md` with `[x]`, `[~]`, or `[ ]` status.
- Updated `execution.md` with files changed, requirements covered, decisions, every Implementer attempt, every Reviewer verdict, verification evidence, and final status (PASS / HALT / pivot).
- Commit prefixed with `[SPEC:<spec-path>]`.

## Guardrails

- **Maximum retries.** Hard ceiling of 3 rework attempts per task. After 3 consecutive FAILs the loop HALTS and presents the audit trail.
- **Structured feedback.** The Reviewer's FAIL report is passed back unchanged to the next Implementer — no paraphrasing.
- **No scope creep.** The Implementer keeps changes minimal and within task scope; broad refactors require user approval.
- **No completion without PASS.** A task is never marked `[x]` until the Reviewer PASSes.
- **Pivot Protocol takes precedence.** If discovery proves the spec itself is wrong, the loop stops immediately and a `## Pivot Record` is opened in `execution.md` for user sign-off — rework retries are not consumed on a broken spec.

## Cross-tool support

The `.agents/` directory is pure Markdown + YAML frontmatter and is resolved relative to the active workspace.

- **Claude Code / OpenCode:** Leader delegates by spawning the Step 8E agent wrappers when present (each wrapper loads its own persona, so the Leader sends a pointer brief — task scope plus spec section anchors, not inlined content); without wrappers, it spawns focused subagent or sub-prompt contexts seeded with the persona file plus task/diff context.
- **Google Antigravity:** Leader calls `invoke_subagent` using prompts read from `.agents/`.
- **Codex:** if `.codex/agents/akili-implementer.toml` / `akili-reviewer.toml` exist (Step 8E), the Leader requests the named `akili-implementer` / `akili-reviewer` role by name with the brief — Codex itself spawns it, routes the work, and waits; the Leader consumes the consolidated result. Without wrappers, it falls back to a sub-prompt seeded with the persona file, as on the other hosts. **Observed live 2026-09-17 (codex-cli 0.154.0), undocumented API:** the Leader calls a `spawn_agent` tool with the wrapper's name as `agent_type`; the subagent's report returns to the Leader, inspectable with `/subagents`. Codex's default sandbox protects `.git/`, so the Step 3 commit needs an approval.

**Model checkpoint:** the Leader runs best on **T1**. If the project's `## Model Routing` registry maps T1 to a stronger model than the current session, switch with `/model` in Claude Code, the OpenCode model selector, or `/model` in Codex (which also sets reasoning effort when available — there is no separate `/reasoning` command; `Last verified: 2026-09-17` — <https://learn.chatgpt.com/docs/cli/slash-commands>). The registry is a floor, not a ceiling: if the session model is already the stronger one, this is a stale registry entry, not a reason to downgrade.

**Unattended Mode:** confirmed live 2026-09-17 (codex-cli 0.154.0) — Codex's `/goal` "keeps the goal attached to the active chat while work continues" (<https://learn.chatgpt.com/docs/cli/slash-commands>, `Last verified: 2026-09-17`), a persistent-target note, not a condition-evaluated loop like Claude Code's `/goal`. There is **no verified equivalent** to Claude Code's unattended looping for Codex — the same wording used for OpenCode — so run Codex sessions attended.

## Next Step

Continue executing tasks until implementation is complete, then run:

```text
/akili-test <spec-path>
```
