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
