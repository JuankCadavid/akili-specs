# `judgment-day`

## Purpose

Provides a blind adversarial dual-review framework for design decisions. Two independent "judges" evaluate a design without seeing each other's feedback, then findings are reconciled. Supports up to two scoped fix/re-judgment rounds.

AKILI-adapted: the findings ledger persists as `docs/specs/<spec-path>/judgment.md`, judges should run on a model different from the design author (author ≠ auditor), and severe findings feed the Kaizen retrospective. Authored by gentleman-programming (Apache-2.0). Binding: `core`.

## Use When

- Reviewing design decisions during `/akili-specify` before proceeding to tasks.
- Evaluating architectural choices that need adversarial scrutiny.
- When the design phase approval menu offers "Review Design" and the user selects it.

## Core Rules

- Before any other reading, each judge attacks the design's **Premise Ledger** at its source — re-running or re-reading every citation, trying to refute every `UNVERIFIED` row by its own search, and hunting premises the design depends on that carry no row; agreement between the requirements and the design never settles a premise, only the source does.
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
