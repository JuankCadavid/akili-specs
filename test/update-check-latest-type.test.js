"use strict";

// quick/update-check-latest-type — a `latest` that is not a string, read from
// the update cache (~/.akili-specs-update.json) or from the registry, must
// never crash the CLI and must never be written to the cache. Before the fix,
// `isNewerVersion` called `localeCompare` on it and `akili check-update`
// exited 1 with a TypeError. Each case runs the CLI in a child process with a
// temp HOME and https.get redirected to a local server
// (test/fixtures/update-check/registry-redirect.js).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const BIN = path.join(__dirname, "..", "bin", "akili.js");
const PRELOAD = path.join(__dirname, "fixtures", "update-check", "registry-redirect.js");
const CAP_MS = 15000;

const BAD_LATEST = {
  number: 123,
  object: { version: "999.0.0" },
  array: ["999.0.0"],
};

function serve(body) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      server.hits++;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(body);
    });
    server.hits = 0;
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function run(server, args, seedCache) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "akili-latest-type-"));
  const cachePath = path.join(home, ".akili-specs-update.json");
  if (seedCache !== undefined) fs.writeFileSync(cachePath, JSON.stringify(seedCache));
  const env = {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    AKILI_TEST_REGISTRY: `http://127.0.0.1:${server.address().port}/`,
  };
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["--require", PRELOAD, BIN, ...args], {
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    const cap = setTimeout(() => child.kill("SIGKILL"), CAP_MS);
    child.on("close", (code, signal) => {
      clearTimeout(cap);
      const cached = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : null;
      fs.rmSync(home, { recursive: true, force: true });
      resolve({ code, signal, stdout, stderr, cached });
    });
  });
}

for (const [kind, latest] of Object.entries(BAD_LATEST)) {
  test(`cached latest as ${kind}: ignored, re-fetched, replaced by the registry string`, async () => {
    const server = await serve('{"latest":"0.0.1"}');
    try {
      const r = await run(server, ["check-update"], { checkedAt: Date.now(), latest });
      assert.equal(r.signal, null);
      assert.equal(r.code, 0, r.stderr);
      assert.equal(r.stderr, "");
      assert.match(r.stdout, /is up to date\./);
      assert.equal(server.hits, 1, "the corrupt cache was not trusted, so the registry was asked");
      assert.equal(r.cached.latest, "0.0.1");
    } finally {
      server.close();
    }
  });

  test(`cached latest as ${kind}: check-update --quiet stays silent and exits 0`, async () => {
    const server = await serve('{"latest":"0.0.1"}');
    try {
      const r = await run(server, ["check-update", "--quiet"], { checkedAt: Date.now(), latest });
      assert.equal(r.code, 0, r.stderr);
      assert.equal(r.stderr, "");
      assert.equal(r.stdout, "");
    } finally {
      server.close();
    }
  });

  test(`registry latest as ${kind}: no crash and nothing cached`, async () => {
    const server = await serve(JSON.stringify({ latest }));
    try {
      const r = await run(server, ["check-update"]);
      assert.equal(r.signal, null);
      assert.equal(r.code, 0, r.stderr);
      assert.equal(r.stderr, "");
      assert.match(r.stdout, /is up to date\./);
      assert.equal(server.hits, 1);
      assert.equal(r.cached, null, "a non-string latest must not be written to the cache");
    } finally {
      server.close();
    }
  });
}
