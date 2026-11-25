"use strict";
// @akili-spec changes/java-springboot-skill — readers S7 (akili-review) and S8 (akili-security).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8").replace(/\r\n/g, "\n");
const TABLE = () => read(".claude", "skills", "software-architect", "references", "stack-detection.md");
const CMD = (n) => read(".claude", "commands", `akili-${n}.md`);
const step2 = (s, heading) => {
  const i = s.indexOf(heading);
  assert.ok(i >= 0, `missing ${heading}`);
  const rest = s.slice(i + heading.length);
  const n = rest.search(/^### Step 3/m);
  return n < 0 ? rest : rest.slice(0, n);
};
const reviewS2 = () => step2(CMD("review"), "### Step 2: Lenses");
const securityS2 = () => step2(CMD("security"), "### Step 2: Run the Audit");

const forbiddenMarkers = () => {
  const f = new Set(["org.springframework.boot", "react-dom", "AWS::Serverless-2016-10-31", "libs.versions.toml", "spring-boot-starter"]);
  const sec = TABLE().split(/^## Rows$/m)[1].split(/^## /m)[0];
  for (const line of sec.split("\n").filter((l) => l.startsWith("|"))) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 5) continue;
    for (const m of cells[2].matchAll(/`([^`]+)`/g)) {
      const t = m[1];
      if (/^(file present|provider\.name: aws|style|aliases)$/.test(t) || t.startsWith("$")) continue;
      if (/[@.:\/-]/.test(t)) f.add(t);
    }
  }
  return f;
};
const addendum = (s) => {
  const m = /\*\*Brief addendum\.\*\*[^\n]*\n\n((?:> [^\n]*\n?)+)/.exec(s);
  assert.ok(m, "addendum block present");
  return m[1];
};
const head = (f) => execFileSync("git", ["show", `HEAD:${f}`], { cwd: ROOT, encoding: "utf8" }).replace(/\r\n/g, "\n");

const P = "@akili-spec changes/java-springboot-skill FR-5:";

test(`${P} S7 review lens brief names the table and the base tree`, () => {
  const b = reviewS2();
  assert.ok(b.includes("stack-detection.md"), "names the table");
  assert.match(b, /software-architect/);
  assert.match(b, /\*\*base\*\* tree/);
  assert.match(b, /local review mode/);
  assert.match(b, /CI review mode/);
});

test(`${P} S7 stack skills are idiom references only, nothing is run`, () => {
  assert.match(reviewS2(), /idiom references only[^\n]*nothing[^\n]*\brun\b/i);
});

test(`${P} S7 trust boundary: the skills named come from the installed package, never from the diff`, () => {
  assert.match(reviewS2(), /installed package[^\n]*never from the diff/);
});

test(`${P} S7 maps a file to the nearest manifest among its ancestor directories`, () => {
  assert.match(reviewS2(), /nearest manifest[^\n]*ancestor director/i);
});

test(`${P} S7 head-only manifest is named and not used for stack selection`, () => {
  assert.match(reviewS2(), /new manifest, not used for stack selection/);
});

test(`${P} S7 no-match and absent-table outcomes are stated`, () => {
  const b = reviewS2();
  assert.match(b, /no match[^\n]*(no stack line|project conventions)/i);
  assert.match(b, /table is absent[^\n]*(as before|as today)[^\n]*once/i);
});

test(`${P} S7 BUT clause: a stack skill never changes scope, threshold or verdict rules`, () => {
  const b = reviewS2();
  assert.match(b, /never changes a lens's scope, threshold or verdict rules/);
});

test(`${P} S8 security brief carries stacks after Run, under default-mode read rules`, () => {
  const b = securityS2();
  assert.ok(b.includes("stack-detection.md"), "names the table");
  assert.match(b, /after \*\*Run\*\*/i);
  assert.match(b, /manifest paths/);
  assert.match(b, /default mode/i);
  assert.match(b, /no git command before \*\*Run\*\*/i);
});

test(`${P} S8 no-match and absent-table outcomes are stated`, () => {
  const b = securityS2();
  assert.match(b, /no match[^\n]*(no stack|nothing)/i);
  assert.match(b, /table is absent[^\n]*(as before|as today)[^\n]*once/i);
});

test(`${P} S8 states the not-read line and the unconfirmed Java outcome without asking the user`, () => {
  const b = securityS2();
  assert.match(b, /not read: <path> \(<reason>\)/);
  assert.match(b, /unconfirmed — no Spring marker found/);
  assert.match(b, /never asked of the user[^\n]*delegated/i);
});

test(`${P} S8 BUT clauses: never narrows the audit scope; no vendored security-audit file edited`, () => {
  const b = securityS2();
  assert.match(b, /never narrows the audit scope/);
  assert.match(b, /no vendored `security-audit` file is edited/);
});

test(`${P} neither command restates a table marker or cites a line number`, () => {
  for (const [n, s] of [["review", reviewS2()], ["security", securityS2()]]) {
    for (const m of forbiddenMarkers()) assert.ok(!s.includes(m), `${n} restates marker: ${m}`);
    assert.ok(!/\bline \d+|\blines \d+|:\d+\b/.test(s.replace(/\d{2}:\d{2}/g, "")), `${n} cites a line number`);
  }
});

test(`${P} the verbatim brief addenda are byte-unchanged vs HEAD`, () => {
  for (const n of ["review", "security"]) {
    const f = `.claude/commands/akili-${n}.md`;
    assert.equal(addendum(read(f)), addendum(head(f)), `${n} addendum changed`);
  }
});

test(`${P} docs mention the stack context`, () => {
  for (const n of ["review", "security"]) assert.match(read("docs", "commands", `akili-${n}.md`), /stack-detection|stack context/i, n);
});
