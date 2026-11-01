"use strict";
// Tester coverage for the design-evaluation contract: clauses the author suite does not pin.
// Expected values are literals copied from the approved requirements at commit 3961990.
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
const slice = (s, from, to) => {
  const i = index(s, from);
  const j = s.indexOf(to, i + from.length);
  assert.ok(j > i, `missing end marker after "${from}": ${to}`);
  return s.slice(i, j);
};
const has = (s, ...parts) => parts.forEach((p) => assert.ok(s.includes(p), `missing: ${p}`));

const bridge = () => read(...BRIDGE, "SKILL.md");
const firstVisit = () => slice(bridge(), "### First-visit pass", "### Exit codes");
const ref = () => read(...BRIDGE, "references", "design-evaluation.md");
const e6 = () => slice(ref(), "## E6 - Report location", "## Priorities");
const tplHeader = () => slice(ref(), "## Report template", "## Executive Summary");

test("FR-3: without browser automation every first-visit viewport reads Unevaluated (no browser automation)", () => {
  has(slice(firstVisit(), "- **Without browser automation:**", "\n"), "read `Unevaluated (no browser automation)` at every first-visit viewport");
});

test("FR-4: a CTA hidden by computed style or with a zero-size box reads Unevaluated (CTA not visible: <style>)", () => {
  has(firstVisit(), "(b) computed style hides it, or its box has zero size: `Unevaluated (CTA not visible: <style>)`");
});

test("FR-12: E2 adds screens beyond the template-covering set only on request", () => {
  has(slice(ref(), "| E2 |", "\n"), "More screens only on request.");
});

test("FR-13 (THEN): a user-directed path is recorded as `<path> (directed by <who>)` in E6 and in the template header", () => {
  has(slice(e6(), "| User-directed |", "\n"), "`<path> (directed by <who>)`");
  has(tplHeader(), "- **Report location:** default | <path> (directed by <who>)");
});

test("FR-13 (BUT): a user-directed path replaces the default and the report is written once, with no copy under the audits folder", () => {
  has(e6(), "A user-directed path replaces the default; the report is written once, at that path. Either way nothing else is written.");
});

test("FR-16: the CHANGELOG Unreleased entry counts 14 audit gaps and hands the installer item to a separate change", () => {
  const c = read("CHANGELOG.md");
  // Stays true after the release script moves [Unreleased] into the dated 2.41.0 section.
  const u = slice(c, (c.includes("\n## [2.41.0] - ") ? "## [2.41.0] - " : "## [Unreleased]"), "\n## [");
  has(u, "address 14 gaps found in the first `/akili-audit design` run on 2.40.0", "The installer item from the same audit is handled by the install and doctor entry below.", "The vendored `impeccable/` skill is untouched.");
});

test("FR-16: the impeccable-bridge doc restates the verified skill source, the first-visit viewports, outcomes, priority, banner and false-positive rules", () => {
  const d = read("docs", "skills", "impeccable-bridge.md");
  has(slice(d, "| Skill source |", "\n"), "`vendored (<version>, verified or modified)`");
  const g = slice(d, "## Detector Gate", "## Existing-Product Evaluation");
  has(
    g,
    "the detector scan at the two scan-matrix viewports",
    "at every first-visit viewport: `desktop`, `mobile` and the short-height pair",
    "Each capture reads `pass`, `covered`, `below fold` or `Unevaluated`",
    "`covered` and `below fold` are a P1 in `/akili-audit design` and a FAIL in `/akili-validate`, unless a `first-visit` waiver covers that screen and viewport",
    "A consent banner that is not rendered turns only a would-be `pass` into `Unevaluated`; `covered` and `below fold` stand",
    "allowed only for a rule on its closed list and only in `/akili-audit design`",
    "*Suppressed in `/akili-audit design`* lists the three Impeccable `critique` steps",
  );
  has(slice(d, "## Existing-Product Evaluation", "## Optional upstream routes"), ", or a user-directed path,");
});

test("FR-16: the /akili-audit doc restates the user-directed report path", () => {
  has(slice(read("docs", "commands", "akili-audit.md"), "`design` mode evaluates", "\n"), ", or the user-directed path,");
});

test("NFR-3: nothing downloads or installs without an explicit yes in every approval mode", () => {
  const b = bridge();
  has(slice(b, "**Consent is never implied.**", "\n"), "Nothing downloads or installs the engine, Lighthouse or a browser without an explicit yes, in every approval mode.");
  has(slice(b, "## Privacy and consent", "\n## "), "needs explicit consent in every approval mode");
});

test("Guard: this file reads nothing under the spec folder and cites no spec path", () => {
  const D = "do" + "cs";
  const S = "sp" + "ecs";
  const src = fs.readFileSync(__filename, "utf8");
  assert.ok(!src.includes(`${D}/${S}`), "no literal path into the spec folder");
  assert.ok(!new RegExp(`["']${D}["']\\s*,\\s*["']${S}["']`).test(src), "no path-segment read of the spec folder");
  assert.ok(!src.includes("impeccable-audit" + "-fixes/"), "no spec path cited");
});
