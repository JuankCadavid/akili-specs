# Execution Log: OpenAI Codex CLI as a Fourth Install Target

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/codex-install-target` |
| Depth | Standard |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Started | 2026-09-16 |
| Leader model | Fable 5.1 (session model; registry T1 = `opus` — session model stronger, passed silently; packaged default registry `docs/model-routing.md` Claude Code T1 entry is the alias `opus`, no update needed) |
| Implementer model | `sonnet` (T2, registry default) — fallback sub-prompt path seeded with `.agents/implementer.md` (no Step 8E wrappers in this repo) |
| Reviewer model | `opus` (T3, registry default) — fallback sub-prompt path seeded with `.agents/reviewer.md`; author ≠ auditor held by model |
| Budget (design §9) | 7 tasks · ~560 lines · 1 review round per task + 1 reserved |
| Commit prefix | `[SPEC:changes/codex-install-target]` |
| Wave plan | Wave 1: T1 ∥ T4 ∥ T5 (disjoint files, no shared build output). Wave 2: T2 ∥ T3. Then T6, then T7 (closing gate, user present) |

## 2. Task Execution History

### T4 — `/akili-execute`, `/akili-test`, `docs/flow.md` per-host paragraphs

| Field | Value |
|---|---|
| Status | **PASS** (attempt 2 of 3) |
| Date | 2026-09-16 |
| Implementer | `sonnet`, effort `medium` (attempt 1) → `high` (attempt 2); skills: `cognitive-doc-design` (task default, kept) |
| Reviewer | `opus`, effort `high` |

**Attempt 1** — files: `.claude/commands/akili-execute.md`, `.claude/commands/akili-test.md`, `docs/flow.md` (16+/4−). Implementer verification: checks 1–4 green (`grep Codex` hits at spawn bullets, both checkpoints, Unattended, flow launch, flow tenants; `leader.md` untouched; `Last verified` at the execute checkpoint; `^model:` empty; `git diff --check` clean). Pin fetches: `developers.openai.com/codex/guides/slash-commands` → 308 → `https://learn.chatgpt.com/docs/cli/slash-commands` (`/model` — "Choose the active model (and reasoning effort, when available)"; **no standalone `/reasoning` command**); `https://learn.chatgpt.com/docs/build-skills`.

Reviewer verdict: **FAIL** (2 issues). `/model` wording adjudicated as conforming (page supports it; DD-8 requires stating what the source states — spec's literal "`/reasoning`" is not on the page). Issues, verbatim:

1. **Discovered Issue:** The tenant pin in `docs/flow.md:349` asserts two things the pinned page does not state. It claims Codex "scans **only** `<root>/.agents/skills/*/SKILL.md`" and "does not read `.agents/<role>.md` persona files directly". The fetched page states *"Codex reads skills from repository, user, admin, and system locations. For repositories, Codex scans `.agents/skills` in every directory from your current working directory up to the repository root"* and enumerates `$HOME/.agents/skills`, `/etc/codex/skills`, and bundled system skills. It never states the scan is exclusive, and it is silent on root-level `.agents/*.md`. The sentence carries no `Unverified:` marker.
   - **Violated Rule:** `design.md` §4 (W-8: "Until the live check, `--local` for Codex carries `Unverified:` on this claim"); `requirements.md` NFR-5; `design.md` DD-8 (KZ-001).
   - **Remediation:** Split the sentence: keep the pinned half as the page words it; mark the exclusivity/negative half `Unverified:` pending T7 step 5.
2. **Discovered Issue:** The launch paragraph at `docs/flow.md:254` adds an unpinned Codex behavior claim: *"a command installed as a skill is invoked `$akili-<name>` (skills are invoked with `$`)"* — neither `Last verified` + URL nor `Unverified:`, inside a sentence whose purpose is "no claim".
   - **Violated Rule:** `requirements.md` NFR-5; `design.md` §7 row 18 ("per-host launch paragraph (Codex: no claim)").
   - **Remediation:** Drop the invocation clause, or pin it to a page stating the `$` syntax with `Last verified: 2026-09-16` + URL.

Decision (Leader): spec text names "`/model` and `/reasoning`"; the pinned source has no `/reasoning` command. Not a pivot — a docs claim corrected at the source per DD-8/NFR-5. T5 aligned in the same wave (relayed). T3's Step 8E effort-mapping text must not claim `/reasoning` either — forward pointer for T3's brief.

**Attempt 2** — same three files (16+/4−, net). Fixes: `docs/flow.md` tenant sentence now states only what the page states (repo-scope scan of `.agents/skills` from cwd up to repo root, plus user-scope `$HOME/.agents/skills`; `Last verified: 2026-09-16` — https://learn.chatgpt.com/docs/build-skills) and carries `**Unverified:**` on the negative claim (Codex not documented to read `.agents/<role>.md`), pointing at T7 step 5; the `$akili-<name>` invocation clause is pinned to the same page ("type `$` to mention a skill"); both model checkpoints now say "when available" (page wording). Implementer verification: checks 1–4 green, `git diff --check` clean.

Reviewer verdict: **PASS**. Summary: both issues closed against the source, not just reworded — tenant pin tracks the page and the exclusivity claim carries `Unverified:` + T7 pointer per design §4/NFR-5; `$` invocation verified on the page ("run `/skills` or type `$` to mention a skill"); spawn bullets match DD-7 with `Unverified:` intact; Unattended uses the OpenCode "no verified equivalent" wording per FR-8 BUT; tenant table reproduces design §4 row for row; no `leader.md` hunk, no `model:` frontmatter.

| Field | Value |
|---|---|
| Requirements covered | FR-8 (Leader-inside-Codex scenario incl. BUT Unattended; tenant scenario, flow.md half), NFR-3, NFR-5 |
| Decisions | `/model` wording states the source (no standalone `/reasoning`); `$` invocation pinned rather than dropped (page states it) |
| Issues | Attempt 1 over-claimed a negative the source is silent on (KZ-001 class) — fixed |
| Queued for T7 | Spawn-instruction executability (step 3); tenant `Unverified:` (step 5); Unattended equivalent (step 6) |
| Final verification | checks 1–4 green; `git diff --check` clean |
| Approval gate | `gated` — user asked at the wave-1 landing |

### T5 — `docs/model-routing.md`: Codex column, enforced-routing row, how-to-apply, CLI row

| Field | Value |
|---|---|
| Status | **PASS** (attempt 2 of 3) |
| Date | 2026-09-16 |
| Implementer | `sonnet`, effort `medium` (attempt 1) → `high` (attempt 2); skills: `cognitive-doc-design` (task default, kept) |
| Reviewer | `opus`, effort `high` |

**Attempt 1** — file: `docs/model-routing.md` (73+/8−). Implementer verification: check 1 six tiers filled, T2 `Sol` ≠ T3 `Astra`; check 2 fetched `https://learn.chatgpt.com/docs/models` (2026-09-16): roster `gpt-6-astra`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `gpt-5.3-codex-spark` (preview, not mapped); families used (no floating alias exists — DD-3); `<CONFIRM SLUG>` on T4 (no context window stated) and T6 (no vision stated); effort enum on page Low/Medium/High/Extra High/Max/Ultra; check 3 CLI row + enforced-routing row present; `git diff --check` clean. Corrected mid-attempt after the T4 relay: no standalone `/reasoning` command (fetched `https://learn.chatgpt.com/docs/cli/slash-commands` independently).

Reviewer verdict: **FAIL** (2 issues). Verified clean: subagents pin real (`https://learn.chatgpt.com/docs/agent-configuration/subagents` states `name`, `description`, `developer_instructions` + `config.toml` keys `model`, `model_reasoning_effort`, `sandbox_mode`, `mcp_servers`; no tool allowlist); every Codex cell on the pinned page, quotes verbatim; `<CONFIRM SLUG>` cells justified; T2 ≠ T3; effort table matches design §5.3; `/reasoning` deviation correct (spec text stale); cross-host host list = CLI-invocation table, landed. Issues, verbatim:

1. **Discovered Issue:** The Codex row in *Enforced routing* and the `sandbox_mode` sentence below it document a TOML file using YAML/frontmatter colon syntax: `model:`, `model_reasoning_effort:`, `sandbox_mode: "read-only"`. `.codex/agents/akili-<role>.toml` is TOML; a reader following this text writes an unparseable wrapper.
   - **Violated Rule:** `design.md` §5.3 (`sandbox_mode = "read-only"`); pinned subagents page uses assignment form; DD-8.
   - **Remediation:** `model =`, `model_reasoning_effort =`, `sandbox_mode = "read-only"`.
2. **Discovered Issue:** Adding a fourth host column made a preserved sentence false: "**T6 is the row that matters here:** it is the one tier where this column is the best of the three."
   - **Violated Rule:** `tasks.md` T5 Scope; Reviewer Stability & Integrity check. Not a DD-10 sweep pattern, so T6 would not catch it.
   - **Remediation:** "best of the four" near line 130.

ADVISORY (recorded, no rework): (Risk) "names no second flagship" overstates — page lists `gpt-5.5` "Previous-generation flagship" and `gpt-5.4` "Flagship model for professional work"; suggest "no second current-generation flagship". (Readability) *Enforced routing* intro still says "Both tools support a `model` field" with four rows — pre-existing; **forward pointer to T6's sweep** (not a DD-10 pattern).

**Attempt 2** — `docs/model-routing.md` (75+/9−, net). Fixes: Enforced-routing Codex row and the `sandbox_mode` sentence now use TOML assignment form (`model =`, `model_reasoning_effort =`, `sandbox_mode = "read-only"`); "best of the three" → "best of the four"; advisory applied: "names no second current-generation flagship (`gpt-5.5` and `gpt-5.4` are listed but as previous-generation/retiring)". Implementer greps: no colon-form Codex keys remain; no "the three"/"both hosts"/"the other two" in file. Checks 1–3 green; `git diff --check` clean.

Reviewer verdict: **PASS**. Summary: all four delta lines verify at the source — TOML form matches design §5.3 and the pinned subagents page; retirement wording confirmed verbatim on the pinned models page ("On October 14, 2026, GPT-5.5 will retire … from Codex"; "GPT-5.4 and GPT-5.4 mini retire from Codex on August 31, 2026"); remaining `model:` occurrences belong to the other hosts' frontmatter rows; only `docs/model-routing.md` changed.

ADVISORY (final verdict, recorded, no rework):
- (Readability) *Enforced routing* intro still opens "Both tools support a `model` field on agent definitions" with four rows — pre-existing, not a DD-10 pattern. **Forward pointer → T6 sweep.**
- (Leader action, cross-task) `design.md` §5.3 and `tasks.md` T4 scope / T7 step 2 still say `/reasoning`; the pinned slash-commands page has no such command. **Forward pointer → T3 brief (Step 8E effort table must say `/model` sets effort; no `/reasoning`) and T7 brief (step 2 confirms the enum via `/model`).** Spec text left as-is (not a pivot: a docs claim, corrected at every artifact site); surfaced to the user at the gate.
- (Risk) The two `<CONFIRM SLUG>` cells (T4 Terra, T6 Astra) rest on absence of evidence — the page states no context window and no vision capability for any Codex model. **Forward pointer → T7 step 2:** confirm against the live `/model` roster rather than assume.

| Field | Value |
|---|---|
| Requirements covered | FR-7 (registry half; BUT no unconfirmed model — every cell on the pinned page or `<CONFIRM SLUG>`), NFR-5 |
| Decisions | Families not slugs (DD-3: Codex exposes only versioned names); T1 = T3 = Astra (only T2 ≠ T3 is binding, Claude Code precedent); `gpt-5.3-codex-spark` excluded (research preview); `/model` states the source, no `/reasoning` |
| Issues | Attempt 1: TOML keys written in YAML colon form; preserved sentence made false by the new column — both fixed |
| Queued for T7 | `<CONFIRM SLUG>` cells (step 2); effort enum accepted by `/model` (step 2); `sandbox_mode` behavior (step 3) |
| Final verification | checks 1–3 green; `git diff --check` clean |
| Approval gate | `gated` — user asked at the wave-1 landing |

### T1 — Installer: capability-flag registry, `codex` target, doctor, init, help

| Field | Value |
|---|---|
| Status | **PASS** (attempt 2 of 3) |
| Date | 2026-09-16 |
| Implementer | `sonnet`, effort `high` (attempt 1) → `xhigh` (attempt 2); skills: `systematic-debugging` (task default, kept); `tdd` not assigned (no unit harness) |
| Reviewer | parallel lens mode (diff 224+/67− touches deletion/`--force` paths in a root shared with foreign tools — data-loss surface): Reviewer A `opus` (conformance + Readability/Reliability), Reviewer B `opus` (conformance + Risk/Resilience), both effort `high` |
| Brief deviation | Diff handed to the Reviewers as a scratchpad file pointer (518 lines) rather than inline — these fallback Reviewers have `Read`, so the inline rule's rationale (a wrapper Reviewer cannot regenerate the diff) did not bind; both confirmed reading it whole |

**Attempt 1** — file: `bin/akili.js` (224+/67−). Implementer verification (temp roots under scratchpad, `HOME` redirected for detection fixtures; marker check on real `~/.agents/skills`/`~/.codex` empty throughout): checks 1–11 all PASS — 35 `SKILL.md` (11 commands + 24 skills), 0 `commands` dirs, byte-identical to `.claude/` source; second run 42/42 `skip existing`, `--force` 42 overwritten, 0 `.tmp`; foreign `gsap-core` + `tdd` asserted present, skipped, not deleted, no STALE, exit 0; `--fix` restored `akili-execute`, no TypeError; detection fixture negative (5 foreign dirs) then positive (one `akili-execute/SKILL.md`); single-root `--target` sandboxed; `--dry-run` 0 files; `--commands-only` 11; `--skills-only` 24; `--tool all` 4 blocks + `--tool all` hint; `both` 2 blocks; `{claude, antigravity}` fixture ⇒ per-tool hints; `--target`+`all` rejected; codex binary vendor-ENOENT ⇒ NOT FOUND exit 0; `--tool claude` ⇒ no codex row; `grep -c 'tool === "antigravity"'` = 0; `^model:` empty; `node --check`, `npm run verify:cli`, `git diff --check` green.

Implementer deviations (Not Done / Assumptions), adjudicated by both Reviewers as sound: (1) check 5 driven via `doctor` instead of `update` — `update` runs `npm install -g akili-specs@latest` live (pre-existing); `resolveTools` is the single detection entry point, reached by both. One real `akili update` ran once early (no-op, global already at 2.23.2, verified). (2) Two helpers `resolveToolTarget()` + `TOOL_ROOT_ARGS` replaced `values.tool === "antigravity"` comparisons to hit NFR-6's grep literally — behavior-preserving for the three shipping targets (both Reviewers traced it; T2 byte-diff is the gate). (3) Wizard verified by reading: piped-stdin `init` hangs on the original code too (pre-existing readline/non-TTY quirk, reproduced on stash) — 4=Codex, 5=Both, 6=All four, both Codex roots assigned in local/global branches.

Reviewer B verdict: **PASS**. KZ-004 terminal-branch enumeration for every delete/overwrite path (7 branches; codex lands in a guarded or zero-iteration branch in each; `--force` is the one replacing path and FR-2 sanctions it). Detection never consults the raw skills dir; `--target` sandboxes; one-sided overrides sane; Windows paths via `path.join`/`resolve` + `.cmd` probe; env row cannot flip exit; atomic copy on both codex write paths. ADVISORY (B): W-9 line fires on the configured skills root under the single-root layout; `--force` blast radius in a shared root (suggest a warning line); `tool === "codex"` appears twice (W-9 could be registry data); `getToolRegistryInfo` now throws on unknown tool (unreachable past validation, failing loud preferred).

Reviewer A verdict: **FAIL** (2 issues, both in the W-9 block). Verbatim:

1. **Discovered Issue:** The W-9 informational line fires on the directory the run itself manages whenever the skills root sits under the Codex config home. Reproduced: `install --tool codex --target $T/single` then `doctor --tool codex --target $T/single` prints `INFO legacy manual copies present at $T/single/skills (not managed by akili-specs)` while the same run reports `HEALTHY ok 42 | missing 0`. `legacySkillsDir` is computed as `path.join(roots.root, "skills")` with no check that it differs from the resolved skills root.
   - **Violated Rule:** `requirements.md` FR-3 "Legacy manual copies" (the standard root is what is checked; the line names the legacy copy as unmanaged — here the standard root *is* that directory, so the claim is false); `design.md` DD-2 makes `--target ~/.codex` a supported layout. `--codex-skills-target <codex-home>/skills` misfires the same way.
   - **Remediation:** Print the line only when `legacySkillsDir` is not one of the resolved `skillDirs` (compare with `path.resolve` on both sides).
2. **Discovered Issue:** `fs.readdirSync(legacySkillsDir)` is unguarded, so an unreadable or non-directory `<codex-home>/skills` aborts the whole doctor run. Reproduced with a plain file at that path: uncaught `ENOTDIR` stack trace, exit 1. Inside `--tool all` it kills the remaining tool blocks. `EACCES` does the same.
   - **Violated Rule:** `requirements.md` FR-3 "Healthy install" (run exits 0); the diff's own `isToolInstalled` wraps the identical `readdirSync` in try/catch.
   - **Remediation:** Wrap the `existsSync`/`readdirSync` pair in try/catch and treat a throw as "no legacy copies".

ADVISORY (A): W-9 block gated on `tool === "codex"` (registry field would preserve data-not-branches); `toolTargetLabel(rootPath, roots, paths)` has a redundant parameter; W-9 line sits inside `shouldInclude("skills")` so `--commands-only` never surfaces legacy copies.

Leader adjudication: both A issues are in-scope (W-9 is a T1 scope bullet; FR-3 is T1's requirement) — one rework attempt consumed. Advisories recorded; not folded into the rework.

**Attempt 2** — `bin/akili.js` (239+/67−, net; delta vs attempt 1 confined to the W-9 block + comment). Fix: `legacySkillsDir` compared by `path.resolve` against the resolved `skillDirs` before probing (never fires on the managed root — single-root `--target` or `--codex-skills-target` under the codex home); the `existsSync`/`readdirSync` probe wrapped in try/catch (throw ⇒ "no legacy copies"), matching the `isToolInstalled` convention. Implementer verification (root cause reproduced first per `systematic-debugging`): (a) single-root and under-home split ⇒ no INFO line, `HEALTHY ok 42 | missing 0`, exit 0; (b) split layout with planted `<codex-home>/skills/akili-execute/SKILL.md` ⇒ INFO exactly once, exit 0, content unchanged; (c) plain file at `<codex-home>/skills` ⇒ exit 0, no stack trace, `--tool all` blocks still print; (d) T1 checks 3, 4, 9, 10, 11 re-run green. Marker check empty.

Reviewer A verdict (retried once after a usage-limit runtime interruption — no work FAIL): **PASS**. Reproduced each fix on temp roots: issue 1 gone in both layouts, W-9 still fires on a genuine split-layout legacy dir (not dead code, FR-3 met); issue 2 gone (plain file ⇒ exit 0, summary renders). `skillDirs` is `doctorTool`'s function-level const from `paths.skills` (`[codexSkillsTarget]` for codex); optional catch binding is ES2019 (Node ≥ 10, package floor 18) and already used eight times in the file. Reviewer B's attempt-1 PASS stands (delta is inside the block B had flagged as advisory).

ADVISORY (final, carried from attempt 1, recorded, no rework, never a task): W-9 gated on `tool === "codex"` (a `legacySkillsHint` registry field would preserve data-not-branches); `toolTargetLabel` redundant `rootPath` param; W-9 inside `shouldInclude("skills")` so `--commands-only` never surfaces legacy copies; `--force` in a shared root could carry a warning line; `getToolRegistryInfo` throws on unknown tool (unreachable, loud is preferred).

Traceability: `// @akili-spec changes/codex-install-target` comment added by the Leader at the `TOOL_REGISTRY.codex` entry after the PASS (annotation only, no code change; `node --check` re-run).

| Field | Value |
|---|---|
| Requirements covered | FR-1 (all four scenarios incl. every BUT / AND IT MUST), FR-2 (three scenarios + `--target` single-root), FR-3 (three scenarios + BUT), FR-4 code half (gate is T2), NFR-1, NFR-2 (byte-diff empty), NFR-3, NFR-6 |
| Decisions | Detection fixture driven via `doctor` (same `resolveTools` path; `update` hits the live registry); `resolveToolTarget()` + `TOOL_ROOT_ARGS` helpers accepted as DD-1 applied to arg parsing (behavior-preserving, T2 byte-diff is the gate); wizard verified by reading (pre-existing non-TTY readline quirk) |
| Issues | Attempt 1: W-9 false positive under single-root layout; unguarded `readdirSync` — both fixed |
| Queued for T2 | Byte-identity of the three shipping targets' trees vs published 2.23.2; detection fixture automated |
| Queued for T7 | Real `codex` binary env row (FR-3 healthy install); `/skills` shows 11 `akili-*` |
| Constitution impact | No new module; CLI public surface grew (`--tool codex`, `--codex-target`, `--codex-skills-target`) — root guides updated by T6 per spec; **CodeGraph re-index pending** (`bin/akili.js` reshaped) for `/akili-archive` |
| Final verification | checks 1–11 (attempt 1) + a–d and re-run 3/4/9/10/11 (attempt 2) green; `node --check`, `npm run verify:cli`, `git diff --check` green |
| Approval gate | `gated` — user asked at the wave-1 landing |

## Budget Tripwire — wave 1 (T1, T4, T5)

| Metric | Budget (design §9) | Actual wave 1 | Delta |
|---|---|---|---|
| Review rounds | 1 per task + 1 reserved for the installer = 4 for these three | 6 (2 each) | **+2** |
| Lines — installer | ~150 | 239+/67− (306 changed) | **~2×** |
| Lines — model-routing | ~30 | 75+/9− | **~2.8×** |
| Lines — execute/test/flow | ~35 (T4 share) | 16+/4− | under |
| Lines — cumulative | ~560 total | ~410 changed with T2, T3, T6, T7 still open | on track to exceed |

Cause: every extra round was a single-issue precision FAIL (KZ-001 over-claimed pin; TOML colon syntax; W-9 guard) fixed in one retry — no task approached the 3-attempt ceiling. Installer LOC overrun = the DD-1 helper extraction to zero the NFR-6 grep literally + explanatory comments + W-9 guards; model-routing overrun = the "Why these models" paragraph and effort-mapping table the scope asked for. Escalated to the user at the wave-1 gate (gated mode pauses there anyway).

**Wave-1 gate (gated mode):** user reviewed the three PASS results and the budget tripwire and chose *Continue: T2 + T3 in parallel*. Spec `/reasoning` wording left as-is by user choice (forward pointers carry the `/model` correction into T3 and T7 briefs).

## Pivot Record: T2

| Field | Value |
|---|---|
| Date | 2026-09-16 |
| Trigger | T2 Implementer report (attempt 1, before review): the FR-4 regression script, implemented literally, reports 0 path differences but 3 content differences vs the published 2.23.2 trees — `commands/akili-execute.md`, `commands/akili-test.md` (T4's approved, committed Codex paragraphs) and `commands/akili-constitution.md` (T3, in flight). These are the canonical files FR-5/FR-8/FR-9 edit and every host ships byte-identically |
| Defect class | Spec self-contradiction, not an implementation bug. `requirements.md` §2 ("Nothing installed for Claude Code, OpenCode, or Antigravity changes byte-for-byte") and FR-4 THEN ("per-file SHA-256 … identical for every target") cannot hold once FR-8's approved edits to the shared command files land. The gate as written would fail every CI leg after T3/T4 — permanently |
| Blocker | T2 cannot PASS against FR-4 as written; a literal implementation fails on approved changes |
| Alternatives | (a) Keep literal identity and exclude `commands/` from the diff — drops coverage of the command-as-skills mapping, the one path DD-1 changed for Antigravity. (b) Compare side B against the `v2.23.2` git tag to classify changed sources — needs tag history in CI (`fetch-depth: 0`), adds a git dependency. (c) **Chosen:** layout identity (path lists must match) + content identity except where side B's file is byte-identical to its working-tree source under `.claude/` (`EXPECTED-DIFF`), git-free. An installer mapping bug still surfaces as a path diff or as a content diff on a file that does not equal its source; a source edit made by this spec is classified, not silently passed |
| Revised direction | FR-4 THEN split into layout identity + source-equality tolerance; `requirements.md` §2 and §8 defect row, `design.md` §7 row 24, `tasks.md` T2 scope + FR-4 coverage row amended. `proposal.md` line "`install --tool antigravity` output is byte-identical before and after the registry refactor" left as historical proposal text (superseded here, not edited — proposals are records) |
| ADR impact | None (no TRD in this repo) |
| Correction closure sweep | Forward: `grep -n "byte-for-byte\|SHA-256\|identical\|non-empty diff"` across the spec folder — remaining hits are FR-2 (Codex SKILL.md byte-identical to source — still true, NFR-2), design §5.4 "merge rules identical" (unrelated), proposal (historical). Backward: references *to* FR-4 — tasks T1 Done ("T2 proves it"), tasks T1 Requirements row, design DD-1 "Regression gate: FR-4 tree diff", design §3 — all still true under the amended gate (they name the gate, not the identity clause) |
| Task state | T2 marked `[~]`; its attempt-1 script implements the literal rule and must be adjusted to the amended rule (bounded delta: classify a content diff by comparing side B to its source; print `EXPECTED-DIFF`). No Reviewer spawned yet — no rework attempt consumed |
| Second finding (Leader error, recorded for kaizen) | T2's measurement ran while T3 was editing `.claude/commands/akili-constitution.md`. I paired T2 ∥ T3 on the "disjoint files" test alone; the installer reads the whole `.claude/` tree as *input*, so T3's edits are T2's input — the second independence test (no shared dependency) failed. Not destructive (script reads `.claude/`, writes temp dirs) but the constitution-file diff evidence was a mid-edit snapshot. Authoritative T2 evidence is re-taken after T3 lands, on a quiet tree |
| T2 implementation notes carried forward | Check 2 SKIP repro (`npm_config_registry=http://127.0.0.1:9`) does not reproduce on this machine because `akili-specs@2.23.2` is installed globally and `npx` resolves it offline; SKIP path verified via a PATH-shimmed fake `npx` replaying a captured `ECONNREFUSED` — CI runners are cold, so the literal repro applies there. Implementer narrowed SKIP classification to transport-error signatures after a generic `/registry/i` pattern misclassified a `404` as SKIP; ANSI-stripping fix in the fixture parser |
| User decision | **Approved** (2026-09-16) — "Approve amendment, resume T2". T2 resumes on the amended FR-4: bounded delta to the script (source-equality classification, `EXPECTED-DIFF`), authoritative measurement re-taken by the Leader on a quiet tree after T3 lands, then Reviewer |

