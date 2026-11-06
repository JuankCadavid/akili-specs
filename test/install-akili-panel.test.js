"use strict";

// @akili-spec changes/akili-panel T2
//
// The akili-panel entry under .claude/skills/ is a Claude Code plugin, not a
// skill. The installer copies it for `claude` only and removes leaked copies
// (left by an old installer's `update`) from every other target. Every test
// drives the real CLI as a subprocess against a scratch HOME. Expected values
// are literals from the spec's requirements (FR-1, FR-2, FR-13, FR-15); nothing
// here reads docs/specs/. The skill set is derived through the same two file
// checks as the installer's predicate, never by calling bin/akili.js.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..");
const AKILI_BIN = path.join(REPO_ROOT, "bin", "akili.js");
const SOURCE_SKILLS = path.join(REPO_ROOT, ".claude", "skills");
const SOURCE_COMMANDS = path.join(REPO_ROOT, ".claude", "commands");
const PLUGIN = "akili-panel";
const SOURCE_PLUGIN = path.join(SOURCE_SKILLS, PLUGIN);
const RECORD_REL = path.join("gb", "akili", "grokbot-owned.json");

const isPluginEntry = (dir) =>
  fs.existsSync(path.join(dir, ".claude-plugin", "plugin.json")) && !fs.existsSync(path.join(dir, "SKILL.md"));
const SKILLS = fs
  .readdirSync(SOURCE_SKILLS, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !isPluginEntry(path.join(SOURCE_SKILLS, e.name)))
  .map((e) => e.name)
  .sort();
const COMMANDS = fs
  .readdirSync(SOURCE_COMMANDS)
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.slice(0, -3));

// Skills dirs per target, relative to the scratch home.
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

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function mkTmp(t, prefix) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function envFor(home) {
  return Object.assign({}, process.env, {
    HOME: home,
    USERPROFILE: home,
    CODEX_HOME: path.join(home, ".codex-env-unused"),
    CURSOR_CONFIG_DIR: path.join(home, ".cursor-env-unused"),
    AKILI_GROKBOT_TARGET: path.join(home, "gb", "workflows"),
  });
}

function runAkili(home, args, opts) {
  const o = opts || {};
  const result = spawnSync(process.execPath, [o.bin || AKILI_BIN, ...args], {
    encoding: "utf8",
    cwd: o.cwd || home,
    env: envFor(home),
  });
  return { status: result.status, stdout: stripAnsi(result.stdout || ""), stderr: stripAnsi(result.stderr || "") };
}

function walkFiles(dir) {
  const out = [];
  (function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(path.relative(dir, full).split(path.sep).join("/"));
    }
  })(dir);
  return out.sort();
}

// Every path under `root` whose basename is the plugin name.
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

// Disqualifier guard: the skills dir exists and holds the 32 skills before
// "akili-panel is absent" means anything.
function assertSkillsInstalled(home, dirs, label) {
  assert.equal(SKILLS.length, 32, "the packaged skill set is 32 (a literal, FR-13)");
  for (const rel of dirs) {
    const dir = path.join(home, rel);
    assert.ok(fs.existsSync(dir), `${label}: skills dir ${dir} must exist`);
    const present = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && SKILLS.includes(e.name))
      .map((e) => e.name)
      .sort();
    assert.deepEqual(present, SKILLS, `${label}: ${dir} must hold all 32 skills`);
  }
}

function seedLeak(dir) {
  fs.mkdirSync(path.join(dir, PLUGIN, ".claude-plugin"), { recursive: true });
  fs.mkdirSync(path.join(dir, PLUGIN, "hooks"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, PLUGIN, ".claude-plugin", "plugin.json"),
    JSON.stringify({ name: PLUGIN, version: "1.0.0" }) + "\n"
  );
  fs.writeFileSync(path.join(dir, PLUGIN, "hooks", "hooks.json"), "{}\n");
}

function writeRecord(home, folders) {
  const p = path.join(home, RECORD_REL);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify({ version: 1, folders }, null, 2) + "\n");
}
const readRecord = (home) => JSON.parse(fs.readFileSync(path.join(home, RECORD_REL), "utf8"));

// ---------------------------------------------------------------- FR-1 Claude

test("FR-1 Claude install: plugin lands under ~/.claude/skills byte for byte, beside the 32 skills", (t) => {
  const home = mkTmp(t, "plg-claude-");
  const run = runAkili(home, ["install", "--tool", "claude"]);
  assert.equal(run.status, 0, run.stderr);
  const dest = path.join(home, ".claude", "skills", PLUGIN);
  assert.ok(fs.existsSync(path.join(dest, ".claude-plugin", "plugin.json")), "plugin.json installed");
  assertSkillsInstalled(home, SKILL_DIRS.claude, "claude");
  const srcFiles = walkFiles(SOURCE_PLUGIN);
  assert.deepEqual(walkFiles(dest), srcFiles, "installed plugin has the packaged file list");
  for (const rel of srcFiles) {
    assert.ok(
      fs.readFileSync(path.join(dest, rel)).equals(fs.readFileSync(path.join(SOURCE_PLUGIN, rel))),
      `${rel} must equal the packaged file byte for byte`
    );
  }
});

test("FR-1 Claude --local: plugin lands under ./.claude/skills of the project", (t) => {
  const home = mkTmp(t, "plg-local-home-");
  const project = mkTmp(t, "plg-local-proj-");
  const run = runAkili(home, ["install", "--tool", "claude", "--local"], { cwd: project });
  assert.equal(run.status, 0, run.stderr);
  assert.ok(fs.existsSync(path.join(project, ".claude", "skills", PLUGIN, ".claude-plugin", "plugin.json")));
  assert.deepEqual(walkFiles(path.join(project, ".claude", "skills", PLUGIN)), walkFiles(SOURCE_PLUGIN));
  assert.equal(fs.existsSync(path.join(home, ".claude")), false, "--local writes nothing under the home");
});

test("FR-1 Claude --skills-only: plugin is installed", (t) => {
  const home = mkTmp(t, "plg-skillsonly-");
  const run = runAkili(home, ["install", "--tool", "claude", "--skills-only"]);
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(walkFiles(path.join(home, ".claude", "skills", PLUGIN)), walkFiles(SOURCE_PLUGIN));
  assertSkillsInstalled(home, SKILL_DIRS.claude, "claude --skills-only");
});

test("FR-1 existing files: skipped without --force (as for a skill), overwritten with it", (t) => {
  const home = mkTmp(t, "plg-existing-");
  assert.equal(runAkili(home, ["install", "--tool", "claude"]).status, 0);
  const dest = path.join(home, ".claude", "skills", PLUGIN);
  const readme = path.join(dest, "README.md");
  const original = fs.readFileSync(readme);
  fs.writeFileSync(readme, "locally edited\n");

  const second = runAkili(home, ["install", "--tool", "claude"]);
  assert.equal(second.status, 0, second.stderr);
  const skipLine = second.stdout.split("\n").find((l) => l.includes("skip existing") && l.includes(dest));
  assert.ok(skipLine, `expected a 'skip existing' line for ${dest}; got:\n${second.stdout}`);
  assert.equal(fs.readFileSync(readme, "utf8"), "locally edited\n", "skip leaves the edited file");

  const forced = runAkili(home, ["install", "--tool", "claude", "--force"]);
  assert.equal(forced.status, 0, forced.stderr);
  const overwriteLine = forced.stdout.split("\n").find((l) => l.includes("overwrite") && l.includes(dest));
  assert.ok(overwriteLine, `expected an 'overwrite' line for ${dest}; got:\n${forced.stdout}`);
  assert.ok(fs.readFileSync(readme).equals(original), "--force restores the packaged file");
});

// ----------------------------------------------------------- FR-1 other tools

for (const tool of NON_CLAUDE) {
  test(`FR-1 ${tool}: no akili-panel anywhere, same skills as before, no output line for it`, (t) => {
    const home = mkTmp(t, `plg-${tool}-`);
    const run = runAkili(home, ["install", "--tool", tool]);
    assert.equal(run.status, 0, run.stderr);
    assertSkillsInstalled(home, SKILL_DIRS[tool], tool);
    for (const rel of SKILL_DIRS[tool]) {
      const entries = fs
        .readdirSync(path.join(home, rel), { withFileTypes: true })
        .filter((e) => e.isDirectory() && !e.name.startsWith(".") && !COMMANDS.includes(e.name))
        .map((e) => e.name)
        .sort();
      assert.deepEqual(entries, SKILLS, `${tool}: ${rel} holds exactly the skills (plus command-skills)`);
    }
    assert.deepEqual(findNamed(home, PLUGIN), [], `${tool}: no entry named ${PLUGIN} under the home`);
    assert.equal(run.stdout.includes(PLUGIN), false, `${tool}: the run prints nothing about ${PLUGIN}`);
    if (tool === "grokbot") {
      assert.equal(readRecord(home).folders.includes(PLUGIN), false, "the ownership record never lists the plugin");
    }
  });
}

test("FR-1 --tool all: akili-panel exists only under the Claude skills directory", (t) => {
  const home = mkTmp(t, "plg-all-");
  const run = runAkili(home, ["install", "--tool", "all"]);
  assert.equal(run.status, 0, run.stderr);
  assertSkillsInstalled(home, SKILL_DIRS.claude, "all/claude");
  assertSkillsInstalled(home, SKILL_DIRS.opencode, "all/opencode");
  assertSkillsInstalled(home, SKILL_DIRS.antigravity, "all/antigravity");
  assertSkillsInstalled(home, SKILL_DIRS.codex, "all/shared");
  assert.deepEqual(findNamed(home, PLUGIN), [path.join(".claude", "skills", PLUGIN)]);
});

// ------------------------------------------------------------------- FR-2

test("FR-2 update: the reinstall path installs the plugin for Claude only (install --force) and runUpdate sets force then calls runInstall", (t) => {
  const home = mkTmp(t, "plg-update-");
  assert.equal(runAkili(home, ["install", "--tool", "claude"]).status, 0);
  fs.rmSync(path.join(home, ".claude", "skills", PLUGIN), { recursive: true, force: true });
  const run = runAkili(home, ["install", "--tool", "all", "--force"]);
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(findNamed(home, PLUGIN), [path.join(".claude", "skills", PLUGIN)]);

  const src = fs.readFileSync(AKILI_BIN, "utf8");
  const start = src.indexOf("async function runUpdate");
  const alt = src.indexOf("function runUpdate");
  const from = start >= 0 ? start : alt;
  assert.ok(from >= 0, "runUpdate exists");
  const body = src.slice(from, from + 6000);
  const forceAt = body.indexOf("args.force = true");
  const installAt = body.indexOf("runInstall(args)");
  assert.ok(forceAt >= 0 && installAt > forceAt, "runUpdate sets args.force = true, then calls runInstall(args)");
});

for (const tool of NON_CLAUDE) {
  test(`FR-2 leaked copy: install --tool ${tool} removes it with a REMOVED line`, (t) => {
    const home = mkTmp(t, `plg-leak-${tool}-`);
    for (const rel of SKILL_DIRS[tool]) seedLeak(path.join(home, rel));
    if (tool === "grokbot") writeRecord(home, [PLUGIN, "tdd"]);
    const run = runAkili(home, ["install", "--tool", tool]);
    assert.equal(run.status, 0, run.stderr);
    for (const rel of SKILL_DIRS[tool]) {
      const dir = path.join(home, rel, PLUGIN);
      assert.equal(fs.existsSync(dir), false, `${tool}: ${dir} must be removed`);
      const line = run.stdout.split("\n").find((l) => l.includes("REMOVED") && l.includes(PLUGIN));
      assert.ok(line, `expected a REMOVED line; got:\n${run.stdout}`);
      assert.ok(line.includes(`Claude Code plugin, not used by ${tool}`), `REMOVED line wording: ${line}`);
    }
    assertSkillsInstalled(home, SKILL_DIRS[tool], tool);
    if (tool === "grokbot") {
      const record = readRecord(home);
      assert.equal(record.folders.includes(PLUGIN), false, "the record no longer lists akili-panel");
      assert.ok(record.folders.includes("tdd"), "the record keeps its other names");
    }
  });
}

test("FR-2 leaked copy is removed with --skills-only, kept with --commands-only and --dry-run", (t) => {
  const home = mkTmp(t, "plg-leak-modes-");
  const dir = path.join(home, ".config", "opencode", "skills");
  seedLeak(dir);
  const leak = path.join(dir, PLUGIN);
  assert.equal(runAkili(home, ["install", "--tool", "opencode", "--commands-only"]).status, 0);
  assert.ok(fs.existsSync(leak), "--commands-only leaves the leaked copy");
  const dry = runAkili(home, ["install", "--tool", "opencode", "--dry-run"]);
  assert.equal(dry.status, 0, dry.stderr);
  assert.ok(fs.existsSync(leak), "--dry-run leaves the leaked copy");
  const run = runAkili(home, ["install", "--tool", "opencode", "--skills-only"]);
  assert.equal(run.status, 0, run.stderr);
  assert.equal(fs.existsSync(leak), false, "--skills-only removes it");
  assert.match(run.stdout, /REMOVED akili-panel/);
});

test("FR-2 Codex and Cursor share one skills root: one run removes the copy once", (t) => {
  const home = mkTmp(t, "plg-leak-shared-");
  seedLeak(path.join(home, ".agents", "skills"));
  const run = runAkili(home, ["install", "--tool", "all"]);
  assert.equal(run.status, 0, run.stderr);
  assert.equal(fs.existsSync(path.join(home, ".agents", "skills", PLUGIN)), false);
  const removed = run.stdout.split("\n").filter((l) => l.includes("REMOVED") && l.includes(PLUGIN));
  assert.equal(removed.length, 1, `the shared copy is removed once; lines:\n${removed.join("\n")}`);
});

// Foreign folders named akili-panel are never removed.
const FOREIGN_CASES = {
  "no plugin.json": (d) => {
    fs.mkdirSync(path.join(d, PLUGIN), { recursive: true });
    fs.writeFileSync(path.join(d, PLUGIN, "notes.txt"), "mine\n");
  },
  "plugin.json and a SKILL.md": (d) => {
    seedLeak(d);
    fs.writeFileSync(path.join(d, PLUGIN, "SKILL.md"), "---\nname: akili-panel\ndescription: someone else's skill\n---\n");
  },
  "plugin.json naming another plugin": (d) => {
    fs.mkdirSync(path.join(d, PLUGIN, ".claude-plugin"), { recursive: true });
    fs.writeFileSync(path.join(d, PLUGIN, ".claude-plugin", "plugin.json"), JSON.stringify({ name: "other-panel" }) + "\n");
  },
};

for (const [label, seed] of Object.entries(FOREIGN_CASES)) {
  test(`FR-2 foreign folder named akili-panel (${label}) is left untouched on every non-Claude target`, (t) => {
    for (const tools of [["all"], ["grokbot"]]) {
      const home = mkTmp(t, "plg-foreign-");
      const dirs = tools[0] === "all" ? NON_CLAUDE.filter((x) => x !== "grokbot").flatMap((x) => SKILL_DIRS[x]) : SKILL_DIRS.grokbot;
      const unique = [...new Set(dirs)];
      for (const rel of unique) seed(path.join(home, rel));
      const before = unique.map((rel) => walkFiles(path.join(home, rel, PLUGIN)));
      const run = runAkili(home, ["install", "--tool", tools[0]]);
      assert.equal(run.status, 0, run.stderr);
      unique.forEach((rel, i) => {
        assert.ok(fs.existsSync(path.join(home, rel, PLUGIN)), `${rel}/${PLUGIN} must not be removed (${label})`);
        assert.deepEqual(walkFiles(path.join(home, rel, PLUGIN)), before[i], `${rel}/${PLUGIN} untouched (${label})`);
      });
      assert.equal(run.stdout.includes("REMOVED"), false, `no REMOVED line (${label})`);
      if (tools[0] === "all") {
        // Claude still receives the real plugin in its own dir.
        assert.ok(fs.existsSync(path.join(home, ".claude", "skills", PLUGIN, ".claude-plugin", "plugin.json")));
      }
    }
  });
}

// ------------------------------------------------------------------- FR-15

function copyPackage(t) {
  const copy = mkTmp(t, "plg-pkg-");
  // bin/, .claude/ and package.json, plus the resource files the installer copies.
  for (const rel of ["bin", ".claude", "package.json", ".mcp.json.example", path.join("scripts", "gsc_verify.py"), path.join("scripts", "parse_tests.js")]) {
    fs.mkdirSync(path.dirname(path.join(copy, rel)), { recursive: true });
    fs.cpSync(path.join(REPO_ROOT, rel), path.join(copy, rel), { recursive: true });
  }
  const types = path.join(copy, ".claude", "skills", PLUGIN, ".claude-plugin", "types", "claude-code");
  fs.mkdirSync(types, { recursive: true });
  fs.writeFileSync(path.join(types, "index.d.ts"), "export {};\n");
  return copy;
}

test("FR-15 generated types/ in a temporary package copy: install does not copy it and npm pack does not list it", (t) => {
  const copy = copyPackage(t);
  const home = mkTmp(t, "plg-types-home-");
  const run = runAkili(home, ["install", "--tool", "claude"], { bin: path.join(copy, "bin", "akili.js"), cwd: home });
  assert.equal(run.status, 0, run.stderr);
  const dest = path.join(home, ".claude", "skills", PLUGIN);
  assert.ok(fs.existsSync(path.join(dest, ".claude-plugin", "plugin.json")), "the plugin itself is installed");
  assert.equal(fs.existsSync(path.join(dest, ".claude-plugin", "types")), false, "types/ is not copied");
  assert.deepEqual(walkFiles(dest), walkFiles(SOURCE_PLUGIN), "installed files are exactly the packaged four");

  const pack = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: copy,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  assert.equal(pack.status, 0, pack.stderr);
  const files = JSON.parse(pack.stdout)[0].files.map((f) => f.path);
  const plugin = files.filter((f) => f.startsWith(`.claude/skills/${PLUGIN}/`)).sort();
  assert.deepEqual(plugin, [
    `.claude/skills/${PLUGIN}/.claude-plugin/plugin.json`,
    `.claude/skills/${PLUGIN}/README.md`,
    `.claude/skills/${PLUGIN}/hooks/hooks.json`,
    `.claude/skills/${PLUGIN}/hooks/register.jsx`,
  ]);
  assert.equal(files.some((f) => f.includes("/types/")), false, "no types/ file is packed");
});

test("FR-15 .gitignore: a generated types/ folder is not shown as untracked", () => {
  const probe = `.claude/skills/${PLUGIN}/.claude-plugin/types/claude-code/index.d.ts`;
  const res = spawnSync("git", ["check-ignore", "-q", probe], { cwd: REPO_ROOT, encoding: "utf8" });
  assert.equal(res.status, 0, `git check-ignore must report ${probe} as ignored (exit 0); got ${res.status}`);
});

// ------------------------------------------------------------------- FR-13

test("FR-13 the skill count is 32 and the plugin entry is not counted as a skill", () => {
  assert.equal(SKILLS.length, 32);
  assert.equal(SKILLS.includes(PLUGIN), false);
  assert.equal(isPluginEntry(SOURCE_PLUGIN), true, "the scaffold is recognised by the two file checks");
});

// ------------------------------------------------------- T3: list and doctor
// @akili-spec changes/akili-panel T3 (FR-3, FR-4, FR-15)

// The lines between a "<heading>:" line and the next blank line.
function block(stdout, heading) {
  const lines = stdout.split("\n");
  const start = lines.findIndex((l) => l.trim() === `${heading}:`);
  assert.ok(start >= 0, `output has a "${heading}:" heading; got:\n${stdout}`);
  const out = [];
  for (let i = start + 1; i < lines.length && lines[i].trim() !== ""; i++) out.push(lines[i].trim());
  return out;
}

// The doctor section of one tool: from its "Checking <TOOL>:" line to the next one.
function section(stdout, tool) {
  const lines = stdout.split("\n");
  const start = lines.findIndex((l) => l.startsWith(`Checking ${tool.toUpperCase()}:`));
  assert.ok(start >= 0, `doctor output has a Checking ${tool.toUpperCase()} section; got:\n${stdout}`);
  let end = lines.findIndex((l, i) => i > start && l.startsWith("Checking "));
  if (end < 0) end = lines.length;
  return lines.slice(start, end).join("\n");
}

test("FR-3 list: akili-panel is under Plugins:, not Skills:; summary reads 32 skills | 1 plugin", (t) => {
  const home = mkTmp(t, "plg-list-");
  const run = runAkili(home, ["list"]);
  assert.equal(run.status, 0, run.stderr);
  assert.deepEqual(block(run.stdout, "Plugins"), [PLUGIN]);
  const skills = block(run.stdout, "Skills");
  assert.equal(skills.length, 32, "Skills: lists the 32 skills");
  assert.equal(skills.includes(PLUGIN), false, "akili-panel is not under Skills:");
  assert.match(run.stdout, /Summary: \d+ commands \| 32 skills \| 1 plugin \| \d+ resources \(akili-specs v/);
  assert.ok(run.stdout.indexOf("Skills:") < run.stdout.indexOf("Plugins:"), "Plugins: comes after Skills:");
  assert.ok(run.stdout.indexOf("Plugins:") < run.stdout.indexOf("Resources:"), "Plugins: comes before Resources:");
});

test("FR-4 healthy after install --tool all: no MISSING akili-panel; Claude section shows it present", (t) => {
  const home = mkTmp(t, "plg-doc-healthy-");
  assert.equal(runAkili(home, ["install", "--tool", "all"]).status, 0);
  assertSkillsInstalled(home, SKILL_DIRS.claude, "claude");
  const run = runAkili(home, ["doctor", "--tool", "all"]);
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.equal(/MISSING\s+akili-panel/.test(run.stdout), false, "no MISSING akili-panel line");
  assert.match(section(run.stdout, "claude"), /OK akili-panel/);
});

test("FR-4 missing plugin: reported MISSING, restored by --fix", (t) => {
  const home = mkTmp(t, "plg-doc-missing-");
  assert.equal(runAkili(home, ["install", "--tool", "claude"]).status, 0);
  assertSkillsInstalled(home, SKILL_DIRS.claude, "claude");
  const dest = path.join(home, ".claude", "skills", PLUGIN);
  fs.rmSync(dest, { recursive: true, force: true });
  const report = runAkili(home, ["doctor", "--tool", "claude"]);
  assert.match(report.stdout, /MISSING\s+akili-panel/);
  assert.notEqual(report.status, 0, "a missing plugin is a problem");
  assert.equal(fs.existsSync(dest), false, "doctor without --fix writes nothing");
  const fix = runAkili(home, ["doctor", "--tool", "claude", "--fix"]);
  assert.match(fix.stdout, /FIXED\s+akili-panel/);
  assert.deepEqual(walkFiles(dest), walkFiles(SOURCE_PLUGIN), "the packaged four files are back");
  const after = runAkili(home, ["doctor", "--tool", "claude"]);
  assert.equal(after.status, 0, after.stdout);
});

test("FR-4 differing plugin: reported DIFFERS; --fix does not overwrite the edited file", (t) => {
  const home = mkTmp(t, "plg-doc-differs-");
  assert.equal(runAkili(home, ["install", "--tool", "claude"]).status, 0);
  assertSkillsInstalled(home, SKILL_DIRS.claude, "claude");
  const readme = path.join(home, ".claude", "skills", PLUGIN, "README.md");
  fs.writeFileSync(readme, "locally edited\n");
  const fix = runAkili(home, ["doctor", "--tool", "claude", "--fix"]);
  assert.match(fix.stdout, /DIFFERS\s+akili-panel \(README\.md\)/);
  assert.equal(fs.readFileSync(readme, "utf8"), "locally edited\n", "--fix never writes a differing plugin");
});

test("FR-15 doctor ignores types/: a package with a generated types/ and an installed copy with its own types/ read present, not DIFFERS", (t) => {
  const copy = copyPackage(t); // the source side carries .claude-plugin/types/
  const home = mkTmp(t, "plg-doc-types-");
  const bin = path.join(copy, "bin", "akili.js");
  assert.equal(runAkili(home, ["install", "--tool", "claude"], { bin }).status, 0);
  assertSkillsInstalled(home, SKILL_DIRS.claude, "claude");
  const installedTypes = path.join(home, ".claude", "skills", PLUGIN, ".claude-plugin", "types");
  fs.mkdirSync(installedTypes, { recursive: true });
  fs.writeFileSync(path.join(installedTypes, "index.d.ts"), "export {};\n");
  const run = runAkili(home, ["doctor", "--tool", "claude"], { bin });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.match(section(run.stdout, "claude"), /OK akili-panel/);
  assert.equal(/DIFFERS\s+akili-panel/.test(run.stdout), false, "types/ is not compared");
  // the skip-existing compare of a second install ignores it too
  const again = runAkili(home, ["install", "--tool", "claude"], { bin });
  const skip = again.stdout.split("\n").find((l) => l.includes("skip existing") && l.includes(path.join(".claude", "skills", PLUGIN)));
  assert.ok(skip && skip.includes("(identical)"), `second install reads the plugin identical; got: ${skip}`);
});

for (const tool of NON_CLAUDE) {
  test(`FR-4 doctor --tool ${tool}: names no akili-panel when no leaked copy is present`, (t) => {
    const home = mkTmp(t, `plg-doc-other-${tool}-`);
    assert.equal(runAkili(home, ["install", "--tool", tool]).status, 0);
    assertSkillsInstalled(home, SKILL_DIRS[tool], tool);
    const run = runAkili(home, ["doctor", "--tool", tool]);
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.equal(run.stdout.includes(PLUGIN), false, `doctor --tool ${tool} must not name akili-panel:\n${run.stdout}`);
  });

  test(`FR-4 doctor --tool ${tool}: a leaked copy is reported LEAKED and removed by --fix`, (t) => {
    const home = mkTmp(t, `plg-doc-leak-${tool}-`);
    assert.equal(runAkili(home, ["install", "--tool", tool]).status, 0);
    assertSkillsInstalled(home, SKILL_DIRS[tool], tool);
    for (const rel of SKILL_DIRS[tool]) seedLeak(path.join(home, rel));
    if (tool === "grokbot") writeRecord(home, [...readRecord(home).folders, PLUGIN]);
    const report = runAkili(home, ["doctor", "--tool", tool]);
    const leaked = report.stdout.split("\n").filter((l) => /LEAKED\s+akili-panel/.test(l));
    assert.equal(leaked.length, SKILL_DIRS[tool].length, `one LEAKED line per seeded copy; got:\n${report.stdout}`);
    assert.notEqual(report.status, 0, "a leaked copy is a problem");
    for (const rel of SKILL_DIRS[tool]) assert.ok(fs.existsSync(path.join(home, rel, PLUGIN)), "doctor without --fix removes nothing");
    const fix = runAkili(home, ["doctor", "--tool", tool, "--fix"]);
    assert.match(fix.stdout, /REMOVED[^\n]*akili-panel/);
    for (const rel of SKILL_DIRS[tool]) assert.equal(fs.existsSync(path.join(home, rel, PLUGIN)), false, `${rel} copy removed`);
    if (tool === "grokbot") {
      const record = readRecord(home);
      assert.equal(record.folders.includes(PLUGIN), false, "record drops akili-panel");
      assert.ok(record.folders.includes("tdd"), "the record keeps its other names");
    }
    assert.equal(runAkili(home, ["doctor", "--tool", tool]).status, 0, "clean after --fix");
  });
}

test("FR-4 doctor leaves a foreign akili-panel folder alone (no LEAKED)", (t) => {
  const home = mkTmp(t, "plg-doc-foreign-");
  assert.equal(runAkili(home, ["install", "--tool", "opencode"]).status, 0);
  const dir = path.join(home, ".config", "opencode", "skills", PLUGIN);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "SKILL.md"), "---\nname: akili-panel\n---\n");
  const run = runAkili(home, ["doctor", "--tool", "opencode", "--fix"]);
  assert.equal(run.stdout.includes("LEAKED"), false);
  assert.ok(fs.existsSync(path.join(dir, "SKILL.md")), "foreign folder kept");
});

// T3 rework 2 (FR-4): a folder that exists without plugin.json is a missing
// plugin; --fix writes the absent files only and never overwrites a present one.
test("FR-4 folder without plugin.json: --fix restores the absent file and keeps an edited one (then DIFFERS)", (t) => {
  const home = mkTmp(t, "plg-doc-partial-");
  assert.equal(runAkili(home, ["install", "--tool", "claude"]).status, 0);
  assertSkillsInstalled(home, SKILL_DIRS.claude, "claude");
  const dest = path.join(home, ".claude", "skills", PLUGIN);
  const manifest = path.join(dest, ".claude-plugin", "plugin.json");
  const readme = path.join(dest, "README.md");
  fs.rmSync(manifest);
  fs.writeFileSync(readme, "locally edited\n");
  const report = runAkili(home, ["doctor", "--tool", "claude"]);
  assert.match(report.stdout, /MISSING\s+akili-panel/);
  const fix = runAkili(home, ["doctor", "--tool", "claude", "--fix"]);
  assert.match(fix.stdout, /FIXED\s+akili-panel/);
  assert.ok(fs.readFileSync(manifest).equals(fs.readFileSync(path.join(SOURCE_PLUGIN, ".claude-plugin", "plugin.json"))), "plugin.json is back");
  assert.equal(fs.readFileSync(readme, "utf8"), "locally edited\n", "a present file is never overwritten");
  const after = runAkili(home, ["doctor", "--tool", "claude"]);
  assert.match(after.stdout, /DIFFERS\s+akili-panel \(README\.md\)/);
  assert.equal(/MISSING\s+akili-panel/.test(after.stdout), false);
});

test("FR-4 folder without plugin.json restored from a package with types/: types/ is not written", (t) => {
  const copy = copyPackage(t);
  const home = mkTmp(t, "plg-doc-partial-types-");
  const bin = path.join(copy, "bin", "akili.js");
  assert.equal(runAkili(home, ["install", "--tool", "claude"], { bin }).status, 0);
  const dest = path.join(home, ".claude", "skills", PLUGIN);
  fs.rmSync(path.join(dest, ".claude-plugin", "plugin.json"));
  assert.match(runAkili(home, ["doctor", "--tool", "claude", "--fix"], { bin }).stdout, /FIXED\s+akili-panel/);
  assert.deepEqual(walkFiles(dest), walkFiles(SOURCE_PLUGIN), "exactly the packaged four, no types/");
});

test("FR-4 folder with a SKILL.md and no plugin.json: BLOCKED line, nothing written, no auto-repair promise", (t) => {
  const home = mkTmp(t, "plg-doc-skillmd-");
  assert.equal(runAkili(home, ["install", "--tool", "claude"]).status, 0);
  assertSkillsInstalled(home, SKILL_DIRS.claude, "claude");
  const dest = path.join(home, ".claude", "skills", PLUGIN);
  fs.rmSync(path.join(dest, ".claude-plugin"), { recursive: true });
  fs.writeFileSync(path.join(dest, "SKILL.md"), "---\nname: akili-panel\n---\n");
  const before = walkFiles(dest);
  for (const extra of [[], ["--fix"]]) {
    const run = runAkili(home, ["doctor", "--tool", "claude", ...extra]);
    assert.match(run.stdout, /BLOCKED\s+akili-panel \(.*nothing is written\)/, run.stdout);
    assert.equal(/MISSING\s+akili-panel/.test(run.stdout), false, "no bare MISSING");
    assert.equal(/auto-repair/.test(run.stdout), false, "no promise --fix can repair it");
    assert.notEqual(run.status, 0, "still a problem");
    assert.deepEqual(walkFiles(dest), before, "nothing written");
  }
});
