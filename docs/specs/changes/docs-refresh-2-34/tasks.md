# Tasks: public docs refresh for 2.34.1

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-refresh-2-34` |
| Depth | Standard |
| Status | **Approved** — Phase 3 gate: `auto-approved (pre-approved mode)`, 2026-10-19 |
| Budget (design §12) | **4 tasks · ~180 LOC Markdown · 2 review rounds per task**; assets counted as files under NFR-4 caps. Stop and escalate past 5 tasks, ~260 LOC, or 3 rounds on a task |
| Commit prefix | `[SPEC:changes/docs-refresh-2-34]`. Local commits only: no push, tag, release or `npm publish` |
| Baselines (as run 2026-10-19 at `729d39f`) | `npm test` → 413 pass / 0 fail · `ls .claude/commands \| wc -l` → 12 · `ls .claude/skills \| wc -l` → 27 · `assets/akili-flow.svg` 6,449 B · `assets/akili-flow.png` 187,727 B, 1800×1200 |

**Membership check (MC)** used by T2–T4 — run from the repo root; prints the missing names per surface, empty output = pass:

`for s in $(ls .claude/skills); do grep -q "\`$s\`" <file-range> || echo "missing skill $s"; done; for c in $(ls .claude/commands); do grep -q "$c" <file-range> || echo "missing $c"; done`

## 2. Task Graph

```
T1 (figure) ──► T2 (README) ──► T3 (docs hub + flow) ──► T4 (command pages, skills index, CHANGELOG)
```

T2 and T3 depend on T1 because both alt texts describe the finished figure. T4 depends on T3 only for the CHANGELOG note's file list.

## 3. Tasks

### T1 — Lifecycle figure with Archify

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (2 binary assets; ~0 LOC Markdown) |
| Depends on | none |
| Requirements | FR-1 (statement; scenario THEN every command by name; AND labels video + diagram; AND IT MUST 1800 px wide + font-size floor + no clip/overlap; BUT no unpackaged command/skill, HyperFrames/Archify not presented as packaged; archive/specify conditions; stop-and-ask if Archify fails) · FR-2 (SVG part: standalone rules, `role="img"`, `<title>`, `<desc>`) · NFR-2 (no Archify file in repo) · NFR-4 |
| Design refs | §3 *Figure content* and export path, DD-4, DD-5, P-5, P-7 |
| Consumers | `README.md:46` (PNG by raw URL), `docs/flow.md:7` (SVG) — their alt text changes in T2/T3 |
| Review | `full`: the figure's content defects are only visible to a reviewer looking at the image |
| Skills | `diagram-design` (Archify relation), `playwright-cli` |

**Scope.**

1. **Settle P-5 first.** In the scratchpad, `finalize` a minimal candidate, open it with `playwright-cli`, trigger `svg-light` and the PNG export with the theme forced light, and capture both downloads. If either cannot be captured: **stop and ask the user** (DD-4) — do not hand-author.
2. Author `candidate.json` (`workflow`, `quality_profile: showcase`) with the five lanes of design §3; run `finalize workflow … --quality showcase --json` until it exits 0 (repair limit per Archify).
3. Export `svg-light` and the light PNG; normalize the PNG to 1800 px wide with `magick` if needed.
4. Post-process the SVG: set `<title>AKILI-SPECS methodology lifecycle</title>` and replace the export's generic `<desc>` with the FR-2 alt text (`role="img"` is already present — corrected at T1).
5. Replace `assets/akili-flow.svg` and `assets/akili-flow.png`; nothing else from Archify enters the repo.
6. Visual review (tier-T6 substitute): view the PNG; record in `execution.md` each FR-1 element found, and any clipping or overlap.

**Verification.**

- Labels: `grep -o` of every `.claude/commands` name in the SVG text → 12 of 12; `grep -i -c "video"` ≥ 1; `grep -i -c "diagram"` ≥ 1; `grep -i -c "hyperframes\|archify"` hits only inside an "install"/"optional" note.
- Standalone: `grep -c "<script"` → 0; `grep -o -E '(href|src)="https?://|url\(https?:' ` → 0; `grep -c "@import"` → 0 (`xmlns` and comments exempt, FR-2).
- Font floor *(amended at T1, user decision)*: smallest `font-size` × 900 / viewBox width ≥ 5.5, and node labels ≥ 8.
- `magick identify assets/akili-flow.png` → width 1800; `stat -f %z` → PNG ≤ 409,600, SVG ≤ 153,600.
- `git status --porcelain` shows only the two assets changed.

| Verification field | Value |
|---|---|
| Falsifier | Delete the `/akili-security` node from the candidate → the 12-of-12 label grep reports 11; export the default dual-theme SVG → `prefers-color-scheme` grep hits (expected 0 for `svg-light`) |
| Red run | Against the current asset: `grep -c "akili-security" assets/akili-flow.svg` → 0 (executed at `729d39f`) |
| Disqualifier | A label grep that matches inside the embedded font data or a `<desc>` only, not a drawn `<text>` node, is not evidence — grep the `<text>`/`<tspan>` content |
| Consumers | `README.md:46`, `docs/flow.md:7` |

**Done.** Both assets replaced; all checks pass; visual review recorded; P-5 outcome recorded.

### T2 — README.md

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~90 LOC) |
| Depends on | T1 |
| Requirements | FR-2 (README site; same text as flow; no claim the figure lacks) · FR-3 (section before *Install*; three rows with lifecycle point, install need, link; native-Windows statement; BUT no new `/akili-security` rule wording; *Start Here* anytime line → Bug Track) · FR-4 (*Contents* sets equal; any new count with MC) · FR-5 (caveat in header; BUT keep the Windows badge) |
| Design refs | §3 rows for README, DD-1, DD-2, DD-3, P-2, P-8, P-9 |
| Consumers | `test/akili-security-docs.test.js` (securityLines on README), `test/diagram-design.test.js:409-412` (Archify paragraph) |
| Review | `full`: public face of the package and inside the security restatement tests |
| Skills | `cognitive-doc-design` |

**Scope.** Wrap the `:46` `<img>` in a link to the full-size PNG (FR-1 as amended at T1). Alt text at `:46` (FR-2 content: constitution, loop, Kaizen, five anytime commands with `/akili-security` and its hand-off to the Bug Track, video track, diagram slots). One caveat line under the OS badges: `/akili-security` is not supported on native Windows (WSL, Linux or macOS). New section `## What AKILI Covers` between *Docs* and *Repository Structure*: a 3-row table (Capability · Where it fires · You install · Read more) for security audits (`docs/commands/akili-security.md`), video deliverables (`docs/skills/video-production.md`, HyperFrames), diagrams (`docs/skills/diagram-design.md`, Archify optional). *Contents*: `akili-quick.md` after `akili-propose.md`; `diagram-design`, `security-audit`, `tdd` in alphabetical position. *Start Here*: one paragraph naming the five anytime commands and `/akili-security`'s confirmed findings entering the Bug Track via `/akili-propose`. No `run directory`, slug, git command or control wording on any new line (P-9).

**Verification.**

- MC over `sed -n '/^## Contents/,/^## Install/p' README.md` → empty; command and skill bullet counts in that range → 12 and 27.
- `node --test test/akili-security-docs.test.js test/diagram-design.test.js` → 0 fail.
- Link check: every `](docs/…)` target in `git diff -U0 README.md` exists (`test -f`).
- `grep -n "docs/specs/changes" README.md` → 0 new hits.
- Header: Windows badge still present (`grep -c "Windows-supported" README.md` → 1).

| Verification field | Value |
|---|---|
| Falsifier | Remove `tdd` from *Contents* → MC prints `missing skill tdd`; write "run directory in the target" on the caveat line → `akili-security-docs` FR-7 test red |
| Red run | MC on the current README `72-118` → prints `diagram-design`, `security-audit`, `tdd`, `akili-quick.md` (executed at `729d39f`) |
| Disqualifier | MC matching a name elsewhere in the range (e.g. inside a sentence) does not prove a bullet — also count `^  - \`` bullets |
| Consumers | as above |

**Done.** MC empty, counts 12/27, both test files green, links resolve.

### T3 — docs/README.md and docs/flow.md

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S–M (~60 LOC) |
| Depends on | T2 (alt text reused verbatim) |
| Requirements | FR-2 (flow site, identical to README's) · FR-6 (hub: `/akili-quick`, `/akili-security`, video and diagram pointers; flow: `/akili-security` in *Primary Lifecycle*, video section, diagram section with conditions; AND IT MUST link only to `docs/commands/`/`docs/skills/`) |
| Design refs | §3 rows for hub and flow, DD-1, DD-7, P-7, P-9 |
| Consumers | `test/akili-security-docs.test.js` (securityLines on flow) |
| Review | `checklist`: prose additions, covered by the restatement tests |
| Skills | `cognitive-doc-design` |

**Scope.** `docs/flow.md:7` alt text = README's. *Primary Lifecycle* block: under *Independent Auditing* add the `/akili-security` pair (plan gate, redacted index under `docs/specs/audits/`, confirmed finding → `/akili-propose`), using only phrasing already pinned. New `### 10. Video Deliverables` and `### 11. Diagram Slots` after §9, each ≤ 8 lines, each naming where it fires and linking its skill page. `docs/README.md`: after Quick Flow, anytime lines for `/akili-quick` and `/akili-security` (keep the existing `/akili-resume`, `/akili-audit`, `/akili-seo` lines), plus two pointer lines for video and diagrams.

**Verification.**

- `node --test test/akili-security-docs.test.js` → 0 fail.
- Command check over `docs/README.md` (it names commands as `/akili-<name>`, not files): `for c in $(ls .claude/commands | sed 's/\.md$//'); do grep -q "/$c\b" docs/README.md || echo "missing /$c"; done` → empty.
- `grep -c "diagram-design" docs/flow.md` ≥ 1; `grep -n "docs/specs/changes" docs/flow.md docs/README.md` → 0.
- Alt-text identity: the alt string extracted from `README.md:46` equals the one at `docs/flow.md:7` (`diff`).
- Link check on the diff as in T2.

| Verification field | Value |
|---|---|
| Falsifier | Change one word of the flow alt text → `diff` non-empty; drop `/akili-quick` from the hub → the command check prints `missing /akili-quick` |
| Red run | Command check on current `docs/README.md` → `missing /akili-quick`, `missing /akili-security` (executed at `03b7cb0`) |
| Disqualifier | A green restatement test proves only the pinned phrases; it says nothing about the new sections' accuracy — the Reviewer compares them against `.claude/commands/akili-{specify,test,validate,archive,constitution}.md` |
| Consumers | as above |

**Done.** Tests green, MC empty, alt texts identical.

### T4 — Command pages, skills index order, CHANGELOG

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~25 LOC) |
| Depends on | T3 |
| Requirements | FR-7 (three anchors; specify *Key Rules* scenario; BUT not mandatory, Archify not required) · FR-8 (alphabetical index; CHANGELOG `### Changed` replaces the placeholder; npm/raw-URL wording) · NFR-1 · NFR-2 · NFR-3 |
| Design refs | §3 rows for command pages, skills index, CHANGELOG; P-8, P-10, P-11 |
| Consumers | `test/diagram-design.test.js:400-407` (skills-index row cells), `scripts/release.js:75-91` |
| Review | `checklist` |
| Skills | `cognitive-doc-design` |

**Scope.** `docs/commands/akili-constitution.md` *Skill Map Scaffolding* list: add `diagram-design` (Steps 3–5 diagram slots). `docs/commands/akili-specify.md` *Key Rules*: one rule — architecturally significant designs load `diagram-design` at Step 2.1 to fill the slots the change alters; Archify view optional. `docs/commands/akili-archive.md` *Archive Summary*: item for diagrams — loads `diagram-design` only when the spec has a `diagrams/` folder or slot. `docs/skills/README.md`: move the `tdd` row below `tailwind-design-system`. `CHANGELOG.md` `[Unreleased]`: replace `### Notes` + placeholder with `### Changed` and one bullet (bold lead-in, `changes/docs-refresh-2-34`, surfaces, README-on-npm at publish vs figure-on-`master`).

**Verification.**

- Full suite: `npm test` → 413 pass, 0 fail; `npm run verify:cli`; `npm run pack:dry-run` lists `assets/akili-flow.svg` and `assets/akili-flow.png`; `git diff --check`.
- Order: the skill names in `docs/skills/README.md` inventory rows, extracted in order, equal their `sort`.
- `grep -c "No unreleased changes yet." CHANGELOG.md` → 0 inside `[Unreleased]` (`sed -n '/^## \[Unreleased\]/,/^## \[2/p'`).
- NFR-2: `git diff --stat 729d39f -- .claude bin test package.json docs/model-routing.md` → empty.

| Verification field | Value |
|---|---|
| Falsifier | Leave `tdd` in place → the sorted-vs-actual comparison differs; leave the placeholder → the `[Unreleased]` grep → 1 |
| Red run | Order check on current index → differs at `tdd` (executed at `729d39f`) |
| Disqualifier | `npm test` green proves no pinned phrase broke, not that the command-page lines are accurate — the Reviewer checks each against `.claude/commands/*.md` lines (constitution `:163,208,245`, specify `:232`, archive `:124`) |
| Consumers | as above |

**Done.** All checks pass; NFR-2 diff empty.

## 4. Coverage

| Clause | Task |
|---|---|
| FR-1 statement, scenario, AND, AND IT MUST, BUT, stop-and-ask | T1 |
| FR-2 README site · flow site · SVG title/desc/standalone · BUT · AND IT MUST same text | T2 · T3 · T1 · T2/T3 · T3 (diff) |
| FR-3 section, rows, links, Windows, BUT wording, *Start Here* | T2 |
| FR-4 sets equal, count rule | T2 (MC + counts) |
| FR-5 caveat, BUT badge kept | T2 |
| FR-6 hub, flow lifecycle, video §, diagram § with conditions, AND IT MUST links | T3 |
| FR-7 three anchors, scenario, BUT | T4 |
| FR-8 index order, CHANGELOG shape and wording | T4 |
| NFR-1 · NFR-2 · NFR-3 · NFR-4 | T4 · T1 (assets) + T4 (diff) · every task · T1 |

No task is `skip-eligible`.
