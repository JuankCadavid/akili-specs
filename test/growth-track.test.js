"use strict";

// @akili-spec changes/growth-angles (T6)
//
// Text-contract guard for the growth track's /akili-constitution half (FR-5)
// and the NFR-6 leak check. Expected wording is written from the requirement,
// never read from the file under test, and each literal is anchored inside the
// Step that owns it. A missing file or step reads as "", so a red is always an
// assert mismatch, never an ENOENT.
//
// Mutation hook: GT_MUTATE_ROOT points the reader at a mutated copy.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const ROOT = process.env.GT_MUTATE_ROOT || path.join(__dirname, "..");

function read(rel) {
  try {
    return fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");
  } catch {
    return "";
  }
}

function block(text, startRe) {
  const m = text.match(startRe);
  if (!m) return "";
  const level = (m[0].match(/^#+/) || ["#"])[0].length;
  const rest = text.slice(m.index + m[0].length);
  const end = rest.search(new RegExp(`\\n(#{1,${level}} |---\\n)`));
  return end < 0 ? text.slice(m.index) : text.slice(m.index, m.index + m[0].length + end);
}

const cmd = read(".claude/commands/akili-constitution.md");
const step2 = block(cmd, /^### Step 2:/m);
const step3 = block(cmd, /^### Step 3:/m);

test("FR-5 Step 2 offers the filled brand voice foundations as cited defaults", () => {
  assert.match(step2, /docs\/marketing\/brand-voice\.md/);
  assert.match(step2, /`filled: yes`/);
  assert.match(step2, /foundations \(customer, offer, positioning\)/);
  assert.match(step2, /docs\/marketing\/angles\.md/);
  assert.match(step2, /validly `approved` per `\/akili-marketing` `## Invariants`/);
  assert.match(step2, /\*\*proposed defaults\*\* that cite the file/);
});

test("FR-5 Step 2: unconfirmed items land as Assumptions with the citation", () => {
  assert.match(step2, /does not confirm lands as an Assumption carrying that citation/);
});

test("FR-5 Step 2 BUT clause: filled: no, draft sections and posts are never a source", () => {
  assert.match(
    step2,
    /A `filled: no` brand voice, a `draft` pillar section and any post are never a source\./,
  );
});

test("FR-5 Step 3: optional Customer Objections & Beliefs after the nine, thin-seed rule", () => {
  assert.match(step3, /optional \*\*Customer Objections & Beliefs\*\* section/);
  assert.match(step3, /only from material the user supplied/);
  assert.match(step3, /omit it or write `none supplied`, never invent entries \(thin-seed rule\)/);
  const nine = step3.indexOf("9. Open Questions");
  assert.ok(nine >= 0 && step3.indexOf("Customer Objections & Beliefs") > nine, "optional line must follow item 9");
});

test("FR-5 Step 3: the required list stays nine numbered sections without the optional one", () => {
  const list = step3.slice(step3.indexOf("**Required PRD structure:**"), step3.indexOf("9. Open Questions") + 20);
  const items = list.split("\n").filter((l) => /^\d+\. /.test(l));
  assert.equal(items.length, 9);
  assert.doesNotMatch(items.join("\n"), /Objections/);
});

// NFR-6: needle built by concatenation so this file does not contain it.
test("NFR-6 no shipped file or test references the active spec path", () => {
  const needle = "docs/specs/changes/" + "growth-angles";
  const hits = [];
  const skip = new Set(["node_modules", ".git"]);
  function walk(dir, rel) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (skip.has(e.name)) continue;
      if (r === "docs/specs") continue;
      if (e.isDirectory()) walk(path.join(dir, e.name), r);
      else if (e.isFile()) {
        let t = "";
        try { t = fs.readFileSync(path.join(dir, e.name), "utf8"); } catch { continue; }
        if (t.includes(needle)) hits.push(r);
      }
    }
  }
  for (const top of [".claude", "docs", "test"]) {
    if (fs.existsSync(path.join(ROOT, top))) walk(path.join(ROOT, top), top);
  }
  if (fs.existsSync(path.join(ROOT, "README.md")) && fs.readFileSync(path.join(ROOT, "README.md"), "utf8").includes(needle)) hits.push("README.md");
  assert.deepEqual(hits, []);
});
