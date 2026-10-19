# Requirements: `/akili-security` follow-up — pin literal, five safety advisories, Windows decision

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security-followup` |
| Depth | **Standard** (compact) — rules-text tightening of a safety gate; no installer or runtime code |
| Type | Change |
| Deliverable | software |
| Approval Mode | `gated` — at the user's instruction (2026-10-19, "continúa con /akili-specify … Detente en el gate de execute") the three specify phases are presented together at **one** gate before `/akili-execute` |
| Status | **Approved** at the specify gate, 2026-10-19 (Juan Carlos Cadavid), after judgment-day APPROVED (round 2) and gate adjustments GA-1…GA-7 (`judgment.md`); corrections F-1…F-11 (round 1) and G-1…G-9 (round 2) |
| Deviations (approved 2026-10-19, Juan Carlos Cadavid, at judgment-day round 1) | (1) Dirty state is asked at the plan gate and recorded `not determined` when the user declines — upstream `SKILL.md:60` asks for it, and `git` may no longer run in the target. (2) The index records the skill copy without any path (`foreign — continued by <approver>`), narrowing the proposal's "resolved path in its location form"; Step 4 forbids paths |
| Date | 2026-10-19 |
| Proposal | `proposal.md` — **Approved** 2026-10-19 (Juan Carlos Cadavid): recommended defaults for W-2 and A-4…A-8; Windows (a) + upstream request draft (c), no wrapper; D-1…D-4 split out; Q-1 → in-target run directories dropped |
| Format source | `docs/specs/archive/2026-10-18-changes--akili-security/` — this repo has no `docs/specs/general-setup/` (`ls docs/specs/general-setup` → `No such file or directory`, as run 2026-10-19) |
| Release | Patch (rules tightening, no new command — semver discipline). Recorded only; **no release, push or publish in this cycle** |

## 2. Executive Summary

The `/akili-security` command gets stricter in six places, all of them rules text: it states the pinned upstream commit it checks for; it offers to restore only the `security-audit` skill instead of a `--force` reinstall of everything; it records which skill copy ran; its execution gate lists every upstream sandbox control; it never runs `git` in the target before **Run** or in its own index and routing steps (so a hostile `.git/config` cannot run code before the plan gate), which also means a run directory inside the target is no longer accepted; and its routing slug carries the run number. Native Windows stays unsupported: the re-sync procedure gains the gate that would lift the stop, and an upstream request is drafted for the user to file.

## 3. Glossary

| Term | Meaning |
|---|---|
| Pin | The upstream commit `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` of `cloudflare/security-audit-skill` |
| Pin sites | The places that state the pin: the command's Step 0.1 (new), `SKILL.md` frontmatter `source`, `UPSTREAM_SHA` in `test/security-audit-skill.test.js`, `docs/skills/security-audit.md` |
| Foreign copy | A loaded `security-audit` whose frontmatter lacks `adapted-for: "AKILI-SPECS"` or whose `source` does not name the pin |
| Skills root | A directory a host scans for skills (e.g. `~/.claude/skills/`) |
| Target | The repository being audited (the current repository, or the named paths in it) |
| Upstream controls | The four sandbox controls bulleted at `SKILL.md:43-46`, the only definition the command may cite |
| Restatement | Any text outside the command that repeats one of its rules (slug, run-directory rule, control list) |

## 4. System Context & Scope

Today (citations as run at `5c944d0`):

- Step 0.1 checks "a `source` naming the pinned commit" without stating it (`.claude/commands/akili-security.md:37`).
- Step 0.1 offers "reinstall with `akili install --force`" (`:37`); `--force` overwrites every existing file the install touches (`bin/akili.js:230`).
- Step 0.3 runs `git status --porcelain` in the target (`:40`); the run-directory rule runs `git check-ignore -q <dir>` (`:59`). Both launch a `core.fsmonitor` program configured in the target's `.git/config` (probe on git 2.38.0, design P-2). Reading `.git` files naively instead follows `..` out of the git directory (design P-13).
- The execution gate's list (`:61`) omits upstream's read-only **toolchain**, scratch-local `HOME`/temp/caches, the isolated-loopback rule, and the word *low* on the limits (`SKILL.md:43-46`).
- Neither the plan table (`:47-57`) nor the index header (`:106`) records which skill copy ran; the addendum (`:77`) names the policy, not the sandbox mechanism.
- The routing slug is `bugfix/security-<YYYY-MM-DD>-s<n>` (`:129-135`), restated in six other files (design P-6).
- The validators fail closed on native Windows (`validate-coverage-ledger.cjs:721-726`) and the preflight stops there (`:39`).

In scope: the command, `.claude/skills/security-audit/SKILL.md` (its `## AKILI-SPECS Integration` section only), `docs/skills/security-audit.md`, `docs/commands/akili-security.md`, `docs/flow.md`, `README.md`, `docs/commands/README.md`, `test/akili-security-command.test.js`, `test/security-audit-skill.test.js`, `CHANGELOG.md`, and one draft file in this spec folder.

Out of scope: any vendored file other than `SKILL.md`'s AKILI section; installer code; model routing; the D-1…D-4 audit run; filing the upstream request (Q-3: the draft lives in this spec folder, per the approval "borrador de solicitud upstream"); any `git` use after **Run** (see §8, accepted risk R-A).

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| Auditing user | Trusts that the copy, sandbox and preflight are what the plan says |
| Maintainer re-syncing upstream | One list of pin sites, one Windows gate |
| Windows user | A clear stop and a known path (WSL) until upstream adds support |

## 6. Functional Requirements

### FR-1: The provenance check states the pin

The command SHALL state the pin literally in Step 0.1 and compare the loaded `source` against it.

#### Scenario: Stale AKILI copy after a re-sync

- GIVEN a loaded `security-audit` whose frontmatter carries `adapted-for: "AKILI-SPECS"` and a `source` naming a commit other than the pin
- WHEN the preflight runs
- THEN the copy is treated as a foreign copy (FR-2's offer), naming the resolved path, the commit found, and the pin
- BUT it must NOT pass because `source` names *a* commit
- AND IT MUST state the pin as the full 40-character literal in Step 0.1

#### Scenario: Pin sites agree

- GIVEN the pin sites
- WHEN `npm test` runs
- THEN a test fails if the command's Step 0.1 literal, `SKILL.md` `source`, and `UPSTREAM_SHA` are not the same commit
- AND the re-sync procedure's pin-update step names "the command's Step 0.1 pin"

### FR-2: Restoring the pinned copy overwrites nothing

On a foreign copy, the command SHALL offer **continue with that copy**, **restore the pinned copy**, or **stop**. Restoring moves the entry at the resolved skills-root path — the symlink itself when it is one, never its target — to a fresh `~/security-audit-skill/foreign-copy-<YYYY-MM-DD>-<n>/`, re-runs the `akili install` that owns that root with `--skills-only` and without `--force`, and then **ends the command**: the foreign instructions are already loaded, so the user re-runs `/akili-security` in a fresh session, where Step 0.1 checks the restored copy.

#### Scenario: Restore offered

- GIVEN a foreign copy whose skills-root entry, resolved path and restore destination are each neither inside the target nor an ancestor of it
- WHEN the offer is shown
- THEN it names the entry path (and its link target when it is a symlink), the destination, and the install command for that root — or asks the user which install owns the root when it is not a known default
- BUT it must NOT offer `--force`, an `npx` command, or any command that overwrites installed files or fetches from the network
- AND IT MUST NOT move or delete anything without the user choosing **restore**

#### Scenario: After restore

- GIVEN the user chose **restore** and the install exited 0
- WHEN the command continues
- THEN it ends before the plan gate and tells the user to re-run `/akili-security` in a fresh session
- BUT it must NOT run the audit in the session that loaded the foreign copy
- AND IT MUST, when the install exits non-zero, report the exit code and where the moved entry now is, then end

#### Scenario: Copy inside the target

- GIVEN the skills-root entry, its resolved path, **or** the restore destination is inside the target or an ancestor of it (e.g. a project-local install, a project-local link to an outside copy, or HOME inside the target) — FR-7's two-way rule
- WHEN the offer is shown
- THEN only **continue with that copy** and **stop** are offered
- BUT it must NOT move anything inside the target

### FR-3: The skill copy is recorded

The plan SHALL show the skill copy that will run, and the index SHALL record it.

#### Scenario: Foreign copy continued

- GIVEN the user chose **continue with that copy**
- WHEN the plan is shown and the index is written
- THEN the plan's *Skill copy* field reads foreign, with the resolved path and the commit found
- AND the index header records `foreign — continued by <approver>` (approver as named at the gate, default "the user")
- BUT the index must NOT contain the resolved path (the Step 4 forbidden list holds)
- AND IT MUST read `pinned` in both places when the copy matched

### FR-4: The execution gate lists every upstream control

The execution gate SHALL quote the upstream controls without dropping any term, and SHALL treat each one as a control the user must confirm.

#### Scenario: Sandbox without a read-only toolchain

- GIVEN the user selects sandboxed execution with a mechanism that keeps the target read-only but the toolchain writable
- WHEN the gate checks the controls
- THEN the plan is re-shown reading **static-only** and names the missing control
- AND IT MUST quote upstream's lead clause — "an OS-enforced sandbox that provides all of these controls" (`SKILL.md:41`) — and its four bullets verbatim (`SKILL.md:43-46`), byte for byte:
  - "no external network; use only an isolated loopback namespace when the check needs local client/server traffic;"
  - "an empty environment populated from an explicit allowlist with safe values, with scratch-local `HOME`, temporary directories, and caches;"
  - "a read-only target and toolchain, with the target-controlled process able to write only inside its assigned `scratch/` directory; and"
  - "explicit low CPU, memory, process, file-size, disk, and wall-clock limits."
- AND IT MUST require upstream's exposure rule (`SKILL.md:48`): no retained output directory other than the agent's `scratch/`, no other agent's directory, host home directory, credentials, sockets or shared services exposed to target code
- BUT it must NOT paraphrase a control into a weaker one

### FR-5: The addendum names the sandbox mechanism

Under `sandboxed-approved`, the brief addendum SHALL name the approved mechanism.

#### Scenario: Sandboxed run

- GIVEN a run approved as `sandboxed-approved` with mechanism M
- WHEN a delegated prompt is built
- THEN its addendum states the policy and M
- BUT under static-only it must NOT name any mechanism

### FR-6: No `git` runs in the target before Run

No step before **Run**, and none of the command's own Steps 4 and 5, SHALL launch `git` (or any program the target configures) in the target. The source ref is read from the repository's files as untrusted data; the dirty state is asked at the plan gate.

#### Scenario: Hostile `.git/config`

- GIVEN a target whose `.git/config` sets `core.fsmonitor` to a program
- WHEN the command runs from preflight to the plan gate
- THEN the program never runs
- AND the plan's *Target* field shows the branch (from `HEAD`) and the commit when it resolves, and asks the user to state the dirty state
- BUT it must NOT run `git status`, `git check-ignore`, `git rev-parse` or any other `git` command in the target
- AND IT MUST record an unresolved commit, and a dirty state the user declines to state, as `not determined` in `run-metadata.json` and the index — never as clean

#### Scenario: Hostile `.git` content

- GIVEN a target whose `HEAD` reads `ref: refs/heads/../../../../secret.txt`; or whose `HEAD`, a ref file, `packed-refs` or any directory on the path to them is a symlink; or whose file is non-regular or larger than the cap; or whose `.git` is a symlink or a file (`gitdir:` — a linked worktree or submodule)
- WHEN the source ref is resolved
- THEN the affected value reads `not determined` (a linked worktree or submodule always reads `not determined` for branch and commit)
- BUT no content of any file whose real path is outside the target's own `.git` directory reaches the plan, `run-metadata.json` or the index
- AND IT MUST admit a commit only when it is 40 (or 64) lower-case hex characters, and a branch name only when it uses a safe character set with no `..` component

### FR-7: The run directory is always outside the target

The command SHALL accept a run directory only when its resolved path is neither inside the target root nor an ancestor of it.

#### Scenario: `--out` inside the target

- GIVEN `--out` resolves inside the target (directly or through a symlink in an existing ancestor), ignored or not
- WHEN the plan is built
- THEN it is refused and an external path is requested
- BUT it must NOT be accepted on the strength of an ignore rule
- AND IT MUST remove the repo-relative run-path form from the index rules (only `~/…` and `<external>/run-<N>` remain)

#### Scenario: Run directory contains the target, or HOME is inside it

- GIVEN `--out /`, a parent of the target, or a default run directory that falls inside the target because HOME does
- WHEN the plan is built
- THEN it is refused and an external path that does not contain the target is requested

### FR-8: Routing slugs carry the run number

The routing slug SHALL be `bugfix/security-<YYYY-MM-DD>-r<N>-s<n>`, where `<N>` is the run's `run-<N>`.

#### Scenario: Two runs on one date

- GIVEN runs `run-1` and `run-2` on 2026-10-19 that both route `S-1`
- WHEN the routing gate prints the commands
- THEN they read `bugfix/security-2026-10-19-r1-s1` and `bugfix/security-2026-10-19-r2-s1`
- AND IT MUST keep the charset `[a-z0-9-]` and build the slug only from the date, `N` and `S-n`
- BUT it must NOT contain text derived from target content

### FR-9: Native Windows stays unsupported, with a gate to lift it

The preflight stop on native Windows SHALL stay unchanged. The re-sync procedure SHALL state that the stop is lifted only when the validators at a new pin pass the non-fallback test cases on both Windows CI legs. An upstream request SHALL be drafted for the user to file.

#### Scenario: Re-sync at a pin with no Windows path

- GIVEN a re-sync whose validators still require `O_NOFOLLOW`/`O_NONBLOCK`
- WHEN the maintainer follows the re-sync procedure
- THEN the preflight stop and the Windows test branch stay
- AND IT MUST lift the stop only after a candidate branch that removes the `win32` short-circuit from `test/security-audit-skill.test.js` passes the non-fallback cases on both Windows CI legs
- BUT no AKILI wrapper, shim or patch to a vendored file is added
- AND IT MUST NOT be filed upstream by the agent (outward-facing; the user files it)

### FR-10: Restatements, tests and CHANGELOG follow the command

Every restatement of a changed rule SHALL match the command, the docs SHALL say the provenance check is necessary but not sufficient (R-B), the text-contract tests SHALL pin the new sentences, and `CHANGELOG.md` `[Unreleased]` SHALL describe only what ships.

#### Scenario: Slug restated elsewhere

- GIVEN the slug pattern in `README.md`, `docs/flow.md`, `docs/commands/akili-security.md`, `docs/skills/security-audit.md` and `SKILL.md`'s AKILI section
- WHEN the change ships
- THEN each reads `-r<N>-s<n>`; each in-target run-directory mention is gone; the docs' control list matches FR-4
- AND IT MUST pass a phrase-family grep keyed on the obligation (KZ-changes--kaizen-loop-closure-2)

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | `.claude/commands/akili-security.md` stays ≤ 230 lines (`test/akili-security-command.test.js:396`) |
| NFR-2 | Every vendored file except `SKILL.md` stays byte-identical; `SKILL.md` changes only inside `## AKILI-SPECS Integration` |
| NFR-3 | No change to `docs/model-routing.md`, `.claude/templates/model-routing.section.md`, `bin/`, `package.json` |
| NFR-4 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` green |

## 8. Defect Classes and Their Gates

| Defect class | Gate |
|---|---|
| A requirement clause dropped from the command | Clause walk in `execution.md` + text-contract tests per clause (KZ-changes--gate-falsifiability-2) |
| A restatement keeps the old rule | Phrase-family grep over the in-scope files, keyed on the obligation (FR-10) |
| Pin sites diverge | Pin-sync test (FR-1), falsified by mutating one site |
| CHANGELOG overstates | Quote-check each clause against HEAD (KZ-002) |
| Vendored drift | `git diff --quiet 5c944d0 -- .claude/skills/security-audit ':!*SKILL.md'` → exit 0, plus every `SKILL.md` hunk of `git diff -U0 5c944d0` below the `## AKILI-SPECS Integration` heading (`:202`). `test/security-audit-skill.test.js` checks only names, frontmatter, LICENSE and validator smoke — no byte check exists (judgment J-3) |
| Windows regression | CI Windows legs — `UNVERIFIED` this cycle (no push); the user's first push is the check |
| The agent ignores a rule at run time | **No automated check** — rules text cannot be machine-enforced. Accepted risk, as in `changes/akili-security` |
| R-A (accepted risk) | After **Run**, the skill's own phases (repo name from a remote, history hunting — `SKILL.md:58`, `ATTACK-CLASSES.md:103`) and delegated agents may run `git` in the target; FR-6 covers before Run and Steps 4–5 only. Recorded for a later proposal, not widened into this one |
| R-B (accepted risk) | The provenance check is necessary, not sufficient: a hostile copy can forge `adapted-for` and `source` |

## 9. Requirement ID Index

| ID | Source item | Tasks |
|---|---|---|
| FR-1 | W-2 / K-2 | T1, T3 |
| FR-2 | A-7 | T1, T2 |
| FR-3 | A-6 | T1, T2 |
| FR-4 | A-5 | T1, T4 |
| FR-5 | A-6 | T2 |
| FR-6 | A-8 | T1, T2 |
| FR-7 | A-8 / Q-1 | T1, T2, T4 |
| FR-8 | A-4 | T2, T3, T4 |
| FR-9 | Windows (a)+(c) | T3 |
| FR-10 | sweep | T3, T4, T5 |
| NFR-1…4 | — | T1, T2, T5 |
