# Requirements: `AGENTS.md` as the Single Canonical Agent Guide

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/agents-md-canonical` |
| Depth | **Lite** — fixed by the user 2026-09-20: *"este repo + `/akili-constitution` y lo mínimo acoplado"* |
| Type | Change |
| Approval Mode | `gated` — inherited from `proposal.md` |
| Status | Draft — awaiting the Step 1.3 gate |
| Date | 2026-09-20 |
| Source | `proposal.md`, plus the user's four answers of 2026-09-20 |
| Format precedent | `docs/specs/archive/2026-09-19-changes--leader-brief-contract/requirements.md`. This repo has **no** `docs/specs/general-setup/` (`ls` → `No such file or directory`, run 2026-09-20); `docs/prd.md`, `docs/ux-ui/design.md` and `docs/trd/trd.md` do not exist here either |
| Adjacent specs | `changes/scoped-constitution-reads` (proposal only) owns `.claude/templates/implementer.md` and `tester.md`. **Serialized by exclusion** (NFR-3), not by waiting — per the user's instruction not to block on it |

## 2. Executive Summary

Claude Code reads `AGENTS.md` directly, so the mirrored `CLAUDE.md` the methodology mandates is no longer needed to serve two hosts. But Claude Code reads `AGENTS.md` **only when no `CLAUDE.md` exists at or above the working directory** — with both present it reads `CLAUDE.md` and ignores `AGENTS.md` entirely.

That single rule decides everything here: the mirror cannot be dropped by deletion, and a prose "see `AGENTS.md`" stub is not a compatibility shim but a **replacement** of the guide. The supported shim is an `@AGENTS.md` import.

**This repository is the proof case.** Root `AGENTS.md` (14,934 B) holds Release Rules, Skill Governance, the Multi-Agent Harness contract and the Concurrency protocol. Root `CLAUDE.md` (4,812 B) does not. Both exist, so **Claude Code loads only the smaller one today**.

## 3. Scope

**In scope (Lite):**

| Surface | Why |
|---|---|
| `.claude/commands/akili-constitution.md` | The only file that mandates both guides — 4 sites |
| This repo's root `CLAUDE.md` | Dogfooding; also fixes a live loading defect |

**Out of scope:** every other command and template (they reference the guides disjunctively and keep working), `bin/akili.js` (never touches either file — FR-4), all docs mirrors, `README.md`, and everything under `docs/specs/archive/**`, `docs/specs/kaizen/**` and `docs/plans/**` (historical records).

## 4. Functional Requirements

### FR-1: `/akili-constitution` stops mandating a parallel `CLAUDE.md`

`/akili-constitution` SHALL scaffold `## Model Routing` and `## Skill Map` into the project's root **`AGENTS.md` only**, and SHALL NOT require a root `CLAUDE.md` to exist.

- The four mandating sites (`:41`, `:455`, `:579`, `:1146`) SHALL be amended.
- The Verification Checklist item SHALL invert: from *"both files, not one"* to a check that the section exists in `AGENTS.md` **and is not duplicated** into a `CLAUDE.md` body.
- The command SHALL state the **v2.1.277 version floor** and the conditions under which `AGENTS.md` support is unavailable.

#### Scenario: A fresh project gets one guide

- GIVEN a project with no `CLAUDE.md` and no `AGENTS.md`
- WHEN `/akili-constitution` runs
- THEN `AGENTS.md` is created carrying `## Model Routing` and `## Skill Map`
- AND IT MUST NOT create a second guide holding the same two sections
- BUT it must NOT delete or overwrite a `CLAUDE.md` the project already had

### FR-2: Compatibility is an `@AGENTS.md` import, never a prose pointer

Where a `CLAUDE.md` is kept, it SHALL be an `@AGENTS.md` import with any Claude-specific content **below** the import.

- The command SHALL name a prose pointer (*"see `AGENTS.md`"`*) as a **defect**, because with both files present Claude Code reads only the `CLAUDE.md` — so a prose stub silently replaces the guide with itself.
- Symlinks SHALL NOT be offered: Edit/Write refuse to write through them, and a committed symlink checks out as plain text on Windows, which this repo supports.

#### Scenario: A project that must keep a `CLAUDE.md`

- GIVEN a project on a pre-v2.1.277 toolchain, or on Bedrock, or with `disableAllHooks`
- WHEN `/akili-constitution` runs
- THEN it writes a `CLAUDE.md` whose **first line** is `@AGENTS.md`
- AND IT MUST keep any Claude-specific instructions below that import
- BUT it must NOT write a second copy of `## Model Routing` or `## Skill Map` into it

### FR-3: This repository carries one policy body

This repo's root `CLAUDE.md` SHALL become an `@AGENTS.md` import plus only genuinely Claude-specific content, so `AGENTS.md` is the single policy body and is actually loaded.

#### Scenario: The governance document is loaded again

- GIVEN this repo, where `AGENTS.md` is 14,934 B and is not loaded because `CLAUDE.md` exists
- WHEN the change lands
- THEN a Claude Code session loads `AGENTS.md`'s content through the import
- AND IT MUST NOT leave two maintained copies of `## CodeGraph` or `## Skill Usage`
- BUT it must NOT delete `CLAUDE.md` outright, since that would break pre-v2.1.277 and Bedrock sessions

### FR-4: No installer change

`bin/akili.js` SHALL NOT be modified. It neither reads nor writes either guide.

## 5. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Bounded (Lite).** Zero diff outside `.claude/commands/akili-constitution.md` and this repo's root `CLAUDE.md` / `AGENTS.md`. `bin/akili.js`, `scripts/`, `package.json`, `.claude/templates/`, every other command, and all `docs/` mirrors are frozen |
| NFR-2 | **Non-destructive migration.** No existing project's `CLAUDE.md` is deleted; it is converted to an import |
| NFR-3 | **Serialized by exclusion.** `.claude/templates/implementer.md` and `tester.md` are untouched, so `changes/scoped-constitution-reads` can land before or after without conflict, and `/akili-constitution` is never broken in the meantime |
| NFR-4 | **No policy body is duplicated.** After the change, no two maintained files carry the same policy section |

## 6. Defect Classes → Gates

| Defect class this spec can produce | Gate | Falsifying input |
|---|---|---|
| A prose stub ships instead of an import, silently replacing the guide | `head -1 CLAUDE.md` is exactly `@AGENTS.md` | A first line that is prose |
| The both-files mandate survives at a site the change did not cite | `grep -n "both files"` and `grep -n 'AGENTS\.md` \*\*and\*\* `CLAUDE\.md'` → 0 | Any surviving hit |
| Policy is duplicated rather than consolidated | `comm -12` on the two sorted root guides — identical-line count drops from 27 | A count that stays at 27 |
| `AGENTS.md` is still not loaded after the change | **No automated check in this repo.** Substitute: a human check at the HITL pause — run `/context` in a new session and confirm the guide appears under Memory files | — |
| The version floor goes unstated and a consuming project loses its guide | `grep -c "2\.1\.277"` in the command ≥ 1 | 0 |

The fourth row is an **accepted, acknowledged gap**: whether Claude Code actually loads the file is a property of the host, not of this repository, and no command here can assert it.

## 7. Requirement ID Index

| ID | Name | Gate |
|---|---|---|
| FR-1 | Constitution stops mandating both | greps on the 4 sites + checklist read |
| FR-2 | Import, never prose; no symlink | read of the compatibility text |
| FR-3 | This repo carries one policy body | `head -1` + duplicate-line count |
| FR-4 | No installer change | `git diff --stat` on `bin/` empty |
| NFR-1..4 | Bounded / non-destructive / serialized / no duplication | `git diff --stat` + greps above |
