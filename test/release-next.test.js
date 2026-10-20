// @akili-spec changes/branching-flow-dev-next
// Tests for scripts/release-next.js. Every command goes through a fake exec;
// package.json is a fixture copy in a temp root, never the repo's own.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  parseArgs,
  bumpStable,
  nextPrereleaseVersion,
  maxStable,
  evaluateGuards,
  runReleaseNext,
  atomicWriteFileSync,
} = require("../scripts/release-next.js");

const REGISTRY = "https://registry.npmjs.org/";
const PUBLISH_ARGV = ["publish", "--tag", "next", "--access", "public", `--registry=${REGISTRY}`];

// Tab-indented, no trailing newline: any re-serialization changes the bytes.
const FIXTURE_PKG = '{\n\t"name": "akili-specs",\n\t"version": "2.34.1",\n\t"scripts": { "x": "y" }\n}';

function fixtureBytes(version) {
  return Buffer.from(FIXTURE_PKG.replace('"2.34.1"', `"${version}"`));
}

function makeRoot(version = "2.34.1") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "release-next-"));
  fs.writeFileSync(path.join(root, "package.json"), fixtureBytes(version));
  return root;
}

function pkgBytes(root) {
  return fs.readFileSync(path.join(root, "package.json"));
}

const DEFAULT_ANSWERS = {
  "git rev-parse --abbrev-ref HEAD": "dev\n",
  "git status --porcelain": "",
  "git fetch origin dev": "",
  "git rev-parse HEAD": "abc123\n",
  "git rev-parse origin/dev": "abc123\n",
  npmView: JSON.stringify(["2.34.0", "2.34.1"]),
  publish: "",
};

// Answers from a table; a value that is an Error is thrown, a function is called.
function makeExec(overrides = {}) {
  const answers = { ...DEFAULT_ANSWERS, ...overrides };
  const calls = [];
  const exec = (cmd, args, opts) => {
    calls.push({ cmd, args: [...args], opts });
    let key = `${cmd} ${args.join(" ")}`;
    if (cmd === "npm" && args[0] === "view") key = "npmView";
    if (cmd === "npm" && args[0] === "publish") key = "publish";
    if (!(key in answers)) throw new Error(`fakeExec: unexpected call ${key}`);
    const answer = answers[key];
    if (answer instanceof Error) throw answer;
    if (typeof answer === "function") return answer(cmd, args, opts);
    return answer;
  };
  return { exec, calls };
}

function makeSignals(events) {
  return {
    on: (sig) => events.push(`on:${sig}`),
    removeListener: (sig) => events.push(`off:${sig}`),
  };
}

function run(argv, { root = makeRoot(), answers = {}, events = [], writeFile } = {}) {
  const { exec, calls } = makeExec(answers);
  const lines = [];
  const errors = [];
  const writer = writeFile
    ? (p, d) => writeFile(p, d, events)
    : (p, d) => {
        events.push("write");
        atomicWriteFileSync(p, d);
      };
  const code = runReleaseNext({
    argv,
    root,
    exec,
    log: (m) => lines.push(String(m)),
    error: (m) => errors.push(String(m)),
    signals: makeSignals(events),
    writeFile: writer,
  });
  return { code, calls, lines, errors, out: [...lines, ...errors].join("\n"), root, events };
}

function publishCalls(calls) {
  return calls.filter((c) => c.cmd === "npm" && c.args[0] === "publish");
}

function assertNoGitMutation(calls) {
  for (const c of calls) {
    if (c.cmd === "git") {
      assert.ok(
        !["commit", "tag", "push"].includes(c.args[0]),
        `forbidden git call: git ${c.args.join(" ")}`,
      );
    }
  }
}

function guardStatus(out, name) {
  const m = out.match(new RegExp(`GUARD ${name}: (OK|FAIL)`));
  return m ? m[1] : null;
}

function assertRefused(r, failedNames, originalBytes) {
  assert.equal(r.code, 1);
  for (const n of failedNames) assert.equal(guardStatus(r.out, n), "FAIL", `${n} should FAIL in:\n${r.out}`);
  assert.equal(publishCalls(r.calls).length, 0, "npm publish must not run");
  assert.deepEqual(pkgBytes(r.root), originalBytes);
  assertNoGitMutation(r.calls);
}

// --- pure version math ---

test("nextPrereleaseVersion: first, next, numeric max, ignores other bases and preids", () => {
  assert.equal(nextPrereleaseVersion("2.35.0", ["2.34.1"]), "2.35.0-next.1");
  assert.equal(nextPrereleaseVersion("2.35.0", ["2.35.0-next.1", "2.35.0-next.2"]), "2.35.0-next.3");
  assert.equal(nextPrereleaseVersion("2.35.0", ["2.35.0-next.9", "2.35.0-next.10"]), "2.35.0-next.11");
  assert.equal(
    nextPrereleaseVersion("2.35.0", ["2.36.0-next.7", "2.35.0-rc.4", "2.35.0", "2.35.0-next.x"]),
    "2.35.0-next.1",
  );
});

test("bumpStable and maxStable", () => {
  assert.equal(bumpStable("2.34.1", "minor"), "2.35.0");
  assert.equal(bumpStable("2.34.1", "patch"), "2.34.2");
  assert.equal(bumpStable("2.34.1", "major"), "3.0.0");
  assert.equal(bumpStable("2.35.0-next.1", "minor"), null);
  assert.equal(maxStable(["2.9.0", "2.10.0", "2.10.0-next.3", "2.2.0"]), "2.10.0");
  assert.equal(maxStable(["2.1.0-next.1"]), null);
});

test("parseArgs", () => {
  assert.deepEqual(parseArgs(["minor"]), { bump: "minor", dryRun: false, otp: null });
  assert.deepEqual(parseArgs(["patch", "--dry-run"]), { bump: "patch", dryRun: true, otp: null });
  assert.deepEqual(parseArgs(["major", "--otp=123456"]), { bump: "major", dryRun: false, otp: "123456" });
  for (const bad of [[], ["foo"], ["minor", "--nope"], ["minor", "--otp=12ab"], ["minor", "--otp=12345"], ["minor", "--otp=123456789"], ["minor", "patch"]]) {
    assert.ok(parseArgs(bad).error, `expected error for ${JSON.stringify(bad)}`);
  }
});

// --- version through the runner ---

test("single-string npm view output is normalized", () => {
  const r = run(["minor", "--dry-run"], { answers: { npmView: JSON.stringify("2.34.1") } });
  assert.equal(r.code, 0);
  assert.match(r.out, /Version: 2\.35\.0-next\.1/);
});

test("published next.1 and next.2 give next.3", () => {
  const versions = ["2.34.1", "2.35.0-next.1", "2.35.0-next.2"];
  const r = run(["minor", "--dry-run"], { answers: { npmView: JSON.stringify(versions) } });
  assert.match(r.out, /Version: 2\.35\.0-next\.3/);
});

// --- usage ---

test("bad args: usage on stderr, exit 1, nothing run", () => {
  const r = run(["foo"]);
  assert.equal(r.code, 1);
  assert.ok(r.errors.length > 0);
  assert.equal(r.calls.length, 0);
  assert.deepEqual(pkgBytes(r.root), fixtureBytes("2.34.1"));
});

// --- guards ---

test("guard Branch fails alone", () => {
  const r = run(["minor"], { answers: { "git rev-parse --abbrev-ref HEAD": "feat/x\n" } });
  assertRefused(r, ["Branch"], fixtureBytes("2.34.1"));
  for (const n of ["Clean", "In sync", "Stable source", "Source published", "Base ahead"]) {
    assert.equal(guardStatus(r.out, n), "OK", n);
  }
});

test("guard Clean fails alone", () => {
  const r = run(["minor"], { answers: { "git status --porcelain": " M README.md\n" } });
  assertRefused(r, ["Clean"], fixtureBytes("2.34.1"));
  assert.equal(guardStatus(r.out, "Branch"), "OK");
});

test("guard In sync fails alone when HEAD differs from origin/dev", () => {
  const r = run(["minor"], { answers: { "git rev-parse origin/dev": "def456\n" } });
  assertRefused(r, ["In sync"], fixtureBytes("2.34.1"));
  assert.equal(guardStatus(r.out, "Clean"), "OK");
});

test("guard In sync: failed fetch fails the guard", () => {
  const r = run(["minor"], { answers: { "git fetch origin dev": new Error("fatal: no remote") } });
  assertRefused(r, ["In sync"], fixtureBytes("2.34.1"));
});

test("guard Stable source: prerelease package.json; Base ahead is n/a", () => {
  const root = makeRoot("2.35.0-next.1");
  const r = run(["minor"], {
    root,
    answers: { npmView: JSON.stringify(["2.34.1", "2.35.0-next.1"]) },
  });
  assertRefused(r, ["Stable source", "Base ahead"], fixtureBytes("2.35.0-next.1"));
  assert.match(r.out, /GUARD Base ahead: FAIL.*n\/a/);
  assert.equal(guardStatus(r.out, "Source published"), "OK");
});

test("guard Source published fails alone", () => {
  const r = run(["minor"], { answers: { npmView: JSON.stringify(["2.34.0"]) } });
  assertRefused(r, ["Source published"], fixtureBytes("2.34.1"));
  assert.equal(guardStatus(r.out, "Base ahead"), "OK");
});

test("guard Base ahead fails alone when the base is already published", () => {
  const r = run(["minor"], { answers: { npmView: JSON.stringify(["2.34.1", "2.35.0"]) } });
  assertRefused(r, ["Base ahead"], fixtureBytes("2.34.1"));
  assert.equal(guardStatus(r.out, "Source published"), "OK");
});

test("stale base: patch on 2.34.1 while 2.34.2 is published", () => {
  const r = run(["patch"], { answers: { npmView: JSON.stringify(["2.34.1", "2.34.2"]) } });
  assertRefused(r, ["Base ahead"], fixtureBytes("2.34.1"));
});

test("several failing guards are all named", () => {
  const r = run(["minor"], {
    answers: { "git rev-parse --abbrev-ref HEAD": "feat/x\n", "git status --porcelain": "?? a\n" },
  });
  assertRefused(r, ["Branch", "Clean"], fixtureBytes("2.34.1"));
});

test("origin/dev missing: In sync fails, the run continues", () => {
  const r = run(["minor"], {
    answers: { "git rev-parse origin/dev": new Error("fatal: ambiguous argument 'origin/dev'") },
  });
  assertRefused(r, ["In sync"], fixtureBytes("2.34.1"));
  assert.match(r.out, /Version: 2\.35\.0-next\.1/);
  assert.equal(guardStatus(r.out, "Branch"), "OK");
});

test("npm view failure fails Source published and Base ahead", () => {
  const r = run(["minor"], { answers: { npmView: new Error("network") } });
  assertRefused(r, ["Source published", "Base ahead"], fixtureBytes("2.34.1"));
});

test("evaluateGuards: null facts fail with unreadable, in FR-3 order", () => {
  const guards = evaluateGuards({
    branch: null, porcelain: null, fetchError: null, head: null, originDev: null,
    pkgVersion: null, versions: null, base: null,
  });
  assert.deepEqual(guards.map((g) => g.name), ["Branch", "Clean", "In sync", "Stable source", "Source published", "Base ahead"]);
  assert.ok(guards.every((g) => g.ok === false && typeof g.reason === "string" && g.reason.length > 0));
});

// --- dry run ---

test("--dry-run all OK: exit 0, plan printed, no write, no publish", () => {
  const r = run(["minor", "--dry-run"]);
  assert.equal(r.code, 0);
  assert.match(r.out, /Version: 2\.35\.0-next\.1/);
  assert.match(r.out, /Dist-tag: next/);
  assert.match(r.out, /Publish: npm publish --tag next --access public --registry=https:\/\/registry\.npmjs\.org\//);
  assert.match(r.out, /If interrupted: git checkout -- package\.json/);
  assert.equal(publishCalls(r.calls).length, 0);
  assert.ok(!r.events.includes("write"));
  assert.deepEqual(pkgBytes(r.root), fixtureBytes("2.34.1"));
  assertNoGitMutation(r.calls);
});

test("--dry-run off dev: exit 1, version still printed", () => {
  const r = run(["minor", "--dry-run"], { answers: { "git rev-parse --abbrev-ref HEAD": "JuankCadavid/branching-flow\n" } });
  assert.equal(r.code, 1);
  assert.match(r.out, /Version: 2\.35\.0-next\.1/);
  assert.equal(guardStatus(r.out, "Branch"), "FAIL");
  assert.ok(!r.events.includes("write"));
  assert.deepEqual(pkgBytes(r.root), fixtureBytes("2.34.1"));
});

// --- publish ---

test("success: publish argv, transient write seen inside publish, bytes restored", () => {
  const root = makeRoot();
  let seenInside = null;
  const r = run(["minor"], {
    root,
    answers: {
      publish: () => {
        seenInside = JSON.parse(pkgBytes(root).toString()).version;
        return "";
      },
    },
  });
  assert.equal(r.code, 0);
  const pubs = publishCalls(r.calls);
  assert.equal(pubs.length, 1);
  assert.deepEqual(pubs[0].args, PUBLISH_ARGV);
  assert.equal(pubs[0].opts.inherit, true);
  assert.equal(seenInside, "2.35.0-next.1");
  assert.deepEqual(pkgBytes(root), fixtureBytes("2.34.1"));
  assert.match(r.out, /npx akili-specs@next list/);
  assertNoGitMutation(r.calls);
});

test("success with --otp forwards it and never prints it", () => {
  const r = run(["minor", "--otp=123456"]);
  assert.equal(r.code, 0);
  assert.deepEqual(publishCalls(r.calls)[0].args, [...PUBLISH_ARGV, "--otp=123456"]);
  assert.ok(!r.out.includes("123456"));
});

test("publish throws: exit 1, bytes restored", () => {
  const r = run(["minor"], { answers: { publish: new Error("E403 forbidden") } });
  assert.equal(r.code, 1);
  assert.deepEqual(pkgBytes(r.root), fixtureBytes("2.34.1"));
  assert.equal(publishCalls(r.calls).length, 1);
  assertNoGitMutation(r.calls);
});

test("signal listeners are added before the write and removed after the restore", () => {
  const r = run(["minor"]);
  assert.deepEqual(r.events, [
    "on:SIGINT", "on:SIGTERM", "on:SIGHUP",
    "write", "write",
    "off:SIGINT", "off:SIGTERM", "off:SIGHUP",
  ]);
});

test("listeners are removed even when the publish throws", () => {
  const r = run(["minor"], { answers: { publish: new Error("boom") } });
  assert.deepEqual(r.events.filter((e) => e.startsWith("off:")), ["off:SIGINT", "off:SIGTERM", "off:SIGHUP"]);
});

test("restore failure: recovery command printed, exit 1", () => {
  let writes = 0;
  const r = run(["minor"], {
    writeFile: (p, d, events) => {
      writes += 1;
      events.push("write");
      if (writes === 2) throw new Error("EACCES");
      atomicWriteFileSync(p, d);
    },
  });
  assert.equal(r.code, 1);
  // r.errors only carries error() output, not the "If interrupted:" plan line.
  assert.match(r.errors.join("\n"), /could not restore package\.json.*git checkout -- package\.json/);
  assert.deepEqual(r.events.filter((e) => e.startsWith("off:")), ["off:SIGINT", "off:SIGTERM", "off:SIGHUP"]);
});
