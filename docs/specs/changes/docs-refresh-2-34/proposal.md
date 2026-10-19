# Proposal — Public docs refresh for 2.34.1 (security, video, diagrams, lifecycle figure)

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-refresh-2-34` |
| Slug | `docs-refresh-2-34` — derived from the argument's first token `docs-refresh-2.34` (the `.` replaced to keep the slug kebab-case) |
| Type | **Change** — documentation and one image asset; no command, skill, installer or test-contract behavior changes |
| Deliverable | software — the deliverable kind is **documentation plus a raster/vector figure** (neither software nor video; Video Mode does not apply) |
| Approval Mode | **pre-approved (Juan Carlos Cadavid, 2026-10-19)** — mandate, verbatim: "Sigue el ciclo AKILI completo hasta archivar y detente en decisiones reales de producto". Routine gates auto-pass and are logged; HALT, Pivot, product decisions and anything irreversible still stop |
| Out-of-bounds actions | No push, no release, no tag, no `npm publish` (user rule, verbatim: "solo commits locales, sin push, release, tag ni publish") |
| Date | 2026-10-19 |
| Author | AKILI session (proposer) |
| Status | **Approved** — 2026-10-19 (Juan Carlos Cadavid): decision #1 answered **"Instalar Archify"**; #2 and #3 as recommended |
| Depends on | none |
| Parallel-safe | yes — touches only `README.md`, `docs/**/*.md` (outside `docs/specs/`), `assets/akili-flow.{svg,png}` and `CHANGELOG.md` |

## Answer first

| # | Question | Recommendation | Why |
|---|---|---|---|
| 1 | How to regenerate `assets/akili-flow.svg`/`.png`? | **Decided by the user: install Archify and generate the figure with it.** Author an Archify `workflow` candidate for the lifecycle, run `finalize`, export SVG from the delivered view, and rasterize the PNG at 1800×1200 with `rsvg-convert` | Archify was absent before (`~/.claude/skills`, `~/.agents/skills`, run 2026-10-19). `npx skills add tt-a1i/archify` (v3.2, MIT, tt-a1i) installed it **project-scoped into the session scratchpad** (`<scratchpad>/.agents/skills/archify`), not into the repo or the global config. The Archify HTML is a working file only: the repo ships the SVG and PNG, never Archify output HTML or Archify files |
| 2 | Name HyperFrames and Archify as AKILI skills? | **No — present them as optional external tools reached through the packaged bridges `video-production` and `diagram-design`** | Neither is packaged: `ls .claude/skills` lists 27 directories, none `hyperframes*` or `archify`. Calling them AKILI skills would contradict `docs/skills/governance.md` (referenced, never vendored) |
| 3 | Release? | **None.** CHANGELOG gets an `Unreleased` note only | User rule; the npm page shows the new README only after a future publish (stated in the report, not hidden) |

## Intent

Make the public face of the package — the GitHub/npm `README.md`, the docs hub, the flow page, the command and skill indexes, and the lifecycle figure — describe what 2.34.1 actually ships: `/akili-security`, the video deliverable track, and diagram slots.

## Problem / Current Behavior

| Surface | Today | Evidence (as run 2026-10-19) |
|---|---|---|
| Lifecycle figure | Shows 4 out-of-loop commands (`/akili-resume`, `/akili-audit`, `/akili-quick`, `/akili-seo`); no `/akili-security`, no video, no diagrams; `<desc>` says "Four commands run outside the loop" | `grep -o '<text…' assets/akili-flow.svg` |
| README alt text (`README.md:46`) | Mentions only constitution, the six-step loop and Kaizen | `sed -n 46p README.md` |
| README *Contents* list | 11 of 12 commands (missing `akili-quick.md`), 24 of 27 skills (missing `diagram-design`, `security-audit`, `tdd`) | membership loop over `ls .claude/commands`, `ls .claude/skills` vs `README.md:72-118` |
| README narrative | Video and Archify appear only inside the Prerequisites table (`:153-154`) and two paragraphs under *Dependencies* (`:834-836`); no section says "you can produce a video" or "diagrams are generated" | `grep -n -i "video\|archify\|diagram" README.md` |
| README badges | "Windows supported" with no caveat, while `/akili-security` stops on native Windows | `README.md:24`, `README.md:800` |
| `docs/README.md` (hub) | No mention of `/akili-quick`, `/akili-security`, video or diagrams; names no skill | membership loop |
| `docs/flow.md` | *Primary Lifecycle* block lists only `/akili-audit` under *Independent Auditing*; `/akili-security` is only in §2b; diagrams are not mentioned anywhere (`diagram-design` absent) | `sed -n 40,86p docs/flow.md`; membership loop |
| `docs/commands/` | Video Mode is documented on propose/specify/test/validate; **no command page mentions `diagram-design`**, although it is wired into constitution Steps 3–5, specify Step 2.1 and archive Step 2 | `grep -n -i diagram docs/commands/*.md` → 0 hits |
| `docs/skills/README.md` | 27 rows (complete); `tdd` row sits out of alphabetical order between `react-doctor` and `security-audit` | `grep -c '^| \[`' docs/skills/README.md` → 27 |
| Install counts | `akili doctor --tool claude` → `ok 47` = 12 commands + 27 skills + 8 resources; `docs/cli.md` already says 12 / 27 | doctor output, `docs/cli.md:185-219` |

## Proposed Outcome

A reader of the README or docs hub learns, in the first screen of each, that AKILI (a) audits repository security with `/akili-security`, (b) can drive a spec whose deliverable is a rendered **video** (through `video-production` + user-installed HyperFrames), and (c) fills **diagram slots** in baseline and design docs as Mermaid, with an optional Archify interactive view — and sees all of it in the regenerated lifecycle figure. Every inventory and count matches what `akili doctor` installs: 12 commands, 27 skills.

## Scope

1. **Lifecycle figure** — regenerate `assets/akili-flow.svg` and `assets/akili-flow.png` (same 900×600 viewBox, 1800×1200 PNG, same palette/typography): add `/akili-security` to the out-of-loop band (five commands), mark where it hands off (confirmed finding → `/akili-propose bugfix/…`, Bug Track), and show the two capability tracks — `Deliverable: video` (specify Video Mode → test render evidence → validate final look) and diagram slots (constitution / specify / archive). Update `<title>`/`<desc>`.
2. **README.md** — new alt text at `:46`; *Contents* completed to 12 commands / 27 skills; a short new section near *Start Here* ("What AKILI covers beyond code" or similar) with three rows — security audits, video deliverables, diagrams — each linking to its command/skill page; Windows badge caveat for `/akili-security`; `/akili-security` placed in the *Start Here* lifecycle narrative as an anytime command that feeds the Bug Track.
3. **docs/README.md** — Quick Flow block gains the anytime commands incl. `/akili-quick` and `/akili-security`; one-line pointers for video and diagrams.
4. **docs/flow.md** — *Primary Lifecycle* block gains `/akili-security` beside `/akili-audit`; a short section for the video track and one for diagram slots (where each fires in the lifecycle), linking to the existing skill pages.
5. **docs/commands/** — one line each on `akili-constitution.md`, `akili-specify.md`, `akili-archive.md` naming the `diagram-design` wiring; `docs/commands/README.md` only if a gap is found at specify time.
6. **docs/skills/README.md** — move the `tdd` row into alphabetical order; no content change unless specify finds a stale cell.
7. **Counts** — every count claim on these surfaces grepped against `ls .claude/commands` / `ls .claude/skills` and the doctor total (KZ-002).
8. **CHANGELOG.md** — one `Unreleased` → *Changed* note (docs-only, classified patch at a future release).

## Non-Goals

- No change to any command prompt, skill, template, `bin/`, `package.json` or test.
- No Archify file or HTML view enters the repo; no new runtime dependency (`rsvg-convert` is already present at `/opt/homebrew/bin`).
- No rewrite of README sections unrelated to the three capabilities (install, release, routing, harness).
- No release, version bump, tag, push or publish.
- No change to the vendored `security-audit` files or to `docs/model-routing.md` (the `/akili-security` routing row stays deferred behind the template-evolution bug).

## Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Readers on GitHub (immediately on merge to `master`) and npm (after the next publish) | New README content and figure; the README `<img>` points at `raw.githubusercontent.com/…/master/assets/akili-flow.png`, so the figure updates only once the PNG reaches `master` |
| `test/akili-security-docs.test.js`, `test/diagram-design.test.js`, `test/tasks-gate.test.js` | Pin strings in `README.md` / `docs/flow.md`; edits must keep `npm test` green |
| Source specs (archived) | `2026-10-18-changes--akili-security`, `2026-10-19-changes--akili-security-followup`, `2026-10-18-changes--video-deliverable-track`, `2026-10-18-changes--archify-diagrams` — read for facts, never linked from shipped docs (KZ-changes--archify-diagrams-1) |

## Visual Reference

- Source: Existing figure `assets/akili-flow.svg` (style source) — no Figma.
- Location: `assets/akili-flow.svg`, `assets/akili-flow.png`.
- Notes: the new figure keeps the existing visual language; a draft render is reviewed before the PNG is committed.

## Requirement Delta Preview

### ADDED Requirements

- README and docs hub state the three capabilities (security audit, video deliverable, diagram slots) with links to their pages.
- The lifecycle figure shows `/akili-security` and both capability tracks.
- Command pages for constitution, specify and archive name the `diagram-design` load point.

### MODIFIED Requirements

- README alt text, *Contents* inventory, Windows caveat, `docs/flow.md` *Primary Lifecycle* block, `docs/README.md` Quick Flow.

### REMOVED Requirements

- None.

## Approach Options

| Option | What | Trade-off |
|---|---|---|
| **A. Targeted refresh + hand-authored figure** (recommended) | Edit the named sections; add one compact capabilities section; redraw the SVG in its current style; PNG via `rsvg-convert` | Smallest diff that closes every gap; keeps the pinned strings stable; no new tool |
| B. Full README restructure | Reorder the 935-line README around capabilities | Larger review surface, breaks pinned strings, out of proportion to the gaps found |
| C. Install Archify and generate the figure from it (**chosen for the figure**) | `npx skills add tt-a1i/archify`, export an HTML view, rasterize | Network install the docs reserve for the user; Archify outputs interactive HTML views of a slot, not a branded README raster — extra conversion step for no visual gain |

## Recommended Approach

**Option A for the docs, with Option C for the figure (user decision, 2026-10-19).** The figure is authored as an Archify `workflow` candidate and exported; if Archify's export cannot produce a standalone SVG that `rsvg-convert` renders faithfully, that is reported and the fallback is the hand-authored SVG of Option A, recorded in `execution.md`.

Option A fixes the four requested items and the inventory gaps found above with edits confined to docs and one asset, keeps the figure consistent with the brand it already has, and needs no network tool.

## Risks, Dependencies, And Open Questions

| # | Item | Mitigation |
|---|---|---|
| R-1 | A shipped doc restates a rule (security slug, run directory, Windows stop) slightly differently and contradicts the command | Restate nothing new: link to the command/skill page and reuse existing sentences; `test/akili-security-docs.test.js` pins the key ones (**KZ-changes--gate-falsifiability-2**) |
| R-2 | A count or "every"/"all" claim is wrong | Grep-falsify each aggregate claim before writing it (**KZ-002**) |
| R-3 | A shipped doc links into `docs/specs/changes/…`, which archive moves | Link only to `docs/commands/`, `docs/skills/` (**KZ-changes--archify-diagrams-1**) |
| R-4 | The figure is legible at 900 px but crowded with two added tracks | Draft render reviewed before commit; tracks drawn as one compact band, not new loop nodes |
| R-5 | npm shows the old README until the next publish | Stated in the CHANGELOG note and the final report |
| Q-1 | Wording of the README capabilities section heading | Decided at specify (copy, not product) |

## Success Criteria

- `README.md`, `docs/README.md`, `docs/flow.md` each name `/akili-security`, video deliverables and diagram slots, linking to their pages.
- README *Contents* lists exactly the 12 files of `.claude/commands/` and the 27 directories of `.claude/skills/`.
- The regenerated SVG/PNG show `/akili-security` and both tracks; PNG is 1800×1200; alt text, `<title>` and `<desc>` match the figure.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` pass.
- Commits are local only, prefixed `[SPEC:changes/docs-refresh-2-34]`.

## Next Step

```text
/akili-specify changes/docs-refresh-2-34
```

Lite depth (docs-only change).
