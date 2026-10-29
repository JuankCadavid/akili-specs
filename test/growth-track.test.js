"use strict";

// @akili-spec changes/growth-angles (T6, T7)
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

// FR-7: docs literals, anchored in the page that owns each.
const overview = read("docs/overview.md");
const flow = read("docs/flow.md");
const docsReadme = read("docs/README.md");
const readme = read("README.md");
const mktDoc = read("docs/commands/akili-marketing.md");
const skillDoc = read("docs/skills/social-marketing.md");

test("FR-7 the four overview/flow/README pages name the growth track", () => {
  const carriers = [
    ["docs/overview.md", overview, /^These run outside the per-spec loop\. .*growth track/m],
    ["docs/flow.md", flow, /^\*\*Growth track\.\*\*/m],
    ["docs/README.md", docsReadme, /^Anytime commands run outside the spec loop; .*growth track/m],
    ["README.md", readme, /^- Extras for .*growth track \(`\/akili-seo`, `\/akili-marketing`\)/m],
  ];
  for (const [name, text, re] of carriers) assert.match(text, re, `${name} must name the growth track on its carrier line`);
});

test("FR-7 overview: Any time sentence, glossary row and I-want-to row", () => {
  assert.match(block(overview, /^### Any time$/m), /form the \*\*growth track\*\*: a documentation grouping of two commands, not a command of its own/);
  assert.match(overview, /^\| Growth track \| The documentation grouping of `\/akili-seo` and `\/akili-marketing`; not a command\./m);
  assert.match(overview, /^\| Map content angles for a pillar \| `\/akili-marketing angles \[<pillar>\]` \|$/m);
});

test("FR-7 flow: 2c has seven modes, angles.md artifact row and the data-flow table", () => {
  const s2c = block(flow, /^### 2c\./m);
  assert.match(s2c, /Seven modes: /);
  assert.doesNotMatch(flow, /six modes/i);
  assert.match(s2c, /`angles` \(the map of customer angles per content pillar\)/);
  assert.match(s2c, /\*\*Growth track\.\*\*/);
  assert.match(s2c, /\| `\/akili-seo` report \| none \| No data flows from the SEO report into marketing or the baseline \|/);
  assert.match(s2c, /`post` records the approved angle ID\(s\) and an approach, and drafts with the one hook you pick of three/);
  assert.doesNotMatch(flow, /this spec/i);
  assert.match(s2c, /offered as proposed defaults that cite the file/);
  assert.match(flow, /^\| `docs\/marketing\/angles\.md` \| `\/akili-marketing` \|/m);
});

test("FR-7 command and skill pages document angles, selection and the method credit", () => {
  assert.match(mktDoc, /^\| `angles` \| `angles \[<pillar>\]` \| `angles\.md` \|$/m);
  assert.match(mktDoc, /lists the seven modes/);
  assert.match(mktDoc, /A `campaign` plan slot names an approved angle ID \(optionally a second, or `needs input`\), an approach out of five/);
  assert.match(mktDoc, /`post` records the approved angle ID\(s\) and an approach in its header, shows three hook candidates and drafts with the one you pick/);
  assert.doesNotMatch(mktDoc, /one of three hooks/);
  assert.match(mktDoc, /Nico Azero/);
  assert.match(mktDoc, /Así creo 6\.480 reels con Claude en 3h/);
  assert.match(skillDoc, /13 files: `SKILL\.md`, `LICENSE` and eleven files under/);
  assert.match(skillDoc, /^\| `angles` \| `angles-framework\.md`, /m);
  assert.match(skillDoc, /Nico Azero/);
});

test("FR-7 BUT README grows by at most 2 lines net versus 8991113", (t) => {
  const { spawnSync } = require("child_process");
  const r = spawnSync("git", ["diff", "--numstat", "8991113", "--", "README.md"], { cwd: path.join(__dirname, ".."), encoding: "utf8" });
  if (r.status !== 0) return t.skip("base commit 8991113 not in this clone (shallow checkout)");
  const [added = 0, deleted = 0] = r.stdout.trim().split(/\s+/).filter(Boolean).map(Number);
  assert.ok(added - deleted <= 2, `README net growth ${added - deleted} > 2`);
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
