"use strict";

// @akili-spec changes/akili-panel (Tester, integration suite: installer + CLI)
//
// Closes what test/install-akili-panel.test.js does not prove: the real
// `akili update` run, the "nothing else changes" clause as a tree comparison,
// --local / --target / --tool both, old-installer leaks of the real folder,
// every foreign shape against every removal path, invalid or absent ownership
// records, several plugins, the root marketplace folder in npm, and the docs
// clauses. Expected values are literals copied from requirements.md at
// 5ac821f; nothing here reads docs/specs/. Every run uses a scratch HOME.

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..");
const AKILI_BIN = path.join(REPO_ROOT, "bin", "akili.js");
const SOURCE_SKILLS = path.join(REPO_ROOT, ".claude", "skills");
const PLUGIN = "akili-panel";
const SOURCE_PLUGIN = path.join(SOURCE_SKILLS, PLUGIN);
const RECORD_REL = path.join("gb", "akili", "grokbot-owned.json");
const COMMAND_COUNT = fs.readdirSync(path.join(REPO_ROOT, ".claude", "commands")).filter((f) => f.endsWith(".md")).length;
const RESOURCE_COUNT = 8; // 2 scripts, 4 personas, digests.json, .mcp.json.example

const SKILL_DIRS = {
  claude: [path.join(".claude", "skills")],
  opencode: [path.join(".config", "opencode", "skills")],
  antigravity: [
    path.join(".gemini", "config", "skills"),
    path.join(".gemini", "skills"),
    path.join(".gemini", "antigravity-cli", "skills"),
  ],
  codex: [path.join(".agents", "skills")],
  cursor: [path.join(".agents", "skills")],
  grokbot: [path.join("gb", "workflows")],
};
const NON_CLAUDE = ["opencode", "antigravity", "codex", "cursor", "grokbot"];
const posixOnly = { skip: process.platform === "win32" ? "needs POSIX symlinks and a shell stub" : false };

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function mkTmp(t, prefix) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function runAkili(home, args, opts) {
  const o = opts || {};
  const env = Object.assign(
    {},
    process.env,
    {
      HOME: home,
      USERPROFILE: home,
      CODEX_HOME: path.join(home, ".codex-env-unused"),
      CURSOR_CONFIG_DIR: path.join(home, ".cursor-env-unused"),
      AKILI_GROKBOT_TARGET: path.join(home, "gb", "workflows"),
    },
    o.env || {}
  );
  const r = spawnSync(process.execPath, [o.bin || AKILI_BIN, ...args], { encoding: "utf8", cwd: o.cwd || home, env });
  return { status: r.status, stdout: stripAnsi(r.stdout || ""), stderr: stripAnsi(r.stderr || "") };
}

function ok(run, label) {
  assert.equal(run.status, 0, `${label || "run"} failed:\n${run.stdout}\n${run.stderr}`);
  return run;
}

// path -> sha256 of every entry under `root`; a link is recorded as a link.
function snapshot(root) {
  const out = {};
  if (!fs.existsSync(root)) return out;
  (function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      const rel = path.relative(root, full).split(path.sep).join("/");
      if (entry.isSymbolicLink()) out[rel] = `link:${fs.readlinkSync(full)}`;
      else if (entry.isDirectory()) walk(full);
      else out[rel] = crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex");
    }
  })(root);
  return out;
}

function findNamed(root, name) {
  const out = [];
  (function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.name === name) out.push(path.relative(root, full));
      if (entry.isDirectory()) walk(full);
    }
  })(root);
  return out.sort();
}

// Every directory under `root` that holds an installed skill: discovered from
// the install's own output on disk, so --local and --target need no path table.
function skillRoots(root) {
  return findNamed(root, "tdd")
    .filter((rel) => fs.existsSync(path.join(root, rel, "SKILL.md")))
    .map((rel) => path.dirname(rel))
    .sort();
}

function assertPluginBytes(dest, label) {
  const want = snapshot(SOURCE_PLUGIN);
  assert.ok(Object.keys(want).length > 0, "source plugin is not empty");
  assert.deepEqual(snapshot(dest), want, `${label}: installed plugin equals the packaged one byte for byte`);
}

function seedLeak(dir) {
  fs.mkdirSync(path.join(dir, PLUGIN, ".claude-plugin"), { recursive: true });
  fs.writeFileSync(path.join(dir, PLUGIN, ".claude-plugin", "plugin.json"), JSON.stringify({ name: PLUGIN, version: "1.0.0" }) + "\n");
}

// What the old installer really leaves: the whole packaged folder.
function seedRealLeak(dir) {
  fs.mkdirSync(dir, { recursive: true });
  fs.cpSync(SOURCE_PLUGIN, path.join(dir, PLUGIN), { recursive: true });
}

function writeRecord(home, folders) {
  const p = path.join(home, RECORD_REL);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify({ version: 1, folders }, null, 2) + "\n");
}
const readRecord = (home) => JSON.parse(fs.readFileSync(path.join(home, RECORD_REL), "utf8"));

function copyPackage(t, opts) {
  const o = opts || {};
  const copy = mkTmp(t, "cov-pkg-");
  for (const rel of ["bin", ".claude", "package.json", ".mcp.json.example", path.join("scripts", "gsc_verify.py"), path.join("scripts", "parse_tests.js")]) {
    fs.mkdirSync(path.dirname(path.join(copy, rel)), { recursive: true });
    fs.cpSync(path.join(REPO_ROOT, rel), path.join(copy, rel), { recursive: true });
  }
  if (o.withoutPlugin) fs.rmSync(path.join(copy, ".claude", "skills", PLUGIN), { recursive: true });
  if (o.withTypes) {
    const types = path.join(copy, ".claude", "skills", PLUGIN, ".claude-plugin", "types", "claude-code");
    fs.mkdirSync(types, { recursive: true });
    fs.writeFileSync(path.join(types, "index.d.ts"), "export {};\n");
  }
  return copy;
}

function block(stdout, heading) {
  const lines = stdout.split("\n");
  const start = lines.findIndex((l) => l.trim() === `${heading}:`);
  assert.ok(start >= 0, `output has a "${heading}:" heading; got:\n${stdout}`);
  const out = [];
  for (let i = start + 1; i < lines.length && lines[i].trim() !== ""; i++) out.push(lines[i].trim());
  return out;
}

// The output with the scratch home masked: a temp path may itself hold the name.
const masked = (run, home) => run.stdout.split(home).join("<home>");

const removedLines = (stdout) => stdout.split("\n").filter((l) => /REMOVED akili-panel/.test(l));

// A stub package manager: the real runUpdate runs end to end, nothing reaches
// npm. PATH holds the stub only, so no real npm or pnpm can be touched.
function stubNpm(t) {
  const dir = mkTmp(t, "cov-stub-");
  const script = '#!/bin/sh\ncase "$1" in\n  list) echo "akili-specs@9.9.9" ;;\n  root) echo "/nonexistent-akili-root" ;;\n  *) exit 0 ;;\nesac\n';
  fs.writeFileSync(path.join(dir, "npm"), script, { mode: 0o755 });
  return { PATH: dir };
}

// ------------------------------------------------- FR-1 "same as before" (D-2)

// The package without the plugin is what every target received before this
// change, so an install with the plugin must leave the same tree, byte for byte.
for (const tool of [...NON_CLAUDE, "both", "all"]) {
  test(`FR-1 --tool ${tool}: outside the Claude plugin folder the tree equals an install from a package without the plugin`, (t) => {
    const without = copyPackage(t, { withoutPlugin: true });
    const homeA = mkTmp(t, "cov-diff-a-");
    const homeB = mkTmp(t, "cov-diff-b-");
    ok(runAkili(homeA, ["install", "--tool", tool]), "with plugin");
    ok(runAkili(homeB, ["install", "--tool", tool], { bin: path.join(without, "bin", "akili.js") }), "without plugin");
    const a = snapshot(homeA);
    const b = snapshot(homeB);
    assert.ok(Object.keys(b).length > COMMAND_COUNT + 32, "the baseline install wrote its files");
    for (const rel of Object.keys(a)) {
      if (rel.startsWith(`.claude/skills/${PLUGIN}/`)) delete a[rel];
    }
    assert.deepEqual(a, b, `${tool}: nothing but the Claude plugin folder differs`);
  });
}

test("FR-1 --tool claude: the plugin folder is the only difference from an install without it", (t) => {
  const without = copyPackage(t, { withoutPlugin: true });
  const homeA = mkTmp(t, "cov-diffc-a-");
  const homeB = mkTmp(t, "cov-diffc-b-");
  ok(runAkili(homeA, ["install", "--tool", "claude"]));
  ok(runAkili(homeB, ["install", "--tool", "claude"], { bin: path.join(without, "bin", "akili.js") }));
  const a = snapshot(homeA);
  const added = Object.keys(a).filter((rel) => !(rel in snapshot(homeB))).sort();
  assert.deepEqual(added, Object.keys(snapshot(SOURCE_PLUGIN)).map((rel) => `.claude/skills/${PLUGIN}/${rel}`).sort());
});

// ------------------------------------------- FR-1 --local, --target, --tool both

for (const tool of NON_CLAUDE) {
  test(`FR-1 ${tool} --local: no akili-panel in the project or the home, and a leaked local copy is removed`, (t) => {
    const home = mkTmp(t, `cov-loc-h-${tool}-`);
    const project = mkTmp(t, `cov-loc-p-${tool}-`);
    ok(runAkili(home, ["install", "--tool", tool, "--local"], { cwd: project }));
    const roots = skillRoots(project);
    assert.ok(roots.length > 0, `${tool} --local wrote skills under the project`);
    assert.deepEqual(findNamed(project, PLUGIN), [], `${tool} --local: no plugin in the project`);
    assert.deepEqual(findNamed(home, PLUGIN), [], `${tool} --local: no plugin in the home`);
    for (const rel of roots) seedLeak(path.join(project, rel));
    const run = ok(runAkili(home, ["install", "--tool", tool, "--local"], { cwd: project }));
    assert.deepEqual(findNamed(project, PLUGIN), [], `${tool} --local: the leaked copy is gone`);
    assert.equal(removedLines(run.stdout).length, roots.length, "one REMOVED line per copy");
  });

  test(`FR-1 ${tool} --target: no akili-panel under the target, and a leaked copy there is removed`, (t) => {
    const home = mkTmp(t, `cov-tgt-h-${tool}-`);
    const target = mkTmp(t, `cov-tgt-${tool}-`);
    ok(runAkili(home, ["install", "--tool", tool, "--target", target]));
    const roots = skillRoots(target);
    assert.ok(roots.length > 0, `${tool} --target wrote skills under the target`);
    assert.deepEqual(findNamed(target, PLUGIN), []);
    for (const rel of roots) seedLeak(path.join(target, rel));
    ok(runAkili(home, ["install", "--tool", tool, "--target", target]));
    assert.deepEqual(findNamed(target, PLUGIN), [], `${tool} --target: the leaked copy is gone`);
  });
}

test("FR-1 Claude --target: the plugin lands under <target>/skills, byte for byte", (t) => {
  const home = mkTmp(t, "cov-ctgt-h-");
  const target = mkTmp(t, "cov-ctgt-");
  ok(runAkili(home, ["install", "--tool", "claude", "--target", target]));
  assertPluginBytes(path.join(target, "skills", PLUGIN), "--target");
  assert.deepEqual(findNamed(home, PLUGIN), [], "nothing under the home");
});

test("FR-1 --tool both: the plugin is under Claude only, and OpenCode's leaked copy goes in the same run", (t) => {
  const home = mkTmp(t, "cov-both-");
  seedLeak(path.join(home, SKILL_DIRS.opencode[0]));
  const run = ok(runAkili(home, ["install", "--tool", "both"]));
  assert.deepEqual(findNamed(home, PLUGIN), [path.join(".claude", "skills", PLUGIN)]);
  assert.equal(removedLines(run.stdout).length, 1);
});

for (const flags of [["--local"], ["--skills-only"], ["--local", "--skills-only"]]) {
  test(`FR-1 Claude ${flags.join(" ")}: the installed plugin equals the packaged one byte for byte`, (t) => {
    const home = mkTmp(t, "cov-bytes-h-");
    const project = mkTmp(t, "cov-bytes-p-");
    ok(runAkili(home, ["install", "--tool", "claude", ...flags], { cwd: project }));
    const base = flags.includes("--local") ? project : home;
    assertPluginBytes(path.join(base, ".claude", "skills", PLUGIN), flags.join(" "));
  });
}

test("FR-1 Claude --commands-only installs no plugin, --dry-run announces it and writes nothing", (t) => {
  const home = mkTmp(t, "cov-modes-");
  ok(runAkili(home, ["install", "--tool", "claude", "--commands-only"]));
  assert.deepEqual(findNamed(home, PLUGIN), [], "--commands-only copies no skill-side entry");
  const dry = ok(runAkili(home, ["install", "--tool", "claude", "--dry-run"]));
  assert.deepEqual(findNamed(home, PLUGIN), [], "--dry-run writes nothing");
  assert.ok(dry.stdout.split("\n").some((l) => l.includes("would install") && l.includes(PLUGIN)), dry.stdout);
});

test("FR-1 existing files: a clean re-install reads the plugin identical and writes nothing into it", (t) => {
  const home = mkTmp(t, "cov-idem-");
  ok(runAkili(home, ["install", "--tool", "claude"]));
  const dest = path.join(home, ".claude", "skills", PLUGIN);
  const extra = path.join(dest, "local-note.txt");
  fs.writeFileSync(extra, "mine\n");
  const before = snapshot(dest);
  const run = ok(runAkili(home, ["install", "--tool", "claude"]));
  const line = run.stdout.split("\n").find((l) => l.includes("skip existing") && l.includes(dest));
  assert.ok(line && line.includes("(identical)"), `skip line reads identical; got: ${line}`);
  assert.deepEqual(snapshot(dest), before, "the skip leaves the folder as it was");
});

test("FR-1 existing files: --force over a symlinked plugin folder never writes through the link", posixOnly, (t) => {
  const home = mkTmp(t, "cov-link-");
  const outside = mkTmp(t, "cov-link-out-");
  fs.writeFileSync(path.join(outside, "README.md"), "outside\n");
  const skills = path.join(home, ".claude", "skills");
  fs.mkdirSync(skills, { recursive: true });
  fs.symlinkSync(outside, path.join(skills, PLUGIN));
  ok(runAkili(home, ["install", "--tool", "claude"]));
  assert.equal(fs.readFileSync(path.join(outside, "README.md"), "utf8"), "outside\n", "skip leaves the link's target");
  ok(runAkili(home, ["install", "--tool", "claude", "--force"]));
  assert.deepEqual(Object.keys(snapshot(outside)), ["README.md"], "--force adds nothing through the link");
  assert.equal(fs.readFileSync(path.join(outside, "README.md"), "utf8"), "outside\n", "--force writes nothing through the link");
  assertPluginBytes(path.join(skills, PLUGIN), "--force over a link");
});

// --------------------------------------------------- FR-2 the real update path

test("FR-2 Update: a real `akili update` over an older all-tools install adds the plugin for Claude and for no one else", posixOnly, (t) => {
  const home = mkTmp(t, "cov-upd-");
  ok(runAkili(home, ["install", "--tool", "all"]));
  fs.rmSync(path.join(home, ".claude", "skills", PLUGIN), { recursive: true });
  assert.deepEqual(findNamed(home, PLUGIN), [], "the older install has no plugin");
  const run = ok(runAkili(home, ["update"], { env: stubNpm(t) }), "update");
  assert.match(run.stdout, /Reinstalling files with --force/, "update reached its reinstall step");
  assert.match(run.stdout, /Auto-detected installed target\(s\): claude, opencode, antigravity, codex, cursor/);
  assert.deepEqual(findNamed(home, PLUGIN), [path.join(".claude", "skills", PLUGIN)]);
  assertPluginBytes(path.join(home, ".claude", "skills", PLUGIN), "update");
});

test("FR-2 Update: `akili update` refreshes an outdated plugin for Claude", posixOnly, (t) => {
  const home = mkTmp(t, "cov-upd-refresh-");
  ok(runAkili(home, ["install", "--tool", "claude"]));
  const dest = path.join(home, ".claude", "skills", PLUGIN);
  fs.writeFileSync(path.join(dest, "README.md"), "older copy\n");
  ok(runAkili(home, ["update", "--tool", "claude"], { env: stubNpm(t) }), "update");
  assertPluginBytes(dest, "update --tool claude");
});

test("FR-2 Update: update's reinstall on the new code removes a leaked copy and drops it from the record", posixOnly, (t) => {
  const home = mkTmp(t, "cov-upd-leak-");
  ok(runAkili(home, ["install", "--tool", "grokbot"]));
  writeRecord(home, [...readRecord(home).folders, PLUGIN]);
  seedRealLeak(path.join(home, SKILL_DIRS.grokbot[0]));
  const run = ok(runAkili(home, ["update", "--tool", "grokbot"], { env: stubNpm(t) }), "update");
  assert.equal(removedLines(run.stdout).length, 1, run.stdout);
  assert.deepEqual(findNamed(home, PLUGIN), []);
  assert.equal(readRecord(home).folders.includes(PLUGIN), false);
});

// ------------------------------------------ FR-2 upgrade from an old installer

test("FR-2 Upgrade: the real folder in every root and the record; each tool's run removes its copies with REMOVED lines", (t) => {
  const home = mkTmp(t, "cov-upg-");
  ok(runAkili(home, ["install", "--tool", "all"]));
  ok(runAkili(home, ["install", "--tool", "grokbot"]));
  const skillsBefore = NON_CLAUDE.map((tool) => SKILL_DIRS[tool].map((rel) => fs.readdirSync(path.join(home, rel)).sort()));
  const realRecord = readRecord(home).folders;
  writeRecord(home, [...realRecord, PLUGIN]);
  for (const tool of NON_CLAUDE) for (const rel of SKILL_DIRS[tool]) seedRealLeak(path.join(home, rel));

  const expected = { opencode: 1, antigravity: 3, codex: 1, cursor: 0, grokbot: 1 }; // Codex and Cursor share one root
  for (const tool of NON_CLAUDE) {
    const run = ok(runAkili(home, ["install", "--tool", tool]), tool);
    const lines = run.stdout.split("\n");
    assert.equal(removedLines(run.stdout).length, expected[tool], `${tool}: REMOVED lines\n${run.stdout}`);
    lines.forEach((line, i) => {
      if (/REMOVED akili-panel/.test(line)) {
        assert.ok(line.includes(`not used by ${tool}`), line);
        assert.ok(lines[i + 1].trim().endsWith(PLUGIN), `the next line names the removed path: ${lines[i + 1]}`);
      }
    });
  }
  assert.deepEqual(findNamed(home, PLUGIN), [path.join(".claude", "skills", PLUGIN)], "only Claude's copy remains");
  assert.deepEqual(readRecord(home).folders, realRecord, "the record is back to its names, no more, no fewer");
  assert.deepEqual(
    NON_CLAUDE.map((tool) => SKILL_DIRS[tool].map((rel) => fs.readdirSync(path.join(home, rel)).sort())),
    skillsBefore,
    "no other entry was lost from any skills dir"
  );
  const again = ok(runAkili(home, ["install", "--tool", "opencode"]));
  assert.equal(again.stdout.includes("REMOVED"), false, "a second run has nothing to remove");
});

test("FR-2 Upgrade: Cursor's run alone clears the shared root (the order Codex-first is not required)", (t) => {
  const home = mkTmp(t, "cov-upg-cursor-");
  seedRealLeak(path.join(home, ".agents", "skills"));
  const run = ok(runAkili(home, ["install", "--tool", "cursor"]));
  assert.equal(removedLines(run.stdout).length, 1);
  assert.equal(fs.existsSync(path.join(home, ".agents", "skills", PLUGIN)), false);
});

test("FR-2 Upgrade: Grok Bot with no ownership record still removes the leaked copy and never records it", (t) => {
  const home = mkTmp(t, "cov-norec-");
  seedRealLeak(path.join(home, SKILL_DIRS.grokbot[0]));
  const run = ok(runAkili(home, ["install", "--tool", "grokbot"]));
  assert.equal(removedLines(run.stdout).length, 1);
  assert.deepEqual(findNamed(home, PLUGIN), []);
  assert.equal(readRecord(home).folders.includes(PLUGIN), false);
});

test("FR-2 Upgrade: --dry-run names the removal and leaves the copy and the record as they were", (t) => {
  const home = mkTmp(t, "cov-dry-");
  ok(runAkili(home, ["install", "--tool", "grokbot"]));
  const dir = path.join(home, SKILL_DIRS.grokbot[0]);
  seedRealLeak(dir);
  writeRecord(home, [...readRecord(home).folders, PLUGIN]);
  const before = snapshot(path.join(home, "gb"));
  const run = ok(runAkili(home, ["install", "--tool", "grokbot", "--dry-run"]));
  assert.match(run.stdout, /would remove akili-panel/);
  assert.equal(removedLines(run.stdout).length, 0, "a dry run removes nothing");
  assert.deepEqual(snapshot(path.join(home, "gb")), before, "not one byte changed");
});

test("FR-2 Upgrade: an invalid ownership record blocks the removal in install and doctor --fix, and is not rewritten", (t) => {
  const home = mkTmp(t, "cov-invalid-");
  ok(runAkili(home, ["install", "--tool", "grokbot"]));
  const dir = path.join(home, SKILL_DIRS.grokbot[0]);
  seedRealLeak(dir);
  fs.writeFileSync(path.join(home, RECORD_REL), "{not json\n");
  for (const args of [["install", "--tool", "grokbot"], ["doctor", "--tool", "grokbot", "--fix"]]) {
    const run = runAkili(home, args);
    assert.notEqual(run.status, 0, `${args[0]} under an invalid record exits non-zero`);
    assert.equal(removedLines(run.stdout).length, 0, `${args[0]}: no REMOVED line`);
    assert.ok(fs.existsSync(path.join(dir, PLUGIN, ".claude-plugin", "plugin.json")), `${args[0]}: the copy stays`);
    assert.equal(fs.readFileSync(path.join(home, RECORD_REL), "utf8"), "{not json\n", `${args[0]}: the record stays`);
  }
  assert.match(runAkili(home, ["doctor", "--tool", "grokbot", "--fix"]).stdout, /LEAKED\s+akili-panel/);
});

// --------------------------- FR-2 / FR-4 foreign shapes against every code path

const FOREIGN = {
  "no plugin.json": (d) => {
    fs.mkdirSync(path.join(d, PLUGIN), { recursive: true });
    fs.writeFileSync(path.join(d, PLUGIN, "notes.txt"), "mine\n");
  },
  "plugin.json and SKILL.md": (d) => {
    seedLeak(d);
    fs.writeFileSync(path.join(d, PLUGIN, "SKILL.md"), "---\nname: akili-panel\n---\n");
  },
  "plugin.json naming another plugin": (d) => {
    fs.mkdirSync(path.join(d, PLUGIN, ".claude-plugin"), { recursive: true });
    fs.writeFileSync(path.join(d, PLUGIN, ".claude-plugin", "plugin.json"), '{"name":"other"}\n');
  },
  "plugin.json with no name": (d) => {
    fs.mkdirSync(path.join(d, PLUGIN, ".claude-plugin"), { recursive: true });
    fs.writeFileSync(path.join(d, PLUGIN, ".claude-plugin", "plugin.json"), '{"version":"1.0.0"}\n');
  },
  "plugin.json that is null": (d) => {
    fs.mkdirSync(path.join(d, PLUGIN, ".claude-plugin"), { recursive: true });
    fs.writeFileSync(path.join(d, PLUGIN, ".claude-plugin", "plugin.json"), "null\n");
  },
  "plugin.json that is not JSON": (d) => {
    fs.mkdirSync(path.join(d, PLUGIN, ".claude-plugin"), { recursive: true });
    fs.writeFileSync(path.join(d, PLUGIN, ".claude-plugin", "plugin.json"), "{broken\n");
  },
  "a plain file": (d) => {
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, PLUGIN), "a file\n");
  },
};

for (const [label, seed] of Object.entries(FOREIGN)) {
  for (const tool of ["opencode", "grokbot"]) {
    test(`FR-2/FR-4 foreign akili-panel (${label}) on ${tool}: install, --force, doctor and --fix leave it, even when the record lists the name`, (t) => {
      const home = mkTmp(t, "cov-foreign-");
      ok(runAkili(home, ["install", "--tool", tool]));
      const dir = path.join(home, SKILL_DIRS[tool][0]);
      seed(dir);
      if (tool === "grokbot") writeRecord(home, [...readRecord(home).folders, PLUGIN]);
      const entry = path.join(dir, PLUGIN);
      const isDir = fs.statSync(entry).isDirectory();
      const read = () => (isDir ? snapshot(entry) : fs.readFileSync(entry, "utf8"));
      const before = read();
      for (const args of [["install"], ["install", "--force"], ["doctor"], ["doctor", "--fix"]]) {
        const run = ok(runAkili(home, [args[0], "--tool", tool, ...args.slice(1)]), args.join(" "));
        assert.equal(run.stdout.includes("REMOVED"), false, `${args.join(" ")}: no REMOVED line`);
        assert.equal(run.stdout.includes("LEAKED"), false, `${args.join(" ")}: no LEAKED line`);
        assert.equal(masked(run, home).includes(PLUGIN), false, `${args.join(" ")}: nothing printed about it:\n${run.stdout}`);
        assert.deepEqual(read(), before, `${args.join(" ")}: the folder is untouched`);
      }
    });
  }
}

test("FR-2/FR-4 a symlink named akili-panel to a leaked-looking folder is no leaked copy: link and target stay", posixOnly, (t) => {
  const home = mkTmp(t, "cov-flink-");
  const outside = mkTmp(t, "cov-flink-out-");
  seedLeak(outside);
  ok(runAkili(home, ["install", "--tool", "opencode"]));
  const link = path.join(home, SKILL_DIRS.opencode[0], PLUGIN);
  fs.symlinkSync(path.join(outside, PLUGIN), link);
  for (const args of [["install", "--tool", "opencode"], ["doctor", "--tool", "opencode", "--fix"]]) {
    const run = ok(runAkili(home, args));
    assert.equal(/REMOVED|LEAKED/.test(run.stdout), false, run.stdout);
    assert.ok(fs.lstatSync(link).isSymbolicLink(), "the link stays");
    assert.ok(fs.existsSync(path.join(outside, PLUGIN, ".claude-plugin", "plugin.json")), "its target stays");
  }
});

// -------------------------------------------------------- FR-2 CHANGELOG note

test("FR-2 CHANGELOG: Unreleased tells upgraders to run install --tool all and --tool grokbot once after updating", () => {
  const log = fs.readFileSync(path.join(REPO_ROOT, "CHANGELOG.md"), "utf8");
  const start = log.indexOf("## [Unreleased]");
  const unreleased = log.slice(start, log.indexOf("\n## [", start + 1));
  assert.match(unreleased, /run `akili install --tool all` \(and `--tool grokbot` where used\) once after updating/);
});

// ------------------------------------------------------------------- FR-3

test("FR-3 list with several plugins: both under Plugins:, none under Skills:, the summary reads `32 skills | 2 plugins`", (t) => {
  const copy = copyPackage(t);
  const second = path.join(copy, ".claude", "skills", "second-panel", ".claude-plugin");
  fs.mkdirSync(second, { recursive: true });
  fs.writeFileSync(path.join(second, "plugin.json"), '{"name":"second-panel"}\n');
  const bin = path.join(copy, "bin", "akili.js");
  const home = mkTmp(t, "cov-list2-");
  const run = ok(runAkili(home, ["list"], { bin }));
  assert.deepEqual(block(run.stdout, "Plugins"), [PLUGIN, "second-panel"]);
  const skills = block(run.stdout, "Skills");
  assert.equal(skills.length, 32);
  assert.equal(skills.includes("second-panel"), false);
  assert.match(run.stdout, /\| 32 skills \| 2 plugins \|/);

  ok(runAkili(home, ["install", "--tool", "opencode"], { bin }));
  assert.deepEqual(findNamed(home, "second-panel"), [], "a second plugin stays away from other targets too");
  ok(runAkili(home, ["install", "--tool", "claude"], { bin }));
  assert.deepEqual(findNamed(home, "second-panel"), [path.join(".claude", "skills", "second-panel")]);
});

test("FR-3 an entry with plugin.json and SKILL.md is a skill: counted under Skills:, not under Plugins:", (t) => {
  const copy = copyPackage(t);
  const dir = path.join(copy, ".claude", "skills", "hybrid");
  fs.mkdirSync(path.join(dir, ".claude-plugin"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".claude-plugin", "plugin.json"), '{"name":"hybrid"}\n');
  fs.writeFileSync(path.join(dir, "SKILL.md"), "---\nname: hybrid\n---\n");
  const run = ok(runAkili(mkTmp(t, "cov-hybrid-"), ["list"], { bin: path.join(copy, "bin", "akili.js") }));
  assert.ok(block(run.stdout, "Skills").includes("hybrid"));
  assert.deepEqual(block(run.stdout, "Plugins"), [PLUGIN]);
  assert.match(run.stdout, /\| 33 skills \| 1 plugin \|/);
});

// ------------------------------------------------------------------- FR-4

for (const tool of NON_CLAUDE) {
  test(`FR-4 doctor --tool ${tool}: the ok count is commands + 32 skills + resources, so the plugin is no skill, present or missing`, (t) => {
    const home = mkTmp(t, `cov-count-${tool}-`);
    ok(runAkili(home, ["install", "--tool", tool]));
    const run = ok(runAkili(home, ["doctor", "--tool", tool]));
    assert.match(run.stdout, new RegExp(`ok ${COMMAND_COUNT + 32 + RESOURCE_COUNT} \\| missing 0 \\| fixed 0`), run.stdout);
  });
}

test("FR-4 doctor --tool claude: the plugin adds exactly one to the ok count", (t) => {
  const home = mkTmp(t, "cov-count-claude-");
  ok(runAkili(home, ["install", "--tool", "claude"]));
  const run = ok(runAkili(home, ["doctor", "--tool", "claude"]));
  assert.match(run.stdout, new RegExp(`ok ${COMMAND_COUNT + 32 + RESOURCE_COUNT + 1} \\| missing 0 \\| fixed 0`), run.stdout);
});

test("FR-4 Other tools: a stale record entry with no folder is not reported and counts no problem on Grok Bot", (t) => {
  const home = mkTmp(t, "cov-stale-");
  ok(runAkili(home, ["install", "--tool", "grokbot"]));
  writeRecord(home, [...readRecord(home).folders, PLUGIN]);
  const run = ok(runAkili(home, ["doctor", "--tool", "grokbot"]));
  assert.equal(masked(run, home).includes(PLUGIN), false, run.stdout);
});

test("FR-4 --fix restores the plugin for Claude only: doctor --tool all --fix over an empty home", (t) => {
  const home = mkTmp(t, "cov-fixall-");
  const run = runAkili(home, ["doctor", "--tool", "all", "--fix"]);
  assert.equal(run.stdout.split("\n").filter((l) => /FIXED\s+akili-panel/.test(l)).length, 1, run.stdout);
  assert.deepEqual(findNamed(home, PLUGIN), [path.join(".claude", "skills", PLUGIN)]);
  assertPluginBytes(path.join(home, ".claude", "skills", PLUGIN), "doctor --fix");
});

test("FR-4 --local: doctor checks the project's Claude plugin; --fix restores it there and not in the home", (t) => {
  const home = mkTmp(t, "cov-doclocal-h-");
  const project = mkTmp(t, "cov-doclocal-p-");
  ok(runAkili(home, ["install", "--tool", "claude", "--local"], { cwd: project }));
  const dest = path.join(project, ".claude", "skills", PLUGIN);
  assert.match(ok(runAkili(home, ["doctor", "--tool", "claude", "--local"], { cwd: project })).stdout, /OK akili-panel/);
  fs.rmSync(dest, { recursive: true });
  assert.match(runAkili(home, ["doctor", "--tool", "claude", "--local"], { cwd: project }).stdout, /MISSING\s+akili-panel/);
  assert.match(runAkili(home, ["doctor", "--tool", "claude", "--local", "--fix"], { cwd: project }).stdout, /FIXED\s+akili-panel/);
  assertPluginBytes(dest, "doctor --local --fix");
  assert.deepEqual(findNamed(home, PLUGIN), []);
});

test("FR-4 Differing plugin: reported without --fix as well, and never as MISSING", (t) => {
  const home = mkTmp(t, "cov-differs-");
  ok(runAkili(home, ["install", "--tool", "claude"]));
  const dest = path.join(home, ".claude", "skills", PLUGIN);
  fs.writeFileSync(path.join(dest, "hooks", "flow.mjs"), "// edited\n");
  const before = snapshot(dest);
  const run = runAkili(home, ["doctor", "--tool", "claude"]);
  assert.match(run.stdout, /DIFFERS\s+akili-panel \(hooks\/flow\.mjs\)/);
  assert.equal(/MISSING\s+akili-panel/.test(run.stdout), false);
  assert.deepEqual(snapshot(dest), before);
});

test("FR-4 Differing plugin: a deleted file other than the manifest is DIFFERS, and --fix writes nothing", (t) => {
  const home = mkTmp(t, "cov-differs-del-");
  ok(runAkili(home, ["install", "--tool", "claude"]));
  const dest = path.join(home, ".claude", "skills", PLUGIN);
  fs.rmSync(path.join(dest, "hooks", "hooks.json"));
  const before = snapshot(dest);
  const run = runAkili(home, ["doctor", "--tool", "claude", "--fix"]);
  assert.match(run.stdout, /DIFFERS\s+akili-panel \(hooks\/hooks\.json\)/);
  assert.equal(/FIXED\s+akili-panel/.test(run.stdout), false);
  assert.deepEqual(snapshot(dest), before, "--fix never writes into a plugin that differs");
});

test("FR-4 Leaked copy: doctor --tool all --fix clears the shared root once and ends clean", (t) => {
  const home = mkTmp(t, "cov-leakall-");
  ok(runAkili(home, ["install", "--tool", "all"]));
  seedRealLeak(path.join(home, ".agents", "skills"));
  const report = runAkili(home, ["doctor", "--tool", "all"]);
  assert.notEqual(report.status, 0);
  assert.equal(report.stdout.split("\n").filter((l) => /LEAKED\s+akili-panel/.test(l)).length, 2, "one line per tool reading the shared root");
  const fix = runAkili(home, ["doctor", "--tool", "all", "--fix"]);
  assert.equal(removedLines(fix.stdout).length, 1, fix.stdout);
  assert.deepEqual(findNamed(home, PLUGIN), [path.join(".claude", "skills", PLUGIN)]);
  ok(runAkili(home, ["doctor", "--tool", "all"]));
});

// ------------------------------------------------------------------- FR-13

test("FR-13 governance: a plugin entry carries no SKILL.md and no metadata.binding, declares author and license in plugin.json, lives outside the inventory", () => {
  const gov = fs.readFileSync(path.join(REPO_ROOT, "docs", "skills", "governance.md"), "utf8");
  const start = gov.indexOf("## Plugin entries are not skills");
  assert.ok(start >= 0, "governance.md has the carve-out section");
  const section = gov.slice(start, gov.indexOf("\n## ", start + 1));
  assert.match(section, /Author and license in `plugin\.json`\. No `SKILL\.md`, and no `metadata\.binding`\./);
  assert.match(section, /outside the skill inventory/);
  assert.match(section, /Skill counts in docs and tests exclude plugin entries\./);
});

test("FR-13 the entry obeys the carve-out: author and license in plugin.json, no SKILL.md, no page or row in the skill inventory", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(SOURCE_PLUGIN, ".claude-plugin", "plugin.json"), "utf8"));
  assert.equal(manifest.name, PLUGIN);
  assert.equal(manifest.author.name, "Juan Carlos Cadavid");
  assert.equal(manifest.license, "MIT");
  assert.equal(fs.existsSync(path.join(SOURCE_PLUGIN, "SKILL.md")), false);
  assert.equal(fs.existsSync(path.join(REPO_ROOT, "docs", "skills", `${PLUGIN}.md`)), false);
  for (const doc of [path.join("docs", "skills", "README.md"), path.join("docs", "overview.md")]) {
    assert.equal(fs.readFileSync(path.join(REPO_ROOT, doc), "utf8").includes(PLUGIN), false, `${doc} has no akili-panel row`);
  }
  assert.ok(fs.existsSync(path.join(REPO_ROOT, "docs", "plugins", `${PLUGIN}.md`)), "documented under docs/plugins/");
});

// ------------------------------------------------- FR-1 README, FR-14, FR-15, D-7

test("FR-1 W-13: the READMEs state that a plugin in a project folder loads only once the project is trusted", () => {
  const root = fs.readFileSync(path.join(REPO_ROOT, "README.md"), "utf8");
  assert.match(root, /akili-panel[^\n]*loaded in a project folder only after you trust the project/);
  const plugin = fs.readFileSync(path.join(SOURCE_PLUGIN, "README.md"), "utf8");
  assert.match(plugin, /A plugin under a project's `\.claude\/skills\/` loads only once you trust that project\./);
});

test("FR-14 marketplace.json lists akili-panel at a source that resolves to the plugin with that name", () => {
  const market = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, ".claude-plugin", "marketplace.json"), "utf8"));
  const entry = market.plugins.find((p) => p.name === PLUGIN);
  assert.ok(entry, "the marketplace lists akili-panel");
  assert.equal(entry.source, "./.claude/skills/akili-panel");
  const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, entry.source, ".claude-plugin", "plugin.json"), "utf8"));
  assert.equal(manifest.name, entry.name, "the source's manifest carries the listed name");
});

test("FR-14/D-7 npm pack of the repo: no root .claude-plugin/, no generated types, and the plugin itself is packed", () => {
  const pack = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    shell: process.platform === "win32",
  });
  assert.equal(pack.status, 0, pack.stderr);
  const files = JSON.parse(pack.stdout)[0].files.map((f) => f.path);
  assert.deepEqual(files.filter((f) => f.startsWith(".claude-plugin/")), [], "the root marketplace folder is not packed");
  assert.deepEqual(files.filter((f) => f.includes("/.claude-plugin/types/")), []);
  assert.ok(files.includes(`.claude/skills/${PLUGIN}/.claude-plugin/plugin.json`), "the plugin manifest is packed");
  assert.deepEqual(
    files.filter((f) => f.startsWith(`.claude/skills/${PLUGIN}/`)).sort(),
    Object.keys(snapshot(SOURCE_PLUGIN)).filter((f) => !f.startsWith(".claude-plugin/types/")).map((f) => `.claude/skills/${PLUGIN}/${f}`).sort(),
    "every plugin file is packed"
  );
});

test("FR-15 git status: with the repo's .gitignore a generated types/ folder does not show as untracked", (t) => {
  const repo = mkTmp(t, "cov-git-");
  const git = (...args) => spawnSync("git", args, { cwd: repo, encoding: "utf8" });
  assert.equal(git("init", "-q").status, 0);
  fs.copyFileSync(path.join(REPO_ROOT, ".gitignore"), path.join(repo, ".gitignore"));
  const manifestDir = path.join(repo, ".claude", "skills", PLUGIN, ".claude-plugin");
  fs.mkdirSync(path.join(manifestDir, "types", "claude-code"), { recursive: true });
  fs.writeFileSync(path.join(manifestDir, "plugin.json"), "{}\n");
  fs.writeFileSync(path.join(manifestDir, "types", "claude-code", "index.d.ts"), "export {};\n");
  const status = git("status", "--porcelain", "--untracked-files=all").stdout;
  assert.ok(status.includes(".claude-plugin/plugin.json"), `the control file is seen:\n${status}`);
  assert.equal(status.includes("types"), false, `types/ stays out of git status:\n${status}`);
});

test("FR-15 the repo tracks no generated types folder", () => {
  const tracked = spawnSync("git", ["ls-files", ".claude/skills"], { cwd: REPO_ROOT, encoding: "utf8" });
  assert.equal(tracked.status, 0, tracked.stderr);
  assert.ok(tracked.stdout.includes(`.claude/skills/${PLUGIN}/.claude-plugin/plugin.json`), "control: the manifest is tracked");
  assert.equal(tracked.stdout.includes("/.claude-plugin/types/"), false);
});

test("FR-15 a generated types/ never lands by --force or by doctor --fix of a deleted plugin", (t) => {
  const copy = copyPackage(t, { withTypes: true });
  const bin = path.join(copy, "bin", "akili.js");
  const home = mkTmp(t, "cov-types-");
  const dest = path.join(home, ".claude", "skills", PLUGIN);
  ok(runAkili(home, ["install", "--tool", "claude"], { bin }));
  ok(runAkili(home, ["install", "--tool", "claude", "--force"], { bin }));
  assert.equal(fs.existsSync(path.join(dest, ".claude-plugin", "types")), false, "--force does not copy types/");
  fs.rmSync(dest, { recursive: true });
  assert.match(runAkili(home, ["doctor", "--tool", "claude", "--fix"], { bin }).stdout, /FIXED\s+akili-panel/);
  assert.equal(fs.existsSync(path.join(dest, ".claude-plugin", "types")), false, "--fix does not copy types/");
  assertPluginBytes(dest, "doctor --fix from a package with types/");
});

// ------------------------------------------------------------------- NFR-7

test("NFR-7 CI runs `npm test` on ubuntu, macOS and Windows at Node 18 and 22, and `npm test` is node --test", () => {
  const ci = fs.readFileSync(path.join(REPO_ROOT, ".github", "workflows", "ci.yml"), "utf8");
  assert.match(ci, /os: \[ubuntu-latest, macos-latest, windows-latest\]/);
  assert.match(ci, /node: \[18, 22\]/);
  assert.match(ci, /^\s+run: npm test\s*$/m);
  assert.equal(JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")).scripts.test, "node --test");
});
