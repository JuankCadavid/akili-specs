# Proposal — Modern Web Guidance for UI work (`modern-web-guidance`)

> **Answer first.** Route Google Chrome's **Modern Web Guidance** (MWG) into AKILI as a **conditional, environment-provided** skill for web UI work. AKILI references it and does not vendor it. The AKILI rules around it live in the design routing layer that `impeccable-bridge` already owns:
>
> - an availability and consent gate, including a Node 22 check
> - a pinned CLI invocation in place of `@latest`
> - the place where MWG's per-response disclosure is written
> - `legacy-scan` as an opt-in brownfield inventory
>
> Impeccable decides look and polish. MWG decides how the platform is used (native `<dialog>`/popover, container queries, forms, accessibility, Core Web Vitals). Admission is gated by a security review of the pinned upstream as the first task. **Two facts in the brief are wrong at the source:** the license is **Apache-2.0**, not MIT, and the current release is **v1.0.1** (2026-11-16). Three brief facts are unconfirmed (§3). Wiring MWG from command text needs a **governance amendment** (environment-provided rule 4), which is decision **D1** for JC. Planned for the same minor release as PRs #142–#144. Size: ~250 LOC of rules and docs plus ~450 LOC of tests.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/modern-web-guidance` |
| Slug | `modern-web-guidance`, the first token of the argument (already kebab-case) |
| Branch | `feat/modern-web-guidance`, from `dev` at `decf0fc` (merge of PR #144), created 2026-11-17 |
| Type | Change |
| Deliverable | software (methodology rules, docs, tests; no runtime code) |
| Approval Mode | `gated`. JC's brief: "If any gate, question, or approval comes up, stop and ask clearly with the options; do not decide it yourself." JC pre-approved *starting* this proposal, not its content |
| Approval | **Pending.** Awaiting JC: approve / revise / stop, plus D1–D4 (§12) |
| Requirement source | JC's brief, 2026-11-17 (pasted into the session). No Jira ticket is named. **Confirm at approval:** the brief's wording does not let this be logged as `skipped` under `gated` |
| Visual source | None. No UI surface: this changes methodology text |
| Release target | The same **minor** release as PRs #142, #143 and #144, which are already on `dev`. This spec does not start the release |
| Depends on | none |
| Parallel-safe | no. Shares `design-routing.md`, `governance.md` and the command files with any other open design-routing work |
| Upstream pin (proposal time) | `GoogleChrome/modern-web-guidance` tag `v1.0.1` → `64a6d708f5a4` (2026-11-16T14:57:49Z). npm `modern-web-guidance@1.0.1`, `latest`. Pinned `SKILL.md` names `--skill-version 2026_11_10-47b4c80e`. Source: `gh api repos/GoogleChrome/modern-web-guidance/{releases,git/ref/tags/v1.0.1}` and `npm view modern-web-guidance@1.0.1`, run 2026-11-17 07:3x UTC-5 |
| Author | Claude (Opus 5.5) for JC, 2026-11-17 |

## 2. Intent

When an AKILI project has a web user interface, its agents should write modern platform code (native dialog/popover, anchor positioning, container queries, accessible forms, Core Web Vitals fixes) and not the patterns frozen in their training weights. On a brownfield web app, AKILI should be able to list the modernization opportunities. Projects without a web UI must not change at all.

## 3. Problem / Current Behavior

**AKILI today**

| # | Fact | Citation |
|---|---|---|
| P1 | No packaged skill gives platform-level web implementation guidance. Design routing covers direction and craft (Impeccable) and framework idioms (stack skills), but nothing covers "which native platform feature, with which fallback" | `.claude/skills/impeccable-bridge/references/design-routing.md` → *Expertise cards* (rows `impeccable` … "other UI stack skills") |
| P2 | Environment-provided skills are referenced, never vendored. Command text may load-direct one **only** behind a recorded `Deliverable` selector plus that skill's own availability gate. The only instance today is `Deliverable: video` → `video-production` → `hyperframes` | `docs/skills/governance.md` → *Binding Taxonomy*, environment-provided rules 1–4 |
| P3 | The *Vendored third-party (verbatim)* category has one member, `impeccable`. It requires byte-identical upstream content (no body edits), `LICENSE` + `NOTICE` + `UPSTREAM.md`, a hash-locked test, and a pin moved only by a sync script | `docs/skills/governance.md` → *Vendored third-party (verbatim)* |
| P4 | The installer writes skills into per-user tool directories (`~/.claude`, `~/.config/opencode`, `~/.gemini`, `~/.codex`, `~/.agents/skills`, `~/.cursor`). It does not install per project, so "only for UI projects" cannot be an install-time filter | `bin/akili.js:115-140` |
| P5 | AKILI CI runs on Node 18 and 22. The package declares `engines.node >=18.0.0` | `.github/workflows/ci.yml:31`; `package.json:51-52` |
| P6 | Skill-count guards: 32 skills (33 folders, one of them the `akili-panel` plugin entry); `SKILL_FILE_EXPECTED = 247 + 58 + 3 + 1 + 8 + 1 + 2`; the panel `SKILL_CATALOG` must match the folders on disk | `ls -d .claude/skills/*/SKILL.md | wc -l` → 32 (run 2026-11-17); `test/install-cursor.test.js:257`; `test/install-akili-panel.test.js:398`; `test/akili-panel-cli-coverage.test.js:518`; `docs/skills/governance.md` → checklist item 6 |
| P7 | UI work already passes through `impeccable-bridge` in `/akili-specify` (Step 2.1 and task skill lists), `/akili-test` (design-detector suite), `/akili-validate` (UI design review), `/akili-audit` (`design` mode) and `/akili-constitution` (UX/UI step and Step 8D Skill Map). Each command names the routing matrix and does not copy its rows | `.claude/commands/akili-specify.md:241-244,484-486`; `akili-test.md:193-198`; `akili-validate.md:133,148-153`; `akili-audit.md:138-146`; `akili-constitution.md:207-210,753-759`; `docs/skills/governance.md:72` |

**Upstream (MWG), checked against the brief**

| # | Brief says | At source | Citation |
|---|---|---|---|
| U1 | MIT | **Apache-2.0.** Repo, `package.json` and npm all say so. Apache-2.0 §4 requires preserving `LICENSE` and any `NOTICE` | `gh api repos/GoogleChrome/modern-web-guidance --jq .license.spdx_id`; `package.json` at `v1.0.1`; `npm view … license` (run 2026-11-17) |
| U2 | v1.0 stable released 2026-11-10 | Confirmed: `v1.0.0` released 2026-11-10T03:24:59Z. **`v1.0.1` released 2026-11-16 is now `latest`** | `gh api …/releases` (run 2026-11-17) |
| U3 | Stewarded by Chrome, Edge, Firefox and MDN | The blog says Chrome leads and Firefox and Edge are joining. **MDN is not mentioned**: `UNVERIFIED — confirm at source before relying on it` | https://developer.chrome.com/blog/modern-web-guidance-v1 (fetched 2026-11-17) |
| U4 | npm CLI with `search`, `retrieve`, `legacy-scan` | Confirmed. The README also lists `install` and `update`; the pinned `SKILL.md` also uses `list` | README and `skills/modern-web-guidance/SKILL.md` at `v1.0.1` |
| U5 | 200+ curated guides | Consistent: 210 files under `skills/modern-web-guidance/guides/` (2,023,388 B). The skill folder has 211 files (2,033,189 B). The npm tarball has 281 files, 16.7 MB unpacked | `gh api …/git/trees/v1.0.1?recursive=1`; `npm view …@1.0.1 dist` (run 2026-11-17) |
| U6 | Claude, Codex, Cursor and Antigravity plugins | Repo has `.claude-plugin`, `.codex-plugin`, `.cursor-plugin`, `.agents/plugins`, `.grok-plugin`, `gemini-extension.json` and `kimi.plugin.json`. The blog lists Antigravity and "Grok Build". **Whether Grok Build reaches AKILI's Grok Bot target:** `UNVERIFIED — confirm at source before relying on it` | Same tree listing; blog |
| U7 | Agents go from 52–60% to 82–96% of checks with the skill | **Not found** in the blog or the fetched README part. The blog reports case studies (e.g. note inc. 61% → 94%) and links a dashboard: https://googlechrome.github.io/modern-web-guidance-src/. The 52–60 / 82–96 figures are `UNVERIFIED — confirm at source before relying on it` and stay out of shipped docs until cited | Blog fetch, 2026-11-17 |
| U8 | Needs Node 22+ | Confirmed: `engines.node >=22.0.0` | `package.json` at `v1.0.1`; `npm view …@1.0.1 engines` |
| U9 | Runs `npx …@latest` | Confirmed. Every pinned `SKILL.md` invocation is `npx -y modern-web-guidance@latest <cmd>`. It tells agents to "proactively request approval/allowlisting with network access BEFORE the first execution" | `SKILL.md` → *Primary Workflow*, *Using npx / pnpx* |
| U10 | Appends a "Modern Web Guidance" section to every response | Narrower than the brief: only "the response where you deliver those changes", when MWG was consulted (`SKILL.md` → *Step 4. Disclose Skill Usage*). It still collides with AKILI completion reports and HITL gates |
| U11 | — | The repo has **no CLI source**. `package.json` `bin` points at `skills/modern-web-guidance/modern-web.mjs`, which is absent at `v1.0.1`. The CLI is built from `GoogleChrome/modern-web-guidance-src` and reaches users only through npm. Vendoring the repo therefore does not remove the npm fetch | `package.json` `bin` + tree listing at `v1.0.1` |
| U12 | — | `SKILL.md` frontmatter says "MANDATORY: Execute FIRST for all HTML/CSS and clientside JS tasks". This over-triggers against AKILI's conditional loading and is for the security review to weigh | `SKILL.md:3-4` at `v1.0.1` |

## 4. Proposed Outcome

- A web-UI task in AKILI gets MWG guidance when the developer has MWG installed and has consented. `/akili-specify` assigns it, `/akili-execute` Implementers use it, `/akili-test` and `/akili-validate` check against it. A missing install means "not run, install route printed", never a failure. Non-UI specs never reach it.
- Every MWG CLI call AKILI directs uses an exact version (`modern-web-guidance@<pin>`), never `@latest`, and runs only after the gate passes (Node ≥ 22, network consent).
- MWG's disclosure lands in the task's evidence (completion report, `execution.md`), never appended to AKILI documents or HITL gate messages.
- On a brownfield web app, `/akili-constitution` and/or `/akili-audit` can offer `legacy-scan` as an opt-in inventory written to a report. Findings are inputs to `/akili-propose`, never tasks.
- Docs give the per-tool install route (Claude Code, Codex, Cursor, Antigravity; Grok Bot only if U6 is confirmed). `akili install` copies nothing new.

## 5. Scope

| In | Detail |
|---|---|
| T-sec: security review (first task, gate) | `security-audit` guidance mode over `SKILL.md` at the pin, and over the npm CLI tarball if D2 keeps CLI calls. Check: prompt injection, the "MANDATORY / FIRST" trigger (U12), fetch-and-run (U9), `-y` auto-install, network and telemetry, credential handling, hidden characters (`perl`, not BSD `grep -P`). Scan commands quoted verbatim; exit 2 means "not run" (governance checklist item 3). `FAIL` → Pivot Protocol, nothing ships |
| Governance | Amend environment-provided rule 4 (D1) so a second selector (a spec's UI web surface, as recorded by the design route) may route to MWG through a bridge-owned availability gate. Add MWG to the environment-provided examples and the *Current assignment* table as appropriate. Removal/Fusion Log row if D1 changes a category |
| Routing | `design-routing.md`: an MWG expertise card ("platform implementation, native features and fallbacks, a11y, CWV"; must not decide the aesthetic or the framework idiom), its row per activity (build-new, build-within-system, evaluate), and a *Design route line* field. Commands reach it through the bridge they already load (P7). No command copies a row |
| Gate + pin + disclosure | One new reference file under `impeccable-bridge/references/` (e.g. `modern-web.md`): availability probe per host, Node ≥ 22 check, consent, pinned invocation, disclosure placement, `legacy-scan` rules (upstream's "only for broad modernization" plus AKILI's report-only default) |
| Brownfield | Opt-in `legacy-scan` step in `/akili-audit` (likely in `design` mode or as its own mode) and/or `/akili-constitution` brownfield analysis (D3). Report under `docs/specs/audits/` |
| Skill Map | `/akili-constitution` Step 8D can write an MWG row (environment-provided; "use when present") for web-UI projects |
| Docs | `docs/skills/modern-web-guidance.md` (facts, Apache-2.0 attribution, security record, install routes per tool, pin), `docs/skills/README.md`, `docs/overview.md`, the `AGENTS.md` *Design Skills* list, `CHANGELOG.md` `Unreleased` |
| Tests | Contract tests: matrix rows present and named, not copied; gate text holds a pinned invocation and no `@latest`; disclosure-placement rule present; commands reach MWG only through the bridge; governance rule 4 text; docs rows; skill and file counts (P6) updated for whatever ships (one reference file → `SKILL_FILE_EXPECTED` +1, skill count unchanged under Option B) |

## 6. Non-Goals

- No new `akili install` behavior: no npm download, no plugin installation, no per-project install filter (P4).
- No copy of MWG's 210 guides or its CLI into the package (unless D1 picks Option C).
- No Node 22 requirement for AKILI itself. AKILI's CI and `engines` stay at Node ≥ 18. AKILI's tests never execute the MWG CLI.
- `legacy-scan` findings never become tasks in a running spec (scope only grows through approval).
- No change to Impeccable's role: it keeps direction, craft, critique, audit and polish.
- No release, tag, push, merge or publish from this spec.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Projects with a web UI, developer has MWG installed | Gain gated MWG guidance in specify/execute/test/validate, plus opt-in `legacy-scan` |
| Projects with a web UI, MWG not installed | One "not available, install route" line where the gate runs; nothing else |
| Non-UI and native-only (ENV-3) projects | No change |
| `impeccable-bridge` + `design-routing.md` | New card, rows and reference file |
| `docs/skills/governance.md` | Rule 4 amendment (D1) |
| Commands | `akili-specify`, `akili-execute` (via the Leader's task skill list), `akili-test`, `akili-validate`, `akili-audit`, `akili-constitution`. Pointer lines only |
| Prior specs | `changes/design-skill-routing` (archived 2026-11-01) built the matrix; `changes/go-backend-routing/golang-skill` is the precedent for the security-gate-first task |

## 8. Visual Reference

- Source: None
- Location: —
- Notes: methodology text change, no UI surface.

## 9. Requirement Delta Preview

### ADDED Requirements

- MWG appears in the design routing matrix as the platform-implementation skill for web UI activities, behind a bridge-owned availability, Node and consent gate.
- AKILI-directed MWG CLI calls are version-pinned and never `@latest`.
- MWG's disclosure goes to task evidence, not to AKILI documents or gate messages.
- Opt-in `legacy-scan` inventory for brownfield web projects, report-only by default.
- A docs page with the security record, Apache-2.0 attribution and per-tool install routes.

### MODIFIED Requirements

- Governance environment-provided rule 4 gains a second permitted selector (D1).
- The `/akili-constitution` Step 8D Skill Map can carry an MWG row.

### REMOVED Requirements

- None.

## 10. Approach Options

| Option | What | For | Against |
|---|---|---|---|
| **A: Skill Map only** | Environment-provided, documented. Reaches agents only through the Skill Map row. No command or matrix wiring | Zero governance change; smallest | Does not meet the brief's scope item 1 (routing in specify/execute/test/validate); MWG's "MANDATORY" trigger then fires unmanaged |
| **B: Environment-provided, routed through the bridge** (recommended) | As A, plus the matrix card and rows, a bridge reference file with gate, pin, disclosure and `legacy-scan` rules, and a governance rule 4 amendment so the bridge (not the command) routes to it, as `video-production` does for `hyperframes` | Meets every brief item; no 2 MB or 16 MB payload; upstream stays version-matched with its CLI (`--skill-version`); AKILI stays on Node ≥ 18 | Needs the governance amendment (D1); quality depends on the developer's own install |
| C: Vendor verbatim | Second member of the verbatim category: `SKILL.md` + 210 guides (~2 MB), `LICENSE`/`NOTICE`/`UPSTREAM.md`, hash lock, sync script | Every install carries the same text | Does not remove the runtime npm fetch (U11); the verbatim rule forbids body edits, so `@latest` cannot be pinned in the shipped text; +211 files in every tool install; new sync script |
| D: Vendor adapted | As C but with body edits that pin the version | Pinned text | Breaks the `SKILL.md` ↔ CLI `--skill-version` coupling on every upstream release; governance's stated reason for never vendoring environment skills ("goes stale the moment the tool updates") |

## 11. Recommended Approach

**Option B.** It is the smallest option that meets all five scope items in the brief. It follows the one precedent the package already has for gating an external tool (`video-production` → `hyperframes`). It puts the pin, the Node check and the disclosure rule in AKILI's own text, where we control them, and leaves upstream text untouched. Order: T-sec gate → governance amendment → matrix and reference file → command pointer lines → brownfield step → docs → tests and counts → CHANGELOG.

## 12. Risks, Dependencies, And Open Questions

**Decisions for JC** (the brief says stop and ask; none is decided here):

| # | Question | Options |
|---|---|---|
| D1 | Integration category | **B** (recommended) / A / C / D, as in §10. B and C both need a governance edit |
| D2 | Pin source | (a) AKILI pins one exact version in the bridge reference and moves it only through a spec (golang-pro style); (b) the project's Skill Map row records the version the developer installed and the gate uses it; (c) both: AKILI default, project override |
| D3 | Brownfield home for `legacy-scan` | `/akili-audit` only (recommended: it is the drift and evaluation command) / `/akili-constitution` only / both |
| D4 | Requirement source | Confirm: JC's brief is the source, no Jira, no visual |

**Risks**

| Risk | Handling |
|---|---|
| Supply chain: `npx -y …@latest` runs whatever npm serves (U9) | Pinned exact version; consent before the first run; T-sec reviews the pinned tarball; no `-y` without consent |
| Node 22 vs AKILI's Node 18 (U8, P5) | The gate checks the project's runtime; below 22 → "not run" with a reason. AKILI tests never run the CLI |
| Over-triggering: "MANDATORY … FIRST" (U12) | The bridge's conditional route governs when it loads; T-sec records the wording |
| Disclosure collides with AKILI reports (U10) | The placement rule sends it to task evidence |
| License stated wrongly in the brief (U1) | Apache-2.0 attribution on the docs page. No `NOTICE` file needed under B (nothing redistributed); required under C |
| Unverified brief claims (U3, U6, U7) | Kept out of shipped docs until cited (KZ-002) |
| Restatement drift when rule 4 changes ("the only instance is video") | Sweep keyed on the obligation, not the identifier (KZ-changes--kaizen-loop-closure-2) |
| Falsifiers about CLI behavior predicted, not run | Execute them at specify time (KZ-changes--leader-brief-contract-2) |
| Test LOC under-budgeted | Budget per clause, ~3× the code (KZ-bugfix--init-ctrlc-abort-2) |
| Release coupling with PRs #142–#144 | Delivery target only; the release stays JC's step |

## 13. Success Criteria

- A web-UI task's route names MWG for platform implementation; a non-UI or ENV-3 task's never does (tested).
- No AKILI-shipped text contains `modern-web-guidance@latest`; every directed call carries the exact pin (tested).
- Missing MWG, Node < 22 or declined consent each produce a "not run" line with the reason and never block the command.
- The T-sec verdict is recorded with verbatim scan commands before any wiring lands.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` pass on Node 18 and 22.

## 14. Next Step

After approval and answers to D1–D4:

```text
/akili-specify changes/modern-web-guidance
```
