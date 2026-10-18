# Proposal — `/akili-security`: repository security audit on Cloudflare's `security-audit` skill

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security` |
| Slug | `akili-security` — derived from free-text argument (the request named the candidate command `/akili-security`) |
| Type | **Change** |
| Approval Mode | gated (the user asked for one approval per phase: propose → specify → execute) |
| Date | 2026-10-18 |
| Author | AKILI session (proposer) |
| Status | **Approved** — 2026-10-18 (Juan Carlos Cadavid, via the Methodology agent): option A; open questions 1, 2, 4 take the recommended default; Q3 reversed at specify (tests not vendored — P-3, design DD-2); Q5 deferred (design DD-7) |
| Related | `/akili-audit` (`.claude/commands/akili-audit.md`), `/akili-seo` (domain-command precedent), `docs/skills/governance.md` |
| Upstream source | `https://github.com/cloudflare/security-audit-skill` @ `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` (2026-09-14, "Clarify guidance and full audit modes"), path `skills/security-audit/` |
| Depends on | none |
| Parallel-safe | **no** — edits `.claude/commands/` (command count), `docs/model-routing.md` + `.claude/templates/model-routing.section.md`, and `test/install-cursor.test.js` count assertions, all shared with any spec that adds a command or skill |
| Worktree / release | `skill-security-audit` worktree only; local `[SPEC:changes/akili-security]` commits; **no push, no release, no npm publish** in this cycle |

## Intent

Give AKILI projects a defensible way to **discover vulnerabilities in a repository**: a new `/akili-security` command that runs Cloudflare's MIT-licensed `security-audit` skill (multi-phase, independently verified, schema-validated findings), gates any execution of the audited code behind the user, and turns confirmed findings into specs only through the normal approval path.

## Answer first (the five decisions this proposal asks you to approve)

| Question | Recommendation | One-line reason |
|---|---|---|
| New command or activation of `/akili-audit`? | **New command `/akili-security`** | Different input (code, not specs), different artifacts, different safety contract and cost — the same reasons `/akili-seo` is its own command |
| Where in the cycle? | **Standalone, like `/akili-audit` and `/akili-seo`** — recommended after `/akili-validate` on specs touching security surfaces, and periodically on the whole repo | A six-phase multi-agent audit is too heavy for the per-task `/akili-execute` loop |
| Output | Upstream artifacts **outside the repo** (upstream default); a **redacted index** in `docs/specs/audits/security-<date>…md` | Committing exploit detail into `docs/specs/` is a disclosure risk; the index keeps traceability |
| Skill binding | **`core`** (hard-wired to `/akili-security`), Level 2 integration section | The command would be wrong without it (governance: *a skill earns `core` only when a command step would be wrong without it*) |
| Execution of audited code | **Static-only by default; one explicit HITL gate per run** to allow sandboxed execution, never auto-passed by pre-approved mode | Upstream already forbids unsandboxed execution; AKILI adds the human gate |

## Problem / Current Behavior

- AKILI ships 11 commands and none of them audits code for vulnerabilities — `ls .claude/commands` (11 files, as run 2026-10-18); `grep -n security .claude/commands/*.md` returns only incidental mentions (review intensity, TRD NFRs, validation checklist).
- `/akili-audit` is **spec↔code drift**, not security: "Detect and report drift between the project's specifications (PRD, UX/UI Design, and TRD) and the actual implementation" — `.claude/commands/akili-audit.md:11`. Its only security touchpoint is "Technical Constraints Violation … security rules … documented in `docs/trd/trd.md`" — `akili-audit.md:53`, i.e. conformance to declared rules, not discovery.
- Security today enters only per task, inside `/akili-execute`: predicate (f) "The task touches a security, authentication, or data-loss surface" (`.claude/commands/akili-execute.md:234`) and *Parallel lens reviewers* for security tasks (`akili-execute.md:277`). Both review **the diff of one task**, never the repository, and never pre-existing code.
- `/akili-validate` checks "security and authorization boundaries for protected flows" (`.claude/commands/akili-validate.md:126`) — again scoped to the spec under validation.
- No packaged skill covers security: `ls .claude/skills` (24 skills, as run 2026-10-18) has none; `docs/skills/governance.md` *Current assignment* lists none.

### Upstream skill — what we would vendor (as read at `c1c8a8c`)

| Aspect | Finding | Source |
|---|---|---|
| License | MIT, "Copyright (c) 2025-2026 Cloudflare, Inc." | upstream `LICENSE` |
| Author | Cloudflare (contributors via PRs #2, #3, #4, #6, #12) | `git log` upstream |
| Layout | One skill dir: `SKILL.md` (192 lines) + 13 companion `.md` (phase docs + 10 attack-class domains) + `report-schema.json` + 2 validators `.cjs` + 2 validator tests `.test.cjs` | `wc -l skills/security-audit/*` |
| Size | 348 KB on disk (56 KB of it the two `.test.cjs`); 5 276 lines | `du -sk`, `wc -l` |
| Runtime deps | **None.** Validators `require` only `fs`/`path`/`util`; **no** `child_process`, network, or `fs.write*` — read-only openers (`openSync`/`fstatSync`/`readSync`) | `grep require\|child_process\|fetch\|fs\.` over `validate-*.cjs` |
| Validator CLI | `node validate-findings.cjs <findings.json>`, `node validate-coverage-ledger.cjs <ledger.json>`, exit code = result | `validate-findings.cjs:5,773`; `validate-coverage-ledger.cjs:5,872` |
| Modes | **Guidance** (default; no files, no six phases) vs **Full audit** (explicit request; all six phases, writes artifacts) | upstream `SKILL.md` *Operating modes* |
| Phases | 1 Recon → 2 coverage-led hunting waves → 3 fresh-verifier candidate validation → 4 `findings.json` + schema/validators → 5 independent record verification → 6 `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md` | `SKILL.md` *Full audit workflow* |
| Verdicts | `confirmed` (trace + observed result + severity + remediation), `needs_validation` (exact unresolved blocker, **no severity**), `rejected` | `report-schema.json`, `SKILL.md` *Separate priority from certainty* |
| Output location | Default `~/security-audit-skill/<repo-name>/run-<N>`, **outside the target**; inside only if the user picks a VCS-ignored dir | `SKILL.md` *Full audit setup* |
| Execution safety | Target code runs **only** in an OS-enforced sandbox (no network, allowlisted env, read-only target, resource limits); else the lead stays `needs_validation`. No dependency installs, no live endpoints | `SKILL.md` *Universal execution safety* |
| Cost | Profiles `quick` / `standard` / `deep`; optional `budget` = max agent invocations; "a single run found roughly half of the vulnerabilities that repeated runs found" | `SKILL.md` *Run profiles*, *Cost budget*; upstream `README.md` |
| Host assumptions | Agent-neutral roles (Parent, Task tool, `research`/`general` agents); requires "parallel sub-agents" | `SKILL.md` *Platform terminology*; `README.md` *Requirements* |

## Proposed Outcome

1. A user runs `/akili-security [scope] [--profile quick|standard|deep] [--budget N] [--out <dir>]` in any AKILI project.
2. The command resolves target, scope, profile, budget and output dir, shows a **pre-run plan** (estimated agent invocations, output location, execution policy) and stops for approval.
3. It runs the vendored skill in **full audit mode**, static/source-only unless the user approved the **execution gate** for this run *and* the host can enforce the upstream sandbox.
4. It runs both validators (trusted, shipped by AKILI, reading only the output dir) and refuses to report until they pass or the run is recorded `incomplete` with its reason.
5. It writes a **redacted index** at `docs/specs/audits/security-<YYYY-MM-DD>[-<safe-branch>][-N].md`: run id, source ref, profile, coverage statement, counts by verdict and severity, fingerprints + titles + severity only, and the path to the full external artifacts.
6. At a HITL gate the user picks which `confirmed` findings become specs; each routes to `/akili-propose` as a **Bug** (Bug Track), the finding's trace pre-filling the reproduction and root-cause evidence. Nothing is auto-created.

## Scope

- **Vendor** `skills/security-audit/` at the pinned commit into `.claude/skills/security-audit/`, upstream `LICENSE` copied alongside, AKILI frontmatter added (original fields preserved), and an `## AKILI-SPECS Integration` section (Level 2).
- **New command** `.claude/commands/akili-security.md` (thin orchestration wrapper: setup, gates, validators, index, routing; the method stays in the skill).
- **Execution gate** semantics: static-only default; one per-run HITL to permit sandboxed execution; listed among the gates pre-approved mode never auto-passes.
- **Index report** in `docs/specs/audits/` with a `security-` prefix — and the existing readers of that folder (`/akili-archive` drift source `akili-archive.md:83`, `/akili-audit` *Reading reports back* `akili-audit.md:79`) scoped to `drift-*` so a security index is never read as a drift report (**KZ-004**: a new artifact in an existing folder must name which terminal branch every scanner of that folder lands it in).
- **Model routing**: one `/akili-security` row in `docs/model-routing.md` and `.claude/templates/model-routing.section.md` (proposed **T1 + T3**: orchestration/recon judgment T1, verifiers T3 on a model ≠ the hunters').
- **Docs + governance**: `docs/skills/security-audit.md`, row in `docs/skills/README.md`, `governance.md` *Current assignment* (`core`), `docs/commands/akili-security.md` + `docs/commands/README.md`, `README.md` command list, `docs/flow.md` artifact table, `AGENTS.md` *Skill Usage* line, `CHANGELOG.md` `Unreleased` entry.
- **Tests**: update the hard-coded counts the new command and skill change (`test/install-cursor.test.js:249` "11 packaged commands", `:340` "210 files", `:387` "24 skill directories"; `test/fixtures/doctor-codex-baseline.txt` if it lists commands) and add an install assertion that the skill's non-Markdown payload (`.cjs`, `.json`, `LICENSE`) lands on every host.

## Non-Goals

- **No** fork of the method: phase prompts, attack classes, schema and validators ship byte-identical to upstream (only `SKILL.md` gains frontmatter + an appended integration section).
- **No** change to `/akili-execute`'s per-task security lens or to `/akili-validate` (a later, separate proposal may add a one-line "consider `/akili-security`" recommendation).
- **No** sandbox implementation in AKILI. If the host cannot enforce the upstream controls, the run stays static and leads stay `needs_validation` — exactly upstream's rule.
- **No** live probing, dependency installs, or network calls against the target (upstream forbids them; AKILI does not relax that).
- **No** automatic spec creation, fixing of target code, or kaizen mechanics beyond what an archived Bug spec already gets.
- **No** release, push, or npm publish in this cycle (a later minor release, per the user's rules).
- **No** CI/SARIF export, GitHub code-scanning upload, or scheduled runs.

## Affected Users, Systems, And Specs

| Area | Effect |
|---|---|
| AKILI users (all 5 hosts) | New command + skill after install |
| `bin/akili.js` installer | **No code change expected** — skills are copied recursively (`copyDirectoryContents`, `bin/akili.js:638`, invoked at `:806`), so `.cjs`/`.json`/`LICENSE` ship as-is; commands are enumerated by `*.md` (`:453`). Confirmed in specify with a dry-run per host |
| npm package | `files` includes `.claude/skills` (`package.json:18`) → +~348 KB unpacked (or ~292 KB without upstream tests — see open question 3) |
| `npm test` | Vendored `*.test.cjs` under `.claude/` are **not** auto-discovered: a probe `.claude/skills/a/x.test.cjs` gave `# tests 0` under `node --test` (Node v22.12.0, as run 2026-10-18). CI runs other Node versions — re-probe in specify |
| `/akili-archive`, `/akili-audit` | Reader rule scoped to `drift-*` (Scope bullet above) |
| Model routing docs/template | One new row; template digest refreshed by the next release script run, not here |
| Active specs | `bugfix/pty-harness-ubuntu-flake` (test/CI only — no shared file), `changes/review-intensity-trial-terms` (proposal only) — no conflict |

### Install across the five hosts

| Host | Command lands as | Skill lands at | Sub-agents for the six phases | Note |
|---|---|---|---|---|
| Claude Code | `commands/akili-security.md` | `skills/security-audit/` (Claude root) | Task tool | Native fit |
| OpenCode | `commands/akili-security.md` | `skills/security-audit/` (OpenCode root) | task/subagents | `UNVERIFIED — confirm at source before relying on it` (parallelism limits) |
| Antigravity | command per its layout | 3 skill roots (`bin/akili.js:167-170`) | `invoke_subagent` | `UNVERIFIED` |
| Codex CLI | skill `~/.agents/skills/akili-security/SKILL.md` | **shared** `~/.agents/skills/security-audit/` (`bin/akili.js:127`) | Codex agents | `UNVERIFIED`; **name collision risk** (below) |
| Cursor | skill under shared root | **shared** `~/.agents/skills/security-audit/` (`bin/akili.js:139`) | Cursor agents | Same collision risk |

Where a host cannot spawn independent sub-agents, the command must **not** fake independence: it falls back to upstream **guidance mode** (no `confirmed` without a fresh verifier) and says so.

## Visual Reference

- Source: None
- Location: n/a
- Notes: CLI/methodology change with no UI surface.

## Requirement Delta Preview

### ADDED Requirements

- `/akili-security` runs the vendored `security-audit` skill in full audit mode over the current repository or a scoped subset, with profile and budget.
- A pre-run plan (scope, profile, estimated invocations, output dir, execution policy) is shown and approved before any agent is spawned.
- Target-controlled code (builds, tests, fixtures) is never executed without a per-run HITL approval **and** an enforceable sandbox; otherwise the run is static-only. Pre-approved Approval Mode never auto-passes this gate.
- Full artifacts are written outside the repository by default; inside it only to a user-chosen, VCS-ignored directory (upstream rule kept).
- Both upstream validators must pass, or the run is recorded `incomplete` with its reason, before any report is written.
- A redacted index `docs/specs/audits/security-<YYYY-MM-DD>[-<safe-branch>][-N].md` records the run (no exploit detail, no secrets).
- Confirmed findings become specs only via a HITL selection that routes each to `/akili-propose` as a Bug; `needs_validation` findings are listed with their blocker; `rejected` stay in the external artifacts only.
- Re-runs read prior runs (upstream additive behavior) from the same external output root.

### MODIFIED Requirements

- `/akili-archive` and `/akili-audit` select "the most recent report under `docs/specs/audits/`" among `drift-*` files only.
- Model-routing phase table gains `/akili-security`.

### REMOVED Requirements

- None.

## Approach Options

| | A. New `/akili-security` + `core` skill | B. Activation of `/akili-audit` (`/akili-audit security`) | C. Skill only, `conditional` (no command) |
|---|---|---|---|
| Fit with AGENTS.md | "No per-type command" governs **request types** (Bug/Change/Trivial routed by `/akili-propose`); kaizen Apply Mode is an activation because it is the **same loop over the same artifacts**. Security shares neither with drift → a domain command, as `/akili-seo` already is | Matches the activation pattern literally, but stretches it: different inputs, artifacts and gates under one name | No command to justify |
| Contract clarity | Own checklist, gates and output | `/akili-audit`'s checklist ("all drift categories swept", Conformance Matrix, "Nothing was edited") does not apply to a security run; two contracts in one 146-line file | Unclear who runs the six phases |
| Cost safety | Cost is visible and opt-in | A user asking for drift could trigger a 10–50-agent run by flag confusion | Loading a full-audit skill inside a task loop multiplies spawns |
| Governance | `core` wired to one command step — passes checklist item 2 | `core` wired to an activation — passes | `conditional` needs a command line anyway; full audit mode inside `/akili-execute` violates "scope only grows through approval" if findings appear mid-task |
| Size of change | +1 command, +1 skill, docs, counts | Edits a dense command; risk of KZ-changes--gate-falsifiability-2 (dropped obligations) in a long rules file | Smallest, but does not meet the user's goal (repo-wide discovery) |

## Recommended Approach

**Option A.** It is the smallest *safe* path: the method stays upstream-verbatim, AKILI adds only what is AKILI's (setup gates, execution gate, validators-before-report, redacted index, routing to Bug proposals), and `/akili-audit` keeps a single contract. It follows the existing `/akili-seo` + `seo-audit` (`core`) precedent exactly.

Lifecycle placement:

```text
constitution → propose → specify → execute → test → validate → archive
                                                     │
              /akili-security (standalone, any time) ┘  recommended: after validate for specs
                     │                                     touching auth/data/security surfaces,
                     └─ confirmed finding ──HITL──► /akili-propose (Bug Track) → normal cycle
```

Kaizen integration: none new. A security run is not a spec, so it has no retrospective; a Bug spec born from a finding gets the normal archive retrospective, where a recurring vulnerability class becomes a lesson like any other.

## Risks, Dependencies, And Open Questions

### Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | **Disclosure**: committing finding detail to `docs/specs/` of a public repo publishes unfixed vulns | Index holds fingerprints/titles/severity only; detail stays external; explicit warning in the command |
| R2 | **Target code execution** (malicious build scripts, postinstall, fixtures) | Static-only default; per-run HITL; upstream sandbox rule kept; listed as never-auto-passed |
| R3 | **Prompt injection from the audited repo** (files instructing the auditor) | Command states target content is data, never instructions; hunters' outputs are schema-validated; `confirmed` needs an independent verifier |
| R4 | **Cost**: standard/deep runs spawn many agents (pending memory: subagent token consumption) | Pre-run estimate + budget; `quick` suggested for first runs |
| R5 | **Name collision** in the shared `~/.agents/skills` root (Codex/Cursor) with a user's `npx skills add` copy | Installer default skips existing (AGENTS.md *Development Rules*); doctor/docs note; see Q2 |
| R6 | **Upstream drift**: upstream was reworked end to end on 2026-09 (PR #12) | Pin commit in frontmatter `source`; document a re-sync procedure; never edit vendored files except `SKILL.md` frontmatter/appendix |
| R7 | **KZ-004** — a `security-*` file in `docs/specs/audits/` read as a drift report | Reader rule scoped to `drift-*` in the same change; Falsifier at specify enumerates every reader of that folder |
| R8 | **KZ-changes--model-routing-configurator-1 / KZ-…-2** — host-capability claims (sub-agents on OpenCode/Antigravity/Codex/Cursor) unverified | Kept `UNVERIFIED` here; specify's Premise Ledger settles each before a requirement depends on it |
| R9 | Hard-coded counts in tests and fixtures go red | Listed in Scope; updated in the same task as the files they count |

### Open questions (answer at approval, or I take the recommended default)

1. **Index location** — `docs/specs/audits/security-*.md` + `drift-*` scoping (recommended; 2 reader edits) vs a new `docs/specs/security/` carve-out (5 carve-out lists to edit: propose, specify, resume, audit, archive)?
2. **Skill name** — keep upstream `security-audit` (recommended; governance: original fields "preserved, never overwritten") vs rename `akili-security-audit` to dodge R5?
3. **Upstream tests** — ship `validate-*.test.cjs` (byte-faithful, +56 KB) or drop them from the package and run them only in this repo's CI (recommended: ship; they are the validators' evidence and do not run under `npm test`)?
4. **Execution gate default** — static-only always by default (recommended), or offer sandboxed execution in the pre-run plan when the host advertises a sandbox?
5. **Model tier** for the row — T1 + T3 (recommended) vs T3 + T2?

### Dependencies

- Node.js on the user's machine for the validators (already an AKILI CLI requirement).
- Hosts with independent sub-agents for full audit mode; others degrade to guidance mode.

## Success Criteria

- `node bin/akili.js install --tool all --dry-run` lists `akili-security` and every file of `security-audit/` (including `.cjs`, `.json`, `LICENSE`) for all five hosts; `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` green.
- Vendored files other than `SKILL.md` are byte-identical to upstream `c1c8a8c` (checksum comparison recorded in `execution.md`); `SKILL.md` differs only by added frontmatter keys and an appended integration section.
- A dogfood `quick` run of `/akili-security` on this repository produces validator-passing `findings.json`, a redacted index under `docs/specs/audits/`, and executes **no** target code without the gate.
- `docs/skills/governance.md` acceptance checklist items 1–5 each answered with evidence in the spec.
- `/akili-archive`'s drift-source rule ignores a `security-*` file placed in `docs/specs/audits/` (falsifier run, not predicted — KZ-changes--leader-brief-contract-2).

## Next Step

After approval:

```text
/akili-specify changes/akili-security
```

(standard depth; `judgment-day` blind review recommended because the change adds a safety gate.)
