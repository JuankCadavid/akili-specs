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
