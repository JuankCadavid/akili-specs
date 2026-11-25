# `nestjs-feature`

> **Answer first.** One of six official NestJS skills (MIT, by Kamil Mysliwiec), binding `stack`: it reaches an agent only through the project Skill Map or a per-task skill list, never through command text. It is vendored verbatim and hash-locked.

## Facts

| Field | Value |
|---|---|
| Author | Kamil Mysliwiec (NestJS) |
| License | MIT |
| Binding | `stack` |
| Upstream | https://github.com/nestjs/agent-skills, path `skills/nestjs-feature/`, tag `v0.1.1` |
| Pin | `68e1d54a7c241ffd2bc37ea60df6f176fb66d3d4` (hash-locked; the pin moves only through the sync script and a new AKILI spec) |
| Source | `../../.claude/skills/nestjs-feature/SKILL.md` |

## Purpose

Adding or changing HTTP endpoints: modules, controllers and services, request validation (Zod or another Standard Schema library, or class-validator DTOs), status codes, error response bodies, request IDs, versioning and Server-Sent Events.

## When it leads or supports

Leads `implement` on NestJS; the other five support by activity. `/akili-specify` Step 2.1's no-map fallback names it.

## Use When

- Adding or changing endpoints in a NestJS application.
- Choosing validation, status codes or error bodies for an endpoint.

## Observe note

The upstream text names NestJS Observe, a hosted service from the NestJS project. Two reference files mention it: `references/http.md` says NestJS Observe adopts a well-formed incoming `x-request-id` as its trace id, and `references/structure.md` (rule 33) says to instrument from day one with NestJS Observe (`nestjs-production`). AKILI vendors the text byte for byte and adds no instruction of its own; any Observe link or MCP step needs the user's approval.

## Upstream and license

Every upstream file is unchanged; only `SKILL.md` gains an AKILI `metadata` block. `UPSTREAM.md` in the folder lists a sha256 per file, `LICENSE` is the upstream MIT text and `NOTICE` records the source, commit and the modification statement. AKILI-SPECS is not affiliated with the NestJS project.
