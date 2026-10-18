# Execution Log: `/akili-security` — repository security audit on Cloudflare's `security-audit` skill

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security` |
| Depth | Full (compact) |
| Approval Mode | `gated` |
| Budget (design §11) | 12 tasks · ~650 LOC authored · 18 review rounds — tripwire past 13 tasks / ~800 LOC / 18 rounds |
| Started | 2026-10-18 (`37ad187` — specify gate approved) |
| Leader | Claude Opus 5.5 (session model; no `## Model Routing` registry in this repo's `AGENTS.md`; default tiers from `docs/model-routing.md` apply: T2 `sonnet`, T3 `opus`) |
| Spawn mechanism | No Step 8E wrappers (`.claude/agents/` absent) — fallback sub-prompts seeded with `.agents/implementer.md` / `.agents/reviewer.md` by pointer; model set per spawn (`author ≠ auditor`) |
| Personas | `.agents/` absent in this worktree (gitignored) — copied from the main checkout `/Users/jcadavid/Development/sdd-jc-methodology/.agents/` (same practice as the sibling worktrees). `akili doctor --agents`: all sections CURRENT except leader `delegation` CUSTOM-EDITED and `shared-file-discipline` UNLOCATED (leader, implementer) — "No persona drift blocking CI"; left as the maintainer's call, as in prior specs |
| Upstream | `/tmp/cf-sas.S52m/repo` present, `git rev-parse HEAD` → `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`; upstream checksum list at the spec session's scratchpad `…/e5ce96d9-0a81-4b86-b0c3-a2afc7cf600a/scratchpad/upstream-sha256.txt` |
| Running totals | tasks 0/12 · LOC 0 · review rounds 0 |

## 2. Task Execution History

### T3a–T3d — reader scoping of `docs/specs/audits/` to `drift-*.md` (one Implementer spawn, one Reviewer spawn, four verdicts)

Decision: the four XS reader edits ran in one Implementer spawn and one Reviewer spawn, with a separate verdict per task. They share one design table (§7.3), one walk input and one phrase-family sweep, so one context costs less than four and loses nothing. Each task keeps its own record below. Ran in parallel with T1 (disjoint files; T1's `npm test`/install reads `.claude/` only for file counts, which T3's text edits do not change).

| Field | T3a `akili-archive.md` | T3b `akili-audit.md` | T3c `kaizen/SKILL.md` | T3d `akili-constitution.md` |
|---|---|---|---|---|
| Status | **PASS** (attempt 1) | **PASS** (attempt 1) | **PASS** (attempt 1) | **PASS** (attempt 1) |
| Date | 2026-10-18 | 2026-10-18 | 2026-10-18 | 2026-10-18 |
| Files changed | `.claude/commands/akili-archive.md` :83–84 (2 lines) | `.claude/commands/akili-audit.md` :79 (1 line) | `.claude/skills/kaizen/SKILL.md` :69, :74 (2 lines) | `.claude/commands/akili-constitution.md` :39 (1 line) |
| Red run (baseline, Implementer) | `grep -c "drift-"` → `1` | `grep -c "drift-"` → `4` | `grep -c "drift-"` → `2` | `:39` read *one drift report per `/akili-audit` run.* |
| Implementer verification | `grep -n "drift-\*"` → :83, :84; walk on `audits/` = {`README.md`, `security-2026-10-18.md`} → "no drift report → legacy fallback" | `sed -n 79p` shows `drift-*`; same walk → legacy fallback | `grep -n "drift-\*"` → :69, :74; same walk → legacy fallback | `:39` → *one drift report per `/akili-audit` run (`drift-*`) and one redacted index per `/akili-security` run (`security-*`).*; `:40`, `:1443` read — generic README-scaffolding rules, not edited; sweep `one drift report\|drift report per` over `.claude/commands/*.md` → `:39` only |
| Falsifier | Old `:83` wording → the security index is a report file and is picked as most recent (text walk; the Implementer reasoned it on the reverted wording, not on a scratch copy — the gate is a text walk, so this is the walk itself) | Old `:79` → security index taken as most recent (text walk) | Old `:74` → "report files" admits the security index (text walk) | Sweep red on any surviving drift-only role statement in `.claude/commands/`: none survives. `docs/commands/akili-constitution.md:43` is the one docs hit, owned by T5b |
| Evidence re-run (Leader-inline, non-author) | **VERIFIED** — `grep -n "drift-\*"` → :83, :84 | **VERIFIED** — `:79` holds `drift-*` (count 1) | **VERIFIED** — :69, :74 | **VERIFIED** — `:39` quoted above; sweep → `:39` only |
| Reviewer verdict (`opus`, checklist, effort medium) | **PASS** — matches §7.3 row 1 and the legacy-fallback paragraph; four-case walk (drift present / only security index / only README / empty) each lands where FR-13 says; security index excluded twice (explicit clause + candidate set) | **PASS** — matches §7.3 row 2; Step 3 write path (`:65`, `:68`) not in the diff; `:31` carve-out is a spec-discovery rule, unaffected | **PASS** — matches §7.3 row 3; `:69` defers to `:74`'s condition, so there is no second, conflicting statement; `:55` names an input, not a selection rule | **PASS** — matches §7.3 row 4; `:40`, `:1443` correctly left unedited |
| ADVISORY | none | none | none | none |
| Requirements covered | FR-13 (scenario + `BUT`) | FR-13 | FR-13 | FR-13 (last sentence) |
| Forward pointers (to T5b, carried) | `docs/commands/akili-archive.md:68`, `docs/flow.md:424-425` | `docs/commands/akili-audit.md:34`; DD-5 reversion note (a hand-renamed report stops being read) belongs in the docs | `docs/skills/kaizen.md:24` | `docs/commands/akili-constitution.md:43,53` |
| Review intensity | Not met: Consumers non-`none` and the task edits rules text (override a). Reviewer owed and run | same | same | same |

- Models: Implementer `sonnet` (T2, effort medium, no skills beyond persona defaults); Reviewer `opus` (T3). Author ≠ auditor held.
- Phrase-family sweep (Implementer, four files: `most recent report`, `report file`, `drift-report`, `audits/`, `drift report`): no unscoped source rule survives. Re-checked by the Reviewer.
- runtime events: none.
- spawns: implementer — not reported by host; reviewer — not reported by host (ended complete for both).
- Final verification: the four `git diff --stat` lines — archive 4, audit 2, constitution 2, kaizen 4 (6 insertions, 6 deletions).
- Running totals after T3a–T3d: tasks 4/12 · LOC ~6 · review rounds 4 / 18.

### T1 — Vendor `security-audit` at `c1c8a8c` + `test/security-audit-skill.test.js`

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1) |
| Date | 2026-10-18 |
| Attempts | 1 |
| Models | Implementer `sonnet` (T2, effort high, skill `tdd`) · Reviewer `opus` (T3, effort high, lens checklist) |
| Files changed | `.claude/skills/security-audit/` — 19 files (18 upstream non-test files + upstream repo `LICENSE`; `*.cjs` exec bit kept); `SKILL.md` adapted per design §7.2 (frontmatter keys, description sentence, `## AKILI-SPECS Integration`); new `test/security-audit-skill.test.js` (6 cases) |
| Upstream | `git -C /tmp/cf-sas.S52m/repo rev-parse HEAD` → `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` (Implementer before copying; Reviewer again) |
| Red run (pre-copy, quoted) | Cases 1, 2, 3, 6 red with `ENOENT … scandir/open '.../.claude/skills/security-audit...'` (the directory's absence is the behaviour under test — tasks.md *Red run*); case 4 `expected: 0, actual: 1`; case 5 (ledger `{}` → 1) **green pre-copy** — a missing validator also exits 1, so the case is inert before the copy. Disclosed by the Implementer; the falsifiers carry the discrimination |
| Implementer verification | `node --test test/security-audit-skill.test.js` → `# pass 6 / # fail 0` on Node v22.12.0 and v18.20.8; `npm test` → `# pass 263 / # fail 2` — `not ok 65` (install-cursor count, `:245`) and `not ok 75` (`doctor-codex-baseline.txt`) = the declared Consumers, **expected reds fixed in T4**, not regressions; body gate → empty, `body-exit=0`; Windows `UNVERIFIED` (P-13) |
| Falsifiers (executed post-green, each reverted, revert confirmed by checksum) | (1) `validate-findings.test.cjs` copied in → `not ok 1 - vendored file set is exactly the 19 expected names...`, `not ok 6 - install ... lands the same 19 files` · (2) `LICENSE` deleted → `not ok 1`, `not ok 3 - LICENSE keeps the upstream copyright notice`, `not ok 6` · (3) one byte appended to `HUNTING.md` → `5948d7d0…edb5` vs upstream `71c121de…de09`, a second checksum-walk mismatch · (4) pin removed from `source` → `not ok 2 - SKILL.md frontmatter carries upstream attribution and AKILI binding` |
| Evidence re-run (Leader-inline, non-author) | **VERIFIED** — `node --test test/security-audit-skill.test.js` → pass 6 / fail 0; `npm test` → pass 263 / fail 2 (`not ok 65`, `not ok 75`, the same two); checksum walk below; `LICENSE` → `e598e694aa506650c7192d5ea3be0e50aca0d356ea00551c53429f0b01eb6391`; body gate → `body-exit=0`; `ls | wc -l` → 19 |
| Reviewer verdict | **PASS** — "T1 matches FR-1, FR-7 (smoke) and NFR-2, and design §4, §7.2, DD-2, DD-3 and DD-11". Frontmatter checked against §7.2 key by key; the AKILI section covers every §7.2 item and claims nothing beyond the spec. The Reviewer also ran FR-1 *Install on every host* (`AND IT MUST … diff -r`): `HOME=<scratch> node bin/akili.js install --tool all` → exit 0; six roots each hold 19 files, 0 `*.test.cjs`, `diff -r` identical to source. `git diff -- package.json bin/` → empty |
| ADVISORY (recorded, never gating) | Reliability: case 5 (ledger `{}` → 1) and the `[{"verdict":"confirmed"}]` → 1 half of case 4 cannot tell "validator rejects" from "validator missing" (both exit 1); asserting the P-6 stderr text or adding a valid-ledger → 0 case would close it. Readability: the AKILI section's redaction sentence omits the private-repo opt-in (title + fingerprint, DD-4/FR-8) — not a contradiction. Risk: two executable `.cjs` files ship to six roots (mitigated by P-6 and the byte-identity checks); a re-sync should re-run the P-6 grep. Recorded only — no task is widened to absorb them |
| Requirements covered | FR-1 (both scenarios incl. `BUT` no `*.test.cjs`, `AND IT MUST` `diff -r` — Reviewer-run — and body unchanged), FR-7 (validator smoke), NFR-2 |
| Decisions | Skills per task list (`tdd`), no deviation. Effort `high` (first vendored third-party payload with executable files). T1's brief narrowed "record in `execution.md`" to "report it" — the Leader owns the log. Review intensity not met (Consumers non-`none`; Review `full`) → Reviewer owed and run |
| Issues encountered | Weak baseline red for case 5 (above). No backups left in the tree |
| runtime events | none |
| spawns | implementer — not reported by host, ended complete; reviewer — not reported by host, ended complete |
| Final verification | New test green on Node 22 and 18; `npm test` 263/265 with exactly the two T4-owned reds |

**Checksum walk** (`shasum -a 256`, upstream list = 18 lines in the spec session's `upstream-sha256.txt`; Leader re-run):

| File | Upstream | Vendored | Result |
|---|---|---|---|
| `AI-AND-LLM.md` | `7335a95c…d2ef` | `7335a95c…d2ef` | match |
| `ATTACK-CLASSES.md` | `3ee4f00c…ef83` | `3ee4f00c…ef83` | match |
| `CLIENT-SIDE.md` | `613f6b98…370c` | `613f6b98…370c` | match |
| `CLOUD-AND-DEPLOYMENT.md` | `3c80f308…6ca3` | `3c80f308…6ca3` | match |
| `DATA-ISOLATION-AND-LIFECYCLE.md` | `307dcb3e…a4ad` | `307dcb3e…a4ad` | match |
| `DESKTOP-MOBILE-AND-LOCAL-IPC.md` | `58eae8ee…8cb2` | `58eae8ee…8cb2` | match |
| `HUNTING.md` | `71c121de…de09` | `71c121de…de09` | match |
| `MEMORY-SAFETY-AND-BINARY.md` | `7c8b0dcc…24a7` | `7c8b0dcc…24a7` | match |
| `PROTOCOLS-RPC-AND-MESSAGING.md` | `8b73816f…a619` | `8b73816f…a619` | match |
| `RECONNAISSANCE.md` | `02ca887a…81a2` | `02ca887a…81a2` | match |
| `report-schema.json` | `6575c9de…5519` | `6575c9de…5519` | match |
| `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` | `4326fab5…4baa` | `4326fab5…4baa` | match |
| `SKILL.md` | `5e3e96a1…ac85` | `7e11f5e2…59ff` | **MISMATCH** (adapted) |
| `SUPPLY-CHAIN-AND-RELEASE.md` | `f372e919…52a5` | `f372e919…52a5` | match |
| `validate-coverage-ledger.cjs` | `2eb280bd…8ac8` | `2eb280bd…8ac8` | match |
| `validate-findings.cjs` | `e85f232e…5283` | `e85f232e…5283` | match |
| `VALIDATION-AND-REPORTING.md` | `b892470c…9449` | `b892470c…9449` | match |
| `WEB-PROTOCOL-AND-AUTH.md` | `4f3066df…2b5c` | `4f3066df…2b5c` | match |
| `LICENSE` (upstream repo root) | `e598e694…6391` (expected) | `e598e694…6391` | match |

Exactly one mismatch: `SKILL.md` (adapted).

- Running totals after T1: tasks 5/12 · LOC ~140 authored (T1 ~134: test + SKILL.md additions; ~4 300 vendored lines copied, not authored) · review rounds 5 / 18.

### T5a — `docs/skills/security-audit.md`, `docs/skills/README.md`, `docs/skills/governance.md`

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1) |
| Date | 2026-10-18 |
| Attempts | 1 |
| Models | Implementer `sonnet` (T2, effort medium, skill `cognitive-doc-design`) · Reviewer `opus` (T3, effort medium, lens checklist) |
| Files changed | `docs/skills/security-audit.md` (new,       85 lines) · `docs/skills/README.md` (one `core` row at `:35`, before `seo-audit`) · `docs/skills/governance.md:37` (`core` row gains `security-audit` (security)) |
| Red run (baseline) | `ls docs/skills/security-audit.md` → `No such file or directory`; `grep -c security-audit docs/skills/governance.md` → `0` |
| Implementer verification | Quote-check at HEAD: `ls .claude/skills/security-audit \| wc -l` → `19`; pin `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` / `version: "c1c8a8c"`; `LICENSE` → `MIT License` / `Copyright (c) 2025-2026 Cloudflare, Inc.`; `wc -c` → `262596 total`; P-3/P-4/P-5 claims cited by premise id from the design, not re-run; `grep -n "security-audit" docs/skills/README.md docs/skills/governance.md` → `README.md:35`, `governance.md:37` |
| Falsifier | Scratch copy + one extra file → `ls \| wc -l` → `20` against the page's "19 files" (`grep -c "19 files"` → 2) — red |
| Not Done / Assumptions (verbatim) | "The CHANGELOG half of checklist item 5 is only referenced (that entry belongs to another FR-14 task). The page row says "CHANGELOG entry owned by the spec's FR-14 task". Reword or drop it if you want it stricter." · "I did not name the two excluded upstream test files individually. The page says "the two `validate-*.test.cjs` files" because the design only pins that glob." · "The page names `/akili-security` but says nothing about its internals beyond SKILL.md's AKILI section and FR-14." — Leader: no owed item and no blocker (assumptions only; the CHANGELOG entry is T7's scope) → no continuation |
| Evidence re-run (Leader-inline, non-author) | **VERIFIED** — `grep -n security-audit` → `README.md:35`, `governance.md:37`, one row each; 19 files; `grep -c "19 files"` → 2; pin and licence lines present |
| Reviewer verdict | **PASS** — every factual clause quote-checked at HEAD (19 names in four groups; 262596 bytes; pin; licence; mode table and AKILI table match `SKILL.md`; test's `UPSTREAM_SHA` and 19-name lock); P-3 measurements match design §12 word for word; all five re-sync steps present; README row `core` true (25 rows for 25 skill dirs); checklist 1–5 answered, links resolve |
| ADVISORY (recorded, never gating) | Reliability: re-sync steps 2–3 diff and copy only upstream `skills/security-audit/`, but the shipped `LICENSE` comes from the upstream **repo root** — a re-sync following the page would never refresh `LICENSE` (e.g. a copyright-year bump); one-line fix "and the repo-root `LICENSE`". Readability: checklist items 1–4 point at sections "above" without links. Recorded only — the first is raised to the user at the continue gate as a possible spec gap (tasks.md T5a's re-sync step list omits the licence) |
| Requirements covered | FR-14 (skill page incl. re-sync procedure; README row; governance `core` row) |
| Decisions | Skills per task list (`cognitive-doc-design`), no deviation. Review intensity not met (task `Review` = `checklist`; docs produce derived claims a later gate reads — override c) → Reviewer owed and run. Ran in parallel with T2 (disjoint files) |
| runtime events | none |
| spawns | implementer — not reported by host, ended partial (assumptions-only field); reviewer — not reported by host, ended complete |
| Final verification | Three files; every clause quote-checked at HEAD |

- Running totals after T5a: tasks 6/12 · LOC ~233 authored (T5a: 85-line page + 2 rows) · review rounds 6 / 18.

### T2 — `.claude/commands/akili-security.md` — **in progress (`[~]`)**: attempt 1 FAIL (safety lens); three spec tensions at the gate

| Field | Value |
|---|---|
| Status | `[~]` — attempt 1 consumed (safety-lens FAIL); rework held for the user's decision on three amendment proposals (below) |
| Date | 2026-10-18 |
| Models | Implementer `sonnet` (T2, effort xhigh, skill `cognitive-doc-design`) · Reviewers `opus` ×2 in parallel (T3, effort xhigh) — lens *safety* and lens *requirement conformance* (Review mode: parallel lens reviewers — the task touches a security surface) |
| Attempt 1 — files changed | `.claude/commands/akili-security.md` (new, 163 lines; uncommitted — the in-flight attempt) |
| Attempt 1 — red run | `ls .claude/commands/akili-security.md` → `No such file or directory`; `node bin/akili.js list` → 11 commands |
| Attempt 1 — P-14 outcome | Step 0 asks the agent to test its own host: "can you spawn an independent sub-agent — a fresh agent with its own context that is not you?" — no host list; no → **Guidance review** replaces **Run**; per-host support stays `UNVERIFIED` and is not asserted |
| Attempt 1 — Implementer verification | `wc -l` → 163 (≤ 230, NFR-5); `node bin/akili.js list \| grep akili-security` → 1 hit; `grep -nE "drift-report\|most recent report"` → 0; `grep -c 'bugfix/security-'` → 2; `grep -c '~/'` → 2; clause walk (~45 rows, FR-2…FR-12 + NFR-5) at the session scratchpad `t2/clause-walk.md`; `npm test` → tests 265 / pass 263 / fail 2 (`not ok 65`, `not ok 75` — T4-owned) |
| Attempt 1 — falsifiers (scratch copies) | m1: deleted "On every run, sandboxed or not, nothing installs dependencies, fetches from the network, or probes deployed endpoints." → FR-4 `AND IT MUST NOT` row loses its primary quote (the addendum's "Never install dependencies, fetch from the network, or probe deployed endpoints." remains as a secondary quote) · m2: removed "both gates (Step 1, Step 5) stop on every run" and "**stop**" → FR-3 row red · m3: inserted `title` into the Records allowed list → contradicts "Default mode also forbids a title or fingerprint" (FR-8 `BUT` red) |
| Attempt 1 — Not Done / Assumptions (verbatim) | "The command names the model-checkpoint tiers T1 and T3 per design DD-7. It carries no `model:` key." · "Step 4 references `/akili-audit` Step 3 ("Write Drift Report") by name, with no line numbers." · "The FR-9 Guidance review path ends the command and writes no index." · "Step 5 also offers the detailed-index opt-in. FR-8 places that opt-in at the routing gate." — Leader: assumptions only, no owed item, no blocker |
| Attempt 1 — evidence re-run (Leader-inline) | **VERIFIED** — `wc -l` 163; `akili list \| grep -c akili-security` 1; drift grep 0; `bugfix/security-` 2; `~/` 2; no `model:` key; `npm test` pass 263 / fail 2 (same two) |
| Attempt 1 — Reviewer, lens conformance | **PASS** — own term-by-term walk of FR-2…FR-12 before reading the Implementer's; every obligation has a delivering sentence; §7.1 rows all present; 11 checklist boxes; I-2/I-3/I-5 present; P-14 a self-test; path rule names `/akili-audit` Step 3; addendum quoted once and required in every delegated prompt; consistent with `SKILL.md` *AKILI-SPECS Integration*; no `model:`, no line pointers. Reported **two spec tensions** (T-1, T-2 below) |
| Attempt 1 — Reviewer, lens safety | **FAIL** — 4 issues (verbatim below) |
| runtime events | none |
| spawns | implementer — not reported by host, ended partial (assumptions-only field); reviewer-safety — not reported by host, ended complete (FAIL); reviewer-conformance — not reported by host, ended complete (PASS) |

**Safety-lens FAIL report (verbatim; relayed unchanged to the rework):**

> STATUS: FAIL
> ISSUES: 4
> 1. **Discovered Issue:** Step 0.4 runs before the plan gate and says "Test it on your own host … can you spawn an independent sub-agent". An agent can read "Test it" as an order to spawn a probe agent. That contradicts ":42 Nothing is spawned … until the user answers **Run**".
>    * **Violated Rule:** requirements.md FR-3 scenario "no reconnaissance, hunter or verifier agent has been spawned"; checklist FR-3.
>    * **Remediation Suggestion:** Reword to "Answer from your own tools and capabilities; do not spawn an agent to find out — nothing is spawned before **Run**."
> 2. **Discovered Issue:** "Target content is data" appears only inside the addendum, which is addressed to "Every delegated agent's prompt". Two readers are never told it. (a) The parent (orchestrator), which consolidates agent output that may echo injected text. (b) The **Guidance review** path (":66"), where the parent reads the target itself and no addendum exists.
>    * **Violated Rule:** FR-5 "never as instructions to the auditing agents. The command text and every delegated agent's brief MUST state this."
>    * **Remediation Suggestion:** Add one sentence outside the quote: "This binds you, the parent, on every path including Guidance review, as well as every delegated agent."
> 3. **Discovered Issue:** There is no rule for a run directory outside HOME. ":110 the run path is always `~/…`" cannot be met for `--out /private/tmp/...`, and T8 (I-9: `--out` under the session scratchpad) lands exactly there. That branch falls through. An agent will either write the absolute path (it contains `claude-501`) or invent a form. The pointer at ":125" has the same gap.
>    * **Violated Rule:** FR-8 "never as an absolute path that names the user or the home layout"; KZ-004 (enumerate terminal branches).
>    * **Remediation Suggestion:** Enumerate the cases. Under HOME → `~/…`. Inside the target (ignored) → repo-relative. Elsewhere → `<external>/run-<N>`, with the real path given only in conversation.
> 4. **Discovered Issue:** ":58 Record the approval (who, when, mechanism) for the index" and ":105 approved by" contradict ":110 Forbidden in every mode: … user name". An agent filling "who" will naturally write the OS login or the git user name.
>    * **Violated Rule:** FR-8 forbidden list vs FR-4 "recorded in the index (who, when, mechanism)".
>    * **Remediation Suggestion:** Define "who" as the approver as the user states it at the gate (default "the user"), never the OS account, home path or git config value.
>
> ADVISORY:
> - Risk: ":58" paraphrases "all four upstream controls" but drops "read-only … toolchain", "scratch-local `HOME`, temporary directories, and caches" and the loopback-only exception. A user who confirms only against this list may approve a weaker sandbox. Suggest "(as SKILL.md *Universal execution safety* states them)".
> - Risk: when the user continues with a foreign copy, that fact is never recorded in the plan or the index. Add a "Skill copy: pinned | foreign <~path>" plan field.
> - Risk: under `sandboxed-approved`, the addendum does not name the approved mechanism, so a delegated agent does not know which sandbox to use. Add `mechanism: <…>` to the policy line.
> - Reliability: `bugfix/security-<date>-s<n>` collides when two runs on the same date both route S-n. Add the run number or a collision suffix.
> - Risk: `akili install --force` overwrites every installed file on every root, not only this skill. Say so in the offer.

**Conformance-lens ADVISORY (recorded, never gating):** the quoted addendum omits "write isolation as upstream", which §7.1 lists among its contents; the budget-cannot-fund path should state that an `incomplete` run before Phase 4 goes straight to the index; the FR-10 and FR-4 checklist boxes omit the `routed` update and `akili_execution` (both delivered in the steps); nothing says a sandbox approval is cleared when **Adjust** returns to static-only.

**Leader adjudication.**

| Finding | Ruling |
|---|---|
| Safety 1 (Step 0 "test it" could spawn a probe) | In scope (FR-3) — rework |
| Safety 2 (target-content-is-data not binding on the parent / Guidance review) | In scope (FR-5 "The command text … MUST state this") — rework |
| Safety 3 (run path outside HOME) | **Spec tension T-1** with conformance tension 1: FR-8 requires `~/…`, FR-3 allows any `--out`, T8 (I-9) puts `--out` outside HOME. Cannot be fixed without amending FR-8/FR-10 — at the gate |
| Safety 4 ("who" vs forbidden user name) | **Spec tension T-3**: FR-4 "who" vs FR-8 "user name" — at the gate (clarification proposed) |
| Conformance tension 2 (FR-12 vs FR-6) | **Spec tension T-2** — at the gate |

Attempt 1 consumed (safety-lens FAIL is in scope). Rework (attempt 2, effort bumped xhigh → max — escalation of the tier is not taken; see the gate) is held until the user answers the three amendment proposals, so the rework brief carries the amended text instead of a pre-amendment one.

- Running totals after T2 attempt 1: tasks 6/12 · LOC ~396 authored (T2 attempt 1: 163) · review rounds 8 / 18 (two lens verdicts).
