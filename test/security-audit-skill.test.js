"use strict";

// @akili-spec changes/akili-security (T1)
//
// Locks the vendored Cloudflare `security-audit` skill: the exact file set,
// the attribution a licence obligation requires, the upstream validators'
// exit-code contract, and the installed payload. The 19 names below are
// literals on purpose -- reading the expected list from the directory under
// test would assert the directory against itself.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..");
const AKILI_BIN = path.join(REPO_ROOT, "bin", "akili.js");
const SKILL_DIR = path.join(REPO_ROOT, ".claude", "skills", "security-audit");
const UPSTREAM_SHA = "c1c8a8c1471069fb0e188eeaff69b8e8db6564a8";

const EXPECTED_FILES = [
  "AI-AND-LLM.md",
  "ATTACK-CLASSES.md",
  "CLIENT-SIDE.md",
  "CLOUD-AND-DEPLOYMENT.md",
  "DATA-ISOLATION-AND-LIFECYCLE.md",
  "DESKTOP-MOBILE-AND-LOCAL-IPC.md",
  "HUNTING.md",
  "LICENSE",
  "MEMORY-SAFETY-AND-BINARY.md",
  "PROTOCOLS-RPC-AND-MESSAGING.md",
  "RECONNAISSANCE.md",
  "RESOURCE-EXHAUSTION-AND-AVAILABILITY.md",
  "SKILL.md",
  "SUPPLY-CHAIN-AND-RELEASE.md",
  "VALIDATION-AND-REPORTING.md",
  "WEB-PROTOCOL-AND-AUTH.md",
  "report-schema.json",
  "validate-coverage-ledger.cjs",
  "validate-findings.cjs",
];

function listFiles(dir) {
  return fs.readdirSync(dir).sort();
}

function mkTmp(t, prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function runValidator(t, script, content) {
  const dir = mkTmp(t, "sas-validator-");
  const file = path.join(dir, "input.json");
  fs.writeFileSync(file, content);
  return spawnSync(process.execPath, [path.join(SKILL_DIR, script), file], {
    encoding: "utf8",
    cwd: dir,
  });
}

test("vendored file set is exactly the 19 expected names, no *.test.cjs", () => {
  assert.deepEqual(listFiles(SKILL_DIR), [...EXPECTED_FILES].sort());
  assert.deepEqual(
    listFiles(SKILL_DIR).filter((f) => f.endsWith(".test.cjs")),
    []
  );
});

test("SKILL.md frontmatter carries upstream attribution and AKILI binding", () => {
  const text = fs.readFileSync(path.join(SKILL_DIR, "SKILL.md"), "utf8").replace(/\r\n/g, "\n");
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "SKILL.md has a frontmatter block");
  const fm = match[1];
  assert.match(fm, /^license: MIT$/m);
  assert.match(fm, /^ {2}author: "?Cloudflare, Inc\."?$/m);
  assert.match(fm, new RegExp(`^ {2}source: .*${UPSTREAM_SHA}`, "m"));
  assert.match(fm, /^ {2}adapted-for: "AKILI-SPECS"$/m);
  assert.match(fm, /^ {2}binding: core$/m);
});

// The pin sites agree: expected is the UPSTREAM_SHA literal above (written from the
// requirement, not derived from either file under test); the command's Step 0.1
// literal and SKILL.md `source` are each compared against it.
test("pin sites agree: the command's Step 0.1 literal, SKILL.md source and UPSTREAM_SHA name one commit", () => {
  const norm = (rel) => fs.readFileSync(path.join(REPO_ROOT, rel), "utf8").replace(/\r\n/g, "\n");
  const command = norm(".claude/commands/akili-security.md");
  const item = command.match(/^1\. \*\*Load the `security-audit` skill\.\*\*[\s\S]*?(?=\n2\. \*\*)/m);
  assert.ok(item, "command Step 0.1 (Load the `security-audit` skill) not found");
  const literals = [...new Set(item[0].match(/\b[0-9a-f]{40}\b/g) || [])];
  assert.deepEqual(literals, [UPSTREAM_SHA], "the command's Step 0.1 pin literal differs from UPSTREAM_SHA (or is absent)");
  const fm = norm(".claude/skills/security-audit/SKILL.md").match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(fm, "SKILL.md frontmatter missing");
  const source = fm[1].match(/^ {2}source: (.*)$/m);
  assert.ok(source, "SKILL.md frontmatter has no source");
  assert.deepEqual([...new Set(source[1].match(/\b[0-9a-f]{40}\b/g) || [])], [UPSTREAM_SHA], "SKILL.md source names a commit other than UPSTREAM_SHA");
});

test("LICENSE keeps the upstream copyright notice", () => {
  const licence = fs.readFileSync(path.join(SKILL_DIR, "LICENSE"), "utf8");
  assert.ok(licence.includes("Copyright (c) 2025-2026 Cloudflare, Inc."));
});

// The vendored validators open their input with O_NOFOLLOW | O_NONBLOCK and
// fail closed when the OS lacks either (native Windows). They are not patched
// (pinned upstream), so on such a host the contract is exit 1 plus the message.
const NO_FOLLOW_UNAVAILABLE =
  typeof fs.constants.O_NOFOLLOW !== "number" ||
  typeof fs.constants.O_NONBLOCK !== "number" ||
  process.platform === "win32";
const UNAVAILABLE_MESSAGE = "OS no-follow and nonblocking input protection is unavailable";

test("validate-findings.cjs exits 0 on [] and 1 on an incomplete finding", (t) => {
  if (NO_FOLLOW_UNAVAILABLE) {
    const result = runValidator(t, "validate-findings.cjs", "[]");
    assert.equal(result.status, 1);
    assert.ok(result.stderr.includes(UNAVAILABLE_MESSAGE), result.stderr);
    return;
  }
  assert.equal(runValidator(t, "validate-findings.cjs", "[]").status, 0);
  assert.equal(runValidator(t, "validate-findings.cjs", '[{"verdict":"confirmed"}]').status, 1);
});

test("validate-coverage-ledger.cjs exits 1 on an empty ledger", (t) => {
  const result = runValidator(t, "validate-coverage-ledger.cjs", "{}");
  assert.equal(result.status, 1);
  if (NO_FOLLOW_UNAVAILABLE) assert.ok(result.stderr.includes(UNAVAILABLE_MESSAGE), result.stderr);
});

test("install --tool claude lands the same 19 files", (t) => {
  const home = mkTmp(t, "sas-install-");
  const target = path.join(home, "claude");
  const result = spawnSync(
    process.execPath,
    [AKILI_BIN, "install", "--tool", "claude", "--claude-target", target],
    { encoding: "utf8", env: Object.assign({}, process.env, { HOME: home, USERPROFILE: home }) }
  );
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(listFiles(path.join(target, "skills", "security-audit")), [...EXPECTED_FILES].sort());
});
