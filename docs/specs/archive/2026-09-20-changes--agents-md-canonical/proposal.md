# Proposal: `AGENTS.md` as the Single Canonical Agent Guide

**Recommendation:** make `AGENTS.md` the one agent/harness guide a project carries, and stop mandating a parallel `CLAUDE.md` with mirrored content. Claude Code now reads `AGENTS.md` directly, so the reason the mirror existed — two tools reading two different filenames — is gone.

**But the mirror cannot simply be deleted, and the obvious compatibility move is wrong.** Claude Code reads `AGENTS.md` **only when no `CLAUDE.md` exists** in the working directory or above it. When both exist it reads **`CLAUDE.md` only** and ignores `AGENTS.md` entirely. So a `CLAUDE.md` "stub that points to `AGENTS.md`" in prose does not degrade gracefully — it **replaces** the guide with the stub. The supported form is an `@AGENTS.md` **import**, which is a different thing.

**This repository is already paying for that rule.** Root `AGENTS.md` is **14,934 B** and root `CLAUDE.md` is **4,812 B**; because both exist, Claude Code loads only the smaller one. Release Rules, Skill Governance, the Multi-Agent Harness contract and the Concurrency protocol all live in `AGENTS.md` and are **not auto-loaded in a Claude Code session today**. Confirmed from this session's own startup context, which injected `CLAUDE.md` and not `AGENTS.md`.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/agents-md-canonical` |
| Type | **Change** |
| Status | **Draft — decision recorded, awaiting `/akili-specify`.** Written as a record + touchpoint map at the user's request, not as an approved plan |
| Date | 2026-09-20 |
| Approval Mode | `gated` (no up-front end-to-end mandate given) |
| Origin | User decision, 2026-09-20: *"Claude Code ya soporta AGENTS.md… Ahora con un solo archivo es suficiente: AGENTS.md como fuente canónica para ambos."* |
| Depends on | none |
| Parallel-safe | **No — collides with `changes/scoped-constitution-reads`.** See §6 |

## 2. Premise Ledger

Every row verified against the vendor documentation at `https://code.claude.com/docs/en/memory.md` or against this working tree, on 2026-09-20. Quotes are verbatim.

| # | Claim | Class | Citation (as run / as quoted) | If false |
|---|---|---|---|---|
| A-1 | Claude Code reads `AGENTS.md` as project instructions, with no import and no setting | `data-env` | *"Claude Code can read `AGENTS.md` as your project instructions, so a repository already set up for other coding agents works without adding a `CLAUDE.md`, an import, or a setting."* | The whole proposal collapses — **High** |
| A-2 | **It does so only when no `CLAUDE.md` exists at or above the working directory. With both present, Claude reads `CLAUDE.md` only.** | `data-env` | Docs table: *"An `AGENTS.md` and a `CLAUDE.md` or `CLAUDE.local.md` in your working directory or above it → Your `CLAUDE.md` files only"* | A prose stub would be safe; it is not — **High** |
| A-3 | The supported compatibility form is an `@AGENTS.md` **import**, not a prose pointer | `data-env` | *"you can still keep it as the one file every tool shares by putting an `@AGENTS.md` import in a `CLAUDE.md` next to it"* | Implication 4 as originally framed would work — **High** |
| A-4 | A symlink also works, but is **ruled out for this repository** | `data-env` | *"the Edit and Write tools refuse to write through a symlink"*; *"Windows: … use the `@AGENTS.md` import instead"* — and this repo ships a cross-platform CI matrix incl. `win32` | A symlink would be the cheapest option — Low |
| A-5 | Support needs **v2.1.277+**, and is unavailable on Bedrock / telemetry-disabled / `disableAllHooks` sessions | `data-env` | Docs note, plus *"When `AGENTS.md` support is unavailable"* | Consuming projects on those paths silently lose their guide — **High** |
| A-6 | The local toolchain satisfies A-5 | `data-env` | `claude --version` → `2.1.278 (Claude Code)` | — |
| A-7 | This repo's `AGENTS.md` is currently **not loaded** by Claude Code | `existence` | Both root files exist (14,934 B / 4,812 B); this session's startup injected `CLAUDE.md` only | The "already paying for it" framing is wrong — **High** |
| A-8 | The duplication is **mandated**, not accidental | `existence` | `akili-constitution.md:455`, `:579` — *"in the project's root `AGENTS.md` **and** `CLAUDE.md`"*; checklist `:1146` — *"both files, not one. The registry is mirrored into the project guides on purpose"* | It would be a cleanup, not a methodology change — **High** |
| A-9 | Concrete drift surface in this repo: **27 identical lines**, two fully shared headings (`## CodeGraph`, `## Skill Usage`) | `data-env` | `comm -12 <(sort CLAUDE.md) <(sort AGENTS.md)` → 27 | The drift risk is theoretical — Low |
| A-10 | **The installer does not write, read, or reference either file** | `existence` | `grep -n "CLAUDE\.md\|AGENTS\.md" bin/akili.js` → no matches | Installer work would be in scope — Low |

**A-10 corrects the original framing:** implication 3 named "instaladores", but `bin/akili.js` never touches these files. There is no installer work in this change.

## 3. Problem / Current Behavior

`/akili-constitution` mandates the mirror in four places, with a stated rationale:

- `:41` — *"Ensure root `CLAUDE.md` exists or is enhanced."*
- `:455` (Step 8C) and `:579` (Step 8D) — the `## Model Routing` and `## Skill Map` sections go in *"the project's root `AGENTS.md` **and** `CLAUDE.md`"*.
- `:1146` (Verification Checklist) — *"both files, not one. The registry is mirrored into the project guides on purpose"*.

**The rationale was sound and is now obsolete.** The mirror existed because two supported hosts read two different filenames. One file now serves both — **conditional on the other file being absent** (A-2). That condition is what turns this from a deletion into a design.

## 4. Proposed Change

| # | Decision |
|---|---|
| D-1 | **`AGENTS.md` is the canonical agent guide.** Every AKILI command, template and doc points at it as the project's agent/harness document |
| D-2 | **`/akili-constitution` stops creating or requiring a parallel `CLAUDE.md`.** Steps 8C and 8D scaffold `## Model Routing` and `## Skill Map` into `AGENTS.md` only; the Verification Checklist item inverts from *"both files, not one"* to *"`AGENTS.md`, and no duplicate `CLAUDE.md` section"* |
| D-3 | **Compatibility is an `@AGENTS.md` import, never a prose stub.** Where a project must keep a `CLAUDE.md` — a pre-v2.1.277 toolchain, Bedrock, telemetry-disabled, `disableAllHooks`, or genuinely Claude-only instructions — it is a one-line `@AGENTS.md` import with any Claude-specific content **below** the import. A prose "see AGENTS.md" pointer is explicitly named as a defect, because A-2 makes it silently replace the guide |
| D-4 | **Symlinks are not offered.** A-4: Edit/Write refuse to write through them, and this repo supports Windows, where a committed symlink checks out as a one-line text file |
| D-5 | **Migration for existing projects is additive and reversible.** `/akili-constitution` in Active mode detects a duplicated pair, offers to consolidate into `AGENTS.md`, and leaves the `CLAUDE.md` as an `@AGENTS.md` import rather than deleting it |
| D-6 | **This repository dogfoods it**: root `CLAUDE.md` becomes `@AGENTS.md` plus whatever is genuinely Claude-specific, and the 27 duplicated lines collapse to one home |

## 5. Touchpoint Map — where to change, by tier

Counts are `grep -c "CLAUDE\.md"` per file, run 2026-09-20.

**Tier 1 — the mandate itself (must change):**

| File | Hits | What changes |
|---|---|---|
| `.claude/commands/akili-constitution.md` | 13 | Steps 7/8C/8D, the baseline-read order, the child-guide rule, the Verification Checklist |
| `.claude/commands/akili-execute.md` | 6 | Step 0 constitution read order; brief-composition convention lookup |
| `.claude/commands/akili-specify.md` · `akili-validate.md` · `akili-audit.md` · `akili-archive.md` | 5 each | Baseline read order; `/akili-audit` also gains a **duplicated-guide drift check** |
| `.claude/commands/akili-test.md` · `akili-quick.md` · `akili-propose.md` · `akili-seo.md` · `akili-resume.md` | 2–4 each | Read-order references |

**Tier 2 — personas and skills:**

| File | Hits | Note |
|---|---|---|
| `.claude/templates/leader.md` · `reviewer.md` | 2 / 1 | Read-order and registry pointers |
| `.claude/templates/implementer.md` · `tester.md` | 2 each | ⚠️ **owned by `changes/scoped-constitution-reads`** — see §6 |
| `.claude/skills/kaizen/SKILL.md` | 2 | Shared-file discipline references |

**Tier 3 — docs and mirrors:** `docs/model-routing.md` (5), `docs/flow.md` (4), `README.md` (4), `docs/commands/*.md` mirrors, `docs/skills/governance.md` (1).

**Tier 4 — this repo's own guides:** root `AGENTS.md` (2) and `CLAUDE.md` (D-6).

**Explicitly NOT touched — historical records:** everything under `docs/specs/archive/**`, `docs/specs/kaizen/**`, other specs' working documents, and `docs/plans/**`. They record what was true when written; rewriting them would falsify the audit trail. Same rule applied to `proposal.md` and `judgment.md` during `changes/review-intensity-routing`.

## 6. Scope Collisions — this is not parallel-safe

| Spec | Collision |
|---|---|
| **`changes/scoped-constitution-reads`** (proposal, unstarted) | It owns `.claude/templates/implementer.md` and `tester.md`, and specifically the sentence enumerating *"`CLAUDE.md`, `AGENTS.md`, `docs/trd/trd.md`, `docs/ux-ui/design.md`"* — the exact line this change would edit. **Serialize.** Cheapest order: let it land first (it rewrites that sentence anyway), then this change updates whatever it leaves |
| **`changes/review-intensity-routing`** (complete, 9/9) | Froze those same two templates under NFR-1/NFR-7. No longer binding now that it is closed, but its `execution.md` documents why they were frozen |
| **`CHANGELOG.md` `Unreleased`** | Already holds the review-intensity entry plus the `#41` fix. A third entry merges serially |

## 7. Non-Goals

- **No installer change** (A-10).
- **No change to `.claude/` as the packaged source layout**, which is a different concept from a project's agent guide.
- **No forced deletion of any consuming project's `CLAUDE.md`** — D-5 keeps migration additive.
- **No change to `~/.claude/CLAUDE.md`** (user-level), which loads alongside `AGENTS.md` regardless and is outside a project's control.

## 8. Risks

| Risk | Handling |
|---|---|
| A consuming project on a pre-v2.1.277 toolchain, Bedrock, or `disableAllHooks` silently loses its guide | D-3's `@AGENTS.md` import is the documented fallback; `/akili-constitution` should state the version floor rather than assume it |
| A developer's own uncommitted `CLAUDE.local.md` silently disables `AGENTS.md` reading for that person only | Worth a named warning — this is invisible and per-developer. Docs: *"adding one … stops Claude from reading `AGENTS.md` for you"* |
| Consolidation loses Claude-specific content | D-3 keeps it, below the import |

## 9. Open Questions for the User

1. **Order vs. `scoped-constitution-reads`** — land that first (recommended), or fold its two template edits into this change?
2. **How hard is the version floor?** State v2.1.277+ as a requirement, or keep the `@AGENTS.md` import as the permanent default so no consuming project can lose its guide?
3. **Depth** — `Lite` (this repo + `/akili-constitution` only) or `Standard` (the full four-tier sweep in §5)?

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
