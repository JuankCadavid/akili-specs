# `cognitive-doc-design`

## Purpose

Designs documentation that reduces cognitive load, using six patterns: lead with the answer, progressive disclosure, chunking, signposting, recognition over recall, and review empathy. AKILI generates many human-facing documents (PRD, TRD, requirements, reports, summaries) — this skill defines how to write them so readers scan, understand, and verify quickly. Authored by gentleman-programming (Apache-2.0).

## Use When

- Writing or upgrading any human-facing AKILI document: PRD, UX/UI design, TRD, requirements, design, reports, archive summaries.
- Writing PR descriptions and review notes during `/akili-execute` (its review-empathy rules reduce reviewer burnout).
- Any doc that currently feels long, dense, or hard to scan.

## Core Rules

- Put the decision, action, or outcome first — context comes after.
- Start with the happy path, then details, edge cases, and references.
- Group related information into small sections; keep flat lists short.
- Use headings, labels, callouts, and summaries as signposts.
- Prefer tables, checklists, examples, and templates over prose that must be remembered.
- For PRs: state what to review first, what is out of scope, and link chained PRs.

## Best Paired Commands

- `/akili-constitution` — writing `docs/prd.md`, the UX/UI design doc, and the TRD.
- `/akili-specify` — writing `requirements.md`, `design.md`, and `tasks.md`.
- `/akili-execute` — writing PR descriptions and review notes.
- `/akili-archive` — writing `archive-summary.md` and Kaizen log entries (one-point lessons are recognition over recall).

## Source

- `../../.claude/skills/cognitive-doc-design/SKILL.md`
