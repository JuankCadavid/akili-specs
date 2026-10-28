// Tests for scripts/mcp-deploy-guard.js (FR-5 guards). Every runner is injected:
// no test touches the npm registry. Expected values are literals or an
// independent `openssl` digest, never the code under test.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");

const guard = require("../scripts/mcp-deploy-guard.js");

const NPM = "https://registry.npmjs.org/";
const FIXTURE = path.join(__dirname, "fixtures", "mcp", "guard-fixture.bin");
const readFile = (p) => fs.readFileSync(p);

test("check-version accepts only X.Y.Z", () => {
  assert.equal(guard.checkVersion("2.38.0"), true);
  for (const bad of ["2.38.0-next.1", "v2.38.0", "2.38", "1.2.3; rm -rf /", "1.2.3\n", ""]) {
    assert.equal(guard.checkVersion(bad), false, JSON.stringify(bad));
  }
});

test("wait returns 0 when the version appears on poll 3, sleeping between polls", () => {
  const calls = [];
  const sleeps = [];
  const outputs = ["", "", "2.38.0\n"];
  const run = (cmd, args) => {
    calls.push([cmd, args]);
    return outputs[calls.length - 1];
  };
  const code = guard.wait("2.38.0", { timeout: 600, interval: 15, run, sleep: (ms) => sleeps.push(ms) });
  assert.equal(code, 0);
  assert.equal(calls.length, 3);
  assert.deepEqual(calls[0], ["npm", ["view", "akili-specs@2.38.0", "version", `--registry=${NPM}`]]);
  assert.deepEqual(sleeps, [15000, 15000]);
});

test("wait returns 1 after the timeout with timeout/interval polls", () => {
  let polls = 0;
  const run = () => {
    polls += 1;
    return "";
  };
  assert.equal(guard.wait("2.38.0", { timeout: 600, interval: 15, run, sleep() {} }), 1);
  assert.equal(polls, 600 / 15);
});

test("wait treats a failing npm view as not yet published", () => {
  let polls = 0;
  const run = () => {
    polls += 1;
    if (polls < 2) throw new Error("E404");
    return "2.38.0";
  };
  assert.equal(guard.wait("2.38.0", { timeout: 30, interval: 15, run, sleep() {} }), 0);
});

test("verify compares the full sha512 integrity of the file", () => {
  const real = "sha512-" + execFileSync("openssl", ["dgst", "-sha512", "-binary", FIXTURE]).toString("base64");
  const seen = [];
  const runWith = (integrity) => (cmd, args) => {
    seen.push([cmd, args]);
    return integrity + "\n";
  };
  assert.equal(guard.verify(FIXTURE, "2.38.0", { run: runWith(real), readFile }), 0);
  assert.deepEqual(seen[0], ["npm", ["view", "akili-specs@2.38.0", "dist.integrity", `--registry=${NPM}`]]);
  // Same 10-char prefix, different tail: a prefix compare would pass this.
  const wrongTail = real.slice(0, 10) + "A".repeat(real.length - 10);
  assert.equal(guard.verify(FIXTURE, "2.38.0", { run: runWith(wrongTail), readFile }), 1);
  assert.equal(guard.verify(FIXTURE, "2.38.0", { run: () => "", readFile }), 1);
});

const goodPayload = (v, n = 14) =>
  JSON.stringify({ akiliVersion: v, commands: Array.from({ length: n }, (_, i) => ({ name: `c${i}` })) });
const smokeOf = (text, v = "2.38.0") => guard.smoke("result.json", v, { readFile: () => Buffer.from(text) });

test("smoke passes on the right version and 14 commands", () => {
  assert.equal(smokeOf(goodPayload("2.38.0")), 0);
});

test("smoke fails on a wrong version, 13 commands, an error envelope, or bad JSON", () => {
  assert.equal(smokeOf(goodPayload("2.37.0")), 1);
  assert.equal(smokeOf(goodPayload("2.38.0", 13)), 1);
  assert.equal(smokeOf(JSON.stringify({ akiliVersion: "2.38.0", error: { code: "internal", message: "x" } })), 1);
  assert.equal(smokeOf("not json"), 1);
});
