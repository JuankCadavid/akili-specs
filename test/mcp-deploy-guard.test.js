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

// Fake clock: sleep advances it, and an optional per-call cost models a slow `npm view`.
function fakeEnv(outputs, callMs = 0) {
  const env = { t: 0, slept: [], calls: 0 };
  env.now = () => env.t;
  env.sleep = (ms) => {
    env.slept.push(ms);
    env.t += ms;
  };
  env.run = () => {
    env.calls += 1;
    env.t += callMs;
    const o = outputs(env.calls);
    if (o instanceof Error) throw o;
    return o;
  };
  return env;
}
const totalSlept = (env) => env.slept.reduce((a, b) => a + b, 0);

test("wait returns 0 when the version appears on poll 3, sleeping between polls", () => {
  const calls = [];
  const outputs = ["", "", "2.38.0\n"];
  const env = fakeEnv((n) => outputs[n - 1]);
  const run = (cmd, args) => {
    calls.push([cmd, args]);
    return env.run();
  };
  const code = guard.wait("2.38.0", { timeout: 600, interval: 15, run, sleep: env.sleep, now: env.now });
  assert.equal(code, 0);
  assert.equal(calls.length, 3);
  assert.deepEqual(calls[0], ["npm", ["view", "akili-specs@2.38.0", "version", `--registry=${NPM}`]]);
  assert.deepEqual(env.slept, [15000, 15000]);
});

test("wait returns 1 at the deadline: 600 s with 15 s polls sleeps exactly 600000 ms", () => {
  const env = fakeEnv(() => "");
  assert.equal(guard.wait("2.38.0", { timeout: 600, interval: 15, ...env }), 1);
  assert.equal(totalSlept(env), 600000);
  assert.equal(env.calls, 41);
});

test("wait never sleeps past the deadline when each npm view call is slow", () => {
  // Each call costs 20 s; a poll-count loop (40 polls) would run ~1600 s, far over 600 s.
  const env = fakeEnv(() => "", 20000);
  assert.equal(guard.wait("2.38.0", { timeout: 600, interval: 15, ...env }), 1);
  assert.ok(totalSlept(env) <= 600000, `slept ${totalSlept(env)}`);
  assert.ok(env.t < 600000 + 20000, `finished at ${env.t} ms`);
  assert.equal(env.calls, 18);
  assert.equal(env.t, 615000);
});

test("wait clamps its last sleep to the time remaining", () => {
  const env = fakeEnv(() => "");
  assert.equal(guard.wait("2.38.0", { timeout: 20, interval: 15, ...env }), 1);
  assert.deepEqual(env.slept, [15000, 5000]);
  assert.equal(env.calls, 3);
});

test("wait polls once even with a zero timeout and never sleeps", () => {
  const env = fakeEnv(() => "");
  assert.equal(guard.wait("2.38.0", { timeout: 0, interval: 15, ...env }), 1);
  assert.equal(env.calls, 1);
  assert.deepEqual(env.slept, []);
});

test("wait treats a failing npm view (E404) as not yet published", () => {
  const env = fakeEnv((n) => (n < 2 ? new Error("E404") : "2.38.0"));
  assert.equal(guard.wait("2.38.0", { timeout: 30, interval: 15, ...env }), 0);
  assert.equal(env.calls, 2);
});

test("wait passes each call a timeoutMs within the 30 s cap and the time remaining", () => {
  const timeouts = [];
  const env = fakeEnv(() => "", 20000);
  const run = (cmd, args, opts) => {
    timeouts.push(opts.timeoutMs);
    return env.run();
  };
  assert.equal(guard.wait("2.38.0", { timeout: 50, interval: 15, run, sleep: env.sleep, now: env.now }), 1);
  // t=0 rem 50000 -> 30000; t=20000+15000=35000 rem 15000 -> 15000; then the deadline has passed.
  assert.deepEqual(timeouts, [30000, 15000]);
});

test("wait gives the last call only the time remaining, floored at 1 ms", () => {
  const timeouts = [];
  const env = fakeEnv(() => "");
  const run = (cmd, args, opts) => {
    timeouts.push(opts.timeoutMs);
    return env.run();
  };
  guard.wait("2.38.0", { timeout: 20, interval: 15, run, sleep: env.sleep, now: env.now });
  assert.deepEqual(timeouts, [20000, 5000, 1]);
});

test("wait treats a timed-out call as not yet published and keeps polling", () => {
  const env = fakeEnv((n) => (n < 3 ? Object.assign(new Error("ETIMEDOUT"), { code: "ETIMEDOUT" }) : "2.38.0"));
  assert.equal(guard.wait("2.38.0", { timeout: 60, interval: 15, ...env }), 0);
  assert.equal(env.calls, 3);
});

test("verify gives its npm view a fixed 30 s timeout", () => {
  let opts;
  guard.verify(FIXTURE, "2.38.0", { run: (c, a, o) => ((opts = o), ""), readFile });
  assert.deepEqual(opts, { timeoutMs: 30000 });
});

test("main rejects a bad --timeout or --interval with exit 2 and never polls", () => {
  const boom = () => {
    throw new Error("must not run");
  };
  const deps = { run: boom, sleep: boom, now: () => 0, readFile };
  const cases = [
    ["wait", "1.2.3", "--timeout"],
    ["wait", "1.2.3", "--timeout", "--interval", "5"],
    ["wait", "1.2.3", "--interval", "abc"],
    ["wait", "1.2.3", "--interval", "0"],
    ["wait", "1.2.3", "--timeout", "NaN"],
    ["wait", "1.2.3", "--timeout", "-5"],
    ["wait", "1.2.3", "--timeout", "Infinity"],
  ];
  for (const argv of cases) assert.equal(guard.main(argv, deps), 2, argv.join(" "));
});

test("main still runs a valid wait and returns its code", () => {
  const env = fakeEnv(() => "1.2.3");
  assert.equal(guard.main(["wait", "1.2.3", "--timeout", "10", "--interval", "2"], env), 0);
  assert.equal(guard.main(["wait", "1.2.3"], env), 0);
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
