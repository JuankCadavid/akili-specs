# Requirements: Make `install` and `doctor` tell a stale skill from a current one

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/install-stale-skills` |
| Parent Spec | `changes/impeccable-audit-fixes` (`family.md`, child 3) |
| Depth | **Standard.** Installer and doctor code in `bin/`, a new pure module, CLI tests, and docs |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | `pre-approved (JC, 2026-10-31)`. Mandate: "Sigue: … luego install-stale-skills completo hasta archive … Mismas paradas duras; commits locales. Si otro tripwire de presupuesto supera ~20% o aparece alcance/enmienda nueva, detente y avísame." Hard stops: no push, PR, merge, tag, publish, branch deletion, AWS or GitHub writes |
| Status | **Approved**: Phase 1 gate `auto-approved (pre-approved mode)`, 2026-10-31 |
| Proposal | `proposal.md`, approved by JC 2026-10-30 16:21. Q1 decided there: `DIFFERS` is a warning and doctor exits 0. Q2: the proposal's recommendation (up to 5 names, then `+N more`) is taken |
| Verified at | `d5018e3`. `npm test` → `# tests 1345 # pass 1345` |
| Release | Minor (new user-visible install and doctor output), recorded only |

## 2. Executive Summary

After an upgrade, `akili install` skips every existing entry with one message, and `akili doctor` reports a changed skill as `OK`. A stale skill keeps running unnoticed. This change keeps every safety rule and adds the missing distinction:

- **FR-1:** each skipped entry is classified `identical` or `differs` by comparing bytes with the package.
- **FR-2:** install prints the class on every skip line, and its summary splits the counts.
- **FR-3:** doctor reports `DIFFERS` as a warning.
- **FR-4:** a global install names the home directory it resolved from.
- **FR-5:** the docs and the CHANGELOG follow.

## 3. Glossary

| Term | Meaning |
|---|---|
| Entry | One unit the installer writes or skips: a command file, a command-as-skill `SKILL.md`, a skill directory, or a resource file |
| Package source | The file or directory under the installed package (`.claude/commands`, `.claude/skills`, `.claude/templates`, `scripts/`, `.mcp.json.example`) |
| `identical` | Every package file of the entry exists at the target as a regular file with the same bytes |
| `differs` | Any package file is missing at the target or has other bytes, or the target is not the kind of entry the package holds |
| Owned / foreign | The Grok Bot ownership classes (`docs/cli.md`, Grok Bot section). Unchanged here |

## 4. System Context & Scope

At `d5018e3`:

| Fact | Evidence (as run) |
|---|---|
| A single file that exists is skipped without reading it: `skip existing <path>` | `bin/akili.js:968-970` (`copySingleFile`) |
| A skill directory that exists is skipped whole, with the same message | `bin/akili.js:1033-1036` (`copyDirectoryContents`). The proposal's `:1219-1224` is the command-as-skill non-directory branch, which also prints `skip existing` (`:1222-1224`) |
| The summary prints `skipped N` per tool, then "N existing file(s) were preserved. Re-run with --force to overwrite them." | `bin/akili.js:1488-1489`, `:1533-1534` |
| Doctor checks presence only: `OK` when `SKILL.md` or the command file exists | `bin/akili.js:1594-1615` (`hasInstalledCommand`, `hasInstalledSkill`), `:1647-1651` (owned entries), `:1801-1807` (resources, `existsSync`) |
| Doctor's exit code counts `missing` and `foreign` only | `bin/akili.js` `runDoctor` (`r.missing + r.foreign > 0`, `process.exitCode = 1`) |
| `update` reinstalls with `--force` | `bin/akili.js:1479` |
| Default roots come from `os.homedir()` | `bin/akili.js:114-139` |
| The installer copies source bytes unchanged (`atomicCopyFileSync`, `copyTreeSync`) and `--force` merges a directory without deleting extra target files | `bin/akili.js:32-66` |
| Tests that pin the skip wording | `test/install-cursor.test.js:297`, `:314`, `:405` (`startsWith("skip existing ")`); `test/install-impeccable-foreign.test.js:111`, `:125` (`/skip existing .*…/`) |

**In scope:** proposal §5. **Out of scope:** proposal §6 (no overwrite without `--force`; global stays the default; no cross-root comparison; no change to `doctor --agents`).

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| A user re-running `install` after an upgrade | To see which installed entries no longer match the package, and the one command that replaces them |
| A user with intentional local edits | To keep them. Doctor warns but does not fail CI or hooks |
| AKILI maintainer | Existing install behavior and tests unchanged except for the added labels |

## 6. Functional Requirements

### FR-1: Classify each existing entry by content

When install skips an existing entry, or doctor checks a present one, the CLI SHALL classify it against its package source:

- A **file entry** is `identical` when the target is a regular file whose bytes equal the source's, and `differs` otherwise. A symlink, a directory, or other bytes all read `differs`.
- A **directory entry** is `identical` when every regular file under the package source exists at the same relative path under the target, as a regular file with equal bytes. Otherwise it is `differs`.
- **Extra files** under a target directory that the package does not hold SHALL NOT make it `differs`. `--force` and `update` do not delete them, so they could never be cleared.
- The comparison SHALL be **byte-exact**: no line-ending normalization, and file mode not compared.
- For a `differs` directory, the CLI SHALL name up to 5 differing relative paths, then `+N more`.

#### Scenario: A locally edited skill

- GIVEN a fresh `install --tool claude --local`, then one line appended to `skills/impeccable-bridge/SKILL.md`
- WHEN install runs again without `--force`
- THEN `impeccable-bridge` is classified `differs`, naming `SKILL.md`
- BUT the file must NOT be changed
- AND IT MUST classify every other entry `identical`

#### Scenario: An extra file in an installed skill

- GIVEN an installed `tdd` skill with an added `notes.txt`, every package file unchanged
- WHEN install runs again
- THEN `tdd` is `identical`
- BUT it must NOT list `notes.txt`

### FR-2: Install reports the class and splits the counts

- Every skip of an existing, non-foreign entry SHALL print the class after the path, as `skip existing <path> (identical)` or `skip existing <path> (differs: <names>)`. The `skip existing ` prefix stays, because tests and users key on it.
- The per-tool summary SHALL keep `skipped N` and add `identical I, differs D`, where I + D = N.
- The next-steps block SHALL replace "N existing file(s) were preserved. Re-run with --force to overwrite them." with one line, printed only when D > 0, that names D and the two ways to replace them: `akili update` or `install --force`, and saying to run it with the same `--tool`, `--local` and `--target` flags as this run. The CLI does not rebuild those flags (JC, 2026-10-31, after the judgment-day escalation).
- When D = 0 and N > 0, it SHALL say the N skipped entries already match the package.
- `--force` and `update` behavior SHALL NOT change. `--dry-run` SHALL classify too, reading and never writing.
- Foreign, blocked and takeover entries keep their own lines and counts.

#### Scenario: The reproduction from the proposal

- GIVEN the FR-1 edited `impeccable-bridge`
- WHEN install runs again
- THEN the output has `skip existing …impeccable-bridge (differs: SKILL.md)`, and the summary reads `differs 1` with a next step naming `akili update`
- BUT no file is written
- AND IT MUST exit 0

#### Scenario: Second install of an unchanged tree

- GIVEN a fresh install
- WHEN install runs again
- THEN every skip line reads `(identical)`, the summary reads `differs 0`, and there is no replace hint

### FR-3: Doctor reports `DIFFERS`

- For a present command, command-as-skill, skill or resource whose content `differs` (FR-1) at any location the install writes it to, doctor SHALL print `DIFFERS <label>`. For a directory it also prints the names (FR-1). This applies to owned Grok Bot entries too.
- An entry the install itself treats as not AKILI's (an `impeccable/` without `UPSTREAM.md`, on a tool with no ownership record) SHALL NOT be compared, because neither `install` nor `update` replaces it. Doctor reports it as today.
- `identical` entries keep `OK`. `MISSING`, `FOREIGN`, `STALE` and `FIXED` are unchanged.
- The per-tool doctor summary row SHALL show `differs N` only when N > 0, so an all-identical row is unchanged. A hint SHALL name the replace command when N > 0, worded as in FR-2.
- `DIFFERS` SHALL NOT change the exit code or the `HEALTHY`/`REPAIRED`/`INCOMPLETE` status (Q1: a warning, exit 0). A run whose only finding is `DIFFERS` SHALL NOT end with "All checks passed. Your installation is complete and healthy."; it names the differing count instead. When `--fix` repaired something in the same run, the existing "All issues repaired" line prints first, followed by the differing count.
- `--fix` SHALL NOT overwrite a `DIFFERS` entry. It repairs missing entries only.

#### Scenario: Doctor on the edited skill

- GIVEN the FR-1 edited `impeccable-bridge`
- WHEN `doctor --tool claude --local` runs
- THEN it prints `DIFFERS impeccable-bridge (SKILL.md)` and `differs 1`, with a hint naming `akili update`
- BUT it must NOT exit non-zero for it
- AND IT MUST NOT rewrite the file under `--fix`

### FR-4: Name the home a global install resolved from

When the run did not use `--local` and at least one root printed in the install summary lies under `os.homedir()`, the summary SHALL print `Home: <os.homedir()>` once. A `--local` run SHALL NOT print it. A run whose printed roots all lie outside the home directory (for example Grok Bot's box path) SHALL NOT print it either (JC, 2026-10-31). `docs/cli.md` SHALL state that `--local` is the per-checkout route, including for a git worktree.

#### Scenario: A host that sets its own HOME

- GIVEN `HOME=/x` and no `--local`
- WHEN `install --tool claude` runs
- THEN the summary names `/x` as the home it resolved from

### FR-5: Docs and CHANGELOG follow

`docs/cli.md` SHALL document the skip classes, the summary split, `DIFFERS`, and `--local` per worktree. It SHALL also correct the statements this change falsifies: the doctor summary description (`ok | missing | fixed` counts), the exit-rule line (`DIFFERS` does not fail), the Grok Bot ownership table row "Owned, present … OK", and the accepted-limits line saying a partial entry with its `SKILL.md` "reads OK". Its statement "Without `--force`, existing files are skipped" stays true and gains the classification. `CHANGELOG.md` `Unreleased` SHALL gain an entry for this change. Its sentence "A separate change, not yet shipped, will handle the installer item from the same audit." SHALL be reworded, because this change now handles that item; its pin (`test/design-eval-contract-coverage.test.js:56`) moves with it. (FR-2 to FR-5 were sharpened on 2026-10-31 after judgment-day; see `judgment.md`.)

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Install never overwrites an existing entry without `--force`. Every existing safety test stays green |
| NFR-2 | All six targets classify through the same code: Claude Code and OpenCode (raw `commands` + skills), Antigravity, Codex and Cursor (commands as skills), Grok Bot (commands as skills, owned entries) |
| NFR-3 | No new on-disk state in any target |
| NFR-4 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` pass. `node bin/akili.js install --tool all --dry-run` and `node bin/akili.js doctor --tool all` behave as before apart from the new labels and counts |
| NFR-5 | Every new `SHALL`, `BUT` and `AND IT MUST` clause has a test that drives the real CLI or the pure module, with an executed mutation |

### Defect classes and their gates

| Defect class | Gate |
|---|---|
| A wrong class (a false `identical` or a false `differs`) | Unit tests on the pure comparison, with fixtures for each FR-1 case; CLI tests on a real install |
| A write without `--force` | CLI tests snapshot the tree before and after; existing safety tests |
| A changed exit code | CLI tests assert the exit status |
| A broken consumer of `skip existing` | Existing tests `install-cursor`, `install-impeccable-foreign` |
| A doc or CHANGELOG claim that overstates the code (KZ-002) | Quote-check by the Reviewer; text tests |
| A Windows checkout reading `differs` | Byte compare of two copies from the same checkout (package source and target), so line endings match. The Windows CI legs run the CLI tests. Accepted here: no local Windows host |

## 8. Requirement ID Index

| ID | Owner |
|---|---|
| FR-1 | new pure module, `bin/akili.js` |
| FR-2 | `bin/akili.js` install path |
| FR-3 | `bin/akili.js` doctor path |
| FR-4 | `bin/akili.js` install summary, `docs/cli.md` |
| FR-5 | `docs/cli.md`, `CHANGELOG.md`, `test/design-eval-contract-coverage.test.js` pin |
