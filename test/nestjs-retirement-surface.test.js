"use strict";

// @akili-spec changes/nestjs-official-skills T10
//
// FR-8: no live surface names the retired `nestjs-expert` skill. The allowlist
// is the historical record (changelog and release notes), the Removal Log row,
// the retirement table, the tests that assert the retirement, and the
// implementer persona (DD-12) with the fixtures that copy it verbatim.
// docs/specs/ is excluded wholesale and never read (NFR-5).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP_DIRS = new Set(["node_modules", ".git", ".codegraph", ".agents"]); // .agents/ is the gitignored deployed copy;
const SKILL_LOADING = /\(e\.g\., `shadcn-ui`, `nestjs-expert`\)/; // the implementer persona's example list (DD-12)
// [file, line pattern]: a null pattern allows the whole file, anything else only the matching lines.
const ALLOWED = [
  [/^CHANGELOG\.md$/, null],
  [/^releases\//, null],
  [/^bin\/skill-map\.js$/, /name: "nestjs-expert"/], // the RETIRED_SKILLS row
  [/^\.claude\/templates\/implementer\.md$/, SKILL_LOADING],
  [/^test\/fixtures\/personas\//, SKILL_LOADING], // verbatim copies of that persona line
  [/^docs\/skills\/governance\.md$/, /\| `nestjs-expert` retired/], // the Removal Log row
  [/^test\/(retired-skills|nestjs-retirement-surface|doctor-skill-map|backend-skill-routing-coverage|ai-agent-guardrails-evals)\.test\.js$/, null],
];

function hits(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = path.relative(ROOT, full).split(path.sep).join("/");
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name) && rel !== "docs/specs") hits(full, out);
    } else if (!/\.(tgz|png|jpe?g|gif|woff2?)$/.test(e.name)) {
      fs.readFileSync(full, "utf8").split("\n").forEach((l, i) => l.includes("nestjs-expert") && out.push([rel, i + 1, l]));
    }
  }
  return out;
}

test("no live surface names nestjs-expert outside the allowlist", () => {
  const bad = hits(ROOT).filter(([rel, , l]) => !ALLOWED.some(([re, line]) => re.test(rel) && (!line || line.test(l))));
  assert.deepEqual(bad.map(([f, n]) => `${f}:${n}`), []);
});

test("the retired skill folder and page are gone", () => {
  for (const p of [".claude/skills/nestjs-expert", "docs/skills/nestjs-expert.md"]) assert.ok(!fs.existsSync(path.join(ROOT, p)), p);
});
