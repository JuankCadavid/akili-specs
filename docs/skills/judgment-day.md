# `judgment-day`

## Purpose

Provides a blind adversarial dual-review framework for design decisions. Two independent "judges" evaluate a design without seeing each other's feedback, then findings are reconciled. Supports up to two scoped fix/re-judgment rounds.

## Use When

- Reviewing design decisions during `/akili-specify` before proceeding to tasks.
- Evaluating architectural choices that need adversarial scrutiny.
- When the design phase approval menu offers "Review Design" and the user selects it.

## Core Rules

- Two judges operate independently and cannot see each other's output.
- Each judge produces structured findings with severity levels.
- Findings are reconciled after both judges report.
- A maximum of two fix/re-judgment rounds prevents infinite loops.
- If judges detect issues that need correction, the user can choose to fix, skip, or re-scope.

## Best Paired Commands

- `/akili-specify` — design phase approval menu includes judgment-day as an explicit review option.
- `/akili-validate` — when validation reveals design-level concerns that need adversarial review.

## Source

- `../../.claude/skills/judgment-day/SKILL.md`
