# Skill Reference

AKILI ships Claude/OpenCode skills alongside the slash commands. Skills are loaded by the agent when a task needs domain-specific guidance.

The installable source files live in `.claude/skills/*/SKILL.md`. These pages are the human-facing reference.

## Skill Inventory

| Skill | Use For | Common Commands |
|---|---|---|
| [`angular-developer`](angular-developer.md) | Angular architecture, components, services, signals, forms, routing, testing, CLI | `/akili-specify`, `/akili-execute`, `/akili-test`, `/akili-validate` |
| [`api-design-principles`](api-design-principles.md) | REST and GraphQL API design and review | `/akili-constitution`, `/akili-specify`, `/akili-validate` |
| [`aws-serverless`](aws-serverless.md) | Lambda, API Gateway, DynamoDB, SQS/SNS, SAM/CDK | `/akili-constitution`, `/akili-specify`, `/akili-execute` |
| [`brainstorming`](brainstorming.md) | Clarifying ideas, scope, options, and trade-offs before implementation | `/akili-propose`, `/akili-specify` |
| [`cognitive-doc-design`](cognitive-doc-design.md) | Writing human-facing docs that reduce cognitive load (lead with the answer, progressive disclosure, tables over prose) | `/akili-constitution`, `/akili-specify`, `/akili-execute` (PR docs), `/akili-archive` |
| [`error-handling-patterns`](error-handling-patterns.md) | Exceptions, Result patterns, graceful degradation, reliability | `/akili-specify`, `/akili-execute`, `/akili-validate` |
| [`frontend-design`](frontend-design.md) | Distinctive frontend UI and UX implementation | `/akili-constitution`, `/akili-specify`, `/akili-execute`, `/akili-test` |
| [`gsap-core`](gsap-core.md) | Core GSAP tweens, easing, stagger, responsive and reduced-motion animation | `/akili-specify`, `/akili-execute` |
| [`gsap-frameworks`](gsap-frameworks.md) | GSAP in Vue, Nuxt, Svelte, SvelteKit, and other non-React frameworks | `/akili-specify`, `/akili-execute` |
| [`gsap-performance`](gsap-performance.md) | Smooth animation, transform-first motion, jank reduction | `/akili-execute`, `/akili-validate` |
| [`gsap-plugins`](gsap-plugins.md) | GSAP plugins such as ScrollTo, Flip, Draggable, SplitText, SVG plugins | `/akili-specify`, `/akili-execute` |
| [`gsap-react`](gsap-react.md) | GSAP in React and Next.js with cleanup and scoping | `/akili-specify`, `/akili-execute` |
| [`gsap-scrolltrigger`](gsap-scrolltrigger.md) | Scroll-driven animation, pinning, scrub, parallax | `/akili-specify`, `/akili-execute` |
| [`gsap-timeline`](gsap-timeline.md) | Sequenced animations and playback control | `/akili-specify`, `/akili-execute` |
| [`gsap-utils`](gsap-utils.md) | GSAP utilities such as clamp, mapRange, random, snap, wrap | `/akili-execute` |
| [`kaizen`](kaizen.md) | Bounded continuous-improvement retrospective (Measure → Learn → Standardize → Record); authored by Juan Carlos Cadavid — jcadavid.com | `/akili-archive` |
| [`nestjs-expert`](nestjs-expert.md) | NestJS modules, DI, guards, interceptors, testing, TypeORM/Mongoose | `/akili-specify`, `/akili-execute`, `/akili-test`, `/akili-validate` |
| [`product-manager-toolkit`](product-manager-toolkit.md) | Product discovery, PRDs, prioritization, customer interview analysis (AKILI-adapted: canonical PRD structure, RICE for scope-chunk ordering) | `/akili-constitution`, `/akili-propose`, `/akili-specify` |
| [`react-doctor`](react-doctor.md) | React diagnostics after changes | `/akili-test`, `/akili-validate` |
| [`seo-audit`](seo-audit.md) | Technical, on-page, and international SEO audits with a standard finding format | `/akili-seo`, `/akili-validate` |
| [`shadcn-ui`](shadcn-ui.md) | shadcn/ui components, forms, themes, Tailwind integration | `/akili-specify`, `/akili-execute`, `/akili-validate` |
| [`stitch-design`](stitch-design.md) | Stitch prompt enhancement and design generation workflows | `/akili-constitution`, `/akili-specify` |
| [`systematic-debugging`](systematic-debugging.md) | Bugs, test failures, unexpected behavior, root-cause investigation | `/akili-execute`, `/akili-test`, `/akili-validate`, `/akili-seo` |
| [`tailwind-design-system`](tailwind-design-system.md) | Tailwind CSS v4 tokens, component systems, responsive patterns | `/akili-constitution`, `/akili-specify`, `/akili-execute` |
| [`ui-ux-pro-max`](ui-ux-pro-max.md) | UI/UX design intelligence, palettes, typography, accessibility, stacks | `/akili-constitution`, `/akili-specify`, `/akili-execute`, `/akili-test`, `/akili-validate` |
| [`vercel-react-best-practices`](vercel-react-best-practices.md) | React and Next.js performance and architecture guidance | `/akili-specify`, `/akili-execute`, `/akili-test`, `/akili-validate` |

## Usage Rules

- Use the task-specific skills listed in `tasks.md` during `/akili-execute`.
- Use UI/UX skills when specs affect screens, flows, interactions, or accessibility.
- Use `systematic-debugging` before proposing fixes for failures or unexpected behavior.
- Use framework skills only when the repository or task actually uses that framework.
- If a skill is unavailable in the host tool, fall back to the documented alternative and note the gap in the relevant report.
