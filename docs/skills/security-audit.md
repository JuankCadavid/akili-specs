# `security-audit`

**Binding `core`** — loaded by `/akili-security` for a full repository security audit. Vendored from Cloudflare (MIT), pinned at upstream commit `c1c8a8c`.

## Purpose

A defensive, source-first security workflow: find vulnerabilities that violate a real trust boundary, then give owners the source evidence, safe reproduction, priority, and smallest effective fix. A candidate without a concrete affected principal, resource, or security outcome is not a confirmed finding.

The skill has two operating modes:

| Mode | When | Effect |
|---|---|---|
| Guidance | Any security question or focused review | Uses only the relevant parts; creates no files |
| Full audit | Explicit audit/pen-test request, full review, or report artifacts | Runs all six phases and writes the audit artifacts |

Loading the skill never authorizes the complete workflow or file creation.

## Use When

- Running `/akili-security` (full repository audit).
- Answering a security question or doing a focused review outside the command (guidance mode).

## AKILI Integration

| AKILI moment | How the skill is used |
|---|---|
| `/akili-security` Steps 0-5 | Required skill; the command runs the complete audit workflow |
| A `confirmed` finding | Routed to the Bug Track via `/akili-propose bugfix/security-<date>-r<N>-s<n>` at the command's Step 5 routing gate; never fixed silently |
| Guidance mode | Applied as written, outside the command |

AKILI gates wrap the upstream workflow and never relax its scope, authorization, or safe-reproduction rules. The tracked index under `docs/specs/audits/` is redacted: identifiers, severity, and status only.

## Attribution and licence

| Item | Value |
|---|---|
| Author | Cloudflare, Inc. |
| Source | `https://github.com/cloudflare/security-audit-skill` (`skills/security-audit` @ `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`) |
| Licence | MIT, copied from the upstream repo root into `.claude/skills/security-audit/LICENSE` ("Copyright (c) 2025-2026 Cloudflare, Inc.") |
| Adapted by | Juan Carlos Cadavid — jcadavid.com, for AKILI-SPECS |

Only `SKILL.md` is edited (frontmatter plus an `## AKILI-SPECS Integration` section). Every other file stays byte-identical to upstream at the pin.

## File set (19 files)

`.claude/skills/security-audit/`:

- Method: `SKILL.md`, `RECONNAISSANCE.md`, `HUNTING.md`, `ATTACK-CLASSES.md`, `VALIDATION-AND-REPORTING.md`
- Domain guides: `AI-AND-LLM.md`, `CLIENT-SIDE.md`, `CLOUD-AND-DEPLOYMENT.md`, `DATA-ISOLATION-AND-LIFECYCLE.md`, `DESKTOP-MOBILE-AND-LOCAL-IPC.md`, `MEMORY-SAFETY-AND-BINARY.md`, `PROTOCOLS-RPC-AND-MESSAGING.md`, `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md`, `SUPPLY-CHAIN-AND-RELEASE.md`, `WEB-PROTOCOL-AND-AUTH.md`
- Validators and schema: `report-schema.json`, `validate-findings.cjs`, `validate-coverage-ledger.cjs`
- Licence: `LICENSE`

`test/security-audit-skill.test.js` locks this exact list.

## Platform support

`validate-findings.cjs` and `validate-coverage-ledger.cjs` open their input with `O_NOFOLLOW | O_NONBLOCK` and refuse to run when either `fs.constants` entry is missing (`OS no-follow and nonblocking input protection is unavailable`, exit 1). Neither entry exists on native Windows, so on Windows both validators always fail closed and no finding can be validated. `/akili-security` therefore stops in its preflight on native Windows (`process.platform` `win32`, or either constant `undefined`) and tells the user to run it from WSL, Linux or macOS. The validators are vendored byte-for-byte at the pinned commit and are deliberately not patched; `test/security-audit-skill.test.js` pins the fail-closed behaviour on Windows (CI evidence: run 39160826587, both Windows legs). The stop is lifted only through the *Windows gate* step of the re-sync procedure below; no wrapper, shim or patch to a vendored file ever substitutes for it. An upstream request is drafted in `docs/specs/changes/akili-security-followup/upstream-request.md` for the maintainer to file; it is not filed.

## Why the two upstream tests are excluded

The two `validate-*.test.cjs` upstream files are not packaged (spec `changes/akili-security`, DD-2, P-3):

- On Node 18, `node --test` runs any `*.test.cjs` under `.claude/` (measured: darwin 18.20.8 and `node:18` → `# tests 2`; Node 22.12.0 and 22.23.3 → `# tests 1`). That would execute them in this repo's CI and in any user project with a `--local` install whose `npm test` is `node --test`.
- The tests spawn child processes and write temp files (P-4).
- No upstream Markdown file references them (P-5), so excluding them leaves no dangling instruction.

AKILI-owned smoke cases in `test/security-audit-skill.test.js` replace them (DD-3).

## Re-sync procedure

1. Clone `cloudflare/security-audit-skill` at the new commit into an **empty** directory.
2. Diff `skills/security-audit/` against `.claude/skills/security-audit/`, and the upstream **repo-root** `LICENSE` against `.claude/skills/security-audit/LICENSE` (`skills/security-audit/` holds no `LICENSE`).
3. Copy every changed or new file **except** the `*.test.cjs` files, **plus the upstream repo-root `LICENSE`** (copied to `.claude/skills/security-audit/LICENSE`). Keep our `SKILL.md` frontmatter and `## AKILI-SPECS Integration` section; merge only upstream body changes into it.
4. Update the pin everywhere it appears: `SKILL.md` frontmatter (`source`, `version`), the command's Step 0.1 pin (the commit literal in `.claude/commands/akili-security.md`), `UPSTREAM_SHA` and the file list in `test/security-audit-skill.test.js`, this page, and `CHANGELOG.md`. The pin-sync test fails when the command, `SKILL.md` and `UPSTREAM_SHA` name different commits.
5. **Windows gate.** If the validators at the new pin still require `O_NOFOLLOW` and `O_NONBLOCK`, keep the preflight stop and the Windows test branch as they are. To lift the stop, push a candidate branch that removes the `win32` short-circuit from `NO_FOLLOW_UNAVAILABLE` in `test/security-audit-skill.test.js`. Remove the preflight stop only when that branch passes the non-fallback cases on both Windows CI legs (Node 18 and 22), and do it in the change that merges the branch. Never add a wrapper, shim or patch to a vendored file.
6. Run `npm test`.

The provenance check is necessary but not sufficient. The pin and frontmatter check catches a stale or unadapted copy, not a hostile one: a hostile copy can forge `adapted-for` and `source`, so a matching pin does not prove the loaded body is the vendored one. The command's own gates (no `git` in the target before Run, untrusted ref reading, run directory outside the target) are separate controls, and a matching pin never waives them.

## Acceptance checklist (governance)

| # | Item | Answer |
|---|---|---|
| 1 | Need | `/akili-security` Steps 0-5 (see above) |
| 2 | Binding declared | `core`, wired into `/akili-security` in the same change; `metadata.binding: core` |
| 3 | Attribution | Author, source, licence, `adapted-by` above |
| 4 | Size | One skill, 19 files, 262596 bytes in total (progressive disclosure across the domain guides rather than sibling skills); package growth bound is NFR-4 (≤ 320 KB) |
| 5 | Docs + CHANGELOG | This page; the row in [README.md](README.md); [governance.md](governance.md) *Current assignment*; CHANGELOG entry owned by the spec's FR-14 task |

## Source

- `../../.claude/skills/security-audit/SKILL.md`
