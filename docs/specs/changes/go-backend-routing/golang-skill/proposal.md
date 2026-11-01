# Proposal — Go stack skill (`golang-pro`)

> **Answer first.** Admit **`golang-pro`** (Jeffallan, MIT, 1 `SKILL.md` + 5 references, ~49 KB) as a `stack` skill, adapted at Level 1 (attribution only), with its `LICENSE` and a `NOTICE` beside it. It reaches agents the way `nestjs-expert` does: through the stack-skill candidate lists and the project `## Skill Map`. **Admission is gated:** a security review of the pinned upstream files runs first, and a `FAIL` stops the spec. **`samber/cc-skills-golang` is not vendored:** its own README says a subset gives "a partial and potentially inconsistent view", and the 12 generic skills weigh ~800 KB. It is documented as an optional complement the user installs with samber's own installer. Minor release, ~120 LOC of docs/lists + ~150 LOC of tests.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/go-backend-routing/golang-skill` |
| Parent Spec | `changes/go-backend-routing` |
| Slug | `golang-skill` — derived from the free-text argument |
| Type | Change |
| Deliverable | software (packaged skill + methodology text + tests) |
| Approval Mode | pre-approved (JC, 2026-11-01 9:56 UTC-5) — mandate: "si la opcion A aprobada"; "En gates rutinarios toma tu opción recomendada. PARA y espera si: T1 de seguridad FALLA, HALT, Pivot, tripwire de presupuesto, FATAL_FAIL, escalada, ítem HITL, aumento de alcance o enmienda de requisitos". Exceptions always stop: security T1 FAIL, HALT, Pivot, budget tripwire, `FATAL_FAIL`, `PRODUCT_BUG`, escalation, HITL items, scope growth, requirement amendments, destructive actions |
| Approval | **Approved by JC, 2026-11-01 9:56 UTC-5 — Option A**; release **minor** (Q1 settled) |
| Requirement source | JC brief, 2026-11-01 (pasted into the session). No Jira |
| Visual source | None — no UI surface. Confirmed by JC 2026-11-01 9:56: source is his message, no Jira/Figma, no visual part |
| Depends on | none |
| Parallel-safe | no — shares the candidate lists in `akili-constitution` Steps 5/8D and `akili-specify` Step 2.1 with `changes/design-skill-routing` (one-line list merges expected) |
| Upstream pin (proposal time) | `Jeffallan/claude-skills` `main` at `078a25cc5bfd` (2026-10-30T18:00:19Z); last commit touching `skills/golang-pro`: `130a59c` (2026-10-26, "fix(skills): correct Go, WebSocket and Kubernetes examples (#268)") — `gh api …/commits`, run 2026-11-01 |
| Author | Claude (Opus 5.5) for JC, 2026-11-01 |

## 2. Intent

A project whose backend is Go should get the same stack guidance a NestJS or Angular project gets today: idiomatic Go, concurrency with clear lifetimes, error wrapping, table-driven tests with `-race`, module layout.

## 3. Problem / Current Behavior

| # | Fact | Citation |
|---|---|---|
| P1 | No packaged skill covers Go. The packaged skills are the 31 folders under `.claude/skills/`, none for Go | `ls -d .claude/skills/*/ | wc -l` → 31 (run 2026-11-01) |
| P2 | The stack-skill candidate pools name no Go skill | `.claude/commands/akili-constitution.md:255-258` (Step 5), `:726-728` (Step 8D); `.claude/commands/akili-specify.md:243-251` (Step 2.1 no-map fallback) |
| P3 | Skills admitted to the package must pass the five-item acceptance checklist (need, binding, attribution, size, docs + CHANGELOG) | `docs/skills/governance.md` → *Acceptance Checklist for New Skills* |
| P4 | `golang-pro` upstream: `SKILL.md` 5,208 B; references `concurrency.md` 7,438 · `generics.md` 8,741 · `interfaces.md` 8,361 · `project-structure.md` 10,430 · `testing.md` 9,461 B; frontmatter `license: MIT`, `author: https://github.com/Jeffallan`, `version: "1.1.1"` | `gh api repos/Jeffallan/claude-skills/contents/skills/golang-pro[...]` (run 2026-11-01) |
| P5 | The upstream repo `LICENSE` reads `Copyright (c) 2025` with **no holder name** | `gh api repos/Jeffallan/claude-skills/contents/LICENSE`, line 3 (run 2026-11-01) |
| P6 | skills.sh shows "Gen Agent Trust Hub: Fail" for `golang-pro` | JC brief. `UNVERIFIED — confirm at source before relying on it`; the reason is not shown |
| P7 | Preliminary scan of the five references for shell, network, credential and injection phrasing: 4 hits, all benign — a `bash` code fence (`project-structure.md:66`), a Makefile `rm -rf $(BUILD_DIR)` (`:280`), an `envconfig` `Password` field example (`:452`), a "Token bucket" comment (`concurrency.md:255`) | `grep -n -i -E "curl|wget|https?://|…|rm -rf"` over a scratchpad copy (run 2026-11-01). A scan, not the security review |
| P8 | `samber/cc-skills-golang`: MIT, 3,746 stars, 45 skills, pushed 2026-11-01. Its README: "Installing only a subset will give you a partial and potentially inconsistent view of the guidelines. For best results, install all general-purpose skills together." 12 generic candidates measured at 32–144 KB each (~800 KB together) and cross-referencing `samber/cc` | `gh api repos/samber/cc-skills-golang` + `README.md:143` + per-skill tree sizes (run 2026-11-01) |
| P9 | It ships its own installers for Claude Code, Codex, Gemini and the `skills` CLI | `README.md:22-116` (run 2026-11-01) |

## 4. Proposed Outcome

- `.claude/skills/golang-pro/` ships with the upstream `SKILL.md` and `references/`, plus `LICENSE` (upstream's) and `NOTICE` (author, source URL, pinned commit, the AKILI frontmatter change, no affiliation).
- `golang-pro` appears in the three candidate pools and in the packaged docs, so `/akili-constitution` Step 8D can put it in a Go project's `## Skill Map` and the Leader can assign it per task.
- `samber/cc-skills-golang` is named in `docs/skills/golang-pro.md` as an optional, user-installed complement, with its installer and its "install them together" advice. AKILI never copies it.

## 5. Scope

| In | Detail |
|---|---|
| Security gate (first task) | Review the pinned upstream files with the `security-audit` skill (guidance mode, scoped to the six files): prompt-injection, instructions to fetch or run remote content, credential handling, destructive commands. Record the verdict and the Trust Hub question in `execution.md`. `FAIL` → Pivot Protocol, nothing is copied |
| Vendor + adapt | Copy the six files at the pin. Frontmatter: keep every upstream field; add `metadata.source`, `adapted-by`, `adapted-for`, `binding: stack`; keep `author` as upstream wrote it. No body edits (stack skills get no Integration section) |
| Provenance | `LICENSE` copied unchanged. `NOTICE` names Jeffallan as copyright holder from the frontmatter and repo, since the `LICENSE` names none (P5) |
| Wiring | Add `golang-pro` to the candidate pools in `akili-constitution` Step 5 and Step 8D and `akili-specify` Step 2.1 (no-map fallback) |
| Docs | `docs/skills/golang-pro.md` (incl. the samber note), `docs/skills/README.md` row, `docs/overview.md` row, `docs/skills/governance.md` stack row, `README.md` if it lists stack skills, `CHANGELOG.md` `Unreleased` |
| Tests | Contract tests: folder ships with `LICENSE` + `NOTICE`; frontmatter fields present and `author` unchanged; listed in every candidate pool; docs rows present; skill-count assertions updated (`test/docs-overview.test.js` inventory) |

## 6. Non-Goals

- No vendoring of any `samber/cc-skills-golang` skill (P8, P9).
- No routing matrix or lead/support rule — that is child 2.
- No body edits to `golang-pro` (no version bump of "Go 1.21+", no removal of the maintainer credit line).
- No hash-locked *Vendored third-party (verbatim)* category: that category exists for skills design steps need byte-identical; a stack skill follows the normal acceptance checklist.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Go projects using AKILI | Skill Map can list `golang-pro`; Leader assigns it to Go tasks |
| `.claude/skills/golang-pro/` | New folder (7 files) |
| `.claude/commands/akili-constitution.md`, `akili-specify.md` | One list line each, three places |
| `docs/skills/*`, `docs/overview.md`, `CHANGELOG.md` | Rows and a page |
| `changes/design-skill-routing` | Touches nearby lines in the same two commands; merge order either way |

## 8. Visual Reference

- Source: None
- Location: —
- Notes: methodology package; no UI surface.

## 9. Requirement Delta Preview

### ADDED

- A packaged `stack` skill `golang-pro` with upstream attribution, `LICENSE` and `NOTICE`.
- `golang-pro` as a candidate in the three stack-skill pools.
- A documented, optional `samber/cc-skills-golang` complement, installed by the user, never vendored.
- A recorded security-review verdict before any upstream byte enters the package.

### MODIFIED

- Stack-skill inventory: 10 → 11 (`docs/skills/governance.md` *Current assignment*).

### REMOVED

- None.

## 10. Approach Options

| | **A — `golang-pro` only, samber as user-installed note** (recommended) | B — `golang-pro` + a samber subset vendored | C — samber subset only |
|---|---|---|---|
| Size | ~49 KB | ~49 KB + ~250–800 KB | ~250–800 KB |
| Governance item 4 (size; one skill with `references/` over sibling families) | passes | fails unless fused; fusing mixes two authors in one skill | fails |
| Upstream advice | — | contradicts samber's "install them together" (P8) | contradicts it |
| Format fit | Same shape as `nestjs-expert` / `angular-developer` | Mixed | 12+ sibling folders |
| Security | One review of 6 files | Two upstreams | One upstream, many files |
| Go coverage gaps | security, observability, database depth → covered by the optional samber install | covered | no single entry point |

## 11. Recommended Approach

**Option A.** It is the smallest path that passes the acceptance checklist as written, it matches the format of the existing stack skills, and it follows samber's own advice instead of contradicting it. Users who want samber's depth get the whole set from samber's installer, and it stays current with the upstream.

## 12. Risks, Dependencies, And Open Questions

| # | Item | Handling |
|---|---|---|
| R1 | Trust Hub "Fail" with no stated reason (P6) | Security gate is task 1; a `FAIL` stops the spec via the Pivot Protocol. Record what was checked, not only the verdict |
| R2 | `LICENSE` names no copyright holder (P5) | `NOTICE` names Jeffallan from the frontmatter + repo owner; quote both sources |
| R3 | Upstream "Go 1.21+" may lag the current Go release | Not edited (non-goal). Noted in `docs/skills/golang-pro.md` as upstream's stated baseline. `UNVERIFIED` current Go version — check at specify |
| R4 | Aggregate claims ("listed in every pool", "11 stack skills") | KZ-002: run the falsifying grep before writing the CHANGELOG and docs rows |
| R5 | Test budget | KZ-bugfix--init-ctrlc-abort-2: budget per assertion clause, ~150 LOC |
| R6 | Conflict with `changes/design-skill-routing` on the same commands | One-line list merges; rebase on `dev` before execute |
| Q1 | Semver: is a new stack skill minor or patch? | **Settled: minor** (JC, 2026-11-01 9:56) |
| Q2 | Should a samber row appear in the Step 8D Skill Map scaffold as an environment-provided skill, or only in `docs/skills/golang-pro.md`? | Proposed: docs only. The environment-provided rules cover tool-shipped skills, and samber is a skill pack, not a tool |

## 13. Success Criteria

- Security verdict recorded with the files and checks it covered, before the copy.
- `.claude/skills/golang-pro/` holds the six upstream files byte-identical except the frontmatter additions, plus `LICENSE` and `NOTICE`.
- `node bin/akili.js install --tool all --dry-run` lists `golang-pro` for every target.
- A Go project run through `/akili-constitution` Step 8D can list `golang-pro` in its `## Skill Map`.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` green.

## 14. Next Step

```text
/akili-specify changes/go-backend-routing/golang-skill
```

Lite depth; the security gate is task 1.
