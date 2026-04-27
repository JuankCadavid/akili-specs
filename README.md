# sdd-jc-methodology

Portable Claude configuration for the SDD JC methodology.

## Contents

- `.claude/commands/`
  - `sdd-constitution.md`
  - `sdd-specify.md`
  - `sdd-execute.md`
  - `sdd-validate.md`
  - `sdd-test.md`
- `.claude/skills/`
  - `api-design-principles`
  - `aws-serverless`
  - `brainstorming`
  - `error-handling-patterns`
  - `frontend-design`
  - `nestjs-expert`
  - `product-manager-toolkit`
  - `react-doctor`
  - `shadcn-ui`
  - `stitch-design`
  - `systematic-debugging`
  - `tailwind-design-system`
  - `ui-ux-pro-max`
  - `vercel-react-best-practices`

## Install

Copy the repository `.claude/commands` and `.claude/skills` folders into your Claude configuration location.

## Workflow

Recommended command order:

1. `/sdd-constitution`
2. `/sdd-specify <spec-path>`
3. `/sdd-execute <spec-path>`
4. `/sdd-test <spec-path>`
5. `/sdd-validate <spec-path>`

## Spec Paths

Commands accept a relative path under `docs/specs/`, not only a flat module name.

Examples:

- `loan`
- `enhancements/renewals`
- `admin/user-management`

## Dependencies

Included skills cover the default methodology path, including `ui-ux-pro-max`.

Fallback rule:

- when `ui-ux-pro-max` is unavailable, use `frontend-design` + `stitch-design` for system-design work and `frontend-design` for UI validation/testing support.

## Methodology Contract

- `/sdd-constitution` establishes the project baseline docs and `docs/specs/general-setup/` templates.
- `/sdd-specify` must follow those templates when generating module specs.
- `/sdd-execute` implements tasks from an approved spec path.
- `/sdd-test` validates requirement-to-test traceability.
- `/sdd-validate` audits implementation conformance against the spec and constitutional baseline.

## Host Assumptions

- The host Claude environment can ask follow-up questions to the user during command execution.
- The host environment can load local skills referenced by the commands.
- Repository-specific build, lint, and test commands should be preferred over hardcoded stack assumptions.

## Notes

- Commands were sourced from the current global Claude command setup.
- Skills were copied with their bundled references and helper assets.
- This repository stores the current methodology baseline so it can be reused or versioned independently.
