# Skill Governance

**The rule in one line:** every skill in this package declares who wrote it, how AKILI binds it into the flow, and why its size is justified — or it does not ship.

AKILI-SPECS is a curated methodology, not a skill dump. Skills are admitted through the analysis below, adapted to the methodology, and attributed to their original authors. Curation and adaptation by Juan Carlos Cadavid — jcadavid.com.

## Binding Taxonomy

Every skill declares `metadata.binding` in its `SKILL.md` frontmatter. The binding level answers the question: *when and how does this skill get loaded?*

| Binding | When it loads | Mechanism |
|---|---|---|
| `core` | Always, at a precise step of a command | The command text hard-loads it ("load the `X` skill") |
| `conditional` | When the work touches its domain | A conditional line in the command ("if the work involves X, load `Y`") |
| `stack` | Depends on the project's technology stack, **or on the developer's tooling environment** | `/akili-constitution` writes a **`## Skill Map`** into the project's `AGENTS.md`/`CLAUDE.md`; `/akili-specify` derives per-task required skills in `tasks.md`; the Leader assigns them to Implementer/Tester via dynamic skill loading |

**Environment-provided skills are referenced, never vendored.** Some skills that belong in the Skill
Map are shipped by a *tool* rather than by AKILI — standing examples: an agent orchestrator's
coordination skill (`orchestration`), Microsoft's `playwright-cli` browser-automation skill (the
token-lean alternative to loading the Playwright MCP schemas into every session), and the
`hyperframes` video-composition family. Three rules govern them:

1. **Never copy one into `.claude/skills/`.** These stubs are deliberately thin because the tool's
   own binary serves the version-matched guide; a vendored copy goes stale the moment the tool
   updates, and would then instruct agents to call flags that no longer exist. Reference the skill
   by name and let the environment provide it.
2. **Availability is per-developer, not per-project.** The Skill Map is committed and shared, so an
   environment-skill row records *what to use when it is present*, never an assumption that it is.
   A teammate without the tool simply never loads it, and every command must still work without it.
3. **Attribution stays with the author.** These skills are not AKILI's and carry no AKILI
   authorship frontmatter; the acceptance checklist below applies only to skills we ship.

### Current assignment

| Binding | Skills |
|---|---|
| `core` | `kaizen` (archive), `judgment-day` (specify), `cognitive-doc-design` (all human-facing docs), `brainstorming` (constitution, propose), `product-manager-toolkit` (constitution), `software-architect` (constitution TRD/infra, specify design), `caveman` (execute/test transient inter-agent output), `systematic-debugging` (bug flows), `seo-audit` (seo) |
| `conditional` | `ui-ux-pro-max`, `frontend-design`, `stitch-design` (UI work), `gsap-animation` (animation work), `tdd` (logic-heavy tasks — assigned per task by the `/akili-execute` Leader via `leader.md`'s skill-decision rule, not by a conditional line in command text; the documented exception to the wiring norm) |
| `stack` | `angular-developer`, `nestjs-expert`, `shadcn-ui`, `tailwind-design-system`, `react-doctor`, `vercel-react-best-practices`, `aws-serverless`, `api-design-principles`, `error-handling-patterns` |

Rules of thumb:

- A skill earns `core` only when a command step would be *wrong* without it (a retrospective without `kaizen` is not the AKILI archive).
- `conditional` skills are stack-agnostic capabilities that many but not all specs need (UI, animation).
- `stack` skills must never be **load-directed** in command text (a command step telling the agent to load a named stack skill) — commands stay tool- and framework-agnostic. They reach the agent through the project Skill Map and per-task skill lists. **Three documented carve-outs:** (1) the Skill Map *builder* in `/akili-constitution` (Step 8D, and the Step 5 TRD bootstrap that feeds it — constitution runs *before* the map exists) may enumerate the packaged stack skills as the candidate pool it selects from; (2) an explicit **no-map fallback list** that defers to the Skill Map first ("prefer the `## Skill Map` when it exists; otherwise pick from: …") is acceptable; (3) purely *illustrative* examples ("e.g. `nestjs-expert`") that explicitly defer to the task list / Skill Map are acceptable. A step that says "use these skills:" followed by stack-skill names, with **no** Skill Map deferral, is a violation.

## Frontmatter Schema

Every packaged skill carries this frontmatter (original fields are preserved, never overwritten):

```yaml
---
name: <skill-name>
description: "<trigger keywords + what it does>"
license: <original license — never altered>
metadata:
  author: <original author, or "community (origin unverified)">
  source: <URL or collection of origin, when known>
  adapted-by: "Juan Carlos Cadavid — jcadavid.com"
  adapted-for: "AKILI-SPECS"
  binding: core | conditional | stack
  version: "<preserved or 1.0>"
---
```

Attribution is non-negotiable: MIT and Apache-2.0 licenses require preserving the original copyright and license notices. `adapted-by` records curation and AKILI adaptation — it never replaces the original `author`.

**Original-authorship variant:** skills authored originally for AKILI-SPECS (e.g. `kaizen`, `software-architect`) carry `author: Juan Carlos Cadavid — jcadavid.com` and may declare `inspired-by:` (a list of the works the method synthesizes) instead of `source`/`adapted-by`/`adapted-for` — there is no upstream to adapt from, but intellectual influences are still credited.

## Adaptation Levels

| Level | Who gets it | What it is |
|---|---|---|
| 1 — Attribution | All skills | The standard frontmatter above |
| 2 — Integration | `core` and deeply-used `conditional` skills only | An `## AKILI-SPECS Integration` section in the body: a table mapping the skill's tools to exact moments in the AKILI flow, plus adaptation rules |

`stack` skills deliberately get **no** integration section — they are loaded per task and extra methodology prose in them is token waste (MUDA).

## Acceptance Checklist for New Skills

A skill enters `.claude/skills/` only when all of these hold. If any box fails, the skill stays out.

1. **Need** — a real AKILI phase or supported stack needs it; name the command step or Skill Map slot it will occupy.
2. **Binding declared** — `core`, `conditional`, or `stack`, with the exact integration point. A `core`/`conditional` skill must actually be wired into command text in the same change; a skill referenced by no command and no Skill Map is dead weight and does not ship.
3. **Attribution complete** — original author, source, and license identified and preserved; `adapted-by` added. If the origin cannot be verified after a genuine search, mark `author: community (origin unverified)`.
4. **Size justified** — prefer one skill with `references/` (progressive disclosure) over families of sibling skills; large data/scripts payloads need a stated reason.
5. **Docs + CHANGELOG** — a `docs/skills/<name>.md` page, a truthful row in `docs/skills/README.md` (Binding column included), and a `CHANGELOG.md` entry.

The same checklist applies in reverse: when a skill loses its integration points, remove it or re-bind it — do not let the inventory drift from the commands.

## Removal / Fusion Log

| Date | Change | Reason |
|---|---|---|
| 2026-07-20 | `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-react`, `gsap-frameworks`, `gsap-performance`, `gsap-utils` → fused into `gsap-animation` | 8 sibling skills, ~104 KB, zero command wiring; one `conditional` skill with `references/` preserves the content and is actually loaded |
