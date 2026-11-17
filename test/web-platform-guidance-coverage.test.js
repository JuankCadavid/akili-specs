"use strict";

// @akili-spec changes/modern-web-guidance — Tester gap coverage (/akili-test).
// Clauses of FR-4, FR-5, FR-6 and FR-8 that test/modern-web-guidance.test.js does not assert,
// read from the SHIPPED rules file by heading, never from the spec folder. Expected values are
// literals copied from requirements.md at da5b57f.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const RULES = path.join(__dirname, "..", ".claude", "skills", "impeccable-bridge", "references", "modern-web.md");
const rules = () => fs.readFileSync(RULES, "utf8").replace(/\r\n/g, "\n");

// Text under a `## ` heading, up to the next `## ` heading; fails when the heading is absent.
function section(heading) {
  const lines = rules().split("\n");
  const start = lines.findIndex((l) => l.trim() === heading);
  assert.ok(start >= 0, `expected heading "${heading}" in modern-web.md`);
  const end = lines.findIndex((l, i) => i > start && /^## /.test(l));
  return lines.slice(start + 1, end < 0 ? lines.length : end).join("\n");
}
function row(sec, cell) {
  const found = sec.split("\n").find((l) => l.startsWith(`| ${cell} |`));
  assert.ok(found, `expected a table row starting "| ${cell} |"`);
  return found;
}

test("FR-6 Trigger containment: MWG's 'MANDATORY: Execute FIRST' description never triggers it off a web UI route", () => {
  const r = row(section("## Role"), "MWG's own description says to run it first (\"MANDATORY: Execute FIRST\")");
  assert.match(r, /Ignored for any step that is not on a web UI route; that description never triggers it/);
});

test("FR-4 Gate outcomes: each state's condition (plugin-namespaced skill, Node major < 22, consent Yes -> ready, no answer -> declined)", () => {
  const gate = section("## Gate");
  assert.match(row(gate, "`missing`"), /standalone or plugin-namespaced/);
  assert.match(row(gate, "`node < 22`"), /absent or major < 22/);
  assert.match(row(gate, "`consent needed`"), /Yes: `ready`\. No, or no answer: `declined`/);
  assert.match(row(gate, "`ready`"), /All three checks pass/);
  assert.match(gate, /Probe order: skill, then Node, then consent/);
});

test("FR-4 Gate outcomes: consent asked once per session; install routes printed once per session by `missing` only", () => {
  const gate = section("## Gate");
  assert.match(gate, /\*\*The consent question\*\* is asked once per session/);
  assert.match(row(gate, "`missing`"), /Print \*Install routes\* once per session; continue/);
});

test("FR-4 Gate outcomes: `call failed` retries once with the documented remedy before it reports and continues", () => {
  const r = row(section("## Gate"), "`call failed`");
  const retry = r.indexOf("Retry once:");
  assert.ok(retry >= 0, "call failed retries once");
  assert.match(r, /`NPM_CONFIG_CACHE=<writable temp dir>` when the cache is read-only, `npx --offline` when offline/);
  assert.ok(retry < r.indexOf("Then report and continue"), "the retry comes before the report");
});

test("FR-4 AND / BUT: no call before ready, nothing installed without consent; every non-ready state finishes with Impeccable or its fallback", () => {
  const gate = section("## Gate");
  assert.match(gate, /No MWG call is made before `ready`, and nothing is installed without consent\./);
  assert.match(gate, /Every state except `ready` lets the step finish with Impeccable \(or its fallback\) and the stack skills/);
});

test("FR-5 Default pin AND: the AKILI default changes only through a spec", () => {
  assert.match(row(section("## Pin"), "AKILI default"), /`1\.0\.1`\. It changes only through a spec/);
});

test("FR-6 Disclosure THEN: the disclosure holds the guide ids, what each changed, or why none applied", () => {
  assert.match(section("## Disclosure"), /the guide ids, what each one changed, or why none applied/);
});

test("FR-8 Scan runs: the gate precedes legacy-scan, and the report states pin, path, gate state, kept and dropped counts", () => {
  const sec = section("## Audit scan");
  const gate = sec.indexOf("3. **Gate.**");
  assert.ok(gate >= 0 && gate < sec.indexOf("4. Run `legacy-scan"), "gate step before the scan step");
  assert.match(sec, /`not applicable — no web UI source` and end/);
  assert.match(sec, /The report holds the pin and its source, the path, the gate state, the kept and dropped counts/);
});
