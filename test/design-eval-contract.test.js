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
  assert.match(c, /\| Home override \| Under an exclusion, the download call alone runs with `HOME` \(or `USERPROFILE`\) set to an empty directory inside `IMPECCABLE_HOME` \|/);
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
  assert.ok(c.includes("No other call changes it, and no call after the pin does."), "no other call, none after the pin");
  const l = launcherForm();
  assert.doesNotMatch(l, /\bHOME=|USERPROFILE=/, "the launcher form never sets a home variable");
});

test("FR-1 (AND IT MUST): the report records Excluded: and IMPECCABLE_BIN: (and the download home override)", () => {
  assert.ok(exclusion().includes("Record `Excluded: ~/.impeccable`"), "Excluded field");
  const c = consentStep();
  assert.ok(c.includes("`IMPECCABLE_BIN: <pinned path>`"), "IMPECCABLE_BIN field");
  assert.ok(c.includes("`Download home override: <variable>=<dir> (one call)`"), "Download home override field");
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

test("Guard: this test file reads no file under the spec folder", () => {
  // The forbidden path is built from fragments so this source never contains it.
  const D = "do" + "cs";
  const S = "sp" + "ecs";
  const src = fs.readFileSync(__filename, "utf8");
  assert.ok(!src.includes(`${D}/${S}`), "no literal path into the spec folder");
  assert.ok(!new RegExp(`["']${D}["']\\s*,\\s*["']${S}["']`).test(src), "no path-segment read of the spec folder");
  assert.ok(src.includes("@akili-spec changes/impeccable-audit-fixes/design-eval-contract"), "header comment present");
});
