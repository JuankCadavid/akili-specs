# `kaizen`

**Author:** Juan Carlos Cadavid — [jcadavid.com](https://jcadavid.com)

## Purpose

Turns the Japanese Kaizen philosophy of continuous improvement into an executable, bounded retrospective: **Measure → Learn → Standardize → Record**. Every archived spec leaves the project — and the methodology itself — slightly better than it found them. Inspired by the Kaizen Institute glossary (kaizen.com), Robert Maurer's small-steps method, and INTI's *Emprendiendo Kaizen* (2019).

## Use When

- `/akili-archive` reaches its **Kaizen Retrospective** step (the primary, automatic trigger).
- The user explicitly requests a kaizen retrospective or continuous-improvement pass over a spec or project.

## Core Rules

- **Measure** hunts MUDA (waste) in the spec's own evidence: Reviewer rework attempts, pivots, PRODUCT_BUGs, severe judgment-day findings, validation WARN/FAIL, quick escalations, drift.
- **Learn** distills 0–3 lessons; each names a root cause (5W1H) and cites evidence (Gemba: real facts, never speculation). Generic lessons are banned; prefer zero over filler. Lessons target the **Product** or the **Methodology** (flagged for upstreaming to the AKILI repo).
- **Standardize** proposes one minimal edit (1–3 lines) per lesson to the most durable home; every edit outside the kaizen log requires human approval via a numbered menu.
- **Record** appends to the accumulative `docs/specs/kaizen-log.md`; the `## Active Lessons` digest is capped at 10 rows and institutionalized lessons are retired.
- The retrospective **never blocks the archive** — missing inputs or a declined menu produce a metrics-only or clean-run entry.

## Best Paired Commands

- `/akili-archive` — runs the retrospective automatically as its Kaizen Retrospective step.
- `/akili-propose`, `/akili-specify`, `/akili-execute` — read the `## Active Lessons` digest so past mistakes shape new work.
- `/akili-resume` — shows the active-lesson count in the dashboard.

## Source

- `../../.claude/skills/kaizen/SKILL.md`
