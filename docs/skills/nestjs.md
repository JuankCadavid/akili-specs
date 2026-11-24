# `nestjs`

> **Answer first.** One of six official NestJS skills (MIT, by Kamil Mysliwiec), binding `stack`: it reaches an agent only through the project Skill Map or a per-task skill list, never through command text. It is vendored verbatim and hash-locked.

## Facts

| Field | Value |
|---|---|
| Author | Kamil Mysliwiec (NestJS) |
| License | MIT |
| Binding | `stack` |
| Upstream | https://github.com/nestjs/agent-skills, path `skills/nestjs/`, tag `v0.1.1` |
| Pin | `68e1d54a7c241ffd2bc37ea60df6f176fb66d3d4` (hash-locked; the pin moves only through the sync script and a new AKILI spec) |
| Source | `../../.claude/skills/nestjs/SKILL.md` |

## Purpose

Foundation skill for NestJS work: starting a project non-interactively with the Nest CLI, project layout and the module system, where the current docs are, and the mistakes agents make in Nest apps that still pass their tests.

## When it leads or supports

Supports `implement` on NestJS for project start, layout and docs, and `module-design` for layout. It is the entry point that points to its five siblings; it leads nothing.

## Use When

- Creating a new NestJS application.
- Extending a NestJS application and needing the module and layout conventions.
- Looking up where the current NestJS docs live.

## Observe note

The upstream text names NestJS Observe, a hosted service from the NestJS project. Its text says the generated project sets up `@nestjs/observe` (`--no-observe` skips it) and that the package sends nothing until the project is linked with `npx @nestjs/observe link`. AKILI vendors the text byte for byte and adds no instruction of its own; any Observe link or MCP step needs the user's approval.

## Upstream and license

Every upstream file is unchanged; only `SKILL.md` gains an AKILI `metadata` block. `UPSTREAM.md` in the folder lists a sha256 per file, `LICENSE` is the upstream MIT text and `NOTICE` records the source, commit and the modification statement. AKILI-SPECS is not affiliated with the NestJS project.
