# `gsap-animation`

## Purpose

Unified GSAP animation skill — the fusion of the former 8 `gsap-*` sibling skills into one conditional skill with progressive disclosure. The `SKILL.md` is a compact core + router (tweens, easing, stagger, registration, reduced-motion rules) and a routing table pointing to `references/` files: `timeline`, `scrolltrigger`, `plugins`, `react`, `frameworks`, `performance`, `utils`.

Original content by GSAP (GreenSock), MIT. Adapted for AKILI-SPECS by Juan Carlos Cadavid — jcadavid.com.

Which activities it serves is decided in the routing matrix, `impeccable-bridge` → `references/design-routing.md`.

## Use When

- A spec or task involves animation: tweens, timelines, scroll-driven effects, motion design, SVG animation.
- Working with GSAP in React/Next.js, Vue, Nuxt, Svelte, or vanilla JS.
- Diagnosing janky animation or animation performance issues.

Load the skill, then read only the reference file(s) matching the task — never all of them.

## Binding

`conditional` — `/akili-specify` and `/akili-execute` load it when the work involves animation. It is not stack-bound: it applies to any frontend stack using GSAP.

## Best Paired Commands

- `/akili-specify` for designing animation behavior in `requirements.md`/`design.md`.
- `/akili-execute` for Implementer tasks that write animation code (plus the matching reference).
- `/akili-validate` for animation performance findings (via `references/performance.md`).

## Source

- `../../.claude/skills/gsap-animation/SKILL.md`
