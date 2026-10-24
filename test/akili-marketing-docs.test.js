"use strict";

// @akili-spec changes/akili-marketing (Tester, static docs/governance suite)
//
// FR-12 (governance, docs, counts, CHANGELOG) and NFR-6 (heuristics are dated
// and labelled). Expected anchors are literals copied from requirements.md and
// the docs at eb35099; this file never reads docs/specs/ at runtime.
//
// Mutation hook: AMD_MUTATE_ROOT points every read at a mutated copy of the
// tree, so each assertion can be shown to fail when the thing it guards is
// removed. The npm pack file list is always taken from the real repo; its
// entries are then read from ROOT.
//
// Reads return "" for a missing path so a missing file fails an assertion
// instead of throwing ENOENT.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..");
const ROOT = process.env.AMD_MUTATE_ROOT || REPO_ROOT;

function read(rel) {
  try {
    return fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");
  } catch (_) {
    return "";
  }
}

// Body of the first heading matching `re`, up to the next heading of the same or higher level.
function section(text, re) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => re.test(l));
  if (start < 0) return "";
  const level = /^#+/.exec(lines[start])[0].length;
  const end = lines.findIndex((l, i) => i > start && /^#+ /.test(l) && /^#+/.exec(l)[0].length <= level);
  return lines.slice(start + 1, end < 0 ? undefined : end).join("\n");
}

function hasLine(text, literal) {
  return text.split("\n").some((l) => l.includes(literal));
}

test("@akili-spec changes/akili-marketing FR-12: command and skill doc pages exist", () => {
  assert.match(read("docs/commands/akili-marketing.md"), /\/akili-marketing/, "docs/commands/akili-marketing.md");
  assert.match(read("docs/skills/social-marketing.md"), /social-marketing|Sergey Bulaev/, "docs/skills/social-marketing.md");
});

test("@akili-spec changes/akili-marketing FR-12: governance *Current assignment* binds social-marketing as core", () => {
  const assignment = section(read("docs/skills/governance.md"), /^### Current assignment$/);
  assert.notEqual(assignment, "", "expected a ### Current assignment section");
  const core = assignment.split("\n").find((l) => l.startsWith("| `core` |")) || "";
  assert.ok(core.includes("`social-marketing` (marketing)"), `core row must list social-marketing:\n${core}`);
  // BUT it must NOT appear under another binding.
  const others = assignment.split("\n").filter((l) => /^\| `(conditional|stack)` \|/.test(l));
  for (const l of others) assert.ok(!l.includes("social-marketing"), `social-marketing must not be bound twice:\n${l}`);
});

test("@akili-spec changes/akili-marketing FR-12: docs/skills/README.md lists social-marketing as core with Sergey Bulaev (MIT)", () => {
  const row = read("docs/skills/README.md")
    .split("\n")
    .find((l) => l.startsWith("| [`social-marketing`](social-marketing.md) |")) || "";
  assert.match(row, /^\| \[`social-marketing`\]\(social-marketing\.md\) \| core \| Sergey Bulaev \(MIT\) \|/, `row:\n${row}`);
});

test("@akili-spec changes/akili-marketing FR-12: skill page carries the governance *size justified* statement", () => {
  // governance.md criterion 4 is "Size justified"; skill pages state it as a bold lead-in.
  assert.match(read("docs/skills/governance.md"), /\*\*Size justified\*\*/);
  const para = read("docs/skills/social-marketing.md").split("\n").find((l) => l.startsWith("**Size justified.**")) || "";
  assert.notEqual(para, "", "expected a **Size justified.** paragraph on the skill page");
  assert.match(para, /references\//, "the statement must justify size through references/ (progressive disclosure)");
});

test("@akili-spec changes/akili-marketing FR-12: upstream credit (Sergey Bulaev, MIT) appears in the skill page and README", () => {
  const page = read("docs/skills/social-marketing.md");
  assert.match(page, /\| Author \| Sergey Bulaev \|/, "skill page attribution table: Author");
  assert.match(page, /\| Licence \| MIT/, "skill page attribution table: Licence");
  const readmeRow = read("README.md").split("\n").find((l) => l.startsWith("| Social marketing |")) || "";
  assert.match(readmeRow, /Sergey Bulaev/, `README Social marketing row credits the author:\n${readmeRow}`);
  assert.match(readmeRow, /\bMIT\b/, "README Social marketing row names the licence");
});

test("@akili-spec changes/akili-marketing FR-12: CHANGELOG ## [Unreleased] (or the 2.36.0 section it was released into) names /akili-marketing and social-marketing", () => {
  // Stays true after the release script moves [Unreleased] into a dated section.
  const log = read("CHANGELOG.md");
  const unreleased = section(log, /^## \[Unreleased\]/) + section(log, /^## \[2\.36\.0\] - /);
  assert.notEqual(unreleased, "", "expected a ## [Unreleased] or ## [2.36.0] section");
  assert.match(unreleased, /`\/akili-marketing`/);
  assert.match(unreleased, /`social-marketing`/);
});

test("@akili-spec changes/akili-marketing FR-12: the command is in every README/docs list that enumerates commands", () => {
  const readme = read("README.md");
  assert.ok(hasLine(readme, "  - `akili-marketing.md`"), "README command-file list");
  assert.ok(hasLine(readme, "| `/akili-marketing <mode> [args]` |"), "README command table");
  const anytime = readme.split("\n").find((l) => l.startsWith("Six anytime commands run outside this loop")) || "";
  assert.match(anytime, /`\/akili-marketing`/, "README anytime-commands sentence");

  const cmds = read("docs/commands/README.md");
  assert.ok(hasLine(cmds, "| [`/akili-marketing <mode> [args]`](akili-marketing.md) |"), "docs/commands/README.md table");
  assert.ok(hasLine(cmds, "| `/akili-marketing` | `.claude/commands/akili-marketing.md` |"), "docs/commands/README.md file map");

  assert.ok(hasLine(read("docs/README.md"), "(commands/akili-marketing.md)"), "docs/README.md link");
  assert.ok(hasLine(read("docs/flow.md"), "### 2c. Social Marketing (`/akili-marketing`)"), "docs/flow.md section 2c");
});

test("@akili-spec changes/akili-marketing FR-12: docs/cli.md states the updated totals (13 commands, 28 skills), none stale", () => {
  // docs/cli.md enumerates no commands by name; it states totals, which FR-12 requires updated.
  const cli = read("docs/cli.md");
  assert.ok(hasLine(cli, "(the 13 commands, installed as skills"), "cli.md command total");
  assert.ok(hasLine(cli, "(the 28 packaged skills"), "cli.md skill total");
  assert.doesNotMatch(cli, /\bthe 12 commands\b|\b12 command skills\b|\b27 packaged skills\b/, "no stale 12/27 total");
});

test("@akili-spec changes/akili-marketing FR-12: no shipped file references the active spec path (KZ-changes--archify-diagrams-1)", () => {
  const r = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts", "--offline"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  assert.equal(r.status, 0, `npm pack --dry-run --json failed:\n${r.stderr}`);
  const files = JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].files.map((f) => f.path);
  assert.ok(files.includes(".claude/commands/akili-marketing.md"), "the command ships");
  assert.ok(files.includes(".claude/skills/social-marketing/SKILL.md"), "the skill ships");
  assert.equal(files.filter((p) => p.startsWith("docs/specs/")).length, 0, "docs/specs/ never ships");
  const offenders = files.filter((p) => read(p).includes("docs/specs/changes/akili-marketing"));
  assert.deepEqual(offenders, [], "shipped files must not reference docs/specs/changes/akili-marketing");
});

for (const platform of ["instagram", "linkedin", "facebook"]) {
  test(`@akili-spec changes/akili-marketing NFR-6: ${platform}.md is dated and labels every limit row hard limit or heuristic`, () => {
    const text = read(`.claude/skills/social-marketing/references/${platform}.md`);
    assert.match(text, /^lastVerified: \d{4}-\d{2}-\d{2}$/m, "lastVerified: <date>");
    const lines = text.split("\n");
    const header = lines.findIndex((l) => /^\| Item \| Figure \| Label \|/.test(l));
    assert.ok(header >= 0, "expected the limits table (| Item | Figure | Label | ...)");
    const rows = [];
    for (let i = header + 2; i < lines.length && lines[i].startsWith("|"); i++) rows.push(lines[i]);
    assert.ok(rows.length > 0, "the limits table has rows");
    for (const row of rows) {
      const label = row.split("|")[3].trim();
      assert.ok(label === "hard limit" || label === "heuristic", `unlabelled or mislabelled limit row:\n${row}`);
      // A hard limit is sourced: it must cite the platform's own page.
      if (label === "hard limit") assert.match(row, /https:\/\//, `hard limit without a cited source:\n${row}`);
    }
  });
}
