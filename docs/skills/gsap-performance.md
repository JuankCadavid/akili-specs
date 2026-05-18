# `gsap-performance`

## Purpose

Optimizes GSAP animation performance by preferring transforms, avoiding layout thrashing, batching work, and reducing jank.

## Use When

- Animations feel choppy or miss 60fps.
- Reviewing animation implementation for performance risk.
- Choosing between animating transforms, opacity, layout properties, or SVG attributes.
- Adding `will-change`, batching, or layout-safe animation patterns.

## Best Paired Commands

- `/sdd-execute` for animation implementation.
- `/sdd-validate` for animation performance review.

## Source

- `../../.claude/skills/gsap-performance/SKILL.md`
