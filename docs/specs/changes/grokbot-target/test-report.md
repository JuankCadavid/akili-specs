# Test Report: Grok Bot install target (`--tool grokbot`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/grokbot-target` |
| Date | 2026-10-21 |
| HEAD under test | `46dcdcb` (T1–T5 committed) plus the new, uncommitted `test/install-grokbot-edge.test.js` |
| Leader | Claude Code session, `opus` |
| Tester | 1 Tester, `opus`. The Implementers ran on `sonnet`, so author ≠ tester |
| Overall status | **PRODUCT_BUG — 3 red tests, plus 1 sibling confirmed by a Leader probe** |

## 2. Summary

| Measure | Result |
|---|---|
| `npm test` | **551 tests: 548 pass, 3 fail, 0 skipped.** All 3 failures are intentional PRODUCT_BUG reds in `test/install-grokbot-edge.test.js` |
| Author suite (`test/install-grokbot.test.js`) | 33/33 pass. Written red→green during `/akili-execute`; cited, not rewritten |
| New edge suite (`test/install-grokbot-edge.test.js`) | 12 tests: 9 pass, 3 fail (bug) |
| Requirements with evidence | FR-1 … FR-8 and NFR-1 … NFR-5. NFR-6 is owed to `/akili-validate` (live box) |
| Product bugs | **1 defect class:** an *owned* entry that is not a real directory (a plain file, or a dangling or live symlink) is mishandled at the restore and overwrite sites |
| Safety probes | `/home/box` absent before and after; no write outside the scratch roots, except the bug's own write-through into a scratch "outside" directory |

**Deployment:** 1 suite (integration: the CLI driven as a subprocess). One Tester was spawned, not in parallel, because only one suite was independent. No suite ran inline. Skills: none beyond the persona; effort high.

## 3. Backend Unit Tests

n/a. `bin/akili.js` runs `main()` on load and exports nothing for grokbot, so every test drives the CLI as a subprocess. This is the established pattern in `test/install-cursor.test.js`.

## 4. Frontend Unit Tests

n/a. CLI only.

## 5. Integration Tests

Command: `node --test test/install-grokbot.test.js test/install-grokbot-edge.test.js`, and the full `npm test`.

| Suite | Tests | Pass | Fail |
|---|---|---|---|
| `test/install-grokbot.test.js` (author) | 33 | 33 | 0 |
| `test/install-grokbot-edge.test.js` (Tester) | 12 | 9 | 3 (PRODUCT_BUG) |
| Rest of the repository suite | 506 | 506 | 0 |

Falsifiers the Tester executed against the new tests, each reverted and confirmed with `cmp`:

| Mutation | Red observed |
|---|---|
| M3: `detectByResourcesOnly` returns `true` | Both FR-6 negative tests went red ("nothing installed: no auto-detected banner"; the banner regex `claude, opencode` failed). |
| M4: `copySingleFile` also writes `<target>.orig` | The FR-3 two-way file-list test went red (`command akili-archive + actual - expected`). |
| M5: `readOwnership` returns "absent" on any read error | Both unreadable-record tests went red (EISDIR: crashed with a stack trace; EACCES: expected exit 1). |

## 6. E2E Tests

n/a. The end-to-end journey (Grok Bot loading the installed skills) runs only on the box. It is owed to `/akili-validate` (NFR-6).

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test type | Test file | Result | Gap or notes |
|---|---|---|---|---|---|
| FR-1 | *Valid selection* | Integration | author | PASS | — |
| FR-1 | *all and both unchanged*: `all` = five, `--tool all` hint | Integration | author | PASS | — |
| FR-1 | BUT `both` must NOT change | Integration | edge (gap 1) | PASS | Was untested before |
| FR-1 | help lists grokbot and its flags | Integration | edge (gap 8) | PASS | — |
| FR-2 | *Default*: planned writes under both default roots | Integration | author (header), edge (gap 2, every "would install" path) | PASS | — |
| FR-2 | *Override on the box*, MUST NOT write outside the two roots | Integration | author | PASS | — |
| FR-2 | Env var, `--local`, `--target`, explicit resources; BUT blank env | Integration | author | PASS | — |
| FR-3 | *First install*: root created, byte-identical, only skill/command folders | Integration | author, edge (gap 4, file lists equal in both directions) | PASS | — |
| FR-3 | Record clause; dry run; partial installs | Integration | author | PASS | — |
| FR-3 | *Shared directory hygiene* | Integration | author | PASS | — |
| FR-4 | Table: install, install `--force`, doctor, doctor `--fix` (foreign and absent rows) | Integration | author | PASS | — |
| FR-4 | Table: **owned entry present** (doctor `--fix` restore; overwrite under `--force`) | Integration | edge (gap 6) + Leader probe | **FAIL — PRODUCT_BUG** | See §8 |
| FR-4 | Table: update column | — | — | Not automatable | Accepted gap (§9). Live evidence: `scratchpad/rev5/u.out` |
| FR-4 | *Invalid record* footnote: unparsable | Integration | author | PASS | — |
| FR-4 | *Invalid record*: EISDIR / EACCES, with and without `--force` | Integration | edge (gap 5) | PASS | EACCES skips on root and on Windows |
| FR-4 | *Foreign `tdd` survives*; foreign plain file; foreign dangling symlink | Integration | author | PASS | — |
| FR-4 | *Explicit takeover* (directory, symlink), MUST leave nothing behind | Integration | author | PASS | — |
| FR-4 | *Explicit takeover* of a foreign plain **file** command name | Integration | edge (gap 7) | PASS | — |
| FR-4 | *Interrupted install*, move-aside failure, record-write failure, delete-after-move failure | Integration | author | PASS | The "restore also fails" branch is untested (no seam) |
| FR-5 | *Healthy install*; *Foreign folder* | Integration | author | PASS | — |
| FR-6 | *Detected on the box* | Integration | author | PASS | — |
| FR-6 | *Not detected elsewhere*, BUT workflows-only is not an install | Integration | author, edge (gap 3, non-vacuous) | PASS | — |
| FR-7 | *Install with an override*, BUT no copy/rsync/ssh | Integration | author | PASS | — |
| FR-8 | Docs and claim family | Review | T5 Reviewer quote-check | PASS | Not a test; FR-8 is a docs obligation |
| NFR-1 | Five existing targets unchanged | Integration | author (Codex baseline), Leader dry-run diffs | PASS | — |
| NFR-2 | No content fork | Integration | author, edge (gap 4) | PASS | — |
| NFR-3 | Tests never touch `/home/box` | Static plus run | both suites | PASS | `/home/box` absent after every run |
| NFR-4 | Skip by default, overwrite only with `--force` | Integration | author | PASS | — |
| NFR-5 | Verification set green | Command | `npm test`, `verify:cli`, `pack:dry-run` | PASS except the bug reds | — |
| NFR-6 | Live load by Grok Bot | Manual | — | Owed | `/akili-validate`, on the box, by the user |

## 8. Remediation

### BUG-1 — an owned entry that is not a real directory is mishandled (FR-4 table, row *Owned entry present*; DD-7 "never follow a link")

Setup: `akili install --tool grokbot --grokbot-target <w>`, so every name is recorded as owned, then replace one owned entry.

| Entry shape | Command | Expected | Actual |
|---|---|---|---|
| Plain file (`akili-quick`, `tdd`) | `doctor --fix` | `FIXED`; the entry becomes AKILI's folder | Uncaught `ENOTDIR … copyfile … -> <w>/akili-quick/SKILL.md.<rand>.tmp`, exit 1. Nothing is restored, and every later entry goes unchecked |
| Dangling symlink (`caveman`) | `doctor --fix` | `FIXED`; the link is replaced by a real folder | Uncaught `ENOENT … mkdir '<w>/caveman'` (`ensureDirectory`, `bin/akili.js:491`), exit 1 |
| Live symlink to an outside folder (`kaizen`) | `doctor --fix` | Nothing written outside `<w>` | Prints `FIXED kaizen` and **writes `SKILL.md` into the outside folder** through the link |
| Live symlink to an outside folder (`akili-quick`, a **command**) | `install --force` (and therefore `update`, which forces every write) | Nothing written outside `<w>` | **Writes `SKILL.md` into the outside folder** through the link, exit 0. Found by a Leader probe, `scratchpad/probe/` |
| Live symlink, **skill** (`kaizen`) | `install --force` | — | Safe: `copyTreeSync` replaces the link with a real folder (`bin/akili.js:61-62`) |

- **Root cause (Tester hypothesis, confirmed for the sibling by the Leader probe):**
  - `checkOwnedEntry` (`bin/akili.js:1518-1540`) treats an owned entry as OK only when `existsSync(<entry>/SKILL.md)` is true. `existsSync` follows links.
  - Every other owned shape goes to the restore callback with no `lstat` type check.
  - The callbacks (`copySingleFile(…/SKILL.md)` for commands, `copyDirectoryContents` without a policy for skills) write *into* the entry path as if it were a real directory. `ensureDirectory` follows the link, and `removeTargetSymlinks` never unlinks the entry itself.
  - The install policy's owned-overwrite path for **command-skills** has the same flaw.
- **Fix direction:** before any restore or overwrite of an *owned* entry, `lstat` it. If it is not a real directory, remove it with the existing `removeEntryNoFollow` and then write. That covers `doctor --fix` and the owned-overwrite path of install and update.
- **Regression tests:** the 3 red tests in `test/install-grokbot-edge.test.js`, plus one test for the `install --force` command-symlink sibling, which is not yet written.
- **Severity:** the write-through can drop AKILI files into another bot's folder when an owned name is re-pointed by a symlink. The scenario is uncommon, but it is the data-safety property this spec exists to protect.

## 9. Accepted Gaps

| Gap | Reason | Substitute |
|---|---|---|
| `akili update` (the FR-4 update column, T4's `Files:` line) | `update` runs a real `npm install -g` before reinstalling | Static trace by the T2 Reviewer, plus the live run in `scratchpad/rev5/u.out`, which printed `skip foreign …/tdd` and `(1 foreign skipped for grokbot)` |
| Takeover "restore also fails" branch | No product seam to make a rename-back fail | Code reading (T2b Reviewer) |
| Grok Bot loads the files (P-10, P-11) | Needs the real box | NFR-6 live check at `/akili-validate` |
| Linux partial-delete behaviour on move-aside failure | Tests ran on macOS only; Linux CI covers the suite | CI legs `CLI on ubuntu` |
