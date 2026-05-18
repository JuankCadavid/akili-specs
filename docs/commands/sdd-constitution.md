# `/sdd-constitution`

Establish or strengthen the project-wide JCSPECS foundation.

## Usage

```text
/sdd-constitution
```

## Use When

- Starting a new repository.
- Existing project docs are missing, stale, or inconsistent.
- A major product pivot changed the project's baseline assumptions.
- Agents need stable `CLAUDE.md` and `AGENTS.md` guidance.

## Behavior

The command classifies the repository as a new or existing project.

For new projects, it drafts a baseline from user intent, stack choices, assumptions, and open questions.

For existing projects, it inspects repository reality before writing: docs, package manifests, code layout, routes, tests, architecture, visual patterns, and constraints. If `.codegraph/` exists, CodeGraph should be used for semantic exploration; if it is missing and available, the agent should ask before initializing it.

## Outputs

Creates or enhances:

- `docs/prd.md`
- `docs/system-design/design.md`
- `docs/detailed-design/detailed-design.md`
- `docs/specs/general-setup/requirements.md`
- `docs/specs/general-setup/design.md`
- `docs/specs/general-setup/task.md`
- `CLAUDE.md`
- `AGENTS.md`

## Skills Commonly Used

- `product-manager-toolkit`
- `ui-ux-pro-max`
- `frontend-design`
- `stitch-design`
- `nestjs-expert`
- `api-design-principles`
- `error-handling-patterns`
- `aws-serverless`
- `shadcn-ui`
- `tailwind-design-system`
- `vercel-react-best-practices`

## Next Step

After approving the baseline, start a change:

```text
/sdd-propose <change-name-or-spec-path>
```

For a small, obvious change, you may start with:

```text
/sdd-specify <spec-path>
```
