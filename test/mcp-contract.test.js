// Text contract on .github/workflows/mcp-deploy.yml (FR-5). A PRESENCE check:
// it proves the steps are written in the required order and shape, not that
// GitHub runs them as intended or that AWS accepts the calls (first real run: T7).
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

// CRLF is normalized: a Windows checkout (core.autocrlf) would otherwise put \r before every
// line end and break the line-anchored patterns below.
const yml = fs.readFileSync(path.join(__dirname, "..", ".github", "workflows", "mcp-deploy.yml"), "utf8").replace(/\r\n/g, "\n");
const lines = yml.split("\n");

// Lines belonging to each `run:` block (inline value or following deeper-indented lines).
function runBlocks() {
  const blocks = [];
  lines.forEach((line, i) => {
    const m = line.match(/^(\s*)(?:- )?run:\s*(.*)$/);
    if (!m) return;
    const indent = m[1].length;
    const body = [m[2]];
    for (let j = i + 1; j < lines.length && (lines[j].trim() === "" || lines[j].search(/\S/) > indent); j++) {
      body.push(lines[j]);
    }
    blocks.push(body.join("\n"));
  });
  return blocks;
}

const at = (needle) => {
  const i = yml.indexOf(needle);
  assert.notEqual(i, -1, `missing: ${needle}`);
  return i;
};

test("triggers on release published and workflow_dispatch with a version input", () => {
  assert.match(yml, /release:\s*\n\s*types: \[published\]/);
  assert.match(yml, /workflow_dispatch:\s*\n\s*inputs:\s*\n\s*version:/);
});

test("a prerelease is skipped by the job guard", () => {
  assert.match(yml, /if: github\.event_name == 'workflow_dispatch' \|\| !github\.event\.release\.prerelease/);
});

test("the deploy job has a numeric timeout-minutes", () => {
  const m = yml.match(/\n {4}timeout-minutes: (\d+)\n/);
  assert.ok(m, "deploy job needs timeout-minutes");
  assert.ok(Number(m[1]) >= 20 && Number(m[1]) <= 360, `timeout-minutes ${m[1]}`);
});

test("uses the aws-mcp environment with id-token: write and no secrets", () => {
  assert.match(yml, /environment: aws-mcp/);
  assert.match(yml, /id-token: write/);
  assert.doesNotMatch(yml, /secrets\./);
});

test("no run: block interpolates an expression", () => {
  const blocks = runBlocks();
  assert.ok(blocks.length >= 6);
  for (const b of blocks) assert.doesNotMatch(b, /\$\{\{/, b);
});

test("the version reaches the shell through env: only", () => {
  assert.match(yml, /env:\s*\n\s*INPUT_VERSION: \$\{\{ inputs\.version \}\}\s*\n\s*TAG_NAME: \$\{\{ github\.event\.release\.tag_name \}\}/);
});

test("steps run in order: check-version, wait, verify, infra install, credentials, cdk deploy, smoke", () => {
  const order = [
    "node scripts/mcp-deploy-guard.js check-version",
    "node scripts/mcp-deploy-guard.js wait",
    "node scripts/mcp-deploy-guard.js verify",
    "npm ci --ignore-scripts",
    "aws-actions/configure-aws-credentials",
    "cdk deploy",
    "node scripts/mcp-deploy-guard.js smoke",
  ].map(at);
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});

test("every npm ci is script-free and every action is pinned to a full SHA", () => {
  const ci = lines.filter((l) => /\bnpm ci\b/.test(l));
  assert.equal(ci.length, 1);
  for (const l of ci) assert.match(l, /npm ci --ignore-scripts/, l);
  const uses = lines.filter((l) => /^\s*(?:- )?uses:/.test(l));
  assert.equal(uses.length, 3);
  for (const l of uses) assert.match(l, /uses: [\w.\/-]+@[0-9a-f]{40} # v\d/, l);
});

test("an unset role variable skips green, and only the service stack is deployed", () => {
  assert.match(yml, /MCP deploy skipped: no deploy role configured/);
  assert.match(yml, /vars\.AWS_ROLE_ARN/);
  assert.match(yml, /cdk deploy akili-mcp-service --require-approval never/);
  assert.doesNotMatch(yml, /akili-mcp-deploy-role/);
  assert.doesNotMatch(yml, /cdk deploy --all/);
});

// ---- T5: shipped files, leak scans and the docs contract (NFR-4, NFR-5, NFR-7, DD-8, FR-7) ----

const { spawnSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const readRoot = (p) => fs.readFileSync(path.join(ROOT, p), "utf8").replace(/\r\n/g, "\n");

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", shell: process.platform === "win32", maxBuffer: 64 * 1024 * 1024 });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")} failed:\n${r.stderr}`);
  return r.stdout;
}

// Tracked plus untracked-but-not-ignored files, so a new doc is scanned before it is committed.
function repoFiles() {
  return run("git", ["ls-files", "--cached", "--others", "--exclude-standard"])
    .split("\n")
    .filter(Boolean)
    .filter((f) => fs.existsSync(path.join(ROOT, f)));
}

// NFR-5 only: the spec folder legitimately names itself, so that scan skips it.
const outsideSpecs = (f) => !f.startsWith("docs/specs/");
// NFR-7 reads every file. AWS's documentation example account is tolerated ONLY under docs/specs/
// (unshipped spec text that quotes falsifier examples); anywhere else it is red like any other ID.
// Built from parts so this file never matches itself.
const AWS_DOC_EXAMPLE_ACCOUNT = ["1234", "5678", "9012"].join("");
const allowedId = (f, id) => f.startsWith("docs/specs/") && id === AWS_DOC_EXAMPLE_ACCOUNT;

test("NFR-4: the npm pack list has the MCP modules and the docs page, and none of the deploy files", () => {
  const out = run("npm", ["pack", "--dry-run", "--json", "--ignore-scripts", "--offline"]);
  const files = JSON.parse(out.slice(out.indexOf("["))) [0].files.map((f) => f.path);
  for (const want of ["bin/mcp-core.js", "bin/mcp-lambda.js", "docs/mcp.md"]) {
    assert.ok(files.includes(want), `pack list lacks ${want}`);
  }
  const bad = files.filter((p) => p.startsWith("infra/") || p === "scripts/mcp-deploy-guard.js" || p.startsWith("test/"));
  assert.deepEqual(bad, [], "deploy-only or test files ship in the package");
});

test("NFR-7: no account ID inside an ARN or an account field in any repo file", () => {
  const arn = new RegExp(["arn", "aws[a-z-]*", "[a-z0-9-]*", "[a-z0-9-]*", "(\\d{12})", ""].join(":"), "g");
  const field = /"account"\s*:\s*"(\d{12})"/g;
  const hits = [];
  for (const f of repoFiles()) {
    const text = fs.readFileSync(path.join(ROOT, f), "utf8");
    const ids = [...text.matchAll(arn), ...text.matchAll(field)].map((m) => m[1]);
    if (ids.some((id) => !allowedId(f, id))) hits.push(f);
  }
  assert.deepEqual(hits, [], "a file holds an account ID in ARN or account context");
});

test("NFR-5: no repo file outside the spec folder cites the spec folder path", () => {
  const needle = ["docs", "specs", "changes", "methodology-mcp"].join("/");
  const hits = repoFiles().filter(outsideSpecs).filter((f) => fs.readFileSync(path.join(ROOT, f), "utf8").includes(needle));
  assert.deepEqual(hits, [], "a shipped file or test names the spec folder");
});

test("DD-8: docs/mcp.md states the callback port and the rates from config.json", () => {
  const cfg = JSON.parse(readRoot("infra/mcp-gateway/config.json"));
  const doc = readRoot("docs/mcp.md");
  assert.ok(doc.includes(`--callback-port ${cfg.callbackPort} `), "callback port differs from config.json");
  assert.ok(doc.includes(`http://localhost:${cfg.callbackPort}/callback`), "redirect URL differs from config.json");
  assert.ok(doc.includes(`${cfg.rateLimits.perUserPerMinute} requests per minute per user`), "per-user rate differs");
  assert.ok(doc.includes(`${cfg.rateLimits.globalPerSecond} requests per second across everyone`), "global rate differs");
  assert.ok(doc.includes(`$${cfg.budgetUsd} monthly budget`), "budget differs");
  assert.ok(doc.includes(`${cfg.reservedConcurrency} concurrent runs`), "concurrency differs");
  assert.ok(doc.includes(`logs for ${cfg.logRetentionDays} days`), "log retention differs");
});

test("FR-7: docs/mcp.md has placeholders, the not-live note, the seven tools and unverified clients", () => {
  const doc = readRoot("docs/mcp.md");
  assert.match(doc, /<gateway-url>/);
  assert.match(doc, /<client-id>/);
  assert.match(doc, /Not live yet/);
  assert.doesNotMatch(doc, /https?:\/\/[a-z0-9.-]*amazonaws\.com/i, "a real endpoint is written in the doc");
  const { TOOL_DEFINITIONS } = require("../bin/mcp-core.js");
  assert.equal(TOOL_DEFINITIONS.length, 7);
  for (const t of TOOL_DEFINITIONS) assert.ok(doc.includes(`\`${t.name}\``), `tool ${t.name} not documented`);
  const rows = doc.split("\n").filter((l) => /^\| (Claude Desktop|Cursor|OpenCode|Codex CLI|Antigravity|Grok Bot) \|/.test(l));
  assert.equal(rows.length, 6);
  for (const r of rows) assert.match(r, /\| not verified \|$/, r);
  assert.match(readRoot("docs/infrastructure.md"), /Only the owner deploys outside CI/);
  assert.match(readRoot("docs/release-checklist.md"), /`MCP Deploy`/);
});
