# Requirements: `akili init` — Ctrl-C exits 130, cleanly, on every Node

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/init-ctrlc-abort` |
| Depth | **Lite** (Bug Mode) |
| Type | Bug |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Status | **Approved** — 2026-10-18 (Juan Carlos, Phase 1 gate: Continue; Node 18 via CI accepted) |
| Date | 2026-10-18 |
| Source | `proposal.md` (approved 2026-10-18, Option A, commit `2e6de45`) |
| Format precedent | `docs/specs/bugfix/pty-harness-ubuntu-flake/requirements.md`. This repo has no `docs/specs/general-setup/`, `docs/prd.md` or `docs/trd/` (`ls`, as run 2026-10-18) |
| Verified at | `2e6de45` (every `file:line` below) |
| Deviations from proposal | none |

## 2. Executive Summary

Ctrl-C at either `akili init` question SHALL end the process with one newline and exit code `130`. It SHALL print no stack trace and install nothing. This SHALL hold on Node ≥ 22.23 (today: `AbortError` trace, exit 1) and on Node ≤ 22.12 / 18 (today: silent exit 0). Normal answers and `akili routing`'s existing Ctrl-C behavior stay exactly as they are.

## 3. Glossary

| Term | Meaning |
|---|---|
| Wizard question | One of the two `rl.question` prompts in `runInteractiveInit`: tool (`bin/akili.js:2048`) and scope (`:2069`) |
| Trace line | A line of output that matches `^\s+at ` (a stack frame) |
| Install target | Any of `.claude`, `.config/opencode`, `.gemini`, `.codex`, `.cursor`, `.agents` under `HOME` (global scope) or the working directory (local scope) (`bin/akili.js:2091–2110`, `if (isLocal)` block) |

## 4. System Context & Scope

- Node 22.23.3: Ctrl-C at either question prints `AbortError: Aborted with Ctrl+C` plus frames and exits 1. Node 22.12.0: Ctrl-C exits 0 with no output. Both versions install nothing (proposal → *Reproduction Steps*, `expect` run 2026-10-18 on both versions × both questions).
- Node 18: `UNVERIFIED — confirm at source before relying on it`. Settled by the CI `node: [18, 22]` matrix (`.github/workflows/ci.yml:31`) at T1's CI run, or by a local `nvm install 18` run (owner: T1).
- `akili routing` already does the corrected behavior for its typed questions (`makeRoutingIo.ask`, `bin/akili.js:2319–2344`; `runRouting` catch → `process.exitCode = 130` at `:2384`).
- When stdout is a TTY, `init` runs the update check first (`checkForUpdates`, `bin/akili.js:1926–1928`). That check hits `registry.npmjs.org` unless `$HOME/.akili-specs-update.json` holds a `checkedAt` under 24 h old (`readUpdateCache`, `:1849–1862`; `getLatestVersion`, `:1910–1915`).
- **Out of scope** (approved as follow-ups 2026-10-18): stdin EOF before an answer (today a silent exit 0 that installs nothing), and a top-level `main().catch`. Also out of scope: any wizard redesign.

## 5. Stakeholders / Personas

| Who | Needs |
|---|---|
| First-run user (`npx akili-specs init`) | Ctrl-C to quit the wizard without a crash dump |
| Script or CI that checks the exit code | Ctrl-C to read as an interruption (130), never as success (0) |

## 6. Functional Requirements

### FR-1: Ctrl-C at a wizard question aborts cleanly with exit 130

The system SHALL end the process with exit code `130` when the user presses Ctrl-C at either wizard question, after writing one newline. No trace lines and no install targets.

#### Scenario: Ctrl-C at the tool question, Node ≥ 22.23 (the reproduced trace)

- GIVEN `akili init` on a real terminal under Node 22.23.3, at the `Which tool do you want…` prompt
- WHEN the user presses Ctrl-C
- THEN the shell reads exit code `130`
- BUT it must NOT print `AbortError` or any trace line
- AND IT MUST create no install target

#### Scenario: Ctrl-C at the scope question, Node ≤ 22.12 (the reproduced silent 0)

- GIVEN `akili init` under Node 22.12.0, after answering `1` to the tool question, at the `globally or locally` prompt
- WHEN the user presses Ctrl-C
- THEN the shell reads exit code `130`, not `0`
- AND IT MUST create no install target

Each scenario SHALL also pass with the question and the Node version swapped. The regression test covers both questions, and each runtime in the CI matrix runs it.

### FR-2: Answered wizard behaves as before

The system SHALL keep the two prompts' text and the answer → install mapping unchanged (`1–7` → tool, `2` → local, anything else → `claude` / global).

#### Scenario: Both questions answered

- GIVEN `akili init` with the tool question answered `1` and the scope question answered `1`
- WHEN the wizard finishes
- THEN it runs the global Claude Code install, as it does today, and exits `0`
- BUT it must NOT add any prompt, default marker or trailing text to either question

### FR-3: `akili routing` Ctrl-C is unchanged

The system SHALL keep `akili routing`'s typed-question Ctrl-C at exit `130`, with nothing written and no trace, on every supported Node (routing-keyboard-select FR-5). The shared abort handling (proposal Option A) must not regress it.

#### Scenario: Routing typed question

- GIVEN the existing pty case for a typed routing question (`test/routing-pty.test.js`, `pty-fallback.exp`)
- WHEN the suite runs after the change
- THEN the case passes with `RC=130`, as it does at `2e6de45`

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | The regression test MUST make no network call. Its scratch `HOME` is seeded with a fresh update cache, and the test checks the seed is still byte-identical after the run. |
| NFR-2 | The regression test runs on a real pty through `expect`. It MUST skip on Windows with a printed reason, MUST copy its transcripts to `AKILI_PTY_LOG_DIR` when that is set, and MUST live in its own test and fixture files (not in `test/routing-pty.test.js`). |
| NFR-3 | No new dependency: `package.json` keeps declaring no `dependencies`. |

### Defect classes → gate

| Defect class | Gate |
|---|---|
| Trace or wrong exit on Ctrl-C (FR-1) | New pty test: `RC=130`, zero trace lines, no install target. It must fail at `2e6de45` on 22.23.3 (trace/RC=1) and on 22.12.0 (RC=0) |
| Fix covers one Node branch only | The same test run locally on 22.23.3 **and** 22.12.0. Node 18 through CI (FR-1 → *UNVERIFIED* row) |
| Wizard prompt/mapping drift (FR-2) | Pty test of the answered path (prompt text and the target it creates) |
| Routing regression from the extraction (FR-3) | `npm test` (routing pty + io suites) on 22.12.0 and 22.23.3 |
| Test hits the network / flakes offline (NFR-1) | Cache-seed byte check in the test |
| Ubuntu pty flake (open, `bugfix/pty-harness-ubuntu-flake`) | No automated gate. **Accepted risk:** a red on Ubuntu CI is read through the transcript artifact before anyone calls it a product failure |

## 8. Requirement ID Index

| ID | Title |
|---|---|
| FR-1 | Ctrl-C at a wizard question aborts cleanly with exit 130 |
| FR-2 | Answered wizard behaves as before |
| FR-3 | `akili routing` Ctrl-C is unchanged |
| NFR-1 | Regression test is offline |
| NFR-2 | Pty harness conventions, own files, Windows skip |
| NFR-3 | No new dependency |
