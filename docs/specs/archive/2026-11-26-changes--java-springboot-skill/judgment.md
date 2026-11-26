# Judgment Day: `design.md` (changes/java-springboot-skill)

| Field | Value |
|---|---|
| Target | `design.md` at `af5c86f`, with `requirements.md` and `proposal.md` as the contract |
| Round | 1 (blind dual review) |
| Judges | A and B, both `general-purpose` on Sonnet (the author ran on Opus 5.5), read-only, same prompt and scope |
| Skill resolution | `judgment-day` (installed copy); the shared ledger contract and prompt references are not packaged, so this file is the ledger |
| Status | **fixed, not re-judged**. Fixed IDs: J-1 … J-24 (JC, 2026-11-25) |

## Counts

| Bucket | Count |
|---|---|
| Confirmed severe (both judges, severe) | 4: J-1 … J-4 |
| Severity split (both found it; one rated it severe) | 2: J-5, J-6 |
| Contradiction (the judges disagree on the facts) | 1: J-7 |
| Info: warnings or suggestions both judges reported | 7: J-8 … J-14 |
| Suspect: reported by one judge only | 10: J-15 … J-24 |

## Confirmed severe

| ID | Judges | Finding | Evidence (as run by the judges) | Proposed fix |
|---|---|---|---|---|
| J-1 | A-1, B-1 | Missing consumer: `SKILL_CATALOG` in `.claude/skills/akili-panel/hooks/flow.mjs`. It is hard-coded, and `test/akili-panel-catalog.test.js` pins it in both directions to the skill folders on disk. Adding `java-springboot` fails the suite. The edit is plugin code: plugin version at `1.1.2`, `docs/plugins/` page | `flow.mjs:644` `{ name: 'golang-pro', binding: 'stack' }`; `akili-panel-catalog.test.js:3,46-62` | P-row + §4 row; add a catalog entry; decide the plugin version (proposed `1.1.3` patch) and its CHANGELOG line; add it to the budget |
| J-2 | A-3, B-2 | DD-7 (base tree) reverses the FR-5 *Stack-aware review* AND clause ("reads **head** manifests as data only") without an amendment | `requirements.md` FR-5; `design.md` DD-7 | **Needs JC:** amend FR-5 to the base tree (recommended), or read head as data. Either way, state how a chunk's file maps to its nearest manifest and what a manifest added by the PR gets |
| J-3 | A-2, B-4 (+A-8) | §5(c) forbids git for detection, but a local base-tree read needs `git show <base>:…`. In CI the Claude agent has no Bash (`Read,Grep,Glob,Task,Skill`), so it cannot run the symlink, real-path or size checks as written | `akili-review.md:44`; `ci.md:10`; `docs/ci/akili-review.claude.yml:106` | Read rules gain one stated carve-out per mode: **local review**, read-only `git show <base>:<path>` (mode `120000` = symlink → not read, size cap applied to the blob); **CI**, Glob/Read over the base workspace, with a file-type check by Glob plus Read and no symlink resolution (stated as reduced). Amend FR-4's BUT clause to "no git command except the named read-only review carve-out" |
| J-4 | A-4, B-3 | The P-9 and P-15 count-consumer lists are incomplete. Missed: `install-akili-panel.test.js` (6+ lines), `diagram-design.test.js:418`, `install-cursor.test.js:239,245` (`SKILL_DIR_COUNT`, `SHARED_ROOT_OPERATION_COUNT` 51 → 52), `akili-panel-flow.test.js:1509,1510,1750,1752` (`stack (15)` → 16), `docs/flow.md:658`, `.claude/skills/akili-panel/tests/panel.test.tsx:1058`, `install-grokbot.test.js:890` (fixture reader) | `grep -rn -E '\b37\b' test/*.js` without the `skill` filter | Re-run the sweep without the filter; list every hit in P-9/P-15; state the new values 38 / 16 / 52 / `SKILL_FILE_EXPECTED` +9 |

## Severity split (needs JC)

| ID | Judges | Finding | Proposed fix |
|---|---|---|---|
| J-5 | A-5 severe, B-8 warning (+B-9) | The Java marker misses Gradle version catalogs (`alias(libs.plugins.spring.boot)`, `gradle/libs.versions.toml`) and convention plugins, giving a silent false negative. Text matching can also hit XML comments and `<exclusions>`. The column header says "all must hold" but the Java and Spring rows are alternatives. A `<dependencyManagement>` BOM import is not stated | Add `gradle/libs.versions.toml` as a marker source (plugin `org.springframework.boot`, library `org.springframework.boot:spring-boot-starter*`); list the accepted Groovy/Kotlin forms; strip XML comments and match inside `<parent>`, `<dependency>`, `<plugin>`, excluding `<exclusions>`; the BOM import counts; header "any of"; a fallback line: "Java build with no marker found → ask the user before recording `no packaged skill`". Recommended: **treat as severe and fix** |
| J-6 | B-5 severe, A-13 warning | P-6 overstates `akili-security.md:43`: those safe-read rules cover `.git` files only (64 KiB cap). FR-5 *Security reconnaissance* says manifests are read "under the command's **existing** safe-read rules", but no such rule for manifests exists | Correct P-6; amend FR-5's clause to "under the stack-detection table's read rules" (the command has none for manifests); S8 names that rule. Recommended: **treat as severe and fix** (an FR clause cannot be met as written) |

## Contradiction (needs JC)

| ID | Judges | Facts in dispute | Settled by the architect's re-run |
|---|---|---|---|
| J-7 | B-12 says P-10 is contradicted; A says P-10 is confirmed | Does the governance schema allow omitting `version`? `governance.md:112` reads `version: "<preserved or 1.0>"` | The line reads "preserved **or 1.0**", which is a fallback value, not an omission. P-10's wording "allows a preserved `version`" understates it. **Proposed:** follow the schema and add `version: "1.0"`, with `NOTICE` saying upstream declares no version and `1.0` is the governance default (rejects DD-3). Alternative: keep DD-3 and record it as a governance exception |

## Info: both judges (warnings and suggestions)

| ID | Judges | Finding | Proposed handling |
|---|---|---|---|
| J-8 | A-11, B-7 | React marker matches React Native and Expo | Require `react-dom` or `next`; state the exclusion |
| J-9 | A-10, B-11 | `**/template.y*ml` and `serverless.y*ml` over-match (Helm, Ansible, cookiecutter) and force `full` plus `recommend_security`; the cost is not stated. `components.json` registries can carry auth headers | State the over-match cost in `large-prs.md`, as for `token*`; add a negative test; weigh the shadcn registry-headers case in DD-6 |
| J-10 | A-12, B-13 | Governance category of `java-springboot` is unstated (vendored-verbatim needs `UPSTREAM.md` and a sync script; `golang-pro` is outside that list) | State "adapted (golang-pro path)" and the governance row edit |
| J-11 | A-14, B-15 | `backend-routing.md:83` *Backend route line* stack values lack Java | Add to §4 and to T7 |
| J-12 | A-9, B-16, B-17 | Budget and count errors: "9 vendored files" should be 8 + 1 reference; tests budgeted at 1.8× against the cited 3× lesson | 8 vendored + 1 reference; tests per clause, about 1,100 LOC; restate the total and the rounds |
| J-13 | A-7, B-14, B-19 | Citation ranges off (specify list `:254-262`, constitution Step 5 to `:268`); P-12 "(read)" is not a command; Step 5 lacks `react-doctor` | Cite by name (KZ-005) with a counting command; add `react-doctor` to Step 5 (S1) |
| J-14 | A-15, B-18 | The by-stack exact test is ill-defined (any-stack pair; method skills are not `stack`; AWS is 3 rows and 1 skill); "Kotlin" is listed under no-skill, but Kotlin Spring Boot is detected | Test = union of per-stack sections + any-stack pair = governance `stack` row; one AWS section with three detection lines; "plain Java or Kotlin without the Spring marker" |

## Suspect: one judge only (not auto-fixed)

| ID | Judge | Finding | Proposed handling |
|---|---|---|---|
| J-15 | A-8, B-20 | `docs/ci` templates pin `akili-specs@2.37.0`, so stack-aware review is absent in CI until the pin moves (both judges, but as a suggestion or warning) | Release-step note + P-row |
| J-16 | A-13, B-21 | Lens briefs carrying `java-springboot` (which says "run `./mvnw verify`") meet read-only `/akili-review` | S7: stack skills are idiom references only; run nothing; the verbatim addendum stays |
| J-17 | B-6 | The FR-5 BUT clauses are not stated at S7/S8; the walkthrough gate is absent from the design | Add both to S7/S8 and a verification plan |
| J-18 | B-10 | Skip list misses `.aws-sam`, `.serverless`, `cdk.out`, `venv`, `.terraform`, `coverage` | Add them |
| J-19 | A-6 | P-1 grep scope `docs` also hits this spec folder | Exclude the spec folder in the stated scope |
| J-20 | A-16 | P-11 rests on the `aws-serverless` description only; the body has no CDK content | State it in DD-4 |
| J-21 | A-17 | `akili-test.md:119`, `akili-validate.md:90` read run commands without naming a manifest | List as unchanged, with the reason |
| J-22 | A-18 | Serverless also reads `serverless.ts/.js/.json` | Note as excluded formats |
| J-23 | A-19 | Test title "nine default areas" → "ten" | Note in the task |
| J-24 | A-20 | No FR-1/FR-2 traceability in the design | Add a short trace table |

## Rounds

| Round | Result |
|---|---|
| 1 | 4 confirmed severe, 2 splits, 1 contradiction |
| JC decisions (2026-11-25) | J-2: base tree, amend FR-5. J-5 and J-6: treat as severe and fix. J-7: add `version: "1.0"`. Fix round: apply J-1 … J-24 together, no re-judgment, close as fixed, not re-judged |
| Fix | `requirements.md` FR-2, FR-4 (BUT carve-out, version-catalog marker, ask-user fallback) and FR-5 (base tree, references-only, read rules) amended. `design.md` revised: §4, §5, §7, §8, §9, §10 (DD-3 reversed; DD-11 and DD-12 added), §11 (P-1, P-2, P-6, P-9, P-11, P-12 and P-15 corrected; P-16 to P-18 added), §12 added |

**Closure:** fixed, not re-judged. Fixed IDs: J-1, J-2, J-3, J-4, J-5, J-6, J-7, J-8, J-9, J-10, J-11, J-12, J-13, J-14, J-15, J-16, J-17, J-18, J-19, J-20, J-21, J-22, J-23, J-24.
