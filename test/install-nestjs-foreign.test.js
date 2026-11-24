"use strict";

// @akili-spec changes/nestjs-official-skills T3
//
// FR-3: on a target with no ownership record, an existing folder named like one
// of the six vendored official NestJS skills is AKILI's only when it holds
// UPSTREAM.md; otherwise it is foreign -- skipped whole and reported as
// installed by `npx @nestjs/skills` -- and replaced only by `install --force`,
// whole. Every test drives the real CLI as a subprocess with HOME and cwd
// pinned to a scratch directory. The fixture's file set is disjoint from
// upstream's, so a merge into the folder cannot hide behind skip-existing.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const AKILI_BIN = path.join(__dirname, "..", "bin", "akili.js");
const SOURCE_SKILLS = path.join(__dirname, "..", ".claude", "skills");
const SIX = ["nestjs", "nestjs-auth", "nestjs-data", "nestjs-feature", "nestjs-production", "nestjs-testing"];
const FOREIGN = "nestjs-auth";

// Local skills roots each no-record tool writes under `--local` with HOME = scratch.
const TARGETS = {
  claude: [".claude/skills"],
  opencode: [".config/opencode/skills"],
  antigravity: [".gemini/skills", ".gemini/config/skills", ".gemini/antigravity-cli/skills"],
  codex: [".agents/skills"],
  cursor: [".agents/skills"],
};

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function mkHome(t) {
  const home = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "akili-nest-foreign-")));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return home;
}

function run(home, args) {
  const r = spawnSync(process.execPath, [AKILI_BIN, ...args], {
    cwd: home,
    encoding: "utf8",
    env: Object.assign({}, process.env, { HOME: home, USERPROFILE: home }),
  });
  return { status: r.status, out: stripAnsi((r.stdout || "") + (r.stderr || "")) };
}

function snapshot(dir) {
  const out = {};
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else out[path.relative(dir, full).split(path.sep).join("/")] = fs.readFileSync(full).toString("hex");
    }
  })(dir);
  return out;
}

function seed(home, tool) {
  return TARGETS[tool].map((rel) => {
    const dir = path.join(home, ...rel.split("/"), FOREIGN);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, ".nestjs-skills"), "{}\n");
    fs.writeFileSync(path.join(dir, "my-custom-rules.txt"), "developer-only\n");
    return dir;
  });
}

for (const tool of Object.keys(TARGETS)) {
  test(`@akili-spec changes/nestjs-official-skills FR-3 (${tool}, no --force): a folder installed by npx @nestjs/skills is skipped whole and the other five are written`, (t) => {
    const home = mkHome(t);
    const dirs = seed(home, tool);
    const before = dirs.map(snapshot);

    const r = run(home, ["install", "--tool", tool, "--local"]);

    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /skip foreign .*nestjs-auth \(installed by npx @nestjs\/skills\)/, "THEN stdout names it foreign with the marker note");
    dirs.forEach((dir, i) => {
      assert.deepEqual(snapshot(dir), before[i], "AND the folder is byte-identical");
      assert.equal(fs.existsSync(path.join(dir, "SKILL.md")), false, "AND no AKILI file appeared inside it");
      assert.equal(fs.existsSync(path.join(dir, "UPSTREAM.md")), false);
      assert.equal(fs.existsSync(path.join(dir, "references")), false);
      const root = path.dirname(dir);
      for (const name of SIX.filter((n) => n !== FOREIGN)) {
        assert.equal(fs.existsSync(path.join(root, name, "SKILL.md")), true, `AND ${name} was written`);
      }
    });
  });

  test(`@akili-spec changes/nestjs-official-skills FR-3 (${tool}, --force): the folder is replaced whole`, (t) => {
    const home = mkHome(t);
    const dirs = seed(home, tool);

    const r = run(home, ["install", "--tool", tool, "--local", "--force"]);

    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /replace foreign .*nestjs-auth/);
    dirs.forEach((dir) => {
      assert.deepEqual(snapshot(dir), snapshot(path.join(SOURCE_SKILLS, FOREIGN)), "THEN the folder equals the vendored tree");
      assert.equal(fs.existsSync(path.join(dir, "my-custom-rules.txt")), false, "AND the custom file is gone");
    });
  });

  test(`@akili-spec changes/nestjs-official-skills FR-3 (${tool}, doctor): a foreign folder is not compared`, (t) => {
    const home = mkHome(t);
    // A real upstream-installed folder carries a SKILL.md; the install fixtures
    // above omit it on purpose (disjoint file set), doctor needs it to see the skill.
    seed(home, tool).forEach((dir) => fs.writeFileSync(path.join(dir, "SKILL.md"), "---\nname: nestjs-auth\n---\nmine\n"));
    run(home, ["install", "--tool", tool, "--local"]);

    const r = run(home, ["doctor", "--tool", tool, "--local"]);

    assert.match(r.out, /nestjs-auth.*\(not AKILI's copy; not compared\)/, r.out);
    assert.doesNotMatch(r.out, /DIFFERS.*nestjs-auth/);
  });
}

test("@akili-spec changes/nestjs-official-skills FR-3 (AKILI copy): a vendored folder holding UPSTREAM.md keeps skip existing", (t) => {
  const home = mkHome(t);
  const dir = path.join(home, ".claude", "skills", FOREIGN);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "UPSTREAM.md"), "akili copy\n");
  const before = snapshot(dir);

  const r = run(home, ["install", "--tool", "claude", "--local"]);

  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(r.out, /skip foreign .*nestjs-auth/);
  assert.deepEqual(snapshot(dir), before);
});
