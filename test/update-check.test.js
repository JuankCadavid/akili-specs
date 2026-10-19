"use strict";

// bugfix/update-check-deadline — the update check must settle by an overall
// deadline, not only on an idle timer. Each case runs `akili check-update` in a
// child process whose https.get is redirected (test/fixtures/update-check/
// registry-redirect.js) to a local server, with a temp HOME so the real cache
// is never read or written. Elapsed time runs from the server's first request
// to the child's exit, so Node cold start is outside every bound.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const BIN = path.join(__dirname, "..", "bin", "akili.js");
const PRELOAD = path.join(__dirname, "fixtures", "update-check", "registry-redirect.js");
const CAP_MS = 6000; // SIGKILL this long after the request reaches the server
const SPAWN_ALLOWANCE_MS = 20000; // SIGKILL this long after spawn if no request ever arrives

function serve(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.hits = 0;
    server.on("request", () => {
      if (!server.hits) server.firstHitAt = Date.now();
      server.hits++;
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function runCheckUpdate(server) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "akili-update-check-"));
  const env = {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    AKILI_TEST_REGISTRY: `http://127.0.0.1:${server.address().port}/`,
  };
  return new Promise((resolve) => {
    const spawnedAt = Date.now();
    const child = spawn(process.execPath, ["--require", PRELOAD, BIN, "check-update"], {
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    let cap = setTimeout(() => child.kill("SIGKILL"), SPAWN_ALLOWANCE_MS);
    server.once("request", () => {
      clearTimeout(cap);
      cap = setTimeout(() => child.kill("SIGKILL"), CAP_MS);
    });
    child.on("close", (code, signal) => {
      clearTimeout(cap);
      const cachePath = path.join(home, ".akili-specs-update.json");
      const cached = fs.existsSync(cachePath) ? fs.readFileSync(cachePath, "utf8") : null;
      fs.rmSync(home, { recursive: true, force: true });
      resolve({ code, signal, ms: Date.now() - (server.firstHitAt || spawnedAt), stdout, stderr, cached });
    });
  });
}

// Declares 1000 bytes, writes 13, then destroys the socket.
const cutMidBody = (status) => (req, res) => {
  res.writeHead(status, { "content-length": "1000" });
  res.write('{"latest":"9.');
  setTimeout(() => res.socket.destroy(), 100);
};

test("slow drip settles before the deadline", async () => {
  const server = await serve((req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    const timer = setInterval(() => res.write(" "), 1000);
    res.on("close", () => clearInterval(timer));
  });
  try {
    const r = await runCheckUpdate(server);
    assert.equal(server.hits, 1, "the request reached the local registry");
    assert.equal(r.signal, null, `killed at the ${CAP_MS} ms cap: still pending (${r.ms} ms)`);
    assert.equal(r.code, 0);
    assert.ok(r.ms >= 2500 && r.ms < 5000, `settled in ${r.ms} ms, expected the ~3000 ms deadline`);
    assert.equal(r.cached, null);
  } finally {
    if (server.closeAllConnections) server.closeAllConnections();
    server.close();
  }
});

for (const status of [404, 200]) {
  test(`${status} cut mid-body settles without a crash`, async () => {
    const server = await serve(cutMidBody(status));
    try {
      const r = await runCheckUpdate(server);
      assert.equal(server.hits, 1, "the request reached the local registry");
      assert.equal(r.code, 0, r.stderr);
      assert.equal(r.stderr, "");
      assert.ok(r.ms < 2500, `exited ${r.ms} ms after the request reached the server`);
      assert.match(r.stdout, /is up to date\./);
      assert.equal(r.cached, null);
    } finally {
      server.close();
    }
  });
}

test("healthy registry is unchanged and exits promptly", async () => {
  const server = await serve((req, res) => {
    res.writeHead(200);
    res.end('{"latest":"999.0.0"}');
  });
  try {
    const r = await runCheckUpdate(server);
    assert.equal(server.hits, 1, "the request reached the local registry");
    assert.equal(r.code, 0);
    assert.ok(r.ms < 2500, `exited ${r.ms} ms after the request reached the server`);
    assert.match(r.stdout, /999\.0\.0/);
    assert.match(r.cached, /"latest":"999\.0\.0"/);
  } finally {
    server.close();
  }
});
