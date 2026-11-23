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

function setup(t, tool, rel, name) {
  const home = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "akili-retired-")));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  const run = (...args) => {
    const r = spawnSync(process.execPath, [AKILI_BIN, ...args, "--tool", tool, "--local"], {
      cwd: home,
      encoding: "utf8",
      env: Object.assign({}, process.env, { HOME: home, USERPROFILE: home }),
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
    test(`${tool}: ${cmd} deletes the retired folder and names the replacement`, (t) => {
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
    for (const args of [["doctor"], ["doctor", "--fix"], ["install"], ["update"]]) {
      assert.doesNotMatch(run(...args), /nestjs-expert/, args.join(" "));
      assert.ok(fs.existsSync(path.join(dir, "SKILL.md")), `${args.join(" ")} must leave it`);
    }
  });
}
