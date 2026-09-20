# Tasks: `AGENTS.md` as the Single Canonical Agent Guide

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/agents-md-canonical` |
| Depth | **Lite** |
| Status | Draft — awaiting the Step 3.3 gate |
| Date | 2026-09-20 |
| Source | `requirements.md` (FR-1..FR-4, NFR-1..4), `design.md` (budget §6: 2 tasks · ~25 lines · 3 review rounds) |
| Baselines | Every count below was **run at `d640b3c` before it was written**. Readings: `both files` = 1 · ``AGENTS.md` **and** `CLAUDE.md`` = 2 · `2.1.277` = 0 in `akili-constitution.md` · `@AGENTS.md` = 0 in root `CLAUDE.md` · identical lines between the two root guides = 27 |
| Commit prefix | `[SPEC:changes/agents-md-canonical]` |
| Review field | Defined by `changes/review-intensity-routing`, shipped 2026-09-19 |

## 2. Task Graph

```
T1 (akili-constitution: 4 mandate sites + the import/floor block)
 └─→ T2 (this repo: CLAUDE.md becomes an @AGENTS.md import)
```

Sequential: T2 applies in this repo the rule T1 ships, so T1 defines the shape T2 follows.

**Scope discipline (both tasks — NFR-1).** Zero hunks in `bin/`, `scripts/`, `package.json`, `.claude/templates/`, every `.claude/commands/` file except `akili-constitution.md`, and every `docs/` mirror. Any hunk there is a FAIL regardless of content.

---

### T1 — `/akili-constitution`: `AGENTS.md` becomes the mandated guide

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Review | `full` — edits an obligation every future project scaffold executes, and **reverts delivered behavior** (overrides a and d) |
| Depends on | none |
| Requirements | FR-1 (all four sites, the inverted checklist, the version floor); FR-2 (import rule, symlink prohibition); NFR-1, NFR-3, NFR-4 |
| Design refs | §4 surfaces 1–5, DD-1, DD-2, DD-3, DD-4 |

**Scope.** Edit `.claude/commands/akili-constitution.md` only:

- `:41` — the "ensure root `CLAUDE.md`" item becomes `AGENTS.md`, naming `CLAUDE.md` as the optional import.
- `:455` (Step 8C) and `:579` (Step 8D) — `## Model Routing` and `## Skill Map` scaffold into `AGENTS.md` **only**.
- `:1146` (Verification Checklist) — invert from *"both files, not one"* to: present in `AGENTS.md`, **and not duplicated** into a `CLAUDE.md` body.
- **One new short block** near Step 7: the `@AGENTS.md` import rule, a prose pointer named as a **defect** with its reason (with both files present Claude reads `CLAUDE.md` only), the symlink prohibition with its two grounds, the **v2.1.277** floor, and the unavailability cases (Bedrock, telemetry disabled, `disableAllHooks`).

**Verification** (repo root, on `.claude/commands/akili-constitution.md`).

| Field | Value |
|---|---|
| Command | **1.** `grep -c "both files"` = **0**. **2.** `grep -c '`AGENTS\.md` \*\*and\*\* `CLAUDE\.md`'` = **0**. **3.** `grep -c "2\.1\.277"` ≥ 1. **4.** `grep -c "@AGENTS\.md"` ≥ 1. **5.** `grep -c -i "symlink"` ≥ 1. **6.** Frozen paths: `git diff --stat d640b3c -- bin scripts package.json .claude/templates` empty, and `git status --porcelain .claude/commands/` lists only `akili-constitution.md` |
| Falsifier | At `d640b3c`: check 1 reads **1** and check 2 reads **2** (both run), so each fails on current text; checks 3 and 4 read **0**. **Executed falsifier required:** on a scratch copy, delete the new block's "prose pointer is a defect" sentence and re-read FR-2's scenario *A project that must keep a `CLAUDE.md`* — the shipped text must stop forbidding the prose stub; observe and discard |
| Red run | `n/a (no test gate)` |
| Disqualifier | Greps count strings. **Read the new block:** if it states the import without stating **why** a prose pointer fails (both files present → `CLAUDE.md` only), a reader will "simplify" it back to prose and silently delete the guide — that is the whole defect this spec exists to prevent. If the inverted checklist item asserts only presence in `AGENTS.md` without the **non-duplication** half, NFR-4 is unmet with every grep green |
| Consumers | `/akili-audit` and `/akili-archive` read the guides **disjunctively** (design P-7) — **holds**, no edit owed. No other command mandates both (P-6) |

**Pre-review sweep.** `grep -n "CLAUDE\.md" .claude/commands/akili-constitution.md` — read every surviving hit and confirm none still requires the file to exist.

**Done.** Four sites amended, the new block lands, verification 1–6 run, the override falsifier executed and its red recorded, disqualifier read.

**Skills:** `cognitive-doc-design`.

---

### T2 — This repository carries one policy body

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S |
| Review | `checklist` — applies T1's rule to two local files; creates no obligation others execute |
| Depends on | T1 |
| Requirements | FR-3; NFR-1, NFR-2, NFR-4 |
| Design refs | §4 surface 6, DD-2, DD-3 |

**Scope.** Root `CLAUDE.md` becomes `@AGENTS.md` on line 1, followed only by content that is genuinely Claude-specific. Every policy section duplicated from `AGENTS.md` — `## CodeGraph` and `## Skill Usage` are the two full overlaps — is removed from `CLAUDE.md`, not from `AGENTS.md`. **`AGENTS.md` is not edited except to absorb anything that existed only in `CLAUDE.md`.**

**Verification** (repo root).

| Field | Value |
|---|---|
| Command | **1.** `head -1 CLAUDE.md` is exactly `@AGENTS.md`. **2.** `comm -12 <(sort CLAUDE.md) <(sort AGENTS.md) \| grep -c .` **< 27** and ideally 0 excluding blanks. **3.** `grep -c "^## CodeGraph\|^## Skill Usage" CLAUDE.md` = **0**. **4.** No content loss: every `^## ` heading previously in `CLAUDE.md` is present in `AGENTS.md` or is deliberately Claude-specific and still in `CLAUDE.md` — list both sets in the report. **5.** `git status --porcelain` lists only `CLAUDE.md` and, if it absorbed content, `AGENTS.md` |
| Falsifier | At `d640b3c`: check 1's first line is `# Claude Guidance`, not the import (run); check 2 reads **27** (run); check 3 reads **2** (run). **Executed falsifier for check 4:** delete one heading from both files on a scratch pair and confirm the check-4 comparison reports the loss — a content-preservation check that cannot detect a deletion is not a check; observe and discard |
| Red run | `n/a (no test gate)` |
| Disqualifier | Check 2 counts lines, not meaning. **Read both files:** if a policy statement was *reworded* into `AGENTS.md` rather than moved, the duplicate-line count drops while two maintained copies remain — NFR-4 is unmet with the grep green. **A dropped rule is the worse failure**: `CLAUDE.md` currently holds the only copy of some guidance, and check 4 is the gate for that, not check 2 |
| Consumers | `none (no shared symbol changed)` — this repo's own guides only |

**Pre-review sweep.** Diff the two files' `^## ` heading sets before and after, and state which headings moved, which stayed, and which were Claude-specific.

**Done.** `CLAUDE.md` opens with the import; no policy section is maintained twice; **no rule is lost** — proved by check 4 with its falsifier executed; verification 1–5 run.

**Skills:** `cognitive-doc-design`.

---

## 3. Coverage — scenario and clause level

| Requirement · scenario or clause (quoted) | Owner |
|---|---|
| FR-1 · four sites · inverted checklist · version floor | T1 |
| FR-1 *A fresh project gets one guide* · "`AND IT MUST NOT` create a second guide holding the same two sections" · "`BUT` … must NOT delete or overwrite a `CLAUDE.md` the project already had" | T1 |
| FR-2 · import rule · prose pointer named a defect · symlink prohibition | T1 |
| FR-2 *A project that must keep a `CLAUDE.md`* · "`AND IT MUST` keep any Claude-specific instructions below that import" · "`BUT` … must NOT write a second copy" | T1; falsifier executed in T1 |
| FR-3 *The governance document is loaded again* · "`AND IT MUST NOT` leave two maintained copies" · "`BUT` … must NOT delete `CLAUDE.md` outright" | T2 |
| FR-4 · no installer change | both tasks' frozen-path check (T1 check 6) |
| NFR-1 | T1 check 6; T2 check 5 |
| NFR-2 | T2 check 1 (import, not deletion) |
| NFR-3 | scope discipline §2 — `implementer.md` / `tester.md` untouched |
| NFR-4 | T1 check on the inverted checklist; T2 checks 2–3 |

No requirement is cleared by citing a different one.

## 4. Estimate and PR strategy

| Task | Shipped lines (est.) |
|---|---|
| T1 | ~18 |
| T2 | ~7 net |
| **Total** | **~25** |

**PR strategy: single.** Far under ~400 lines, prose only, two files. **But note the repository's branch protection** — `master` requires a pull request with one approving review, and the last direct push bypassed it via admin. This spec is small enough to be the run that goes back through a PR.

**One accepted gap, carried from `requirements.md` §6:** no command in this repository can assert that Claude Code *actually loads* `AGENTS.md` — that is a property of the host. The substitute is a human check at the HITL pause: run `/context` in a fresh session after T2 and confirm the guide appears under **Memory files**.
