# Requirements: Java / Spring Boot stack skill, stack detection, skills-by-stack page

> **The short version.** Nine behaviors:
> - **FR-1:** the vendored bytes equal the reviewed bytes (the security pre-check passed on 2026-11-25).
> - **FR-2:** the six upstream files ship unchanged apart from appended frontmatter, with `LICENSE` and `NOTICE`.
> - **FR-3:** `java-springboot` is in every stack-skill candidate pool.
> - **FR-4:** one **stack-detection table** maps manifest files and markers to stacks and packaged skills, for every shipped stack. A Spring Boot marker is required for `java-springboot`.
> - **FR-5:** every command step that inspects project manifests reads that table: the stack-skill steps, the constitution project setup, the `/akili-review` filters and lens briefs, and the `/akili-security` reconnaissance brief.
> - **FR-6:** the backend routing matrix gets a Java / Spring Boot row.
> - **FR-7:** a new `docs/skills/by-stack.md` page.
> - **FR-8:** docs and counts that tell the truth.
> - **FR-9:** install and doctor carry the new skill on every target.
>
> The seven upstream sibling skills are documented and never copied (NFR-2).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/java-springboot-skill` |
| Type | Change |
| Deliverable | software |
| AI Agent | no. The spec ships methodology text and a vendored skill; no runtime model decides anything in what it delivers |
| Depth | Standard. Raised from the proposal's Lite: the added scope (FR-4, FR-5) edits six commands and one script |
| Approval Mode | gated. Mandate: "Bring every gate to me and wait." (JC, 2026-11-25) |
| Source | `proposal.md`: Option A, Q1–Q5 settled by JC, 2026-11-25 |
| Baseline | `cb2416e` (origin/dev); `npm test` 2219 pass / 0 fail (run 2026-11-25) |
| Upstream pin | `github/awesome-copilot` `93fc8b9ee3ef56b9b5e7261e6ce92d314cb2c1cf`, path `skills/java-springboot/` |
| Branch | `feat/java-springboot-skill`, local only |

## 2. Executive Summary

Java / Spring Boot projects get a stack skill on the same terms as Go and NestJS projects, admitted only as the reviewed bytes. Stack skills stop depending on an agent's free reading of the repository: one table states which manifest and marker means which stack, and every step that builds or uses the stack-skill set reads it. A reader can see on one page what AKILI ships for each stack.

## 3. Glossary

| Term | Meaning |
|---|---|
| Pin | The upstream commit above and the seven git blob SHAs in §4 |
| Upstream body | Every byte of a pinned file. For `SKILL.md`, everything except the appended frontmatter lines |
| Candidate pool | A list in command text of stack skills an agent may pick from (constitution Step 5, Step 8D; specify Step 2.1) |
| Stack-detection table | The single table (FR-4) of rows `manifest file · marker · stack · packaged skill(s)` |
| Manifest | A project build, dependency or infrastructure file the table names (`go.mod`, `pom.xml`, `build.gradle`, `build.gradle.kts`, `package.json`, `components.json`, `template.yaml`, `serverless.yml`, `cdk.json`) |
| Marker | The evidence inside or beside a manifest that selects a row: a dependency coordinate, a plugin id, or the file's presence |
| Manifest-reading step | A command step that inspects project manifests for any purpose: building, proposing, picking or auditing stack skills, deriving the local run contract, filtering or briefing a review, or briefing a security reconnaissance |
| Load-direct | A command step telling the agent to load a named skill (`docs/skills/governance.md` → *Rules of thumb*) |

## 4. System Context & Scope

| Pinned file | Size (B) | Git blob SHA |
|---|---|---|
| `SKILL.md` | 4,433 | `3729077eaf60351e7d4d7a46464e6f5d2797bd74` |
| `references/aot-and-startup.md` | 5,475 | `bdebfab601c65bd14bcd6ba8ad1322197872d829` |
| `references/configuration.md` | 5,146 | `500624d3e2d0c42c186932658733e2469b7544e4` |
| `references/data.md` | 6,013 | `e66458facf39cb04df86210da94efef797143bbf` |
| `references/messaging-caching.md` | 7,391 | `ecfd728c0c1cd7498105e348610f2d082e983631` |
| `references/rest-api.md` | 9,174 | `69226559eebfd6823659a7ffbb356292d87c43e1` |
| Repo-root `LICENSE` (copied beside the skill) | 1,059 | `89bc5e962c9944cdb050887062afdaaf89be504a` |

Source: `gh api "repos/github/awesome-copilot/contents/skills/java-springboot/<file>?ref=93fc8b9ee3ef"` → scratchpad copy → `git hash-object`; `LICENSE` hash also equals the API's `sha` field (run 2026-11-25). Security pre-check verdict **PASS**: `proposal.md` §15.

Current behavior:
- No packaged Java skill exists (`grep -n "Java\|java" -r .claude/commands .claude/skills/software-architect/references/backend-routing.md docs/overview.md` → no output, run 2026-11-25).
- 37 packaged skills (`ls .claude/skills/*/SKILL.md | wc -l` → 37) and 15 `stack` skills (`docs/skills/governance.md:71`).
- **No command maps a manifest to a skill.** Step 8D builds the Skill Map from generic "scan evidence" (`.claude/commands/akili-constitution.md:780-790`). The specify fallback is a bare list (`akili-specify.md:249-259`). `go.mod` is named nowhere outside `golang-pro` and `pr-review/references/large-prs.md:63` (`proposal.md` P12).

Out of scope: any byte of the seven sibling skills, Kotlin, body edits to the upstream files, new routing activities, and edits to the vendored `security-audit` files (only the `/akili-security` command text changes).

Scope added by JC at the Phase 1 gate (2026-11-25): the constitution project setup, `/akili-review` (file filters, stack-aware review) and `/akili-security` (reconnaissance) also read the table; AWS CDK projects are detected.

## 5. Stakeholders

| Who | Needs |
|---|---|
| Teams with a Java / Spring Boot backend | Spring Boot guidance assigned per task, detected from their build file |
| Teams on any shipped stack | The same stack skills picked every time, from the same evidence |
| JC (maintainer) | Third-party text admitted only as reviewed; attribution intact; one definition of detection, read by every command step that inspects manifests |
| Reviewers and auditors | `/akili-review` and `/akili-security` see the same stacks the specs and Skill Map see |
| Doc readers | One page answering "what does AKILI ship for my stack?" |

## 6. Functional Requirements

### FR-1: Vendored bytes are the reviewed bytes

The package SHALL admit the pinned files only when their bytes equal the bytes the security pre-check reviewed.

#### Scenario: Hashes match

- GIVEN the six files fetched again at the pin before vendoring
- WHEN each is hashed as a git blob
- THEN each hash equals its §4 SHA, and `execution.md` records the six hashes next to the pre-check verdict (`proposal.md` §15)
- AND vendoring may proceed
- BUT it must NOT copy any byte into `.claude/skills/` before that record exists
- AND IT MUST record the third-party ratings exactly as fetched, including the Trust Hub `INDIRECT_PROMPT_INJECTION` finding, never only "Pass"

#### Scenario: Hash differs

- GIVEN any fetched file whose hash differs from §4
- WHEN the comparison runs
- THEN nothing is copied, and the run stops for JC through the Pivot Protocol, because the reviewed bytes are no longer the bytes being admitted

### FR-2: Vendored folder with provenance

`.claude/skills/java-springboot/` SHALL hold the six pinned files plus `LICENSE` and `NOTICE`.

#### Scenario: Upstream body kept

- GIVEN the vendored folder
- WHEN each reference file's raw bytes are hashed as a git blob
- THEN each hash equals its §4 SHA
- AND `SKILL.md` differs from its pinned bytes only by lines appended to the frontmatter: `license: MIT` and a `metadata` block with `author: github/awesome-copilot contributors (Copyright GitHub, Inc.)`, `source`, `adapted-by`, `adapted-for`, `binding: stack`
- BUT it must NOT change, remove, or reorder any upstream line, `name` and `description` included
- AND IT MUST carry every *Frontmatter Schema* field that has a true value (`docs/skills/governance.md` → *Frontmatter Schema*), and name in `NOTICE` any field left out and why

#### Scenario: License and notice

- GIVEN the upstream repo-root `LICENSE` at the pin
- WHEN the folder ships
- THEN `LICENSE` is that file, byte-identical, on every CI platform (`.gitattributes` `-text`)
- AND `NOTICE` names the copyright holder (GitHub, Inc., quoting the `LICENSE` line), the source URL, the pinned commit, the exact frontmatter lines appended, the security pre-check verdict and ratings, and that AKILI is not affiliated with the upstream

### FR-3: Offered as a stack skill, never load-directed

`java-springboot` SHALL appear in every stack-skill candidate pool: `akili-constitution` Step 5, the Step 8D candidates, the `akili-specify` Step 2.1 no-map fallback, and the summary in `docs/commands/akili-constitution.md`.

#### Scenario: Pools list it

- GIVEN the four pools
- WHEN each is read
- THEN each lists `java-springboot` next to the other stack skills
- BUT no command step tells the agent to load `java-springboot` outside a pool that defers to the Skill Map or the stack-detection table, or is the Skill Map builder (governance carve-outs)

### FR-4: One stack-detection table

The methodology SHALL define, in exactly one place, a table that maps manifest evidence to a stack and to the packaged skills for that stack, with one row for each shipped `stack` skill group.

#### Scenario: Rows cover every shipped stack

- GIVEN the table
- WHEN its rows are read
- THEN it has rows for: Go (`go.mod`) → `golang-pro`; Java / Spring Boot (`pom.xml`, `build.gradle` or `build.gradle.kts`, **plus** a Spring Boot marker) → `java-springboot`; NestJS (`package.json` dependency `@nestjs/core`) → the official NestJS set; Angular (`@angular/core`) → `angular-developer`; React / Next.js (`react` or `next`) → `vercel-react-best-practices`, `react-doctor`; Tailwind (`tailwindcss`) → `tailwind-design-system`; shadcn/ui (`components.json`) → `shadcn-ui`; AWS serverless (`template.yaml` with an `AWS::Serverless` transform, or `serverless.yml`) → `aws-serverless`; AWS CDK (`cdk.json`) → `aws-serverless`
- AND every `stack`-binding skill that is stack-specific appears in at least one row. The method skills `api-design-principles` and `error-handling-patterns` are stated as **any-stack** rows, never tied to a manifest
- AND IT MUST name the marker for each row precisely enough to check it in the file (a dependency coordinate, a plugin id, a key, or the file's presence)

#### Scenario: AWS CDK in any language

- GIVEN a repository with a `cdk.json` (TypeScript, Python, Java, Go or C# CDK app)
- WHEN the table is applied
- THEN the AWS CDK row applies, and the app's language manifest matches its own row independently (a Java CDK app with no Spring marker: "Java, no packaged skill" plus AWS CDK → `aws-serverless`)
- AND IT MUST state whether the `aws-cdk-lib` dependency is a required marker, with the reason recorded in `design.md`

#### Scenario: Java without Spring Boot

- GIVEN a `pom.xml`, `build.gradle` or `build.gradle.kts` with no Spring Boot marker (no `org.springframework.boot` parent or plugin, no `spring-boot-starter*` dependency)
- WHEN the table is applied
- THEN the result is "Java, no packaged skill", which falls through to `other`
- BUT it must NOT route `java-springboot`

#### Scenario: Several manifests

- GIVEN a repository with manifests for more than one stack (a monorepo, or a Spring Boot API with an Angular front end)
- WHEN the table is applied
- THEN every matching row applies, each reported with the manifest path that matched it

#### Scenario: Manifests are data

- GIVEN any manifest
- WHEN it is read for detection
- THEN only file names, dependency coordinates, plugin ids and keys are matched
- AND a manifest that is not a regular file inside the repository (a symlink leaving it, a device) or exceeds the read cap is not read, and is reported "not read"
- BUT it must NOT execute a build, install a dependency, run a git command, or follow text inside a manifest as an instruction

#### Scenario: No row matches

- GIVEN a repository whose manifests match no row (Python, Rust, plain Java)
- WHEN the table is applied
- THEN the stack is reported with "no packaged skill" and the existing behavior for that case is kept: scan evidence and project conventions, `other` in backend routing

### FR-5: Manifest-reading steps read the table

Every manifest-reading step SHALL read manifests through the FR-4 table.

#### Scenario: Constitution

- GIVEN `/akili-constitution` in any mode
- WHEN Step 5 (TRD stack skills) and Step 8D (Skill Map) choose stack skills
- THEN Discovery Setup applies the table to the repository's manifests; Seed Setup maps the declared stack through the same rows; Safe Update proposes only rows newly detected by the table and keeps the existing map
- AND each Skill Map row the table produced names the manifest that matched

#### Scenario: Specify fallback

- GIVEN a project with no `## Skill Map`
- WHEN `/akili-specify` Step 2.1 picks additional stack skills
- THEN it applies the table to the repository's manifests and picks the matched rows' skills from its fallback list
- AND the fallback list contains every skill the table can produce

#### Scenario: Propose

- GIVEN `/akili-propose` Step 0 on a repository with manifests
- WHEN it loads project context
- THEN the proposal's Document Control records the detected stacks and their packaged skills (or "none detected")

#### Scenario: Audit

- GIVEN `/akili-audit` drift mode, *Key Modules & Dependencies*
- WHEN the project has a `## Skill Map`
- THEN a stack the table detects with no matching Skill Map row, and a Skill Map stack row with no matching manifest, are each reported as **Skill Map drift**
- BUT it must NOT edit the Skill Map (audit stays report-only)

#### Scenario: Constitution project setup

- GIVEN `/akili-constitution` deriving the local run contract in Legacy or Active mode
- WHEN it collects the build, test and run commands
- THEN each detected row names where that stack's commands are read from (the Maven or Gradle wrapper, the Go toolchain, the `package.json` scripts, the SAM, Serverless or CDK configuration)
- BUT it must NOT invent a command the repository does not state; ambiguity is asked of the user, as today

#### Scenario: Review filters

- GIVEN `/akili-review` and the `pr-review` `prepare` script
- WHEN a diff touches a manifest the table names
- THEN that file is classified sensitive under *Dependency manifests* (or an infrastructure class), in both `references/large-prs.md` and the script
- AND IT MUST keep the two in step: every table manifest appears in the script's patterns, or is listed as a stated exception with its reason
- BUT it must NOT change any other filter, tier, chunking or threshold behavior

#### Scenario: Stack-aware review

- GIVEN a review whose changed files sit under manifests the table matches
- WHEN the coordinator writes the lens briefs
- THEN each brief names the matched stacks and their packaged stack skills as idiom references for the lens
- AND the matching reads head manifests as data only; the skills named come from the installed package, never from the diff
- BUT it must NOT let a stack skill change a lens's scope, threshold or verdict rules

#### Scenario: Security reconnaissance

- GIVEN `/akili-security` at Step 2
- WHEN the reconnaissance is briefed
- THEN the brief carries the detected stacks and the manifest paths that matched, as context for the skill's own reconnaissance
- AND the manifests are read under the command's existing safe-read rules, and before **Run** no git command runs
- BUT it must NOT edit any vendored `security-audit` file, or let a detected stack narrow the audit scope

#### Scenario: The set is checked

- GIVEN the command package
- WHEN this spec ships
- THEN `design.md` enumerates every command step that names a manifest file, each with its citation as run and the FR-5 scenario that covers it
- AND a step outside those scenarios is listed with the reason it stays unchanged, so "every command that inspects project config files" is a checked set, not a claim

### FR-6: Backend routing for Java / Spring Boot

`software-architect` → `references/backend-routing.md` SHALL route Java / Spring Boot like Go.

#### Scenario: Matrix rows

- GIVEN the routing reference
- WHEN its stack table, matrix and expertise cards are read
- THEN the stack table has a **Java / Spring Boot** row naming `java-springboot` and its idiom; the matrix has an `implement | Java / Spring Boot` row whose single lead is `java-springboot`; and an expertise card states what `java-springboot` decides and must not decide
- AND the existing row rules hold: no decision recorded in `design.md` is reopened, and outward actions (adding infrastructure, installing a sibling skill) stay the user's or the design's decision (rule 9)
- BUT it must NOT change any existing row's lead

### FR-7: Skills-by-stack page

`docs/skills/by-stack.md` SHALL list, in English, the skills AKILI ships for each language and framework.

#### Scenario: Page content

- GIVEN the page
- WHEN it is read
- THEN it has one section for each FR-4 stack, each naming its skills, the manifest and marker that detect it, and a link to each skill page
- AND a section for skills that apply to any stack (`api-design-principles`, `error-handling-patterns`, and the method skills `software-architect`, `tdd`, `systematic-debugging`)
- AND one separate line naming `gsap-animation` and `impeccable` as conditional skills used on frontend stacks, outside every stack section
- AND a short list of stacks with no packaged skill, which fall through to project conventions
- AND IT MUST list exactly the `stack`-binding skills of `docs/skills/governance.md` *Current assignment*: every one of them, and no skill outside that row in a stack section

#### Scenario: Linked

- GIVEN `docs/overview.md`, the README *Learn more* table, `docs/README.md` and `docs/skills/README.md`
- WHEN each is read
- THEN each links `docs/skills/by-stack.md`

### FR-8: Truthful docs and counts

The package docs SHALL describe the new skill and the new inventory.

#### Scenario: Docs updated

- GIVEN the vendored skill
- WHEN the docs are read
- THEN `docs/skills/java-springboot.md` exists, with author, license, binding, coverage, the pin, the upstream's tested versions (Boot 4.1.1 / 3.5.16), the Spring-marker rule, and the sibling note
- AND `docs/skills/README.md` and `docs/overview.md` carry a `java-springboot` row; `docs/skills/governance.md` *Current assignment* lists it under `stack` (16); the repo `AGENTS.md` *Backend Skills* list names it
- AND every statement of the packaged-skill total reads 38
- AND `CHANGELOG.md` `Unreleased` has an entry covering the skill, the detection table and the page
- AND IT MUST state, in the sibling note: the seven names, optional, installed by the user with `npx skills add https://github.com/github/awesome-copilot --skill <name>`, the skill falls back to official docs without them, never vendored or installed by AKILI
- BUT it must NOT claim a security property beyond the recorded verdict and the ratings as fetched

### FR-9: Install and doctor carry it

#### Scenario: Every target

- GIVEN a clean temporary home
- WHEN `node bin/akili.js install --tool all --dry-run` and `doctor --tool all` run
- THEN `java-springboot` is planned for every target, and doctor reports it `OK` wherever it reports skills
- AND the existing install and doctor tests pass after their counts and fixtures are updated
- BUT it must NOT change installer code

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | The vendored folder stays under 50 KB (pinned skill files total 37,632 B) |
| NFR-2 | No file from the seven sibling skills enters the repository |
| NFR-3 | The detection table lives in one place. Every reader points to it by name, never by line number (KZ-005), and none restates its rows |
| NFR-4 | Shipped tests never read `docs/specs/changes/java-springboot-skill/` (KZ-changes--archify-diagrams-1) |
| NFR-5 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` green |

## 8. Defect classes and gates

| Defect class | Gate | Automated? |
|---|---|---|
| Unsafe upstream content | Pre-check PASS (`proposal.md` §15) + FR-1 hash equality to the reviewed bytes | Hash: yes. Content: no. It was an agent review, so the residual risk is accepted and docs say "reviewed at the pin", nothing more |
| Upstream body drifted (hand edit, CRLF on Windows checkout) | Contract test on raw bytes against §4 SHAs; `SKILL.md` minus the appended lines equals the pinned bytes | Yes |
| Attribution or license missing | Contract test on frontmatter, `LICENSE`, `NOTICE` | Yes |
| Missing from a pool | Contract test over the four pools | Yes |
| Detection row missing or wrong marker | Contract test: every stack-specific `stack` skill appears in a table row; the Java row carries the Spring marker; the CDK row exists; the plain-Java fall-through is stated | Yes (text contract) |
| Review filter misses a table manifest | `node:test` on `prepare`: a diff touching each table manifest is classified sensitive; parity test between the table, `large-prs.md` and the script's patterns | Yes |
| A manifest-reading step bypasses the table | Contract test: every FR-5 reader (constitution Steps 5, 8D and run contract; specify 2.1; propose 0; audit; review Step 2; security Step 2) names the table | Yes (text contract; runtime use is the walkthrough row below) |
| Table restated or drifted across readers | Contract test: each FR-5 reader names the table, and no reader repeats a row's marker text | Yes |
| An agent misapplies the table at runtime | None automated: command prose is executed by agents | No. Substitute: a walkthrough at the HITL pause over three fixture repos (Spring Boot + Angular monorepo; plain Java/Quarkus; a Python CDK app), at least one of them a held-out case the text does not cite |
| By-stack page drifts from governance | Contract test: the page's stack sections list exactly the governance `stack` row | Yes |
| Stale count or fixture | `npm test` (`docs-overview`, `install-cursor`, `install-grokbot`, `akili-panel-flow`, `backend-skill-routing*`) | Yes |
| Overstated doc or CHANGELOG claim | Reviewer quote-check at HEAD (KZ-002) | No: human or Reviewer check |

## 9. Requirement ID Index

| ID | Title | Tasks |
|---|---|---|
| FR-1 | Vendored bytes are the reviewed bytes | set at Phase 3 |
| FR-2 | Vendored folder with provenance | set at Phase 3 |
| FR-3 | Candidate pools | set at Phase 3 |
| FR-4 | One stack-detection table | set at Phase 3 |
| FR-5 | Manifest-reading steps read the table | set at Phase 3 |
| FR-6 | Backend routing for Java / Spring Boot | set at Phase 3 |
| FR-7 | Skills-by-stack page | set at Phase 3 |
| FR-8 | Truthful docs and counts | set at Phase 3 |
| FR-9 | Install and doctor | set at Phase 3 |
| NFR-1–5 | Size, no siblings, one definition, no spec-path reads, green gates | set at Phase 3 |
