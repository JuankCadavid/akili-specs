// Text contract on .github/workflows/mcp-deploy.yml (FR-5). A PRESENCE check:
// it proves the steps are written in the required order and shape, not that
// GitHub runs them as intended or that AWS accepts the calls (first real run: T7).
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const yml = fs.readFileSync(path.join(__dirname, "..", ".github", "workflows", "mcp-deploy.yml"), "utf8");
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

test("steps run in order: check-version, wait, verify, credentials, cdk deploy, smoke", () => {
  const order = [
    "node scripts/mcp-deploy-guard.js check-version",
    "node scripts/mcp-deploy-guard.js wait",
    "node scripts/mcp-deploy-guard.js verify",
    "aws-actions/configure-aws-credentials",
    "cdk deploy",
    "node scripts/mcp-deploy-guard.js smoke",
  ].map(at);
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
});

test("an unset role variable skips green, and only the service stack is deployed", () => {
  assert.match(yml, /MCP deploy skipped: no deploy role configured/);
  assert.match(yml, /vars\.AWS_ROLE_ARN/);
  assert.match(yml, /cdk deploy akili-mcp-service --require-approval never/);
  assert.doesNotMatch(yml, /akili-mcp-deploy-role/);
  assert.doesNotMatch(yml, /cdk deploy --all/);
});
