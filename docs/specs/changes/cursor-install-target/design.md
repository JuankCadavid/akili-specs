# Design: Cursor as a Fifth Install Target

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/cursor-install-target` |
| Depth | Standard (re-checked in §9 against this design — holds) |
| Type | Change |
| Approval Mode | `gated` |
| Status | Draft — Phase 2, **amended after Judgment Day round 1** (user chose *Fix only*; see `judgment.md` — C1–C8, X1–X2, included suspects and both-judge warnings applied; no re-judgment) |
| Date | 2026-10-01 |
| Source | `requirements.md` (Phase 1 approved 2026-10-01, amended in the same fix round), `proposal.md` |
| Format precedent | `docs/specs/archive/2026-09-17-changes--codex-install-target/design.md` |
| Verified at | `7cd681a` (every `file:line` below; re-cited after judgment) |
| Skills applied | `cognitive-doc-design`; `software-architect` not loaded — no new module, data flow, or NFR class; the architecture is the Codex spec's DD-1 registry, extended by one data entry |

## 2. Executive Summary

Cursor is added as a **data entry in the Codex shape**: `TOOL_REGISTRY.cursor` reuses `commandsAsSkills` + `sharedSkillsRoot`, shares the `~/.agents/skills` root with Codex, and owns `<cursor-home>/akili`. The one installer logic change is in detection, and it is symmetric: a command skill in the shared root is evidence of **one** tenant only — Codex — and only while no sibling tenant's resources root is populated, so neither a Cursor-only nor a Codex-only machine auto-detects the other (DD-2). The methodology half mirrors Step 8E/8F for Codex with Cursor's shapes: Markdown-frontmatter wrappers with `readonly: true`, where `.cursor/` is documented to win over `.claude/` on a name clash; and a gate that Cursor **imports** from `.claude/settings.json`, whose Cursor contract rests on three facts the docs do not state (Write payload field, full-file vs fragment, allow-path output) — all three carried as High `UNVERIFIED` premises, floored by a Write-arm fail-closed branch, and settled by a two-host live validation before "enforced on Cursor" is claimed.

## 3. Architecture Overview

```
akili CLI (bin/akili.js)
  main():1975 → getArgs():251 → runInstall():931 → resolveTools():427 → installTool(tool):646
                                                      ↓                       ↓
                                       detectInstalledTools → isToolInstalled():390   getToolRegistryInfo():574
                                                                                        ↓
                                                              TOOL_ROOT_ARGS[tool](args):575 → TOOL_REGISTRY[tool](roots):135
                                                                                                   ↓ (cursor: NEW data entry)
                                            { commands: [], skills: [skillsRoot], resources: <home>/akili,
                                              commandsAsSkills, sharedSkillsRoot, detectByResourcesOnly }
```

| Layer | Codex today | Cursor (this spec) |
|---|---|---|
| Skills root | `~/.agents/skills` (shared) | **same directory** — the second installer block skips what the first wrote |
| Resources root | `$CODEX_HOME\|~/.codex/akili` | `$CURSOR_CONFIG_DIR\|~/.cursor/akili` |
| Detection | resources **or** command skill (`:399`, `:401-404`) | resources only; **and** Codex's command-skill probe no longer counts while Cursor's resources root is populated (DD-2) |
| Legacy root line in doctor | `~/.codex/skills` INFO (`:1131`) | none — Cursor has no AKILI-owned legacy location |
| Env row | `codex --version` | `cursor-agent --version` (DD-5) |
| Step 8E wrapper | `.codex/agents/*.toml` | `.cursor/agents/*.md` — YAML frontmatter, `readonly: true` on the Reviewer (DD-4) |
| Step 8F gate | native `.codex/hooks.json` entry | **imported** `.claude/settings.json` entry by default; native `.cursor/hooks.json` fallback (DD-6); gate script Cursor host row (DD-7) |
| Invocation | `$akili-<name>` | `/akili-<name>` |

## 4. Extended Directory Structure

Global (default) after `akili install --tool all`:

```
~/.agents/skills/                 ← written by the codex block, skipped by the cursor block
  akili-<command>/SKILL.md ×11
  <skill>/SKILL.md (+references/) ×24
~/.codex/akili/{templates,scripts,.mcp.json.example}
~/.cursor/akili/{templates,scripts,.mcp.json.example}   ← NEW
```

Local (`--local`): `./.agents/skills` + `./.cursor/akili`. Single-root (`--target <p> --tool cursor`): `<p>/akili` + `<p>/skills`.

Project files written by `/akili-constitution` on a Cursor-hosted project:

```
.cursor/agents/akili-{leader,implementer,reviewer,tester}.md   ← Step 8E (DD-4)
.claude/hooks/akili-tasks-gate.sh  (or an existing .codex/hooks/ copy — DD-6 resolution)
.claude/settings.json  PreToolUse Edit|Write → gate              ← written first when Step 8F is accepted; imported by Cursor
.cursor/hooks.json                                               ← Step 8F fallback only (DD-6)
```

`.agents/` tenant table (`akili-constitution.md:811-818`, `docs/flow.md:356-358`) gains **no row**; the `.agents/skills/` row's cell text changes from "Codex repo-scope skills / `akili install --tool codex --local`" to name both tenants ("Codex and Cursor repo-scope skills / `--tool codex --local` or `--tool cursor --local`") (FR-8).

## 5. Data Model

### 5.1 Registry entry (conceptual, `bin/akili.js`)

| Field | Cursor value | Rationale |
|---|---|---|
| `commands` | `[]` | No commands directory on Cursor (commands merged into skills — P-4) |
| `skills` | `[roots.skillsRoot]` | Shared Agent Skills root |
| `resources` | `<roots.root>/akili` | AKILI-owned; the detection anchor |
| `legacyResources` | `null` | Never shipped |
| `commandsAsSkills` | `true` | `installTool:670`, `doctorTool:1061` branches |
| `sharedSkillsRoot` | `true` | Enables the cleanup ban (`:613`), the two-root header (`:582`), the shared-root detection branch (`:392`) |
| `detectByResourcesOnly` | `true` | **New flag.** In `isToolInstalled`'s shared-root branch: when set, return after the resources probe (DD-2). The same branch, for a tool **without** the flag (Codex), now runs its command-skill probe only when no other shared-root tool resolving to the same skills root has a non-empty resources dir — the symmetric half of DD-2 |

`defaultPaths.cursor` follows the `CODEX_HOME` pattern (`:117-126`) with `CURSOR_CONFIG_DIR` (P-10 — a CLI-config override adopted here as the resources home; the IDE's own home is `~/.cursor` regardless); `defaultPaths.cursorSkills` = `defaultPaths.codexSkills` (same path, named separately so the two targets stay independently overridable).

`TOOL_ROOT_ARGS.cursor` → `{ root: args.cursorTarget, skillsRoot: args.cursorSkillsTarget }` (`:567-572` shape).

### 5.2 CLI surface additions

| Surface | Change |
|---|---|
| `--tool` validation (`:290`) | `+ "cursor"` |
| `getArgs` (`:251`) options (`:258-259` shape) | `--cursor-target` (default `defaultPaths.cursor`), `--cursor-skills-target` (default `defaultPaths.cursorSkills`) |
| `--local` bases (`:300-303`) | `./.cursor`, `./.agents/skills` |
| `--target` single-root (`:331-337`) | the Codex rule as a second clause for `cursor` — not a refactor (NFR-6) |
| `selectedTools` `all` (`:375`), `ALL_TOOLS` (`:379`) | `+ "cursor"` (last) |
| Post-install hint (`:974-976`) | Cursor line: restart Cursor or open a new chat |
| `RECOMMENDED_ENV` (`:1190`) | `cursor-agent` row, `appliesTo: ["cursor"]`; filter at `:1225` (DD-5) |
| `runInteractiveInit` (`:1905-1968`) | option `5) Cursor`; `6) Both` (was 5, `:1929`); `7) All five` (was 6, `:1930`) — inputs `5`/`6` change meaning, recorded in CHANGELOG and `docs/cli.md:18`; local/global root assignment for both Cursor roots |
| `printHelp` (`:190-220`) | `--tool` list, two new flags, two examples |

### 5.3 Step 8E wrapper — `.cursor/agents/akili-<role>.md` (fields only)

| Field | Value rule | Pin |
|---|---|---|
| `name` | `akili-<role>` | <https://cursor.com/docs/context/subagents> `Last verified: 2026-10-01` |
| `description` | one line: when the Leader should delegate to this role | same |
| `model` | registry Cursor column for the role's tier — a concrete ID, optionally `[effort=<rung>]` (§5.5); Reviewer ≠ Implementer (Step 8E rule 1) | same (`model`: "inherit or a specific model ID"; bracket parameters documented) |
| `readonly` | **Reviewer only:** `true` — "restricted write permissions (no file edits, no state-changing shell commands)"; the write-axis half of author ≠ auditor (rule 2); every other wrapper omits it. Whether a read-only Reviewer may still *run* verification commands is P-18 — by contract it need not: the Leader passes the diff and the evidence (`/akili-execute` Step 2.3), as the Claude Code bullet already states | same |
| `is_background` | omitted (default `false`) — the Leader waits on the report | same |
| body | references `.agents/<role>.md`; never inlines the persona (rule 3) | — |

Name clash with `.claude/agents/`: documented — "When multiple locations contain subagents with the same name, `.cursor/` takes precedence over `.claude/` or `.codex/`" (P-9). Depth limit (P-8): main agent and direct subagents may spawn; grandchildren may not.

### 5.4 Step 8F — Cursor host row, script change, entry shapes (no content here)

**Host-data table** (`akili-constitution.md:1005-1008`, columns *Matcher / tool name · Path to the target file · Path to old/new content*) gains a Cursor row: tool `Write` (native edits arrive as `Write`; an imported Claude Code `Edit|Write` matcher maps to `Write` — P-5); target `.tool_input.file_path`; old content = the current file on disk; new content = **unverified field** (P-6 — the hooks page documents no `preToolUse` Write fields; the candidates the script reads, in order, are `content` then `new_content`, and the FR-10 raw capture settles which one, if either, arrives).

**Script change (DD-7), `Write` arm only (`:933-935`).** Three obligations, in prose: (1) the new-content read tries the candidate field names in order; (2) when the target is a `docs/specs/*/tasks.md` path and the extracted new content is empty, the arm exits 2 with a host-neutral reason ("write payload carried no readable new content") before reaching the count comparison at `:967`; (3) the `Edit` arm (`:929-932`) and the `apply_patch` branch are byte-for-byte untouched — an `Edit` whose `new_string` is empty and a removal-only `apply_patch` keep today's `exit 0`. The terminal-branch enumeration in the prose (`:980-990`) grows by one `exit 2`.

**Allow-path output on Cursor (P-17).** Every allow terminal exits 0 with empty stdout (`:920`, `:926`, `:967`, `:977`). Cursor's page says a permission hook's "invalid JSON or a response that doesn't match the hook's schema blocks the action", and lists "no output" among hook *failures* (fail-open unless `failClosed`). Which reading Cursor applies to an imported hook's empty stdout is unverified; the two candidate mechanisms T8 chooses between are recorded in DD-7. Until T8, the honesty note says Cursor enforcement is **pending live validation**, not "enforced".

**Native fallback entry (DD-6):** `.cursor/hooks.json` → `version: 1`, `hooks.preToolUse[]` → one entry with the command (the resolved script path, DD-6), `matcher: "Write"`, and `failClosed: true` (so a crash, timeout, or exit 127 blocks instead of silently allowing — <https://cursor.com/docs/agent/hooks> `Last verified: 2026-10-01`). Response honored: exit 2 + stderr, as today.

### 5.5 Effort dial → Cursor bracket parameter

| AKILI dial | `model` parameter |
|---|---|
| `low` | `[effort=low]` |
| `medium` | `[effort=medium]` |
| `high` / `xhigh` / `max` | `[effort=high]` `<CONFIRM>` — the highest rung the chosen model exposes on the live picker (FR-5 effort scenario) |

Models whose picker shows no effort parameter take no bracket. Rungs and IDs are confirmed at FR-10 against the live picker and the pricing page (<https://cursor.com/docs/models>, `Last verified: 2026-10-01`), never asserted beyond them.

## 6. Reversion Challenge (Step 2.3) — outcomes

| DD | What it reverts | Challenge: "what does removing this break?" | Outcome |
|---|---|---|---|
| DD-7 | The gate's silent `exit 0` when a **`Write`** to `docs/specs/*/tasks.md` carries empty new content (`:933-935` → `:967`) becomes `exit 2` | A Claude Code `Write` with `content: ""` to a tasks.md path — emptying the file — is now denied. A Claude Code `Edit` with `new_string: ""` (deleting a line) is **unchanged** (`Edit` arm untouched → `exit 0`); a removal-only Codex `apply_patch` (no `+` lines) is **unchanged** (`exit 0`); a `Write` of real content with zero `[x]` still exits 0 at the count comparison | Nothing the methodology permits breaks: emptying `tasks.md` is never a legitimate step. Scoping to the `Write` arm (judgment C2) is what keeps the other two hosts' fixtures green. Recorded; design amended |
| DD-2 | Codex's command-skill detection probe is suppressed while a sibling tenant's resources root is populated | A Codex `--skills-only`/`--commands-only` install (no `~/.codex/akili`) on a machine that also has Cursor resources is no longer auto-detected as Codex; `--tool codex` still works; the existing CI fixture (`install-layout-regression.js:543-545`, no Cursor resources present) is unchanged | Accepted and documented in `docs/cli.md`; the alternative (asymmetric detection) ships the C1 defect |

## 7. Surface Table

| # | Surface | Change | FR |
|---|---|---|---|
| 1 | `bin/akili.js` `defaultPaths` | `cursor` (`CURSOR_CONFIG_DIR`), `cursorSkills` | FR-2 |
| 2 | `TOOL_REGISTRY` (`:135`) | `cursor` entry (§5.1) — no other entry touched | FR-2, FR-4, NFR-6 |
| 3 | `TOOL_ROOT_ARGS` | `cursor` | FR-2 |
| 4 | `isToolInstalled` (`:390-405`) | `detectByResourcesOnly` short-circuit; sibling-resources guard on the command-skill probe (DD-2) | FR-1 |
| 5 | `getArgs` (`:251`) | validation, flags, `--local`, `--target` clause | FR-1, FR-2 |
| 6 | `selectedTools`/`ALL_TOOLS`/`toolFlagFor` | five-set; `toolFlagFor` already derives `all` from `ALL_TOOLS.length` (`:451`) — no edit | FR-1 |
| 7 | hints, `RECOMMENDED_ENV`, init, help | §5.2 | FR-1, FR-3 |
| 8 | `doctorTool` | no edit — `commandsAsSkills` (`:1061`) and the shared-root STALE skip (`:1102`) are flag-driven; the Codex legacy line (`:1131`) stays `tool === "codex"` | FR-3 |
| 9 | `scripts/ci/install-layout-regression.js` | shared-root pair fixture + **four-state** detection fixture (FR-4), both pinning `CURSOR_CONFIG_DIR` and `CODEX_HOME` to the scratch home; `SHIPPING_TARGETS` unchanged | FR-4 |
| 10 | `test/install-cursor.test.js` (new, **T2**) | subprocess tests: layout identity vs codex (directory-level, 35 dirs; file-level 210 files), skip-on-second-install, four detection states, `--dry-run`/partials, env row absent for `--tool claude`, `doctor --tool codex` output before/after on a fixture; every spawn pins `CURSOR_CONFIG_DIR` | FR-2, FR-3, FR-4 |
| 10a | `test/tasks-gate.test.js` (new, **T7**) | gate-script fixtures (NFR-7) extracted from the constitution block (`:870-977`); fails the test run loudly when `jq` is absent on a CI leg that is expected to have it (ubuntu/macos), skips with a named reason on windows | NFR-7 |
| 11 | `akili-constitution.md` Step 8C | "all four" → five hosts (`:523-524`); Cursor invocation line (`agent`; `/akili-<name>`) | FR-7 |
| 12 | Step 7 template-source list (`:411-416`) | Cursor line: `./.cursor/akili/templates/…` (local) / `$CURSOR_CONFIG_DIR\|~/.cursor/akili/templates/…` (global) | FR-9 |
| 13 | Step 8E | Cursor bullet + field table (§5.3), precedence sentence, depth limit, alias caveat (P-9b); `.agents/skills` tenant-row cell text | FR-5, FR-8 |
| 14 | Step 8F | script `Write` arm (DD-7); host-data row; terminal-branch count; Cursor entry instruction (DD-6); honesty note "pending live validation"; mode policy | FR-6 |
| 15 | Step 9 + Verification Checklist | Cursor wrapper/hook summary lines (`:1128-1131`, `:1158-1160`), incl. the import-toggle answer | FR-5, FR-6 |
| 16 | `akili-execute.md` | spawn bullet (Task tool, named subagent, depth limit), model checkpoint `/model` in Cursor, Unattended Mode: no verified equivalent (Cursor ships `goal`/`loop`/`autopilot` built-ins — FR-10 observes them) | FR-8 |
| 17 | `akili-test.md` | Tester spawn bullet + checkpoint wording | FR-8 |
| 18 | `docs/flow.md` | per-host launch (`:254`), `.agents/` paragraph (`:350`) + tenant-row cell (`:358`), registry sentence (`:391`) | FR-8 |
| 19 | `docs/model-routing.md` | tier-table Cursor column, enforced-routing row, effort mapping, *How to apply*, invocation row, *Why these models* paragraph | FR-7 |
| 20 | `docs/cli.md`, `docs/commands/*` mirrors | parity with 11–17 (incl. `docs/cli.md:18` init numbering); new short section "Shared and compatibility skill roots (Codex, Cursor, Claude Code)" naming the DD-2 detection rule | FR-9 |
| 21 | `README.md`, `docs/README.md`, `.claude/README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `docs/commands/README.md` | five targets; badge; target table row; invocation note | FR-9 |
| 22 | `CHANGELOG.md` | Unreleased minor entry, incl. the init renumbering | FR-9 |
| 23 | `execution.md` | FR-10 evidence (IDE + CLI) | FR-10 |

**Tool-name enumeration walk (new enumerated value `cursor`; KZ-004).** Consumers of the tool-name set at HEAD (`grep -n '"codex"' bin/akili.js` → 11 hits) and what `cursor` does there: `:290` validation → accepted; `:330` root resolution → sibling line; `:335` single-root clause → sibling clause; `:375` `all` → appended; `:379` `ALL_TOOLS` → appended; `:974` hint → sibling; `:1131` legacy line → **not** extended; `:1210-1213` env row → sibling row; `:1928` init → option 5, with `:1929` (`"5"` → both) and `:1930` (`"6"` → all) renumbered to `"6"`/`"7"`. Outside `bin/`: `install-layout-regression.js` (**8** hits — `:152`, `:522-552`; fixture extended, `SHIPPING_TARGETS` not), `ci.yml` (0 — `--tool all` covers it), `test/` (0 `codex` hits; `agents-doctor.test.js:569` is an FR-9 sweep keep, not a consumer). Prose consumers of the per-host path set: Step 7's template list (`akili-constitution.md:411-416`, row 12), `docs/cli.md:18`. Fall-through: a tool name absent from `TOOL_ROOT_ARGS` throws at `:575` — `cursor` is present, so no fall-through is reached. Other commands' model-checkpoint lines ("`/model …` in Claude Code, the model selector in OpenCode", e.g. `akili-propose.md`) are deliberate keeps, as in the Codex spec.

## 8. Design Decisions

### DD-1 — Data entry in the Codex shape; no registry refactor
Cursor's layout differs from Codex's only in the resources home. Reusing `commandsAsSkills` + `sharedSkillsRoot` means the install loop, doctor, cleanup ban, and header are untouched (NFR-6). Rejected: a per-tool branch (`tool === "cursor"`) in the install path. **Lesson applied:** KZ-004 — the enumeration walk in §7 names every terminal branch the new value lands in.

### DD-2 — Symmetric detection on a shared root (judgment C1)
The shared-root branch (`isToolInstalled:392-405`) treats `<skills>/akili-*/SKILL.md` as evidence. Two tenants write those same files, so the probe can no longer name a tenant on its own. Rule: (a) Cursor detects by its resources root only (`detectByResourcesOnly`); (b) Codex's command-skill probe counts only while no sibling tenant resolving to the same skills root has a non-empty resources dir. Four states the fixture asserts: foreign-only root → neither; + `akili-execute/SKILL.md` → Codex yes, Cursor no (the existing CI assertion, unchanged); + Cursor resources → Cursor yes, **Codex no**; + Codex resources → both. Trade-off accepted in §6. Rejected: a Cursor marker file in the shared root; asymmetric detection (ships C1).

### DD-3 — `CURSOR_CONFIG_DIR` honored for the global default only
Mirrors the `CODEX_HOME` rule (`:117-126`): env var → global default; `--local` keeps `./.cursor`; flags override. The variable is documented as the CLI's `cli-config.json` override (P-10); AKILI adopts it for the resources home so a relocated CLI config carries its AKILI resources with it. Rejected: `XDG_CONFIG_HOME` (Linux/BSD only).

### DD-4 — Cursor wrappers under `.cursor/agents/`; the `.claude/agents/` clash is documented in Cursor's favor
Cursor reads `.claude/agents/` too, and `.cursor/` wins a same-name clash (P-9, verified). Step 8E therefore writes Cursor-native wrappers without renaming. What stays unverified is narrower (P-9b, Low): a project that has **only** Claude Code wrappers, opened in Cursor, hands Cursor `model: opus` — the alias case. FR-10 observes it; the fallback if the alias breaks the subagent is a one-line Step 8E note telling dual-host projects to scaffold the Cursor set, which this step already does. Rejected: distinct names (`akili-reviewer-cursor`) — unnecessary given documented precedence.

### DD-5 — Environment row probes `cursor-agent`
Docs invoke the CLI as `agent` (P-11) — a name too generic to probe (any `agent` on PATH would answer). The installer also writes `cursor-agent` (both are symlinks to `versions/<v>/cursor-agent` locally, P-12 unverified elsewhere); the row probes `cursor-agent` and names `agent` and both install commands (`curl … | bash`; Windows `irm 'https://cursor.com/install?win32=true' | iex`) in its text. Never fails the check.

### DD-6 — Step 8F on Cursor: ask, then one entry — imported by default, native by answer
Cursor imports `.claude/settings.json` hooks by default (P-5). Step 8F already writes that entry when accepted (`:1029-1049`), so on a Cursor project the order is: write the Claude Code entry first; then **ask the user one question** — *"Is Cursor's 'Include Third-Party Plugins, Skills, and Other Configs' setting on (its default)?"* — because that toggle is a Cursor UI setting no repository file reveals (judgment W-g). Answer *on* → no native entry (two entries would run the script twice per write). Answer *off* or *unknown* → write the native `.cursor/hooks.json` entry with `failClosed: true`, pointing at the **resolved** script path: the existing `.claude/hooks/akili-tasks-gate.sh`, else an existing `.codex/hooks/` copy, else write `.cursor/hooks/akili-tasks-gate.sh` — never a path that does not exist (judgment U2). Merge rules restate every `settings.json` clause: read first, abort on invalid JSON naming the file, append without clobbering a foreign entry (the local `~/.cursor/hooks.json` holds another tool's `preToolUse` entries), idempotent on re-run. The Step 9 summary records the answer and which entry exists. **Lesson applied:** KZ-changes--scoped-constitution-reads-1.

### DD-7 — Gate script: Cursor host row, `Write`-arm fail-closed floor, two unverified contracts carried
The `Write` arm reads only `.tool_input.content` (`:933-935`); Cursor documents **no** `preToolUse` Write fields (P-6, High). Three facts decide whether the imported gate enforces anything on Cursor, none of them in the docs: the new-content field name (P-6), whether that content is the whole post-edit file (P-16), and whether an empty-stdout `exit 0` is read as *allow* (P-17). The design does what holds regardless: the `Write` arm tries the candidate names (`content`, `new_content`) and, when a tasks.md target yields empty content, exits 2 — so an unrecognized payload shape is a **loud deny**, never the silent allow at `:967`. T8 captures the raw payload and settles P-6/P-16; for P-17 it tries the two candidate mechanisms in order and records which one Cursor honors: (i) emit `{"permission":"allow"}` on the allow path **only when the payload carries a Cursor-only marker** (so Claude Code and Codex, which parse stdout JSON against their own schemas, never see it); (ii) `failClosed: true` on a native entry plus the same marker-gated output. If P-16 is refuted (fragment payloads), the fallback is to deny every tasks.md `Write` whose payload is not full-file — recorded as a known false-deny of the DD-6 (Codex spec) kind. Edit arm and `apply_patch` branch untouched (C2). Fixtures (NFR-7, T7 before T3): Cursor `Write`+`content`, `Write`+`new_content`, empty content, Claude Code `Edit`+`new_string:""`, Claude Code `Write`, Codex removal-only `apply_patch`.

### DD-8 — Registry column names families; IDs confirmed on the live picker
Cursor's roster is multi-vendor and plan-gated; the one selected-model object in `cli-config.json` shows `aliases: []`, and the docs name only `auto` as a floating choice (P-11). Same rule as Antigravity/Codex: family in the packaged registry, slug confirmed per project. Proposed pairing: T1 Claude Opus family; T2 Composer family; T3 GPT-5.6 Sol/Terra family (*≠ T2, different vendor*); T4 Claude Sonnet family (1M context); T5 Composer (Fast); T6 Gemini 3.8 Flash family (vision) — every cell `<CONFIRM SLUG>` until confirmed.

### DD-9 — Pins are part of the artifact
Every Cursor claim carries `Last verified: 2026-10-01` + URL; a claim not exercised carries the `UNVERIFIED — confirm at source before relying on it` marker. FR-10 flips markers, never deletes them silently.

### DD-10 — Closure sweep is grep-driven on the obligation
FR-9's pattern set with the recorded baseline (**53 lines / 18 files / 61 occurrences** excluding `releases/`; `releases/` adds 6 lines / 9 occurrences, kept) and recorded keeps. **Lesson applied:** KZ-002 and KZ-changes--kaizen-loop-closure-2.

### DD-11 — No canonical-file change for Cursor's picker
`disable-model-invocation`, description trimming, and any Cursor-only frontmatter stay out (NFR-2). FR-10 measures; a follow-up spec acts.

### DD-12 — Live validation may reopen the constitution task once
FR-10 findings on P-6/P-16/P-17/P-9b are budgeted as one reopen of the Step 8E/8F task, not a surprise.

## 9. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Measure | Estimate | Basis |
|---|---|---|
| Tasks | **8** | T1 installer · T2 installer fixtures/tests · T7 gate-script fixtures (red before T3) · T3 constitution 7/8C/8E/8F/9 · T4 registry · T5 execute/test/flow · T6 mirrors/root docs/CHANGELOG/sweep · T8 live validation (IDE + CLI). **Ordering:** T7 → T3 (red-before); T1 → T2; T4 → T3; T1/T3/T4/T5 → T6; all → T8 |
| LOC / lines | **~700** | installer ~70 · regression fixtures ~80 · installer test ~150 · gate test ~90 · gate script ~12 · constitution ~130 · model-routing ~45 · execute/test/flow ~30 · mirrors/README/CHANGELOG ~140 · execution evidence ~40 |
| Review rounds | **16** | rules documents (T3, T4, T5, T6) at 2 each = 8; code tasks (T1, T2, T7) at 1 each = 3; T8 1; margin 4 — raised from 14 after judgment W-d: the Codex precedent of the same shape ran 19, three on Step 8F; this spec carries three unverified gate contracts into T3/T8 |

Depth check: **Standard holds** — not Lite (eight tasks, three hosts' worth of prose), not Full (no data, API, or migration). Exceeding any number stops the Leader for the user.

## 10. Premise Ledger

**Count:** 21 rows — 13 verified, 8 `UNVERIFIED` (High: 4 — P-6, P-16, P-17, P-20; Low: 4 — P-9b, P-12, P-18, P-19).
**Blast-radius triggers:** `live-path` fires (the design names the user action `akili install --tool cursor`); `shared-state` fires (two registry entries share one skills root); `consumer` fires (the tool-name set gains a value; `TOOL_REGISTRY` gains a flag read by `isToolInstalled`; the per-host path set gains a Cursor line read by Step 7).

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | `TOOL_REGISTRY.codex` is a data entry with `commands: []`, `commandsAsSkills: true`, `sharedSkillsRoot: true`, and the install/doctor/cleanup paths branch on those flags, not on the tool name (the one name-keyed branch is the doctor legacy line `:1131`) | `location` | `bin/akili.js:164-171`; `grep -n "commandsAsSkills\|sharedSkillsRoot" bin/akili.js` → 161, 169, 170, 385, 392, 582, 613, 670, 1061, 1102 | `7cd681a` | DD-1 fails. Impact **High** | — |
| P-2 | Shared-root detection returns true on a non-empty resources dir (`:399`) **or** any `<skills>/akili-<cmd>/SKILL.md` (`:401-404`); the branch spans `:392-405` | `location` | `bin/akili.js:392-405` | `7cd681a` | DD-2's flag and guard are mis-placed. Impact Low | — |
| P-3 | `cleanupLegacyFiles` never touches a `sharedSkillsRoot` skills dir | `existence` | `bin/akili.js:613` (`&& !paths.sharedSkillsRoot`) | `7cd681a` | FR-2 foreign-skill scenario needs code. Impact Low | — |
| P-4 | Cursor discovers skills at `~/.agents/skills`, `.agents/skills`, `~/.cursor/skills`, `.cursor/skills`, and the compatibility roots `~/.claude/skills`, `.claude/skills`, `~/.codex/skills`, `.codex/skills`; skills are invoked with `/`; Cursor's own migration turns commands into skills | `data-env` | <https://cursor.com/docs/context/skills> fetched 2026-10-01: "For compatibility, Cursor also loads skills from Claude and Codex directories: `.claude/skills/`, `.codex/skills/`, `~/.claude/skills/`, and `~/.codex/skills/`"; "Skills can also be manually invoked by typing `/` in Agent chat"; migration section: "commands are converted to skills with `disable-model-invocation: true`"; local `ls ~/.cursor/commands` → none, `ls ~/.cursor/skills-cursor` → 22 entries incl. `migrate-to-skills` | `7cd681a` | Option A collapses to Option B. Impact **High** | — |
| P-5 | Cursor imports Claude Code hooks from `.claude/settings.local.json` → `.claude/settings.json` → `~/.claude/settings.json`, mapping `PreToolUse`→`preToolUse`, `Edit`→`Write`, honoring `hookSpecificOutput.permissionDecision: "deny"` and exit code 2, enabled by default; other non-zero exit codes fail open | `data-env` | <https://cursor.com/docs/reference/third-party-hooks> fetched 2026-10-01 (three paths; event table; tool-name table; "Exit code 2: Block the action"; "Other exit codes: Hook failed, action proceeds (fail-open)"; "The setting is on by default") | `7cd681a` | DD-6 inverts: native entry becomes the default. Impact **High** | — |
| P-6 | A Cursor `preToolUse` `Write` payload carries `file_path` and a new-content field named `content` or `new_content` | `data-env` | `UNVERIFIED — confirm at source before relying on it` — raw <https://cursor.com/docs/agent/hooks> (`curl -sL`, 1,302,332 bytes, 2026-10-01): `new_content` → **0 occurrences**; the only `file_path` payload samples are `afterFileEdit` (`edits[]`), `beforeReadFile` and `beforeTabFileRead` (`content` = "Full contents of the file"); no `preToolUse` Write sample exists. The earlier summarizer-derived sample was wrong (judgment X1) | — | Neither candidate arrives → every tasks.md `Write` on Cursor is a loud deny (DD-7 floor), which stalls `/akili-execute` on that host until the field is learned. Impact **High** | T8 raw payload capture; owner: the Leader. Abort path: if neither name arrives, T8 records the real name and DD-12's reopen adds it |
| P-7 | The gate's `Write` arm reads `.tool_input.content` only, and an empty `new` reaches `exit 0` at the count comparison | `location` | `.claude/commands/akili-constitution.md:933-935` (`Write)` … `new=$(… '.tool_input.content // ""')`), `:967` (`[ "$(count_x "$new")" -le "$(count_x "$old")" ] && exit 0`); `:929-932` is the `Edit` arm, `:965` `esac`, `:966` `count_x()` | `7cd681a` | FR-6(a) is unnecessary; T7's red run would be green before the edit. Impact Low | — |
| P-8 | Cursor subagents are Markdown + YAML frontmatter at `.cursor/agents/` (also `.claude/agents/`, `.codex/agents/` and `~/` equivalents) with `name`, `description`, `model` (`inherit` or an ID, bracket parameters such as `[effort=high]`), `readonly` ("restricted write permissions (no file edits, no state-changing shell commands)"), `is_background`; direct subagents may spawn, grandchildren may not | `data-env` | <https://cursor.com/docs/context/subagents> fetched 2026-10-01 (locations list, field table, "a subagent launched by another subagent can't launch further ones") | `7cd681a` | DD-4 wrapper shape changes. Impact **High** | — |
| P-9 | When `.cursor/agents/` and `.claude/agents/` both define `akili-reviewer`, the `.cursor/` one wins | `data-env` | same page: "Project subagents take precedence when names conflict. When multiple locations contain subagents with the same name, `.cursor/` takes precedence over `.claude/` or `.codex/`." (re-read from raw HTML 2026-10-01) | `7cd681a` | DD-4 would need distinct names. Impact **High** | — |
| P-9b | A `.claude/agents/` wrapper carrying the Claude Code alias `model: opus`, read by Cursor in a project with no `.cursor/agents/`, does not break the subagent (Cursor "falls back to a compatible model" for restricted models; an unknown value is undocumented) | `data-env` | `UNVERIFIED — confirm at source before relying on it` — the page covers fallback for team restrictions, Max Mode and plan limits only | — | A one-line Step 8E note for dual-host projects (DD-4). Impact Low | T8; owner: the Leader |
| P-10 | The Cursor CLI reads `CURSOR_CONFIG_DIR` as an override for its config directory (`cli-config.json`; default `~/.cursor`) | `data-env` | <https://cursor.com/docs/cli/reference/configuration> fetched 2026-10-01: "Override with environment variables: `CURSOR_CONFIG_DIR`: custom directory path; `XDG_CONFIG_HOME` (Linux/BSD): uses `$XDG_CONFIG_HOME/cursor/cli-config.json`"; local `ls ~/.cursor/cli-config.json` exists | `7cd681a` | DD-3 drops the env var. Impact Low | — |
| P-11 | The CLI is invoked as `agent` (the docs' run command); the installer also writes `cursor-agent`; the one selected-model object in `cli-config.json` carries `aliases: []`, and the docs name `auto` as the only floating choice | `data-env` | <https://cursor.com/docs/cli/overview> (`agent` as the run command; `cursor-agent` not mentioned); `which cursor-agent agent` → both `~/.local/bin/…`, symlinks to `versions/2026.09.26-dd393fe/cursor-agent`; `cursor-agent --version` → `2026.09.26-dd393fe`; `python3 … cli-config.json` → `"aliases": []` on `modelId: composer-2.5` | `7cd681a` | DD-5 probes the wrong name (row never fails); DD-8 could use aliases. Impact Low | — |
| P-12 | `cursor-agent` is present wherever `agent` is (same installer, incl. Windows) | `existence` | `UNVERIFIED — confirm at source before relying on it` — observed on one macOS machine; the Windows installer names no binary | — | The env row reports NOT FOUND on an install that has only `agent`; informational. Impact Low | T8; owner: the Leader (record `which agent cursor-agent` on each validation host) |
| P-13 | No packaged gate script exists under `.claude/hooks/`; the only source is the Step 8F fenced block `:869-978` | `existence` | `ls .claude/hooks` → no such directory; `grep -n '^   ```bash$\|^   #!/bin/bash$\|^   exit 0$\|^   ```$' akili-constitution.md` → 869, 870, 977, 978, **1045, 1069** (the last two close the two JSON fences; the script block is 869–978) | `7cd681a` | T7 extracts from the wrong place. Impact Low | — |
| P-14 | **live-path:** `akili install --tool cursor` reaches the new entry via `main():1975` → `getArgs():251` (validation `:290`) → `runInstall():931` (`:2000`) → `resolveTools():427` → `selectedTools():373` (explicit `--tool`, `:428`) → `installTool("cursor"):646` → `getToolRegistryInfo():574` → `TOOL_ROOT_ARGS.cursor` (`:575`) → `TOOL_REGISTRY.cursor` (`:135`); branch points `toolExplicit` (`:428`) and `paths.commandsAsSkills` (`:670`) | `live-path` | `grep -n "^async function main\|^function runInstall\|^function resolveTools\|^function installTool\|^function getArgs\|^const TOOL_REGISTRY"` → 1975, 931, 427, 646, 251, 135 | `7cd681a` | The entry is unreachable; T1 verification 1 fails loudly. Impact Low | — |
| P-15 | **shared-state / consumer:** the skills root is written by two entries (`codex:164`, `cursor` new); consumers of the tool-name set: 11 in `bin/akili.js`, 8 in `install-layout-regression.js`, 0 in `ci.yml`, 0 in `test/`; `detectByResourcesOnly` has one reader (`isToolInstalled`) | `shared-state` + `consumer` | `grep -n '"codex"' bin/akili.js` → 290, 330, 335, 375, 379, 974, 1131, 1210, 1211, 1213, 1928 (11); `grep -rn codex scripts/ci/install-layout-regression.js .github/workflows/ci.yml test/*.js \| wc -l` → **8** (`:152`, `:522`, `:524`, `:529`, `:531`, `:543`, `:545`, `:552`, all in the script); `grep -rni codex test/` → 0 | `7cd681a` | A consumer missed → a fall-through (KZ-004); T1's Done re-runs the grep. Impact Low | — |
| P-16 | A Cursor `preToolUse` `Write` payload's new content is the **whole post-edit file**, including when an `Edit` is mapped to `Write` | `data-env` | `UNVERIFIED — confirm at source before relying on it` — the hooks page documents no Write payload; the `afterFileEdit` precedent is an `edits[]` fragment list | — | `count_x(fragment) ≤ count_x(whole file)` → the silent allow returns; DD-7's fallback denies non-full-file tasks.md writes (known false-deny). Impact **High** | T8: flip one `[x]` on a `tasks.md` that already holds `[x]` entries, with and without PASS evidence; owner: the Leader |
| P-17 | An imported hook's `exit 0` with empty stdout is treated as *allow* by Cursor | `data-env` | `UNVERIFIED — confirm at source before relying on it` — raw hooks page: "For permission hooks (… `preToolUse`), invalid JSON or a response that doesn't match the hook's schema blocks the action"; `failClosed` row lists "no output" among hook failures (fail-open unless `failClosed`); third-party page sample allows with `echo '{"permission": "allow"}'; exit 0` | — | Either every allow passes silently (acceptable) or every tasks.md write blocks (stalls execute). DD-7 names the two candidate mechanisms T8 selects between. Impact **High** | T8; owner: the Leader |
| P-18 | A `readonly: true` subagent can still run read-only verification (the Reviewer runs no command by contract — the Leader passes diff and evidence, Step 8E Claude Code bullet) | `data-env` | `UNVERIFIED — confirm at source before relying on it` — the page says "no state-changing shell commands"; which commands count is undocumented | — | Nothing in the contract — the Reviewer never needs a command; recorded so FR-10 observes it. Impact Low | T8 observation; owner: the Leader |
| P-19 | When the same skill exists in `~/.claude/skills` and `~/.agents/skills`, Cursor shows one entry (precedence undocumented) | `data-env` | `UNVERIFIED — confirm at source before relying on it` — the skills page does not address duplicates (proposal R2) | — | Claude Code + Cursor users see duplicates — documented in `docs/cli.md`, no design change. Impact Low | T8; owner: the Leader |
| P-20 | Cursor runs an imported project hook with the project root as cwd, so `bash .claude/hooks/akili-tasks-gate.sh` resolves | `data-env` | `UNVERIFIED — confirm at source before relying on it` — the hooks page states "Project hooks run from the project root" for native hooks; the third-party page is silent | — | exit 127 → fail-open on the imported path (silent allow); DD-6's native entry carries `failClosed: true`, the imported one cannot. Impact **High** | T8 (capture `cwd` from the payload); owner: the Leader |
| P-21 | **consumer:** Step 7's template-source list enumerates one line per host (Claude Code, OpenCode, Antigravity, Codex local/global) | `consumer` | `.claude/commands/akili-constitution.md:411-416` (read 2026-10-01); mirror `docs/commands/akili-constitution.md` | `7cd681a` | No Cursor line needed; §7 row 12 drops. Impact Low | — |
