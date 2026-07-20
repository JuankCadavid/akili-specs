---
name: kaizen
description: "Trigger: kaizen, retrospective, continuous improvement, mejora continua, /akili-archive Kaizen step. Run the bounded Kaizen retrospective: Measure → Learn → Standardize → Record."
license: MIT
metadata:
  author: Juan Carlos Cadavid — jcadavid.com
  version: "1.0"
  inspired-by: "Kaizen Institute glossary (kaizen.com), 'El Método Kaizen' (small-steps approach, Robert Maurer), 'Emprendiendo Kaizen' (INTI, 2019, ISBN 978-950-532-415-6)"
---

# Kaizen — The AKILI Continuous-Improvement Skill

Kaizen (改善, *kai* = change, *zen* = better) is the Japanese philosophy of continuous improvement through small, disciplined, daily steps. This skill turns that philosophy into an executable retrospective for AI-assisted development: every archived spec must leave the project — and the methodology itself — slightly better than it found them.

> Other methodologies execute specs. AKILI learns from every spec.

## Activation Contract

Load this skill when:

- `/akili-archive` reaches its **Kaizen Retrospective** step (the primary, automatic trigger), or
- the user explicitly requests a kaizen retrospective / continuous-improvement pass over a spec or project.

The retrospective is **bounded**: one pass, at most 3 lessons, one log entry. It must never block the archive or any other command that invoked it.

## Philosophy → Engineering Mapping

Each Kaizen concept maps to a concrete AKILI mechanism. Use this vocabulary in reports so the improvement culture stays visible.

| Concept | Meaning | In AKILI |
|---|---|---|
| **Kai + Zen** | Small changes that make things better, every day, forever | Every `/akili-archive` is an improvement opportunity; the loop never "finishes" |
| **Small steps** (Maurer) | Improvements so small they cannot fail or trigger resistance | Standardization edits are 1–3 lines; never rewrite a document to institutionalize a lesson |
| **Small questions** (Maurer) | Gentle questions unlock root causes better than big alarming ones | Learn step asks: *"What is the smallest rule that would have prevented this rework?"* |
| **PDCA** (Deming) | Plan → Do → Check → Act | Plan = the spec; Do = execute/test; Check = validate + **Measure**; Act = **Standardize**. The retrospective closes the cycle the pipeline opened |
| **MUDA** | Waste: any activity that adds no value | Rework attempts (defects), pivots (planning waste), token waste (oversized context, re-reading), stale docs (drift = inventory waste), quick-escalations (misrouted work). **Measure = hunt MUDA** |
| **Jidoka** | Stop the line the moment a defect appears | AKILI already practices it: the Tester keeps a test red on `PRODUCT_BUG`; the harness HALTs on `FATAL_FAIL`. Name it in reports — the methodology owns this concept |
| **Gemba / 3 GEN** | Real place, real thing, real facts — never speculate | Every lesson must cite evidence from the actual artifacts (`execution.md`, `test-report.md`, `validation-report.md`); use **5W1H** to reach root cause |
| **LUP** (one-point lesson) | One lesson, one page, instantly teachable | The `## Active Lessons` digest row: one lesson, one line, one owner document |
| **Standardize & repeat** | A fix becomes a standard, then the next improvement begins | Applied lessons live in constitution guides/templates; the digest retires them once institutionalized |

## The Loop Contract

Run the four phases in order. Read only artifacts already loaded by the invoking command.

### 1. Measure

Extract improvement signals from the spec's own evidence:

| Signal | Source |
|---|---|
| Reviewer FAIL rework attempts, HALTs, FATAL_FAILs | `execution.md` task entries |
| Pivots | `execution.md` `## Pivot Record` blocks |
| PRODUCT_BUG findings | `test-report.md` |
| Severe judgment-day findings | `design.md` / specify review notes, if recorded |
| Validation FAIL / WARN counts | `validation-report.md` |
| Escalations from `/akili-quick` into this spec | `docs/specs/quick/quick-log.md`, if applicable |
| Drift attributable to this spec | `docs/specs/drift-report.md`, if present |

If every signal is clean (zero rework, no pivots, no product bugs, no severe findings), record a one-line **clean run** entry in phase 4 and skip phases 2–3. A clean spec teaches nothing new — say so.

### 2. Learn

Distill **0 to 3** lessons. Hard rules:

- Every lesson names a **root cause** (apply 5W1H) and cites its evidence — file + section, e.g. `execution.md — Task 4, attempts 1–2 (Violated Rule: design.md#tokens)`. Gemba: real facts only.
- Generic lessons are banned ("write better tests", "be more careful"). A lesson must change what a future command concretely does.
- Prefer **zero lessons** over filler.
- If the same root cause already exists in `## Active Lessons`, do not duplicate it — increment its recurrence note and raise its severity (a repeat is a strong standardization signal).
- Classify each lesson's **target**:
  - **Product** (default): the root cause lives in this project — its guides, templates, design tokens, or personas.
  - **Methodology**: the root cause is AKILI itself — an ambiguous command step, a template gap, a missing skill. These lessons make the methodology learn from every tool built with it.

### 3. Standardize (HITL)

For each lesson, propose **exactly one** minimal edit (1–3 lines) targeting the most durable home:

- root `CLAUDE.md` / `AGENTS.md` (or a child module guide) — behavioral rules
- `docs/specs/general-setup/` templates — spec-authoring rules
- `docs/ux-ui/design.md` — missing tokens or visual rules
- `.agents/` personas — harness-role rules (append-only, never rewrite)
- **Methodology lessons:** no local edit — record the proposal in the log and recommend upstreaming it to the AKILI methodology repository.

Assign a severity: **High** = caused a HALT, pivot, or PRODUCT_BUG; **Medium** = caused rework or a severe finding; **Low** = friction only. Then present the menu:

1. **Apply all** (make every proposed edit now)
2. **Apply selected** (user picks by lesson ID)
3. **Defer all** (record proposals in the log; apply in a later spec)
4. **Type something** (adjust a proposal before applying)

Recommend option 1 when any High-severity lesson exists, otherwise option 3. Appending to the kaizen log is automatic; **every edit outside the log requires this approval**.

### 4. Record

Create or update `docs/specs/kaizen-log.md` (it lives outside spec folders so it survives archiving):

1. If the file does not exist, create it with the header and both sections from the format below.
2. Prepend the new entry under `## Entries` (newest first).
3. Refresh `## Active Lessons`: add new lessons; keep the table at **10 rows or fewer**; retire lessons whose rule now lives in the constitution or templates (mark `Retired` — the guide carries the rule from now on).

## Kaizen Log Format

```markdown
# Kaizen Log

Continuous-improvement record for this project, updated automatically by
`/akili-archive` (Kaizen Retrospective, powered by the `kaizen` skill).
Other AKILI commands read only the `## Active Lessons` table below —
keep it at 10 rows or fewer.

## Active Lessons

| ID | Lesson | Source Spec | Severity | Target | Standardized In | Status |
|---|---|---|---|---|---|---|
| KZ-003 | Define empty-state design tokens before any UI task that renders lists | changes/add-remember-me | Medium | Product | docs/specs/general-setup/design.md | Applied |
| KZ-002 | DTO boundary validations must be written as `AND IT MUST` constraints in requirements, never left implicit | bugfix/login-redirect | High | Product | docs/specs/general-setup/requirements.md | Applied |

## Entries

### 2026-07-20 — changes/add-remember-me

**Metrics**

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 8 | tasks.md |
| Reviewer FAIL rework attempts | 3 (Task 4 x2, Task 7 x1) | execution.md |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 1 (Task 5 — storage approach) | execution.md — ## Pivot Record: Task 5 |
| PRODUCT_BUGs | 1 (resolved) | test-report.md |
| Judgment-day severe findings | 2 | design.md review notes |
| Validation FAIL / WARN | 0 / 2 | validation-report.md |

**Lessons**

- **KZ-003 — Empty-state tokens were missing from the design phase.** (Product, Medium)
  - Root cause: `design.md` specified list components without empty-state tokens, so the
    Implementer improvised styles and the Reviewer failed Task 4 twice on token compliance.
  - Evidence: execution.md — Task 4, attempts 1–2 (Violated Rule: design.md#tokens).
  - Standardization: add an empty-state token check to the Design Impact checklist in
    `docs/specs/general-setup/design.md`. → **Applied 2026-07-20 (user-approved)**

### 2026-07-19 — bugfix/session-refresh — clean run

No rework, pivots, product bugs, or severe findings. No lessons recorded.
```

## Hard Rules

- **Never block the archive** (or any invoking command). Missing inputs or a declined menu → append a metrics-only or clean-run entry and continue.
- **Never edit files outside `docs/specs/kaizen-log.md` without explicit HITL approval** in phase 3.
- Digest capped at **10 Active Lessons**; retire institutionalized lessons instead of letting the table grow.
- At most **3 lessons per retrospective**; prefer zero over filler.
- Standardization edits are **1–3 lines**; never rewrite whole documents.
- Consumers (`/akili-propose`, `/akili-specify`, `/akili-execute`, `/akili-resume`) read **only** the `## Active Lessons` digest, never `## Entries`.
