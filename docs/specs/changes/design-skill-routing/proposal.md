# Proposal — Design Skill Routing (Impeccable builds, not only judges)

> **Answer first.** Impeccable already *leads* direction (specify `shape`) and evaluation (validate, test, audit), but at build time it only hands the Implementer its **craft floor** — the guardrails, not the playbooks. And no rule tells an agent which design skill to use given the **project's environment** (existing design system? Tailwind? shadcn? native?) and the **activity** (direction, mockup, build, refine, motion, evaluate). Recommended: one canonical **Design Routing Matrix** (activity × environment → lead skill + supporting skills), held once in `impeccable-bridge`, wired into `/akili-specify` task lists and `/akili-execute` build steps, scaffolded per project by `/akili-constitution` Step 8D, and summarised in a new `## Design Skills` section of this repo's `AGENTS.md`. Minor release, ~350 LOC of prose + ~300 LOC of contract tests.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/design-skill-routing` |
| Slug | `design-skill-routing` — derived from free-text argument (matches the worktree name) |
| Type | Change |
| Deliverable | software (methodology text + contract tests) |
| Approval Mode | gated |
| Requirement source | JC brief, 2026-11-01 (pasted into the session). No Jira |
| Visual source | None — no Figma; the change has no UI surface |
| Depends on | PR #111 `impeccable-audit-fixes` merged into `dev` (it edits `impeccable-bridge/SKILL.md`, `akili-propose`, `akili-constitution`, `akili-validate`, `akili-audit`) |
| Parallel-safe | no — same files as PR #111 |
| Author | Claude (Opus 5.5) for JC, 2026-11-01 |
| Status | **Approved** — JC, 2026-11-01 09:41 UTC-5, in JC's chat with Methodology (relayed into this session); Option B |

### Approval Decisions

| # | Decision | Settles | Provenance |
|---|---|---|---|
| D1 | Option B — canonical matrix + build wiring | §10–11 | JC, 2026-11-01 09:41 UTC-5, chat with Methodology |
| D2 | Impeccable `polish` on **every** UI task; a light pass on Operate (app) and Read (documentation) screens | Q1 | same |
| D3 | Mockups: Impeccable direction picker first; Stitch when JC asks for it | Q3 | same |
| D4 | `shadcn-ui` origin verification goes to a separate spec | Q2 | same |
| D5 | Dependency R1 cleared: PR #111 merged into `dev` (`6063d8c`) | R1 | same |

## 2. Intent

AKILI should produce **distinctive, professional, non-generic** UI, and be rigorous about *why* a given skill leads a given step. Concretely:

1. Impeccable is used to **build** (new surfaces, refinements, motion intent, design-system extraction), not only to plan and evaluate.
2. Every design skill has a stated **expertise** (what it is best at, what it must not decide), checked against its own text.
3. Routing is decided by **environment × activity**, resolved per project, and written where agents read it.

## 3. Problem / Current Behavior

**Premise correction.** The brief says Impeccable is wired only to `/akili-audit design`. In this tree (v2.40.0, `8268cb7`) that is no longer true:

| Phase | Today | Citation |
|---|---|---|
| Constitution Step 4 | Impeccable leads; `init`/`document` produce derived `PRODUCT.md`/`DESIGN.md` | `.claude/commands/akili-constitution.md:207-210` |
| Specify Step 2.1 | Impeccable leads direction (`shape`) | `.claude/commands/akili-specify.md:230-233` |
| Execute UI tasks | Implementer loads **only the craft floor** | `.claude/skills/impeccable-bridge/SKILL.md:137`; `.claude/commands/akili-specify.md:462` |
| Test / Validate / Audit | Detector suite; critique + audit; design evaluation | `impeccable-bridge/SKILL.md` *Who does what in each state* |

The real gaps:

| # | Gap | Evidence |
|---|---|---|
| G1 | **Build = guardrails only.** Execute never routes to Impeccable's build/refine playbooks (`new-work`, `typeset`, `layout`, `colorize`, `bolder`/`quieter`, `animate`, `harden`, `onboard`, `adapt`, `extract`, `polish`). The craft floor itself says "do not load it for planning-only work" — it is a floor, not a method | `.claude/skills/impeccable/SKILL.md` Setup step 3 + Commands table; bridge `:137` |
| G2 | **No environment axis.** Nothing says how Impeccable relates to an existing design system or component library (shadcn, Tailwind tokens, Angular Material), although Impeccable has explicit modes for it ("Refinement preserves; redesign replaces", `document`, `extract`) | `impeccable/SKILL.md` *How to design*; `reference/extract.md:5-9`; `reference/document.md:87-90` |
| G3 | **Motion has two owners and no split.** `/akili-specify` loads `gsap-animation` for any animation; Impeccable has `animate` and lists GSAP as one library among several | `.claude/commands/akili-specify.md:235`; `impeccable/reference/overdrive.md:53` |
| G4 | **Mockup has two routes and no rule.** Propose recommends `stitch-design` first; Impeccable's direction picker is an "alternative" | `.claude/commands/akili-propose.md:132-136` |
| G5 | **Stale and inconsistent text.** Repo `AGENTS.md` still names the pre-Impeccable chain; `docs/flow.md` lists conditional UI skills without Impeccable; `/akili-seo` picks `ui-ux-pro-max`/`frontend-design` directly, bypassing the bridge | `AGENTS.md:51`; `docs/flow.md:655-657`; `.claude/commands/akili-seo.md:158-159` |
| G6 | **Expertise unvalidated.** No per-skill record of what each skill is expert at vs. must not decide; one stack skill carries `author: community (origin unverified)` | `.claude/skills/shadcn-ui/SKILL.md:6` |
| G7 | **Projects get no design routing.** Constitution Step 8D scaffolds a `## Skill Map` by stack, but nothing resolves *which design skill leads which activity in this project* | `.claude/commands/akili-constitution.md:713` |

## 4. Proposed Outcome

- One **Design Routing Matrix**, held once, answering: *for this activity, in this environment, who leads, who supports, who must not decide.*
- `/akili-specify` writes the **Impeccable command(s) per UI task** into `tasks.md` (e.g. T4: `impeccable new-work` for the pricing page; T6: `impeccable typeset` + `layout` for the settings screen), and the Implementer follows those playbooks, then the craft floor, then `polish` before handing to the Reviewer.
- Projects get a `### Design routing` block under their `## Skill Map`, resolved from the detected environment.
- Repo `AGENTS.md` gets a `## Design Skills` section: the decision rule in five lines + a pointer to the matrix (no duplicate rows).

## 5. Scope

| In | Detail |
|---|---|
| Matrix | New `impeccable-bridge/references/design-routing.md`: activity × environment table, per-skill expertise cards, motion split, mockup rule, existing-design-system rule. Bridge `SKILL.md` *Roles* + *Phase map* point at it |
| Specify | Step 2.1 records the project environment class; Step 3 task-skill rule names the Impeccable command per UI task; motion rule replaced by the split |
| Execute / Implementer | UI task = playbook (named command) → craft floor → `polish`; existing design system → refinement mode, tokens from the system, `extract` only when a task says so |
| Propose | Mockup rule: Impeccable direction picker first when skill source ≠ `missing`; Stitch when the user wants hi-fi multi-screen and Stitch MCP is present |
| Constitution Step 8D | Scaffold `### Design routing` resolved from the stack + design-system detection |
| SEO | `/akili-seo` UI step goes through the bridge |
| Docs | Repo `AGENTS.md` `## Design Skills`; `docs/flow.md` §9; `docs/overview.md` skill rows; `docs/skills/*.md` for the touched skills; `docs/skills/governance.md` assignment table; `CHANGELOG.md` |
| Tests | Contract tests: matrix held once (commands point, never restate rows), every packaged design skill appears in the matrix, no command names `frontend-design` as a lead outside the `missing` fallback, AGENTS.md section matches the matrix's skill set |

## 6. Non-Goals

- No new command (`/akili-design` was considered — Option C).
- No edit to the vendored `impeccable/` folder (hash-locked; NFR of the vendoring rule).
- No skill removal or new skill. `frontend-design` stays as the `missing` fallback; `ui-ux-pro-max` stays catalog-only.
- No change to the engine gate, detector gate, waivers or consent rules (PR #111 territory).
- No re-verification of `shadcn-ui` authorship here — recorded as an open question.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Teams using AKILI on UI projects | Implementer builds with Impeccable playbooks; tasks name the command |
| `.claude/skills/impeccable-bridge/` | New reference + Roles/Phase-map edits |
| `.claude/commands/` | `akili-specify`, `akili-execute`, `akili-propose`, `akili-constitution`, `akili-seo` |
| `.claude/templates/implementer.md`, `leader.md` | One rule each (persona sections → `digests.json` at release) |
| Archived specs | `changes/impeccable-design`, `changes/impeccable-hardening` — superseded in part (bridge Phase map row `:137`), not rewritten |

## 8. Visual Reference

- Source: None
- Location: —
- Notes: methodology text; no UI surface in this repository.

## 9. Requirement Delta Preview

### ADDED

- A Design Routing Matrix with environment classes: **E1 greenfield / no design system**, **E2 existing design system or component library**, **E3 native mobile**, **E0 skill source `missing`** (Tailwind / shadcn / Angular are *implementation layers* inside E1/E2, not separate classes).
- Activities: **foundation, direction, mockup, build-new, build-within-system, refine, motion, evaluate**.
- Expertise cards: per skill, *expert at · supports · must not decide · evidence (its own file:line)*.
- Rule: **Impeccable decides what and why; the stack skill decides how in this framework.** (`tailwind-design-system` engineers the token layer of an approved direction; `shadcn-ui` composes primitives; neither picks the aesthetic.)
- Motion split: Impeccable `animate` owns purpose, choreography, reduced-motion; `gsap-animation` implements when GSAP is in the stack or the motion is timeline/scroll-driven; otherwise CSS per Impeccable.
- Per-task Impeccable command in `tasks.md`; `polish` before Reviewer handoff on UI tasks.
- Project `### Design routing` block from Step 8D.

### MODIFIED

- Bridge Phase map row *Craft floor before UI edits* → *Build with the task's named playbook, craft floor before each edit, polish before review*.
- Propose mockup order (Impeccable picker first when present).
- Specify animation rule; SEO UI-skill rule.
- Repo `AGENTS.md:51` replaced by the `## Design Skills` section.

### REMOVED

- `frontend-design` as an unconditional UI option in `AGENTS.md` and `/akili-seo` (kept only as the `missing` fallback).

## 10. Approach Options

| | A — Docs only | **B — Canonical matrix + build wiring** (recommended) | C — New `/akili-design` command |
|---|---|---|---|
| What | Rewrite `AGENTS.md:51` and `docs/flow.md` §9 | Matrix held once in the bridge; specify/execute/propose/constitution/seo point at it; AGENTS.md summarises | B + a dedicated command that runs direction→build→polish outside the spec flow |
| Fixes G1 (build) | no | yes | yes |
| Fixes G2/G3/G4 | prose only, unenforced | yes, tested | yes |
| Per-project routing (G7) | no | yes (Step 8D) | yes |
| Risk | Agents keep reading commands that say "craft floor only" → docs and behavior diverge | Touches 5 commands + 2 personas; conflicts with PR #111 unless it merges first | New command = new surface, overlaps `/akili-execute` UI tasks and the harness; violates "do not add a separate command" spirit |
| Size | ~60 LOC | ~350 prose + ~300 tests | ~800+ |
| Release | patch | **minor** | minor |

## 11. Recommended Approach

**Option B.** It is the smallest path that changes *behavior* (G1) rather than only description, and it keeps the house rule of holding a table once and pointing at it (the bridge already does this for *Who does what in each state*). A is cheaper but leaves commands telling the Implementer the opposite of the docs. C duplicates `/akili-execute`.

Why the matrix lives in `impeccable-bridge/references/` and not in repo `AGENTS.md`: this repo's `AGENTS.md` guides agents **developing AKILI**; the routing must reach **every installed project**, so it ships inside the packaged bridge and is scaffolded into project `AGENTS.md` by Step 8D. Repo `AGENTS.md` carries the decision rule and the pointer.

Rigor built in: each expertise card cites the skill's own text; `/akili-specify` will run `judgment-day` on the matrix design; contract tests fail if a command restates matrix rows or names a non-fallback lead.

## 12. Risks, Dependencies, And Open Questions

| # | Item | Handling |
|---|---|---|
| R1 | **PR #111 not in `dev`** — same files (bridge `SKILL.md`, propose, constitution) | Do not start `/akili-specify` design edits until #111 merges; rebase this branch on `dev` first |
| R2 | Restating the matrix in commands (drift) | KZ-changes--kaizen-loop-closure-2: grep for superseded phrasing ("craft floor" as the sole build rule, `frontend-design` as UI option) before each Reviewer spawn |
| R3 | Aggregate claims ("every design skill appears…") | KZ-002: run the falsifying grep before writing the claim in docs/CHANGELOG |
| R4 | Test budget | KZ-bugfix--init-ctrlc-abort-2: text-contract tests ship ~3× the estimate; budget ~300 LOC, one assertion per THEN clause |
| R5 | Persona sections change → `digests.json` and `since=` at release | Handled by `scripts/release.js`; note in tasks |
| R6 | Implementer token cost grows (playbook + craft floor per task) | Load only the named command's reference, never the whole Impeccable folder; record in design |
| Q1 | Should `polish` before review be mandatory on every UI task, or only Persuade/Experience screens? | Proposed: all UI tasks; Operate/Read get a light pass. JC to confirm at specify |
| Q2 | `shadcn-ui` origin unverified (`SKILL.md:6`) — re-verify authorship now or separate spec? | Proposed: separate governance spec |
| Q3 | Stitch vs Impeccable picker default when both are present | Proposed: Impeccable first (it records page mode + direction in the design authority); Stitch on request |

## 13. Success Criteria

- A UI task in a generated `tasks.md` names its Impeccable command and environment class; the Implementer's `execution.md` shows playbook → craft floor → polish.
- On a project with an existing design system, the routing resolves to E2 and the Implementer works in refinement mode with that system's tokens.
- `grep` finds the matrix rows in exactly one file; all commands point to it.
- Repo `AGENTS.md` `## Design Skills` lists every packaged design skill with its role, consistent with the matrix (test-enforced).
- `npm test`, `verify:cli`, `pack:dry-run`, `git diff --check` green.

## 14. Next Step

After approval, and after PR #111 merges into `dev` and this branch is rebased:

```text
/akili-specify changes/design-skill-routing
```

Standard depth; `judgment-day` on the design.
