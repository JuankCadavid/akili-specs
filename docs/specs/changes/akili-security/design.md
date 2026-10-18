# Design: `/akili-security` — repository security audit on Cloudflare's `security-audit` skill

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security` |
| Depth | Full (compact) |
| Type | Change |
| Approval Mode | `gated` (single specify gate at the user's instruction — see `requirements.md` §1) |
| Status | **Approved** at the specify gate, 2026-10-18 (Juan Carlos Cadavid), after judgment-day APPROVED and the gate adjustments I-1, I-2, I-3, I-5, I-8, I-9, F-1, F-2 (`judgment.md` → *Gate adjustments*) |
| Date | 2026-10-18 |
| Amendments | 2026-10-18, execute-time spec tensions T-1 (run path by location: FR-8, FR-10, design §5.1), T-2 (FR-12 "tracked repository content"), T-3 (FR-4 *who*, design §5.1) — approved by the user at the T2 gate; record in `execution.md` → T2 |
| Verified at | `6d1e152` — every Premise Ledger reading was **executed** in this session and is quoted, not predicted (KZ-changes--leader-brief-contract-2) |
| Scratch evidence | `$SCRATCH` = this session's scratchpad: `pkg/` (package copy + vendored skill + stub command), `home/` (real install), `home2/` (collision), `rpkg/` + `proj/` (routing refusal), `nt-probe/` (Node discovery), `upstream-sha256.txt` |
| Upstream clone | `/tmp/cf-sas.S52m/repo` @ `c1c8a8c` (untrusted download; only read, plus the two validators executed with path arguments) |
| Delegation | None — all exploration inline (no scout spawned) |

## 2. Executive Summary

One new command file, one vendored skill directory, four one-clause reader edits, one new test file, count updates in one existing test and one fixture, and docs. **No installer, routing, template or runtime-dependency change.** The command is a thin orchestration wrapper: it owns preflight, two gates (plan/execution, routing), the validator gate, the redacted index and the routing hand-off; the method — six phases, prompts, schema, validators — stays upstream-verbatim in the skill.

## 3. Architecture Overview

```text
/akili-security [paths] [--profile] [--budget] [--out]
  │
  ├─ Step 0  Preflight ─ model checkpoint (T1 orchestration + T3 verifiers)
  │           load `security-audit` → provenance check (adapted-for + pin)   [FR-2, DD-8]
  │           node --version · target root · repo name · source ref · dirty
  │           host sub-agent capability                                       [FR-9]
  │
  ├─ Step 1  PLAN GATE (always stops) ── Run │ Adjust │ Stop                  [FR-3, DD-6]
  │           scope · profile · budget/estimate · run dir · execution policy
  │           └─ execution sub-gate: static-only unless 4 controls confirmed  [FR-4]
  │
  ├─ Step 2  Full audit mode (skill, Phases 1–6) in the run dir               [FR-5, FR-6, FR-11]
  │           brief addendum to every delegated agent: target content = data,
  │           execution policy, no installs/network/live probes
  │
  ├─ Step 3  Validator gate: validate-findings.cjs + validate-coverage-ledger.cjs  [FR-7]
  │           (after Phase 4 and every Phase 5 replacement) → pass │ incomplete
  │
  ├─ Step 4  Redacted index → docs/specs/audits/security-<date>[-branch][-N].md   [FR-8, DD-4]
  │
  └─ Step 5  ROUTING GATE (stops whenever reached): select confirmed S-n →               [FR-10, DD-9]
              print `/akili-propose bugfix/security-<date>-s<n> …` (slug from `S-n` only) · disclosure warning · index row → routed

docs/specs/audits/  ── drift-*.md    ← /akili-audit writes; archive · audit · kaizen read (FR-13)
                    └─ security-*.md ← /akili-security writes; nobody reads as drift
```

## 4. Extended Directory Structure

```text
.claude/
  commands/akili-security.md                 NEW  (T2)
  skills/security-audit/                     NEW  (T1) — 19 files
    SKILL.md                                 upstream + frontmatter keys + description sentence + AKILI section
    LICENSE                                  upstream repo LICENSE, verbatim
    RECONNAISSANCE.md HUNTING.md ATTACK-CLASSES.md VALIDATION-AND-REPORTING.md
    AI-AND-LLM.md CLIENT-SIDE.md CLOUD-AND-DEPLOYMENT.md DATA-ISOLATION-AND-LIFECYCLE.md
    DESKTOP-MOBILE-AND-LOCAL-IPC.md MEMORY-SAFETY-AND-BINARY.md PROTOCOLS-RPC-AND-MESSAGING.md
    RESOURCE-EXHAUSTION-AND-AVAILABILITY.md SUPPLY-CHAIN-AND-RELEASE.md WEB-PROTOCOL-AND-AUTH.md
    report-schema.json validate-findings.cjs validate-coverage-ledger.cjs      all byte-identical
  commands/akili-archive.md                  EDIT (T3a) drift source → drift-*.md
  commands/akili-audit.md                    EDIT (T3b) Reading reports back → drift-*.md
  skills/kaizen/SKILL.md                     EDIT (T3c) Drift attributable → drift-*.md
  commands/akili-constitution.md             EDIT (T3d) audits/ README names both kinds
test/
  security-audit-skill.test.js               NEW  (T1) file set · frontmatter · LICENSE · validator smoke · install payload
  install-cursor.test.js                     EDIT (T4) 199→218 files · 11→12 commands · 24→25 dirs · 210→230 shared
  fixtures/doctor-codex-baseline.txt         EDIT (T4) + akili-security.md, + security-audit
docs/
  skills/security-audit.md                   NEW  (T5a)   skills/README.md · skills/governance.md  EDIT (T5a)
  commands/akili-security.md                 NEW  (T5b)   commands/README.md · commands/akili-audit.md · commands/akili-constitution.md · commands/akili-archive.md · skills/kaizen.md · cli.md  EDIT (T5b)
  flow.md                                    EDIT (T5b)
README.md                                    EDIT (T5b)
AGENTS.md                                    EDIT (T6)
CHANGELOG.md                                 EDIT (T7)
```

## 5. Data Model

### 5.1 Index file (`docs/specs/audits/security-<YYYY-MM-DD>[-<safe-branch>][-N].md`)

Name rules: identical to `/akili-audit` Step 3's table (date, `$SAFE_NAME` branch suffix when off the default branch or unresolved, `-N` on collision) — the command **references** that table instead of restating it (KZ-005: name the rule, not a line).

| Section | Fields (redacted default) | Detailed opt-in adds |
|---|---|---|
| Header | `# AKILI Security Audit Index` · `Date of Audit` · run id · run directory (location form, FR-8: `~/…` · repo-relative · `<external>/run-<N>`) · source ref + dirty flag · profile · scope · prior runs read (count) | — |
| Verdict line | complete │ incomplete + `incomplete_reason` (first, when incomplete) | — |
| Execution policy | static-only │ sandboxed (approved by — the approver as named at the gate, default "the user", never an OS account, git identity or home path — at, mechanism) | — |
| Validators | both results (`PASS` / exit codes) | — |
| Counts | by verdict (confirmed / needs_validation / rejected) · confirmed by severity | — |
| Records | `S-n` · verdict · severity (confirmed only) · routing status (`open` / `routed → bugfix/security-<date>-s<n>`) | title · fingerprint |

**Forbidden in every mode:** file paths or lines of a finding, trace steps, payloads, reproduction commands, code excerpts, environment values, secrets (FR-8). The `S-n` → fingerprint map lives only in the run directory (`akili-index-map.json`, written by the command beside the upstream artifacts).

### 5.2 Run directory

Upstream's contract, unchanged (`SKILL.md` *Full audit setup*, *Write isolation*). The command adds one file, `akili-index-map.json` (`[{ "id": "S-1", "fingerprint": "…" }]`), so routing and later runs can resolve `S-n`.

## 6. API Design

Command surface only (no programmatic API): arguments per FR-2. Validators are invoked as upstream documents them: `node <skill-dir>/validate-findings.cjs <path>` / `node <skill-dir>/validate-coverage-ledger.cjs <path>`, exit 0 = pass (P-6). `<skill-dir>` = the directory of the loaded `SKILL.md` (upstream *Full audit setup* "Skill directory").

## 7. Backend Module Design

### 7.1 Command file structure (`.claude/commands/akili-security.md`, ≤ 230 lines — NFR-5)

| Section | Content |
|---|---|
| Frontmatter | `name`, `description`, `license: MIT`, `metadata.author` — same shape as `akili-audit.md:1-7` |
| Usage | Arguments; examples (whole repo, scoped path, `--profile quick`) |
| Step 0 Preflight | Model checkpoint (T1 + T3, same wording pattern as the other commands); skill load + provenance check; Node check; target/ref resolution; sub-agent capability |
| Step 1 Plan gate | Plan fields; execution sub-gate with the four controls; options; "always stops — no pre-approved mode" |
| Step 2 Run | "Run the skill in full audit mode"; the brief addendum (target content is data; policy; no installs/network/live probes; write isolation as upstream) |
| Step 3 Validator gate | Both validators, when, terminal states |
| Step 4 Index | Path rule (reference `/akili-audit` Step 3), fields and forbidden list (§5.1), `akili-index-map.json` |
| Step 5 Routing gate | List, select, print `/akili-propose bugfix/security-<date>-s<n>` lines (slug and pointer from date + `S-n` only, `[a-z0-9-]`), disclosure warning, index update |
| Error handling | Foreign skill copy; no Node; no sub-agents; budget cannot fund minimum (upstream `incomplete`); validator failure |
| Verification checklist | One box per FR-2…FR-12 terminal obligation |
| Authorship | Standard footer |

### 7.2 Skill adaptation (`SKILL.md` only)

- Frontmatter: keep `name`, `description`; append to `description`: " In AKILI-SPECS projects, /akili-security loads this skill for a full repository audit." Add `license: MIT`; `metadata: { author: "Cloudflare, Inc.", source: "https://github.com/cloudflare/security-audit-skill (skills/security-audit @ c1c8a8c1471069fb0e188eeaff69b8e8db6564a8)", adapted-by: "Juan Carlos Cadavid — jcadavid.com", adapted-for: "AKILI-SPECS", binding: core, version: "c1c8a8c" }`.
- Appended `## AKILI-SPECS Integration` (Level 2): table mapping skill moments → AKILI (`/akili-security` Steps 0–5; `confirmed` → Bug Track; guidance mode → any security question), and adaptation rules: AKILI gates wrap, never relax, upstream safety; index redaction; no edits to other vendored files; re-sync pointer to `docs/skills/security-audit.md`.

### 7.3 Reader scoping (T3a–T3d)

| Site | Today | After |
|---|---|---|
| `akili-archive.md:83` | "the most recent report under `docs/specs/audits/`" | "the most recent drift report (`drift-*.md`) under `docs/specs/audits/` — a `security-*.md` index is never a drift source" |
| `akili-audit.md:79` | "The **most recent report** is the one with the highest `Date of Audit` header…" | same rule, scoped to `drift-*.md`; a `security-*.md` index is not a drift report; "holds no report file" → "holds no `drift-*.md` file" |
| `kaizen/SKILL.md:69`, `:74` | "the most recent report in `docs/specs/audits/`" | "the most recent `drift-*.md` report in `docs/specs/audits/`" (and `:74`'s definition names `drift-*` files) |
| `akili-constitution.md:39` (+ `:40`, `:1443` read, not edited unless they restate the role) | README: *one drift report per `/akili-audit` run.* | *one drift report per `/akili-audit` run (`drift-*`) and one redacted index per `/akili-security` run (`security-*`).* |

The legacy fallback (`docs/specs/drift-report.md`) condition changes from "no report file at all" to "no `drift-*.md` file" at each site that states it (`akili-archive.md:84`, `akili-audit.md:79`, `kaizen/SKILL.md:69`).

## 8. Frontend / UX Component Architecture

None — terminal command text. The two gates are numbered option menus in the existing command style (e.g. `/akili-audit` Step 4).

## 9. Shared Contracts or Package Extensions

| Contract | Change | Consumers (P-7, P-10) |
|---|---|---|
| `docs/specs/audits/` folder | New file kind `security-*.md`; readers scoped to `drift-*.md` | `akili-archive.md:83-84`, `akili-audit.md:79`, `kaizen/SKILL.md:69,74`, `akili-constitution.md:39-40,1443`, `docs/flow.md:153,284,424-425`, `docs/commands/akili-audit.md:34`, `docs/commands/akili-archive.md:68`, `docs/skills/kaizen.md:24`, `docs/commands/akili-constitution.md:43,53`, `README.md:583,792` |
| Packaged command set | +`akili-security.md` | `test/install-cursor.test.js:227,238,249,340,387`; `test/fixtures/doctor-codex-baseline.txt` (Commands list); `README.md:84` list; `docs/commands/README.md`; `docs/cli.md:117,182,194,216` ("11 command skills" / "the 11 commands") |
| Packaged skill set | +`security-audit/` (19 files) | `test/install-cursor.test.js:216,227,232,245,246,340,387` (199 / 210 / 24); fixture Skills list; `docs/skills/README.md`; `governance.md`; `docs/cli.md:183,195,216` ("the 24 packaged skills") |
| npm tarball | +~261 KB unpacked, in bytes (259 803 B for the 18 non-test upstream files + 1 078 B `LICENSE`; the 348 KB of the proposal was `du -sk` blocks) | `npm run pack:dry-run` (NFR-4) |

## 10. Design Decisions

| DD | Decision | Why / rejected alternative | Lesson |
|---|---|---|---|
| DD-1 | New command `/akili-security` (proposal option A) | Approved 2026-10-18. Rejected: `/akili-audit` activation (two contracts in one file), skill-only `conditional` | — |
| DD-2 | **Do not vendor `validate-*.test.cjs`** — reverses the proposal's Q3 recommendation | P-3 refuted the proposal's "not auto-discovered" premise: on Node 18 `node --test` runs any `*.test.cjs` under `.claude/` — in this repo's CI **and** in any user project with a `--local` install whose `npm test` is `node --test`. No upstream `.md` references the test files (P-5), so excluding them changes no instruction. Rejected: pin `npm test` to `test/` (protects only this repo, not users' projects) | KZ-changes--leader-brief-contract-2 (executed, not predicted) |
| DD-3 | Validator evidence comes from `test/security-audit-skill.test.js` smoke cases (valid `[]` → 0; invalid record → 1; invalid ledger → 1) on the CI matrix | Replaces the dropped upstream tests with checks AKILI owns; runs on every OS/Node leg | — |
| DD-4 | Index redacted by default; opaque `S-n` ids; title + fingerprint only on explicit opt-in for private repos | Fingerprints and titles name files and vuln classes — a public commit would disclose them. Rejected: titles by default | — |
| DD-5 | Index in `docs/specs/audits/` with readers scoped to `drift-*.md` | 4 rules sites + doc mirrors vs a new `docs/specs/security/` carve-out (5 carve-out lists + constitution scaffold + doc mirrors). Every reader enumerated (P-7) | **KZ-004** |
| DD-6 | Each gate stops whenever it is reached — every run reaches the plan gate; the routing gate is reached only by a run that writes an index; the command has no pre-approved mode *(wording amended 2026-10-18, Pivot Record T7a — meaning unchanged)* | It runs outside any spec, so no proposal Approval Mode applies (P-15); the plan gate authorizes spend and the execution gate authorizes untrusted code — both are the exception class pre-approval never covers | — |
| DD-7 | **No `/akili-security` row** in `docs/model-routing.md` or `.claude/templates/model-routing.section.md` in this change; the command's own model checkpoint states T1 + T3 | Adding the row to the template makes every existing project's `akili routing` re-run refuse (P-8, executed); adding it only to the doc makes `/akili-audit` report a packaged-only phase as Phase→Tier Drift on every project (P-9). Follow-up Bug: template evolution misread as a hand edit (`bin/routing.js:431-436`) | KZ-changes--model-routing-configurator-1 (enumerate every mode) |
| DD-8 | Preflight provenance check on the loaded skill | Codex/Cursor share `~/.agents/skills`; a pre-existing `security-audit` from `npx skills add` is kept by skip-existing (P-11), so the command may load a foreign version | — |
| DD-9 | Routing prints `/akili-propose` commands; creates nothing | AGENTS.md *Scope only grows through approval*; keeps proposal authorship in the propose command | — |
| DD-10 | No sub-agents → guidance mode only | Upstream's evidence bar requires a verifier ≠ finder; faking it inline would mint unearned `confirmed` records | — |
| DD-11 | Keep upstream name `security-audit` | Governance: original frontmatter fields "preserved, never overwritten"; collision handled by DD-8 | — |

**Reversion challenge (Step 2.3).** Only DD-5 narrows delivered behaviour (readers ignore non-`drift-*` files). Question: *what does removing non-drift files from the candidates break?* `/akili-audit` has written only `drift-<…>.md` since `changes/branch-safe-kaizen` (`akili-audit.md:68`); the README scaffold is already excluded (`akili-constitution.md:40`). Breakage: a report a user renamed by hand stops being read. Accepted — recorded in T3b's docs note; no design change.

## 11. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Measure | Estimate | Basis |
|---|---|---|
| Tasks | **12** (T1, T2, T3a–T3d, T4, T5a, T5b, T6, T7, T8) | §4 |
| LOC authored | **~650** (command ~210 · skill frontmatter + section ~45 · test ~140 · reader edits ~15 · counts/fixture ~12 · docs ~180 · CHANGELOG ~20 · AGENTS ~4) — plus ~4 300 vendored lines copied, not authored | §4, §7 |
| Review rounds | **18** — 2 × rules-text tasks (T2, T3a–T3d, T6 = 12) + 1 × others (T1, T4, T5a, T5b, T7, T8 = 6) | Step 2.4 rules-document rule |

Depth check: Full was chosen for the safety gate; 12 tasks / ~650 LOC fits Full. `/akili-execute` stops and escalates past **13 tasks, ~800 LOC, or 18 rounds**.

## 12. Premise Ledger

**Count:** 17 rows — 15 verified, 2 `UNVERIFIED` (0 High, 2 Low).
**Blast-radius triggers:** `live-path` (the design names the user action `/akili-security` → skill load) — P-11/P-12; `shared-state` (the `docs/specs/audits/` folder is read by three components) — P-7; `consumer` (packaged command/skill sets and the folder contract are read by tests, fixtures and docs) — P-7, P-10.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | The installer copies a skill directory as a tree, non-Markdown files included, into all six skill roots | location | Real install of `$SCRATCH/pkg` with `HOME=$SCRATCH/home node bin/akili.js install --tool all` → exit 0; each of `.claude/skills`, `.config/opencode/skills`, `.gemini/config/skills`, `.gemini/skills`, `.gemini/antigravity-cli/skills`, `.agents/skills` holds `security-audit/` with 19 files, `cjs=2`, `LICENSE=y`, `test=0`; `diff -r` source vs `.agents/skills/security-audit` → identical. Mechanism `copyDirectoryContents` `bin/akili.js:638`, called `:806` | `6d1e152` | NFR-1 fails; an installer task is added (High) | — |
| P-2 | Commands are enumerated by `*.md`, so a new command file installs on all five hosts with no code change | location | `bin/akili.js:453` (`entry.name.endsWith(".md")`); dry-run `--tool all` on `$SCRATCH/pkg` lists `akili-security` under `.claude/commands`, `.config/opencode/commands`, 3 Antigravity workflow dirs, 3 Antigravity skill dirs, `.agents/skills/akili-security/SKILL.md` ×2 | `6d1e152` | Installer task added (High) | — |
| P-3 | `node --test` discovers `*.test.cjs` under `.claude/` on Node 18 but not on Node 22 | data-env | `$SCRATCH/nt-probe` (`.claude/skills/a/x.test.cjs` + `test/c.test.js`), `node --test`: darwin 18.20.8 → `# tests 2` (probe-dotdir ran); darwin 22.12.0 and 22.23.3 → `# tests 1`; `docker run --network none node:18` (v18.20.8) → `# tests 2`; `node:22` (v22.23.3) → `# tests 1`. CI matrix `node: [18, 22]` × ubuntu/macos/windows (`.github/workflows/ci.yml:30-31`) | `6d1e152` | DD-2 unnecessary; tests could ship (Low) | Windows leg `UNVERIFIED` — see P-13 |
| P-4 | The two upstream test files spawn child processes and write temp files | data-env | `grep -n "child_process\|spawnSync\|mkdtemp\|writeFileSync" validate-*.test.cjs` → `validate-findings.test.cjs:5` (`spawnSync`), `:103`, `:106`, `:469` (`mkfifo`) | `c1c8a8c` | DD-2's user-project hazard is milder (Low) | — |
| P-5 | No upstream Markdown file references the test files | existence | `grep -n "test.cjs\|\.test\b" *.md` in upstream `skills/security-audit/` → 0 hits (alternate names: "validator tests" appear only in upstream `README.md`, which is not vendored) | `c1c8a8c` | Excluding the tests would leave a dangling instruction; DD-2 needs a SKILL note (Low) | — |
| P-6 | Both validators are dependency-free, read-only, and exit 0 on valid / 1 on invalid input on Node 18 and 22 | data-env | `grep require(` → `fs`, `path`, `util` only; no `child_process`/`fetch`/`fs.write*` (`validate-findings.cjs:11-13`, `validate-coverage-ledger.cjs:8-10`). Runs: `[]` → `PASS: 0 findings valid`, exit 0 (18.20.8, 22.23.3); `[{"verdict":"confirmed"}]` → exit 1 (18.20.8, 22.23.3); ledger `{}` → `ERROR: $: expected a top-level array`, exit 1 (18.20.8, 22.23.3) | `c1c8a8c` | FR-7 gate and DD-3 smoke redesigned (High) | Windows `UNVERIFIED` — P-13 |
| P-7 | The readers of `docs/specs/audits/` "most recent report" are exactly: `akili-archive.md:83-84`, `akili-audit.md:79`, `kaizen/SKILL.md:69,74`; restating docs: `docs/flow.md:424-425`, `docs/commands/akili-audit.md:34`, `docs/commands/akili-archive.md:68`, `docs/skills/kaizen.md:24`; role statements: `akili-constitution.md:39-40,1443`, `docs/commands/akili-constitution.md:43,53`; path mentions: `README.md:583,792`, `docs/flow.md:84,153,284`, `docs/commands/README.md:17` | shared-state | `grep -rnE "specs/audits\|audits/\|most recent report\|drift report\|drift-report" --include='*.md' --include='*.js' --include='*.json' .` excluding `docs/specs/{archive,kaizen,changes/akili-security,bugfix}`, `node_modules`, `releases`, `CHANGELOG.md`, `dotfiles`. **Corrected after judgment-day (J-A1/J-B2):** the first draft's output listed `docs/commands/akili-archive.md:68` and `docs/skills/kaizen.md:24` but the row dropped them; both re-read 2026-10-18 — each holds "most recent report under `docs/specs/audits/`" | `a31f876` | A missed reader reads a security index as drift (KZ-004) — task added (High) | — |
| P-8 | Editing the routing section template makes `akili routing` refuse every existing project's fence | data-env | `$SCRATCH/proj`: `akili routing --hosts claude --models claude=opus,sonnet,haiku --cli claude=claude --wrappers no --yes` → `appended AGENTS.md`, exit 0; re-run → `unchanged`, exit 0; after adding one phase row to `$SCRATCH/rpkg/.claude/templates/model-routing.section.md` → `refused (hand-edited fence; --force to regenerate) AGENTS.md`, exit 1 (Node 22.12.0). Mechanism `bin/routing.js:431-436` (`expectedBody` rendered with the **new** template) | `6d1e152` | DD-7 could add the row (Low) | — |
| P-9 | `/akili-audit` reports a phase present only in the packaged doc as Phase→Tier Drift | other | `.claude/commands/akili-audit.md:61` ("A phase present in only one source — local with no packaged counterpart, or packaged with no local entry — counts as a difference") | `6d1e152` | DD-7 could add the doc row alone (Low) | — |
| P-10 | Adding the command + skill turns exactly two existing tests red | consumer | `npm test` in `$SCRATCH/pkg` (Node 22.12.0): `# tests 259 · pass 257 · fail 2` — `not ok 65` (`expected 199 … counted 218`) and `not ok 75` (doctor codex baseline fixture). Further pinned counts read at `test/install-cursor.test.js:216` (comment "199"), `:227` (`11 + 199 = 210`), `:232` ("24 top-level skill directories"), `:238` (`11 + 24 = 35`), `:246` (message "199"), `:249` (`11`), `:340` (`210` / `199`), `:387` (`11` / `24`). Non-test restatements (re-run after judgment-day J-B1, 2026-10-18: `grep -nE "\b(11\|24\|199\|210)\b" docs/cli.md README.md docs/README.md docs/commands/README.md docs/skills/README.md`, command/skill/file hits): `docs/cli.md:117` ("the 11 command skills"), `:182`, `:194` ("the 11 commands"), `:183`, `:195` ("the 24 packaged skills"), `:216` ("11 command skills and 24 packaged skills") — no hit elsewhere | `a31f876` | More consumers to update in T4/T5b (Low) | — |
| P-11 | With a pre-existing `~/.agents/skills/security-audit`, install keeps it (skip-existing) | live-path | `HOME=$SCRATCH/home2 node bin/akili.js install --tool codex` → `skip existing …/.agents/skills/security-audit`; its `SKILL.md` still reads `upstream` | `6d1e152` | DD-8 unnecessary (Low) | — |
| P-12 | Codex and Cursor default to the shared skills root `~/.agents/skills` | location | `bin/akili.js:127` (`codexSkills`), `:139` (`cursorSkills`) | `6d1e152` | DD-8 scope narrower (Low) | — |
| P-13 | P-3 and P-6 hold on the Windows CI legs | data-env | `UNVERIFIED — confirm at source before relying on it` | — | DD-3 smoke case adjusted for Windows (Low — DD-2 already removes the discovery hazard) | First CI run after the user pushes (owner: Juan Carlos Cadavid); recorded open in T7 |
| P-14 | Host sub-agent support on OpenCode, Antigravity, Codex and Cursor is sufficient for full audit mode | other | `UNVERIFIED — confirm at source before relying on it` | — | Only the FR-9 degrade path changes which hosts reach **Run** (Low — the path is designed either way) | T2 first step (owner T2): the command text states the capability check, not a host list |
| P-15 | Approval Mode is a per-spec field inherited by downstream spec commands, so a command run outside a spec has none | other | `.claude/commands/akili-propose.md` Step 1 *Approval Mode* ("recorded in the same Document Control block, inherited downstream") | `6d1e152` | DD-6 would need a mode rule (Low) | — |
| P-16 | `/akili-audit` writes only `drift-<…>.md` names into `docs/specs/audits/` | existence | `.claude/commands/akili-audit.md:68` (single path pattern); `:65` ("one report file per audit run") | `6d1e152` | DD-5's reversion challenge outcome changes (Low) | — |
| P-17 | Upstream fixes `run-metadata.json` `execution_policy` to `"sandboxed-source-and-local-only"`, no validator reads `run-metadata.json`, and a `confirmed` record requires `execution.observed_result` holding actual local output | other | Upstream `SKILL.md:86` (`execution_policy: "sandboxed-source-and-local-only"`); `grep -n "run-metadata" validate-findings.cjs validate-coverage-ledger.cjs` → 0 hits; `validate-findings.cjs:553-554` ("confirmed finding requires a visible execution observed_result"); `HUNTING.md:210` ("`observed_result` records actual local output") | `c1c8a8c` | FR-4's `akili_execution` field and the expected-yield statement change (Low) | — |
