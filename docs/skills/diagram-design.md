# `diagram-design`

## Purpose

Fills the diagram slots of AKILI baseline and spec documents as inline Mermaid (the source of truth) and, only when the `archify` skill is available, links an interactive HTML view under each block. Without Archify the document is still complete.

## Use When

- `/akili-constitution` writes the PRD, UX/UI design, and TRD (C4 Context and C4 Container are always filled).
- `/akili-specify` drafts an architecturally significant `design.md`.
- `/akili-archive` summarises the diagram links a spec produced and flags baseline slots its design made stale.

## Best Paired Commands

- `/akili-constitution` Steps 3–5.
- `/akili-specify` Step 2.1.
- `/akili-archive` Step 2 (summary).

## Archify (optional)

Interactive views are rendered by [Archify](https://github.com/tt-a1i/archify) by tt-a1i, MIT licence. It is referenced, never vendored: the skill ships no Archify file. Installing it is your own choice (the command is in the root `README.md`); if it is absent, slots stay Mermaid-only and no command is blocked.

## Source

- `../../.claude/skills/diagram-design/SKILL.md`
- `../../.claude/skills/diagram-design/references/slot-catalog.md`
