# Skills by stack

> **Answer first.** Find your language or framework below to see which skills AKILI ships for it. AKILI detects the stack from your manifests, so you rarely pick by hand: `/akili-constitution` writes the matches into the project `## Skill Map`. The rows and markers live in [`stack-detection.md`](../../.claude/skills/software-architect/references/stack-detection.md), the source of this page; if the two differ, the table wins.

Conditional skills `gsap-animation` and `impeccable` are also used on frontend stacks, chosen by the UI work rather than by a manifest.

## Go

- Skills: [`golang-pro`](golang-pro.md)
- Detected by: a `go.mod` file.
- Covers: concurrency, gRPC/REST services, generics, pprof, table-driven tests.

## Java / Spring Boot

- Skills: [`java-springboot`](java-springboot.md)
- Detected by: a Spring Boot marker in `pom.xml`, `build.gradle`, `build.gradle.kts` or `gradle/libs.versions.toml` (group `org.springframework.boot`, its plugin, or a `spring-boot-starter*` dependency). Java or Kotlin without that marker gets no skill.
- Covers: application code in Spring Boot 3/4 projects.

## NestJS

- Skills: [`nestjs-feature`](nestjs-feature.md), [`nestjs`](nestjs.md), [`nestjs-auth`](nestjs-auth.md), [`nestjs-data`](nestjs-data.md), [`nestjs-testing`](nestjs-testing.md), [`nestjs-production`](nestjs-production.md)
- Detected by: `@nestjs/core` in `package.json`.
- Covers: modules, endpoints and validation, auth, Drizzle/TypeORM, tests, production setup.

## Angular

- Skills: [`angular-developer`](angular-developer.md)
- Detected by: `@angular/core` in `package.json`.
- Covers: components, signals, forms, routing, SSR, testing.

## React / Next.js

- Skills: [`vercel-react-best-practices`](vercel-react-best-practices.md), [`react-doctor`](react-doctor.md)
- Detected by: `next` or `react-dom` in `package.json`. A `react` key alone (React Native, Expo) does not match.
- Covers: React and Next.js performance, and diagnostics after changes.

## Tailwind CSS

- Skills: [`tailwind-design-system`](tailwind-design-system.md)
- Detected by: `tailwindcss` in `package.json`.
- Covers: Tailwind v4 tokens and component patterns.

## shadcn/ui

- Skills: [`shadcn-ui`](shadcn-ui.md)
- Detected by: a `components.json` naming `ui.shadcn.com`, or carrying both `style` and `aliases`.
- Covers: installing and customizing shadcn/ui components.

## AWS serverless

- Skills: [`aws-serverless`](aws-serverless.md)
- Detected by, any of: SAM (`template.yaml` or `template.yml` with the `AWS::Serverless-2016-10-31` transform); Serverless Framework (`serverless.yml` or `serverless.yaml` with `provider.name: aws`); CDK (`cdk.json`, in any language).
- Covers: Lambda, API Gateway, DynamoDB, SQS/SNS. The CDK route rests on the skill's description, "SAM/CDK deployment"; its body has no CDK-specific content.

## Any stack

These apply from the design, never from a manifest.

| Skill | Binding | Applies when |
|---|---|---|
| [`api-design-principles`](api-design-principles.md) | stack | The project exposes an HTTP or GraphQL API |
| [`error-handling-patterns`](error-handling-patterns.md) | stack | Any backend |
| [`software-architect`](software-architect.md) | core | Architecture and TRD work |
| [`tdd`](tdd.md) | conditional | Logic-heavy tasks, assigned per task |
| [`systematic-debugging`](systematic-debugging.md) | core | Bugs, test failures, unexpected behavior |

## No packaged skill

Python, Rust, .NET, PHP, Ruby, and plain Java or Kotlin without a Spring Boot marker have no packaged skill. AKILI keeps scan evidence and your project conventions for them.

## Source of truth

[`stack-detection.md`](../../.claude/skills/software-architect/references/stack-detection.md) holds the rows. How skills are chosen and kept is in [governance](governance.md).
