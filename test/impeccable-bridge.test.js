"use strict";
// @akili-spec changes/impeccable-design — Impeccable as AKILI's lead design skill via a packaged bridge.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8");
const BRIDGE = [".claude", "skills", "impeccable-bridge"];

test("@akili-spec changes/impeccable-design FR-1/FR-2: bridge skill ships with MIT frontmatter, conditional binding and attribution, never vendoring Impeccable", () => {
  const s = read(...BRIDGE, "SKILL.md");
  assert.match(s, /^---\nname: impeccable-bridge\n/);
  assert.match(s, /license: MIT/);
  assert.match(s, /binding: conditional/);
  assert.match(s, /pbakaus\/impeccable/);
  assert.match(s, /Apache-2\.0/);
  const files = fs.readdirSync(path.join(ROOT, ...BRIDGE), { recursive: true }).filter((f) => f.endsWith(".md")).sort();
  assert.deepStrictEqual(files, ["SKILL.md", path.join("references", "design-evaluation.md")]);
  assert.ok(!fs.existsSync(path.join(ROOT, ".claude", "skills", "impeccable")), "Impeccable must not be vendored");
});

test("@akili-spec changes/impeccable-design FR-3/FR-4: detection states, fallback without STOP, detector exit codes, DO_NOT_TRACK", () => {
  const s = read(...BRIDGE, "SKILL.md");
  for (const k of ["installed", "skill only", "absent", "npx impeccable install", "DO_NOT_TRACK=1", "npx impeccable detect --json", "Unevaluated", "ui-ux-pro-max", "frontend-design"]) {
    assert.ok(s.includes(k), `bridge SKILL.md names ${k}`);
  }
  assert.ok(s.includes("docs/ux-ui/design.md"), "single design source of truth named");
});

test("@akili-spec changes/impeccable-design FR-5..FR-9: commands wire the bridge", () => {
  for (const c of ["akili-constitution", "akili-specify", "akili-propose", "akili-validate", "akili-test", "akili-audit"]) {
    assert.ok(read(".claude", "commands", `${c}.md`).includes("impeccable-bridge"), `${c} loads impeccable-bridge`);
  }
  const v = read(".claude", "commands", "akili-validate.md");
  assert.match(v, /UI design review/);
  assert.match(v, /Exit `0` passes; exit `2` is \*\*FAIL\*\*/);
  assert.ok(!read(".claude", "commands", "akili-constitution.md").includes("`ui-ux-pro-max` if available"), "ui-ux-pro-max no longer leads");
});

test("@akili-spec changes/impeccable-design FR-10/FR-11: /akili-audit design mode writes a separate prioritized report", () => {
  const a = read(".claude", "commands", "akili-audit.md");
  assert.ok(a.includes("/akili-audit design [<url|path>]"));
  assert.ok(a.includes("docs/specs/audits/design-<YYYY-MM-DD>[-<safe-branch>][-N].md"));
  for (const p of ["**P1**", "**P2**", "**P3**", "/akili-quick", "/akili-propose"]) assert.ok(a.includes(p), p);
  assert.match(a, /A `design-\*\.md` file is never a drift report/);
  const r = read(...BRIDGE, "references", "design-evaluation.md");
  for (const e of ["E0", "E7"]) assert.ok(r.includes(e), e);
});

test("@akili-spec changes/impeccable-design FR-12/FR-13: ui-ux-pro-max is a catalog, docs and CHANGELOG updated", () => {
  assert.ok(!read(".claude", "skills", "ui-ux-pro-max", "SKILL.md").includes("AKILI's preferred UI/UX skill"));
  assert.ok(read(".claude", "skills", "frontend-design", "SKILL.md").includes("impeccable-bridge"));
  assert.ok(fs.existsSync(path.join(ROOT, "docs", "skills", "impeccable-bridge.md")));
  assert.ok(read("docs", "skills", "README.md").includes("[`impeccable-bridge`](impeccable-bridge.md) | conditional"));
  assert.ok(read("docs", "overview.md").includes("[`impeccable-bridge`](skills/impeccable-bridge.md) | conditional"));
  assert.ok(read("docs", "skills", "governance.md").includes("`impeccable-bridge` (lead design skill)"));
  const ch = read("CHANGELOG.md");
  const unrel = ch.slice(ch.indexOf("## [Unreleased]"), ch.indexOf("## [2.38.0]"));
  assert.ok(unrel.includes("impeccable-bridge") && unrel.includes("/akili-audit design"));
});

test("@akili-spec changes/impeccable-design NFR-1: no AWS account ids in the change", () => {
  const files = [[...BRIDGE, "SKILL.md"], [...BRIDGE, "references", "design-evaluation.md"], ["docs", "skills", "impeccable-bridge.md"]];
  for (const f of files) assert.doesNotMatch(read(...f), /\b\d{12}\b/);
});
