"use strict";

// @akili-spec changes/nestjs-official-skills T10
//
// FR-4: a retired skill folder left by an older install is reported by doctor
// (STALE), removed by doctor --fix, install and update with its replacement
// named; the shared-root tools (codex, cursor, grokbot) never scan for it.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const AKILI_BIN = path.join(__dirname, "..", "bin", "akili.js");
const OWN = { claude: ".claude/skills", opencode: ".config/opencode/skills", antigravity: ".gemini/skills" };
const SHARED = { codex: ".agents/skills", cursor: ".agents/skills", grokbot: ".grokbot/workflows" };
const NESTJS = /nestjs-expert \(retired, replaced by nestjs-feature plus the official set/;

// `update` asks the package manager how akili-specs is installed before it
// reinstalls. A stub `npm` first on PATH answers "installed" and makes the
// install step a no-op, so the test never depends on the runner's real install
// and never runs a real `npm install -g`. A shell stub needs POSIX, so the
// `update` case is skipped on Windows; `install` runs the same cleanup there.
const posixOnly = { skip: process.platform === "win32" ? "update needs a POSIX npm stub" : false };

function stubNpmDir(home) {
  const dir = path.join(home, ".npm-stub");
  fs.mkdirSync(dir, { recursive: true });
  const script = '#!/bin/sh\ncase "$1" in\n  list) echo "akili-specs@9.9.9" ;;\n  root) echo "/nonexistent-akili-root" ;;\n  *) exit 0 ;;\nesac\n';
  fs.writeFileSync(path.join(dir, "npm"), script, { mode: 0o755 });
  return dir;
}

function setup(t, tool, rel, name) {
  const home = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "akili-retired-")));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  const stub = stubNpmDir(home);
  const run = (...args) => {
    const env = Object.assign({}, process.env, { HOME: home, USERPROFILE: home });
    if (args[0] === "update") env.PATH = stub + path.delimiter + (process.env.PATH || "");
    const r = spawnSync(process.execPath, [AKILI_BIN, ...args, "--tool", tool, "--local"], {
      cwd: home,
      encoding: "utf8",
      env,
    });
    return (r.stdout + r.stderr).replace(/\x1b\[[0-9;]*m/g, "");
  };
  run("install");
  const dir = path.join(home, rel, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "SKILL.md"), "---\nname: old\n---\n");
  return { run, dir };
}

for (const [tool, rel] of Object.entries(OWN)) {
  test(`${tool}: doctor reports STALE, --fix reports REMOVED and deletes`, (t) => {
    const { run, dir } = setup(t, tool, rel, "nestjs-expert");
    assert.match(run("doctor"), new RegExp(`STALE ${NESTJS.source}.*run with --fix or akili update to remove`));
    assert.ok(fs.existsSync(dir), "doctor without --fix must not delete");
    assert.match(run("doctor", "--fix"), new RegExp(`REMOVED ${NESTJS.source}`));
    assert.ok(!fs.existsSync(dir));
  });

  for (const cmd of ["install", "update"]) {
    test(`${tool}: ${cmd} deletes the retired folder and names the replacement`, cmd === "update" ? posixOnly : {}, (t) => {
      const { run, dir } = setup(t, tool, rel, "nestjs-expert");
      assert.match(run(cmd), /deleted retired skill .*nestjs-expert \(replaced by nestjs-feature plus the official set/);
      assert.ok(!fs.existsSync(dir));
    });
  }

  test(`${tool}: a leftover gsap-core still reports gsap-animation`, (t) => {
    const { run } = setup(t, tool, rel, "gsap-core");
    assert.match(run("doctor"), /STALE gsap-core \(retired, replaced by gsap-animation — run with --fix/);
  });
}

for (const [tool, rel] of Object.entries(SHARED)) {
  test(`${tool}: a nestjs-expert folder in the shared root is untouched and not reported`, (t) => {
    const { run, dir } = setup(t, tool, rel, "nestjs-expert");
    assert.ok(fs.existsSync(dir), "precondition: the folder exists before the runs");
    const runs = [["doctor"], ["doctor", "--fix"], ["install"]];
    if (!posixOnly.skip) runs.push(["update"]);
    for (const args of runs) {
      assert.doesNotMatch(run(...args), /nestjs-expert/, args.join(" "));
      assert.ok(fs.existsSync(path.join(dir, "SKILL.md")), `${args.join(" ")} must leave it`);
    }
  });
}
