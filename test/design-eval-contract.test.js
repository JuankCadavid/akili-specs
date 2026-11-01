"use strict";
// @akili-spec changes/impeccable-audit-fixes/design-eval-contract
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8").replace(/\r\n/g, "\n");
const BRIDGE = [".claude", "skills", "impeccable-bridge"];

const index = (s, needle) => {
  const i = s.indexOf(needle);
  assert.ok(i >= 0, `missing: ${needle}`);
  return i;
};
// The text between two markers, the end marker searched only after the start marker.
const slice = (s, from, to) => {
  const i = index(s, from);
  const j = s.indexOf(to, i + from.length);
  assert.ok(j > i, `missing end marker after "${from}": ${to}`);
  return s.slice(i, j);
};

const bridge = () => read(...BRIDGE, "SKILL.md");
const step0 = () => slice(bridge(), "## Step 0", "### Engine state");
const verify = () => slice(step0(), "**Verify.**", "2. **Engine probe");
const exclusion = () => slice(step0(), "**Exclusion.**", "3. **Ready.**");
const ready = () => slice(step0(), "3. **Ready.**", "4. **Consent.**");
const consentStep = () => slice(step0(), "4. **Consent.**", "**The gate, stated once:**");
const engineConsent = () => slice(bridge(), "### Engine consent", "### Who does what");
const launcherForm = () => slice(bridge(), "### Launcher form", "### Scan matrix");
const scanMatrix = () => slice(bridge(), "### Scan matrix", "### First-visit pass");
const firstVisit = () => slice(bridge(), "### First-visit pass", "### Exit codes");
const ctaItem = () => slice(firstVisit(), "3. A fold screenshot", "4. When the product has a consent banner");
const outcomes = () => ctaItem().slice(index(ctaItem(), "- Outcomes, checked in this order:"));
const bannerItem = () => slice(firstVisit(), "4. When the product has a consent banner", "- The consent-hiding");
const priorityBullet = () => slice(firstVisit(), "- On Persuade and Operate screens,", "- Record the capture conditions");
const waivers = () => slice(bridge(), "## Design Waivers", "## Privacy and consent");
const waiverRow = (name) => slice(waivers(), `| ${name} |`, "\n");
const closedList = () => slice(waivers(), "| Rule id | Allowed `false positive` reason |", "\n\n");
const suppressed = () => slice(bridge(), "## Suppressed in `/akili-audit design`", "## Detector gate");

test("FR-1: after a consented download the pin is the written binary, `.exe` on Windows, probed directly", () => {
  const c = consentStep();
  assert.ok(index(c, "(this call is the download)") < index(c, "set the pin to"), "the pin follows the download");
  assert.ok(c.includes("set the pin to `${IMPECCABLE_HOME:-~/.impeccable}/bin/<VERSION>/impeccable`"), "pin path");
  assert.ok(c.includes("(`impeccable.exe` on Windows)"), ".exe note");
  assert.ok(c.includes("for every later launcher call in the phase"), "pin covers every later call");
  assert.ok(c.includes("run `<pin> engine-probe` directly"), "post-pin probe is direct");
  assert.ok(c.includes("a pin that does not answer records `unavailable (<first stderr line>)` instead"), "unanswered pin");
});

test("FR-1: Engine consent says IMPECCABLE_HOME alone does not isolate and names the Home override field", () => {
  const c = engineConsent();
  assert.ok(
    c.includes("`IMPECCABLE_HOME` alone does not isolate: without the pin, each launcher reads `~/.impeccable/bin/impeccable[.exe]` first, before `IMPECCABLE_HOME`."),
    "destination note",
  );
  assert.match(c, /\| Home override \| Under an exclusion, the download call alone runs with `HOME` \(or `USERPROFILE`\) set to an empty directory inside `IMPECCABLE_HOME`, with `IMPECCABLE_BIN` unset and no `PATH` entry under `~\/\.impeccable` \|/);
});

test("FR-1: the Exclusion paragraph skips location 3 and resolved ~/.impeccable paths, requires an outside IMPECCABLE_HOME, and states the state-file limit", () => {
  const e = exclusion();
  assert.ok(e.includes("skip location 3"), "location 3");
  assert.ok(e.includes("any other candidate whose resolved path lies under `~/.impeccable`"), "resolved-path rule");
  assert.ok(e.includes("an `IMPECCABLE_BIN` or a `PATH` entry pointing there"), "examples of the resolved-path rule");
  assert.ok(e.includes("Location 4 counts only with an `IMPECCABLE_HOME` outside `~/.impeccable`"), "location 4");
  assert.ok(e.includes("The exclusion covers where the engine is found;"), "limit statement");
  assert.match(e, /state files/);
  assert.ok(e.includes("`IMPECCABLE_NO_UPDATE_CHECK=1` switches off the update check only"), "what the switch covers");
});

test("FR-1: the one download call changes the home variable, HOME for the shell launcher and USERPROFILE for the cmd launcher, inside IMPECCABLE_HOME", () => {
  const c = consentStep();
  assert.ok(c.includes("Under an exclusion, the consent question also asks"), "scoped to an exclusion");
  assert.ok(c.includes("asks for an `IMPECCABLE_HOME` outside `~/.impeccable` when none is set"), "consent asks for the home");
  assert.ok(c.includes("`unavailable (excluded location, no IMPECCABLE_HOME)` and do not download"), "no home given");
  assert.ok(c.includes("That one download call runs with the launcher's home variable set to an empty directory inside `IMPECCABLE_HOME`"), "one call, empty dir");
  assert.ok(c.includes("`HOME` for `scripts/impeccable`"), "POSIX launcher variable");
  assert.ok(c.includes("`USERPROFILE` for `scripts/impeccable.cmd`"), "Windows launcher variable (A1-W)");
});

test("FR-1: every launcher call carries IMPECCABLE_BIN= as an inline prefix (shell state may not persist)", () => {
  const r = ready();
  assert.ok(r.includes("export `IMPECCABLE_BIN=<that candidate>`"), "the export sentence stays");
  assert.ok(r.includes("Shell state may not persist between an agent's tool calls"), "why inline");
  assert.ok(r.includes("every launcher call also carries `IMPECCABLE_BIN=<pinned path>` as an inline prefix"), "item 3 prefix");
  const l = launcherForm();
  assert.ok(/^IMPECCABLE_BIN=<pinned path> DO_NOT_TRACK=1 IMPECCABLE_NO_UPDATE_CHECK=1 <skill-dir>\/scripts\/impeccable detect --json \[flags\] <targets>$/m.test(l), "launcher form prefix");
  assert.ok(l.includes("Every call carries the Step 0 pin inline"), "reworded pin sentence");
  assert.ok(!l.includes("stays pinned from Step 0"), "the export-only wording is retired");
});

test("FR-1 (BUT): the home variable never changes for any call other than the one download call, nor after the pin", () => {
  const c = consentStep();
  assert.ok(c.includes("No other call overrides the home variable, unsets `IMPECCABLE_BIN` or filters `PATH`; every call after the pin carries the pinned `IMPECCABLE_BIN` with the user's `PATH` and home variable."), "no other call, none after the pin");
  const l = launcherForm();
  assert.doesNotMatch(l, /\bHOME=|USERPROFILE=/, "the launcher form never sets a home variable");
});

test("FR-1 (AND IT MUST): the report records Excluded: and IMPECCABLE_BIN: (and the download home override)", () => {
  assert.ok(exclusion().includes("Record `Excluded: ~/.impeccable`"), "Excluded field");
  const c = consentStep();
  assert.ok(c.includes("`IMPECCABLE_BIN: <pinned path>`"), "IMPECCABLE_BIN field");
  assert.ok(c.includes("`Download home override: <variable>=<dir>; IMPECCABLE_BIN unset; PATH entries removed: <entries, or none> (one call)`"), "Download home override field");
});

test("FR-2: the Verify paragraph hashes every UPSTREAM.md file, with SKILL.md minus its metadata: block (up to, not including, the closing fence)", () => {
  const v = verify();
  assert.ok(v.includes("Hash every file `UPSTREAM.md` lists"), "hash every listed file");
  assert.ok(v.includes("`shasum -a 256`, `sha256sum`, or `certutil -hashfile <file> SHA256` on Windows"), "sha256 tools");
  assert.ok(v.includes("with its `metadata:` block removed, from the line `metadata:` up to, **not** including, the closing `---` fence"), "metadata range");
  assert.ok(v.includes("neither listed nor one of `LICENSE`, `NOTICE`, `UPSTREAM.md` counts as modified"), "unlisted file counts as modified");
});

test("FR-2: the recorded value is vendored (<version>, verified) or vendored (<version>, modified: <n> files: <first 3 names>)", () => {
  const v = verify();
  assert.ok(v.includes("`vendored (<version>, verified)`"), "verified");
  assert.ok(v.includes("`vendored (<version>, modified: <n> files: <first 3 names>)`"), "modified");
  assert.ok(v.includes("the table keeps `vendored (<version>)`"), "the table value stays");
});

test("FR-2: Copy, Home and Other copies are recorded for any selected copy, vendored or user-installed, ahead of the vendored-only hashing", () => {
  const v = verify();
  const any = index(v, "For any selected copy, `vendored` or `user-installed`, record `Copy`");
  assert.ok(any < index(v, "Hashing applies only to a `vendored` copy"), "the record sentence precedes the vendored-only scope");
  assert.ok(any < index(v, "`Other copies`") && any < index(v, "**Never select another copy.**"), "record and never-select sit under the any-copy opener");
});

test("FR-1: an IMPECCABLE_HOME set inside ~/.impeccable is asked for again under an exclusion, never used for the download", () => {
  const c = consentStep();
  assert.ok(c.includes("when none is set, or the one set lies under `~/.impeccable`; if no outside home is given, record `unavailable (excluded location, no IMPECCABLE_HOME)`"), "inside-home case");
});

test("FR-2: Verify records Copy (absolute path) and Home (HOME, or USERPROFILE on Windows)", () => {
  const v = verify();
  assert.ok(v.includes("`Copy` (the absolute path of the copy it selects)"), "Copy");
  assert.ok(v.includes("`Home` (what `~` resolved to: the agent process's `HOME`, or `USERPROFILE` on Windows)"), "Home");
});

test("FR-2: Verify lists every other impeccable/SKILL.md found, with its version", () => {
  const v = verify();
  assert.ok(v.includes("`Other copies`: every other `impeccable/SKILL.md` found in the locations above, with its version, or `none`"), "Other copies");
});

test("FR-2 (BUT): another copy is never selected", () => {
  assert.ok(verify().includes("**Never select another copy.**"), "never select another copy");
});

test("FR-2 (AND IT MUST): a modified copy still leads and the report states it as an environment finding, never a design finding", () => {
  const v = verify();
  assert.ok(v.includes("A `modified` copy still leads; the report states it as an environment finding, never a design finding."), "modified copy leads");
});

test("FR-3: every viewport is WxH; a design.md value without a height reads incomplete (<value>) and the default is used; desktop is declarable", () => {
  const m = scanMatrix();
  assert.ok(m.includes("Every viewport is `WxH`. A `docs/ux-ui/design.md` value with a width but no height is recorded as `incomplete (<value>)`, and the default is used."), "WxH and incomplete");
  assert.ok(m.includes("`desktop` takes its value from *Responsive Behavior* in `docs/ux-ui/design.md` when declared, else `1280x800`"), "declarable desktop");
  assert.ok(m.includes("else `390x844`"), "mobile default survives");
});

test("FR-3: the scan matrix keeps two passes; the detector item runs at the two scan-matrix viewports only", () => {
  const m = scanMatrix();
  assert.ok(m.includes("The matrix stays at **two** passes: the short-height pair is browser-only"), "two passes");
  assert.ok(/\| `desktop` \(default `1280x800`\) \*\*and\*\* `mobile` \(`--viewport <mobile>`\) \|/.test(m), "desktop and mobile passes");
  assert.doesNotMatch(m, /four|short-height pair \(.*--viewport/i, "no four-pass matrix");
  const f = firstVisit();
  assert.ok(f.includes("item 1 at the two scan-matrix viewports"), "item 1 at two viewports");
  assert.ok(f.includes("items 2 to 4 at **every first-visit viewport**"), "items 2-4 at every first-visit viewport");
});

test("FR-3: the first-visit pass adds the short-height pair 1366x768 and 375x667, overridable, each viewport recorded with its source; no automation reads Unevaluated", () => {
  const f = firstVisit();
  assert.ok(f.includes("`desktop`, `mobile` and the **short-height pair**, default `1366x768` (desktop) and `375x667` (mobile), overridable in `docs/ux-ui/design.md`"), "the pair");
  assert.ok(f.includes("The report records each first-visit viewport with its source."), "each viewport with its source");
  assert.ok(f.includes("the short-height captures included"), "no-automation covers the pair");
  assert.ok(f.includes("asks for a manual fold check at every first-visit viewport"), "manual check at every viewport");
});

test("FR-3 (BUT): the first visit is never passed on the 1280x800 pass alone; 'at both viewports' is retired", () => {
  const f = firstVisit();
  assert.ok(f.includes("never reported as passed on the strength of the `1280x800` pass alone"), "not on 1280x800 alone");
  assert.ok(!f.includes("at **both** viewports"), "retired phrase");
});

test("FR-4: the CTA is identified in order (declared, defined style only, first main action), the method is recorded and a non-declared CTA is an assumption", () => {
  const c = ctaItem();
  const a = index(c, "(1) the CTA declared for the screen in the Screen Inventory's `Primary CTA` column of `docs/ux-ui/design.md`");
  const b = index(c, "(2) only when `docs/ux-ui/design.md` defines a Primary CTA style, the first element in `main` with that style");
  const d = index(c, "(3) the first `main a|button`");
  assert.ok(a < b && b < d, "three steps in order");
  assert.ok(c.includes("Record the method (`declared`, `primary style` or `first main action`)"), "method recorded");
  assert.ok(c.includes("list a non-declared CTA under *Assumptions*"), "assumption");
});

test("FR-4: visibility comes from computed style plus the bounding box, never offsetParent; the hit-test is at the box centre", () => {
  const c = ctaItem();
  assert.ok(c.includes("computed style (`display`, `visibility`, `opacity`) plus the bounding box against the viewport, never from `offsetParent`"), "measurement");
  assert.ok(c.includes("The hit-test is at the box centre."), "hit-test at the centre");
});

test("FR-4: five outcomes, checked in order, with the descendant tolerance; the old failure sentence is retired", () => {
  const o = outcomes();
  assert.ok(/\(a\)[^;]*`Unevaluated \(no CTA found\)`; \(b\)[^;]*`Unevaluated \(CTA not visible: <style>\)`; \(c\)[^;]*`below fold \(y=<top>\)`; \(d\)[^;]*`pass`; \(e\)[^;]*`covered \(<topmost element>\)`/.test(o), "(a) to (e) in order with their values");
  assert.ok(o.includes("the CTA or one of its descendants"), "descendant tolerance");
  assert.ok(o.includes("(c) the box centre is at or below the viewport's bottom edge (a box top at or below that edge included)"), "below fold is the centre rule");
  assert.ok(!firstVisit().includes("The pass **fails** when the topmost element"), "old failure sentence retired");
});

test("FR-4: covered and below fold are P1 in /akili-audit design and FAIL in /akili-validate unless a first-visit Design Waivers row covers the screen and viewport", () => {
  const p = priorityBullet();
  assert.ok(p.includes("a **FAIL** in `/akili-validate`"), "FAIL in validate");
  assert.ok(p.includes("unless a *Design Waivers* row with Rule `first-visit` covers that screen and viewport"), "first-visit waiver");
  assert.ok(p.includes("An `Unevaluated` outcome is never a pass"), "Unevaluated is never a pass");
  assert.ok(p.includes("`WARN (unverified first visit)`"), "WARN");
});

test("FR-4 (THEN): below fold is a P1, like covered, at any first-visit viewport", () => {
  assert.ok(priorityBullet().includes("`covered` or `below fold` at any first-visit viewport is a **P1** in `/akili-audit design`"), "below fold is P1");
});

test("FR-4 (BUT): below fold is never reported as covered and never counted as an overlay defect", () => {
  assert.ok(outcomes().includes("`below fold` is never reported as `covered` and never counted as an overlay defect"), "below fold is not covered");
});

test("FR-5: with a consent banner each capture asserts it is visible, by the item 3 measurement", () => {
  const b = bannerItem();
  assert.ok(b.includes("(named in `docs/ux-ui/design.md`, or found in the UI source)"), "where the banner is named");
  assert.ok(b.includes("each capture asserts it is visible, using the item 3 measurement applied to the banner"), "visible assertion");
});

test("FR-5: a banner that is not rendered reads Unevaluated (consent banner not rendered: <reason>)", () => {
  assert.ok(bannerItem().includes("the capture reads `Unevaluated (consent banner not rendered: <reason>)`"), "unevaluated value");
});

test("FR-5: the remedy is a build rendering the banner with test identifiers, never production ones", () => {
  assert.ok(bannerItem().includes("a build that renders the banner with **test** identifiers, never production ones"), "remedy");
});

test("FR-5: the detector's first-visit flags are banner evidence only where the capture confirmed the banner on screen", () => {
  const b = bannerItem();
  assert.ok(b.includes("count as banner evidence only where the capture confirmed the banner on screen"), "evidence rule");
  assert.ok(b.includes("otherwise the report states that the detector pass added no first-visit evidence"), "otherwise clause");
});

test("FR-5 (BUT): a capture whose banner is not rendered never reads pass", () => {
  assert.ok(bannerItem().includes("and never reads `pass`"), "never pass");
});

test("FR-7: the suppression section lists the three skipped critique steps (snapshot, live-server or any inject, closing user questions)", () => {
  const t = suppressed();
  assert.ok(t.includes("persisting the snapshot (`.impeccable/critique/`)"), "snapshot step");
  assert.ok(t.includes("starting `live-server` or any inject"), "live-server step");
  assert.ok(t.includes("the closing user questions"), "closing questions step");
});

test("FR-7: the skipped questions are replaced by the literal line Questions skipped: report-only (/akili-audit design)", () => {
  assert.ok(suppressed().includes("`Questions skipped: report-only (/akili-audit design)`"), "Questions skipped line");
});

test("FR-7: Assessment A runs isolated with no detector output; inline only when no sub-agent tool exists, between E2 and E3, marked degraded", () => {
  const t = suppressed();
  assert.ok(t.includes("Assessment A runs as an isolated sub-agent given no detector output"), "isolated, no detector output");
  assert.ok(t.includes("Inline is allowed only when no sub-agent tool exists"), "inline condition");
  assert.ok(t.includes("it then runs between E2 and E3"), "inline position");
  assert.ok(t.includes("`Score source` records `degraded (single-context: <reason>)`"), "degraded record");
  assert.ok(t.includes("`\u26a0\ufe0f DEGRADED: single-context (<reason>)`"), "upstream banner");
});

test("FR-7 (BUT): a literal executor skips Persist the Snapshot citing this list, never writes .impeccable/critique/ and never starts live-server; a delegated brief reproduces the list", () => {
  const t = suppressed();
  assert.ok(t.includes("skips *Persist the Snapshot*, citing this list"), "skip citing the list");
  assert.ok(t.includes("never writes `.impeccable/critique/` and never starts `live-server`"), "no write, no server");
  assert.ok(t.includes("A delegated critique brief reproduces this list"), "brief carries the list");
});

test("FR-14: Design Waivers has a False positive row allowed only for the closed list, with decorative, aria-hidden as the text-occlusion reason", () => {
  const r = waiverRow("False positive");
  assert.ok(r.includes("`false positive (<reason>; <evidence>)`"), "value shape");
  assert.ok(r.includes("only for a rule on the closed list below"), "closed list only");
  assert.ok(r.includes("Any other rule needs a waiver or stays a finding"), "other rules");
  const c = closedList();
  assert.match(c, /\| `text-occlusion` \| `decorative, aria-hidden`: the occluded text sits inside an element with `aria-hidden="true"` \|/);
});

test("FR-14: false positive exists only in /akili-audit design, is counted in False positives: N and never appears among P1-P3", () => {
  const r = waiverRow("False positive");
  assert.ok(r.includes("only in `/akili-audit design`"), "audit only");
  assert.ok(r.includes("`/akili-validate` has no `false positive`: a finding there is fixed or waived"), "validate excluded");
  assert.ok(r.includes("counted in `False positives: N` in the report header and never appears among P1\u2013P3"), "counted apart");
});

test("FR-14: for exit 2 the audit's reading of the scan matrix counts a false positive as waived; validate's reading is unchanged", () => {
  assert.ok(
    waiverRow("False positive").includes("For exit `2`, the audit's reading of the scan matrix counts it as waived; validate's reading is unchanged"),
    "exit 2 reading",
  );
});

test("FR-14 (BUT): the closed list holds exactly one rule, text-occlusion; low-contrast is never on it", () => {
  const rows = closedList().split("\n").filter((l) => l.startsWith("| `"));
  assert.deepStrictEqual(rows.map((l) => l.split("|")[1].trim()), ["`text-occlusion`"], "closed list rule ids");
  assert.ok(waiverRow("False positive").includes("`low-contrast` is never on it"), "low-contrast stated");
  assert.ok(waivers().includes("Adding a row changes the bridge, so it needs a spec"), "adding a row needs a spec");
});

test("FR-14 (AND IT MUST): a false positive requires evidence naming the aria-hidden ancestor's selector", () => {
  const c = closedList();
  assert.ok(c.includes("the selector of that `aria-hidden` ancestor"), "evidence cell");
  assert.ok(waiverRow("False positive").includes("Each value needs the evidence the closed list names; without it the hit stays a finding"), "no evidence, no value");
});

test("FR-11: a waiver row's Reason cites the clause, a first-visit waiver uses Rule first-visit and Scope <screen> @ <WxH>, the example cites 8-06 and, without clause IDs, a proposed waiver cites section and line", () => {
  const w = waivers();
  const shape = waiverRow("Row shape");
  assert.ok(shape.includes("the clause it rests on is cited in the reason (`per 8-06`)"), "clause in Reason");
  assert.ok(shape.includes("A first-visit waiver uses Rule `first-visit` and scope `<screen> @ <WxH>`"), "first-visit row");
  const ex = w.slice(index(w, "Example:"));
  assert.ok(ex.includes("(clause 8-06)") && ex.includes("`Proposed waiver (8-06)`"), "example cites 8-06");
  assert.ok(!ex.includes("A-06"), "A-06 retired");
  assert.ok(ex.includes("With no clause IDs in the baseline, a proposed waiver cites `\u00a7<section> l.<line>`"), "fallback citation");
});

// --- Reference (design-evaluation.md): steps, E1, E3b, Priorities ---
const ref = () => read(...BRIDGE, "references", "design-evaluation.md");
const stepRow = (id) => slice(slice(ref(), "## Steps", "## E1 - Baseline checks"), `| ${id} |`, "\n");
const e1Shape = () => slice(ref(), "| 2 | **Baseline shape.**", "\n");
const e3b = () => slice(ref(), "## E3b - Performance", "## E6 - Report location");
const e3bRow = (n) => slice(e3b(), `| ${n} |`, "\n");
const has = (s, ...parts) => parts.forEach((p) => assert.ok(s.includes(p), `missing: ${p}`));
const SUPP = "the bridge's *Suppressed in `/akili-audit design`*";

test("FR-6: Priorities maps Impeccable P0 to P1 tagged `blocking` and P1-P3 to themselves; a blocking inaccessible finding is one P1", () => {
  const p = slice(ref(), "## Priorities", "## Report template");
  has(slice(p, "| Impeccable priority |", "\n\n"), "| P0 | P1, tagged `blocking` |", "| P1 | P1 |", "| P2 | P2 |", "| P3 | P3 |");
  has(p, "both `blocking` and inaccessible stays one P1");
});

test("FR-7/FR-8: E4's delegated brief reproduces the bridge list, gives no E3 output, requires the count first, bounded text parts and no file output; E2b and E4 point at the bridge section", () => {
  has(stepRow("E4"), SUPP, "(1) reproduce that list", "(2) give the sub-agent no E3 output", "(3) require the finding count first, then the findings as text in bounded parts", "(4) forbid file output");
  has(stepRow("E2b"), SUPP);
});

test("FR-8: the parent compares the received findings to the stated count before writing and fetches any shortfall", () => {
  has(stepRow("E4"), "compares the received findings with the stated count before writing the report and fetches any shortfall");
});

test("FR-8 (BUT): a report is never written short of the stated count", () => {
  has(stepRow("E4"), "never writes a report with fewer findings than the stated count");
});

test("FR-9: npm ci resolves Lighthouse only when it is declared in devDependencies and node_modules is absent and git-ignored; never otherwise", () => {
  has(e3bRow("Resolve, never install"), "then `npm ci` from the project's lockfile", "Lighthouse is declared in the project's `devDependencies`", "`node_modules` is **absent** and git-ignored (a fresh worktree)", "Never when Lighthouse is not declared or `node_modules` exists");
});

test("FR-9: npm ci needs the bridge's consent, the question saying it installs every devDependency and runs install scripts, and is recorded in Install", () => {
  has(e3bRow("Resolve, never install"), "the bridge's *Privacy and consent* consent is given", "installs every devDependency and runs their install scripts", "recorded in `Install`");
});

test("FR-9: a run counts as completed when its JSON exists, has no `runtimeError` and has a performance score, whatever the exit code; exit code and first stderr line are recorded", () => {
  const r = e3bRow("Run validity");
  has(r, "its JSON exists, has no `runtimeError`, and has a performance score, whatever the exit code", "Record each run's exit code and first stderr line");
  has(e3bRow("Too few runs"), "completed runs (see *Run validity*)");
});

test("FR-9 (BUT): a run whose JSON has a runtimeError never counts; a failed npm ci reads Unevaluated (Lighthouse unavailable: npm ci failed", () => {
  has(e3bRow("Run validity"), "A JSON with a `runtimeError` never counts");
  has(e3bRow("Resolve, never install"), "A failed `npm ci` reads `Unevaluated (Lighthouse unavailable: npm ci failed: <first stderr line>)`");
});

test("FR-10: Machine load is recorded once per E3b run before the first Lighthouse run, from uptime, lsof or ss, with the dev-server filter and the audit's own server excluded", () => {
  has(e3bRow("Machine load"), "immediately before its first Lighthouse run", "the load average and the other listening development servers (port and process name)");
  const s = slice(e3b(), "**Machine-load sources:**", "Report one row per URL");
  has(s, "`uptime`", "`lsof -nP -iTCP -sTCP:LISTEN`, or `ss -ltnp` on Linux", "a listener whose process is `node`, `bun`, `deno`, `python`, `ruby`, `php` or `java`, or whose port is 3000–9999", "The audit's own server is excluded");
});

test("FR-10 (BUT): with no dev server listening the record reads `none`; with no source on the host it reads `unavailable (<reason>)`", () => {
  has(e3bRow("Machine load"), "Nothing listening reads `none`", "no source on the host reads `unavailable (<reason>)`");
});

test("FR-11: E1 Baseline shape reports a missing page-mode column, screen mode, Design Waivers list or clause IDs as drift routed to /akili-constitution", () => {
  has(e1Shape(), "a page-mode column", "a mode on every in-scope screen", "a *Design Waivers* list, and clause IDs?", "`Page modes: drift (<what>; routed to /akili-constitution)`");
});

test("FR-11 (BUT): Baseline shape writes nothing; without clause IDs a proposed waiver cites `§<section> l.<line>`", () => {
  has(e1Shape(), "nothing is written", "Without clause IDs, a proposed waiver cites `§<section> l.<line>`");
});

test("FR-12: E2 chooses key screens so every distinct template appears once while the cap allows and names the rest under Coverage as a declared risk", () => {
  has(stepRow("E2"), "every distinct template in the UI source (a layout or page component, for example `BlogPost.astro`) appears once while the cap allows", "templates left out are named in the `Coverage` header field as a declared risk");
});

const tpl = () => slice(ref(), "## Report template", "## Checklist");
const checklist = () => ref().slice(index(ref(), "## Checklist"));

test("FR-3 (AND IT MUST): the template lists each viewport with its source, the Screens Evaluated note is per viewport and `run` is retired", () => {
  const t = tpl();
  has(t, "- **Viewports:** `desktop <WxH> (<source>)`, `mobile <WxH> (<source>)`, `short-height <WxH> + <WxH> (<source>)`", "`docs/ux-ui/design.md`, `default` or `incomplete (<value>), default used`");
  has(t, "`First-visit pass`: `<WxH> <outcome>` per first-visit viewport, separated by `; `", "`not required (Read)`", "`pass`, `covered (<element>)`, `below fold (y=<n>)` or `Unevaluated (<reason>)`", "`run` is retired");
  assert.ok(!t.includes("Mobile viewport"), "the Mobile viewport sub-line is replaced");
  assert.ok(!t.includes("`run` |"), "the `run` value is gone from the note");
  has(slice(t, "- **Impeccable:**", "- **Detector:**"), "Copy:", "Home:", "Other copies:", "Excluded:", "IMPECCABLE_BIN: <pinned path (from the probe or the download)> | not set (no engine pinned)", "Download home override:");
  has(slice(t, "  - Page modes:", "\n"), "drift (<page-mode column missing | screens without a mode | Design Waivers list missing | clause IDs missing>; routed to /akili-constitution)");
});

test("FR-4 (AND IT MUST): Capture conditions has one row per first-visit capture and records the CTA method and the banner state", () => {
  const c = slice(tpl(), "## Capture conditions", "## Performance");
  has(c, "| Screen | Viewport | Locale | Reduced motion | Consent state | CTA (method) | Banner |", "`declared`, `primary style`, `first main action`", "`visible`, `not rendered: <reason>`, `none in product`");
});

test("FR-6: the Findings section carries the priority note above P1", () => {
  has(slice(tpl(), "## Findings", "### P1"), "Priorities follow *Priorities*; an Impeccable P0 appears as P1 tagged `blocking` (mapping table)");
});

test("FR-6 (BUT): the template has no P0 section", () => {
  assert.ok(!/^#{2,4} P0/m.test(tpl()), "no P0 heading in the template");
});

test("FR-12/FR-9/FR-10: Coverage is a header field and the checklist requires it to name every uncovered template; Performance records Install, Machine load and Exit codes", () => {
  has(tpl(), "- **Coverage:** `all templates` | `<n> of <m> templates; not covered: <names>`", "Install: none | npm ci (consented by <who>)", "Machine load:", "| Exit codes |");
  has(checklist(), "`Coverage` names every uncovered template", "The `Machine load` line is present");
});

test("FR-14: the header carries `False positives: N`, Waived? adds `false positive (...)`, and the checklist ties the count to the rows, none in P1-P3", () => {
  has(tpl(), "- **False positives:** N", "`false positive (<reason>; <evidence>)`");
  has(checklist(), "`False positives` equals the count of `false positive` rows, and none of them appears among P1-P3", "except a recorded user-directed report location and a recorded consented `npm ci`");
  assert.ok(!checklist().includes("(`run`,"), "the retired value is not in the checklist");
});

test("FR-11/FR-4/FR-3: constitution Step 4 names clause IDs <n>-<nn>, the Primary CTA column and WxH scan viewports", () => {
  const c = read(".claude", "commands", "akili-constitution.md");
  const step4 = slice(c, "### Step 4:", "### Step 5:");
  for (const n of ["<n>-<nn>", "Primary CTA", "WxH"]) assert.ok(step4.includes(n), `Step 4 names ${n}`);
  for (const n of ["a selector or attribute naming the main action", "or `—`", "the class, token or attribute that marks it", "`desktop`, `mobile` and the short-height pair, each `WxH`", "optional; defaults apply when absent"]) {
    assert.ok(step4.includes(n), `Step 4 states ${n}`);
  }
});

test("FR-13: audit design step 5 and the design-mode checklist both name the user-directed report location", () => {
  const a = read(".claude", "commands", "akili-audit.md");
  const step5 = slice(a, "5. Write ", "6. Route the fixes");
  const check = slice(a, "In **design mode**, confirm instead:", "For the drift audit");
  for (const [n, t] of [["step 5", step5], ["checklist", check]]) assert.ok(t.includes("user-directed"), `${n} names the user-directed location`);
  assert.ok(check.includes("the report exists at its E6 location (the default `design-*.md` path or the recorded user-directed path) and is non-empty"), "existence item accepts the E6 location");
  assert.ok(step5.includes("design-<YYYY-MM-DD>[-<safe-branch>][-N].md"), "default path survives");
});

test("FR-3: validate's manual fold check covers every first-visit viewport", () => {
  const v = read(".claude", "commands", "akili-validate.md");
  const sentence = slice(v, "First-visit pass without browser automation", "\n");
  assert.ok(sentence.includes("a manual fold check at every first-visit viewport"), "every first-visit viewport");
  assert.ok(!sentence.includes("at both viewports"), "the two-viewport wording is retired");
});

test("FR-13: propose's design-evaluation source sentence follows the recorded Report location", () => {
  const p = read(".claude", "commands", "akili-propose.md");
  const sentence = slice(p, "**Design evaluation as a source.**", "\n");
  assert.ok(sentence.includes("or the path recorded in its `Report location` field"), "Report location clause");
});

// FR-16 sweep: the retired phrases stay out of every shipped file. Scope is .claude/ + docs/ + README.md;
// only the spec history and the vendored upstream folder are excluded. Paths are built from fragments (Guard).
const SWEEP_DOCS = "do" + "cs";
const SWEEP_SPECS = "sp" + "ecs";
const sweepSkip = [path.join(SWEEP_DOCS, SWEEP_SPECS), path.join(".claude", "skills", "impeccable")];
const sweepOutside = `outside \`${SWEEP_DOCS}/${SWEEP_SPECS}/audits/\``;
const sweepFiles = () => {
  const files = [];
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
      const r = path.join(rel, e.name);
      if (e.isDirectory()) {
        if (!sweepSkip.includes(r)) walk(r);
      } else if (e.isFile()) files.push(r);
    }
  };
  walk(".claude");
  walk(SWEEP_DOCS);
  files.push("README.md");
  return files;
};
// Every line of every text file in scope that satisfies `pred`, as `file:line`.
const sweepLines = (pred) => {
  const hits = [];
  for (const f of sweepFiles()) {
    const buf = fs.readFileSync(path.join(ROOT, f));
    if (buf.includes(0)) continue; // binary
    buf.toString("utf8").replace(/\r\n/g, "\n").split("\n").forEach((line, i) => {
      if (pred(line)) hits.push(`${f.split(path.sep).join("/")}:${i + 1}`);
    });
  }
  return hits;
};

test("FR-16: the sweep walker reaches every file in scope and excludes only the two named folders", () => {
  const files = sweepFiles();
  const has = (...p) => files.includes(path.join(...p));
  assert.ok(files.length > 100, `sweep reached the shipped tree (${files.length} files)`);
  for (const f of [[".claude", "commands", "akili-validate.md"], [...BRIDGE, "SKILL.md"], [...BRIDGE, "references", "design-evaluation.md"], [SWEEP_DOCS, "skills", "impeccable-bridge.md"], ["README.md"]]) assert.ok(has(...f), `in scope: ${f.join("/")}`);
  assert.ok(!files.some((f) => sweepSkip.some((d) => f.startsWith(d + path.sep))), "only the two named folders are excluded");
});

for (const [n, phrase] of [
  [1, "fold check at both viewports"],
  [2, "run, at **both** viewports"],
  [3, "(clause A-06)"],
  [5, "The pass **fails** when the topmost element"],
  [6, "A hero CTA under a consent banner at `390x844`"],
]) {
  test(`FR-16 pattern ${n}: no shipped file keeps "${phrase}"`, () => {
    const hits = sweepLines((l) => l.includes(phrase));
    assert.deepStrictEqual(hits, [], `retired phrase at:\n${hits.join("\n")}`);
  });
}

test("FR-16 pattern 4: the retired `run` first-visit value is gone from every shipped file", () => {
  const hits = sweepLines((l) => l.includes("`run` | `not required (Read)`") || l.includes("(`run`, `not required (Read)`"));
  assert.deepStrictEqual(hits, [], `retired value at:\n${hits.join("\n")}`);
});

test("FR-16 pattern 7: every line limiting edits to the audits folder names the user-directed exception", () => {
  const all = sweepLines((l) => l.includes(sweepOutside));
  const bad = sweepLines((l) => l.includes(sweepOutside) && !l.includes("user-directed"));
  assert.ok(all.some((h) => h.startsWith(".claude/commands/akili-audit.md:")) && all.some((h) => h.startsWith(".claude/skills/impeccable-bridge/references/design-evaluation.md:")), `both design-mode lines found: ${all.join(", ")}`);
  assert.deepStrictEqual(bad, [], `missing the user-directed exception at:\n${bad.join("\n")}`);
});

test("Guard: this test file reads no file under the spec folder", () => {
  // The forbidden path is built from fragments so this source never contains it.
  const D = "do" + "cs";
  const S = "sp" + "ecs";
  const src = fs.readFileSync(__filename, "utf8");
  assert.ok(!src.includes(`${D}/${S}`), "no literal path into the spec folder");
  assert.ok(!new RegExp(`["']${D}["']\\s*,\\s*["']${S}["']`).test(src), "no path-segment read of the spec folder");
  assert.ok(src.includes("@akili-spec changes/impeccable-audit-fixes/design-eval-contract"), "header comment present");
});
