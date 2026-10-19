# Judgment Day — `changes/akili-security-followup`

| Field | Value |
|---|---|
| Target | `requirements.md`, `design.md`, `tasks.md` (draft, uncommitted on top of `5c944d0`) against `proposal.md` |
| Mode | judgment_day — two blind read-only judges, same scope and criteria, model `sonnet` (author `opus` — author ≠ auditor) |
| Round | 2 of 2 (round 1 fixed F-1…F-11; scoped re-judgment REVISE ×2; round 2 fixes G-1…G-9) |
| State | **approved** — final scoped re-judgment: both judges APPROVE; gate adjustments GA-1…GA-7 applied at the user's approval (2026-10-19) |

## Frozen ledger (round 1)

| ID | Status | Judges | Severity | Finding | Settled by |
|---|---|---|---|---|---|
| J-1 | **confirmed** | A-2, B-1 | severe | Reading `.git` as data has no hostile-input rules: symlinked `HEAD`/refs/`packed-refs`, `..` in a ref name, `gitdir:`/`commondir` outside the target, FIFO/huge files, no charset/length check. Judge B reproduced `ref: refs/heads/../../../../secret.txt` printing `SECRET_TOKEN=abc`; the value reaches the plan, `run-metadata.json` and the tracked index | both judges |
| J-2 | **contradiction (severity)** | A-3 severe, B-3 warning | severe / warning | Restore flow: a symlinked copy (what `npx skills add` lays down) is not restored when the link target is moved; the loaded foreign copy is not reloaded and re-checked; a project-local copy inside the target would be moved (modifies the target); same-day destination collision; one example install command; bare `akili` vs `npx` (network) | user decides severity |
| J-3 | confirmed by architect re-run | A-1 | severe | Requirements §8 claims "existing byte-identity tests"; none exist — `grep -n "^test(" test/security-audit-skill.test.js` → 6 tests (file set, frontmatter, LICENSE, two validator smokes, install), no hash/byte check. NFR-2 has no automated gate | `grep` re-run 2026-10-19 |
| J-4 | corroborated | A-8, B-6 | warning | FR-4 "four bullets verbatim" drops the `SKILL.md:41` qualifier "OS-enforced sandbox" and the `:48` no-exposure rule (home, credentials, sockets, shared services) | — |
| J-5 | corroborated | A-9a, B-2 | warning | Detached HEAD: §5.1 "commit when resolvable" vs §7 "otherwise `commit not determined`"; reftable and tag refs unaddressed | — |
| J-6 | corroborated | A-5, B-4 | warning | "No step launches `git` … on any step" overclaims: the skill itself asks for git remote/dirty state and hunts history after Run (R-1). Scope the rule to before Run and the command's own steps | — |
| J-7 | corroborated | A-6, B-9 | warning | Slug site count: the command has 2 slug sites (`:129`, `:132`), not 3; the hedge makes T2's check unfalsifiable; `` `git [a-z-]+ `` misses a bare `` `git` `` prohibition (A-11) | — |
| J-8 | corroborated | A-4, B-7 | warning | `SKILL.md:211` cited; the "never relax" sentence is at `:212` (re-run: `sed -n 211,212p` → blank, then the sentence) | re-run |
| J-9 | corroborated | A-12, B-11 | suggestion | Review-round budget 10 equals its escalation threshold; no headroom | — |
| J-10 | suspect | B-7 | warning | Dirty state `not determined` relaxes upstream `SKILL.md:60` ("whether the worktree is dirty") while P-8 claims only tightening | user decides |
| J-11 | suspect | B-5 | warning | Proposal A-6 said the index records the path "in its location form"; FR-3/DD-3 forbid any path — an unrecorded deviation | user decides |
| J-12 | suspect → confirmed by re-run | B-8, A-9d | warning | Unlisted consumers: test `:207-209` pins "An in-target run directory is never under `docs/specs/`"; test `:272` titled "three location forms"; command `:56` *Disclosure* row says "or in the ignored directory chosen below" | `sed` re-run 2026-10-19 |
| J-13 | suspect | A-7 | warning | Windows lift gate is circular: `NO_FOLLOW_UNAVAILABLE` hard-codes `win32` (`test/security-audit-skill.test.js:93-97`), so non-fallback cases cannot run on Windows until that branch is removed | — |
| J-14 | suspect | A-9b/c, B-10 | suggestion | Target root without `git` (cwd in a subdirectory); HOME inside the target; `--out` that **contains** the target (e.g. `/`) passes a one-way "outside" check | — |
| J-15 | suspect | A-10 | warning | Restatement counts differ: proposal "seven files", requirements "six other files"; T4 red-run lists 9 of its 10 sites (`docs/commands/akili-security.md:23` missing from P-6) | — |
| J-16 | info | B-12, B-13, A-13, A-14 | suggestion | Missing falsifiers for FR-2/FR-6/FR-7 text; T3 body gate needs a network clone (use local `git diff` vs `5c944d0`); provenance check is necessary-not-sufficient (a hostile copy can forge frontmatter); R-1 ID reused; Q-3 resolution unrecorded; reversion table answers "what removal breaks", not "what reverting breaks" | — |

## Proposed round-one correction (pending user approval)

| Fix | Covers | Change |
|---|---|---|
| F-1 | J-1 | Ref reading hardened: only regular, non-symlink files inside the target's `.git` (a `gitdir:`/`commondir` pointing outside the target → `not determined`); size cap; values admitted only if a commit matches `^[0-9a-f]{40}$` (or 64 for SHA-256) and a branch name matches a safe charset with no `..` component; anything else `not determined`. New ledger row for the hostile-input premise, falsifier: Judge B's traversal fixture |
| F-2 | J-2 | Restore moves the **entry at the skills-root path** (the link itself when it is a link), never its target; refused for a copy inside the target (offer continue or stop only); destination `foreign-copy-<YYYY-MM-DD>-<n>`; the offer names the `akili install` flag for that root or asks the user; never `npx`; after restore the skill is reloaded and Step 0.1 re-runs, stopping on a second mismatch |
| F-3 | J-3 | NFR-2 gate: `git diff --quiet 5c944d0 -- .claude/skills/security-audit ':!*SKILL.md'` plus a `SKILL.md` diff confined to the AKILI section; requirements §8 corrected |
| F-4 | J-4 | FR-4 quotes the `:41` lead clause ("OS-enforced sandbox that provides all of these controls") + the four bullets, and requires the `:48` no-exposure rule |
| F-5 | J-5, J-14 | Detached 40-hex `HEAD` → commit; reftable / other refs → `not determined`; target root = nearest ancestor holding `.git`; run directory must neither be inside the target nor contain it; default refused when HOME is inside the target |
| F-6 | J-6 | FR-6 becomes "no `git` in the target before **Run**, and never by the command's own Steps 0, 1, 4, 5"; R-1 (renamed R-A) keeps post-Run skill use as accepted risk |
| F-7 | J-7, J-12, J-15 | Exact site lists and counts; consumers `:207-209`, `:272`, command `:56`; grep pattern `` `git` `` |
| F-8 | J-8, J-9 | Citation `:212`; budget 12 rounds, escalate past 14 |
| F-9 | J-10, J-11 | Recorded as deviations for approval: dirty state asked at the plan gate (user-stated), `not determined` only when the user declines; index holds no path (Step 4 forbids it) |
| F-10 | J-13 | Lift gate: a candidate branch that removes the `win32` short-circuit must pass the non-fallback cases on both Windows legs before the stop is removed |
| F-11 | J-16 | One-line docs note that the provenance check is necessary, not sufficient; local body gate; Q-3 recorded as resolved by approval |

## Round 1 decision

User (Juan Carlos Cadavid, 2026-10-19): "Apply F-1..F-11 + re-judge"; deviations J-10 and J-11 approved and recorded in `requirements.md` Document Control. J-2 severity contradiction resolved by applying the fix.

## Scoped re-judgment 1 (both judges: REVISE)

| Judge | Resolved | Partial | New fix-caused defects |
|---|---|---|---|
| A | 15 | J-15 | N-1…N-8 (4 warnings, 4 suggestions; none severe) |
| B | 13 | J-1, J-2 | N-1…N-11 (7 warnings, 4 suggestions; none severe) |

## Round 2 correction (final bounded round)

| Fix | Covers | Change |
|---|---|---|
| G-1 | B N-1, B N-2, A N-1 / B N-7 | `.git` must be a real directory; every file read only when its real path (every component resolved) is inside the real path of `<target>/.git`; `.git` symlink or `gitdir:` file (linked worktree, submodule) → `not determined`, stated; P-4 narrowed to the main-checkout case it reproduces |
| G-2 | A N-2 / B N-3 | P-13 citation adds the `mkdir -p t/.git/refs/heads` step and the secret's location; T1 gains a five-fixture walk (incl. the directory-symlink case), with the Reviewer re-walking fixture (b) |
| G-3 | B N-4 | Restore refused when the skills-root entry **or** its resolved path is inside the target |
| G-4 | B N-5 | Restore ends the command; the user re-runs `/akili-security` in a fresh session (no in-session re-check is trusted) |
| G-5 | B N-6 | FR-4 quotes the lead clause and the four bullets byte for byte |
| G-6 | A N-3 / B N-8, B N-11 | Prohibition and checklist item written without backticks; shared grep post-condition is 0 hits over the whole command (Steps 4–5 included) |
| G-7 | A N-4 / B N-9 | Executive summary scoped to "before Run or in its own index and routing steps"; FR-2 retitled "overwrites nothing" |
| G-8 | A N-6, B N-10, A N-7 | `npx` check reads each hit instead of expecting 0; root-flag examples include `--codex-skills-target`; size caps 64 KiB / 1 MiB |
| G-9 | A N-5, A N-8 | Range `:93-96`; P-18 verifies the symlinked-entry restore |

J-15 (proposal "seven files" vs requirements "six other files"): kept as info — the proposal counts the command test with the six docs; the approved proposal is not edited.

## Final scoped re-judgment (round 2): both APPROVE

| Judge | G-1…G-9 | Remaining (info — the fix lineage is exhausted; offered as gate adjustments) |
|---|---|---|
| A | all RESOLVED | N-1 T1 *Done* says falsifiers 1–9 (now 12); N-2 `requirements.md` Status names only F-1…F-11; N-3 `\|` in table cells is literal under BSD `grep -E` → 0-hit checks pass vacuously |
| B | G-8 PARTIAL, rest RESOLVED | W-1 restore containment is one-way (entry an ancestor of the target; destination inside the target when HOME is); W-2 = A N-1; G-8 `--codex-skills-target` needs `--tool codex` (re-run: without it the install targets `~/.claude`); S-1 P-4 `packed-refs` line is stale, the loose ref wins; S-2 = A N-3; S-3 restore install exiting non-zero is unspecified |

### Proposed gate adjustments (for the user at the specify gate)

| GA | Covers | Change |
|---|---|---|
| GA-1 | A N-1, B W-2 | T1 *Done*: falsifiers 1–12 |
| GA-2 | A N-2 | `requirements.md` Status names G-1…G-9 |
| GA-3 | A N-3, B S-2 | `tasks.md` note: `\|` in table cells is a markdown escape; run every pattern with a plain `|` |
| GA-4 | B W-1 | FR-2 / design 0.1: restore refused unless the entry, its resolved path **and** the destination are neither inside the target nor an ancestor of it (FR-7's two-way rule) |
| GA-5 | B G-8 | design 0.1 example reads `--tool codex --codex-skills-target <dir>` |
| GA-6 | B S-1 | P-4 cites the loose ref (it wins over `packed-refs`) |
| GA-7 | B S-3 | Restore install exiting non-zero: report the exit code and the moved entry's location, then end |

JUDGMENT: APPROVED ✅
