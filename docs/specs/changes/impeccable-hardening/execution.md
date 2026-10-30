# Execution — impeccable-hardening

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-hardening` |
| Started | 2026-10-30 (UTC-5), branch `JuankCadavid/impeccable-hardening`, base `90b35db` |
| Owner brief (2026-10-30) | "Aprobado por JC 11:28 AM Bogotá. Commits locales OK; sin push, PR ni publicación sin OK explícito de JC. Detente en cada gate que requiera a JC (P-15 en T2, veredicto de T9)." |
| Approval Mode | `gated` (proposal Document Control). The owner brief names the JC stops: the P-15 HITL check at T2 and the T9 re-walk verdict. Routine continue gates between tasks proceed under that brief; the `/akili-propose` Step 1 exceptions (HALT, Pivot, budget tripwire, `FATAL_FAIL`, `PRODUCT_BUG`, destructive actions) still stop |
| Leader | `opus` (Opus 5.5), T1 |
| Workers | No Step 8E wrappers (`.claude/agents/` absent). Fallback sub-prompt workers read their persona from `.agents/`. Implementer: `sonnet` (T2). Reviewer: `opus` (a different model from the Implementer) |
| Personas | `.agents/` is gitignored and was absent from this worktree. It was copied from `/Users/jcadavid/Development/sdd-jc-methodology/.agents`, then `akili doctor --agents --fix --allow-branch` ran on the local, ignored copy: leader `primary-instructions` and `test-harness`, reviewer `audit-checklist`, tester `prove-behavior` FIXED (backups under `.agents/.backup/`). Leader `delegation` CUSTOM-EDITED and implementer `shared-file-discipline` UNLOCATED are left as the maintainer's call |
| Upstream checkout | `<scratchpad>/upstream`, a local clone of the earlier session's read-only clone; `HEAD` = `df3a4abe7d0840d5f60324812c432e00b66a4e75`, clean, 58 files under `.claude/skills/impeccable/`, launcher `100755`, `.cmd` CRLF. No network fetch in this run |
| Budget (design §12) | 9 tasks · ~1,250 authored LOC · ~16 review rounds |
| Environment pre-check (Step 2.1) | No running stack needed (methodology text, a Node script and `node:test` suites) |

## Task Execution History

### T1: Vendor Impeccable with the sync script — PASS (attempt 2)

**Attempt 1** (2026-10-30, Implementer `sonnet` effort medium; Reviewer `opus`)

| Field | Value |
|---|---|
| Files changed | `scripts/sync-impeccable.js` (new), `.gitattributes`, `.claude/skills/impeccable/**` (58 upstream + `LICENSE`, `NOTICE`, `UPSTREAM.md`), staged |
| Red run | `ls .claude/skills/impeccable` → `ls: .claude/skills/impeccable: No such file or directory` |
| Refusal reds | no args → exit 1 `sync-impeccable: --from <upstream checkout> is required`; `--commit 0000000000000000000000000000000000000000` → exit 1 `sync-impeccable: --commit 0000000000000000000000000000000000000000 is not the checkout HEAD (df3a4abe7d0840d5f60324812c432e00b66a4e75)`; untracked file in clone → exit 1 `sync-impeccable: upstream checkout is dirty (uncommitted or untracked changes): <clone>`; one byte appended to `reference/audit.md` → same dirty message. Clone reverted, clean |
| Implementer verification | Run 1 `Files: 0 -> 58 (+58)`, `Size: 0 -> 2232257 bytes`; run 2 `58 -> 58 (+0)`, no diff; launcher `100755`; `.cmd` CRLF in index; 58 hash lines; no `scripts/bin/`; `git diff --cached --check` flags only vendored `reference/harden.md` and `scripts/impeccable.cmd` (upstream bytes). `npm test`: 1201 tests, 8 fail — install-cursor (247 → 308), docs-overview ×3, doctor-codex baseline fixture ×2 (incl. grokbot NFR-1, same fixture), `impeccable-bridge.test.js` "Impeccable must not be vendored" — all T8-owned consumers |
| Evidence re-run | VERIFIED (Leader inline): third run `58 -> 58 (+0)`, exit 0; mode, CRLF, 58 hashes, no `scripts/bin`, bad-commit refusal exit 1, no network module, staged non-vendored files = `.gitattributes` + script |
| Reviewer verdict | **FAIL** (verbatim below) |
| spawns | Implementer not reported by host (worker: 10 tool uses, 96,076 tokens), ended complete; Reviewer not reported by host (7 tool uses, 89,408 tokens), ended complete |

Reviewer FAIL report (verbatim issue):

> **1. Discovered Issue:** `listFiles(srcBuild)` copies whatever is on disk in the checkout's build folder. The dirty check uses `git status --porcelain`, which leaves out ignored files. Upstream `.gitignore:96` ignores `**/skills/impeccable/scripts/bin/`; `git check-ignore -v` confirms it for this exact path. Lines 88 and 55 also ignore `scripts/config.json` and `.impeccable/hook.cache.json`. If a maintainer's clone has ever fetched the engine (`scripts/fetch-engine.mjs`), the script would report the clone as clean, vendor the ~17 MB binary under `scripts/bin/`, and hash it into `UPSTREAM.md`. The T8 hash test would then pass, because the binary is listed there.
> **Violated Rule:** FR-1 "at the upstream pin"; FR-1 "The engine binary (`scripts/bin/**`) SHALL NOT be shipped"; FR-2 "It SHALL refuse to run when the checkout is dirty"; DD-2 "No engine binary in the package".
> **Remediation:** build the file list from tracked files at HEAD (`git -C <from> ls-files -z -- .claude/skills/impeccable`) instead of reading the directory, or use `git status --porcelain --ignored` and refuse when it lists anything under the build. Also add an explicit refusal for any path under `scripts/bin/`. Re-run and confirm a third run gives no diff. Add one refusal red: drop an ignored file into `scripts/bin/` in the clone and quote the refusal.

ADVISORY (attempt 1): CRLF upstream `SKILL.md` would fail with a misleading "no frontmatter fence"; NOTICE key list duplicated from `metadataBlock`; `Vendored` local date makes "no diff" same-day only; upstream NOTICE cites `skill/reference/ios.md` (upstream text, kept verbatim).

Decisions: execute-time spec edit — `design.md` §7.3 *Refuses* cell amended 2026-10-30: "a missing `.claude/skills/impeccable/`" → "a checkout with no `.claude/skills/impeccable/` build" (Reviewer-flagged spec tension; the reading is the only one under which *Does* can run; meaning of the approved requirement unchanged). Carried to the next two Reviewer briefs.

**Attempt 2** (2026-10-30, Implementer `sonnet` effort high; Reviewer `opus` effort high)

| Field | Value |
|---|---|
| Files changed | `scripts/sync-impeccable.js` (file list from `git ls-files -z -s` at the checkout; explicit `scripts/bin/` refusal; scoped `git status --porcelain --ignored` refusal; tracked `scripts/bin/` refusal; symlink/submodule refusal), vendored tree regenerated by the script (no byte change) |
| New refusal red | planted `<clone>/.claude/skills/impeccable/scripts/bin/darwin-arm64/impeccable` (`git check-ignore -v` → `.gitignore:96:**/skills/impeccable/scripts/bin/`; plain `git status --porcelain` → empty) → exit 1 `sync-impeccable: upstream checkout has .claude/skills/impeccable/scripts/bin/ (the engine binary is never vendored, DD-2): remove it from <clone>`. Ignored `scripts/config.json` → exit 1 `sync-impeccable: upstream .claude/skills/impeccable/ has untracked, modified or ignored content (git status --porcelain --ignored):` + `!! .claude/skills/impeccable/scripts/config.json`. Attempt-1 refusals still exit 1. Clone clean afterwards (`--ignored` empty) |
| Implementer verification | Run + `git add` + rerun: `Files: 58 -> 58 (+0)`, `Size: 2232257 -> 2232257 bytes (+0)`, no diff; 58 hash lines; 61 tracked files; launcher `100755`; `.cmd` CRLF in index; `SKILL.md` minus metadata byte-identical to upstream; no network module; non-vendored staged files = `.gitattributes`, script |
| Evidence re-run | VERIFIED (Leader inline): `scripts/bin` plant → exit 1 with the DD-2 message; clone clean after removal; rerun exit 0; no unstaged change in the vendored tree; launcher `100755`; 58 hashes; non-vendored staged = `.gitattributes`, `scripts/sync-impeccable.js` |
| Reviewer verdict | **PASS** — attempt-1 FAIL resolved by three guards that run before `fs.rmSync(TARGET)`; content read from the working tree is required (reading blobs would ship an LF `.cmd`, since upstream sets `*.cmd text eol=crlf`); FR-1, FR-2, amended §7.3, NFR-2, NFR-4 walked term by term; no issues. Includes the named conformance check on the amended §7.3 cell |
| spawns | Implementer not reported by host (6 tool uses, 76,990 tokens), ended complete; Reviewer not reported by host (3 tool uses, 74,521 tokens), ended complete |

ADVISORY (attempt 2): no detection of `--assume-unchanged`/`--skip-worktree` flags (none in the pinned clone; refuse lowercase/`S` tags of `git ls-files -v`); state in `UPSTREAM.md` that hashes are of checkout bytes after eol conversion (matters for the `.cmd`); comment that `trackedBuildFiles` reads the index and is equivalent to HEAD only because the clean check runs first.

**T1 summary**

| Field | Value |
|---|---|
| Final status | PASS, 2 Implementer attempts, 2 Reviewer verdicts (FAIL, PASS) |
| Requirements covered | FR-1 (tree, three AKILI files, frontmatter, no `scripts/bin/`), FR-2 (script clauses, refuse dirty / commit not checked out, no download), FR-3 exec bit at source, NFR-2, NFR-4 (2,232,257 bytes ≤ +2.5 MB) |
| Issues encountered | 8 `npm test` failures, all T8-owned consumers: install-cursor (247 → 308), docs-overview ×3, doctor-codex baseline fixture ×2 (incl. grokbot NFR-1, same fixture), `impeccable-bridge.test.js` "Impeccable must not be vendored". `git diff --check` flags vendored upstream bytes only (`reference/harden.md`, `scripts/impeccable.cmd`); vendored bytes are never altered |
| Budget (running) | tasks 1/9 · authored LOC 277 (script + `.gitattributes`) / ~1,250 · review rounds 2/~16 — within budget |
| Gate | Routine continue (owner brief); next: T2 (HITL P-15 at its pause) and T3 (independent of T2) |

### T2: Vendor and install locks — `[~]` blocked (Pivot P-7)

**Attempt 1** (2026-10-30, Implementer `sonnet` effort medium, parallel with T3)

| Field | Value |
|---|---|
| Files changed | `test/impeccable-vendor.test.js` (new, untracked; uncommitted pending the Pivot) |
| Implementer verification | `node --test test/impeccable-vendor.test.js` → `# tests 20  # pass 20  # fail 0`; `git diff --check` clean |
| Red run | Pre-T1 worktree (`90b35db`): `not ok 1 - ... FR-1 every UPSTREAM.md line matches its vendored file's raw bytes` / `error: "ENOENT: no such file or directory, open '.../pre-t1/.claude/skills/impeccable/UPSTREAM.md'"` (an absence red; the behavioural reds are the falsifiers) |
| Falsifiers | (a) space appended to `reference/polish.md` → `hash mismatch for reference/polish.md` (1 fail). (b) `extra.md` added → `files not in UPSTREAM.md: extra.md` and `62 !== 61` (2 fail). (c) `chmod 644 scripts/impeccable` → `'644' !== '755'` plus six install tests `… scripts/impeccable is not executable` `0 !== 73` (7 fail). (d) `  binding: conditional` deleted → `no '  binding: conditional' under metadata:` (1 fail). Reverted; tree clean, launcher `100755` |
| Judgment calls (verbatim from the report) | LICENSE check is `trimStart().startsWith("Apache License")` because upstream's title line is space-indented. Foreign test seeds `.grokbot/workflows/impeccable/SKILL.md` (`version: 4.9.0`) because "non-grokbot targets have no ownership record. There, an existing foreign `impeccable/` would only get 'skip existing' per file and could still receive new files" |
| Evidence re-run / Reviewer | Not run — the loop stopped on Pivot Detection (Step 2.4) |
| spawns | Implementer not reported by host (13 tool uses, 94,858 tokens), ended complete |

## Pivot Record: T2

**Blocker.** Premise P-7 is false. Design §11 P-7 claimed "Skills reach every target through `copyDirectoryContents(SOURCE_SKILLS, …)` with the owned/foreign/takeover policy". Its "If false" column read: "FR-3's foreign protection needs installer code (High)". Leader verification at `62d999f`:

- `bin/akili.js` `installTool`: `if (paths.ownershipRecord) { … policy = makeOwnershipPolicy(ownership, args); }`. Without an ownership record, `policy` stays `null`.
- `copyDirectoryContents(SOURCE_SKILLS, targetSkills, args, policy)`: with no policy, entries are copied per file. Existing files are skipped, missing files are written, and `--force` overwrites.
- Only Grok Bot has an ownership record (changes/grokbot-target), so P-7 holds for 1 of 6 targets.

**Effect.** FR-3 says "An existing `impeccable` skill AKILI did not install is a **foreign** entry: it is skipped and reported (its version when readable), and replaced only by an explicit `install --force` takeover". Its scenario says: "GIVEN `~/.claude/skills/impeccable/` installed by the developer (version 4.9.0) … THEN the developer's folder is untouched and the install output names it as foreign". Neither holds on Claude Code, OpenCode, Antigravity, Codex or Cursor. On those targets, AKILI would add `LICENSE`, `NOTICE`, `UPSTREAM.md` and any 4.8.0-only files into the developer's 4.9.0 folder. `--force` would overwrite it with no takeover step. No approved task owns installer code: T2 is test-only.

**Alternatives.**

| Option | Change | Cost |
|---|---|---|
| A (Leader recommendation) | New task **T2b**: the installer treats an existing `impeccable/` on a target without an ownership record as foreign unless it carries AKILI's `UPSTREAM.md`. A foreign folder is skipped as a whole and reported with its `version`. `install --force` replaces it whole, never merged. T2's foreign test then covers one non-grokbot target (claude) as well | About +60 LOC of code and +40 LOC of tests; +1 task; +1 to 2 review rounds. Touches `bin/akili.js` (installer safety) |
| B | Amend FR-3 to the installer's existing per-file behavior on the five targets, and keep the foreign policy for Grok Bot only | No code. Accepts a mixed 4.8.0/4.9.0 folder and an unguarded `--force` overwrite of the developer's skill, which FR-3 was written to prevent |
| C | Extend the ownership record to all six targets | Out of scope: a change to the installer contract for every skill |

**Requested.** JC's choice of A, B or C (with any edits). Under A, also approve the budget delta (tasks 9 → 10, LOC +~100, rounds +~2). After approval: amend `requirements.md` FR-3 / `design.md` P-7 + §7.4 / `tasks.md`, close with the two-direction sweep, and re-issue the T2 brief.

### Pivot Record: T2 — correction (2026-10-30, same session, before JC's answer)

The *Effect* paragraph above overstated the gap. The T2 Implementer's claim ("could still receive new files") was adopted without reading the copy loop; the T3 Reviewer contradicted it, and the Leader then read `bin/akili.js` `copyDirectoryContents` and `copyTreeSync` at `62d999f`:

- No policy (five targets): each top-level entry is checked once — `if (exists && !takeover && !args.force) { console.log("skip existing " + targetPath); … continue; }`. An existing `impeccable/` folder is **skipped whole and left untouched**. Nothing merges into it without `--force`.
- With `--force`: `copyTreeSync` recurses with `mkdirSync(…, { recursive: true })` and overwrites file by file. The developer's files that AKILI does not ship stay in place, so the result is a merged folder rather than a whole replacement.

Corrected effect on Claude Code, OpenCode, Antigravity, Codex and Cursor:

| FR-3 obligation | Holds? |
|---|---|
| Developer's folder untouched without `--force` | **Yes** |
| "skipped and reported" | Reported as `skip existing <path>`, not as foreign |
| "(its version when readable)" in the install output | No (the bridge reports `user-installed (<version>)` at the design step) |
| "replaced only by an explicit `install --force` takeover, under the installer's existing ownership rule" | `--force` is the existing rule on these targets, but it merges rather than replaces |

Revised alternatives (these supersede the table above):

| Option | Change | Cost |
|---|---|---|
| **B′ (Leader recommendation)** | Amend FR-3 and its scenario to the existing rule on targets without an ownership record. The folder is skipped whole as `skip existing <path>` and stays untouched, and `--force` overwrites per the existing rule. Foreign naming with the version applies where an ownership record exists (Grok Bot). The bridge already reports `user-installed (<version>)`. T2's foreign test adds a claude-target assertion: bytes untouched and the `skip existing` line present | No code; amendments to `requirements.md` FR-3, `design.md` P-7 and the coverage-map row; about +10 test LOC |
| A′ | New task T2b: for `impeccable/` on targets without an ownership record, report `skip foreign <path> (version <v>)` and make `--force` replace the folder whole (move aside, then copy) | +1 task, about +60 LOC including tests, +1–2 rounds; touches `bin/akili.js` |
| C | Ownership record for all targets | Out of scope |

### T3: Rewrite `impeccable-bridge/SKILL.md` as the AKILI layer — PASS (attempt 2)

**Attempt 1** (2026-10-30, Implementer `sonnet` effort high, parallel with T2; Reviewer `opus` effort high)

| Field | Value |
|---|---|
| Files changed | `.claude/skills/impeccable-bridge/SKILL.md` (full rewrite, 217 lines) |
| Red run | Baseline `grep -c "engine-probe"` → `0`; `grep -c "skill only"` → `1` |
| Implementer verification | `engine-probe` → 2; `skill only`, `npx impeccable detect`, `Unevaluated (Impeccable absent)`, `never copies Impeccable`, `absent`, `not vendored`, `never vendored`, `[Ll]ine [0-9]` → 0 each; `git diff --check` clean. Clause map: `<scratchpad>/t3-map.md` |
| Not Done / Assumptions (verbatim gist; assumptions only, no owed item, no blocker) | Vendored vs user-installed is told apart by an `UPSTREAM.md` beside `impeccable/SKILL.md` ("the design does not say how"). The probe candidate carries `.exe` on Windows, and "supported platform" = macOS/Linux/Windows on arm64/x64, from the launcher's os/arch mapping. P-13 is marked `UNVERIFIED` in Privacy. The NFR-8 8-screen cap and mobile Lighthouse are left to T4's `design-evaluation.md`. `test/impeccable-bridge.test.js` is red until T8 |
| Evidence re-run | VERIFIED (Leader inline; all counts reproduced; `git diff --check` exit 0) |
| Reviewer verdict | **FAIL** (3 issues, verbatim below) |
| spawns | Implementer not reported by host (15 tool uses, 113,162 tokens), ended partial (assumptions field); Reviewer not reported by host (26 tool uses, 120,406 tokens), ended complete |

Reviewer FAIL report (verbatim issues):

> **Issue 1.** Discovered issue: The Step 0 location list misses where `akili install` actually puts the vendored copy. It leaves out OpenCode `~/.config/opencode/skills` (and `./.config/opencode/skills` with `--local`). It leaves out Antigravity `~/.gemini/skills` and `~/.gemini/antigravity-cli/skills` (and their local forms), per `TOOL_REGISTRY` and `baseOpencode`/`baseAntigravity` in `bin/akili.js`. It also leaves out the Grok Bot workflows root. It lists `.opencode/skills` and `.agent/skills`, which are not installer destinations. The list was carried over from v1. On those hosts a vendored install reads `missing`, so the fallback skills lead. Violated rule: FR-4 ("Impeccable leads whenever the source is not `missing`") and the BUT clause of its scenario (no routing to the fallback). It also contradicts the bridge's own line 16 ("installed to every target"). Remediation: Look first for the `impeccable/` folder next to this bridge's own folder, wherever the host installed AKILI skills. Then check the listed project and global roots, using the installer's real per-target skill roots.
>
> **Issue 2.** Discovered issue: Line 137 says "Use no `npx` form … for anything else in this package unless it carries `--no-install`; the package prescribes none". The install-routes table on lines 207 and 209 gives `npx impeccable install` and `npx impeccable update` with no `--no-install`. The file contradicts itself. "Prescribes none" is also false at HEAD: `akili-audit.md:141`, `akili-validate.md:137` and `akili-test.md:189` still carry `npx impeccable detect`. That is T5's work, but the sentence asserts it as a fact today. Violated rule: FR-6, whose second bullet keeps the upstream routes as optional advice; the restriction covers prescribing detector and Lighthouse runs. Remediation: Limit line 137 to the detector and Lighthouse. Name the exception: the optional upstream routes under *Install routes*, never run without consent. Drop "the package prescribes none".
>
> **Issue 3.** Discovered issue: Line 16 says Impeccable is shipped "**vendored, byte-identical**" with no qualifier. Line 217 and the Glossary say "byte-identical except for the declared frontmatter block", and the vendored `SKILL.md` does carry that `metadata` block. Violated rule: NFR-2 (the modification must be declared) and the Glossary's definition of *Vendored skill*. The line also restates a superseded phrasing in the file (KZ-changes--kaizen-loop-closure-2). Remediation: Change it to "byte-identical except for a declared frontmatter block (see `NOTICE`)".

ADVISORY (attempt 1): the consent field for no-download alternatives omits FR-5's "e.g. the npm CLI" and the `npm i -g impeccable` wording, and "engine binary" may read as excluding the npm CLI. `ready (<location>)` in the table differs from `ready (<location>, engine <version>)` in Step 0 (inherited FR-4 vs §7.1). KZ-004: no rule says what a later phase records after an earlier decline in the same session. The scripted install route omits upstream's `-y`. P-13 stays UNVERIFIED (the upstream `README.repo.md` confirms `DO_NOT_TRACK=1` for telemetry only). The `UPSTREAM.md` marker assumption was accepted as sound.

**Attempt 2** (2026-10-30, Implementer `sonnet` effort xhigh; Reviewer `opus` effort xhigh)

| Field | Value |
|---|---|
| Files changed | `.claude/skills/impeccable-bridge/SKILL.md` |
| Fixes (verbatim) | Issue 1: Step 0 "Locations, in order:" — (1) "**Next to this bridge.** The `impeccable/` folder beside this bridge's own folder, wherever the host installed AKILI skills…"; (2) a per-target root table from `TOOL_REGISTRY`/`baseOpencode`/`baseAntigravity`; (3) plugin-namespaced command; "A root given to `akili install` through a `--*-target` flag is not in the table; the folder beside this bridge (1) covers it." Issue 2: "Use no `npx` form for the detector or for Lighthouse unless it carries `--no-install`. The one exception is the optional upstream routes under *Install routes*, which are never run without consent." Issue 3: "AKILI ships Impeccable **vendored, byte-identical except for a declared frontmatter block (see `NOTICE`)**" |
| `[advisory-grade]` additions | declined re-probe sentence; state-table `ready (<location>, engine <version>)`; FR-5's "e.g. the npm CLI" wording in the no-download alternatives row |
| Implementer verification | `engine-probe` 2; `skill only`, `npx impeccable detect`, `Unevaluated (Impeccable absent)`, `never copies Impeccable`, `never vendored`, `not vendored`, `[Ll]ine [0-9]` → 0; `git diff --check` clean |
| Not Done / Assumptions (verbatim gist; assumptions only) | Project roots for Antigravity and Grok Bot were read from the `--local` bases in `bin/akili.js`, not from an installer run. A `--*-target` root relies on the "next to this bridge" check |
| Evidence re-run | VERIFIED (Leader inline): counts reproduced, plus `.opencode/skills`/`.agent/skills` → 0; `install --tool all --local --dry-run` places `impeccable-bridge` at `./.claude/skills`, `./.config/opencode/skills`, `./.gemini/config/skills`, `./.gemini/skills`, `./.gemini/antigravity-cli/skills`, `./.agents/skills` ×2, matching the table |
| Reviewer verdict | **PASS** — all three attempt-1 issues resolved; FR-4…FR-9, FR-12, FR-14, NFR-1/3/5 re-walked; all 35 §7.2 cells present; every enumerated state has a consequence; upstream claims checked against `scripts/impeccable` and upstream `SKILL.md`; nothing contrary to the amended §7.3 cell |
| spawns | Implementer not reported by host (11 tool uses, 93,178 tokens), ended partial (assumptions only); Reviewer not reported by host (9 tool uses, 97,540 tokens), ended complete |

ADVISORY (attempt 2): a later phase after a consented download that failed (`unavailable (<reason>)`) has no stated re-probe outcome, and a literal reading could relabel it as `declined`. The probe trusts a sibling `bin/<os>-<arch>` engine whatever its version (pinning `IMPECCABLE_BIN` makes it agree with the launcher). Recorded only; not a task.

**T3 summary**

| Field | Value |
|---|---|
| Final status | PASS, 2 Implementer attempts, 2 Reviewer verdicts (FAIL, PASS) |
| Requirements covered | FR-4, FR-5, FR-6, FR-7, FR-8, FR-9, FR-12, FR-14 (bridge clause), NFR-1, NFR-3, NFR-5; clause map at `<scratchpad>/t3-map.md` |
| Decisions | `design.md` §7.3 carry ended (carried to T1 attempt 2 and T3 attempt 2 Reviewer briefs) |
| Issues encountered | `test/impeccable-bridge.test.js` pins the old wording and is expected red until T8. Falsifiers (gate reorder, `declined` row deletion, `npx impeccable detect` reinsert) run after T8 |
| Budget (running) | tasks 2/9 closed (T2 `[~]` Pivot) · authored LOC ~440 (T1 277 + bridge +163; T2 test uncommitted) / ~1,250 · review rounds 4/~16 — within budget |

### T5: Wire validate, test and audit commands — PASS (attempt 1)

| Field | Value |
|---|---|
| Date / models | 2026-10-30; Implementer `sonnet` effort medium; Reviewer `opus` effort medium (parallel wave with T4, T6) |
| Files changed | `.claude/commands/akili-validate.md` (+12 −6), `akili-test.md` (+9 −3), `akili-audit.md` (+11 −3) |
| Red run | `npx impeccable detect`: validate 1 / test 1 / audit 1; `Unevaluated (Impeccable absent)`: validate 1 / test 0 / audit 1 |
| Implementer verification | After: those patterns, `npx`, `skill only` and the old absent/state wording → 0 in all three files; `impeccable-bridge` named 2/2/1; `git diff --check` clean. Validate: Step 0, a five-row state table, FR-9 D-2 `WARN (unverified first visit)` with a manual fold check at the HITL pause, "This review adds no performance gate". Test: a five-row table pointing at *Detector gate*. Audit: item 1 records skill source and engine state; item 4 is a five-row, report-only table; the checklist asks for the scan matrix. Per-cell map: `<scratchpad>/t5-map.md` |
| Evidence re-run | VERIFIED (Leader inline): per-file `npx impeccable detect`/`Unevaluated (Impeccable absent)`/`npx`/`skill only`/line pointers → 0; bridge 2/2/1; `git diff --check` exit 0 |
| Reviewer verdict | **PASS** — all 15 cells (3 commands × 5 value groups) have a stated consequence matching the bridge; FR-6, FR-8, FR-9 D-2 (verbatim), FR-10 Q2 met; no bridge command string restated |
| Spec tension (Reviewer, verbatim) | "This is still in tension with design §7.2 ('The commands state their row in one line each') and DD-9. **Proposed amendment (one line, design §7.2 / DD-9):** 'A command states its row as one pointer line, or as a per-value consequence table when that is the only way to satisfy FR-4's per-value obligation; it never restates a bridge command string or a rule's wording.'" Presented to JC at this gate (KZ-changes--persona-upgrade-3); answer to be recorded here |
| Consumers | `test/impeccable-bridge.test.js` validate regex ``Exit `0` passes; exit `2` is \*\*FAIL\*\*`` no longer matches (T8 amends) |
| spawns | Implementer not reported by host (8 tool uses, 81,391 tokens), ended complete; Reviewer not reported by host (5 tool uses, 76,223 tokens), ended complete |
| Requirements covered | FR-4 consumers (validate, test, audit), FR-6, FR-8, FR-9 (validate, D-2), FR-10 Q2, FR-14 |

### T6: Wire constitution, specify, propose and the fallback skills — PASS (attempt 1)

| Field | Value |
|---|---|
| Date / models | 2026-10-30; Implementer `sonnet` effort medium; Reviewer `opus` effort medium (parallel wave with T4, T5) |
| Files changed | `.claude/commands/akili-constitution.md`, `akili-specify.md`, `akili-propose.md`, `.claude/skills/ui-ux-pro-max/SKILL.md`, `.claude/skills/frontend-design/SKILL.md` (+14 lines in total) |
| Red run | `grep -c "skill only"`: constitution `1`, specify `1` |
| Implementer verification | After, all five files: `skill only`, "`installed` or `skill only`", `Unevaluated (Impeccable absent)`, `npx impeccable detect`, `never copies Impeccable`, "Impeccable is installed/absent/not installed" → 0; `impeccable-bridge` named 4/5/1 (constitution/specify/propose); waiver row has five columns (Rule, Scope, Reason, Approver, Date); `git diff --check` clean. `node --test test/impeccable-bridge.test.js`: 3 pass, 3 fail, all T8-owned |
| Evidence re-run | VERIFIED (Leader inline): per-file sweep 0, bridge 4/5/1/1/2, no line pointers, `git diff --check` exit 0 |
| Reviewer verdict | **PASS** — both disqualifiers clear; four §7.2 rows stated or pointed at by named row; a pointer satisfies FR-4 given FR-14 and the bridge's own "states its own row in one line and points at this section"; DD-10 roles unchanged; nothing contradicts the bridge. The "ui-ux-pro-max no longer leads" assertion is not reached by the automated run until T8; it was confirmed by hand (0 hits) |
| Not Done / Assumptions (verbatim gist; assumptions only) | Engine-state columns (`ready`, `consent needed`, `declined`) are not restated; each command points at the bridge table (DD-9, FR-14) |
| Note | T5 (tables) and T6 (pointers) take the two readings of the same §7.2 sentence; both passed. The amendment proposed at T5 would make both conformant by name |
| spawns | Implementer not reported by host (8 tool uses, 80,686 tokens), ended partial (assumptions only); Reviewer not reported by host (6 tool uses, 78,237 tokens), ended complete |
| Requirements covered | FR-4 consumers (constitution, specify, execute via tasks), FR-12 (constitution row shape), FR-14, DD-10 |

### T4: Extend `references/design-evaluation.md` — PASS (attempt 2)

**Attempt 1** (2026-10-30, Implementer `sonnet` effort high; Reviewer `opus` effort high; parallel wave with T5, T6)

| Field | Value |
|---|---|
| Files changed | `.claude/skills/impeccable-bridge/references/design-evaluation.md` (+93 −16) |
| Red run | `grep -c "median"` → `0`; `grep -c "Score source"` → `0` |
| Implementer verification | `median` 4, `Score source` 3; the sweep (`npx impeccable detect`, `Unevaluated (Impeccable absent)`, `skill only`, `never copies Impeccable`, `installed`, `absent`) → 0; line pointers 0; `git diff --check` clean. Clause map: `<scratchpad>/t4-map.md` |
| Implementer judgment calls | `E3b` name kept, no renumbering; `Unevaluated (<n> of 3 runs completed)`; `out of scope` rows not counted among P1–P3; `First-visit pass` column; E3b also barred beside the E3 capture |
| Evidence re-run | VERIFIED (Leader inline): `median` 4, `Score source` 3, sweep 0, line pointers 0, `Unevaluated (Lighthouse unavailable)` 1, `at least 3` 1, each of the 8 §5.4 header fields present once, `git diff --check` exit 0 |
| Reviewer verdict | **FAIL** (3 issues, verbatim below). Coverage of FR-10, FR-11, FR-13, §5.4 and the §7.2 audit row was complete; all five judgment calls were accepted as not changing what a requirement means |
| spawns | Implementer not reported by host (12 tool uses, 104,499 tokens), ended complete; Reviewer not reported by host (12 tool uses, 88,109 tokens), ended complete |

Reviewer FAIL report (verbatim issues):

> 1. **Discovered Issue:** The E3b row "Resolve, never install" ends with "Lighthouse and a browser are never downloaded without an explicit yes, in any approval mode". This is a paraphrase of the bridge's *Engine consent* section ("Nothing downloads or installs the engine, Lighthouse or a browser without an explicit yes, in every approval mode") and of its *Privacy and consent* section. **Violated Rule:** Task disqualifier "any restatement of a bridge rule instead of a pointer". FR-14 says "These SHALL point at the bridge and SHALL NOT restate". DD-9 adds: "A rule restated in six places drifts". **Remediation:** Replace the sentence with a pointer: "Downloading Lighthouse or a browser follows the bridge's *Privacy and consent*."
> 2. **Discovered Issue:** E5 says "`Proposed waiver (<clause>)` findings are not P1-P3 and are counted in `Proposed waivers`". The `Waived?` footnote repeats it: "Rows marked `Proposed waiver` … are not P1-P3 findings". Both restate the *Counting* row of the bridge's *Design Waivers* section, which is the bridge's to own under FR-12. **Violated Rule:** Same disqualifier. FR-14 states "`impeccable-bridge` … SHALL own FR-4 to FR-9 and FR-12". **Remediation:** In E5, keep "Match findings against *Design Waivers* as the bridge says (including its *Counting* row)" and drop the restated consequence. In the footnote, keep the five values and point to the bridge for Proposed-waiver counting. The `out of scope` half of the footnote can stay because it is this file's own rule. The checklist line checking that count stays as well.
> 3. **Discovered Issue:** E3 says "(Read screens get none; say so per screen)". That restates the bridge's *First-visit pass* bullet: "**Read** screens need no first-visit pass; the report says so for that screen". **Violated Rule:** Same disqualifier. **Remediation:** Delete the parenthetical. The `First-visit pass` column value `not required (Read)` already captures the outcome in the template.

ADVISORY (attempt 1): E3b cites "root `AGENTS.md`, *Concurrency*", which exists only in this repository; installed projects carry it in `.agents/leader.md` → *Concurrency protocol*. Judgment call 5 is an obligation FR-10 does not state, but it is inert because E3b already runs after E3. `Unevaluated (no URL)` and `n/a` fall under FR-13's `Unevaluated (<reason>)`.

**Attempt 2** (2026-10-30, Implementer `sonnet` effort xhigh; Reviewer `opus` effort xhigh)

| Field | Value |
|---|---|
| Files changed | `.claude/skills/impeccable-bridge/references/design-evaluation.md` (+93 −16 vs HEAD) |
| Fixes (verbatim) | (1) "Downloading Lighthouse or a browser follows the bridge's *Privacy and consent*"; (2) E5 "Match findings against *Design Waivers* as the bridge says (including its *Counting* row)"; footnote "Proposed-waiver counting follows the bridge's *Design Waivers*; `out of scope` rows are not P1-P3 findings."; (3) the "(Read screens get none…)" parenthetical deleted. `[advisory-grade]`: E3b concurrency citation now "(`.agents/leader.md`, *Concurrency protocol*)" |
| Evidence re-run | VERIFIED (Leader inline): `median` 4, `Score source` 3, `Unevaluated (Lighthouse unavailable)` 1, `at least 3` 1; old patterns, line pointers, "Read screens get none", "never downloaded without", "root `AGENTS.md`" → 0; all 8 header fields once; `Concurrency protocol` heading exists in `.claude/templates/leader.md`; `git diff --check` exit 0 |
| Reviewer verdict | **PASS** — attempt-1 issues resolved; FR-10, FR-11, FR-13 and the FR-14 reference clause re-walked term by term; every pointer target exists in the committed bridge; the two flagged checklist lines stay (they verify columns this file owns) |
| spawns | Implementer not reported by host (6 tool uses, 68,761 tokens), ended complete; Reviewer not reported by host (6 tool uses, 75,828 tokens), ended complete |

ADVISORY (attempt 2): a project that skipped `/akili-constitution` has no `.agents/leader.md` (not a regression; the old target had the same limit); the stderr checklist line could end "(bridge *Exit codes*)".

**T4 summary:** PASS, 2 attempts, 2 Reviewer verdicts (FAIL, PASS). Requirements covered: FR-10, FR-11, FR-13, FR-14 (reference clause), NFR-5, NFR-8 (mobile Lighthouse). Judgment calls accepted by the Reviewer: `E3b`, `Unevaluated (<n> of 3 runs completed)`, `out of scope` outside P1–P3, `First-visit pass` column, E3b barred beside E3 (inert).

## Pivot Record: T2 — decision (2026-10-30 11:56 UTC-5)

JC chose **Option A**, approved the budget delta (9 → 10 tasks, about +100 LOC, about +2 review rounds) and said: "Enmienda el spec, agrega T2b y sigue." A and A′ name the same change (the installer treats an existing `impeccable/` without AKILI's `UPSTREAM.md` as foreign on the five targets without an ownership record, skips it whole and reports it with its version, and `--force` replaces it whole). The written T2b follows that content.

Amendments, made by the Leader at this decision:

| File | Change |
|---|---|
| `requirements.md` | §4 installer row qualified: the policy exists only where there is an ownership record. FR-3 gains a bullet: "On a target with no ownership record (Claude Code, OpenCode, Antigravity, Codex, Cursor), an existing `impeccable/` is AKILI's only when it holds AKILI's `UPSTREAM.md`; otherwise it is foreign. A foreign folder is skipped whole and reported as foreign with its version when readable. `install --force` replaces it whole (moved aside, then copied), never merged" |
| `design.md` | P-7 *Settled by*: false at T2 and settled by T2b. §7.4 install-test row: foreign cases on Grok Bot and Claude Code. New §7.4 row *Installer (T2b)*. §12: 10 tasks, ~1,350 LOC, ~18 rounds |
| `tasks.md` | Budget line; dependency graph `T1 ──► T2b ──► T2`; new **T2b**; T2 depends on T1 and T2b, and its scope adds the Claude Code foreign case; coverage-map FR-3 row |

Correction closure: forward sweep for `9 tasks`, `~1,250`, `~16 review`, `**9**` and "existing installer policy" across the spec folder found no stale budget or ownership claim (the one `**9**` hit is the baseline `skill only` count). Backward: the Glossary *Skill source* row ("a foreign same-name skill AKILI did not overwrite") stays true. The `git diff` of the three files shows only removals that the amendment replaced. The T2 brief will be re-issued after T2b, carrying the amended text.

**P-15:** not yet checked by JC (11:56). The exact steps were given to the maintainer. It stays open at the T2 pause.

**Spec tension from T5:** the §7.2/DD-9 amendment proposal awaits JC's answer.

### T7: Governance, docs, README and counts — PASS (attempt 1)

| Field | Value |
|---|---|
| Date / models | 2026-10-30; Implementer `sonnet` effort high; Reviewer `opus` effort high (parallel with T2b) |
| Files changed | `docs/skills/governance.md`, `docs/skills/impeccable.md` (new), `docs/skills/{README,impeccable-bridge,ui-ux-pro-max,frontend-design}.md`, `docs/overview.md`, `docs/commands/akili-audit.md`, `docs/cli.md`, `README.md`, `docs/release-checklist.md` |
| Red run | `grep -c "30 packaged skills" docs/cli.md` → `4` |
| Implementer verification | `30 packaged skills` 0 / `31 packaged skills` 4; `ls .claude/skills \| wc -l` → 31; `find .claude/skills/impeccable -type f \| wc -l` → 61 (58 checksum lines). Sweep: 0 for the four FR-14 patterns and the "never/not vendored" family; `skill only` has 2 unrelated prose hits (`.claude/templates/leader.md:101` "Load that skill only when…", `docs/flow.md:681` "loads the skill only when…"). No shipped doc points into `docs/specs/changes/impeccable*`. `node --test test/docs-overview.test.js` 13/13; `git diff --check` clean |
| P-13 | **Settled: false.** Update check: upstream `docs/CLI-CONTRACT.md`, section `context.mjs -> impeccable context`, bullets *Update cache* and *Env vars read* — skipped only by `IMPECCABLE_NO_UPDATE_CHECK` or `updateCheck: false`. Telemetry: `README.md` "Telemetry." paragraph — `DO_NOT_TRACK` stops the anonymous record, not the catalog fetch. Cited in `docs/skills/impeccable.md`; the compiled 0.1.18 engine is marked `Unverified:` |
| Evidence re-run | VERIFIED (Leader inline): counts reproduced with `git grep`; 0 pointers into this spec; docs-overview 13 pass 0 fail; `git diff --check` exit 0 |
| Reviewer verdict | **PASS** — every aggregate and factual claim was quote-checked at HEAD ("all six targets" by `install --tool all --dry-run` plus a Grok Bot dry run; 31; 61/58; pin values; P-13 citations at the quoted upstream sections). No AKILI authorship of Impeccable; non-affiliation on every attribution surface; docs agree with the amended FR-3. `akili-marketing-docs.test.js` test 8 is red on "30 skills", which T8 owns |
| spawns | Implementer not reported by host (30 tool uses, 149,596 tokens), ended partial (assumptions only); Reviewer not reported by host (23 tool uses, 123,360 tokens), ended complete |
| Requirements covered | FR-14 (governance, attribution, disclosure), FR-2 (release-checklist step), FR-3 (docs of the amended behavior), NFR-2, NFR-7 |

ADVISORY (T7): `npx impeccable telemetry off` is quoted as upstream fact, not an FR-6 prescription; suggest noting it fetches the npm CLI and that the config key is the no-download route. The bridge's *Privacy and consent* still reads UNVERIFIED for P-13, and with only `DO_NOT_TRACK=1` a `ready` engine's `context` call can reach `impeccable.style/api/version`; adding `IMPECCABLE_NO_UPDATE_CHECK=1` changes behavior and is a spec-gap question for JC, not a T7 fix. `docs/cli.md` `--force` lines do not mention the `impeccable` foreign rule. `docs/skills/impeccable-bridge.md` "the vendored launcher" should read "the skill's launcher" for `user-installed`. `config.local.json` is also honoured upstream.

Decisions: execute-time spec edit — `design.md` §11 P-13 *Settled by* records the outcome (false, cited), per T7's done criterion. The launcher-prefix question went to JC at 2026-10-30 as options (i) disclose only / (ii) add `IMPECCABLE_NO_UPDATE_CHECK=1`; the answer will be recorded here. Carry the P-13 edit to the next Reviewer brief (T2b review already in flight; carried to T8).

T8 note (Leader): the FR-14 negative sweep keyed on the bare string `skill only` hits two unrelated prose lines. T8's brief must key that pattern on the state value (`` `skill only` `` in backticks, or the three-state phrasing) rather than exclude files.

### T2b: Installer foreign rule for `impeccable` on targets without an ownership record — PASS (attempt 1)

| Field | Value |
|---|---|
| Date / models | 2026-10-30; Implementer `sonnet` effort high; two parallel lens Reviewers `opus` effort high (data-loss surface → *Parallel lens reviewers*): A = resilience + risk, B = readability + reliability, both with baseline conformance |
| Files changed | `bin/akili.js` (+96 −6): `makeImpeccableForeignPolicy` (other names → `owned`; `impeccable` absent → `write`; holds `UPSTREAM.md` → `owned`; else `foreign` with `skip foreign <path> <version>`; foreign + `install --force` → `takeover` via `moveEntryAside`, `copyTreeSync`, `finish()`); `installTool` passes `policy \|\| makeImpeccableForeignPolicy(...)`; `copyDirectoryContents` calls `policy.restore()` when a takeover copy throws; `logForeignSkip` gains an optional version; `update` summary names grokbot only when grokbot was updated. `test/install-impeccable-foreign.test.js` (new, 151 lines, 5 tests) |
| Red run | New test on a `62d999f` worktree: `not ok 1 … error: 'THEN the output names the foreign folder with its version'`; `not ok 2 … error: 'THEN the output reports the takeover'`; `not ok 5 … The input did not match the regular expression /skip foreign .*impeccable 4\.9\.0/`; tests 3 and 4 pass (today's behavior) |
| Falsifier | Policy → `null` in `installTool`: `# pass 2 # fail 3` (tests 1, 2, 5); reverted → `# pass 5 # fail 0` |
| Implementer verification | Foreign suite 5/0. Install suites identical before (`62d999f`) and after: install-cursor 10/2, install-grokbot 32/1, install-grokbot-edge 14/0; failures are the T8-owned `expected 247 packaged skill files under .claude/skills; counted 308 instead` and the doctor-codex baseline (cursor test 11, grokbot NFR-1) |
| Not Done / Assumptions (verbatim gist; no owed item) | The takeover directory is `<skills-root>/../.akili-takeover`, outside the skills root. No automated test for the copy-failure restore path ("could not trigger a failed copy without mocks") |
| Evidence re-run | VERIFIED (Leader inline): same pass/fail counts per suite; `install-cursor` failure confirmed as the 247 → 308 count; `git diff --check` exit 0 |
| Reviewer A verdict | **PASS** — FR-3 amended bullet and §7.4 *Installer (T2b)* met. Live probes in scratch HOMEs: EXDEV rename fails before any move (folder intact); ENOSPC after the move → `restore()` put the folder back (developer file present); existing `.akili-takeover` file → EEXIST before the move; symlinked `impeccable` → link moved, target untouched; owned copy + `--force` → today's merge; dry run moves nothing. The `update`-summary change is in scope ("keeps the summary truthful"). The untested restore path is not in the task's Tests list; exercised by hand |
| Reviewer B verdict | **PASS** — FR-3 walked term by term; for non-`impeccable` entries a passed policy changes no output, counter or `--force` behavior; tests (1)–(4) assert each clause; CRLF and quoted `version` parse (live probe) |
| spawns | Implementer not reported by host (14 tool uses, 97,273 tokens), ended partial (assumptions only); Reviewer A not reported by host (13 tool uses, 103,929 tokens), ended complete; Reviewer B not reported by host (10 tool uses, 83,502 tokens), ended complete |
| Requirements covered | FR-3 (foreign clause, five-target bullet, scenario's install half), NFR-1 |
| Decisions | Carried the execute-time spec edits (FR-3 bullet, P-7, §7.4, §12, P-13) as named conformance checks to both Reviewers via the spec pointers |

ADVISORY (T2b, recorded only — not tasks): EXDEV/EEXIST during a takeover aborts the whole install with a stack trace (by design the folder stays whole; catch, report "left in place" and continue). After `restore()` or EXDEV an empty `.akili-takeover/` remains, and no "put back" line is printed. Under `--local` for Codex/Cursor a crash leftover lands in the project's `.agents/.akili-takeover`. With Grok Bot plus another tool, `totals.foreignSkipped` mixes targets, so the `update` line and the Grok Bot next-steps hint miscount a Claude `impeccable` skip. No automated restore test (ENOSPC fixture impractical in CI). Test (1)'s leftover check looks in `.claude/skills/` instead of `.claude/.akili-takeover`. A UTF-8 BOM or trailing comment hides the version. No take-over hint on the five targets. `finish()` duplicates `makeOwnershipPolicy`'s. An AKILI-owned copy updated with `--force` merges and keeps files dropped upstream (today's behavior).

Budget (running): tasks 7/10 closed (T1, T2b, T3, T4, T5, T6, T7; T2 at its P-15 pause) · authored LOC 964 (measured with `git show --numstat`, insertions: T1 277, T3 163, T4 93, T5 32, T6 14, T7 138, T2b 247; T2's test is uncommitted; a first figure of ≈ 1,040 used an unmeasured T7 estimate and is corrected here) / ~1,350 · review rounds 13/~18 (T2b's two lens verdicts count as one round each) — within budget, the margin narrowing

### T2: Vendor and install locks — Reviewer PASS; `[~]` until the P-15 HITL check

**Attempt 1, re-issued after the Pivot** (2026-10-30; Implementer `sonnet` effort medium; Reviewer `opus` effort high; no rework attempt consumed by the Pivot)

| Field | Value |
|---|---|
| Files changed | `test/impeccable-vendor.test.js` (new, 320 lines; 23 tests: the 20 from before the Pivot, plus Claude Code foreign without `--force`, Claude Code `--force`, Grok Bot `--force`) |
| Red run | Before the Pivot: pre-T1 worktree `90b35db` → `not ok 1 - ... FR-1 every UPSTREAM.md line matches its vendored file's raw bytes` / `ENOENT … UPSTREAM.md`. The new assertions' red is the falsifier below |
| Falsifiers | (a)–(d) before the Pivot (see the attempt-1 entry above). After the Pivot: `policy \|\| makeImpeccableForeignPolicy(...)` → `policy` gives `# pass 21 # fail 2` (tests 21, 22; test 22 "folder does not equal the vendored tree"); reverted to 23/23, `bin/` clean. (c) re-run: `# pass 16 # fail 7` (mode + install for claude, opencode, antigravity, codex, cursor, grokbot); restored `100755`, `.claude` clean |
| Implementer verification | `# tests 23 # pass 23 # fail 0`; `git diff --no-index --check` clean |
| Evidence re-run | VERIFIED (Leader inline): `# tests 23 # pass 23 # fail 0 # skipped 0`; status shows only the new test file |
| Reviewer verdict | **PASS** — every scope clause has an assertion; raw-byte hashing covers the `.cmd`; the six-target loop; each falsifier mutates the asserted property; the `SKILL.md` hash after block removal locks the six upstream key values; the `trimStart` call is correct for the indented Apache header; no test reads `docs/specs/`; temp homes cleaned |
| spawns | Implementer before the Pivot, not reported by host (13 tool uses, 94,858 tokens), ended complete; Implementer after the Pivot, not reported by host (6 tool uses, 77,250 tokens), ended complete; Reviewer not reported by host (7 tool uses, 88,646 tokens), ended complete |
| Requirements covered | FR-1 Verbatim scenario (BUT, AND IT MUST), FR-2 "Local edit creeps in", FR-3 (six targets, exec bit, foreign on Grok Bot and Claude Code as amended), NFR-2, NFR-4 (relative count), NFR-6 (script not shipped) |
| Open done criterion | **P-15 HITL check**: the maintainer confirms Claude Code lists `impeccable` from a scratch install. Steps were given to JC on 2026-10-30; not yet run. T2 stays `[~]` until the answer is recorded here |

ADVISORY (T2): the `package.json` `files` check matches four literal spellings (a future glob would slip past; `npm pack --dry-run --json` would be exact). The header comment still says the foreign case is tested on Grok Bot only. `Version 2.0` is checked anywhere in `LICENSE`, and `LICENSE` is not hash-locked. The install test passes if at least one `impeccable/` is found, so a missing Antigravity root of three would go unnoticed. NFR-4's pin is relative here; the absolute pin is `install-cursor.test.js` (T8).

**Forward pointer → T8 (record; carry into the T8 brief):** FR-3 "`akili doctor` SHALL count `impeccable` like any other packaged skill" has no gate yet. The coverage map gives T2 presence, mode, six targets and foreign only. The gate is the `OK impeccable` line T8 adds to `test/fixtures/doctor-codex-baseline.txt`, which lists only `OK impeccable-bridge` today. T8's Reviewer must confirm that line lands.
