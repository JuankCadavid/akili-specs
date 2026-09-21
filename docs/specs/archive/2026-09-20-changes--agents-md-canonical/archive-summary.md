# Archive Summary — `changes/agents-md-canonical`

**Outcome:** `AGENTS.md` is now the single canonical agent guide. `/akili-constitution` no longer mandates a parallel `CLAUDE.md`, and this repository's own `CLAUDE.md` is an eleven-byte `@AGENTS.md` import.

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `docs/specs/changes/agents-md-canonical` |
| Archive Date | 2026-09-20 |
| Depth | Lite |
| Final Status | **Complete — 2 of 2 tasks `[x]`**, both closed on an independent Reviewer `PASS` |
| Approval Mode | `gated`; the user pre-authorised the full execute run |
| Commits | `775dd53` (specify) · `709cc4b` (T1) · `5824c1c` (T2) |

## 2. Requirements Delivered

| ID | Delivered |
|---|---|
| FR-1 | `/akili-constitution` scaffolds `## Model Routing` and `## Skill Map` into `AGENTS.md` only; seven mandate sites amended; the version floor stated |
| FR-2 | Compatibility is an `@AGENTS.md` import; a prose pointer is named a **defect with its mechanism**; symlinks prohibited on both grounds |
| FR-3 | This repo's `CLAUDE.md` is the bare import; no policy section is maintained twice |
| FR-4 | No installer change — `bin/akili.js` untouched, as `grep` established before the spec was written |
| NFR-1..4 | Bounded, non-destructive, serialized by exclusion, no duplicated policy body |

## 3. Files Changed

| File | Change |
|---|---|
| `.claude/commands/akili-constitution.md` | 31 insertions / 15 deletions — seven mandate sites plus the canonical-guide block |
| `CLAUDE.md` | 76 lines → **1** (`@AGENTS.md`) |
| `AGENTS.md` | +5 lines absorbed: the `tdd` binding, the `scripts/` general claim, the release-checklist imperative, the README pointer |

## 4. Test & Validation Evidence

**`/akili-test` and `/akili-validate` were not run, and the absence is accepted.** Every task's `Red run` field reads `n/a (no test gate)`: the spec changes prose in command files, and the repository has no test that exercises `/akili-constitution`'s text. The gates that did run are recorded in `execution.md` — nine greps with executed baselines on T1, six on T2, each with a falsifier demonstrated red, plus `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` green at close.

**One accepted gap, carried from `requirements.md` §6:** no command in this repository can assert that Claude Code *actually loads* `AGENTS.md` — that is a property of the host. The substitute is a human check: run `/context` in a fresh session and confirm the guide appears under **Memory files**. **Still outstanding.**

## 5. Historical Notes — why this cost five review rounds against three

The spec was scoped from a `grep` that found three mandate sites. The file held **six**, and three of them were unreachable by the search that found the first three.

| Miss | Found by | Invisible to |
|---|---|---|
| `:346` Step 8 | reading all 18 `CLAUDE.md` hits | the four briefed sites |
| `:1128` *"both root guides"* | an obligation-keyed sweep | every `CLAUDE.md` grep — it never names the file |
| the `tdd` bullet | a bullet-level inventory | heading-set comparison — `## Skill Usage` survives in both files |

Each was found only by changing **what the search was keyed on**. The `tdd` case is the sharpest: it was the repository's only copy of that rule, it briefly existed nowhere, and **two independent reads called the set clean** because both compared headings.

## 6. Accepted Warnings & Follow-Ups

| # | Item | Status |
|---|---|---|
| 1 | `akili-constitution.md:387` — *"The root guides must carry a `## Module Guides` index"*. A live **NFR-4 exposure in the letter**; Step 8's prohibition at `:354` does not reach it. Left because `## Module Guides` is outside FR-1 and fixing it needs a design decision the spec never made | **Open — user decision** |
| 2 | `akili-constitution.md:476` — *"Mirror its content into the project guides"*, the last collective-plural residue. Bounded by the prohibition three lines above | **Open — one word if #1 is picked up** |
| 3 | T2's check 4 is **mis-specified in `tasks.md`** — heading-set comparison cannot see a bullet lost under a surviving heading | **Open — recorded** |
| 4 | The `/akili-execute` text governing the run was the session-start copy, not the version the preceding spec shipped to disk | **Open — verify on a fresh session** |
| 5 | `/context` human check that `AGENTS.md` loads | **✅ Confirmed 2026-09-21.** A fresh session's `/context` reports under **Memory files**: `CLAUDE.md: 14 tokens` (the `@AGENTS.md` import line, 11 bytes) and **`AGENTS.md: 5.5k tokens`** — the guide loads through the import. Before this spec, `AGENTS.md` was not loaded at all. The accepted risk is closed by observation, not by assertion |
