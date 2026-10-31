# Proposal: Make `install` and `doctor` tell a stale skill from a current one

**Answer first:** `akili install` is not silent. It prints `skip existing` for each entry it leaves alone, plus one line: "N existing file(s) were preserved". But it prints the same line for a skill identical to the package and for one that is out of date. `akili doctor` reports a modified skill as `OK`. After an upgrade, a stale skill (for example an `impeccable-bridge` older than 2.40.0) keeps running and nobody sees it. Only `akili update` replaces it, because update forces. This change makes install and doctor compare content. Every skip then reads `identical` or `differs`. `doctor` reports `DIFFERS`. Nothing is ever overwritten without `--force`.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/install-stale-skills` |
| Parent Spec | `changes/impeccable-audit-fixes` (family manifest `family.md`) |
| Type | Change (the skip is designed behavior, AGENTS.md *Development Rules*; what is missing is the distinction) |
| Deliverable | software (`bin/akili.js` installer and doctor, tests, docs) |
| Approval Mode | `pre-approved (JC, 2026-10-31)` from specify on: "Sigue: … luego install-stale-skills completo hasta archive … Mismas paradas duras; commits locales". Gated up to proposal approval |
| Status | **Approved**, Juan Carlos Cadavid, 2026-10-30 16:21 (UTC-5), with the recommendations accepted: a primary CTA below the fold on a Persuade/Operate screen = P1; short-height pair `1366x768` + `375x667`, overridable in `design.md`; `doctor` reports `DIFFERS` as a warning, exit 0 |
| Requested by | Juan Carlos Cadavid (maintainer), 2026-10-30 |
| Source | The brief, item (1) ("install --tool claude se salta … los archivos de skills desactualizados, solo update los reemplaza"). It is not one of the report's M1–M14 |
| Source questions | Asked at the approval gate: no Jira, no Figma (JC, 2026-10-30 16:21) |
| Visual | None (CLI output only) |
| Depends on | none |
| Parallel-safe | yes (only `CHANGELOG.md` `Unreleased` is shared with the sibling) |
| Base | `8268cb7`, branch `JuankCadavid/impeccable-audit-fixes`; local commits only, no push, PR or merge |

## 2. Intent

Someone who runs `akili install` after upgrading should know which installed files no longer match the package, without having to read 50 identical `skip existing` lines. `akili doctor` should say the same.

## 3. Problem / Current Behavior

Reproduced 2026-10-30 at `8268cb7`: a fresh `install --tool claude --claude-target <scratch>`, then a line appended to `skills/impeccable-bridge/SKILL.md`, then `install` and `doctor` run again.

| # | Current behavior | Citation |
|---|---|---|
| I1 | A file that already exists is skipped without reading its content | `bin/akili.js:968-970` (`copySingleFile`: `if (exists && !args.force)` → `skip existing`) |
| I2 | A skill directory that already exists is skipped as a whole, with the same message | `bin/akili.js:1219-1224`; run output: `skip existing …/skills/impeccable-bridge` |
| I3 | The summary counts every skip together: "53 existing file(s) were preserved. Re-run with --force" | `bin/akili.js:1533-1534`; run output `skipped 53` |
| I4 | `doctor` checks presence only: the modified skill reads `OK impeccable-bridge`, exit 0 | run output (`doctor --tool claude --claude-target <scratch>`) |
| I5 | Only `update` replaces the files, because it reinstalls with `--force` | `bin/akili.js:1479` ("reinstalled with --force") |
| I6 | Install goes to the global root by default; `--local` writes into the current checkout (a worktree included). A host that runs each profile under its own `HOME` (Orca) gets one global root per profile | `bin/akili.js:262` (`--local`); report M2 (profile root and `~/.claude/skills`) |

## 4. Proposed Outcome

| Area | After this change |
|---|---|
| Install, per entry | `skip identical <path>` or `skip differs <path>`, decided by comparing bytes (files) or the file sets plus bytes (skill directories) with the package. `--force` and `update` keep their current behavior |
| Install summary | "N identical, M differ (stale or locally edited): run `akili update` or `install --force` to replace them". Foreign entries keep their own line |
| Doctor | A new `DIFFERS` state for an owned skill, command or helper file whose content differs from the package. Whether it changes the exit code is open question Q1 |
| Root disclosure | The summary prints the resolved root (already printed) and, for a global install, the `HOME` it resolved from. A per-worktree install stays `--local`, now documented in `docs/cli.md` |

## 5. Scope

- `bin/akili.js`: compare on skip (`copySingleFile`, the skill-directory branch), summary counts, doctor `DIFFERS`.
- Tests under `test/` for the six targets' shared path, with fixtures for identical, differs, and foreign entries.
- `docs/cli.md` (install/doctor output, `--local` for per-worktree use), `README.md` if it restates the skip line, and `CHANGELOG.md` `Unreleased`.

## 6. Non-Goals

- No change to the safety rule: install never overwrites without `--force`.
- No change to the per-worktree default. Global stays the default; `--local` is the per-checkout route.
- No comparison across hosts' roots (Orca profile against `~/.claude`). At runtime the sibling spec's Step 0 records which copy is in use and verifies it.
- No change to `doctor --agents` (personas already have section digests).

## 7. Affected Users, Systems, And Specs

All six install targets: Claude Code, OpenCode, Antigravity, Codex, Cursor and Grok Bot. Grok Bot's foreign-entry ownership record keeps its own rules. The CI matrix (`CLI on <os> / Node <18|22>`) is affected because the comparison must be byte-exact across CRLF checkouts. `.gitattributes` already keeps fixtures byte-exact.

## 8. Visual Reference

- Source: None
- Location: n/a
- Notes: CLI output only.

## 9. Requirement Delta Preview

### ADDED Requirements

- Install classifies each skipped entry as `identical` or `differs`, and the summary reports both counts.
- Doctor reports `DIFFERS` for owned content that no longer matches the package.

### MODIFIED Requirements

- The install summary's "preserved" line is replaced by the split counts.

### REMOVED Requirements

- None.

## 10. Approach Options

| Option | What | Pros | Cons |
|---|---|---|---|
| **A. Byte comparison at skip time** (recommended) | Compare the target with the package source when skipping | No new state on disk; exact | Reads every skipped file (`du -sh`: 4.7 MB of skills, 492 KB of commands at `8268cb7`), which is acceptable for a CLI |
| B. Install manifest with hashes | Write a hash manifest on install, compare later | Can tell "locally edited" from "stale" | New on-disk state in every target, plus migration for existing installs |
| C. Make `install` overwrite owned files | Treat install like update | Simplest | Breaks the "skip by default" safety rule |

## 11. Recommended Approach

**Option A.** It needs no new on-disk state and keeps the safety rule. It gives the user exactly the signal that was missing. "Stale" and "locally edited" stay one class, `differs`, because both need a human decision before `--force`. Release type: **minor**, because `install` and `doctor` gain new user-visible behavior. JC decides at release time whether it ships alone or together with the sibling patch.

## 12. Risks, Dependencies, And Open Questions

| # | Item | Recommendation |
|---|---|---|
| R1 | CRLF checkouts on Windows make identical text files compare as `differs` | Compare after normalising line endings for text files, or compare against the packed bytes. Settle at specify with a Windows CI fixture |
| R2 | Executable bits (vendored `scripts/impeccable`) | Compare content only; mode is out of scope |
| R3 | Test LOC underestimated (KZ-bugfix--init-ctrlc-abort-2) | Budget test LOC per clause |
| Q1 | Does `DIFFERS` make `doctor` exit non-zero? | Recommend exit 0 with a warning: an intentional local edit is legitimate, and CI or session hooks should not fail on it |
| Q2 | Should a `differs` skill directory list the files that differ? | Recommend up to 5 file names, then "+N more" |

## 13. Success Criteria

- The reproduction in §3 prints `skip differs …/skills/impeccable-bridge` and a summary with 1 differing entry. `doctor` prints `DIFFERS impeccable-bridge`.
- A fresh install followed by a second install prints only `identical` skips.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` pass, and `node bin/akili.js install --tool all --dry-run` and `node bin/akili.js doctor --tool all` behave as before apart from the new labels.

## 14. Next Step

```text
/akili-specify changes/impeccable-audit-fixes/install-stale-skills
```
