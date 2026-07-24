# Skill Reference

AKILI ships Claude/OpenCode skills alongside the slash commands. Skills are loaded by the agent when a task needs domain-specific guidance.

The installable source files live in `.claude/skills/*/SKILL.md`. These pages are the human-facing reference.

The skill set is **curated, not accumulated**: every skill declares its original author/license and a binding level that says when and how it loads. The rules — binding taxonomy, frontmatter schema, and the acceptance checklist for new skills — live in [governance.md](governance.md). Curation and AKILI adaptation by Juan Carlos Cadavid — jcadavid.com, always preserving original authorship.

| Binding | Meaning |
|---|---|
| `core` | Hard-wired to a precise command step — the command loads it by name |
| `conditional` | Loaded when the work touches its domain (UI, animation) |
| `stack` | Selected per project via the `## Skill Map` scaffolded by `/akili-constitution`; never load-directed in command text (candidate-pool lists in the Skill Map builder and Skill-Map-deferring examples are documented carve-outs — see `governance.md`) |

## Skill Inventory

| Skill | Binding | Origin | Use For | Wired In |
|---|---|---|---|---|
| [`angular-developer`](angular-developer.md) | stack | Google LLC (MIT) | Angular architecture, components, services, signals, forms, routing, testing, CLI | Skill Map; constitution/specify stack lists |
| [`api-design-principles`](api-design-principles.md) | stack | Seth Hobson (MIT) | REST and GraphQL API design and review | Skill Map; constitution/specify stack lists |
| [`aws-serverless`](aws-serverless.md) | stack | vibeship (Apache-2.0) | Lambda, API Gateway, DynamoDB, SQS/SNS, SAM/CDK | Skill Map; constitution/specify stack lists |
| [`brainstorming`](brainstorming.md) | core | Jesse Vincent — obra (MIT) | Clarifying ideas, scope, options, and trade-offs before implementation | `/akili-constitution` Step 0, `/akili-propose`, `/akili-specify` phases 1–3 |
| [`caveman`](caveman.md) | core | Julius Brussee (MIT) | Token-economy compression of transient agent output (inter-agent messages `full`, progress lines `lite`) — never documents, HITL gates, or verbatim evidence | `/akili-execute` triad communication; `/akili-test` Leader↔Tester communication |
| [`cognitive-doc-design`](cognitive-doc-design.md) | core | gentleman-programming (Apache-2.0) | Human-facing docs that reduce cognitive load (lead with the answer, progressive disclosure, tables over prose) | `/akili-constitution`, `/akili-specify`, `/akili-execute` (PR docs), `/akili-archive` |
| [`error-handling-patterns`](error-handling-patterns.md) | stack | Seth Hobson (MIT) | Exceptions, Result patterns, graceful degradation, reliability | Skill Map; constitution/specify stack lists |
| [`frontend-design`](frontend-design.md) | conditional | Anthropic (Apache-2.0) | Distinctive frontend UI and UX implementation (fallback when `ui-ux-pro-max` is unavailable) | UI steps of `/akili-constitution`, `/akili-specify`, `/akili-test`, `/akili-validate`, `/akili-seo` |
| [`gsap-animation`](gsap-animation.md) | conditional | GSAP/GreenSock (MIT) | All GSAP animation work — router SKILL.md + references (timeline, scrolltrigger, plugins, react, frameworks, performance, utils) | `/akili-specify` and `/akili-execute` animation work |
| [`judgment-day`](judgment-day.md) | core | gentleman-programming (Apache-2.0) | Blind adversarial dual review of designs with bounded fix rounds | `/akili-specify` Review Design gate; findings feed `/akili-archive` Kaizen |
| [`kaizen`](kaizen.md) | core | Juan Carlos Cadavid — jcadavid.com (MIT) | Bounded continuous-improvement retrospective (Measure → Learn → Standardize → Record) | `/akili-archive`; its Active Lessons digest is read by propose/specify/execute/resume |
| [`nestjs-expert`](nestjs-expert.md) | stack | Daniel Avila (MIT) | NestJS modules, DI, guards, interceptors, testing, TypeORM/Mongoose | Skill Map; constitution/specify stack lists; persona examples |
| [`product-manager-toolkit`](product-manager-toolkit.md) | core | Alireza Rezvani (MIT) | Product discovery, PRDs, prioritization, interview analysis (AKILI-adapted: canonical PRD structure, RICE for scope-chunk ordering) | `/akili-constitution` Steps 2–3, `/akili-propose`, `/akili-specify` scope chunking |
| [`react-doctor`](react-doctor.md) | stack | Million.dev | React diagnostics after changes | Skill Map; `/akili-test`, `/akili-validate`, `/akili-execute` React work |
| [`seo-audit`](seo-audit.md) | core | Corey Haines (MIT) | Technical, on-page, and international SEO audits with a standard finding format | `/akili-seo` audit phase (required) |
| [`shadcn-ui`](shadcn-ui.md) | stack | community (origin unverified) | shadcn/ui components, forms, themes, Tailwind integration | Skill Map; constitution/specify stack lists; persona examples |
| [`software-architect`](software-architect.md) | core | Juan Carlos Cadavid — jcadavid.com (MIT) | Senior-architect Decision Spine: NFRs as measurable quality-attribute scenarios, tactics, robust-vs-lite tier sizing, architecture styles (hexagonal/clean/microservices), GoF pattern selection, C4 views + ADRs, agentic AI patterns | `/akili-constitution` Step 5 (required) and Step 6 tier handoff; `/akili-specify` Phase 2 for architecturally significant features |
| [`stitch-design`](stitch-design.md) | conditional | Google — google-labs-code | Stitch prompt enhancement and design generation workflows (fallback UI chain with `frontend-design`) | UI steps of `/akili-constitution`, `/akili-propose`, `/akili-specify` |
| [`systematic-debugging`](systematic-debugging.md) | core | Jesse Vincent — obra (MIT) | Root-cause investigation for bugs, test failures, unexpected behavior | `/akili-propose` Bug Track, `/akili-specify` Bug Mode, `/akili-test`, `/akili-validate`, `/akili-seo` |
| [`tailwind-design-system`](tailwind-design-system.md) | stack | Seth Hobson (MIT) | Tailwind CSS v4 tokens, component systems, responsive patterns | Skill Map; constitution/specify stack lists |
| [`ui-ux-pro-max`](ui-ux-pro-max.md) | conditional | nextlevelbuilder (MIT) | UI/UX design intelligence, palettes, typography, accessibility — AKILI's preferred UI/UX skill | UI steps of `/akili-constitution`, `/akili-specify`, `/akili-execute`, `/akili-test`, `/akili-validate`, `/akili-seo` |
| [`vercel-react-best-practices`](vercel-react-best-practices.md) | stack | Vercel (MIT) | React and Next.js performance and architecture guidance | Skill Map; constitution/specify/test stack lists |

## Usage Rules

- Use the task-specific skills listed in `tasks.md` during `/akili-execute`; when a task lists none, derive them from the project's `## Skill Map`.
- Use UI/UX skills when specs affect screens, flows, interactions, or accessibility (`ui-ux-pro-max` preferred; `frontend-design` + `stitch-design` as fallback).
- Use `gsap-animation` for animation work, reading only the `references/` file matching the task.
- Use `systematic-debugging` before proposing fixes for failures or unexpected behavior.
- Use stack skills only when the repository or task actually uses that framework — the project Skill Map is the source of truth.
- If a skill is unavailable in the host tool, fall back to the documented alternative and note the gap in the relevant report.
