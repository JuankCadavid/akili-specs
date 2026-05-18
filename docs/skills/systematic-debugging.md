# `systematic-debugging`

## Purpose

Enforces root-cause debugging before proposing fixes for bugs, test failures, build failures, integration issues, performance problems, or unexpected behavior.

## Use When

- Any test, build, or validation check fails.
- Production or local behavior is unexpected.
- A previous fix did not work.
- A multi-component issue needs data-flow tracing.

## Core Rule

No fixes without root-cause investigation first.

## Best Paired Commands

- `/sdd-execute` when implementation hits failures.
- `/sdd-test` when tests fail or coverage is unclear.
- `/sdd-validate` when conformance checks fail.
- `/sdd-seo` when GSC or index data is inconsistent.

## Source

- `../../.claude/skills/systematic-debugging/SKILL.md`
