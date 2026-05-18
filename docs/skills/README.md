# Skill Reference

JCSPECS ships Claude/OpenCode skills alongside the slash commands. Skills are loaded by the agent when a task needs domain-specific guidance.

The installable source files live in `.claude/skills/*/SKILL.md`. These pages are the human-facing reference.

## Skill Inventory

| Skill | Use For | Common Commands |
|---|---|---|
| [`angular-developer`](angular-developer.md) | Angular architecture, components, services, signals, forms, routing, testing, CLI | `/sdd-specify`, `/sdd-execute`, `/sdd-test`, `/sdd-validate` |
| [`api-design-principles`](api-design-principles.md) | REST and GraphQL API design and review | `/sdd-constitution`, `/sdd-specify`, `/sdd-validate` |
| [`aws-serverless`](aws-serverless.md) | Lambda, API Gateway, DynamoDB, SQS/SNS, SAM/CDK | `/sdd-constitution`, `/sdd-specify`, `/sdd-execute` |
| [`brainstorming`](brainstorming.md) | Clarifying ideas, scope, options, and trade-offs before implementation | `/sdd-propose`, `/sdd-specify` |
| [`error-handling-patterns`](error-handling-patterns.md) | Exceptions, Result patterns, graceful degradation, reliability | `/sdd-specify`, `/sdd-execute`, `/sdd-validate` |
| [`frontend-design`](frontend-design.md) | Distinctive frontend UI and UX implementation | `/sdd-constitution`, `/sdd-specify`, `/sdd-execute`, `/sdd-test` |
| [`gsap-core`](gsap-core.md) | Core GSAP tweens, easing, stagger, responsive and reduced-motion animation | `/sdd-specify`, `/sdd-execute` |
| [`gsap-frameworks`](gsap-frameworks.md) | GSAP in Vue, Nuxt, Svelte, SvelteKit, and other non-React frameworks | `/sdd-specify`, `/sdd-execute` |
| [`gsap-performance`](gsap-performance.md) | Smooth animation, transform-first motion, jank reduction | `/sdd-execute`, `/sdd-validate` |
| [`gsap-plugins`](gsap-plugins.md) | GSAP plugins such as ScrollTo, Flip, Draggable, SplitText, SVG plugins | `/sdd-specify`, `/sdd-execute` |
| [`gsap-react`](gsap-react.md) | GSAP in React and Next.js with cleanup and scoping | `/sdd-specify`, `/sdd-execute` |
| [`gsap-scrolltrigger`](gsap-scrolltrigger.md) | Scroll-driven animation, pinning, scrub, parallax | `/sdd-specify`, `/sdd-execute` |
| [`gsap-timeline`](gsap-timeline.md) | Sequenced animations and playback control | `/sdd-specify`, `/sdd-execute` |
| [`gsap-utils`](gsap-utils.md) | GSAP utilities such as clamp, mapRange, random, snap, wrap | `/sdd-execute` |
| [`nestjs-expert`](nestjs-expert.md) | NestJS modules, DI, guards, interceptors, testing, TypeORM/Mongoose | `/sdd-specify`, `/sdd-execute`, `/sdd-test`, `/sdd-validate` |
| [`product-manager-toolkit`](product-manager-toolkit.md) | Product discovery, PRDs, prioritization, customer interview analysis | `/sdd-constitution`, `/sdd-propose`, `/sdd-specify` |
| [`react-doctor`](react-doctor.md) | React diagnostics after changes | `/sdd-test`, `/sdd-validate` |
| [`shadcn-ui`](shadcn-ui.md) | shadcn/ui components, forms, themes, Tailwind integration | `/sdd-specify`, `/sdd-execute`, `/sdd-validate` |
| [`stitch-design`](stitch-design.md) | Stitch prompt enhancement and design generation workflows | `/sdd-constitution`, `/sdd-specify` |
| [`systematic-debugging`](systematic-debugging.md) | Bugs, test failures, unexpected behavior, root-cause investigation | `/sdd-execute`, `/sdd-test`, `/sdd-validate`, `/sdd-seo` |
| [`tailwind-design-system`](tailwind-design-system.md) | Tailwind CSS v4 tokens, component systems, responsive patterns | `/sdd-constitution`, `/sdd-specify`, `/sdd-execute` |
| [`ui-ux-pro-max`](ui-ux-pro-max.md) | UI/UX design intelligence, palettes, typography, accessibility, stacks | `/sdd-constitution`, `/sdd-specify`, `/sdd-execute`, `/sdd-test`, `/sdd-validate` |
| [`vercel-react-best-practices`](vercel-react-best-practices.md) | React and Next.js performance and architecture guidance | `/sdd-specify`, `/sdd-execute`, `/sdd-test`, `/sdd-validate` |

## Usage Rules

- Use the task-specific skills listed in `tasks.md` during `/sdd-execute`.
- Use UI/UX skills when specs affect screens, flows, interactions, or accessibility.
- Use `systematic-debugging` before proposing fixes for failures or unexpected behavior.
- Use framework skills only when the repository or task actually uses that framework.
- If a skill is unavailable in the host tool, fall back to the documented alternative and note the gap in the relevant report.
