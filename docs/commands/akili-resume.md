# `/akili-resume`

Resume work after a session break by scanning active specs and presenting a multi-spec dashboard briefing.

## Usage

```text
/akili-resume
```

No arguments required. The command scans `docs/specs/` automatically.

## Use When

- After accidentally closing Claude Code, OpenCode, or Antigravity
- When switching between projects and need to remember where you left off
- At the start of a new session to get a quick status overview
- Before planning the next work session to see what's available

## Behavior

The command performs a four-step scan:

1. **Scan Active Specs** — lists all directories under `docs/specs/` (excluding `archive/`)
2. **Determine Phase & Progress** — for each spec, identifies current phase (PROPOSE → SPECIFY → EXECUTE → TEST → VALIDATE → ARCHIVE), task progress, last action, and blockers
3. **Present Dashboard** — shows a visual dashboard with progress bars and status for each active spec
4. **Recommend Next Command** — suggests the next command based on current phase

## Output

No files are created or modified. The command outputs a screen summary only.

### Single Spec

If only one spec is active, goes directly to a detailed briefing:

```text
📋 Resuming: changes/add-remember-me

Phase: EXECUTION
Progress: ██████░░ 6/8 tasks done

Last Action:
  Task 6 PASS — Implementer completed cookie persistence

Blocked: none

Ready to continue? Next eligible task:
  [ ] Task 7: Add remember-me checkbox to login form
```

### Multiple Specs

If multiple specs are active, presents a dashboard:

```text
📋 AKILI Active Specs (3 open)

1. changes/add-remember-me    [EXECUTION]  ██████░░ 6/8 tasks done
   Last: Task 6 PASS — Implementer completed cookie persistence
   Blocked: none

2. admin/user-management      [SPECIFY]    ████░░░░ Design approved, tasks pending
   Last: HITL menu — user approved design, pending task breakdown
   Blocked: none

3. bugfix/login-redirect      [VALIDATE]   ████████ 4/4 tasks done
   Last: Validation report — 1 WARN (missing edge case test)
   Blocked: none

Which spec do you want to resume? (or "all" for full briefing)
```

## Phase Detection

The command determines current phase by checking which files exist:

- `proposal.md` → PROPOSE
- `requirements.md` → SPECIFY
- `tasks.md` → EXECUTE
- `execution.md` with incomplete tasks → EXECUTE
- `test-report.md` → TEST
- `validation-report.md` → VALIDATE
- All tasks `[x]` and validation PASS → ready for ARCHIVE

## Next Command Recommendations

Based on current phase:

- PROPOSE → `/akili-specify <spec-path>`
- SPECIFY → `/akili-execute <spec-path>`
- EXECUTE → `/akili-execute <spec-path>` (continue next task)
- TEST → `/akili-test <spec-path>`
- VALIDATE → `/akili-validate <spec-path>` or `/akili-archive <spec-path>`
- ARCHIVE → `/akili-archive <spec-path>`

## Source

- `.claude/commands/akili-resume.md`
