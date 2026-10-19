# Proposal — `/akili-security` follow-up: pin literal, five safety advisories, Windows decision

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security-followup` |
| Slug | `akili-security-followup` — given as the first token of the argument |
| Type | **Change** — rules text in `.claude/commands/akili-security.md`, its docs, and its text-contract tests |
| Deliverable | software |
| Approval Mode | gated |
| Date | 2026-10-18 |
| Author | AKILI session (proposer) |
| Status | **Approved** — 2026-10-19 (Juan Carlos Cadavid): recommended defaults for W-2 and A-4…A-8; Windows option (a) + upstream request draft (c), no wrapper; D-1…D-4 split as a separate audit run afterwards; Q-1 resolved to the option that executes nothing in the target before Run — **in-target run directories are dropped** (run directory always outside the target), so `git check-ignore` is no longer needed |
| Source spec | `changes/akili-security`, archived at `docs/specs/archive/2026-10-18-changes--akili-security/` (`validation-report.md` W-2, A-4…A-8, A-12; `execution.md` K-2, D-1…D-4; `judgment.md` I-10) |
| Deferral authority | `execution.md:596` — user decision, verbatim: "W-2, A-4 a A-8 y D-1 a D-4 van a una propuesta aparte" |
| Depends on | none |
| Parallel-safe | **yes** with respect to other specs: it touches only the `/akili-security` command, its two docs pages, its two test files and `CHANGELOG.md`; no installer code, no routing template, no command or skill count |
| Split out | D-1…D-4 → a standalone `/akili-security --profile standard` run, **not** this spec (see *Scope*) |

## Intent

Close the gaps the `changes/akili-security` validation left open on purpose: make the provenance check falsifiable (W-2), tighten five places where the command's rules text is weaker than the upstream method or than its own safety claims (A-4…A-8), and decide — with evidence — whether native Windows support is deliverable now.

## Answer first (decisions this proposal asks you to approve)

| # | Question | Recommendation | One-line reason |
|---|---|---|---|
| 1 | W-2 + A-4…A-8 in one spec? | **Yes, one Lite-to-standard spec** | All six are rules text in one command plus its docs/tests; one sweep, one release note |
| 2 | Windows (item 3): build a shim, ask upstream, or keep unsupported? | **(a) + (c): keep the fail-closed stop; draft an upstream request; add a re-sync gate that lifts the stop only on green Windows CI** | Upstream says in code there is no race-safe Node fallback; a shim would swap prevention for detection and fork ~55 lines of glue (details below) |
| 3 | D-1…D-4: spec or audit run? | **Audit run, outside any spec** | They are audit units with no finding yet; the command already routes `confirmed` records to Bug specs |
| 4 | A-8 (`git` in the target): which mechanism? | **Read ref from files; never execute `git` in the target before the plan gate; dirty state reported as `not determined` unless the user supplies it** | No `git` flag ignores repo-local config; a denylist of keys is not a guarantee |
| 5 | A-7 (`--force` scope): CLI flag or rules text? | **Rules text** — move the one skill directory aside, then a skip-existing install restores only it | No installer change; `--skills-only --force` still overwrites every skill on every root |

## Problem / Current Behavior

| # | Item | Today (cited) |
|---|---|---|
| W-2 | Pin never stated | Step 0.1 checks "a `source` naming the pinned commit" but never gives the commit (`.claude/commands/akili-security.md:37`). The pin lives only in `SKILL.md` frontmatter (`.claude/skills/security-audit/SKILL.md:7,11`) and the docs (`docs/skills/security-audit.md:38`) — so after a re-sync, a stale AKILI copy whose `source` names the old pin passes the check. The re-sync step 4 list (`docs/skills/security-audit.md:74`) does not name the command |
| A-4 | Slug collision | Routing slug is `bugfix/security-<YYYY-MM-DD>-s<n>`, built "only from the run date and the `S-n` id" (`akili-security.md:129-135`); two runs on one date routing the same `S-n` produce the same spec path |
| A-5 | Weaker sandbox list | The execution gate lists four controls (`akili-security.md:61`). Upstream's list also requires a read-only **toolchain**, scratch-local `HOME`/temp/caches, and allows loopback only as an isolated namespace (`SKILL.md:43-44`; `RECONNAISSANCE.md:53`; `HUNTING.md:74-76`). A user can approve a sandbox missing those |
| A-6 | Unrecorded foreign copy | Step 0.1 offers "continue with that copy" (`akili-security.md:37`), but the plan table (`:47-57`) and the index header (`:106`) have no field for it; the addendum names the policy but not the sandbox mechanism (`:77`) |
| A-7 | Over-broad reinstall offer | Step 0.1 offers `akili install --force` (`:37`). `--force` is "Overwrite existing files" (`bin/akili.js:230`) across every selected tool; the narrowest existing filter is `--skills-only` (`bin/akili.js:233`), still every skill. No per-skill flag exists (`bin/akili.js:216-250`) |
| A-8 | `git` runs in the target pre-gate | Step 0.3 runs `git status --porcelain` in the target before the plan (`:40`); the run-directory rule runs `git check-ignore -q` (`:59`). `git status` can launch `core.fsmonitor` from a hostile local `.git/config` (judgment I-10, `judgment.md:27`). Whether `check-ignore` can launch target-configured programs: `UNVERIFIED — confirm at source before relying on it` (owner: specify, Premise Ledger) |
| Win | Fail-closed on Windows | Both validators throw when `O_NOFOLLOW`/`O_NONBLOCK` are missing (`validate-findings.cjs:604-608`, `validate-coverage-ledger.cjs:721-726`); the ledger validator comments: "Node exposes no race-safe fallback on these platforms, so reject all inputs" (`:724`). Preflight stops on Windows (`akili-security.md:39`); tests pin the fail-closed contract (`test/security-audit-skill.test.js:89-113`); CI evidence run 39160826587 (CHANGELOG 2.33.0) |

## Proposed Outcome

| Item | After this change |
|---|---|
| W-2 | Step 0.1 states the literal `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` and compares it with the loaded `source`; re-sync step 4 lists "the command's Step 0.1 pin"; a test asserts command pin = `SKILL.md` `source` pin = test `UPSTREAM_SHA` |
| A-4 | Slug carries the run number: `bugfix/security-<YYYY-MM-DD>-r<N>-s<n>` (charset unchanged, still no target-derived text) |
| A-5 | The execution gate's control list matches upstream term for term (read-only target **and toolchain**; scratch-local `HOME`/temp/caches; no external network, isolated loopback only when a local fixture needs it; resource limits) — quoted from or pointed at the skill, not paraphrased |
| A-6 | The plan and index record the skill copy (`pinned` / `foreign, continued by <approver>` + resolved path in its location form); under `sandboxed-approved`, the addendum names the mechanism |
| A-7 | The reinstall offer becomes: move the resolved `security-audit` directory aside, then a skip-existing `akili install --tool <host> --skills-only` restores that skill only; `--force` is no longer offered |
| A-8 | No `git` process runs in the target before **Run**: ref resolved by reading `.git/HEAD`/refs as data; dirty flag `not determined` unless the user states it; the in-target run-directory check uses a mechanism decided at specify (Premise Ledger) |
| Win | Stop stays. Re-sync procedure gains a step: the stop is lifted only when a new pin's validators pass the non-fallback test cases on both Windows CI legs. An upstream request text is drafted in the spec folder for the user to file |

## Scope

- In: W-2, A-4, A-5, A-6, A-7, A-8, the Windows decision and its re-sync gate.
- Files: `.claude/commands/akili-security.md`, `docs/commands/akili-security.md`, `docs/skills/security-audit.md`, `README.md` / `docs/flow.md` / `docs/commands/README.md` / `.claude/skills/security-audit/SKILL.md` **only where they restate the slug or the gates** (the slug pattern appears in all of them — phrase-family sweep per KZ-changes--kaizen-loop-closure-2), `test/akili-security-command.test.js`, `test/security-audit-skill.test.js`, `CHANGELOG.md`.
- `SKILL.md` edits limited to the AKILI section (only file allowed to differ from upstream, `docs/skills/security-audit.md:42`).

**Split — D-1…D-4 run as an audit, not a spec.** They are coverage-ledger units deferred by the quick profile (`execution.md:509-512`), with no finding yet; a spec would have no requirement to state. Recommended run, from macOS/Linux, after this spec ships:

```text
/akili-security bin/akili.js bin/persona.js .claude/skills --profile standard
```

Any `confirmed` record it yields reaches a Bug proposal through the command's own routing gate. Passing the prior run directory keeps it additive (Step 2).

## Non-Goals

- No patch to any vendored file (fidelity with the pin).
- No AKILI validator shim or wrapper for Windows (option b — rejected below).
- No model-routing row: the template-evolution bug (`bin/routing.js:431-436`) is unfixed, so `docs/model-routing.md` and `.claude/templates/model-routing.section.md` stay untouched.
- No installer change (no `--skill <name>` flag).
- No re-sync to a new upstream pin; no filing of the upstream issue by the agent (outward-facing — the user files it).
- Not the D-1…D-4 audit run itself.

## Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| `/akili-security` users | Stricter preflight (pin, no pre-gate `git`), narrower reinstall, fuller sandbox list, new slug shape |
| Bug specs routed from earlier runs | Old `bugfix/security-<date>-s<n>` paths remain valid; only new routings use `-r<N>-` |
| `test/akili-security-command.test.js` | Its pinned sentences change (Step 0, Step 1, Step 5); the ≤ 230-line bound (`:396`) still holds (174 lines today) |
| Maintainers re-syncing upstream | One more pin site; one Windows gate step |

## Visual Reference

- Source: None
- Location: —
- Notes: rules-text and docs change; no UI surface.

## Requirement Delta Preview

### ADDED Requirements

- Step 0.1 compares the loaded `source` with a stated literal pin; a mismatch on the commit is a foreign-copy case.
- The plan and index record which skill copy ran.
- The addendum names the sandbox mechanism under `sandboxed-approved`.
- A test locks the three pin sites to one value.
- Re-sync procedure: the command's pin; a Windows CI gate before lifting the preflight stop.

### MODIFIED Requirements

- FR-2 (provenance) — pin stated; reinstall offer narrowed to one skill directory.
- FR-4 (execution gate) — control list conforms to upstream.
- FR-10 (routing) — slug gains `-r<N>`.
- Preflight resolution (Step 0.3) and the in-target run-directory rule — no `git` executed in the target before **Run**.

### REMOVED Requirements

- The `akili install --force` offer in Step 0.1.

## Approach Options

### Windows (item 3)

| Option | What | Keeps no-follow guarantee? | Cost / risk |
|---|---|---|---|
| **(a) Keep unsupported, WSL documented** | Status quo | Yes (fails closed) | Zero; Windows users need WSL |
| (b) AKILI wrapper on Windows | Read the file with `lstat` → open → `fstat` → `lstat`, compare identity, then call the exported `validateDocument` | **No — detection, not prevention.** Upstream rejects exactly this: "no race-safe fallback" (`validate-coverage-ledger.cjs:724`). Windows reparse points and junctions widen the surface | `validate-findings.cjs` does not export its reader, its JSON-text limits or its schema loader (exports `:759-771`), so the wrapper re-implements the `run()` glue (`:703-757`) — a fork every re-sync must re-diff, plus a security claim of its own that needs review |
| **(c) Ask upstream** | Request a Windows-capable read path; re-sync at the new pin | Upstream's call | Unknown timing; no AKILI-owned security code |

**Recommend (a) + (c)**, with the re-sync gate. (b) would deliver Windows support by weakening the very guarantee the brief says must be kept.

### A-8 (`git` in the target)

| Option | Mechanism | Residual |
|---|---|---|
| A | `git -c core.fsmonitor=false status` | Clean/smudge filters and other config-launched programs remain; key denylist is open-ended |
| **B** | **No `git` before Run; ref read from files; dirty `not determined` unless the user states it** | Plan shows less; nothing target-controlled runs |
| C | Inspect `.git/config` as data, refuse if risky keys | Same open-ended denylist as A |

**Recommend B** — it is the only option that matches the command's own "execute nothing the target controls".

### Overall delivery

| Option | Shape |
|---|---|
| **1. One spec for W-2 + A-4…A-8 + Windows gate; D-items as a run** | Smallest safe path |
| 2. Two specs (W-2 alone as `/akili-quick`, advisories as a spec) | W-2 changes a gate's behavior and a test → fails the quick gate |
| 3. Fold D-1…D-4 in as tasks | Violates *Scope only grows through approval* in spirit: an audit unit is not a requirement |

## Recommended Approach

Option 1, Windows (a)+(c), A-8 option B, A-7 rules text. `/akili-specify` at Lite depth is likely enough (one command, no code), but A-8's mechanism and A-5's term-by-term mapping need a Premise Ledger.

## Risks, Dependencies, And Open Questions

| # | Item |
|---|---|
| R-1 | **Restatement drift** (KZ-changes--kaizen-loop-closure-2): the slug and gate wording are restated in at least seven files (`README.md`, `docs/flow.md`, `docs/commands/README.md`, `docs/commands/akili-security.md`, `docs/skills/security-audit.md`, `SKILL.md`, the command test). Sweep by obligation, not by string |
| R-2 | **Summary overclaim** (KZ-002): the CHANGELOG must quote the shipped text; e.g. do not claim "no `git` runs in the target" if the run-directory check still does |
| R-3 | **Falsifiers executed, not predicted** (KZ-changes--leader-brief-contract-2): the pin-sync test must be shown red by mutating one pin site |
| R-4 | **Enumeration-wide** (KZ-changes--model-routing-configurator-1): A-8's "no `git` before Run" must be checked over every `git` site in the command — two today (`:40`, `:59`) |
| R-5 | A-7's move-aside path depends on skip-existing install restoring a missing skill directory — `UNVERIFIED — confirm at source before relying on it` (specify, Premise Ledger, `bin/akili.js` `copyDirectoryContents` `:638`) |
| Q-1 | **Resolved at approval:** drop in-target run directories; `--out` must resolve outside the target. (Rejected: `check-ignore` after Run still executes `git` in the target; parsing `.gitignore` as data is incomplete) |
| Q-2 | A-4 slug: `-r<N>-s<n>` vs a time suffix. Recommended `-r<N>` (deterministic, already in the run path) |
| Q-3 | Should the upstream request draft live in the spec folder, or is a CHANGELOG/docs note enough? |
| Dep | Release: patch (rules tightening, no new command) per semver discipline; classify again at release |

## Success Criteria

- Mutating any one of the three pin sites turns the pin-sync test red; restoring it turns it green.
- `grep` over the command shows no `git` invocation reachable before **Run**.
- The execution-gate list maps term for term to `SKILL.md:43-44` and `RECONNAISSANCE.md:53`.
- Every restatement of the routing slug carries `-r<N>`.
- Step 0.1 no longer offers `--force`.
- Windows preflight stop and both Windows test branches unchanged; re-sync procedure names the Windows gate.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` green.

## Next Step

```text
/akili-specify changes/akili-security-followup
```

Separately, after this spec ships (macOS/Linux):

```text
/akili-security bin/akili.js bin/persona.js .claude/skills --profile standard
```
