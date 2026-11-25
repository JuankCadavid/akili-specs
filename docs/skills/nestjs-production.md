# `nestjs-production`

> **Answer first.** One of six official NestJS skills (MIT, by Kamil Mysliwiec), binding `stack`: it reaches an agent only through the project Skill Map or a per-task skill list, never through command text. It is vendored verbatim and hash-locked.

## Facts

| Field | Value |
|---|---|
| Author | Kamil Mysliwiec (NestJS) |
| License | MIT |
| Binding | `stack` |
| Upstream | https://github.com/nestjs/agent-skills, path `skills/nestjs-production/`, tag `v0.1.1` |
| Pin | `68e1d54a7c241ffd2bc37ea60df6f176fb66d3d4` (hash-locked; the pin moves only through the sync script and a new AKILI spec) |
| Source | `../../.claude/skills/nestjs-production/SKILL.md` |

## Purpose

Production setup with first-party packages: configuration and env validation, structured logs, observability with NestJS Observe, health and readiness checks, rate limiting, OpenAPI, graceful shutdown and deployment behind a load balancer.

## When it leads or supports

Supports `implement` on NestJS tasks that prepare an application for production.

## Use When

- Preparing a NestJS application for production.
- Adding configuration, health checks, rate limiting, OpenAPI or Observe to one.

## Observe note

The upstream text names NestJS Observe, a hosted service from the NestJS project. It has an Observability section for NestJS Observe: the package sends no telemetry until linked, tells the agent to ask the user to run `npx @nestjs/observe link` (never to write keys itself), and describes an optional Observe MCP server at `https://observe-api.nestjs.com/mcp` (Pro plan and above). AKILI vendors the text byte for byte and adds no instruction of its own; any Observe link or MCP step needs the user's approval.

## Upstream and license

Every upstream file is unchanged; only `SKILL.md` gains an AKILI `metadata` block. `UPSTREAM.md` in the folder lists a sha256 per file, `LICENSE` is the upstream MIT text and `NOTICE` records the source, commit and the modification statement. AKILI-SPECS is not affiliated with the NestJS project.
