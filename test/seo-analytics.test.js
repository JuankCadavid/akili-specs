"use strict";

// @akili-spec changes/seo-analytics (T1: references/analytics.md group)
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
