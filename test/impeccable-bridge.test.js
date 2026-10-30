"use strict";
// @akili-spec changes/impeccable-design — Impeccable as AKILI's lead design skill via a packaged bridge.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8").replace(/\r\n/g, "\n");
const BRIDGE = [".claude", "skills", "impeccable-bridge"];

// @akili-spec changes/impeccable-hardening -- the bridge v2.0 is the AKILI layer over a vendored Impeccable.
// Every read goes through `read`, which normalizes CRLF (Windows checkouts with core.autocrlf).
const COMMANDS = [".claude", "commands"];
const index = (s, needle) => {
  const i = s.indexOf(needle);
  assert.ok(i >= 0, `missing: ${needle}`);
  return i;
};
// The consequence table of one command: the rows that open with `| Skill source` or `| Engine`
// (markdown table rows, possibly indented inside a list item).
const stateRows = (cmd) =>
  read(...COMMANDS, `${cmd}.md`)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^\| (Skill source|Engine) /.test(l));

test("@akili-spec changes/impeccable-design FR-1/FR-2: bridge skill ships with MIT frontmatter, conditional binding and attribution, leading with the vendored Impeccable", () => {
  const s = read(...BRIDGE, "SKILL.md");
  assert.match(s, /^---\nname: impeccable-bridge\n/);
  assert.match(s, /license: MIT/);
  assert.match(s, /binding: conditional/);
  assert.match(s, /version: "2\.0"/);
  assert.match(s, /pbakaus\/impeccable/);
  assert.match(s, /Apache-2\.0/);
  const files = fs.readdirSync(path.join(ROOT, ...BRIDGE), { recursive: true }).filter((f) => f.endsWith(".md")).sort();
  assert.deepStrictEqual(files, ["SKILL.md", path.join("references", "design-evaluation.md")]);
  const vendored = path.join(ROOT, ".claude", "skills", "impeccable");
  for (const f of ["SKILL.md", "LICENSE", "NOTICE", "UPSTREAM.md"]) assert.ok(fs.existsSync(path.join(vendored, f)), `vendored impeccable/${f} ships`);
  assert.match(s, /vendored \(<version>\)/);
});

test("@akili-spec changes/impeccable-hardening FR-4: skill source values, engine states and the exit-code table", () => {
  const s = read(...BRIDGE, "SKILL.md");
  for (const k of ["vendored (<version>)", "user-installed (<version>)", "`missing`", "UPSTREAM.md"]) assert.ok(s.includes(k), `skill source value ${k}`);
  for (const k of ["ready (<location>, engine <version>)", "`consent needed`", "installed (consented)", "`declined`", "unavailable (<reason>)"]) {
    assert.ok(s.includes(k), `engine state ${k}`);
  }
  const exits = s.slice(index(s, "### Exit codes"), index(s, "## Design Waivers"));
  for (const row of ["| `0` | Pass |", "| `2` | Fail", "| `1` | `Unevaluated`", "| `127` | `Unevaluated (engine not available)`", "| any other | `Unevaluated` |"]) {
    assert.ok(exits.includes(row), `exit table row ${row}`);
  }
  for (const k of ["Unevaluated (engine not installed)", "ui-ux-pro-max", "frontend-design", "docs/ux-ui/design.md"]) assert.ok(s.includes(k), `bridge names ${k}`);
});

test("@akili-spec changes/impeccable-hardening FR-5: gate order is probe, then the IMPECCABLE_BIN pin, then consent, all before any launcher call", () => {
  const s = read(...BRIDGE, "SKILL.md");
  const step0 = s.slice(index(s, "## Step 0"), index(s, "### Engine state"));
  const probe = index(step0, "2. **Engine probe");
  const pin = index(step0, "3. **Ready.**");
  const consent = index(step0, "4. **Consent.**");
  assert.ok(probe < pin && pin < consent, "probe < pin < consent");
  assert.ok(step0.slice(pin, consent).includes("export `IMPECCABLE_BIN=<that candidate>`"), "the pin step exports IMPECCABLE_BIN");
  assert.ok(step0.slice(consent).includes("`<launcher> engine-probe` (this call is the download)"), "only the consent step reaches the download");
  const gate = step0.slice(index(step0, "**The gate, stated once:**"));
  assert.match(gate, /no AKILI step invokes the launcher/);
  assert.match(gate, /before the engine state is `ready` or `installed \(consented\)`/);
  assert.ok(index(step0, "**The gate, stated once:**") > consent, "the gate statement follows the three steps");
});

test("@akili-spec changes/impeccable-hardening FR-6/FR-8/FR-9: launcher form carries both privacy variables; scan matrix has both viewports", () => {
  const s = read(...BRIDGE, "SKILL.md");
  assert.ok(s.includes("DO_NOT_TRACK=1 IMPECCABLE_NO_UPDATE_CHECK=1 <skill-dir>/scripts/impeccable detect --json [flags] <targets>"), "launcher form");
  assert.match(s, /`IMPECCABLE_NO_UPDATE_CHECK=1` is never dropped/);
  assert.ok(s.includes("--no-consent-hiding --no-overlay-hiding"), "first-visit flags");
  assert.ok(s.includes("`desktop`") && s.includes("`mobile`") && s.includes("390x844") && s.includes("1280x800"), "both viewports");
});

test("@akili-spec changes/impeccable-hardening D-2/D-3: unverified first visit is a WARN, proposed waivers are counted in the header only", () => {
  const s = read(...BRIDGE, "SKILL.md");
  assert.ok(s.includes("`WARN (unverified first visit)`") && /never `PASS`/.test(s), "D-2");
  assert.ok(s.includes("`Unevaluated (no browser automation)`"), "D-2 screenshot reading");
  assert.match(s, /Proposed waivers do \*\*not\*\* count toward P1/);
  assert.ok(s.includes("`Proposed waivers: N`"), "D-3 header line");
});

test("@akili-spec changes/impeccable-hardening FR-4/DD-9: validate, test and audit carry a five-row consequence table; constitution, specify and propose point at the bridge", () => {
  for (const c of ["akili-validate", "akili-test", "akili-audit"]) {
    assert.ok(read(...COMMANDS, `${c}.md`).includes("impeccable-bridge"), `${c} loads impeccable-bridge`);
    const rows = stateRows(c);
    assert.equal(rows.length, 5, `${c}: five per-value rows, got ${rows.length}`);
    const heads = ["| Skill source `vendored` / `user-installed` |", "| Skill source `missing` |", "| Engine `ready` / `installed (consented)` |", "| Engine `consent needed` |", "| Engine `declined` / `unavailable` |"];
    heads.forEach((h, i) => assert.ok(rows[i].startsWith(h), `${c} row ${i + 1} is ${h}; got ${rows[i].slice(0, 60)}`));
    assert.ok(rows[4].includes("Unevaluated (engine not installed)"), `${c} declined row reads Unevaluated (engine not installed)`);
    assert.ok(rows[3].includes("Engine consent"), `${c} consent row points at the bridge's Engine consent`);
  }
  for (const c of ["akili-constitution", "akili-specify", "akili-propose"]) {
    const t = read(...COMMANDS, `${c}.md`);
    assert.ok(t.includes("impeccable-bridge"), `${c} loads impeccable-bridge`);
    assert.ok(/Who does what in each state|Skill source|skill source/.test(t), `${c} has a bridge pointer or a skill-source consequence`);
  }
  for (const c of ["akili-constitution", "akili-specify", "akili-propose", "akili-validate", "akili-test", "akili-audit"]) {
    const t = read(...COMMANDS, `${c}.md`);
    assert.doesNotMatch(t, /scripts\/impeccable|DO_NOT_TRACK|IMPECCABLE_NO_UPDATE_CHECK|IMPECCABLE_BIN|detect --json/, `${c} restates no bridge command string`);
  }
  const v = read(...COMMANDS, "akili-validate.md");
  assert.match(v, /UI design review/);
  assert.ok(v.includes("a `2` not fixed or waived is **FAIL**"), "validate: exit 2 is FAIL unless fixed or waived");
  assert.ok(!read(...COMMANDS, "akili-constitution.md").includes("`ui-ux-pro-max` if available"), "ui-ux-pro-max no longer leads");
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
  assert.ok(read("docs", "skills", "governance.md").includes("`impeccable-bridge` (the AKILI layer over it)"));
  const ch = read("CHANGELOG.md");
  const unrel = ch.slice(ch.indexOf("## [Unreleased]"), ch.indexOf("## [2.38.0]"));
  assert.ok(unrel.includes("impeccable-bridge") && unrel.includes("/akili-audit design"));
});

test("@akili-spec changes/impeccable-design NFR-1: no AWS account ids in the change", () => {
  const files = [[...BRIDGE, "SKILL.md"], [...BRIDGE, "references", "design-evaluation.md"], ["docs", "skills", "impeccable-bridge.md"]];
  for (const f of files) assert.doesNotMatch(read(...f), /\b\d{12}\b/);
});

// Negative sweep (design 7.4): the old-phrasing paraphrases must not survive in any shipped file.
// Scope is .claude/ + docs/ + README.md; only docs/specs/ (history) and the vendored upstream
// folder are excluded. The state value is keyed with its backticks: bare "skill only" has two
// unrelated prose hits (templates/leader.md, docs/flow.md) that must stay in scope.
test("@akili-spec changes/impeccable-hardening FR-11/FR-14: no shipped file keeps the pre-hardening phrasing", () => {
  const SWEEP = [
    ["npx impeccable detect", "the npx detector form"],
    ["Unevaluated (Impeccable absent)", "the old unevaluated reading"],
    ["`skill only`", "the old detection state"],
    ["never copies Impeccable", "the old no-vendoring claim"],
  ];
  const skipDirs = [path.join("docs", "specs"), path.join(".claude", "skills", "impeccable")];
  const files = [];
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
      const r = path.join(rel, e.name);
      if (e.isDirectory()) {
        if (!skipDirs.includes(r)) walk(r);
      } else if (e.isFile()) files.push(r);
    }
  };
  walk(".claude");
  walk("docs");
  files.push("README.md");
  assert.ok(files.length > 100, `sweep reached the shipped tree (${files.length} files)`);
  assert.ok(files.includes(path.join(".claude", "templates", "leader.md")) && files.includes(path.join("docs", "flow.md")), "bare-prose files stay in scope");
  assert.ok(!files.some((f) => skipDirs.some((d) => f.startsWith(d + path.sep))), "only the two named folders are excluded");
  const hits = [];
  for (const f of files) {
    const buf = fs.readFileSync(path.join(ROOT, f));
    if (buf.includes(0)) continue; // binary
    buf.toString("utf8").replace(/\r\n/g, "\n").split("\n").forEach((line, i) => {
      for (const [pat, why] of SWEEP) if (line.includes(pat)) hits.push(`${f.split(path.sep).join("/")}:${i + 1}: ${pat} (${why})`);
    });
  }
  assert.deepStrictEqual(hits, [], `stale pre-hardening phrasing:\n${hits.join("\n")}`);
});
