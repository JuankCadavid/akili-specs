# `java-springboot`

> **Answer first.** A vendored Spring Boot skill (MIT, copyright GitHub, Inc.), binding `stack`: it reaches an agent only through the project Skill Map or a per-task skill list, never through command text. It is pinned to one upstream commit. AKILI adds frontmatter lines only.

## Facts

| Field | Value |
|---|---|
| Author and holder | `github/awesome-copilot` contributors; copyright holder GitHub, Inc. Upstream declares no author: the `metadata.author` line is an AKILI addition |
| License | MIT |
| Binding | `stack` |
| Upstream tested versions | Spring Boot 4.1.1 (Spring Framework 7) and, where they differ, Boot 3.5.16 (Framework 6.2), as upstream's `SKILL.md` states |
| Pin | `93fc8b9ee3ef56b9b5e7261e6ce92d314cb2c1cf` (moves only through a new AKILI spec) |
| Source | `../../.claude/skills/java-springboot/SKILL.md` |

## Purpose

Guides application code in an existing Spring Boot 3/4 project: controllers, validation and `ProblemDetail` errors, Spring Data JPA/JDBC, `RestClient` and HTTP interfaces, configuration properties, Kafka/AMQP, caching, scheduling, virtual threads, and AOT and startup tuning. To scaffold a new project, upstream points to `create-spring-boot-java-project` (see the sibling note below).

## When it routes

AKILI routes to this skill only when a build file carries a Spring Boot marker. The markers, the manifests they sit in, and the read rules are in `../../.claude/skills/software-architect/references/stack-detection.md`, which is the one place that defines them.

- A plain Java or Kotlin project with no Spring marker gets no packaged skill. The step asks the user before recording that, because a marker can sit in a `buildSrc` or convention plugin the table does not read.
- A Java CDK app with no Spring marker reports `Java - no packaged skill` plus the AWS serverless: CDK row.

## Best Paired Commands

- `/akili-specify` for backend design.
- `/akili-execute` for implementation.
- `/akili-test` for tests.

## Security Record

| Item | Record |
|---|---|
| AKILI verdict | Reviewed at the pin: the pre-check in the spec found the seven pinned files acceptable, and each file was re-hashed before it was copied. |
| Gen Agent Trust Hub | Pass, Risk Level SAFE (audited 2026-11-11). One finding, `INDIRECT_PROMPT_INJECTION`: the skill reads `pom.xml`, `build.gradle(.kts)` and `application.properties/yml` with no boundary markers. |
| Socket | Pass (audited 2026-11-18). The audited hash is `a607aad8679d`, not the AKILI pin. |
| Snyk | Pass, Risk LOW, "No issues detected". |
| Ratings source | skills.sh pages for `github/awesome-copilot/java-springboot`, fetched 2026-11-25. |

This page claims no security property beyond the verdict and the ratings above. The full record is in `../../.claude/skills/java-springboot/NOTICE`.

## Optional complement: seven sibling skills

Upstream `github/awesome-copilot` has seven sibling skills this skill can hand off to. They are optional.

| Sibling |
|---|
| `java-hibernate-jpa` |
| `spring-boot-testing` |
| `spring-security` |
| `spring-observability` |
| `create-spring-boot-java-project` |
| `java-add-graalvm-native-image-support` |
| `spring-boot-4-migration` |

- You install a sibling yourself: `npx skills add https://github.com/github/awesome-copilot --skill <name>`.
- Without them, `java-springboot` falls back to the official Spring documentation.
- AKILI never vendors them and never installs them.
