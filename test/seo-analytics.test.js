"use strict";

// @akili-spec changes/seo-analytics (T1: references/analytics.md group; T2: command part A group)
//
// Text-contract guard for the optional analytics phase of `/akili-seo`. This
// group pins `.claude/skills/seo-audit/references/analytics.md`. Expected
// wordings are literals copied from requirements.md at spec commit 3cc14a8
// (FR-4, FR-11, FR-13, NFR-4) and design.md section 5.2 / 9.1 -- never read
// from the file under test. Nothing here reads docs/specs/ at runtime.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf8").replace(/\r\n/g, "\n");
}

// `## Heading` up to the next `## ` heading (or end of file).
function section(text, heading) {
  const start = text.indexOf(`\n## ${heading}\n`);
  assert.ok(start >= 0, `section "## ${heading}" not found`);
  const rest = text.slice(start + 1);
  const end = rest.slice(3).search(/\n## /);
  return end < 0 ? rest : rest.slice(0, end + 3);
}

const REF = read(".claude/skills/seo-audit/references/analytics.md");
const REF_RULE = section(REF, "2. The hard rule");
const REF_INSTALL = section(REF, "5. Installation checklist");
const REF_SOURCES = section(REF, "9. Sources");

// ---------------------------------------------------------------- FR-11 (reference half)

test("FR-11 (a) reference section 2: never claim a behavior metric affects Google or Bing ranking", () => {
  assert.match(REF_RULE, /never claim[^.\n]*\baffects? Google or Bing ranking/i,
    "reference section 2 lost the prohibition (a): never claim they affect Google or Bing ranking");
});

test("FR-11 (b) reference section 2: behavior metrics are used for conversion and UX findings", () => {
  assert.match(REF_RULE, /\buse[^.\n]*for conversion and UX findings/i,
    "reference section 2 lost the positive use (b): conversion and UX findings");
});

// Glossary behavior metrics (requirements.md section 3), as the words a reader looks for.
const METRIC_TERMS = ["bounce", "engagement rate", "session duration", "scroll", "heatmap", "recording", "rage click", "dead click"];
for (const term of METRIC_TERMS) {
  test(`FR-11 metric coverage reference section 2 names "${term}"`, () => {
    assert.ok(REF_RULE.toLowerCase().includes(term), `reference section 2 no longer names the behavior metric "${term}"`);
  });
}

// ---------------------------------------------------------------- FR-4 (reference half)

test("FR-4 reference states this is not legal advice", () => {
  assert.match(REF_INSTALL, /not legal advice/i, "reference section 5 lost the not-legal-advice statement");
});

test("FR-4 reference carries the line `Other jurisdictions: not audited`", () => {
  assert.ok(REF_INSTALL.includes("Other jurisdictions: not audited"), "reference section 5 lost the line `Other jurisdictions: not audited`");
});

test("FR-4 reference cites Ley 1581 Art. 3, Art. 9 and Art. 12", () => {
  assert.match(REF_INSTALL, /Ley 1581 Art\. 3\b/, "reference section 5 does not cite Ley 1581 Art. 3");
  assert.match(REF_INSTALL, /Ley 1581 Art\. 9\b/, "reference section 5 does not cite Ley 1581 Art. 9");
  assert.match(REF_INSTALL, /Ley 1581 Art\. 12\b/, "reference section 5 does not cite Ley 1581 Art. 12");
});

test("FR-4 reference names the four Consent Mode parameters", () => {
  for (const p of ["ad_storage", "analytics_storage", "ad_user_data", "ad_personalization"]) {
    assert.ok(REF_INSTALL.includes(p), `reference section 5 does not name the Consent Mode parameter ${p}`);
  }
});

test("FR-4 reference qualifies Ley 1581 as applying where processing involves datos personales (Art. 3(c))", () => {
  assert.match(REF_INSTALL, /where the (?:analytics )?processing involves datos personales \(Art\. 3\(c\)\)/,
    "reference section 5 lost the datos personales qualifier on Ley 1581");
});

// ---------------------------------------------------------------- FR-13 (reference half)

test("FR-13 reference: the Clarity token never reaches the report, and no user-level data is read", () => {
  assert.match(REF, /Clarity token, the service-account key file contents and any OAuth credential[^.\n]*never[^.\n]*report/i,
    "reference lost the rule that the Clarity token, the service-account key file contents and any OAuth credential never reach the report");
  assert.match(REF, /Clarity token[^.\n]*never[^.\n]*report/i, "reference lost the rule that the Clarity token never appears in the report");
  assert.ok(REF.includes("no user IDs, client IDs, IP addresses, session-recording URLs or raw event payloads"),
    "reference lost the user-level data prohibition");
});

// ---------------------------------------------------------------- NFR-4

test("NFR-4 reference Sources: every source line carries a tier and a checked date", () => {
  const lines = REF_SOURCES.split("\n").filter((l) => l.startsWith("- "));
  assert.ok(lines.length >= 8, `reference Sources lists ${lines.length} sources; the contract is at least 8 (an empty section must not pass)`);
  for (const l of lines) {
    assert.match(l, /\[PRIMARY\]|\[INDUSTRY\]/, `Sources line has no tier: ${l.slice(0, 120)}`);
    assert.match(l, /checked 20/, `Sources line has no checked date: ${l.slice(0, 120)}`);
  }
});

// ================================================================ T2: command part A
//
// Pins `.claude/commands/akili-seo.md` (Phase 0, Prerequisites, Step 2.8, Phase 2B).
// Blocks are cut by heading so a clause deleted in one place cannot be masked by
// the same words elsewhere in the file. Literals are copied from requirements.md
// (FR-1..FR-13) and design.md section 5.2; none is read from the file under test.

const COMMAND = read(".claude/commands/akili-seo.md");

// From the heading line that starts with `prefix` (e.g. "### Phase 2B") up to the
// next heading of the same or a higher level (or end of file).
function block(text, prefix) {
  const start = text.indexOf(`\n${prefix}`);
  assert.ok(start >= 0, `command heading "${prefix}" not found`);
  const level = prefix.match(/^#+/)[0].length;
  const rest = text.slice(start + 1);
  const next = rest.slice(1).search(new RegExp(`\\n#{1,${level}} `));
  return next < 0 ? rest : rest.slice(0, next + 1);
}

const P0 = () => block(COMMAND, "### Phase 0");
const PREREQ = () => block(COMMAND, "## Prerequisites");
const STEP28 = () => block(COMMAND, "#### Step 2.8");
const P2B = () => block(COMMAND, "### Phase 2B");

// ---------------------------------------------------------------- FR-1

test("FR-1 Phase 0 records the declined state `Analytics: not run — declined at Phase 0`", () => {
  assert.ok(P0().includes("Analytics: not run \u2014 declined at Phase 0"),
    "Phase 0 lost the declined state string `Analytics: not run \u2014 declined at Phase 0`");
});

test("FR-1 Phase 0 asks the analytics question once", () => {
  assert.match(P0(), /asked once/i, "Phase 0 lost the statement that the analytics question is asked once");
});

test("FR-1 Phase 2B sits after Step 2.8 and before Phase 3 (by heading position)", () => {
  const at = (re) => COMMAND.search(re);
  const s28 = at(/^#### Step 2\.8\b/m);
  const p2b = at(/^### Phase 2B\b/m);
  const p3 = at(/^### Phase 3\b/m);
  assert.ok(s28 >= 0 && p2b >= 0 && p3 >= 0, `heading missing: Step 2.8 at ${s28}, Phase 2B at ${p2b}, Phase 3 at ${p3}`);
  assert.ok(s28 < p2b && p2b < p3, `Phase 2B heading is not between Step 2.8 (${s28}) and Phase 3 (${p3}): at ${p2b}`);
});

test("FR-1 the Prerequisites stop applies to items 1-5 only, so analytics never blocks the classic audit", () => {
  const pre = PREREQ();
  assert.match(pre, /If any of prerequisites 1\u20135 is missing, stop/,
    "Prerequisites no longer scope the stop to items 1\u20135");
  assert.ok(!pre.includes("If any prerequisite is missing, stop"), "Prerequisites still carry the unscoped stop");
});

// ---------------------------------------------------------------- FR-2

test("FR-2 Phase 2B never reports a tool absent from a static fetch alone", () => {
  assert.match(P2B(), /never report[^.\n]*(?:absent|not installed)[^.\n]*from a static fetch alone/i,
    "Phase 2B lost the rule: never report a tool absent from a static fetch alone");
});

test("FR-2 Phase 2B states the `obtain:` suffix for a skipped data audit", () => {
  assert.ok(P2B().includes("data audit skipped \u2014 <missing prerequisite>; obtain: <action>"),
    "Phase 2B lost the skip state `<Tool>: data audit skipped \u2014 <missing prerequisite>; obtain: <action>`");
});

// ---------------------------------------------------------------- FR-3

test("FR-3 Phase 2B checks measurement-ID consistency with the audited property", () => {
  assert.match(P2B(), /measurement ID[^.\n]*(?:consisten|match)/i, "Phase 2B lost the measurement-ID consistency check");
});

test("FR-3 Phase 2B never states a millisecond or score impact without a measurement from this run", () => {
  assert.match(P2B(), /never state a millisecond or score impact[^.\n]*measurement[^.\n]*this run/i,
    "Phase 2B lost the rule: no millisecond or score impact without a measurement taken in this run");
});

// ---------------------------------------------------------------- FR-4

test("FR-4 Phase 2B says the consent checks are compliance signals, not legal advice", () => {
  assert.match(P2B(), /not legal advice/i, "Phase 2B lost the not-legal-advice statement");
});

test("FR-4 Phase 2B carries the line `Other jurisdictions: not audited`", () => {
  assert.ok(P2B().includes("Other jurisdictions: not audited"), "Phase 2B lost the line `Other jurisdictions: not audited`");
});

// ---------------------------------------------------------------- FR-5

test("FR-5 Phase 2B intercepts the WhatsApp click before the external navigation and submits no real form", () => {
  const b = P2B();
  assert.match(b, /intercept[^.\n]*before[^.\n]*navigation/i, "Phase 2B lost the click interception before the external navigation");
  assert.match(b, /never submit a (?:real )?form/i, "Phase 2B lost the prohibition on submitting a real form");
});

test("FR-5 Phase 2B discloses the test traffic the audit generates", () => {
  assert.match(P2B(), /test-traffic disclosure/i, "Phase 2B lost the test-traffic disclosure");
});

// ---------------------------------------------------------------- FR-6

test("FR-6 Phase 2B calls no Admin API Search Console link resource", () => {
  assert.match(P2B(), /No Admin API Search Console link resource exists/,
    "Phase 2B lost the statement that no Admin API Search Console link resource exists");
});

test("FR-6 Phase 2B probes the link with a Data API Search Console metric, owner confirmation second", () => {
  assert.match(P2B(), /Data API[^.\n]*Search Console metric[^.\n]*owner confirmation[^.\n]*not determined/,
    "Phase 2B lost the probe order: Data API Search Console metric, owner confirmation, `not determined`");
});

test("FR-6 Phase 2B records which evidence settled the link state", () => {
  const b = P2B();
  assert.ok(b.includes("linked (Data API probe)"), "Phase 2B lost the evidence suffix `linked (Data API probe)`");
  assert.ok(b.includes("not linked (owner-confirmed)"), "Phase 2B lost the evidence suffix `not linked (owner-confirmed)`");
});

// ---------------------------------------------------------------- FR-8

test("FR-8 Phase 2B carries the skip note `Analytics: skipped — no GA4 or Clarity detected`", () => {
  assert.ok(P2B().includes("Analytics: skipped \u2014 no GA4 or Clarity detected"),
    "Phase 2B lost the skip note `Analytics: skipped \u2014 no GA4 or Clarity detected`");
});

test("FR-8 Phase 2B raises exactly one Low finding, and only when a conversion action exists", () => {
  assert.match(P2B(), /exactly one[^.\n]*\bLow\b/i, "Phase 2B lost the rule: exactly one Low finding for no analytics");
});

// ---------------------------------------------------------------- FR-13

test("FR-13 Phase 2B keeps the Clarity token out of the report and reads no user-level data", () => {
  const b = P2B();
  assert.match(b, /Clarity token[^.\n]*(?:request headers?)[^.\n]*never[^.\n]*report/i,
    "Phase 2B lost the rule: the Clarity token is used only in request headers and never written to the report");
  assert.ok(b.includes("no user IDs, client IDs, IP addresses, session-recording URLs or raw event payloads"),
    "Phase 2B lost the user-level data prohibition");
});

// ---------------------------------------------------------------- FR-11 (command surfaces)

test("FR-11 (a) command Step 2.8: no finding asserts a behavior metric affects rankings", () => {
  assert.match(STEP28(), /asserts a behavior metric[^.\n]*affects? rankings?/i,
    "command Step 2.8 lost the prohibition (a): no finding asserts a behavior metric affects rankings");
});

test("FR-11 (b) command Step 2.8: behavior metrics serve conversion and UX findings", () => {
  assert.match(STEP28(), /serve conversion and UX findings/i,
    "command Step 2.8 lost the positive use (b): conversion and UX findings");
});

test("FR-11 (a) command Phase 2B: never claim a behavior metric affects Google or Bing ranking", () => {
  assert.match(P2B(), /never claim[^.\n]*\baffects? Google or Bing ranking/i,
    "command Phase 2B lost the prohibition (a): never claim they affect Google or Bing ranking");
});

test("FR-11 (b) command Phase 2B: behavior metrics are used for conversion and UX findings", () => {
  assert.match(P2B(), /\buse[^.\n]*for conversion and UX findings/i,
    "command Phase 2B lost the positive use (b): conversion and UX findings");
});

// ---------------------------------------------------------------- NFR-2, NFR-6

test("NFR-2 the command stays at or under 440 lines", () => {
  const lines = COMMAND.replace(/\n$/, "").split("\n").length;
  assert.ok(lines <= 440, `command is ${lines} lines; NFR-2 caps it at 440`);
});

test("NFR-6 Prerequisites start the Analytics MCP without --allow-write", () => {
  assert.match(PREREQ(), /without `--allow-write`/, "Prerequisites lost the rule: start the Analytics MCP without `--allow-write`");
});
