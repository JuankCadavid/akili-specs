# Design: Go stack skill (`golang-pro`)

> **Answer first.** No code changes. One new folder, copied from the pin. The `SKILL.md` frontmatter gets four added `metadata` keys, and `LICENSE` and `NOTICE` sit beside it. One list line goes into each of four candidate pools. The docs rows and the "31 → 32" counts are updated, the existing install and doctor counts and fixture follow the new inventory, and a new contract test locks the upstream body to the pin. The installer already copies every folder under `.claude/skills/` (P-3), so it needs no edit. Budget: 4 tasks · ~260 LOC (≈49 KB vendored text excluded) · 5 review rounds.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/go-backend-routing/golang-skill` |
| Depth | Lite (re-checked in §10) |
| Approval Mode | pre-approved (JC, 2026-11-01 9:56 UTC-5) |
| Verified at | `7067fe9` |
| Phase 2 gate | auto-approved (pre-approved mode) after `judgment-day` — see `judgment.md` |
| Judgment fixes | J1 (CRLF/`.gitattributes`), J2 (`governance.md` row), J3 (`LICENSE` blob), J4–J8 (warnings) applied 2026-11-01 — `judgment.md` |

## 2. Executive Summary

Vendor-and-attribute, the same shape `nestjs-expert` and `angular-developer` were admitted with, plus a provenance lock the earlier stack skills lack: a test that hashes the upstream body against the pin.

## 3. Architecture Overview

| Layer | Change |
|---|---|
| Package content | `.claude/skills/golang-pro/` (8 files); `.gitattributes` gains `.claude/skills/golang-pro/** -text` (P-9) |
| Command text | One list line in each of four pools (FR-3) |
| Installer (`bin/akili.js`) | none (P-3) |
| Docs | `docs/skills/README.md` + `docs/overview.md` rows, `docs/skills/governance.md` *Current assignment* `stack` row (`:70`), one page, counts, CHANGELOG (FR-4) |
| Tests | Count/fixture updates + one new contract test file |

## 4. Extended Directory Structure

```text
.claude/skills/golang-pro/
  SKILL.md                      upstream + 4 added metadata keys
  LICENSE                       upstream repo-root LICENSE at the pin, byte-identical (blob b77bf2ab726c6e7cb5a81a9d3b7dc38266ebfd3d, 1,056 B)
  NOTICE                        AKILI-written provenance
  references/{concurrency,generics,interfaces,project-structure,testing}.md   upstream, byte-identical
docs/skills/golang-pro.md       new page
.gitattributes                  + `.claude/skills/golang-pro/** -text`
test/golang-skill.test.js       new contract test
```

## 5. Data Model

`SKILL.md` frontmatter after adaptation: upstream keys in upstream order and values, unchanged. Under `metadata`, after the upstream keys, append `source: https://github.com/Jeffallan/claude-skills/tree/078a25cc5bfd8011459be7b91d004e900c1d02d3/skills/golang-pro`, `adapted-by: "Juan Carlos Cadavid — jcadavid.com"`, `adapted-for: "AKILI-SPECS"`, `binding: stack`. `author` stays `https://github.com/Jeffallan` as upstream wrote it (governance: `adapted-by` never replaces `author`).

`NOTICE` content: name and source, pinned commit, copyright holder "Jeff Allan (GitHub: Jeffallan)" — **the display name is `UNVERIFIED`**, settled in T1 from the upstream profile or README (P-5), and falls back to "GitHub user Jeffallan" if no primary source names him. It states where the holder's name comes from (the upstream `LICENSE` names none; the T1 source, else the handle), the frontmatter-only modification, that the pin moves only through a new spec (no sync script, unlike the *Vendored third-party (verbatim)* category), the MIT terms by reference to `LICENSE`, and that there is no affiliation.

## 6. API Design

n/a — no API.

## 7. Backend Module Design

n/a — no code module. Installer behaviour is unchanged (P-3).

## 8. Frontend / UX Component Architecture

n/a — no UI.

## 9. Shared Contracts or Package Extensions

| Contract | Change |
|---|---|
| Packaged-skill set (consumers P-2) | +1 member: `golang-pro` (31 → 32 directories; 308 → 316 skill files) |
| Candidate pools (P-1) | +1 name each, inserted where other backend stack skills sit |
| `docs/overview.md` group | `golang-pro` goes in the same purpose group as `nestjs-expert` |

## 10. Design Decisions

| ID | Decision | Why | Rejected |
|---|---|---|---|
| DD-1 | Security review runs on a scratchpad copy fetched by blob SHA, before any write under `.claude/skills/` (T1); it covers the six skill files and the repo-root `LICENSE` | FR-1 BUT clause; the review must cover the exact bytes that ship | Reviewing the default branch: it moves |
| DD-2 | Upstream body locked by a test that reads **raw bytes** and computes the git blob SHA-1 itself (`blob <len>\0<bytes>`): each reference and `LICENSE` equal their pinned SHAs; `SKILL.md` with the four added lines removed equals blob `99ef50f…`. `.gitattributes` `-text` keeps the bytes LF on Windows CI (P-9) | Turns "body unchanged" from a Reviewer check into a gate (requirements §8) | Formal *Vendored third-party (verbatim)* category: needs `UPSTREAM.md` + sync script; proposal Non-Goal |
| DD-3 | Added keys appended **after** the upstream `metadata` keys | DD-2's strip-and-compare stays a line deletion, not a reorder | Interleaving per the governance schema order |
| DD-4 | samber is documented in `docs/skills/golang-pro.md` only, with no Skill Map row | Proposal Q2; the environment-provided rules cover tool-shipped skills | Step 8D environment row |
| DD-5 | Count and fixture updates live in the docs task (T3), not the vendor task: `install-cursor.test.js` `SKILL_FILE_EXPECTED` 308 → 316 with its 31/308/322/45 comments refreshed to 32/316/330/46, the doctor fixture gains `OK golang-pro` between `frontend-design` and `gsap-animation`, `docs/cli.md` 31 → 32 (4 sites) and the two tests that pin it | `docs-overview` (a)(c)(d), `install-cursor` and the doctor fixture all go red when the folder lands, so T2's red is the falsifier T3 turns green | One combined task — too many edit sites for one review (Step 3.2 rule) |

No DD reverts delivered behavior → Step 2.3 challenge not triggered.

**Budget (Step 2.4):** 4 tasks · ~260 LOC hand-written (≈60 docs/rows/lists, ≈40 NOTICE + page, ≈10 count/fixture lines, ≈150 contract test) plus 49,639 B vendored · 5 review rounds (T1 1, T2 1, T3 2 because it edits command text, T4 1). Depth Lite holds: 4 small tasks, no logic. **Updated at Phase 3:** 5 tasks · 6 review rounds — T3 split into T3a (command pools) and T3b (docs/counts) per the Step 3.2 rules-text rule; LOC unchanged.

## 11. Premise Ledger

Count: 9 rows — 7 verified, 2 `UNVERIFIED` (1 High, 1 Low).
Blast-radius triggers: `consumer` fires (the packaged-skill set gains a member); `live-path` and `shared-state` do not apply — no user action or shared runtime state is changed, only package content and lists.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | The stack-skill candidate pools are at constitution Step 5 (`.claude/commands/akili-constitution.md:255-263`), Step 8D (`:726-728`), specify Step 2.1 (`.claude/commands/akili-specify.md:243-251`), and the summary at `docs/commands/akili-constitution.md:123` — four pools in three files. Other lists naming stack skills are illustrative, not pools, and stay unchanged: `docs/commands/akili-test.md:67`, `docs/flow.md:657`, `AGENTS.md:62`, `.claude/templates/leader.md:25`, `.claude/templates/implementer.md:27` (`grep -rln nestjs-expert --exclude-dir=node_modules --exclude-dir=specs --exclude-dir=.git .` → 32 files, run 2026-11-01: the four pools, these five illustrative lists, the P-2 inventory docs, `CHANGELOG.md`, `releases/v2.8.0.md`, the skill's own files, the doctor fixture, and 16 persona fixtures under `test/fixtures/personas/` that copy the leader/implementer templates) | location | `grep -rln "ai-agent-development" --exclude-dir=node_modules --exclude-dir=specs --exclude-dir=.git .` → 11 files, of which 3 hold the four pools; line numbers by `grep -n -E "^- \`(nestjs-expert|angular-developer|ai-agent-development)\`"` on the two commands | `7067fe9` | T3 misses a pool (Low) | — |
| P-2 | Every consumer of the packaged-skill set: `docs/cli.md:327,339,360,377` ("31 packaged skills"); `test/akili-marketing-docs.test.js:118` and `test/diagram-design.test.js:418` (pin "31" in `cli.md`); `test/install-cursor.test.js:224-251` (`SKILL_FILE_EXPECTED = 247 + 58 + 3`); `test/fixtures/doctor-codex-baseline.txt:26-56` (doctor `OK <skill>` list), read by `test/install-cursor.test.js:880` and `test/install-grokbot.test.js:885`; `test/docs-overview.test.js:239-297` (one row per skill in `docs/overview.md` and `docs/skills/README.md`, every count statement equals the inventory); `docs/skills/governance.md:70` (`stack` row enumerating the 10 stack skills, pinned by no test) | consumer | `grep -rn "ai-agent-development" test/*.js bin/*.js scripts/*.js` → 0 hits; `grep -rn -E "\b31\b" README.md docs/*.md docs/skills/README.md docs/commands/*.md \| grep -i skill` → 4 hits; `grep -rn -E "\b31\b\|\b30\b\|skill directories" test/*.js` → listed hits; `grep -rn "doctor-codex-baseline" test/*.js` → 2 readers | `7067fe9` | T3 leaves a red or a stale count (Low) | — |
| P-3 | The installer copies every top-level folder under `.claude/skills/` with no per-skill list | existence | `bin/akili.js:73` (`SOURCE_SKILLS`), `:990` (`copyDirectoryContents`), `:1242` (called on `SOURCE_SKILLS`) | `7067fe9` | An installer edit enters scope → Pivot (High) | — |
| P-4 | The upstream `LICENSE` names no copyright holder (`Copyright (c) 2025`) | data-env | `gh api "repos/Jeffallan/claude-skills/contents/LICENSE?ref=078a25cc5bfd8011459be7b91d004e900c1d02d3" --jq .content \| base64 -d \| sed -n 3p` → `Copyright (c) 2025`; blob `b77bf2ab…`, 1,056 B (run 2026-11-01) | upstream `078a25c` | `NOTICE` restates a holder the license already names (Low) | — |
| P-5 | The holder's display name is "Jeff Allan" | data-env | `UNVERIFIED — confirm at source before relying on it` (inferred from the handle) | — | `NOTICE` names the wrong person (Low) | T1, from the upstream GitHub profile or README; fall back to "GitHub user Jeffallan" |
| P-6 | The skills.sh "Gen Agent Trust Hub: Fail" label does not reflect unsafe content in the six pinned files or `LICENSE` | data-env | `UNVERIFIED — confirm at source before relying on it` (the label is user-stated in the brief; its reason is not shown) | — | FR-1 `FAIL` → nothing copied, Pivot (High) | T1; user-stated |
| P-7 | `.claude/skills` is in the npm package `files` list, so a new folder ships | existence | `package.json:16-18` | `7067fe9` | The skill never reaches npm users (High) | — |
| P-8 | Stack skills carry no `## AKILI-SPECS Integration` section and are not load-directed by commands | other | `docs/skills/governance.md` → *Adaptation Levels* (`stack` row: "deliberately get **no** integration section") and *Rules of thumb* bullet 3 | `7067fe9` | Body edit enters scope (Low) | — |
| P-9 | Windows CI checks LF files out as CRLF unless a path is `-text`; upstream files are LF-only | data-env | `.gitattributes` (comments + `-text` for `test/fixtures/**`, both SVGs, `.claude/skills/impeccable/**`; no golang-pro entry); `.github/workflows/ci.yml:30` `os: [ubuntu-latest, macos-latest, windows-latest]`; each of the six pinned files and `LICENSE` → 0 CR bytes (`gh api "…/contents/<path>?ref=078a25cc…" --jq .content \| base64 -d \| grep -c $'\r'`, run 2026-11-01) | `7067fe9` | The DD-2 lock goes red on windows-latest legs (High) | — |

Hand-off: P-2 → T3 `Consumers` field; P-9 → T2 scope; P-5 and P-6 → T1 first step.
