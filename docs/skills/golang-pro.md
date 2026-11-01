# `golang-pro`

> **Answer first.** A vendored Go skill (MIT, by Jeffallan), binding `stack`: it reaches an agent only through the project Skill Map or a per-task skill list, never through command text. It is pinned to one upstream commit and its body is hash-locked.

## Facts

| Field | Value |
|---|---|
| Author | GitHub user Jeffallan |
| License | MIT |
| Binding | `stack` |
| Upstream baseline | "Go 1.21+" (upstream's own statement in `SKILL.md`) |
| Pin | `078a25cc5bfd8011459be7b91d004e900c1d02d3` (the body is hash-locked; the pin moves only through a new AKILI spec) |
| Source | `../../.claude/skills/golang-pro/SKILL.md` |

## Purpose

Guides concurrent Go with goroutines and channels, microservices over gRPC or REST, performance work with pprof, and idiomatic Go with generics, interfaces and error handling. It also covers CLI tools, benchmarks and table-driven testing.

## Use When

- Designing or building Go services, CLIs or concurrent pipelines.
- Profiling or benchmarking Go code.
- Writing table-driven tests or fuzz tests.

## Best Paired Commands

- `/akili-specify` for backend design.
- `/akili-execute` for implementation.
- `/akili-test` for table-driven test coverage.

## Security Record

| Item | Record |
|---|---|
| AKILI verdict | Task T1 of spec `changes/go-backend-routing/golang-skill` found no injection or fetch-and-run instructions in the pinned content. |
| skills.sh skill page | Labelled "Fail" on skills.sh (https://skills.sh/jeffallan/claude-skills/golang-pro). |
| Trust Hub page | https://skills.sh/jeffallan/claude-skills/golang-pro/security/agent-trust-hub states Risk Level: CRITICAL (audited Oct 27, 2026). The page counts 2 flagged URLs and names 1. |
| Finding | `EXTERNAL_DOWNLOADS` (the finding quoted in the AKILI T1 record), on the documentation URL in the last line of `SKILL.md`: https://jeffallan.github.io/claude-skills/skills/language/golang-pro/, upstream's own GitHub Pages site. |
| Handling | The link is kept byte-identical and inert. AKILI adds no instruction to open it. |

This page claims no security property beyond the T1 verdict above. The full record is in `../../.claude/skills/golang-pro/NOTICE`.

## Optional complement: samber

[`samber/cc-skills-golang`](https://github.com/samber/cc-skills-golang) is an optional, separate Go skill set.

- You install it yourself with samber's own installer, for example `/plugin marketplace add samber/cc` then `/plugin install cc-skills-golang@samber` in Claude Code.
- Samber's advice (`README.md:143`): "Installing only a subset will give you a partial and potentially inconsistent view of the guidelines. For best results, install all general-purpose skills together."
- AKILI never vendors it.
