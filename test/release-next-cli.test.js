// @akili-spec changes/branching-flow-dev-next
// CLI integration for scripts/release-next.js: real child process, real git
// (temp repo + bare origin), real files, real exit codes and signals. `npm`
// and `gh` are fake shims first on PATH; the real publish is unreachable.
// Author unit coverage (fake exec): test/release-next.test.js.

const test = require("node:test");
const assert = require("node:assert/strict");
const { makeProject, waitFor, skipReason } = require("./release-cli-harness");

const SKIP = skipReason();
if (SKIP) console.log(`release-next-cli: skipped (${SKIP})`);
const opts = SKIP ? { skip: SKIP } : {};

function project(t, o) {
  const p = makeProject({ scripts: ["release-next.js"], ...o });
  t.after(() => p.cleanup());
  return p;
}

function snapshot(p) {
  return { commits: p.git("rev-list", "--count", "HEAD"), head: p.git("rev-parse", "HEAD"), tags: p.git("tag"), origin: p.originRefs() };
}

test("FR-4 successful publish: --tag next, version written only during publish, no git mutation", opts, (t) => {
  const p = project(t);
  const before = snapshot(p);
  const r = p.run("release-next.js", ["minor"]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const log = p.npmLog().filter((e) => e.event === "started");
  assert.equal(log.length, 1);
  assert.deepEqual(log[0].argv, ["publish", "--tag", "next", "--access", "public", "--registry=https://registry.npmjs.org/"]);
  assert.equal(log[0].version, "2.35.0-next.1", "package.json carried the prerelease version while publishing");
  assert.equal(log[0].cwd, p.work);
  assert.deepEqual(p.pkgNow(), Buffer.from(p.pkgBytes), "package.json byte-identical afterwards");
  assert.equal(p.git("status", "--porcelain"), "", "tree clean (no leftover .tmp either)");
  assert.deepEqual(snapshot(p), before, "no commit, no tag, origin untouched");
  assert.equal(p.npmLog().filter((e) => e.event === "unexpected").length, 0);
  assert.match(r.stdout, /Published akili-specs@2\.35\.0-next\.1 under the next dist-tag/);
});

test("FR-4 --otp is forwarded; malformed otp is refused before any publish", opts, (t) => {
  const p = project(t);
  const ok = p.run("release-next.js", ["patch", "--otp=123456"]);
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.equal(p.npmLog().find((e) => e.event === "started").argv.at(-1), "--otp=123456");
  const bad = p.run("release-next.js", ["patch", "--otp=12ab"]);
  assert.equal(bad.status, 1);
  assert.equal(p.npmLog().filter((e) => e.event === "started").length, 1, "second run never published");
});

test("FR-4 failed publish: non-zero exit, package.json restored, tree clean", opts, (t) => {
  const p = project(t);
  const r = p.run("release-next.js", ["minor"], { FAKE_NPM_PUBLISH_EXIT: "1" });
  assert.notEqual(r.status, 0);
  assert.equal(p.npmLog().filter((e) => e.event === "started").length, 1, "publish was attempted");
  assert.match(r.stderr, /publish failed/);
  assert.deepEqual(p.pkgNow(), Buffer.from(p.pkgBytes));
  assert.equal(p.git("status", "--porcelain"), "");
});

test("FR-3 not on dev: exit 1 naming Branch, no publish, package.json untouched", opts, (t) => {
  const p = project(t);
  p.git("switch", "-q", "-c", "feat/x");
  const r = p.run("release-next.js", ["minor"]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /GUARD Branch: FAIL/);
  assert.match(r.stderr, /failed guards: Branch/);
  assert.equal(p.npmLog().filter((e) => e.event === "started").length, 0);
  assert.deepEqual(p.pkgNow(), Buffer.from(p.pkgBytes));
});

test("FR-3 In sync: an unpushed local commit on dev refuses (real git fetch + rev-parse)", opts, (t) => {
  const p = project(t);
  p.git("commit", "-q", "--allow-empty", "-m", "local only");
  const r = p.run("release-next.js", ["minor"]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /GUARD In sync: FAIL/);
  assert.match(r.stderr, /failed guards: In sync/);
  assert.equal(p.npmLog().filter((e) => e.event === "started").length, 0);
  assert.deepEqual(p.pkgNow(), Buffer.from(p.pkgBytes));
});

test("FR-3 Clean: an uncommitted change refuses (real git status)", opts, (t) => {
  const p = project(t);
  require("fs").writeFileSync(require("path").join(p.work, "stray.txt"), "x");
  const r = p.run("release-next.js", ["minor"]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /GUARD Clean: FAIL/);
  assert.equal(p.npmLog().filter((e) => e.event === "started").length, 0);
});

test("FR-5 --dry-run on a valid dev: prints version, exit 0, nothing published or written", opts, (t) => {
  const p = project(t);
  const r = p.run("release-next.js", ["minor", "--dry-run"]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /Version: 2\.35\.0-next\.1/);
  assert.match(r.stdout, /Dist-tag: next/);
  assert.match(r.stdout, /Publish: npm publish --tag next --access public/);
  assert.equal(p.npmLog().filter((e) => e.event === "started").length, 0);
  assert.deepEqual(p.pkgNow(), Buffer.from(p.pkgBytes));
  assert.equal(p.git("status", "--porcelain"), "");
});

test("FR-5 --dry-run off dev: prints version and failed Branch guard, exit 1", opts, (t) => {
  const p = project(t);
  p.git("switch", "-q", "-c", "feat/x");
  const r = p.run("release-next.js", ["minor", "--dry-run"]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /Version: 2\.35\.0-next\.1/);
  assert.match(r.stdout, /GUARD Branch: FAIL/);
  assert.equal(p.npmLog().filter((e) => e.event === "started").length, 0);
  assert.deepEqual(p.pkgNow(), Buffer.from(p.pkgBytes));
});

test("FR-2 N increments past already-published prereleases of the same base", opts, (t) => {
  const p = project(t);
  const r = p.run("release-next.js", ["minor"], {
    FAKE_NPM_VERSIONS: JSON.stringify(["2.34.1", "2.35.0-next.1", "2.35.0-next.2"]),
  });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(p.npmLog().find((e) => e.event === "started").version, "2.35.0-next.3");
  assert.deepEqual(p.pkgNow(), Buffer.from(p.pkgBytes));
});

// DD-4: SIGINT/SIGTERM/SIGHUP to the process group while publish runs. The
// fake publish dies with the group; the script must survive long enough to
// restore package.json and exit non-zero.
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  test(`DD-4 ${sig} to the process group mid-publish: package.json restored, exit non-zero`, opts, async (t) => {
    const p = project(t);
    const { child, exit } = p.spawnDetached("release-next.js", ["minor"], { FAKE_NPM_SLEEP_MS: "4000" });
    t.after(() => { try { process.kill(-child.pid, "SIGKILL"); } catch (e) {} });
    const started = await waitFor(() => p.npmLog().some((e) => e.event === "started"));
    assert.ok(started, "publish started");
    assert.equal(p.npmLog()[0].version, "2.35.0-next.1");
    assert.notDeepEqual(p.pkgNow(), Buffer.from(p.pkgBytes), "mid-publish the prerelease version is on disk");
    process.kill(-child.pid, sig);
    const res = await exit;
    assert.ok(res.code !== 0, `exit non-zero (code=${res.code} signal=${res.signal})`);
    assert.equal(res.signal, null, "script handled the signal itself instead of dying from it");
    assert.deepEqual(p.pkgNow(), Buffer.from(p.pkgBytes), "package.json byte-identical after the signal");
    assert.equal(p.git("status", "--porcelain"), "");
    assert.equal(p.npmLog().filter((e) => e.event === "finished").length, 0, "publish did not complete");
  });
}
