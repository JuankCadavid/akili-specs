# Proposal: Java / Spring Boot stack skill (`java-springboot`) + skills-by-stack page

> **The short version.** Admit **`java-springboot`** (github/awesome-copilot, MIT, `Copyright GitHub, Inc.`, 1 `SKILL.md` + 5 references, 37,632 B) as a `stack` skill. It ships with its `LICENSE` and a `NOTICE`, and its upstream hash is pinned. It reaches agents the same way `golang-pro` does: the three stack-skill candidate pools, the project `## Skill Map`, and a **Java / Spring Boot** row in the backend routing matrix. **Admission has a gate:** the security review of the pinned files runs first, and a `FAIL` stops the spec. The seven sibling skills that its router names (`spring-boot-testing`, `spring-security` and five more) are **not vendored**. The skill already falls back to the official docs when they are missing, and the docs name them as optional upstream installs. The same spec adds **`docs/skills/by-stack.md`**, an English page that lists the skills AKILI ships for each language and framework. It is linked from `docs/overview.md` and the README *Learn more* table. Proposed release: **minor**, about 160 LOC of docs and lists plus about 200 LOC of tests.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/java-springboot-skill` |
| Slug | `java-springboot-skill`, derived from the free-text argument |
| Type | Change |
| Deliverable | software (a packaged skill, methodology text, a docs page and tests) |
| Approval Mode | gated. Mandate: "Bring every gate to me and wait." |
| Approval | **pending JC** |
| Requirement source | JC brief, 2026-11-25 (pasted into the session). Jira: **asked at this gate** |
| Visual source | None: no UI surface. Figma/mockup: **asked at this gate** |
| Model precedent | `docs/specs/archive/2026-11-01-changes--go-backend-routing--golang-skill/` (admission) and `…2026-11-02-changes--go-backend-routing--backend-skill-routing/` (routing matrix) |
| Depends on | none |
| Parallel-safe | no. It edits the same candidate-pool lines (`akili-constitution` Steps 5/8D, `akili-specify` Step 2.1) and the same `backend-routing.md` tables that any other stack-skill change would touch |
| Branch | `feat/java-springboot-skill`, cut from `origin/dev` at `cb2416e` (2026-11-25). Upstream tracking removed, local commits only. `sync/master-into-dev-v2.46.0` is untouched |
| Upstream pin (proposal time) | `github/awesome-copilot` `main` at `93fc8b9ee3ef56b9b5e7261e6ce92d314cb2c1cf` (2026-11-24T23:59:54Z). Last commit that touched `skills/java-springboot`: `f65ff3955a6b` (2026-10-22, "fix(spring): scope REST clients and Boot upgrade routing"). Source: `gh api …/commits`, run 2026-11-25 |
| Author | Claude (Opus 5.5) for JC, 2026-11-25 |

## 2. Intent

When a project's backend is Java on Spring Boot, its agents should get the same stack guidance that Go and NestJS projects already get: detecting the Boot 3 or Boot 4 version, package-by-feature layers, `ProblemDetail` errors, Spring Data rules, proxy pitfalls, and verifying with the project's own build. Separately, a reader should be able to answer "what does AKILI give me for my stack?" from one page.

## 3. Problem / Current Behavior

| # | Fact | Citation |
|---|---|---|
| P1 | No packaged skill covers Java or Spring Boot. A search for `java`/`Java` in the commands, `backend-routing.md` and `docs/overview.md` matches nothing | `grep -n "Java\|java" -r .claude/commands .claude/skills/software-architect/references/backend-routing.md docs/overview.md` → no output (run 2026-11-25) |
| P2 | The stack-skill candidate pools name no Java skill | `.claude/commands/akili-constitution.md:253-266` (Step 5), `:733-736` (Step 8D); `.claude/commands/akili-specify.md:255` area (Step 2.1 fallback) |
| P3 | The backend routing stack table has rows for Go, NestJS, AWS serverless, AI agent and `other`. A Java project therefore falls through to `other` ("none, project conventions") | `.claude/skills/software-architect/references/backend-routing.md:19-27` |
| P4 | `stack` inventory: 15 skills | `docs/skills/governance.md:71` |
| P5 | Upstream `java-springboot` files: `SKILL.md` 4,433 · `references/aot-and-startup.md` 5,475 · `configuration.md` 5,146 · `data.md` 6,013 · `messaging-caching.md` 7,391 · `rest-api.md` 9,174 B. Total 37,632 B | `gh api repos/github/awesome-copilot/git/trees/main?recursive=1` + `wc -c` on a scratchpad copy at the pin (run 2026-11-25) |
| P6 | The upstream frontmatter has **only `name` and `description`**: no `license`, no `metadata`, no `author`. `golang-pro` already had all three, so AKILI's attribution has to **add** a `license` and a `metadata` block here, not just append keys | scratchpad `SKILL.md:1-4` (run 2026-11-25) |
| P7 | Repo-root `LICENSE`: MIT, `Copyright GitHub, Inc.` (unlike golang-pro, the holder is named). Repo: 41,556 stars, pushed 2026-11-25 | `gh api repos/github/awesome-copilot/contents/LICENSE` lines 1-3; `gh api repos/github/awesome-copilot` (run 2026-11-25) |
| P8 | Its router names seven sibling skills, as "If these standalone skills are installed, also use them for their topic; otherwise rely on the official docs": `java-hibernate-jpa`, `spring-boot-testing`, `spring-security`, `spring-observability`, `create-spring-boot-java-project`, `java-add-graalvm-native-image-support`, plus `spring-boot-4-migration` in Before-writing step 2. All seven exist upstream | scratchpad `SKILL.md` Router section + `references/data.md:3`, `configuration.md:3`, `aot-and-startup.md:22`; upstream tree listing (run 2026-11-25) |
| P9 | Preliminary scan of the six files for shell, network, credential and injection phrasing. Hits: build commands (`./mvnw verify`, `./gradlew build`, `./mvnw spring-boot:test-run`), a JDK flag example (`java -XX:AOTCacheOutput=…`), placeholder URLs (`https://rates.example.com`, `rest-api.md:88,114`), docs links (docs.spring.io, openjdk.org JEP 514), and secret-*hygiene* text (`configuration.md:32-41`: "Never commit `.env`…"). No fetch-and-run, no instruction-override phrasing. **This is a scan, not the security review** | `grep -n -i -E "curl\|wget\|https?://\|rm -rf\|token\|password\|secret\|ignore (previous\|all)"` over the scratchpad copy (run 2026-11-25) |
| P10 | skills.sh / Gen Agent Trust Hub rating for `java-springboot` | `UNVERIFIED — confirm at source before relying on it`. Checked in the security task (T1) |
| P11 | No docs page groups the shipped skills by language or framework. `docs/overview.md` groups them by area (frontend, backend and architecture, product, deliverables), so stack skills sit mixed with method skills | `docs/overview.md:60-92` (read 2026-11-25) |

## 4. Proposed Outcome

- `.claude/skills/java-springboot/` ships the six upstream files at the pin, plus `LICENSE` (upstream's, byte-identical) and `NOTICE` (source, pin, holder, the frontmatter change, no affiliation, the security note).
- `java-springboot` is in the three candidate pools, the `docs/commands/akili-constitution.md` stack line, the governance `stack` row (15 → 16) and the repo `AGENTS.md` *Backend Skills* list.
- `backend-routing.md` gets a **Java / Spring Boot** stack row, an `implement | Java / Spring Boot` matrix row led by `java-springboot`, and an expertise card. A Java project stops falling through to `other`.
- `docs/skills/java-springboot.md` names the seven siblings as optional, user-installed complements (`npx skills add https://github.com/github/awesome-copilot --skill <name>`). AKILI never copies them.
- `docs/skills/by-stack.md` (new) has one table per language or framework, plus a section for method skills that apply to any stack and a short list of stacks with no packaged skill (they fall through to `other`). It is linked from `docs/overview.md`, the README *Learn more* table and `docs/README.md`.

## 5. Scope

| In | Detail |
|---|---|
| Security gate (task 1) | `security-audit` in guidance mode, scoped to the six pinned files. It checks prompt injection, instructions to fetch or run remote content, credential handling, destructive commands, and the instructions the router gives about the siblings (P8). It also records the skills.sh / Trust Hub rating (P10). The verdict goes in `execution.md`. `FAIL` → Pivot Protocol, and nothing is copied |
| Vendor + adapt | Copy the six files at the pin. Frontmatter: keep `name` and `description` unchanged, then append `license: MIT` and a `metadata` block (`author`, `source`, `adapted-by`, `adapted-for`, `binding: stack`). Exact `author` wording is settled at specify (Q2). No body edits |
| Provenance | `LICENSE` copied unchanged. `NOTICE` follows the `golang-pro` NOTICE shape. Hash lock and wiring test in the `test/golang-skill.test.js` pattern. `.gitattributes`: `.claude/skills/java-springboot/** -text` |
| Wiring | Candidate pools (3) + docs/commands stack line; `backend-routing.md` stack row, matrix row, card; `AGENTS.md` *Backend Skills* bullet |
| Skills-by-stack page | `docs/skills/by-stack.md`, in English. Lists Go, Java/Spring Boot, TypeScript/NestJS, AWS serverless, AI agents, React/Next.js, Angular, Tailwind/shadcn, then method skills (any stack), then stacks with no packaged skill. Links: `docs/overview.md`, README *Learn more*, `docs/README.md`, `docs/skills/README.md` |
| Docs | `docs/skills/java-springboot.md`; rows in `docs/skills/README.md`, `docs/overview.md`, `docs/skills/governance.md`; `CHANGELOG.md` `Unreleased` |
| Tests | Hash lock + frontmatter + `LICENSE`/`NOTICE`; candidate pools and routing rows; a by-stack page test that checks every `stack`-binding skill in the governance row appears on the page and that the page has no skill that row lacks (no drift); link presence; `SKILL_FILE_EXPECTED` +8 (`test/install-cursor.test.js`); the stack fixture in `test/akili-panel-flow.test.js:1436`; `test/backend-skill-routing*.test.js` sets that enumerate members (KZ-changes--archify-diagrams-2) |

## 6. Non-Goals

- No vendoring of any of the seven sibling skills (P8). They are documented, never copied.
- No body edits to `java-springboot`. That includes its `create-spring-boot-java-project` pointer in `description`.
- No Kotlin skill (`create-spring-boot-kotlin-project` exists upstream; out of scope).
- No new routing activities. Only the Java rows are added, inside the existing schema.
- No *Vendored third-party (verbatim)* hash-locked category change. The same rule as `golang-pro` applies: the normal acceptance checklist.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Java / Spring Boot projects using AKILI | The Skill Map can list `java-springboot`; the Leader assigns it to Java tasks; the routing matrix gives it the `implement` lead |
| `.claude/skills/java-springboot/` | New folder, 8 files (6 upstream + `LICENSE` + `NOTICE`) |
| `.claude/commands/akili-constitution.md`, `akili-specify.md` | One list entry each, three places |
| `.claude/skills/software-architect/references/backend-routing.md` | Stack row, matrix row, card |
| `AGENTS.md`, `README.md`, `docs/README.md`, `docs/overview.md`, `docs/skills/*`, `docs/commands/akili-constitution.md`, `CHANGELOG.md` | Rows, links and two new pages |
| `test/*` | One new test file + count and fixture updates |
| Every installer target | Ships one more skill folder (`install --tool all --dry-run`) |

## 8. Visual Reference

- Source: None
- Location: none
- Notes: methodology package and docs pages; no UI surface.

## 9. Requirement Delta Preview

### ADDED

- A packaged `stack` skill `java-springboot` with upstream attribution, `LICENSE`, `NOTICE` and a pinned hash.
- `java-springboot` as a candidate in the three stack-skill pools.
- A Java / Spring Boot stack row, an `implement` matrix row and an expertise card in the backend routing matrix.
- Documentation of the seven optional upstream siblings, which the user installs and AKILI never vendors.
- `docs/skills/by-stack.md`, the skills-by-language-and-framework page, with its links and a test that keeps it in step with the governance `stack` row.
- A recorded security verdict before any upstream byte enters the package.

### MODIFIED

- `stack` inventory: 15 → 16 (`docs/skills/governance.md`).
- Backend routing: a Java project no longer falls through to `other`.

### REMOVED

- None.

## 10. Approach Options

| | **A: `java-springboot` only, siblings as user-installed note** (recommended) | B: `java-springboot` + `spring-boot-testing` + `spring-security` vendored | C: No vendoring; `java-springboot` as an environment-provided Skill Map row |
|---|---|---|---|
| Size | 37.6 KB, 8 files | 3 skills, 3 security reviews | 0 KB shipped |
| Coverage | Implement-level Spring Boot; testing and security from official docs unless the user installs siblings | Adds testing and security depth | Depends on the user installing it |
| Cascade | Router already falls back to docs (P8) | The siblings likely name further siblings; the set keeps growing | n/a |
| Pinned and reviewed copy | yes | yes, at three times the review cost | **no**: AKILI routes to text it never reviewed |
| Precedent | Same shape as `golang-pro` + samber note | none | Breaks the golang precedent the brief asks for |

## 11. Recommended Approach

**Option A.** It is the golang-pro admission path the brief asks for. It passes governance item 4 (size), and it relies on the upstream's own fallback instead of building a vendored set that keeps growing. Users who want testing or security depth install those siblings from the upstream and keep them current. A sibling can be admitted later through its own spec if Java projects show the need.

## 12. Risks, Dependencies, And Open Questions

| # | Item | Handling |
|---|---|---|
| R1 | Trust Hub rating unknown (P10) | Security gate is task 1. Record what was checked, not only the verdict. A `FAIL` stops the spec through the Pivot Protocol |
| R2 | The router tells agents to use siblings "if installed" (P8). An agent could treat that as a cue to install them | T1 confirms the wording names no install action. The docs page says AKILI never installs them. Rule 9 of `backend-routing.md` (outward actions belong to the user or the design) already covers installs |
| R3 | Frontmatter additions are larger than golang-pro's (a new `license` + `metadata` block, P6) | NOTICE states the exact keys added. The hash test locks the body, and the frontmatter test checks `name`/`description` byte-identical |
| R4 | Boot 3/4 content will age as Spring releases | Pin moves only through a new spec, the same rule as golang-pro. The docs page states the upstream's tested versions (Boot 4.1.1 / 3.5.16) |
| R5 | Aggregate claims ("listed in every pool", "16 stack skills", "every stack skill is on the by-stack page") | KZ-002: run the falsifying grep before writing CHANGELOG and docs rows. The by-stack test is itself the falsifier |
| R6 | Fixtures that enumerate set members escape a count search | KZ-changes--archify-diagrams-2: search on `golang-pro` as well as on the counts (the 9 hits listed in §5 Tests) |
| R7 | Test budget | KZ-bugfix--init-ctrlc-abort-2: budget per assertion clause, about 200 LOC |
| R8 | Shipped tests must not read `docs/specs/changes/java-springboot-skill/` | KZ-changes--archify-diagrams-1 |
| Q1 | Semver | Proposed **minor** (new skill; same call as golang-pro). JC to confirm |
| Q2 | `metadata.author` wording when upstream declares none | Proposed `github/awesome-copilot contributors (Copyright GitHub, Inc.)`, with `NOTICE` quoting the `LICENSE` line. Settled at specify |
| Q3 | Should the by-stack page also list `conditional` skills that are stack-shaped (e.g. `gsap-animation`, `impeccable`)? | Proposed: a short "also used on frontend stacks" line that names them without listing them as stack skills, so the drift test stays exact on the `stack` row |

## 13. Success Criteria

- The security verdict is recorded with the files and checks it covered, before the copy.
- `.claude/skills/java-springboot/` holds the six upstream files, byte-identical except the frontmatter additions, plus `LICENSE` and `NOTICE`.
- `node bin/akili.js install --tool all --dry-run` lists `java-springboot` for every target.
- When a Java / Spring Boot project runs `/akili-constitution` Step 8D, its `## Skill Map` can list `java-springboot`. The routing matrix row `implement | Java / Spring Boot` names it as the lead.
- `docs/skills/by-stack.md` lists every `stack` skill and is linked from `docs/overview.md`, the README *Learn more* table and `docs/README.md`.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` all green.

## 14. Next Step

```text
/akili-specify changes/java-springboot-skill
```

Lite depth; the security gate is task 1.
