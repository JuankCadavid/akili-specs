# Proposal: Model Routing Configurator (`akili routing`)

> **Answer first.** Add an interactive, re-runnable CLI wizard — `akili routing` — that asks which host(s) the user works in, which models they actually have on each, derives the six-tier mapping from that roster (author ≠ auditor guaranteed), and writes both the `## Model Routing` section in `AGENTS.md` and the Step 8E agent wrappers for the selected hosts. `/akili-constitution` Step 8C/8E delegate to it and keep an inline fallback with the same questions in the same order. Minor release.

## Document Control

| Field | Value |
|---|---|
| Spec path | `changes/model-routing-configurator` |
| Slug | `model-routing-configurator` — given directly as the first argument; the trailing free text became proposal context |
| Type | **Change** (feature) |
| Approval Mode | `gated` |
| Status | **Approved** 2026-10-01 (user) — open questions resolved by the agent at the user's request, see *Resolved Decisions* |
| Date | 2026-10-01 |
| Depends on | none — `changes/cursor-install-target` (the five-host registry this consumes) archived 2026-10-01 |
| Parallel-safe | **no** — edits `bin/akili.js`, `/akili-constitution` Step 8, `docs/model-routing.md`; sequence after/before the queued pin-parser bug (`readConstitutionPins`, also in `bin/akili.js`) |
| Release class | **minor** — new CLI subcommand + new constitution behavior (see `versioning-semver-discipline`) |
| Visual reference | None (CLI/TUI surface) — ASCII flow in *Visual Reference* below |

## Intent

Make model routing **configurable by the user in minutes, not by the agent in guesses**: one wizard, host first, then models (multi-select), then a proposed tier table the user accepts or adjusts — producing a registry with **zero `<CONFIRM SLUG>` placeholders for the hosts the user actually uses** and the enforced wrappers to match.

## Problem / Current Behavior

| # | Today | Evidence |
|---|---|---|
| 1 | The packaged default registry ships **10 placeholder cells out of 30** (OpenCode 1, Antigravity 1, Codex 2, Cursor 6) — every non-Claude column needs the user's own roster before it is usable | `awk '/T1 Architect/,/T6 Multimodal/' docs/model-routing.md \| grep -o "<CONFIRM[^>]*>"` → `8 <CONFIRM SLUG>`, `1 <CONFIRM ID>`, `1 <CONFIRM>` (run 2026-10-01) |
| 2 | Step 8C tells the agent to *"Confirm the user's available models before writing concrete identifiers … Ask about both even when the user is clearly working in only one"* — an **unstructured** interview; there is no question order, no multi-select, no derived mapping, so in practice the agent emits the default table with placeholders | `.claude/commands/akili-constitution.md:606-608`; Step 8C spans `:465-617` (153 lines of guidance for one section) |
| 3 | Step 8E hand-writes **four wrappers per host** from prose templates, with host-specific fields (`tools`, `sandbox_mode`, `readonly`, `subagent`, `mainAgent`) the agent must get right each time; a wrong Antigravity tool name *hangs* the subagent | `.claude/commands/akili-constitution.md:663-930`; hang warning at the Antigravity bullet |
| 4 | Re-configuring models after the fact (new plan, new generation, a teammate on another host) has **no entry point**: the only paths are re-running `/akili-constitution` or editing the table and five wrapper sets by hand | `grep -n "routing" bin/akili.js` → no match (run 2026-10-01); `printHelp()` lists `install, update, doctor, list, check-update, notifications, help` (`bin/akili.js:199-253`) |
| 5 | The CLI already has the ingredients: a dependency-free `readline/promises` wizard with a 1–7 host menu (`runInteractiveInit`, `bin/akili.js:1993-2066`), a fenced-section grammar `<!-- akili:section id=… since=… -->` with parse/replace helpers (`bin/persona.js:10-11`, `parsePersona :175`, `applyFix :410`), and a `node:test` suite (`test/*.test.js`, 94 tests at v2.31.0) | cited paths, read 2026-10-01 |
| 6 | Root `AGENTS.md:37` states *"never inject models in the installer"* — written against force-injecting `model:` into **command** frontmatter; a user-driven wizard that writes per-host **agent wrappers** is outside that rationale but inside its literal wording | `AGENTS.md:37`, read 2026-10-01 |

## Proposed Outcome

After this change a user can run:

```
$ akili routing
```

and in roughly **2 questions per host + 1 confirmation** obtain:

1. `AGENTS.md` → a `## Model Routing` section inside an AKILI-owned fence, **all five host columns** present (selected hosts filled from the user's roster; unselected hosts keep packaged defaults / `<CONFIRM SLUG>` — the emit-every-host rule), author ≠ auditor note, effort dial, cross-host dispatch line, `Updated:` stamp.
2. Step 8E wrappers for **each selected host only**, model-bound per tier, Reviewer carrying the host's read-only restriction where the syntax is confirmed (Claude Code `tools`, Codex `sandbox_mode`, Cursor `readonly`), **omitted and reported** where it is not (OpenCode; Antigravity `tools` unless the user confirms tool names).
3. `.agents/model-routing.json` — the wizard's **answers file** (hosts, rosters, accepted mapping, stamp) so re-runs pre-fill every prompt (`current: opus — keep? [Y/n]`) and `--dry-run` / `--yes` work without re-asking.

`/akili-constitution` Step 8C/8E become: *run `akili routing` (or follow the inline protocol — same questions, same order — when the CLI is unavailable), then read `.agents/model-routing.json` for the Step 9 summary.*

## Scope

| Area | In scope |
|---|---|
| `bin/akili.js` | New `routing` subcommand: host multi-select → per-host model multi-select (known roster as checkboxes + *other: type id*) → derived tier table → accept / adjust one tier → write. Flags: `--project <path>` (default cwd), `--dry-run`, `--yes` (accept derived mapping), `--force` (overwrite existing wrappers; default skips, per installer safety rule), and the **non-interactive form** `--hosts claude,cursor --models claude=opus,sonnet,haiku --models cursor=<id>,<id>` — **in v1**, because it is the path `/akili-constitution` actually uses (an agent session cannot drive a TTY wizard; it asks the same questions in chat, then runs the command with flags). Mixed input is allowed: flags pre-answer, the wizard asks only what is missing |
| `bin/routing.js` (new) | Pure functions, mirroring `bin/persona.js`: `deriveTiers(hostRoster, registryDefaults)`, `renderRegistrySection(answers)`, `renderWrappers(host, answers)`, `readAnswers` / `writeAnswers`, section replace reusing the `akili:section` fence grammar. All unit-tested |
| `.claude/templates/model-registry.json` (new) | Packaged **roster defaults** per host: known model ids, capability rank, cost rank, flags (`vision`, `longContext`, `alias`), tier defaults, `lastVerified`. Shipped (already under `files` → `.claude/templates`). A `node:test` drift check asserts it agrees with the table in `docs/model-routing.md` |
| Mapping rules | T1 = strongest selected; T2 = mid/volume model; T3 = strongest **≠ T2** (if the roster has one model → warn, offer cross-host or a second model, never silently collapse); T4 = `longContext` flag else T2; T5 = cheapest; T6 = `vision` flag else *cross-host dispatch* note. Unknown *other* ids → one placement question |
| `AGENTS.md` writing | Fenced `<!-- akili:section id=model-routing since=<version> -->`; an existing **unfenced** `## Model Routing` (older constitution) → show diff, offer *adopt (wrap & replace)* / *skip*; never touch anything outside the fence |
| `/akili-constitution` | Step 8C → delegate + inline fallback protocol (shrinks the prose); Step 8E → *generated by `akili routing`; manual template retained as the fallback*; Step 9 reads the answers file |
| `/akili-audit` | Model Registry Drift gains: wrappers vs `.agents/model-routing.json` vs registry section disagree |
| Docs | `docs/cli.md` (new *Routing* section), `docs/model-routing.md` → *How to apply per tool* names the command, `README.md`, `AGENTS.md:37` carve-out (*"never inject models in the installer — `akili routing` writes them only at the user's request, into agent wrappers, never into commands"*), `CHANGELOG.md` Unreleased (minor) |
| Tests | `test/routing.test.js` (mapping incl. author ≠ auditor, single-model roster, unknown id, idempotent re-run → no diff), `test/routing-io.test.js` (fence adopt/replace, skip-existing wrappers, `--dry-run` writes nothing) |

## Non-Goals

- No `model:` key in **command** frontmatter; no installer (`install`/`update`) change — `routing` is a separate, explicit subcommand.
- No new runtime dependency (no `inquirer`); multi-select is numbered input `1,3,5` over `readline`, like `akili init`.
- `.agents/model-routing.json` is an **answers file**, not the canonical registry (that is Approach C, deferred); commands and model checkpoints keep reading the Markdown section.
- No `akili doctor --routing` drift command (follow-up; `/akili-audit` covers it for now).
- No live roster probing (`agy models`, Cursor `/model`) — binaries vary per machine; the known list + free text is the contract (same reasoning as Step 8C's "ask, don't probe").
- No change to persona bodies in `.agents/<role>.md`.

## Affected Users, Systems, And Specs

| Who / what | Effect |
|---|---|
| Users on any of the five hosts | One command to configure routing; re-runnable when plans or generations change |
| `/akili-constitution` Step 8C/8E/9 | Delegation + fallback; Step 8C prose shrinks |
| `/akili-execute`, `/akili-test` | Unchanged wiring (`akili-execute.md:58-61` already prefers named wrappers) — they just find wrappers more often |
| `/akili-audit` | One more drift signal |
| `bin/akili.js`, new `bin/routing.js`, `test/` | Code + tests |
| Queued `bugfix` pin-parser (`readConstitutionPins`) | Same file (`bin/akili.js`) → sequence, not parallel |
| Active Lessons | **KZ-002** (aggregate claims — run the grep before claiming "all wrappers/columns"): the drift test is the standing falsifier. **KZ-004** (new artifact type → name the terminal branch): the fence-adopt path must enumerate *fenced / unfenced / absent* explicitly. **KZ-changes--gate-falsifiability-2**: Step 8C delegation text must preserve every obligation of the current step (emit-every-host, CLI-invocation row, cross-host line, effort dial) — the sweep is term by term |

## Visual Reference

- Source: **None** — CLI surface; ASCII flow below is the design intent.
- Location: this proposal.
- Notes: a TUI wizard; no Figma/mockup needed.

```
$ akili routing

Which hosts do you use? (numbers, comma-separated — e.g. 1,5)
  1) Claude Code   2) OpenCode   3) Antigravity   4) Codex   5) Cursor
> 1,5

Claude Code — which models can you select? (1,2,3)
  1) opus (alias)   2) sonnet (alias)   3) haiku (alias)   4) other (type id)
> 1,2,3

Cursor — which models does /model show you? (last verified 2026-10-01)
  1) claude-opus-…  2) composer-…  3) gpt-5.6-terra  4) gemini-3.8-flash  5) other
> 1,2,3

Derived routing (author ≠ auditor: OK on both hosts)
  Tier              Claude Code   Cursor
  T1 Architect      opus          claude-opus-…
  T2 Coder          sonnet        composer-…
  T3 Auditor (≠T2)  opus          gpt-5.6-terra
  T4 Context        sonnet        claude-opus-… (no 1M model selected)
  T5 Fast-Cheap     haiku         composer-…
  T6 Multimodal     sonnet        → cross-host: Antigravity (not selected) — mark <CONFIRM>
[A]ccept  [t] adjust a tier  [q] quit
> A

✔ AGENTS.md                 ## Model Routing (fenced, 5 columns, Updated: 2026-10)
✔ .claude/agents/           akili-leader, -implementer, -reviewer (tools: Read, Grep, Glob), -tester
✔ .cursor/agents/           akili-leader, -implementer, -reviewer (readonly: true), -tester
✔ .agents/model-routing.json
ℹ OpenCode / Antigravity / Codex columns kept with packaged defaults (<CONFIRM SLUG>) — re-run to fill.
```

## Requirement Delta Preview

### ADDED Requirements

- `akili routing` subcommand (interactive and non-interactive; `--project`, `--dry-run`, `--yes`, `--force`, `--hosts`, `--models`).
- Per-host model multi-select with packaged roster + free-text *other*.
- Deterministic tier derivation with author ≠ auditor enforced (T3 ≠ T2) and an explicit single-model warning.
- Fenced `## Model Routing` section writer with adopt/replace/skip branches.
- Wrapper generation for selected hosts, Reviewer-only restriction per host rules, skip-existing unless `--force`.
- `.agents/model-routing.json` answers file; idempotent re-run.
- Packaged `model-registry.json` + drift test against `docs/model-routing.md`.

### MODIFIED Requirements

- `/akili-constitution` Step 8C: from "ask the user" prose to **delegate to `akili routing` with an inline fallback protocol** (host → roster → derived table → confirm) — every existing obligation preserved.
- `/akili-constitution` Step 8E: wrappers are generated; the manual templates remain the documented fallback.
- `/akili-constitution` Step 9 summary: reads the answers file when present.
- `/akili-audit` Model Registry Drift: adds wrapper ↔ answers ↔ section disagreement.
- `AGENTS.md:37` installer rule: carve-out wording for `akili routing`.
- `docs/cli.md`, `docs/model-routing.md`, `README.md`: document the command.

### REMOVED Requirements

- None. The guidance-only path (no wrappers) still works when the user declines.

## Approach Options

| Option | Shape | Pros | Cons |
|---|---|---|---|
| **A — Prompt-only interview** | Structured protocol inside Step 8C; no CLI code | Smallest diff; tool-agnostic text | Quality varies by model/host (AskUserQuestion exists only in Claude Code); not re-runnable standalone; wrappers still hand-written |
| **B — CLI wizard + answers file + constitution delegates** *(recommended)* | `akili routing` in `bin/akili.js` + pure `bin/routing.js`; writes fenced section + wrappers; constitution delegates with inline fallback | Deterministic, testable, dependency-free, re-runnable; reuses `akili init` and `persona.js` machinery; Markdown stays the registry readers already consume | New code surface (~400–600 LOC + tests); roster defaults can go stale (mitigated by free text + release-time drift test) |
| **C — JSON as canonical registry** | B plus: JSON is the source of truth, section/wrappers are renders, `doctor --routing`, commands read JSON | Strongest consistency | Largest scope; changes what every command's model checkpoint reads; migration of the packaged default table to data — a second spec |

## Recommended Approach

**Option B.** It is the smallest path that satisfies all three user-chosen decisions (CLI location, roster-first multi-select, registry + wrappers output) and it is forward-compatible with C: the answers file is already the data C would promote to canonical. The constitution keeps working without the CLI (inline fallback), so no host loses the flow.

## Risks, Dependencies, And Open Questions

| Risk / question | Handling |
|---|---|
| Packaged roster goes stale between releases | Always offer *other (type id)*; stamp `lastVerified` per host in the JSON; drift test ties it to `docs/model-routing.md`; release checklist already refreshes the registry |
| Single-model roster makes author ≠ auditor impossible | Warn loudly, offer: add a model / mark T3 cross-host / proceed with the collapse **recorded** in the section (never silent) |
| Antigravity `tools` name hang | Default **omit**; only write `tools` when the user confirms names from the installed binary (ask once) — same as Step 8E rule 2 |
| Existing unfenced `## Model Routing` or existing wrappers | Adopt-with-diff / skip; wrappers skip unless `--force` (installer rule) |
| `AGENTS.md:37` literal wording vs this command | Amend the sentence in the same spec (listed in Scope) — the rationale (no command frontmatter, no force-injection) is preserved |
| OpenCode wrapper location varies by version | Ask once (`.opencode/agent/*.md` vs `opencode.json` block); default to `.opencode/agent/` |

## Resolved Decisions

The three questions left open in the draft, decided for the end user's benefit (the user delegated the call, 2026-10-01):

| Question | Decision | Why |
|---|---|---|
| Non-interactive flags in v1? | **Yes — in v1.** `--hosts`, `--models <host>=<id,…>`, `--yes`; flags pre-answer and the wizard asks only what is missing | Without them `/akili-constitution` would have to send the user out to a terminal mid-flow; with them the agent asks in chat and runs one command. This is the difference between "delegates" and "interrupts" |
| Answers file location | **`.agents/model-routing.json`** | Fourth tenant of a directory AKILI already owns; collision-free (Codex did not surface `.agents/*.md` as skills, observed 2026-09-17); no new top-level directory for the user to learn |
| `akili doctor --routing` now? | **Follow-up.** `/akili-audit` reports the drift in v1; `doctor --routing` (answers ↔ section ↔ wrappers, with `--fix` re-render) is proposed separately once real re-run patterns are observed | Keeps v1 bounded; the data the check needs (the answers file) ships now, so the follow-up is additive |

## Success Criteria

| Criterion | Measure |
|---|---|
| Two-host setup completes fast | ≤ 6 prompts for 2 hosts (hosts + 2 rosters + confirm, ± adjust), measured on a scratch project |
| Constitution never leaves the session | Step 8C's delegation runs `akili routing --hosts … --models … --yes` from the agent with zero TTY prompts, verified on a scratch project |
| No placeholders for chosen hosts | `grep -c "<CONFIRM" AGENTS.md` = 0 in selected columns; unselected columns still present (5 columns always) |
| Enforcement shipped | Wrapper files exist for every selected host; Reviewer model ≠ Implementer model; Reviewer carries the host's restriction or the summary says it was omitted |
| Idempotent | Second run with `--yes` on unchanged answers → `git diff --stat` empty |
| Safe | `--dry-run` writes nothing; existing wrappers untouched without `--force` |
| Tested | `npm test` green with new suites; drift test fails when `model-registry.json` and `docs/model-routing.md` disagree |
| Constitution smaller, not weaker | Step 8C term-by-term obligation sweep passes; line count drops |

## Next Step

```text
/akili-specify changes/model-routing-configurator
```

Standard depth (Change track, minor release).
