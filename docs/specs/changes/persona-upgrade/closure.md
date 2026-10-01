# Closure Walks — `changes/persona-upgrade`, Task T10

Every walk below runs the real CLI (`node bin/akili.js doctor --agents …`) on copies in temp
directories under
`/private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/4a5d4fa9-1487-420c-9c68-d318d3618ed3/scratchpad/T10/`,
never on the repository's own `.agents/`, and judges the shipped code and prose against the
**general** rule in `requirements.md` / `design.md`, never against a case the text cites as its own
example. A case is void if judged by finding its own citation, or if an expected outcome was bent to
match what shipped (Disqualifier) — no case below required that.

Red run: `n/a (no test gate)` — this task edits only `CHANGELOG.md` and this file.

---

## Walk 1 — Section states (design §5.4's ten rows + held-out H1)

Setup: `.agents/leader.md`, `reviewer.md`, `tester.md` are verbatim packaged templates (always
`current`); only `implementer.md` varies per case, from the project's own `test/fixtures/personas/`
fixtures. Quoted below: the implementer row(s) and the run's exit code.

| Case | Fixture | Expected (§5.4) | Observed (`doctor --agents`) | Exit | Verdict |
|---|---|---|---|---|---|
| current | `verbatim-marked.md` | every section `current` | `CURRENT context-alignment` … all 6 `CURRENT` | 0 | PASS |
| outdated | `outdated-and-custom-edited.md` | `outdated` (names matched release) | `OUTDATED craft (matched v0.7.0)` | 1 | PASS |
| custom-edited | `custom-edited.md` | `custom-edited` | `CUSTOM-EDITED verification` | 0 | PASS |
| missing | `missing-section.md` | `missing` | `MISSING craft` | 1 | PASS |
| unlocated | `unlocated.md` | `unlocated` | `UNLOCATED craft` | 0 | PASS |
| extra | `extra-section.md` | `extra` | `EXTRA legacy-note` | 0 | PASS |
| unreadable | `unclosed-marker.md` | `unreadable`, whole file | `UNREADABLE section id=verification opens inside id=craft` | 1 | PASS |
| unmarked | `pre-marker-old-scaffold.md` (0 markers) | every id `unmarked`, never `custom-edited` | `UNMARKED no marker of any kind found` + 6× `UNMARKED <id>` | 1 | PASS |
| absent (file) | — (no `implementer.md` written) | `absent`, file-only | `ABSENT persona file does not exist` | 1 | PASS |
| `.agents/` absent | — (no `.agents/` dir) | one line, exit 1, no "missing" | `ABSENT …/.agents does not exist` (one line) | 1 | PASS |
| **H1 (held-out)** — `verbatim-marked.md` with its `<!-- akili:project -->` … `<!-- /akili:project -->` block deleted by hand | — | not cited anywhere in the text; grammar (§5.1) says "project block count is not one" → `unreadable` | `UNREADABLE project block count is 0, expected 1` | 1 | PASS |

**First caught case I misassigned, corrected before recording:** `all-missing.md` has two markers
(a project block, no section markers) and is therefore **not** `unmarked` by the parser's own
exception ("no marker at all" only — §5.1) — it correctly reports every section `missing`, not
`unmarked`. The true `unmarked` fixture (0 markers) is `pre-marker-old-scaffold.md`, used above.
Caught by re-reading the actual grep count (`markers: 2`) before writing the table, not by adjusting
the expectation to match the output — the row recorded is the one the fixture actually represents.

**Tally: 11/11 PASS.**

---

## Walk 2 — Fix safety (every `--fix` row of §5.4 + guards + held-out H2)

| Case | Fixture / setup | Expected | Observed | Exit | Verdict |
|---|---|---|---|---|---|
| outdated → replace | `outdated-and-custom-edited.md`, `--fix` | replace body, rewrite `since=` | `FIXED craft (matched v0.7.0)`; file now has `since=v2.30.0`; `verification` `SKIPPED (custom-edited; use --section)`; `BACKUP …` before write | 0 | PASS |
| idempotence | same dir, second `doctor --agents` | exit 0, no `outdated`/`missing` | all `CURRENT` | 0 | PASS |
| custom-edited, no override | `custom-edited.md`, `--fix` | skip | `SKIPPED verification (custom-edited; use --section)` | 0 | PASS |
| custom-edited, `--section verification` | same, `--fix --section verification` | replace | `FIXED verification (--section override)`, `BACKUP …` | 0 | PASS |
| missing → insert | `missing-section.md`, `--fix` | insert at template position | `INSERTED craft`, `BACKUP …` | 0 | PASS |
| unlocated, no override | `unlocated.md`, `--fix` | skip | `SKIPPED craft (unlocated; use --section)` | 0 | PASS |
| unlocated, `--section craft` | same, `--fix --section craft` | insert, drop id from migration record | `INSERTED craft (--section (removed from migration record))`; file's record becomes `<!-- akili:migrated v2.30.0 not-located=none -->` | 0 | PASS |
| extra → nothing | `extra-section.md`, `--fix` | no row, untouched | no `FIXED`/row for `legacy-note`; `EXTRA legacy-note` persists | 0 | PASS |
| unreadable → skip file | `unclosed-marker.md`, `--fix` | skip whole file, report | `SKIPPED (unreadable: section id=verification opens inside id=craft)` | 1 | PASS |
| unmarked → migrate | `pre-marker-old-scaffold.md`, `--fix` | fence by exact/heading, report `not located` | `FENCED context-alignment (exact)` ×5, `NOT LOCATED shared-file-discipline`, `BACKUP …`; post-fix exit still 1 because the fenced text is an **older release's**, correctly reported `outdated` on the write-back check, not falsely `current` | 1 | PASS |
| absent → install | no file, `--fix` | install packaged template | `INSTALLED` (no id/detail — the whole-file action) | 0 | PASS |
| branch guard | fresh git repo, branch `feature-x` (unresolvable: no pin, not `main`/`master`), `--fix` | refuse unless `--allow-branch` | `REFUSED (branch: the apply-capable branch could not be resolved …)`; with `--allow-branch`: `--allow-branch: branch guard overridden …` then `FIXED craft`, `BACKUP …` | 1 → 0 | PASS |
| dirty-tree guard | git repo on `master`, `.agents/implementer.md` edited but uncommitted, `--fix` | refuse unless `--force` | `REFUSED (dirty tree: .agents/ has uncommitted changes …)`; with `--force`: `--force: dirty-tree guard overridden (1 changed path(s)) …` then `FIXED craft`, `BACKUP …` | 1 → 0 | PASS |
| `--dry-run` | git repo on `master`, clean, outdated section, `--fix --dry-run` | run guards, print plan, write nothing | `FIXED craft (matched v0.7.0)` then `(dry-run — no file written)`; file hash identical before/after; no `.backup/` created | 0 | PASS |
| project-block byte preservation under a live edit | `outdated-and-custom-edited.md` with the project block hand-filled (`Our team's custom test command: npm run test:custom -- --watch=false`), `--fix` | project block unchanged byte for byte; `craft` still fixed, `verification` still skipped | `FIXED craft`, `SKIPPED verification`; post-fix file: `<!-- akili:project -->\nOur team's custom test command: npm run test:custom -- --watch=false\n<!-- /akili:project -->` — exact text, same line | 0 | PASS (FR-2's scenario, literally) |
| **H2 (held-out)** — `--fix --section verification` on `verbatim-marked.md`, where `verification` is already `current` | no text cites this | `--section` only acts on `custom-edited`/`unlocated` (§5.4, `applyFix`'s `current` branch is an explicit no-op); a `current` id under `--section` does nothing | file hash **identical** before and after (`601b46…` both); no `FIXED`/`INSERTED` row printed for it; exit 0 | 0 | PASS |

**Tally: 16/16 PASS.** No FAIL in this walk.

---

## Walk 3 — Migration (FR-5's two scenarios on real copies + held-out H3)

Re-run this attempt (attempt 3), fresh, in new scratch dirs, each in two steps per case — `--fix`
first, then a second `doctor --agents` with no flags to read the post-fix section states — rather
than carried from attempt 2. `cwd` was set explicitly to each scratch dir on every spawn; no write
touched this repo's own `.agents/`.

| Case | Source | `--fix` run | Post-fix `doctor --agents` (no flags) | Exit | Verdict |
|---|---|---|---|---|---|
| This repo's own `.agents/implementer.md` (pre-v2.29.0 scaffold) | `cp .agents/implementer.md` into scratch, `--fix` | 5× `FENCED … (exact)` (`context-alignment`, `scope-discipline`, `craft`, `verification`, `reporting`), 1× `NOT LOCATED shared-file-discipline`; `BACKUP …` before write | **5× `OUTDATED`**, naming the matched release each: `context-alignment (matched v2.18.0)`, `scope-discipline (matched v2.14.0)`, `craft (matched v0.7.0)`, `verification (matched v2.25.0)`, `reporting (matched v2.14.0)`; **1× `UNLOCATED shared-file-discipline`** | 1 | PASS — every `FENCED` section landed on an *older* release's text (never the current one), which is exactly FR-5's scenario ("each item … fenced by exact match and reported `outdated`"); attempt 2's "one fenced section still reads an older release" undercounted — all five do |
| STAR's `~/Development/alliance-research-indicators-main/.agents/implementer.md` (front matter, renamed role, one-space items; 54 lines) | `cp` verbatim into scratch, `--fix` | 2× `FENCED … (heading)` (`scope-discipline`, `reporting`), 4× `NOT LOCATED` (`context-alignment`, `craft`, `verification`, `shared-file-discipline`); `BACKUP …` before write | **2× `CUSTOM-EDITED`** (`scope-discipline`, `reporting`); **4× `UNLOCATED`** (`context-alignment`, `craft`, `verification`, `shared-file-discipline`) | 0 | PASS — attempt 2's stated reason ("happen to match current-release text exactly, so no outdated") was wrong; the real, designed reason is design §11: a heading-fenced section is reported `custom-edited`, never silently matched to `current` — a heading-and-opening-sentence match earns fencing, not an identity claim, so the write-back check correctly treats the fenced text as edited rather than pristine |
| **H3 (held-out)** — a persona that is only front matter and free prose, no heading any template knows | hand-written scratch file (`---\nrole: builder\nmodel: whatever\n---\n\nJust write the code and ship it. No ceremony.\n`) | 6× `NOT LOCATED`; `BACKUP …` before write; migration record `not-located=context-alignment,scope-discipline,craft,verification,reporting,shared-file-discipline` immediately followed by an empty `<!-- akili:project -->`/`<!-- /akili:project -->` pair | **6× `UNLOCATED`** (all six ids) | 0 | PASS |

**STAR's project-block position, checked against FR-5's scenario** ("one project block is placed at
the end of the file"): post-fix file is **61 lines total**; `grep -n "akili:project\|akili:migrated"`
shows the migration record at line 59 and the project block's open/close tags at **lines 60–61 of
61** — the migration record plus project block occupy the file's last three lines, i.e. the block
sits at the end of the file, matching the scenario.

**H3 trailing-newline observation (Open item 8's verification, not a fix):** before `--fix`, `tail -c
1 .agents/implementer.md | od -c` on the H3 fixture read `\n` (one trailing newline byte). After
`--fix`, the same command on the migrated file reads `>` — the last character of the closing
`<!-- /akili:project -->` marker, with **no trailing newline**. Observed, not corrected: this task's
scope is `CHANGELOG.md` and `closure.md` only; no code was touched.

**Note on the migration record's release form:** all three cases wrote the bare form (`2.29.0`, no
leading `v`) — `migratePersona`'s own default is `digests.version` when no explicit release is
passed, which the real CLI always passes as `currentVersion` — confirming execution.md's T4
forward-pointer about the record's release form without a leading `v` where `digests.json`'s stored
value lacks one.

**Tally: 3/3 PASS**, with attempt 2's two misstated observations corrected above (all 5 repo-copy
sections `OUTDATED` with named releases, not 1; STAR's 2 fenced sections `CUSTOM-EDITED` for the
design §11 reason, not because they "happen to match").

---

## Walk 4 — Safe Update (FR-6's scenario + held-out H4), a text walk

Safe Update is prose an LLM executes, not code; this walk reads the shipped text at
`.claude/commands/akili-constitution.md:424` (quoted in full once, in T7's Reviewer report, already
re-verified here by a fresh read) against FR-6's five clauses:

| FR-6 clause | Shipped text | Verdict |
|---|---|---|
| Migrate when unmarked; replace `outdated`; insert `missing`; report `custom-edited` and leave it | "for each existing persona, run the migration when it has no markers, replace every `outdated` section with the current template text, insert every `missing` section, and report every `custom-edited` section without touching it" | Delivered |
| Never append an upgrade block for a rule an owned section covers; never rewrite the project block or other project space | "never append an upgrade block for a rule an owned section already covers, and never rewrite the project block or any other project space" | Delivered |
| Write injections only into the project block, only once | *Injection scope* lead sentence (Step 8B, read in full): "every injection below is written into the persona's `<!-- akili:project -->` … `<!-- /akili:project -->` block, never into an owned section, and only when the persona does not already carry it anywhere — one already living inside a `custom-edited` section is reported as a move to make by hand, never duplicated" | Delivered |
| Prefer the CLI, fall back to installed templates + digests | "Prefer running `akili update` first, then `akili doctor --agents --fix`, and read its report; when the CLI is unavailable, apply the same steps by hand from the installed templates and their digests" | Delivered |
| Scenario: one outdated section replaced, nothing appended, project block untouched | Same bullet; independently confirmed in code terms by Walk 2's `outdated` row and the project-block-preservation case above | Delivered (text + code analogue both checked) |

**H4 (held-out) — no CLI on PATH, and no installed `digests.json` either: what does the prose tell
the agent to do, and does the by-hand path stay possible or stop?**

The bullet's fallback clause names two things to read by hand: "the installed templates **and their
digests**." It does not separately address the case where the digests half of that pair is itself
absent (only "when the CLI is unavailable" is named as the trigger). Read literally, an agent
following this sentence with no `digests.json` on disk has nothing to open for that half of the
instruction.

Walked against the actual state-decision rule it would apply (`sectionStates`, §5.4): without a
digest table, every section that is not byte-identical to the installed template falls through to
`custom-edited` (no `releases`/`legacy` entry can match), never `outdated` — `custom-edited` is the
conservative default, not a crash or an unresolvable branch. So **the by-hand path stays possible**:
an agent can still determine `current` vs. not, `missing` vs. present, and `extra`, and it degrades
safely — it never falsely claims a section is safely auto-replaceable (`outdated`) when it cannot
prove that from a digest. It just cannot distinguish `outdated` from `custom-edited` without the
table, exactly as design §2 states digests exist to do. **Verdict: PASS, with a stated gap** — the
Step 8B sentence does not spell out this degraded case in words a reader could follow without
re-deriving it from the code's own default, the way this walk had to. Not a correctness defect
(nothing in the prose tells an agent to do something unsafe); a documentation gap, worth a future
one-line addition, not raised here as a FAIL because the underlying mechanism already fails safe.

**Tally: 2/2 PASS** (one scenario, one held-out), one documentation gap noted, not a FAIL.

---

## Walk 5 — Requirement text, FR-1…FR-10 term by term

Legend: **Delivered** (shipped sentence/code/CLI output found and checked against HEAD this task),
**Delivered (structurally)** (true by construction, not by a standalone assertion), **Not delivered**
(stated as such, never hidden).

### FR-1 — Templates carry section markers

| Clause | Evidence | Status |
|---|---|---|
| Every owned block fenced by open/close HTML-comment markers, own lines | `grep -o 'id=[a-z-]*' .claude/templates/*.md \| sort -u \| wc -l` → 22; `parsePersona` on all four templates → `unreadable: false`, well-formed | Delivered |
| `id` stable, lowercase kebab-case, unique per file | `SECTION_OPEN_RE` anchors `[a-z0-9-]+`; `parsePersona`'s `seenIds` flags a duplicate as `unreadable` (code, `bin/persona.js:236-239`); no duplicate found across the four templates at HEAD | Delivered |
| `since` is the release the section's text last changed, updated by the release that changes it | T5's digest/`since` step (DD-3), confirmed live: the `craft` section's `since=` moved to `v2.30.0` after this walk's own `--fix` replaced it, matching the packaged template's own `since=v2.30.0` | Delivered |
| Markers invisible in rendered Markdown; no rule's meaning changes | HTML-comment syntax (`<!-- … -->`), structurally invisible to any Markdown renderer | Delivered (structurally) |
| Unfenced text limited to: title, intro, model-tier note, `## Primary Instructions` heading, `---`, blank lines, project block, migration record, `## Authorship` | `parsePersona` on all four templates: every `text`-kind segment's non-blank content is exactly {title, intro paragraph, model-tier blockquote, `## 🎯 Primary Instructions`} at the top and {`## Authorship`, attribution line} at the bottom — nothing else | Delivered |
| Four templates grow by ≤2,200 bytes from the markers | Absolute size check: `wc -c` → 74,391 bytes total, under the 74,421-byte cap this budget allows | Delivered |

### FR-2 — Project injections live in the project block

| Clause | Evidence | Status |
|---|---|---|
| Exactly one project block per template, after primary instructions, empty by default | `grep -c 'akili:project -->'` → 2 per template (one open + one close) in all four; positioned after `## 🎯 Primary Instructions` in each | Delivered |
| *Injection scope* names the project block for every injection | `.claude/commands/akili-constitution.md:426` (read in full): "every injection below is written into the persona's `<!-- akili:project -->` … block, never into an owned section" | Delivered |
| Project block + unfenced text preserved byte for byte by every upgrade | Walk 2's project-block-preservation case: a hand-filled project block survived `--fix` character for character while a sibling section was replaced | Delivered |
| Contradiction resolved in the project block's favor, stated in one sentence | All four templates: "The project block below overrides any marked section." (one line each) | Delivered |
| Scenario: injected test command survives a verification-section upgrade | Same Walk 2 case — the injected line is in the project block, not the replaced section | Delivered |

### FR-3 — One state, `doctor --agents` reports it

All nine section-level states + the `.agents/`-absent line: walked and PASSed in Walk 1 (11/11,
including held-out H1). Exit code table (`EXIT_ZERO_STATES` = `current`/`custom-edited`/`extra`/
`unlocated`) confirmed by every case's observed exit code above, with no mismatch. Report names the
CLI release (`— akili-specs v2.29.0` printed on every run) and the tool root "for information"
(`Tool root (info only): claude → …` etc., printed regardless of `--tool`, confirming states never
depend on it — the "same states whichever `--tool` is passed" clause). **Delivered**, fully.

### FR-4 — `--fix` upgrades, with a backup, without touching project space

Every bullet and both named scenarios walked in Walk 2 (16/16), including both guards, `--dry-run`,
idempotence, and the byte-preservation case. One clause not independently re-derived from first
principles here (trusted from T3/T6's own red-before-green tests, cited in `execution.md`): backup
written strictly before the persona file itself, proven there by a forced-failure test, not
re-proven by this closure. **Delivered**, with that one sub-clause carried from upstream evidence
rather than re-run.

### FR-5 — An unmarked persona is migrated once

Both named scenarios plus held-out H3, walked in Walk 3 (3/3): exact match, heading+opening-sentence
match (never heading alone — confirmed by STAR's case, where a heading hit with no opening-sentence
match stays `not located`), extent cut by level, nothing deleted/moved, exactly one project block
inserted, migration record immediately before it, front matter preserved as first bytes. **Delivered.**

### FR-6 — Safe Update replaces owned sections

Walked in Walk 4 against the shipped `akili-constitution.md:424` text: all five clauses delivered,
plus the held-out H4 gap (documented, not a FAIL). **Delivered**, with one stated documentation gap.

### FR-7 — `/akili-audit` reports persona drift

`.claude/commands/akili-audit.md:60`, item (c), read in full: names the states, names `akili doctor
--agents`, the by-hand fallback, the probing order (`--local` first), the three edge cases (template
with no deployed persona → `absent`; persona with no packaged template → unscored; root unresolved →
`unevaluated`), and `--fix` as the remedy. **Delivered.**

### FR-8 — Documentation and the CHANGELOG convention

`docs/cli.md` *Persona Drift (doctor --agents)* section (marker grammar, flags, states + exit codes,
`--fix` rows), `docs/commands/akili-constitution.md`, `docs/flow.md`, `README.md` — all confirmed
present at HEAD by direct read/grep (T9's work; re-verified here, not merely cited): the sweep for
"append a minimal upgrade block" / "never overwrite" across `.claude/commands`, `docs/commands`,
`docs/flow.md`, `README.md` returns only unrelated obligations (child guides, wrapper files, JSON
hooks, report filenames) — zero hits restating the superseded persona rule. The inline-draft path
(Step 8B) drafts with markers and an empty project block (T7's shipped text, re-read). The CHANGELOG
entry itself and its convention are delivered by this task (below). **Delivered**, all five sub-claims.

### FR-9 — The CLI behavior is tested

`"test": "node --test"` in `package.json`; `npm test` → **69 pass, 0 fail**, exit 0 (re-run this
task, not merely cited). Fixtures present for all seven named kinds (verbatim marked, custom-edited,
missing section, pre-marker old scaffold, STAR-modelled rewrite, unclosed marker, CRLF). CI
(`.github/workflows/ci.yml`) runs `npm test` on `ubuntu`/`macos`/`windows` × Node `18`/`22` — the
first `windows-latest` and `node: 18` legs have **not yet run green** as of this entry (stated, not
claimed otherwise). Each test observed red before green, per T2–T4/T6's own records in `execution.md`
(not re-derived here — trusted from those closing records). **Delivered**, with the CI-legs gap
stated honestly rather than implied passing.

### FR-10 — Rollout, compatibility, rollback

**FR-10's first bullet, quoted verbatim from `requirements.md:236`:** "A project that never runs the
command SHALL be unaffected: markers are comments, and `doctor` without `--agents` is unchanged."
(Corrected this attempt: attempt 2 misattributed this wording to `docs/cli.md` and misquoted it as
"byte-for-byte the old behavior" and "the bullet as stated" — neither phrase is in `docs/cli.md`.
"Byte-for-byte the old behavior" is `design.md`'s words, not the requirement's own — design §6 (*CLI
Surface*), its "Without `--agents`" row, cited here by section name per NFR-7's no-line-pointers
rule, not by line number.)

The **code path** satisfies the requirement's own wording: `runAgentsDoctor` only runs under
`--agents` (confirmed in code), so plain `doctor`'s branch is untouched, byte for byte, by this
change — that part of FR-10 and of design §6's row is delivered as written. But this task's
corrected verification (CHANGELOG clause table above; the "What an existing installation will see"
paragraph) shows the **reported outcome** for a pre-existing install is not unchanged: `doctor`'s
resource check now also looks for `templates/digests.json` (DD-11), so an existing install moves from
`COMPLETE` to `INCOMPLETE`/exit 1 until `akili update` (or `install --force`) runs — with no code
branch conditioned on `--agents` having moved at all.

**Verdict (as the Reviewer states it, not softened to "satisfied"):** code path unchanged; reported
outcome for a pre-existing install changed by DD-11 — this is a **conflict inside the spec**, between
FR-10's first bullet / design §6's "byte-for-byte the old behavior" row on one side and DD-11 on the
other, not a satisfied clause with a caveat attached. See **Open item 6** below.

The rest of FR-10 stands independent of that conflict: the command works on a persona from any
earlier release (Walk 3's two real-copy migrations); `--fix` is reversible by restoring the backup
the report names (every Walk 2 write printed a `BACKUP <path>` line); the CLI compares against its
own packaged templates and prints its release; Safe Update says to run `akili update` first
(`akili-constitution.md:424`, re-read). **Delivered, except the first bullet, which is a spec
conflict recorded as Open item 6.**

**FR-1…FR-10 tally:** every clause delivered, explicitly stated as a documentation gap (H4), a
trusted-from-upstream sub-clause (FR-4's write-ordering proof, FR-9's red-before-green history), or
recorded as a spec conflict for the user (FR-10's first bullet, Open item 6) — none silently
assumed, none hidden.

---

## Falsifier (executed) — the `unreadable` guard in `sectionStates`

**Setup.** Copied `bin/akili.js`, `bin/persona.js`, `.claude/templates/` (all four `.md` +
`digests.json`), and `package.json` into a scratch tree
(`…/scratchpad/T10/falsifier/`) — never the repository's own `bin/`. Confirmed the unmutated copy
reproduces H1 exactly (`UNREADABLE project block count is 0, expected 1`, exit 1) before mutating
anything.

**Mutation.** Removed this block from the scratch copy's `bin/persona.js` (`sectionStates`):

```js
if (persona.unreadable) {
  return { status: "unreadable", reason: persona.unreadableReason };
}
```

**Result — H1 falls into `current`.** Re-run against the same H1 fixture (a marked, otherwise
current persona with its project block deleted by hand): every one of the implementer's 6 sections
now reports `CURRENT`, the whole run prints "No persona drift blocking CI," and exits **0**. The
guard's removal does not produce an exception or an `unmarked`/`missing` reading — it silently
reclassifies a persona that has **lost its entire project block** (and, with it, every injected
customization and every piece of project space) as fully healthy. This confirms the guard is load-
bearing in the specific way FR-3's `unreadable` row exists to prevent: without it, a grammar
violation that leaves the *section* bodies intact is invisible to the report, because
`sectionStates`'s per-section loop only ever compares section hashes — it has no other path to
notice that the file around those sections is broken.

**Falsifier verdict: PASS** (behaves as required — removal produces red, and the red is informative:
H1 → `current`, not a crash).

---

## CHANGELOG clause → evidence table (KZ-002)

Every clause of the `[Unreleased]` entry added by this task, checked against the grep or command
that would falsify it:

| Clause | Falsifying check | Result |
|---|---|---|
| "22 section ids changed, by template" (list given) | `grep -o 'id=[a-z-]*' .claude/templates/*.md \| sort -u \| wc -l` | 22 |
| "74,391 bytes, under the 74,421-byte cap" | `wc -c .claude/templates/*.md` | 74,391 total |
| States list + "current/custom-edited/extra/unlocated… never fail CI; every other state does" | Walk 1's 11 exit codes | Matches exactly |
| "`--fix` replaces outdated (rewriting since=), inserts missing, migrates unmarked, installs absent" | Walk 2's rows (`FIXED`, `INSERTED`, `FENCED`, `INSTALLED`) | Matches exactly |
| "backs up to `.agents/.backup/<role>.md.<timestamp>` before any write" | Every Walk 2 `BACKUP` line's path shape | Matches |
| "never changes custom-edited/unlocated/extra or project space unless `--section` names it" | Walk 2's skip rows + the project-block-preservation case | Matches |
| "Safe Update and `/akili-audit` now run this mode… old 'append' rule removed everywhere" | `grep -rn -i "append a minimal upgrade block\|only append" .claude/commands docs/commands docs/flow.md README.md` | 0 load-bearing hits (all unrelated obligations, read individually) |
| "73/73/73/48 tags, 1,199 entries" | `node -e` over `digests.json` (this task, not cited from memory); re-run again this attempt: per-role tag counts read from `digests.json.legacy[role][<first section id>]` | leader 73, implementer 73, reviewer 73, tester 48, total hashed entries 1,199 |
| "**48** for `tester` (whose template first shipped at v2.5.0)" — corrected this attempt from the FAILed "whose markers are newer" | `git tag --sort=version:refname \| while read t; do git cat-file -e "$t:.claude/templates/tester.md" 2>/dev/null && echo $t && break; done` | `v2.5.0` — the first tag whose tree carries `.claude/templates/tester.md` at all; the tester template did not exist before that tag, which is why its legacy tag count (48) is lower than the other three roles' (73) |
| "now runs `npm test` on every push to `master` and every pull request" — corrected this attempt from the FAILed "on every push" | `.github/workflows/ci.yml`'s `on:` block, read in full | `on:\n  push:\n    branches: [master]\n  pull_request:` — triggers on a push to `master` and on any pull request, not on every push to every branch |
| "`digests.json.releases` starts empty at this release" | Same script: `Object.keys(d.releases)` | `[]` |
| "`akili doctor --help` does not yet list `--agents`/`--section`/`--allow-branch`" | `node bin/akili.js doctor --help` | None of the three flags present (the only incidental matches on "agents"/"section" are `--codex-skills-target`'s help text, unrelated) |
| "CI runs `npm test`… windows-latest/node 18 legs not yet run" | `grep -n "npm test" .github/workflows/ci.yml` (existence); legs' pass/fail status is a GitHub Actions fact this task cannot query — stated as `not yet run`, matching `execution.md`'s T6/T9 forward pointers, never claimed green | Consistent with the only evidence available; not independently falsifiable from this checkout |
| "no existing project forced to adopt it" / "minor" classification | DD-10 (design.md); matches the precedent `[2.27.0]`/`[2.28.0]` entries' own classification language | Consistent |
| Notes: "a project that never runs `akili doctor --agents` sees no change to any persona" — corrected this attempt from the FAILed unqualified "sees no change in behavior" | Re-read against the entry's own "What an existing installation will see" paragraph (DD-11): plain `doctor` on a pre-existing install now reports `INCOMPLETE`/exit 1 for the missing `digests.json` resource | Narrowed claim holds: no persona changes without `--agents`; the Notes clause now points at, rather than contradicts, the DD-11 paragraph |

No clause in the entry overstates what Walks 1–5 and the verification run below actually showed.

---

## Verification (real outputs, this task)

```
$ npm test
...
# tests 69
# pass 69
# fail 0
EXIT: 0
```

```
$ npm run verify:cli
...
Resources:
  ...
  templates/digests.json
Summary: 11 commands | 24 skills | 8 resources (akili-specs v2.29.0)
EXIT: 0
```

```
$ npm run pack:dry-run
...
npm notice total files: 277
akili-specs-2.29.0.tgz
EXIT: 0
```

```
$ node bin/akili.js doctor --tool all; echo EXIT:$?
...
  MISSING /Users/jcadavid/.claude/akili/templates/digests.json
...
  MISSING /Users/jcadavid/.config/opencode/akili/templates/digests.json
...
  MISSING /Users/jcadavid/.gemini/config/akili/templates/digests.json
...
  MISSING /Users/jcadavid/Library/Application Support/orca/codex-runtime-home/home/akili/scripts/gsc_verify.py
  MISSING /Users/jcadavid/Library/Application Support/orca/codex-runtime-home/home/akili/scripts/parse_tests.js
  MISSING /Users/jcadavid/Library/Application Support/orca/codex-runtime-home/home/akili/.mcp.json.example
  MISSING /Users/jcadavid/Library/Application Support/orca/codex-runtime-home/home/akili/templates/leader.md
  MISSING /Users/jcadavid/Library/Application Support/orca/codex-runtime-home/home/akili/templates/implementer.md
  MISSING /Users/jcadavid/Library/Application Support/orca/codex-runtime-home/home/akili/templates/reviewer.md
  MISSING /Users/jcadavid/Library/Application Support/orca/codex-runtime-home/home/akili/templates/tester.md
  MISSING /Users/jcadavid/Library/Application Support/orca/codex-runtime-home/home/akili/templates/digests.json
Doctor Summary — akili-specs v2.29.0
  CLAUDE       INCOMPLETE  ok 42 | missing 1 | fixed 0
  OPENCODE     INCOMPLETE  ok 42 | missing 1 | fixed 0
  ANTIGRAVITY  INCOMPLETE  ok 42 | missing 1 | fixed 0
  CODEX        INCOMPLETE  ok 35 | missing 8 | fixed 0
EXIT:1
```

The exit is **1**, not 0. The one missing item under the CLAUDE, OPENCODE, and ANTIGRAVITY roots is
in each case `…/akili/templates/digests.json` — the resource this task's T5 added — because `doctorTool`
now checks `templates/digests.json` (DD-11) and this development machine's three installed roots were
populated before this change shipped: an existing install reads `INCOMPLETE` for that one resource
until `akili update` (or `install --force`) refreshes it, which is expected, not a defect. The CODEX
root's 8 missing items are pre-existing and unrelated to this spec — the Codex resources root here was
never populated at all (`codex` itself is also `NOT FOUND` in the same run) — `digests.json` is simply
one more name on that root's existing list, not a new regression. CI installs fresh before it runs
`doctor`, so a CI run is unaffected by this reading; only a developer's own pre-existing local roots
see it. (Attempt 1 reported `EXIT: 0` and "nothing in its missing list names a persona-upgrade
resource" — both false; corrected here from the command's real output, not from the prior reading.)

```
$ git diff --check
(no output)
EXIT: 0
```

```
$ wc -c .claude/templates/leader.md .claude/templates/implementer.md .claude/templates/reviewer.md .claude/templates/tester.md
   36596 leader.md
   14549 implementer.md
   12314 reviewer.md
   10932 tester.md
   74391 total
```

```
$ git diff --stat 1cc75a0 -- .claude/skills .agents
(no output)
EXIT: 0
```

```
$ node --check scripts/release.js && node --check scripts/notify-slack.js
release.js OK
notify-slack.js OK
```

`scripts/release.js`'s `extractUnreleased` (read at `scripts/release.js:75-85`) requires only that
the `[Unreleased]` section's trimmed content be non-empty and not contain the literal placeholder
`"No unreleased changes yet."` before the next `## [X.Y.Z]` heading — this task's edit satisfies that
shape; `updateChangelog` moves the whole block verbatim under the next version heading. Neither
script run against the network.

---

## Open items carried, not resolved here (for the Leader / user)

1. Design §5.1's majority-EOL writer vs. FR-4's "any byte" of project space, in a persona with mixed
   line endings — unresolved tension, carried from T3.
2. An untracked `.agents/` trips the dirty-tree guard, though FR-4 scopes that guard to
   "git-tracked with uncommitted changes" — carried from T3.
3. `printHelp` (`bin/akili.js`) lists none of `--agents`, `--section`, `--allow-branch` — confirmed
   again by this task's own `doctor --help` run.
4. Two paragraphs of `docs/cli.md` begin with the literal word "Advisory:" (a Leader brief tag that
   leaked into shipped prose, per T9's record) — cosmetic, not re-verified line-by-line here.
5. The first `windows-latest` and `node: 18` CI runs have not happened yet — confirmed still true as
   of this task (no new CI run was triggered by this task's own edits, which touch only `CHANGELOG.md`
   and this file).
6. **FR-10's first bullet and design §6's "byte-for-byte the old behavior" row conflict with DD-11.**
   FR-10 (`requirements.md:236`): "A project that never runs the command SHALL be unaffected: markers
   are comments, and `doctor` without `--agents` is unchanged." Design §6 (*CLI Surface*), its
   "Without `--agents`" row: "Byte-for-byte the old behavior." Both are true of the **code path**
   (`runAgentsDoctor` only runs under `--agents`) but false of the **reported outcome**: DD-11 makes
   plain `doctor` on a pre-existing install report `INCOMPLETE`/exit 1 for the missing
   `templates/digests.json` resource, with no code branch conditioned on `--agents` having moved.
   This is a conflict inside the spec itself, not a defect this task can resolve by editing
   `CHANGELOG.md` or this file — raised for the user to settle which of the two statements the
   requirement and design should carry forward.
7. **Step 8B's by-hand fallback says nothing for "no CLI and no installed `digests.json`" (Walk
   4 / H4).** `docs/cli.md` documents the CLI's own fallback for a missing digest table (falls
   through to `custom-edited` rather than `outdated` — the conservative default), but the Step 8B
   prose in `.claude/commands/akili-constitution.md:424` names only "the installed templates and
   their digests" as what to read by hand when the CLI is unavailable, without saying what an agent
   following that sentence should do when the digests half of that pair is itself absent. Walk 4
   judged the underlying mechanism safe (it degrades the same way the CLI does), but the documentation
   gap itself was never closed.
8. **The migrated file loses its trailing newline after `<!-- /akili:project -->` (T4 code,
   observed, not fixed).** Verified on the H3 copy this attempt: `tail -c 1 .agents/implementer.md |
   od -c` read `\n` before `--fix` and `>` (the last character of the closing project-block marker,
   no trailing newline) after. Possibly a byte of project space against NFR-4 — recorded for the
   Leader/user; this task's scope is `CHANGELOG.md` and `closure.md` only, so the code was not
   touched.

None of the eight became a task here, per the Scope Discipline and the Open-items instruction.
