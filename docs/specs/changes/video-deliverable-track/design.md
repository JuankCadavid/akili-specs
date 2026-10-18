# Design: Video Deliverable Track

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-deliverable-track` |
| Depth | Standard (re-checked in §12) |
| Status | Draft — Judgment Day APPROVED (`judgment.md`), awaiting the specify gate |
| Date | 2026-10-18 |
| Verified at | `22e990b` (this repo); `01adadb9` (`heygen-com/hyperframes`, shallow clone, LFS off); skills CLI `1.5.18` and `1.7.2` |
| Skill name decision | `video-production` — confirmed (DD-2) |
| Deviation from proposal | Proposal §6 listed `akili-execute.md` edits (render gate, quiet tree). DD-5 places them in the bridge skill and the Leader rule instead; `akili-execute.md` is not edited |

## 2. Executive Summary

One new field, one new skill, one conditional branch per affected surface. `Deliverable` is written by
propose, copied by specify into `requirements.md`, and read from there by test and validate; execute
receives it as `video-production` in every task's skill list. All video know-how lives in
`video-production`, which defers every HyperFrames detail to the installed HyperFrames skills.

## 3. Architecture Overview — every command, its terminal branch for a video spec (KZ-004)

| Command | Reads `Deliverable` from | Branch for `video` |
|---|---|---|
| `/akili-propose` Step 1 | request wording | writes the row; one shared question; Trivial × video continues as a Lite proposal instead of routing to quick |
| `/akili-specify` | `proposal.md` Document Control (Step 0 item 3) | **Video Mode** block; copies the row into `requirements.md` Document Control; Phase 2 line; Step 3.2 adds `video-production` to every task's skills |
| `/akili-execute` (Leader) | each task's skill list | assigns `video-production` (task lists are the Leader's defaults, `leader.md:25`); `leader.md` names the swap-in as an example |
| `/akili-test` | `requirements.md` (`akili-test.md:13,30`) | render-evidence suite with a draft render; missing HyperFrames = STOP |
| `/akili-validate` | `requirements.md` (`akili-validate.md:67`) | loads `video-production`; `hyperframes check` as build integrity; final look before PASS; delivery render after approval |
| `/akili-quick` | — (no spec) | one escalation line: an edit to a video composition → `/akili-propose` |
| `/akili-archive` | — | **fall-through:** readiness, summary and kaizen work on documents; a video spec archives like any spec |
| `/akili-audit` | — | **fall-through:** scans the codebase against TRD/UX; compositions are project files and are audited as such (P-20) |
| `/akili-resume` | — | **fall-through:** phase detection is by spec files present, unchanged |
| `/akili-seo`, `/akili-constitution` (outside Step 8D) | — | **fall-through:** not on the spec path |

## 4. Extended Directory Structure

| Path | Change |
|---|---|
| `.claude/skills/video-production/SKILL.md` | new — availability gate (both router names), install routes, phase map, privacy defaults, render rules, deferral table |
| `.claude/skills/video-production/references/acceptance-criteria.md` | new — video requirement template + defect-class → gate table |
| `.claude/skills/video-production/references/render-evidence.md` | new — draft-render evidence contract, final look, Bug Mode regression shape |
| `.claude/commands/akili-{propose,specify,test,validate,quick,constitution}.md` | edited (conditional text; propose/quick carve-outs per NFR-1) |
| `.claude/templates/leader.md` | one clause in the item-3 skill-decision bullet |
| `docs/skills/{governance,README,video-production}.md`, `docs/commands/akili-{propose,specify,test,validate,quick}.md`, `docs/flow.md`, `docs/cli.md`, `README.md`, `AGENTS.md`, `CHANGELOG.md` | docs |
| `test/install-cursor.test.js`, `test/fixtures/doctor-codex-baseline.txt` | fixtures pinning the skill set |

## 5. Data Model

| Field | Written by | Copied to | Values | Default |
|---|---|---|---|---|
| `Deliverable` | propose (`proposal.md` Document Control) | specify → `requirements.md` Document Control | `software`, `video` | `software` when absent or when the deliverable is neither (deck, document) |

Video artifacts (`BRIEF.md`, `STORYBOARD.md`, `boards/`, compositions, renders) live in the **user's**
project as HyperFrames lays them out; render evidence lives under the spec folder.

## 6. API Design

n/a — no CLI flag, no installer behaviour, no exported symbol changes.

## 7. Backend Module Design

n/a — no `bin/` change; the installer already copies whole skill directories recursively (P-5).

## 8. Frontend / UX Component Architecture

n/a — no UI.

## 9. Shared Contracts — the bridge's phase map and render rules

| HyperFrames artifact / gate | AKILI owner | Rule |
|---|---|---|
| Intent interview → `BRIEF.md` | propose + `requirements.md` | `BRIEF.md` is generated from approved requirements; the interview is not re-run |
| `STORYBOARD.md` plan (checkpoint gate) | specify design gate | the beat table lives in `design.md`; its approval *is* the storyboard approval |
| Sketch board `boards/storyboard.html` | first execute task | optional; its confirmation is recorded in `execution.md` |
| `check` → `snapshot` | execute task Verification | per `render-evidence.md` |
| Draft render → `ffprobe` | `/akili-test` | local `render --quality draft`, quiet tree; never the deliverable |
| Final look → delivery render | `/akili-validate` | `render --quality delivery` only after the final-look approval |

Availability gate: the router is installed when either `hyperframes` (standalone) or a plugin-namespaced
router (`/hyperframes:hyperframes`) is loadable (P-19). Install routes: the host's HyperFrames plugin;
`npx skills add heygen-com/hyperframes --skill <name>… --yes` without `-g` (core set, non-interactive,
project-scoped — the route for agents); `npx skills add heygen-com/hyperframes` (interactive picker; choose
project scope; non-interactive without `--skill` installs all 21). `npx hyperframes skills update` is named
only as a **global** install (it always passes `--global` and mirrors to other agents' global dirs, P-24) that
needs the user's explicit consent. Hints name **project-scoped** locations only; global dirs differ across
skills-CLI versions (P-14). *Amended 2026-10-18 during T1 (user-approved Pivot, `execution.md` Pivot Record T1).*

When a project's Skill Map already has a `hyperframes` row, the bridge still routes: the row stays the
per-developer availability note, the bridge owns the AKILI phase mapping.

## 10. Design Decisions

| DD | Decision | Why / rejected alternative | Req |
|---|---|---|---|
| DD-1 | `Deliverable` is a separate field, not a 4th `Type` | Type is the risk track; a video can be Bug, Change or Trivial. Rejected: `Type: Video` (loses Bug Mode for broken renders) | FR-1 |
| DD-2 | Skill name `video-production` | Neutral, names the capability, no `hyperframes-` prefix (user constraint, Apache-2.0 §6). Considered `video-deliverable` (names a value) and `akili-video` (reads as a command) | FR-8 |
| DD-3 | Binding `conditional`, original-authorship variant, `license: MIT`, `inspired-by` credits HyperFrames by HeyGen (Apache-2.0) + repo URL | Nothing copied → no Apache redistribution duty, no NOTICE (P-7) | FR-8 |
| DD-4 | Detection by requested deliverable; the existing single question names the deliverable when that is what is ambiguous; Trivial × video does not route to quick | Mirrors upstream's "match the requested deliverable"; quick has no render gate | FR-1 |
| DD-5 | Execute is reached through specify's per-task skill lists (primary) and a `leader.md` example (secondary); `akili-execute.md` untouched | Same path `gsap-animation` uses (P-3). The `leader.md` edit changes the `primary-instructions` section hash, so deployed personas read OUTDATED after the next release and gain the clause only via `doctor --agents --fix` (P-17) — FR-3 therefore rests on the task skill lists, not on the persona | FR-3 |
| DD-6 | Missing HyperFrames = STOP with install hint, never fallback | A hand-built pipeline bypasses every render gate; matches test's "no infrastructure is a STOP" | FR-4, FR-6 |
| DD-7 | Governance gets one new clause (an environment-provided skill may be **load-directed** in command text only behind a recorded `Deliverable` selector + availability gate; illustrative and Skill Map-builder mentions are not load-directing — amended 2026-10-18, A2) and rule 2's sentence is narrowed, not removed | Keeps rule 1 (never vendor) intact; rule 2 still holds for every command and every software spec | FR-9 |
| DD-8 | Two lists: commands AKILI **instructs** (`check`, `snapshot`, local `render`, `preview`, `skills update`/`check`, `ffprobe`) and outward actions it **only names** behind consent (`feedback`, `--file-issue`, `publish`, `cloud`, `lambda`, `cloudrun`) | All verified upstream (P-8, P-18); upgrades need no AKILI release | NFR-2, FR-5 |
| DD-9 | Telemetry off by env var per command; outward actions consent-gated | User decision at proposal gate | FR-5 |
| DD-10 | Live smoke run installs HyperFrames **project-scoped in a temp dir**, never globally | The user's global copy is stale (`hyperframes-media`) and must not be touched without consent | FR-4 |
| DD-11 | Evidence uses a **draft** render at test time; only the delivery render waits for approval | Resolves FR-3/FR-6/FR-7 timing; upstream allows `--quality draft` while iterating and forbids rendering the deliverable "merely because checks pass" (P-8) | FR-3, FR-6, FR-7 |
| DD-12 | `ffprobe` `format.duration` is compared with the requirement's target ± tolerance **and** the root `data-duration` | The first catches a wrong composition, the second a render defect | FR-6 |

**Reversion challenge (Step 2.3):** DD-7 narrows a delivered guarantee ("every command must still work
without it"). Challenge — *what does narrowing this break?* A teammate without HyperFrames opening a video
spec now stops instead of proceeding — the intended behaviour (FR-4); every command still runs and no
software spec is affected. DD-4 removes the quick route for Trivial × video — breakage: a one-word title
fix now costs a Lite proposal; accepted, because quick cannot produce render evidence.

## 11. Premise Ledger

Counts: 21 verified · 1 settled partially true (P-22, accepted at T11) · 1 `UNVERIFIED` (Low: P-23) · 1 refuted-and-absorbed (P-14) — 24 rows (P-24 added 2026-10-18 during T1; it partially refutes P-19).
Blast-radius triggers: `live-path` fires (`Deliverable` is a branch point) → P-21; `shared-state` fires
(one condition read by several blocks) → P-22; `consumer` fires (new field; skill set; `leader.md` section)
→ P-15, P-16, P-17.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | `Type` is read downstream only by specify (Bug Mode) and mentioned by quick | existence | `grep -n -E "Type: Bug\|\`Type\`\|Type: Change\|Bug Mode" .claude/commands/*.md .claude/templates/*.md` → hits only in `akili-quick.md:52`, `akili-propose.md`, `akili-specify.md` (both judges re-ran) | `22e990b` | §3 fall-through rows wrong (High) | — |
| P-2 | Governance forbids vendoring `hyperframes`; rule 2 says every command must work without it | other | `docs/skills/governance.md:17-31` (rule 2 at :27-29) | `22e990b` | DD-7 unnecessary (Low) | — |
| P-3 | Conditional skills wire by one specify line + task skill lists the Leader treats as defaults | location | `akili-specify.md:220`, `:404`; `.claude/templates/leader.md:25` | `22e990b` | DD-5 path changes (High) | — |
| P-4 | Skill-set counts: 199 files, 24 dirs; only `install-cursor.test.js:245` is a literal, dirs/ops are computed; comments at `:232,238,387` state 24 | data-env | `find .claude/skills -type f \| wc -l` → 199; `ls -d .claude/skills/*/ \| wc -l` → 24; `grep -n 24 test/install-cursor.test.js` → `:232,:238,:387` | `22e990b` | T11 scope (Low) | — |
| P-5 | Installer copies skill dirs recursively, no filter | location | `bin/akili.js:50` `copyTreeSync`, `:456` `listSkills`, `:638` `copyDirectoryContents` | `22e990b` | installer task needed (High) | — |
| P-6 | The "works without it" rule and its family are stated at `governance.md:27,29`, `akili-constitution.md:730-731`, `README.md:151`, `README.md:828` | other | `grep -rn -i -E "work without\|without (it\|them\|that tool)\|run every command\|every command (works\|must)\|per-developer\|Skill Map, never vendored" docs/skills/governance.md .claude/commands/akili-constitution.md README.md docs/flow.md AGENTS.md` → those hits plus off-topic `governance.md:43`, `README.md:127,131,140`, `constitution.md:856` | `22e990b` | FR-9 sweep misses a site (High) | — |
| P-7 | Upstream is Apache-2.0 with no NOTICE | existence | upstream `LICENSE`; `find . -maxdepth 2 -iname 'NOTICE*' -not -path './.git/*' \| wc -l` → 0 | `01adadb9` | NOTICE task needed if we ever redistribute (Low) | — |
| P-8 | Upstream gates: `check`, `snapshot --at`, `render --quality draft\|looks\|delivery`, `ffprobe` vs `data-duration`, deliverable render only on approval | data-env | upstream `skills/hyperframes-cli/SKILL.md:24-29,59-70,81,112`; `render.ts:177-182` (judge B) | `01adadb9` | `render-evidence.md` names change (High) | — |
| P-9 | `HYPERFRAMES_NO_TELEMETRY=1` disables telemetry | data-env | upstream `skills/hyperframes-cli/references/upgrade-info-misc.md:108`; read in `telemetry/policy.ts` (judge B) | `01adadb9` | FR-5 mechanism changes (Low) | — |
| P-10 | `hyperframes-media` is gone; media is `media-use` | existence | upstream `ls skills`; `skills/hyperframes/SKILL.md` §5 | `01adadb9` | bridge names a dead skill (Low) | — |
| P-11 | Project-scoped skills dirs: Claude `.claude/skills`; OpenCode, Codex, Cursor, Antigravity `.agents/skills` | data-env | skills CLI `1.5.18` and `1.7.2` agent tables (both judges, npx cache) — project dirs unchanged | `1.7.2` | install hints wrong (Low) | — |
| P-12 | Local runtime can render: Node 22.12.0, ffmpeg 8.1; CLI needs Node ≥ 22 | data-env | `node -v`; `ffmpeg -version`; upstream `packages/cli/package.json:84-86` | macOS, `22e990b` | T12 cannot run (Low) | — |
| P-13 | A clause added inside `leader.md` item 3 keeps the suite green; only renumbering items 1–4 breaks `agents-doctor` (literal `4\. \*\*Rework Loop`) | other | judge B: scratch copy with the clause, `npm test` → 259 pass / 0 fail; item 4 renumbered → 1 fail (test 62). Judge A: `migratePersona` simulation, in-bullet / new 3b / new item 5 all `fenced exact` | `22e990b` | T6 restructures the edit (High) | — |
| P-14 | ~~skills CLI 1.7.2 keeps 1.5.18's host dirs~~ **Refuted** for the Codex *global* dir (`join(codexHome,"skills")` → `join(home,".agents","skills")`); absorbed by DD in §9: hints name project-scoped dirs only | data-env | both judges: `~/.npm/_npx/*/node_modules/skills/dist/cli.mjs`, 1.5.18 vs 1.7.2 | `1.7.2` | — absorbed | — |
| P-15 | Readers of the new `Deliverable` row: propose (writer), specify, test and validate (via `requirements.md`); per-command docs restating Document Control: `docs/commands/akili-propose.md:46,60`, `docs/commands/akili-specify.md:76` | consumer | `grep -n "Type\|Document Control" docs/commands/akili-{propose,specify,test,validate}.md` → those hits; `grep -n "requirements.md" .claude/commands/akili-{test,validate}.md` → test :13,:30; validate :30,:67 | `22e990b` | T4/T5/T7/T8/T10 scope (High) | — |
| P-16 | Readers of the packaged skill set: `install-cursor.test.js:245` (+ comments), `test/fixtures/doctor-codex-baseline.txt` (byte-exact skill list, lines 23-47), `docs/cli.md:183,195,216` ("24 packaged skills"), `README.md` skill list, `docs/skills/README.md` | consumer | `grep -rln "vercel-react-best-practices" test/` → `test/fixtures/doctor-codex-baseline.txt`; `grep -n "24 packaged skills" docs/cli.md` → 3 hits; judge B scratch `npm test` with 3 added files → `not ok 65`, `not ok 75` | `22e990b` | T10/T11 scope (High) | — |
| P-17 | Changing `leader.md` text inside `primary-instructions` changes its section hash vs the `2.32.2` digest; deployed copies read OUTDATED after release; digests are written by `scripts/release.js`, not by this change | consumer | judge A hash simulation (edited ≠ `2.32.2` digest); AGENTS.md (templates bullet: `release.js` writes `digests.json`) | `22e990b` | DD-5 rationale (Low) | — |
| P-18 | Outward commands exist upstream: `feedback`, `publish`, `cloud`, `lambda`, `cloudrun`; `--file-issue` on feedback | data-env | upstream `packages/cli/src/commands/{cloud,cloudrun,lambda,publish,feedback}.ts` (judge B); `skills/hyperframes-cli/SKILL.md:134-146`, `references/preview-render.md:182` (judge A) | `01adadb9` | FR-5 list wrong (Low) | — |
| P-19 | Plugin installs expose the router namespaced (`/hyperframes:hyperframes`); ~~agents' non-interactive install is `npx hyperframes skills update`~~ (scope refuted by P-24 — it is global); non-interactive `npx skills add` without `--skill` installs all 21 | data-env | upstream `README.md:47,53-58,70` | `01adadb9` | FR-4 gate misses plugin installs (High) | — |
| P-20 | `/akili-audit` compares codebase vs TRD/UX and has no spec-type branch, so compositions are audited as project files | other | `grep -c -E "Type:\|Deliverable" .claude/commands/akili-audit.md` → 0; Steps 1–2 scan the codebase vs docs (`akili-audit.md:33,46`) | `4f3f83f` | an audit could flag compositions as undocumented drift; accepted (Low) | — |
| P-21 | Live path: propose Document Control → specify Step 0 item 3 reads `proposal.md` → specify writes `requirements.md` Document Control (new, T5) → test/validate read `requirements.md` → Leader reads task skill lists | live-path | `akili-specify.md` Step 0 item 3; `akili-test.md:30`; `akili-validate.md:67`; `leader.md:25` | `22e990b` | a reader never sees the field (High) | — |
| P-22 | The `Deliverable: video` condition is read by these blocks: specify Video Mode, specify Phase 2 line, specify Step 3.2 clause, specify checklist item, test Phase 1 suite list + STOP bullet, validate Phase 3 + Phase 6, quick escalation line, `leader.md` example | shared-state | **Settled at T11 (2026-10-18), partially true:** `grep -rn "Deliverable: video" .claude` at `f42a02c` → specify `:63,:66,:232,:418,:506`; test `:108,:111` (+`:193` perf out-of-scope note); validate `:68` (Phase 0 load), `:92` (Phase 3), `:141,:143` (Phase 6); plus propose `:86,:100,:113,:198,:271,:272,:302`, constitution `:734`, skill `SKILL.md:3`, `acceptance-criteria.md:36`. Two listed blocks carry no literal: the quick escalation line (keyed on "video composition" — quick has no spec to read `Deliverable` from, DD-4) and the `leader.md` example ("video deliverable → `video-production`") | `f42a02c` | a block drifts from the shared definition (Low) — accepted: both unliteral blocks are keyed on the same deliverable kind by wording | T11 — settled |
| P-23 | Chrome is available locally for render | data-env | `UNVERIFIED — confirm at source before relying on it` — the download route is verified (upstream `packages/cli/package.json:41` `@puppeteer/browsers ^3.2.2`); local presence is not | — | T12 blocked (Low) | T12 first step |
| P-24 | `npx hyperframes skills update` installs **globally** (`--global --agent claude-code universal --copy --full-depth --yes`, then mirrors to every other installed agent's global dir); `npx skills add <src> --skill <n> --yes` without `-g` installs project-scoped | data-env | upstream `packages/cli/src/commands/skills.ts:97-119` (`GLOBAL_INSTALL_ARGS_TAIL`), `:131-140`; skills CLI `1.7.2` `dist/cli.mjs:4887-4903` (`installGlobally = options.global ?? false`; scope prompt skipped under `--yes`), `:5941` (`-g`/`--global`) — Leader, during T1 | `01adadb9`, `1.7.2` | install route touches global dirs (High) | — absorbed: §9, FR-4, T12 amended 2026-10-18 |

Consumer rows → `Consumers` fields: P-15 → T4, T5, T7, T8, T10; P-16 → T10, T11; P-17 → T6.

## 12. Budget (Step 2.4)

| Measure | Estimate |
|---|---|
| Tasks | 12 |
| LOC (mostly prose) | ~650 added / ~25 changed |
| Review rounds | expected 13 (`full` = 2: T1, T5; `checklist` = 1: T2–T4, T6–T11; `skip-eligible` = 0: T12) — ceiling 20 (two per rules-text task T1–T9, per specify Step 2.4) |

Depth check: Standard holds — twelve bounded tasks, no code path. Tripwire for `/akili-execute`: stop and
escalate past 14 tasks, ~850 LOC, or 20 review rounds.
