# AKILI Drift Audit Report

- **Date of Audit:** 2026-07-19
- **Code Graph Used:** Yes (`.codegraph/` exists; config reviewed)
- **Overall Conformance Score:** 82%

## Executive Summary

This repository (`sdd-jc-methodology`) packages the AKILI-SPECS methodology itself — it is not a project that *uses* AKILI. Therefore, the standard project-level specs (`docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, `docs/specs/`) do not exist and are not expected.

The audit was adapted to evaluate **internal consistency**: whether the README, AGENTS.md, CLAUDE.md, docs hub, CHANGELOG, and `package.json` accurately describe the actual commands, skills, templates, scripts, and structure present in the repository.

**Key findings:** one fully-implemented command (`/akili-audit`) is missing from all major documentation indexes, one skill (`judgment-day`) is absent from the skills inventory, and a plan document retains a pre-rebranding filename.

## Identified Discrepancies

### :red_circle: High Priority (Breaking/Critical)

- **`/akili-audit` command exists but is undocumented in main references:**
  The command file `.claude/commands/akili-audit.md` has existed since v0.4.0 and is referenced by `AGENTS.md`, `docs/flow.md`, `docs/model-routing.md`, and the CHANGELOG. However, it is completely absent from every user-facing index:
  - **Affected Spec File (README):** [README.md](file:///Users/jcadavid/Desktop/DEV/Desarrollos/sdd-jc-methodology/README.md)
    - Missing from "Contents" section (line ~67-108, command list)
    - Missing from "Command Map" table (line ~497-506)
    - Missing from "Start Here" flow (line ~469-479)
    - Missing from "Auxiliary commands" section (line ~677-684)
  - **Affected Spec File (docs/commands/README.md):** [docs/commands/README.md](file:///Users/jcadavid/Desktop/DEV/Desarrollos/sdd-jc-methodology/docs/commands/README.md)
    - Missing from "Command Map" table (line 7-16)
    - Missing from "Source Files" table (line 34-43)
    - Missing from "Normal Sequence" flow (line 20-28)
  - **Affected Spec File (docs/README.md):** [docs/README.md](file:///Users/jcadavid/Desktop/DEV/Desarrollos/sdd-jc-methodology/docs/README.md)
    - Missing from "Quick Flow" section (line 19-27)
  - **Missing doc page:** `docs/commands/akili-audit.md` does not exist (every other command has one)
  - **Remediation:** Add `/akili-audit` to all four indexes above and create `docs/commands/akili-audit.md` following the same format as the other command reference pages.

### :yellow_circle: Medium Priority (Inconsistencies/Gaps)

- **`judgment-day` skill exists but is missing from skills inventory:**
  The skill `.claude/skills/judgment-day/SKILL.md` has existed since v0.9.0 and is referenced by `/akili-specify` and the README's "Methodology Contract" section. However:
  - **Affected Spec File (README):** [README.md](file:///Users/jcadavid/Desktop/DEV/Desarrollos/sdd-jc-methodology/README.md)
    - Missing from "Contents" skills list (line ~76-99)
  - **Affected Spec File (AGENTS.md):** [AGENTS.md](file:///Users/jcadavid/Desktop/DEV/Desarrollos/sdd-jc-methodology/AGENTS.md)
    - Not listed in "Skill Usage" section
  - **Affected Spec File (CLAUDE.md):** [CLAUDE.md](file:///Users/jcadavid/Desktop/DEV/Desarrollos/sdd-jc-methodology/CLAUDE.md)
    - Not listed in "Skill Usage" section
  - **Missing doc page:** `docs/skills/judgment-day.md` does not exist
  - **Remediation:** Add `judgment-day` to the README skills list, AGENTS.md skill usage, CLAUDE.md skill usage, and create `docs/skills/judgment-day.md`.

- **Plan document filename retains pre-rebranding "sdd" name:**
  - **Affected Code File:** [docs/plans/2026-05-26-multi-agent-sdd-orchestration-design.md](file:///Users/jcadavid/Desktop/DEV/Desarrollos/sdd-jc-methodology/docs/plans/2026-05-26-multi-agent-sdd-orchestration-design.md)
  - **Affected Spec File (CHANGELOG):** [CHANGELOG.md](file:///Users/jcadavid/Desktop/DEV/Desarrollos/sdd-jc-methodology/CHANGELOG.md) line 158 references `docs/plans/2026-05-26-multi-agent-akili-orchestration-design.md`
  - The v2.0.0 rebranding changed all `/sdd-*` references to `/akili-*`, but this file was not renamed.
  - **Remediation:** Rename to `2026-05-26-multi-agent-akili-orchestration-design.md` or update the CHANGELOG entry to match the actual filename.

### :green_circle: Low Priority (Style/Cleanups)

- **`.antigravitycli/` directory contains an undocumented UUID-named JSON file:**
  - **Affected Code File:** [.antigravitycli/a20c06f4-5c78-46f1-9ae8-f79bd4313512.json](file:///Users/jcadavid/Desktop/DEV/Desarrollos/sdd-jc-methodology/.antigravitycli/a20c06f4-5c78-46f1-9ae8-f79bd4313512.json)
  - Not referenced in README, AGENTS.md, CLAUDE.md, or `.gitignore`.
  - Likely a local artifact from Google Antigravity IDE that should not be committed.
  - **Remediation:** Add `.antigravitycli/` to `.gitignore` or document its purpose. Remove the UUID file if it is a local artifact.

- **CodeGraph config is over-provisioned for this repository:**
  - **Affected Code File:** [.codegraph/config.json](file:///Users/jcadavid/Desktop/DEV/Desarrollos/sdd-jc-methodology/.codegraph/config.json)
  - The `include` array lists 20+ language extensions (TypeScript, Go, Rust, Java, C#, Swift, Kotlin, Dart, etc.) but the repository only contains JavaScript (`bin/akili.js`, `scripts/*.js`) and Python (`scripts/gsc_verify.py`).
  - Not an error, but unnecessarily broad for the repo's actual content.
  - **Remediation:** Narrow `include` to `**/*.js`, `**/*.py`, and `**/*.md` for faster indexing.

- **`package.json` `files` field omits release scripts:**
  - `scripts/release.js` and `scripts/release-status.js` are not in the `files` array.
  - This is **correct behavior** (they are development-only tools, not needed by end users), but worth noting for completeness.
  - **Remediation:** No action needed.

## Conformance Matrix

| Spec Section | Code Reality Status | Alignment Status | Notes |
| :--- | :--- | :--- | :--- |
| Commands (`.claude/commands/`) | 9 commands exist | Drifted | `/akili-audit` exists but missing from README, docs/commands/README, and docs/README Quick Flow |
| Skills (`.claude/skills/`) | 25 skills exist | Drifted | `judgment-day` missing from README skills list, AGENTS.md, and CLAUDE.md skill usage sections |
| Templates (`.claude/templates/`) | 3 templates (leader, implementer, reviewer) | Aligned | All documented correctly in README and docs |
| CLI (`bin/akili.js`) | Installer exists and works | Aligned | Documented in README, docs/cli.md, and package.json |
| Scripts (`scripts/`) | 4 scripts exist | Aligned | `release.js`, `release-status.js`, `parse_tests.js`, `gsc_verify.py` all accounted for |
| Documentation Hub (`docs/`) | Flow, CLI, Commands, Skills, Model Routing, OpenSpec | Drifted | Missing `docs/commands/akili-audit.md` and `docs/skills/judgment-day.md` |
| Agent Guides (CLAUDE.md + AGENTS.md) | Root guides exist | Drifted | Both reference `/akili-audit` but skill usage sections omit `judgment-day` |
| Package Metadata (`package.json`) | v2.3.0, files array, scripts | Aligned | `files` array correctly covers all distributable content |
| CHANGELOG | Comprehensive history | Minor Drift | Plan document filename mismatch (sdd vs akili) |
| GitHub Actions | `release-status.yml` workflow | Aligned | Matches `npm run release:status` documented in AGENTS.md |
| CodeGraph Config | `.codegraph/config.json` | Aligned | Functional but over-provisioned |

## Recommended Next Steps

1. **Update README.md** — Add `/akili-audit` to the Contents list, Command Map table, and Auxiliary commands section.
2. **Update docs/commands/README.md** — Add `/akili-audit` to the Command Map, Normal Sequence, and Source Files tables.
3. **Create `docs/commands/akili-audit.md`** — Write a command reference page following the format of existing pages (e.g., `akili-seo.md`).
4. **Update docs/README.md** — Add `/akili-audit` to the Quick Flow section.
5. **Add `judgment-day` to skills inventories** — README Contents list, AGENTS.md Skill Usage, CLAUDE.md Skill Usage.
6. **Create `docs/skills/judgment-day.md`** — Write a skill reference page following the format of existing pages.
7. **Rename or reconcile plan document** — Either rename `2026-05-26-multi-agent-sdd-orchestration-design.md` to use `akili`, or update the CHANGELOG entry.
8. **Add `.antigravitycli/` to `.gitignore`** — Prevent local IDE artifacts from being committed.
9. **Optional: Narrow CodeGraph config** — Reduce `include` patterns to match the repo's actual languages.
