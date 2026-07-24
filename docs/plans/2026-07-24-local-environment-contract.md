# Proposal: Local Environment Contract

**Status:** Implemented (2026-07-24) — see `CHANGELOG.md` → Unreleased
**Date:** 2026-07-24
**Author:** Leader session

Add a **Local Environment contract** to the constitutional baseline: a tool-agnostic section in `docs/infrastructure.md` that captures how to start the project's local stack (database, backend, frontend) — with Docker Compose as the recommended primary route and a documented no-Docker fallback. Agents (Implementer, Tester, validators) consume the contract instead of guessing start commands from `package.json`.

## Decision summary

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | The methodology defines a **contract, not a tool** | Docker Compose is the recommended primary route, but not every user has Docker (or has it running); the contract always documents a fallback |
| 2 | Lives in `docs/infrastructure.md` as `## Local Environment` | The doc evolves from "deployment blueprint" to "environments blueprint — laptop to PROD"; one home, no new file |
| 3 | Pre-check before use, never block | `docker info` fails (daemon off / not installed) → tell the user and offer: start Docker, or use the fallback route |
| 4 | Local is disposable; cloud is governed | Agents may freely start/reset the local environment; deployments to cloud/PROD follow the existing infrastructure blueprint (TRD tier → components → ADR) and are **never improvised by agents** |
| 5 | No `/akili-deploy` automation for now | Deploys are high-risk; the governed blueprint + checklist yields more than premature automation |

## The contract (scaffolded shape)

| Element | Example |
|---------|---------|
| Primary route (recommended) | `docker compose up -d` |
| Fallback route (no Docker) | `npm run dev` + local Postgres or a cloud dev database |
| Pre-check | `docker info` — on failure, surface it and use/offer the fallback |
| Seed / reset data | explicit commands |
| Health check | how to know the stack is up |
| URLs / ports | frontend, backend, database |

## Where it lands

| Surface | Change |
|---------|--------|
| `/akili-constitution` Step 6 | Scaffold `## Local Environment` into `docs/infrastructure.md`; legacy mode derives it from evidence (existing compose files, `package.json` scripts); brand-new mode offers to scaffold a dev compose file; states the local-vs-cloud boundary rule |
| `/akili-constitution` Step 8 | Root guides briefly point agents at the contract |
| `/akili-execute` Step 2.1 | Tasks whose verification needs a running environment consult the contract + run the pre-check before spawning the Implementer |
| `/akili-test` Phase 1 | Integration/E2E suites get the contract in their context slice; pre-check happens at planning, not mid-suite |
| `/akili-validate` Phase 3 | Build Integrity may include an environment boot smoke per the contract |

## Out of scope

- No changes to the cloud/PROD sections of `docs/infrastructure.md` (Step 6 structure items 1–5 unchanged).
- No `/akili-deploy` command.
- No requirement that projects adopt Docker — the contract is satisfied by any documented primary + fallback pair.

## Implementation checklist

- [x] `/akili-constitution` Step 6: `## Local Environment` scaffold + legacy derivation + dev-compose offer + boundary rule.
- [x] `/akili-constitution` Step 8: root-guide reference to the contract.
- [x] `/akili-execute` Step 2.1: consult contract + pre-check for environment-dependent verification.
- [x] `/akili-test` Phase 1: contract in integration/E2E context slices.
- [x] `/akili-validate` Phase 3: optional boot smoke.
- [x] `CHANGELOG.md` → Unreleased.
