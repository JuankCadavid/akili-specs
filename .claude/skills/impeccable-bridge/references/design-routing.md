# Design Routing Matrix

Used by every AKILI step that needs to know **which design skill leads which design activity**: `/akili-constitution`, `/akili-specify`, `/akili-propose`, `/akili-execute` UI tasks, `/akili-seo` (UX/UI recommendations) and the project `### Design routing` block. This file is the one place where the matrix rows and the expertise cards live; every other surface names this file and a section of it, never a line number and never a copied row. It decides routing only. Which AKILI phase runs an activity is the bridge's *Phase map*; engine and consent rules are the bridge's *Step 0 — Skill source and engine gate*.

## Decision rule

1. **Impeccable decides what and why; the stack decides how.** Direction, composition, hierarchy, type, color, motion intent and copy come from Impeccable (`/impeccable`, `$impeccable` in Codex). Tokens and components are written in the project's stack, through the stack skills the project `## Skill Map` lists.
2. **One lead per activity.** Supporting skills give inputs, not rules.
3. **The environment picks the column, the activity picks the row.** Which AKILI phase runs an activity is the bridge's *Phase map*, not this file's job.
4. **Direction is settled before execute; execute builds code-led against it.**
5. **Every UI task ends with `polish`; the AKILI Reviewer stays the gate.**
6. If a reference this file names is absent from the Impeccable copy found (a `user-installed` version), use Impeccable's *Commands* table to pick the nearest command, report it, and continue.

## Environment classification

Classify each screen, first match wins. Record the class and its evidence path next to the page-mode inventory of the spec's design.

| Order | Evidence | Class |
|---|---|---|
| 1 | The bridge's Step 0 skill source is `missing` | ENV-0 |
| 2 | The screen platform is iOS, Android or adaptive (Impeccable ships native references for them) | ENV-3 |
| 3 | `docs/ux-ui/design.md` defines tokens or components, **or** the code has a component library or token layer that forms a coherent identity (Impeccable's *Established world*) | ENV-2 |
| 4 | None of the above | ENV-1 |

A missing `DESIGN.md` is never evidence for ENV-1. A project with web and native screens is classified per screen.

## Matrix

The environment picks the column; the activity picks the row. Each cell names exactly one lead.

| Activity | ENV-1 no established world | ENV-2 established world | ENV-3 native | ENV-0 skill `missing` |
|---|---|---|---|---|
| **foundation** | `impeccable` `init` (derived context from the authority) | `impeccable` `document`, then `init` | `impeccable` `init`, platform recorded | `frontend-design` |
| **direction** | `impeccable` `shape`, then `new-work` *Create or replace the visual world* (the roll runs here) | `impeccable` `shape`, then `new-work` *Create a whole surface inside an established world* or *Extend an existing surface* | `impeccable` `shape` with the platform reference | `frontend-design` |
| **mockup** | `impeccable` direction picker | `impeccable` direction picker anchored on the incumbent | `impeccable` direction picker | `stitch-design` |
| **build-new** | `impeccable` `new-work`, code-led, against the recorded direction | `impeccable` `new-work`, code-led, at the surface tier the direction recorded | `impeccable` `new-work` with the platform reference | `frontend-design` |
| **build-within-system** | `impeccable` `new-work` (use build-new: no system yet) | `impeccable` named playbook(s): `layout`, `typeset`, `colorize`, `clarify`, `adapt`, `harden`, `onboard`, `distill`, `optimize`; `extract` only when the task says so | `impeccable` named playbook with the platform reference | `frontend-design` |
| **refine** | `impeccable` `bolder`, `quieter`, `delight` or `overdrive`, as the design names | `impeccable` `bolder`, `quieter`, `delight` or `overdrive`, as the design names; `polish` never redesigns | `impeccable` `bolder`, `quieter`, `delight` or `overdrive`, as the design names | `frontend-design` |
| **motion** | `impeccable` `animate`, library per *Motion* | `impeccable` `animate`, the project's motion library | `impeccable` `animate`, platform motion | `frontend-design` |
| **evaluate** | `impeccable` critique and audit, behind the bridge's *Detector gate* | `impeccable` critique and audit, behind the bridge's *Detector gate* | `impeccable` `audit`, native variant | `frontend-design` checklist review |

**Supporting line** (every cell, never a lead): `ui-ux-pro-max` for catalog options; the Skill Map stack skills as the implementation layer; `gsap-animation` when *Motion* selects it (ENV-0 motion included); `stitch-design` when the user asks for Stitch.

At ENV-0 `frontend-design` is the existing fallback for direction and craft, unchanged, with `ui-ux-pro-max` as support.

## Expertise cards

One card per design skill. Evidence names a file and an exact heading of that skill's own text.

| Skill | Expert at | Supports | Must not decide | Evidence |
|---|---|---|---|---|
| `impeccable` | Direction, page mode, craft floor, build and refine playbooks, critique, audit, polish, detector | none (lead) | Framework-specific implementation the stack owns | `impeccable/SKILL.md` → *Commands*; `impeccable/SKILL.md` → *Modes* |
| `impeccable-bridge` | Which skill leads, gates, consent, source of truth | All phases | Design rules (it teaches none) | `impeccable-bridge/SKILL.md` → *Roles* |
| `ui-ux-pro-max` | Catalog: palettes, font pairings, styles, chart types by industry | direction, foundation; ENV-0 checklist | The style | `ui-ux-pro-max/SKILL.md` → *AKILI-SPECS Integration* |
| `frontend-design` | Direction and craft when Impeccable is missing | ENV-0 lead only | Anything while Impeccable is present | `frontend-design/SKILL.md` → *8. Integration With Other Skills* |
| `stitch-design` | Hi-fi multi-screen generation via the Stitch MCP, `.stitch/DESIGN.md` | mockup on request; ENV-0 mockup lead | The design authority | `stitch-design/SKILL.md` → *Core Responsibilities* |
| `gsap-animation` | Timelines, scroll-driven animation, runtime control, SVG morphing in GSAP | motion implementation | Whether motion exists, or its purpose | `gsap-animation/SKILL.md` → *Prefer GSAP over CSS animations when you need* |
| `tailwind-design-system` (stack) | Tailwind v4 tokens, CSS-first theming, component variants | implementation layer | The aesthetic | `tailwind-design-system/SKILL.md` → *When to Use This Skill* |
| `shadcn-ui` (stack) | shadcn/ui primitives, forms, theming in React | implementation layer | The aesthetic | `shadcn-ui/SKILL.md` → *When to Use* |
| other UI stack skills (e.g. `angular-developer`, `vercel-react-best-practices`, `react-doctor`, via the Skill Map) | Framework idioms, performance, correctness | implementation layer | The aesthetic | `docs/skills/governance.md` → *Current assignment* |

Stack skills reach agents only through the project `## Skill Map` and per-task skill lists; no command text load-directs one.

## Build route

For a UI task in `/akili-execute`, with skill source `vendored` or `user-installed`:

1. **Setup.** Impeccable's Setup, with the bridge's Step 0 gate unchanged: no launcher call before the engine is `ready` or `installed (consented)`; otherwise Impeccable's own *Launcher unavailable* path.
2. **Load only what the task names.** The playbook reference(s) in the task's `Design route:` line, plus Setup, the craft floor and `polish`; never the whole reference folder.
3. **Code-led, against the recorded direction.** The roll, any dealt structure and any comp were settled at specify and recorded in the spec's design. In execute there is no decision page, no `concept-seed`, no comp round, no image generation and no documenter (`docs/ux-ui/design.md` is the authority; `PRODUCT.md` and `DESIGN.md` stay derived). The questions `new-work` asks before building are answered from the spec's design; a question it does not answer is a spec gap, handled by the Pivot Protocol and never decided by the Implementer.
4. **Craft floor.** Read it immediately before UI edits.
5. **Finish review: not run (AKILI execute).** Impeccable forbids its finish review inside the build thread and its packet needs a roll and screenshots that execute does not produce. The Implementer reports `finish review: not run (AKILI execute)` and never presents the skip as a review; the AKILI Reviewer and `/akili-validate`'s design gate (critique and audit) judge the built result. Impeccable's degraded inline finish pass is never run in the build thread either.
6. **`polish` within the AKILI scope limit.** Full and light are an AKILI scope limit on `polish`, not an upstream mode; upstream's rules apply inside it.

   | Limit | Pages | Covers | Fixes | Reports, does not fix |
   |---|---|---|---|---|
   | full | Persuade, Experience | The whole screen in task scope | Every drift class of `polish` *Establish the system*; a missing token is added to the authority only when the spec's approved design covers it | Conceptual mismatches outside scope |
   | light | Operate, Read | The task's changed surface | Local defects, one-off implementations | Missing tokens, conceptual mismatches |

7. **Completion report.** Names the playbook(s) run, the polish limit and its result, and the finish-review line above. At ENV-0 it records `skill source missing — frontend-design` instead, and the task neither fails nor stops. The Leader logs the report in `execution.md` and names that entry in the Reviewer brief.

## Motion

| Concern | Owner |
|---|---|
| Whether motion exists, purpose, choreography, reduced-motion | Impeccable `animate`, mode-aware |
| Library | The project's existing motion library. With none: CSS or the Web Animations API. `gsap-animation` loads only when GSAP is the project's library, or when CSS and WAAPI cannot express the effect cleanly (judged against `gsap-animation`'s own list) and the spec records that choice as a design decision |
| Native (ENV-3) | Platform motion per Impeccable's platform references; `gsap-animation` is not loaded |

GSAP is never added to a project unless the spec's design records the decision.

## Mockup route

- **Skill source `vendored` or `user-installed`:** offer Impeccable's direction picker first (comp-led needs the image-credit yes; code-led does not). Name Stitch as available on request and generate with `stitch-design` only when the user asks. The picker's result is a Visual Reference that `/akili-specify`'s `shape` consumes, not a second direction round. Impeccable runs `init` first when `PRODUCT.md` is missing.
- **Skill source `missing`:** the existing order, `stitch-design`, then Claude Design, then a self-contained HTML sketch.

Image generation and engine download keep their consent rules in every approval mode (bridge *Privacy and consent*).

## Design route line

Every UI task carries one line in its Scope:

`Design route: load impeccable-bridge → design-routing.md; playbook <cmd>[, <cmd>]; ENV-<n>; mode <mode>; polish <full|light>; motion <value>`

| Field | Values |
|---|---|
| Playbook(s) | Impeccable build, refine, enhance or fix commands; `frontend-design` when ENV-0 |
| Environment | `ENV-0`, `ENV-1`, `ENV-2` or `ENV-3` (*Environment classification*) |
| Page mode | Persuade, Operate, Read or Experience |
| Polish | `full` (Persuade, Experience) or `light` (Operate, Read) |
| Motion | `none`; `animate → CSS/WAAPI`; `animate → <project library>`; `animate → gsap-animation` |

**Done criteria** carry: *the completion report names the playbook(s) run, the polish depth and its result, and `finish review: not run (AKILI execute)` when the playbook calls for one, or, at ENV-0, `skill source missing — frontend-design`; the Leader logs it in `execution.md` and names that entry in the Reviewer brief*.

**Sizing note.** A UI task covers one screen or one component family, so Setup, the playbook, the craft floor and `polish` fit the Implementer's tool-call bound. A larger surface is split at specify.

## Attribution

Original AKILI-SPECS reference by Juan Carlos Cadavid — jcadavid.com (MIT). It routes to Impeccable by Paul Bakaus (https://github.com/pbakaus/impeccable), whose skill AKILI ships as a vendored copy under its own license. This file contains no Impeccable text; it names Impeccable's commands and headings only.
