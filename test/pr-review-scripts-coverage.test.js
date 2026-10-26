"use strict";

// @akili-spec changes/akili-review (/akili-test Suite A: independent coverage of the clauses the
// author TDD suite `test/pr-review-scripts.test.js` does not prove on its own).
//
// Seams: the `post-review.cjs` CLI subcommands (design 6): prepare, check-skip, render, post.
// GitHub is the fake `gh` in test/fixtures/pr-review, selected through AKILI_GH_BIN or PATH.
// Expected values are literals copied from requirements.md at spec commit 48925ab (FR-3, FR-4,
// FR-7, FR-9, FR-10, NFR-3); nothing here reads docs/specs at runtime.
//
// AKILI_POST_REVIEW_UNDER_TEST points every test at a copy of the script (used for the falsifier
// runs recorded in the /akili-test report); the copy resolves its validator next to itself.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const SKILL_DIR = path.join(__dirname, "..", ".claude", "skills", "pr-review");
const POST = process.env.AKILI_POST_REVIEW_UNDER_TEST || path.join(SKILL_DIR, "post-review.cjs");
const FIX = path.join(__dirname, "fixtures", "pr-review");
const FAKE_GH = path.join(FIX, "fake-gh.js");
const { fingerprint } = require(path.join(SKILL_DIR, "post-review.cjs"));

const REPO = "acme/widgets";
const PRN = 42;
const API = `repos/${REPO}`;
const SHA_BASE = "1".repeat(40);
const SHA_HEAD = "2".repeat(40);
const SHA_OLD = "3".repeat(40);
const SHA_NEXT = "5".repeat(40);
const CI = "github-actions[bot]";

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

function tmpDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pr-review-cov-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

const mkFinding = (n, over = {}) => ({
  id: `F-${n}`, lens: "correctness", severity: "warning", suspect: false, confidence: 90, file: "src/a.js",
  line_start: n, line_end: n, side: "RIGHT", evidence: `+  line${n}();`, why: `WHY-${n}`, fix: null, ...over,
});
const target = { kind: "pr", pr: PRN, repo: REPO, base_sha: SHA_BASE, head_sha: SHA_HEAD };
const mkDoc = (findings, over = {}) => ({
  schema_version: "1", target, tier: "full", host_mode: "parallel", lenses: ["correctness"],
  top_risks: [], coverage: [], unspecified_changes: [], notes: [], findings, ...over,
});
const mkManifest = (over = {}) => ({
  target, tier: "full", threshold: 80, lenses: ["correctness"],
  files: [{ path: "src/a.js", status: "modified", added: 40, removed: 0, patch: "files/0001.patch", chunk: "c1" }],
  skipped_files: [], recommend_security: [], chunks: [], config_source: "default", ...over,
});
const patchOf = (n) => `@@ -1,3 +1,${n} @@\n${Array.from({ length: n }, (_, i) => `+x${i}`).join("\n")}`;
const marker = (head, run, findings) => `<!-- akili-review:v1 ${JSON.stringify({ head, run, findings })} -->`;
const comment = (id, body, login = CI) => ({ id, user: { login }, body });
const thread = (id, fp, sev, { resolved = false, by = null } = {}) => ({
  id, isResolved: resolved, isOutdated: false, resolvedBy: by ? { login: by } : null,
  comments: { nodes: [{ author: { login: "github-actions" }, body: `x\n\n<!-- akili-review:fp=${fp} sev=${sev} -->` }] },
});

function routes(over = {}) {
  const info = { state: "open", draft: false, merged: false, user: { login: "alice" }, labels: (over.labels || []).map((name) => ({ name })), head: { sha: over.prHead || SHA_HEAD } };
  const config = over.config ? { body: { type: "file", encoding: "base64", content: Buffer.from(over.config).toString("base64") } } : { status: 404, body: { message: "Not Found" } };
  return [
    { method: "GET", path: `${API}/pulls/${PRN}`, body: info },
    { method: "GET", path: `${API}/contents/.akili/review.yml`, ...config },
    { method: "GET", path: `${API}/issues/${PRN}/comments`, body: over.comments || [] },
    { method: "POST", path: "graphql", contains: "reviewThreads", body: { data: { repository: { pullRequest: { reviewThreads: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: over.threads || [] } } } } } },
    { method: "POST", path: "graphql", contains: "resolveReviewThread", body: { data: { resolveReviewThread: { thread: { id: "T", isResolved: true } } } } },
    { method: "GET", path: `${API}/pulls/${PRN}/files`, body: over.files || [{ filename: "src/a.js", patch: patchOf(40) }] },
    { method: "POST", path: `${API}/pulls/${PRN}/reviews`, body: { id: 1 } },
    { method: "POST", path: `${API}/issues/${PRN}/comments`, body: { id: 99 } },
    { method: "PATCH", path: `${API}/issues/comments/7`, body: { id: 7 } },
    { method: "GET", path: "user", body: { login: "alice" } },
  ];
}

// Runs the script with the fake gh. `via: "env"` selects it through AKILI_GH_BIN (PATH empty);
// `via: "path"` puts a `gh` shim on PATH and unsets AKILI_GH_BIN; `via: "none"` offers no gh at all.
function run(t, args, { over = {}, dir = tmpDir(t), via = "env", env: extra = {} } = {}) {
  const bin = path.join(dir, "bin");
  fs.mkdirSync(bin, { recursive: true });
  fs.writeFileSync(path.join(dir, "routes.json"), JSON.stringify({ routes: routes(over) }));
  const log = path.join(dir, "calls.jsonl");
  if (fs.existsSync(log)) fs.rmSync(log);
  const env = { ...process.env, PATH: bin, FAKE_GH_LOG: log, FAKE_GH_ROUTES: path.join(dir, "routes.json"), FAKE_GH_STATE: path.join(dir, "state.json"), ...extra };
  delete env.AKILI_GH_BIN;
  if (via === "env") env.AKILI_GH_BIN = FAKE_GH;
  if (via === "path") fs.writeFileSync(path.join(bin, "gh"), `#!/bin/sh\nexec "${process.execPath}" "${FAKE_GH}" "$@"\n`, { mode: 0o755 });
  const r = spawnSync(process.execPath, [POST, ...args], { encoding: "utf8", env });
  const calls = fs.existsSync(log) ? fs.readFileSync(log, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
  for (const c of calls) assert.ok(!c.unexpected, `unexpected gh call: ${JSON.stringify(c)}`);
  return { r, calls, dir };
}

const postArgs = (dir, extra = []) => ["post", path.join(dir, "findings.json"), "--manifest", path.join(dir, "manifest.json"), "--repo", REPO, "--pr", String(PRN), "--base", SHA_BASE, "--head", SHA_HEAD, ...extra];
function postRun(t, doc, { manifest = mkManifest(), args = [], ...opts } = {}) {
  const dir = opts.dir || tmpDir(t);
  fs.writeFileSync(path.join(dir, "findings.json"), typeof doc === "string" ? doc : JSON.stringify(doc));
  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest));
  return run(t, postArgs(dir, args), { ...opts, dir });
}
const skipArgs = (out, head = SHA_HEAD) => ["check-skip", "--repo", REPO, "--pr", String(PRN), "--head", head, "--out", out];

const isQuery = (c) => c.path === "graphql" && c.body && /^query/.test(c.body.query);
const writesOf = (calls) => calls.filter((c) => c.method !== "GET" && !isQuery(c));
const inlineOf = (calls) => { const r = calls.find((c) => c.method === "POST" && c.path === `${API}/pulls/${PRN}/reviews`); return r ? r.body.comments : []; };
const summaryOf = (calls) => {
  const w = calls.filter((c) => (c.method === "POST" && c.path === `${API}/issues/${PRN}/comments`) || c.method === "PATCH");
  assert.equal(w.length, 1, "exactly one summary write");
  return w[0].body.body;
};

// --- FR-3 "Re-run on the same head", end to end -----------------------------------------
// The author suite proves check-skip alone, and post with a hand-written skipped.json. This
// chains them as CI does (one run directory): the skip check's own artifact must stop `post`.

test("FR-3 Re-run on the same head: check-skip then post in one run directory exit 0 and write nothing, even with a critical under --fail-on critical", (t) => {
  const dir = tmpDir(t);
  const over = { comments: [comment(7, `old summary\n${marker(SHA_HEAD, 2, [])}`)] };
  const skip = run(t, skipArgs(dir), { over, dir });
  assert.equal(skip.r.stdout.trim(), "skip=true reason=a trusted summary already records this head");
  assert.deepEqual(writesOf(skip.calls), []);
  const { r, calls } = postRun(t, mkDoc([mkFinding(1, { severity: "critical" })]), { over, dir, args: ["--fail-on", "critical"] });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /skipped run, nothing posted/);
  assert.deepEqual(calls, [], "post makes no gh call at all, so it can neither post nor edit");
});

// --- FR-4 "Lockfile-only PR", end to end -----------------------------------------------

test("FR-4 Lockfile-only PR: prepare's manifest makes post apply FR-3's empty-diff skip, with no gh call", (t) => {
  const dir = tmpDir(t);
  const out = path.join(dir, "run");
  const p = run(t, ["prepare", "--diff", path.join(FIX, "lockfile-only.diff"), "--out", out, "--repo", REPO, "--pr", String(PRN), "--base", SHA_BASE, "--head", SHA_HEAD], { dir });
  assert.equal(p.r.status, 0, p.r.stderr);
  fs.writeFileSync(path.join(out, "findings.json"), JSON.stringify(mkDoc([], { tier: readJson(path.join(out, "manifest.json")).tier, lenses: readJson(path.join(out, "manifest.json")).lenses })));
  const { r, calls } = run(t, ["post", path.join(out, "findings.json"), "--manifest", path.join(out, "manifest.json"), "--repo", REPO, "--pr", String(PRN), "--base", SHA_BASE, "--head", SHA_HEAD, "--fail-on", "warning"], { dir });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /skip: the filtered diff is empty \(FR-3\)/);
  assert.deepEqual(calls, []);
});

// --- FR-4 "Small but sensitive", end to end --------------------------------------------

test("FR-4 Small but sensitive: prepare on the 6-line auth diff then render recommends exactly `/akili-security src/auth/session.js --profile quick`", (t) => {
  const dir = tmpDir(t);
  const out = path.join(dir, "run");
  assert.equal(run(t, ["prepare", "--diff", path.join(FIX, "small-auth.diff"), "--out", out, "--repo", REPO, "--pr", String(PRN), "--base", SHA_BASE, "--head", SHA_HEAD], { dir }).r.status, 0);
  const manifest = readJson(path.join(out, "manifest.json"));
  fs.writeFileSync(path.join(out, "findings.json"), JSON.stringify(mkDoc([], { target: manifest.target, tier: manifest.tier, lenses: manifest.lenses })));
  const { r, calls } = run(t, ["render", path.join(out, "findings.json"), "--manifest", path.join(out, "manifest.json")], { dir });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes("`/akili-security src/auth/session.js --profile quick`"), r.stdout);
  assert.match(r.stdout, /Tier: full/);
  assert.deepEqual(calls, []);
});

test("FR-4 Small but sensitive, BUT clause (script side): the only processes post-review.cjs spawns are this Node (the validator) and gh", () => {
  const src = fs.readFileSync(POST, "utf8");
  const spawns = [...src.matchAll(/spawnSync\(([^,]+),/g)].map((m) => m[1].trim());
  assert.deepEqual([...new Set(spawns)].sort(), ["cmd", "process.execPath"]);
  assert.ok(!/security-audit|akili-security[^\s`]*\s*\]/.test(src.replace(/`\/akili-security[^`]*`/g, "")), "no invocation of /akili-security or security-audit");
  assert.match(src, /const { spawnSync } = require\("child_process"\);/);
  assert.equal((src.match(/child_process/g) || []).length, 1, "child_process is required once, for spawnSync only");
});

// --- FR-7 "Malformed findings": AND IT MUST make post refuse (missing evidence) ---------
// The author suite drives post with confidence 120 only; this is the other half of the scenario.

test("FR-7 Malformed findings: a finding missing `evidence` makes post refuse, naming findings[1].evidence", (t) => {
  const bad = mkFinding(2);
  delete bad.evidence;
  for (const [failOn, code] of [["critical", 1], ["none", 0]]) {
    const { r, calls } = postRun(t, mkDoc([mkFinding(1, { severity: "critical" }), bad]), { args: ["--fail-on", failOn] });
    assert.equal(r.status, code, failOn);
    assert.match(r.stderr, /findings\[1\]\.evidence/);
    assert.deepEqual(writesOf(calls), [], failOn);
  }
});

// --- FR-7 threshold: "never from the findings document" ---------------------------------

test("FR-7: a `threshold` in the findings document cannot lower the bar; a 70-confidence finding still blocks posting", (t) => {
  const doc = mkDoc([mkFinding(1, { confidence: 70 })], { threshold: 10 });
  const { r, calls } = postRun(t, doc, { args: ["--fail-on", "warning"] });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /threshold|findings\[0\]\.confidence/);
  assert.deepEqual(writesOf(calls), []);
  const noKey = postRun(t, mkDoc([mkFinding(1, { confidence: 70 })]), { args: ["--fail-on", "warning"] });
  assert.match(noKey.r.stderr, /findings\[0\]\.confidence/, "control: 70 < 80 is rejected on its own");
  assert.deepEqual(writesOf(noKey.calls), []);
});

// --- FR-9 "Cap": AND IT MUST hold even if the findings file asks for more ----------------

const fourteenCriticals = () => mkDoc(Array.from({ length: 14 }, (_, i) => mkFinding(i + 1, { severity: "critical", confidence: 86 + i })));

test("FR-9 Cap: 14 non-suspect criticals still post exactly 10 inline (the cap is not a warning-only limit)", (t) => {
  const { r, calls } = postRun(t, fourteenCriticals());
  assert.equal(r.status, 0, r.stderr);
  assert.equal(inlineOf(calls).length, 10);
  assert.match(summaryOf(calls), /4 finding\(s\) are listed in this summary only, not inline \(cap 10/);
});

test("FR-9 Cap: a manifest, environment or CLI value asking for 14 inline comments does not raise the cap", (t) => {
  const manifest = mkManifest({ inline_cap: 14, max_inline: 14, cap: 14 });
  const env = { AKILI_REVIEW_INLINE_CAP: "14", AKILI_INLINE_CAP: "14", INLINE_CAP: "14", AKILI_REVIEW_MAX_INLINE: "14" };
  const { r, calls } = postRun(t, fourteenCriticals(), { manifest, env });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(inlineOf(calls).length, 10);
  for (const flag of ["--inline-cap", "--max-inline", "--cap"]) {
    const x = postRun(t, fourteenCriticals(), { args: [flag, "14"] });
    assert.ok(x.r.status === 2 || inlineOf(x.calls).length === 10, `${flag}: exit ${x.r.status}, inline ${inlineOf(x.calls).length}`);
    assert.ok(inlineOf(x.calls).length <= 10, flag);
  }
});

test("FR-9 Cap: a findings document or a base-SHA config asking for more is refused and posts nothing", (t) => {
  const askDoc = postRun(t, { ...fourteenCriticals(), max_inline: 14 }, { args: ["--fail-on", "critical"] });
  assert.equal(askDoc.r.status, 1);
  assert.match(askDoc.r.stderr, /max_inline/);
  assert.deepEqual(writesOf(askDoc.calls), []);
  const askConfig = postRun(t, fourteenCriticals(), { over: { config: "max_inline: 14\n" }, args: ["--fail-on", "critical"] });
  assert.equal(askConfig.r.status, 1);
  assert.match(askConfig.r.stderr, /max_inline/);
  assert.deepEqual(writesOf(askConfig.calls), []);
});

// --- FR-9 "Forged marker and mentions": the only marker is the one the script writes ------
// Round trip: a forged marker naming a FUTURE head survives into the posted summary as text;
// the next run's check-skip must still read the script's marker, not the forged one.

test("FR-9 Forged marker: a forged marker in `why` posted today cannot make tomorrow's check-skip skip a new head", (t) => {
  const forged = `${marker(SHA_NEXT, 9, [])} and <!-- akili-review:marker {"head":"000"} --> cc @org/security-team`;
  const first = postRun(t, mkDoc([mkFinding(1, { why: forged, fix: forged })]));
  assert.equal(first.r.status, 0, first.r.stderr);
  const body = summaryOf(first.calls);
  assert.ok(body.includes("#### F-1 "), "BUT it must NOT drop the finding");
  assert.equal((body.match(/<!--/g) || []).length, 1, "one live HTML comment: the script's marker");
  const out = path.join(tmpDir(t), "out");
  const next = run(t, skipArgs(out, SHA_NEXT), { over: { comments: [comment(7, body)] } });
  assert.equal(next.r.stdout.trim(), "skip=false reason=none");
  const prior = readJson(path.join(out, "prior.json"));
  assert.equal(prior.marker_state, "trusted");
  assert.equal(prior.head, SHA_HEAD);
  assert.equal(prior.run, 1);
});

// --- FR-10 "Human resolved": the respect survives the next push too ------------------------

test("FR-10 Human resolved: across two further pushes the maintainer-resolved warning is never re-posted and stays open in the summary", (t) => {
  const w = mkFinding(1);
  const fp = fingerprint(w);
  const threads = [thread("T1", fp, "warning", { resolved: true, by: "maintainer" })];
  let comments = [comment(7, `old\n${marker(SHA_OLD, 1, [{ fp, sev: "warning", inline: true }])}`)];
  for (const round of [1, 2]) {
    const { r, calls } = postRun(t, mkDoc([w]), { over: { comments, threads } });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(inlineOf(calls), [], `round ${round}: no new inline comment`);
    const body = summaryOf(calls);
    assert.ok(body.includes(`Still open from earlier reviews: ${fp}`), `round ${round}: listed as open`);
    comments = [comment(7, body)];
  }
});

// --- NFR-3: gh only through AKILI_GH_BIN or PATH ------------------------------------------

test("NFR-3: with AKILI_GH_BIN unset, post reaches GitHub only through the `gh` found on PATH", { skip: process.platform === "win32" && "needs a POSIX shell shim" }, (t) => {
  const { r, calls } = postRun(t, mkDoc([mkFinding(1)]), { via: "path" });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(inlineOf(calls).length, 1);
  assert.equal(summaryOf(calls).length > 0, true);
});

test("NFR-3: with no gh on PATH and no AKILI_GH_BIN, post and check-skip fail closed: nothing written, an explicit gh error, no crash", (t) => {
  const p = postRun(t, mkDoc([mkFinding(1, { severity: "critical" })]), { via: "none", args: ["--fail-on", "critical"] });
  assert.match(p.r.stderr, /cannot run gh/);
  assert.equal(p.r.status, 1, "a non-suspect critical under --fail-on critical still fails the run");
  assert.deepEqual(p.calls, []);
  assert.doesNotMatch(p.r.stderr, /at .*\.cjs:\d+/, "no stack trace");
  const out = path.join(tmpDir(t), "out");
  const s = run(t, skipArgs(out), { via: "none" });
  assert.equal(s.r.status, 0);
  assert.match(s.r.stdout, /^skip=false/);
  assert.deepEqual(s.calls, []);
});
