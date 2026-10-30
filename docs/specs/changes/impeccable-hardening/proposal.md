# Proposal: Ship Impeccable inside AKILI, and harden its design gates

**Answer first (revision 2, 2026-10-30):** the maintainer's intent was that Impeccable ships *inside* AKILI, so every AKILI run uses it. v2.39.0 shipped only `impeccable-bridge`, which routes to a skill AKILI never installs, so on a normal machine Impeccable is always "absent". This revision changes three things:

1. It **vendors the upstream `impeccable` skill verbatim** (Apache-2.0, pinned to 4.8.0 at `df3a4ab`) into `.claude/skills/impeccable/` with its `LICENSE` and `NOTICE`. The installer then delivers it to all six targets like any other skill.
2. It **keeps `impeccable-bridge` as a thin AKILI-owned layer**. Its job changes from "find the skill" to: get engine consent, own the AKILI gates and the report template, and keep the design source of truth.
3. It **replaces `npx` with the vendored launcher**, behind a consent gate. The launcher would otherwise download its 17 MB engine binary on first run without asking.

The 12 hardening gaps from the first dogfood run (revision 1) remain in scope. The release becomes **minor 2.40.0**.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-hardening`. Slug derived from the free-text argument; it matches the worktree name |
| Type | Change |
| Deliverable | software (a vendored third-party skill, a methodology skill, prompts, docs, tests) |
| Approval Mode | gated |
| Status | **Revision 2: awaiting approval.** Revision 1 was approved 2026-10-30 10:38 (UTC-5) with Q1 yes, Q2 no, Q3 `design.md` override with `390x844` default, and Q4 yes (done, `b6575d8`). Those decisions carry over. Revision 2 follows the maintainer's 10:48 clarification: "él esperaba que Impeccable … quedara DENTRO de la metodología con sus instrucciones, y que al correr AKILI simplemente se use ese skill … decide tú la estructura correcta" |
| Requested by | Juan Carlos Cadavid (maintainer), 2026-10-30 |
| Source | `~/akili-audits/2026-10-30-akili-web-design.md` (gaps G1–G12), plus the upstream repository `pbakaus/impeccable` cloned read-only at `df3a4abe7d0840d5f60324812c432e00b66a4e75` (2026-10-30) |
| Source questions | Jira/Figma skipped because the brief supplied the source; confirmed by the maintainer at approval of revision 1 |
| Visual | None (no UI in this repository) |
| Depends on | `changes/impeccable-design`, archived 2026-10-30 to `docs/specs/archive/2026-10-30-changes--impeccable-design/` (Q4) |
| Parallel-safe | yes with `mcp-separation` and `review-intensity-trial-terms`, except the shared `CHANGELOG.md` `Unreleased` block and the skill-count tests |
| Branch | `JuankCadavid/impeccable-hardening`, local commits only: no push, no PR, no publish |
| Release | **minor 2.40.0**: a new packaged skill and new install content in all targets |

## 2. Intent

Running AKILI on a UI project should use Impeccable's design instructions without the developer installing anything else. AKILI should still never download or install a binary without consent, and its gates should see what a first-time mobile visitor sees.

## 3. Problem / Current Behavior

### 3.1 Why the v2.39.0 design missed the intent

| # | Current behavior | Citation |
|---|---|---|
| D1 | AKILI ships no Impeccable instructions. `impeccable-bridge` only detects an Impeccable skill installed elsewhere and routes to it | `.claude/skills/impeccable-bridge/SKILL.md` *Roles*, *Step 0*; `ls .claude/skills` (no `impeccable/`) |
| D2 | The no-vendoring choice came from governance: "Environment-provided skills are referenced, never vendored", with Impeccable listed as the second such skill | `docs/skills/governance.md` *Environment-provided skills*, rule 1 and the *Impeccable* paragraph |
| D3 | Rule 1's rationale ("the tool's own binary serves the version-matched guide; a vendored copy goes stale") **does not hold for Impeccable**. The npm package carries no skill text, only `cli/bin/`, `LICENSE` and engine checksums | `package.json` `"files"` of `impeccable@4.8.0` in the local npx cache: `cli/bin/`, `skill/scripts/engine-checksums.txt`, `LICENSE` |
| D4 | So on any machine where the user has not run `npx impeccable install` themselves, every AKILI design step takes the fallback. That is exactly what the 2026-10-30 run recorded | report *Impeccable-bridge detection state*: all skill probes "not found" |

### 3.2 What the upstream skill is (verified at `df3a4ab`)

| Fact | Citation |
|---|---|
| License Apache-2.0 (full text in `LICENSE`). `NOTICE.md` credits ehmo's `platform-design-skills` (MIT) for `ios.md`/`android.md` | `LICENSE`; `NOTICE.md` |
| The skill is built per host: 20+ provider folders. The `.claude` build is 58 files, 2.2 MB and about 68k words of Markdown (`SKILL.md` plus 46 references) | `find .claude/skills/impeccable -type f \| wc -l` → 58; `du -sh` → 2.2M |
| Host builds differ only in embedded paths (`.claude/skills/impeccable/…` vs `.opencode/…`) and the command sigil (`/impeccable` vs `$impeccable`); `SKILL.md` tells the agent to resolve paths from the skill's own base directory | `diff -rq .claude/skills/impeccable .opencode/skills/impeccable`; `SKILL.md` *Setup* step 1 |
| The detector and the `context` loader run through `scripts/impeccable`, a launcher for a native engine (`VERSION` `0.1.18`). The launcher looks for the engine in this order: `IMPECCABLE_BIN`, a sibling `bin/`, `~/.impeccable/bin/impeccable`, the version-pinned cache, then `PATH`. **If none answers, it downloads the engine from GitHub releases (sha256-checked) without asking** | `scripts/impeccable` header comment and the "Last resort" block |
| The skill's own Setup tells the agent to run `scripts/impeccable context` at session start, so loading the skill triggers that first-run download | `SKILL.md` *Setup* step 1: "downloaded once on first run" |
| The skill defines its own degraded path ("Launcher unavailable: … read existing PRODUCT.md and DESIGN.md directly") | `SKILL.md` *Setup* |
| The npm CLI is the same engine: `npx --no-install impeccable engine-probe` → `impeccable-engine 0.1.18` | run 2026-10-30 |
| The engine keeps local state in `~/.impeccable/` (`update-check.json`), so it performs an update check | `ls ~/.impeccable` (run 2026-10-30) |
| AKILI's installer already protects a user's own same-name skill: a "foreign" entry is skipped and replaced only on `install --force` (takeover); `npm pack` keeps executable bits | `bin/akili.js` ownership-record comment ("owned" / "foreign" / "takeover"); `tar -tvzf` of `npm pack` shows `-rwxr-xr-x` on shipped scripts |

### 3.3 Hardening gaps (revision 1, still open)

The 2026-10-30 run recorded G1–G12: no `detector only` state (G1); an installing `npx` command (G2); the `absent` rule contradicting the probe (G3); no mobile pass (G4); hidden consent overlays hiding the top P1 (G5); no page-mode check (G6); no performance step (G7); no derived design context (G8); no waiver path (G9); no score provenance (G10); no out-of-scope field (G11); no stale-baseline check (G12). The npx-cache inconsistency (gap 10 of the brief) is listed separately as C5. The revision 1 citations stand in `requirements.md` §4.

## 4. Proposed Outcome

| # | Outcome |
|---|---|
| 1 | **Vendored, verbatim.** `.claude/skills/impeccable/` is upstream's `.claude` build at `df3a4ab` / 4.8.0, unmodified, except for an AKILI governance block appended to the frontmatter. That edit is declared as a modification in `NOTICE`. `LICENSE` (Apache-2.0) and upstream `NOTICE.md` ship inside the skill folder. A `UPSTREAM.md` records the source URL, commit, version, engine version, date and a per-file sha256 list |
| 2 | **Installed everywhere.** The installer delivers `impeccable` to all six targets with no installer code change: it is just another skill folder. A user's own `impeccable` skill is a foreign entry, so it is skipped, reported, and never overwritten without `--force` |
| 3 | **Engine consent gate.** Before any launcher call, the bridge checks the launcher's own non-download locations (`IMPECCABLE_BIN`, sibling `bin/`, `~/.impeccable/bin/impeccable`, the version-pinned cache, `PATH` via `engine-probe`). If none answers, it asks **once per session**, naming the source (GitHub release `engine-v0.1.18`), the size and the checksum check. Declined or unanswered → the skill runs its own *Launcher unavailable* path, and detector rows read `Unevaluated (engine not installed)` |
| 4 | **No more `npx`.** The detector runs through the vendored launcher (`<skill-dir>/scripts/impeccable detect --json …`, `impeccable.cmd` on Windows) with `DO_NOT_TRACK=1`. The npx-cache resolution path and its inconsistency (gap 10) disappear. A developer with the npm CLI can point `IMPECCABLE_BIN` at it |
| 5 | **Bridge, re-scoped.** `impeccable-bridge` stops detecting the skill. It now owns the AKILI layer: the phase map, the design source of truth, the engine consent gate, the scan matrix, the waiver matching, the exit-code reading, and the evaluation report. Detection states become **engine** states: `ready (<source>)`, `consent needed`, `declined`, `unavailable`. A missing vendored skill (e.g. a foreign skill kept, or a partial install) is reported, and the fallback to `ui-ux-pro-max` + `frontend-design` still applies |
| 6 | **Hardening gaps closed** (revision 1, re-based): desktop and mobile passes with the `design.md` viewport override; a first-visit pass with overlays visible and a CTA hit-test in audit and validate; exit `1`/`127`/other read as `Unevaluated`; a Lighthouse step of at least 3 runs (median and range) in design mode only; stale-baseline, page-mode and derived-context checks; the Design Waivers schema with *Proposed waiver*; and the template fields |
| 7 | **Sync tooling.** `scripts/sync-impeccable.js` (maintainer-only, not shipped) copies a named upstream build from a local checkout, re-applies the frontmatter block and rewrites `UPSTREAM.md`. A test fails if any vendored file's hash differs from `UPSTREAM.md`, so local edits cannot creep in. Each AKILI release checks for a newer upstream tag |
| 8 | **Governance.** A new category, *Vendored third-party (verbatim)*, with the rules above. Impeccable moves out of *Environment-provided skills*; rule 1's rationale is kept for the skills it fits (`hyperframes`, `playwright-cli`, `archify`, `orchestration`) |

## 5. Scope

| In scope | Files (expected) |
|---|---|
| Vendored skill | `.claude/skills/impeccable/**` (58 upstream files) + `LICENSE`, `NOTICE`, `UPSTREAM.md` |
| AKILI layer | `.claude/skills/impeccable-bridge/SKILL.md`, `references/design-evaluation.md` |
| Commands | `akili-audit.md`, `akili-validate.md`, `akili-test.md`, `akili-constitution.md`, `akili-specify.md`, `akili-propose.md` (Visual Reference wording), `akili-execute.md` if it names the state |
| Governance & docs | `docs/skills/governance.md`, `docs/skills/README.md`, a new `docs/skills/impeccable.md`, `docs/skills/impeccable-bridge.md`, `docs/commands/akili-audit.md`, `docs/overview.md`, CLI skill counts, `README.md` (third-party notice) |
| Tooling | `scripts/sync-impeccable.js` (not in `package.json` `files`) |
| Tests | `test/impeccable-bridge.test.js` (amended), new `test/impeccable-vendor.test.js` (hashes, license, notice, frontmatter, no `npx` detector form), skill-count fixtures (30 → 31) |
| Release notes | `CHANGELOG.md` `Unreleased` |

## 6. Non-Goals

- No change to Impeccable's instructions: there is no AKILI rewrite of its references, and AKILI rules live in the bridge.
- No vendored engine binary. The 17 MB native binary is not shipped; it is fetched by the upstream launcher only after consent, or found where the developer already has it.
- No per-host rebuild of the skill (the `.opencode`/`.agents` builds). The `.claude` build ships to every target and relies on the skill's base-directory rule (risk R3).
- No upstream changes, no akili.com.co fixes, no performance gate in `/akili-validate` (Q2), no PSI/CrUX integration.
- No removal of `frontend-design` or `ui-ux-pro-max`. Whether `frontend-design` is still needed is a follow-up question once Impeccable ships.
- Design mode stays report-only.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Every AKILI install | +1 skill (`impeccable`), about +2.2 MB unpacked (package 5.8 MB → about 8 MB unpacked) |
| Developers with their own Impeccable install | Their skill is kept (foreign), and AKILI reports the version difference. `--force` would replace it, so the docs warn |
| UI specs | Impeccable leads by default; the first launcher use asks for engine consent once per session |
| `/akili-audit design`, `/akili-validate`, `/akili-test` | Engine states, launcher command, scan matrix, first-visit pass |
| Deployed projects whose Skill Map or tasks name `impeccable-bridge` | Unchanged: the name stays |
| `changes/impeccable-design` (archived) | Its no-vendoring decision (proposal outcome 2, NFR-1) is superseded by this spec, and the governance text records it |

## 8. Visual Reference

- Source: None
- Location: n/a
- Notes: methodology change; no UI in this repository.

## 9. Requirement Delta Preview

### ADDED Requirements

- A vendored, verbatim `impeccable` skill with Apache-2.0 `LICENSE`, `NOTICE`, `UPSTREAM.md` and a hash-locked test.
- An engine consent gate before any launcher call; engine states; the *Launcher unavailable* path on decline.
- A maintainer sync script and a release-time upstream check.
- A governance category *Vendored third-party (verbatim)*.
- From revision 1, re-based: the scan matrix (desktop + mobile, `design.md` override); the first-visit pass with CTA hit-test in audit and validate; the Lighthouse step (≥ 3 runs, median and range); baseline checks; the Design Waivers schema and *Proposed waiver*; the template fields.

### MODIFIED Requirements

- `impeccable-bridge`: from skill detection and routing to the AKILI layer (engine gate, gates, report, source of truth).
- Detector invocation: from `npx impeccable detect` to the vendored launcher, with `DO_NOT_TRACK=1`. Exit `1`, launcher `127` and any other non-`0`/`2` exit read as `Unevaluated`.
- Governance: Impeccable leaves *Environment-provided skills*.
- `changes/impeccable-design` NFR-1 ("no file from `pbakaus/impeccable` is copied into the package") is superseded.

### REMOVED Requirements

- The skill-presence states `installed` / `skill only` / `absent`. They are replaced by engine states, plus a "vendored skill missing" report.
- The printed `npx impeccable install` route as the way to get the skill. It stays only as an option for developers who want a newer upstream than AKILI's pin.

## 10. Approach Options

| Option | What | Trade-off |
|---|---|---|
| A. Keep the bridge only, and auto-install Impeccable on first use | AKILI runs `npx impeccable install` after consent | Still an install step per developer, and the skill version varies per machine. It contradicts "quedara DENTRO de la metodología" |
| **B. Vendor verbatim + thin AKILI bridge** (recommended) | Upstream files unmodified (hash-locked); AKILI rules in the bridge | Size +2.2 MB; a sync duty per upstream release. Apache compliance is trivial, and every AKILI install has the same Impeccable |
| C. Vendor and merge the bridge into the vendored skill | One skill folder, with AKILI rules edited into Impeccable's `SKILL.md` | Every upstream sync becomes a manual merge into Apache-licensed files that carry modification notices. AKILI rules get lost or drift with each 4.x release |
| D. Vendor a rewritten subset (critique, audit, detector) | Smaller package | Breaks the commands and references the subset drops. It is no longer "Impeccable", and it carries the heaviest attribution and maintenance cost |

## 11. Recommended Approach

**Option B.** The bridge was not wrong in having no instructions; it was wrong in having nothing to route to. Keeping Impeccable byte-identical makes Apache-2.0 compliance mechanical (`LICENSE` + `NOTICE` + a declared frontmatter addition), makes upgrades a scripted copy plus a hash refresh, and keeps AKILI's own rules in a file AKILI owns. The bridge keeps its name, because deployed projects reference it. Its role narrows to what only AKILI can say: which phase runs what, what counts as a pass, consent, and where the design authority lives.

## 12. Risks, Dependencies, And Open Questions

| # | Item | Mitigation / owner |
|---|---|---|
| R1 | **Engine download without consent.** If an agent loads the skill outside an AKILI command (e.g. the user types `/impeccable`), upstream Setup runs the launcher, which downloads the engine | Disclosed in the docs and the CHANGELOG as upstream behavior on direct invocation. Inside AKILI commands the bridge's gate always runs first. Settled at design: whether the bridge can also be named in the skill's frontmatter block without editing upstream text |
| R2 | Package size +2.2 MB (`font-index.json` 1.1 MB, `live-browser.js` 563 KB) | Accepted: these are runtime assets for `live`/typeset; dropping them breaks commands (Option D). Recorded in the governance size note |
| R3 | The `.claude` build embeds `.claude/skills/impeccable/…` paths and the `/impeccable` sigil. On OpenCode/Codex/Cursor/Antigravity/Grok the skill relies on its base-directory rule | The task walks one non-Claude target's install layout. `UNVERIFIED — confirm at source before relying on it` (owner: design Premise Ledger) |
| R4 | The launcher must stay executable after npm pack and after the installer copies it | `npm pack` keeps `-rwxr-xr-x` (verified for shipped scripts). Installer mode preservation is `UNVERIFIED`; settled by a test of the installed file mode |
| R5 | Upstream moves fast (4.x); a stale pin drifts from impeccable.style | The release checklist gets an upstream-tag check; the sync script makes upgrades cheap |
| R6 | A user's own newer Impeccable vs AKILI's pin | Foreign entry skipped by default; doctor/install output names both versions |
| R7 | The engine's update check contacts the network | `DO_NOT_TRACK=1` is kept. Whether the engine honors it for update checks is `UNVERIFIED`; disclosed in the docs |
| R8 | Old superseded phrasing survives (`npx impeccable detect`, the three states, "never vendored") (KZ-changes--kaizen-loop-closure-2) | Negative text-contract tests plus a paraphrase sweep before Review |
| R9 | Tests underestimated (KZ-bugfix--init-ctrlc-abort-2); aggregate claims in docs (KZ-002) | Test budget ×3; grep before writing counts |

### Decisions recommended (open from the requirements gate)

| # | Question | Recommendation |
|---|---|---|
| D-1 | Release type | **Minor 2.40.0**: a new packaged skill and new content installed in every target |
| D-2 | First-visit hit-test when no browser automation is available | The screenshot and hit-test read `Unevaluated (no browser automation)` while the detector part still runs. In `/akili-validate` an `Unevaluated` hit-test on a Persuade/Operate screen **cannot pass silently**: the HITL pause asks for a manual fold check, and the validation report records it. Without one, the gate is `WARN (unverified first visit)`, never `PASS`. Note that the vendored skill ships `live-browser.js`, but that is Impeccable's own tool and is not used as AKILI's harness |
| D-3 | Proposed waivers in P1–P3 counts | **Excluded from P1–P3**, but counted in their own header line (`Proposed waivers: N`) so they stay visible. If the owner rejects one, it becomes a defect at its natural priority on the next run |

## 13. Success Criteria

- A fresh `akili install --tool <each of six> --local` into an empty directory places `impeccable/` with `LICENSE`, `NOTICE`, `UPSTREAM.md` and an executable launcher, and every vendored file matches its `UPSTREAM.md` hash.
- No prescribed command in `.claude/` or `docs/` (excluding `docs/specs/`) invokes `npx impeccable detect`. No AKILI step runs the launcher before the consent gate.
- Re-walking the 2026-10-30 run against the shipped text: Impeccable leads (vendored); the engine resolves from `PATH`/`IMPECCABLE_BIN`, or consent is asked; the mobile and first-visit passes surface the CTA P1; Lighthouse reports median and range; the stale `design.md` is flagged; A-06 hits show as proposed waivers.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` pass.

## 14. Next Step

```text
/akili-specify changes/impeccable-hardening   (Phase 1 re-run on revision 2)
```
